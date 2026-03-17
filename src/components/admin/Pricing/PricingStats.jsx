export default function PricingStats({ data }) {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {[
        { label: "Tổng quy tắc", value: data.length },
        { label: "Đang áp dụng", value: data.filter(d => d.active).length },
        { label: "Giá trung bình", value: "120K₫" },
        { label: "Loại ghế", value: "3 loại" },
      ].map((s, i) => (
        <div key={i} className="bg-[#0d0d1a] p-4 rounded-xl border border-white/10">
          <div className="text-xl font-bold">{s.value}</div>
          <div className="text-xs text-gray-400">{s.label}</div>
        </div>
      ))}
    </div>
  );
}