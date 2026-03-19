import { X } from "lucide-react";
import { useState, useEffect } from "react";

// Import accounts data - chỉ lấy staff
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

export default function CinemaModal({
  show,
  onClose,
  onSave,
  form,
  setForm,
  isEdit,
}) {
  const [availableManagers, setAvailableManagers] = useState([]);

  useEffect(() => {
    // Chỉ lấy nhân viên đang hoạt động
    const staff = mockStaff.filter(s => s.role === "staff" && s.status === "active");
    setAvailableManagers(staff);
  }, []);

  if (!show) return null;

  const inputClass =
    "mt-1 w-full bg-[#020617] border border-white/10 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-white/20";

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
      <div className="w-[520px] bg-[#0B1220] border border-white/10 rounded-xl overflow-hidden shadow-xl">
        {/* HEADER */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-white/10">
          <h2 className="text-white font-semibold text-lg">
            {isEdit ? "Chỉnh sửa rạp" : "Thêm rạp mới"}
          </h2>
          <X
            onClick={onClose}
            className="cursor-pointer text-white/40 hover:text-white"
          />
        </div>

        {/* BODY */}
        <div className="p-5 space-y-4">
          {/* TÊN */}
          <div>
            <label className="text-sm text-white/60">Tên rạp</label>
            <input
              placeholder="VD: CGV Vincom Center Bà Triệu"
              value={form.name || ""}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className={inputClass}
            />
          </div>

          {/* BRAND + CITY */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-white/60">Thương hiệu</label>
              <select
                value={form.brand || "CGV"}
                onChange={e => setForm(p => ({ ...p, brand: e.target.value }))}
                className={inputClass}
              >
                <option>CGV</option>
                <option>Lotte</option>
                <option>BHD</option>
                <option>Galaxy</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-white/60">Thành phố</label>
              <input
                placeholder="Hà Nội / TP.HCM"
                value={form.city || ""}
                onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                className={inputClass}
              />
            </div>
          </div>

          {/* ADDRESS */}
          <div>
            <label className="text-sm text-white/60">Địa chỉ</label>
            <input
              placeholder="Số nhà, đường, quận..."
              value={form.address || ""}
              onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
              className={inputClass}
            />
          </div>

          {/* PHONE + ROOMS */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-white/60">Số điện thoại</label>
              <input
                value={form.phone || ""}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-sm text-white/60">Số phòng chiếu</label>
              <input
                type="number"
                min="1"
                value={form.rooms || 4}
                onChange={e =>
                  setForm(p => ({ ...p, rooms: Number(e.target.value) }))
                }
                className={inputClass}
              />
            </div>
          </div>

          {/* MANAGER - CHỈ HIỂN THỊ STAFF */}
          <div>
            <label className="text-sm text-white/60">Quản lý chi nhánh</label>
            <select
              value={form.managerId || ""}
              onChange={e => {
                const staff = availableManagers.find(s => s.id == e.target.value);
                setForm(p => ({
                  ...p,
                  managerId: staff?.id || null,
                  managerName: staff?.name || null,
                  managerEmail: staff?.email || null,
                }));
              }}
              className={inputClass}
            >
              <option value="">Chưa có quản lý</option>
              {availableManagers.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} - {s.email}
                </option>
              ))}
            </select>
            {availableManagers.length === 0 && (
              <p className="text-xs text-yellow-400 mt-1">
                Không có nhân viên nào khả dụng để phân quyền
              </p>
            )}
          </div>

          {/* STATUS */}
          <div>
            <label className="text-sm text-white/60">Trạng thái</label>
            <select
              value={form.status || "active"}
              onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
              className={inputClass}
            >
              <option value="active">Đang hoạt động</option>
              <option value="maintenance">Bảo trì</option>
            </select>
          </div>
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
            onClick={onSave}
            className="flex-1 bg-red-600 hover:bg-red-700 py-2 rounded-lg transition"
          >
            {isEdit ? "Lưu thay đổi" : "Thêm rạp"}
          </button>
        </div>
      </div>
    </div>
  );
}