import { useEffect, useState } from "react";
import CinemasHeader from "../../components/admin/cinemas/CinemasHeader";
import CinemasStats from "../../components/admin/cinemas/CinemasStats";
import CinemasFilter from "../../components/admin/cinemas/CinemasFilter";
import CinemasTable from "../../components/admin/cinemas/CinemasTable";
import CinemaModal from "../../components/admin/cinemas/CinemaModal";
import AssignManagerModal from "../../components/admin/cinemas/AssignManagerModal";

export default function CinemasPage() {
  const [cinemas, setCinemas] = useState([]);
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
  };

  const [form, setForm] = useState(defaultForm);

  // ================= FETCH DATA =================
  const fetchCinemas = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/cinemas");
      const data = await res.json();

      console.log("API DATA:", data); // 👈 thêm dòng này để debug

      // 🔥 FIX CHÍNH
      setCinemas(Array.isArray(data) ? data : data.cinemas || []);
    } catch (err) {
      console.error("Fetch cinemas error:", err);
    }
  };

  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/cinemas");
        const data = await res.json();

        console.log("DATA:", data); // debug

        setCinemas(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setCinemas([]);
      }
    };

    fetchCinemas();
  }, []);

  // ================= FILTER =================
  const filtered = cinemas.filter((c) => {
    const matchSearch = c.name?.toLowerCase().includes(search.toLowerCase());
    const matchCity = cityFilter === "all" || c.city === cityFilter;
    return matchSearch && matchCity;
  });

  // ================= ACTION =================

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

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");

      if (editingCinema) {
        await fetch(
          `http://localhost:5000/api/cinemas/${editingCinema.cinema_id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(form),
          },
        );
      } else {
        await fetch("http://localhost:5000/api/cinemas", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        });
      }

      fetchCinemas();
      setShowModal(false);
    } catch (err) {
      console.error("Save cinema error:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await fetch(`http://localhost:5000/api/cinemas/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchCinemas();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleAssign = (cinema) => {
    setSelectedCinema(cinema);
    setShowAssign(true);
  };

  // ================= UI =================
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
