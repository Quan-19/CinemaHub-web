import { Building2, Star, User, Users } from "lucide-react";

export default function CinemasStats({ cinemas }) {
  const totalCinemas = cinemas.length;
  const activeCinemas = cinemas.filter(c => c.status === "active").length;
  const noManagerCinemas = cinemas.filter(c => !c.managerName).length;

  return (
    <div className="grid grid-cols-3 gap-5">
      <Card icon={<Building2 size={18} />} title="Tổng rạp" value={totalCinemas} />
      <Card icon={<Star size={18} />} title="Đang hoạt động" value={activeCinemas} green />
      <Card icon={<User size={18} />} title="Chưa có quản lý" value={noManagerCinemas} yellow />
    </div>
  );
}

function Card({ icon, title, value, green, yellow, blue }) {
  const displayValue = typeof value === 'object' ? 0 : value;
  
  return (
    <div className="bg-[#0B1220] border border-white/5 rounded-xl px-6 py-5 flex items-center gap-4">
      <div className={`
        p-2 rounded-lg
        ${green && "bg-green-500/10 text-green-400"}
        ${yellow && "bg-yellow-500/10 text-yellow-400"}
        ${blue && "bg-blue-500/10 text-blue-400"}
        ${!green && !yellow && !blue && "bg-purple-500/10 text-purple-400"}
      `}>
        {icon}
      </div>

      <div>
        <p className="text-xs text-white/40 mb-1">{title}</p>
        <h2 className="text-xl font-semibold">{displayValue}</h2>
      </div>
    </div>
  );
}