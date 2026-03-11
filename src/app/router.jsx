import { createBrowserRouter } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout.jsx'
import HomePage from '../pages/HomePage.jsx'
import MoviesPage from '../pages/MoviesPage.jsx'
import MovieDetailPage from '../pages/MovieDetailPage.jsx'
import ShowtimesPage from '../pages/ShowtimesPage.jsx'
import PromotionsPage from '../pages/PromotionsPage.jsx'
import NotFoundPage from '../pages/NotFoundPage.jsx'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'movies',
        element: <MoviesPage />,
      },
      {
        path: 'movies/:id',
        element: <MovieDetailPage />,
      },
      {
        path: 'showtimes',
        element: <ShowtimesPage />,
      },
      {
        path: 'promotions',
        element: <PromotionsPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])
