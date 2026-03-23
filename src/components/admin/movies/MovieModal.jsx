import { X } from "lucide-react";

export default function MovieModal({
  show,
  onClose,
  onSave,
  form = {},
  setForm,
  isEdit = false,
}) {
  if (!show) return null;

  const inputClass =
    "w-full h-[42px] px-3 rounded-lg bg-[#020617] border border-white/10 text-white outline-none focus:border-red-500";

  const labelClass = "text-[13px] text-gray-400 mb-1.5 block";

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
      <div className="w-[620px] bg-[#0b0f1f] rounded-2xl border border-white/10">
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-white/10">
          <h2 className="text-white text-lg font-semibold">
            {isEdit ? "Chỉnh sửa phim" : "Thêm phim mới"}
          </h2>
          <X
            size={18}
            className="text-gray-400 hover:text-white cursor-pointer"
            onClick={onClose}
          />
        </div>

        {/* BODY */}
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Tên phim</label>
              <input
                value={form?.title || ""}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Tên gốc</label>
              <input
                value={form?.originalTitle || ""}
                onChange={(e) =>
                  setForm({ ...form, originalTitle: e.target.value })
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Đạo diễn</label>
              <input
                value={form?.director || ""}
                onChange={(e) => setForm({ ...form, director: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Diễn viên</label>
              <input
                value={form?.cast || ""}
                onChange={(e) => setForm({ ...form, cast: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Quốc gia</label>
              <input
                value={form?.country || ""}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Ngày khởi chiếu</label>
              <input
                type="date"
                value={form?.releaseDate || ""}
                onChange={(e) =>
                  setForm({ ...form, releaseDate: e.target.value })
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Thời lượng</label>
              <input
                type="number"
                value={form?.duration || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    duration: Number(e.target.value),
                  })
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Phân loại</label>
              <select
                value={form?.rating || "P"}
                onChange={(e) => setForm({ ...form, rating: e.target.value })}
                className={inputClass}
              >
                <option value="P">P</option>
                <option value="T13">T13</option>
                <option value="T16">T16</option>
                <option value="T18">T18</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Trạng thái</label>
            <select
              value={form?.status || "coming_soon"}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className={inputClass}
            >
              <option value="coming_soon">Sắp chiếu</option>
              <option value="now_showing">Đang chiếu</option>
              <option value="ended">Đã kết thúc</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Thể loại</label>
            <input
              value={form?.genre?.join(", ") || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  genre: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              className={inputClass}
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex gap-4 px-6 py-5 border-t border-white/10">
          <button
            onClick={onClose}
            className="flex-1 h-[44px] bg-gray-700 rounded-lg"
          >
            Hủy
          </button>

          <button
            onClick={() =>
              onSave({
                ...form,
                genre: form.genre || [],
              })
            }
            className="flex-1 h-[44px] bg-red-600 rounded-lg font-semibold"
          >
            {isEdit ? "Cập nhật" : "Thêm phim"}
          </button>
        </div>
      </div>
    </div>
  );
}
