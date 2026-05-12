import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  Film,
  LogOut,
  Menu,
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
  { label: "Tin mới & ưu đãi", path: "/promotions" },
];

const movieDropdown = [
  { label: "Phim Đang Chiếu", path: "/movies?status=now-showing" },
  { label: "Phim Sắp Chiếu", path: "/movies?status=coming-soon" },
];

const cinemaDropdown = [
  { label: "Tất cả các rạp", path: "/cinemas" },
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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [movieDropdownOpen, setMovieDropdownOpen] = useState(false);
  const [cinemaDropdownOpen, setCinemaDropdownOpen] = useState(false);
  const userMenuRef = useRef(null);
  const movieDropdownRef = useRef(null);
  const cinemaDropdownRef = useRef(null);

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
      if (
        movieDropdownRef.current &&
        !movieDropdownRef.current.contains(e.target)
      ) {
        setMovieDropdownOpen(false);
      }
      if (
        cinemaDropdownRef.current &&
        !cinemaDropdownRef.current.contains(e.target)
      ) {
        setCinemaDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Navbar.jsx
  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();

    // 🔥 XÓA TẤT CẢ DỮ LIỆU
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("twoFactorVerified");
    localStorage.removeItem("twoFactorExpiry");
    localStorage.removeItem("pending2FAEmail");

    sessionStorage.clear();

    window.location.href = "/auth";
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled
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

        <nav
          className="hidden items-center gap-1 xl:gap-2 md:flex"
          aria-label="Main navigation"
        >
          <Link
            to="/"
            className={
              isLinkActive(location.pathname, "/")
                ? "rounded-full bg-white/20 backdrop-blur-md px-4 py-2 text-[15px] font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] border border-white/10"
                : "rounded-full px-4 py-2 text-[15px] font-semibold text-white/90 transition-all hover:bg-white/10 hover:text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
            }
          >
            Trang chủ
          </Link>

          {/* Phim dropdown */}
          <div className="relative" ref={movieDropdownRef}>
            <button
              onClick={() => setMovieDropdownOpen((o) => !o)}
              className={`flex items-center gap-1 rounded-full px-4 py-2 text-[15px] font-semibold transition-all drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ${
                isLinkActive(location.pathname, "/movies")
                  ? "bg-white/20 backdrop-blur-md text-white border border-white/10"
                  : "text-white/90 hover:bg-white/10 hover:text-white"
              }`}
            >
              Phim
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${movieDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>
            {movieDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 rounded-xl border border-zinc-700 bg-cinema-surface py-2 shadow-xl z-50 animate-fade-slide-up">
                {movieDropdown.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMovieDropdownOpen(false)}
                    className="block px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Rạp chiếu dropdown */}
          <div className="relative" ref={cinemaDropdownRef}>
            <button
              onClick={() => setCinemaDropdownOpen((o) => !o)}
              className={`flex items-center gap-1 rounded-full px-4 py-2 text-[15px] font-semibold transition-all drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ${
                isLinkActive(location.pathname, "/cinemas")
                  ? "bg-white/20 backdrop-blur-md text-white border border-white/10"
                  : "text-white/90 hover:bg-white/10 hover:text-white"
              }`}
            >
              Rạp chiếu
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${cinemaDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>
            {cinemaDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 rounded-xl border border-zinc-700 bg-cinema-surface py-2 shadow-xl z-50 animate-fade-slide-up">
                {cinemaDropdown.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setCinemaDropdownOpen(false)}
                    className="block px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            to="/promotions"
            className={
              isLinkActive(location.pathname, "/promotions")
                ? "rounded-full bg-white/20 backdrop-blur-md px-4 py-2 text-[15px] font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] border border-white/10"
                : "rounded-full px-4 py-2 text-[15px] font-semibold text-white/90 transition-all hover:bg-white/10 hover:text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
            }
          >
            Tin mới & Ưu đãi
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
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
            {user && (
              <div
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/profile");
                }}
                className="mb-4 flex items-center gap-4 rounded-2xl bg-gradient-to-r from-white/10 to-white/5 p-4 border border-white/10 active:scale-[0.98] transition-all shadow-lg cursor-pointer"
              >
                <div className="relative">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName}
                      className="h-12 w-12 rounded-full object-cover border-2 border-cinema-primary shadow-cinema-primary/20 shadow-md"
                    />
                  ) : (
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-cinema-primary to-cinema-primary-dark text-white border-2 border-white/10 shadow-lg">
                      <User className="h-6 w-6" />
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-cinema-bg" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-base font-bold text-white">
                    {user.displayName || "Người dùng"}
                  </p>
                  <p className="truncate text-xs text-zinc-400 font-medium">
                    {user.email}
                  </p>
                </div>
                <div className="rounded-full bg-white/5 p-2 border border-white/5">
                  <ChevronDown className="h-4 w-4 text-zinc-400 -rotate-90" />
                </div>
              </div>
            )}
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
