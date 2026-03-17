import { Clock, Star, Ticket } from "lucide-react";
import { Link } from "react-router-dom";

export const MovieCard = ({ movie, size = "md" }) => {
  // chuẩn hóa status
  const status = (movie.status || "").toLowerCase();

  const isNowShowing =
    status === "now_showing" ||
    status === "now-showing" ||
    status === "nowshowing";

  const widthClass =
    size === "md"
      ? "w-[78vw] min-w-[240px] sm:w-[230px] sm:min-w-[230px]"
      : size === "grid"
        ? "w-full"
        : "w-full";

  // chuẩn hóa rating
  const rating = movie.score ?? "N/A";

  return (
    <article
      className={`${widthClass} cinema-surface overflow-hidden transition hover:border-zinc-700`}
    >
      <Link
        to={`/movies/${movie.movie_id || movie.id}`}
        className="group relative block aspect-[3/4]"
      >
        <img
          src={movie.poster}
          alt={movie.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />

        <div className="absolute left-3 top-3">
          <span
            className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${
              isNowShowing
                ? "bg-cinema-primary/90 text-white"
                : "bg-yellow-500/85 text-zinc-950"
            }`}
          >
            {isNowShowing ? "Đang chiếu" : "Sắp chiếu"}
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 px-3 pb-3 pt-6 text-white">
          <h3 className="text-sm font-semibold leading-tight">{movie.title}</h3>

          <p className="text-xs text-zinc-300">{movie.originalTitle || ""}</p>

          <div className="mt-2 flex items-center gap-3 text-xs text-zinc-200">
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-yellow-400" />
              {rating}
            </span>

            <span className="flex items-center gap-1 text-zinc-300">
              <Clock className="h-3.5 w-3.5" />
              {movie.duration}p
            </span>
          </div>
        </div>

        <div className="absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <span
            className={`inline-flex w-full items-center justify-center gap-1 rounded-lg px-2 py-2 text-xs font-semibold ${
              isNowShowing
                ? "bg-cinema-primary text-white"
                : "bg-zinc-800/95 text-zinc-300"
            }`}
          >
            {isNowShowing ? <Ticket className="h-3.5 w-3.5" /> : null}
            {isNowShowing ? "Xem thông tin & đặt vé" : "Xem thông tin"}
          </span>
        </div>
      </Link>
    </article>
  );
};
