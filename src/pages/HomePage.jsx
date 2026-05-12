import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  ChevronDown,
  Star,
  Clock,
  Play,
  Ticket,
  Tag,
  ArrowRight,
  Flame,
  CalendarDays,
  Sparkles,
  Gift,
  MapPin,
  X,
  Film,
  TrendingUp,
  Newspaper,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ========== HELPER FUNCTIONS ==========
// Hàm extract YouTube ID từ nhiều dạng URL khác nhau
const extractYouTubeId = (url) => {
  if (!url) return null;
  
  // Các dạng URL YouTube hỗ trợ
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&?#]+)/,
    /youtube\.com\/watch\?.*[?&]v=([^&?#]+)/,
    /youtube\.com\/shorts\/([^/?]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
};

// ========== COMPONENTS ==========

// Premium Movie Card Component
const PremiumMovieCard = ({ movie, index }) => {
  const navigate = useNavigate();
  const isNowShowing =
    movie.status === "now_showing" || movie.status === "now-showing";
  const movieId = movie.movie_id ?? movie.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      whileHover={{ y: -8 }}
      className="group relative w-[200px] md:w-[220px] flex-shrink-0 cursor-pointer"
      onClick={() => navigate(`/movies/${movieId}`)}
    >
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl">
        <motion.img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.4 }}
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/300x450?text=No+Image";
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute top-3 left-3 z-10">
          <span
            className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase backdrop-blur-md ${
              isNowShowing
                ? "bg-red-500/90 text-white"
                : "bg-yellow-500/90 text-black"
            }`}
          >
            {isNowShowing ? "Đang chiếu" : "Sắp chiếu"}
          </span>
        </div>

        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm">
          <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
          <span className="text-white text-xs font-bold">
            {movie.rating ? (movie.rating / 2).toFixed(1) : (movie.score / 2).toFixed(1) || "0.0"}
          </span>
        </div>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/60 backdrop-blur-sm">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/movies/${movieId}`);
            }}
            className="px-4 py-2 rounded-full bg-red-600 text-white text-sm font-bold flex items-center gap-2 transform scale-90 group-hover:scale-100 transition-transform"
          >
            <Ticket className="w-4 h-4" />
            {isNowShowing ? "Đặt vé" : "Chi tiết"}
          </button>
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <h3 className="text-white font-bold text-base line-clamp-1 group-hover:text-red-500 transition-colors">
          {movie.title}
        </h3>
        <p className="text-zinc-500 text-xs line-clamp-1">
          {movie.originalTitle || movie.title}
        </p>
        <div className="flex items-center gap-3 text-zinc-400 text-xs">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{movie.duration} phút</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-zinc-600" />
          <div className="flex items-center gap-1">
            <span>{movie.genre?.[0] || "Phim"}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Skeleton Loader Components
const MovieCardSkeleton = () => (
  <div className="w-[200px] md:w-[220px] flex-shrink-0">
    <div className="aspect-[2/3] rounded-2xl bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 animate-pulse" />
    <div className="mt-3 space-y-2">
      <div className="h-4 bg-zinc-800 rounded-lg w-3/4 animate-pulse" />
      <div className="h-3 bg-zinc-800 rounded-lg w-1/2 animate-pulse" />
      <div className="h-3 bg-zinc-800 rounded-lg w-2/3 animate-pulse" />
    </div>
  </div>
);

const HeroSkeleton = () => (
  <div className="h-[70vh] bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 animate-pulse" />
);

