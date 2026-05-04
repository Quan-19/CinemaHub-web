import { useState } from "react";
import { X, Percent, DollarSign, Calendar, Tag, Users } from "lucide-react";
import { formatNumberInput, parseNumberInput } from "../../../utils/numberFormat";

const seatTypes = [
  { value: "Thường", label: "Ghế Thường", color: "text-gray-400" },
  { value: "VIP", label: "Ghế VIP", color: "text-amber-400" },
  { value: "Couple", label: "Ghế Couple", color: "text-pink-400" },
];

const weekDays = [
  { value: 0, label: "CN" },
  { value: 1, label: "Thứ 2" },
  { value: 2, label: "Thứ 3" },
  { value: 3, label: "Thứ 4" },
  { value: 4, label: "Thứ 5" },
  { value: 5, label: "Thứ 6" },
  { value: 6, label: "Thứ 7" },
];

const toDateInputValue = (value) => {
  if (!value) return "";
  const raw = String(value);
  return raw.includes("T") ? raw.split("T")[0] : raw;
};

const buildInitialForm = (editingItem) => {
  if (editingItem) {
    return {
      title: editingItem.title || "",
      description: editingItem.description || "",
      code: editingItem.code || "",
      image: editingItem.image || "",
      discount_type: editingItem.discount_type || "percent",
      discount_value: editingItem.discount_value || "",
      min_order: editingItem.min_order || "",
      start_date: toDateInputValue(editingItem.start_date),
      end_date: toDateInputValue(editingItem.end_date),
      status: editingItem.status || "active",
      cinema_id: editingItem.cinema_id || null,
      apply_days: editingItem.apply_days || [0, 1, 2, 3, 4, 5, 6],
      usage_limit: editingItem.usage_limit || "",
      apply_seat_types:
        editingItem.apply_seat_types || ["Thường", "VIP", "Couple"],
    };
  }

  return {
    title: "",
    description: "",
    code: "",
    image: "",
    discount_type: "percent",
    discount_value: "",
    min_order: "",
    start_date: "",
    end_date: "",
    status: "active",
    cinema_id: null,
    apply_days: [0, 1, 2, 3, 4, 5, 6],
    usage_limit: "",
    apply_seat_types: ["Thường", "VIP", "Couple"],
  };
};

