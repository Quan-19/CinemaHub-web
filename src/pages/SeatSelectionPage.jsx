import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Monitor } from "lucide-react";

const ROWS = ["A", "B", "C", "D", "E", "F", "G", "H"];
const COLS = 10;

function getSeatType(row) {
  if (row === "G" || row === "H") return "couple";
  if (row === "E" || row === "F") return "vip";
  return "standard";
}

export const SeatSelectionPage = () => {
  const { showtimeId } = useParams();
  const navigate = useNavigate();

  const [showtime, setShowtime] = useState(null);
  const [occupiedSeats, setOccupiedSeats] = useState(new Set());
  const [picked, setPicked] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const resShowtime = await fetch(
        `http://localhost:5000/api/showtimes/${showtimeId}`,
      );
      const showtimeData = await resShowtime.json();
      setShowtime(showtimeData);

      const resSeats = await fetch(
        `http://localhost:5000/api/seats/showtime/${showtimeId}`,
      );
      const seatData = await resSeats.json();

      setOccupiedSeats(new Set(seatData.occupied));
    };

    fetchData();
  }, [showtimeId]);

  const toggleSeat = (id, type) => {
    if (occupiedSeats.has(id)) return;

    setPicked((prev) => {
      if (prev.find((s) => s.id === id)) {
        return prev.filter((s) => s.id !== id);
      }

      if (prev.length >= 8) return prev;

      return [...prev, { id, type }];
    });
  };

  const total = picked.length * (showtime?.base_price || 0);

  return (
    <div className="min-h-screen pt-16 bg-[#0a0a0f]">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-zinc-400 mb-4"
        >
          <ChevronLeft className="w-4 h-4" /> Quay lại
        </button>

        <h1 className="text-white font-bold text-lg mb-6">Chọn ghế</h1>
      </div>

      <div className="flex flex-col items-center mb-8">
        <div className="w-3/4 h-2 bg-red-500 rounded-full mb-2" />
        <div className="text-zinc-500 text-xs flex gap-1 items-center">
          <Monitor className="w-3 h-3" /> MÀN HÌNH
        </div>
      </div>

      <div className="flex flex-col items-center">
        {ROWS.map((row) => (
          <div key={row} className="flex gap-2 mb-2">
            {Array.from({ length: COLS }, (_, i) => {
              const id = `${row}${i + 1}`;
              const type = getSeatType(row);

              const occupied = occupiedSeats.has(id);
              const selected = picked.some((s) => s.id === id);

              return (
                <button
                  key={id}
                  disabled={occupied}
                  onClick={() => toggleSeat(id, type)}
                  className={`w-7 h-7 rounded text-xs ${
                    occupied
                      ? "bg-gray-700"
                      : selected
                        ? "bg-red-600"
                        : "bg-gray-500"
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#12121f] border-t border-zinc-800 p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="text-white">{picked.map((s) => s.id).join(", ")}</div>

          <button
            disabled={picked.length === 0}
            onClick={() =>
              navigate("/booking/confirm", {
                state: {
                  showtime,
                  seats: picked,
                },
              })
            }
            className="px-6 py-2 bg-red-600 rounded text-white"
          >
            Tiếp tục ({picked.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionPage;
