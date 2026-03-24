import { useState } from "react";
import PricingTable from "../../components/admin/Pricing/PricingTable.jsx";
import PricingModal from "../../components/admin/Pricing/PricingModal.jsx";
import PricingStats from "../../components/admin/Pricing/PricingStats.jsx";
import PricingFilter from "../../components/admin/Pricing/PricingFilter.jsx";
import DeleteConfirmModal from "../../components/admin/Pricing/DeleteConfirmModal.jsx";
import { Plus, Filter, X } from "lucide-react";

const mockPrices = [
  {
    id: "1",
    name: "2D Thường - Ngày thường - Sáng",
    type: "2D",
    seat: "Thường",
    day: "Ngày thường",
    time: "Sáng (trước 12h)",
    base: 75000,
    final: 75000,
    active: true
  },
  {
    id: "2",
    name: "2D Thường - Ngày thường - Chiều",
    type: "2D",
    seat: "Thường",
    day: "Ngày thường",
    time: "Chiều (12-18h)",
    base: 85000,
    final: 85000,
    active: true
  },
  {
    id: "3",
    name: "2D Thường - Ngày thường - Tối",
    type: "2D",
    seat: "Thường",
    day: "Ngày thường",
    time: "Tối (sau 18h)",
    base: 95000,
    final: 95000,
    active: true
  },
  {
    id: "4",
    name: "2D Thường - Cuối tuần - Sáng",
    type: "2D",
    seat: "Thường",
    day: "Cuối tuần",
    time: "Sáng (trước 12h)",
    base: 85000,
    final: 85000,
    active: true
  },
  {
    id: "5",
    name: "2D Thường - Cuối tuần - Chiều/Tối",
    type: "2D",
    seat: "Thường",
    day: "Cuối tuần",
    time: "Tối (sau 18h)",
    base: 105000,
    final: 105000,
    active: true
  },
  {
    id: "6",
    name: "2D VIP - Ngày thường",
    type: "2D",
    seat: "VIP",
    day: "Ngày thường",
    time: "Chiều (12-18h)",
    base: 110000,
    final: 110000,
    active: true
  },
  {
    id: "7",
    name: "2D VIP - Cuối tuần",
    type: "2D",
    seat: "VIP",
    day: "Cuối tuần",
    time: "Chiều (12-18h)",
    base: 130000,
    final: 130000,
    active: true
  },
  {
    id: "8",
    name: "2D Couple - Mọi ngày",
    type: "2D",
    seat: "Couple",
    day: "Ngày thường",
    time: "Tối (sau 18h)",
    base: 160000,
    final: 160000,
    active: true
  },
  {
    id: "9",
    name: "3D Thường - Ngày thường - Tối",
    type: "3D",
    seat: "Thường",
    day: "Ngày thường",
    time: "Tối (sau 18h)",
    base: 120000,
    final: 120000,
    active: true
  },
  {
    id: "10",
    name: "3D VIP - Cuối tuần - Tối",
    type: "3D",
    seat: "VIP",
    day: "Cuối tuần",
    time: "Tối (sau 18h)",
    base: 160000,
    final: 160000,
    active: true
  },
  {
    id: "11",
    name: "IMAX VIP - Cuối tuần - Tối",
    type: "IMAX",
    seat: "VIP",
    day: "Cuối tuần",
    time: "Tối (sau 18h)",
    base: 180000,
    final: 180000,
    active: true
  },
  {
    id: "12",
    name: "4DX VIP - Ngày thường - Chiều",
    type: "4DX",
    seat: "VIP",
    day: "Ngày thường",
    time: "Chiều (12-18h)",
    base: 150000,
    final: 150000,
    active: true
  },
  {
    id: "13",
    name: "4DX Couple - Cuối tuần - Tối",
    type: "4DX",
    seat: "Couple",
    day: "Cuối tuần",
    time: "Tối (sau 18h)",
    base: 220000,
    final: 220000,
    active: true
  }
];

