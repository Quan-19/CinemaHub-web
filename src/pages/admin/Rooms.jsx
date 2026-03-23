import { useState, useEffect } from "react";
import { Plus, ChevronLeft, ChevronRight, Search, Filter, X } from "lucide-react";
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
  const perPage = 6;

  // Load data từ localStorage
  const loadData = () => {
    setLoading(true);
    try {
      const savedCinemas = localStorage.getItem('cinemas');
      if (savedCinemas) {
        let cinemaData = JSON.parse(savedCinemas);
        
        // Đảm bảo mỗi cinema đều có rooms array và ID duy nhất
        cinemaData = cinemaData.map(cinema => {
          // Đảm bảo mỗi phòng có ID duy nhất bằng cách thêm timestamp nếu cần
          const roomsWithUniqueIds = (cinema.rooms || []).map(room => {
            // Nếu ID đã tồn tại và là duy nhất, giữ nguyên
            if (room.id && !room.id.includes('_dup')) {
              return room;
            }
            // Tạo ID mới dựa trên cinema ID và tên phòng + timestamp
            return {
              ...room,
              id: `${cinema.id}_${room.name?.replace(/\s/g, '_')}_${Date.now()}_${Math.random()}`
            };
          });
          
          return {
            ...cinema,
            rooms: roomsWithUniqueIds,
            currentRooms: roomsWithUniqueIds.length,
            maxRooms: cinema.maxRooms || 4
          };
        });
        
        // Kiểm tra và loại bỏ trùng lặp ID trong toàn bộ hệ thống
        const allRoomIds = new Set();
        cinemaData = cinemaData.map(cinema => ({
          ...cinema,
          rooms: cinema.rooms.filter(room => {
            if (allRoomIds.has(room.id)) {
              console.warn(`Duplicate room ID found: ${room.id}, removing duplicate`);
              return false;
            }
            allRoomIds.add(room.id);
            return true;
          })
        }));
        
        // Cập nhật currentRooms sau khi lọc
        cinemaData = cinemaData.map(cinema => ({
          ...cinema,
          currentRooms: cinema.rooms.length
        }));
        
        localStorage.setItem('cinemas', JSON.stringify(cinemaData));
        setCinemas(cinemaData);
        
        // Tạo danh sách rooms
        const allRooms = [];
        cinemaData.forEach(cinema => {
          if (cinema.rooms && cinema.rooms.length > 0) {
            cinema.rooms.forEach(room => {
              allRooms.push({
                ...room,
                cinemaName: cinema.name,
                cinemaId: cinema.id
              });
            });
          }
        });
        setRooms(allRooms);
        
        console.log("Loaded cinemas:", cinemaData);
        console.log("Loaded rooms:", allRooms);
      } else {
        setCinemas([]);
        setRooms([]);
      }
    } catch (error) {
      console.error("Failed to load rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const types = [...new Set(rooms.map(r => r.type))];
  
  const filtered = rooms.filter(room => {
    const matchesCinema = cinemaFilter === "all" || room.cinemaName === cinemaFilter;
    const matchesType = typeFilter === "all" || room.type === typeFilter;
    const matchesStatus = statusFilter === "all" || room.status === statusFilter;
    const matchesSearch = room.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.cinemaName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.type?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCinema && matchesType && matchesStatus && matchesSearch;
  });
  
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleAdd = async (newRoom) => {
    try {
      console.log("Adding new room:", newRoom);
      
      // Lấy cinema hiện tại từ localStorage để đảm bảo dữ liệu mới nhất
      const savedCinemas = localStorage.getItem('cinemas');
      if (!savedCinemas) {
        alert("Không tìm thấy dữ liệu rạp!");
        return;
      }
      
      let currentCinemas = JSON.parse(savedCinemas);
      const targetCinemaIndex = currentCinemas.findIndex(c => c.id == newRoom.cinemaId);
      
      if (targetCinemaIndex === -1) {
        alert("Không tìm thấy rạp chiếu!");
        return;
      }
      
      const targetCinema = currentCinemas[targetCinemaIndex];
      const currentRooms = targetCinema.rooms || [];
      const currentRoomCount = currentRooms.length;
      const maxRooms = targetCinema.maxRooms || 4;
      
      console.log(`Current rooms: ${currentRoomCount}, Max rooms: ${maxRooms}`);
      
      if (currentRoomCount >= maxRooms) {
        alert(`Rạp ${targetCinema.name} đã đạt giới hạn tối đa ${maxRooms} phòng! Không thể thêm phòng mới.`);
        return;
      }
      
      // Tạo ID duy nhất cho phòng mới
      const uniqueId = `${targetCinema.id}_${newRoom.name.replace(/\s/g, '_')}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      
      // Tạo object phòng mới
      const newRoomObject = {
        ...newRoom,
        id: uniqueId,
        cinemaId: targetCinema.id,
        cinemaName: targetCinema.name,
        createdAt: new Date().toISOString()
      };
      
      // Cập nhật cinema
      currentCinemas[targetCinemaIndex] = {
        ...targetCinema,
        rooms: [...currentRooms, newRoomObject],
        currentRooms: currentRoomCount + 1
      };
      
      // Lưu vào localStorage
      localStorage.setItem('cinemas', JSON.stringify(currentCinemas));
      console.log("Saved cinemas:", currentCinemas);
      
      // Cập nhật state
      setCinemas(currentCinemas);
      
      // Cập nhật rooms list
      const allRooms = [];
      currentCinemas.forEach(cinema => {
        if (cinema.rooms && cinema.rooms.length > 0) {
          cinema.rooms.forEach(room => {
            allRooms.push({ ...room, cinemaName: cinema.name, cinemaId: cinema.id });
          });
        }
      });
      setRooms(allRooms);
      
      setShowModal(false);
      alert(`Đã thêm phòng ${newRoom.name} thành công!`);
    } catch (error) {
      console.error("Failed to add room:", error);
      alert("Có lỗi xảy ra khi thêm phòng!");
    }
  };

  const handleUpdate = async (updatedRoom) => {
    try {
      const savedCinemas = localStorage.getItem('cinemas');
      if (!savedCinemas) return;
      
      let currentCinemas = JSON.parse(savedCinemas);
      const cinemaIndex = currentCinemas.findIndex(c => c.id == updatedRoom.cinemaId);
      
      if (cinemaIndex !== -1) {
        currentCinemas[cinemaIndex] = {
          ...currentCinemas[cinemaIndex],
          rooms: currentCinemas[cinemaIndex].rooms.map(room => 
            room.id === updatedRoom.id ? updatedRoom : room
          )
        };
        
        localStorage.setItem('cinemas', JSON.stringify(currentCinemas));
        setCinemas(currentCinemas);
        
        const allRooms = [];
        currentCinemas.forEach(cinema => {
          if (cinema.rooms) {
            cinema.rooms.forEach(room => {
              allRooms.push({ ...room, cinemaName: cinema.name, cinemaId: cinema.id });
            });
          }
        });
        setRooms(allRooms);
        
        setShowModal(false);
        setEditRoom(null);
        alert("Cập nhật phòng thành công!");
      }
    } catch (error) {
      console.error("Failed to update room:", error);
      alert("Có lỗi xảy ra khi cập nhật phòng!");
    }
  };

  const handleDelete = async () => {
    if (!deleteRoom) return;
    
    try {
      const savedCinemas = localStorage.getItem('cinemas');
      if (!savedCinemas) return;
      
      let currentCinemas = JSON.parse(savedCinemas);
      const cinemaIndex = currentCinemas.findIndex(c => c.id == deleteRoom.cinemaId);
      
      if (cinemaIndex !== -1) {
        const filteredRooms = currentCinemas[cinemaIndex].rooms.filter(room => room.id !== deleteRoom.id);
        
        currentCinemas[cinemaIndex] = {
          ...currentCinemas[cinemaIndex],
          rooms: filteredRooms,
          currentRooms: filteredRooms.length
        };
        
        localStorage.setItem('cinemas', JSON.stringify(currentCinemas));
        setCinemas(currentCinemas);
        
        const allRooms = [];
        currentCinemas.forEach(cinema => {
          if (cinema.rooms) {
            cinema.rooms.forEach(room => {
              allRooms.push({ ...room, cinemaName: cinema.name, cinemaId: cinema.id });
            });
          }
        });
        setRooms(allRooms);
        
        setDeleteRoom(null);
        alert("Xóa phòng thành công!");
      }
    } catch (error) {
      console.error("Failed to delete room:", error);
      alert("Có lỗi xảy ra khi xóa phòng!");
    }
  };

  const handleToggleStatus = async (room) => {
    const newStatus = room.status === "active" ? "maintenance" : "active";
    try {
      const savedCinemas = localStorage.getItem('cinemas');
      if (!savedCinemas) return;
      
      let currentCinemas = JSON.parse(savedCinemas);
      const cinemaIndex = currentCinemas.findIndex(c => c.id == room.cinemaId);
      
      if (cinemaIndex !== -1) {
        currentCinemas[cinemaIndex] = {
          ...currentCinemas[cinemaIndex],
          rooms: currentCinemas[cinemaIndex].rooms.map(r => 
            r.id === room.id ? { ...r, status: newStatus } : r
          )
        };
        
        localStorage.setItem('cinemas', JSON.stringify(currentCinemas));
        setCinemas(currentCinemas);
        
        const allRooms = [];
        currentCinemas.forEach(cinema => {
          if (cinema.rooms) {
            cinema.rooms.forEach(room => {
              allRooms.push({ ...room, cinemaName: cinema.name, cinemaId: cinema.id });
            });
          }
        });
        setRooms(allRooms);
      }
    } catch (error) {
      console.error("Failed to toggle status:", error);
      alert("Có lỗi xảy ra khi thay đổi trạng thái!");
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
    searchTerm !== ""
  ].filter(Boolean).length;

  const openAdd = () => {
    setEditRoom(null);
    setShowModal(true);
  };

  const openEdit = (room) => {
    setEditRoom(room);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5 bg-[#050816] min-h-screen">
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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm phòng chiếu..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 rounded-lg outline-none transition-colors"
            style={{
              background: "#0d0d1a",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#fff",
            }}
          />
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
            showFilters || activeFilterCount > 0
              ? "bg-red-600 hover:bg-red-700" 
              : "bg-[#0d0d1a] hover:bg-[#1a1a2e]"
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
        <div className="p-4 rounded-xl border border-white/10" style={{ background: "#0d0d1a" }}>
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
              <label className="text-xs text-gray-400 mb-2 block">Rạp chiếu</label>
              <select
                value={cinemaFilter}
                onChange={(e) => {
                  setCinemaFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 rounded-lg outline-none cursor-pointer"
                style={{
                  background: "#020617",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff",
                }}
              >
                <option value="all">Tất cả rạp</option>
                {cinemas.map(cinema => (
                  <option key={cinema.id} value={cinema.name}>{cinema.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-2 block">Loại phòng</label>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 rounded-lg outline-none cursor-pointer"
                style={{
                  background: "#020617",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff",
                }}
              >
                <option value="all">Tất cả loại</option>
                {types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-2 block">Trạng thái</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 rounded-lg outline-none cursor-pointer"
                style={{
                  background: "#020617",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff",
                }}
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
              Rạp: {cinemaFilter}
              <X size={12} className="cursor-pointer hover:text-white" onClick={() => setCinemaFilter("all")} />
            </span>
          )}
          {typeFilter !== "all" && (
            <span className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded-lg text-xs flex items-center gap-1">
              Loại: {typeFilter}
              <X size={12} className="cursor-pointer hover:text-white" onClick={() => setTypeFilter("all")} />
            </span>
          )}
          {statusFilter !== "all" && (
            <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded-lg text-xs flex items-center gap-1">
              Trạng thái: {statusFilter === "active" ? "Hoạt động" : "Bảo trì"}
              <X size={12} className="cursor-pointer hover:text-white" onClick={() => setStatusFilter("all")} />
            </span>
          )}
          {searchTerm && (
            <span className="px-2 py-1 bg-gray-600/20 text-gray-400 rounded-lg text-xs flex items-center gap-1">
              Tìm: "{searchTerm}"
              <X size={12} className="cursor-pointer hover:text-white" onClick={() => setSearchTerm("")} />
            </span>
          )}
        </div>
      )}

      {/* Rooms Grid */}
      {paginated.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginated.map(room => (
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
                onClick={() => setPage(p => Math.max(1, p - 1))}
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
                      background: page === pageNum ? "#e50914" : "rgba(255,255,255,0.06)",
                      color: "#fff",
                      fontSize: 13,
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
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
            {rooms.length === 0 ? "Chưa có phòng chiếu nào" : "Không tìm thấy phòng chiếu phù hợp"}
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

      <SeatMap
        room={viewRoom}
        onClose={() => setViewRoom(null)}
      />

      <DeleteConfirmModal
        show={deleteRoom !== null}
        onClose={() => setDeleteRoom(null)}
        onConfirm={handleDelete}
        roomName={deleteRoom?.name}
      />
    </div>
  );
}