import { AlertTriangle, X } from "lucide-react";

export default function DeleteConfirmModal({ show, onClose, onConfirm, item }) {
  if (!show || !item) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="w-[400px] bg-[#0b0f1f] rounded-2xl border border-white/10 shadow-2xl">
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <AlertTriangle size={20} className="text-red-500" />
            Xác nhận xóa
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <div className="px-6 py-5">
          <p className="text-gray-300">
            Bạn có chắc chắn muốn xóa khuyến mãi này?
          </p>
          <p className="mt-2 text-sm text-gray-400">
            Khuyến mãi: <span className="text-white font-medium">{item.title}</span>
          </p>
          <p className="mt-1 text-sm text-gray-400">
            Mã: <span className="text-yellow-400">{item.code}</span>
          </p>
          <p className="mt-4 text-xs text-red-400">
            Lưu ý: Hành động này không thể hoàn tác.
          </p>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="flex-1 h-10 bg-[#1f2937] hover:bg-[#374151] rounded-lg text-gray-300 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 h-10 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}