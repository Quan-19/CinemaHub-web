import { Edit2, Trash2, Eye } from "lucide-react";
import { useState } from "react";
import { getPricingRuleRoomType, isHolidayPricingRule } from "../../../utils/pricingRuleUtils";

export default function PricingTable({ data, onEdit, onDelete, onView, onToggleActive }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(data.length / itemsPerPage);
  
  const paginatedData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getTypeColor = (type) => {
    if (type === 'HOLIDAY') return 'red';
    const colors = {
      '2D': 'blue',
      '3D': 'purple',
      'IMAX': 'yellow',
      '4DX': 'green'
    };
    return colors[type] || 'gray';
  };

  const getSeatColor = (seat) => {
    if (!seat || seat === 'HOLIDAY') return 'red';
    const colors = {
      'VIP': 'amber',
      'Couple': 'pink',
      'Thường': 'gray'
    };
    return colors[seat] || 'gray';
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return '---';
    return price.toLocaleString() + '₫';
  };

  return (
    <div className="bg-cinema-surface rounded-xl border border-white/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cinema-bg text-gray-400 border-b border-white/10">
            <tr>
              <th className="p-4 text-left font-medium">Tên quy tắc</th>
              <th className="p-4 text-left font-medium">Loại phòng</th>
              <th className="p-4 text-left font-medium">Loại ghế</th>
              <th className="p-4 text-left font-medium">Điều kiện áp dụng</th>
              <th className="p-4 text-left font-medium">Giá gốc</th>
              <th className="p-4 text-left font-medium">Giá bán</th>
              <th className="p-4 text-left font-medium">Trạng thái</th>
              <th className="p-4 text-left font-medium">Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item) => {
                const isHoliday = isHolidayPricingRule(item);
                const roomType = getPricingRuleRoomType(item);
                
                return (
                  <tr 
                    key={item.id} 
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4 font-medium text-white">{item.name}</td>
                    <td className="p-4">
                      {isHoliday ? (
                        <div className="flex flex-col gap-1">
                          <span className="px-2 py-1 rounded-lg text-xs font-medium bg-green-500/30 text-green-400">
                            Phòng: {roomType}
                          </span>
                        </div>
                      ) : (
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium bg-${getTypeColor(roomType)}-500/20 text-${getTypeColor(roomType)}-400`}>
                          {roomType}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {isHoliday ? (
                        <div className="flex flex-wrap gap-1">
                          {item.holiday_prices?.map((hp, idx) => (
                            <span key={idx} className={`px-2 py-1 rounded-lg text-xs font-medium ${
                              hp.seat_type === 'VIP' ? 'bg-amber-500/20 text-amber-400' : 
                              hp.seat_type === 'Couple' ? 'bg-pink-500/20 text-pink-400' : 
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {hp.seat_type}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium bg-${getSeatColor(item.seat)}-500/20 text-${getSeatColor(item.seat)}-400`}>
                          {item.seat}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-gray-300">
                      {isHoliday ? (
                        <div>
                          <div>{item.start_date} → {item.end_date}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Áp dụng: {item.apply_days?.map(d => {
                              const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
                              return days[d];
                            }).join(', ')}
                          </div>
                        </div>
                      ) : (
                        `${item.day} - ${item.time}`
                      )}
                    </td>
                    <td className="p-4 text-gray-400 line-through">
                      {isHoliday ? '---' : formatPrice(item.base)}
                    </td>
                    <td className="p-4 font-bold text-yellow-400">
                      {isHoliday ? (
                        <div className="space-y-1">
                          {item.holiday_prices?.map((hp, idx) => (
                            <div key={idx} className="text-sm">
                              {hp.seat_type}: {formatPrice(Number(hp.price))}
                            </div>
                          ))}
                        </div>
                      ) : (
                        formatPrice(item.final)
                      )}
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
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="p-8 text-center text-gray-400">
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