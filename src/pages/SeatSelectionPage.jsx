import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
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
    multiplier: 1,
  },
  vip: {
    label: "VIP",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.15)",
    border: "rgba(245,158,11,0.4)",
    multiplier: 1.3,
  },
  couple: {
    label: "Couple",
    color: "#e50914",
    bg: "rgba(229,9,20,0.15)",
    border: "rgba(229,9,20,0.4)",
    multiplier: 1.5,
  },
};

function SeatLegendItem({ colorClassName, label }) {
  return (
    <div className="flex items-center gap-2 text-xs text-zinc-400">
      <span
        className={["h-4 w-4 rounded-[4px] border", colorClassName].join(" ")}
      />
      <span>{label}</span>
    </div>
  );
}

function getSeatType(row) {
  if (row === "G" || row === "H") return "couple";
  if (row === "E" || row === "F") return "vip";
  return "standard";
}

export const SeatSelectionPage = () => {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const { selectedMovie, selectedCinema, selectedShowtime, setSelectedSeats } =
    useBooking();

  // State
  const [showtime, setShowtime] = useState(null);
  const [occupiedSeats, setOccupiedSeats] = useState(new Set());
  const [picked, setPicked] = useState([]);
  const [loading, setLoading] = useState(true);

  const seatRows = useMemo(
    () =>
      ROWS.map((rowLabel) => ({
        label: rowLabel,
        seats: Array.from({ length: COLS }, (_, colIdx) => {
          const id = `${rowLabel}${colIdx + 1}`;
          const type = getSeatType(rowLabel);
          return {
            id,
            label: id,
            type,
            number: colIdx + 1,
          };
        }),
      })),
    [],
  );

  // ========== FETCH DATA FROM API (Code 1) ==========
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch showtime data
        const resShowtime = await fetch(
          `http://localhost:5000/api/showtimes/${showtimeId}`,
        );
        if (!resShowtime.ok) throw new Error("Failed to fetch showtime");
        const showtimeData = await resShowtime.json();
        setShowtime(showtimeData);

        // Fetch occupied seats
        const resSeats = await fetch(
          `http://localhost:5000/api/seats/showtime/${showtimeId}`,
        );
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
        movie: movieInfo,
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
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#0a0a0f" }}
      >
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
      <div
        className="border-b border-zinc-700"
        style={{ background: "#12121f" }}
      >
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
                    ? new Date(showtimeInfo.start_time).toLocaleTimeString(
                        "vi-VN",
                      )
                    : showtimeInfo?.time}{" "}
                  · {cinemaInfo?.name}
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
                          : "bg-zinc-800 text-zinc-400"
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
        <div className="rounded-2xl border border-zinc-700 bg-zinc-950/20 p-4 sm:p-5">
          <div className="relative mb-6 flex items-center justify-center">
            <svg
              className="pointer-events-none absolute inset-x-0 top-0 h-14 w-full text-cyan-400"
              viewBox="0 0 600 80"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <filter
                  id="screenGlowBlurCustomer"
                  x="-30%"
                  y="-80%"
                  width="160%"
                  height="260%"
                >
                  <feGaussianBlur stdDeviation="7" />
                </filter>
                <linearGradient
                  id="screenSpotCustomer"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0"
                    stopColor="currentColor"
                    stopOpacity="0.16"
                  />
                  <stop offset="1" stopColor="currentColor" stopOpacity="0" />
                </linearGradient>
              </defs>

              <path
                d="M 110 52 Q 300 16 490 52 L 520 110 L 80 110 Z"
                fill="url(#screenSpotCustomer)"
                opacity="0.9"
              />
              <path
                d="M 110 52 Q 300 16 490 52"
                fill="none"
                stroke="currentColor"
                strokeWidth="14"
                strokeLinecap="round"
                opacity="0.22"
                filter="url(#screenGlowBlurCustomer)"
              />
              <path
                d="M 110 52 Q 300 16 490 52"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.75"
                strokeLinecap="round"
                opacity="0.85"
              />
            </svg>
            <div className="pt-6 text-[11px] font-semibold tracking-[0.55em] text-zinc-400">
              SCREEN
            </div>
          </div>

          <div className="overflow-x-auto pb-1">
            <div className="mx-auto w-fit">
              <div className="inline-grid gap-2">
                {seatRows.map((row) => (
                  <div
                    key={row.label}
                    className="grid grid-cols-[28px_auto_28px] items-center gap-3"
                  >
                    <div className="text-center text-[11px] font-semibold text-zinc-400">
                      {row.label}
                    </div>

                    <div className="grid auto-cols-max grid-flow-col gap-2">
                      {row.seats.map((seat) => {
                        const isOccupied = occupiedSeats.has(seat.id);
                        const isSelected = picked.some((s) => s.id === seat.id);
                        const typeInfo = SEAT_TYPES[seat.type];

                        const className = isOccupied
                          ? "border-zinc-700 bg-zinc-900/70 text-zinc-700 cursor-not-allowed"
                          : isSelected
                            ? "border-red-500 bg-red-500 text-white"
                            : seat.type === "vip"
                              ? "border-amber-400 bg-amber-500/10 text-amber-300"
                              : seat.type === "couple"
                                ? "border-fuchsia-400 bg-fuchsia-500/10 text-fuchsia-300"
                                : "border-zinc-700 bg-zinc-800/40 text-zinc-300";

                        return (
                          <button
                            key={seat.id}
                            type="button"
                            onClick={() => toggleSeat(seat.id, seat.type)}
                            disabled={isOccupied}
                            title={
                              isOccupied
                                ? `${seat.label} (Đã đặt)`
                                : `${seat.label} - ${typeInfo.label}`
                            }
                            className={[
                              "h-7 w-7 rounded-[6px] border text-[10px] font-semibold transition-all",
                              isOccupied ? "" : "hover:scale-105",
                              className,
                            ].join(" ")}
                          >
                            {isOccupied ? "×" : seat.number}
                          </button>
                        );
                      })}
                    </div>

                    <div className="text-center text-[11px] font-semibold text-zinc-400">
                      {row.label}
                    </div>
                  </div>
                ))}

                <div className="grid grid-cols-[28px_auto_28px] items-center gap-3 pt-2">
                  <div />
                  <div className="grid auto-cols-max grid-flow-col gap-2 text-center text-[11px] font-semibold text-zinc-400">
                    {Array.from({ length: COLS }, (_, i) => (
                      <div key={i + 1} className="w-7">
                        {i + 1}
                      </div>
                    ))}
                  </div>
                  <div />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-700 pt-3">
            <div className="flex flex-wrap items-center gap-5">
              <SeatLegendItem
                colorClassName="border-zinc-700 bg-zinc-900/70"
                label="Đã đặt"
              />
              <SeatLegendItem
                colorClassName="border-red-500 bg-red-500"
                label="Đang chọn"
              />
              <SeatLegendItem
                colorClassName="border-zinc-700 bg-zinc-800/40"
                label="Ghế thường"
              />
              <SeatLegendItem
                colorClassName="border-amber-400 bg-amber-500/10"
                label="Ghế VIP (+30%)"
              />
              <SeatLegendItem
                colorClassName="border-fuchsia-400 bg-fuchsia-500/10"
                label="Ghế Couple (+50%)"
              />
            </div>
          </div>
        </div>

        {/* ========== BOTTOM BAR (Kết hợp cả 2) ========== */}
        <div
          className="fixed bottom-0 left-0 right-0 border-t border-zinc-700 px-4 py-3"
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
                <p className="text-zinc-400 text-sm">Chưa chọn ghế nào</p>
              )}
            </div>

            <button
              onClick={handleContinue}
              disabled={picked.length === 0}
              className="px-6 py-2.5 rounded-xl text-white text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 flex-shrink-0 font-semibold"
              style={{
                background: "linear-gradient(135deg, #e50914, #b20710)",
              }}
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
