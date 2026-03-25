import { useState, useEffect } from "react";
import PricingTable from "../../components/admin/Pricing/PricingTable.jsx";
import PricingModal from "../../components/admin/Pricing/PricingModal.jsx";
import PricingStats from "../../components/admin/Pricing/PricingStats.jsx";
import DeleteConfirmModal from "../../components/admin/Pricing/DeleteConfirmModal.jsx";
import { Plus, Filter, X } from "lucide-react";


export default function AdminPricingPage() {
  const [data, setData] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [filterSeat, setFilterSeat] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load data từ localStorage khi component mount
  useEffect(() => {
    loadDataFromLocalStorage();
  }, []);

  // Save data to localStorage whenever data changes
  useEffect(() => {
    if (!isLoading) {
      saveDataToLocalStorage(data);
    }
  }, [data, isLoading]);

  const loadDataFromLocalStorage = () => {
    setIsLoading(true);
    try {
      const savedData = localStorage.getItem("pricing_rules");
      if (savedData) {
        setData(JSON.parse(savedData));
      } else {
        // Khởi tạo với mảng rỗng, không có dữ liệu mẫu
        setData([]);
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveDataToLocalStorage = (dataToSave) => {
    try {
      localStorage.setItem("pricing_rules", JSON.stringify(dataToSave));
    } catch (error) {
      console.error("Error saving data to localStorage:", error);
    }
  };

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

  // Export data to JSON file (tiện cho backup)
  const handleExportData = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `pricing_rules_${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Import data from JSON file
  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        if (Array.isArray(importedData)) {
          setData(importedData);
          alert(`Đã import thành công ${importedData.length} quy tắc giá!`);
        } else {
          alert("File không hợp lệ. Vui lòng chọn file JSON đúng định dạng.");
        }
      } catch (error) {
        console.error("Error importing data:", error);
        alert("Lỗi khi đọc file. Vui lòng kiểm tra lại định dạng file.");
      }
    };
    reader.readAsText(file);
    event.target.value = ""; // Reset input
  };

  // Reset all data (xóa toàn bộ)
  const handleResetAll = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa TẤT CẢ quy tắc giá? Hành động này không thể hoàn tác.")) {
      setData([]);
      localStorage.removeItem("pricing_rules");
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

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

        <div className="flex gap-3 w-full md:w-auto flex-wrap">
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

          {/* Import/Export Buttons */}
          <div className="relative group">
            <button
              className="px-4 py-2 rounded-lg bg-[#0d0d1a] hover:bg-[#1a1a2e] transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="hidden sm:inline">Xuất/Nhập</span>
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-[#0d0d1a] rounded-lg border border-white/10 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={handleExportData}
                className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/10 rounded-t-lg transition-colors"
                disabled={data.length === 0}
              >
                📤 Xuất dữ liệu (JSON)
              </button>
              <label className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/10 rounded-b-lg transition-colors cursor-pointer block">
                📥 Nhập dữ liệu (JSON)
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
              </label>
            </div>
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
            <div className="flex gap-2">
              <button
                onClick={handleResetAll}
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
              >
                <X size={14} />
                Xóa tất cả dữ liệu
              </button>
              <button
                onClick={clearFilters}
                className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
              >
                <X size={14} />
                Xóa bộ lọc
              </button>
            </div>
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

      {data.length === 0 && !isLoading && (
        <div className="mb-6 p-8 bg-[#0d0d1a] rounded-xl border border-white/10 text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-400 mb-2">Chưa có dữ liệu quy tắc giá</p>
          <p className="text-sm text-gray-500 mb-4">Nhấn "Thêm bảng giá" để tạo quy tắc giá đầu tiên</p>
          <button
            onClick={() => {
              setEditingItem(null);
              setShowModal(true);
            }}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg inline-flex items-center gap-2 transition-colors"
          >
            <Plus size={16} /> Thêm bảng giá đầu tiên
          </button>
        </div>
      )}

      {data.length > 0 && <PricingStats data={data} />}
      
      {/* Active Filters Display */}
      {(filterType !== "all" || filterSeat !== "all" || searchTerm) && data.length > 0 && (
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

      {data.length > 0 && (
        <PricingTable 
          data={filtered} 
          onEdit={handleEdit}
          onDelete={setDeleteItem}
          onView={handleView}
          onToggleActive={handleToggleActive}
        />
      )}

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

// View Detail Modal Component
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