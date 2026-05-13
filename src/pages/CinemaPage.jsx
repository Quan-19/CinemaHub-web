import { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { 
  MapPin, Phone, Clock, ChevronLeft, Search, 
  Info, Calendar, Star, Ticket, Sparkles, Navigation 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const BRAND_COLORS = {
  EbizCinema: "#e50914",
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

const normalizeAgeRating = (value) => {
  const raw = String(value ?? "").trim();
  if (!raw) return "P";
  if (/^T\d+$/i.test(raw)) return raw.toUpperCase();
  if (/^\d+$/.test(raw)) return `T${raw}`;
  return raw.toUpperCase();
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
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const normalizeCityText = (value = "") =>
  removeDiacritics(value)
    .toLowerCase()
    .replace(/[.,;:()[\]{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// Vietnam administrative areas
const VN_AREA_DEFINITIONS = [
  { label: "Thành phố Hà Nội", id: "ha-noi", aliases: ["ha noi", "hanoi", "hn", "tp ha noi"] },
  { label: "Thành phố Huế", id: "hue", aliases: ["hue", "thanh pho hue", "tp hue", "thua thien hue"] },
  { label: "Thành phố Hồ Chí Minh", id: "ho-chi-minh", aliases: ["ho chi minh", "tp ho chi minh", "tphcm", "hcm", "sai gon"] },
  { label: "Thành phố Hải Phòng", id: "hai-phong", aliases: ["hai phong", "haiphong", "hp"] },
  { label: "Thành phố Đà Nẵng", id: "da-nang", aliases: ["da nang", "danang", "tp da nang"] },
  { label: "Thành phố Cần Thơ", id: "can-tho", aliases: ["can tho", "cantho", "tp can tho"] },
  // Provinces... (Shortened for clarity in implementation, but logically same)
  { label: "Tỉnh Đồng Nai", id: "dong-nai", aliases: ["dong nai"] },
  { label: "Tỉnh Bình Dương", id: "binh-duong", aliases: ["binh duong"] },
  { label: "Tỉnh Quảng Ninh", id: "quang-ninh", aliases: ["quang ninh"] },
  { label: "Tỉnh Khánh Hoà", id: "khanh-hoa", aliases: ["khanh hoa", "nha trang"] },
  { label: "Tỉnh Đắk Lắk", id: "dak-lak", aliases: ["dak lak", "buon ma thuot"] },
  { label: "Tỉnh Lâm Đồng", id: "lam-dong", aliases: ["lam dong", "da lat"] },
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
  VN_AREA_DEFINITIONS.forEach((canonical) => {
    addEntry(canonical, canonical.label);
    const shortLabel = normalizeCityText(canonical.label).replace(/^(tinh|thanh pho|tp)\s+/i, "").trim();
    addEntry(canonical, shortLabel);
    (canonical.aliases || []).forEach((alias) => addEntry(canonical, alias));
  });
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
    if (entry.flatAlias && entry.flatAlias.length >= 4 && flat.includes(entry.flatAlias)) return entry;
  }
  return null;
};

const inferCinemaCity = (cinema) => {
  const rawCity = String(cinema?.city ?? "").trim();
  if (rawCity) {
    const matched = matchVietnamCity(rawCity);
    return matched || { id: normalizeRegionKey(rawCity), label: rawCity };
  }
  const segments = String(cinema?.address ?? "").split(",").map(s => s.trim()).filter(Boolean).slice(-3).reverse();
  for (const segment of segments) {
    const matched = matchVietnamCity(segment);
    if (matched) return matched;
  }
  return { id: "other", label: "Khác" };
};

function CinemaPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [cinemas, setCinemas] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedCinemaId, setSelectedCinemaId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [cinemaShowtimes, setCinemaShowtimes] = useState([]);
  const [loadingShowtimes, setLoadingShowtimes] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [cinemaRes, movieRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/cinemas`),
          fetch(`${API_BASE_URL}/api/movies`),
        ]);
        const [cinemaPayload, moviePayload] = await Promise.all([
          cinemaRes.json(),
          movieRes.json(),
        ]);
        const cinemaList = unwrapArrayResponse(cinemaPayload).filter(isActiveCinema);
        const moviesData = unwrapArrayResponse(moviePayload);
        
        const formattedMovies = moviesData.map(m => ({
          ...m,
          id: m.movie_id || m.id,
          movie_id: m.movie_id || m.id,
          score: m.rating || m.ratingScore || 0,
          age_rating: normalizeAgeRating(m.age_rating ?? m.ageRating),
          status: m.status === "now_showing" ? "now_showing" : m.status === "coming_soon" ? "coming_soon" : "ended",
        }));

        setCinemas(cinemaList);
        setMovies(formattedMovies);

        const urlCinemaId = searchParams.get("cinemaId");
        if (urlCinemaId && cinemaList.length > 0) {
          const targetCinema = cinemaList.find(c => String(c.cinema_id ?? c.id) === String(urlCinemaId));
          if (targetCinema) {
            const inferred = inferCinemaCity(targetCinema);
            setSelectedRegion(inferred?.id || "other");
            setSelectedCinemaId(String(urlCinemaId));
          }
        }
      } catch (err) {
        console.error("Lỗi tải dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [searchParams]);

  useEffect(() => {
    const fetchShowtimes = async () => {
      if (!selectedCinemaId) {
        setCinemaShowtimes([]);
        return;
      }
      setLoadingShowtimes(true);
      try {
        let res = await fetch(`${API_BASE_URL}/api/showtimes/cinema/${selectedCinemaId}`);
        
        // Fallback to fetch all and filter if cinema-specific endpoint fails
        if (!res.ok) {
           res = await fetch(`${API_BASE_URL}/api/showtimes`);
        }
        
        if (!res.ok) throw new Error("Failed to fetch showtimes");
        const data = await res.json();
        
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const dd = String(now.getDate()).padStart(2, "0");
        const today = `${yyyy}-${mm}-${dd}`;

        const rawData = Array.isArray(data) ? data : (data.data || []);
        
        const todayShowtimes = rawData.filter(st => {
          // If we fetched all showtimes, filter by cinemaId first
          const stCinemaId = st.cinema_id || st.cinemaId;
          if (stCinemaId && String(stCinemaId) !== String(selectedCinemaId)) return false;

          const stDate = st.start_time || st.startTime || st.date || "";
          return stDate && String(stDate).includes(today);
        });
        
        setCinemaShowtimes(todayShowtimes);
      } catch (err) {
        console.error("Lỗi tải suất chiếu:", err);
        setCinemaShowtimes([]);
      } finally {
        setLoadingShowtimes(false);
      }
    };
    fetchShowtimes();
  }, [selectedCinemaId]);

  const regions = useMemo(() => {
    const groups = new Map();
    cinemas.forEach((cinema) => {
      const inferred = inferCinemaCity(cinema);
      const regionKey = inferred?.id || "other";
      if (!groups.has(regionKey)) {
        groups.set(regionKey, { id: regionKey, label: inferred?.label || "Khác", cinemas: [] });
      }
      groups.get(regionKey).cinemas.push(cinema);
    });
    return Array.from(groups.values()).sort((a, b) => a.label.localeCompare(b.label, "vi"));
  }, [cinemas]);

  const filteredRegions = useMemo(() => {
    if (!searchQuery.trim()) return regions;
    const q = removeDiacritics(searchQuery.toLowerCase());
    return regions.filter(r => 
      removeDiacritics(r.label.toLowerCase()).includes(q) ||
      r.cinemas.some(c => removeDiacritics(c.name.toLowerCase()).includes(q))
    );
  }, [regions, searchQuery]);

  const activeRegion = regions.find((r) => r.id === selectedRegion);
  const selectedCinema = activeRegion?.cinemas.find(c => String(c.cinema_id ?? c.id) === String(selectedCinemaId)) || null;

  const nowShowingMovies = useMemo(() => {
    const allNowShowing = movies.filter((m) => m.status === "now_showing");
    if (!selectedCinemaId || cinemaShowtimes.length === 0) {
      return allNowShowing;
    }
    // Filter movies that have at least one showtime at this cinema today
    const movieIdsAtCinema = new Set(cinemaShowtimes.map(st => String(st.movie_id || st.movieId)));
    return allNowShowing.filter(m => movieIdsAtCinema.has(String(m.id || m.movie_id)));
  }, [movies, selectedCinemaId, cinemaShowtimes]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cinema-bg">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cinema-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-zinc-400 font-medium animate-pulse">Đang chuẩn bị hệ thống rạp...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-cinema-bg pb-24 overflow-x-hidden">
      {/* HERO SECTION */}
      <header className="relative pt-20 pb-16 md:pt-28 md:pb-24 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-30">
          <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-cinema-primary/20 blur-[120px] rounded-full"></div>
          <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-blue-600/10 blur-[100px] rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-sm"
          >
            <MapPin className="w-4 h-4 text-cinema-primary" />
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Hệ thống rạp CinemaHub</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white text-4xl md:text-6xl font-black mb-6 tracking-tight"
          >
            TÌM <span className="text-gradient">RẠP CHIẾU</span> GẦN BẠN
          </motion.h1>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto relative group"
          >
            <div className="absolute inset-0 bg-cinema-primary/10 blur-2xl group-focus-within:bg-cinema-primary/20 transition-colors rounded-3xl"></div>
            <div className="relative flex items-center">
              <Search className="absolute left-5 w-5 h-5 text-zinc-500 group-focus-within:text-cinema-primary transition-colors" />
              <input
                type="text"
                placeholder="Tìm kiếm rạp hoặc khu vực..."
                className="w-full bg-zinc-900/80 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-cinema-primary/50 backdrop-blur-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <AnimatePresence mode="wait">
          {!selectedRegion ? (
            /* REGION SELECTION GRID */
            <motion.div 
              key="regions"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredRegions.map((region, idx) => (
                <motion.button
                  key={region.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setSelectedRegion(region.id)}
                  className="group relative h-40 rounded-3xl overflow-hidden border border-white/5 bg-zinc-900/40 backdrop-blur-md hover:border-cinema-primary/50 hover:bg-zinc-900/60 transition-all text-left p-6"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                    <Navigation className="w-16 h-16 rotate-45" />
                  </div>
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                      <h3 className="text-white text-xl font-bold mb-1 line-clamp-1 group-hover:text-cinema-primary transition-colors">
                        {region.label}
                      </h3>
                      <p className="text-zinc-500 text-sm line-clamp-1">Khu vực {region.label.replace(/^(Tỉnh|Thành phố)\s+/i, "")}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-cinema-primary/10 border border-cinema-primary/20 text-cinema-primary text-xs font-black uppercase">
                        {region.cinemas.length} rạp
                      </span>
                      <ChevronLeft className="w-4 h-4 text-zinc-500 rotate-180 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          ) : (
            /* CINEMA & MOVIES SELECTION */
            <motion.div 
              key="cinema-selection"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Left Side: Cinema List */}
                <div className="w-full md:w-1/3 lg:w-1/4 space-y-4 sticky top-24">
                  <button
                    onClick={() => { setSelectedRegion(""); setSelectedCinemaId(""); }}
                    className="flex items-center gap-2 text-zinc-500 hover:text-white font-bold text-sm mb-6 transition-colors group"
                  >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
                    QUAY LẠI CHỌN KHU VỰC
                  </button>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-1 h-6 bg-cinema-primary rounded-full"></div>
                    <h2 className="text-white font-black uppercase tracking-tight">Rạp tại {activeRegion.label}</h2>
                  </div>

                  <div className="space-y-3 custom-scrollbar overflow-y-auto max-h-[60vh] pr-2">
                    {activeRegion.cinemas.map((cinema) => {
                      const cid = String(cinema.cinema_id ?? cinema.id);
                      const isSelected = selectedCinemaId === cid;
                      return (
                        <button
                          key={cid}
                          onClick={() => setSelectedCinemaId(cid)}
                          className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 ${
                            isSelected 
                              ? "bg-cinema-primary border-cinema-primary shadow-lg shadow-cinema-primary/20" 
                              : "bg-zinc-900/50 border-white/5 hover:border-white/20"
                          }`}
                        >
                          <h4 className={`font-bold text-sm mb-1 ${isSelected ? "text-white" : "text-zinc-300"}`}>{cinema.name}</h4>
                          <p className={`text-[11px] line-clamp-1 ${isSelected ? "text-white/70" : "text-zinc-500"}`}>{cinema.address}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right Side: Cinema Details & Movies */}
                <div className="flex-1 min-w-0 space-y-10">
                  {!selectedCinema ? (
                    <div className="h-[50vh] flex flex-col items-center justify-center glass-card rounded-[40px] border-dashed border-white/10 text-center p-12">
                      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                        <Sparkles className="w-10 h-10 text-zinc-700" />
                      </div>
                      <h3 className="text-white text-2xl font-black mb-3">HÃY CHỌN MỘT RẠP</h3>
                      <p className="text-zinc-500 max-w-sm">Chọn rạp bên trái để xem lịch chiếu và các thông tin chi tiết khác.</p>
                    </div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-10"
                    >
                      {/* Cinema Detail Card */}
                      <div className="relative rounded-[40px] overflow-hidden p-8 md:p-12 glass-card">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                          <Ticket className="w-32 h-32 rotate-[-15deg]" />
                        </div>
                        <div className="relative z-10 flex flex-col items-center text-center">
                          <div className="max-w-3xl space-y-8">
                            <div className="space-y-4">
                               <h2 className="text-white text-3xl md:text-5xl font-black leading-tight uppercase tracking-tight">
                                 {selectedCinema.name}
                               </h2>
                               <p className="text-zinc-400 flex items-center justify-center gap-2 text-sm md:text-base leading-relaxed">
                                  <MapPin className="w-5 h-5 text-cinema-primary shrink-0" />
                                  {selectedCinema.address}
                               </p>
                            </div>

                            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 pt-4 border-t border-white/5">
                               <div className="flex flex-col gap-2">
                                  <span className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">Hotline hỗ trợ</span>
                                  <span className="text-white text-lg font-bold flex items-center gap-3 justify-center">
                                    <div className="w-10 h-10 rounded-full bg-cinema-gold/10 flex items-center justify-center">
                                      <Phone className="w-5 h-5 text-cinema-gold" />
                                    </div>
                                    {selectedCinema.phone || "1900 6017"}
                                  </span>
                               </div>
                               <div className="flex flex-col gap-2">
                                  <span className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">Suất chiếu hôm nay</span>
                                  <span className="text-white text-lg font-bold flex items-center gap-3 justify-center">
                                    <div className="w-10 h-10 rounded-full bg-cinema-primary/10 flex items-center justify-center">
                                      <Clock className="w-5 h-5 text-cinema-primary" />
                                    </div>
                                     {loadingShowtimes ? (
                                       <span className="w-8 h-4 bg-white/10 animate-pulse rounded"></span>
                                     ) : (
                                       <>{cinemaShowtimes.length} suất / ngày</>
                                     )}
                                  </span>
                               </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Movies at this Cinema */}
                      <div>
                        <div className="flex items-center justify-between mb-8">
                           <div className="flex items-center gap-3">
                              <div className="w-1.5 h-8 bg-cinema-gold rounded-full"></div>
                              <h3 className="text-white text-2xl font-black uppercase tracking-tight">Phim đang chiếu</h3>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {nowShowingMovies.map((movie, idx) => (
                            <motion.div
                              key={movie.movie_id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              className="group relative glass-card p-4 hover:border-cinema-primary/30 transition-all duration-500"
                            >
                              <div className="flex gap-4">
                                <div className="relative w-24 h-36 shrink-0 rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
                                  <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                  <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-black text-white border border-white/10">
                                     {movie.age_rating}
                                  </div>
                                </div>
                                <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                                  <div>
                                    <h4 className="text-white font-bold text-base line-clamp-2 mb-1 group-hover:text-cinema-primary transition-colors leading-tight">
                                      {movie.title}
                                    </h4>
                                    <div className="flex items-center gap-3 text-zinc-500 text-[10px] font-bold uppercase mb-2">
                                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {movie.duration}ph</span>
                                      <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                                      <span className="flex items-center gap-1"><Star className="w-3 h-3 text-cinema-gold fill-cinema-gold" /> {movie.score || "8.5"}</span>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => navigate(`/booking/${movie.id || movie.movie_id}?cinemaId=${selectedCinema.cinema_id}`)}
                                    className="cinema-btn-primary w-full py-2.5 text-xs font-black uppercase tracking-widest"
                                  >
                                    ĐẶT VÉ NGAY
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

export default CinemaPage;
