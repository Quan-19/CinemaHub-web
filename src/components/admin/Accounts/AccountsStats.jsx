import { Users, Shield, User } from "lucide-react";

export default function AccountsStats({ data }) {
  const stats = [
    {
      label: "Admin",
      value: data.filter((x) => x.role === "admin").length,
      icon: <Shield size={18} />,
      color: "bg-red-500/20 text-red-400",
      borderColor: "border-red-500/30",
    },
    {
      label: "Nhân viên",
      value: data.filter((x) => x.role === "staff").length,
      icon: <Users size={18} />,
      color: "bg-yellow-500/20 text-yellow-400",
      borderColor: "border-yellow-500/30",
    },
    {
      label: "Khách hàng",
      value: data.filter((x) => x.role === "customer").length,
      icon: <User size={18} />,
      color: "bg-cyan-500/20 text-cyan-400",
      borderColor: "border-cyan-500/30",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {stats.map((s) => (
        <div
          key={s.label}
          className={`flex-1 bg-cinema-surface border ${s.borderColor} rounded-xl p-4`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
              {s.icon}
            </div>
            <div>
              <div className="text-white text-2xl font-bold">{s.value}</div>
              <div className="text-white/50 text-sm">{s.label}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}