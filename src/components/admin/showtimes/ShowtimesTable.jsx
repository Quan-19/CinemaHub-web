// ShowtimesTable.jsx - Add end time column
import { Edit2, Trash2, Eye, Copy, Zap } from "lucide-react";

export default function ShowtimesTable({ 
  showtimes, 
  onEdit, 
  onDelete, 
  onCopy, 
  onQuickEdit,
  onSelect,
  selectedIds,
  currentPage,
  onPageChange,
  itemsPerPage,
  loading 
}) {
  const totalPages = Math.ceil(showtimes.length / itemsPerPage);
  
  const paginatedData = showtimes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusStyle = (status) => {
    const styles = {
      scheduled: { label: "Sắp chiếu", color: "text-green-400", bg: "bg-green-400/10" },
      ongoing: { label: "Đang chiếu", color: "text-yellow-400", bg: "bg-yellow-400/10" },
      ended: { label: "Đã kết thúc", color: "text-gray-400", bg: "bg-gray-400/10" },
      cancelled: { label: "Đã hủy", color: "text-red-400", bg: "bg-red-400/10" }
    };
    return styles[status] || styles.scheduled;
  };

  const getTypeColor = (type) => {
    const colors = {
      '2D': 'blue',
      '3D': 'purple',
      'IMAX': 'yellow',
      '4DX': 'green'
    };
    return colors[type] || 'gray';
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      onSelect(paginatedData.map(s => s.id));
    } else {
      onSelect([]);
    }
  };

  const handleSelectOne = (id, checked) => {
    if (checked) {
      onSelect([...selectedIds, id]);
    } else {
      onSelect(selectedIds.filter(i => i !== id));
    }
  };

  return (
    <div className="bg-[#0d0d1a] rounded-xl border border-white/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#050816] text-gray-400 border-b border-white/10">
            <tr>
              <th className="p-4 text-left w-10">
                <input
                  type="checkbox"
                  checked={paginatedData.length > 0 && selectedIds.length === paginatedData.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-white/20 bg-transparent accent-red-600"
                />
              </th>
              <th className="p-4 text-left">Phim</th>
              <th className="p-4 text-left">Rạp</th>
              <th className="p-4 text-left">Phòng</th>
              <th className="p-4 text-left">Ngày</th>
              <th className="p-4 text-left">Giờ bắt đầu</th>
              <th className="p-4 text-left">Giờ kết thúc</th>
              <th className="p-4 text-left">Định dạng</th>
              <th className="p-4 text-left">Ghế Thường</th>
              <th className="p-4 text-left">Ghế VIP</th>
              <th className="p-4 text-left">Ghế Couple</th>
              <th className="p-4 text-left">Trạng thái</th>
              <th className="p-4 text-left">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item) => (
                <tr 
                  key={item.id} 
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={(e) => handleSelectOne(item.id, e.target.checked)}
                      className="w-4 h-4 rounded border-white/20 bg-transparent accent-red-600"
                    />
                  </td>
                  <td className="p-4 font-medium text-white">{item.movieTitle}</td>
                  <td className="p-4 text-gray-300">{item.cinemaName}</td>
                  <td className="p-4 text-gray-300">{item.roomName}</td>
                  <td className="p-4 text-gray-300">{new Date(item.date).toLocaleDateString('vi-VN')}</td>
                  <td className="p-4 text-gray-300 font-medium">{item.time}</td>
                  <td className="p-4 text-gray-400">{item.endTime || "---"}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium bg-${getTypeColor(item.type)}-500/20 text-${getTypeColor(item.type)}-400`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-green-400">
                    {item.prices?.Thường?.toLocaleString()}₫
                  </td>
                  <td className="p-4 font-bold text-amber-400">
                    {item.prices?.VIP?.toLocaleString()}₫
                  </td>
                  <td className="p-4 font-bold text-pink-400">
                    {item.prices?.Couple?.toLocaleString()}₫
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusStyle(item.status).bg} ${getStatusStyle(item.status).color}`}>
                      {getStatusStyle(item.status).label}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(item)}
                        className="p-1.5 hover:bg-green-500/20 rounded-lg transition-colors group"
                        title="Chỉnh sửa"
                      >
                        <Edit2 size={16} className="text-gray-400 group-hover:text-green-400" />
                      </button>
                      <button
                        onClick={() => onCopy(item)}
                        className="p-1.5 hover:bg-blue-500/20 rounded-lg transition-colors group"
                        title="Nhân bản"
                      >
                        <Copy size={16} className="text-gray-400 group-hover:text-blue-400" />
                      </button>
                      <button
                        onClick={() => onQuickEdit(item)}
                        className="p-1.5 hover:bg-purple-500/20 rounded-lg transition-colors group"
                        title="Chỉnh sửa nhanh"
                      >
                        <Zap size={16} className="text-gray-400 group-hover:text-purple-400" />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors group"
                        title="Xóa"
                      >
                        <Trash2 size={16} className="text-gray-400 group-hover:text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="13" className="p-8 text-center text-gray-400">
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showtimes.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-4 py-3 border-t border-white/10">
          <div className="text-sm text-gray-400">
            Hiển thị {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, showtimes.length)} / {showtimes.length} suất chiếu
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded bg-white/5 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
            >
              Trước
            </button>
            
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
                  className={`w-8 h-8 rounded transition-colors ${
                    currentPage === pageNum
                      ? "bg-red-600 text-white"
                      : "bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => onPageChange(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded bg-white/5 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}