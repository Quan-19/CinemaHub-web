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
  const [movies, setMovies] = useState([]);
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

  // fetch movies from backend
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/movies");
        const data = await res.json();

        const formatted = data.map((m) => ({
          id: m.movie_id || m.id,
          title: m.title,
          description: m.description,
          duration: m.duration,

          // rating star
          score: m.rating || 0,

          // lượt đánh giá
          votes: m.views || 0,

          // phân loại tuổi
          rating: m.age_rating,

          poster: m.poster,
          trailer: m.trailer,

          releaseDate: m.release_date,

          // convert status
          status:
            m.status === "now_showing"
              ? "now-showing"
              : m.status === "coming_soon"
                ? "coming-soon"
                : "ended",
        }));

        setMovies(formatted);
      } catch (err) {
        console.error("Lỗi load phim:", err);
      }
    };

    fetchMovies();
  }, []);

  const filteredMovies = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return [...movies]
      .filter((movie) => {
        if (tab !== "all" && movie.status !== tab) return false;

        if (statusFilter !== "Tất cả") {
          if (statusFilter === "Đang chiếu" && movie.status !== "now-showing")
            return false;
          if (statusFilter === "Sắp chiếu" && movie.status !== "coming-soon")
            return false;
        }

        if (genre !== "Tất cả") {
          const normalized = genre.toLowerCase();
          const genres = Array.isArray(movie.genre)
            ? movie.genre
            : movie.genre?.split(",");

          if (!genres?.some((g) => g.toLowerCase().includes(normalized)))
            return false;
        }

        if (rating !== "Tất cả" && movie.rating !== rating) return false;

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

  return (
    <div className="text-white">
      <section className="cinema-surface relative px-4 py-8 sm:px-6 lg:px-8 rounded-b-2xl rounded-t-none">
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-cinema-primary">
              <Flame className="h-4 w-4" />
              Danh sách phim
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Khám phá rạp phim hôm nay
            </h1>

            <p className="mt-2 text-sm text-zinc-400 sm:text-base">
              {filteredMovies.length} phim được tìm thấy
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-zinc-400">
            <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-white/5 px-3 py-2">
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

        {/* SEARCH */}
        <div className="relative mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm phim..."
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 py-3 pl-11 pr-4 text-sm text-white outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className={actionBtnBase}
              >
                {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
                <ChevronDown className="h-4 w-4 text-zinc-400" />
              </button>

              {sortOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-zinc-700 bg-[#0f0f17]">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value);
                        setSortOpen(false);
                      }}
                      className="block w-full px-4 py-2 text-left text-sm hover:bg-white/10"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={actionBtnBase}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Bộ lọc
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="mt-6 flex flex-wrap gap-2">
          {STATUS_TABS.map((item) => (
            <button
              key={item.value}
              onClick={() => setTab(item.value)}
              className={`h-11 rounded-full px-4 text-sm font-semibold ${
                tab === item.value
                  ? "bg-cinema-primary text-white"
                  : "border border-zinc-800 bg-zinc-900 text-zinc-300"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {/* MOVIE GRID */}
      <section className="mt-8">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,230px))] gap-4">
          {filteredMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} size="grid" />
          ))}
        </div>

        {filteredMovies.length === 0 && (
          <div className="mt-10 text-center text-zinc-400">
            Không có phim phù hợp
          </div>
        )}
      </section>
    </div>
  );
}

export default MoviesPage;
