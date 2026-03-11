import { NavLink, Outlet } from 'react-router-dom'

const navigationItems = [
  { to: '/', label: 'Trang chủ', end: true },
  { to: '/movies', label: 'Movies' },
  { to: '/showtimes', label: 'Showtimes' },
]

function MainLayout() {
  const getLinkClass = ({ isActive }) =>
    isActive
      ? 'rounded-lg bg-cinema-primary/20 px-3 py-2 text-sm font-medium text-white'
      : 'rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/5 hover:text-white'

  return (
    <div className="mx-auto w-full max-w-[1920px] px-3 sm:px-6 lg:px-10 2xl:px-14">
      <header className="sticky top-0 z-30 mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 bg-cinema-bg/85 py-3 backdrop-blur sm:mb-6 sm:py-4">
        <span className="text-xl font-bold text-white">CinemaHub</span>
        <nav className="flex w-full gap-2 overflow-x-auto pb-1 sm:w-auto sm:flex-wrap sm:overflow-visible" aria-label="Main navigation">
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={getLinkClass}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="pb-6 sm:pb-8">
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout
