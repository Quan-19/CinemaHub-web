import { useState } from "react";
import { X } from "lucide-react";

export default function AccountModal({ data, onClose, onSave }) {
  const getInitialFormData = (payload) => ({
    name: payload?.name && payload.name !== "-" ? payload.name : "",
    email: payload?.email && payload.email !== "-" ? payload.email : "",
    phone: payload?.phone && payload.phone !== "-" ? payload.phone : "",
    role: payload?.role || "customer",
    status: payload?.status || "active",
  });

  const [formData, setFormData] = useState(() => getInitialFormData(data));

  // ✅ THÊM validation từ Code 1
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      alert("Vui lòng nhập tên và email");
      return;
    }
    
    // ✅ THÊM email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Email không hợp lệ");
      return;
    }
    
    // Phone optional; validate only when user provided
    const normalizedPhone = String(formData.phone || "").replace(/\s/g, "").trim();
    if (normalizedPhone) {
      const phoneRegex = /^[0-9]{8,11}$/;
      if (!phoneRegex.test(normalizedPhone)) {
        alert("Số điện thoại không hợp lệ (8-11 số)");
        return;
      }
    }
    
    onSave(formData);
  };

  // ✅ THÊM handleChange từ Code 1 (clean code)
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-cinema-surface border border-white/10 rounded-xl w-full max-w-[480px] relative">
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
          <div className="p-6 space-y-5">
            {/* Họ và tên */}
            <div className="space-y-2">
              <label className="text-white/70 text-sm">Họ và tên</label>
              <input
                type="text"
                placeholder="Nhập họ và tên" // ✅ THÊM placeholder từ Code 2
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
                className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-red-500/50 transition placeholder:text-white/30" // ✅ THÊM styling từ Code 2
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-white/70 text-sm">Email</label>
              <input
                type="email"
                placeholder="email@example.com" // ✅ THÊM placeholder
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                required
                className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-red-500/50 transition placeholder:text-white/30"
              />
            </div>

            {/* Số điện thoại */}
            <div className="space-y-2">
              <label className="text-white/70 text-sm">Số điện thoại</label>
              <input
                type="tel"
                placeholder="0912 345 678" // ✅ THÊM placeholder
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-red-500/50 transition placeholder:text-white/30"
              />
            </div>

            {/* Vai trò */}
            <div className="space-y-2">
              <label className="text-white/70 text-sm">Vai trò</label>
              <select
                value={formData.role}
                onChange={(e) => handleChange("role", e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-red-500/50 transition appearance-none cursor-pointer"
              >
                <option value="admin">Admin</option>
                <option value="staff">Nhân viên</option>
                <option value="customer">Khách hàng</option> {/* ✅ GIỮ customer từ Code 1 */}
              </select>
            </div>

            {/* Trạng thái (chỉ hiện khi edit) */}
            {data && (
              <div className="space-y-2">
                <label className="text-white/70 text-sm">Trạng thái</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-red-500/50 transition appearance-none cursor-pointer"
                >
                  <option value="active">Hoạt động</option>
                  <option value="locked">Bị khoá</option>
                </select>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg font-medium transition" // ✅ THÊM hover từ Code 2
            >
              Huỷ
            </button>
            <button
              type="submit"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition" // ✅ THÊM hover từ Code 2
            >
              {data ? "Cập nhật" : "Tạo tài khoản"} {/* ✅ GIỮ text từ Code 2 */}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}