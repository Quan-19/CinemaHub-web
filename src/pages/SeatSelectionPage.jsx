import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Monitor } from "lucide-react";
import { useBooking } from "../context/BookingContext";

const ROWS = ["A", "B", "C", "D", "E", "F", "G", "H"];
const COLS = 10;

const SEAT_TYPES = {
  standard: { label: "Thường", color: "rgba(255,255,255,0.55)", bg: "rgba(255,255,255,0.08)", border: "rgba(255,255,255,0.15)" },
  vip: { label: "VIP", color: "#f59e0b", bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.4)" },
  couple: { label: "Couple", color: "#e50914", bg: "rgba(229,9,20,0.15)", border: "rgba(229,9,20,0.4)" },
};

function getSeatType(row, col) {
  if (row === "G" || row === "H") return "couple";
  if (row === "E" || row === "F") return "vip";
  return "standard";
}

// Pre-generate some occupied seats
const OCCUPIED = new Set(["A3", "A7", "B2", "B5", "C4", "C8", "D1", "D6", "E3", "F5", "G2", "H4"]);

export const SeatSelectionPage = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const { selectedMovie, selectedCinema, selectedShowtime, setSelectedSeats } = useBooking();
  const [picked, setPicked] = useState([]);

  const MAX_SEATS = 8;

  const toggleSeat = (id, type) => {
    if (OCCUPIED.has(id)) return;
    setPicked((prev) => {
      if (prev.find((s) => s.id === id)) return prev.filter((s) => s.id !== id);
      if (prev.length >= MAX_SEATS) return prev;
      return [...prev, { id, type }];
    });
  };

  const handleContinue = () => {
    if (picked.length === 0) return;
    setSelectedSeats(picked);
    navigate("/booking/confirm");
  };

  const basePrice = selectedShowtime?.price || 85000;
  const total = picked.reduce((sum, s) => {
    const mult = s.type === "vip" ? 1.3 : s.type === "couple" ? 1.5 : 1;
    return sum + basePrice * mult;
  }, 0);

  return (
    <div className="min-h-screen pt-16" style={{ background: "#0a0a0f" }}>
      {/* Header */}
      <div className="border-b border-zinc-800" style={{ background: "#12121f" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm mb-3 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Quay lại
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-white" style={{ fontWeight: 700 }}>Chọn ghế ngồi</h1>
              {selectedMovie && (
                <p className="text-zinc-400 text-sm mt-0.5">
                  {selectedMovie.title} · {selectedShowtime?.time} · {selectedCinema?.name}
                </p>
              )}
            </div>
            <div className="hidden sm:flex items-center gap-2">
              {[
                { n: 1, label: "Phim", done: true },
                { n: 2, label: "Rạp", done: true },
                { n: 3, label: "Ghế", active: true },
                { n: 4, label: "Thanh toán" },
              ].map((s, i) => (
                <div key={s.n} className="flex items-center gap-1.5">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${s.done ? "bg-green-500 text-white" : s.active ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-500"}`}
                    style={{ fontWeight: 700 }}
                  >
                    {s.done ? "✓" : s.n}
                  </div>
                  {i < 3 && <div className="w-6 h-px bg-zinc-700" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {/* Screen */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-3/4 h-2 rounded-full mb-2"
            style={{ background: "linear-gradient(90deg, transparent, rgba(229,9,20,0.6), transparent)" }}
          />
          <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">
            <Monitor className="w-3 h-3" /> MÀN HÌNH
          </div>
        </div>

        {/* Seat grid */}
        <div className="overflow-x-auto pb-4">
          <div className="inline-block min-w-full">
            {ROWS.map((row) => (
              <div key={row} className="flex items-center gap-1.5 mb-1.5 justify-center">
                <span className="text-zinc-600 text-xs w-4 text-right flex-shrink-0">{row}</span>
                {Array.from({ length: COLS }, (_, colIdx) => {
                  const id = `${row}${colIdx + 1}`;
                  const type = getSeatType(row, colIdx);
                  const isOccupied = OCCUPIED.has(id);
                  const isSelected = picked.some((s) => s.id === id);
                  const typeInfo = SEAT_TYPES[type];

                  // Add aisle gap in the middle
                  return (
                    <div key={id} className={colIdx === 4 ? "mr-3" : ""}>
                      <button
                        onClick={() => toggleSeat(id, type)}
                        disabled={isOccupied}
                        title={id}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-xs transition-all"
                        style={{
                          background: isOccupied
                            ? "rgba(255,255,255,0.05)"
                            : isSelected
                            ? "#e50914"
                            : typeInfo.bg,
                          border: `1px solid ${isOccupied ? "rgba(255,255,255,0.06)" : isSelected ? "#e50914" : typeInfo.border}`,
                          color: isOccupied ? "rgba(255,255,255,0.15)" : isSelected ? "#fff" : typeInfo.color,
                          cursor: isOccupied ? "not-allowed" : "pointer",
                          fontSize: 9,
                          fontWeight: 700,
                        }}
                      >
                        {isOccupied ? "×" : colIdx + 1}
                      </button>
                    </div>
                  );
                })}
                <span className="text-zinc-600 text-xs w-4 flex-shrink-0">{row}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 mt-4 mb-6">
          {[
            { label: "Đã đặt", bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.15)" },
            { label: "Đang chọn", bg: "#e50914", border: "#e50914", color: "#fff" },
            { label: "Thường", bg: SEAT_TYPES.standard.bg, border: SEAT_TYPES.standard.border, color: SEAT_TYPES.standard.color },
            { label: "VIP (+30%)", bg: SEAT_TYPES.vip.bg, border: SEAT_TYPES.vip.border, color: SEAT_TYPES.vip.color },
            { label: "Couple (+50%)", bg: SEAT_TYPES.couple.bg, border: SEAT_TYPES.couple.border, color: SEAT_TYPES.couple.color },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div
                className="w-5 h-5 rounded"
                style={{ background: item.bg, border: `1px solid ${item.border}` }}
              />
              <span className="text-zinc-400 text-xs">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="fixed bottom-0 left-0 right-0 border-t border-zinc-800 px-4 py-3"
          style={{ background: "#12121f" }}
        >
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div>
              {picked.length > 0 ? (
                <>
                  <p className="text-white text-sm" style={{ fontWeight: 700 }}>
                    {picked.map((s) => s.id).join(", ")}
                  </p>
                  <p className="text-zinc-400 text-xs">
                    {picked.length} ghế · {total.toLocaleString()}₫
                  </p>
                </>
              ) : (
                <p className="text-zinc-500 text-sm">Chưa chọn ghế nào</p>
              )}
            </div>
            <button
              onClick={handleContinue}
              disabled={picked.length === 0}
              className="px-6 py-2.5 rounded-xl text-white text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #e50914, #b20710)", fontWeight: 700 }}
            >
              Tiếp tục ({picked.length})
            </button>
          </div>
        </div>
        {/* Spacer for fixed bottom bar */}
        <div className="h-16" />
      </div>
    </div>
  );
};

export default SeatSelectionPage;
