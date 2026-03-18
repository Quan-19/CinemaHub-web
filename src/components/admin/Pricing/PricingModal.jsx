import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function PricingModal({ show, onClose, onAdd, onUpdate, editingItem }) {
  const [form, setForm] = useState({
    id: "",
    name: "",
    type: "2D",
    seat: "Thường",
    day: "Ngày thường",
    time: "Chiều (12h-18h)",
    base: "",
    final: "",
    active: true
  });

  const [errors, setErrors] = useState({});

  // Load data when editing
  useEffect(() => {
    if (editingItem) {
      setForm(editingItem);
    } else {
      setForm({
        id: "",
        name: "",
        type: "2D",
        seat: "Thường",
        day: "Ngày thường",
        time: "Chiều (12h-18h)",
        base: "",
        final: "",
        active: true
      });
    }
    setErrors({});
  }, [editingItem, show]);

  if (!show) return null;

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Tên quy tắc không được để trống";
    if (!form.base) newErrors.base = "Vui lòng nhập giá gốc";
    if (form.base && form.base < 0) newErrors.base = "Giá không thể âm";
    if (form.final && form.final < 0) newErrors.final = "Giá không thể âm";
    return newErrors;
  };

  const handleSubmit = () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const processedForm = {
      ...form,
      base: Number(form.base),
      final: Number(form.final) || Number(form.base),
    };

    if (editingItem) {
      onUpdate(processedForm);
    } else {
      onAdd({
        ...processedForm,
        id: Date.now().toString(),
      });
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      '2D': 'blue',
      '3D': 'purple',
      'IMAX': 'yellow',
      '4DX': 'green'
    };
    return colors[type] || 'gray';
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="w-[560px] bg-[#0b0f1f] rounded-2xl border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-white/10 sticky top-0 bg-[#0b0f1f]">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {editingItem ? 'Chỉnh sửa bảng giá' : 'Thêm bảng giá mới'}
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              {editingItem ? 'Cập nhật thông tin giá vé' : 'Cấu hình giá vé cho loại phòng và thời gian cụ thể'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* BODY */}
        <div className="px-6 py-5 space-y-5">
          {/* TÊN */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Tên quy tắc <span className="text-red-400">*</span>
            </label>
            <input
              placeholder="VD: 2D Thường - Ngày thường - Sáng"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={`w-full h-[45px] px-4 rounded-xl bg-[#020617] border ${
                errors.name ? 'border-red-500/50' : 'border-white/10'
              } text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all`}
            />
            {errors.name && (
              <p className="text-red-400 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* 3 COLUMN */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Loại phòng
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full h-[45px] px-4 rounded-xl bg-[#020617] border border-white/10 text-white focus:outline-none focus:border-red-500/50"
              >
                <option>2D</option>
                <option>3D</option>
                <option>IMAX</option>
                <option>4DX</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Loại ghế
              </label>
              <select
                value={form.seat}
                onChange={(e) => setForm({ ...form, seat: e.target.value })}
                className="w-full h-[45px] px-4 rounded-xl bg-[#020617] border border-white/10 text-white focus:outline-none focus:border-red-500/50"
              >
                <option>Thường</option>
                <option>VIP</option>
                <option>Couple</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Loại ngày
              </label>
              <select
                value={form.day}
                onChange={(e) => setForm({ ...form, day: e.target.value })}
                className="w-full h-[45px] px-4 rounded-xl bg-[#020617] border border-white/10 text-white focus:outline-none focus:border-red-500/50"
              >
                <option>Ngày thường</option>
                <option>Cuối tuần</option>
                <option>Lễ</option>
              </select>
            </div>
          </div>

          {/* KHUNG GIỜ */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Khung giờ
            </label>
            <select
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              className="w-full h-[45px] px-4 rounded-xl bg-[#020617] border border-white/10 text-white focus:outline-none focus:border-red-500/50"
            >
              <option>Sáng (trước 12h)</option>
              <option>Chiều (12h-18h)</option>
              <option>Tối (sau 18h)</option>
            </select>
          </div>

          {/* PRICE */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Giá gốc (₫) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={form.base}
                onChange={(e) => setForm({ ...form, base: e.target.value })}
                placeholder="85,000"
                className={`w-full h-[45px] px-4 rounded-xl bg-[#020617] border ${
                  errors.base ? 'border-red-500/50' : 'border-white/10'
                } text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50`}
              />
              {errors.base && (
                <p className="text-red-400 text-xs mt-1">{errors.base}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Giá áp dụng (₫)
              </label>
              <input
                type="number"
                value={form.final}
                onChange={(e) => setForm({ ...form, final: e.target.value })}
                placeholder="85,000"
                className={`w-full h-[45px] px-4 rounded-xl bg-[#020617] border ${
                  errors.final ? 'border-red-500/50' : 'border-white/10'
                } text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50`}
              />
              {errors.final && (
                <p className="text-red-400 text-xs mt-1">{errors.final}</p>
              )}
            </div>
          </div>

          {/* Trạng thái (chỉ hiện khi edit) */}
          {editingItem && (
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Trạng thái
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setForm({ ...form, active: true })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    form.active 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  Đang áp dụng
                </button>
                <button
                  onClick={() => setForm({ ...form, active: false })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    !form.active 
                      ? 'bg-red-500/20 text-gray-400 border border-gray-500/30' 
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  Ngưng áp dụng
                </button>
              </div>
            </div>
          )}

          {/* Preview */}
          {form.type && form.name && (
            <div className="mt-4 p-3 bg-[#020617] rounded-xl border border-white/5">
              <p className="text-xs text-gray-400 mb-2">Xem trước:</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2 py-1 rounded-lg text-xs font-medium bg-${getTypeColor(form.type)}-500/20 text-${getTypeColor(form.type)}-400`}>
                  {form.type}
                </span>
                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                  form.seat === 'VIP' ? 'bg-amber-500/20 text-amber-400' :
                  form.seat === 'Couple' ? 'bg-pink-500/20 text-pink-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {form.seat}
                </span>
                <span className="text-sm text-white">{form.name}</span>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex gap-4 px-6 py-5 border-t border-white/10 sticky bottom-0 bg-[#0b0f1f]">
          <button
            onClick={onClose}
            className="flex-1 h-[48px] bg-[#1f2937] hover:bg-[#374151] rounded-xl text-gray-300 font-medium transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 h-[48px] bg-red-600 hover:bg-red-700 rounded-xl font-semibold transition-colors shadow-lg shadow-red-600/30"
          >
            {editingItem ? 'Cập nhật' : 'Thêm giá vé'}
          </button>
        </div>
      </div>
    </div>
  );
}