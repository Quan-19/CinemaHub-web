import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

export default function BookingConfirmationPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const showtime = state?.showtime;
  const seats = state?.seats || [];
  const movie = state?.movie;

  const [foods, setFoods] = useState([]);
  const [comboCounts, setComboCounts] = useState({});
  const [paying, setPaying] = useState(false);
  const [step, setStep] = useState("confirm");

  // ❗ Nếu không có data → quay về
  useEffect(() => {
    if (!showtime || seats.length === 0) {
      navigate("/movies");
    }
  }, [showtime, seats, navigate]);

  // load foods
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/foods")
      .then((res) => {
        setFoods(res.data);

        const init = {};
        res.data.forEach((f) => {
          init[f.food_id] = 0;
        });
        setComboCounts(init);
      })
      .catch((err) => console.error(err));
  }, []);

  const seatTotal = seats.length * (showtime?.base_price || 0);

  const comboTotal = foods.reduce((sum, f) => {
    return sum + f.price * (comboCounts[f.food_id] || 0);
  }, 0);

  const grandTotal = seatTotal + comboTotal;

  const updateCombo = (id, change) => {
    setComboCounts((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + change),
    }));
  };

  const handleConfirm = async () => {
    setPaying(true);

    try {
      await axios.post("http://localhost:5000/api/bookings", {
        user_id: 1,
        showtime_id: showtime.showtime_id,
        seats: seats.map((s) => s.id),
        foods: Object.entries(comboCounts)
          .filter(([_, q]) => q > 0)
          .map(([id, q]) => ({
            food_id: Number(id),
            quantity: q,
          })),
        total_price: grandTotal,
      });

      setStep("success");
    } catch (err) {
      console.error(err);
      alert("Thanh toán thất bại");
    }

    setPaying(false);
  };

  if (!showtime) return null;

  // SUCCESS
  if (step === "success") {
    return (
      <div className="max-w-xl mx-auto text-center py-20 text-white">
        <h2 className="text-2xl font-bold text-green-500">
          Thanh toán thành công 🎉
        </h2>
        <p className="mt-2">Vé của bạn đã được đặt.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Xác nhận đặt vé</h1>

      {/* Movie Info */}
      <div className="mb-6">
        <h2 className="font-semibold">{movie?.title || "Không có tên phim"}</h2>

        <p>{new Date(showtime.start_time).toLocaleString()}</p>
      </div>

      {/* Seats */}
      <div className="mb-8">
        <h3 className="font-semibold mb-2">Ghế đã chọn</h3>
        <div className="flex gap-2 flex-wrap">
          {seats.map((s) => (
            <span key={s.id} className="px-3 py-1 bg-gray-800 rounded">
              {s.id}
            </span>
          ))}
        </div>
      </div>

      {/* Foods */}
      <div className="mb-10">
        <h3 className="font-semibold mb-4">Combo bắp nước</h3>

        <div className="grid md:grid-cols-2 gap-4">
          {foods.map((f) => (
            <div
              key={f.food_id}
              className="flex items-center justify-between border p-3 rounded"
            >
              <div>
                <p>{f.name}</p>
                <p className="text-sm text-gray-400">
                  {f.price.toLocaleString()}đ
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => updateCombo(f.food_id, -1)}>-</button>
                <span>{comboCounts[f.food_id] || 0}</span>
                <button onClick={() => updateCombo(f.food_id, 1)}>+</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="border-t pt-6">
        <div className="flex justify-between">
          <span>Tiền ghế</span>
          <span>{seatTotal.toLocaleString()}đ</span>
        </div>

        <div className="flex justify-between">
          <span>Combo</span>
          <span>{comboTotal.toLocaleString()}đ</span>
        </div>

        <div className="flex justify-between text-lg font-bold">
          <span>Tổng</span>
          <span>{grandTotal.toLocaleString()}đ</span>
        </div>
      </div>

      <button
        onClick={handleConfirm}
        disabled={paying}
        className="mt-6 w-full bg-red-600 py-3 rounded"
      >
        {paying ? "Đang xử lý..." : "Thanh toán"}
      </button>
    </div>
  );
}
