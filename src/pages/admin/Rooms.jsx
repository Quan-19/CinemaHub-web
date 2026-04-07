import { useState, useEffect } from "react";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  X,
} from "lucide-react";
import RoomStats from "../../components/admin/Rooms/RoomStats.jsx";
import RoomCard from "../../components/admin/Rooms/RoomCard.jsx";
import RoomModal from "../../components/admin/Rooms/RoomModal.jsx";
import SeatMap from "../../components/admin/Rooms/SeatMap.jsx";
import DeleteConfirmModal from "../../components/admin/Rooms/DeleteConfirmModal.jsx";

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cinemaFilter, setCinemaFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editRoom, setEditRoom] = useState(null);
  const [viewRoom, setViewRoom] = useState(null);
  const [deleteRoom, setDeleteRoom] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const perPage = 6;

  const reloadData = async () => {
    setLoading(true);
    try {
      const [roomsRes, cinemasRes] = await Promise.all([
        fetch("http://localhost:5000/api/rooms"),
        fetch("http://localhost:5000/api/cinemas"),
      ]);

      const roomsJson = await roomsRes.json();
      const cinemasJson = await cinemasRes.json();

      const roomsData = Array.isArray(roomsJson)
        ? roomsJson
        : roomsJson.data || [];

      const cinemasDataRaw = Array.isArray(cinemasJson)
        ? cinemasJson
        : cinemasJson.data || [];

      const cinemasData = cinemasDataRaw.map((cinema) => ({
        ...cinema,
        id: cinema.cinema_id,
        currentRooms: cinema.currentRooms || 0,
        maxRooms: cinema.maxRooms || 4,
      }));

      setCinemas(cinemasData);
      setRooms(roomsData);
    } catch (err) {
      console.error("Load rooms error:", err);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadData();
  }, []);

  const types = [...new Set(rooms.map((r) => r.type))];

  const filtered = rooms.filter((room) => {
    const matchesCinema =
      cinemaFilter === "all" || room.cinemaId === Number(cinemaFilter);
    const matchesType = typeFilter === "all" || room.type === typeFilter;
    const matchesStatus =
      statusFilter === "all" || room.status === statusFilter;
    const matchesSearch =
      room.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.cinemaName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.type?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCinema && matchesType && matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  
  // Lấy token từ localStorage
  const getToken = () => {
    const token = localStorage.getItem("token");
    console.log("Token:", token); // Debug: kiểm tra token
    return token;
  };

  const handleAdd = async (newRoom) => {
    try {
      const token = getToken();
      
      if (!token) {
        alert("Vui lòng đăng nhập lại!");
        return;
      }

      const response = await fetch("http://localhost:5000/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          cinema_id: newRoom.cinemaId,
          name: newRoom.name,
          type: newRoom.type,
          seat_rows: newRoom.rows,
          seat_cols: newRoom.cols,
          vip_rows: JSON.stringify(newRoom.vipRows || []),
          couple_row: newRoom.coupleRow,
          total_seats: newRoom.rows * newRoom.cols,
          status: newRoom.status || "active",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Add failed");
      }

      alert("Thêm phòng thành công!");
      setShowModal(false);
      await reloadData();
    } catch (err) {
      console.error(err);
      alert(err.message || "Lỗi khi thêm phòng");
    }
  };

  const handleUpdate = async (room) => {
    try {
      const token = getToken();
      
      if (!token) {
        alert("Vui lòng đăng nhập lại!");
        return;
      }

      const response = await fetch(`http://localhost:5000/api/rooms/${room.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: room.name,
          type: room.type,
          seat_rows: room.rows,
          seat_cols: room.cols,
          vip_rows: JSON.stringify(room.vipRows || []),
          couple_row: room.coupleRow,
          total_seats: room.rows * room.cols,
          status: room.status,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Update failed");
      }

      alert("Cập nhật thành công");
      setShowModal(false);
      await reloadData();
    } catch (err) {
      console.error(err);
      alert(err.message || "Lỗi update");
    }
  };

  const handleDelete = async () => {
    if (!deleteRoom) return;

    setDeleteLoading(true);
    try {
      const token = getToken();
      
      if (!token) {
        alert("Vui lòng đăng nhập lại!");
        setDeleteLoading(false);
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/rooms/${deleteRoom.id}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Delete failed");
      }

      alert("Xóa phòng thành công!");
      setDeleteRoom(null);
      await reloadData();
    } catch (err) {
      console.error(err);
      alert(err.message || "Lỗi xóa phòng. Vui lòng thử lại!");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleStatus = async (room) => {
    const newStatus = room.status === "active" ? "maintenance" : "active";

    try {
      const token = getToken();
      
      if (!token) {
        alert("Vui lòng đăng nhập lại!");
        return;
      }

      const response = await fetch(`http://localhost:5000/api/rooms/${room.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: room.name,
          type: room.type,
          seat_rows: room.rows,
          seat_cols: room.cols,
          vip_rows: JSON.stringify(room.vipRows || []),
          couple_row: room.coupleRow,
          total_seats: room.rows * room.cols,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Toggle failed");
      }

      await reloadData();
    } catch (err) {
      console.error(err);
      alert(err.message || "Lỗi cập nhật trạng thái!");
    }
  };

  const clearFilters = () => {
    setCinemaFilter("all");
    setTypeFilter("all");
    setStatusFilter("all");
    setSearchTerm("");
    setPage(1);
  };

  const activeFilterCount = [
    cinemaFilter !== "all",
    typeFilter !== "all",
    statusFilter !== "all",
    searchTerm !== "",
  ].filter(Boolean).length;

  const openAdd = () => {
    setEditRoom(null);
    setShowModal(true);
  };

  const openEdit = (room) => {
    setEditRoom(room);
    setShowModal(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteRoom(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-5 bg-cinema-bg min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Phòng chiếu & Ghế</h1>
          <p className="text-sm text-gray-400 mt-1">
            Quản lý cấu hình phòng chiếu và sơ đồ ghế
          </p>
        </div>
        <button
          onClick={openAdd}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap"
        >
          <Plus size={16} /> Thêm phòng
        </button>
      </div>

      {/* Stats Cards */}
      <RoomStats rooms={rooms} />

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            size={18}
          />
          <input
            type="text"
            placeholder="Tìm kiếm phòng chiếu..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white placeholder-gray-500 outline-none transition-colors focus:border-red-500/50"
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
            showFilters || activeFilterCount > 0
              ? "bg-red-600 hover:bg-red-700"
              : "bg-zinc-900 hover:bg-zinc-800"
          }`}
        >
          <Filter size={16} />
          <span>Lọc</span>
          {activeFilterCount > 0 && (
            <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-xs">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div
          className="p-4 rounded-xl border border-white/10 bg-cinema-surface"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-white">Bộ lọc nâng cao</h3>
            <button
              onClick={clearFilters}
              className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
            >
              <X size={12} />
              Xóa bộ lọc
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-2 block">
                Rạp chiếu
              </label>
              <select
                value={cinemaFilter}
                onChange={(e) => {
                  setCinemaFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white outline-none cursor-pointer focus:border-red-500/50"
              >
                <option value="all">Tất cả rạp</option>
                {cinemas.map((cinema) => (
                  <option key={cinema.cinema_id} value={cinema.cinema_id}>
                    {cinema.name} ({cinema.currentRooms || 0}/{cinema.maxRooms || 4} phòng)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-2 block">
                Loại phòng
              </label>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white outline-none cursor-pointer focus:border-red-500/50"
              >
                <option value="all">Tất cả loại</option>
                {types.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-2 block">
                Trạng thái
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white outline-none cursor-pointer focus:border-red-500/50"
              >
                <option value="all">Tất cả</option>
                <option value="active">Hoạt động</option>
                <option value="maintenance">Bảo trì</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-400">Đang lọc:</span>
          {cinemaFilter !== "all" && (
            <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded-lg text-xs flex items-center gap-1">
              Rạp: {cinemas.find(c => c.cinema_id == cinemaFilter)?.name || cinemaFilter}
              <X
                size={12}
                className="cursor-pointer hover:text-white"
                onClick={() => setCinemaFilter("all")}
              />
            </span>
          )}
          {typeFilter !== "all" && (
            <span className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded-lg text-xs flex items-center gap-1">
              Loại: {typeFilter}
              <X
                size={12}
                className="cursor-pointer hover:text-white"
                onClick={() => setTypeFilter("all")}
              />
            </span>
          )}
          {statusFilter !== "all" && (
            <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded-lg text-xs flex items-center gap-1">
              Trạng thái: {statusFilter === "active" ? "Hoạt động" : "Bảo trì"}
              <X
                size={12}
                className="cursor-pointer hover:text-white"
                onClick={() => setStatusFilter("all")}
              />
            </span>
          )}
          {searchTerm && (
            <span className="px-2 py-1 bg-gray-600/20 text-gray-400 rounded-lg text-xs flex items-center gap-1">
              Tìm: "{searchTerm}"
              <X
                size={12}
                className="cursor-pointer hover:text-white"
                onClick={() => setSearchTerm("")}
              />
            </span>
          )}
        </div>
      )}

      {/* Rooms Grid */}
      {paginated.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginated.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onEdit={openEdit}
                onDelete={setDeleteRoom}
                onView={setViewRoom}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 hover:bg-white/10 transition-colors"
                style={{ background: "rgba(255,255,255,0.06)", color: "#fff" }}
              >
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className="w-8 h-8 rounded-lg transition-colors"
                    style={{
                      background:
                        page === pageNum ? "#e50914" : "rgba(255,255,255,0.06)",
                      color: "#fff",
                      fontSize: 13,
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 hover:bg-white/10 transition-colors"
                style={{ background: "rgba(255,255,255,0.06)", color: "#fff" }}
              >
                <ChevronRight size={15} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            {rooms.length === 0
              ? "Chưa có phòng chiếu nào"
              : "Không tìm thấy phòng chiếu phù hợp"}
          </div>
          {rooms.length === 0 && (
            <button
              onClick={openAdd}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg inline-flex items-center gap-2 transition-colors"
            >
              <Plus size={16} /> Thêm phòng đầu tiên
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      <RoomModal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setEditRoom(null);
        }}
        onAdd={handleAdd}
        onUpdate={handleUpdate}
        editingRoom={editRoom}
        cinemas={cinemas}
      />

      <SeatMap room={viewRoom} onClose={() => setViewRoom(null)} />

      <DeleteConfirmModal
        show={deleteRoom !== null}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDelete}
        loading={deleteLoading}
        roomName={deleteRoom?.name}
        cinemaName={deleteRoom?.cinemaName}
        roomType={deleteRoom?.type}
      />
    </div>
  );
}