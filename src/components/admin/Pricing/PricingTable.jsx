import { Edit2, Trash2, Eye, Power } from "lucide-react";
import { useState } from "react";

export default function PricingTable({ data, onEdit, onDelete, onView, onToggleActive }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(data.length / itemsPerPage);
  
  const paginatedData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getTypeColor = (type) => {
    const colors = {
      '2D': 'blue',
      '3D': 'purple',
      'IMAX': 'yellow',
      '4DX': 'green'
    };
    return colors[type] || 'gray';
  };

  const getSeatColor = (seat) => {
    const colors = {
      'VIP': 'amber',
      'Couple': 'pink',
      'Thường': 'gray'
    };
    return colors[seat] || 'gray';
  };

  return (
    <div className="bg-[#0d0d1a] rounded-xl border border-white/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#050816] text-gray-400 border-b border-white/10">
            <tr>
              <th className="p-4 text-left font-medium">Tên quy tắc</th>
              <th className="p-4 text-left font-medium">Loại phòng</th>
              <th className="p-4 text-left font-medium">Loại ghế</th>
              <th className="p-4 text-left font-medium">Loại ngày</th>
              <th className="p-4 text-left font-medium">Khung giờ</th>
              <th className="p-4 text-left font-medium">Giá gốc</th>
              <th className="p-4 text-left font-medium">Giá áp dụng</th>
              <th className="p-4 text-left font-medium">Trạng thái</th>
              <th className="p-4 text-left font-medium">Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item) => (
                <tr 
                  key={item.id} 
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="p-4 font-medium text-white">{item.name}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium bg-${getTypeColor(item.type)}-500/20 text-${getTypeColor(item.type)}-400`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium bg-${getSeatColor(item.seat)}-500/20 text-${getSeatColor(item.seat)}-400`}>
                      {item.seat}
                    </span>
                  </td>
                  <td className="p-4 text-gray-300">{item.day}</td>
                  <td className="p-4 text-gray-300">{item.time}</td>
                  <td className="p-4 text-gray-400 line-through">
                    {item.base.toLocaleString()}₫
                  </td>
                  <td className="p-4 font-bold text-yellow-400">
                    {item.final.toLocaleString()}₫
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => onToggleActive(item)}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs w-fit transition-colors ${
                        item.active 
                          ? 'text-green-400 bg-green-400/10 hover:bg-green-400/20' 
                          : 'text-gray-400 bg-gray-400/10 hover:bg-gray-400/20'
                      }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${item.active ? 'bg-green-400' : 'bg-red-400'}`}></div>
                      {item.active ? 'Đang áp dụng' : 'Ngưng áp dụng'}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onView(item)}
                        className="p-1.5 hover:bg-blue-500/20 rounded-lg transition-colors group"
                        title="Xem chi tiết"
                      >
                        <Eye size={16} className="text-gray-400 group-hover:text-blue-400" />
                      </button>
                      <button
                        onClick={() => onEdit(item)}
                        className="p-1.5 hover:bg-green-500/20 rounded-lg transition-colors group"
                        title="Chỉnh sửa"
                      >
                        <Edit2 size={16} className="text-gray-400 group-hover:text-green-400" />
                      </button>
                      <button
                        onClick={() => onDelete(item)}
                        className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors group"
                        title="Xóa"
                      >
                        <Trash2 size={16} className="text-gray-400 group-hover:text-red-400" />
                      </button>
                      <button
                        onClick={() => onToggleActive(item)}
                        className={`p-1.5 rounded-lg transition-colors group ${
                          item.active 
                            ? 'hover:bg-yellow-500/20' 
                            : 'hover:bg-green-500/20'
                        }`}
                        title={item.active ? 'Tạm ngưng' : 'Kích hoạt'}
                      >
                        <Power size={16} className={`group-hover:${
                          item.active ? 'text-red-400' : 'text-green-400'
                        } text-gray-400`} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="p-8 text-center text-gray-400">
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-4 py-3 border-t border-white/10">
          <div className="text-sm text-gray-400">
            Hiển thị {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, data.length)} / {data.length} quy tắc giá
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
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
                  onClick={() => setCurrentPage(pageNum)}
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
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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