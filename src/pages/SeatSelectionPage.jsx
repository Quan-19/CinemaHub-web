import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Monitor } from "lucide-react";
import { useBooking } from "../context/BookingContext";

const ROWS = ["A", "B", "C", "D", "E", "F", "G", "H"];
const COLS = 10;
const MAX_SEATS = 8;

const SEAT_TYPES = {
  standard: { 
    label: "Thường", 
    color: "rgba(255,255,255,0.55)", 
    bg: "rgba(255,255,255,0.08)", 
    border: "rgba(255,255,255,0.15)", 
    multiplier: 1 
  },
  vip: { 
    label: "VIP", 
    color: "#f59e0b", 
    bg: "rgba(245,158,11,0.15)", 
    border: "rgba(245,158,11,0.4)", 
    multiplier: 1.3 
  },
  couple: { 
    label: "Couple", 
    color: "#e50914", 
    bg: "rgba(229,9,20,0.15)", 
    border: "rgba(229,9,20,0.4)", 
    multiplier: 1.5 
  },
};

function getSeatType(row) {
  if (row === "G" || row === "H") return "couple";
  if (row === "E" || row === "F") return "vip";
  return "standard";
}

export const SeatSelectionPage = () => {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const { selectedMovie, selectedCinema, selectedShowtime, setSelectedSeats } = useBooking();
  
  // State
  const [showtime, setShowtime] = useState(null);
  const [occupiedSeats, setOccupiedSeats] = useState(new Set());
  const [picked, setPicked] = useState([]);
  const [loading, setLoading] = useState(true);

  // ========== FETCH DATA FROM API (Code 1) ==========
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch showtime data
        const resShowtime = await fetch(`http://localhost:5000/api/showtimes/${showtimeId}`);
        if (!resShowtime.ok) throw new Error("Failed to fetch showtime");
        const showtimeData = await resShowtime.json();
        setShowtime(showtimeData);

        // Fetch occupied seats
        const resSeats = await fetch(`http://localhost:5000/api/seats/showtime/${showtimeId}`);
        if (!resSeats.ok) throw new Error("Failed to fetch seats");
        const seatData = await resSeats.json();
        setOccupiedSeats(new Set(seatData.occupied));
      } catch (err) {
        console.error("Error loading seat data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (showtimeId) fetchData();
  }, [showtimeId]);

  // ========== TOGGLE SEAT ==========
  const toggleSeat = (id, type) => {
    if (occupiedSeats.has(id)) return;
    setPicked((prev) => {
      if (prev.find((s) => s.id === id)) {
        return prev.filter((s) => s.id !== id);
      }
      if (prev.length >= MAX_SEATS) return prev;
      return [...prev, { id, type }];
    });
  };

  // ========== HANDLE CONTINUE ==========
  const handleContinue = () => {
    if (picked.length === 0) return;
    
    // Lưu vào context (Code 2)
    setSelectedSeats(picked);
    
    // Điều hướng với state (Code 1)
    navigate("/booking/confirm", {
      state: {
        showtime: showtime || selectedShowtime,
        seats: picked,
        movie: selectedMovie,
      },
    });
  };

  // ========== CALCULATE TOTAL PRICE ==========
  const basePrice = showtime?.base_price || selectedShowtime?.price || 85000;
  const total = picked.reduce((sum, s) => {
    const typeInfo = SEAT_TYPES[s.type];
    const multiplier = typeInfo?.multiplier || 1;
    return sum + basePrice * multiplier;
  }, 0);

  // ========== GET MOVIE INFO ==========
  const movieInfo = selectedMovie || showtime?.movie;
  const cinemaInfo = selectedCinema || showtime?.cinema;
  const showtimeInfo = showtime || selectedShowtime;

  // ========== LOADING STATE ==========
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0f" }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Đang tải sơ đồ ghế...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16" style={{ background: "#0a0a0f" }}>
      {/* ========== HEADER (Code 2) ========== */}
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
              <h1 className="text-white font-bold text-lg">Chọn ghế ngồi</h1>
              {movieInfo && (
                <p className="text-zinc-400 text-sm mt-0.5">
                  {movieInfo.title} ·{" "}
                  {showtimeInfo?.start_time 
                    ? new Date(showtimeInfo.start_time).toLocaleTimeString("vi-VN") 
                    : showtimeInfo?.time} ·{" "}
                  {cinemaInfo?.name}
                </p>
              )}
            </div>
            
            {/* Step indicator (Code 2) */}
            <div className="hidden sm:flex items-center gap-2">
              {[
                { n: 1, label: "Phim", done: true },
                { n: 2, label: "Rạp", done: true },
                { n: 3, label: "Ghế", active: true },
                { n: 4, label: "Thanh toán" },
              ].map((s, i) => (
                <div key={s.n} className="flex items-center gap-1.5">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      s.done 
                        ? "bg-green-500 text-white" 
                        : s.active 
                        ? "bg-red-600 text-white" 
                        : "bg-zinc-800 text-zinc-500"
                    }`}
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
        {/* ========== SCREEN (Kết hợp gradient từ Code 2) ========== */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-3/4 h-2 rounded-full mb-2"
            style={{ background: "linear-gradient(90deg, transparent, rgba(229,9,20,0.6), transparent)" }}
          />
          <div className="flex items-center gap-2 text-zinc-500 text-xs">
            <Monitor className="w-3 h-3" /> MÀN HÌNH
          </div>
        </div>

        {/* ========== SEAT GRID (Kết hợp styling Code 2 + data Code 1) ========== */}
        <div className="overflow-x-auto pb-4">
          <div className="inline-block min-w-full">
            {ROWS.map((row) => (
              <div key={row} className="flex items-center gap-1.5 mb-1.5 justify-center">
                {/* Row label bên trái */}
                <span className="text-zinc-600 text-xs w-4 text-right flex-shrink-0 font-medium">
                  {row}
                </span>
                
                {Array.from({ length: COLS }, (_, colIdx) => {
                  const id = `${row}${colIdx + 1}`;
                  const type = getSeatType(row);
                  const isOccupied = occupiedSeats.has(id);
                  const isSelected = picked.some((s) => s.id === id);
                  const typeInfo = SEAT_TYPES[type];

                  return (
                    <div key={id} className={colIdx === 4 ? "mr-3" : ""}>
                      <button
                        onClick={() => toggleSeat(id, type)}
                        disabled={isOccupied}
                        title={id}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-xs transition-all hover:scale-105 active:scale-95"
                        style={{
                          background: isOccupied
                            ? "rgba(255,255,255,0.05)"
                            : isSelected
                            ? "#e50914"
                            : typeInfo.bg,
                          border: `1px solid ${
                            isOccupied 
                              ? "rgba(255,255,255,0.06)" 
                              : isSelected 
                              ? "#e50914" 
                              : typeInfo.border
                          }`,
                          color: isOccupied 
                            ? "rgba(255,255,255,0.15)" 
                            : isSelected 
                            ? "#fff" 
                            : typeInfo.color,
                          cursor: isOccupied ? "not-allowed" : "pointer",
                          fontSize: 10,
                          fontWeight: 600,
                        }}
                      >
                        {isOccupied ? "×" : colIdx + 1}
                      </button>
                    </div>
                  );
                })}
                
                {/* Row label bên phải */}
                <span className="text-zinc-600 text-xs w-4 flex-shrink-0 font-medium">
                  {row}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ========== LEGEND (Code 2) ========== */}
        <div className="flex flex-wrap justify-center gap-4 mt-6 mb-6">
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

        {/* ========== BOTTOM BAR (Kết hợp cả 2) ========== */}
        <div
          className="fixed bottom-0 left-0 right-0 border-t border-zinc-800 px-4 py-3"
          style={{ background: "#12121f" }}
        >
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div>
              {picked.length > 0 ? (
                <>
                  <p className="text-white text-sm font-bold">
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
              className="px-6 py-2.5 rounded-xl text-white text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 flex-shrink-0 font-semibold"
              style={{ background: "linear-gradient(135deg, #e50914, #b20710)" }}
            >
              Tiếp tục ({picked.length})
            </button>
          </div>
        </div>
        
        {/* Spacer cho fixed bottom bar */}
        <div className="h-20" />
      </div>
    </div>
  );
};

export default SeatSelectionPage;