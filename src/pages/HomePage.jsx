import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MovieCard } from "../components/MovieCard";

const HomePage = () => {
  const navigate = useNavigate();

  // ========== STATE ==========
  const [heroIndex, setHeroIndex] = useState(0);
  const [nowShowing, setNowShowing] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  // ========== FETCH DATA FROM API (Code 1) ==========
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch movies
        const movieRes = await fetch("http://localhost:5000/api/movies");
        const movieData = await movieRes.json();

        // Map movies với đầy đủ fields
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

        // Phân loại phim (GIỮ underscore từ Code 1)
        const now = movies.filter((m) => m.status === "now_showing");
        const soon = movies.filter((m) => m.status === "coming_soon");

        setNowShowing(now);
        setComingSoon(soon);

        // Try to fetch promotions (optional)
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
          // Fallback promotions data (từ Code 2)
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
        // Fallback nếu API lỗi
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

  // ========== AUTO SLIDE (Code 1) ==========
  useEffect(() => {
    if (featured.length === 0) return;
    const t = setInterval(
      () => setHeroIndex((i) => (i + 1) % featured.length),
      5000
    );
    return () => clearInterval(t);
  }, [featured.length]);

  // ========== LOADING STATE ==========
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
      {/* ========== HERO SECTION (Kết hợp UI Code 2 + Data Code 1) ========== */}
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
            {/* Gradient overlays */}
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

        {/* Hero Content */}
        <div className="absolute inset-0 flex items-end sm:items-end">
          <div className="mx-auto w-full px-3 pb-12 sm:px-6 sm:pb-16 lg:px-10 2xl:px-14">
            <div className="max-w-xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current?.movie_id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Badges */}
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded bg-cinema-primary px-2 py-0.5 text-xs font-semibold text-white">
                      Đang chiếu
                    </span>
                  </div>

                  <h1 className="mb-2 text-3xl leading-tight font-extrabold text-white sm:text-5xl">
                    {current?.title}
                  </h1>
                  <p className="text-zinc-400 text-sm mb-1">
                    {current?.originalTitle}
                  </p>

                  <div className="mb-3 flex flex-wrap items-center gap-3 sm:gap-4">
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
                      className={`rounded px-2 py-0.5 text-xs font-bold text-white ${
                        current?.rating === "T18"
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

                  {current?.description && (
                    <p className="text-zinc-400 text-sm mb-4 leading-relaxed line-clamp-3">
                      {current?.description}
                    </p>
                  )}

                  {/* Genre Badges (Moved here) */}
                  <div className="mb-5 flex flex-wrap items-center gap-2">
                    {current?.genre?.slice(0, 3).map((g) => (
                      <span
                        key={g}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-300 bg-white/5 border border-white/10 backdrop-blur-sm"
                      >
                        {g}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <button
                      onClick={() => navigate(`/movies/${current?.movie_id}`)}
                      className="cinema-btn-primary w-full justify-center sm:w-auto"
                    >
                      <Ticket className="w-4 h-4" />
                      Đặt vé ngay
                    </button>
                    <button
                      onClick={() => navigate(`/movies/${current?.movie_id}`)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-white transition-colors hover:bg-white/20 sm:w-auto"
                    >
                      <Play className="w-4 h-4" fill="white" />
                      Xem trailer
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Slider controls */}
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

        {/* Dots indicator */}
        <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2 sm:bottom-6">
          {featured.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroIndex(i)}
              className={`rounded-full transition-all ${
                i === heroIndex
                  ? "w-8 h-2 bg-red-500"
                  : "w-2 h-2 bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}
        </div>

        {/* Thumbnail strip */}
        <div className="absolute bottom-6 right-6 hidden lg:flex gap-3">
          {featured.map((m, i) => (
            <button
              key={m.movie_id}
              onClick={() => setHeroIndex(i)}
              className={`w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                i === heroIndex
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

      {/* ========== MAIN CONTENT ========== */}
      <div className="mx-auto w-full px-3 pb-14 sm:px-6 sm:pb-16 lg:px-10 2xl:px-14">
        {/* NOW SHOWING SECTION */}
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

        {/* QUICK BOOKING STRIP (Code 2) */}
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

        {/* COMING SOON SECTION (Kết hợp UI Code 2 + Data Code 1) */}
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
          <div
            className="scrollbar-hide flex gap-4 overflow-x-auto pb-4"
            style={{ scrollbarWidth: "none" }}
          >
            {comingSoon.map((movie) => (
              <MovieCard key={movie.movie_id} movie={movie} size="md" />
            ))}
          </div>
        </section>

        {/* PROMOTIONS SECTION */}
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
              <button
                onClick={() => navigate("/promotions")}
                className="flex items-center gap-1.5 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
              >
                Xem tất cả <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {promotions.slice(0, 4).map((promo) => (
                <div
                  key={promo.id}
                  className="group rounded-2xl overflow-hidden border border-zinc-700 hover:border-zinc-700 transition-all hover:-translate-y-1 duration-300"
                  style={{ background: "var(--color-cinema-surface)" }}
                >
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={promo.image}
                      alt={promo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div
                      className="absolute top-3 right-3 px-3 py-1.5 rounded-lg text-white text-sm font-bold shadow-lg"
                      style={{ background: "var(--color-cinema-primary)" }}
                    >
                      -{promo.discount_percent || promo.discount}%
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-white mb-2 line-clamp-1 text-base font-bold group-hover:text-red-400 transition-colors">
                      {promo.title}
                    </h3>
                    <p className="text-zinc-400 text-sm mb-4 line-clamp-2 leading-relaxed">
                      {promo.description}
                    </p>

                    <div className="flex items-center gap-2 mb-3 text-zinc-400 text-xs">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Hạn sử dụng: {promo.expiry}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-zinc-900 border border-dashed border-zinc-600 rounded-xl px-4 py-2.5 flex items-center gap-2 group-hover:border-red-500/50 transition-colors">
                        <Tag className="w-4 h-4 text-red-500 shrink-0" />
                        <span className="text-white text-sm tracking-wider font-bold">
                          {promo.code}
                        </span>
                      </div>
                      <button
                        onClick={() => navigate("/promotions")}
                        className="w-10 h-10 rounded-xl bg-zinc-700 hover:bg-zinc-600 flex items-center justify-center transition-all"
                      >
                        <ArrowRight className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA BANNER (Code 2) */}
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

export default HomePage;
