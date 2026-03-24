import { X } from "lucide-react";
import { useEffect, useState } from "react"; // ✅ OK nếu có dòng này
import { getAuth } from "firebase/auth";
export default function AssignManagerModal({
  show,
  onClose,
  cinema,
  onAssigned,
}) {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!show) return;

    const fetchUsers = async () => {
      try {
        const token = await getAuth().currentUser.getIdToken();
        const res = await fetch(
          "http://localhost:5000/api/users/assign-users",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUsers();
  }, [show]);

  const handleAssign = async () => {
    try {
      const token = await getAuth().currentUser.getIdToken();

      const res = await fetch(
        `http://localhost:5000/api/cinemas/${cinema?.cinema_id}/assign-manager`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ manager_id: selected?.id || null }),
        },
      );

      const data = await res.json();

      if (onAssigned) {
        onAssigned(cinema.cinema_id, data.manager);
      } else {
        // fallback: đóng modal
        onClose();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
      <div className="w-[520px] bg-[#0B1220] border border-white/10 rounded-xl overflow-hidden">
        <div className="flex justify-between items-center px-5 py-4 border-b border-white/10">
          <h2 className="text-white font-semibold">
            Phân quyền quản lý chi nhánh
          </h2>
          <X onClick={onClose} className="cursor-pointer text-white/40" />
        </div>

        <div className="px-4 max-h-[250px] overflow-y-auto space-y-2">
          <div
            onClick={() => setSelected(null)}
            className={`p-3 rounded-lg border cursor-pointer ${
              selected === null
                ? "border-purple-500 bg-purple-500/10"
                : "border-white/10"
            }`}
          >
            ❌ Không phân quyền
          </div>

          {users.map((u) => (
            <div
              key={u.id}
              onClick={() => setSelected(u)}
              className={`p-3 rounded-lg border cursor-pointer flex items-center gap-3 ${
                selected?.id === u.id
                  ? "border-purple-500 bg-purple-500/10"
                  : "border-white/10"
              }`}
            >
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-sm">
                {u.name?.[0] || "?"}
              </div>
              <div>
                <p className="text-sm">{u.name}</p>
                <p className="text-xs text-white/40">
                  {u.email} • {u.role}
                </p>
              </div>
            </div>
          ))}
        </div>

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
            {selected ? selected.name : "Phân quyền"}
          </button>
        </div>
      </div>
    </div>
  );
}
