import { useState } from "react";
import { X } from "lucide-react";

export default function PricingModal({ show, onClose, onAdd }) {
  const [form, setForm] = useState({
    name: "",
    type: "2D",
    seat: "Thường",
    day: "Ngày thường",
    time: "Chiều (12h-18h)",
    base: "",
    final: ""
  });

  if (!show) return null;

  const handleSubmit = () => {
    onAdd({
      ...form,
      id: Date.now().toString(),
      base: Number(form.base),
      final: Number(form.final),
      active: true
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

      <div className="w-[520px] bg-[#0b0f1f] rounded-2xl border border-white/10 shadow-2xl">

        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">
            Thêm bảng giá
          </h2>
          <X
            size={18}
            className="text-gray-400 hover:text-white cursor-pointer"
            onClick={onClose}
          />
        </div>

        {/* BODY */}
        <div className="px-6 py-5 space-y-5">

          {/* TÊN */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              Tên quy tắc
            </label>
            <input
              placeholder="VD: 2D Thường - Ngày thường - Sáng"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              className="w-full h-[42px] px-3 rounded-lg bg-[#020617] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
            />
          </div>

          {/* 3 COLUMN */}
          <div className="grid grid-cols-3 gap-4">

            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                Loại phòng
              </label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm({ ...form, type: e.target.value })
                }
                className="w-full h-[42px] px-3 rounded-lg bg-[#020617] border border-white/10 text-white"
              >
                <option>2D</option>
                <option>3D</option>
                <option>IMAX</option>
                <option>4DX</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                Loại ghế
              </label>
              <select
                value={form.seat}
                onChange={(e) =>
                  setForm({ ...form, seat: e.target.value })
                }
                className="w-full h-[42px] px-3 rounded-lg bg-[#020617] border border-white/10 text-white"
              >
                <option>Thường</option>
                <option>VIP</option>
                <option>Couple</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                Loại ngày
              </label>
              <select
                value={form.day}
                onChange={(e) =>
                  setForm({ ...form, day: e.target.value })
                }
                className="w-full h-[42px] px-3 rounded-lg bg-[#020617] border border-white/10 text-white"
              >
                <option>Ngày thường</option>
                <option>Cuối tuần</option>
              </select>
            </div>

          </div>

          {/* KHUNG GIỜ */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              Khung giờ
            </label>
            <select
              value={form.time}
              onChange={(e) =>
                setForm({ ...form, time: e.target.value })
              }
              className="w-full h-[42px] px-3 rounded-lg bg-[#020617] border border-white/10 text-white"
            >
              <option>Sáng (trước 12h)</option>
              <option>Chiều (12h-18h)</option>
              <option>Tối (sau 18h)</option>
            </select>
          </div>

          {/* PRICE */}
          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                Giá gốc (₫)
              </label>
              <input
                value={form.base}
                onChange={(e) =>
                  setForm({ ...form, base: e.target.value })
                }
                placeholder="85000"
                className="w-full h-[42px] px-3 rounded-lg bg-[#020617] border border-white/10 text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                Giá áp dụng (₫)
              </label>
              <input
                value={form.final}
                onChange={(e) =>
                  setForm({ ...form, final: e.target.value })
                }
                placeholder="85000"
                className="w-full h-[42px] px-3 rounded-lg bg-[#020617] border border-white/10 text-white focus:outline-none focus:border-red-500"
              />
            </div>

          </div>
        </div>

        {/* FOOTER */}
        <div className="flex gap-4 px-6 py-5 border-t border-white/10">

          <button
            onClick={onClose}
            className="flex-1 h-[44px] bg-[#1f2937] hover:bg-[#374151] rounded-lg text-gray-300"
          >
            Hủy
          </button>

          <button
            onClick={handleSubmit}
            className="flex-1 h-[44px] bg-red-600 hover:bg-red-700 rounded-lg font-semibold"
          >
            Thêm giá
          </button>

        </div>

      </div>
    </div>
  );
}