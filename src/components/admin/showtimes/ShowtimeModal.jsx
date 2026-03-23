import { X, Sparkles, Search } from "lucide-react";
import { useState, useEffect, useRef } from "react";

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
  const [searchMovieTerm, setSearchMovieTerm] = useState("");
  const [showMovieDropdown, setShowMovieDropdown] = useState(false);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const movieInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Cập nhật danh sách phòng khi chọn rạp
  useEffect(() => {
    if (form?.cinemaId) {
      const cinema = cinemas.find(c => c.id == form.cinemaId);
      if (cinema) {
        const rooms = cinema.rooms || [];
        setAvailableRooms(rooms);
        console.log("Available rooms for cinema:", rooms);
      } else {
        setAvailableRooms([]);
      }
    } else {
      setAvailableRooms([]);
    }
  }, [form?.cinemaId, cinemas]);

  useEffect(() => {
    if (form?.movieTitle) {
      setSearchMovieTerm(form.movieTitle);
    }
  }, [form?.movieTitle]);

  useEffect(() => {
    if (searchMovieTerm.trim() === "") {
      setFilteredMovies([]);
    } else {
      const filtered = movies.filter(movie =>
        movie.title?.toLowerCase().includes(searchMovieTerm.toLowerCase())
      );
      setFilteredMovies(filtered.slice(0, 10));
    }
  }, [searchMovieTerm, movies]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        movieInputRef.current &&
        !movieInputRef.current.contains(event.target)
      ) {
        setShowMovieDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!show) return null;

  const inputClass = "w-full bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-red-500/50 transition placeholder:text-white/30";
  
  const selectClass = "w-full bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-red-500/50 transition [&>option]:bg-[#2d2d44] [&>option]:text-white";

  const handleMovieSelect = (movie) => {
    setForm({ 
      ...form,
      movieId: movie.id, 
      movieTitle: movie.title,
      movieDuration: movie.duration
    });
    setSearchMovieTerm(movie.title);
    setShowMovieDropdown(false);
  };

  const handleMovieSearchChange = (value) => {
    setSearchMovieTerm(value);
    setShowMovieDropdown(true);
    if (value === "") {
      setForm({ ...form, movieId: "", movieTitle: "", movieDuration: null });
    }
  };

  const handleCinemaChange = (cinemaId) => {
    const cinema = cinemas.find(c => c.id == cinemaId);
    if (cinema) {
      const rooms = cinema.rooms || [];
      
      // Reset room selection when cinema changes
      setForm({ 
        ...form,
        cinemaId, 
        cinemaName: cinema?.name || "",
        roomId: "",
        roomName: "",
        type: "",
        totalSeats: 0,
        availableSeats: 0,
      });
    }
  };

  const handleRoomChange = (roomId) => {
    const cinema = cinemas.find(c => c.id == form.cinemaId);
    const room = cinema?.rooms?.find(r => r.id == roomId);
    if (room) {
      setForm({ 
        ...form,
        roomId, 
        roomName: room.name,
        type: room.type,
        totalSeats: room.capacity || room.totalSeats || 0,
        availableSeats: room.capacity || room.totalSeats || 0,
      });
    }
  };

  const handleSpecialTypeChange = (specialType) => {
    setForm({ 
      ...form,
      specialType,
      special: specialType !== "none"
    });
  };

  const handlePriceChange = (type, value) => {
    setForm({
      ...form,
      price: {
        ...form.price,
        [type]: Number(value)
      }
    });
  };

  const selectedCinema = cinemas.find(c => c.id == form?.cinemaId);
  const currentRoomCount = selectedCinema?.rooms?.length || 0;
  const maxRooms = selectedCinema?.maxRooms || 4;

  // Kiểm tra xem có phòng nào không
  const hasRooms = availableRooms.length > 0;
  const isRoomDisabled = !form?.cinemaId || !hasRooms;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-lg bg-[#0d0d1a] border border-white/10 rounded-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-white/10 flex-shrink-0">
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

        {/* Body - Scrollable */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-4">
            {/* Phim - Autocomplete */}
            <div className="col-span-2 relative">
              <label className="block text-xs text-white/55 mb-1.5">Phim *</label>
              <div className="relative">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35" />
                  <input
                    ref={movieInputRef}
                    type="text"
                    value={searchMovieTerm}
                    onChange={(e) => handleMovieSearchChange(e.target.value)}
                    onFocus={() => setShowMovieDropdown(true)}
                    placeholder="Gõ tên phim để tìm kiếm..."
                    className="w-full bg-[#1a1a2e] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-white text-sm outline-none focus:border-red-500/50 transition placeholder:text-white/30"
                  />
                  {searchMovieTerm && (
                    <button
                      onClick={() => {
                        handleMovieSearchChange("");
                        setForm({ ...form, movieId: "", movieTitle: "", movieDuration: null });
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <X size={14} className="text-white/35 hover:text-white/70" />
                    </button>
                  )}
                </div>

                {showMovieDropdown && filteredMovies.length > 0 && (
                  <div
                    ref={dropdownRef}
                    className="absolute z-50 mt-1 w-full bg-[#1a1a2e] border border-white/10 rounded-lg shadow-xl max-h-64 overflow-y-auto"
                  >
                    {filteredMovies.map(movie => (
                      <button
                        key={movie.id}
                        onClick={() => handleMovieSelect(movie)}
                        className="w-full text-left px-4 py-2.5 hover:bg-white/10 transition border-b border-white/5 last:border-0"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white font-medium">{movie.title}</span>
                          <span className="text-xs text-white/40">{movie.duration} phút</span>
                        </div>
                        {movie.rating && (
                          <div className="text-xs text-white/30 mt-0.5">
                            {movie.rating} • {movie.language || "Phụ đề"}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {showMovieDropdown && searchMovieTerm && filteredMovies.length === 0 && (
                  <div className="absolute z-50 mt-1 w-full bg-[#1a1a2e] border border-white/10 rounded-lg shadow-xl p-4 text-center">
                    <p className="text-sm text-white/40">Không tìm thấy phim "{searchMovieTerm}"</p>
                  </div>
                )}
              </div>
              {form?.movieId && (
                <p className="text-[10px] text-green-400 mt-1">
                  ✓ Đã chọn: {form.movieTitle}
                </p>
              )}
            </div>

            {/* Rạp chiếu */}
            <div>
              <label className="block text-xs text-white/55 mb-1.5">Rạp chiếu *</label>
              <select
                value={form?.cinemaId || ""}
                onChange={e => handleCinemaChange(e.target.value)}
                className={selectClass}
                required
              >
                <option value="" className="bg-[#2d2d44] text-white/70">Chọn rạp</option>
                {cinemas.map(cinema => {
                  const roomCount = cinema.rooms?.length || 0;
                  const maxRoomLimit = cinema.maxRooms || 4;
                  return (
                    <option key={cinema.id} value={cinema.id} className="bg-[#2d2d44] text-white">
                      {cinema.name} ({roomCount}/{maxRoomLimit} phòng)
                    </option>
                  );
                })}
              </select>
              {form?.cinemaId && selectedCinema && (
                <p className="text-[10px] text-white/40 mt-1">
                  Rạp có {currentRoomCount}/{maxRooms} phòng
                </p>
              )}
            </div>

            {/* Phòng chiếu - Mở khóa khi đã chọn rạp */}
            <div>
              <label className="block text-xs text-white/55 mb-1.5">Phòng chiếu *</label>
              <select
                value={form?.roomId || ""}
                onChange={e => handleRoomChange(e.target.value)}
                className={selectClass}
                disabled={isRoomDisabled}
                required
                style={{ opacity: isRoomDisabled ? 0.5 : 1 }}
              >
                <option value="" className="bg-[#2d2d44] text-white/70">
                  {!form?.cinemaId 
                    ? "Chọn rạp trước" 
                    : !hasRooms 
                    ? "Rạp này chưa có phòng" 
                    : "Chọn phòng"}
                </option>
                {availableRooms.map(room => (
                  <option key={room.id} value={room.id} className="bg-[#2d2d44] text-white">
                    {room.name} ({room.type} - {room.capacity || room.totalSeats || 0} ghế)
                  </option>
                ))}
              </select>
              {form?.cinemaId && !hasRooms && (
                <p className="text-[10px] text-yellow-400 mt-1">
                  ⚠️ Rạp này chưa có phòng chiếu. Vui lòng thêm phòng trước.
                </p>
              )}
              {form?.roomId && form?.type && (
                <p className="text-[10px] text-blue-400 mt-1">
                  📍 Định dạng: {form.type} • Sức chứa: {form.totalSeats} ghế
                </p>
              )}
            </div>

            {/* Ngày chiếu */}
            <div>
              <label className="block text-xs text-white/55 mb-1.5">Ngày chiếu *</label>
              <input
                type="date"
                value={form?.date || ""}
                onChange={e => setForm({ ...form, date: e.target.value })}
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
                value={form?.time || ""}
                onChange={e => setForm({ ...form, time: e.target.value })}
                className={inputClass}
                required
                style={{ colorScheme: 'dark' }}
              />
            </div>

            {/* Định dạng - Hiển thị từ phòng đã chọn */}
            <div>
              <label className="block text-xs text-white/55 mb-1.5">Định dạng</label>
              <div className={`w-full border rounded-lg px-3 py-2 text-sm ${form?.type ? 'text-white' : 'text-white/40'} bg-[#2d2d44] border-white/10`}>
                {form?.type || "Chưa chọn phòng"}
              </div>
            </div>

            {/* Tổng số ghế - Hiển thị từ phòng đã chọn */}
            <div>
              <label className="block text-xs text-white/55 mb-1.5">Số ghế</label>
              <div className="w-full bg-[#2d2d44] border border-white/10 rounded-lg px-3 py-2 text-white text-sm">
                {form?.totalSeats || 0} ghế
              </div>
            </div>

            {/* Loại suất đặc biệt */}
            <div className="col-span-2">
              <label className="block text-xs text-white/55 mb-1.5 flex items-center gap-1">
                <Sparkles size={12} className="text-purple-400" />
                Loại suất chiếu
              </label>
              <select
                value={form?.specialType || "none"}
                onChange={e => handleSpecialTypeChange(e.target.value)}
                className={selectClass}
              >
                <option value="none" className="bg-[#2d2d44] text-white">Suất chiếu thường</option>
                {specialTypes.map(type => (
                  <option 
                    key={type.value} 
                    value={type.value} 
                    className="bg-[#2d2d44]"
                    style={{ color: type.color }}
                  >
                    {type.icon} {type.label} {type.priceMultiplier !== 1 && `(${type.priceMultiplier > 1 ? '+' : ''}${Math.round((type.priceMultiplier - 1) * 100)}% giá)`}
                  </option>
                ))}
              </select>
              {form?.specialType !== "none" && (
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
                    value={form?.price?.adult || ""}
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
                    value={form?.price?.child || ""}
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
                    value={form?.price?.student || ""}
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
                    value={form?.price?.vip || ""}
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
                value={form?.status || "scheduled"}
                onChange={e => setForm({ ...form, status: e.target.value })}
                className={selectClass}
              >
                <option value="scheduled" className="bg-[#2d2d44] text-green-400">Sắp chiếu</option>
                <option value="ongoing" className="bg-[#2d2d44] text-yellow-400">Đang chiếu</option>
                <option value="ended" className="bg-[#2d2d44] text-gray-400">Đã kết thúc</option>
                <option value="cancelled" className="bg-[#2d2d44] text-red-400">Hủy</option>
              </select>
            </div>
          </div>

          {/* Thông tin phòng chiếu đã chọn */}
          {form?.roomId && form?.type && form?.totalSeats > 0 && (
            <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-blue-400 mb-1">
                <span>🎬</span>
                <span>Thông tin phòng chiếu</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-white/50">Phòng:</span>
                  <span className="text-white ml-2">{form.roomName}</span>
                </div>
                <div>
                  <span className="text-white/50">Định dạng:</span>
                  <span className="text-white ml-2">{form.type}</span>
                </div>
                <div>
                  <span className="text-white/50">Sức chứa:</span>
                  <span className="text-white ml-2">{form.totalSeats} ghế</span>
                </div>
                <div>
                  <span className="text-white/50">Rạp:</span>
                  <span className="text-white ml-2">{form.cinemaName}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="flex gap-3 p-6 pt-4 border-t border-white/10 flex-shrink-0">
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