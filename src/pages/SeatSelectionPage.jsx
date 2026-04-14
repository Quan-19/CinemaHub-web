import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useBooking } from "../context/BookingContext";
import { calculateShowtimeTotal } from "../utils/showtimePricing";
import axios from "axios";
import { getAuth } from "firebase/auth";

const ROWS = ["A", "B", "C", "D", "E", "F", "G", "H"];
const COLS = 10;
const MAX_SEATS = 8;

const isBlockedShowtimeStatus = (status) => {
  const normalized = String(status ?? "")
    .trim()
    .toLowerCase();
  return normalized === "cancelled" || normalized === "locked";
};

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

// ✅ HÀM RELEASE LOCK CỦA USER HIỆN TẠI
const releaseMyLocks = async (showtimeId) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.log("User not logged in");
      return false;
    }

    const token = await user.getIdToken();

    await axios.post(
      "http://localhost:5000/api/seats/release-my-locks",
      { showtime_id: showtimeId },
      { headers: { Authorization: `Bearer ${token}` } },
    );

    console.log("✅ Released my previous locks");
    return true;
  } catch (error) {
    console.log("No locks to release or error:", error?.response?.data);
    return false;
  }
};

// ✅ HÀM LOCK GHẾ
const lockSelectedSeats = async (seats, showtimeId) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.error("User not logged in");
      return false;
    }

    const token = await user.getIdToken();

    const response = await axios.post(
      "http://localhost:5000/api/seats/lock",
      {
        seats: seats.map((s) => ({ id: s.id, price: s.price })),
        showtime_id: showtimeId,
        user_id: 1,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    console.log("✅ Seats locked:", response.data);
    return true;
  } catch (error) {
    console.error("❌ Failed to lock seats:", error);
    if (error.response?.data?.error) {
      alert(error.response.data.error);
    }
    return false;
  }
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
    []
  );

  // ✅ KHI VÀO TRANG, RELEASE LOCK CỦA USER NÀY
  useEffect(() => {
    const releaseLocksOnEnter = async () => {
      await releaseMyLocks(showtimeId);
      // Sau khi release, fetch lại dữ liệu ghế
      const resSeats = await fetch(
        `http://localhost:5000/api/seats/showtime/${showtimeId}`,
      );
      const seatData = await resSeats.json();
      setOccupiedSeats(new Set(seatData.occupied || []));
    };

    releaseLocksOnEnter();
  }, [showtimeId]);

  // ========== FETCH DATA FROM API ==========
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const resShowtime = await fetch(
          `http://localhost:5000/api/showtimes/${showtimeId}`
        );
        const showtimeData = await resShowtime.json();

        if (isBlockedShowtimeStatus(showtimeData?.status)) {
          throw new Error("Suất chiếu này đang tạm khóa");
        }

        setShowtime(showtimeData);

        const resSeats = await fetch(
          `http://localhost:5000/api/seats/showtime/${showtimeId}`
        );
        const seatData = await resSeats.json();
        console.log("🎯 API Response:", seatData);
        console.log("🎯 Occupied seats:", seatData.occupied);

        if (!isMounted) return;

        setShowtime(showtimeData);
        setOccupiedSeats(new Set(seatData.occupied || []));
        setLoading(false);
      } catch (err) {
        console.error("Error loading seat data:", err);
        if (String(err?.message || "").includes("tạm khóa")) {
          alert("Suất chiếu này đang tạm khóa và không thể đặt vé.");
          navigate(-1);
        }
      } finally {
        setLoading(false);
      }
    };

    if (showtimeId) fetchData();
  }, [showtimeId, navigate]);

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
  const handleContinue = async () => {
    if (picked.length === 0) return;

    const locked = await lockSelectedSeats(picked, showtimeId);

    if (!locked) {
      return;
    }

    setSelectedSeats(picked);

    const showtimeWithId = {
      ...(showtime || selectedShowtime),
      showtime_id: Number(showtimeId),
    };

    navigate("/booking/confirm", {
      state: {
        showtime: showtimeWithId,
        seats: picked,
        movie: movieInfo,
      },
    });
  };

  // ========== CALCULATE TOTAL PRICE ==========
  const total = calculateShowtimeTotal(showtime || selectedShowtime, picked);

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
                        "vi-VN"
                      )
                    : showtimeInfo?.time}{" "}
                  · {cinemaInfo?.name}
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 font-primary">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT: SEAT MAP (lg:col-span-2) */}
          <div className="lg:col-span-2">
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
                    <linearGradient id="screenSpotCustomer" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="currentColor" stopOpacity="0.16" />
                      <stop offset="1" stopColor="currentColor" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M 110 52 Q 300 16 490 52 L 520 110 L 80 110 Z" fill="url(#screenSpotCustomer)" opacity="0.9" />
                  <path d="M 110 52 Q 300 16 490 52" fill="none" stroke="currentColor" strokeWidth="14" strokeLinecap="round" opacity="0.22" filter="url(#screenGlowBlurCustomer)" />
                  <path d="M 110 52 Q 300 16 490 52" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" opacity="0.85" />
                </svg>
                <div className="pt-6 text-[11px] font-semibold tracking-[0.55em] text-zinc-400 uppercase">
                  SCREEN
                </div>
              </div>

              <div className="overflow-x-auto pb-1">
                <div className="mx-auto w-fit">
                  <div className="inline-grid gap-2">
                    {seatRows.map((row) => (
                      <div key={row.label} className="grid grid-cols-[28px_auto_28px] items-center gap-3">
                        <div className="text-center text-[11px] font-semibold text-zinc-400">{row.label}</div>
                        <div className="grid auto-cols-max grid-flow-col gap-2">
                          {row.seats.map((seat) => {
                            const isOccupied = occupiedSeats.has(seat.id);
                            const isSelected = picked.some((s) => s.id === seat.id);
                            
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
                        <div className="text-center text-[11px] font-semibold text-zinc-400">{row.label}</div>
                      </div>
                    ))}
                    
                    <div className="grid grid-cols-[28px_auto_28px] items-center gap-3 pt-2">
                      <div />
                      <div className="grid auto-cols-max grid-flow-col gap-2 text-center text-[11px] font-semibold text-zinc-400">
                        {Array.from({ length: COLS }, (_, i) => (
                          <div key={i + 1} className="w-7">{i + 1}</div>
                        ))}
                      </div>
                      <div />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-700 pt-3">
                <div className="flex flex-wrap items-center gap-5">
                  <SeatLegendItem colorClassName="border-zinc-700 bg-zinc-900/70" label="Đã đặt" />
                  <SeatLegendItem colorClassName="border-red-500 bg-red-500" label="Đang chọn" />
                  <SeatLegendItem colorClassName="border-zinc-700 bg-zinc-800/40" label="Ghế thường" />
                  <SeatLegendItem colorClassName="border-amber-400 bg-amber-500/10" label="Ghế VIP (+30%)" />
                  <SeatLegendItem colorClassName="border-fuchsia-400 bg-fuchsia-500/10" label="Ghế Couple (+50%)" />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: BOOKING INFO (lg:col-span-1) */}
          <div className="lg:col-span-1">
            <div className="bg-[#111116] border border-zinc-800/60 rounded-3xl p-6 shadow-2xl sticky top-24">
              <h2 className="text-white font-bold text-xl mb-6">Thông tin đặt vé</h2>
              
              <div className="flex gap-4 mb-6">
                <div className="w-24 h-36 rounded-2xl overflow-hidden shrink-0 border border-zinc-800">
                  <img src={movieInfo?.poster} alt={movieInfo?.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col justify-center">
                  <h3 className="text-white font-black text-lg leading-tight mb-2 uppercase italic">{movieInfo?.title}</h3>
                  <p className="text-zinc-400 text-sm mb-1">{cinemaInfo?.name}</p>
                  <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">
                    {showtimeInfo?.time || new Date(showtimeInfo?.start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    {" · "}
                    {showtimeInfo?.type || "2D"}
                    {" · "}
                    Phòng {showtimeInfo?.room_name || "P1"}
                  </p>
                </div>
              </div>

              <div className="space-y-4 py-6 border-y border-zinc-800/60">
                <div>
                  <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest mb-2">Ghế đã chọn</p>
                  <p className="text-zinc-100 font-bold text-base min-h-[1.5rem]">
                    {picked.length > 0 ? picked.map(s => s.id).join(", ") : <span className="text-zinc-600 font-medium italic">Chưa chọn ghế</span>}
                  </p>
                </div>
              </div>

              <div className="py-6 flex justify-between items-center">
                <span className="text-white font-bold text-base">Tổng cộng</span>
                <span className="text-red-500 font-black text-2xl">{total.toLocaleString()}đ</span>
              </div>

              <button
                onClick={handleContinue}
                disabled={picked.length === 0}
                className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-white font-bold text-sm transition-all duration-300 shadow-lg ${picked.length > 0 ? 'bg-gradient-to-r from-red-600 to-red-700 hover:scale-[1.02] active:scale-95' : 'bg-zinc-800 cursor-not-allowed opacity-50'}`}
              >
                {picked.length > 0 ? `Tiếp tục (${picked.length} ghế)` : "Chọn ghế để tiếp tục"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionPage;
