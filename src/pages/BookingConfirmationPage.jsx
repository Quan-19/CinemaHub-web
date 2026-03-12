import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Check,
  CreditCard,
  Smartphone,
  Wallet,
  Plus,
  Minus,
  Tag,
  Ticket,
  Shield,
  Star,
  MapPin,
  Calendar,
  Clock,
  Film,
  Download,
  Share2,
  QrCode,
  Armchair,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useBooking } from "../context/BookingContext";
import { COMBOS } from "../data/mockData";
import { motion, AnimatePresence } from "motion/react";

const PAYMENT_METHODS = [
  { id: "momo", label: "Ví MoMo", icon: "💜", desc: "Thanh toán qua ví MoMo" },
  { id: "vnpay", label: "VNPay QR", icon: "🔵", desc: "Quét mã QR VNPay" },
  {
    id: "card",
    label: "Thẻ tín dụng",
    icon: "💳",
    desc: "Visa / Mastercard / JCB",
  },
  {
    id: "zalopay",
    label: "ZaloPay",
    icon: "🟢",
    desc: "Thanh toán qua ZaloPay",
  },
];

const PROMO_PERCENT_BY_CODE = {
  WED30: 0.3,
  CGV10YEARS: 0.1,
  COUPLE2026: 0.25,
  CINE10: 0.1,
  SPRING2026: 0.2,
};

const RATING_COLOR = {
  P: "#22c55e",
  T13: "#3b82f6",
  T16: "#f59e0b",
  T18: "#ef4444",
};

const SEAT_TYPE_COLOR = {
  standard: "rgba(255,255,255,0.55)",
  vip: "#f59e0b",
  couple: "#e50914",
};

// Confetti component
const Confetti = () => {
  const pieces = Array.from({ length: 30 }, (_, i) => ({
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
            borderRadius: Math.random() > 0.5 ? "50%" : 2,
          }}
        />
      ))}
    </div>
  );
};

