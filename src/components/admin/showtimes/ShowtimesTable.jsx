// ShowtimesTable.jsx - Updated with real-time status support
import { Edit2, Trash2, Sparkles, Clock, Calendar } from "lucide-react";
import { formatDateToDisplay } from "../../../utils/dateUtils";

export default function ShowtimesTable({
  showtimes,
  onEdit,
  onDelete,
  onViewDetail,
  onSelect,
  selectedIds,
  currentPage,
  onPageChange,
  itemsPerPage,
  loading,
}) {
  const formatMoney = (value) => {
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount <= 0) return "—";
    return `${amount.toLocaleString()}₫`;
  };

  const totalPages = Math.ceil(showtimes.length / itemsPerPage);

  const paginatedData = showtimes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Hàm xác định style trạng thái dựa trên status hiện tại (đã được FE tính real-time)
  const getStatusStyle = (status) => {
    const styles = {
      scheduled: {
        label: "Sắp chiếu",
        color: "text-green-400",
        bg: "bg-green-400/10",
        border: "border-green-400/20",
      },
      ongoing: {
        label: "Đang chiếu",
        color: "text-yellow-400",
        bg: "bg-yellow-400/10",
        border: "border-yellow-400/20",
      },
      ended: {
        label: "Đã kết thúc",
        color: "text-gray-400",
        bg: "bg-gray-400/10",
        border: "border-gray-400/20",
      },
      cancelled: {
        label: "Đã hủy",
        color: "text-red-400",
        bg: "bg-red-400/10",
        border: "border-red-400/20",
      },
      available: {
        label: "Sắp chiếu",
        color: "text-green-400",
        bg: "bg-green-400/10",
        border: "border-green-400/20",
      },
    };
    return styles[status] || styles.scheduled;
  };

  const getTypeColor = (type) => {
    const colors = {
      "2D": "blue",
      "3D": "purple",
      IMAX: "yellow",
      "4DX": "green",
    };
    return colors[type] || "gray";
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      onSelect(paginatedData.map((s) => s.id));
    } else {
      onSelect([]);
    }
  };

  const handleSelectOne = (id, checked) => {
    if (checked) {
      onSelect([...selectedIds, id]);
    } else {
      onSelect(selectedIds.filter((i) => i !== id));
    }
  };

  return (
    <div className="bg-cinema-surface rounded-xl border border-white/10 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[1200px] w-full text-sm border-collapse">
          <thead className="bg-zinc-900 text-gray-300 border-b border-white/10">
            <tr className="uppercase text-[11px] font-bold tracking-wider">
              <th className="p-4 text-center w-12">
                <input
                  type="checkbox"
                  checked={
                    paginatedData.length > 0 &&
                    selectedIds.length === paginatedData.length
                  }
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-white/20 bg-transparent accent-red-600 cursor-pointer"
                />
              </th>
              <th className="p-4 text-left w-[30%]">Thông tin phim</th>
              <th className="p-4 text-left w-[18%]">Địa điểm</th>
              <th className="p-4 text-center w-[15%]">Lịch chiếu</th>
              <th className="p-4 text-center w-[10%]">Định dạng</th>
              <th className="p-4 text-left w-[17%]">Cấu trúc giá</th>
              <th className="p-4 text-center w-[10%]">Trạng thái</th>
              <th className="p-4 text-right w-24 whitespace-nowrap">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item) => {
                const isSpecialShowtime = Boolean(item.isSpecial || item.special);
                const status = getStatusStyle(item.status);
                
                const prices = isSpecialShowtime 
                  ? (item.specialPrices || {}) 
                  : (item.regularPrices || item.prices || {});

                return (
                  <tr
                    key={item.id}
                    className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group"
                  >
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={(e) =>
                          handleSelectOne(item.id, e.target.checked)
                        }
                        className="w-4 h-4 rounded border-white/20 bg-transparent accent-red-600 cursor-pointer"
                      />
                    </td>
                    <td className="p-4">
                      <div 
                        className="flex flex-col gap-1 cursor-pointer"
                        onClick={() => onViewDetail && onViewDetail(item)}
                        title="Xem chi tiết suất chiếu"
                      >
                        <span className="font-bold text-white text-sm leading-tight line-clamp-2 group-hover:text-red-500 transition-colors">
                          {item.movieTitle}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          {isSpecialShowtime && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-amber-500/80 bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-500/20">
                              <Sparkles size={8} /> Suất đặc biệt
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-gray-200 font-medium">{item.cinemaName}</span>
                        <span className="text-xs text-gray-500">Phòng: {item.roomName}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center gap-0.5 text-center">
                        <div className="flex items-center gap-1.5 text-gray-300 font-medium whitespace-nowrap justify-center">
                          <Calendar size={12} className="text-gray-500" />
                          {formatDateToDisplay(item.date)}
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-gray-400 font-mono justify-center">
                          <Clock size={13} className="text-gray-500" />
                          <span className="text-white font-medium">{item.time}</span>
                          <span className="text-gray-600">-</span>
                          <span className="text-gray-100">{item.endTime || "---"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`inline-block min-w-[50px] px-2 py-0.5 rounded-md text-[11px] font-bold bg-${getTypeColor(item.type)}-500/10 text-${getTypeColor(item.type)}-400 border border-${getTypeColor(item.type)}-500/20`}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1.5 min-w-[150px]">
                        <div className="grid grid-cols-1 gap-1">
                          {/* Thường */}
                          <div className="flex justify-between items-center bg-white/[0.03] px-2 py-0.5 rounded border border-transparent hover:border-white/5">
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Thường</span>
                            <span className={`font-bold text-xs tracking-tight ${isSpecialShowtime ? 'text-amber-400' : 'text-zinc-100'}`}>
                              {formatMoney(prices.Thường)}
                            </span>
                          </div>
                          
                          {/* VIP */}
                          <div className="flex justify-between items-center bg-purple-500/[0.03] px-2 py-0.5 rounded border border-transparent hover:border-purple-500/10">
                            <span className="text-[9px] text-purple-400/60 font-bold uppercase tracking-tighter">VIP</span>
                            <span className="text-purple-400 font-bold text-xs tracking-tight">
                              {formatMoney(prices.VIP)}
                            </span>
                          </div>

                          {/* Couple */}
                          <div className="flex justify-between items-center bg-red-500/[0.03] px-2 py-0.5 rounded border border-transparent hover:border-red-500/10">
                            <span className="text-[9px] text-red-400/60 font-bold uppercase tracking-tighter">Couple</span>
                            <span className="text-red-500 font-bold text-xs tracking-tight">
                              {formatMoney(prices.Couple)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${status.bg} ${status.color} border ${status.border}`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1 px-1">
                        <button
                          onClick={() => onEdit(item)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-green-500"
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => onDelete(item.id)}
                          className="p-2 hover:bg-red-500/10 rounded-lg transition-all text-gray-400 hover:text-red-500"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="p-12 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-2 opacity-40">
                    <Calendar size={40} />
                    <p className="font-medium">Không tìm thấy suất chiếu nào</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showtimes.length > 0 && (
        <div className="bg-[#1a1a1a]/50 flex flex-col sm:flex-row justify-between items-center gap-4 px-6 py-4 border-t border-white/10">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Hiển thị <span className="text-gray-300 font-bold">{(currentPage - 1) * itemsPerPage + 1} -{" "}
            {Math.min(currentPage * itemsPerPage, showtimes.length)}</span> trong tổng số <span className="text-white font-bold">{showtimes.length}</span> kết quả
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-1.5 rounded-lg bg-white/5 text-gray-400 text-xs font-bold disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white/10 hover:text-white transition-all border border-white/5"
            >
              Trang trước
            </button>

            <div className="flex items-center gap-1 mx-2">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
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
                    key={i}
                    onClick={() => onPageChange(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all border ${
                      currentPage === pageNum
                        ? "bg-red-600 text-white border-red-600 shadow-lg shadow-red-600/20"
                        : "bg-transparent text-gray-500 border-transparent hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => onPageChange((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-1.5 rounded-lg bg-white/5 text-gray-400 text-xs font-bold disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white/10 hover:text-white transition-all border border-white/5"
            >
              Tiếp theo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}