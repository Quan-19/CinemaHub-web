import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function AccountModal({ data, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "customer",
    status: "active",
  });

  // 🔥 sync data khi edit
  useEffect(() => {
    if (data) {
      setFormData({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        role: data.role || "customer", // ✅ FIX
        status: data.status || "active",
      });
    }
  }, [data]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 🔥 validate nhẹ
    if (!formData.name || !formData.email || !formData.phone) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

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
          <div className="p-6 space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-white/70 text-sm">Họ và tên</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-white/70 text-sm">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-white/70 text-sm">Số điện thoại</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white"
              />
            </div>

            {/* Role */}
            <div className="space-y-2">
              <label className="text-white/70 text-sm">Vai trò</label>
              <select
                value={formData.role}
                onChange={(e) => handleChange("role", e.target.value)}
                className="w-full bg-[#1a1a2e] border border-white/10 rounded-lg px-4 py-3 text-white"
              >
                <option value="admin">Admin</option>
                <option value="staff">Nhân viên</option>
                <option value="customer">Khách hàng</option> {/* ✅ FIX */}
              </select>
            </div>

            {/* Status */}
            {data && (
              <div className="space-y-2">
                <label className="text-white/70 text-sm">Trạng thái</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                  className="w-full bg-[#1a1a2e] border border-white/10 rounded-lg px-4 py-3 text-white"
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Tạm ngưng</option>
                  <option value="banned">Bị khoá</option>
                </select>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/10 text-white py-3 rounded-lg"
            >
              Huỷ
            </button>
            <button
              type="submit"
              className="flex-1 bg-red-600 text-white py-3 rounded-lg"
            >
              {data ? "Cập nhật" : "Tạo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
