import { useLocation } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

export default function BookingConfirmationPage() {
  const { state } = useLocation();

  const showtime = state?.showtime;
  const seats = state?.seats || [];

  const [loading, setLoading] = useState(false);

  const total = seats.length * (showtime?.base_price || 0);

  const handleConfirm = async () => {
    setLoading(true);

    try {
      await axios.post("http://localhost:5000/api/bookings", {
        showtime_id: showtime.showtime_id,
        seats: seats.map((s) => s.id),
        total_price: total,
      });

      alert("Đặt vé thành công");
    } catch (err) {
      console.error(err);
      alert("Lỗi đặt vé");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Xác nhận đặt vé</h1>

      <p className="mb-4">
        Suất chiếu: {new Date(showtime.start_time).toLocaleString()}
      </p>

      <p className="mb-4">Ghế: {seats.map((s) => s.id).join(", ")}</p>

      <p className="mb-6 font-bold">Tổng tiền: {total.toLocaleString()} đ</p>

      <button
        onClick={handleConfirm}
        disabled={loading}
        className="bg-red-600 text-white px-6 py-3 rounded"
      >
        Thanh toán
      </button>
    </div>
  );
}
