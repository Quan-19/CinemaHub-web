import { useMemo, useState } from "react";
import {
  Search,
  ChevronDown,
  SlidersHorizontal,
  Flame,
  Film,
} from "lucide-react";
import { MOVIES } from "../data/mockData";
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

const EXTRA_MOVIES = [
  {
    id: "lego-odyssey",
    title: "Hành Trình Vũ Trụ",
    originalTitle: "Lego Odyssey",
    status: "now-showing",
    genre: ["Animation", "Adventure"],
    score: 9.1,
    votes: 16200,
    duration: 162,
    rating: "P",
    description:
      "Cuộc phiêu lưu ngoài không gian đầy sắc màu của đội phi hành gia Lego.",
    backdrop: "",
    poster:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
    releaseDate: "12/02/2026",
  },
  {
    id: "dragon-flight",
    title: "Rồng Bay Lên",
    originalTitle: "Dragon Flight",
    status: "now-showing",
    genre: ["Fantasy", "Family"],
    score: 8.7,
    votes: 9500,
    duration: 95,
    rating: "P",
    description: "Một cô bé và chú rồng nhỏ khám phá vùng đất bí ẩn trên mây.",
    backdrop: "",
    poster:
      "https://images.unsplash.com/photo-1490633874781-1c63cc424610?auto=format&fit=crop&w=600&q=80",
    releaseDate: "02/01/2026",
  },
  {
    id: "last-ride",
    title: "Chuyến Đi Cuối Cùng",
    originalTitle: "The Last Ride",
    status: "now-showing",
    genre: ["Action", "Thriller"],
    score: 8.9,
    votes: 12800,
    duration: 128,
    rating: "T13",
    description: "Phi vụ cuối đưa nhóm lính đánh thuê vào vòng xoáy nguy hiểm.",
    backdrop: "",
    poster:
      "https://images.unsplash.com/photo-1451188502541-13943edb6acb?auto=format&fit=crop&w=600&q=80",
    releaseDate: "22/12/2025",
  },
];

const parseRelease = (dateStr) => {
  if (!dateStr) return 0;
  const [day, month, year] = dateStr.split("/").map(Number);
  return new Date(year || 0, (month || 1) - 1, day || 1).getTime();
};

function MoviesPage() {
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

  const movies = useMemo(() => [...MOVIES, ...EXTRA_MOVIES], []);

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
          if (!movie.genre.some((g) => g.toLowerCase().includes(normalized)))
            return false;
        }
        if (rating !== "Tất cả" && movie.rating !== rating) return false;
        if (!normalizedQuery) return true;
        return (
          movie.title.toLowerCase().includes(normalizedQuery) ||
          movie.originalTitle.toLowerCase().includes(normalizedQuery)
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
      <section className="cinema-surface relative overflow-visible px-4 py-8 sm:px-6 lg:px-8">
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
                <p className="font-semibold text-white">Rạp CineStar</p>
                <p className="text-[11px] text-zinc-400">
                  Đầy đủ suất chiếu hôm nay
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm kiếm phim..."
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/60 py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-cinema-primary focus:bg-zinc-900"
            />
          </div>

          <div className="flex items-center gap-2 self-start">
            <div className="relative">
              <button
                onClick={() => setSortOpen((open) => !open)}
                className={`${actionBtnBase} font-medium`}
              >
                {SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label}
                <ChevronDown className="h-4 w-4 text-zinc-400" />
              </button>
              {sortOpen ? (
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
              ) : null}
            </div>

            <button
              onClick={() => setShowFilters((open) => !open)}
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

        {showFilters ? (
          <div className="cinema-surface mt-5 space-y-4 p-4 shadow-lg">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-zinc-400">
                Thu hẹp kết quả theo thể loại, giới hạn tuổi và trạng thái.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setGenre("Tất cả");
                    setRating("Tất cả");
                    setStatusFilter("Tất cả");
                  }}
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

            <div className="space-y-3">
              <p className="text-[13px] font-semibold text-zinc-300">
                Thể loại
              </p>
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
              <div className="space-y-3">
                <p className="text-[13px] font-semibold text-zinc-300">
                  Giới hạn tuổi
                </p>
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

              <div className="space-y-3">
                <p className="text-[13px] font-semibold text-zinc-300">
                  Trạng thái
                </p>
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
        ) : null}
      </section>

      <section className="mt-8">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,230px))] gap-3 sm:gap-4">
          {filteredMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} size="grid" />
          ))}
        </div>

        {filteredMovies.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/50 p-8 text-center text-zinc-400">
            Không có phim phù hợp. Hãy thử điều chỉnh bộ lọc hoặc tìm kiếm khác.
          </div>
        ) : null}
      </section>
    </div>
  );
}

export default MoviesPage;
