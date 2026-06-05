import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import toast from "react-hot-toast";

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
  const [currentPage, setCurrentPage] = useState(1);
  const moviesPerPage = 10;

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
    description: "",
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
      toast.error("Lỗi tải phim");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  // ================= FILTER =================
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const filtered = movies.filter((m) => {
    const matchSearch = m.title?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || m.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / moviesPerPage);
  const paginatedMovies = filtered.slice(
    (currentPage - 1) * moviesPerPage,
    currentPage * moviesPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

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
      description: movie.description || "",
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
      toast.error(error);
      return;
    }

    try {
      setUploading(true);

      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        toast.error("Chưa đăng nhập");
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
      formDataToSend.append("description", formData.description || "");

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
      toast.success(
        editingMovie ? "Cập nhật phim thành công!" : "Thêm phim thành công!"
      );
    } catch (err) {
      console.error("SAVE ERROR:", err);
      toast.error(err.message || "Lỗi lưu phim");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="sticky top-0 z-10 space-y-4 bg-cinema-bg pb-4 pt-1 shadow-sm">
        <MoviesHeader total={movies.length} onAdd={handleAdd} />
        <MoviesStats movies={movies} />

        <MoviesFilter
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-10">
          Đang tải dữ liệu...
        </div>
      ) : (
        <>
          <MoviesTable
            movies={paginatedMovies}
            onEdit={handleEdit}
            onDelete={() => {}}
          />
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 py-4">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-cinema-surface text-gray-400 transition hover:bg-white/5 disabled:opacity-50"
              >
                &lt;
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => handlePageChange(page)}
                    className={[
                      "flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold transition",
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "border border-white/10 bg-cinema-surface text-gray-400 hover:bg-white/5",
                    ].join(" ")}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-cinema-surface text-gray-400 transition hover:bg-white/5 disabled:opacity-50"
              >
                &gt;
              </button>
            </div>
          )}
        </>
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
