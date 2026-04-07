import { AlertTriangle, X, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function DeleteConfirmModal({ show, onClose, onConfirm, roomName, cinemaName, roomType, loading = false }) {
  const [confirmed, setConfirmed] = useState(false);

  if (!show) return null;

  const handleConfirm = () => {
    if (confirmed && !loading) {
      onConfirm();
    }
  };

  const handleClose = () => {
    setConfirmed(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      style={{ background: "rgba(0,0,0,0.85)" }}
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md rounded-2xl transform animate-in zoom-in-95 duration-200"
        style={{
          background: "var(--color-cinema-surface)",
          border: "1px solid rgba(239,68,68,0.3)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header với hiệu ứng cảnh báo */}
        <div
          className="flex items-center justify-between p-5"
          style={{
            borderBottom: "1px solid rgba(239,68,68,0.2)",
            background: "linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(239,68,68,0.05) 100%)",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-red-500 opacity-20"></div>
              <AlertTriangle size={24} className="text-red-500 relative" />
            </div>
            <h3 className="text-lg font-bold text-white">Xác nhận xóa phòng chiếu</h3>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all duration-200 disabled:opacity-50"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Cảnh báo chính */}
          <div
            className="p-4 rounded-xl"
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
            }}
          >
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 font-semibold text-sm mb-1">
                  HÀNH ĐỘNG NÀY KHÔNG THỂ HOÀN TÁC!
                </p>
                <p className="text-gray-400 text-xs">
                  Xóa phòng chiếu sẽ ảnh hưởng đến lịch chiếu và dữ liệu liên quan.
                </p>
              </div>
            </div>
          </div>

          {/* Thông tin phòng chiếu */}
          <div
            className="p-4 rounded-xl"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <p className="text-gray-400 text-xs mb-3 uppercase tracking-wider">
              THÔNG TIN PHÒNG CHIẾU
            </p>
            
            <div className="space-y-2">
              {roomName && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Tên phòng:</span>
                  <span className="text-white font-semibold text-sm">{roomName}</span>
                </div>
              )}
              
              {cinemaName && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Rạp chiếu:</span>
                  <span className="text-gray-300 text-sm">{cinemaName}</span>
                </div>
              )}
              
              {roomType && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Loại phòng:</span>
                  <span className="text-gray-300 text-sm">{roomType}</span>
                </div>
              )}
            </div>
          </div>

          {/* Cảnh báo phụ */}
          <div className="space-y-2">
            <p className="text-xs text-yellow-500 flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
              Lưu ý: Tất cả lịch chiếu trong phòng này sẽ bị xóa
            </p>
            <p className="text-xs text-yellow-500 flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
              Dữ liệu đặt vé liên quan sẽ bị ảnh hưởng
            </p>
          </div>

          {/* Ô xác nhận */}
          <div className="mt-4 pt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="w-4 h-4 rounded border-2 transition-all duration-200 cursor-pointer"
                style={{
                  accentColor: "#ef4444",
                  borderColor: confirmed ? "#ef4444" : "rgba(255,255,255,0.3)",
                }}
              />
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                Tôi đã đọc và hiểu hậu quả khi xóa phòng chiếu này
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex gap-3 p-5 pt-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          <button
            onClick={handleClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg transition-all duration-200 font-medium disabled:opacity-50 bg-zinc-900 hover:bg-zinc-800 text-white border border-white/10"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleConfirm}
            disabled={!confirmed || loading}
            className={`flex-1 py-2.5 rounded-lg transition-all duration-200 font-medium flex items-center justify-center gap-2 ${
              confirmed && !loading
                ? "hover:shadow-lg hover:scale-[1.02]"
                : "opacity-50 cursor-not-allowed"
            }`}
            style={{
              background: confirmed && !loading
                ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                : "linear-gradient(135deg, #7f1a1a 0%, #991b1b 100%)",
              color: "#fff",
            }}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Đang xóa...
              </>
            ) : (
              "Xóa phòng vĩnh viễn"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}