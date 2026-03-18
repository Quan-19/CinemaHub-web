import { Building2, Star, User, Users } from "lucide-react";

export default function CinemasStats() {
  return (
    <div className="grid grid-cols-4 gap-5">
      <Card icon={<Building2 size={18} />} title="Tổng rạp" value="7" />
      <Card icon={<Star size={18} />} title="Đang hoạt động" value="5" green />
      <Card icon={<User size={18} />} title="Chưa có quản lý" value="5" yellow />
      <Card icon={<Users size={18} />} title="Nhân viên" value="6" blue />
    </div>
  );
}

function Card({ icon, title, value, green, yellow, blue }) {
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
        <h2 className="text-xl font-semibold">{value}</h2>
      </div>
    </div>
  );
}