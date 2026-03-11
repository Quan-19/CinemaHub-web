import { Clock, Star } from "lucide-react";

export const MovieCard = ({ movie, size = "md" }) => {
  const widthClass =
    size === "md"
      ? "w-[78vw] min-w-[240px] sm:w-[230px] sm:min-w-[230px]"
      : size === "grid"
      ? "w-full"
      : "w-full";

  return (
    <article
      className={`${widthClass} cinema-surface overflow-hidden transition hover:border-zinc-700`}
    >
      <div className="group relative aspect-[3/4]">
        <img
          src={movie.poster}
          alt={movie.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 px-3 pb-3 pt-6 text-white">
          <h3 className="text-sm font-semibold leading-tight">{movie.title}</h3>
          <p className="text-xs text-zinc-300">{movie.originalTitle}</p>
          <div className="mt-2 flex items-center gap-3 text-xs text-zinc-200">
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-yellow-400" />
              {movie.score || "N/A"}
            </span>
            <span className="flex items-center gap-1 text-zinc-300">
              <Clock className="h-3.5 w-3.5" />
              {movie.duration}p
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};
