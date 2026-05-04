import {
  LayoutDashboard,
  Film,
  Building2,
  Armchair,
  Clock,
  FileText,
  DollarSign,
  Tag,
  BarChart3,
  Users,
  UserCog,
  Image,
  CreditCard,
  Database,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Package,
} from "lucide-react";

// expanded, setExpanded sẽ nhận từ props
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Sidebar(props) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  // Nhận props từ AdminLayout
  const expanded = props?.expanded ?? true;
  const setExpanded = props?.setExpanded ?? (() => {});
  const onNavigate = props?.onNavigate;

  const adminName = user?.displayName || user?.email?.split("@")[0] || "Admin";
  const adminEmail = user?.email || "";
  const adminInitial =
    String(adminName || "A")
      .trim()
      .charAt(0)
      .toUpperCase() || "A";

  // Sidebar.jsx
  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      // 🔥 XÓA TẤT CẢ DỮ LIỆU LIÊN QUAN ĐẾN AUTH VÀ 2FA
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("twoFactorVerified");
      localStorage.removeItem("twoFactorExpiry");
      localStorage.removeItem("pending2FAEmail");
      localStorage.removeItem("redirectAfter2FA");

      sessionStorage.removeItem("token");
      sessionStorage.removeItem("role");
      sessionStorage.removeItem("userEmail");
      sessionStorage.removeItem("twoFactorVerified");
      sessionStorage.removeItem("twoFactorExpiry");
      sessionStorage.removeItem("pending2FAEmail");

      navigate("/auth");
    }
  };

  const sections = [
    {
      title: "TỔNG QUAN",
      items: [
        { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
      ],
    },

    {
      title: "NỘI DUNG",
      items: [
        { name: "Quản lý phim", icon: Film, path: "/admin/movies" },
        { name: "Quản lý rạp", icon: Building2, path: "/admin/cinemas" },
        { name: "Phòng chiếu & Ghế", icon: Armchair, path: "/admin/rooms" },
        { name: "Suất chiếu", icon: Clock, path: "/admin/showtimes" },
      ],
    },

    {
      title: "KINH DOANH",
      items: [
        { name: "Đơn hàng", icon: FileText, path: "/admin/orders" },
        { name: "Combo & Đồ ăn", icon: Package, path: "/admin/foods" },
        { name: "Giá vé", icon: DollarSign, path: "/admin/prices" },
        { name: "Khuyến mãi", icon: Tag, path: "/admin/promotions" },
        { name: "Báo cáo doanh thu", icon: BarChart3, path: "/admin/revenue" },
      ],
    },

    {
      title: "HỆ THỐNG",
      items: [
        { name: "Tài khoản", icon: UserCog, path: "/admin/accounts" },
        { name: "Khách hàng", icon: Users, path: "/admin/customers" },
        // { name: "Banner quảng cáo", icon: Image, path: "/admin/banners" },
        // { name: "Bài viết", icon: FileText, path: "/admin/posts" },
        // { name: "Thanh toán", icon: CreditCard, path: "/admin/payments" },
        // { name: "Dữ liệu phụ trợ", icon: Database, path: "/admin/data" },
      ],
    },
  ];

  return (
    <aside
      className={`h-screen bg-cinema-bg border-r border-white/10 text-gray-200 flex flex-col transition-all duration-300
      ${expanded ? "w-64" : "w-20"}`}
    >
      {/* HEADER */}

      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold">
            ★
          </div>

          {expanded && (
            <div>
              <div className="font-bold text-red-500">EBIZCINEMA</div>
              <div className="text-xs text-gray-400">Quản trị viên</div>
            </div>
          )}
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 rounded hover:bg-white/10"
        >
          {expanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      {/* ROLE BADGE */}

      {expanded && (
        <div className="px-4 py-3">
          <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            {user?.role === "admin" ? "Quản trị viên" : "Đang đăng nhập"}
          </div>
        </div>
      )}

      {/* MENU */}

      <div className="flex-1 overflow-y-auto px-2">
        {sections.map((section, i) => (
          <div key={i} className="mb-4">
            {expanded && (
              <div className="text-xs text-gray-500 px-3 mb-2">
                {section.title}
              </div>
            )}

            <div className="space-y-1">
              {section.items.map((item, index) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={index}
                    to={item.path}
                    onClick={() => onNavigate?.()}
                    className={({ isActive }) =>
                      `flex items-center
                       ${expanded ? "gap-3 px-3" : "justify-center"}
                       py-2.5 rounded-lg text-sm transition-all
                       ${
                         isActive
                           ? "bg-gradient-to-r from-red-600 to-red-700 text-white"
                           : "text-gray-400 hover:bg-white/5 hover:text-white"
                       }`
                    }
                  >
                    <Icon size={18} />

                    {expanded && <span>{item.name}</span>}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* USER */}

      <div className="border-t border-white/10 p-3">
        {expanded && (
          <div className="bg-white/5 rounded-lg p-3 flex items-center gap-3">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="Avatar"
                className="w-8 h-8 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-sm font-bold">
                {adminInitial}
              </div>
            )}

            <div className="flex-1">
              <div className="text-sm font-semibold truncate">{adminName}</div>

              <div className="text-xs text-gray-400 truncate">{adminEmail}</div>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 mt-3 text-sm text-gray-400 hover:text-white"
        >
          <LogOut size={16} />
          {expanded && "Đăng xuất"}
        </button>
      </div>
    </aside>
  );
}
