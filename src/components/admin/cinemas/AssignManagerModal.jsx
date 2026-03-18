import { X } from "lucide-react";
import { useState } from "react";

const mockStaff = [
  { id: 1, name: "Nguyễn Hữu Thành", email: "thanh.nh@cinestar.vn" },
  { id: 2, name: "Lê Quang Huy", email: "huy.lq@cinestar.vn" },
  { id: 3, name: "Phạm Minh Tuấn", email: "tuan.pm@cinestar.vn" },
];

export default function AssignManagerModal({
  show,
  onClose,
  cinema,
  setCinemas,
}) {
  const [selected, setSelected] = useState(null);

  if (!show || !cinema) return null;

  const handleAssign = () => {
    setCinemas(prev =>
      prev.map(c =>
        c.id === cinema.id
          ? { ...c, managerName: selected?.name || null }
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
          <X onClick={onClose} className="cursor-pointer text-white/40" />
        </div>

        {/* INFO BOX */}
        <div className="p-4">
          <div className="bg-purple-500/10 border border-purple-500/20 p-3 rounded-lg text-xs text-white/70">
            Khi phân quyền, tài khoản nhân viên sẽ được nâng lên vai trò 
            <span className="text-purple-400 font-medium"> Quản lý chi nhánh</span>
          </div>
        </div>

        {/* LIST */}
        <div className="px-4 max-h-[250px] overflow-y-auto space-y-2">

          {/* remove */}
          <div
            onClick={() => setSelected(null)}
            className={`p-3 rounded-lg border cursor-pointer flex items-center gap-3 ${
              selected === null ? "border-purple-500 bg-purple-500/10" : "border-white/10"
            }`}
          >
            ❌ Không phân quyền
          </div>

          {mockStaff.map(s => (
            <div
              key={s.id}
              onClick={() => setSelected(s)}
              className={`p-3 rounded-lg border cursor-pointer flex items-center gap-3 ${
                selected?.id === s.id
                  ? "border-purple-500 bg-purple-500/10"
                  : "border-white/10"
              }`}
            >
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-sm">
                {s.name[0]}
              </div>

              <div>
                <p className="text-sm">{s.name}</p>
                <p className="text-xs text-white/40">{s.email}</p>
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div className="flex gap-3 p-5 border-t border-white/10">
          <button
            onClick={onClose}
            className="flex-1 bg-white/10 py-2 rounded-lg"
          >
            Huỷ
          </button>

          <button
            onClick={handleAssign}
            className="flex-1 bg-purple-600 hover:bg-purple-700 py-2 rounded-lg"
          >
            Xác nhận phân quyền
          </button>
        </div>

      </div>
    </div>
  );
}