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
  };

  const [form, setForm] = useState(defaultForm);

  const filtered = cinemas.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchCity = cityFilter === "all" || c.city === cityFilter;
    return matchSearch && matchCity;
  });

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

  const handleSave = () => {
    if (editingCinema) {
      setCinemas(prev =>
        prev.map(c =>
          c.id === editingCinema.id ? { ...c, ...form } : c
        )
      );
    } else {
      setCinemas(prev => [
        { id: Date.now(), ...form },
        ...prev,
      ]);
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    setCinemas(prev => prev.filter(c => c.id !== id));
  };

  const handleAssign = (cinema) => {
    setSelectedCinema(cinema);
    setShowAssign(true);
  };

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