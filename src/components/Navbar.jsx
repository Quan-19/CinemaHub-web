import { useState, useRef, useEffect } from "react";
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
import { useNotification } from "../context/NotificationContext";
import NotificationDropdown from "./NotificationDropdown";


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
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const userMenuRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotification();



  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

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
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled
        ? "bg-cinema-bg/95 backdrop-blur-xl border-b border-white/10 py-2 shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
        : "bg-gradient-to-b from-cinema-bg/80 via-cinema-bg/40 to-transparent py-4 md:py-5"
        }`}
    >
      <div className="flex items-center justify-between gap-4 lg:gap-8 px-4 sm:px-6 lg:px-8 max-w-[1920px] mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-cinema-primary to-cinema-primary-dark">
            <Film className="h-4 w-4 text-white" />
          </span>
          <span className="text-2xl font-bold leading-none text-white">
            Ebiz<span className="text-cinema-primary">Cinema</span>
          </span>
        </Link>

        <div className="hidden xl:flex flex-1 max-w-md w-full items-center">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70 drop-shadow-md" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") runSearch();
              }}
              placeholder="Tìm kiếm phim, diễn viên"
              className="w-full h-[46px] bg-white/[0.08] hover:bg-white/[0.12] backdrop-blur-md border border-white/10 rounded-full pl-11 pr-4 text-sm text-white placeholder-white/60 outline-none focus:bg-white/[0.15] focus:border-white/30 transition-all shadow-input"
            />
          </div>
        </div>

        <nav
          className="hidden items-center gap-1 xl:gap-2 md:flex"
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
                    ? "rounded-full bg-white/20 backdrop-blur-md px-4 py-2 text-[15px] font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] border border-white/10"
                    : "rounded-full px-4 py-2 text-[15px] font-semibold text-white/90 transition-all hover:bg-white/10 hover:text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative block xl:hidden">
            {searchOpen ? (
              <div className="flex items-center gap-2 rounded-full border border-white/20 bg-cinema-bg/70 backdrop-blur-md px-3 py-1.5 h-10 w-48 sm:w-64 absolute right-0 top-1/2 -translate-y-1/2">
                <Search className="h-4 w-4 shrink-0 text-white/70" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") runSearch();
                    if (event.key === "Escape") setSearchOpen(false);
                  }}
                  placeholder="Tìm kiếm..."
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/60"
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  className="text-white/70 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="rounded-full p-2.5 text-white/90 transition-colors hover:bg-white/10 hover:text-white drop-shadow-md"
                aria-label="Mở tìm kiếm"
              >
                <Search className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative rounded-full p-2.5 text-white/90 transition-colors hover:bg-white/10 hover:text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
              aria-label="Thông báo"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-2 top-2 h-4 w-4 flex items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-[0_0_8px_rgba(239,68,68,0.8)]">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            <NotificationDropdown
              isOpen={notifOpen}
              onClose={() => setNotifOpen(false)}
            />
          </div>


          <Link
            to="/movies"
            className="cinema-btn-primary hidden px-4 py-2 md:inline-flex"
          >
            <Ticket className="h-4 w-4" />
            Mua vé
          </Link>

          {/* Avatar / Đăng nhập */}
          {user ? (
            <div className="relative hidden sm:block" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center gap-1 p-0.5 rounded-full ring-2 ring-transparent transition-all hover:ring-white/20 active:scale-95 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                aria-label="Tài khoản"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName ?? "avatar"}
                    className="h-9 w-9 xl:h-10 xl:w-10 rounded-full object-cover border border-white/10"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="grid h-9 w-9 xl:h-10 xl:w-10 place-items-center rounded-full bg-red-600/90 border border-white/10 text-white">
                    <User className="h-5 w-5" />
                  </span>
                )}
                <ChevronDown className="h-4 w-4 text-white ml-0.5 hidden sm:block" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-zinc-700 bg-cinema-surface py-2 shadow-xl">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate("/profile");
                    }}
                    className="w-full text-left border-b border-zinc-700 px-4 py-3 hover:bg-white/5 transition-colors"
                  >
                    <p className="truncate text-sm font-medium text-white">
                      {user.displayName ?? "Người dùng"}
                    </p>
                    <p className="truncate text-xs text-zinc-400">
                      {user.email}
                    </p>
                  </button>
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
              className="hidden items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white transition-all bg-red-600 hover:bg-red-700 shadow-[0_0_15px_rgba(220,38,38,0.4)] sm:flex drop-shadow-md"
              aria-label="Tài khoản"
            >
              Đăng nhập
            </button>
          )}

          <button
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-full p-2.5 text-white transition-colors hover:bg-white/10 md:hidden drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
            aria-label="Mở menu"
          >
            {menuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="absolute top-full left-0 w-full bg-cinema-bg/95 backdrop-blur-xl border-b border-white/10 md:hidden pb-4 shadow-xl">
          <div className="space-y-1 px-4 sm:px-6 pt-2">
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