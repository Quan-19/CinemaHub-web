import { Eye, Settings, Trash2, Power } from "lucide-react";

const typeColors = {
  "2D": { color: "#06b6d4", bg: "rgba(6,182,212,0.12)" },
  "3D": { color: "#8b5cf6", bg: "rgba(139,92,246,0.12)" },
  "IMAX": { color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  "4DX": { color: "#e50914", bg: "rgba(229,9,20,0.12)" },
};

export default function RoomCard({ room, onEdit, onDelete, onView, onToggleStatus }) {
  const typeStyle = typeColors[room.type];

  return (
    <div
      className="rounded-xl p-5 hover:transform hover:scale-[1.02] transition-all duration-200"
      style={{
        background: "#0d0d1a",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-lg font-bold text-white">{room.name}</h3>
            <span
              className="px-2 py-0.5 rounded text-xs font-bold"
              style={{
                background: typeStyle.bg,
                color: typeStyle.color,
              }}
            >
              {room.type}
            </span>
          </div>
          <p className="text-sm text-gray-400">{room.cinemaName}</p>
        </div>
        <button
          onClick={() => onToggleStatus(room)}
          className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors ${
            room.status === "active" 
              ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" 
              : "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30"
          }`}
        >
          <Power size={10} />
          {room.status === "active" ? "Hoạt động" : "Bảo trì"}
        </button>
      </div>

      {/* Mini Seat Preview */}
      <div
        className="rounded-lg p-3 mb-4"
        style={{ background: "rgba(255,255,255,0.04)" }}
      >
        <div className="text-center text-xs text-gray-500 mb-2">— Màn hình —</div>
        {Array.from({ length: Math.min(room.rows, 6) }, (_, rowIdx) => {
          const isVip = room.vipRows.includes(rowIdx + 1);
          const isCouple = room.coupleRow === rowIdx + 1;
          const numSeats = isCouple 
            ? Math.floor(room.cols / 2) 
            : Math.min(room.cols, 10);
          
          return (
            <div key={rowIdx} className="flex justify-center gap-0.5 mb-0.5">
              {Array.from({ length: numSeats }, (_, ci) => (
                <div
                  key={ci}
                  style={{
                    width: isCouple ? 10 : 6,
                    height: 5,
                    borderRadius: 1,
                    background: isVip 
                      ? "#f59e0b" 
                      : isCouple 
                      ? "#e50914" 
                      : "rgba(255,255,255,0.15)",
                    opacity: Math.random() < 0.2 ? 0.3 : 1,
                  }}
                />
              ))}
            </div>
          );
        })}
        {room.rows > 6 && (
          <div className="text-center text-xs text-gray-600 mt-2">
            ... {room.rows - 6} hàng nữa
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div
          className="text-center p-2 rounded-lg"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <div className="text-xl font-bold text-white">{room.totalSeats}</div>
          <div className="text-xs text-gray-500">Tổng ghế</div>
        </div>
        <div
          className="text-center p-2 rounded-lg"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <div className="text-xl font-bold text-white">
            {room.rows}×{room.cols}
          </div>
          <div className="text-xs text-gray-500">Hàng × Cột</div>
        </div>
        <div
          className="text-center p-2 rounded-lg"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <div className="text-xl font-bold text-white">{room.vipRows.length}</div>
          <div className="text-xs text-gray-500">Hàng VIP</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onView(room)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs hover:opacity-80 transition-opacity"
          style={{
            background: "rgba(6,182,212,0.12)",
            color: "#06b6d4",
            border: "1px solid rgba(6,182,212,0.2)",
          }}
        >
          <Eye size={12} /> Xem sơ đồ
        </button>
        <button
          onClick={() => onEdit(room)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs hover:opacity-80 transition-opacity"
          style={{
            background: "rgba(96,165,250,0.12)",
            color: "#60a5fa",
            border: "1px solid rgba(96,165,250,0.2)",
          }}
        >
          <Settings size={12} /> Cấu hình
        </button>
        <button
          onClick={() => onDelete(room)}
          className="w-9 flex items-center justify-center rounded-lg hover:opacity-80 transition-opacity"
          style={{
            background: "rgba(239,68,68,0.12)",
            color: "#ef4444",
            border: "1px solid rgba(239,68,68,0.2)",
          }}
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}