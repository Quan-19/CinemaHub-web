import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { toast } from "react-hot-toast";

export default function AssignManagerModal({
  show,
  onClose,
  cinema,
  onAssigned,
}) {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!show) return;

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
          toast.error("Vui lòng đăng nhập lại");
          return;
        }
        
        const token = await user.getIdToken();
        const res = await fetch(
          "http://localhost:5000/api/users/assign-users",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        
        if (!res.ok) throw new Error("Failed to fetch users");
        
        const data = await res.json();
        const staffUsers = (Array.isArray(data) ? data : []).filter(
          u => u.role === "staff" && u.status === "active"
        );
        setUsers(staffUsers);
        
        if (cinema?.managerId) {
          const currentManager = staffUsers.find(u => u.id === cinema.managerId);
          if (currentManager) {
            setSelected(currentManager);
          } else {
            setSelected(null);
          }
        } else {
          setSelected(null);
        }
      } catch (err) {
        console.error("Fetch users error:", err);
        toast.error("Không thể tải danh sách nhân viên");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [show, cinema]);

  const handleAssign = async () => {
    if (!cinema) return;
    
    setSubmitting(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        toast.error("Vui lòng đăng nhập lại");
        return;
      }
      
      const token = await user.getIdToken();
      const cinemaId = cinema.id || cinema.cinema_id;
      
      const res = await fetch(
        `http://localhost:5000/api/cinemas/${cinemaId}/assign-manager`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ 
            manager_id: selected?.id || null,
          }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Assign failed");
      }

      const data = await res.json();

      if (onAssigned) {
        onAssigned(cinemaId, {
          id: selected?.id || null,
          name: selected?.name || null,
          email: selected?.email || null,
        });
      }
      
      toast.success(data.message || (selected ? "Phân quyền quản lý thành công!" : "Đã xóa quản lý"));
      onClose();
    } catch (err) {
      console.error("Assign error:", err);
      toast.error(err.message || "Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setSubmitting(false);
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
          <X onClick={onClose} className="cursor-pointer text-white/40 hover:text-white" size={20} />
        </div>

        <div className="p-4">
          <p className="text-sm text-white/60 mb-3">
            Rạp: <span className="text-white">{cinema?.name}</span>
          </p>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
            </div>
          ) : (
            <div className="max-h-[300px] overflow-y-auto space-y-2">
              <div
                onClick={() => setSelected(null)}
                className={`p-3 rounded-lg border cursor-pointer transition ${
                  selected === null
                    ? "border-purple-500 bg-purple-500/10"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <p className="text-sm">❌ Không phân quyền (Xóa quản lý hiện tại)</p>
              </div>

              {users.length === 0 ? (
                <div className="text-center py-8 text-white/40 text-sm">
                  Không có nhân viên nào để phân quyền
                </div>
              ) : (
                users.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => setSelected(u)}
                    className={`p-3 rounded-lg border cursor-pointer transition ${
                      selected?.id === u.id
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-sm font-medium">
                        {u.name?.[0] || "?"}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{u.name}</p>
                        <p className="text-xs text-white/40">
                          {u.email} • {u.role === "staff" ? "Nhân viên" : u.role}
                        </p>
                      </div>
                      {selected?.id === u.id && (
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 p-5 border-t border-white/10">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 bg-white/10 hover:bg-white/20 py-2.5 rounded-lg transition disabled:opacity-50"
          >
            Huỷ
          </button>
          <button
            onClick={handleAssign}
            disabled={submitting || loading}
            className="flex-1 bg-purple-600 hover:bg-purple-700 py-2.5 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {selected ? `Phân quyền cho ${selected.name}` : "Xóa quản lý"}
          </button>
        </div>
      </div>
    </div>
  );
}