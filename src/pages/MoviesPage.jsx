import { useEffect, useMemo, useState } from "react";
import {
  Search,
  ChevronDown,
  SlidersHorizontal,
  Flame,
  Film,
} from "lucide-react";
import { MovieCard } from "../components/MovieCard";

const SORT_OPTIONS = [
  { label: "Phổ biến nhất", value: "popular" },
  { label: "Điểm cao nhất", value: "top-rated" },
  { label: "Mới nhất", value: "newest" },
  { label: "Thời gian tăng dần", value: "duration" },
];

const STATUS_TABS = [
  { label: "Tất cả", value: "all" },
  { label: "Đang chiếu", value: "now-showing" },
  { label: "Sắp chiếu", value: "coming-soon" },
];

const GENRE_OPTIONS = [
  "Tất cả",
  "Hành động",
  "Kinh dị",
  "Tình cảm",
  "Hoạt hình",
  "Khoa học viễn tưởng",
  "Chính kịch",
  "Giả tưởng",
  "Phiêu lưu",
];

const RATING_OPTIONS = ["Tất cả", "P", "T13", "T16", "T18"];
const STATUS_FILTER_OPTIONS = ["Tất cả", "Đang chiếu", "Sắp chiếu"];

const parseRelease = (dateStr) => {
  if (!dateStr) return 0;
  const date = new Date(dateStr);
  return date.getTime();
};

