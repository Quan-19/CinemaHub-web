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

  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedCinemaId, setSelectedCinemaId] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cinemaRes = await fetch("http://localhost:5000/api/cinemas");
        const cinemaData = await cinemaRes.json();

        const movieRes = await fetch("http://localhost:5000/api/movies");
        const movieData = await movieRes.json();

        setCinemas(cinemaData);
        setMovies(movieData);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const regions = useMemo(() => {
    const regionMap = {
      hanoi: { id: "hanoi", label: "Hà Nội", desc: "Các rạp khu vực Hà Nội" },
      hcm: { id: "hcm", label: "TP.HCM", desc: "Các rạp khu vực TP.HCM" },
    };

    return Object.values(regionMap).map((region) => {
      const regionCinemas = cinemas.filter((cinema) => {
        const address = cinema.address?.toLowerCase() || "";
        if (region.id === "hanoi") return address.includes("hà nội");
        if (region.id === "hcm") return address.includes("tp.hcm");
        return false;
      });

      return { ...region, cinemas: regionCinemas };
    });
  }, [cinemas]);

  const activeRegion = regions.find((r) => r.id === selectedRegion);
  const displayedCinemas = activeRegion ? activeRegion.cinemas : [];

  const selectedCinema =
    displayedCinemas.find((c) => c.cinema_id === selectedCinemaId) || null;

  const nowShowingMovies = useMemo(
    () => movies.filter((m) => m.status === "now_showing"),
    [movies]
  );

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
                    <p className="text-zinc-400 text-sm mb-3">{region.desc}</p>
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs"
                      style={{
                        background: "rgba(229,9,20,0.12)",
                        color: "#f87171",
                      }}
                    >
                      {region.cinemas.length} rạp 
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {displayedCinemas.map((cinema) => (
                <button
                  key={cinema.cinema_id}
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
                          Suất chiếu
                        </span>

                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          1900 6017
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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {nowShowingMovies.map((movie) => (
                    <div
                      key={movie.movie_id}
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