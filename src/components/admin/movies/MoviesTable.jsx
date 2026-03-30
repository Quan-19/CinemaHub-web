import { Pencil, Trash2, Eye, Film } from "lucide-react";
import { useState } from "react";
import MovieDetailModal from "./MovieDetailModal";

export default function MoviesTable({ movies, onEdit, onDelete }) {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const today = new Date();

  // Mảng màu sắc đa dạng cho thể loại
  const genreColors = [
    { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30" },
    { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/30" },
    { bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/30" },
    { bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/30" },
    { bg: "bg-purple-500/20", text: "text-purple-400", border: "border-purple-500/30" },
    { bg: "bg-pink-500/20", text: "text-pink-400", border: "border-pink-500/30" },
    { bg: "bg-indigo-500/20", text: "text-indigo-400", border: "border-indigo-500/30" },
    { bg: "bg-teal-500/20", text: "text-teal-400", border: "border-teal-500/30" },
    { bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/30" },
    { bg: "bg-cyan-500/20", text: "text-cyan-400", border: "border-cyan-500/30" },
    { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/30" },
    { bg: "bg-rose-500/20", text: "text-rose-400", border: "border-rose-500/30" },
  ];

  // Hàm lấy màu dựa trên tên thể loại
  const getGenreColor = (genreName) => {
    // Tạo hash từ tên thể loại để có màu nhất quán
    let hash = 0;
    for (let i = 0; i < genreName.length; i++) {
      hash = ((hash << 5) - hash) + genreName.charCodeAt(i);
      hash = hash & hash;
    }
    const index = Math.abs(hash) % genreColors.length;
    return genreColors[index];
  };

  // Hàm chuyển đổi status theo ngày
  const getStatus = (movie) => {
    if (!movie.releaseDate) return "coming_soon";
    const releaseDate = new Date(movie.releaseDate);
    if (releaseDate > today) return "coming_soon";
    if (releaseDate <= today && movie.status === "now_showing")
      return "now_showing";
    return "ended";
  };

  // Format ngày hiển thị theo định dạng DD/MM/YYYY
  const formatDisplayDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleViewDetail = (movie) => {
    setSelectedMovie(movie);
    setShowDetailModal(true);
  };

  const getStatusText = (status) => {
    switch (status) {
      case "now_showing":
        return "Đang chiếu";
      case "coming_soon":
        return "Sắp chiếu";
      case "ended":
        return "Đã kết thúc";
      default:
        return "Không xác định";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "now_showing":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "coming_soon":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "ended":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  // Hàm xử lý genre
  const parseGenres = (genre) => {
    if (!genre) return [];
    if (Array.isArray(genre)) return genre;
    if (typeof genre === "string") {
      const cleaned = genre
        .replace(/[\[\]{}]/g, "")
        .replace(/\n/g, ",")
        .replace(/"/g, "")
        .trim();
      return cleaned.split(/[,，]+/).map(g => g.trim()).filter(Boolean);
    }
    return [];
  };

  return (
    <>
      <div className="bg-[#0b0f1f] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-300">
            {/* HEADER */}
            <thead className="bg-[#020617] text-gray-400 sticky top-0">
              <tr>
                <th className="px-4 py-3">STT</th>
                <th className="px-4 py-3">Poster</th>
                <th className="px-4 py-3">Tên phim</th>
                <th className="px-4 py-3">Thể loại</th>
                <th className="px-4 py-3">Đạo diễn</th>
                <th className="px-4 py-3">TG (phút)</th>
                <th className="px-4 py-3">Phân loại</th>
                <th className="px-4 py-3">Ngày chiếu</th>
                <th className="px-4 py-3">Đánh giá</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-center">Thao tác</th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {movies && movies.length > 0 ? (
                movies.map((m, index) => {
                  const status = getStatus(m);
                  const genres = parseGenres(m.genre);
                  
                  return (
                    <tr
                      key={m.id || index}
                      className="border-t border-white/5 hover:bg-white/5 transition-colors cursor-pointer group"
                      onClick={() => handleViewDetail(m)}
                    >
                      <td className="px-4 py-3 text-gray-400 font-mono">
                        {String(index + 1).padStart(3, "0")}
                      </td>

                      {/* POSTER */}
                      <td className="px-4 py-3">
                        {m.poster ? (
                          <img
                            src={m.poster}
                            alt={m.title}
                            className="w-12 h-16 object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='64' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Crect x='2' y='2' width='20' height='20' rx='2.18' ry='2.18'%3E%3C/rect%3E%3Cline x1='8' y1='2' x2='8' y2='22'%3E%3C/line%3E%3Cline x1='16' y1='2' x2='16' y2='22'%3E%3C/line%3E%3Cline x1='2' y1='8' x2='22' y2='8'%3E%3C/line%3E%3Cline x1='2' y1='16' x2='22' y2='16'%3E%3C/line%3E%3C/svg%3E";
                            }}
                          />
                        ) : (
                          <div className="w-12 h-16 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg flex items-center justify-center">
                            <Film size={24} className="text-gray-500" />
                          </div>
                        )}
                      </td>

                      {/* TÊN PHIM */}
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-white group-hover:text-red-400 transition-colors">
                            {m.title}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {m.originalTitle || "-"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {m.country || "-"}
                          </div>
                        </div>
                      </td>

                      {/* THỂ LOẠI - MÀU SẮC ĐẶC SẮC */}
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {genres.slice(0, 3).map((g, idx) => {
                            const colors = getGenreColor(g);
                            return (
                              <span
                                key={idx}
                                className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${colors.bg} ${colors.text} border ${colors.border} hover:scale-105 transition-all duration-200 cursor-help`}
                                title={`Thể loại: ${g}`}
                              >
                                {g}
                              </span>
                            );
                          })}
                          {genres.length > 3 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30">
                              +{genres.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* ĐẠO DIỄN */}
                      <td className="px-4 py-3 max-w-[150px] truncate">
                        <span className="text-gray-300">{m.director || "-"}</span>
                      </td>

                      {/* THỜI LƯỢNG */}
                      <td className="px-4 py-3">
                        <span className="font-mono text-gray-300">
                          {m.duration || "-"}
                        </span>
                      </td>

                      {/* PHÂN LOẠI */}
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-yellow-500/20 text-yellow-400 text-xs font-bold border border-yellow-500/30">
                          {m.ageRating || "P"}
                        </span>
                      </td>

                      {/* NGÀY */}
                      <td className="px-4 py-3 text-xs font-mono">
                        {formatDisplayDate(m.releaseDate)}
                      </td>

                      {/* ĐÁNH GIÁ */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-400">★</span>
                          <span className="font-semibold text-white">
                            {m.rating?.toFixed(1) || "0.0"}
                          </span>
                          <span className="text-xs text-gray-500">/10</span>
                        </div>
                      </td>

                      {/* TRẠNG THÁI */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-1 text-xs rounded-md font-medium border ${getStatusColor(
                            status
                          )}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            status === "now_showing" ? "bg-green-400" :
                            status === "coming_soon" ? "bg-yellow-400" : "bg-gray-400"
                          }`}></span>
                          {getStatusText(status)}
                        </span>
                      </td>

                      {/* ACTION */}
                      <td className="px-4 py-3">
                        <div
                          className="flex justify-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleViewDetail(m)}
                            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors group/btn"
                            title="Xem chi tiết"
                          >
                            <Eye size={18} className="text-gray-400 group-hover/btn:text-white transition-colors" />
                          </button>
                          <button
                            onClick={() => onEdit(m)}
                            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors group/btn"
                            title="Chỉnh sửa"
                          >
                            <Pencil size={18} className="text-blue-400 group-hover/btn:text-blue-300 transition-colors" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Bạn có chắc muốn xóa phim "${m.title}"?`)) {
                                onDelete(m.id);
                              }
                            }}
                            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors group/btn"
                            title="Xóa phim"
                          >
                            <Trash2 size={18} className="text-red-400 group-hover/btn:text-red-300 transition-colors" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={11} className="text-center text-gray-400 py-10">
                    <div className="flex flex-col items-center gap-2">
                      <Film size={48} className="text-gray-600" />
                      <p>Không có dữ liệu phim</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal chi tiết */}
      <MovieDetailModal
        show={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        movie={selectedMovie}
      />
    </>
  );
}