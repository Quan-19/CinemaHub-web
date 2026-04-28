/* MoviesPage.jsx - Premium Movie Listing Page (No Mock Data) */
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  ChevronDown,
  SlidersHorizontal,
  Flame,
  Film,
  Star,
  Clock,
  X,
  Filter,
  Calendar,
  TrendingUp,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MovieCard } from "../components/MovieCard";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const SORT_OPTIONS = [
  { label: "Phổ biến nhất", value: "popular", icon: TrendingUp },
  { label: "Điểm cao nhất", value: "top-rated", icon: Star },
  { label: "Mới nhất", value: "newest", icon: Calendar },
  { label: "Thời lượng tăng dần", value: "duration", icon: Clock },
];

const STATUS_TABS = [
  { label: "Tất cả", value: "all" },
  { label: "Đang chiếu", value: "now-showing" },
  { label: "Sắp chiếu", value: "coming-soon" },
];

// Lấy danh sách thể loại động từ API
const fetchGenres = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/movies`);
    const data = await res.json();
    const movies = Array.isArray(data) ? data : (data.data || []);
    const allGenres = new Set();
    movies.forEach(movie => {
      const genres = Array.isArray(movie.genre) 
        ? movie.genre 
        : (movie.genre?.split(',').map(g => g.trim()) || []);
      genres.forEach(g => allGenres.add(g));
    });
    return ['Tất cả', ...Array.from(allGenres)];
  } catch {
    return ['Tất cả'];
  }
};

// Lấy danh sách rating động từ API
const fetchRatings = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/movies`);
    const data = await res.json();
    const movies = Array.isArray(data) ? data : (data.data || []);
    const allRatings = new Set();
    movies.forEach(movie => {
      const rating = movie.age_rating || movie.rating || 'P';
      allRatings.add(rating);
    });
    return ['Tất cả', ...Array.from(allRatings).sort()];
  } catch {
    return ['Tất cả', 'P', 'T13', 'T16', 'T18'];
  }
};

// Movie Card Skeleton
const MovieCardSkeleton = () => (
  <div className="flex flex-col gap-3">
    <div className="aspect-[2/3] rounded-2xl bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 animate-pulse" />
    <div className="space-y-2">
      <div className="h-4 bg-zinc-800 rounded-lg w-3/4 animate-pulse" />
      <div className="h-3 bg-zinc-800 rounded-lg w-1/2 animate-pulse" />
      <div className="h-3 bg-zinc-800 rounded-lg w-2/3 animate-pulse" />
    </div>
  </div>
);

function MoviesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  
  // ========== STATE ==========
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(queryParam);
  const [sortBy, setSortBy] = useState(SORT_OPTIONS[0].value);
  const [tab, setTab] = useState(() => {
    const status = searchParams.get('status');
    if (status === 'now-showing') return 'now-showing';
    if (status === 'coming-soon') return 'coming-soon';
    return 'all';
  });
  const [showFilters, setShowFilters] = useState(false);
  const [genre, setGenre] = useState("Tất cả");
  const [rating, setRating] = useState("Tất cả");
  const [sortOpen, setSortOpen] = useState(false);
  const [genreOptions, setGenreOptions] = useState(['Tất cả']);
  const [ratingOptions, setRatingOptions] = useState(['Tất cả', 'P', 'T13', 'T16', 'T18']);
  const [fetchingFilters, setFetchingFilters] = useState(true);

  const actionBtnBase = "inline-flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-zinc-900/80 px-4 text-sm font-semibold text-white transition-all hover:border-white/20 hover:bg-zinc-800 backdrop-blur-sm";

  // ========== FETCH MOVIES FROM API ==========
  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/movies`);
        const data = await res.json();
        const moviesData = Array.isArray(data) ? data : (data.data || []);

        const formatted = moviesData.map((m) => ({
          id: m.movie_id || m.id,
          movie_id: m.movie_id || m.id,
          title: m.title || "",
          originalTitle: m.originalTitle || "",
          description: m.description || "",
          duration: m.duration || 120,
          score: m.rating || m.ratingScore || 0,
          votes: m.votes || m.views || 0,
          rating: m.age_rating || m.rating || "P",
          poster: m.poster,
          backdrop: m.backdrop || m.poster,
          trailer: m.trailer,
          releaseDate: m.release_date || m.releaseDate,
          genre: Array.isArray(m.genre) 
            ? m.genre 
            : (m.genre?.split(",").map(g => g.trim()) || []),
          status: m.status === "now_showing" 
            ? "now-showing" 
            : m.status === "coming_soon" 
              ? "coming-soon" 
              : "ended",
        }));

        setMovies(formatted);
      } catch (err) {
        console.error("Lỗi load phim:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // ========== FETCH FILTER OPTIONS DYNAMICALLY ==========
  useEffect(() => {
    const loadFilterOptions = async () => {
      setFetchingFilters(true);
      const genres = await fetchGenres();
      const ratings = await fetchRatings();
      setGenreOptions(genres);
      setRatingOptions(ratings);
      setFetchingFilters(false);
    };
    loadFilterOptions();
  }, []);

  // ========== FILTER & SORT MOVIES ==========
  const filteredMovies = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return [...movies]
      .filter((movie) => {
        // Tab filter
        if (tab !== "all" && movie.status !== tab) return false;

        // Genre filter
        if (genre !== "Tất cả") {
          const normalizedGenre = genre.toLowerCase();
          const genres = movie.genre || [];
          if (!genres.some((g) => g.toLowerCase() === normalizedGenre || g.toLowerCase().includes(normalizedGenre)))
            return false;
        }

        // Rating filter
        if (rating !== "Tất cả" && movie.rating !== rating) return false;

        // Search query
        if (!normalizedQuery) return true;
        return (
          movie.title?.toLowerCase().includes(normalizedQuery) ||
          movie.originalTitle?.toLowerCase().includes(normalizedQuery)
        );
      })
      .sort((a, b) => {
        if (sortBy === "popular") return (b.votes || 0) - (a.votes || 0);
        if (sortBy === "top-rated") return (b.score || 0) - (a.score || 0);
        if (sortBy === "newest") {
          const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
          const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
          return dateB - dateA;
        }
        if (sortBy === "duration") return (a.duration || 0) - (b.duration || 0);
        return 0;
      });
  }, [genre, movies, query, rating, sortBy, tab]);

  // ========== RESET FILTERS ==========
  const resetFilters = () => {
    setGenre("Tất cả");
    setRating("Tất cả");
  };

  // ========== UPDATE URL WHEN SEARCH/TAB CHANGES ==========
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (tab !== 'all') params.set('status', tab);
    setSearchParams(params, { replace: true });
  }, [query, tab, setSearchParams]);

  // ========== RENDER ==========
  return (
    <div className="min-h-screen bg-cinema-bg">
      {/* Hero Section with Gradient */}
      <section className="relative overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-cinema-primary/5 via-transparent to-purple-500/5" />
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-cinema-primary/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl animate-pulse delay-1000" />
        
        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-cinema-primary">
                <Flame className="h-4 w-4" />
                <span className="tracking-wide">THƯ VIỆN PHIM</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Khám phá{" "}
                <span className="bg-gradient-to-r from-cinema-primary to-yellow-500 bg-clip-text text-transparent">
                  thế giới điện ảnh
                </span>
              </h1>
              <p className="mt-2 text-sm text-zinc-400 sm:text-base max-w-2xl">
                {filteredMovies.length} phim được tìm thấy — Trải nghiệm hàng nghìn bộ phim với chất lượng hình ảnh và âm thanh đỉnh cao.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs text-zinc-400">
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-sm">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-cinema-primary/20 text-cinema-primary">
                  <Film className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-white">EbizCinema</p>
                  <p className="text-[11px] text-zinc-400">Đặt vé dễ dàng</p>
                </div>
              </div>
            </div>
          </div>

          {/* SEARCH & SORT SECTION */}
          <div className="relative mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
            {/* Search input */}
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm kiếm phim theo tên, diễn viên, đạo diễn..."
                className="w-full rounded-2xl border border-white/10 bg-zinc-900/60 py-3 pl-11 pr-4 text-sm text-white outline-none transition-all focus:border-cinema-primary focus:bg-zinc-900 focus:shadow-lg focus:shadow-cinema-primary/10"
              />
            </div>

            <div className="flex items-center gap-2 self-start">
              {/* Sort dropdown */}
              <div className="relative">
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  className={actionBtnBase}
                >
                  {(() => {
                    const selected = SORT_OPTIONS.find((o) => o.value === sortBy);
                    const Icon = selected?.icon;
                    return (
                      <>
                        {Icon && <Icon className="h-4 w-4 text-zinc-400" />}
                        {selected?.label}
                        <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
                      </>
                    );
                  })()}
                </button>

                <AnimatePresence>
                  {sortOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 z-30 mt-2 w-48 overflow-hidden rounded-2xl border border-white/10 bg-cinema-surface shadow-2xl backdrop-blur-xl"
                    >
                      {SORT_OPTIONS.map((option) => {
                        const active = option.value === sortBy;
                        const Icon = option.icon;
                        return (
                          <button
                            key={option.value}
                            onClick={() => {
                              setSortBy(option.value);
                              setSortOpen(false);
                            }}
                            className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-all ${
                              active
                                ? "bg-cinema-primary/20 text-white"
                                : "text-zinc-300 hover:bg-white/5 hover:text-white"
                            }`}
                          >
                            {Icon && <Icon className={`h-4 w-4 ${active ? 'text-cinema-primary' : 'text-zinc-500'}`} />}
                            {option.label}
                            {active && <Sparkles className="h-3 w-3 ml-auto text-cinema-primary" />}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Filter button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className={`${actionBtnBase} ${
                  showFilters
                    ? "border-cinema-primary bg-cinema-primary/10 text-white"
                    : ""
                }`}
              >
                <Filter className={`h-4 w-4 ${showFilters ? 'text-cinema-primary' : ''}`} />
                Bộ lọc
                {(genre !== "Tất cả" || rating !== "Tất cả") && (
                  <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-cinema-primary text-[10px] font-bold text-white">
                    {(genre !== "Tất cả" ? 1 : 0) + (rating !== "Tất cả" ? 1 : 0)}
                  </span>
                )}
              </motion.button>
            </div>
          </div>

          {/* STATUS TABS */}
          <div className="mt-6 flex flex-wrap gap-2">
            {STATUS_TABS.map((item) => {
              const active = tab === item.value;
              return (
                <motion.button
                  key={item.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setTab(item.value)}
                  className={`h-11 rounded-full px-5 text-sm font-semibold transition-all ${
                    active
                      ? "bg-cinema-primary text-white shadow-lg shadow-cinema-primary/30"
                      : "border border-white/10 bg-zinc-900/60 text-zinc-300 hover:border-white/20 hover:bg-zinc-800"
                  }`}
                >
                  {item.label}
                </motion.button>
              );
            })}
          </div>

          {/* FILTER PANEL */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="cinema-surface mt-5 overflow-hidden rounded-2xl border border-white/10 p-5 shadow-lg"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-cinema-primary" />
                    <p className="text-sm text-zinc-400">
                      Lọc theo thể loại và độ tuổi
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={resetFilters}
                      className="inline-flex h-9 items-center rounded-xl border border-white/10 px-3 text-xs font-semibold text-zinc-300 transition-all hover:border-white/20 hover:bg-white/5"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Đặt lại
                    </button>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="cinema-btn-primary h-9 px-4 text-xs"
                    >
                      Áp dụng
                    </button>
                  </div>
                </div>

                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  {/* Genre filter */}
                  <div className="space-y-3">
                    <p className="text-[13px] font-semibold text-zinc-300 flex items-center gap-2">
                      <Film className="h-3.5 w-3.5 text-cinema-primary" />
                      Thể loại
                    </p>
                    {fetchingFilters ? (
                      <div className="flex flex-wrap gap-2">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="h-8 w-16 bg-zinc-800 rounded-full animate-pulse" />
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {genreOptions.map((item) => {
                          const active = genre === item;
                          return (
                            <motion.button
                              key={item}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setGenre(item)}
                              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                                active
                                  ? "bg-cinema-primary text-white shadow-md"
                                  : "border border-white/10 bg-zinc-900/60 text-zinc-300 hover:border-white/20 hover:bg-zinc-800"
                              }`}
                            >
                              {item}
                            </motion.button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Rating filter */}
                  <div className="space-y-3">
                    <p className="text-[13px] font-semibold text-zinc-300 flex items-center gap-2">
                      <Star className="h-3.5 w-3.5 text-yellow-500" />
                      Giới hạn tuổi
                    </p>
                    {fetchingFilters ? (
                      <div className="flex flex-wrap gap-2">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="h-8 w-12 bg-zinc-800 rounded-full animate-pulse" />
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {ratingOptions.map((item) => {
                          const active = rating === item;
                          const ratingColor = {
                            'P': 'text-green-400',
                            'T13': 'text-blue-400',
                            'T16': 'text-orange-400',
                            'T18': 'text-red-400',
                          }[item] || 'text-zinc-300';
                          return (
                            <motion.button
                              key={item}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setRating(item)}
                              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                                active
                                  ? "bg-cinema-primary text-white shadow-md"
                                  : `border border-white/10 bg-zinc-900/60 ${ratingColor} hover:border-white/20 hover:bg-zinc-800`
                              }`}
                            >
                              {item}
                            </motion.button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* MOVIE GRID SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
            {[...Array(10)].map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredMovies.length > 0 ? (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-zinc-400">
                Hiển thị <span className="text-white font-semibold">{filteredMovies.length}</span> kết quả
              </p>
              <p className="text-xs text-zinc-500">
                Sắp xếp theo: {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
              {filteredMovies.map((movie, index) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03, duration: 0.4 }}
                >
                  <MovieCard movie={movie} size="grid" />
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-10 rounded-2xl border border-dashed border-white/10 bg-zinc-900/30 p-12 text-center backdrop-blur-sm"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-zinc-800/50 flex items-center justify-center">
                <Film className="w-10 h-10 text-zinc-600" />
              </div>
              <h3 className="text-xl font-bold text-white">Không tìm thấy phim</h3>
              <p className="text-zinc-400 max-w-md">
                Không có phim nào phù hợp với tiêu chí tìm kiếm của bạn. Hãy thử điều chỉnh bộ lọc hoặc tìm kiếm khác.
              </p>
              <button
                onClick={() => {
                  setQuery("");
                  setGenre("Tất cả");
                  setRating("Tất cả");
                  setTab("all");
                }}
                className="mt-2 px-6 py-2.5 rounded-xl bg-cinema-primary text-white font-semibold hover:bg-cinema-primary-dark transition-all"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          </motion.div>
        )}
      </section>
    </div>
  );
}

export default MoviesPage;