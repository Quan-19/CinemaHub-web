export default function PricingFilter({ filter, setFilter, data }) {
  const filters = [
    { id: "all", label: "Tất cả", color: "gray" },
    { id: "2D", label: "2D", color: "blue" },
    { id: "3D", label: "3D", color: "purple" },
    { id: "IMAX", label: "IMAX", color: "yellow" },
    { id: "4DX", label: "4DX", color: "green" },
  ];

  const getCountByType = (type) => {
    if (type === "all") return data.length;
    return data.filter(item => item.type === type).length;
  };

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      {filters.map(f => (
        <button
          key={f.id}
          onClick={() => setFilter(f.id)}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all
            ${filter === f.id 
              ? `bg-${f.color}-600 text-white shadow-lg shadow-${f.color}-600/30` 
              : "bg-[#0d0d1a] text-gray-400 hover:text-white border border-white/5 hover:border-white/20"
            }`}
        >
          <span>{f.label}</span>
          <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${
            filter === f.id ? "bg-white/20" : "bg-white/10"
          }`}>
            {getCountByType(f.id)} QT
          </span>
        </button>
      ))}
    </div>
  );
}