import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";

export default function CinemaModal({
  show,
  onClose,
  onSave,
  form,
  setForm,
  isEdit,
}) {
  const [users, setUsers] = useState([]);

  const inputClass =
    "mt-1 w-full bg-[#020617] border border-white/10 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-white/20";

  // 🔥 fetch users thật
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return;

        const token = await user.getIdToken();

        const res = await fetch(
          "http://localhost:5000/api/users/assign-users",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await res.json();
        console.log("USERS:", data);

        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("FETCH USERS ERROR:", err);
      }
    };

    if (show) fetchUsers();
  }, [show]);

  if (!show) return null;

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
              placeholder="VD: CGV Vincom Center"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className={inputClass}
            />
          </div>

          {/* BRAND + CITY */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-white/60">Thương hiệu</label>
              <select
                value={form.brand}
                onChange={(e) =>
                  setForm((p) => ({ ...p, brand: e.target.value }))
                }
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
                value={form.city}
                onChange={(e) =>
                  setForm((p) => ({ ...p, city: e.target.value }))
                }
                className={inputClass}
              />
            </div>
          </div>

          {/* ADDRESS */}
          <div>
            <label className="text-sm text-white/60">Địa chỉ</label>
            <input
              placeholder="Số nhà, đường, quận..."
              value={form.address}
              onChange={(e) =>
                setForm((p) => ({ ...p, address: e.target.value }))
              }
              className={inputClass}
            />
          </div>

          {/* PHONE + ROOMS */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-white/60">Số điện thoại</label>
              <input
                value={form.phone}
                onChange={(e) =>
                  setForm((p) => ({ ...p, phone: e.target.value }))
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-sm text-white/60">Số phòng chiếu</label>
              <input
                type="number"
                value={form.rooms}
                onChange={(e) =>
                  setForm((p) => ({ ...p, rooms: Number(e.target.value) }))
                }
                className={inputClass}
              />
            </div>
          </div>

          {/* 🔥 MANAGER (REAL DATA) */}
          <div>
            <label className="text-sm text-white/60">Quản lý chi nhánh</label>
            <select
              value={form.managerId || ""}
              onChange={(e) => {
                const selectedUser = users.find((u) => u.id == e.target.value);

                setForm((p) => ({
                  ...p,
                  managerId: selectedUser?.id || null,
                  managerName: selectedUser?.name || null,
                }));
              }}
              className={inputClass}
            >
              <option value="">Không có</option>

              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          {/* STATUS */}
          <div>
            <label className="text-sm text-white/60">Trạng thái</label>
            <select
              value={form.status}
              onChange={(e) =>
                setForm((p) => ({ ...p, status: e.target.value }))
              }
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
            className="flex-1 bg-white/10 hover:bg-white/20 py-2 rounded-lg"
          >
            Huỷ
          </button>

          <button
            onClick={onSave}
            className="flex-1 bg-red-600 hover:bg-red-700 py-2 rounded-lg"
          >
            {isEdit ? "Lưu thay đổi" : "Thêm rạp"}
          </button>
        </div>
      </div>
    </div>
  );
}
