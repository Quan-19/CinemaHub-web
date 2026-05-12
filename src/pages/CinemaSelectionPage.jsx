import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  ChevronLeft,
  MapPin,
  Users,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useBooking } from "../context/BookingContext";
import { normalizeShowtimePricing } from "../utils/showtimePricing";

const BRAND_COLORS = {
  EbizCinema: "#e50914",
};

const TYPE_LABELS = {
  "2D": { label: "2D", color: "#52525b" },
  "3D": { label: "3D", color: "#1d4ed8" },
  IMAX: { label: "IMAX", color: "#b45309" },
  "4DX": { label: "4DX", color: "#7c3aed" },
};

const REGION_LABEL_MAP = {
  hanoi: "Hà Nội",
  hcm: "TP.HCM",
};

const formatTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--:--";
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDateKey = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const removeDiacritics = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const createRegionOption = (regionId) => {
  const fallbackLabel = regionId
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
  const label = REGION_LABEL_MAP[regionId] || fallbackLabel;
  return {
    id: regionId,
    label,
    desc: `Cụm rạp tại ${label}`,
  };
};

const getRegionIdFromCinema = (cinema = {}) => {
  const city = removeDiacritics(cinema.city || "").toLowerCase();
  const address = removeDiacritics(cinema.address || "").toLowerCase();

  if (
    city.includes("ha noi") ||
    city.includes("hanoi") ||
    address.includes("ha noi") ||
    address.includes("hanoi")
  ) {
    return "hanoi";
  }

  if (
    city.includes("ho chi minh") ||
    city.includes("hcm") ||
    address.includes("ho chi minh") ||
    address.includes("tp.hcm") ||
    address.includes("hcm")
  ) {
    return "hcm";
  }

  if (city) {
    return city.replace(/\s+/g, "-");
  }

  return "";
};

const normalizeList = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const normalizeMovie = (movie) => ({
  ...movie,
  id: movie.id ?? movie.movie_id,
  movie_id: movie.movie_id ?? movie.id,
  genre: normalizeList(movie.genre),
  duration: movie.duration ?? 120,
  rating: movie.rating || movie.age_rating || "P",
});

const normalizeCinema = (cinema) => ({
  ...cinema,
  id: String(cinema.id ?? cinema.cinema_id),
  cinema_id: cinema.cinema_id ?? cinema.id,
  brand: cinema.brand || "Cinema",
  name: cinema.name || "Rạp chiếu",
  address: cinema.address || "",
  city: cinema.city || "",
  showtimes: [],
});

const isActiveCinema = (cinema) => {
  const status = String(cinema?.status ?? "")
    .trim()
    .toLowerCase();
  return status === "active" || status === "";
};

const isUserVisibleShowtimeStatus = (status) => {
  const normalized = String(status ?? "")
    .trim()
    .toLowerCase();

  if (!normalized) return true;
  return normalized !== "cancelled" && normalized !== "locked";
};

