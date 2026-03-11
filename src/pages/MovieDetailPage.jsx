import { useState } from "react";
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
import { MOVIES } from "../data/mockData";
import { MovieCard } from "../components/MovieCard";

const ratingColors = {
  P: "#22c55e",
  T13: "#f59e0b",
  T16: "#f97316",
  T18: "#ef4444",
};

export const MovieDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);

  const movie = MOVIES.find((m) => m.id === id);
  const related = MOVIES.filter(
    (m) => m.id !== id && m.genre.some((g) => movie?.genre.includes(g))
  ).slice(0, 4);

  if (!movie) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#0a0a0f" }}
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

  const handleBooking = () => {
    navigate("/cinemas");
  };

  const handleShare = async () => {
    const shareData = {
      title: movie.title,
      text: `Xem chi tiet phim ${movie.title} tren CinemaHub`,
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
    { icon: Globe, label: "Quốc gia", value: movie.country || "Đang cập nhật" },
    {
      icon: Globe,
      label: "Ngôn ngữ",
      value: movie.language || "Đang cập nhật",
    },
  ];
  const cast = Array.isArray(movie.cast) ? movie.cast : [];
  const director = movie.director || "Đang cập nhật";

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0f" }}>
      {/* Backdrop */}
      <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <img
          src={movie.backdrop}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, #0a0a0f 10%, rgba(10,10,15,0.4) 60%, rgba(10,10,15,0.2) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(10,10,15,0.6) 0%, transparent 60%)",
          }}
        />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 sm:left-6 flex items-center gap-2 text-white bg-black/40 hover:bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-sm transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Quay lại
        </button>

        {/* Action buttons */}
        <div className="absolute top-4 right-4 sm:right-6 flex gap-2">
          <button
            onClick={() => setLiked(!liked)}
            className={`w-9 h-9 rounded-full bg-black/40 border border-white/10 flex items-center justify-center transition-colors ${
              liked ? "text-red-500" : "text-white hover:text-red-400"
            }`}
          >
            <Heart className="w-4 h-4" fill={liked ? "currentColor" : "none"} />
          </button>
          <button
            onClick={handleShare}
            className="w-9 h-9 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-white hover:text-zinc-200 transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10 pb-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Poster */}
          <div className="flex-shrink-0">
            <div className="w-44 md:w-52 mx-auto lg:mx-0">
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-full rounded-2xl shadow-2xl"
                style={{ aspectRatio: "2/3", objectFit: "cover" }}
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span
                className="px-2.5 py-1 rounded-lg text-xs text-white"
                style={{
                  background:
                    movie.status === "now-showing" ? "#e50914" : "#f59e0b",
                  fontWeight: 700,
                }}
              >
                {movie.status === "now-showing" ? "Đang chiếu" : "Sắp chiếu"}
              </span>
              <span
                className="px-2.5 py-1 rounded-lg text-xs text-white"
                style={{
                  background: ratingColors[movie.rating],
                  fontWeight: 700,
                }}
              >
                {movie.rating}
              </span>
              {movie.genre.map((g) => (
                <span
                  key={g}
                  className="px-2.5 py-1 rounded-lg text-xs bg-zinc-800 text-zinc-300 border border-zinc-700"
                >
                  {g}
                </span>
              ))}
            </div>

            <h1
              className="text-white mb-1"
              style={{ fontSize: "2rem", fontWeight: 800, lineHeight: 1.2 }}
            >
              {movie.title}
            </h1>
            <p className="text-zinc-500 text-sm mb-4">{movie.originalTitle}</p>

            {/* Rating */}
            <div className="flex items-center gap-4 mb-4">
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
                <span
                  className="text-yellow-400 text-sm"
                  style={{ fontWeight: 700 }}
                >
                  {movie.score}/10
                </span>
                <span className="text-zinc-500 text-xs">
                  ({voteCount} lượt)
                </span>
              </div>
            </div>

            {/* Meta info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {movieDetails.map((detail) => {
                const IconComponent = detail.icon;
                return (
                  <div
                    key={detail.label}
                    className="bg-zinc-900 rounded-xl p-3 border border-zinc-800"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <IconComponent className="w-3.5 h-3.5 text-red-500" />
                      <span className="text-zinc-500 text-xs">
                        {detail.label}
                      </span>
                    </div>
                    <p
                      className="text-white text-sm"
                      style={{ fontWeight: 600 }}
                    >
                      {detail.value}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Description */}
            <div className="mb-5">
              <h3 className="text-white mb-2" style={{ fontWeight: 600 }}>
                Nội dung phim
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                {movie.description}
              </p>
            </div>

            {/* Director & Cast */}
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-zinc-500 text-xs mb-1.5 uppercase tracking-wider">
                  Đạo diễn
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                    <User className="w-4 h-4 text-zinc-400" />
                  </div>
                  <span
                    className="text-white text-sm"
                    style={{ fontWeight: 600 }}
                  >
                    {director}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-zinc-500 text-xs mb-1.5 uppercase tracking-wider">
                  Diễn viên
                </p>
                <div className="flex flex-wrap gap-1">
                  {cast.length > 0 ? (
                    cast.map((actor) => (
                      <span
                        key={actor}
                        className="bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded-lg border border-zinc-700"
                      >
                        {actor}
                      </span>
                    ))
                  ) : (
                    <span className="text-zinc-400 text-sm">Đang cập nhật</span>
                  )}
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3">
              {movie.status === "now-showing" && (
                <button
                  onClick={handleBooking}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl text-white transition-all hover:opacity-90 active:scale-95"
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
                className="flex items-center gap-2 px-8 py-3 rounded-xl text-white border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 transition-colors"
              >
                <Play className="w-4 h-4" fill="white" />
                Xem trailer
              </button>
            </div>
          </div>
        </div>

        {/* Related Movies */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2
              className="text-white mb-6"
              style={{ fontSize: "1.25rem", fontWeight: 700 }}
            >
              Phim liên quan
            </h2>
            <div
              className="flex gap-4 overflow-x-auto pb-2"
              style={{ scrollbarWidth: "none" }}
            >
              {related.map((m) => (
                <MovieCard key={m.id} movie={m} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Trailer Modal */}
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
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Play
                  className="w-16 h-16 text-red-500 mb-4"
                  fill="currentColor"
                />
                <p className="text-zinc-400">Trailer: {movie.title}</p>
                <p className="text-zinc-600 text-sm mt-1">
                  (Demo - Trailer không khả dụng trong bản demo)
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute top-3 right-3 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black"
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
