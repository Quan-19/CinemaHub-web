import { X, Sparkles } from "lucide-react";
import { useState } from "react";
import { formatNumberInput, parseNumberInput } from "../../../utils/numberFormat";

export default function QuickEditModal({ 
  show, 
  onClose, 
  showtimes, 
  onSave,
  loading,
  specialTypes 
}) {
  const [updates, setUpdates] = useState({
    price: "",
    status: "",
    type: "",
    specialType: "",
  });

  if (!show) return null;

  const handleSave = () => {
    // Loại bỏ các trường không được chọn
    const finalUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== "")
    );
    onSave(finalUpdates);
  };

  const selectClass =
    "w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-purple-500/50 transition [&>option]:bg-zinc-900 [&>option]:text-white";

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md bg-cinema-surface border border-white/10 rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-white">Chỉnh sửa nhanh</h2>
            <p className="text-sm text-white/40 mt-1">
              Đang áp dụng cho {showtimes.length} suất chiếu
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 text-white/50 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-2">
              Cập nhật giá vé (VNĐ)
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9,]*"
              value={formatNumberInput(updates.price)}
              onChange={(e) =>
                setUpdates((p) => ({
                  ...p,
                  price: parseNumberInput(e.target.value),
                }))
              }
              placeholder="Nhập giá vé mới..."
              className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-white/30"
            />
            <p className="text-[10px] text-white/30 mt-1">Để trống nếu không thay đổi</p>
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-2">
              Cập nhật loại suất chiếu
            </label>
            <select
              value={updates.specialType}
              onChange={e => setUpdates(p => ({ ...p, specialType: e.target.value }))}
              className={selectClass}
            >
              <option value="" className="bg-zinc-900 text-white/70">Giữ nguyên</option>
              <option value="none" className="bg-zinc-900 text-white">Suất thường</option>
              {specialTypes.map(type => (
                <option 
                  key={type.value} 
                  value={type.value} 
                  className="bg-zinc-900"
                  style={{ color: type.color }}
                >
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-2">
              Cập nhật trạng thái
            </label>
            <select
              value={updates.status}
              onChange={e => setUpdates(p => ({ ...p, status: e.target.value }))}
              className={selectClass}
            >
              <option value="" className="bg-zinc-900 text-white/70">Giữ nguyên</option>
              <option value="scheduled" className="bg-zinc-900 text-green-400">Sắp chiếu</option>
              <option value="ongoing" className="bg-zinc-900 text-yellow-400">Đang chiếu</option>
              <option value="ended" className="bg-zinc-900 text-gray-400">Đã kết thúc</option>
              <option value="cancelled" className="bg-zinc-900 text-red-400">Hủy</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-2">
              Cập nhật định dạng
            </label>
            <select
              value={updates.type}
              onChange={e => setUpdates(p => ({ ...p, type: e.target.value }))}
              className={selectClass}
            >
              <option value="" className="bg-zinc-900 text-white/70">Giữ nguyên</option>
              <option value="2D" className="bg-zinc-900 text-cyan-400">2D</option>
              <option value="3D" className="bg-zinc-900 text-purple-400">3D</option>
              <option value="IMAX" className="bg-zinc-900 text-orange-400">IMAX</option>
              <option value="4DX" className="bg-zinc-900 text-red-400">4DX</option>
            </select>
          </div>

          {/* Preview affected showtimes */}
          <div className="mt-4 p-3 bg-zinc-900 border border-white/10 rounded-lg">
            <p className="text-sm text-white/70 mb-2">Các suất sẽ được cập nhật:</p>
            <div className="max-h-32 overflow-y-auto space-y-1 custom-scrollbar">
              {showtimes.map(s => (
                <div key={s.id} className="text-xs text-white/50 flex items-center gap-2">
                  <span className="w-1 h-1 bg-purple-400 rounded-full"></span>
                  <span>{s.movieTitle} - {s.time} ({s.cinemaName})</span>
                  {s.special && (
                    <span className="text-purple-400 text-[10px]">✨</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 pt-4 border-t border-white/10">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition disabled:opacity-50"
          >
            Huỷ
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition disabled:opacity-50"
          >
            {loading ? "Đang xử lý..." : "Cập nhật"}
          </button>
        </div>
      </div>
    </div>
  );
}