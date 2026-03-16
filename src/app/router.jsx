import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout.jsx";
import HomePage from "../pages/HomePage.jsx";
import MoviesPage from "../pages/MoviesPage.jsx";
import MovieDetailPage from "../pages/MovieDetailPage.jsx";
import CinemaPage from "../pages/CinemaPage.jsx";
import PromotionsPage from "../pages/PromotionsPage.jsx";
import AuthPage from "../pages/AuthPage.jsx";
import NotFoundPage from "../pages/NotFoundPage.jsx";
import ProfilePage from "../pages/ProfilePage.jsx";
import CinemaSelectionPage from "../pages/CinemaSelectionPage.jsx";
import SeatSelectionPage from "../pages/SeatSelectionPage.jsx";
import BookingConfirmationPage from "../pages/BookingConfirmationPage.jsx";
import TicketPage from "../pages/TicketPage.jsx";

// Admin pages
import AdminLayout from "../layouts/AdminLayout.jsx";
import Dashboard from "../pages/admin/Dashboard.jsx";
import Movies from "../pages/admin/Movies.jsx";
import Orders from "../pages/admin/Orders.jsx";
import Customers from "../pages/admin/Customers.jsx";
import Rooms from "../pages/admin/Rooms.jsx";
import Showtimes from "../pages/admin/Showtimes.jsx";
import Revenue from "../pages/admin/Revenue.jsx";

export const router = createBrowserRouter([
    {
      path: "/",
      loader: () => {
        window.location.replace("/admin");
        return null;
      },
    },
  // {
  //   path: "/",
  //   element: <MainLayout />,
  //   children: [
  //     {
  //       index: true,
  //       element: <HomePage />,
  //     },
  //     {
  //       path: "movies",
  //       element: <MoviesPage />,
  //     },
  //     {
  //       path: "movies/:id",
  //       element: <MovieDetailPage />,
  //     },
  //     {
  //       path: "booking/confirm",
  //       element: <BookingConfirmationPage />,
  //     },
  //     {
  //       path: "booking/:movieId",
  //       element: <CinemaSelectionPage />,
  //     },
  //     {
  //       path: "seats/:movieId/:cinemaId/:showtimeId",
  //       element: <SeatSelectionPage />,
  //     },
  //     {
  //       path: "ticket/:bookingCode",
  //       element: <TicketPage />,
  //     },
  //     {
  //       path: "cinemas",
  //       element: <CinemaPage />,
  //     },
  //     {
  //       path: "promotions",
  //       element: <PromotionsPage />,
  //     },
  //     {
  //       path: "auth",
  //       element: <AuthPage />,
  //     },
  //     {
  //       path: "profile",
  //       element: <ProfilePage />,
  //     },
  //     {
  //       path: "*",
  //       element: <NotFoundPage />,
  //     },
  //   ],
  // },
  {
    // Admin routes
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "movies",
        element: <Movies />,
      },
      {
        path: "orders",
        element: <Orders />,
      },
      {
        path: "customers",
        element: <Customers />,
      },
      {
        path: "rooms",
        element: <Rooms />,
      },
      {
        path: "showtimes",
        element: <Showtimes />,
      },
      {
        path: "revenue",
        element: <Revenue />,
      },
    ],
  }
]);
