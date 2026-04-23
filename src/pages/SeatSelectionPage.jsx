import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useBlocker } from "react-router-dom";
import { ChevronLeft, Ticket } from "lucide-react";
import { useBooking } from "../context/BookingContext";
import { calculateShowtimeTotal } from "../utils/showtimePricing";
import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";

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

export const SeatSelectionPage = () => {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const { 
    selectedMovie, 
    selectedCinema, 
    selectedShowtime, 
    setSelectedSeats,
    setSelectedShowtime,
    setSelectedMovie,
    setSelectedCinema 
  } = useBooking();

  // State
  const [showtime, setShowtime] = useState(null);
  const [occupiedSeats, setOccupiedSeats] = useState(new Set());
  const [picked, setPicked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roomLayout, setRoomLayout] = useState(null);
  const [maintenanceSeats, setMaintenanceSeats] = useState(new Set());
  const [currentUser, setCurrentUser] = useState(null);
  const [showLoginAlert, setShowLoginAlert] = useState(false);

  // ✅ THEO DÕI TRẠNG THÁI ĐĂNG NHẬP
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("👤 User recognized:", user.email);
        setCurrentUser(user);
      } else {
        console.log("👤 User is guest");
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // ✅ CẢNH BÁO KHI THOÁT TRANG (Dùng useBlocker cho nút Back/Chuyển hướng)
  const blocker = useBlocker(({ nextLocation }) => {
    // Chỉ chặn nếu đang có ghế được chọn VÀ không phải là đi tới trang Confirm
    return picked.length > 0 && !nextLocation.pathname.includes("/confirm");
  });

  // Hủy block khi đóng tab/reload được xử lý riêng qua beforeunload
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (picked.length > 0) {
        e.preventDefault();
        e.returnValue = ""; 
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [picked.length]);

  const seatRows = useMemo(() => {
    if (!roomLayout) return [];
    
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const vipSet = new Set(roomLayout.vipRows || []);
    const data = [];
    
    for (let r = 1; r <= roomLayout.rows; r += 1) {
      const rowLabel = letters[r - 1] ?? String(r);
      const isCoupleRow = roomLayout.coupleRow === r;
      const seats = [];
      const seatsPerRow = roomLayout.cols;

      if (isCoupleRow) {
        const coupleSeatsCount = Math.ceil(seatsPerRow / 2);
        for (let c = 1; c <= coupleSeatsCount; c += 1) {
          seats.push({
            id: `${rowLabel}${c}`,
            label: `${rowLabel}${c}`,
            type: "couple",
            number: c,
            isCouple: true,
            seatsCount: 2,
          });
        }
      } else {
        for (let c = 1; c <= seatsPerRow; c += 1) {
          const type = vipSet.has(r) ? "vip" : "standard";
          seats.push({
            id: `${rowLabel}${c}`,
            label: `${rowLabel}${c}`,
            type,
            number: c,
            isCouple: false,
            seatsCount: 1,
          });
        }
      }
      data.push({ label: rowLabel, isCoupleRow, seats });
    }
    return data;
  }, [roomLayout]);

  // ✅ KHI VÀO TRANG HOẶC KHI USER THAY ĐỔI, FETCH DỮ LIỆU GHẾ
  useEffect(() => {
    if (!showtimeId) return;

    const fetchOccupiedSeats = async () => {
      try {
        let headers = {};
        if (currentUser) {
          const token = await currentUser.getIdToken();
          headers = { Authorization: `Bearer ${token}` };
        }

        const resSeats = await fetch(
          `http://localhost:5000/api/seats/showtime/${showtimeId}`,
          { headers }
        );
        const seatData = await resSeats.json();
        
        const occupiedList = seatData.occupied || [];
        const othersLocked = new Set();
        const myLockedMap = new Map(); // Dùng Map để lọc trùng ID

        occupiedList.forEach(s => {
          const label = `${s.seat_row}${s.seat_number}`;
          if (s.isMine) {
            myLockedMap.set(label, { id: label }); 
          } else {
            othersLocked.add(label);
          }
        });

        const myLocked = Array.from(myLockedMap.values());
        console.log("🎯 Occupied Data:", { total: occupiedList.length, mine: myLocked.length });
        setOccupiedSeats(othersLocked);
        
        // Luôn cập nhật picked nếu có ghế của mình và picked đang trống
        if (myLocked.length > 0 && picked.length === 0) {
          console.log("♻️ Auto-recovering seats:", myLocked);
          setPicked(myLocked);
        }

        // Cập nhật timer dựa trên bất kỳ ghế nào của mình (kể cả khi picked đã có dữ liệu)
        const mySeatsData = occupiedList.filter(s => s.isMine);
        if (mySeatsData.length > 0) {
          const expiryTime = new Date(mySeatsData[0].lock_expiry).getTime();
          const newRemaining = Math.max(0, Math.floor((expiryTime - Date.now()) / 1000));
          console.log("⏱️ Timer updated:", newRemaining, "s");
          setRemainingTime(newRemaining);
        } else {
          setRemainingTime(null);
        }
      } catch (err) {
        console.error("Error fetching seats:", err);
      }
    };

    fetchOccupiedSeats();
  }, [showtimeId, currentUser]); // picked.length được loại ra để tránh loop, nhưng check logic bên trong

  // ========== TIMER LOGIC ==========
  const [remainingTime, setRemainingTime] = useState(null);

  useEffect(() => {
    if (remainingTime === null || remainingTime <= 0) return;

    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingTime]);

  const formatTime = (seconds) => {
    if (seconds === null) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // ========== FETCH MAIN SHOWTIME & ROOM DATA ==========
  useEffect(() => {
    let isMounted = true;
    if (!showtimeId) return;

    const fetchMainData = async () => {
      try {
        const resShowtime = await fetch(
          `http://localhost:5000/api/showtimes/${showtimeId}`
        );
        const showtimeData = await resShowtime.json();

        if (isBlockedShowtimeStatus(showtimeData?.status)) {
          throw new Error("Suất chiếu này đang tạm khóa");
        }

        if (!isMounted) return;
        
        setShowtime(showtimeData);
        setSelectedShowtime(showtimeData);
        
        // Cập nhật movie và cinema vào context nếu chưa có
        if (showtimeData.movie) setSelectedMovie(showtimeData.movie);
        if (showtimeData.cinema) setSelectedCinema(showtimeData.cinema);

        if (showtimeData?.roomId) {
          try {
            const resRoom = await fetch(`http://localhost:5000/api/rooms/${showtimeData.roomId}`);
            const roomData = await resRoom.json();
            
            let vipRowsParsed = [];
            let maintenanceParsed = [];
            try {
              if (roomData.vip_rows) {
                 vipRowsParsed = typeof roomData.vip_rows === 'string' ? JSON.parse(roomData.vip_rows) : roomData.vip_rows;
              }
              if (roomData.maintenance_seats) {
                maintenanceParsed = typeof roomData.maintenance_seats === 'string' ? JSON.parse(roomData.maintenance_seats) : roomData.maintenance_seats;
              }
            } catch (e) { console.error(e); }
            
            setMaintenanceSeats(new Set(maintenanceParsed || []));
            setRoomLayout({
              rows: roomData.seat_rows,
              cols: roomData.seat_cols,
              vipRows: vipRowsParsed,
              coupleRow: roomData.couple_row
            });
          } catch(err){ 
            console.error("Error loading room map", err); 
          }
        }
        setLoading(false);
      } catch (err) {
        console.error("Error loading main data:", err);
        if (String(err?.message || "").includes("tạm khóa")) {
          alert("Suất chiếu này đang tạm khóa.");
          navigate(-1);
        }
      }
    };

    fetchMainData();
    return () => { isMounted = false; };
  }, [showtimeId, navigate, setSelectedCinema, setSelectedMovie, setSelectedShowtime]); 

  // ========== TOGGLE SEAT ==========
  const toggleSeat = async (id, type) => {
    // 🔐 KIỂM TRA ĐĂNG NHẬP TRƯỚC KHI CHO PHÉP CHỌN GHẾ
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      // Hiển thị thông báo đăng nhập
      setShowLoginAlert(true);
      setTimeout(() => {
        setShowLoginAlert(false);
        // Chuyển hướng về trang chủ sau 2 giây
        navigate("/");
      }, 2000);
      return;
    }

    if (occupiedSeats.has(id) || maintenanceSeats.has(id)) return;

    const isSelected = picked.find((s) => s.id === id);

    if (isSelected) {
      // 🚀 NẾU BỎ CHỌN: Gọi API giải phóng ghế ở DB ngay lập tức
      try {
        const token = await user.getIdToken();
        await axios.post(
          "http://localhost:5000/api/seats/release-my-locks",
          { showtime_id: showtimeId, seat_label: id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(`✅ Released seat ${id} from DB`);
      } catch (err) {
        console.error("Error releasing single seat:", err);
      }
      setPicked((prev) => prev.filter((s) => s.id !== id));
    } else {
      // CHỌN MỚI
      if (picked.length >= MAX_SEATS) {
        alert("Bạn chỉ có thể chọn tối đa 8 ghế");
        return;
      }
      setPicked((prev) => [...prev, { id, type }]);
    }
  };

  // ========== HANDLE CONTINUE ==========
  const handleContinue = async () => {
    if (picked.length === 0) return;

    // Kiểm tra lại đăng nhập trước khi lock ghế
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      setShowLoginAlert(true);
      setTimeout(() => {
        setShowLoginAlert(false);
        navigate("/");
      }, 2000);
      return;
    }

    const locked = await lockSelectedSeats(picked, showtimeId);

    if (!locked) {
      return;
    }

    // Refresh lại ghế để cập nhật bộ đếm thời gian mới nhất từ Backend (10 phút mới)
    const fetchFreshSeats = async () => {
      try {
        const token = await currentUser?.getIdToken();
        const res = await fetch(`http://localhost:5000/api/seats/showtime/${showtimeId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const data = await res.json();
        const mySeats = (data.occupied || []).filter(s => s.isMine);
        if (mySeats.length > 0) {
          const expiryTime = new Date(mySeats[0].lock_expiry).getTime();
          setRemainingTime(Math.max(0, Math.floor((expiryTime - Date.now()) / 1000)));
        }
      } catch (e) {
        console.error("Error refreshing timer after lock:", e);
      }
    };
    await fetchFreshSeats();

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
        style={{ background: "var(--color-cinema-bg)" }}
      >
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Đang tải sơ đồ ghế...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--color-cinema-bg)" }}>
      <div
        className="border-b border-zinc-700"
        style={{ background: "var(--color-cinema-surface)" }}
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
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${s.done
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
                    {seatRows.map((row) => {
                      const isCoupleRow = row.isCoupleRow;
                      const standardWidth = (roomLayout?.cols || 10) * (28 + 8);
                      const coupleWidth = row.seats.length * (56 + 8);
                      const diff = standardWidth - coupleWidth;
                      const leftPadding = isCoupleRow ? diff / 2 : 0;
                      const rightPadding = isCoupleRow ? diff / 2 : 0;

                      return (
                        <div key={row.label} className="grid grid-cols-[28px_auto_28px] items-center gap-3">
                          <div className="text-center text-[11px] font-semibold text-zinc-400">{row.label}</div>
                          <div className="flex justify-center">
                            <div 
                              className="grid auto-cols-max grid-flow-col gap-2"
                              style={{
                                paddingLeft: leftPadding > 0 ? `${leftPadding}px` : 0,
                                paddingRight: rightPadding > 0 ? `${rightPadding}px` : 0,
                              }}
                            >
                              {row.seats.map((seat) => {
                                const isOccupied = occupiedSeats.has(seat.id);
                                const isMaintenance = maintenanceSeats.has(seat.id);
                                const isSelected = picked.some((s) => s.id === seat.id);

                                const className = isMaintenance
                                  ? "border-red-500 bg-red-500/25 text-red-500 cursor-not-allowed"
                                  : isOccupied
                                  ? "border-transparent bg-zinc-900/80 text-zinc-700 cursor-not-allowed"
                                  : isSelected
                                    ? "border-green-500 bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)] scale-105 z-10"
                                    : seat.type === "vip"
                                      ? "border-amber-500/40 bg-amber-500/5 text-amber-400 hover:border-amber-400/70 hover:bg-amber-500/10"
                                      : seat.type === "couple"
                                        ? "border-rose-500/40 bg-rose-500/5 text-rose-400 hover:border-rose-400/70 hover:bg-rose-500/10"
                                        : "border-zinc-700 bg-zinc-800/20 text-zinc-400 hover:border-zinc-500 hover:bg-zinc-700/30";
                                        
                                const base = seat.isCouple 
                                  ? "h-7 w-14 rounded-lg border-2 flex items-center justify-center gap-1 text-[10px] font-bold transition-all duration-200"
                                  : "h-7 w-7 rounded-lg border-2 text-[10px] flex items-center justify-center font-bold transition-all duration-200";

                                const isDisabled = isOccupied || isMaintenance;

                                return (
                                  <button
                                    key={seat.id}
                                    type="button"
                                    onClick={() => toggleSeat(seat.id, seat.type)}
                                    disabled={isDisabled}
                                    className={[
                                      base,
                                      isDisabled ? "" : "hover:scale-105",
                                      className,
                                    ].join(" ")}
                                  >
                                    {isMaintenance ? (seat.isCouple ? "🛠️" : "X") : isOccupied ? "×" : seat.isCouple ? (
                                      <>
                                        <span className="text-[10px]">👥</span>
                                        <span>{seat.number}</span>
                                      </>
                                    ) : (
                                      seat.number
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                          <div className="text-center text-[11px] font-semibold text-zinc-400">{row.label}</div>
                        </div>
                      );
                    })}

                    <div className="grid grid-cols-[28px_auto_28px] items-center gap-3 pt-2">
                      <div />
                      <div className="flex justify-center">
                        <div className="grid auto-cols-max grid-flow-col gap-2 text-center text-[11px] font-semibold text-zinc-400">
                          {seatRows[0]?.isCoupleRow
                            ? (() => {
                                const firstRow = seatRows[0];
                                const standardWidth = (roomLayout?.cols || 10) * (28 + 8);
                                const coupleWidth = firstRow.seats.length * (56 + 8);
                                const diff = standardWidth - coupleWidth;
                                const leftPadding = diff / 2;
                                
                                return (
                                  <div
                                    className="grid auto-cols-max grid-flow-col gap-2"
                                    style={{
                                      paddingLeft: leftPadding > 0 ? `${leftPadding}px` : 0,
                                      paddingRight: leftPadding > 0 ? `${leftPadding}px` : 0,
                                    }}
                                  >
                                    {Array.from({ length: firstRow.seats.length }, (_, i) => (
                                      <div key={i + 1} className="w-14 text-center">
                                        {i + 1}
                                      </div>
                                    ))}
                                  </div>
                                );
                              })()
                            : Array.from({ length: roomLayout?.cols || 10 }, (_, i) => (
                                <div key={i + 1} className="w-7 text-center">
                                  {i + 1}
                                </div>
                              ))}
                        </div>
                      </div>
                      <div />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-700 pt-3">
                <div className="flex flex-wrap items-center gap-5">
                  <SeatLegendItem colorClassName="border-transparent bg-zinc-900/80" label="Đã đặt" />
                  <SeatLegendItem colorClassName="border-green-500 bg-green-500" label="Đang chọn" />
                  <SeatLegendItem colorClassName="border-zinc-700 bg-zinc-800/20" label="Thường" />
                  <SeatLegendItem colorClassName="border-amber-500/40 bg-amber-500/5" label="VIP (+30%)" />
                  <SeatLegendItem colorClassName="border-rose-500/40 bg-rose-500/5" label="Couple (+50%)" />
                  <SeatLegendItem colorClassName="border-red-500 bg-red-500/25" label="Bảo trì" />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: BOOKING INFO (lg:col-span-1) */}
          <div className="lg:col-span-1">
            <div className="bg-[#111116] border border-zinc-800/60 rounded-3xl p-6 shadow-2xl sticky top-24">
              <h2 className="text-white font-bold text-xl mb-6">Thông tin đặt vé</h2>

              <div className="flex gap-4 mb-6">
                <div className="w-24 h-32 rounded-2xl overflow-hidden shrink-0 border-2 border-zinc-800 shadow-lg">
                  <img src={movieInfo?.poster} alt={movieInfo?.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col justify-center gap-1.5">
                  <h3 className="text-white font-bold text-xl leading-tight tracking-tight">{movieInfo?.title}</h3>
                  <div>
                    <p className="text-zinc-400 text-sm font-medium">{cinemaInfo?.name}</p>
                    <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-wider mt-0.5">
                      {showtimeInfo?.time || new Date(showtimeInfo?.start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      {" · "}
                      {showtimeInfo?.type || "2D"}
                      {" · "}
                      Phòng {showtimeInfo?.room_name || "P1"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 py-6 border-t border-zinc-800/60">

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Ghế đã chọn</p>
                    <span className="text-zinc-500 text-[10px] font-bold">{picked.length}/8</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 min-h-[2rem]">
                    {picked.length > 0 ? (
                      picked.map(s => (
                        <span key={s.id} className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border-2 ${
                          s.type === 'vip' ? 'border-amber-500/30 bg-amber-500/10 text-amber-400' :
                          s.type === 'couple' ? 'border-rose-500/30 bg-rose-500/10 text-rose-400' :
                          'border-zinc-700 bg-zinc-800/50 text-zinc-100'
                        }`}>
                          {s.id}
                        </span>
                      ))
                    ) : (
                      <span className="text-zinc-600 font-medium italic text-xs">Vui lòng chọn ghế</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="py-6 flex justify-between items-center border-t border-zinc-800/60">
                <span className="text-zinc-500 font-bold text-sm">Tổng tiền</span>
                <div className="text-right">
                  <span className="text-red-500 font-black text-2xl tracking-tighter shadow-red-500/10">
                    {Math.round(Number(total || 0)).toLocaleString("vi-VN")}
                    <span className="text-sm ml-0.5">đ</span>
                  </span>
                </div>
              </div>

              <button
                onClick={handleContinue}
                disabled={picked.length === 0}
                className={`w-full py-3.5 rounded-2xl flex items-center justify-center gap-2.5 text-white font-bold text-sm transition-all duration-300 shadow-xl group ${picked.length > 0
                  ? 'bg-gradient-to-r from-red-500 via-red-600 to-rose-600 hover:shadow-red-600/40 hover:-translate-y-0.5 active:translate-y-0'
                  : 'bg-zinc-800/50 text-zinc-600 cursor-not-allowed border border-zinc-700/50'
                  }`}
              >
                <Ticket size={14} className={`${remainingTime !== null && remainingTime < 60 ? "text-white animate-bounce" : "text-red-500"} group-hover:scale-110 transition-transform`} />
                {picked.length > 0 
                  ? `Tiếp tục (${picked.length} ghế) ${remainingTime !== null ? `- ${formatTime(remainingTime)}` : ""}` 
                  : "Chọn ghế để tiếp tục"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ CUSTOM NAVIGATION GUARD MODAL */}
      <AnimatePresence>
        {blocker.state === "blocked" && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => blocker.reset()}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm overflow-hidden"
              style={{
                background: "var(--color-cinema-surface)",
                border: "1px solid rgba(229, 9, 20, 0.3)",
                borderRadius: "28px",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
              }}
            >
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-5 border border-red-500/20">
                  <AlertCircle size={32} className="text-red-500" />
                </div>
                
                <h3 className="text-white text-xl font-bold mb-3 tracking-tight">Chưa hoàn tất giao dịch!</h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                  Bạn đang có ghế được giữ chỗ. Nếu thoát ra, các ghế này sẽ bị hủy. Bạn có muốn tiếp tục thanh toán không?
                </p>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => blocker.reset()}
                    className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-all active:scale-[0.98]"
                  >
                    Tiếp tục thanh toán
                  </button>
                  <button
                    onClick={() => blocker.proceed()}
                    className="w-full py-3.5 rounded-2xl bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 font-semibold text-sm transition-all"
                  >
                    Thoát
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ✅ LOGIN ALERT MODAL */}
      <AnimatePresence>
        {showLoginAlert && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm overflow-hidden"
              style={{
                background: "var(--color-cinema-surface)",
                border: "1px solid rgba(229, 9, 20, 0.3)",
                borderRadius: "28px",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
              }}
            >
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-5 border border-yellow-500/20">
                  <AlertCircle size={32} className="text-yellow-500" />
                </div>
                
                <h3 className="text-white text-xl font-bold mb-3 tracking-tight">Yêu cầu đăng nhập</h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                  Vui lòng đăng nhập để chọn ghế và đặt vé.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SeatSelectionPage;