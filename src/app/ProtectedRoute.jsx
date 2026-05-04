import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  const twoFactorVerified =
    localStorage.getItem("twoFactorVerified") === "true" ||
    sessionStorage.getItem("twoFactorVerified") === "true";

  console.log(
    "🔵 ProtectedRoute - path:",
    location.pathname,
    "2FA:",
    twoFactorVerified,
    "user:",
    user?.email
  );

  if (loading) {
    return (
      <div className="p-8 text-center text-zinc-400">
        Đang kiểm tra quyền...
      </div>
    );
  }

  // 🔥 TUYỆT ĐỐI KHÔNG REDIRECT NẾU ĐANG Ở TRANG 2FA HOẶC AUTH
  if (location.pathname === "/2fa" || location.pathname === "/auth") {
    console.log("🔵 On 2FA or Auth page, skip redirect");
    return children;
  }

  // Kiểm tra 2FA cho admin
  const needs2FA = user && user.role === "admin" && !twoFactorVerified;

  if (needs2FA) {
    console.log("🔵 2FA required, redirecting to /2fa");
    // Lưu email để dùng ở trang 2FA
    localStorage.setItem("pending2FAEmail", user.email);
    return (
      <Navigate to={`/2fa?email=${encodeURIComponent(user.email)}`} replace />
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="p-8 text-center text-red-400">
        Bạn không có quyền truy cập trang này.
      </div>
    );
  }

  return children;
}
