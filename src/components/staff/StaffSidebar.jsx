import { NavLink, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Clock,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Tag,
  Theater,
  User,
  X,
  FileText,
  DollarSign,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

function SidebarLink({ to, icon: Icon, label, collapsed, onNavigate }) {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={({ isActive }) =>
        [
          "group flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-gradient-to-r from-cinema-primary/25 to-cinema-primary-dark/10 text-white ring-1 ring-cinema-primary/25"
            : "text-zinc-300 hover:bg-zinc-900/40 hover:text-white",
          collapsed ? "justify-center" : "",
        ].join(" ")
      }
      end={to === "/staff"}
    >
      {({ isActive }) => (
        <>
          <span
            className={[
              "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border transition-colors",
              isActive
                ? "border-cinema-primary/30 bg-cinema-primary/15 text-cinema-primary"
                : "border-zinc-700 bg-zinc-950/10 text-zinc-200 group-hover:border-zinc-700",
            ].join(" ")}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          {!collapsed && <span className="truncate">{label}</span>}
        </>
      )}
    </NavLink>
  );
}

function StaffSidebar({ collapsed, onToggle, mobileOpen = false, onClose }) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleNavigate = () => {
    if (typeof onClose === "function") onClose();
  };

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/auth");
    if (typeof onClose === "function") onClose();
  };

  return (
    <aside
      className={[
        "fixed inset-y-0 left-0 z-50 flex h-screen shrink-0 flex-col overflow-hidden border-r border-zinc-700 bg-indigo-950/20 backdrop-blur-xl transition-all duration-300 lg:sticky lg:top-0 lg:translate-x-0 lg:bg-indigo-950/35 lg:backdrop-blur-none",
        mobileOpen ? "translate-x-0" : "-translate-x-full",
        "w-[86vw] max-w-[320px] sm:w-[320px]",
        collapsed ? "lg:w-20" : "lg:w-[280px]",
      ].join(" ")}
    >
      <div
        className={[
          "flex items-center justify-between gap-2 py-4",
          collapsed ? "px-3" : "px-4",
        ].join(" ")}
      >
        <div
          className={[
            "flex items-center gap-2",
            collapsed ? "justify-start" : "",
          ].join(" ")}
        >
          <div
            className={[
              "flex items-center justify-center bg-cinema-primary text-white",
              collapsed ? "h-9 w-9 rounded-xl" : "h-10 w-10 rounded-2xl",
            ].join(" ")}
          >
            <span className={collapsed ? "text-base font-black" : "text-lg font-black"}>
              ★
            </span>
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="text-sm font-bold tracking-wide">EBIZCINEMA</div>
              <div className="text-xs text-zinc-400">Quản lý rạp</div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onToggle}
          className="hidden lg:inline-flex rounded p-1 hover:bg-white/10"
          aria-label={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
          title={collapsed ? "Mở rộng" : "Thu gọn"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-700 bg-cinema-surface text-zinc-200 hover:bg-zinc-900 lg:hidden"
          aria-label="Đóng menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div
        className="flex-1 overflow-y-auto px-3 pb-8 scrollbar-none"
        style={{
          maskImage: "linear-gradient(to bottom, black 85%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 85%, transparent 100%)",
        }}
      >
        {!collapsed && (
          <div className="mb-3 rounded-2xl border border-zinc-700 bg-cinema-surface px-3 py-2 text-xs text-zinc-300">
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cinema-primary" />
              Quản lý rạp
            </span>
          </div>
        )}

        {!collapsed && (
          <div className="mb-2 px-2 text-[11px] font-semibold text-zinc-400">
            TỔNG QUAN
          </div>
        )}
        <nav className="space-y-1">
          <SidebarLink
            to="/staff"
            icon={LayoutDashboard}
            label="Dashboard"
            collapsed={collapsed}
            onNavigate={handleNavigate}
          />
          <SidebarLink
            to="/staff/profile"
            icon={User}
            label="Hồ sơ"
            collapsed={collapsed}
            onNavigate={handleNavigate}
          />
        </nav>

        {!collapsed && (
          <div className="mt-5 mb-2 px-2 text-[11px] font-semibold text-zinc-400">
            QUẢN LÝ
          </div>
        )}
        <nav className="space-y-1">
          <SidebarLink
            to="/staff/banners"
            icon={Megaphone}
            label="Banner quảng cáo"
            collapsed={collapsed}
            onNavigate={handleNavigate}
          />
          <SidebarLink
            to="/staff/articles"
            icon={FileText}
            label="Quản lý bài viết"
            collapsed={collapsed}
            onNavigate={handleNavigate}
          />
          <SidebarLink
            to="/staff/movies"
            icon={Clapperboard}
            label="Quản lý phim"
            collapsed={collapsed}
            onNavigate={handleNavigate}
          />
          <SidebarLink
            to="/staff/showtimes"
            icon={Clock}
            label="Suất chiếu"
            collapsed={collapsed}
            onNavigate={handleNavigate}
          />
          <SidebarLink
            to="/staff/revenue"
            icon={DollarSign}
            label="Doanh thu"
            collapsed={collapsed}
            onNavigate={handleNavigate}
          />
          <SidebarLink
            to="/staff/rooms"
            icon={Theater}
            label="Phòng chiếu & Ghế"
            collapsed={collapsed}
            onNavigate={handleNavigate}
          />
          <SidebarLink
            to="/staff/promotions"
            icon={Tag}
            label="Khuyến mãi"
            collapsed={collapsed}
            onNavigate={handleNavigate}
          />
        </nav>
      </div>

      <div className="mt-auto p-3">
        <div
          className={[
            "rounded-2xl border border-zinc-700 bg-cinema-surface",
            collapsed ? "px-2 py-2" : "px-3 py-3",
          ].join(" ")}
        >
          <div
            className={[
              "flex items-center gap-3",
              collapsed ? "justify-center" : "",
            ].join(" ")}
          >
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-zinc-900 text-xs font-semibold text-zinc-100 ring-1 ring-zinc-700">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "User"}
                  className="h-full w-full object-cover"
                />
              ) : (
                user?.displayName?.slice(0, 2).toUpperCase() || "NV"
              )}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">
                  {user?.displayName || "Nhân viên"}
                </div>
                <div className="truncate text-[11px] text-zinc-400">
                  {user?.email || "staff@EbizCinema.vn"}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            aria-label="Đăng xuất"
            title="Đăng xuất"
            className={[
              "inline-flex items-center justify-center transition",
              collapsed
                ? "mx-auto mt-2 h-9 w-9 rounded-full border border-zinc-700/80 bg-zinc-900/60 text-zinc-300 hover:border-cinema-primary/40 hover:bg-cinema-primary/10 hover:text-white"
                : "mt-3 w-full gap-2 rounded-xl border border-zinc-700 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900",
            ].join(" ")}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>Đăng xuất</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}

export default StaffSidebar;
