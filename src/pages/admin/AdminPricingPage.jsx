import { useState } from "react";
import PricingTable from "../../components/admin/Pricing/PricingTable.jsx";
import PricingModal from "../../components/admin/Pricing/PricingModal.jsx";
import PricingStats from "../../components/admin/Pricing/PricingStats.jsx";
import PricingFilter from "../../components/admin/Pricing/PricingFilter.jsx";
import { Plus } from "lucide-react";

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
  }
];

export default function AdminPricingPage() {
  const [data, setData] = useState(mockPrices);
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);

  const filtered = data.filter(
    d => filter === "all" || d.type === filter
  );

  const handleAdd = (newItem) => {
    setData([newItem, ...data]);
  };

  return (
    <div className="p-6 bg-[#050816] min-h-screen text-white">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Quản lý giá vé</h1>
          <p className="text-sm text-gray-400">
            Cấu hình giá vé theo loại phòng
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-red-600 px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={16} /> Thêm bảng giá
        </button>
      </div>

      <PricingStats data={data} />
      <PricingFilter filter={filter} setFilter={setFilter} />

      <PricingTable data={filtered} />

      <PricingModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onAdd={handleAdd}
      />
    </div>
  );
}