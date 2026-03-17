import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Clock,
  Play,
  Ticket,
  ArrowRight,
  Flame,
  CalendarDays,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MovieCard } from "../components/MovieCard";

const HomePage = () => {
  const navigate = useNavigate();

  const [heroIndex, setHeroIndex] = useState(0);
  const [nowShowing, setNowShowing] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);

  const featured = nowShowing.slice(0, 3);
  const current = featured[heroIndex];

  // FETCH MOVIES
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/movies");
        const data = await res.json();

        // map dữ liệu từ DB
        const movies = data.map((m) => ({
          ...m,
          score: m.rating || 0,
          poster: m.poster,
          backdrop: m.backdrop || m.poster,
        }));

        // phân loại phim
        const now = movies.filter((m) => m.status === "now_showing");
        const soon = movies.filter((m) => m.status === "coming_soon");

        setNowShowing(now);
        setComingSoon(soon);
      } catch (err) {
        console.error(err);
      }
    };

    fetchMovies();
  }, []);

  // HERO AUTO SLIDE
  useEffect(() => {
    if (featured.length === 0) return;

    const t = setInterval(
      () => setHeroIndex((i) => (i + 1) % featured.length),
      5000
    );

    return () => clearInterval(t);
  }, [featured.length]);

  if (!current) return null;

  return (
    <div className="min-h-screen bg-cinema-bg text-zinc-100">
      
      {/* HERO */}
      <div className="relative h-[74vh] min-h-[460px] overflow-hidden sm:h-[70vh] sm:min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.movie_id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <img
              src={current.backdrop}
              alt={current.title}
              className="w-full h-full object-cover"
            />

            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to right, rgba(10,10,15,0.95) 0%, rgba(10,10,15,0.6) 50%, rgba(10,10,15,0.2) 100%)",
              }}
            />

            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(10,10,15,1) 0%, transparent 50%)",
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* HERO CONTENT */}
        <div className="absolute inset-0 flex items-end sm:items-center">
          <div className="mx-auto w-full px-3 pb-20 sm:px-6 sm:pb-0 lg:px-10 2xl:px-14">
            <div className="max-w-xl">

              <h1 className="mb-2 text-3xl font-extrabold sm:text-5xl">
                {current.title}
              </h1>

              <div className="mb-4 flex items-center gap-4">
                <span className="flex items-center gap-1 text-yellow-400">
                  <Star className="w-4 h-4 fill-current" />
                  {current.score}/10
                </span>

                <span className="flex items-center gap-1 text-zinc-400">
                  <Clock className="w-4 h-4" />
                  {current.duration} phút
                </span>
              </div>

              <p className="text-zinc-400 text-sm mb-6 line-clamp-3">
                {current.description}
              </p>

              <div className="flex gap-3">

                {/* BOOKING */}
                <button
                  onClick={() => navigate(`/movies/${current.movie_id}`)}
                  className="cinema-btn-primary"
                >
                  <Ticket className="w-4 h-4" />
                  Xem thông tin
                </button>

                <button
                  onClick={() => navigate(`/movies/${current.movie_id}`)}
                  className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-white"
                >
                  <Play className="w-4 h-4" fill="white" />
                  Xem trailer
                </button>

              </div>
            </div>
          </div>
        </div>

        {/* SLIDER BUTTON */}
        <button
          onClick={() =>
            setHeroIndex((i) => (i - 1 + featured.length) % featured.length)
          }
          className="absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white sm:flex"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={() => setHeroIndex((i) => (i + 1) % featured.length)}
          className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white sm:flex"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* MAIN */}
      <div className="mx-auto w-full px-3 pb-14 sm:px-6 lg:px-10 2xl:px-14">

        {/* NOW SHOWING */}
        <section className="mt-10">
          <div className="mb-5 flex items-center justify-between">

            <h2 className="text-xl font-bold text-white">
              <Flame className="inline w-5 h-5 text-red-500 mr-1.5" />
              Phim Đang Chiếu
            </h2>

            <button
              onClick={() => navigate("/movies")}
              className="flex items-center gap-1 text-sm text-zinc-400 hover:text-white"
            >
              Xem tất cả <ArrowRight className="w-4 h-4" />
            </button>

          </div>

          <div className="flex gap-4 overflow-x-auto pb-4">

            {nowShowing.map((movie) => (
              <MovieCard key={movie.movie_id} movie={movie} size="md" />
            ))}

          </div>
        </section>

        {/* COMING SOON */}
        <section className="mt-10">

          <div className="mb-5 flex items-center justify-between">

            <h2 className="text-xl font-bold text-white">
              <CalendarDays className="inline w-5 h-5 text-yellow-500 mr-1.5" />
              Phim Sắp Chiếu
            </h2>

            <button
              onClick={() => navigate("/movies?status=coming-soon")}
              className="flex items-center gap-1 text-sm text-zinc-400 hover:text-white"
            >
              Xem tất cả <ArrowRight className="w-4 h-4" />
            </button>

          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            {comingSoon.map((movie) => (
              <div
                key={movie.movie_id}
                onClick={() => navigate(`/movies/${movie.movie_id}`)}
                className="group flex gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 hover:border-zinc-700"
              >

                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="h-28 w-20 rounded-lg object-cover"
                />

                <div className="flex-1">

                  <h3 className="text-sm font-semibold text-white">
                    {movie.title}
                  </h3>

                  <p className="text-zinc-400 text-xs mt-2 line-clamp-2">
                    {movie.description}
                  </p>

                </div>

              </div>
            ))}

          </div>

        </section>
      </div>
    </div>
  );
};

export default HomePage;