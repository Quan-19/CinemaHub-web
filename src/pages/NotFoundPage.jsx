import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <section className="relative flex min-h-[68vh] items-center justify-center overflow-hidden rounded-3xl border border-zinc-700 bg-cinema-surface px-4 py-12 sm:px-8">
      <div className="pointer-events-none absolute -left-24 top-8 h-56 w-56 rounded-full bg-cinema-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl" />

      <div className="relative z-10 mx-auto w-full max-w-2xl text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">
          Error Page
        </p>
        <h1 className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-7xl font-black leading-none text-transparent sm:text-8xl">
          404
        </h1>
        <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
          Trang bạn tìm không tồn tại
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-zinc-400 sm:text-base">
          Có thể đường dẫn đã thay đổi hoặc nội dung đã bị xoá. Bạn có thể quay về
          trang chủ hoặc tiếp tục khám phá các phim đang chiếu.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link className="cinema-btn-primary w-full justify-center sm:w-auto" to="/">
            Quay về trang chủ
          </Link>
          <Link
            className="w-full rounded-xl border border-zinc-700 px-6 py-3 text-center text-sm font-semibold text-zinc-200 transition-colors hover:border-zinc-500 hover:text-white sm:w-auto"
            to="/movies"
          >
            Xem phim
          </Link>
        </div>
      </div>
    </section>
  )
}

export default NotFoundPage
