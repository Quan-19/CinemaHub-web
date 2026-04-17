import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Phone, Clock, ChevronLeft } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const BRAND_COLORS = {
  CGV: "#e50914",
  Lotte: "#c41230",
  BHD: "#1e40af",
  Galaxy: "#7c3aed",
};

const removeDiacritics = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const isActiveCinema = (cinema) => {
  const status = String(cinema?.status ?? "")
    .trim()
    .toLowerCase();
  return status === "active" || status === "";
};

const unwrapArrayResponse = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  return [];
};

const normalizeRegionKey = (value = "") =>
  removeDiacritics(value)
    .trim()
    .toLowerCase()
    .replace(/\./g, " ")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/\-+/g, "-")
    .replace(/^\-|-$/g, "");

const normalizeCityText = (value = "") =>
  removeDiacritics(value)
    .toLowerCase()
    .replace(/[\.,;:()\[\]{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// Vietnam administrative areas after 2025 mergers (per the user's provided list).
// Canonical labels are displayed on the UI, while aliases map old/new spellings to the canonical area.
const VN_AREA_DEFINITIONS = [
  {
    label: "Thành phố Hà Nội",
    id: "ha-noi",
    aliases: [
      "ha noi",
      "hanoi",
      "hn",
      "tp ha noi",
      "thanh pho ha noi",
      "ha-noi",
    ],
  },
  {
    label: "Thành phố Huế",
    id: "hue",
    aliases: [
      "hue",
      "thanh pho hue",
      "tp hue",
      // Common older reference
      "thua thien hue",
      "thua thien - hue",
    ],
  },
  {
    label: "Thành phố Hồ Chí Minh",
    id: "ho-chi-minh",
    aliases: [
      "ho chi minh",
      "tp ho chi minh",
      "tphcm",
      "tp.hcm",
      "tp hcm",
      "hcm",
      "sai gon",
      "saigon",
      "sg",
      // merged in
      "ba ria vung tau",
      "ba ria - vung tau",
      "vung tau",
      "binh duong",
    ],
  },
  {
    label: "Thành phố Hải Phòng",
    id: "hai-phong",
    aliases: [
      "hai phong",
      "haiphong",
      "hp",
      // merged in
      "hai duong",
    ],
  },
  {
    label: "Thành phố Đà Nẵng",
    id: "da-nang",
    aliases: ["da nang", "danang", "tp da nang", "thanh pho da nang", "quang nam"],
  },
  {
    label: "Thành phố Cần Thơ",
    id: "can-tho",
    aliases: [
      "can tho",
      "cantho",
      "tp can tho",
      "thanh pho can tho",
      // merged in
      "soc trang",
      "hau giang",
    ],
  },

  // Provinces (28)
  { label: "Tỉnh Lai Châu", id: "lai-chau", aliases: ["lai chau"] },
  { label: "Tỉnh Điện Biên", id: "dien-bien", aliases: ["dien bien"] },
  { label: "Tỉnh Sơn La", id: "son-la", aliases: ["son la"] },
  { label: "Tỉnh Lạng Sơn", id: "lang-son", aliases: ["lang son"] },
  { label: "Tỉnh Quảng Ninh", id: "quang-ninh", aliases: ["quang ninh"] },
  { label: "Tỉnh Thanh Hoá", id: "thanh-hoa", aliases: ["thanh hoa", "thanh hoá"] },
  { label: "Tỉnh Nghệ An", id: "nghe-an", aliases: ["nghe an"] },
  { label: "Tỉnh Hà Tĩnh", id: "ha-tinh", aliases: ["ha tinh"] },
  { label: "Tỉnh Cao Bằng", id: "cao-bang", aliases: ["cao bang"] },
  {
    label: "Tỉnh Tuyên Quang",
    id: "tuyen-quang",
    aliases: ["tuyen quang", "ha giang"],
  },
  {
    label: "Tỉnh Lào Cai",
    id: "lao-cai",
    aliases: ["lao cai", "yen bai"],
  },
  {
    label: "Tỉnh Thái Nguyên",
    id: "thai-nguyen",
    aliases: ["thai nguyen", "bac kan"],
  },
  {
    label: "Tỉnh Phú Thọ",
    id: "phu-tho",
    aliases: ["phu tho", "vinh phuc", "hoa binh", "hoà binh", "hoa bình"],
  },
  {
    label: "Tỉnh Bắc Ninh",
    id: "bac-ninh",
    aliases: ["bac ninh", "bac giang"],
  },
  {
    label: "Tỉnh Hưng Yên",
    id: "hung-yen",
    aliases: ["hung yen", "thai binh"],
  },
  {
    label: "Tỉnh Ninh Bình",
    id: "ninh-binh",
    aliases: ["ninh binh", "ha nam", "nam dinh"],
  },
  {
    label: "Tỉnh Quảng Trị",
    id: "quang-tri",
    aliases: ["quang tri", "quang binh"],
  },
  {
    label: "Tỉnh Quảng Ngãi",
    id: "quang-ngai",
    aliases: ["quang ngai", "kon tum"],
  },
  {
    label: "Tỉnh Gia Lai",
    id: "gia-lai",
    aliases: ["gia lai", "binh dinh", "bình định"],
  },
  {
    label: "Tỉnh Khánh Hoà",
    id: "khanh-hoa",
    aliases: ["khanh hoa", "khánh hoà", "ninh thuan", "ninh thuận"],
  },
  {
    label: "Tỉnh Lâm Đồng",
    id: "lam-dong",
    aliases: ["lam dong", "dak nong", "đak nong", "dak nông", "binh thuan", "bình thuận"],
  },
  {
    label: "Tỉnh Đắk Lắk",
    id: "dak-lak",
    aliases: ["dak lak", "đak lak", "phu yen", "phú yên"],
  },
  {
    label: "Tỉnh Đồng Nai",
    id: "dong-nai",
    aliases: ["dong nai", "binh phuoc", "bình phước"],
  },
  {
    label: "Tỉnh Tây Ninh",
    id: "tay-ninh",
    aliases: ["tay ninh", "long an"],
  },
  {
    label: "Tỉnh Vĩnh Long",
    id: "vinh-long",
    aliases: ["vinh long", "ben tre", "bến tre", "tra vinh", "trà vinh"],
  },
  {
    label: "Tỉnh Đồng Tháp",
    id: "dong-thap",
    aliases: ["dong thap", "tien giang", "tiền giang"],
  },
  {
    label: "Tỉnh Cà Mau",
    id: "ca-mau",
    aliases: ["ca mau", "cà mau", "bac lieu", "bạc liêu"],
  },
  {
    label: "Tỉnh An Giang",
    id: "an-giang",
    aliases: ["an giang", "kien giang", "kiên giang"],
  },
];

const VIETNAM_CITY_ENTRIES = (() => {
  const entries = [];
  const addEntry = (canonical, alias) => {
    const normalizedAlias = normalizeCityText(alias);
    if (!normalizedAlias) return;
    entries.push({
      id: canonical.id,
      label: canonical.label,
      alias: normalizedAlias,
      flatAlias: normalizedAlias.replace(/\s+/g, ""),
    });
  };

  const baseVariants = (text) => {
    const cleaned = normalizeCityText(text);
    if (!cleaned) return [];
    const noSpaces = cleaned.replace(/\s+/g, "");
    return [cleaned, noSpaces];
  };

  VN_AREA_DEFINITIONS.forEach((canonical) => {
    const canonicalId = canonical.id || normalizeRegionKey(canonical.label);
    const normalizedCanonical = { ...canonical, id: canonicalId };

    // Always include canonical label.
    baseVariants(normalizedCanonical.label).forEach((v) => addEntry(normalizedCanonical, v));

    // Include label without the "tinh"/"thanh pho" prefix, since admin may store short names.
    const shortLabel = normalizeCityText(normalizedCanonical.label)
      .replace(/^tinh\s+/i, "")
      .replace(/^thanh\s+pho\s+/i, "")
      .replace(/^tp\s+/i, "")
      .trim();
    baseVariants(shortLabel).forEach((v) => addEntry(normalizedCanonical, v));

    (normalizedCanonical.aliases || []).forEach((alias) => {
      baseVariants(alias).forEach((v) => addEntry(normalizedCanonical, v));

      // Also accept common prefixes.
      baseVariants(`tinh ${alias}`).forEach((v) => addEntry(normalizedCanonical, v));
      baseVariants(`tp ${alias}`).forEach((v) => addEntry(normalizedCanonical, v));
      baseVariants(`thanh pho ${alias}`).forEach((v) => addEntry(normalizedCanonical, v));
    });
  });

  // Longer aliases first to reduce accidental matches.
  return entries.sort((a, b) => b.alias.length - a.alias.length);
})();

const matchVietnamCity = (text = "") => {
  const normalized = normalizeCityText(text);
  if (!normalized) return null;

  const flat = normalized.replace(/\s+/g, "");

  for (const entry of VIETNAM_CITY_ENTRIES) {
    if (entry.alias.length >= 3) {
      const boundaryRegex = new RegExp(`(^|\\s)${entry.alias.replace(/[-/\\^$*+?.()|[\\]{}]/g, "\\$&")}(\\s|$)`);
      if (boundaryRegex.test(normalized)) return entry;
    }
    if (entry.flatAlias && entry.flatAlias.length >= 4 && flat.includes(entry.flatAlias)) {
      return entry;
    }
  }

  return null;
};

const inferCinemaCity = (cinema) => {
  const rawCity = String(cinema?.city ?? "").trim();
  if (rawCity) {
    const matched = matchVietnamCity(rawCity);
    return (
      matched || {
        id: normalizeRegionKey(rawCity),
        label: rawCity,
      }
    );
  }

  const rawAddress = String(cinema?.address ?? "").trim();
  if (!rawAddress) return { id: "other", label: "Khác" };

  // Try from last segments: "..., Quận 1, TP.HCM"
  const segments = rawAddress
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(-3)
    .reverse();

  for (const segment of segments) {
    const matched = matchVietnamCity(segment);
    if (matched) return matched;
  }

  const matchedWhole = matchVietnamCity(rawAddress);
  if (matchedWhole) return matchedWhole;

  return { id: "other", label: "Khác" };
};

function CinemaPage() {
  const navigate = useNavigate();
  const [cinemas, setCinemas] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedCinemaId, setSelectedCinemaId] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [cinemaRes, movieRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/cinemas`),
          fetch(`${API_BASE_URL}/api/movies`),
        ]);

        if (!cinemaRes.ok) throw new Error("Không thể tải danh sách rạp");
        if (!movieRes.ok) throw new Error("Không thể tải danh sách phim");

        const [cinemaPayload, moviePayload] = await Promise.all([
          cinemaRes.json(),
          movieRes.json(),
        ]);

        const cinemaList = unwrapArrayResponse(cinemaPayload)
          .filter(isActiveCinema);

        setCinemas(cinemaList);
        setMovies(unwrapArrayResponse(moviePayload));
      } catch (err) {
        console.error("Lỗi tải dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Regions are built dynamically from API cinemas.
  const regions = useMemo(() => {
    const groups = new Map();

    cinemas.forEach((cinema) => {
      const inferred = inferCinemaCity(cinema);
      const regionKey = inferred?.id || "other";
      const label = inferred?.label || "Khác";

      if (!groups.has(regionKey)) {
        groups.set(regionKey, {
          id: regionKey,
          label,
          desc: `Các rạp khu vực ${label}`,
          cinemas: [],
        });
      }

      groups.get(regionKey).cinemas.push(cinema);
    });

    return Array.from(groups.values()).sort((a, b) => {
      if (a.id === "other") return 1;
      if (b.id === "other") return -1;
      return a.label.localeCompare(b.label, "vi", { sensitivity: "base" });
    });
  }, [cinemas]);

  const activeRegion = regions.find((r) => r.id === selectedRegion);
  const displayedCinemas = activeRegion ? activeRegion.cinemas : [];

  // ✅ GIỮ ID naming từ Code 1
  const selectedCinema =
    displayedCinemas.find(
      (c) => String(c.cinema_id ?? c.id) === String(selectedCinemaId),
    ) || null;

  // ✅ GIỮ movie status từ Code 1 (underscore)
  const nowShowingMovies = useMemo(
    () => movies.filter((m) => m.status === "now_showing"),
    [movies],
  );

  // ✅ THÊM loading indicator
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--color-cinema-bg)" }}
      >
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--color-cinema-bg)" }}>
      <div
        className="py-10 border-b border-zinc-700"
        style={{
          background:
            "linear-gradient(to bottom, var(--color-cinema-surface), var(--color-cinema-bg))",
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h1
            className="text-white mb-1"
            style={{ fontSize: "2rem", fontWeight: 800 }}
          >
            Chọn khu vực rạp chiếu
          </h1>
          <p className="text-zinc-400 text-sm">
            Xem khu vực nào có rạp chiếu gần bạn nhất
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {!activeRegion ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {regions.map((region) => (
              <button
                key={region.id}
                onClick={() => setSelectedRegion(region.id)}
                className="text-left rounded-2xl border border-zinc-700 hover:border-zinc-700 transition-all p-5"
                style={{ background: "var(--color-cinema-surface)" }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-white mb-1" style={{ fontWeight: 700 }}>
                      {region.label}
                    </h3>
                    {/* ✅ THÊM description từ Code 2 */}
                    <p className="text-zinc-400 text-sm mb-3">{region.desc}</p>
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs"
                      style={{
                        background: "rgba(229,9,20,0.12)",
                        color: "#f87171",
                      }}
                    >
                      {region.cinemas.length} rạp{" "}
                      {region.cinemas.length > 0 ? "khả dụng" : ""}
                    </span>
                  </div>
                  <MapPin className="w-5 h-5 text-red-500 shrink-0" />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <>
            <button
              onClick={() => {
                setSelectedRegion("");
                setSelectedCinemaId("");
              }}
              className="mb-4 inline-flex items-center gap-1.5 text-zinc-400 hover:text-white text-sm transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Chọn khu vực khác
            </button>

            {/* ✅ THÊM hiển thị số lượng rạp từ Code 2 */}
            <p className="text-zinc-400 text-sm mb-4">
              {activeRegion.label}: {displayedCinemas.length} rạp
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {displayedCinemas.map((cinema) => (
                <button
                  key={String(cinema.cinema_id ?? cinema.id)}
                  onClick={() =>
                    setSelectedCinemaId(String(cinema.cinema_id ?? cinema.id))
                  }
                  className={`text-left rounded-2xl border transition-all p-5 ${
                    String(selectedCinemaId) ===
                    String(cinema.cinema_id ?? cinema.id)
                      ? "border-red-500"
                      : "border-zinc-700 hover:border-zinc-700"
                  }`}
                  style={{ background: "var(--color-cinema-surface)" }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-sm shrink-0"
                      style={{
                        background: BRAND_COLORS[cinema.brand] || "#e50914",
                        fontWeight: 700,
                      }}
                    >
                      {cinema.brand}
                    </div>
                    <div className="flex-1">
                      <h3
                        className="text-white mb-1"
                        style={{ fontWeight: 700 }}
                      >
                        {cinema.name}
                      </h3>
                      <p className="text-zinc-400 text-sm flex items-center gap-1.5 mb-2">
                        <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        {cinema.address}
                      </p>
                      <div className="flex items-center gap-4 text-zinc-400 text-xs">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {/* ✅ THÊM showtimes info từ Code 2 */}
                          {cinema.showtimes?.length || 0} suất/ngày
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {cinema.phone || "1900 6017"}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {selectedCinema && (
              <div className="mt-8">
                <h3
                  className="text-white mb-1"
                  style={{ fontWeight: 700, fontSize: "1.15rem" }}
                >
                  Phim đang chiếu tại {selectedCinema.name}
                </h3>
                {/* ✅ THÊM description từ Code 2 */}
                <p className="text-zinc-400 text-sm mb-4">
                  Chọn phim để chuyển nhanh tới suất chiếu của rạp đã chọn.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {nowShowingMovies.map((movie) => (
                    <div
                      key={movie.movie_id} // ✅ GIỮ movie_id từ Code 1
                      className="rounded-2xl border border-zinc-700 p-4"
                      style={{ background: "var(--color-cinema-surface)" }}
                    >
                      <div className="flex gap-3">
                        <img
                          src={movie.poster}
                          alt={movie.title}
                          className="w-16 h-24 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4
                            className="text-white text-sm mb-1"
                            style={{ fontWeight: 700 }}
                          >
                            {movie.title}
                          </h4>
                          <p className="text-zinc-400 text-xs mb-2">
                            {movie.duration} phút • {movie.rating}
                          </p>
                          <button
                            onClick={() =>
                              navigate(
                                `/booking/${movie.id || movie.movie_id}?cinemaId=${selectedCinema.cinema_id}`,
                              )
                            }
                            className="w-full py-2 rounded-lg text-xs text-white hover:opacity-90 transition-opacity"
                            style={{
                              background:
                                "linear-gradient(135deg, #e50914, #b20710)",
                              fontWeight: 700,
                            }}
                          >
                            Mua vé tại rạp này
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default CinemaPage;
