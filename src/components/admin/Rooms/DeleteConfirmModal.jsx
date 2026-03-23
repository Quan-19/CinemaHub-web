import { AlertTriangle, X } from "lucide-react";

export default function DeleteConfirmModal({ show, onClose, onConfirm, roomName }) {
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)" }}
    >
      <div
        className="w-full max-w-md rounded-2xl"
        style={{
          background: "#0d0d1a",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div
          className="flex items-center justify-between p-5"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} className="text-red-500" />
            <h3 className="text-lg font-bold text-white">Xác nhận xóa</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5">
          <p className="text-gray-300">
            Bạn có chắc chắn muốn xóa phòng chiếu này?
          </p>
          {roomName && (
            <p className="mt-2 text-sm text-gray-400">
              Phòng: <span className="text-white font-medium">{roomName}</span>
            </p>
          )}
          <p className="mt-4 text-xs text-red-500">
            Lưu ý: Hành động này không thể hoàn tác.
          </p>
        </div>

        <div
          className="flex gap-3 p-5 pt-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg transition-colors hover:bg-white/10"
            style={{
              background: "rgba(255,255,255,0.08)",
              color: "#fff",
            }}
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-lg transition-colors hover:opacity-90"
            style={{
              background: "#ef4444",
              color: "#fff",
            }}
          >
            Xóa phòng
          </button>
        </div>
      </div>
    </div>
  );
}