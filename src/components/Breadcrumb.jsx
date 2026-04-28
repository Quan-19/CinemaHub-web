import { ChevronRight, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const pathLabels = {
  movies: "Phim",
  cinemas: "Rạp chiếu",
  promotions: "Khuyến mãi",
  booking: "Đặt vé",
  seats: "Chọn ghế",
  confirm: "Xác nhận",
  ticket: "Vé của tôi",
  profile: "Tài khoản",
  notifications: "Thông báo",
  auth: "Đăng nhập",
};

export default function Breadcrumb() {
  const location = useLocation();
  const paths = location.pathname.split("/").filter(Boolean);

  if (paths.length === 0) return null;

  return (
    <nav className="w-full py-3 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <ol className="flex items-center gap-2 text-sm">
          <li>
            <Link
              to="/"
              className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Trang chủ</span>
            </Link>
          </li>
          {paths.map((segment, index) => {
            const isLast = index === paths.length - 1;
            const label = pathLabels[segment] || segment;
            return (
              <li key={segment + index} className="flex items-center gap-2">
                <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
                {isLast ? (
                  <span className="text-white font-medium">{label}</span>
                ) : (
                  <span className="text-zinc-400">{label}</span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}

