import { X, Upload, Youtube, Plus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

export default function MovieModal({
  show,
  onClose,
  onSave,
  form = {},
  setForm,
  isEdit = false,
  uploading = false,
}) {
  if (!show) return null;

  const posterInputRef = useRef(null);
  const backdropInputRef = useRef(null);
  const [inputGenre, setInputGenre] = useState("");

  const inputClass =
    "w-full h-[42px] px-3 rounded-lg bg-zinc-900 border border-white/10 text-white outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all";
  
  const textareaClass =
    "w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 resize-none";

  const labelClass = "text-[13px] text-gray-400 mb-1.5 block font-medium";

  // Hàm thêm genre mới
  const addGenre = () => {
    const genre = inputGenre.trim();
    if (genre && !form.genre.includes(genre)) {
      setForm({
        ...form,
        genre: [...form.genre, genre]
      });
      setInputGenre("");
    }
  };

  // Hàm xóa genre
  const removeGenre = (indexToRemove) => {
    setForm({
      ...form,
      genre: form.genre.filter((_, index) => index !== indexToRemove)
    });
  };

  // Hàm xử lý khi nhập genre bằng dấu phẩy
  const handleGenreInputChange = (e) => {
    const value = e.target.value;
    setInputGenre(value);
    
    // Nếu người dùng nhập dấu phẩy, tự động thêm genre
    if (value.endsWith(',')) {
      const genreToAdd = value.slice(0, -1).trim();
      if (genreToAdd && !form.genre.includes(genreToAdd)) {
        setForm({
          ...form,
          genre: [...form.genre, genreToAdd]
        });
      }
      setInputGenre("");
    }
  };

  // Hàm xử lý khi nhấn phím Enter
  const handleGenreKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addGenre();
    }
  };

  const handlePosterChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File ảnh quá lớn! Tối đa 5MB");
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert("Chỉ chấp nhận file ảnh!");
        return;
      }
      setForm({ 
        ...form, 
        poster: file,
        posterPreview: URL.createObjectURL(file)
      });
    }
  };

  const handleBackdropChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File ảnh quá lớn! Tối đa 5MB");
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert("Chỉ chấp nhận file ảnh!");
        return;
      }
      setForm({ 
        ...form, 
        backdrop: file,
        backdropPreview: URL.createObjectURL(file)
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
      <div className="w-full max-w-[800px] max-h-[90vh] bg-cinema-surface rounded-2xl border border-white/10 flex flex-col">
        
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-white/10">
          <h2 className="text-white text-lg font-semibold">
            {isEdit ? "Chỉnh sửa phim" : "Thêm phim mới"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelClass}>
                Tên phim <span className="text-red-500">*</span>
              </label>
              <input
                value={form?.title || ""}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={inputClass}
                placeholder="Nhập tên phim"
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
                placeholder="Tên phim tiếng Anh"
              />
            </div>

            <div>
              <label className={labelClass}>Đạo diễn</label>
              <input
                value={form?.director || ""}
                onChange={(e) => setForm({ ...form, director: e.target.value })}
                className={inputClass}
                placeholder="Tên đạo diễn"
              />
            </div>

            <div>
              <label className={labelClass}>Diễn viên</label>
              <input
                value={form?.cast || ""}
                onChange={(e) => setForm({ ...form, cast: e.target.value })}
                className={inputClass}
                placeholder="Danh sách diễn viên"
              />
            </div>

            <div>
              <label className={labelClass}>Quốc gia</label>
              <input
                value={form?.country || ""}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className={inputClass}
                placeholder="Quốc gia sản xuất"
              />
            </div>

            <div>
              <label className={labelClass}>
                Ngày khởi chiếu <span className="text-red-500">*</span>
              </label>
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
              <label className={labelClass}>
                Thời lượng (phút) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={form?.duration || ""}
                onChange={(e) =>
                  setForm({ ...form, duration: Number(e.target.value) })
                }
                className={inputClass}
                placeholder="Thời lượng phim"
              />
            </div>

            <div>
              <label className={labelClass}>Phân loại</label>
              <select
                value={form?.ageRating || "P"}
                onChange={(e) =>
                  setForm({ ...form, ageRating: e.target.value })
                }
                className={inputClass}
              >
                <option value="P">P - Phù hợp mọi lứa tuổi</option>
                <option value="C13">C13 - Từ 13 tuổi trở lên</option>
                <option value="C16">C16 - Từ 16 tuổi trở lên</option>
                <option value="C18">C18 - Từ 18 tuổi trở lên</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Ngôn ngữ</label>
              <input
                value={form?.language || ""}
                onChange={(e) =>
                  setForm({ ...form, language: e.target.value })
                }
                className={inputClass}
                placeholder="Ngôn ngữ chiếu"
              />
            </div>

            <div>
              <label className={labelClass}>Phụ đề</label>
              <input
                value={form?.subtitle || ""}
                onChange={(e) =>
                  setForm({ ...form, subtitle: e.target.value })
                }
                className={inputClass}
                placeholder="Phụ đề"
              />
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
          </div>

          {/* GENRE - CẢI TIẾN */}
          <div>
            <label className={labelClass}>
              Thể loại <span className="text-red-500">*</span>
            </label>
            
            {/* Input thêm thể loại */}
            <div className="flex gap-2 mb-3">
              <input
                value={inputGenre}
                onChange={handleGenreInputChange}
                onKeyPress={handleGenreKeyPress}
                className={`${inputClass} flex-1`}
                placeholder="Nhập thể loại và nhấn Enter hoặc dùng dấu phẩy"
              />
              <button
                type="button"
                onClick={addGenre}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Plus size={16} />
                Thêm
              </button>
            </div>

            {/* Hiển thị danh sách thể loại đã thêm */}
            {form?.genre?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {form.genre.map((genre, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-sm font-medium group"
                  >
                    {genre}
                    <button
                      type="button"
                      onClick={() => removeGenre(index)}
                      className="ml-1 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 mt-2">
                ⚠️ Chưa có thể loại nào. Vui lòng thêm ít nhất 1 thể loại.
              </p>
            )}
            
          </div>

          <div>
            <label className={labelClass}>Mô tả phim</label>
            <textarea
              value={form?.description || ""}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows="3"
              className={textareaClass}
              placeholder="Mô tả nội dung phim..."
            />
          </div>

          {/* Poster Upload */}
          <div>
            <label className={labelClass}>Poster</label>
            <div className="flex gap-3 items-start">
              <button
                type="button"
                onClick={() => posterInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm transition-colors"
              >
                <Upload size={16} />
                Chọn ảnh poster
              </button>
              <input
                ref={posterInputRef}
                type="file"
                accept="image/*"
                onChange={handlePosterChange}
                className="hidden"
              />
              {form?.posterPreview && (
                <span className="text-xs text-green-400 self-center">
                  Đã chọn ảnh mới
                </span>
              )}
              {!form?.posterPreview && isEdit && form?.poster && (
                <span className="text-xs text-blue-400 self-center">
                  Giữ nguyên ảnh cũ
                </span>
              )}
            </div>
            {form?.posterPreview && (
              <div className="mt-2">
                <img
                  src={form.posterPreview}
                  alt="Poster preview"
                  className="w-32 h-40 object-cover rounded-lg border border-white/10"
                />
              </div>
            )}
          </div>

          {/* Backdrop Upload */}
          <div>
            <label className={labelClass}>Backdrop (ảnh nền)</label>
            <div className="flex gap-3 items-start">
              <button
                type="button"
                onClick={() => backdropInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm transition-colors"
              >
                <Upload size={16} />
                Chọn ảnh backdrop
              </button>
              <input
                ref={backdropInputRef}
                type="file"
                accept="image/*"
                onChange={handleBackdropChange}
                className="hidden"
              />
              {form?.backdropPreview && (
                <span className="text-xs text-green-400 self-center">
                  Đã chọn ảnh mới
                </span>
              )}
              {!form?.backdropPreview && isEdit && form?.backdrop && (
                <span className="text-xs text-blue-400 self-center">
                  Giữ nguyên ảnh cũ
                </span>
              )}
            </div>
            {form?.backdropPreview && (
              <div className="mt-2">
                <img
                  src={form.backdropPreview}
                  alt="Backdrop preview"
                  className="w-full h-32 object-cover rounded-lg border border-white/10"
                />
              </div>
            )}
          </div>

          <div>
            <label className={labelClass}>Trailer (YouTube URL)</label>
            <div className="flex items-center gap-2">
              <Youtube size={20} className="text-red-500" />
              <input
                value={form?.trailer || ""}
                onChange={(e) =>
                  setForm({ ...form, trailer: e.target.value })
                }
                className={inputClass}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
            {form?.trailer && (
              <p className="text-xs text-gray-500 mt-1">
                🔗 Đã nhập link trailer
              </p>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex gap-4 px-6 py-5 border-t border-white/10">
          <button
            onClick={onClose}
            disabled={uploading}
            className="flex-1 bg-gray-700 hover:bg-gray-600 rounded-lg h-[44px] transition-colors disabled:opacity-50 font-medium"
          >
            Hủy
          </button>

          <button
            onClick={() => {
              // Kiểm tra validation trước khi submit
              if (!form.title) {
                alert("Vui lòng nhập tên phim");
                return;
              }
              if (!form.releaseDate) {
                alert("Vui lòng chọn ngày khởi chiếu");
                return;
              }
              if (!form.duration || form.duration <= 0) {
                alert("Vui lòng nhập thời lượng hợp lệ");
                return;
              }
              if (!form.genre || form.genre.length === 0) {
                alert("Vui lòng thêm ít nhất 1 thể loại");
                return;
              }
              onSave(form);
            }}
            disabled={uploading}
            className="flex-1 bg-red-600 hover:bg-red-700 rounded-lg h-[44px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Đang xử lý...
              </span>
            ) : (
              isEdit ? "Cập nhật" : "Thêm phim"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}