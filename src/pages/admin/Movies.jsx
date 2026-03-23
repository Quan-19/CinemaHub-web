// Movies.jsx
import { useState, useEffect } from "react";
import MoviesStats from "../../components/admin/movies/MoviesStats";
import MoviesFilter from "../../components/admin/movies/MoviesFilter";
import MoviesTable from "../../components/admin/movies/MoviesTable";
import MovieModal from "../../components/admin/movies/MovieModal";
import MoviesHeader from "../../components/admin/movies/MoviesHeader";
import { mockMovies } from "../../data/movies.data";

export default function MoviesPage() {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  const defaultForm = {
    title: "",
    originalTitle: "",
    director: "",
    cast: "",
    country: "",
    releaseDate: "",
    duration: 0,
    rating: "P",
    status: "coming-soon",
    genre: [],
  };

  const [form, setForm] = useState(defaultForm);

  // Load movies from localStorage or mock data
  useEffect(() => {
    const loadMovies = () => {
      try {
        const savedMovies = localStorage.getItem('movies');
        if (savedMovies && JSON.parse(savedMovies).length > 0) {
          setMovies(JSON.parse(savedMovies));
        } else {
          setMovies(mockMovies);
          localStorage.setItem('movies', JSON.stringify(mockMovies));
        }
      } catch (error) {
        console.error("Failed to load movies:", error);
        setMovies(mockMovies);
      } finally {
        setLoading(false);
      }
    };
    loadMovies();
  }, []);

  // Save movies to localStorage whenever they change
  useEffect(() => {
    if (movies.length > 0 && !loading) {
      localStorage.setItem('movies', JSON.stringify(movies));
    }
  }, [movies, loading]);

  // FILTER
  const filtered = movies.filter((m) => {
    const matchSearch = m.title?.toLowerCase().includes(search.toLowerCase()) || false;
    const matchStatus = statusFilter === "all" || m.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleAdd = () => {
    setEditingMovie(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const handleEdit = (movie) => {
    setEditingMovie(movie);
    setForm(movie);
    setShowModal(true);
  };

  const handleSave = () => {
    if (editingMovie) {
      // UPDATE
      setMovies((prev) =>
        prev.map((m) =>
          m.id === editingMovie.id ? { ...m, ...form } : m
        )
      );
    } else {
      // CREATE
      const newMovie = {
        id: Date.now(),
        ...form,
        ratingScore: 0,
        tickets: 0,
      };
      setMovies((prev) => [newMovie, ...prev]);
    }
    setShowModal(false);
    setEditingMovie(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa phim này?")) {
      setMovies((prev) => prev.filter((m) => m.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <MoviesHeader total={movies.length} onAdd={handleAdd} />
      <MoviesStats movies={movies} />
      <MoviesFilter
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />
      <MoviesTable
        movies={filtered}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <MovieModal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingMovie(null);
        }}
        onSave={handleSave}
        form={form}
        setForm={setForm}
        isEdit={!!editingMovie}
      />
    </div>
  );
}