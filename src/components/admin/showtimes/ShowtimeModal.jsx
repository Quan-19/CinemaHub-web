import { X, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

export default function ShowtimeModal({
  show,
  onClose,
  onSave,
  form,
  setForm,
  isEdit,
  movies,
  cinemas,
  loading,
  specialTypes,
}) {
  const [availableRooms, setAvailableRooms] = useState([]);

  useEffect(() => {
    if (form?.cinemaId) {
      const cinema = cinemas.find(c => c.id === form.cinemaId);
      setAvailableRooms(cinema?.rooms || []);
    }
  }, [form?.cinemaId, cinemas]);

  if (!show) return null;

  const inputClass = "w-full bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-red-500/50 transition placeholder:text-white/30";
  
  const selectClass = "w-full bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-red-500/50 transition [&>option]:bg-[#2d2d44] [&>option]:text-white";

  const handleMovieChange = (movieId) => {
    const movie = movies.find(m => m.id === movieId);
    setForm({ 
      movieId, 
      movieTitle: movie?.title || "" 
    });
  };

  const handleCinemaChange = (cinemaId) => {
    const cinema = cinemas.find(c => c.id === cinemaId);
    setForm({ 
      cinemaId, 
      cinemaName: cinema?.name || "",
      roomId: cinema?.rooms[0]?.id || "" 
    });
  };

  const handleRoomChange = (roomId) => {
    const cinema = cinemas.find(c => c.id === form.cinemaId);
    const room = cinema?.rooms.find(r => r.id === roomId);
    setForm({ 
      roomId, 
      roomName: room?.name,
      type: room?.type,
      totalSeats: room?.capacity,
      availableSeats: room?.capacity
    });
  };

  const handleSpecialTypeChange = (specialType) => {
    setForm({ 
      specialType,
      special: specialType !== "none"
    });
  };

  const handlePriceChange = (type, value) => {
    setForm({
      price: {
        ...form.price,
        [type]: Number(value)
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-lg bg-[#0d0d1a] border border-white/10 rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">
            {isEdit ? "Chỉnh sửa suất chiếu" : "Thêm suất chiếu"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 text-white/50 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            {/* Phim */}
            <div className="col-span-2">
              <label className="block text-xs text-white/55 mb-1.5">Phim *</label>
              <select
                value={form.movieId || ""}
                onChange={e => handleMovieChange(e.target.value)}
                className={selectClass}
                required
                style={{ backgroundColor: '#1a1a2e' }}
              >
                <option value="" className="bg-[#2d2d44] text-white/70">Chọn phim</option>
                {movies.map(movie => (
                  <option key={movie.id} value={movie.id} className="bg-[#2d2d44] text-white hover:bg-[#3d3d5c]">
                    {movie.title} ({movie.rating}) - {movie.duration} phút
                  </option>
                ))}
              </select>
            </div>

            {/* Rạp chiếu */}
            <div>
              <label className="block text-xs text-white/55 mb-1.5">Rạp chiếu *</label>
              <select
                value={form.cinemaId || ""}
                onChange={e => handleCinemaChange(e.target.value)}
                className={selectClass}
                required
                style={{ backgroundColor: '#1a1a2e' }}
              >
                <option value="" className="bg-[#2d2d44] text-white/70">Chọn rạp</option>
                {cinemas.map(cinema => (
                  <option key={cinema.id} value={cinema.id} className="bg-[#2d2d44] text-white">
                    {cinema.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Phòng chiếu */}
            <div>
              <label className="block text-xs text-white/55 mb-1.5">Phòng chiếu *</label>
              <select
                value={form.roomId || ""}
                onChange={e => handleRoomChange(e.target.value)}
                className={selectClass}
                disabled={!form.cinemaId}
                required
                style={{ backgroundColor: '#1a1a2e' }}
              >
                <option value="" className="bg-[#2d2d44] text-white/70">Chọn phòng</option>
                {availableRooms.map(room => (
                  <option key={room.id} value={room.id} className="bg-[#2d2d44] text-white">
                    {room.name} ({room.type} - {room.capacity} ghế)
                  </option>
                ))}
              </select>
            </div>

            {/* Ngày chiếu */}
            <div>
              <label className="block text-xs text-white/55 mb-1.5">Ngày chiếu *</label>
              <input
                type="date"
                value={form.date || ""}
                onChange={e => setForm({ date: e.target.value })}
                className={inputClass}
                min={new Date().toISOString().split('T')[0]}
                required
                style={{ colorScheme: 'dark' }}
              />
            </div>

            {/* Giờ chiếu */}
            <div>
              <label className="block text-xs text-white/55 mb-1.5">Giờ chiếu *</label>
              <input
                type="time"
                value={form.time || ""}
                onChange={e => setForm({ time: e.target.value })}
                className={inputClass}
                required
                style={{ colorScheme: 'dark' }}
              />
            </div>

            {/* Định dạng */}
            <div>
              <label className="block text-xs text-white/55 mb-1.5">Định dạng</label>
              <input
                type="text"
                value={form.type || ""}
                className={inputClass + " bg-[#2d2d44]"}
                disabled
                readOnly
              />
            </div>

            {/* Tổng số ghế */}
            <div>
              <label className="block text-xs text-white/55 mb-1.5">Số ghế</label>
              <input
                type="text"
                value={form.totalSeats || ""}
                className={inputClass + " bg-[#2d2d44]"}
                disabled
                readOnly
              />
            </div>

            {/* Loại suất đặc biệt */}
            <div className="col-span-2">
              <label className="block text-xs text-white/55 mb-1.5 flex items-center gap-1">
                <Sparkles size={12} className="text-purple-400" />
                Loại suất chiếu
              </label>
              <select
                value={form.specialType || "none"}
                onChange={e => handleSpecialTypeChange(e.target.value)}
                className={selectClass}
                style={{ backgroundColor: '#1a1a2e' }}
              >
                <option value="none" className="bg-[#2d2d44] text-white">Suất chiếu thường</option>
                {specialTypes.map(type => (
                  <option 
                    key={type.value} 
                    value={type.value} 
                    className="bg-[#2d2d44]"
                    style={{ color: type.color }}
                  >
                    {type.icon} {type.label} {type.multiplier !== 1 && `(${type.multiplier > 1 ? '+' : ''}${Math.round((type.multiplier - 1) * 100)}% giá)`}
                  </option>
                ))}
              </select>
              {form.specialType !== "none" && (
                <p className="text-[10px] text-purple-400 mt-1">
                  ✨ Giá vé sẽ tự động điều chỉnh theo loại suất chiếu
                </p>
              )}
            </div>

            {/* Giá vé */}
            <div className="col-span-2">
              <label className="block text-xs text-white/55 mb-1.5">Giá vé (VNĐ)</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="number"
                    placeholder="Người lớn"
                    value={form.price?.adult || ""}
                    onChange={e => handlePriceChange('adult', e.target.value)}
                    className={inputClass}
                    min="0"
                    step="1000"
                  />
                  <p className="text-[10px] text-white/30 mt-1">Người lớn</p>
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Trẻ em"
                    value={form.price?.child || ""}
                    onChange={e => handlePriceChange('child', e.target.value)}
                    className={inputClass}
                    min="0"
                    step="1000"
                  />
                  <p className="text-[10px] text-white/30 mt-1">Trẻ em</p>
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Sinh viên"
                    value={form.price?.student || ""}
                    onChange={e => handlePriceChange('student', e.target.value)}
                    className={inputClass}
                    min="0"
                    step="1000"
                  />
                  <p className="text-[10px] text-white/30 mt-1">Sinh viên</p>
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="VIP"
                    value={form.price?.vip || ""}
                    onChange={e => handlePriceChange('vip', e.target.value)}
                    className={inputClass}
                    min="0"
                    step="1000"
                  />
                  <p className="text-[10px] text-white/30 mt-1">VIP</p>
                </div>
              </div>
            </div>

            {/* Trạng thái */}
            <div>
              <label className="block text-xs text-white/55 mb-1.5">Trạng thái</label>
              <select
                value={form.status || "scheduled"}
                onChange={e => setForm({ status: e.target.value })}
                className={selectClass}
                style={{ backgroundColor: '#1a1a2e' }}
              >
                <option value="scheduled" className="bg-[#2d2d44] text-green-400">Sắp chiếu</option>
                <option value="ongoing" className="bg-[#2d2d44] text-yellow-400">Đang chiếu</option>
                <option value="ended" className="bg-[#2d2d44] text-gray-400">Đã kết thúc</option>
                <option value="cancelled" className="bg-[#2d2d44] text-red-400">Hủy</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 pt-4 border-t border-white/10">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition disabled:opacity-50"
          >
            Huỷ
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={loading || !form?.movieId || !form?.cinemaId || !form?.roomId || !form?.date || !form?.time}
            className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Đang xử lý..." : (isEdit ? "Lưu thay đổi" : "Thêm suất")}
          </button>
        </div>
      </div>
    </div>
  );
}