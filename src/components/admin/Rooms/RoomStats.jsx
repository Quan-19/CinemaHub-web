import { Layers } from "lucide-react";

const typeColors = {
  "2D": { color: "#06b6d4", bg: "rgba(6,182,212,0.12)" },
  "3D": { color: "#8b5cf6", bg: "rgba(139,92,246,0.12)" },
  "IMAX": { color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  "4DX": { color: "#e50914", bg: "rgba(229,9,20,0.12)" },
};

export default function RoomStats({ rooms }) {
  const totalRooms = rooms.length;
  
  const stats = Object.entries(typeColors).map(([type, colors]) => ({
    type,
    count: rooms.filter(r => r.type === type).length,
    color: colors.color,
    bg: colors.bg,
  }));

  return (
    <div className="space-y-3">
      {/* Total Rooms Card */}
      <div className="rounded-xl p-4 flex items-center gap-3 bg-cinema-surface border border-white/10">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(229,9,20,0.12)" }}
        >
          <Layers size={16} style={{ color: "#e50914" }} />
        </div>
        <div>
          <div className="text-2xl font-bold text-white">{totalRooms}</div>
          <div className="text-sm text-gray-400">Tổng số phòng</div>
        </div>
      </div>

      {/* Stats by Type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(stat => (
          <div
            key={stat.type}
            className="rounded-xl p-4 flex items-center gap-3 bg-cinema-surface border border-white/10"
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: stat.bg }}
            >
              <Layers size={16} style={{ color: stat.color }} />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stat.count}</div>
              <div className="text-sm" style={{ color: stat.color }}>
                {stat.type}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}