import { X } from "lucide-react";
import { useState } from "react";

// Import accounts data từ AccountsPage hoặc từ API
// Tạm thời lấy từ mock data
const mockStaff = [
  {
    id: "ACC002",
    name: "Trần Thị Staff",
    email: "staff1@cinestar.vn",
    role: "staff",
    status: "active"
  },
  {
    id: "ACC006",
    name: "Vũ Thị Mai",
    email: "mai.vu@gmail.com",
    role: "staff",
    status: "active"
  }
];

export default function AssignManagerModal({
  show,
  onClose,
  cinema,
  setCinemas,
}) {
  const [selected, setSelected] = useState(null);

  if (!show || !cinema) return null;

  // Chỉ lọc những nhân viên đang hoạt động
  const availableStaff = mockStaff.filter(s => s.role === "staff" && s.status === "active");

  const handleAssign = () => {
    setCinemas(prev =>
      prev.map(c =>
        c.id === cinema.id
          ? { 
              ...c, 
              managerId: selected?.id || null,
              managerName: selected?.name || null,
              managerEmail: selected?.email || null,
            }
          : c
      )
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
      <div className="w-[520px] bg-[#0B1220] border border-white/10 rounded-xl overflow-hidden">
        {/* HEADER */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-white/10">
          <div>
            <h2 className="text-white font-semibold">
              Phân quyền quản lý chi nhánh
            </h2>
            <p className="text-xs text-white/40">{cinema.name}</p>
          </div>
          <X onClick={onClose} className="cursor-pointer text-white/40 hover:text-white" />
        </div>

        {/* INFO BOX */}
        <div className="p-4">
          <div className="bg-purple-500/10 border border-purple-500/20 p-3 rounded-lg text-xs text-white/70">
            Chỉ nhân viên (staff) mới có thể được phân quyền làm 
            <span className="text-purple-400 font-medium"> Quản lý chi nhánh</span>
          </div>
        </div>

        {/* LIST */}
        <div className="px-4 max-h-[250px] overflow-y-auto space-y-2">
          {/* Không phân quyền */}
          <div
            onClick={() => setSelected(null)}
            className={`p-3 rounded-lg border cursor-pointer flex items-center gap-3 transition ${
              selected === null 
                ? "border-purple-500 bg-purple-500/10" 
                : "border-white/10 hover:border-white/20"
            }`}
          >
            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-sm">
              ❌
            </div>
            <div>
              <p className="text-sm">Không phân quyền</p>
              <p className="text-xs text-white/40">Bỏ quyền quản lý hiện tại</p>
            </div>
          </div>

          {availableStaff.length > 0 ? (
            availableStaff.map(s => (
              <div
                key={s.id}
                onClick={() => setSelected(s)}
                className={`p-3 rounded-lg border cursor-pointer flex items-center gap-3 transition ${
                  selected?.id === s.id
                    ? "border-purple-500 bg-purple-500/10"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <div className="w-8 h-8 bg-purple-600/20 rounded-full flex items-center justify-center text-sm font-medium">
                  {s.name[0]}
                </div>

                <div>
                  <p className="text-sm">{s.name}</p>
                  <p className="text-xs text-white/40">{s.email}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-white/40">
              Không có nhân viên nào khả dụng
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex gap-3 p-5 border-t border-white/10">
          <button
            onClick={onClose}
            className="flex-1 bg-white/10 hover:bg-white/20 py-2 rounded-lg transition"
          >
            Huỷ
          </button>

          <button
            onClick={handleAssign}
            className="flex-1 bg-purple-600 hover:bg-purple-700 py-2 rounded-lg transition"
          >
            Xác nhận phân quyền
          </button>
        </div>
      </div>
    </div>
  );
}