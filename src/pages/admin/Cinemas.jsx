import { useState, useEffect } from "react";
import CinemasHeader from "../../components/admin/cinemas/CinemasHeader";
import CinemasStats from "../../components/admin/cinemas/CinemasStats";
import CinemasFilter from "../../components/admin/cinemas/CinemasFilter";
import CinemasTable from "../../components/admin/cinemas/CinemasTable";
import CinemaModal from "../../components/admin/cinemas/CinemaModal";
import AssignManagerModal from "../../components/admin/cinemas/AssignManagerModal";
import { toast } from "react-hot-toast";

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
    staffCount: 0,
  };

  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    loadCinemas();
  }, []);

  const loadCinemas = () => {
    setLoading(true);
    try {
      const savedCinemas = localStorage.getItem('cinemas');
      if (savedCinemas && JSON.parse(savedCinemas).length > 0) {
        const cinemaData = JSON.parse(savedCinemas);
        const normalizedCinemas = cinemaData.map(cinema => ({
          ...cinema,
          rooms: cinema.rooms || [],
          currentRooms: cinema.currentRooms || cinema.rooms?.length || 0,
        }));
        setCinemas(normalizedCinemas);
      } else {
        setCinemas([]);
      }
    } catch (error) {
      console.error("Failed to load cinemas:", error);
      setCinemas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('cinemas', JSON.stringify(cinemas));
    }
  }, [cinemas, loading]);

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

  const handleSave = () => {
    if (editingCinema) {
      setCinemas(prev =>
        prev.map(c =>
          c.id === editingCinema.id ? { ...c, ...form } : c
        )
      );
      toast.success("Cập nhật rạp thành công!");
    } else {
      const newCinema = {
        ...form,
        id: Date.now(),
        rooms: [],
        currentRooms: 0,
        staffCount: 0,
        createdAt: new Date().toISOString(),
      };
      setCinemas(prev => [...prev, newCinema]);
      toast.success("Thêm rạp mới thành công!");
    }
    setShowModal(false);
    setEditingCinema(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa rạp này?")) {
      const cinemaToDelete = cinemas.find(c => c.id === id);
      if (cinemaToDelete?.rooms?.length > 0) {
        toast.error(`Không thể xóa rạp vì còn ${cinemaToDelete.rooms.length} phòng chiếu!`);
        return;
      }
      setCinemas(prev => prev.filter(c => c.id !== id));
      toast.success("Xóa rạp thành công!");
    }
  };

  const handleAssign = (cinema) => {
    setSelectedCinema(cinema);
    setShowAssignModal(true);
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
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
        setCinemas={setCinemas}
      />
    </div>
  );
}