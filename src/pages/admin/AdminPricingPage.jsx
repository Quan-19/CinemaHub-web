import { useState, useEffect } from "react";
import PricingTable from "../../components/admin/Pricing/PricingTable.jsx";
import PricingModal from "../../components/admin/Pricing/PricingModal.jsx";
import PricingStats from "../../components/admin/Pricing/PricingStats.jsx";
import DeleteConfirmModal from "../../components/admin/Pricing/DeleteConfirmModal.jsx";
import { Plus, Filter, X, Calendar, Ticket } from "lucide-react";
import { toast } from "react-hot-toast";
import { getAuth } from "firebase/auth";
import { getPricingRuleRoomType, isHolidayPricingRule } from "../../utils/pricingRuleUtils";

export default function AdminPricingPage() {
  const [data, setData] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [filterSeat, setFilterSeat] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = "http://localhost:5000/api/pricing";

  const getAuthToken = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      const fallback = localStorage.getItem("token");
      return fallback || null;
    }
    try {
      const token = await user.getIdToken();
      if (token) {
        localStorage.setItem("token", token);
      }
      return token;
    } catch (error) {
      console.error("Error getting token:", error);
      toast.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại");
      return null;
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        setIsLoading(false);
        return;
      }
      const response = await fetch(API_URL, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("UNAUTHORIZED");
        }
        if (response.status === 403) {
          throw new Error("FORBIDDEN");
        }
        throw new Error("Failed to load data");
      }
      
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        toast.error(result.message || "Lỗi tải dữ liệu");
      }
    } catch (error) {
      console.error("Error loading data:", error);
      if (error.message === "UNAUTHORIZED") {
        toast.error("Bạn chưa đăng nhập hoặc phiên đăng nhập hết hạn");
      } else if (error.message === "FORBIDDEN") {
        toast.error("Bạn không có quyền thao tác giá vé");
      } else {
        toast.error("Không thể kết nối đến server");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = async (newItem) => {
    try {
      const token = await getAuthToken();
      if (!token) return;
      const payload = { ...newItem };
      
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success("Thêm quy tắc giá thành công!");
        loadData();
        setShowModal(false);
      } else {
        toast.error(result.message || "Thêm thất bại");
      }
    } catch (error) {
      console.error("Error adding item:", error);
      toast.error("Có lỗi xảy ra khi thêm");
    }
  };

  const handleUpdate = async (updatedItem) => {
    try {
      const token = await getAuthToken();
      if (!token) return;
      const payload = { ...updatedItem };
      delete payload.id;
      
      const response = await fetch(`${API_URL}/${updatedItem.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success("Cập nhật quy tắc giá thành công!");
        loadData();
        setEditingItem(null);
        setShowModal(false);
      } else {
        toast.error(result.message || "Cập nhật thất bại");
      }
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error("Có lỗi xảy ra khi cập nhật");
    }
  };

  const handleDelete = async () => {
    try {
      const token = await getAuthToken();
      if (!token) return;
      const response = await fetch(`${API_URL}/${deleteItem.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      
      const result = await response.json();
      if (result.success) {
        toast.success("Xóa quy tắc giá thành công!");
        loadData();
        setDeleteItem(null);
      } else {
        toast.error(result.message || "Xóa thất bại");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Có lỗi xảy ra khi xóa");
    }
  };

  const handleToggleActive = async (item) => {
    try {
      const token = await getAuthToken();
      if (!token) return;
      const response = await fetch(`${API_URL}/${item.id}/toggle`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      
      const result = await response.json();
      if (result.success) {
        toast.success(result.message);
        loadData();
      } else {
        toast.error(result.message || "Thay đổi trạng thái thất bại");
      }
    } catch (error) {
      console.error("Error toggling status:", error);
      toast.error("Có lỗi xảy ra");
    }
  };

  const handleView = (item) => {
    setViewItem(item);
    setShowViewModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const clearFilters = () => {
    setFilterType("all");
    setFilterSeat("all");
    setFilterCategory("all");
    setSearchTerm("");
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `pricing_rules_${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Xuất dữ liệu thành công!");
  };

  const handleImportData = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        if (Array.isArray(importedData)) {
          const token = localStorage.getItem("token");
          let successCount = 0;
          
          for (const item of importedData) {
            try {
              const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(item),
              });
              const result = await response.json();
              if (result.success) successCount++;
            } catch (err) {
              console.error("Error importing item:", err);
            }
          }
          
          toast.success(`Đã import thành công ${successCount}/${importedData.length} quy tắc giá!`);
          loadData();
        } else {
          toast.error("File không hợp lệ. Vui lòng chọn file JSON đúng định dạng.");
        }
      } catch (error) {
        console.error("Error importing data:", error);
        toast.error("Lỗi khi đọc file. Vui lòng kiểm tra lại định dạng file.");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const filtered = data.filter(item => {
    const isHoliday = isHolidayPricingRule(item);
    const roomType = getPricingRuleRoomType(item);

    const matchesCategory =
      filterCategory === "all" ||
      (filterCategory === "regular" && !isHoliday) ||
      (filterCategory === "holiday" && isHoliday);

    const matchesType = filterType === "all" || roomType === filterType;

    const matchesSeat =
      filterSeat === "all" ? true : !isHoliday && item.seat === filterSeat;

    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      q === "" ||
      item.name?.toLowerCase().includes(q) ||
      roomType.toLowerCase().includes(q) ||
      (!isHoliday && item.seat?.toLowerCase().includes(q)) ||
      (!isHoliday && item.day?.toLowerCase().includes(q)) ||
      (!isHoliday && item.time?.toLowerCase().includes(q)) ||
      (isHoliday && String(item.start_date || "").toLowerCase().includes(q)) ||
      (isHoliday && String(item.end_date || "").toLowerCase().includes(q));

    return matchesCategory && matchesType && matchesSeat && matchesSearch;
  });

  const regularCount = data.filter((item) => !isHolidayPricingRule(item)).length;
  const holidayCount = data.filter((item) => isHolidayPricingRule(item)).length;

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Quản lý giá vé</h1>
          <p className="text-sm text-gray-400">
            Quản lý các quy tắc giá vé áp dụng cho suất chiếu thường và quy tắc giá cho ngày lễ.
          </p>
        </div>

        <div className="flex gap-3 w-full md:w-auto flex-wrap">
          <div className="flex-1 md:w-64">
            <input
              type="text"
              placeholder="Tìm theo tên, loại phòng, loại ghế, ngày/giờ áp dụng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 px-4 rounded-lg bg-[#0d0d1a] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="relative group">
            <button className="px-4 py-2 rounded-lg bg-[#0d0d1a] hover:bg-[#1a1a2e] transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="hidden sm:inline">Xuất/Nhập</span>
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-[#0d0d1a] rounded-lg border border-white/10 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button onClick={handleExportData} className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/10 rounded-t-lg transition-colors" disabled={data.length === 0}>
                📤 Xuất dữ liệu (JSON)
              </button>
              <label className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/10 rounded-b-lg transition-colors cursor-pointer block">
                📥 Nhập dữ liệu (JSON)
                <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
              </label>
            </div>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              showFilters || filterCategory !== "all" || filterType !== "all" || filterSeat !== "all"
                ? "bg-red-600 hover:bg-red-700" 
                : "bg-[#0d0d1a] hover:bg-[#1a1a2e]"
            }`}
          >
            <Filter size={16} />
            <span className="hidden sm:inline">Lọc</span>
          </button>

          <button
            onClick={() => {
              setEditingItem(null);
              setShowModal(true);
            }}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <Plus size={16} /> Thêm quy tắc giá
          </button>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex gap-2 mb-6 border-b border-white/10 pb-3">
        <button
          onClick={() => {
            setFilterCategory("all");
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            filterCategory === "all"
              ? "bg-red-600 text-white"
              : "bg-[#0d0d1a] text-gray-400 hover:text-white"
          }`}
        >
          <Ticket size={16} />
          Tất cả quy tắc ({data.length})
        </button>
        <button
          onClick={() => {
            setFilterCategory("regular");
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            filterCategory === "regular"
              ? "bg-blue-600 text-white"
              : "bg-[#0d0d1a] text-gray-400 hover:text-white"
          }`}
        >
          🎬 Quy tắc thường ({regularCount})
        </button>
        <button
          onClick={() => {
            setFilterCategory("holiday");
            setFilterSeat("all");
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            filterCategory === "holiday"
              ? "bg-yellow-600 text-white"
              : "bg-[#0d0d1a] text-gray-400 hover:text-white"
          }`}
        >
          <Calendar size={16} />
          Quy tắc ngày lễ ({holidayCount})
        </button>
      </div>

      {/* Quick Explanation */}
      <div className="mb-6 p-4 bg-[#0d0d1a] rounded-xl border border-white/10">
        <div className="text-sm font-medium text-white mb-1">Bạn đang quản lý gì?</div>
        <div className="text-sm text-gray-400">
          Mỗi <span className="text-white">quy tắc giá</span> là một cấu hình giá vé theo điều kiện áp dụng.
        </div>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-[#050816] p-3 rounded-lg border border-white/10">
            <div className="text-xs text-gray-400 mb-1">Quy tắc thường</div>
            <div className="text-sm text-gray-300">
              Loại phòng + loại ghế + loại ngày + khung giờ → giá áp dụng.
            </div>
          </div>
          <div className="bg-[#050816] p-3 rounded-lg border border-white/10">
            <div className="text-xs text-gray-400 mb-1">Quy tắc ngày lễ</div>
            <div className="text-sm text-gray-300">
              Loại phòng + khoảng ngày + các thứ áp dụng → giá theo từng loại ghế.
            </div>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="mb-6 p-4 bg-[#0d0d1a] rounded-xl border border-white/10">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-white flex items-center gap-2">
              <Filter size={14} />
              Bộ lọc nâng cao
            </h3>
            <button onClick={clearFilters} className="text-xs text-gray-400 hover:text-white flex items-center gap-1">
              <X size={14} /> Xóa bộ lọc
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Lọc theo loại phòng</label>
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
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-2 block">Lọc theo loại ghế</label>
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
                    disabled={filterCategory === "holiday"}
                  >
                    {f.label}
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
          <p className="text-sm text-gray-500 mb-4">Nhấn "Thêm quy tắc giá" để tạo quy tắc giá đầu tiên</p>
          <button
            onClick={() => {
              setEditingItem(null);
              setShowModal(true);
            }}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg inline-flex items-center gap-2 transition-colors"
          >
            <Plus size={16} /> Thêm quy tắc giá đầu tiên
          </button>
        </div>
      )}

      {data.length > 0 && <PricingStats data={filtered} filterCategory={filterCategory} />}
      
      {data.length > 0 && (
        <PricingTable 
          data={filtered} 
          onEdit={handleEdit}
          onDelete={setDeleteItem}
          onView={handleView}
          onToggleActive={handleToggleActive}
        />
      )}

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

      <DeleteConfirmModal
        show={deleteItem !== null}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        item={deleteItem}
      />

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
  
  const isHoliday = isHolidayPricingRule(item);
  const roomType = getPricingRuleRoomType(item);

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

  const formatPrice = (price) => {
    if (!price && price !== 0) return '---';
    return price.toLocaleString() + '₫';
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="w-[500px] bg-[#0b0f1f] rounded-2xl border border-white/10 shadow-2xl max-h-[80vh] overflow-y-auto">
        <div className="px-6 py-5 border-b border-white/10 sticky top-0 bg-[#0b0f1f]">
          <h3 className="text-lg font-semibold text-white">Chi tiết quy tắc giá</h3>
        </div>
        
        <div className="px-6 py-5 space-y-4">
          <div className="bg-[#020617] p-4 rounded-xl">
            <p className="text-sm text-gray-400 mb-1">Tên quy tắc</p>
            <p className="text-white font-medium">{item.name}</p>
          </div>

          {isHoliday ? (
            <>
              <div className="bg-[#020617] p-4 rounded-xl">
                <p className="text-sm text-gray-400 mb-1">Loại phòng</p>
                <span className={`px-2 py-1 rounded-lg text-xs font-medium bg-${getTypeColor(roomType)}-500/20 text-${getTypeColor(roomType)}-400`}>
                  {roomType}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#020617] p-4 rounded-xl">
                  <p className="text-sm text-gray-400 mb-1">Ngày bắt đầu</p>
                  <p className="text-white">{item.start_date}</p>
                </div>
                <div className="bg-[#020617] p-4 rounded-xl">
                  <p className="text-sm text-gray-400 mb-1">Ngày kết thúc</p>
                  <p className="text-white">{item.end_date}</p>
                </div>
              </div>

              <div className="bg-[#020617] p-4 rounded-xl">
                <p className="text-sm text-gray-400 mb-1">Áp dụng các ngày</p>
                <div className="flex flex-wrap gap-1">
                  {item.apply_days?.map(d => {
                    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
                    return (
                      <span key={d} className="px-2 py-1 bg-white/10 rounded text-xs">
                        {days[d]}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="bg-[#020617] p-4 rounded-xl">
                <p className="text-sm text-gray-400 mb-2">Giá vé theo loại ghế</p>
                <div className="space-y-2">
                  {item.holiday_prices?.map((hp, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className={`text-sm ${hp.seat_type === 'VIP' ? 'text-amber-400' : hp.seat_type === 'Couple' ? 'text-pink-400' : 'text-gray-400'}`}>
                        {hp.seat_type}
                      </span>
                      <span className="text-yellow-400 font-bold">{formatPrice(Number(hp.price))}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#020617] p-4 rounded-xl">
                  <p className="text-sm text-gray-400 mb-1">Loại phòng</p>
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium bg-${getTypeColor(roomType)}-500/20 text-${getTypeColor(roomType)}-400`}>
                    {roomType}
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
                  <p className="text-white line-through">{formatPrice(item.base)}</p>
                </div>
                <div className="bg-[#020617] p-4 rounded-xl">
                  <p className="text-sm text-gray-400 mb-1">Giá áp dụng</p>
                  <p className="text-yellow-400 font-bold text-lg">{formatPrice(item.final)}</p>
                </div>
              </div>
            </>
          )}

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
          <button onClick={onClose} className="flex-1 h-11 bg-[#1f2937] hover:bg-[#374151] rounded-xl text-gray-300 transition-colors">
            Đóng
          </button>
          <button onClick={onEdit} className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium transition-colors">
            Chỉnh sửa
          </button>
        </div>
      </div>
    </div>
  );
}