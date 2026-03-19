import { useState } from "react";
import CinemasHeader from "../../components/admin/cinemas/CinemasHeader";
import CinemasStats from "../../components/admin/cinemas/CinemasStats";
import CinemasFilter from "../../components/admin/cinemas/CinemasFilter";
import CinemasTable from "../../components/admin/cinemas/CinemasTable";
import CinemaModal from "../../components/admin/cinemas/CinemaModal";
import AssignManagerModal from "../../components/admin/cinemas/AssignManagerModal";
import { mockCinemas } from "../../data/cinemas.data";

export default function CinemasPage() {
  const [cinemas, setCinemas] = useState(mockCinemas);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [showAssign, setShowAssign] = useState(false);

  const [editingCinema, setEditingCinema] = useState(null);
  const [selectedCinema, setSelectedCinema] = useState(null);

  const defaultForm = {
    name: "",
    brand: "CGV",
    city: "",
    address: "",
    phone: "",
    rooms: 4,
    status: "active",
    managerId: null,
    managerName: null,
    managerEmail: null,
    staffCount: 0,
  };

  const [form, setForm] = useState(defaultForm);

  // Lọc dữ liệu
  const filtered = cinemas.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                       c.address.toLowerCase().includes(search.toLowerCase());
    const matchCity = cityFilter === "all" || c.city === cityFilter;
    return matchSearch && matchCity;
  });

  // Reset page khi filter thay đổi
  const handleSearchChange = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleCityFilterChange = (value) => {
    setCityFilter(value);
    setCurrentPage(1);
  };

  const handleAdd = () => {
    setEditingCinema(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const handleEdit = (cinema) => {
    setEditingCinema(cinema);
    setForm(cinema);
    setShowModal(true);
  };

  const handleView = (cinema) => {
    console.log("Viewing cinema:", cinema);
    // View logic được xử lý trong component CinemasTable
  };

  const handleSave = () => {
    if (editingCinema) {
      // Update existing cinema
      setCinemas(prev =>
        prev.map(c =>
          c.id === editingCinema.id ? { ...c, ...form } : c
        )
      );
    } else {
      // Add new cinema
      const newCinema = {
        id: Date.now(),
        ...form,
        staffCount: form.staffCount || 0,
      };
      setCinemas(prev => [newCinema, ...prev]);
    }
    setShowModal(false);
    setEditingCinema(null);
    setCurrentPage(1); // Reset về trang đầu
  };

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa rạp này?")) {
      setCinemas(prev => prev.filter(c => c.id !== id));
      // Nếu trang hiện tại không còn dữ liệu, chuyển về trang trước
      const newFiltered = filtered.filter(c => c.id !== id);
      const maxPage = Math.ceil(newFiltered.length / 5);
      if (currentPage > maxPage && maxPage > 0) {
        setCurrentPage(maxPage);
      } else if (newFiltered.length === 0) {
        setCurrentPage(1);
      }
    }
  };

  const handleAssign = (cinema) => {
    setSelectedCinema(cinema);
    setShowAssign(true);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="p-6 space-y-5">
      <CinemasHeader total={cinemas.length} onAdd={handleAdd} />

      <CinemasStats cinemas={cinemas} />

      <CinemasFilter
        search={search}
        setSearch={handleSearchChange}
        cityFilter={cityFilter}
        setCityFilter={handleCityFilterChange}
        cinemas={cinemas}
      />

      <CinemasTable
        cinemas={filtered}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAssign={handleAssign}
        onView={handleView}
        currentPage={currentPage}
        onPageChange={handlePageChange}
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
        show={showAssign}
        onClose={() => setShowAssign(false)}
        cinema={selectedCinema}
        setCinemas={setCinemas}
      />
    </div>
  );
}