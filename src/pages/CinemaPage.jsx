import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Phone, Clock, ChevronLeft } from "lucide-react";

const BRAND_COLORS = {
  CGV: "#e50914",
  Lotte: "#c41230",
  BHD: "#1e40af",
  Galaxy: "#7c3aed",
};

function CinemaPage() {
  const navigate = useNavigate();
  const [cinemas, setCinemas] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true); // ✅ THÊM loading state
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedCinemaId, setSelectedCinemaId] = useState("");

  // ✅ GIỮ API call từ Code 1
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const cinemaRes = await fetch("http://localhost:5000/api/cinemas");
        const cinemaData = await cinemaRes.json();
        const movieRes = await fetch("http://localhost:5000/api/movies");
        const movieData = await movieRes.json();
        setCinemas(cinemaData);
        setMovies(movieData);
      } catch (err) {
        console.error("Lỗi tải dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ✅ KẾT HỢP: regions từ Code 1 + desc từ Code 2
  const regions = useMemo(() => {
    const regionMap = [
      { id: "hanoi", label: "Hà Nội", desc: "Các rạp khu vực Hà Nội" },
      { id: "hcm", label: "TP.HCM", desc: "Các rạp khu vực TP.HCM" },
      { id: "haiphong", label: "Hải Phòng", desc: "Các rạp khu vực Hải Phòng" }, // ✅ GIỮ Hải Phòng
    ];

    return regionMap.map((region) => {
      const regionCinemas = cinemas.filter((cinema) => {
        const city = (cinema.city || "").toLowerCase();
        const address = (cinema.address || "").toLowerCase();

        if (region.id === "hanoi") {
          return city === "hanoi" || address.includes("ha noi");
        }
        if (region.id === "hcm") {
          return city === "hcm" || address.includes("hcm") || address.includes("tp.hcm");
        }
        if (region.id === "haiphong") {
          return address.includes("hai phong");
        }
        return false;
      });

      return {
        ...region,
        cinemas: regionCinemas,
      };
    });
  }, [cinemas]);

  const activeRegion = regions.find((r) => r.id === selectedRegion);
  const displayedCinemas = activeRegion ? activeRegion.cinemas : [];
  
  // ✅ GIỮ ID naming từ Code 1
  const selectedCinema = displayedCinemas.find((c) => c.cinema_id === selectedCinemaId) || null;
  
  // ✅ GIỮ movie status từ Code 1 (underscore)
  const nowShowingMovies = useMemo(
    () => movies.filter((m) => m.status === "now_showing"),
    [movies]
  );

  // ✅ THÊM loading indicator
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0f" }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0f" }}>
      <div
        className="py-10 border-b border-zinc-800"
        style={{ background: "linear-gradient(to bottom, #12121f, #0a0a0f)" }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h1 className="text-white mb-1" style={{ fontSize: "2rem", fontWeight: 800 }}>
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
                className="text-left rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-all p-5"
                style={{ background: "#12121f" }}
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
                      {region.cinemas.length} rạp {region.cinemas.length > 0 ? "khả dụng" : ""}
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
                  key={cinema.cinema_id} // ✅ GIỮ cinema_id từ Code 1
                  onClick={() => setSelectedCinemaId(cinema.cinema_id)}
                  className={`text-left rounded-2xl border transition-all p-5 ${
                    selectedCinemaId === cinema.cinema_id
                      ? "border-red-500"
                      : "border-zinc-800 hover:border-zinc-700"
                  }`}
                  style={{ background: "#12121f" }}
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
                      <h3 className="text-white mb-1" style={{ fontWeight: 700 }}>
                        {cinema.name}
                      </h3>
                      <p className="text-zinc-400 text-sm flex items-center gap-1.5 mb-2">
                        <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        {cinema.address}
                      </p>
                      <div className="flex items-center gap-4 text-zinc-500 text-xs">
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
                      className="rounded-2xl border border-zinc-800 p-4"
                      style={{ background: "#12121f" }}
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
                          <p className="text-zinc-500 text-xs mb-2">
                            {movie.duration} phút • {movie.rating}
                          </p>
                          <button
                            onClick={() =>
                              navigate(
                                `/booking/${movie.movie_id}?cinemaId=${selectedCinema.cinema_id}`
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