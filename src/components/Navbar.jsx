import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  Film,
  LogOut,
  Menu,
  Search,
  Ticket,
  User,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navLinks = [
  { label: "Trang chủ", path: "/" },
  { label: "Phim", path: "/movies" },
  { label: "Rạp chiếu", path: "/cinemas" },
  { label: "Khuyến mãi", path: "/promotions" },
];

const isLinkActive = (pathname, path) => {
  if (path === "/") {
    return pathname === "/";
  }
  return pathname.startsWith(path);
};

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
  };

  const runSearch = () => {
    const query = searchQuery.trim();
    setSearchOpen(false);
    if (!query) {
      navigate("/movies");
      return;
    }
    navigate(`/movies?q=${encodeURIComponent(query)}`);
  };

  return (
    <header className="sticky top-0 z-40 mb-4 border-b border-zinc-800/80 bg-cinema-bg/90 backdrop-blur sm:mb-6">
      <div className="flex h-16 items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-cinema-primary to-cinema-primary-dark">
            <Film className="h-4 w-4 text-white" />
          </span>
          <span className="text-2xl font-bold leading-none text-white">
            Cinema<span className="text-cinema-primary">Hub</span>
          </span>
        </Link>

        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Main navigation"
        >
          {navLinks.map((link) => {
            const active = isLinkActive(location.pathname, link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={
                  active
                    ? "rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white"
                    : "rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="relative hidden sm:block">
            {searchOpen ? (
              <div className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5">
                <Search className="h-4 w-4 shrink-0 text-zinc-400" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") runSearch();
                    if (event.key === "Escape") setSearchOpen(false);
                  }}
                  placeholder="Tìm kiếm phim..."
                  className="w-44 bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
                aria-label="Mở tìm kiếm"
              >
                <Search className="h-5 w-5" />
              </button>
            )}
          </div>

          <button
            className="relative rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Thông báo"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-cinema-primary" />
          </button>

          <Link
            to="/movies"
            className="cinema-btn-primary hidden px-4 py-2 md:inline-flex"
          >
            <Ticket className="h-4 w-4" />
            Mua vé
          </Link>

          {/* Avatar / Đăng nhập */}
          {user ? (
            <div className="relative hidden sm:block">
              <button
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center gap-1 rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
                aria-label="Tài khoản"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName ?? "avatar"}
                    className="h-8 w-8 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-cinema-primary/80">
                    <User className="h-4 w-4 text-white" />
                  </span>
                )}
                <ChevronDown className="h-3 w-3" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-zinc-700 bg-cinema-surface py-2 shadow-xl">
                  <div className="border-b border-zinc-700 px-4 pb-2">
                    <p className="truncate text-sm font-medium text-white">
                      {user.displayName ?? "Người dùng"}
                    </p>
                    <p className="truncate text-xs text-zinc-400">
                      {user.email}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <LogOut className="h-4 w-4" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate("/auth")}
              className="hidden items-center gap-1 rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white sm:flex"
              aria-label="Tài khoản"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-zinc-700/80">
                <User className="h-4 w-4" />
              </span>
              <ChevronDown className="h-3 w-3" />
            </button>
          )}

          <button
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white md:hidden"
            aria-label="Mở menu"
          >
            {menuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="border-t border-zinc-800/80 py-3 md:hidden">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const active = isLinkActive(location.pathname, link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMenuOpen(false)}
                  className={
                    active
                      ? "block rounded-lg bg-white/10 px-4 py-2.5 text-sm font-medium text-white"
                      : "block rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
                  }
                >
                  {link.label}
                </Link>
              );
            })}

            <button
              onClick={() => navigate("/movies")}
              className="cinema-btn-primary mt-3 w-full justify-center px-4 py-2.5"
            >
              <Ticket className="h-4 w-4" />
              Mua vé
            </button>

            {!user ? (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/auth");
                }}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/5"
              >
                <User className="h-4 w-4" />
                Đăng nhập / Đăng ký
              </button>
            ) : (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/5"
              >
                <LogOut className="h-4 w-4" />
                Đăng xuất
              </button>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}

export default Navbar;
