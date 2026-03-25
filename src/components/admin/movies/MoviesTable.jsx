import { Pencil, Trash2 } from "lucide-react";

export default function MoviesTable({ movies, onEdit, onDelete }) {
  const today = new Date();

  // Hàm chuyển đổi status theo ngày
  const getStatus = (movie) => {
    const releaseDate = new Date(movie.releaseDate);
    if (releaseDate > today) return "coming_soon";
    if (releaseDate <= today && movie.status === "now_showing")
      return "now_showing";
    return "ended";
  };

  return (
    <div className="bg-[#0b0f1f] border border-white/10 rounded-xl overflow-hidden">
      <table className="w-full text-sm text-left text-gray-300">
        {/* HEADER */}
        <thead className="bg-[#020617] text-gray-400">
          <tr>
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Tên phim</th>
            <th className="px-4 py-3">Thể loại</th>
            <th className="px-4 py-3">Đạo diễn</th>
            <th className="px-4 py-3">TG (phút)</th>
            <th className="px-4 py-3">Phân loại</th>
            <th className="px-4 py-3">Ngày chiếu</th>
            <th className="px-4 py-3">Trạng thái</th>
            <th className="px-4 py-3">Điểm / Vé</th>
            <th className="px-4 py-3 text-right">Thao tác</th>
          </tr>
        </thead>

        {/* BODY */}
        <tbody>
          {movies && movies.length > 0 ? (
            movies.map((m, index) => {
              const status = getStatus(m);
              return (
                <tr
                  key={m.id || index}
                  className="border-t border-white/5 hover:bg-white/5"
                >
                  <td className="px-4 py-3">
                    MV{String(index + 1).padStart(3, "0")}
                  </td>

                  {/* TÊN PHIM + POSTER */}
                  <td className="px-4 py-3 flex items-center gap-2">
                    {m.poster && (
                      <img
                        src={m.poster}
                        alt={m.title}
                        className="w-12 h-16 object-cover rounded"
                      />
                    )}
                    <div>
                      <div className="font-medium text-white">{m.title}</div>
                      <div className="text-xs text-gray-400">
                        {m.originalTitle || "-"} • {m.country || "-"}
                      </div>
                    </div>
                  </td>

                  {/* THỂ LOẠI */}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {m.genre?.map((g) => (
                        <span
                          key={g}
                          className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* ĐẠO DIỄN */}
                  <td className="px-4 py-3">{m.director || "-"}</td>

                  {/* THỜI LƯỢNG */}
                  <td className="px-4 py-3">{m.duration || "-"}</td>

                  {/* PHÂN LOẠI */}
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 text-xs">
                      {m.ageRating || "Không xác định"}
                    </span>
                  </td>

                  {/* NGÀY */}
                  <td className="px-4 py-3">
                    {m.releaseDate
                      ? new Date(m.releaseDate).toLocaleDateString("vi-VN")
                      : "-"}
                  </td>

                  {/* TRẠNG THÁI */}
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        status === "now_showing"
                          ? "bg-green-500/20 text-green-400"
                          : status === "coming_soon"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-gray-500/20 text-gray-400"
                      }`}
                    >
                      {status === "now_showing"
                        ? "Đang chiếu"
                        : status === "coming_soon"
                          ? "Sắp chiếu"
                          : "Đã kết thúc"}
                    </span>
                  </td>

                  {/* ĐIỂM + VÉ */}
                  <td className="px-4 py-3">
                    <div className="text-yellow-400 font-medium">
                      ⭐ {m.ratingScore || "-"}
                    </div>
                    <div className="text-xs text-gray-400">
                      {m.tickets || 0} vé
                    </div>
                  </td>

                  {/* ACTION */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Pencil
                        size={16}
                        className="cursor-pointer text-blue-400 hover:text-blue-500"
                        onClick={() => onEdit(m)}
                      />
                      <Trash2
                        size={16}
                        className="cursor-pointer text-red-400 hover:text-red-500"
                        onClick={() => onDelete(m.id)}
                      />
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={10} className="text-center text-gray-400 py-3">
                Không có dữ liệu
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
