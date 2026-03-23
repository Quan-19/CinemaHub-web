import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function RoomModal({ show, onClose, onAdd, onUpdate, editingRoom, cinemas = [] }) {
  const [form, setForm] = useState({
    name: "",
    cinemaId: "",
    cinemaName: "",
    type: "2D",
    rows: 10,
    cols: 12,
    vipRows: [],
    coupleRow: null,
    status: "active",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedCinemaData, setSelectedCinemaData] = useState(null);

  useEffect(() => {
    if (cinemas && cinemas.length > 0 && !editingRoom) {
      const firstCinema = cinemas[0];
      setForm(prev => ({
        ...prev,
        cinemaId: firstCinema.id,
        cinemaName: firstCinema.name,
      }));
      setSelectedCinemaData(firstCinema);
    }
  }, [cinemas, editingRoom]);

  useEffect(() => {
    if (editingRoom) {
      setForm({
        name: editingRoom.name || "",
        cinemaId: editingRoom.cinemaId || "",
        cinemaName: editingRoom.cinemaName || "",
        type: editingRoom.type || "2D",
        rows: editingRoom.rows || 10,
        cols: editingRoom.cols || 12,
        vipRows: editingRoom.vipRows || [],
        coupleRow: editingRoom.coupleRow || null,
        status: editingRoom.status || "active",
      });
      const cinema = cinemas?.find(c => c.id == editingRoom.cinemaId);
      setSelectedCinemaData(cinema);
    }
    setErrors({});
  }, [editingRoom, show, cinemas]);

  if (!show) return null;

  const getCurrentRoomCount = (cinema) => {
    if (!cinema) return 0;
    return cinema.rooms?.length || 0;
  };

  const canAddRoom = () => {
    if (!selectedCinemaData) return false;
    const currentRoomCount = getCurrentRoomCount(selectedCinemaData);
    const maxRooms = selectedCinemaData.maxRooms || 4;
    console.log(`Checking canAddRoom: current=${currentRoomCount}, max=${maxRooms}`);
    return currentRoomCount < maxRooms;
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Tên phòng không được để trống";
    if (!form.cinemaId) newErrors.cinemaId = "Vui lòng chọn rạp chiếu";
    
    if (!editingRoom && !canAddRoom()) {
      const maxRooms = selectedCinemaData?.maxRooms || 4;
      newErrors.cinemaId = `Rạp này đã đạt giới hạn tối đa ${maxRooms} phòng. Không thể thêm phòng mới.`;
    }
    
    if (form.rows < 4 || form.rows > 20) newErrors.rows = "Số hàng phải từ 4-20";
    if (form.cols < 4 || form.cols > 20) newErrors.cols = "Số cột phải từ 4-20";
    
    if (form.coupleRow) {
      if (form.coupleRow < 1 || form.coupleRow > form.rows) {
        newErrors.coupleRow = `Hàng couple phải từ 1-${form.rows}`;
      }
      if (form.vipRows.includes(form.coupleRow)) {
        newErrors.coupleRow = "Hàng couple không thể trùng với hàng VIP";
      }
    }
    
    const invalidVipRows = form.vipRows.filter(row => row < 1 || row > form.rows);
    if (invalidVipRows.length > 0) {
      newErrors.vipRows = `Hàng VIP phải từ 1-${form.rows}`;
    }
    
    return newErrors;
  };

  const handleSubmit = async () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const totalCapacity = form.rows * form.cols;
      const roomData = {
        ...form,
        cinemaName: cinemas.find(c => c.id == form.cinemaId)?.name || form.cinemaName,
        capacity: totalCapacity,
        totalSeats: totalCapacity,
      };

      if (editingRoom) {
        await onUpdate({ ...roomData, id: editingRoom.id });
      } else {
        await onAdd(roomData);
      }
    } catch (error) {
      console.error("Failed to save room:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCinemaChange = (cinemaId) => {
    const cinema = cinemas.find(c => c.id == cinemaId);
    setForm({ 
      ...form, 
      cinemaId, 
      cinemaName: cinema?.name || "" 
    });
    setSelectedCinemaData(cinema || null);
    
    if (errors.cinemaId) {
      setErrors({ ...errors, cinemaId: null });
    }
  };

  const handleVipRowsChange = (value) => {
    const rows = value.split(",").map(s => parseInt(s.trim())).filter(Boolean);
    setForm({ ...form, vipRows: rows });
  };

  const currentRoomCount = selectedCinemaData ? getCurrentRoomCount(selectedCinemaData) : 0;
  const maxRooms = selectedCinemaData?.maxRooms || 4;
  const isAtMaxRooms = !editingRoom && currentRoomCount >= maxRooms;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)" }}
    >
      <div
        className="w-full max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto"
        style={{
          background: "#0d0d1a",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-6 pb-4 sticky top-0 bg-[#0d0d1a]"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <h2 className="text-xl font-bold text-white">
            {editingRoom ? "Cấu hình phòng chiếu" : "Thêm phòng chiếu"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Tên phòng */}
            <div className="col-span-2">
              <label className="block text-sm text-gray-400 mb-2">
                Tên phòng <span className="text-red-500">*</span>
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="VD: Phòng 1, IMAX Hall..."
                className="w-full px-4 py-2 rounded-lg outline-none transition-colors"
                style={{
                  background: "#020617",
                  border: errors.name ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.1)",
                  color: "#fff",
                }}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            {/* Rạp chiếu */}
            <div className="col-span-2">
              <label className="block text-sm text-gray-400 mb-2">
                Rạp chiếu <span className="text-red-500">*</span>
              </label>
              <select
                value={form.cinemaId}
                onChange={(e) => handleCinemaChange(e.target.value)}
                disabled={!!editingRoom}
                className={`w-full px-4 py-2 rounded-lg outline-none cursor-pointer ${editingRoom ? 'opacity-70' : ''}`}
                style={{
                  background: "#020617",
                  border: errors.cinemaId ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.1)",
                  color: "#fff",
                }}
              >
                <option value="">Chọn rạp chiếu</option>
                {cinemas.map(cinema => {
                  const roomCount = cinema.rooms?.length || 0;
                  return (
                    <option key={cinema.id} value={cinema.id}>
                      {cinema.name} ({roomCount}/{cinema.maxRooms || 4} phòng)
                    </option>
                  );
                })}
              </select>
              {errors.cinemaId && (
                <p className="text-red-500 text-xs mt-1">{errors.cinemaId}</p>
              )}
              
              {selectedCinemaData && !editingRoom && (
                <div className={`mt-2 p-2 rounded-lg text-xs ${isAtMaxRooms ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
                  {isAtMaxRooms ? (
                    <span>⚠️ Rạp này đã đạt giới hạn {maxRooms} phòng. Không thể thêm phòng mới.</span>
                  ) : (
                    <span>📊 Rạp hiện có {currentRoomCount}/{maxRooms} phòng. Có thể thêm {maxRooms - currentRoomCount} phòng nữa.</span>
                  )}
                </div>
              )}
            </div>

            {/* Loại phòng */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Loại phòng</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-4 py-2 rounded-lg outline-none cursor-pointer"
                style={{
                  background: "#020617",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff",
                }}
              >
                <option value="2D">2D</option>
                <option value="3D">3D</option>
                <option value="IMAX">IMAX</option>
                <option value="4DX">4DX</option>
              </select>
            </div>

            {/* Trạng thái */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Trạng thái</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-4 py-2 rounded-lg outline-none cursor-pointer"
                style={{
                  background: "#020617",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff",
                }}
              >
                <option value="active">Hoạt động</option>
                <option value="maintenance">Bảo trì</option>
              </select>
            </div>

            {/* Số hàng */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Số hàng ghế <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={4}
                max={20}
                value={form.rows}
                onChange={(e) => setForm({ ...form, rows: Number(e.target.value) })}
                className="w-full px-4 py-2 rounded-lg outline-none"
                style={{
                  background: "#020617",
                  border: errors.rows ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.1)",
                  color: "#fff",
                }}
              />
              {errors.rows && (
                <p className="text-red-500 text-xs mt-1">{errors.rows}</p>
              )}
            </div>

            {/* Số cột */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Số ghế mỗi hàng <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={4}
                max={20}
                value={form.cols}
                onChange={(e) => setForm({ ...form, cols: Number(e.target.value) })}
                className="w-full px-4 py-2 rounded-lg outline-none"
                style={{
                  background: "#020617",
                  border: errors.cols ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.1)",
                  color: "#fff",
                }}
              />
              {errors.cols && (
                <p className="text-red-500 text-xs mt-1">{errors.cols}</p>
              )}
            </div>

            {/* Hàng VIP */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Hàng VIP (phân cách bằng dấu phẩy)
              </label>
              <input
                value={form.vipRows.join(",")}
                onChange={(e) => handleVipRowsChange(e.target.value)}
                placeholder="VD: 5,6,7"
                className="w-full px-4 py-2 rounded-lg outline-none"
                style={{
                  background: "#020617",
                  border: errors.vipRows ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.1)",
                  color: "#fff",
                }}
              />
              {errors.vipRows && (
                <p className="text-red-500 text-xs mt-1">{errors.vipRows}</p>
              )}
            </div>

            {/* Hàng Couple */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Hàng Couple (để trống nếu không có)
              </label>
              <input
                type="number"
                value={form.coupleRow || ""}
                onChange={(e) => setForm({ 
                  ...form, 
                  coupleRow: e.target.value ? Number(e.target.value) : null 
                })}
                placeholder="VD: 10"
                className="w-full px-4 py-2 rounded-lg outline-none"
                style={{
                  background: "#020617",
                  border: errors.coupleRow ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.1)",
                  color: "#fff",
                }}
              />
              {errors.coupleRow && (
                <p className="text-red-500 text-xs mt-1">{errors.coupleRow}</p>
              )}
            </div>
          </div>

          {/* Preview */}
          {form.rows && form.cols && (
            <div
              className="rounded-lg p-4 mt-2"
              style={{
                background: "rgba(229,9,20,0.08)",
                border: "1px solid rgba(229,9,20,0.15)",
              }}
            >
              <div className="text-xs text-gray-400 mb-2">Thông tin tổng quan</div>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-2xl font-bold text-red-500">
                    {form.rows * form.cols}
                  </div>
                  <div className="text-xs text-gray-500">Tổng số ghế</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-300">
                    {form.vipRows.length} hàng VIP
                  </div>
                  {form.coupleRow && (
                    <div className="text-sm text-gray-300">
                      Hàng {form.coupleRow} Couple
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex gap-3 p-6 pt-4 sticky bottom-0 bg-[#0d0d1a]"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg transition-colors hover:bg-white/10 disabled:opacity-50"
            style={{
              background: "rgba(255,255,255,0.08)",
              color: "#fff",
            }}
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || (!editingRoom && isAtMaxRooms)}
            className={`flex-1 py-2.5 rounded-lg transition-colors hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 ${
              !editingRoom && isAtMaxRooms ? 'cursor-not-allowed' : ''
            }`}
            style={{
              background: "#e50914",
              color: "#fff",
            }}
          >
            {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
            {editingRoom ? "Lưu cấu hình" : "Thêm phòng"}
          </button>
        </div>
      </div>
    </div>
  );
}