export default function AdminPricingPage() {
  const [data, setData] = useState(mockPrices);
  const [filterType, setFilterType] = useState("all");
  const [filterSeat, setFilterSeat] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Filter data based on type, seat, and search term
  const filtered = data.filter(item => {
    const matchesType = filterType === "all" || item.type === filterType;
    const matchesSeat = filterSeat === "all" || item.seat === filterSeat;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.seat.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.day.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.time.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSeat && matchesSearch;
  });

  // Add new item
  const handleAdd = (newItem) => {
    setData([newItem, ...data]);
    setShowModal(false);
  };

  // Update item
  const handleUpdate = (updatedItem) => {
    setData(data.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    ));
    setEditingItem(null);
    setShowModal(false);
  };

  // Delete item
  const handleDelete = () => {
    setData(data.filter(item => item.id !== deleteItem.id));
    setDeleteItem(null);
  };

  // Toggle active status
  const handleToggleActive = (item) => {
    setData(data.map(i => 
      i.id === item.id ? { ...i, active: !i.active } : i
    ));
  };

  // View item details
  const handleView = (item) => {
    setViewItem(item);
    setShowViewModal(true);
  };

  // Open edit modal
  const handleEdit = (item) => {
    setEditingItem(item);
    setShowModal(true);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilterType("all");
    setFilterSeat("all");
    setSearchTerm("");
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Quản lý giá vé</h1>
          <p className="text-sm text-gray-400">
            Cấu hình giá vé theo loại phòng, loại ghế và thời gian
          </p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          {/* Search bar */}
          <div className="flex-1 md:w-64">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 px-4 rounded-lg bg-[#0d0d1a] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              showFilters || filterType !== "all" || filterSeat !== "all"
                ? "bg-red-600 hover:bg-red-700" 
                : "bg-[#0d0d1a] hover:bg-[#1a1a2e]"
            }`}
          >
            <Filter size={16} />
            <span className="hidden sm:inline">Lọc</span>
            {(filterType !== "all" || filterSeat !== "all") && (
              <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-xs">
                {(filterType !== "all" ? 1 : 0) + (filterSeat !== "all" ? 1 : 0)}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setEditingItem(null);
              setShowModal(true);
            }}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <Plus size={16} /> Thêm bảng giá
          </button>
        </div>
      </div>

      {/* Filter Section */}
      {showFilters && (
        <div className="mb-6 p-4 bg-[#0d0d1a] rounded-xl border border-white/10">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-white flex items-center gap-2">
              <Filter size={14} />
              Bộ lọc nâng cao
            </h3>
            <button
              onClick={clearFilters}
              className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
            >
              <X size={14} />
              Xóa bộ lọc
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Filter by Type */}
            <div>
              <label className="text-xs text-gray-400 mb-2 block">
                Lọc theo loại phòng
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "all", label: "Tất cả", color: "gray" },
                  { id: "2D", label: "2D", color: "blue" },
                  { id: "3D", label: "3D", color: "purple" },
                  { id: "IMAX", label: "IMAX", color: "yellow" },
                  { id: "4DX", label: "4DX", color: "green" },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFilterType(f.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                      ${filterType === f.id 
                        ? `bg-${f.color}-600 text-white` 
                        : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                      }`}
                  >
                    {f.label}
                    <span className={`ml-1.5 px-1 py-0.5 rounded text-[10px] ${
                      filterType === f.id ? "bg-white/20" : "bg-white/10"
                    }`}>
                      {f.id === "all" 
                        ? data.length 
                        : data.filter(item => item.type === f.id).length
                      }
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Filter by Seat */}
            <div>
              <label className="text-xs text-gray-400 mb-2 block">
                Lọc theo loại ghế
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "all", label: "Tất cả", color: "gray" },
                  { id: "Thường", label: "Thường", color: "gray" },
                  { id: "VIP", label: "VIP", color: "amber" },
                  { id: "Couple", label: "Couple", color: "pink" },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFilterSeat(f.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                      ${filterSeat === f.id 
                        ? `bg-${f.color}-600 text-white` 
                        : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                      }`}
                  >
                    {f.label}
                    <span className={`ml-1.5 px-1 py-0.5 rounded text-[10px] ${
                      filterSeat === f.id ? "bg-white/20" : "bg-white/10"
                    }`}>
                      {f.id === "all" 
                        ? data.length 
                        : data.filter(item => item.seat === f.id).length
                      }
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <PricingStats data={data} />
      
      {/* Active Filters Display */}
      {(filterType !== "all" || filterSeat !== "all" || searchTerm) && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs text-gray-400">Đang lọc:</span>
          {filterType !== "all" && (
            <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded-lg text-xs flex items-center gap-1">
              Loại phòng: {filterType}
              <X 
                size={12} 
                className="cursor-pointer hover:text-white"
                onClick={() => setFilterType("all")}
              />
            </span>
          )}
          {filterSeat !== "all" && (
            <span className="px-2 py-1 bg-amber-600/20 text-amber-400 rounded-lg text-xs flex items-center gap-1">
              Loại ghế: {filterSeat}
              <X 
                size={12} 
                className="cursor-pointer hover:text-white"
                onClick={() => setFilterSeat("all")}
              />
            </span>
          )}
          {searchTerm && (
            <span className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded-lg text-xs flex items-center gap-1">
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

      <PricingTable 
        data={filtered} 
        onEdit={handleEdit}
        onDelete={setDeleteItem}
        onView={handleView}
        onToggleActive={handleToggleActive}
      />

      {/* Add/Edit Modal */}
      <PricingModal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingItem(null);
        }}
        onAdd={handleAdd}
        onUpdate={handleUpdate}
        editingItem={editingItem}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        show={deleteItem !== null}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        item={deleteItem}
      />

      {/* View Details Modal */}
      {showViewModal && viewItem && (
        <ViewDetailModal
          item={viewItem}
          onClose={() => {
            setShowViewModal(false);
            setViewItem(null);
          }}
          onEdit={() => {
            setShowViewModal(false);
            handleEdit(viewItem);
          }}
        />
      )}
    </div>
  );
}

// View Detail Modal Component (giữ nguyên như cũ)
function ViewDetailModal({ item, onClose, onEdit }) {
  if (!item) return null;

  const getTypeColor = (type) => {
    const colors = {
      '2D': 'blue',
      '3D': 'purple',
      'IMAX': 'yellow',
      '4DX': 'green'
    };
    return colors[type] || 'gray';
  };

  const getSeatColor = (seat) => {
    const colors = {
      'VIP': 'amber',
      'Couple': 'pink',
      'Thường': 'gray'
    };
    return colors[seat] || 'gray';
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="w-[480px] bg-[#0b0f1f] rounded-2xl border border-white/10 shadow-2xl">
        <div className="px-6 py-5 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">Chi tiết quy tắc giá</h3>
        </div>
        
        <div className="px-6 py-5 space-y-4">
          <div className="bg-[#020617] p-4 rounded-xl">
            <p className="text-sm text-gray-400 mb-1">Tên quy tắc</p>
            <p className="text-white font-medium">{item.name}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#020617] p-4 rounded-xl">
              <p className="text-sm text-gray-400 mb-1">Loại phòng</p>
              <span className={`px-2 py-1 rounded-lg text-xs font-medium bg-${getTypeColor(item.type)}-500/20 text-${getTypeColor(item.type)}-400`}>
                {item.type}
              </span>
            </div>

            <div className="bg-[#020617] p-4 rounded-xl">
              <p className="text-sm text-gray-400 mb-1">Loại ghế</p>
              <span className={`px-2 py-1 rounded-lg text-xs font-medium bg-${getSeatColor(item.seat)}-500/20 text-${getSeatColor(item.seat)}-400`}>
                {item.seat}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#020617] p-4 rounded-xl">
              <p className="text-sm text-gray-400 mb-1">Loại ngày</p>
              <p className="text-white">{item.day}</p>
            </div>

            <div className="bg-[#020617] p-4 rounded-xl">
              <p className="text-sm text-gray-400 mb-1">Khung giờ</p>
              <p className="text-white">{item.time}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#020617] p-4 rounded-xl">
              <p className="text-sm text-gray-400 mb-1">Giá gốc</p>
              <p className="text-white line-through">{item.base.toLocaleString()}₫</p>
            </div>

            <div className="bg-[#020617] p-4 rounded-xl">
              <p className="text-sm text-gray-400 mb-1">Giá áp dụng</p>
              <p className="text-yellow-400 font-bold text-lg">{item.final.toLocaleString()}₫</p>
            </div>
          </div>

          <div className="bg-[#020617] p-4 rounded-xl">
            <p className="text-sm text-gray-400 mb-1">Trạng thái</p>
            <span className={`flex items-center gap-1 w-fit px-2 py-1 rounded-lg text-xs ${
              item.active ? 'text-green-400 bg-green-400/10' : 'text-gray-400 bg-gray-400/10'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${item.active ? 'bg-green-400' : 'bg-gray-400'}`}></div>
              {item.active ? 'Đang áp dụng' : 'Ngưng áp dụng'}
            </span>
          </div>
        </div>

        <div className="flex gap-3 px-6 py-5 border-t border-white/10">
          <button
            onClick={onClose}
            className="flex-1 h-11 bg-[#1f2937] hover:bg-[#374151] rounded-xl text-gray-300 transition-colors"
          >
            Đóng
          </button>
          <button
            onClick={onEdit}
            className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium transition-colors"
          >
            Chỉnh sửa
          </button>
        </div>
      </div>
    </div>
  );
}