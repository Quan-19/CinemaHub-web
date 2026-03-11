import { Clock, Star } from 'lucide-react'

export const MovieCard = ({ movie, size = 'md' }) => {
  const widthClass =
    size === 'md' ? 'w-[78vw] min-w-[240px] sm:w-[230px] sm:min-w-[230px]' : 'w-full'

  return (
    <article
      className={`${widthClass} cinema-surface overflow-hidden hover:border-zinc-700 transition-all`}
    >
      <div className="h-64 overflow-hidden">
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-3">
        <h3 className="mb-1 text-sm font-bold text-white">
          {movie.title}
        </h3>
        <p className="text-zinc-500 text-xs mb-2">{movie.originalTitle}</p>
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400" />
            {movie.score || 'N/A'}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {movie.duration}p
          </span>
        </div>
      </div>
    </article>
  )
}