// Animated Section Component
const AnimatedSection = ({
  children,
  className,
  delay = 0,
  direction = "up",
}) => {
  const [inView, setInView] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const variants = {
    hidden: {
      opacity: 0,
      y: direction === "up" ? 50 : direction === "down" ? -50 : 0,
      x: direction === "left" ? -50 : direction === "right" ? 50 : 0,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: { duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] },
    },
  };

  return (
    <motion.div
      ref={sectionRef}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Glow Card Component
const GlowCard = ({ children, className, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`group relative rounded-2xl overflow-hidden cursor-pointer ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          boxShadow:
            "inset 0 0 0 1px rgba(229,9,20,0.5), 0 0 20px rgba(229,9,20,0.2)",
        }}
      />
      {children}
    </motion.div>
  );
};

// Parallax Hero Component
const ParallaxHero = ({ movie, onBook, onTrailer }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  if (!movie) return null;

  return (
    <div ref={ref} className="relative h-[85vh] min-h-[600px] overflow-hidden">
      <motion.div style={{ y, scale: 1.1 }} className="absolute inset-0">
        <img
          src={movie.backdrop || movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover object-center"
          onError={(e) => {
            e.target.src =
              "https://via.placeholder.com/1920x1080?text=No+Image";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20" />
      </motion.div>

      <motion.div
        style={{ opacity }}
        className="relative h-full flex items-center"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-2xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 backdrop-blur-sm border border-red-500/30 mb-4"
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-semibold text-red-400">
                ĐANG CHIẾU
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-3 leading-[1.05] tracking-tight"
            >
              {movie.title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-zinc-300 text-base md:text-lg mb-6 line-clamp-2"
            >
              {movie.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-wrap gap-4"
            >
              <button
                onClick={onBook}
                className="px-6 md:px-8 py-3 md:py-4 rounded-full font-bold text-white relative overflow-hidden group"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 rounded-full" />
                <span className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center gap-2">
                  <Ticket className="w-4 h-4 md:w-5 md:h-5" />
                  Đặt vé ngay
                </span>
              </button>

              <button
                onClick={onTrailer}
                className="px-6 md:px-8 py-3 md:py-4 rounded-full font-bold text-white border border-white/30 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 flex items-center gap-2 group"
              >
                <Play className="w-4 h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
                Xem trailer
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="flex flex-wrap gap-4 mt-6 md:mt-8"
            >
              <div className="flex items-center gap-2 text-zinc-300">
                <Star className="w-4 h-4 md:w-5 md:h-5 fill-yellow-500 text-yellow-500" />
                <span className="font-semibold">
                  {movie.rating ? (movie.rating / 2).toFixed(1) : (movie.score / 2).toFixed(1) || "0.0"}/5
                </span>
                <span className="text-xs md:text-sm text-zinc-400">
                  ({movie.votes?.toLocaleString() || "0"} đánh giá)
                </span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <Clock className="w-4 h-4 md:w-5 md:h-5" />
                <span>{movie.duration} phút</span>
              </div>
              <div
                className={`px-2 md:px-3 py-1 rounded-full text-xs font-bold ${
                  movie.age_rating === "T18"
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : movie.age_rating === "T16"
                      ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                      : "bg-green-500/20 text-green-400 border border-green-500/30"
                }`}
              >
                {movie.age_rating || "T13"}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2 text-zinc-400 text-xs">
          <span>Kéo xuống để khám phá</span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

// Cinema Card Component
const CinemaCard = ({ cinema }) => {
  const navigate = useNavigate();
  const brandColors = {
    EbizCinema: '#c9a0a2',
  };
  const color = brandColors[cinema.brand] || "#e50914";
  const cinemaId = cinema.cinema_id ?? cinema.id;

  const handleClick = () => {
    if (cinemaId) {
      navigate(`/cinemas?cinemaId=${cinemaId}`);
    }
  };

  return (
    <GlowCard
      className="bg-cinema-surface border border-white/10 p-4"
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
          style={{ background: color }}
        >
          {cinema.brand?.[0] || "C"}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-sm mb-1 line-clamp-1">
            {cinema.name}
          </h3>
          <p className="text-zinc-500 text-xs line-clamp-2">{cinema.address}</p>
        </div>
        <div className="shrink-0 self-center">
          <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
        </div>
      </div>
    </GlowCard>
  );
};

// Home Promotion Card Component
const HomePromotionCard = ({ promo, index }) => {
  const navigate = useNavigate();
  
  const getDiscountDisplay = (promo) => {
    const discountType = promo.discount_type || "percent";
    const discountPercent = Number(promo.discount_percent ?? 0);
    const discountValue = Number(promo.discount_value ?? 0);

    if (discountType === "percent") {
      const pct = discountPercent || discountValue || 0;
      return `-${pct}%`;
    } else if (discountType === "value" || discountType === "fixed") {
      const value = discountValue || discountPercent || 0;
      return `-${value.toLocaleString()}đ`;
    }
    return "Ưu đãi";
  };

  const formatDate = (value) => {
    if (!value) return "Hết hạn sớm";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Hết hạn sớm";
    return date.toLocaleDateString("vi-VN");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      onClick={() => navigate("/promotions#promotions-list")}
      className="group relative cursor-pointer"
    >
      <div className="relative flex flex-col sm:flex-row rounded-2xl overflow-hidden bg-zinc-900/50 border border-white/5 backdrop-blur-md group-hover:border-red-500/30 transition-all duration-500">
        {/* Left Side - Discount Badge */}
        <div className="w-full sm:w-24 h-20 sm:h-auto shrink-0 flex items-center justify-center bg-zinc-800/30 relative">
          <div className="absolute inset-0 opacity-5">
             <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '10px 10px' }}></div>
          </div>
          <div className="relative z-10 flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-red-600 text-white shadow-lg rotate-[-5deg] group-hover:rotate-0 transition-transform duration-500">
            <span className="text-[8px] font-black uppercase leading-none opacity-80">Giảm</span>
            <span className="text-sm font-black leading-none">{getDiscountDisplay(promo).replace('-', '')}</span>
          </div>
        </div>

        {/* Divider Dash */}
        <div className="hidden sm:flex flex-col items-center justify-center px-1 relative">
          <div className="absolute -top-2 w-4 h-4 bg-cinema-bg rounded-full border border-white/5"></div>
          <div className="w-[1px] h-full border-l border-dashed border-white/20"></div>
          <div className="absolute -bottom-2 w-4 h-4 bg-cinema-bg rounded-full border border-white/5"></div>
        </div>

        {/* Right Side - Content */}
        <div className="flex-1 p-4 flex flex-col justify-center min-w-0">
          <div className="flex items-center justify-between mb-1">
             <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">{promo.cinema_id ? "Tại rạp" : "Hệ thống"}</span>
             <span className="text-[8px] font-medium text-zinc-600 flex items-center gap-0.5"><Clock className="w-2 h-2" /> {formatDate(promo.end_date)}</span>
          </div>
          <h3 className="text-white font-bold text-sm mb-1 group-hover:text-red-500 transition-colors line-clamp-1">
            {promo.title}
          </h3>
          <p className="text-zinc-500 text-[11px] line-clamp-1 mb-2">
            {promo.description}
          </p>
          <div className="flex items-center gap-2">
             <div className="flex-1 px-2 py-1 bg-black/40 border border-white/5 rounded-lg text-[10px] font-mono font-bold text-zinc-400 tracking-wider">
                {promo.code}
             </div>
             <div className="text-[10px] font-bold text-red-500 group-hover:translate-x-1 transition-transform">Lấy mã →</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ========== MAIN HOMEPAGE COMPONENT ==========
const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [heroIndex, setHeroIndex] = useState(0);
  const [allMovies, setAllMovies] = useState([]);
  const [nowShowing, setNowShowing] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [selectedTrailerMovie, setSelectedTrailerMovie] = useState(null);
  const autoSlideRef = useRef(null);

  // Fetch all data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch movies
        const movieRes = await fetch(`${API_BASE_URL}/api/movies`);
        const movieData = await movieRes.json();
        const movies = Array.isArray(movieData)
          ? movieData
          : movieData.data || [];

        const formattedMovies = movies.map((m) => {
          const rawStatus = String(m.status || "").toLowerCase();
          const normalizedStatus = rawStatus.replace(/-/g, "_");
          const ratingScore = Number(
            m.rating_score ?? m.ratingScore ?? m.rating ?? 0,
          );
          const reviewCount = Number(m.reviewCount ?? m.review_count ?? 0);
          const tickets = Number(m.tickets ?? 0);
          const views = Number(m.views ?? 0);

          return {
            ...m,
            movie_id: m.movie_id || m.id,
            rating: Number.isFinite(ratingScore) ? ratingScore : 0,
            score: Number.isFinite(ratingScore) ? ratingScore : 0,
            votes: Number.isFinite(Number(m.votes))
              ? Number(m.votes)
              : Number.isFinite(reviewCount) && reviewCount > 0
                ? reviewCount
                : Number.isFinite(tickets)
                  ? tickets
                  : 0,
            poster: m.poster,
            backdrop: m.backdrop || m.poster,
            description: m.description || "",
            genre: Array.isArray(m.genre)
              ? m.genre
              : m.genre?.split(",").map((g) => g.trim()) || [],
            originalTitle: m.original_title || m.originalTitle || "",
            releaseDate: m.release_date || m.releaseDate || "",
            duration: m.duration || 120,
            age_rating: m.age_rating || m.ageRating || "T13",
            trailer: m.trailer || "",
            status: normalizedStatus,
            created_at: m.created_at || m.createdAt,
            tickets: Number.isFinite(tickets) ? tickets : 0,
            views: Number.isFinite(views) ? views : 0,
          };
        });

        setAllMovies(formattedMovies);

        setNowShowing(
          formattedMovies.filter(
            (m) => m.status === "now_showing" || m.status === "now-showing",
          ),
        );
        setComingSoon(
          formattedMovies.filter(
            (m) => m.status === "coming_soon" || m.status === "coming-soon",
          ),
        );

        // Fetch promotions
        try {
          const promoRes = await fetch(
            `${API_BASE_URL}/api/promotions?scope=public`,
          );
          const promoPayload = await promoRes.json();
          const promoData = Array.isArray(promoPayload?.data)
            ? promoPayload.data
            : Array.isArray(promoPayload)
              ? promoPayload
              : [];
          setPromotions(promoData);
        } catch (err) {
          console.error("Error fetching promotions:", err);
          setPromotions([]);
        }

        // Fetch cinemas
        try {
          const cinemaRes = await fetch(`${API_BASE_URL}/api/cinemas`);
          const cinemaPayload = await cinemaRes.json();
          const cinemaData = Array.isArray(cinemaPayload)
            ? cinemaPayload
            : cinemaPayload.data || [];
          // Filter active cinemas and take first 4
          const activeCinemas = cinemaData
            .filter((c) => c.status !== "inactive")
            .slice(0, 4);
          setCinemas(activeCinemas);
        } catch (err) {
          console.error("Error fetching cinemas:", err);
          setCinemas([]);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const featured = nowShowing.slice(0, 5);
  const currentHero = featured[heroIndex];

  const cinemaNewsItems = [...(allMovies || [])]
    .filter((m) => m && (m.title || m.movie_id))
    .sort((a, b) => {
      const aTime = Date.parse(a.created_at || a.releaseDate || 0) || 0;
      const bTime = Date.parse(b.created_at || b.releaseDate || 0) || 0;
      return bTime - aTime;
    })
    .slice(0, 3);

  // Auto slide
  useEffect(() => {
    if (featured.length === 0) return;
    autoSlideRef.current = setInterval(() => {
      setHeroIndex((i) => (i + 1) % featured.length);
    }, 6000);
    return () => {
      if (autoSlideRef.current) clearInterval(autoSlideRef.current);
    };
  }, [featured.length]);

  const handleTrailer = (movie) => {
    if (movie?.trailer) {
      setSelectedTrailerMovie(movie);
      setShowTrailerModal(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cinema-bg">
        <HeroSkeleton />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-center mb-6">
            <div className="h-8 w-48 bg-zinc-800 rounded-lg animate-pulse" />
            <div className="h-10 w-24 bg-zinc-800 rounded-lg animate-pulse" />
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {[...Array(6)].map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!currentHero && featured.length === 0 && nowShowing.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cinema-bg">
        <div className="text-center">
          <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-6xl mb-4"
          >
            🎬
          </motion.div>
          <p className="text-zinc-400 mb-4">Không có phim đang chiếu</p>
          <button
            onClick={() => navigate("/movies")}
            className="px-6 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
          >
            Xem phim sắp chiếu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cinema-bg">
      {/* Hero Section */}
      {currentHero && (
        <ParallaxHero
          movie={currentHero}
          onBook={() => navigate(`/movies/${currentHero?.movie_id}`)}
          onTrailer={() => handleTrailer(currentHero)}
        />
      )}

      {/* Slider Navigation Dots */}
      {featured.length > 1 && (
        <div
          className="absolute left-1/2 -translate-x-1/2 z-20"
          style={{ top: "75vh" }}
        >
          <div className="flex gap-2">
            {featured.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  if (autoSlideRef.current) clearInterval(autoSlideRef.current);
                  setHeroIndex(i);
                  autoSlideRef.current = setInterval(() => {
                    setHeroIndex((idx) => (idx + 1) % featured.length);
                  }, 6000);
                }}
                className={`transition-all duration-300 rounded-full ${
                  i === heroIndex
                    ? "w-8 h-2 bg-red-500"
                    : "w-2 h-2 bg-white/30 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 mt-16 md:mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Quick Booking Bar */}
          {nowShowing.length > 0 && (
            <AnimatedSection>
              <GlowCard className="bg-gradient-to-r from-red-900/20 to-red-800/5 border border-red-500/20 rounded-2xl p-5 mb-12 backdrop-blur-xl">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="text-white font-bold text-lg">
                        Đặt vé nhanh chóng
                      </h3>
                      <p className="text-zinc-400 text-sm">
                        Chỉ 3 bước đơn giản để có vé xem phim
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    {["Chọn phim", "Chọn suất", "Chọn ghế"].map((step, i) => (
                      <div key={step} className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white text-sm font-bold">
                          {i + 1}
                        </div>
                        <span className="text-zinc-300 text-sm hidden sm:inline">
                          {step}
                        </span>
                        {i < 2 && (
                          <ChevronRightIcon className="w-4 h-4 text-zinc-500 ml-1 hidden sm:block" />
                        )}
                      </div>
                    ))}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate("/movies")}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-bold hover:shadow-lg hover:shadow-red-500/25 transition-all"
                    >
                      Bắt đầu ngay
                    </motion.button>
                  </div>
                </div>
              </GlowCard>
            </AnimatedSection>
          )}

          {/* Now Showing Section */}
          {nowShowing.length > 0 && (
            <AnimatedSection>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-8 rounded-full bg-red-500" />
                  <h2 className="text-xl md:text-2xl font-bold text-white">
                    Phim Đang Chiếu
                  </h2>
                </div>
                <motion.button
                  whileHover={{ x: 5 }}
                  onClick={() => navigate("/movies?status=now-showing")}
                  className="text-zinc-400 hover:text-white text-sm flex items-center gap-1 transition-colors group"
                >
                  Xem tất cả
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>

              <div className="flex gap-5 overflow-x-auto pb-6 scrollbar-none">
                {nowShowing.map((movie, idx) => (
                  <PremiumMovieCard
                    key={movie.movie_id}
                    movie={movie}
                    index={idx}
                  />
                ))}
              </div>
            </AnimatedSection>
          )}

          {/* Phim Hot Tuần Này */}
          {nowShowing.length > 0 && (
            <AnimatedSection delay={0.1}>
              <div className="flex justify-between items-center mb-6 mt-12">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-8 rounded-full bg-orange-500" />
                  <h2 className="text-xl md:text-2xl font-bold text-white">
                    Phim Hot Tuần Này
                  </h2>
                </div>
                <motion.button
                  whileHover={{ x: 5 }}
                  onClick={() => navigate("/movies?sort=top-rated")}
                  className="text-zinc-400 hover:text-white text-sm flex items-center gap-1 transition-colors group"
                >
                  Xem tất cả
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>

              <div className="flex gap-5 overflow-x-auto pb-6 scrollbar-none">
                {[...nowShowing]
                  .sort(
                    (a, b) =>
                      (b.tickets || 0) - (a.tickets || 0) ||
                      (b.views || 0) - (a.views || 0) ||
                      (b.rating || b.score || 0) - (a.rating || a.score || 0),
                  )
                  .slice(0, 10)
                  .map((movie, idx) => (
                    <PremiumMovieCard
                      key={`hot-${movie.movie_id}`}
                      movie={movie}
                      index={idx}
                    />
                  ))}
              </div>
            </AnimatedSection>
          )}

          {/* Coming Soon Section */}
          {comingSoon.length > 0 && (
            <AnimatedSection delay={0.2}>
              <div className="flex justify-between items-center mb-6 mt-12">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-8 rounded-full bg-yellow-500" />
                  <h2 className="text-xl md:text-2xl font-bold text-white">
                    Phim Sắp Chiếu
                  </h2>
                </div>
                <motion.button
                  whileHover={{ x: 5 }}
                  onClick={() => navigate("/movies?status=coming-soon")}
                  className="text-zinc-400 hover:text-white text-sm flex items-center gap-1 transition-colors group"
                >
                  Xem tất cả
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>

              <div className="flex gap-5 overflow-x-auto pb-6 scrollbar-none">
                {comingSoon.map((movie, idx) => (
                  <PremiumMovieCard
                    key={movie.movie_id}
                    movie={movie}
                    index={idx}
                  />
                ))}
              </div>
            </AnimatedSection>
          )}

          {/* Featured Cinemas Section */}
          {cinemas.length > 0 && (
            <AnimatedSection delay={0.3}>
              <div className="flex justify-between items-center mb-6 mt-12">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-8 rounded-full bg-purple-500" />
                  <h2 className="text-xl md:text-2xl font-bold text-white">
                    Rạp Chiếu
                  </h2>
                </div>
                <motion.button
                  whileHover={{ x: 5 }}
                  onClick={() => navigate("/cinemas")}
                  className="text-zinc-400 hover:text-white text-sm flex items-center gap-1 transition-colors group"
                >
                  Xem tất cả
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {cinemas.map((cinema, idx) => (
                  <CinemaCard
                    key={cinema.cinema_id || idx}
                    cinema={cinema}
                    index={idx}
                  />
                ))}
              </div>
            </AnimatedSection>
          )}

          {/* Promotions Section */}
          {promotions.length > 0 && (
            <AnimatedSection delay={0.4}>
              <div className="flex justify-between items-center mb-6 mt-12">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-8 rounded-full bg-green-500" />
                  <h2 className="text-xl md:text-2xl font-bold text-white">
                    Ưu Đãi Đặc Biệt
                  </h2>
                </div>
                <motion.button
                  whileHover={{ x: 5 }}
                  onClick={() => navigate("/promotions")}
                  className="text-zinc-400 hover:text-white text-sm flex items-center gap-1 transition-colors group"
                >
                  Xem tất cả
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {promotions.slice(0, 3).map((promo, idx) => (
                  <HomePromotionCard
                    key={promo.promotion_id || promo.id || idx}
                    promo={promo}
                    index={idx}
                  />
                ))}
              </div>
            </AnimatedSection>
          )}

          {/* Tin tức điện ảnh */}
          {cinemaNewsItems.length > 0 && (
            <AnimatedSection delay={0.45}>
              <div className="flex justify-between items-center mb-6 mt-12">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-8 rounded-full bg-blue-500" />
                  <h2 className="text-xl md:text-2xl font-bold text-white">
                    Tin tức điện ảnh
                  </h2>
                </div>
                <motion.button
                  whileHover={{ x: 5 }}
                  onClick={() => navigate("/movies")}
                  className="text-zinc-400 hover:text-white text-sm flex items-center gap-1 transition-colors group"
                >
                  Xem phim
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>

              <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-none">
                {cinemaNewsItems.map((m, idx) => (
                  <GlowCard
                    key={m.movie_id || idx}
                    onClick={() => navigate(`/movies/${m.movie_id}`)}
                    className="bg-cinema-surface border border-white/10 p-5 w-[300px] md:w-[400px] shrink-0"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center shrink-0">
                        <Newspaper className="w-6 h-6 text-blue-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              m.status === "now_showing"
                                ? "bg-red-500/15 text-red-300 border border-red-500/20"
                                : "bg-yellow-500/15 text-yellow-300 border border-yellow-500/20"
                            }`}
                          >
                            {m.status === "now_showing"
                              ? "Đang chiếu"
                              : "Sắp chiếu"}
                          </span>
                          {(m.created_at || m.releaseDate) && (
                            <span className="text-[10px] font-semibold text-zinc-500">
                              {
                                String(m.created_at || m.releaseDate).split(
                                  "T",
                                )[0]
                              }
                            </span>
                          )}
                        </div>
                        <h3 className="text-white font-bold text-base line-clamp-2">
                          {m.title}
                        </h3>
                        <p className="text-zinc-400 text-sm mt-2 line-clamp-3">
                          {m.description ||
                            "Khám phá thông tin chi tiết về bộ phim này."}
                        </p>
                        <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-zinc-300">
                          Xem chi tiết
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </GlowCard>
                ))}
              </div>
            </AnimatedSection>
          )}

          {/* CTA Banner */}
          {!user && (
            <AnimatedSection delay={0.5}>
              <div className="mt-12 mb-8 relative overflow-hidden rounded-2xl">
                <div className="absolute inset-0 from-black/90 bg-cinema-surface" />
                <div className="relative z-10 p-8 md:p-12 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6, type: "spring" }}
                    className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4"
                  >
                    <Film className="w-8 h-8 text-red-500" />
                  </motion.div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                    Trải nghiệm điện ảnh đỉnh cao
                  </h2>
                  <p className="text-zinc-300 mb-6 max-w-md mx-auto text-sm">
                    Đặt vé nhanh chóng, thanh toán an toàn, nhận ưu đãi hấp dẫn
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/movies")}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-bold hover:shadow-lg hover:shadow-red-500/25 transition-all"
                  >
                    Đặt vé ngay
                  </motion.button>
                </div>
              </div>
            </AnimatedSection>
          )}
        </div>
      </div>

      {/* Trailer Modal - SỬA GIỐNG MovieDetailPage */}
      <AnimatePresence>
        {showTrailerModal && selectedTrailerMovie && selectedTrailerMovie.trailer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
            onClick={() => setShowTrailerModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl mx-4 rounded-2xl overflow-hidden bg-black"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative pt-[56.25%]">
                {(() => {
                  const youtubeId = extractYouTubeId(selectedTrailerMovie.trailer);
                  
                  if (youtubeId) {
                    return (
                      <iframe
                        className="absolute inset-0 w-full h-full"
                        src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                        title={`Trailer: ${selectedTrailerMovie.title}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    );
                  }
                  
                  // Fallback nếu không có trailer hợp lệ
                  return (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900">
                      <Play className="w-16 h-16 text-red-500 mb-4" fill="currentColor" />
                      <p className="text-white font-semibold mb-2">{selectedTrailerMovie.title}</p>
                      <p className="text-zinc-400 text-sm">Chưa có trailer cho phim này</p>
                      <button
                        onClick={() => setShowTrailerModal(false)}
                        className="mt-6 px-6 py-2 rounded-full bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition"
                      >
                        Đóng
                      </button>
                    </div>
                  );
                })()}
              </div>
              
              <button
                onClick={() => setShowTrailerModal(false)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePage;
