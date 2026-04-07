import { useState, useEffect } from "react";
import CinemasHeader from "../../components/admin/cinemas/CinemasHeader";
import CinemasStats from "../../components/admin/cinemas/CinemasStats";
import CinemasFilter from "../../components/admin/cinemas/CinemasFilter";
import CinemasTable from "../../components/admin/cinemas/CinemasTable";
import CinemaModal from "../../components/admin/cinemas/CinemaModal";
import AssignManagerModal from "../../components/admin/cinemas/AssignManagerModal";
import { toast } from "react-hot-toast";
import { getAuth } from "firebase/auth";

export default function CinemasPage() {
  const [cinemas, setCinemas] = useState([]);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingCinema, setEditingCinema] = useState(null);
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const defaultForm = {
    name: "",
    brand: "CGV",
    city: "",
    address: "",
    phone: "",
    maxRooms: 4,
    currentRooms: 0,
    rooms: [],
    status: "active",
    managerId: null,
    managerName: null,
    managerEmail: null,
  };

  const [form, setForm] = useState(defaultForm);

  // Hàm lấy token từ Firebase Auth
  const getAuthToken = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      toast.error("Vui lòng đăng nhập lại");
      return null;
    }
    try {
      return await user.getIdToken();
    } catch (error) {
      console.error("Error getting token:", error);
      toast.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại");
      return null;
    }
  };

  const fetchCinemas = async () => {
    setLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await fetch("http://localhost:5000/api/cinemas", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!res.ok) throw new Error("Failed to fetch cinemas");
      
      const data = await res.json();
      
      const normalizedCinemas = (Array.isArray(data) ? data : []).map(cinema => ({
        id: cinema.cinema_id || cinema.id,
        cinema_id: cinema.cinema_id || cinema.id,
        name: cinema.name || "",
        brand: cinema.brand || "CGV",
        city: cinema.city || "",
        address: cinema.address || "",
        phone: cinema.phone || "",
        maxRooms: cinema.maxRooms || 4,
        currentRooms: cinema.currentRooms || cinema.rooms?.length || 0,
        rooms: cinema.rooms || [],
        status: cinema.status || "active",
        managerId: cinema.manager_id || cinema.managerId || null,
        managerName: cinema.manager_name || cinema.managerName || null,
        managerEmail: cinema.manager_email || cinema.managerEmail || null,
        createdAt: cinema.created_at || cinema.createdAt || new Date().toISOString(),
      }));
      
      setCinemas(normalizedCinemas);
      localStorage.setItem('cinemas', JSON.stringify(normalizedCinemas));
    } catch (err) {
      console.error("Fetch cinemas error:", err);
      toast.error("Không thể tải danh sách rạp. Vui lòng thử lại!");
      
      const savedCinemas = localStorage.getItem('cinemas');
      if (savedCinemas && JSON.parse(savedCinemas).length > 0) {
        setCinemas(JSON.parse(savedCinemas));
        toast.info("Đã tải dữ liệu từ bộ nhớ tạm");
      } else {
        setCinemas([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCinemas();
  }, []);

  const filtered = cinemas.filter(c => {
    const matchSearch = c.name?.toLowerCase().includes(search.toLowerCase()) ||
                        c.address?.toLowerCase().includes(search.toLowerCase());
    const matchCity = cityFilter === "all" || c.city === cityFilter;
    return matchSearch && matchCity;
  });

  const handleAdd = () => {
    setEditingCinema(null);
    setForm({
      ...defaultForm,
      id: Date.now(),
    });
    setShowModal(true);
  };

  const handleEdit = (cinema) => {
    setEditingCinema(cinema);
    setForm(cinema);
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const token = await getAuthToken();
      if (!token) return;

      const requestData = {
        name: form.name,
        brand: form.brand,
        city: form.city,
        address: form.address,
        phone: form.phone,
        rooms: form.maxRooms,
        status: form.status,
        managerId: form.managerId || null,
      };
      
      if (editingCinema) {
        const response = await fetch(`http://localhost:5000/api/cinemas/${editingCinema.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestData),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Update failed");
        }
        
        setCinemas(prev =>
          prev.map(c =>
            c.id === editingCinema.id ? { ...c, ...form } : c
          )
        );
        toast.success("Cập nhật rạp thành công!");
      } else {
        const response = await fetch("http://localhost:5000/api/cinemas", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestData),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Create failed");
        }
        
        const newCinema = await response.json();
        
        const cinemaToAdd = {
          ...form,
          id: newCinema.cinema_id || newCinema.id,
          cinema_id: newCinema.cinema_id || newCinema.id,
          rooms: [],
          currentRooms: 0,
          createdAt: new Date().toISOString(),
        };
        setCinemas(prev => [...prev, cinemaToAdd]);
        toast.success("Thêm rạp mới thành công!");
      }
      
      await fetchCinemas();
      setShowModal(false);
      setEditingCinema(null);
    } catch (err) {
      console.error("Save cinema error:", err);
      toast.error(err.message || "Có lỗi xảy ra. Vui lòng thử lại!");
    }
  };

  const handleDelete = async (id) => {
    const cinemaToDelete = cinemas.find(c => c.id === id);
    
    if (cinemaToDelete?.rooms?.length > 0) {
      toast.error(`Không thể xóa rạp vì còn ${cinemaToDelete.rooms.length} phòng chiếu!`);
      return;
    }
    
    if (window.confirm("Bạn có chắc chắn muốn xóa rạp này?")) {
      try {
        const token = await getAuthToken();
        if (!token) return;
        
        const response = await fetch(`http://localhost:5000/api/cinemas/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Delete failed");
        }
        
        setCinemas(prev => prev.filter(c => c.id !== id));
        toast.success("Xóa rạp thành công!");
      } catch (err) {
        console.error("Delete error:", err);
        toast.error(err.message || "Không thể xóa rạp. Vui lòng thử lại!");
      }
    }
  };

  const handleAssign = (cinema) => {
    setSelectedCinema(cinema);
    setShowAssignModal(true);
  };

  const handleAssignSuccess = (cinemaId, manager) => {
    setCinemas(prev =>
      prev.map(cinema =>
        cinema.id === cinemaId
          ? {
              ...cinema,
              managerId: manager?.id || null,
              managerName: manager?.name || null,
              managerEmail: manager?.email || null,
            }
          : cinema
      )
    );
    toast.success("Phân quyền quản lý thành công!");
    setShowAssignModal(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <CinemasHeader total={cinemas.length} onAdd={handleAdd} />
      
      <CinemasStats cinemas={cinemas} />
      
      <CinemasFilter
        search={search}
        setSearch={setSearch}
        cityFilter={cityFilter}
        setCityFilter={setCityFilter}
        cinemas={cinemas}
      />
      
      <CinemasTable
        cinemas={filtered}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAssign={handleAssign}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        itemsPerPage={5}
      />
      
      <CinemaModal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingCinema(null);
        }}
        onSave={handleSave}
        form={form}
        setForm={setForm}
        isEdit={!!editingCinema}
      />
      
      <AssignManagerModal
        show={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedCinema(null);
        }}
        cinema={selectedCinema}
        onAssigned={handleAssignSuccess}
      />
    </div>
  );
}