export const BookingConfirmationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    selectedMovie,
    selectedCinema,
    selectedShowtime,
    selectedDate,
    selectedSeats,
  } = useBooking();

  const ticketFromState = location.state?.ticketData || null;
  const isFromTicketPage = Boolean(
    location.state?.fromTicket && ticketFromState
  );

  const movie =
    selectedMovie ||
    (ticketFromState
      ? {
          title: ticketFromState.movieTitle,
          originalTitle: ticketFromState.movieOriginalTitle,
          poster: ticketFromState.moviePoster,
          rating: ticketFromState.movieRating,
          duration: ticketFromState.movieDuration,
          genre: ticketFromState.movieGenre || [],
        }
      : null);
  const cinema =
    selectedCinema ||
    (ticketFromState
      ? {
          name: ticketFromState.cinemaName,
          address: ticketFromState.cinemaAddress,
          brand: ticketFromState.cinemaBrand,
        }
      : null);
  const showtime =
    selectedShowtime ||
    (ticketFromState
      ? {
          roomId: ticketFromState.roomId,
          type: ticketFromState.showtimeType,
          time: ticketFromState.time,
          price: 0,
        }
      : null);
  const seats =
    selectedSeats?.length > 0 ? selectedSeats : ticketFromState?.seats || [];
  const date = selectedDate || ticketFromState?.date || "";

  const [comboCounts, setComboCounts] = useState({});
  const [paymentMethod, setPaymentMethod] = useState(
    ticketFromState?.paymentMethod || "momo"
  );
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoPercent, setPromoPercent] = useState(0);
  const [promoError, setPromoError] = useState("");
  const [step, setStep] = useState(isFromTicketPage ? "success" : "summary");
  const [bookingCode] = useState(
    () => ticketFromState?.bookingCode || `CS${Date.now().toString().slice(-8)}`
  );
  const [showConfetti, setShowConfetti] = useState(false);
  const [paying, setPaying] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const ticketUrl = `${window.location.origin}/ticket/${bookingCode}`;

  if (!movie || !cinema || !showtime) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#0a0a0f" }}
      >
        <div className="text-center">
          <p className="text-zinc-400 mb-4">Không có thông tin đặt vé</p>
          <button
            onClick={() => navigate("/movies")}
            className="text-red-500 hover:underline"
          >
            Quay lại trang phim
          </button>
        </div>
      </div>
    );
  }

  const ticketTotal = isFromTicketPage
    ? ticketFromState?.grandTotal || 0
    : seats.reduce((sum, seat) => {
        const base = showtime.price;
        const mult =
          seat.type === "vip" ? 1.3 : seat.type === "couple" ? 1.5 : 1;
        return sum + base * mult;
      }, 0);

  const comboTotal = isFromTicketPage
    ? 0
    : COMBOS.reduce(
        (sum, combo) => sum + (comboCounts[combo.id] || 0) * combo.price,
        0
      );
  const discount = isFromTicketPage
    ? 0
    : promoApplied
    ? Math.round(ticketTotal * 0.1)
    : 0;
  const grandTotal = isFromTicketPage
    ? ticketFromState?.grandTotal || 0
    : ticketTotal + comboTotal - discount;

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

  const handleConfirm = async () => {
    setPaying(true);
    // Simulate payment processing
    await new Promise((r) => setTimeout(r, 1800));
    setPaying(false);

    // Save ticket data to localStorage
    const ticketData = {
      bookingCode,
      movieTitle: movie.title,
      movieOriginalTitle: movie.originalTitle,
      moviePoster: movie.poster,
      movieRating: movie.rating,
      movieDuration: movie.duration,
      movieGenre: movie.genre,
      cinemaName: cinema.name,
      cinemaAddress: cinema.address,
      cinemaBrand: cinema.brand,
      roomId: showtime.roomId,
      showtimeType: showtime.type,
      date: date || new Date().toLocaleDateString("vi-VN"),
      time: showtime.time,
      seats: seats.map((s) => ({ id: s.id, type: s.type })),
      customerName: "Nguyễn Văn A",
      grandTotal,
      paymentMethod,
      issuedAt: new Date().toLocaleString("vi-VN"),
    };
    localStorage.setItem(`ticket_${bookingCode}`, JSON.stringify(ticketData));

    setStep("success");
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  // ─── SUCCESS STATE ───────────────────────────────────────────
  if (step === "success") {
    return (
      <div className="min-h-screen pt-16" style={{ background: "#0a0a0f" }}>
        {showConfetti && <Confetti />}

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {/* Success banner */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-6 mb-6 text-center relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #0d2a0d, #0a1a0a)",
              border: "1px solid rgba(34,197,94,0.3)",
            }}
          >
            {/* Glow */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at 50% -20%, rgba(34,197,94,0.15) 0%, transparent 70%)",
              }}
            />

            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10"
              style={{
                background: "linear-gradient(135deg, #166534, #22c55e)",
              }}
            >
              <Check className="w-10 h-10 text-white" strokeWidth={3} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <Sparkles size={18} style={{ color: "#f59e0b" }} />
                <h2
                  className="text-white"
                  style={{ fontSize: "1.4rem", fontWeight: 800 }}
                >
                  Thanh toán thành công!
                </h2>
                <Sparkles size={18} style={{ color: "#f59e0b" }} />
              </div>
              <p className="text-green-400 text-sm">
                Vé của bạn đã được xác nhận và sẵn sàng sử dụng
              </p>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left: booking summary */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              {/* Movie info card */}
              <div
                className="rounded-2xl p-5"
                style={{
                  background: "#12121f",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Ticket size={15} style={{ color: "#e50914" }} />
                  <h3
                    className="text-white"
                    style={{ fontWeight: 700, fontSize: 15 }}
                  >
                    Thông tin vé
                  </h3>
                </div>

                <div className="flex gap-3 mb-4">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-16 h-22 object-cover rounded-xl flex-shrink-0"
                    style={{
                      width: 64,
                      height: 88,
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  />
                  <div className="flex-1">
                    <div
                      className="text-white"
                      style={{ fontWeight: 700, fontSize: 14 }}
                    >
                      {movie.title}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      <span
                        className="px-1.5 py-0.5 rounded text-xs font-bold"
                        style={{
                          background: `${
                            RATING_COLOR[movie.rating] || "#e50914"
                          }25`,
                          color: RATING_COLOR[movie.rating] || "#e50914",
                        }}
                      >
                        {movie.rating}
                      </span>
                      <span
                        className="px-1.5 py-0.5 rounded text-xs font-bold"
                        style={{
                          background: "rgba(139,92,246,0.2)",
                          color: "#a78bfa",
                        }}
                      >
                        {showtime.type}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {[
                    {
                      icon: <MapPin size={12} />,
                      label: "Rạp",
                      value: cinema.name,
                      color: "#e50914",
                    },
                    {
                      icon: <Calendar size={12} />,
                      label: "Ngày",
                      value: date || "—",
                      color: "#06b6d4",
                    },
                    {
                      icon: <Clock size={12} />,
                      label: "Giờ chiếu",
                      value: `${showtime.time}`,
                      color: "#22c55e",
                    },
                    {
                      icon: <Film size={12} />,
                      label: "Phòng",
                      value: showtime.roomId,
                      color: "#8b5cf6",
                    },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center gap-2.5">
                      <span style={{ color: row.color, opacity: 0.8 }}>
                        {row.icon}
                      </span>
                      <span
                        className="text-zinc-500"
                        style={{ fontSize: 12, minWidth: 64 }}
                      >
                        {row.label}
                      </span>
                      <span
                        className="text-white"
                        style={{ fontSize: 13, fontWeight: 600 }}
                      >
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Seats */}
                <div
                  className="mt-3 pt-3"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <Armchair
                      size={12}
                      style={{ color: "rgba(255,255,255,0.4)" }}
                    />
                    <span
                      style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}
                    >
                      Ghế đã đặt
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {seats.map((seat) => (
                      <span
                        key={seat.id}
                        className="px-2 py-1 rounded-lg text-xs font-bold"
                        style={{
                          background:
                            seat.type === "vip"
                              ? "rgba(245,158,11,0.15)"
                              : seat.type === "couple"
                              ? "rgba(229,9,20,0.15)"
                              : "rgba(255,255,255,0.08)",
                          color: SEAT_TYPE_COLOR[seat.type],
                          border: `1px solid ${
                            seat.type === "vip"
                              ? "rgba(245,158,11,0.3)"
                              : seat.type === "couple"
                              ? "rgba(229,9,20,0.3)"
                              : "rgba(255,255,255,0.1)"
                          }`,
                        }}
                      >
                        {seat.id}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Payment summary */}
              <div
                className="rounded-2xl p-5"
                style={{
                  background: "#12121f",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <h3
                  className="text-white mb-3"
                  style={{ fontWeight: 700, fontSize: 14 }}
                >
                  Chi tiết thanh toán
                </h3>
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
                  <div
                    className="flex justify-between pt-2"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <span className="text-white" style={{ fontWeight: 700 }}>
                      Tổng thanh toán
                    </span>
                    <span
                      style={{
                        color: "#f59e0b",
                        fontWeight: 800,
                        fontSize: 16,
                      }}
                    >
                      {grandTotal.toLocaleString()}₫
                    </span>
                  </div>
                  <div className="flex justify-between text-zinc-500 text-xs pt-1">
                    <span>Phương thức</span>
                    <span>
                      {PAYMENT_METHODS.find((m) => m.id === paymentMethod)
                        ?.label || paymentMethod}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => navigate("/")}
                  className="flex-1 py-3 rounded-xl text-sm text-white transition-colors"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  Về trang chủ
                </button>
                <button
                  onClick={() => navigate("/movies")}
                  className="flex-1 py-3 rounded-xl text-sm text-white hover:opacity-90 transition-opacity"
                  style={{
                    background: "linear-gradient(135deg, #e50914, #b20710)",
                  }}
                >
                  Đặt vé khác
                </button>
              </div>
            </motion.div>

            {/* Right: QR code + booking code */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-4"
            >
              {/* Booking code */}
              <div
                className="rounded-2xl p-5 text-center"
                style={{
                  background: "#12121f",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <p className="text-zinc-500 text-xs mb-1 uppercase tracking-widest">
                  Mã đặt vé
                </p>
                <div
                  className="text-white text-3xl tracking-[0.2em] mb-1"
                  style={{ fontFamily: "monospace", fontWeight: 900 }}
                >
                  {bookingCode}
                </div>
                <div className="flex items-center justify-center gap-1.5">
                  <CheckCircle size={13} style={{ color: "#22c55e" }} />
                  <span className="text-green-400 text-xs">
                    Đã xác nhận · {new Date().toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </div>

              {/* QR code card */}
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background: "#12121f",
                  border: "1px solid rgba(229,9,20,0.25)",
                }}
              >
                {/* Header */}
                <div
                  className="px-5 py-3 flex items-center gap-2"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(229,9,20,0.15), rgba(229,9,20,0.05))",
                    borderBottom: "1px solid rgba(229,9,20,0.15)",
                  }}
                >
                  <QrCode size={16} style={{ color: "#e50914" }} />
                  <span
                    style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}
                  >
                    Vé điện tử (E-Ticket)
                  </span>
                </div>

                <div className="p-5 flex flex-col items-center">
                  {/* QR */}
                  <div
                    className="p-3 rounded-2xl mb-3 relative"
                    style={{ background: "#fff" }}
                  >
                    <QRCodeSVG
                      value={ticketUrl}
                      size={160}
                      bgColor="#ffffff"
                      fgColor="#07070f"
                      level="H"
                      imageSettings={{
                        src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23e50914'%3E%3Cpath d='M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z'/%3E%3C/svg%3E",
                        x: undefined,
                        y: undefined,
                        height: 32,
                        width: 32,
                        excavate: true,
                      }}
                    />
                  </div>

                  <p
                    className="text-center text-zinc-400 text-xs mb-4"
                    style={{ lineHeight: 1.6 }}
                  >
                    📱 Quét mã QR để xem vé điện tử
                    <br />
                    Xuất trình tại cổng soát vé khi check-in
                  </p>

                  {/* View ticket button */}
                  <button
                    onClick={() =>
                      navigate(`/ticket/${bookingCode}`, {
                        state: {
                          fromSuccess: true,
                          ticketData: {
                            bookingCode,
                            movieTitle: movie.title,
                            movieOriginalTitle: movie.originalTitle,
                            moviePoster: movie.poster,
                            movieRating: movie.rating,
                            movieDuration: movie.duration,
                            movieGenre: movie.genre,
                            cinemaName: cinema.name,
                            cinemaAddress: cinema.address,
                            cinemaBrand: cinema.brand,
                            roomId: showtime.roomId,
                            showtimeType: showtime.type,
                            date:
                              date || new Date().toLocaleDateString("vi-VN"),
                            time: showtime.time,
                            seats: seats.map((s) => ({
                              id: s.id,
                              type: s.type,
                            })),
                            customerName: "Nguyễn Văn A",
                            grandTotal,
                            paymentMethod,
                            issuedAt: new Date().toLocaleString("vi-VN"),
                          },
                        },
                      })
                    }
                    className="w-full py-3 rounded-xl text-sm text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                    style={{
                      background: "linear-gradient(135deg, #e50914, #b20710)",
                    }}
                  >
                    <Ticket size={15} />
                    Xem vé điện tử
                  </button>

                  <button
                    onClick={() => setShowQRModal(true)}
                    className="w-full py-2.5 rounded-xl text-sm mt-2 flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
                    style={{
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "rgba(255,255,255,0.6)",
                    }}
                  >
                    <QrCode size={14} />
                    Phóng to mã QR
                  </button>
                </div>
              </div>

              {/* Info note */}
              <div
                className="rounded-xl p-4 flex gap-3"
                style={{
                  background: "rgba(245,158,11,0.08)",
                  border: "1px solid rgba(245,158,11,0.2)",
                }}
              >
                <span className="text-2xl flex-shrink-0">💡</span>
                <div>
                  <p
                    className="text-amber-400 text-xs"
                    style={{ fontWeight: 600, marginBottom: 4 }}
                  >
                    Lưu ý quan trọng
                  </p>
                  <ul className="text-amber-200/60 text-xs space-y-1">
                    <li>• Vé có hiệu lực đến hết suất chiếu</li>
                    <li>• Đến rạp trước 15 phút để check-in</li>
                    <li>• Mang theo CCCD khi mua vé T18</li>
                    <li>• Vé đã đặt không được hoàn trả</li>
                  </ul>
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
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: "rgba(0,0,0,0.85)" }}
              onClick={() => setShowQRModal(false)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="rounded-3xl p-6 text-center"
                style={{
                  background: "#12121f",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-2 justify-center mb-4">
                  <Star size={16} fill="#e50914" color="#e50914" />
                  <span
                    style={{ fontSize: 16, fontWeight: 800, color: "#e50914" }}
                  >
                    CINE
                  </span>
                  <span
                    style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}
                  >
                    STAR
                  </span>
                </div>
                <div
                  className="p-4 rounded-2xl mb-4 inline-block"
                  style={{ background: "#fff" }}
                >
                  <QRCodeSVG
                    value={ticketUrl}
                    size={240}
                    bgColor="#ffffff"
                    fgColor="#07070f"
                    level="H"
                    imageSettings={{
                      src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23e50914'%3E%3Cpath d='M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z'/%3E%3C/svg%3E",
                      x: undefined,
                      y: undefined,
                      height: 44,
                      width: 44,
                      excavate: true,
                    }}
                  />
                </div>
                <p className="text-zinc-400 text-sm mb-1">{movie.title}</p>
                <p className="text-zinc-500 text-xs mb-4">
                  {showtime.time} · {cinema.name}
                </p>
                <div
                  className="text-white text-xl tracking-[0.15em] mb-4"
                  style={{ fontFamily: "monospace", fontWeight: 900 }}
                >
                  {bookingCode}
                </div>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="px-8 py-2.5 rounded-xl text-white text-sm hover:opacity-80"
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
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

  // ─── SUMMARY STATE ───────────────────────────────────────────
  return (
    <div className="min-h-screen pt-16" style={{ background: "#0a0a0f" }}>
      {/* Header */}
      <div
        className="border-b border-zinc-800"
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
            <h1 className="text-white" style={{ fontWeight: 700 }}>
              Xác nhận đặt vé
            </h1>
            <div className="hidden sm:flex items-center gap-2">
              {[
                { n: 1, label: "Phim", done: true },
                { n: 2, label: "Rạp", done: true },
                { n: 3, label: "Ghế", done: true },
                { n: 4, label: "Thanh toán", active: true },
              ].map((s, i) => (
                <div key={s.n} className="flex items-center gap-1.5">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      s.done
                        ? "bg-green-500 text-white"
                        : s.active
                        ? "bg-red-600 text-white"
                        : "bg-zinc-800 text-zinc-500"
                    }`}
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
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left */}
          <div className="flex-1 space-y-4">
            {/* Booking info */}
            <div
              className="rounded-2xl border border-zinc-800 p-5"
              style={{ background: "#12121f" }}
            >
              <h3
                className="text-white mb-4 flex items-center gap-2"
                style={{ fontWeight: 600 }}
              >
                <Ticket className="w-4 h-4 text-red-500" /> Thông tin vé
              </h3>
              <div className="flex gap-4">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-20 h-28 object-cover rounded-xl flex-shrink-0"
                  style={{ border: "1px solid rgba(255,255,255,0.1)" }}
                />
                <div className="flex-1 space-y-2">
                  <div>
                    <p className="text-white" style={{ fontWeight: 700 }}>
                      {movie.title}
                    </p>
                    <p className="text-zinc-500 text-xs">
                      {movie.originalTitle}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-zinc-500 text-xs">Rạp chiếu</p>
                      <p
                        className="text-zinc-200 text-xs"
                        style={{ fontWeight: 600 }}
                      >
                        {cinema.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-zinc-500 text-xs">Suất chiếu</p>
                      <p
                        className="text-zinc-200 text-xs"
                        style={{ fontWeight: 600 }}
                      >
                        {showtime.time} · {showtime.type}
                      </p>
                    </div>
                    <div>
                      <p className="text-zinc-500 text-xs">Phòng</p>
                      <p
                        className="text-zinc-200 text-xs"
                        style={{ fontWeight: 600 }}
                      >
                        {showtime.roomId}
                      </p>
                    </div>
                    <div>
                      <p className="text-zinc-500 text-xs">Ghế</p>
                      <p
                        className="text-zinc-200 text-xs"
                        style={{ fontWeight: 600 }}
                      >
                        {seats.map((s) => s.id).join(", ")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Combos */}
            <div
              className="rounded-2xl border border-zinc-800 p-5"
              style={{ background: "#12121f" }}
            >
              <h3 className="text-white mb-4" style={{ fontWeight: 600 }}>
                🍿 Thêm combo bắp nước (tuỳ chọn)
              </h3>
              <div className="space-y-3">
                {COMBOS.map((combo) => {
                  const count = comboCounts[combo.id] || 0;
                  return (
                    <div
                      key={combo.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800"
                    >
                      <div>
                        <p className="text-zinc-200 text-sm">{combo.name}</p>
                        <p
                          className="text-red-400 text-xs mt-0.5"
                          style={{ fontWeight: 600 }}
                        >
                          {combo.price.toLocaleString()}₫
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setComboCounts((c) => ({
                              ...c,
                              [combo.id]: Math.max(0, (c[combo.id] || 0) - 1),
                            }))
                          }
                          disabled={count === 0}
                          className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-white disabled:opacity-30 hover:bg-zinc-600 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span
                          className="w-5 text-center text-white text-sm"
                          style={{ fontWeight: 700 }}
                        >
                          {count}
                        </span>
                        <button
                          onClick={() =>
                            setComboCounts((c) => ({
                              ...c,
                              [combo.id]: (c[combo.id] || 0) + 1,
                            }))
                          }
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white hover:opacity-90"
                          style={{ background: "#e50914" }}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Promo */}
            <div
              className="rounded-2xl border border-zinc-800 p-5"
              style={{ background: "#12121f" }}
            >
              <h3
                className="text-white mb-4 flex items-center gap-2"
                style={{ fontWeight: 600 }}
              >
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
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
                />
                <button
                  onClick={handleApplyPromo}
                  className="px-4 py-2.5 rounded-xl text-white text-sm hover:opacity-90"
                  style={{ background: "#e50914" }}
                >
                  Áp dụng
                </button>
              </div>
              {promoApplied && (
                <p className="text-green-400 text-xs mt-2 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Áp dụng thành công! Giảm{" "}
                  {discount.toLocaleString()}₫
                </p>
              )}
              {promoError && (
                <p className="text-red-400 text-xs mt-2">{promoError}</p>
              )}
              <p className="text-zinc-500 text-xs mt-2">
                Thử: WED30, CINE10, SPRING2026
              </p>
            </div>

            {/* Payment method */}
            <div
              className="rounded-2xl border border-zinc-800 p-5"
              style={{ background: "#12121f" }}
            >
              <h3
                className="text-white mb-4 flex items-center gap-2"
                style={{ fontWeight: 600 }}
              >
                <CreditCard className="w-4 h-4 text-blue-400" /> Phương thức
                thanh toán
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
                      <p
                        className={`text-xs truncate ${
                          paymentMethod === method.id
                            ? "text-white"
                            : "text-zinc-300"
                        }`}
                        style={{ fontWeight: 600 }}
                      >
                        {method.label}
                      </p>
                      <p className="text-zinc-500 text-xs">{method.desc}</p>
                    </div>
                    {paymentMethod === method.id && (
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: "#e50914" }}
                      >
                        <Check
                          className="w-2.5 h-2.5 text-white"
                          strokeWidth={3}
                        />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Summary */}
          <div className="lg:w-72">
            <div
              className="rounded-2xl border border-zinc-800 p-5 sticky top-20"
              style={{ background: "#12121f" }}
            >
              <h3 className="text-white mb-4" style={{ fontWeight: 700 }}>
                Tóm tắt đơn hàng
              </h3>

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
                <span className="text-white" style={{ fontWeight: 700 }}>
                  Tổng thanh toán
                </span>
                <span
                  className="text-lg"
                  style={{ color: "#e50914", fontWeight: 800 }}
                >
                  {grandTotal.toLocaleString()}₫
                </span>
              </div>

              <div
                className="flex items-center gap-2 mb-4 rounded-xl p-3"
                style={{
                  background: "rgba(34,197,94,0.08)",
                  border: "1px solid rgba(34,197,94,0.2)",
                }}
              >
                <Shield className="w-4 h-4 text-green-500 flex-shrink-0" />
                <p className="text-green-400 text-xs">
                  Thanh toán được mã hóa SSL an toàn 100%
                </p>
              </div>

              <button
                onClick={handleConfirm}
                disabled={paying}
                className="w-full py-3.5 rounded-xl text-white flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all disabled:opacity-70"
                style={{
                  background: "linear-gradient(135deg, #e50914, #b20710)",
                }}
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
              </button>

              <p className="text-zinc-500 text-xs text-center mt-3">
                Bằng cách nhấn thanh toán, bạn đồng ý với{" "}
                <span style={{ color: "#e50914" }}>điều khoản sử dụng</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
