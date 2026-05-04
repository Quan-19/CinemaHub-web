import { useEffect, useRef, useState } from "react";
import { formatNumberInput, parseNumberInput } from "../../utils/numberFormat";
import axios from "axios";
import { getAuth } from "firebase/auth";
import { Plus, Edit, Trash2, Package, Search, X, Upload } from "lucide-react";
import toast from "react-hot-toast";
export default function Foods() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    image: null,        
    imagePreview: "",  
    status: "available",
  });

  const formatCurrency = (amount) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return Math.round(numAmount).toLocaleString("vi-VN") + "₫";
  };

  const fetchFoods = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/foods");
      const formattedFoods = res.data.map((food) => ({
        ...food,
        price_formatted: formatCurrency(food.price),
        price_raw: parseFloat(food.price),
      }));
      setFoods(formattedFoods);
    } catch (error) {
      console.error("Lỗi tải foods:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  // Xử lý chọn file
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Kiểm tra loại file
      if (!file.type.startsWith('image/')) {
        alert("Vui lòng chọn file ảnh (jpg, png, gif, ...)");
        return;
      }
      // Kiểm tra kích thước (tối đa 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Ảnh không được vượt quá 5MB");
        return;
      }
      
      setFormData({
        ...formData,
        image: file,
        imagePreview: URL.createObjectURL(file)
      });
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  const auth = getAuth();
  const user = auth.currentUser;
  const token = await user.getIdToken();

  // Tạo FormData
  const submitData = new FormData();
  submitData.append("name", formData.name);
  submitData.append("price", parseFloat(formData.price));
  submitData.append("status", formData.status);
  
  // CHỈ THÊM NẾU CÓ FILE MỚI
  if (formData.image && formData.image instanceof File) {
    submitData.append("image", formData.image);
  }

  // Debug: kiểm tra dữ liệu
  console.log("=== FormData being sent ===");
  for (let pair of submitData.entries()) {
    console.log(pair[0], pair[1]);
  }

  try {
    setUploading(true);
    
    if (editingFood) {
      await axios.put(
        `http://localhost:5000/api/foods/${editingFood.food_id}`,
        submitData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          } 
        }
      );
    } else {
      await axios.post("http://localhost:5000/api/foods", submitData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        },
      });
    }
    
    fetchFoods();
    setShowModal(false);
    resetForm();
    toast.success(editingFood ? "Cập nhật thành công!" : "Thêm mới thành công!");
  } catch (error) {
    console.error("Lỗi chi tiết:", error.response?.data || error);
    toast.error(error.response?.data?.error || "Có lỗi xảy ra");
  } finally {
    setUploading(false);
  }
};

  const handleDelete = async (id) => {
    if (!confirm("Bạn có chắc muốn xóa món này?")) return;
    const auth = getAuth();
    const user = auth.currentUser;
    const token = await user.getIdToken();

    try {
      await axios.delete(`http://localhost:5000/api/foods/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchFoods();
    } catch (error) {
      console.error("Lỗi xóa food:", error);
      alert("Không thể xóa món này");
    }
  };

  const resetForm = () => {
  // Cleanup preview URL
  if (formData.imagePreview && formData.imagePreview.startsWith('blob:')) {
    URL.revokeObjectURL(formData.imagePreview);
  }
  setEditingFood(null);
  setFormData({ 
    name: "", 
    price: "", 
    image: null,      // Reset về null
    imagePreview: "", 
    status: "available" 
  });
};
  const openEditModal = (food) => {
  setEditingFood(food);
  setFormData({
    name: food.name,
    price: food.price_raw || food.price,
    image: null,                    // Quan trọng: không giữ file cũ
    imagePreview: food.image || "", // Hiển thị ảnh cũ
    status: food.status,
  });
  setShowModal(true);
};

  const filteredFoods = foods.filter((food) =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Combo & Đồ ăn</h1>
          <p className="text-sm text-gray-400 mt-1">
            Quản lý danh sách đồ ăn, combo bắp nước
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap"
        >
          <Plus size={16} /> Thêm món
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl bg-cinema-surface border border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/40">Tổng sản phẩm</p>
              <p className="text-2xl font-bold text-white mt-1">
                {foods.length}
              </p>
            </div>
            <Package className="w-8 h-8 text-red-500 opacity-50" />
          </div>
        </div>

        <div className="rounded-xl bg-cinema-surface border border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/40">Đang bán</p>
              <p className="text-2xl font-bold text-green-400 mt-1">
                {foods.filter((f) => f.status === "available").length}
              </p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-cinema-surface border border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/40">Tạm dừng</p>
              <p className="text-2xl font-bold text-yellow-400 mt-1">
                {foods.filter((f) => f.status === "out_of_stock").length}
              </p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-cinema-surface border border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/40">Giá trung bình</p>
              <p className="text-2xl font-bold text-white mt-1">
                {formatCurrency(
                  foods.reduce((sum, f) => sum + (f.price_raw || 0), 0) /
                    foods.length || 0,
                )}
              </p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <span className="text-blue-400 text-sm font-semibold">₫</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            size={18}
          />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên món..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white placeholder-gray-500 outline-none transition-colors focus:border-red-500/50"
          />
        </div>
      </div>

      {/* Products */}
      {filteredFoods.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-cinema-surface p-12 text-center">
          <Package className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/60">Không tìm thấy sản phẩm nào</p>
          <p className="text-white/40 text-sm mt-1">
            Thử đổi từ khóa hoặc thêm món mới
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFoods.map((food) => (
            <div
              key={food.food_id}
              className="group rounded-xl overflow-hidden border border-white/10 bg-cinema-surface transition-colors hover:border-white/20"
            >
                {/* Image */}
                <div className="relative h-40 overflow-hidden bg-zinc-900">
                  {food.image ? (
                    <img
                      src={food.image}
                      alt={food.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={48} className="text-white/15" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        food.status === "available"
                          ? "bg-green-500/15 text-green-400 border-green-500/20"
                          : "bg-yellow-500/15 text-yellow-400 border-yellow-500/20"
                      }`}
                    >
                      {food.status === "available" ? "Đang bán" : "Hết hàng"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-white font-semibold text-sm line-clamp-1">
                    {food.name}
                  </h3>
                  <p className="text-red-500 text-lg font-bold mt-2">
                    {food.price_formatted || formatCurrency(food.price)}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4 pt-3 border-t border-white/10">
                    <button
                      onClick={() => openEditModal(food)}
                      className="flex-1 py-2 rounded-lg text-sm font-medium bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-1"
                    >
                      <Edit size={14} />
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(food.food_id)}
                      className="flex-1 py-2 rounded-lg text-sm font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-1"
                    >
                      <Trash2 size={14} />
                      Xóa
                    </button>
                  </div>
                </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Thêm/Sửa */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-cinema-surface border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h2 className="text-white text-xl font-bold">
                {editingFood ? "Sửa món ăn" : "Thêm món ăn mới"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5">
              <div className="space-y-4">
                <div>
                  <label className="text-zinc-400 text-sm block mb-2">
                    Tên món
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Nhập tên món"
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="text-zinc-400 text-sm block mb-2">
                    Giá (VNĐ)
                  </label>
                  <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9,]*"
                      value={formatNumberInput(formData.price)}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price: parseNumberInput(e.target.value),
                        })
                      }
                      placeholder="Ví dụ: 50000"
                      className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 transition-colors"
                      required
                    />
                </div>

                {/* Upload Ảnh - Thay đổi ở đây */}
                <div>
                  <label className="text-zinc-400 text-sm block mb-2">
                    Hình ảnh
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white transition-colors"
                    >
                      <Upload size={16} />
                      Chọn ảnh
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    {formData.imagePreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, image: null, imagePreview: "" });
                        }}
                        className="text-red-400 text-sm hover:text-red-300"
                      >
                        Xóa ảnh
                      </button>
                    )}
                  </div>
                  
                  {/* Preview ảnh */}
                  {formData.imagePreview && (
                    <div className="mt-3">
                      <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700">
                        <img
                          src={formData.imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                  
                  <p className="text-zinc-500 text-xs mt-2">
                    Hỗ trợ: JPG, PNG, GIF (tối đa 5MB)
                  </p>
                </div>

                <div>
                  <label className="text-zinc-400 text-sm block mb-2">
                    Trạng thái
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-red-500/50 transition-colors"
                  >
                    <option value="available">Đang bán</option>
                    <option value="out_of_stock">Hết hàng</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? "Đang xử lý..." : (editingFood ? "Cập nhật" : "Thêm mới")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}