import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ChevronLeft,
  Check,
  CreditCard,
  Ticket,
  Plus,
  Minus,
  Tag,
  Shield,
  MapPin,
  Calendar,
  Clock,
  Film,
  Armchair,
  CheckCircle,
  Sparkles,
  QrCode,
  X,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";

// Constants từ Code 2
const PAYMENT_METHODS = [
  { id: "momo", label: "Ví MoMo", icon: "💜", desc: "Thanh toán qua ví MoMo" },
  { id: "vnpay", label: "VNPay QR", icon: "🔵", desc: "Quét mã QR VNPay" },
  { id: "card", label: "Thẻ tín dụng", icon: "💳", desc: "Visa / Mastercard / JCB" },
  { id: "zalopay", label: "ZaloPay", icon: "🟢", desc: "Thanh toán qua ZaloPay" },
];

const PROMO_PERCENT_BY_CODE = {
  WED30: 0.3,
  CGV10YEARS: 0.1,
  COUPLE2026: 0.25,
  CINE10: 0.1,
  SPRING2026: 0.2,
};

// Confetti component từ Code 2
const Confetti = () => {
  const pieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: ["#e50914", "#f59e0b", "#22c55e", "#3b82f6", "#8b5cf6"][i % 5],
    delay: Math.random() * 0.8,
    size: 4 + Math.random() * 6,
    duration: 1.5 + Math.random() * 1.5,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: -20, x: `${p.x}vw`, opacity: 1, rotate: 0 }}
          animate={{ y: "110vh", opacity: 0, rotate: 720 }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
          style={{
            position: "absolute",
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: "2px",
          }}
        />
      ))}
    </div>
  );
};

