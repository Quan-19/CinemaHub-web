import { useState, useEffect } from "react";
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
  Heart,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MovieCard } from "../components/MovieCard";

// ========== RATING COLORS ==========
const ratingColors = {
  P: "#22c55e",
  T13: "#f59e0b",
  T16: "#f97316",
  T18: "#ef4444",
};

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
          const promoRes = await fetch("http://localhost:5000/api/promotions");
          const promoData = await promoRes.json();
          setPromotions(promoData);
        } catch {
          setPromotions([
            {
              id: 1,
              title: "Giảm 30% các suất chiếu sáng thứ 2-4",
              description: "Áp dụng cho tất cả các phim đang chiếu",
              code: "WED30",
              discount: "30%",
              image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400",
              expiry: "31/12/2024",
            },
            {
              id: 2,
              title: "Mua 2 vé tặng 1 combo bắp nước",
              description: "Chỉ áp dụng cho các suất chiếu từ 10h-14h",
              code: "CINE10",
              discount: "Combo",
              image: "https://images.unsplash.com/photo-1512149177596-f817c7ef5d4c?w=400",
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
    const t = setInterval(() => setHeroIndex((i) => (i + 1) % featured.length), 5000);
    return () => clearInterval(t);
  }, [featured.length]);

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

  if (!current && featured.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0f" }}>
        <div className="text-center">
          <p className="text-zinc-400 mb-4">Không có phim đang chiếu</p>
          <button onClick={() => navigate("/movies")} className="text-red-500 hover:underline">
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
            <img src={current?.backdrop} alt={current?.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{
              background: "linear-gradient(to right, rgba(10,10,15,0.95) 0%, rgba(10,10,15,0.6) 50%, rgba(10,10,15,0.2) 100%)",
            }} />
            <div className="absolute inset-0" style={{
              background: "linear-gradient(to top, rgba(10,10,15,1) 0%, transparent 50%)",
            }} />
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
                    <span className="rounded bg-cinema-primary px-2 py-0.5 text-xs font-semibold text-white">Đang chiếu</span>
                    {current?.genre?.slice(0, 2).map((g) => (
                      <span key={g} className="px-2 py-0.5 rounded text-xs text-zinc-300 bg-white/10 border border-white/20">{g}</span>
                    ))}
                  </div>
                  <h1 className="mb-2 text-3xl leading-tight font-extrabold text-white sm:text-5xl">{current?.title}</h1>
                  <p className="text-zinc-400 text-sm mb-1">{current?.originalTitle}</p>
                  <div className="mb-4 flex flex-wrap items-center gap-3 sm:gap-4">
                    <span className="flex items-center gap-1 text-yellow-400">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-bold">{current?.rating}/10</span>
                      <span className="text-zinc-400 text-xs">({current?.votes?.toLocaleString()} đánh giá)</span>
                    </span>
                    <span className="flex items-center gap-1 text-zinc-400 text-sm">
                      <Clock className="w-4 h-4" />
                      {current?.duration} phút
                    </span>
                    <span className={`rounded px-2 py-0.5 text-xs font-bold text-white ${
                      current?.rating === "T18" ? "bg-red-500" : current?.rating === "T16" ? "bg-orange-500" : current?.rating === "T13" ? "bg-amber-500" : "bg-green-500"
                    }`}>
                      {current?.rating}
                    </span>
                  </div>
                  <p className="text-zinc-400 text-sm mb-6 leading-relaxed line-clamp-3">{current?.description}</p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <button onClick={() => navigate(`/movies/${current?.movie_id}`)} className="cinema-btn-primary w-full justify-center sm:w-auto">
                      <Ticket className="w-4 h-4" /> Đặt vé ngay
                    </button>
                    <button onClick={() => navigate(`/movies/${current?.movie_id}`)} className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-white transition-colors hover:bg-white/20 sm:w-auto">
                      <Play className="w-4 h-4" fill="white" /> Xem trailer
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        <button onClick={() => setHeroIndex((i) => (i - 1 + featured.length) % featured.length)} className="absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white transition-colors hover:bg-black/60 sm:flex">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button onClick={() => setHeroIndex((i) => (i + 1) % featured.length)} className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white transition-colors hover:bg-black/60 sm:flex">
          <ChevronRight className="w-5 h-5" />
        </button>

        <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2 sm:bottom-6">
          {featured.map((_, i) => (
            <button key={i} onClick={() => setHeroIndex(i)} className={`rounded-full transition-all ${i === heroIndex ? "w-8 h-2 bg-red-500" : "w-2 h-2 bg-white/30 hover:bg-white/60"}`} />
          ))}
        </div>

        <div className="absolute bottom-6 right-6 hidden lg:flex gap-3">
          {featured.map((m, i) => (
            <button key={m.movie_id} onClick={() => setHeroIndex(i)} className={`w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${i === heroIndex ? "border-red-500 opacity-100" : "border-transparent opacity-50 hover:opacity-75"}`}>
              <img src={m.poster} alt={m.title} className="w-full h-full object-cover" />
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
              <h2 className="text-xl font-bold text-white"><Flame className="inline w-5 h-5 text-red-500 mr-1.5" />Phim Đang Chiếu</h2>
            </div>
            <button onClick={() => navigate("/movies")} className="flex items-center gap-1 text-sm text-zinc-400 transition-colors hover:text-white">
              Xem tất cả <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: "none" }}>
            {nowShowing.map((movie) => (<MovieCard key={movie.movie_id} movie={movie} size="md" />))}
          </div>
        </section>

        {/* QUICK BOOKING */}
        <section className="mt-10">
          <div className="cinema-surface bg-gradient-to-br from-[#1a0808] to-cinema-surface p-6 rounded-xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div><h3 className="text-lg font-bold text-white">Đặt vé nhanh</h3><p className="text-zinc-400 text-sm mt-0.5">Chọn phim, rạp và ghế ngay chỉ trong 3 bước</p></div>
              <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                {["Chọn phim", "Chọn suất", "Chọn ghế"].map((step, i) => (
                  <div key={step} className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cinema-primary text-xs font-bold text-white">{i + 1}</div>
                      <span className="text-zinc-300 text-sm">{step}</span>
                    </div>
                    {i < 2 && <ChevronRight className="w-4 h-4 text-zinc-600" />}
                  </div>
                ))}
                <button onClick={() => navigate("/movies")} className="cinema-btn-primary w-full justify-center px-5 py-2 sm:ml-2 sm:w-auto">Bắt đầu</button>
              </div>
            </div>
          </div>
        </section>

        {/* COMING SOON */}
        <section className="mt-10">
          <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2"><div className="w-1 h-6 rounded-full bg-yellow-500" /><h2 className="text-xl font-bold text-white"><CalendarDays className="inline w-5 h-5 text-yellow-500 mr-1.5" />Phim Sắp Chiếu</h2></div>
            <button onClick={() => navigate("/movies?status=coming-soon")} className="flex items-center gap-1 text-sm text-zinc-400 hover:text-white transition-colors">Xem tất cả <ArrowRight className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {comingSoon.map((movie) => (
              <div key={movie.movie_id} onClick={() => navigate(`/movies/${movie.movie_id}`)} className="group flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition-all hover:border-zinc-700 hover:bg-zinc-900 cursor-pointer sm:flex-row sm:gap-4">
                <img src={movie.poster} alt={movie.title} className="h-40 w-full rounded-lg object-cover sm:h-28 sm:w-20 sm:flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-0.5 rounded-full border border-yellow-500/30">Sắp chiếu</span>
                    <span className="text-zinc-500 text-xs">{movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString("vi-VN") : "Sắp ra mắt"}</span>
                  </div>
                  <h3 className="mb-1 text-sm font-semibold text-white transition-colors group-hover:text-red-400">{movie.title}</h3>
                  <p className="text-zinc-500 text-xs mb-2">{movie.originalTitle || ""}</p>
                  <div className="flex flex-wrap gap-1 mb-2">{movie.genre?.slice(0, 2).map((g) => (<span key={g} className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">{g}</span>))}</div>
                  <p className="text-zinc-400 text-xs line-clamp-2">{movie.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PROMOTIONS */}
        {promotions.length > 0 && (
          <section className="mt-10">
            <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2"><div className="w-1 h-6 rounded-full bg-green-500" /><h2 className="text-xl font-bold text-white"><Tag className="inline w-5 h-5 text-green-500 mr-1.5" />Khuyến Mãi Nổi Bật</h2></div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {promotions.map((promo) => (
                <div key={promo.id} className="cinema-surface cursor-pointer overflow-hidden rounded-xl transition-all hover:border-zinc-700">
                  <div className="relative h-36 overflow-hidden">
                    <img src={promo.image} alt={promo.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute right-3 top-3 rounded-lg bg-cinema-primary px-2 py-1 text-xs font-bold text-white">-{promo.discount}</div>
                  </div>
                  <div className="p-4">
                    <h3 className="mb-1 text-sm font-semibold text-white transition-colors hover:text-red-400">{promo.title}</h3>
                    <p className="text-zinc-400 text-xs mb-3 line-clamp-2">{promo.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1 flex items-center gap-2"><Tag className="w-3 h-3 text-red-500" /><span className="text-xs font-semibold text-zinc-300">{promo.code}</span></div>
                      <span className="text-zinc-500 text-xs">HSD: {promo.expiry}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA BANNER */}
        <section className="mt-10">
          <div className="relative overflow-hidden rounded-2xl" style={{ background: "linear-gradient(135deg, #1a0005, #0a0a0f)" }}>
            <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1757186202331-e72fee53815f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920)`, backgroundSize: "cover", backgroundPosition: "center" }} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(229,9,20,0.3) 0%, rgba(10,10,15,0.9) 100%)" }} />
            <div className="relative z-10 p-6 text-center sm:p-8 md:p-12">
              <h2 className="mb-3 text-2xl font-extrabold text-white sm:text-3xl">Tải ứng dụng CinemaHub</h2>
              <p className="text-zinc-300 mb-6 max-w-md mx-auto text-sm">Đặt vé, theo dõi phim yêu thích và nhận ưu đãi độc quyền mọi lúc mọi nơi</p>
              <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
                <button className="flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-zinc-100">
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11" /></svg>
                  App Store
                </button>
                <button className="flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-zinc-100">
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M3.18 23.76c.39.22.83.24 1.24.03L16.54 12 3.42.21C3.01 0 2.57.02 2.18.24 1.79.46 1.5.89 1.5 1.39v21.22c0 .5.29.93.68 1.15zm9.42-11.76L4.91 19.69 14.89 12zm2.2-1.39L5.16 4.59 14.8 12zM17.22 10.6l-2.12 1.4 2.12 1.4 2.68-1.4z" /></svg>
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
  const [liked, setLiked] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [movie, setMovie] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

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
          genre: data.genre || [],
          originalTitle: data.originalTitle || "",
          releaseDate: data.releaseDate || "",
          duration: data.duration || 120,
          director: data.director || "Đang cập nhật",
          cast: data.cast || [],
          language: data.language || "Tiếng Việt",
          country: data.country || "Việt Nam",
          status: data.status || "coming_soon",
        };

        setMovie(movieData);

        const allMoviesRes = await fetch("http://localhost:5000/api/movies");
        const allMovies = await allMoviesRes.json();
        const relatedMovies = allMovies
          .filter((m) => {
            const mId = m.movie_id || m.id;
            const movieGenre = movieData.genre || [];
            return mId !== movieData.movie_id && m.genre?.some(g => movieGenre.includes(g));
          })
          .slice(0, 4)
          .map((m) => ({ ...m, movie_id: m.movie_id || m.id, id: m.movie_id || m.id }));
        
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0f" }}>
        <div className="text-center"><div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div><p className="text-zinc-400">Đang tải thông tin phim...</p></div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0f" }}>
        <div className="text-center"><p className="text-zinc-400 mb-4">Không tìm thấy phim</p><button onClick={() => navigate("/movies")} className="text-red-500 hover:underline">Quay lại</button></div>
      </div>
    );
  }

  const handleBooking = () => navigate(`/booking/${movie.movie_id}`);
  const handleShare = async () => {
    const shareData = { title: movie.title, text: `Xem chi tiết phim ${movie.title} trên CinemaHub`, url: window.location.href };
    if (navigator.share) { try { await navigator.share(shareData); return; } catch (error) { console.error("Share failed", error); } }
    if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(shareData.url); alert("Đã sao chép link!"); }
  };

  const stars = Math.round(movie.score / 2);
  const voteCount = typeof movie.votes === "number" ? movie.votes.toLocaleString() : "0";
  const movieDetails = [
    { icon: Clock, label: "Thời lượng", value: movie.duration ? `${movie.duration} phút` : "Đang cập nhật" },
    { icon: Calendar, label: "Khởi chiếu", value: movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString("vi-VN") : "Đang cập nhật" },
    { icon: Globe, label: "Quốc gia", value: movie.country || "Đang cập nhật" },
    { icon: Globe, label: "Ngôn ngữ", value: movie.language || "Đang cập nhật" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0f" }}>
      <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <img src={movie.backdrop} alt={movie.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #0a0a0f 10%, rgba(10,10,15,0.4) 60%, rgba(10,10,15,0.2) 100%)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(10,10,15,0.6) 0%, transparent 60%)" }} />
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 sm:left-6 flex items-center gap-2 text-white bg-black/40 hover:bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-sm transition-colors">
          <ChevronLeft className="w-4 h-4" /> Quay lại
        </button>
        <div className="absolute top-4 right-4 sm:right-6 flex gap-2">
          <button onClick={() => setLiked(!liked)} className={`w-9 h-9 rounded-full bg-black/40 border border-white/10 flex items-center justify-center transition-colors ${liked ? "text-red-500" : "text-white hover:text-red-400"}`}>
            <Heart className="w-4 h-4" fill={liked ? "currentColor" : "none"} />
          </button>
          <button onClick={handleShare} className="w-9 h-9 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-white hover:text-zinc-200 transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10 pb-16">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-shrink-0"><div className="w-44 md:w-52 mx-auto lg:mx-0"><img src={movie.poster} alt={movie.title} className="w-full rounded-2xl shadow-2xl" style={{ aspectRatio: "2/3", objectFit: "cover" }} /></div></div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-2.5 py-1 rounded-lg text-xs text-white font-bold" style={{ background: movie.status === "now_showing" ? "#e50914" : "#f59e0b" }}>{movie.status === "now_showing" ? "Đang chiếu" : "Sắp chiếu"}</span>
              <span className="px-2.5 py-1 rounded-lg text-xs text-white font-bold" style={{ background: ratingColors[movie.rating] }}>{movie.rating}</span>
              {movie.genre?.map((g) => (<span key={g} className="px-2.5 py-1 rounded-lg text-xs bg-zinc-800 text-zinc-300 border border-zinc-700">{g}</span>))}
            </div>
            <h1 className="text-white mb-1 text-2xl md:text-3xl font-extrabold leading-tight">{movie.title}</h1>
            <p className="text-zinc-500 text-sm mb-4">{movie.originalTitle}</p>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex">{Array.from({ length: 5 }).map((_, i) => (<Star key={i} className="w-4 h-4" fill={i < stars ? "#facc15" : "none"} color={i < stars ? "#facc15" : "#52525b"} />))}</div>
                <span className="text-yellow-400 text-sm font-bold">{movie.score}/10</span><span className="text-zinc-500 text-xs">({voteCount} lượt)</span>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {movieDetails.map((detail) => { const IconComponent = detail.icon; return (
                <div key={detail.label} className="bg-zinc-900 rounded-xl p-3 border border-zinc-800">
                  <div className="flex items-center gap-1.5 mb-1"><IconComponent className="w-3.5 h-3.5 text-red-500" /><span className="text-zinc-500 text-xs">{detail.label}</span></div>
                  <p className="text-white text-sm font-semibold">{detail.value}</p>
                </div>
              )})}
            </div>
            <div className="mb-5"><h3 className="text-white mb-2 font-semibold">Nội dung phim</h3><p className="text-zinc-400 text-sm leading-relaxed">{movie.description}</p></div>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div><p className="text-zinc-500 text-xs mb-1.5 uppercase tracking-wider">Đạo diễn</p><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700"><User className="w-4 h-4 text-zinc-400" /></div><span className="text-white text-sm font-semibold">{movie.director}</span></div></div>
              <div><p className="text-zinc-500 text-xs mb-1.5 uppercase tracking-wider">Diễn viên</p><div className="flex flex-wrap gap-1">{movie.cast?.length > 0 ? movie.cast.map((actor) => (<span key={actor} className="bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded-lg border border-zinc-700">{actor}</span>)) : <span className="text-zinc-400 text-sm">Đang cập nhật</span>}</div></div>
            </div>
            <div className="flex flex-wrap gap-3">
              {movie.status === "now_showing" && (<button onClick={handleBooking} className="flex items-center gap-2 px-8 py-3 rounded-xl text-white transition-all hover:opacity-90 active:scale-95" style={{ background: "linear-gradient(135deg, #e50914, #b20710)" }}><Ticket className="w-4 h-4" />Đặt vé ngay</button>)}
              <button onClick={() => setShowTrailer(true)} className="flex items-center gap-2 px-8 py-3 rounded-xl text-white border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 transition-colors"><Play className="w-4 h-4" fill="white" />Xem trailer</button>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-12"><h2 className="text-white mb-6 text-xl font-bold">Phim liên quan</h2><div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>{related.map((m) => (<MovieCard key={m.movie_id} movie={m} />))}</div></div>
        )}
      </div>

      {showTrailer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowTrailer(false)}>
          <div className="relative w-full max-w-3xl mx-4 rounded-2xl overflow-hidden border border-zinc-700" onClick={(e) => e.stopPropagation()}>
            <div className="relative bg-zinc-900" style={{ paddingTop: "56.25%" }}>
              <div className="absolute inset-0 flex flex-col items-center justify-center"><Play className="w-16 h-16 text-red-500 mb-4" fill="currentColor" /><p className="text-zinc-400">Trailer: {movie.title}</p><p className="text-zinc-600 text-sm mt-1">(Demo - Trailer không khả dụng trong bản demo)</p></div>
            </div>
            <button onClick={() => setShowTrailer(false)} className="absolute top-3 right-3 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black">✕</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;