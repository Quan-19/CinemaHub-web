import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Clock,
  Play,
  Ticket,
  Tag,
  ArrowRight,
  Flame,
  CalendarDays,
  Calendar,
  Globe,
  User,
  Share2,
  MessageSquare,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MovieCard } from "../components/MovieCard";
import { ShowtimesTab, ReviewsTab } from "../components/movie/TabsHelper";

function normalizeList(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

// ========== HOME PAGE COMPONENT ==========
export const HomePage = () => {
  const navigate = useNavigate();

  const [heroIndex, setHeroIndex] = useState(0);
  const [nowShowing, setNowShowing] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const movieRes = await fetch("http://localhost:5000/api/movies");
        const movieData = await movieRes.json();

        const movies = movieData.map((m) => ({
          ...m,
          movie_id: m.movie_id || m.id,
          rating: m.rating || 0,
          score: m.rating || 0,
          votes: m.votes || Math.floor(Math.random() * 5000) + 1000,
          poster: m.poster,
          backdrop: m.backdrop || m.poster,
          description: m.description || "",
          genre: m.genre || [],
          originalTitle: m.originalTitle || "",
          releaseDate: m.releaseDate || "",
          duration: m.duration || 120,
        }));

        const now = movies.filter((m) => m.status === "now_showing");
        const soon = movies.filter((m) => m.status === "coming_soon");

        setNowShowing(now);
        setComingSoon(soon);

        // Fetch promotions
        try {
          const promoRes = await fetch(
            "http://localhost:5000/api/promotions?scope=public"
          );
          const promoPayload = await promoRes.json();
          const promoData = Array.isArray(promoPayload?.data)
            ? promoPayload.data
            : Array.isArray(promoPayload)
              ? promoPayload
              : [];
          setPromotions(promoData);
        } catch {
          setPromotions([
            {
              id: 1,
              title: "Giảm 30% các suất chiếu sáng thứ 2-4",
              description: "Áp dụng cho tất cả các phim đang chiếu",
              code: "WED30",
              discount: "30%",
              image:
                "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400",
              expiry: "31/12/2024",
            },
            {
              id: 2,
              title: "Mua 2 vé tặng 1 combo bắp nước",
              description: "Chỉ áp dụng cho các suất chiếu từ 10h-14h",
              code: "CINE10",
              discount: "Combo",
              image:
                "https://images.unsplash.com/photo-1512149177596-f817c7ef5d4c?w=400",
              expiry: "30/11/2024",
            },
          ]);
        }
      } catch (err) {
        console.error("Lỗi tải dữ liệu:", err);
        setNowShowing([]);
        setComingSoon([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const featured = nowShowing.slice(0, 3);
  const current = featured[heroIndex];

  useEffect(() => {
    if (featured.length === 0) return;
    const t = setInterval(
      () => setHeroIndex((i) => (i + 1) % featured.length),
      5000
    );
    return () => clearInterval(t);
  }, [featured.length]);

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

  if (!current && featured.length === 0) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--color-cinema-bg)" }}
      >
        <div className="text-center">
          <p className="text-zinc-400 mb-4">Không có phim đang chiếu</p>
          <button
            onClick={() => navigate("/movies")}
            className="text-red-500 hover:underline"
          >
            Xem phim sắp chiếu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cinema-bg text-zinc-100">
      {/* HERO SECTION */}
      <div className="relative h-[74vh] min-h-[460px] overflow-hidden sm:h-[70vh] sm:min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={current?.movie_id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <img
              src={current?.backdrop}
              alt={current?.title}
              className="w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to right, rgba(17,24,39,0.92) 0%, rgba(17,24,39,0.55) 50%, rgba(17,24,39,0.15) 100%)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(17,24,39,1) 0%, transparent 50%)",
              }}
            />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 flex items-end sm:items-center">
          <div className="mx-auto w-full px-3 pb-20 sm:px-6 sm:pb-0 lg:px-10 2xl:px-14">
            <div className="max-w-xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current?.movie_id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded bg-cinema-primary px-2 py-0.5 text-xs font-semibold text-white">
                      Đang chiếu
                    </span>
                    {current?.genre?.slice(0, 2).map((g) => (
                      <span
                        key={g}
                        className="px-2 py-0.5 rounded text-xs text-zinc-300 bg-white/10 border border-white/20"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                  <h1 className="mb-2 text-3xl leading-tight font-extrabold text-white sm:text-5xl">
                    {current?.title}
                  </h1>
                  <p className="text-zinc-400 text-sm mb-1">
                    {current?.originalTitle}
                  </p>
                  <div className="mb-4 flex flex-wrap items-center gap-3 sm:gap-4">
                    <span className="flex items-center gap-1 text-yellow-400">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-bold">{current?.rating}/10</span>
                      <span className="text-zinc-400 text-xs">
                        ({current?.votes?.toLocaleString()} đánh giá)
                      </span>
                    </span>
                    <span className="flex items-center gap-1 text-zinc-400 text-sm">
                      <Clock className="w-4 h-4" />
                      {current?.duration} phút
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-bold text-white ${current?.rating === "T18"
                        ? "bg-red-500"
                        : current?.rating === "T16"
                          ? "bg-orange-500"
                          : current?.rating === "T13"
                            ? "bg-amber-500"
                            : "bg-green-500"
                        }`}
                    >
                      {current?.rating}
                    </span>
                  </div>
                  <p className="text-zinc-400 text-sm mb-6 leading-relaxed line-clamp-3">
                    {current?.description}
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <button
                      onClick={() => navigate(`/movies/${current?.movie_id}`)}
                      className="cinema-btn-primary w-full justify-center sm:w-auto"
                    >
                      <Ticket className="w-4 h-4" /> Đặt vé ngay
                    </button>
                    <button
                      onClick={() => navigate(`/movies/${current?.movie_id}`)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-white transition-colors hover:bg-white/20 sm:w-auto"
                    >
                      <Play className="w-4 h-4" fill="white" /> Xem trailer
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        <button
          onClick={() =>
            setHeroIndex((i) => (i - 1 + featured.length) % featured.length)
          }
          className="absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white transition-colors hover:bg-black/60 sm:flex"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => setHeroIndex((i) => (i + 1) % featured.length)}
          className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white transition-colors hover:bg-black/60 sm:flex"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2 sm:bottom-6">
          {featured.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroIndex(i)}
              className={`rounded-full transition-all ${i === heroIndex
                ? "w-8 h-2 bg-red-500"
                : "w-2 h-2 bg-white/30 hover:bg-white/60"
                }`}
            />
          ))}
        </div>

        <div className="absolute bottom-6 right-6 hidden lg:flex gap-3">
          {featured.map((m, i) => (
            <button
              key={m.movie_id}
              onClick={() => setHeroIndex(i)}
              className={`w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${i === heroIndex
                ? "border-red-500 opacity-100"
                : "border-transparent opacity-50 hover:opacity-75"
                }`}
            >
              <img
                src={m.poster}
                alt={m.title}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="mx-auto w-full px-3 pb-14 sm:px-6 sm:pb-16 lg:px-10 2xl:px-14">
        {/* NOW SHOWING */}
        <section className="mt-10">
          <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <div className="h-6 w-1 rounded-full bg-cinema-primary" />
              <h2 className="text-xl font-bold text-white">
                <Flame className="inline w-5 h-5 text-red-500 mr-1.5" />
                Phim Đang Chiếu
              </h2>
            </div>
            <button
              onClick={() => navigate("/movies")}
              className="flex items-center gap-1 text-sm text-zinc-400 transition-colors hover:text-white"
            >
              Xem tất cả <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div
            className="scrollbar-hide flex gap-4 overflow-x-auto pb-4"
            style={{ scrollbarWidth: "none" }}
          >
            {nowShowing.map((movie) => (
              <MovieCard key={movie.movie_id} movie={movie} size="md" />
            ))}
          </div>
        </section>

        {/* QUICK BOOKING */}
        <section className="mt-10">
          <div className="cinema-surface bg-gradient-to-br from-[#1a0808] to-cinema-surface p-6 rounded-xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Đặt vé nhanh</h3>
                <p className="text-zinc-400 text-sm mt-0.5">
                  Chọn phim, rạp và ghế ngay chỉ trong 3 bước
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                {["Chọn phim", "Chọn suất", "Chọn ghế"].map((step, i) => (
                  <div key={step} className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cinema-primary text-xs font-bold text-white">
                        {i + 1}
                      </div>
                      <span className="text-zinc-300 text-sm">{step}</span>
                    </div>
                    {i < 2 && (
                      <ChevronRight className="w-4 h-4 text-zinc-400" />
                    )}
                  </div>
                ))}
                <button
                  onClick={() => navigate("/movies")}
                  className="cinema-btn-primary w-full justify-center px-5 py-2 sm:ml-2 sm:w-auto"
                >
                  Bắt đầu
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* COMING SOON */}
        <section className="mt-10">
          <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 rounded-full bg-yellow-500" />
              <h2 className="text-xl font-bold text-white">
                <CalendarDays className="inline w-5 h-5 text-yellow-500 mr-1.5" />
                Phim Sắp Chiếu
              </h2>
            </div>
            <button
              onClick={() => navigate("/movies?status=coming-soon")}
              className="flex items-center gap-1 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Xem tất cả <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {comingSoon.map((movie) => (
              <div
                key={movie.movie_id}
                onClick={() => navigate(`/movies/${movie.movie_id}`)}
                className="group flex flex-col gap-3 rounded-xl border border-zinc-700 bg-zinc-900/50 p-4 transition-all hover:border-zinc-700 hover:bg-zinc-900 cursor-pointer sm:flex-row sm:gap-4"
              >
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="h-40 w-full rounded-lg object-cover sm:h-28 sm:w-20 sm:flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-0.5 rounded-full border border-yellow-500/30">
                      Sắp chiếu
                    </span>
                    <span className="text-zinc-400 text-xs">
                      {movie.releaseDate
                        ? new Date(movie.releaseDate).toLocaleDateString(
                          "vi-VN"
                        )
                        : "Sắp ra mắt"}
                    </span>
                  </div>
                  <h3 className="mb-1 text-sm font-semibold text-white transition-colors group-hover:text-red-400">
                    {movie.title}
                  </h3>
                  <p className="text-zinc-400 text-xs mb-2">
                    {movie.originalTitle || ""}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {movie.genre?.slice(0, 2).map((g) => (
                      <span
                        key={g}
                        className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                  <p className="text-zinc-400 text-xs line-clamp-2">
                    {movie.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PROMOTIONS */}
        {promotions.length > 0 && (
          <section className="mt-10">
            <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 rounded-full bg-green-500" />
                <h2 className="text-xl font-bold text-white">
                  <Tag className="inline w-5 h-5 text-green-500 mr-1.5" />
                  Khuyến Mãi Nổi Bật
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {promotions.map((promo) => (
                <div
                  key={promo.id}
                  className="cinema-surface cursor-pointer overflow-hidden rounded-xl transition-all hover:border-zinc-700"
                >
                  <div className="relative h-36 overflow-hidden">
                    <img
                      src={promo.image}
                      alt={promo.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute right-3 top-3 rounded-lg bg-cinema-primary px-2 py-1 text-xs font-bold text-white">
                      -{promo.discount}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="mb-1 text-sm font-semibold text-white transition-colors hover:text-red-400">
                      {promo.title}
                    </h3>
                    <p className="text-zinc-400 text-xs mb-3 line-clamp-2">
                      {promo.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1 flex items-center gap-2">
                        <Tag className="w-3 h-3 text-red-500" />
                        <span className="text-xs font-semibold text-zinc-300">
                          {promo.code}
                        </span>
                      </div>
                      <span className="text-zinc-400 text-xs">
                        HSD: {promo.expiry}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA BANNER */}
        <section className="mt-10">
          <div
            className="relative overflow-hidden rounded-2xl"
            style={{
              background:
                "linear-gradient(135deg, #1a0005, var(--color-cinema-bg))",
            }}
          >
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `url(https://images.unsplash.com/photo-1757186202331-e72fee53815f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920)`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, rgba(229,9,20,0.3) 0%, rgba(17,24,39,0.9) 100%)",
              }}
            />
            <div className="relative z-10 p-6 text-center sm:p-8 md:p-12">
              <h2 className="mb-3 text-2xl font-extrabold text-white sm:text-3xl">
                Tải ứng dụng EbizCinema
              </h2>
              <p className="text-zinc-300 mb-6 max-w-md mx-auto text-sm">
                Đặt vé, theo dõi phim yêu thích và nhận ưu đãi độc quyền mọi lúc
                mọi nơi
              </p>
              <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
                <button className="flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-zinc-100">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5"
                    fill="currentColor"
                  >
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11" />
                  </svg>
                  App Store
                </button>
                <button className="flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-zinc-100">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5"
                    fill="currentColor"
                  >
                    <path d="M3.18 23.76c.39.22.83.24 1.24.03L16.54 12 3.42.21C3.01 0 2.57.02 2.18.24 1.79.46 1.5.89 1.5 1.39v21.22c0 .5.29.93.68 1.15zm9.42-11.76L4.91 19.69 14.89 12zm2.2-1.39L5.16 4.59 14.8 12zM17.22 10.6l-2.12 1.4 2.12 1.4 2.68-1.4z" />
                  </svg>
                  Google Play
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

// ========== MOVIE DETAIL PAGE COMPONENT ==========
export const MovieDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showTrailer, setShowTrailer] = useState(false);
  const [movie, setMovie] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  const tabsRef = useRef(null);
  const [activeTab, setActiveTab] = useState("info");
  const [showtimesList, setShowtimesList] = useState([]);
  const [reviewsList, setReviewsList] = useState([]);

  const handleViewShowtimes = () => {
    setActiveTab("showtimes");
    if (tabsRef.current) {
      tabsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const fetchMovieExtras = async () => {
    if (!id) return;
    try {
      const [resST, resRV, resCinemas] = await Promise.all([
        fetch(`http://localhost:5000/api/showtimes/movie/${id}`),
        fetch(`http://localhost:5000/api/reviews/movie/${id}`),
        fetch(`http://localhost:5000/api/cinemas`)
      ]);

      let stList = [];
      if (resST.ok) stList = await resST.json();
      if (resRV.ok) setReviewsList(await resRV.json());

      if (resCinemas.ok) {
        const cinemasData = await resCinemas.json();
        const cinemasList = Array.isArray(cinemasData?.data) ? cinemasData.data : (Array.isArray(cinemasData) ? cinemasData : []);

        stList = stList.map(st => {
          if (!st.cinemaAddress && !st.address && st.cinemaId) {
            const cinema = cinemasList.find(c => String(c.cinema_id) === String(st.cinemaId) || String(c.id) === String(st.cinemaId));
            if (cinema && cinema.address) {
              st.cinemaAddress = cinema.address;
            }
          }
          return st;
        });
      }

      setShowtimesList(stList);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMovieExtras();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const fetchMovie = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/movies/${id}`);
        const data = await res.json();

        const movieData = {
          ...data,
          movie_id: data.movie_id || data.id,
          id: data.movie_id || data.id,
          rating: data.rating || "P",
          score: data.ratingScore || data.rating || 0,
          votes: data.votes || Math.floor(Math.random() * 5000) + 1000,
          poster: data.poster,
          backdrop: data.backdrop || data.poster,
          description: data.description || "",
          genre: normalizeList(data.genre),
          originalTitle: data.originalTitle || "",
          releaseDate: data.releaseDate || "",
          duration: data.duration || 120,
          director: data.director || "Đang cập nhật",
          cast: normalizeList(data.cast),
          language: data.language || "Tiếng Việt",
          country: data.country || "Việt Nam",
          status: data.status || "coming_soon",
          trailer: data.trailer || "",
        };

        setMovie(movieData);

        const allMoviesRes = await fetch("http://localhost:5000/api/movies");
        const allMovies = await allMoviesRes.json();
        const relatedMovies = allMovies
          .filter((m) => {
            const mId = m.movie_id || m.id;
            const movieGenre = movieData.genre || [];
            const genres = normalizeList(m.genre);
            return (
              mId !== movieData.movie_id &&
              genres.some((g) => movieGenre.includes(g))
            );
          })
          .slice(0, 4)
          .map((m) => ({
            ...m,
            movie_id: m.movie_id || m.id,
            id: m.movie_id || m.id,
          }));

        setRelated(relatedMovies);
      } catch (err) {
        console.error("Lỗi tải phim:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchMovie();
  }, [id]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--color-cinema-bg)" }}
      >
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Đang tải thông tin phim...</p>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--color-cinema-bg)" }}
      >
        <div className="text-center">
          <p className="text-zinc-400 mb-4">Không tìm thấy phim</p>
          <button
            onClick={() => navigate("/movies")}
            className="text-red-500 hover:underline"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const handleBooking = () => navigate(`/booking/${movie.movie_id}`);
  const handleShare = async () => {
    const shareData = {
      title: movie.title,
      text: `Xem chi tiết phim ${movie.title} trên EbizCinema`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (error) {
        console.error("Share failed", error);
      }
    }
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareData.url);
      alert("Đã sao chép link!");
    }
  };

  const averageReviewScore = reviewsList.length > 0
    ? (reviewsList.reduce((acc, r) => acc + Number(r.rating), 0) / reviewsList.length)
    : (movie.score / 2);

  const displayScore = reviewsList.length > 0 ? parseFloat((averageReviewScore * 2).toFixed(1)) : parseFloat(movie.score).toFixed(1);
  const displayVotes = reviewsList.length > 0 ? reviewsList.length : (typeof movie.votes === "number" ? movie.votes : 0);

  const stars = Math.round(averageReviewScore);
  const voteCount = displayVotes.toLocaleString();
  const movieGenres = normalizeList(movie.genre);
  const movieCast = normalizeList(movie.cast);


  return (
    <div
      className="space-y-2 relative min-h-screen pb-16"
      style={{ background: "var(--color-cinema-bg)" }}
    >
      {/* Banner / Backdrop layer with masking */}
      <div className="relative left-1/2 -translate-x-1/2 lg:mt-[-100px] xl:mt-[-160px] 2xl:mt-[-200px] w-screen max-w-none pointer-events-none">
        <div className="aspect-[16/10] md:aspect-[2/1] xl:aspect-[21/9] w-full invisible pointer-events-none" />
        <div
          className="absolute top-0 left-0 w-full h-[125%] z-0 pointer-events-none overflow-hidden"
          style={{ background: "var(--color-cinema-bg)" }}
        >
          <div className="absolute top-0 left-0 w-full h-full">
            <img
              src={movie.backdrop}
              alt={movie.title}
              className="w-full h-full object-cover object-[50%_10%]"
            />
            <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-cinema-bg/80 via-cinema-bg/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-cinema-bg via-cinema-bg/80 to-transparent" />
          </div>
        </div>
        <div
          className="absolute top-full bottom-[-25%] left-0 w-full backdrop-blur-[6px] z-0 pointer-events-none"
          style={{
            background: "rgba(17, 24, 39, 0.7)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, black 30%)",
            maskImage: "linear-gradient(to bottom, transparent 0%, black 30%)",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col space-y-8 lg:space-y-12">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start md:-mt-32 lg:-mt-48 xl:-mt-64 relative z-20">
            <div className="w-36 sm:w-44 md:w-48 lg:w-56 shrink-0 overflow-hidden rounded-2xl sm:rounded-3xl border-4 border-zinc-900 shadow-[0_20px_50px_rgba(0,0,0,0.8)] bg-zinc-900 aspect-[2/3] ring-1 ring-white/10 relative z-30">
              <img
                src={movie.poster}
                alt={movie.title}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="space-y-4 flex-1 md:pt-4 drop-shadow-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="px-2.5 py-1 rounded-lg text-xs text-white font-bold"
                  style={{
                    background:
                      movie.status === "now_showing" ? "#e50914" : "#f59e0b",
                  }}
                >
                  {movie.status === "now_showing" ? "Đang chiếu" : "Sắp chiếu"}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-white drop-shadow-[0_2px_10px_rgba(0,0,0,1)] leading-tight">
                {movie.title}
              </h1>

              <p className="text-zinc-400 text-sm font-medium drop-shadow-md">
                Tên gốc: {movie.originalTitle}
              </p>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4"
                        fill={i < stars ? "#facc15" : "none"}
                        color={i < stars ? "#facc15" : "#52525b"}
                      />
                    ))}
                  </div>
                  <span className="text-yellow-400 text-sm font-bold">
                    {displayScore}/10
                  </span>
                  <span className="text-zinc-400 text-xs">
                    ({voteCount} lượt)
                  </span>
                </div>
              </div>

              {/* Information Cards Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-2">
                {[
                  { label: "Thời lượng", value: `${movie.duration} phút`, icon: Clock },
                  { label: "Khởi chiếu", value: movie.releaseDate, icon: CalendarDays },
                  { label: "Quốc gia", value: movie.country, icon: Globe },
                  { label: "Ngôn ngữ", value: movie.language, icon: MessageSquare }
                ].map((item, idx) => (
                  <div key={idx} className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-2 hover:bg-zinc-800/40 transition-colors">
                    <div className="flex items-center gap-2 text-zinc-500">
                      <item.icon className="w-4 h-4" />
                      <span className="text-[10px] uppercase tracking-wider font-bold">{item.label}</span>
                    </div>
                    <div className="text-white text-sm font-bold truncate">{item.value}</div>
                  </div>
                ))}
              </div>
              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1 border-b border-zinc-700 pb-5">
                {movie.status === "now_showing" && (
                  <button
                    onClick={handleBooking}
                    className="flex items-center gap-2 px-7 py-3 rounded-full font-bold text-white transition-all hover:-translate-y-[1px] active:scale-[0.98] shadow-[0_0_20px_rgba(229,9,20,0.3)] hover:shadow-[0_0_25px_rgba(229,9,20,0.5)] z-30"
                    style={{
                      background: "linear-gradient(135deg, #e50914, #b20710)",
                    }}
                  >
                    <Ticket className="w-4 h-4" />
                    Đặt vé ngay
                  </button>
                )}

                <button
                  onClick={() => setShowTrailer(true)}
                  className="flex items-center gap-2 px-7 py-3 rounded-full font-bold text-white border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 backdrop-blur-sm transition-colors z-30"
                >
                  <Play className="w-4 h-4" fill="white" />
                  Xem trailer
                </button>

                <button
                  onClick={handleViewShowtimes}
                  className="flex items-center gap-2 px-7 py-3 rounded-full font-bold text-white border border-zinc-700 bg-zinc-900/40 hover:bg-zinc-800 transition-colors z-30 shadow-sm"
                >
                  <Clock className="w-4 h-4" />
                  Xem suất chiếu
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center justify-center p-3 rounded-full bg-zinc-800/80 border border-zinc-700 text-white hover:bg-zinc-700 transition-colors z-30 shadow-sm"
                  title="Chia sẻ"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div ref={tabsRef} className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2 mb-8">
          <div className="flex gap-6 sm:gap-8 border-b border-zinc-800">
            {[{id: 'info', label: 'Thông tin', icon: <Info className="w-[18px] h-[18px]" />}, {id: 'showtimes', label: 'Suất chiếu', icon: <Clock className="w-[18px] h-[18px]" />}, {id: 'reviews', label: `Đánh giá (${reviewsList.length})`, icon: <Star className="w-[18px] h-[18px]" />}].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-4 px-2 font-bold text-[15px] transition-colors duration-200 relative ${activeTab === tab.id ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                {tab.icon}
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 w-full h-[3px] bg-red-600 rounded-t-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* TAB CONTENTS */}
        <AnimatePresence mode="wait">
        {activeTab === 'info' && (
          <motion.div
            key="info-content"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          >
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500 pb-10">
            <div className="space-y-8">
              {/* Nội dung phim */}
              <div>
                <h3 className="text-white text-lg font-bold mb-4">Nội dung phim</h3>
                <p className="text-zinc-300 leading-relaxed text-[15px] max-w-5xl">
                  {movie.description}
                </p>
              </div>

              {/* Đạo diễn & Diễn viên */}
              <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8">
                {/* Đạo diễn */}
                <div>
                  <h4 className="text-zinc-500 text-xs uppercase tracking-wider font-semibold mb-4">Đạo diễn</h4>
                  <div className="flex items-center gap-3 bg-[#111113] border border-zinc-800/60 rounded-2xl p-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-800/80 flex items-center justify-center border border-zinc-700/50 shrink-0">
                      <User className="w-5 h-5 text-zinc-500" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-bold">{movie.director}</p>
                      <p className="text-zinc-500 text-xs mt-0.5">Đạo diễn</p>
                    </div>
                  </div>
                </div>

                {/* Diễn viên */}
                {movieCast.length > 0 && (
                  <div>
                    <h4 className="text-zinc-500 text-xs uppercase tracking-wider font-semibold mb-4">Diễn viên</h4>
                    <div className="flex flex-wrap gap-3">
                      {movieCast.map((actor) => (
                        <div key={actor} className="flex items-center gap-2 bg-[#111113] border border-zinc-800/60 rounded-full py-2.5 px-4">
                          <div className="w-6 h-6 rounded-full bg-zinc-800/80 flex items-center justify-center shrink-0 border border-zinc-700/50">
                            <User className="w-3.5 h-3.5 text-zinc-500" />
                          </div>
                          <span className="text-zinc-300 text-[13px] font-semibold">{actor}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Specs Panel */}
              <div className="bg-[#111113] border border-zinc-800/60 rounded-3xl p-6 sm:p-8 flex flex-wrap lg:grid lg:grid-cols-4 gap-6 items-center">
                <div className="flex flex-col items-center justify-center min-w-[120px] mx-auto w-full lg:w-auto">
                  <p className="text-zinc-500 text-xs font-semibold mb-1">Điểm EbizCinema</p>
                  <p className="text-yellow-500 text-[26px] font-bold leading-tight">{displayScore}<span className="text-base text-yellow-500/80">/10</span></p>
                  <p className="text-zinc-500 text-[11px] mt-1">{voteCount} votes</p>
                </div>

                <div className="flex flex-col items-center justify-center min-w-[120px] mx-auto w-full lg:w-auto lg:border-l border-zinc-800/60 lg:pl-6">
                  <p className="text-zinc-500 text-xs font-semibold mb-1">User Reviews</p>
                  <p className="text-green-500 text-[26px] font-bold leading-tight">{reviewsList.length > 0 ? (reviewsList.reduce((acc, r) => acc + Number(r.rating), 0) / reviewsList.length).toFixed(1) : 0}</p>
                  <p className="text-zinc-500 text-[11px] mt-1">{reviewsList.length} đánh giá</p>
                </div>

                <div className="flex flex-col items-center justify-center min-w-[120px] mx-auto w-full lg:w-auto lg:border-l border-zinc-800/60 lg:pl-6">
                  <p className="text-zinc-500 text-xs font-semibold mb-2">Thể loại</p>
                  <div className="flex flex-wrap items-center justify-center gap-1.5 min-h-[30px]">
                    {movieGenres.slice(0, 2).map((g) => (
                      <span key={g} className="text-[#c084fc] font-extrabold text-[15px] leading-tight">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center min-w-[120px] mx-auto w-full lg:w-auto lg:border-l border-zinc-800/60 lg:pl-6">
                  <p className="text-zinc-500 text-xs font-semibold mb-1">Giới hạn tuổi</p>
                  <p className="text-red-500 text-[26px] font-bold leading-tight uppercase">{movie.ageRating || "T18"}</p>
                  <p className="text-zinc-500 text-[11px] mt-1">Từ 18 tuổi</p>
                </div>
              </div>
            </div>

            {related.length > 0 && (
              <div className="mt-12 space-y-4">
                <div className="flex items-center gap-3">
                  <p className="text-sm uppercase tracking-[0.14em] text-zinc-400 font-bold">
                    Phim liên quan
                  </p>
                </div>
                <div
                  className="flex overflow-x-auto gap-4 pb-4 snap-x pointer-events-auto"
                  style={{ scrollbarWidth: "none" }}
                >
                  {related.map((m) => (
                    <div
                      key={m.movie_id}
                      className="min-w-[140px] sm:min-w-[160px] snap-start"
                    >
                      <MovieCard movie={m} size="sm" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

        {activeTab === 'showtimes' && (
          <motion.div
            key="showtimes-content"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          >
            <ShowtimesTab showtimes={showtimesList} />
          </motion.div>
        )}
        {activeTab === 'reviews' && (
          <motion.div
            key="reviews-content"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          >
            <ReviewsTab movieId={id} reviews={reviewsList} onReviewSubmit={fetchMovieExtras} />
          </motion.div>
        )}
        </AnimatePresence>
      </div>

      {showTrailer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setShowTrailer(false)}
        >
          <div
            className="relative w-full max-w-3xl mx-4 rounded-2xl overflow-hidden border border-zinc-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative bg-zinc-900"
              style={{ paddingTop: "56.25%" }}
            >
              {(() => {
                const extractYouTubeId = (url) => {
                  if (!url) return null;
                  const regExp =
                    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                  const match = url.match(regExp);
                  return match && match[2].length === 11 ? match[2] : null;
                };
                const youtubeId = extractYouTubeId(movie?.trailer);

                if (youtubeId) {
                  return (
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
                      title={`Trailer: ${movie.title}`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    ></iframe>
                  );
                }
                return (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Play
                      className="w-16 h-16 text-red-500 mb-4"
                      fill="currentColor"
                    />
                    <p className="text-zinc-400">Trailer: {movie.title}</p>
                    <p className="text-zinc-400 text-sm mt-1">
                      (Phim chưa cập nhật trailer hợp lệ)
                    </p>
                  </div>
                );
              })()}
            </div>
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute top-3 right-3 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black z-10"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetailPage;