export default function BookingConfirmationPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  // ========== DATA TỪ CODE 1 ==========
  const showtime = state?.showtime;
  const seats = state?.seats || [];
  const movie = state?.movie;

  // ========== STATE ==========
  const [foods, setFoods] = useState([]);
  const [comboCounts, setComboCounts] = useState({});
  const [paying, setPaying] = useState(false);
  const [step, setStep] = useState("confirm");
  const [paymentMethod, setPaymentMethod] = useState("momo");
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoPercent, setPromoPercent] = useState(0);
  const [promoError, setPromoError] = useState("");
  const [bookingCode, setBookingCode] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  // ========== EFFECTS TỪ CODE 1 ==========
  // Kiểm tra dữ liệu
  useEffect(() => {
    if (!showtime || seats.length === 0) {
      navigate("/movies");
    }
  }, [showtime, seats, navigate]);

  // Load foods từ API (Code 1)
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
      .catch((err) => console.error("Lỗi load foods:", err));
  }, []);

  // ========== TÍNH TOÁN GIÁ (Kết hợp) ==========
  const ticketTotal = seats.reduce((sum, seat) => {
    const basePrice = showtime?.base_price || 0;
    const multiplier = seat.type === "vip" ? 1.3 : seat.type === "couple" ? 1.5 : 1;
    return sum + basePrice * multiplier;
  }, 0);

  const comboTotal = foods.reduce((sum, f) => {
    return sum + f.price * (comboCounts[f.food_id] || 0);
  }, 0);

  const discount = promoApplied ? Math.round(ticketTotal * promoPercent) : 0;
  const grandTotal = ticketTotal + comboTotal - discount;

  // ========== HANDLERS ==========
  const updateCombo = (id, change) => {
    setComboCounts((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + change),
    }));
  };

  const handleApplyPromo = () => {
    const normalizedCode = promoCode.trim().toUpperCase();
    const percent = PROMO_PERCENT_BY_CODE[normalizedCode];

    if (percent) {
      setPromoApplied(true);
      setPromoPercent(percent);
      setPromoError("");
    } else {
      setPromoError("Mã khuyến mãi không hợp lệ hoặc đã hết hạn");
      setPromoApplied(false);
      setPromoPercent(0);
    }
  };

  // ========== THANH TOÁN (Kết hợp Code 1 + Code 2) ==========
  const handleConfirm = async () => {
    setPaying(true);

    try {
      // Gọi API từ Code 1
      const response = await axios.post("http://localhost:5000/api/bookings", {
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
        payment_method: paymentMethod,
        promo_code: promoApplied ? promoCode : null,
      });

      // Tạo mã vé từ response hoặc tự sinh (Code 2)
      const ticketCode = response.data?.bookingCode || `CS${Date.now().toString().slice(-8)}`;
      setBookingCode(ticketCode);

      // Lưu ticket vào localStorage (Code 2)
      const ticketData = {
        bookingCode: ticketCode,
        movieTitle: movie.title,
        movieOriginalTitle: movie.originalTitle,
        moviePoster: movie.poster,
        movieRating: movie.rating,
        movieDuration: movie.duration,
        cinemaName: showtime.cinema_name || "CGV Cinemas",
        cinemaAddress: showtime.cinema_address || "Quận 1, TP.HCM",
        roomId: showtime.room_id,
        showtimeType: showtime.type || "2D",
        date: new Date(showtime.start_time).toLocaleDateString("vi-VN"),
        time: new Date(showtime.start_time).toLocaleTimeString("vi-VN"),
        seats: seats.map((s) => ({ id: s.id, type: s.type || "standard" })),
        grandTotal,
        paymentMethod,
        issuedAt: new Date().toLocaleString("vi-VN"),
      };
      localStorage.setItem(`ticket_${ticketCode}`, JSON.stringify(ticketData));

      setStep("success");
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    } catch (err) {
      console.error("Thanh toán thất bại:", err);
      alert("Thanh toán thất bại. Vui lòng thử lại.");
    }

    setPaying(false);
  };

  // Kiểm tra dữ liệu
  if (!showtime || !movie) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0f" }}>
        <div className="text-center">
          <p className="text-zinc-400 mb-4">Không có thông tin đặt vé</p>
          <button onClick={() => navigate("/movies")} className="text-red-500 hover:underline">
            Quay lại trang phim
          </button>
        </div>
      </div>
    );
  }

  // ========== SUCCESS STATE (Code 2) ==========
  if (step === "success") {
    const ticketUrl = `${window.location.origin}/ticket/${bookingCode}`;
    
    return (
      <div className="min-h-screen pt-16" style={{ background: "#0a0a0f" }}>
        {showConfetti && <Confetti />}
        
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {/* Success Banner */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-6 mb-6 text-center relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #0d2a0d, #0a1a0a)",
              border: "1px solid rgba(34,197,94,0.3)",
            }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "linear-gradient(135deg, #166534, #22c55e)" }}
            >
              <Check className="w-10 h-10 text-white" strokeWidth={3} />
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <div className="flex items-center justify-center gap-2 mb-1">
                <Sparkles size={18} style={{ color: "#f59e0b" }} />
                <h2 className="text-white text-xl font-bold">Thanh toán thành công!</h2>
                <Sparkles size={18} style={{ color: "#f59e0b" }} />
              </div>
              <p className="text-green-400 text-sm">Vé của bạn đã được xác nhận và sẵn sàng sử dụng</p>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left - Ticket Info */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <div className="rounded-2xl p-5 mb-4" style={{ background: "#12121f", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center gap-2 mb-4">
                  <Ticket size={15} style={{ color: "#e50914" }} />
                  <h3 className="text-white font-bold text-sm">Thông tin vé</h3>
                </div>
                
                <div className="flex gap-3 mb-4">
                  {movie.poster && (
                    <img src={movie.poster} alt={movie.title} className="w-16 h-22 object-cover rounded-xl" />
                  )}
                  <div className="flex-1">
                    <div className="text-white font-bold text-sm">{movie.title}</div>
                    <div className="flex gap-1.5 mt-1.5">
                      <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-red-500/20 text-red-400">
                        {movie.rating || "P"}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2.5">
                  {[
                    { icon: MapPin, label: "Rạp", value: showtime.cinema_name || "CGV" },
                    { icon: Calendar, label: "Ngày", value: new Date(showtime.start_time).toLocaleDateString("vi-VN") },
                    { icon: Clock, label: "Giờ chiếu", value: new Date(showtime.start_time).toLocaleTimeString("vi-VN") },
                    { icon: Film, label: "Phòng", value: showtime.room_id || "1" },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center gap-2.5">
                      <row.icon size={12} style={{ color: "#e50914", opacity: 0.8 }} />
                      <span className="text-zinc-400 text-xs min-w-[64px]">{row.label}</span>
                      <span className="text-white text-xs font-semibold">{row.value}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Armchair size={12} style={{ color: "rgba(255,255,255,0.4)" }} />
                    <span className="text-xs text-white/40">Ghế đã đặt</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {seats.map((seat) => (
                      <span key={seat.id} className="px-2 py-1 rounded-lg text-xs font-bold bg-white/10 text-white">
                        {seat.id}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="rounded-2xl p-5" style={{ background: "#12121f", border: "1px solid rgba(255,255,255,0.07)" }}>
                <h3 className="text-white font-bold text-sm mb-3">Chi tiết thanh toán</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-zinc-400">
                    <span>{seats.length} vé xem phim</span>
                    <span>{ticketTotal.toLocaleString()}₫</span>
                  </div>
                  {comboTotal > 0 && (
                    <div className="flex justify-between text-zinc-400">
                      <span>Combo bắp nước</span>
                      <span>{comboTotal.toLocaleString()}₫</span>
                    </div>
                  )}
                  {discount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Giảm giá (KM)</span>
                      <span>-{discount.toLocaleString()}₫</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-white/10">
                    <span className="text-white font-bold">Tổng thanh toán</span>
                    <span className="text-orange-400 font-bold text-base">{grandTotal.toLocaleString()}₫</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <button onClick={() => navigate("/")} className="flex-1 py-3 rounded-xl text-sm bg-white/10 hover:bg-white/20 transition">
                  Về trang chủ
                </button>
                <button onClick={() => navigate("/movies")} className="flex-1 py-3 rounded-xl text-sm bg-red-600 hover:bg-red-700 transition">
                  Đặt vé khác
                </button>
              </div>
            </motion.div>
            
            {/* Right - QR Code */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
              <div className="rounded-2xl p-5 text-center" style={{ background: "#12121f", border: "1px solid rgba(255,255,255,0.07)" }}>
                <p className="text-zinc-400 text-xs mb-1 uppercase tracking-widest">Mã đặt vé</p>
                <div className="text-white text-3xl tracking-wider mb-1 font-mono font-black">{bookingCode}</div>
                <div className="flex items-center justify-center gap-1.5">
                  <CheckCircle size={13} style={{ color: "#22c55e" }} />
                  <span className="text-green-400 text-xs">Đã xác nhận</span>
                </div>
              </div>
              
              <div className="rounded-2xl mt-4 overflow-hidden" style={{ background: "#12121f", border: "1px solid rgba(229,9,20,0.25)" }}>
                <div className="px-5 py-3 flex items-center gap-2 bg-gradient-to-r from-red-500/15 to-red-500/05 border-b border-red-500/15">
                  <QrCode size={16} style={{ color: "#e50914" }} />
                  <span className="text-white text-sm font-bold">Vé điện tử (E-Ticket)</span>
                </div>
                <div className="p-5 flex flex-col items-center">
                  <div className="p-3 rounded-2xl mb-3 bg-white">
                    <QRCodeSVG value={ticketUrl} size={160} bgColor="#ffffff" fgColor="#07070f" level="H" />
                  </div>
                  <p className="text-center text-zinc-400 text-xs mb-4">
                    📱 Quét mã QR để xem vé điện tử<br />
                    Xuất trình tại cổng soát vé khi check-in
                  </p>
                  <button
                    onClick={() => navigate(`/ticket/${bookingCode}`, { state: { fromSuccess: true } })}
                    className="w-full py-3 rounded-xl text-sm text-white bg-gradient-to-r from-red-600 to-red-700 hover:opacity-90 transition"
                  >
                    <Ticket size={15} className="inline mr-2" />
                    Xem vé điện tử
                  </button>
                  <button
                    onClick={() => setShowQRModal(true)}
                    className="w-full py-2.5 rounded-xl text-sm mt-2 text-white/60 hover:bg-white/10 transition border border-white/10"
                  >
                    <QrCode size={14} className="inline mr-2" />
                    Phóng to mã QR
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* QR Modal */}
        <AnimatePresence>
          {showQRModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85"
              onClick={() => setShowQRModal(false)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="rounded-3xl p-6 text-center max-w-sm w-full"
                style={{ background: "#12121f", border: "1px solid rgba(255,255,255,0.1)" }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-red-500 font-bold">CINE STAR</span>
                  </div>
                  <button onClick={() => setShowQRModal(false)} className="text-white/40 hover:text-white">
                    <X size={20} />
                  </button>
                </div>
                <div className="p-4 rounded-2xl mb-4 bg-white inline-block">
                  <QRCodeSVG value={ticketUrl} size={240} bgColor="#ffffff" fgColor="#07070f" level="H" />
                </div>
                <p className="text-zinc-400 text-sm mb-1">{movie.title}</p>
                <p className="text-zinc-400 text-xs mb-4">{new Date(showtime.start_time).toLocaleString()}</p>
                <div className="text-white text-xl tracking-wider mb-4 font-mono font-black">{bookingCode}</div>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="px-8 py-2.5 rounded-xl text-white text-sm bg-white/10 hover:bg-white/20 transition"
                >
                  Đóng
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ========== CONFIRMATION STATE (Kết hợp UI từ Code 2 + Logic từ Code 1) ==========
  return (
    <div className="min-h-screen pt-16" style={{ background: "#0a0a0f" }}>
      {/* Header */}
      <div className="border-b border-zinc-700 sticky top-0 z-10" style={{ background: "#12121f" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm mb-3 transition">
            <ChevronLeft className="w-4 h-4" /> Quay lại
          </button>
          <div className="flex items-center justify-between">
            <h1 className="text-white font-bold text-xl">Xác nhận đặt vé</h1>
            <div className="hidden sm:flex items-center gap-2">
              {[
                { n: 1, label: "Phim", done: true },
                { n: 2, label: "Rạp", done: true },
                { n: 3, label: "Ghế", done: true },
                { n: 4, label: "Thanh toán", active: true },
              ].map((s, i) => (
                <div key={s.n} className="flex items-center gap-1.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    s.done ? "bg-green-500 text-white" : s.active ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-400"
                  }`}>
                    {s.done ? "✓" : s.n}
                  </div>
                  {i < 3 && <div className="w-6 h-px bg-zinc-700" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column */}
          <div className="flex-1 space-y-4">
            {/* Movie & Showtime Info */}
            <div className="rounded-2xl p-5" style={{ background: "#12121f", border: "1px solid rgba(255,255,255,0.07)" }}>
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Ticket className="w-4 h-4 text-red-500" /> Thông tin vé
              </h3>
              <div className="flex gap-4">
                {movie.poster && (
                  <img src={movie.poster} alt={movie.title} className="w-20 h-28 object-cover rounded-xl flex-shrink-0" />
                )}
                <div className="flex-1 space-y-2">
                  <div>
                    <p className="text-white font-bold">{movie.title}</p>
                    <p className="text-zinc-400 text-xs">{movie.originalTitle || ""}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-zinc-400 text-xs">Rạp chiếu</p>
                      <p className="text-zinc-200 text-xs font-semibold">{showtime.cinema_name || "CGV"}</p>
                    </div>
                    <div>
                      <p className="text-zinc-400 text-xs">Suất chiếu</p>
                      <p className="text-zinc-200 text-xs font-semibold">
                        {new Date(showtime.start_time).toLocaleTimeString("vi-VN")}
                      </p>
                    </div>
                    <div>
                      <p className="text-zinc-400 text-xs">Phòng</p>
                      <p className="text-zinc-200 text-xs font-semibold">{showtime.room_id || "1"}</p>
                    </div>
                    <div>
                      <p className="text-zinc-400 text-xs">Ghế</p>
                      <p className="text-zinc-200 text-xs font-semibold">{seats.map(s => s.id).join(", ")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Combos - Từ Code 1 nhưng styling từ Code 2 */}
            <div className="rounded-2xl p-5" style={{ background: "#12121f", border: "1px solid rgba(255,255,255,0.07)" }}>
              <h3 className="text-white font-semibold mb-4">🍿 Thêm combo bắp nước (tuỳ chọn)</h3>
              <div className="space-y-3">
                {foods.map((food) => {
                  const count = comboCounts[food.food_id] || 0;
                  return (
                    <div key={food.food_id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-700">
                      <div>
                        <p className="text-zinc-200 text-sm">{food.name}</p>
                        <p className="text-red-400 text-xs font-semibold mt-0.5">{food.price.toLocaleString()}₫</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateCombo(food.food_id, -1)}
                          disabled={count === 0}
                          className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-white disabled:opacity-30 hover:bg-zinc-600 transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-white text-sm font-bold">{count}</span>
                        <button
                          onClick={() => updateCombo(food.food_id, 1)}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white hover:opacity-90 bg-red-600"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Promo Code - Từ Code 2 */}
            <div className="rounded-2xl p-5" style={{ background: "#12121f", border: "1px solid rgba(255,255,255,0.07)" }}>
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Tag className="w-4 h-4 text-green-500" /> Mã khuyến mãi
              </h3>
              <div className="flex gap-2">
                <input
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value);
                    setPromoError("");
                    setPromoApplied(false);
                  }}
                  placeholder="Nhập mã khuyến mãi"
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-red-500 transition"
                />
                <button onClick={handleApplyPromo} className="px-4 py-2.5 rounded-xl text-white text-sm bg-red-600 hover:bg-red-700 transition">
                  Áp dụng
                </button>
              </div>
              {promoApplied && (
                <p className="text-green-400 text-xs mt-2 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Áp dụng thành công! Giảm {discount.toLocaleString()}₫
                </p>
              )}
              {promoError && <p className="text-red-400 text-xs mt-2">{promoError}</p>}
              <p className="text-zinc-400 text-xs mt-2">Thử: WED30, CINE10, SPRING2026</p>
            </div>

            {/* Payment Methods - Từ Code 2 */}
            <div className="rounded-2xl p-5" style={{ background: "#12121f", border: "1px solid rgba(255,255,255,0.07)" }}>
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-400" /> Phương thức thanh toán
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                      paymentMethod === method.id
                        ? "border-red-500 bg-red-500/10"
                        : "border-zinc-700 bg-zinc-900 hover:border-zinc-600"
                    }`}
                  >
                    <span className="text-xl">{method.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs truncate font-semibold ${paymentMethod === method.id ? "text-white" : "text-zinc-300"}`}>
                        {method.label}
                      </p>
                      <p className="text-zinc-400 text-xs">{method.desc}</p>
                    </div>
                    {paymentMethod === method.id && (
                      <div className="w-4 h-4 rounded-full flex items-center justify-center bg-red-600">
                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:w-80">
            <div className="rounded-2xl p-5 sticky top-20" style={{ background: "#12121f", border: "1px solid rgba(255,255,255,0.07)" }}>
              <h3 className="text-white font-bold mb-4">Tóm tắt đơn hàng</h3>
              
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between text-zinc-400">
                  <span>{seats.length} vé xem phim</span>
                  <span>{ticketTotal.toLocaleString()}₫</span>
                </div>
                {comboTotal > 0 && (
                  <div className="flex justify-between text-zinc-400">
                    <span>Combo bắp nước</span>
                    <span>{comboTotal.toLocaleString()}₫</span>
                  </div>
                )}
                {promoApplied && (
                  <div className="flex justify-between text-green-400">
                    <span>Giảm giá</span>
                    <span>-{discount.toLocaleString()}₫</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-400">
                  <span>Phí dịch vụ</span>
                  <span>Miễn phí</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center py-3 border-t border-zinc-700 mb-4">
                <span className="text-white font-bold">Tổng thanh toán</span>
                <span className="text-lg text-red-500 font-bold">{grandTotal.toLocaleString()}₫</span>
              </div>
              
              <div className="flex items-center gap-2 mb-4 rounded-xl p-3 bg-green-500/10 border border-green-500/20">
                <Shield className="w-4 h-4 text-green-500 flex-shrink-0" />
                <p className="text-green-400 text-xs">Thanh toán được mã hóa SSL an toàn 100%</p>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirm}
                disabled={paying}
                className="w-full py-3.5 rounded-xl text-white flex items-center justify-center gap-2 transition-all disabled:opacity-70 bg-gradient-to-r from-red-600 to-red-700 hover:opacity-90"
              >
                {paying ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Thanh toán {grandTotal.toLocaleString()}₫
                  </>
                )}
              </motion.button>
              
              <p className="text-zinc-400 text-xs text-center mt-3">
                Bằng cách nhấn thanh toán, bạn đồng ý với{" "}
                <span className="text-red-500">điều khoản sử dụng</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}