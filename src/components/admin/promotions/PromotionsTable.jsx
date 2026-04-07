import { Edit2, Trash2, Tag, Percent, DollarSign } from "lucide-react";
import { useState } from "react";

export default function PromotionsTable({ promotions, onEdit, onDelete }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(promotions.length / itemsPerPage);
  
  const paginatedData = promotions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (date) => {
    if (!date) return "---";
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const getStatusBadge = (promotion) => {
    const today = new Date().toISOString().split('T')[0];
    
    if (promotion.status === 'inactive') {
      return { label: "Ngưng áp dụng", color: "text-gray-400", bg: "bg-gray-400/10" };
    }
    
    if (promotion.end_date < today) {
      return { label: "Đã hết hạn", color: "text-red-400", bg: "bg-red-400/10" };
    }
    
    if (promotion.start_date <= today && promotion.end_date >= today) {
      return { label: "Đang áp dụng", color: "text-green-400", bg: "bg-green-400/10" };
    }
    
    if (promotion.start_date > today) {
      return { label: "Sắp diễn ra", color: "text-yellow-400", bg: "bg-yellow-400/10" };
    }
    
    return { label: "Không xác định", color: "text-gray-400", bg: "bg-gray-400/10" };
  };

  const getDiscountDisplay = (promotion) => {
    if (promotion.discount_type === 'percent') {
      return (
        <span className="flex items-center gap-1 text-yellow-400">
          <Percent size={14} />
          {promotion.discount_value}%
        </span>
      );
    }
    
    return (
      <span className="flex items-center gap-1 text-blue-400">
        <DollarSign size={14} />
        {promotion.discount_value?.toLocaleString()}₫
      </span>
    );
  };

  const getSeatTypesDisplay = (promotion) => {
    const seatTypes = promotion.apply_seat_types || ["Thường", "VIP", "Couple"];
    const colors = {
      "Thường": "text-gray-400",
      "VIP": "text-amber-400",
      "Couple": "text-pink-400"
    };
    
    return (
      <div className="flex gap-1">
        {seatTypes.map(seat => (
          <span key={seat} className={`text-xs ${colors[seat] || 'text-gray-400'}`}>
            {seat === "Thường" ? "T" : seat === "VIP" ? "V" : "C"}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-cinema-surface rounded-xl border border-white/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-[980px] w-full text-sm">
          <thead className="bg-cinema-bg text-gray-400 border-b border-white/10">
            <tr>
              <th className="p-4 text-left">Mã</th>
              <th className="p-4 text-left">Tiêu đề</th>
              <th className="p-4 text-left">Giảm giá</th>
              <th className="p-4 text-left">Áp dụng</th>
              <th className="p-4 text-left">Thời gian</th>
              <th className="p-4 text-left">Số lượt</th>
              <th className="p-4 text-left">Trạng thái</th>
              <th className="p-4 text-left">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item) => {
                const status = getStatusBadge(item);
                return (
                  <tr key={item.promotion_id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Tag size={14} className="text-yellow-400" />
                        <span className="font-mono text-yellow-400 font-medium">{item.code}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-white font-medium">{item.title}</p>
                        {item.description && (
                          <p className="text-xs text-gray-500 truncate max-w-[200px]">{item.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">{getDiscountDisplay(item)}</td>
                    <td className="p-4">
                      <div className="space-y-1">
                        {getSeatTypesDisplay(item)}
                        {item.min_order > 0 && (
                          <p className="text-[10px] text-gray-500">
                            Đơn tối thiểu: {item.min_order.toLocaleString()}₫
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-xs">
                        <p className="text-gray-300">{formatDate(item.start_date)}</p>
                        <p className="text-gray-500">→ {formatDate(item.end_date)}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-center">
                        <p className="text-white font-medium">{item.used_count || 0}</p>
                        <p className="text-[10px] text-gray-500">
                          / {item.usage_limit > 0 ? item.usage_limit : '∞'}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${status.bg} ${status.color}`}>
                        {status.label}
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
                  Không có dữ liệu khuyến mãi
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {promotions.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-4 py-3 border-t border-white/10">
          <div className="text-sm text-gray-400">
            Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{" "}
            {Math.min(currentPage * itemsPerPage, promotions.length)} /{" "}
            {promotions.length} khuyến mãi
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