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

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
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
