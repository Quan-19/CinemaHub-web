export default function MoviesStats({ movies }) {
  const stats = [
    {
      label: "Đang chiếu",
      count: movies.filter(m => m.status === "now-showing").length,
      color: "#22c55e",
    },
    {
      label: "Sắp chiếu",
      count: movies.filter(m => m.status === "coming-soon").length,
      color: "#f59e0b",
    },
    {
      label: "Đã kết thúc",
      count: movies.filter(m => m.status === "ended").length,
      color: "#6b7280",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map(s => (
        <div key={s.label}
          className="rounded-xl p-4 flex items-center gap-3 bg-[#0d0d1a] border border-white/10">
          <div className="w-2 h-10 rounded-full" style={{ background: s.color }} />
          <div>
            <div className="text-white text-xl font-bold">{s.count}</div>
            <div className="text-gray-400 text-xs">{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}