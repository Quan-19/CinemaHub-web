import { useState } from "react";
import MoviesStats from "../../components/admin/movies/MoviesStats";
import MoviesFilter from "../../components/admin/movies/MoviesFilter";
import MoviesTable from "../../components/admin/movies/MoviesTable";
import MovieModal from "../../components/admin/movies/MovieModal";
import MoviesHeader from "../../components/admin/movies/MoviesHeader";
import { mockMovies } from "../../data/movies.data";

export default function MoviesPage() {
  const [movies, setMovies] = useState(mockMovies);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);

  // 🔥 EDIT MODE
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
    status: "coming-soon",
    genre: [],
  };

  const [form, setForm] = useState(defaultForm);

  // FILTER
  const filtered = movies.filter((m) => {
    const matchSearch = m.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchStatus =
      statusFilter === "all" || m.status === statusFilter;

    return matchSearch && matchStatus;
  });

  // ✅ ADD
  const handleAdd = () => {
    setEditingMovie(null); // không edit
    setForm(defaultForm);
    setShowModal(true);
  };

  // ✅ EDIT
  const handleEdit = (movie) => {
    setEditingMovie(movie);
    setForm(movie);
    setShowModal(true);
  };

  // ✅ SAVE (CREATE + UPDATE)
  const handleSave = () => {
    if (editingMovie) {
      // 👉 UPDATE
      setMovies((prev) =>
        prev.map((m) =>
          m.id === editingMovie.id ? { ...m, ...form } : m
        )
      );
    } else {
      // 👉 CREATE
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

  // DELETE
  const handleDelete = (id) => {
    setMovies((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="p-6 space-y-5">

      <MoviesHeader
        total={movies.length}
        onAdd={handleAdd}
      />

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
        isEdit={!!editingMovie} // 🔥 truyền mode
      />

    </div>
  );
}