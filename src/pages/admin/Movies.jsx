import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";

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
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const defaultForm = {
    title: "",
    originalTitle: "",
    director: "",
    cast: "",
    country: "",
    releaseDate: "",
    duration: "",
    ageRating: "P",
    status: "coming_soon",
    genre: [],
    language: "",
    subtitle: "",
    poster: null,
    backdrop: null,
    posterPreview: "",
    backdropPreview: "",
    trailer: "",
    rating: 0,
  };

  const [form, setForm] = useState(defaultForm);

  // ================= FETCH =================
  const fetchMovies = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/movies?scope=manage");
      const data = await res.json();
      setMovies(data || []);
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Lỗi tải phim");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  // ================= FILTER =================
  const filtered = movies.filter((m) => {
    const matchSearch = m.title?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || m.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // ================= ADD =================
  const handleAdd = () => {
    setEditingMovie(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  // ================= EDIT =================
  const handleEdit = (movie) => {
    setEditingMovie(movie);
    setForm({
      title: movie.title || "",
      originalTitle: movie.originalTitle || "",
      director: movie.director || "",
      cast: movie.cast || "",
      country: movie.country || "",
      releaseDate: movie.releaseDate || "",
      duration: movie.duration || "",
      ageRating: movie.ageRating || "P",
      status: movie.status || "coming_soon",
      genre: Array.isArray(movie.genre)
        ? movie.genre
        : movie.genre
        ? movie.genre.split(",")
        : [],
      language: movie.language || "",
      subtitle: movie.subtitle || "",
      poster: null,
      backdrop: null,
      posterPreview: movie.poster || "",
      backdropPreview: movie.backdrop || "",
      trailer: movie.trailer || "",
      rating: movie.rating || 0,
    });
    setShowModal(true);
  };

  // ================= VALIDATE =================
  const validateForm = () => {
    if (!form.title) return "Tên phim không được bỏ trống";
    if (!form.releaseDate) return "Phải có ngày khởi chiếu";
    if (!form.duration || form.duration <= 0) return "Thời lượng không hợp lệ";
    if (form.duration > 500) return "Thời lượng không hợp lệ (tối đa 500 phút)";
    if (form.rating < 0 || form.rating > 10)
      return "Điểm đánh giá phải từ 0-10";
    return null;
  };

  // ================= SAVE =================
  const handleSave = async (formData) => {
    const error = validateForm();
    if (error) {
      alert(error);
      return;
    }

    try {
      setUploading(true);

      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        alert("Chưa đăng nhập");
        return;
      }

      const token = await user.getIdToken();

      // Tạo FormData để gửi file
      const formDataToSend = new FormData();

      // Thêm text fields
      formDataToSend.append("title", formData.title.trim());
      formDataToSend.append("originalTitle", formData.originalTitle || "");
      formDataToSend.append("director", formData.director || "");
      formDataToSend.append("cast", formData.cast || "");
      formDataToSend.append("country", formData.country || "");
      formDataToSend.append("releaseDate", formData.releaseDate);
      formDataToSend.append("duration", Number(formData.duration));
      formDataToSend.append("ageRating", formData.ageRating);
      formDataToSend.append("status", formData.status);
      formDataToSend.append("genre", JSON.stringify(formData.genre));
      formDataToSend.append("language", formData.language || "");
      formDataToSend.append("subtitle", formData.subtitle || "");
      formDataToSend.append("trailer", formData.trailer || "");
      formDataToSend.append("rating", formData.rating || 0);

      // Thêm file nếu có
      if (formData.poster && formData.poster instanceof File) {
        formDataToSend.append("poster", formData.poster);
      }
      if (formData.backdrop && formData.backdrop instanceof File) {
        formDataToSend.append("backdrop", formData.backdrop);
      }

      const url = editingMovie
        ? `http://localhost:5000/api/movies/${editingMovie.id}`
        : `http://localhost:5000/api/movies`;

      const method = editingMovie ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Save failed");
      }

      await fetchMovies();
      setShowModal(false);
      setForm(defaultForm);
      setEditingMovie(null);
      alert(
        editingMovie ? "Cập nhật phim thành công!" : "Thêm phim thành công!"
      );
    } catch (err) {
      console.error("SAVE ERROR:", err);
      alert(err.message || "Lỗi lưu phim");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-5">
      <MoviesHeader total={movies.length} onAdd={handleAdd} />
      <MoviesStats movies={movies} />

      <MoviesFilter
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      {loading ? (
        <div className="text-center text-gray-400 py-10">
          Đang tải dữ liệu...
        </div>
      ) : (
        <MoviesTable
          movies={filtered}
          onEdit={handleEdit}
          onDelete={() => {}}
        />
      )}

      <MovieModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        form={form}
        setForm={setForm}
        isEdit={!!editingMovie}
        uploading={uploading}
      />
    </div>
  );
}
