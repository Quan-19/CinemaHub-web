// BulkActionBar.jsx - Simplified - Chỉ còn chức năng hủy hàng loạt
import { X, Trash2, Ban } from "lucide-react";

export default function BulkActionBar({ 
  count, 
  onClear, 
  onDelete, 
  onCancelBulk,
  hasBookings = false,
  hasNonScheduled = false,
}) {
  return (
    <div className="bg-red-600/20 border border-red-500/30 rounded-lg p-3 flex items-center justify-between animate-slideDown">
      <div className="flex items-center gap-4">
        <span className="text-white font-medium">
          Đã chọn {count} suất chiếu
        </span>
        <button
          onClick={onClear}
          className="flex items-center gap-1 text-white/70 hover:text-white text-sm transition"
        >
          <X size={14} />
          Bỏ chọn
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={onCancelBulk}
          disabled={hasBookings || hasNonScheduled}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition ${
            hasBookings || hasNonScheduled
              ? "bg-gray-600 cursor-not-allowed opacity-50"
              : "bg-red-600 hover:bg-red-700"
          }`}
          title={
            hasBookings 
              ? "Có suất chiếu đã có vé đặt, không thể hủy"
              : hasNonScheduled
              ? "Chỉ có thể hủy suất chiếu ở trạng thái 'Sắp chiếu'"
              : "Hủy các suất chiếu đã chọn"
          }
        >
          <Ban size={14} />
          Hủy suất chiếu
        </button>

        <button
          onClick={onDelete}
          className="flex items-center gap-2 px-3 py-1.5 bg-red-600/50 hover:bg-red-600 rounded-lg text-sm transition"
          title="Xóa các suất chiếu đã chọn"
        >
          <Trash2 size={14} />
          Xóa
        </button>
      </div>
    </div>
  );
}