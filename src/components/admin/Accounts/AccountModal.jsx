import { useState } from "react";
import { X } from "lucide-react";

export default function AccountModal({ data, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: data?.name || "",
    email: data?.email || "",
    phone: data?.phone || "",
    role: data?.role || "user",
    status: data?.status || "active",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#0d0d1a] border border-white/10 rounded-xl w-[480px] relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-white font-semibold text-lg">
            {data ? "Chỉnh sửa tài khoản" : "Thêm tài khoản mới"}
          </h2>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white/60 transition"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Body */}
          <div className="p-6 space-y-5">
            {/* Họ và tên */}
            <div className="space-y-2">
              <label className="text-white/70 text-sm">Họ và tên</label>
              <input
                type="text"
                placeholder="Nhập họ tên"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-red-500/50 transition placeholder:text-white/30"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-white/70 text-sm">Email</label>
              <input
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-red-500/50 transition placeholder:text-white/30"
              />
            </div>

            {/* Số điện thoại */}
            <div className="space-y-2">
              <label className="text-white/70 text-sm">Số điện thoại</label>
              <input
                type="tel"
                placeholder="0912 345 678"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-red-500/50 transition placeholder:text-white/30"
              />
            </div>

            {/* Vai trò */}
            <div className="space-y-2">
              <label className="text-white/70 text-sm">Vai trò</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full bg-[#1a1a2e] border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-red-500/50 transition appearance-none cursor-pointer"
                style={{ color: 'white', backgroundColor: '#1a1a2e' }}
              >
                <option value="admin" className="bg-[#1a1a2e] text-white">Admin</option>
                <option value="staff" className="bg-[#1a1a2e] text-white">Nhân viên</option>
                <option value="user" className="bg-[#1a1a2e] text-white">Khách hàng</option>
              </select>
            </div>

            {/* Trạng thái (chỉ hiện khi edit) */}
            {data && (
              <div className="space-y-2">
                <label className="text-white/70 text-sm">Trạng thái</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full bg-[#1a1a2e] border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-red-500/50 transition appearance-none cursor-pointer"
                  style={{ color: 'white', backgroundColor: '#1a1a2e' }}
                >
                  <option value="active" className="bg-[#1a1a2e] text-white">Hoạt động</option>
                  <option value="inactive" className="bg-[#1a1a2e] text-white">Tạm ngưng</option>
                  <option value="banned" className="bg-[#1a1a2e] text-white">Bị khoá</option>
                </select>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg font-medium transition"
            >
              Huỷ
            </button>
            <button
              type="submit"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition"
            >
              {data ? "Cập nhật" : "Tạo tài khoản"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}