import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth"; // 🔥 THÊM DÒNG NÀY

import MoviesStats from "../../components/admin/movies/MoviesStats";
import MoviesFilter from "../../components/admin/movies/MoviesFilter";
import MoviesTable from "../../components/admin/movies/MoviesTable";
import MovieModal from "../../components/admin/movies/MovieModal";
import MoviesHeader from "../../components/admin/movies/MoviesHeader";

export default function MoviesPage() {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);

  const [editingMovie, setEditingMovie] = useState(null);

  const defaultForm = {
    title: "",
    originalTitle: "",
    director: "",
    cast: "",
    country: "",
    releaseDate: "",
    duration: 0,
    rating: "P",
    status: "coming_soon", // 🔥 FIX
    genre: [],
  };

  const [form, setForm] = useState(defaultForm);

  const formatDateForInput = (value) => {
    if (!value) return "";

    if (typeof value === "string") {
      const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
      if (match) return match[1];
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const parseGenre = (genreValue) => {
    if (Array.isArray(genreValue)) return genreValue;
    if (typeof genreValue === "string") {
      return genreValue
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return [];
  };

  // 🔹 FETCH
  const fetchMovies = async () => {
    const res = await fetch("http://localhost:5000/api/movies");
    const data = await res.json();
    setMovies(data);
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  // FILTER
  const filtered = movies.filter((m) => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || m.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // ADD
  const handleAdd = () => {
    setEditingMovie(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  // EDIT
  // ------------------- MoviesPage -------------------
  const handleEdit = (movie) => {
    setEditingMovie(movie);

    setForm({
      title: movie.title || "",
      originalTitle: movie.originalTitle || "",
      director: movie.director || "",
      cast: movie.cast || "",
      country: movie.country || "",
      releaseDate: movie.release_date
        ? new Date(movie.release_date).toISOString().split("T")[0]
        : "",
      duration: movie.duration ?? 0,
      ageRating: movie.ageRating || "P",
      status: movie.status || "coming_soon",
      genre:
        typeof movie.genre === "string"
          ? movie.genre.split(",").map((s) => s.trim())
          : Array.isArray(movie.genre)
            ? movie.genre
            : [],
      movie_id: movie.id,
    });

    setShowModal(true);
  };

  // ------------------- SAVE -------------------
  const handleSave = async (formData) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return alert("Chưa đăng nhập");

      const token = await user.getIdToken(true);

      // 🔹 Merge formData với editingMovie để patch
      const payload = {
        movie_id: editingMovie.id,
        title: formData.title?.trim() || editingMovie.title || "",
        originalTitle:
          formData.originalTitle?.trim() || editingMovie.original_title || "",
        director: formData.director?.trim() || editingMovie.director || "",
        cast: formData.cast?.trim() || editingMovie.cast || "",
        country: formData.country?.trim() || editingMovie.country || "",
        releaseDate:
          formData.releaseDate || formatDateForInput(editingMovie.release_date),
        duration:
          formData.duration === "" ||
          formData.duration === null ||
          formData.duration === undefined
            ? (editingMovie.duration ?? 0)
            : Number(formData.duration),
        ageRating: formData.ageRating || editingMovie.ageRating || "P",
        status: formData.status || editingMovie.status || "coming_soon",
        genre:
          Array.isArray(formData.genre) && formData.genre.length > 0
            ? formData.genre
            : parseGenre(editingMovie.genre),
      };

      console.log("FORM SEND:", payload);

      const res = await fetch(
        `http://localhost:5000/api/movies/${payload.movie_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();
      console.log("UPDATE RES:", data);

      await fetchMovies();
      setShowModal(false);
      setEditingMovie(null);
    } catch (err) {
      console.error("SAVE ERROR:", err);
    }
  };

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
      <MoviesTable movies={filtered} onEdit={handleEdit} onDelete={() => {}} />
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
