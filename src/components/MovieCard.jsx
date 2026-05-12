import { Clock, Star, Ticket } from "lucide-react";
import { Link } from "react-router-dom";

export const MovieCard = ({ movie, size = "md" }) => {
  const isNowShowing = movie.status === "now-showing" || movie.status === "now_showing";
  const movieId = movie.movie_id ?? movie.id;

  const widthClass =
    size === "md"
      ? "w-[45vw] min-w-[165px] sm:w-[190px] sm:min-w-[190px]"
      : size === "sm"
      ? "w-[35vw] min-w-[130px] sm:w-[155px] sm:min-w-[155px]"
      : "w-full";

  return (
    <div className={`${widthClass} group flex flex-col gap-3`}>
      <Link 
        to={`/movies/${movieId}`} 
        className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-zinc-900 shadow-lg transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_15px_30px_rgba(0,0,0,0.8)]"
      >
        <img
          src={movie.poster}
          alt={movie.title}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
        />
        
        {/* Overlay Gradients */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Badge */}
        <div className="absolute left-3 top-3 z-20">
          <span
            className={`flex items-center justify-center rounded-lg px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider backdrop-blur-md border border-white/10 ${
              isNowShowing
                ? "bg-cinema-primary/90 text-white shadow-[0_0_10px_rgba(229,9,20,0.3)]"
                : "bg-yellow-500/90 text-zinc-950 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
            }`}
          >
            {isNowShowing ? "Đang chiếu" : "Sắp chiếu"}
          </span>
        </div>

        {/* Action Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-[2px] transition-all duration-300 group-hover:opacity-100">
          <div className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[10px] font-bold text-black shadow-xl active:scale-95 transition-transform">
            {isNowShowing ? <Ticket className="h-3.5 w-3.5" /> : <Star className="h-3.5 w-3.5" />}
            {isNowShowing ? "ĐẶT VÉ" : "CHI TIẾT"}
          </div>
        </div>
      </Link>

      {/* Info Area Detached */}
      <div className="flex flex-col space-y-1 px-1">
        <h3 className="line-clamp-1 text-base font-bold text-white group-hover:text-cinema-primary transition-colors duration-300">
          {movie.title}
        </h3>
        <p className="line-clamp-1 text-xs font-medium text-zinc-400 mt-[-2px]">
          {movie.originalTitle || movie.title}
        </p>
        
        <div className="mt-1.5 flex items-center justify-between">
          <div className="flex items-center gap-1 text-yellow-500">
            <Star className="h-3 w-3 fill-current" />
            <span className="text-[11px] font-black">
              {movie.score ? (movie.score / 2).toFixed(1) : "0.0"}
            </span>
          </div>
          <div className="flex items-center gap-1 text-zinc-400">
            <Clock className="h-3 w-3" />
            <span className="text-[10px] font-bold uppercase tracking-tighter">{movie.duration} min</span>
          </div>
        </div>
      </div>
    </div>
  );
};
