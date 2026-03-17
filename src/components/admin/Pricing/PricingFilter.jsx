export default function PricingFilter({ filter, setFilter }) {
  return (
    <div className="flex gap-2 mb-4">
      {["all", "2D", "3D", "IMAX", "4DX"].map(f => (
        <button
          key={f}
          onClick={() => setFilter(f)}
          className={`px-4 py-2 rounded-lg text-sm ${
            filter === f ? "bg-red-600" : "bg-white/10"
          }`}
        >
          {f === "all" ? "Tất cả" : f}
        </button>
      ))}
    </div>
  );
}