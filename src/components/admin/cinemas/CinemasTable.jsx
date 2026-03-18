import { Pencil, Trash2, Eye } from "lucide-react";

export default function CinemasTable({
  cinemas,
  onEdit,
  onDelete,
  onAssign,
}) {
  return (
    <div className="bg-[#0B1220] border border-white/5 rounded-xl overflow-hidden">

      <table className="w-full text-sm">

        <thead className="text-white/40 text-xs border-b border-white/5 bg-white/[0.02]">
          <tr>
            <th className="p-4 text-left">Tên rạp</th>
            <th>Thương hiệu</th>
            <th>Thành phố</th>
            <th>Địa chỉ</th>
            <th className="text-center">Phòng chiếu</th>
            <th>Trạng thái</th>
            <th>Quản lý chi nhánh</th>
            <th className="text-center">Thao tác</th>
          </tr>
        </thead>

        <tbody>
          {cinemas.map(c => (
            <tr
              key={c.id}
              className="h-[74px] border-b border-white/5 hover:bg-white/[0.03]"
            >

              <td className="p-4">
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-white/30">{c.phone}</p>
              </td>

              <td>
                <span className={`px-2.5 py-1 text-xs rounded-md ${brandColor(c.brand)}`}>
                  {c.brand}
                </span>
              </td>

              <td className="text-white/70">{c.city}</td>

              <td className="text-white/50 truncate">{c.address}</td>

              <td className="text-center font-medium">{c.rooms}</td>

              <td>
                <span className={`px-3 py-1 text-xs rounded-full ${statusColor(c.status)}`}>
                  {c.status === "active" ? "Đang hoạt động" : "Bảo trì"}
                </span>
              </td>

              <td>
                {c.managerName ? (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-xs">
                      {c.managerName[0]}
                    </div>
                    <div>
                      <p className="text-sm">{c.managerName}</p>
                      <p className="text-xs text-blue-400">
                        Quản lý chi nhánh
                      </p>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => onAssign(c)}
                    className="text-yellow-400 border border-yellow-500/30 px-3 py-1 rounded-md text-xs hover:bg-yellow-500/10"
                  >
                    🔑 Phân quyền
                  </button>
                )}
              </td>

              <td>
                <div className="flex justify-center gap-2">
                  <Eye size={16} className="text-blue-400" />
                  <Pencil size={16} className="text-cyan-400 cursor-pointer" onClick={() => onEdit(c)} />
                  <Trash2 size={16} className="text-red-500 cursor-pointer" onClick={() => onDelete(c.id)} />
                </div>
              </td>

            </tr>
          ))}
        </tbody>

      </table>

      <div className="flex justify-between items-center px-4 py-3 text-xs text-white/40">
        <span>Hiển thị 1-{cinemas.length} / {cinemas.length} rạp</span>

        <div className="flex gap-2 items-center">
          <button className="w-8 h-8 rounded bg-white/5">‹</button>
          <button className="w-8 h-8 rounded bg-red-600 text-white">1</button>
          <button className="w-8 h-8 rounded bg-white/5">2</button>
          <button className="w-8 h-8 rounded bg-white/5">›</button>
        </div>
      </div>

    </div>
  );
}

function statusColor(status) {
  return status === "active"
    ? "bg-green-500/10 text-green-400"
    : "bg-yellow-500/10 text-yellow-400";
}

function brandColor(brand) {
  switch (brand) {
    case "CGV":
      return "bg-red-500/10 text-red-400";
    case "Lotte":
      return "bg-yellow-500/10 text-yellow-400";
    case "BHD":
      return "bg-purple-500/10 text-purple-400";
    case "Galaxy":
      return "bg-blue-500/10 text-blue-400";
    default:
      return "bg-white/10 text-white";
  }
}