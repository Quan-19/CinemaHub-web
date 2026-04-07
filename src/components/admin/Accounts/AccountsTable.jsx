import { Edit2, Trash2 } from "lucide-react";

export default function AccountsTable({ data, onEdit, onDelete }) {
  const roleMap = {
    admin: {
      label: "Admin",
      className: "bg-red-500/20 text-red-400",
    },
    staff: {
      label: "Nhân viên",
      className: "bg-yellow-500/20 text-yellow-400",
    },
    customer: {
      label: "Khách hàng",
      className: "bg-cyan-500/20 text-cyan-400",
    },
  };

  const statusMap = {
    active: {
      label: "Hoạt động",
      className: "text-green-400",
    },
    locked: {
      label: "Bị khoá",
      className: "text-red-400",
    },
  };

  return (
    <div className="bg-cinema-surface border border-white/10 rounded-xl overflow-hidden mb-6">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="px-4 py-3 text-left text-white/50 text-xs font-medium uppercase tracking-wider">ID</th>
            <th className="px-4 py-3 text-left text-white/50 text-xs font-medium uppercase tracking-wider">Tài khoản</th>
            <th className="px-4 py-3 text-left text-white/50 text-xs font-medium uppercase tracking-wider">SĐT</th>
            <th className="px-4 py-3 text-left text-white/50 text-xs font-medium uppercase tracking-wider">Vai trò</th>
            <th className="px-4 py-3 text-left text-white/50 text-xs font-medium uppercase tracking-wider">Rạp</th>
            <th className="px-4 py-3 text-left text-white/50 text-xs font-medium uppercase tracking-wider">Trạng thái</th>
            <th className="px-4 py-3 text-left text-white/50 text-xs font-medium uppercase tracking-wider">Đặt vé</th>
            <th className="px-4 py-3 text-left text-white/50 text-xs font-medium uppercase tracking-wider">Ngày tạo</th>
            <th className="px-4 py-3 text-left text-white/50 text-xs font-medium uppercase tracking-wider">Ngày sinh</th>
            <th className="px-4 py-3 text-left text-white/50 text-xs font-medium uppercase tracking-wider">Thao tác</th>
          </tr>
        </thead>

        <tbody>
          {data.map((a) => {
            const role = roleMap[a.role] || roleMap.customer;
            const status = statusMap[a.status?.toLowerCase()] || statusMap.active;

            return (
              <tr
                key={a.id}
                className="border-b border-white/5 hover:bg-white/5 transition"
              >
                <td className="px-4 py-3 text-white/60 text-sm font-mono">{a.id}</td>
                
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {a.avatar ? (
                      <img
                        src={a.avatar}
                        alt={a.name}
                        className="w-8 h-8 rounded-full object-cover border border-white/10"
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${role.className}`}
                      >
                        {String(a.name || "?").charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-white text-sm font-medium truncate">
                        {a.name}
                      </div>
                      <div className="text-white/50 text-xs truncate">{a.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-white/60 text-sm">{a.phone}</td>

                <td className="px-4 py-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${role.className}`}
                  >
                    {role.label}
                  </span>
                </td>

                <td className="px-4 py-3 text-white/60 text-sm">{a.cinemaName || "-"}</td>

                <td className="px-4 py-3">
                  <span className={`text-sm font-medium ${status.className}`}>
                    {status.label}
                  </span>
                </td>

                <td className="px-4 py-3 text-white/60 text-sm">{a.bookings}</td>
                <td className="px-4 py-3 text-white/60 text-sm">{a.createdAt}</td>
                <td className="px-4 py-3 text-white/60 text-sm">{a.dob}</td>

                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(a)}
                      className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition"
                      title="Chỉnh sửa"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(a)}
                      className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition"
                      title="Xoá"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}