function MoviesPage() {
  // ========== STATE ==========
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState(SORT_OPTIONS[0].value);
  const [tab, setTab] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [genre, setGenre] = useState("Tất cả");
  const [rating, setRating] = useState("Tất cả");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [sortOpen, setSortOpen] = useState(false);

  const actionBtnBase =
    "inline-flex h-11 items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/80 px-4 text-sm font-semibold text-white transition hover:border-zinc-700";

  // ========== FETCH MOVIES FROM API (Code 1) ==========
  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:5000/api/movies");
        const data = await res.json();

        const formatted = data.map((m) => ({
          id: m.movie_id || m.id,
          title: m.title || "",
          originalTitle: m.originalTitle || "",
          description: m.description || "",
          duration: m.duration || 120,
          score: m.rating || m.ratingScore || 0,
          votes: m.votes || m.views || Math.floor(Math.random() * 5000) + 1000,
          rating: m.age_rating || m.rating || "P",
          poster: m.poster,
          backdrop: m.backdrop || m.poster,
          trailer: m.trailer,
          releaseDate: m.release_date || m.releaseDate,
          // Xử lý genre linh hoạt (cả array và string)
          genre: Array.isArray(m.genre) 
            ? m.genre 
            : m.genre?.split(",").map(g => g.trim()) || [],
          // Chuyển đổi status từ backend (underscore → dash)
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

  // ========== FILTER & SORT MOVIES ==========
  const filteredMovies = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return [...movies]
      .filter((movie) => {
        // Tab filter
        if (tab !== "all" && movie.status !== tab) return false;

        // Status filter
        if (statusFilter !== "Tất cả") {
          if (statusFilter === "Đang chiếu" && movie.status !== "now-showing")
            return false;
          if (statusFilter === "Sắp chiếu" && movie.status !== "coming-soon")
            return false;
        }

        // Genre filter (linh hoạt - xử lý cả array và string)
        if (genre !== "Tất cả") {
          const normalizedGenre = genre.toLowerCase();
          const genres = movie.genre || [];
          if (!genres.some((g) => g.toLowerCase().includes(normalizedGenre)))
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
        if (sortBy === "newest")
          return parseRelease(b.releaseDate) - parseRelease(a.releaseDate);
        if (sortBy === "duration") return (a.duration || 0) - (b.duration || 0);
        return 0;
      });
  }, [genre, movies, query, rating, sortBy, statusFilter, tab]);

  // ========== RESET FILTERS ==========
  const resetFilters = () => {
    setGenre("Tất cả");
    setRating("Tất cả");
    setStatusFilter("Tất cả");
  };

  // ========== LOADING STATE ==========
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0f" }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Đang tải danh sách phim...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white">
      {/* HERO SECTION - Kết hợp blur effect từ Code 2 */}
      <section className="cinema-surface relative overflow-visible px-4 py-8 sm:px-6 lg:px-8 rounded-b-2xl rounded-t-none">
        {/* Blur background effect (Code 2) */}
        <div className="absolute inset-x-10 top-10 h-40 rounded-full bg-cinema-primary/10 blur-3xl" />
        
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-cinema-primary">
              <Flame className="h-4 w-4" />
              Danh sách phim
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Khám phá rạp phim hôm nay
            </h1>
            {/* Enhanced description (Code 2) */}
            <p className="mt-2 text-sm text-zinc-400 sm:text-base">
              {filteredMovies.length} phim được tìm thấy — tìm kiếm, sắp xếp
              hoặc lọc theo nhu cầu của bạn.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-zinc-400">
            <div className="flex items-center gap-2 rounded-xl border border-zinc-800/80 bg-white/5 px-3 py-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-cinema-primary/20 text-cinema-primary">
                <Film className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-white">Rạp CinemaHub</p>
                <p className="text-[11px] text-zinc-400">
                  Đầy đủ suất chiếu hôm nay
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH & SORT SECTION */}
        <div className="relative mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
          {/* Search input với focus effect (Code 2) */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm phim..."
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/60 py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-cinema-primary focus:bg-zinc-900"
            />
          </div>

          <div className="flex items-center gap-2 self-start">
            {/* Sort dropdown */}
            <div className="relative">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className={actionBtnBase}
              >
                {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
                <ChevronDown className="h-4 w-4 text-zinc-400" />
              </button>

              {sortOpen && (
                <div className="absolute right-0 z-30 mt-2 w-48 overflow-hidden rounded-2xl border border-zinc-700 bg-[#0f0f17] shadow-2xl">
                  {SORT_OPTIONS.map((option) => {
                    const active = option.value === sortBy;
                    return (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          setSortOpen(false);
                        }}
                        className={`block w-full px-4 py-2.5 text-left text-sm transition ${
                          active
                            ? "bg-cinema-primary/15 text-white"
                            : "text-zinc-200 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Filter button với active styling (Code 2) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`${actionBtnBase} ${
                showFilters
                  ? "border-cinema-primary bg-cinema-primary/10 text-white hover:border-cinema-primary"
                  : ""
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Bộ lọc
            </button>
          </div>
        </div>

        {/* STATUS TABS với shadow effect (Code 2) */}
        <div className="mt-6 flex flex-wrap gap-2">
          {STATUS_TABS.map((item) => {
            const active = tab === item.value;
            return (
              <button
                key={item.value}
                onClick={() => setTab(item.value)}
                className={`h-11 rounded-full px-4 text-sm font-semibold transition ${
                  active
                    ? "bg-cinema-primary text-white shadow-[0_8px_30px_-12px_rgba(229,9,20,0.6)]"
                    : "border border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-700"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* FILTER PANEL (Code 2) */}
        {showFilters && (
          <div className="cinema-surface mt-5 space-y-4 p-4 shadow-lg">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-zinc-400">
                Thu hẹp kết quả theo thể loại, giới hạn tuổi và trạng thái.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={resetFilters}
                  className="inline-flex h-10 items-center rounded-xl border border-zinc-800 px-3 text-xs font-semibold text-zinc-300 transition hover:border-zinc-700"
                >
                  Đặt lại
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="cinema-btn-primary h-10 px-4"
                >
                  Áp dụng
                </button>
              </div>
            </div>

            {/* Genre filter */}
            <div className="space-y-3">
              <p className="text-[13px] font-semibold text-zinc-300">Thể loại</p>
              <div className="flex flex-wrap gap-2">
                {GENRE_OPTIONS.map((item) => {
                  const active = genre === item;
                  return (
                    <button
                      key={item}
                      onClick={() => setGenre(item)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                        active
                          ? "bg-cinema-primary text-white shadow-[0_8px_30px_-12px_rgba(229,9,20,0.6)]"
                          : "border border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-700"
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Rating filter */}
              <div className="space-y-3">
                <p className="text-[13px] font-semibold text-zinc-300">Giới hạn tuổi</p>
                <div className="flex flex-wrap gap-2">
                  {RATING_OPTIONS.map((item) => {
                    const active = rating === item;
                    return (
                      <button
                        key={item}
                        onClick={() => setRating(item)}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                          active
                            ? "bg-cinema-primary text-white shadow-[0_8px_30px_-12px_rgba(229,9,20,0.6)]"
                            : "border border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-700"
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status filter */}
              <div className="space-y-3">
                <p className="text-[13px] font-semibold text-zinc-300">Trạng thái</p>
                <div className="flex flex-wrap gap-2">
                  {STATUS_FILTER_OPTIONS.map((item) => {
                    const active = statusFilter === item;
                    return (
                      <button
                        key={item}
                        onClick={() => setStatusFilter(item)}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                          active
                            ? "bg-cinema-primary text-white shadow-[0_8px_30px_-12px_rgba(229,9,20,0.6)]"
                            : "border border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-700"
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* MOVIE GRID */}
      <section className="mt-8">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,230px))] gap-3 sm:gap-4">
          {filteredMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} size="grid" />
          ))}
        </div>

        {/* EMPTY STATE - Enhanced from Code 2 */}
        {filteredMovies.length === 0 && (
          <div className="mt-10 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/50 p-8 text-center text-zinc-400">
            Không có phim phù hợp. Hãy thử điều chỉnh bộ lọc hoặc tìm kiếm khác.
          </div>
        )}
      </section>
    </div>
  );
}

export default MoviesPage;