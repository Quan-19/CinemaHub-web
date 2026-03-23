import { Building2, Star, User, Users } from "lucide-react";

export default function CinemasStats({ cinemas }) {
  // 🧠 xử lý data
  const total = cinemas.length;

  const active = cinemas.filter(c => c.status === "active").length;

  const noManager = cinemas.filter(c => !c.managerId).length;

  const totalStaff = cinemas.reduce((sum, c) => {
    return sum + (c.staffCount || 0); // nếu chưa có thì = 0
  }, 0);

  return (
    <div className="grid grid-cols-4 gap-5">
      <Card icon={<Building2 size={18} />} title="Tổng rạp" value={total} />
      <Card icon={<Star size={18} />} title="Đang hoạt động" value={active} green />
      <Card icon={<User size={18} />} title="Chưa có quản lý" value={noManager} yellow />
      <Card icon={<Users size={18} />} title="Nhân viên" value={totalStaff} blue />
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