export default function PromotionModal({ show, onClose, onSave, editingItem }) {
  const [form, setForm] = useState(() => buildInitialForm(editingItem));

  const [errors, setErrors] = useState({});

  if (!show) return null;

  const validate = () => {
    const newErrors = {};
    
    if (!form.title.trim()) newErrors.title = "Vui lòng nhập tiêu đề";
    if (!form.code.trim()) newErrors.code = "Vui lòng nhập mã khuyến mãi";
    if (!form.start_date) newErrors.start_date = "Vui lòng chọn ngày bắt đầu";
    if (!form.end_date) newErrors.end_date = "Vui lòng chọn ngày kết thúc";
    
    if (!form.discount_value || Number(form.discount_value) <= 0) {
      newErrors.discount = "Vui lòng nhập giá trị giảm giá";
    }
    if (form.discount_type === "percent" && (form.discount_value < 0 || form.discount_value > 100)) {
      newErrors.discount_percent = "Phần trăm giảm giá phải từ 0-100";
    }
    
    if (form.start_date && form.end_date && form.start_date > form.end_date) {
      newErrors.end_date = "Ngày kết thúc phải sau ngày bắt đầu";
    }
    
    return newErrors;
  };

  const handleSubmit = () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    const submitData = {
      ...form,
      discount_value: Number(form.discount_value) || 0,
      min_order: Number(form.min_order) || 0,
      usage_limit: Number(form.usage_limit) || 0,
      start_date: toDateInputValue(form.start_date),
      end_date: toDateInputValue(form.end_date),
    };
    
    onSave(submitData);
  };

  const toggleApplyDay = (day) => {
    setForm(prev => ({
      ...prev,
      apply_days: prev.apply_days.includes(day)
        ? prev.apply_days.filter(d => d !== day)
        : [...prev.apply_days, day].sort((a, b) => a - b)
    }));
  };

  const toggleSeatType = (seat) => {
    setForm(prev => ({
      ...prev,
      apply_seat_types: prev.apply_seat_types.includes(seat)
        ? prev.apply_seat_types.filter(s => s !== seat)
        : [...prev.apply_seat_types, seat]
    }));
  };

  const inputClass = "w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-red-500/50 transition placeholder:text-white/30";
  const textareaClass = "w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-red-500/50 transition placeholder:text-white/30 resize-none";

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="w-full max-w-[720px] bg-cinema-surface rounded-2xl border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-white/10 sticky top-0 bg-cinema-surface">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {editingItem ? 'Chỉnh sửa khuyến mãi' : 'Thêm khuyến mãi mới'}
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              {editingItem ? 'Cập nhật thông tin khuyến mãi' : 'Tạo mã khuyến mãi hoặc giá đặc biệt cho ngày lễ tết'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Basic Info */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Tiêu đề <span className="text-red-400">*</span>
            </label>
            <input
              placeholder="VD: Khuyến mãi Tết Nguyên Đán 2024"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={`${inputClass} ${errors.title ? 'border-red-500/50' : ''}`}
            />
            {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Mã khuyến mãi <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                placeholder="VD: TET2024"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className={`${inputClass} pl-10 ${errors.code ? 'border-red-500/50' : ''}`}
                disabled={!!editingItem}
              />
            </div>
            {errors.code && <p className="text-red-400 text-xs mt-1">{errors.code}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Mô tả
            </label>
            <textarea
              rows={3}
              placeholder="Mô tả chi tiết về chương trình khuyến mãi..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={textareaClass}
            />
          </div>

          {/* Discount Section */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Hình thức giảm
              </label>
              <select
                value={form.discount_type}
                onChange={(e) => setForm({ ...form, discount_type: e.target.value, discount_value: "" })}
                className={inputClass}
              >
                <option value="percent">Giảm theo %</option>
                <option value="value">Giảm theo số tiền</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Giá trị giảm <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9,]*"
                placeholder={form.discount_type === 'percent' ? "VD: 20" : "VD: 50000"}
                value={formatNumberInput(form.discount_value)}
                onChange={(e) =>
                  setForm({
                    ...form,
                    discount_value: parseNumberInput(e.target.value),
                  })
                }
                className={`${inputClass} ${errors.discount ? 'border-red-500/50' : ''}`}
              />
              {errors.discount && <p className="text-red-400 text-xs mt-1">{errors.discount}</p>}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Ngày bắt đầu <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className={`${inputClass} ${errors.start_date ? 'border-red-500/50' : ''}`}
              />
              {errors.start_date && <p className="text-red-400 text-xs mt-1">{errors.start_date}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Ngày kết thúc <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className={`${inputClass} ${errors.end_date ? 'border-red-500/50' : ''}`}
              />
              {errors.end_date && <p className="text-red-400 text-xs mt-1">{errors.end_date}</p>}
            </div>
          </div>

          {/* Apply Days */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              <Calendar size={14} className="inline mr-2" />
              Áp dụng vào các ngày trong tuần
            </label>
            <div className="flex flex-wrap gap-2">
              {weekDays.map(day => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleApplyDay(day.value)}
                  className={`w-12 py-2 rounded-lg text-sm font-medium transition-all ${
                    form.apply_days.includes(day.value)
                      ? 'bg-red-600 text-white'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-gray-400 hover:text-white border border-white/10'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          {/* Apply Seat Types */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              <Users size={14} className="inline mr-2" />
              Áp dụng cho loại ghế
            </label>
            <div className="flex flex-wrap gap-3">
              {seatTypes.map(seat => (
                <button
                  key={seat.value}
                  type="button"
                  onClick={() => toggleSeatType(seat.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    form.apply_seat_types.includes(seat.value)
                      ? `${seat.color} bg-white/10 border border-current`
                      : 'text-gray-500 bg-zinc-900 hover:bg-zinc-800 border border-white/10 hover:text-white'
                  }`}
                >
                  {seat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Additional Options */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Đơn hàng tối thiểu (₫)
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9,]*"
                placeholder="0"
                value={formatNumberInput(form.min_order)}
                onChange={(e) =>
                  setForm({
                    ...form,
                    min_order: parseNumberInput(e.target.value),
                  })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Giới hạn số lượt sử dụng
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9,]*"
                placeholder="Không giới hạn"
                value={formatNumberInput(form.usage_limit)}
                onChange={(e) =>
                  setForm({
                    ...form,
                    usage_limit: parseNumberInput(e.target.value),
                  })
                }
                className={inputClass}
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Trạng thái
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, status: "active" })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  form.status === "active"
                    ? 'bg-green-600 text-white'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-gray-400 hover:text-white'
                }`}
              >
                Đang áp dụng
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, status: "inactive" })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  form.status === "inactive"
                    ? 'bg-gray-600 text-white'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-gray-400 hover:text-white'
                }`}
              >
                Ngưng áp dụng
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-4 px-6 py-5 border-t border-white/10 sticky bottom-0 bg-cinema-surface">
          <button
            onClick={onClose}
            className="flex-1 h-[48px] bg-zinc-900 hover:bg-zinc-800 rounded-xl text-gray-300 font-medium transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 h-[48px] bg-red-600 hover:bg-red-700 rounded-xl font-semibold transition-colors shadow-lg shadow-red-600/30"
          >
            {editingItem ? 'Cập nhật' : 'Thêm khuyến mãi'}
          </button>
        </div>
      </div>
    </div>
  );
}