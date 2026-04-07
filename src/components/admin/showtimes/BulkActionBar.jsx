import { X, Trash2, Edit3, CheckCircle, XCircle, Clock, Sparkles } from "lucide-react";
import { useState } from "react";

export default function BulkActionBar({ 
  count, 
  onClear, 
  onDelete, 
  onStatusChange,
  onSpecialChange,
  specialTypes 
}) {
  const [showSpecialMenu, setShowSpecialMenu] = useState(false);

  return (
    <div className="bg-purple-600/20 border border-purple-500/30 rounded-lg p-3 flex items-center justify-between animate-slideDown">
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
        <div className="relative">
          <button
            onClick={() => setShowSpecialMenu(!showSpecialMenu)}
            className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm transition"
          >
            <Sparkles size={14} />
            Suất đặc biệt
          </button>
          
          {showSpecialMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-white/10 rounded-lg shadow-xl z-20">
              <button
                onClick={() => {
                  onSpecialChange('none');
                  setShowSpecialMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 transition"
              >
                ✖ Bỏ đặc biệt
              </button>
              {specialTypes.map(type => (
                <button
                  key={type.value}
                  onClick={() => {
                    onSpecialChange(type.value);
                    setShowSpecialMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition flex items-center gap-2"
                  style={{ color: type.color }}
                >
                  <span>{type.icon}</span>
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => onStatusChange('scheduled')}
          className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg text-sm transition"
          title="Chuyển sang trạng thái sắp chiếu"
        >
          <Clock size={14} />
          Sắp chiếu
        </button>

        <button
          onClick={() => onStatusChange('ongoing')}
          className="flex items-center gap-2 px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-sm transition"
          title="Chuyển sang trạng thái đang chiếu"
        >
          <CheckCircle size={14} />
          Đang chiếu
        </button>

        <button
          onClick={() => onStatusChange('cancelled')}
          className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition"
          title="Hủy suất chiếu"
        >
          <XCircle size={14} />
          Hủy
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