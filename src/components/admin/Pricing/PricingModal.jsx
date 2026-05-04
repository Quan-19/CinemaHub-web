import { useState, useEffect } from "react";
import { X, Calendar, Sparkles } from "lucide-react";
import { getPricingRuleRoomType, isHolidayPricingRule } from "../../../utils/pricingRuleUtils";
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

const roomTypes = [
  { value: "2D", label: "2D", color: "blue" },
  { value: "3D", label: "3D", color: "purple" },
  { value: "IMAX", label: "IMAX", color: "yellow" },
  { value: "4DX", label: "4DX", color: "green" },
];

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
    active: true,
    isHolyday: false,
    start_date: "",
    end_date: "",
    apply_days: [0, 1, 2, 3, 4, 5, 6],
    holiday_prices: [
      { seat_type: "Thường", price: "" },
      { seat_type: "VIP", price: "" },
      { seat_type: "Couple", price: "" }
    ],
    holiday_room_type: "2D",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingItem) {
      const isHoliday = isHolidayPricingRule(editingItem);
      const roomType = getPricingRuleRoomType(editingItem);
      setForm({
        name: editingItem.name || "",
        type: roomType,
        seat: editingItem.seat || "Thường",
        day: editingItem.day || "Ngày thường",
        time: editingItem.time || "Chiều (12h-18h)",
        base: editingItem.base || editingItem.base_price || "",
        final: editingItem.final || editingItem.final_price || "",
        active: editingItem.active !== undefined ? editingItem.active : true,
        isHolyday: isHoliday,
        start_date: editingItem.start_date || "",
        end_date: editingItem.end_date || "",
        apply_days: editingItem.apply_days || [0, 1, 2, 3, 4, 5, 6],
        holiday_prices: editingItem.holiday_prices || [
          { seat_type: "Thường", price: "" },
          { seat_type: "VIP", price: "" },
          { seat_type: "Couple", price: "" }
        ],
        holiday_room_type: roomType,
      });
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
        active: true,
        isHolyday: false,
        start_date: "",
        end_date: "",
        apply_days: [0, 1, 2, 3, 4, 5, 6],
        holiday_prices: [
          { seat_type: "Thường", price: "" },
          { seat_type: "VIP", price: "" },
          { seat_type: "Couple", price: "" }
        ],
        holiday_room_type: "2D",
      });
    }
    setErrors({});
  }, [editingItem, show]);

  if (!show) return null;

  const toggleApplyDay = (day) => {
    setForm(prev => ({
      ...prev,
      apply_days: prev.apply_days.includes(day)
        ? prev.apply_days.filter(d => d !== day)
        : [...prev.apply_days, day].sort((a, b) => a - b)
    }));
  };

  const updateHolidayPrice = (seatType, price) => {
    setForm(prev => ({
      ...prev,
      holiday_prices: prev.holiday_prices.map(hp =>
        hp.seat_type === seatType ? { ...hp, price: price } : hp
      )
    }));
  };

  const validate = () => {
    const newErrors = {};
    
    if (form.isHolyday) {
      if (!form.name.trim()) newErrors.name = "Tên quy tắc không được để trống";
      if (!form.holiday_room_type) newErrors.holiday_room_type = "Vui lòng chọn loại phòng";
      if (!form.start_date) newErrors.start_date = "Vui lòng chọn ngày bắt đầu";
      if (!form.end_date) newErrors.end_date = "Vui lòng chọn ngày kết thúc";
      
      for (const hp of form.holiday_prices) {
        if (!hp.price || Number(hp.price) <= 0) {
          newErrors.holiday_prices = `Vui lòng nhập giá cho ghế ${hp.seat_type}`;
          break;
        }
      }
      
      if (form.start_date && form.end_date && form.start_date > form.end_date) {
        newErrors.end_date = "Ngày kết thúc phải sau ngày bắt đầu";
      }
    } else {
      if (!form.name.trim()) newErrors.name = "Tên quy tắc không được để trống";
      if (!form.type) newErrors.type = "Vui lòng chọn loại phòng";
      if (!form.seat) newErrors.seat = "Vui lòng chọn loại ghế";
      if (!form.day) newErrors.day = "Vui lòng chọn loại ngày";
      if (!form.time) newErrors.time = "Vui lòng chọn khung giờ";
      if (!form.base) newErrors.base = "Vui lòng nhập giá gốc";
      if (form.base && Number(form.base) < 0) newErrors.base = "Giá không thể âm";
      if (form.final && Number(form.final) < 0) newErrors.final = "Giá không thể âm";
    }
    
    return newErrors;
  };

  const handleSubmit = () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (form.isHolyday) {
      const processedForm = {
        name: form.name,
        type: form.holiday_room_type,
        start_date: form.start_date,
        end_date: form.end_date,
        apply_days: form.apply_days,
        holiday_prices: form.holiday_prices,
        active: form.active !== undefined ? form.active : true,
      };

      if (editingItem) {
        onUpdate({ ...processedForm, id: editingItem.id });
      } else {
        onAdd(processedForm);
      }
    } else {
      const processedForm = {
        name: form.name,
        type: form.type,
        seat: form.seat,
        day: form.day,
        time: form.time,
        base: Number(form.base),
        final: form.final ? Number(form.final) : Number(form.base),
        active: form.active !== undefined ? form.active : true,
      };

      if (editingItem) {
        onUpdate({ ...processedForm, id: editingItem.id });
      } else {
        onAdd(processedForm);
      }
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
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="w-full max-w-[560px] bg-cinema-surface rounded-2xl border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center px-6 py-5 border-b border-white/10 sticky top-0 bg-cinema-surface">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {editingItem ? 'Chỉnh sửa bảng giá' : 'Thêm bảng giá mới'}
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              {editingItem ? 'Cập nhật thông tin giá vé' : 'Cấu hình giá vé cho loại phòng và thời gian cụ thể'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div className="bg-cinema-bg rounded-xl p-4">
            <label className="text-sm font-medium text-gray-300 mb-3 block">Loại giá</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, isHolyday: false })}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  !form.isHolyday
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                    : 'bg-zinc-900 text-gray-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                Giá thường
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, isHolyday: true })}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  form.isHolyday
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                    : 'bg-zinc-900 text-gray-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <Calendar size={16} className="inline mr-2" />
                Giá ngày lễ
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Tên quy tắc <span className="text-red-400">*</span>
            </label>
            <input
              placeholder={form.isHolyday ? "VD: Tết Nguyên Đán 2025" : "VD: 2D Thường - Ngày thường - Sáng"}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={`w-full h-[45px] px-4 rounded-xl bg-zinc-900 border ${
                errors.name ? 'border-red-500/50' : 'border-white/10'
              } text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all`}
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>

          {!form.isHolyday ? (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Loại phòng <span className="text-red-400">*</span></label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full h-[45px] px-4 rounded-xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-red-500/50"
                  >
                    <option value="2D">2D</option>
                    <option value="3D">3D</option>
                    <option value="IMAX">IMAX</option>
                    <option value="4DX">4DX</option>
                  </select>
                  {errors.type && <p className="text-red-400 text-xs mt-1">{errors.type}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Loại ghế <span className="text-red-400">*</span></label>
                  <select
                    value={form.seat}
                    onChange={(e) => setForm({ ...form, seat: e.target.value })}
                    className="w-full h-[45px] px-4 rounded-xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-red-500/50"
                  >
                    <option value="Thường">Thường</option>
                    <option value="VIP">VIP</option>
                    <option value="Couple">Couple</option>
                  </select>
                  {errors.seat && <p className="text-red-400 text-xs mt-1">{errors.seat}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Loại ngày <span className="text-red-400">*</span></label>
                  <select
                    value={form.day}
                    onChange={(e) => setForm({ ...form, day: e.target.value })}
                    className="w-full h-[45px] px-4 rounded-xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-red-500/50"
                  >
                    <option value="Ngày thường">Ngày thường</option>
                    <option value="Cuối tuần">Cuối tuần</option>
                    <option value="Lễ">Lễ</option>
                  </select>
                  {errors.day && <p className="text-red-400 text-xs mt-1">{errors.day}</p>}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Khung giờ <span className="text-red-400">*</span></label>
                <select
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  className="w-full h-[45px] px-4 rounded-xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-red-500/50"
                >
                  <option value="Sáng (0h-11h)">Sáng (0h-11h)</option>
                  <option value="Chiều (12h-18h)">Chiều (12h-18h)</option>
                  <option value="Tối (18h-23h)">Tối (18h-23h)</option>
                </select>
                {errors.time && <p className="text-red-400 text-xs mt-1">{errors.time}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Giá gốc (₫) <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9,]*"
                    value={formatNumberInput(form.base)}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        base: parseNumberInput(e.target.value),
                      })
                    }
                    placeholder="85000"
                    className="w-full h-[45px] px-4 rounded-xl bg-zinc-900 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50"
                  />
                  {errors.base && <p className="text-red-400 text-xs mt-1">{errors.base}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Giá áp dụng (₫)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9,]*"
                    value={formatNumberInput(form.final)}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        final: parseNumberInput(e.target.value),
                      })
                    }
                    placeholder="85000"
                    className="w-full h-[45px] px-4 rounded-xl bg-zinc-900 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Để trống nếu bằng giá gốc</p>
                  {errors.final && <p className="text-red-400 text-xs mt-1">{errors.final}</p>}
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Loại phòng <span className="text-red-400">*</span></label>
                <select
                  value={form.holiday_room_type}
                  onChange={(e) => setForm({ ...form, holiday_room_type: e.target.value })}
                  className="w-full h-[45px] px-4 rounded-xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-red-500/50"
                >
                  {roomTypes.map(room => (
                    <option key={room.value} value={room.value}>{room.label}</option>
                  ))}
                </select>
                {errors.holiday_room_type && <p className="text-red-400 text-xs mt-1">{errors.holiday_room_type}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Ngày bắt đầu <span className="text-red-400">*</span></label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                    className="w-full h-[45px] px-4 rounded-xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-red-500/50"
                  />
                  {errors.start_date && <p className="text-red-400 text-xs mt-1">{errors.start_date}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Ngày kết thúc <span className="text-red-400">*</span></label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                    className="w-full h-[45px] px-4 rounded-xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-red-500/50"
                  />
                  {errors.end_date && <p className="text-red-400 text-xs mt-1">{errors.end_date}</p>}
                </div>
              </div>

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
                          : 'bg-zinc-900 text-gray-400 hover:text-white border border-white/10 hover:bg-zinc-800'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-cinema-bg rounded-xl p-4 border border-yellow-500/30">
                <label className="text-sm font-medium text-yellow-400 mb-3 block">
                  <Sparkles size={14} className="inline mr-2" />
                  Giá vé ngày lễ đặc biệt <span className="text-red-400">*</span>
                </label>
                <div className="space-y-3">
                  {seatTypes.map(seat => (
                    <div key={seat.value} className="flex items-center gap-4">
                      <div className="w-28">
                        <span className={`text-sm font-medium ${seat.color}`}>{seat.label}</span>
                      </div>
                      <div className="flex-1 relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₫</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9,]*"
                          placeholder="Giá vé"
                          value={formatNumberInput(
                            form.holiday_prices.find(
                              (hp) => hp.seat_type === seat.value
                            )?.price || ""
                          )}
                          onChange={(e) =>
                            updateHolidayPrice(
                              seat.value,
                              parseNumberInput(e.target.value)
                            )
                          }
                          className="w-full bg-zinc-900 border border-white/10 rounded-lg pl-8 pr-4 py-2.5 text-white text-sm outline-none focus:border-yellow-500/50"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {errors.holiday_prices && <p className="text-red-400 text-xs mt-3">{errors.holiday_prices}</p>}
              </div>
            </>
          )}

          {editingItem && (
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Trạng thái</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, active: true })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    form.active ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  Đang áp dụng
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, active: false })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    !form.active ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  Ngưng áp dụng
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4 px-6 py-5 border-t border-white/10 sticky bottom-0 bg-cinema-surface">
          <button onClick={onClose} className="flex-1 h-[48px] bg-zinc-900 hover:bg-zinc-800 rounded-xl text-gray-300 font-medium transition-colors">
            Hủy bỏ
          </button>
          <button onClick={handleSubmit} className="flex-1 h-[48px] bg-red-600 hover:bg-red-700 rounded-xl font-semibold transition-colors shadow-lg shadow-red-600/30">
            {editingItem ? 'Cập nhật' : 'Thêm giá vé'}
          </button>
        </div>
      </div>
    </div>
  );
}