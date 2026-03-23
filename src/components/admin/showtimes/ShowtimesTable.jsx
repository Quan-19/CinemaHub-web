import { Edit2, Trash2, Calendar, Clock, MoreVertical, Copy, Eye, Sparkles } from "lucide-react";
import { useState } from "react";
import SpecialShowtimeBadge from "./SpecialShowtimeBadge";

const typeColors = {
  "2D": "#06b6d4",
  "3D": "#8b5cf6",
  "IMAX": "#f59e0b",
  "4DX": "#e50914"
};

const statusConfig = {
  scheduled: { label: "Sắp chiếu", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  ongoing: { label: "Đang chiếu", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  ended: { label: "Đã kết thúc", color: "#6b7280", bg: "rgba(107,114,128,0.12)" },
  cancelled: { label: "Đã hủy", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
};

export default function ShowtimesTable({
  showtimes,
  onEdit,
  onDelete,
  onCopy,
  onQuickEdit,
  onSelect,
  selectedIds = [],
  currentPage = 1,
  onPageChange,
  itemsPerPage = 10,
  loading = false,
  specialTypes,
}) {
  const [expandedRow, setExpandedRow] = useState(null);

  const totalPages = Math.ceil(showtimes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentShowtimes = showtimes.slice(startIndex, startIndex + itemsPerPage);

  const handleSelectAll = () => {
    if (selectedIds.length === currentShowtimes.length && currentShowtimes.length > 0) {
      onSelect([]);
    } else {
      onSelect(currentShowtimes.map(s => s.id));
    }
  };

  const handleSelect = (id) => {
    if (selectedIds.includes(id)) {
      onSelect(selectedIds.filter(sid => sid !== id));
    } else {
      onSelect([...selectedIds, id]);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-8 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-white/40">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0d0d1a] border border-white/10 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={selectedIds.length === currentShowtimes.length && currentShowtimes.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 checked:bg-red-600"
                />
              </th>
              {["Phim", "Rạp / Phòng", "Thời gian", "Loại", "Suất", "Chỗ trống", "Giá vé", "Trạng thái", "Thao tác"].map(header => (
                <th
                  key={header}
                  className="px-4 py-3 text-left text-xs font-semibold text-white/40 whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {currentShowtimes.length > 0 ? (
              currentShowtimes.map(showtime => {
                const isSelected = selectedIds.includes(showtime.id);

                return (
                  <tr
                    key={showtime.id}
                    className={`border-b border-white/5 transition ${
                      isSelected ? 'bg-purple-600/10' : 'hover:bg-white/5'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelect(showtime.id)}
                        className="w-4 h-4 rounded border-white/20 bg-white/5 checked:bg-purple-600"
                      />
                    </td>

                    <td className="px-4 py-3">
                      <div className="relative group">
                        <span className="text-sm font-semibold text-white cursor-help">
                          {showtime.movieTitle}
                        </span>
                        <div className="absolute left-0 top-full mt-1 hidden group-hover:block z-10">
                          <div className="bg-[#1a1a2e] border border-white/10 rounded-lg p-2 text-xs whitespace-nowrap">
                            <p>Thời lượng: 150 phút</p>
                            <p>Khởi chiếu: 15/03/2026</p>
                            <p>Đạo diễn: Nguyễn Quang Dũng</p>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="text-sm text-white/70">{showtime.cinemaName}</div>
                      <div className="text-xs text-white/35">{showtime.roomName}</div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="bg-red-600/20 p-1.5 rounded">
                          <Calendar size={12} className="text-red-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">
                            {showtime.time}
                          </div>
                          <div className="text-xs text-white/40">
                            {new Date(showtime.date).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-1 rounded text-xs font-bold"
                        style={{
                          background: `${typeColors[showtime.type] || '#6b7280'}20`,
                          color: typeColors[showtime.type] || '#6b7280'
                        }}
                      >
                        {showtime.type}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      {showtime.special ? (
                        <SpecialShowtimeBadge 
                          type={showtime.specialType} 
                          specialTypes={specialTypes}
                          size="sm"
                        />
                      ) : (
                        <span className="text-xs text-white/30">Thường</span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <div>
                        <span className="text-sm text-white">{showtime.availableSeats}</span>
                        <span className="text-xs text-white/40">/{showtime.totalSeats}</span>
                      </div>
                      <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full"
                          style={{
                            width: `${(showtime.availableSeats / showtime.totalSeats) * 100}%`,
                            background: showtime.availableSeats > showtime.totalSeats * 0.5 ? "#22c55e" : "#f59e0b"
                          }}
                        />
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="text-sm font-bold text-yellow-500">
                        {showtime.price?.adult?.toLocaleString() || showtime.price?.toLocaleString()}đ
                      </div>
                      <div className="text-xs text-white/40">
                        {showtime.bookedCount || 0} vé đã bán
                      </div>
                      {showtime.special && showtime.specialDiscount !== 0 && (
                        <div className={`text-[10px] ${showtime.specialDiscount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {showtime.specialDiscount > 0 ? `+${showtime.specialDiscount}%` : `${showtime.specialDiscount}%`}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-1 rounded-full text-xs font-semibold"
                        style={{
                          background: statusConfig[showtime.status]?.bg || "rgba(255,255,255,0.1)",
                          color: statusConfig[showtime.status]?.color || "#fff"
                        }}
                      >
                        {statusConfig[showtime.status]?.label || showtime.status}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => onEdit(showtime)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-blue-500/20 text-blue-400 transition"
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => onQuickEdit(showtime)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-purple-500/20 text-purple-400 transition"
                          title="Chỉnh sửa nhanh"
                        >
                          <MoreVertical size={13} />
                        </button>
                        <button
                          onClick={() => onCopy(showtime)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-green-500/20 text-green-400 transition"
                          title="Nhân bản"
                        >
                          <Copy size={13} />
                        </button>
                        <button
                          onClick={() => onDelete(showtime.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-500/20 text-red-400 transition"
                          title="Xóa"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="10" className="text-center py-8 text-white/40">
                  Không tìm thấy suất chiếu nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showtimes.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
          <span className="text-xs text-white/40">
            Hiển thị {startIndex + 1}-{Math.min(startIndex + itemsPerPage, showtimes.length)} / {showtimes.length} suất chiếu
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 text-white disabled:opacity-30 hover:bg-white/10 transition"
            >
              ‹
            </button>

            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`w-8 h-8 rounded-lg text-sm ${
                    currentPage === pageNum
                      ? "bg-red-600 text-white"
                      : "bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 text-white disabled:opacity-30 hover:bg-white/10 transition"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}