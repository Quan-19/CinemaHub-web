import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Star,
  Clock,
  Calendar,
  Globe,
  User,
  Play,
  Ticket,
  ChevronLeft,
  Share2,
  Heart,
} from "lucide-react";
import { MovieCard } from "../components/MovieCard";

const ratingColors = {
  P: "#22c55e",
  C13: "#f59e0b",
  C16: "#f97316",
  C18: "#ef4444",
};

export const MovieDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [liked, setLiked] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [movie, setMovie] = useState(null);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/movies");
        const data = await res.json();

        const formatted = data.map((m) => ({
          id: (m.movie_id || m.id)?.toString(),
          title: m.title,
          originalTitle: m.title,
          description: m.description,

          duration: m.duration,
          director: m.director,
          language: m.language,
          country: m.country,

          score: m.rating || 0,
          votes: m.views || 0,

          ageRating: m.age_rating,

          // dùng link trực tiếp từ DB
          poster: m.poster || "/no-image.jpg",
          backdrop: m.poster || "/no-image.jpg",

          trailer: m.trailer,
          releaseDate: m.release_date,

          genre: ["Phim"],

          status:
            m.status === "now_showing"
              ? "now-showing"
              : m.status === "coming_soon"
                ? "coming-soon"
                : "ended",
        }));

        const currentMovie = formatted.find((m) => m.id === id);

        setMovie(currentMovie);

        const relatedMovies = formatted.filter((m) => m.id !== id).slice(0, 4);

        setRelated(relatedMovies);
      } catch (err) {
        console.error("Load movie failed:", err);
      }
    };

    fetchMovies();
  }, [id]);

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Đang tải phim...
      </div>
    );
  }

  const handleBooking = () => {
    navigate(`/movies/${movie.id}`);
  };

  const handleShare = async () => {
    const shareData = {
      title: movie.title,
      text: `Xem chi tiết phim ${movie.title}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {}
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareData.url);
      alert("Đã copy link phim!");
    }
  };

  const stars = Math.round(movie.score / 2);

  const voteCount =
    typeof movie.votes === "number" ? movie.votes.toLocaleString() : "0";

  const movieDetails = [
    {
      icon: Clock,
      label: "Thời lượng",
      value: movie.duration ? `${movie.duration} phút` : "Đang cập nhật",
    },
    {
      icon: Calendar,
      label: "Khởi chiếu",
      value: movie.releaseDate || "Đang cập nhật",
    },
    {
      icon: Globe,
      label: "Quốc gia",
      value: movie.country || "Đang cập nhật",
    },
    {
      icon: Globe,
      label: "Ngôn ngữ",
      value: movie.language || "Đang cập nhật",
    },
  ];

  const director = movie.director || "Đang cập nhật";

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0f" }}>
      {/* BACKDROP */}
      <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <img
          src={movie.backdrop}
          alt={movie.title}
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-black/40 to-black/20" />

        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 flex items-center gap-2 text-white bg-black/40 rounded-xl px-3 py-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Quay lại
        </button>

        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => setLiked(!liked)}
            className={`w-9 h-9 rounded-full bg-black/40 flex items-center justify-center ${
              liked ? "text-red-500" : "text-white"
            }`}
          >
            <Heart className="w-4 h-4" fill={liked ? "currentColor" : "none"} />
          </button>

          <button
            onClick={handleShare}
            className="w-9 h-9 rounded-full bg-black/40 flex items-center justify-center text-white"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-6 -mt-32 relative z-10 pb-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* POSTER */}
          <div className="w-48">
            <img
              src={movie.poster}
              alt={movie.title}
              className="rounded-2xl shadow-2xl"
            />
          </div>

          {/* INFO */}
          <div className="flex-1">
            <div className="flex gap-2 mb-3">
              <span
                className="px-2 py-1 rounded text-xs text-white"
                style={{
                  background:
                    movie.status === "now-showing"
                      ? "#e50914"
                      : movie.status === "coming-soon"
                        ? "#f59e0b"
                        : "#6b7280",
                }}
              >
                {movie.status === "now-showing"
                  ? "Đang chiếu"
                  : movie.status === "coming-soon"
                    ? "Sắp chiếu"
                    : "Đã chiếu"}
              </span>

              <span
                className="px-2 py-1 rounded text-xs text-white"
                style={{ background: ratingColors[movie.rating] }}
              >
                {movie.ageRating}
              </span>
            </div>

            <h1 className="text-white text-3xl font-bold mb-2">
              {movie.title}
            </h1>

            <p className="text-zinc-400 mb-4">{movie.originalTitle}</p>

            {/* RATING */}
            <div className="flex items-center gap-3 mb-4">
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

              <span className="text-yellow-400">{movie.score}/10</span>
              <span className="text-zinc-500 text-sm">({voteCount} lượt)</span>
            </div>

            {/* META */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {movieDetails.map((detail) => {
                const IconComponent = detail.icon;

                return (
                  <div
                    key={detail.label}
                    className="bg-zinc-900 rounded-xl p-3 border border-zinc-800"
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <IconComponent className="w-4 h-4 text-red-500" />
                      <span className="text-zinc-500 text-xs">
                        {detail.label}
                      </span>
                    </div>

                    <p className="text-white text-sm font-semibold">
                      {detail.value}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* DESCRIPTION */}
            <div className="mb-5">
              <h3 className="text-white mb-2 font-semibold">Nội dung phim</h3>

              <p className="text-zinc-400 text-sm leading-relaxed">
                {movie.description || "Đang cập nhật"}
              </p>
            </div>

            {/* DIRECTOR */}
            <div className="mb-6">
              <p className="text-zinc-500 text-xs mb-1 uppercase">Đạo diễn</p>

              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-zinc-400" />

                <span className="text-white text-sm font-semibold">
                  {director}
                </span>
              </div>
            </div>

            {/* BUTTON */}
            <div className="flex gap-3">
              {movie.status === "now-showing" && (
                <button
                  onClick={() =>
                    navigate(`/booking/${id}`, {
                      state: {
                        movie: movie,
                      },
                    })
                  }
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-white bg-red-600"
                >
                  <Ticket className="w-4 h-4" />
                  Đặt vé
                </button>
              )}

              <button
                onClick={() => setShowTrailer(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-zinc-700 text-white"
              >
                <Play className="w-4 h-4" />
                Xem trailer
              </button>
            </div>
          </div>
        </div>

        {/* RELATED MOVIES */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-white text-xl font-bold mb-6">
              Phim liên quan
            </h2>

            <div className="flex gap-4 overflow-x-auto">
              {related.map((m) => (
                <MovieCard key={m.id} movie={m} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetailPage;
