import { useState, useEffect } from "react";
import { Plus, Filter, X, Tag } from "lucide-react";
import { toast } from "react-hot-toast";
import PromotionModal from "../../components/admin/promotions/PromotionModal.jsx";
import PromotionsTable from "../../components/admin/promotions/PromotionsTable.jsx";
import PromotionsStats from "../../components/admin/promotions/PromotionsStats.jsx";
import DeleteConfirmModal from "../../components/admin/promotions/DeleteConfirmModal.jsx";

const API_URL = "http://localhost:5000/api/promotions";

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Load promotions
  const loadPromotions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_URL, {
        headers: {
          "Authorization": token ? `Bearer ${token}` : "",
        },
      });
      
      const result = await response.json();
      if (result.success) {
        setPromotions(result.data);
      } else {
        toast.error(result.message || "Lỗi tải dữ liệu");
      }
    } catch (error) {
      console.error("Error loading promotions:", error);
      toast.error("Không thể kết nối đến server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromotions();
  }, []);

  // Filter promotions
  useEffect(() => {
    let filteredData = [...promotions];
    
    if (searchTerm) {
      filteredData = filteredData.filter(p =>
        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== "all") {
      const today = new Date().toISOString().split('T')[0];
      if (statusFilter === "active") {
        filteredData = filteredData.filter(p => 
          p.status === 'active' && p.start_date <= today && p.end_date >= today
        );
      } else if (statusFilter === "inactive") {
        filteredData = filteredData.filter(p => p.status === 'inactive');
      } else if (statusFilter === "expired") {
        filteredData = filteredData.filter(p => 
          p.status === 'active' && p.end_date < today
        );
      }
    }
    
    setFiltered(filteredData);
  }, [promotions, searchTerm, statusFilter]);

  const handleAdd = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleSave = async (data) => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        toast.error("Vui lòng đăng nhập lại!");
        return;
      }
      
      let url = API_URL;
      let method = "POST";
      
      if (editingItem) {
        url = `${API_URL}/${editingItem.promotion_id}`;
        method = "PUT";
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        toast.success(editingItem ? "Cập nhật khuyến mãi thành công" : "Thêm khuyến mãi thành công");
        loadPromotions();
        setShowModal(false);
        setEditingItem(null);
      } else {
        toast.error(result.message || result.error || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error saving promotion:", error);
      toast.error("Không thể kết nối đến server");
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        toast.error("Vui lòng đăng nhập lại!");
        return;
      }
      
      const response = await fetch(`${API_URL}/${deleteItem.promotion_id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        toast.success("Xóa khuyến mãi thành công");
        loadPromotions();
        setDeleteItem(null);
      } else {
        toast.error(result.message || result.error || "Xóa thất bại");
      }
    } catch (error) {
      console.error("Error deleting promotion:", error);
      toast.error("Không thể kết nối đến server");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white flex items-center gap-2">
            <Tag className="text-red-500" size={24} />
            Quản lý khuyến mãi
          </h1>
          <p className="text-sm text-gray-400">
            Tạo mã giảm giá cho khách hàng
          </p>
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 h-10 px-4 rounded-lg bg-zinc-900 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
          />

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              showFilters || statusFilter !== "all"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-zinc-900 hover:bg-zinc-800"
            }`}
          >
            <Filter size={16} />
            <span className="hidden sm:inline">Lọc</span>
          </button>

          <button
            onClick={handleAdd}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={16} />
            Thêm khuyến mãi
          </button>
        </div>
      </div>

      {/* Stats */}
      <PromotionsStats promotions={filtered} />

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-cinema-surface rounded-xl border border-white/10 p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-white">Bộ lọc nâng cao</h3>
            <button
              onClick={clearFilters}
              className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
            >
              <X size={14} />
              Xóa bộ lọc
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Trạng thái</label>
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: "all", label: "Tất cả" },
                  { value: "active", label: "Đang áp dụng" },
                  { value: "inactive", label: "Ngưng áp dụng" },
                  { value: "expired", label: "Đã hết hạn" },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setStatusFilter(opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition ${
                      statusFilter === opt.value
                        ? "bg-red-600 text-white"
                        : "bg-white/5 text-gray-400 hover:text-white"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <PromotionsTable
        promotions={filtered}
        onEdit={handleEdit}
        onDelete={setDeleteItem}
      />

      {/* Modals */}
      {showModal && (
        <PromotionModal
          show={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingItem(null);
          }}
          onSave={handleSave}
          editingItem={editingItem}
        />
      )}

      <DeleteConfirmModal
        show={deleteItem !== null}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        item={deleteItem}
      />
    </div>
  );
}