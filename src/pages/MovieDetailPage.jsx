import { useParams, Link } from 'react-router-dom'
import { MOVIES } from '../data/mockData'
import { Star, Clock, ArrowLeft } from 'lucide-react'

function MovieDetailPage() {
  const { id } = useParams()
  const movie = MOVIES.find((m) => String(m.id) === id)
  const canBook = movie?.status === 'now-showing'

  if (!movie) {
    return (
      <section className="py-20 text-center">
        <p className="text-zinc-400">Không tìm thấy phim.</p>
        <Link to="/movies" className="mt-4 inline-block text-cinema-primary hover:underline">
          ← Quay lại danh sách phim
        </Link>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Link
        to="/movies"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại
      </Link>

      <div className="flex flex-col gap-8 sm:flex-row">
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full rounded-2xl object-cover sm:w-56 sm:shrink-0"
        />

        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold text-white">{movie.title}</h1>
          {movie.originalTitle && (
            <p className="text-sm text-zinc-500">{movie.originalTitle}</p>
          )}
          <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-400">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                canBook
                  ? 'bg-cinema-primary/20 text-cinema-primary'
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}
            >
              {canBook ? 'Đang chiếu' : 'Sắp chiếu'}
            </span>
            <span className="flex items-center gap-1 text-yellow-400">
              <Star className="h-4 w-4 fill-current" />
              {movie.score}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {movie.duration} phút
            </span>
            {movie.rating && (
              <span className="rounded border border-zinc-700 px-1.5 py-0.5 text-xs">
                {movie.rating}
              </span>
            )}
          </div>
          {movie.genre && (
            <div className="flex flex-wrap gap-2">
              {movie.genre.map((g) => (
                <span key={g} className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">
                  {g}
                </span>
              ))}
            </div>
          )}
          <p className="text-sm leading-relaxed text-zinc-400">{movie.description}</p>

          <div className="mt-auto pt-4">
            {canBook ? (
              <Link
                to={`/showtimes?movie=${encodeURIComponent(movie.title)}`}
                className="cinema-btn-primary inline-flex px-6 py-3"
              >
                Mua vé ngay
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex cursor-not-allowed rounded-xl border border-zinc-700 bg-zinc-800 px-6 py-3 text-sm font-semibold text-zinc-400"
              >
                Chưa mở bán vé
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default MovieDetailPage