export const CinemaSelectionPage = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [apiMovie, setApiMovie] = useState(null);
  const [apiCinemas, setApiCinemas] = useState([]);
  const [apiShowtimes, setApiShowtimes] = useState([]);
  const [movieLoading, setMovieLoading] = useState(true);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const {
    selectedDate: cachedDate,
    selectedCinema: cachedCinema,
    setSelectedMovie,
    setSelectedCinema,
    setSelectedShowtime,
    setSelectedDate,
  } = useBooking();

  const preferredCinemaId = searchParams.get("cinemaId");
  const hasPreferredCinema = Boolean(
    preferredCinemaId &&
      apiCinemas.some((c) => String(c.id) === String(preferredCinemaId))
  );
  const preferredCinema = hasPreferredCinema
    ? apiCinemas.find(
        (cinema) => String(cinema.id) === String(preferredCinemaId)
      )
    : null;

  const dateOptions = useMemo(() => {
    const todayKey = formatDateKey(new Date());
    const uniqueDateKeys = Array.from(
      new Set(
        apiShowtimes
          .map((showtime) => formatDateKey(showtime.date))
          .filter(Boolean)
      )
    )
      .filter((dateStr) => {
        const d = new Date(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const diffTime = d.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays >= 0 && diffDays <= 13;
      })
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());


    return uniqueDateKeys.map((value) => {
      const currentDate = new Date(value);
      const dayLabel =
        value === todayKey
          ? "Hôm nay"
          : currentDate
              .toLocaleDateString("vi-VN", { weekday: "short" })
              .replace("thứ", "T")
              .replace("Thứ", "T");

      return {
        value,
        day: dayLabel,
        date: currentDate.getDate(),
        month: currentDate.getMonth() + 1,
      };
    });
  }, [apiShowtimes]);

  const [selectedDateIdx, setSelectedDateIdx] = useState(0);
  const selectedDateValue = dateOptions[selectedDateIdx]?.value || "";

  const cinemasWithShowtimes = useMemo(() => {
    const byCinema = new Map(
      apiCinemas.map((cinema) => [String(cinema.id), cinema])
    );
    const groupedShowtimes = new Map();

    apiShowtimes.forEach((showtime) => {
      const showDate = formatDateKey(showtime.date);

      if (!showDate || showDate !== selectedDateValue) return;

      const cinemaKey = String(showtime.cinemaId);

      if (!groupedShowtimes.has(cinemaKey)) {
        groupedShowtimes.set(cinemaKey, []);
      }

      const pricing = normalizeShowtimePricing(showtime);

      // Check if showtime is expired
      let isExpired = false;
      if (showtime.date && showtime.time && showtime.endTime) {
        const now = new Date();
        const startParts = showtime.time.split(":");
        const endParts = showtime.endTime.split(":");

        const startDateObj = new Date(showtime.date);
        startDateObj.setHours(
          parseInt(startParts[0], 10),
          parseInt(startParts[1], 10),
          0,
          0
        );

        const endDateObj = new Date(showtime.date);
        endDateObj.setHours(
          parseInt(endParts[0], 10),
          parseInt(endParts[1], 10),
          0,
          0
        );

        // Handle overnight showtimes
        if (endDateObj < startDateObj) {
          endDateObj.setDate(endDateObj.getDate() + 1);
        }

        if (endDateObj < now) {
          isExpired = true;
        }
      }

      groupedShowtimes.get(cinemaKey).push({
        ...showtime,
        id: String(showtime.id),
        showtime_id: showtime.id,
        time: showtime.time?.slice(0, 5),
        type: showtime.type || "2D",
        price: pricing.basePrice,
        base_price: Number(showtime.base_price) || pricing.basePrice,
        regularPrices: pricing.regularPrices,
        specialPrices: pricing.specialPrices,
        prices: pricing.prices,
        isSpecial: pricing.isSpecial,
        isExpired,
        availableSeats: showtime.availableSeats,
      });
    });
    return Array.from(groupedShowtimes.entries())
      .map(([cinemaId, showtimes]) => {
        const cinema = byCinema.get(String(cinemaId));
        if (!cinema) return null;

        return {
          ...cinema,
          showtimes: showtimes.sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          ),
        };
      })
      .filter(Boolean);
  }, [apiCinemas, apiShowtimes, selectedDateValue]);

  const [selectedRegion, setSelectedRegion] = useState(() => {
    if (preferredCinema) return getRegionIdFromCinema(preferredCinema);
    if (cachedCinema) return getRegionIdFromCinema(cachedCinema);
    return "";
  });

  const [expandedCinema, setExpandedCinema] = useState(
    hasPreferredCinema ? preferredCinemaId : null
  );

  const regionOptions = useMemo(() => {
    const regionIds = Array.from(
      new Set(
        cinemasWithShowtimes
          .map((cinema) => getRegionIdFromCinema(cinema))
          .filter(Boolean)
      )
    );
    return regionIds.map(createRegionOption);
  }, [cinemasWithShowtimes]);
  // Restore selected date index from cache
  useEffect(() => {
    if (dateOptions.length > 0) {
      if (cachedDate) {
        const cachedIdx = dateOptions.findIndex((d) => d.value === cachedDate);
        if (cachedIdx !== -1) {
          setSelectedDateIdx(cachedIdx);
          return;
        }
      }
      // If not found in cache or no cache, stay at 0 but ensure it's in bounds
      if (selectedDateIdx >= dateOptions.length) {
        setSelectedDateIdx(0);
      }
    }
  }, [dateOptions, cachedDate, selectedDateIdx]);

  // Restore expanded cinema from cache
  useEffect(() => {
    if (cachedCinema && !expandedCinema && apiCinemas.length > 0) {
      const cinemaId = String(cachedCinema.id || cachedCinema.cinema_id);
      if (apiCinemas.some(c => String(c.id) === cinemaId)) {
        setExpandedCinema(cinemaId);
      }
    }
  }, [cachedCinema, expandedCinema, apiCinemas]);


  useEffect(() => {
    let active = true;

    const fetchSchedules = async () => {
      setScheduleLoading(true);
      try {
        const [cinemaRes, showtimeRes] = await Promise.all([
          fetch("http://localhost:5000/api/cinemas"),
          fetch("http://localhost:5000/api/showtimes"),
        ]);

        if (!cinemaRes.ok || !showtimeRes.ok) {
          throw new Error("Failed to load schedule data");
        }

        const [cinemaData, showtimeData] = await Promise.all([
          cinemaRes.json(),
          showtimeRes.json(),
        ]);

        if (!active) return;

        const normalizedCinemas = (cinemaData || [])
          .filter(isActiveCinema)
          .map(normalizeCinema);
        const showtimesByMovie = (showtimeData || []).filter(
          (showtime) =>
            String(showtime.movieId) === String(movieId) &&
            isUserVisibleShowtimeStatus(showtime.status)
        );

        setApiCinemas(normalizedCinemas);
        setApiShowtimes(showtimesByMovie);
      } catch {
        if (!active) return;
        setApiCinemas([]);
        setApiShowtimes([]);
      } finally {
        if (active) setScheduleLoading(false);
      }
    };

    if (!movieId) {
      setApiCinemas([]);
      setApiShowtimes([]);
      setScheduleLoading(false);
      return () => {
        active = false;
      };
    }

    fetchSchedules();
    return () => {
      active = false;
    };
  }, [movieId]);

  useEffect(() => {
    if (!hasPreferredCinema && !selectedRegion) return;
    if (selectedRegion) return;
    setSelectedRegion(getRegionIdFromCinema(preferredCinema));
  }, [hasPreferredCinema, preferredCinema, selectedRegion]);

  useEffect(() => {
    if (!hasPreferredCinema || expandedCinema) return;
    setExpandedCinema(preferredCinemaId);
  }, [hasPreferredCinema, preferredCinemaId, expandedCinema]);
  useEffect(() => {
    let active = true;

    const fetchMovieById = async () => {
      setMovieLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/movies/${movieId}`);
        if (!res.ok) throw new Error("Movie not found in API");
        const data = await res.json();
        if (active && data) {
          setApiMovie(normalizeMovie(data));
        }
      } catch {
        if (active) setApiMovie(null);
      } finally {
        if (active) setMovieLoading(false);
      }
    };

    if (!movieId) {
      setApiMovie(null);
      setMovieLoading(false);
      return () => {
        active = false;
      };
    }

    fetchMovieById();
    return () => {
      active = false;
    };
  }, [movieId]);

  const movie = apiMovie;

  const regionCinemas = useMemo(
    () =>
      cinemasWithShowtimes.filter(
        (cinema) => getRegionIdFromCinema(cinema) === selectedRegion
      ),
    [cinemasWithShowtimes, selectedRegion]
  );

  const orderedCinemas = useMemo(() => {
    if (!hasPreferredCinema || !preferredCinemaId) return regionCinemas;
    const preferred = regionCinemas.find(
      (cinema) => cinema.id === preferredCinemaId
    );
    if (!preferred) return regionCinemas;
    return [
      preferred,
      ...regionCinemas.filter((cinema) => cinema.id !== preferredCinemaId),
    ];
  }, [hasPreferredCinema, preferredCinemaId, regionCinemas]);

  if (movieLoading || scheduleLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--color-cinema-bg)" }}
      >
        <p className="text-zinc-400">Đang tải lịch chiếu...</p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--color-cinema-bg)" }}
      >
        <p className="text-zinc-400">Không tìm thấy phim</p>
      </div>
    );
  }

  const handleSelectShowtime = (cinemaId, showtimeId) => {
    const cinema = cinemasWithShowtimes.find(
      (c) => String(c.id) === String(cinemaId)
    );
    if (!cinema) return;

    const showtime = cinema.showtimes.find((s) => s.id === showtimeId);
    if (!showtime) return;

    setSelectedMovie(movie);
    setSelectedCinema(cinema);
    setSelectedShowtime(showtime);
    setSelectedDate(selectedDateValue);
    navigate(`/seats/${showtimeId}`);
  };

  const handleSelectRegion = (regionId) => {
    setSelectedRegion(regionId);
    const cinemasInRegion = cinemasWithShowtimes.filter(
      (cinema) => getRegionIdFromCinema(cinema) === regionId
    );
    const defaultExpanded =
      hasPreferredCinema &&
      cinemasInRegion.some((cinema) => cinema.id === preferredCinemaId)
        ? preferredCinemaId
        : cinemasInRegion[0]?.id || null;
    setExpandedCinema(defaultExpanded);
  };

  return (
    <div className="min-h-screen pt-16" style={{ background: "var(--color-cinema-bg)" }}>
      {/* Header */}
      <div
        className="border-b border-zinc-700"
        style={{ background: "var(--color-cinema-surface)" }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm mb-4 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Quay lại
          </button>

          {/* Movie summary */}
          <div className="flex items-center gap-4">
            <img
              src={movie.poster}
              alt={movie.title}
              className="w-14 h-20 object-cover rounded-lg flex-shrink-0"
            />
            <div>
              <h1
                className="text-white"
                style={{ fontWeight: 700, fontSize: "1.1rem" }}
              >
                {movie.title}
              </h1>
              <p className="text-zinc-400 text-sm">{movie.originalTitle}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-zinc-400 text-xs">
                  <Clock className="w-3 h-3" />
                  {movie.duration} phút
                </span>
                <span
                  className="px-1.5 py-0.5 rounded text-xs text-white"
                  style={{
                    background:
                      movie.rating === "T18"
                        ? "#ef4444"
                        : movie.rating === "T16"
                        ? "#f97316"
                        : movie.rating === "T13"
                        ? "#f59e0b"
                        : "#22c55e",
                    fontWeight: 700,
                  }}
                >
                  {movie.rating}
                </span>
                {movie.genre.slice(0, 2).map((g) => (
                  <span key={g} className="text-zinc-400 text-xs">
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Steps indicator */}
        <div className="flex items-center gap-2 mb-6">
          {[
            { n: 1, label: "Chọn phim", done: true },
            { n: 2, label: "Chọn rạp & suất", active: true },
            { n: 3, label: "Chọn ghế" },
            { n: 4, label: "Xác nhận" },
          ].map((step, i) => (
            <div key={step.n} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    step.done
                      ? "bg-green-500 text-white"
                      : step.active
                      ? "bg-red-600 text-white"
                      : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                  }`}
                  style={{ fontWeight: 700 }}
                >
                  {step.done ? "✓" : step.n}
                </div>
                <span
                  className={`text-xs hidden sm:block ${
                    step.active
                      ? "text-white"
                      : step.done
                      ? "text-green-400"
                      : "text-zinc-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {i < 3 && <div className="w-8 h-px bg-zinc-700" />}
            </div>
          ))}
        </div>

        <div className="mb-6">
          <h2 className="text-white mb-3" style={{ fontWeight: 600 }}>
            Chọn ngày
          </h2>
          {dateOptions.length === 0 ? (
            <p className="text-zinc-400 text-sm mt-3">
              Phim này hiện chưa có lịch chiếu.
            </p>
          ) : (
            <div className="relative">
              {/* Mobile: scroll ngang 1 hàng */}
              <div
                className="flex sm:hidden gap-2 overflow-x-auto pb-2"
                style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
              >
                {dateOptions.map((d, i) => (
                  <button
                    key={d.value}
                    onClick={() => setSelectedDateIdx(i)}
                    className={`flex flex-col items-center justify-center shrink-0 w-[68px] py-2.5 rounded-2xl border transition-all duration-300 ${
                      selectedDateIdx === i
                        ? "border-red-500 bg-red-500/10 text-white ring-1 ring-red-600/20"
                        : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                    }`}
                  >
                    <span className="text-[11px] mb-0.5" style={{ opacity: 0.7 }}>
                      {d.day}
                    </span>
                    <span className="text-lg" style={{ fontWeight: 700 }}>
                      {d.date}
                    </span>
                    <span className="text-[11px]" style={{ opacity: 0.7 }}>
                      T{d.month}
                    </span>
                  </button>
                ))}
              </div>
              {/* Gradient fade phải - chỉ mobile */}
              {dateOptions.length > 4 && (
                <div className="absolute right-0 top-0 bottom-2 w-10 bg-gradient-to-l from-[#09090b] to-transparent pointer-events-none sm:hidden" />
              )}

              {/* Desktop/Tablet: grid 7 cột × 2 hàng */}
              <div className="hidden sm:grid sm:grid-cols-7 gap-2">
                {dateOptions.map((d, i) => (
                  <button
                    key={d.value}
                    onClick={() => setSelectedDateIdx(i)}
                    className={`flex flex-col items-center justify-center py-3 rounded-2xl border transition-all duration-300 ${
                      selectedDateIdx === i
                        ? "border-red-500 bg-red-500/10 text-white ring-1 ring-red-600/20"
                        : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                    }`}
                  >
                    <span className="text-xs mb-0.5" style={{ opacity: 0.7 }}>
                      {d.day}
                    </span>
                    <span className="text-lg" style={{ fontWeight: 700 }}>
                      {d.date}
                    </span>
                    <span className="text-xs" style={{ opacity: 0.7 }}>
                      T{d.month}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Region + Cinema list */}
        <h2 className="text-white mb-3" style={{ fontWeight: 600 }}>
          Chọn khu vực
        </h2>
        {!selectedRegion ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {regionOptions.map((region) => {
              const count = cinemasWithShowtimes.filter(
                (cinema) => getRegionIdFromCinema(cinema) === region.id
              ).length;
              return (
                <button
                  key={region.id}
                  onClick={() => handleSelectRegion(region.id)}
                  className="text-left rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 hover:border-red-500 transition-colors"
                >
                  <p className="text-white text-sm" style={{ fontWeight: 700 }}>
                    {region.label}
                  </p>
                  <p className="text-zinc-400 text-xs mt-0.5">{region.desc}</p>
                  <span
                    className="inline-flex mt-2 rounded-full px-2 py-0.5 text-[10px]"
                    style={{
                      background: "rgba(229,9,20,0.15)",
                      color: "#f87171",
                    }}
                  >
                    {count} cụm rạp
                  </span>
                </button>
              );
            })}
            {regionOptions.length === 0 && (
              <div className="rounded-xl border border-zinc-700 px-4 py-5 text-zinc-400 text-sm">
                Chưa có khu vực khả dụng cho phim này.
              </div>
            )}
          </div>
        ) : (
          <>
            <button
              onClick={() => {
                setSelectedRegion("");
                setExpandedCinema(null);
              }}
              className="mb-3 inline-flex items-center gap-1.5 text-zinc-400 hover:text-white text-xs transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Đổi khu vực
            </button>

            <h2 className="text-white mb-3" style={{ fontWeight: 600 }}>
              Chọn rạp chiếu
            </h2>
            {hasPreferredCinema &&
              orderedCinemas.some(
                (cinema) => cinema.id === preferredCinemaId
              ) && (
                <p className="text-zinc-400 text-xs mb-3">
                  Đã ưu tiên rạp bạn vừa chọn từ trang rạp chiếu.
                </p>
              )}

            <div className="space-y-3">
              {orderedCinemas.length === 0 && (
                <div className="rounded-xl border border-zinc-700 px-4 py-5 text-zinc-400 text-sm">
                  Không có suất chiếu ở khu vực này cho ngày đã chọn.
                </div>
              )}
              {orderedCinemas.map((cinema) => (
                <div
                  key={cinema.id}
                  className="rounded-xl border border-zinc-700 overflow-hidden"
                  style={{ background: "var(--color-cinema-surface)" }}
                >
                  {/* Cinema header */}
                  <button
                    className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/30 transition-colors"
                    onClick={() =>
                      setExpandedCinema(
                        expandedCinema === cinema.id ? null : cinema.id
                      )
                    }
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs shrink-0"
                        style={{
                          background: BRAND_COLORS[cinema.brand] || "#e50914",
                          fontWeight: 700,
                        }}
                      >
                        {cinema.brand}
                      </div>
                      <div className="text-left">
                        <p
                          className="text-white text-sm"
                          style={{ fontWeight: 600 }}
                        >
                          {cinema.name}
                        </p>
                        <p className="text-zinc-400 text-xs flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {cinema.address}
                        </p>
                        {preferredCinemaId === cinema.id && (
                          <span
                            className="inline-flex mt-1 rounded-full px-2 py-0.5 text-[10px]"
                            style={{
                              background: "rgba(229,9,20,0.15)",
                              color: "#f87171",
                            }}
                          >
                            Rạp đã chọn
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-zinc-400 text-xs hidden sm:block">
                        {cinema.showtimes.length} suất chiếu
                      </span>
                      {expandedCinema === cinema.id ? (
                        <ChevronUp className="w-4 h-4 text-zinc-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-zinc-400" />
                      )}
                    </div>
                  </button>

                  {/* Showtimes */}
                  {expandedCinema === cinema.id && (
                    <div className="px-4 pb-4 border-t border-zinc-700">
                      <div className="flex flex-wrap gap-2 mt-4">
                        {cinema.showtimes.map((st) => {
                          const typeInfo = TYPE_LABELS[st.type];
                          const hasSeatInfo =
                            typeof st.availableSeats === "number";
                          const isFull = hasSeatInfo && st.availableSeats === 0;
                          const isExpired = st.isExpired;
                          const isDisabled = isFull || isExpired;
                          const isLow =
                            hasSeatInfo &&
                            st.availableSeats > 0 &&
                            st.availableSeats <= 20;
                          return (
                            <button
                              key={st.id}
                              disabled={isDisabled}
                              onClick={() =>
                                handleSelectShowtime(cinema.id, st.id)
                              }
                              className={`group flex flex-col items-start p-3 rounded-xl border min-w-[110px] transition-all ${
                                isDisabled
                                  ? "border-zinc-700 opacity-40 cursor-not-allowed"
                                  : "border-zinc-700 hover:border-red-500 hover:bg-red-500/5 cursor-pointer"
                              }`}
                            >
                              <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                                <span
                                  className="text-white text-sm font-bold"
                                >
                                  {st.time}
                                </span>
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                    isDisabled
                                      ? "bg-zinc-800 text-zinc-500 border border-zinc-700"
                                      : "bg-purple-600 text-white"
                                  }`}
                                >
                                  {st.language === "DUB" ? "Lồng tiếng" : "Phụ đề"}
                                </span>
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                    isDisabled
                                      ? "bg-zinc-800 text-zinc-500 border border-zinc-700"
                                      : ""
                                  }`}
                                  style={!isDisabled ? {
                                    background: typeInfo?.color || "#52525b",
                                    color: "white"
                                  } : {}}
                                >
                                  {st.type}
                                </span>
                              </div>
                              <span className="text-zinc-400 text-xs">
                                {Math.round(Number(st.price || 0)).toLocaleString("vi-VN")}đ
                              </span>
                              <div className="flex items-center gap-1 mt-1">
                                <Users className="w-3 h-3 text-zinc-400" />
                                <span
                                  className={`text-xs ${
                                    isDisabled
                                      ? "text-zinc-500"
                                      : isLow
                                      ? "text-orange-400"
                                      : "text-zinc-400"
                                  }`}
                                >
                                  {isExpired
                                    ? "Đã chiếu"
                                    : isFull
                                    ? "Hết vé"
                                    : isLow
                                    ? `Còn ${st.availableSeats} ghế`
                                    : hasSeatInfo
                                    ? `${st.availableSeats} ghế trống`
                                    : "Xem sơ đồ ghế"}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CinemaSelectionPage;
