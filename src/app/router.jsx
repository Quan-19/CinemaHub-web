import { createBrowserRouter, Navigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
// Layouts
import MainLayout from "../layouts/MainLayout.jsx";
import AdminLayout from "../layouts/AdminLayout.jsx";
import StaffLayout from "../layouts/StaffLayout.jsx";

// Pages
import HomePage from "../pages/HomePage.jsx";
import MoviesPage from "../pages/MoviesPage.jsx";
import { MovieDetailPage } from "../pages/MovieDetailPage.jsx";
import CinemaPage from "../pages/CinemaPage.jsx";
import PromotionsPage from "../pages/PromotionsPage.jsx";
import AuthPage from "../pages/AuthPage.jsx";
import NotFoundPage from "../pages/NotFoundPage.jsx";
import ProfilePage from "../pages/ProfilePage.jsx";
import CinemaSelectionPage from "../pages/CinemaSelectionPage.jsx";
import SeatSelectionPage from "../pages/SeatSelectionPage.jsx";
import BookingConfirmationPage from "../pages/BookingConfirmationPage.jsx";
import TicketPage from "../pages/TicketPage.jsx";
import PaymentResultPage from "../pages/PaymentResult.jsx";
import NotificationPage from "../pages/NotificationPage.jsx";

// Admin pages
import Dashboard from "../pages/admin/Dashboard.jsx";
import Movies from "../pages/admin/Movies.jsx";
import Orders from "../pages/admin/Orders.jsx";
import Customers from "../pages/admin/Customers.jsx";
import Rooms from "../pages/admin/Rooms.jsx";
import Showtimes from "../pages/admin/Showtimes.jsx";
import Revenue from "../pages/admin/Revenue.jsx";
import AdminPricingPage from "../pages/admin/AdminPricingPage.jsx";
import Cinemas from "../pages/admin/Cinemas.jsx";
import AccountsPage from "../pages/admin/AccountsPage.jsx";
import AdminPromotionsPage from "../pages/admin/AdminPromotionsPage";
import Foods from "../pages/admin/Foods.jsx";
import TwoFAPage from "../pages/TwoFAPage.jsx";
// Staff pages
import StaffDashboardPage from "../pages/staff/StaffDashboardPage.jsx";
import StaffMoviesPage from "../pages/staff/StaffMoviesPage.jsx";
import StaffPromotionsPage from "../pages/staff/StaffPromotionsPage.jsx";
import StaffProfilePage from "../pages/staff/StaffProfilePage.jsx";
import StaffRoomsPage from "../pages/staff/StaffRoomsPage.jsx";
import StaffShowtimesPage from "../pages/staff/StaffShowtimesPage.jsx";
import StaffRevenuePage from "../pages/staff/StaffRevenuePage.jsx";
import StaffBannersPage from "../pages/staff/StaffBannersPage.jsx";
import StaffArticlesPage from "../pages/staff/StaffArticlesPage.jsx";
import StaffScannerPage from "../pages/staff/StaffScannerPage.jsx";

// ✅ AuthContext hook
import { useAuth } from "../context/AuthContext.jsx";

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  const twoFactorVerified = 
    localStorage.getItem('twoFactorVerified') === 'true' || 
    sessionStorage.getItem('twoFactorVerified') === 'true';

  console.log("🔵 ProtectedRoute - path:", location.pathname, "2FA:", twoFactorVerified, "user:", user?.email);

  if (loading) {
    return <div className="p-8 text-center text-zinc-400">Đang kiểm tra quyền...</div>;
  }

  // 🔥 TUYỆT ĐỐI KHÔNG REDIRECT NẾU ĐANG Ở TRANG 2FA HOẶC AUTH
  if (location.pathname === "/2fa" || location.pathname === "/auth") {
    console.log("🔵 On 2FA or Auth page, skip redirect");
    return children;
  }

  // Kiểm tra 2FA cho admin/staff
  const needs2FA = user && (user.role === 'admin' ) && !twoFactorVerified;
  
  if (needs2FA) {
    console.log("🔵 2FA required, redirecting to /2fa");
    // Lưu email để dùng ở trang 2FA
    localStorage.setItem("pending2FAEmail", user.email);
    return <Navigate to={`/2fa?email=${encodeURIComponent(user.email)}`} replace />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <div className="p-8 text-center text-red-400">Bạn không có quyền truy cập trang này.</div>;
  }

  return children;
}

// Router export - GIỮ NGUYÊN PHẦN CÒN LẠI
export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "movies", element: <MoviesPage /> },
      { path: "movies/:id", element: <MovieDetailPage /> },
      {
        path: "booking/:movieId/:cinemaId/:showtimeId",
        element: <SeatSelectionPage />,
      },
      { path: "booking/confirm", element: <BookingConfirmationPage /> },
      { path: "payment-result", element: <PaymentResultPage /> },
      { path: "booking/:movieId", element: <CinemaSelectionPage /> },
      { path: "seats/:showtimeId", element: <SeatSelectionPage /> },
      { path: "ticket/:bookingCode", element: <TicketPage /> },
      { path: "cinemas", element: <CinemaPage /> },
      { path: "promotions", element: <PromotionsPage /> },
      { path: "auth", element: <AuthPage /> },
      { path: "2fa", element: <TwoFAPage /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "notifications", element: <NotificationPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "dashboard", element: <Dashboard /> },
      { path: "movies", element: <Movies /> },
      { path: "cinemas", element: <Cinemas /> },
      { path: "orders", element: <Orders /> },
      { path: "customers", element: <Customers /> },
      { path: "rooms", element: <Rooms /> },
      { path: "showtimes", element: <Showtimes /> },
      { path: "revenue", element: <Revenue /> },
      { path: "prices", element: <AdminPricingPage /> },
      { path: "accounts", element: <AccountsPage /> },
      { path: "promotions", element: <AdminPromotionsPage /> },
      { path: "foods", element: <Foods /> },
    ],
  },
  {
    path: "/staff",
    element: (
      <ProtectedRoute allowedRoles={["staff"]}>
        <StaffLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <StaffDashboardPage /> },
      { path: "profile", element: <StaffProfilePage /> },
      { path: "movies", element: <StaffMoviesPage /> },
      { path: "showtimes", element: <StaffShowtimesPage /> },
      { path: "revenue", element: <StaffRevenuePage /> },
      { path: "rooms", element: <StaffRoomsPage /> },
      { path: "promotions", element: <StaffPromotionsPage /> },
      { path: "scanner", element: <StaffScannerPage /> },
    ],
  },
]);
