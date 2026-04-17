import axios from "axios";
import { getAuth } from "firebase/auth";
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
  AlertCircle,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import { getShowtimeSeatPrice } from "../utils/showtimePricing";
import { useState, useEffect } from "react";
import {
  useLocation,
  useNavigate,
  useSearchParams,
  useBlocker,
} from "react-router-dom";

// Constants
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

// Confetti component
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
  const [searchParams] = useSearchParams();

  // Lấy params từ URL (callback từ MoMo/VNPay)
  const paymentStatus = searchParams.get("payment_status");
  const paymentBookingId = searchParams.get("booking_id");
  const paymentMethod = searchParams.get("method");

  // Kiểm tra xem có đang trong callback thanh toán không
  const isPaymentCallback = paymentStatus === "success" && paymentBookingId;

  // ========== STATE ==========
  const [foods, setFoods] = useState([]);
  const [comboCounts, setComboCounts] = useState({});
  const [paying, setPaying] = useState(false);
  const [step, setStep] = useState("confirm");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("momo");
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscountAmount, setPromoDiscountAmount] = useState(0);
  const [promoError, setPromoError] = useState("");
  const [bookingCode, setBookingCode] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  // Dữ liệu booking từ API (cho callback)
  const [bookingData, setBookingData] = useState(null);
  const [isFetchingBooking, setIsFetchingBooking] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Dữ liệu từ state (khi vào trang bình thường)
  const showtime = state?.showtime;
  const seats = state?.seats || [];
  const movie = state?.movie;

  // ✅ CẢNH BÁO KHI THOÁT TRANG (Dùng useBlocker)
  const blocker = useBlocker(({ nextLocation }) => {
    // Chỉ chặn nếu:
    // 1. Đang ở bước confirm (chưa xong)
    // 2. Không phải đang thực hiện thanh toán (để tránh block redirect URL nội bộ nếu có)
    // 3. Có dữ liệu ghế (đang giữ ghế)
    // 4. KHÔNG phải là callback thanh toán (đã xong)
    return (
      step === "confirm" && !paying && seats.length > 0 && !isPaymentCallback
    );
  });

  // Sự kiện BeforeUnload vẫn giữ cho đóng tab/refresh
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (step === "confirm" && seats.length > 0 && !isPaymentCallback) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [step, seats.length, isPaymentCallback]);

  // ========== DEBUG LOG ==========
  useEffect(() => {
    console.log("=== BOOKING CONFIRMATION PAGE ===");
    console.log("URL:", window.location.href);
    console.log("Search params:", Object.fromEntries(searchParams.entries()));
    console.log("paymentStatus:", paymentStatus);
    console.log("paymentBookingId:", paymentBookingId);
    console.log("isPaymentCallback:", isPaymentCallback);
    console.log("Has state showtime:", !!showtime);
    console.log("Has state seats:", seats.length);
    console.log("Has state movie:", !!movie);
    console.log("=================================");
  }, []);

  // ========== EFFECT 1: Fetch booking data khi callback ==========
  useEffect(() => {
    const fetchBookingData = async () => {
      if (!isPaymentCallback || !paymentBookingId) {
        console.log("Not a payment callback or missing booking_id");
        return;
      }

      console.log("🔄 Fetching booking data for ID:", paymentBookingId);
      setIsFetchingBooking(true);
      setFetchError(null);

      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          console.error("User not logged in");
          setFetchError("Vui lòng đăng nhập lại");
          // Đợi user đăng nhập? Có thể redirect về login
          return;
        }

        const token = await user.getIdToken(true);

        // Fetch booking details
        const bookingRes = await axios.get(
          `http://localhost:5000/api/bookings/${paymentBookingId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        console.log("Booking data:", bookingRes.data);

        if (!bookingRes.data) {
          throw new Error("Không tìm thấy thông tin booking");
        }

        // Fetch booking seats
        const seatsRes = await axios.get(
          `http://localhost:5000/api/booking-seats/booking/${paymentBookingId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        console.log("Seats data:", seatsRes.data);

        // Fetch showtime details
        const showtimeId = bookingRes.data?.showtime_id;
        let movieData = null;
        let showtimeData = null;

        if (showtimeId) {
          const showtimeRes = await axios.get(
            `http://localhost:5000/api/showtimes/${showtimeId}`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          showtimeData = showtimeRes.data;
          console.log("Showtime data:", showtimeData);

          if (showtimeData?.movie_id) {
            const movieRes = await axios.get(
              `http://localhost:5000/api/movies/${showtimeData.movie_id}`,
              { headers: { Authorization: `Bearer ${token}` } },
            );
            movieData = movieRes.data;
            console.log("Movie data:", movieData);
          }
        }

        const newBookingData = {
          booking: bookingRes.data,
          seats: seatsRes.data || [],
          showtime: showtimeData,
          movie: movieData,
          bookingCode: bookingRes.data?.ticket_code || `CS${paymentBookingId}`,
        };

        setBookingData(newBookingData);
        setStep("success");
        setShowConfetti(true);

        console.log("✅ Booking data loaded successfully");
      } catch (error) {
        console.error("Failed to fetch booking data:", error);
        setFetchError(
          error.response?.data?.message ||
            error.message ||
            "Không thể tải thông tin vé",
        );
      } finally {
        setIsFetchingBooking(false);
      }
    };

    fetchBookingData();
  }, [isPaymentCallback, paymentBookingId]);

  // ========== EFFECT 2: Load foods từ API ==========
  // Trong useEffect load foods (dòng 168-185)
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/foods")
      .then((res) => {
        // Format giá tiền cho mỗi food
        const formattedFoods = res.data.map((food) => ({
          ...food,
          // Làm tròn giá trước khi format
          price: Math.round(parseFloat(food.price)), // Ghi đè price thành số nguyên
          price_formatted:
            Math.round(parseFloat(food.price)).toLocaleString("vi-VN") + "₫",
        }));

        setFoods(formattedFoods);

        const init = {};
        formattedFoods.forEach((f) => {
          init[f.food_id] = 0;
        });
        setComboCounts(init);
      })
      .catch((err) => console.error("Lỗi load foods:", err));
  }, []);

  // ========== EFFECT 3: Redirect nếu không có dữ liệu và không phải callback ==========
  useEffect(() => {
    // CHỈ redirect nếu:
    // 1. KHÔNG phải callback thanh toán
    // 2. VÀ không có dữ liệu showtime hoặc seats
    if (!isPaymentCallback && (!showtime || seats.length === 0)) {
      console.log("No data and not callback, redirecting to movies");
      navigate("/movies");
    }
  }, [isPaymentCallback, showtime, seats, navigate]);
  const formatCurrency = (amount) => {
    return amount.toLocaleString("vi-VN") + "₫";
  };
  // ========== TÍNH TOÁN GIÁ ==========
  const ticketTotal = seats.reduce(
    (sum, s) => sum + getShowtimeSeatPrice(showtime, String(s?.type || "").toLowerCase()),
    0,
  );
  const comboTotal = foods.reduce((sum, f) => {
    return sum + f.price * (comboCounts[f.food_id] || 0);
  }, 0);
  const discount = promoApplied ? promoDiscountAmount : 0;
  const grandTotal = ticketTotal + comboTotal - discount;

  // ========== HANDLERS ==========
  const updateCombo = (id, change) => {
    setComboCounts((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + change),
    }));
  };

  const handleApplyPromo = async () => {
    const normalizedCode = promoCode.trim().toUpperCase();

    if (!normalizedCode) {
      setPromoError("Vui lòng nhập mã khuyến mãi");
      setPromoApplied(false);
      setPromoDiscountAmount(0);
      return;
    }

    try {
      const params = new URLSearchParams({
        code: normalizedCode,
        originalPrice: String(ticketTotal),
      });

      const showtimeCinemaId = showtime?.cinema_id ?? showtime?.cinemaId;
      if (showtimeCinemaId !== undefined && showtimeCinemaId !== null) {
        params.set("cinemaId", String(showtimeCinemaId));
      }

      const startTime = showtime?.start_time ?? showtime?.startTime;
      if (startTime) {
        params.set(
          "date",
          new Date(startTime).toISOString().split("T")[0]
        );
      }

      const res = await fetch(
        `http://localhost:5000/api/promotions/calculate?${params.toString()}`
      );
      const data = await res.json();

      if (res.ok && data?.success) {
        setPromoApplied(true);
        setPromoDiscountAmount(Number(data.discountAmount || 0));
        setPromoError("");
      } else {
        setPromoError(
          data?.message ||
            data?.error ||
            "Mã khuyến mãi không hợp lệ hoặc đã hết hạn"
        );
        setPromoApplied(false);
        setPromoDiscountAmount(0);
      }
    } catch (e) {
      setPromoError("Không thể kết nối đến server");
      setPromoApplied(false);
      setPromoDiscountAmount(0);
    }
  };

  const handleConfirm = async () => {
    const actualShowtimeId = showtime?.showtime_id || showtime?.id;

    if (!actualShowtimeId) {
      console.error("❌ Không tìm thấy showtime_id!");
      alert(
        "Lỗi: Không tìm thấy thông tin suất chiếu. Vui lòng quay lại chọn lại.",
      );
      return;
    }

    if (comboTotal > 0) {
      alert(
        "Combo bắp nước hiện chưa hỗ trợ trong thanh toán. Vui lòng bỏ chọn combo để tiếp tục.",
      );
      return;
    }

    setPaying(true);

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        alert("Bạn chưa đăng nhập!");
        setPaying(false);
        return;
      }

      const token = await user.getIdToken(true);
      const method = selectedPaymentMethod?.toLowerCase().trim();

      // Tính giá ghế
      const calculateSeatPrice = (seatType, basePrice = 75000) => {
        if (seatType === "vip") return Math.round(basePrice * 1.3);
        if (seatType === "couple") return Math.round(basePrice * 1.5);
        return basePrice;
      };

      // Chuẩn bị dữ liệu foods
      const selectedFoods = foods
        .filter((food) => (comboCounts[food.food_id] || 0) > 0)
        .map((food) => ({
          food_id: food.food_id,
          quantity: comboCounts[food.food_id],
          price: food.price,
        }));

      // 1. CREATE BOOKING
      const bookingRes = await axios.post(
        "http://localhost:5000/api/bookings",
        {
          user_id: user.user_id,
          showtime_id: actualShowtimeId,
          total_price: grandTotal,
          seats: seats.map((s) => ({
            id: s.id,
            price: getShowtimeSeatPrice(showtime, String(s.type || "").toLowerCase()),
          })),
          payment_method: method,
          promo_code: promoApplied ? promoCode : null,
          foods: selectedFoods, // ✅ Thêm foods vào đây
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const bookingId =
        bookingRes.data?.booking_id ?? bookingRes.data?.insertId;

      const payableAmount = bookingRes.data?.total_price ?? grandTotal;

      if (!bookingId) {
        throw new Error("Không lấy được booking_id từ server");
      }

      // 2. Nếu có foods, lưu vào booking_food
      if (selectedFoods.length > 0) {
        await axios.post(
          "http://localhost:5000/api/booking-foods",
          {
            booking_id: bookingId,
            foods: selectedFoods.map((f) => ({
              food_id: f.food_id,
              quantity: f.quantity,
            })),
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      }

      // 2. XỬ LÝ THEO PHƯƠNG THỨC THANH TOÁN
      if (method === "vnpay") {
        const res = await axios.post(
          "http://localhost:5000/api/payments/vnpay",
          { booking_id: bookingId, amount: payableAmount },
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (!res.data?.paymentUrl) {
          throw new Error("Không nhận được paymentUrl");
        }
        window.location.href = res.data.paymentUrl;
        return;
      }

      if (method === "momo") {
        const res = await axios.post(
          "http://localhost:5000/api/payment/momo",
          {
            booking_id: bookingId,
            amount: payableAmount,
            orderInfo: `Thanh toan booking ${bookingId}`,
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (!res.data?.payUrl) {
          throw new Error("Không nhận được payUrl từ MoMo");
        }

        window.location.href = res.data.payUrl;
        return;
      }

      // CÁC PHƯƠNG THỨC KHÁC (thanh toán ngay)
      const ticketCode =
        bookingRes.data?.bookingCode || `CS${Date.now().toString().slice(-8)}`;
      setBookingCode(ticketCode);

      // Fetch booking seats để hiển thị
      const seatsRes = await axios.get(
        `http://localhost:5000/api/booking-seats/booking/${bookingId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setBookingData({
        booking: bookingRes.data,
        seats: seatsRes.data || [],
        showtime: showtime,
        movie: movie,
        bookingCode: ticketCode,
      });

      setStep("success");
      setShowConfetti(true);
    } catch (err) {
      console.error("❌ Thanh toán thất bại:", err);
      if (err.response) {
        alert(err.response.data?.message || "Backend lỗi");
      } else {
        alert(err.message || "Thanh toán thất bại.");
      }
    }

    setPaying(false);
  };

  // ========== RENDER LOADING STATE (callback) ==========
  if (isPaymentCallback && isFetchingBooking) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--color-cinema-bg)" }}
      >
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-3 border-red-500 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-white mb-2">Đang tải thông tin vé của bạn...</p>
          <p className="text-zinc-500 text-sm">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  // ========== RENDER ERROR STATE (callback) ==========
  if (isPaymentCallback && fetchError) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--color-cinema-bg)" }}
      >
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-white text-xl font-bold mb-2">Có lỗi xảy ra</h2>
          <p className="text-zinc-400 mb-4">{fetchError}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 rounded-xl bg-zinc-700 text-white hover:bg-zinc-600 transition"
            >
              Thử lại
            </button>
            <button
              onClick={() => navigate("/movies")}
              className="px-6 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========== RENDER SUCCESS STATE ==========
  if (step === "success" && bookingData) {
    const displayMovie = bookingData.movie;
    const displayShowtime = bookingData.showtime;
    const displaySeats =
      bookingData.seats?.map((s) => ({ id: s.seat_id || s.id })) || [];
    const displayBookingCode = bookingData.bookingCode;
    const displayTicketTotal = bookingData.booking?.total_price || 0;
    const ticketUrl = `${window.location.origin}/ticket/${displayBookingCode}`;

    return (
      <div className="min-h-screen pt-16" style={{ background: "var(--color-cinema-bg)" }}>
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
                <h2 className="text-white text-xl font-bold">
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
            {/* Left - Ticket Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div
                className="rounded-2xl p-5 mb-4"
                style={{
                  background: "var(--color-cinema-surface)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Ticket size={15} style={{ color: "#e50914" }} />
                  <h3 className="text-white font-bold text-sm">Thông tin vé</h3>
                </div>

                <div className="flex gap-3 mb-4">
                  {displayMovie?.poster && (
                    <img
                      src={displayMovie.poster}
                      alt={displayMovie.title}
                      className="w-16 h-22 object-cover rounded-xl"
                    />
                  )}
                  <div className="flex-1">
                    <div className="text-white font-bold text-sm">
                      {displayMovie?.title || "Đang cập nhật"}
                    </div>
                    <div className="flex gap-1.5 mt-1.5">
                      <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-red-500/20 text-red-400">
                        {displayMovie?.rating || "P"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {[
                    {
                      icon: MapPin,
                      label: "Rạp",
                      value: displayShowtime?.cinema_name || "CGV",
                    },
                    {
                      icon: Calendar,
                      label: "Ngày",
                      value: displayShowtime?.start_time
                        ? new Date(
                            displayShowtime.start_time,
                          ).toLocaleDateString("vi-VN")
                        : "Đang cập nhật",
                    },
                    {
                      icon: Clock,
                      label: "Giờ chiếu",
                      value: displayShowtime?.start_time
                        ? new Date(
                            displayShowtime.start_time,
                          ).toLocaleTimeString("vi-VN")
                        : "Đang cập nhật",
                    },
                    {
                      icon: Film,
                      label: "Phòng",
                      value: displayShowtime?.room_id || "1",
                    },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center gap-2.5">
                      <row.icon
                        size={12}
                        style={{ color: "#e50914", opacity: 0.8 }}
                      />
                      <span className="text-zinc-400 text-xs min-w-[64px]">
                        {row.label}
                      </span>
                      <span className="text-white text-xs font-semibold">
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Armchair
                      size={12}
                      style={{ color: "rgba(255,255,255,0.4)" }}
                    />
                    <span className="text-xs text-white/40">Ghế đã đặt</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {displaySeats.map((seat) => (
                      <span
                        key={seat.id}
                        className="px-2 py-1 rounded-lg text-xs font-bold bg-white/10 text-white"
                      >
                        {seat.id}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div
                className="rounded-2xl p-5"
                style={{
                  background: "var(--color-cinema-surface)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <h3 className="text-white font-bold text-sm mb-3">
                  Chi tiết thanh toán
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-zinc-400">
                    <span>{displaySeats.length} vé xem phim</span>
                    <span>{formatCurrency(displayTicketTotal)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-white/10">
                    <span className="text-white font-bold">
                      Tổng thanh toán
                    </span>
                    <span className="text-orange-400 font-bold text-base">
                      {formatCurrency(displayTicketTotal)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => navigate("/")}
                  className="flex-1 py-3 rounded-xl text-sm bg-white/10 hover:bg-white/20 transition"
                >
                  Về trang chủ
                </button>
                <button
                  onClick={() => navigate("/movies")}
                  className="flex-1 py-3 rounded-xl text-sm bg-red-600 hover:bg-red-700 transition"
                >
                  Đặt vé khác
                </button>
              </div>
            </motion.div>

            {/* Right - QR Code */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div
                className="rounded-2xl p-5 text-center"
                style={{
                  background: "var(--color-cinema-surface)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <p className="text-zinc-400 text-xs mb-1 uppercase tracking-widest">
                  Mã đặt vé
                </p>
                <div className="text-white text-3xl tracking-wider mb-1 font-mono font-black">
                  {displayBookingCode}
                </div>
                <div className="flex items-center justify-center gap-1.5">
                  <CheckCircle size={13} style={{ color: "#22c55e" }} />
                  <span className="text-green-400 text-xs">Đã xác nhận</span>
                </div>
              </div>

              <div
                className="rounded-2xl mt-4 overflow-hidden"
                style={{
                  background: "var(--color-cinema-surface)",
                  border: "1px solid rgba(229,9,20,0.25)",
                }}
              >
                <div className="px-5 py-3 flex items-center gap-2 bg-gradient-to-r from-red-500/15 to-red-500/05 border-b border-red-500/15">
                  <QrCode size={16} style={{ color: "#e50914" }} />
                  <span className="text-white text-sm font-bold">
                    Vé điện tử (E-Ticket)
                  </span>
                </div>
                <div className="p-5 flex flex-col items-center">
                  <div className="p-3 rounded-2xl mb-3 bg-white">
                    <QRCodeSVG
                      value={ticketUrl}
                      size={160}
                      bgColor="#ffffff"
                      fgColor="#07070f"
                      level="H"
                    />
                  </div>
                  <p className="text-center text-zinc-400 text-xs mb-4">
                    📱 Quét mã QR để xem vé điện tử
                    <br />
                    Xuất trình tại cổng soát vé khi check-in
                  </p>
                  <button
                    onClick={() =>
                      navigate(`/ticket/${displayBookingCode}`, {
                        state: { fromSuccess: true },
                      })
                    }
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
                style={{
                  background: "var(--color-cinema-surface)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-red-500 font-bold">CINE STAR</span>
                  </div>
                  <button
                    onClick={() => setShowQRModal(false)}
                    className="text-white/40 hover:text-white"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="p-4 rounded-2xl mb-4 bg-white inline-block">
                  <QRCodeSVG
                    value={ticketUrl}
                    size={240}
                    bgColor="#ffffff"
                    fgColor="#07070f"
                    level="H"
                  />
                </div>
                <p className="text-zinc-400 text-sm mb-1">
                  {displayMovie?.title}
                </p>
                <p className="text-zinc-400 text-xs mb-4">
                  {displayShowtime?.start_time
                    ? new Date(displayShowtime.start_time).toLocaleString()
                    : ""}
                </p>
                <div className="text-white text-xl tracking-wider mb-4 font-mono font-black">
                  {displayBookingCode}
                </div>
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

  // ========== RENDER CONFIRMATION STATE (bình thường) ==========
  // Nếu đang trong callback nhưng chưa có dữ liệu, hiển thị loading
  if (isPaymentCallback && !bookingData && !isFetchingBooking) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--color-cinema-bg)" }}
      >
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-3 border-red-500 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-white">Đang xử lý thanh toán...</p>
        </div>
      </div>
    );
  }

  // Nếu không có dữ liệu (không phải callback), hiển thị thông báo
  if (!showtime || !movie) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--color-cinema-bg)" }}
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

  // Render form xác nhận thanh toán
  return (
    <div className="min-h-screen pt-16" style={{ background: "var(--color-cinema-bg)" }}>
      {/* Header */}
      <div
        className="border-b border-zinc-700 sticky top-0 z-10"
        style={{ background: "var(--color-cinema-surface)" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm mb-3 transition"
          >
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column */}
          <div className="flex-1 space-y-4">
            {/* Movie & Showtime Info */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: "var(--color-cinema-surface)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Ticket className="w-4 h-4 text-red-500" /> Thông tin vé
              </h3>
              <div className="flex gap-4">
                {movie.poster && (
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-20 h-28 object-cover rounded-xl flex-shrink-0"
                  />
                )}
                <div className="flex-1 space-y-2">
                  <div>
                    <p className="text-white font-bold">{movie.title}</p>
                    <p className="text-zinc-400 text-xs">
                      {movie.originalTitle || ""}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-zinc-400 text-xs">Rạp chiếu</p>
                      <p className="text-zinc-200 text-xs font-semibold">
                        {showtime.cinema_name || "CGV"}
                      </p>
                    </div>
                    <div>
                      <p className="text-zinc-400 text-xs">Suất chiếu</p>
                      <p className="text-zinc-200 text-xs font-semibold">
                        {new Date(showtime.start_time).toLocaleTimeString(
                          "vi-VN",
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-zinc-400 text-xs">Phòng</p>
                      <p className="text-zinc-200 text-xs font-semibold">
                        {showtime.room_id || "1"}
                      </p>
                    </div>
                    <div>
                      <p className="text-zinc-400 text-xs">Ghế</p>
                      <p className="text-zinc-200 text-xs font-semibold">
                        {seats.map((s) => s.id).join(", ")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Combos */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: "var(--color-cinema-surface)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <h3 className="text-white font-semibold mb-4">
                🍿 Thêm combo bắp nước (tuỳ chọn)
              </h3>
              <div className="space-y-3">
                {foods.map((food) => {
                  const count = comboCounts[food.food_id] || 0;
                  return (
                    <div
                      key={food.food_id}
                      className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-700"
                    >
                      <div>
                        <p className="text-zinc-200 text-sm">{food.name}</p>
                        <p className="text-red-400 text-xs font-semibold mt-0.5">
                          {food.price_formatted}{" "}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateCombo(food.food_id, -1)}
                          disabled={count === 0}
                          className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-white disabled:opacity-30 hover:bg-zinc-600 transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-white text-sm font-bold">
                          {count}
                        </span>
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

            {/* Promo Code */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: "var(--color-cinema-surface)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
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
                    setPromoDiscountAmount(0);
                  }}
                  placeholder="Nhập mã khuyến mãi"
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-red-500 transition"
                />
                <button
                  onClick={handleApplyPromo}
                  className="px-4 py-2.5 rounded-xl text-white text-sm bg-red-600 hover:bg-red-700 transition"
                >
                  Áp dụng
                </button>
              </div>
              {promoApplied && (
                <p className="text-green-400 text-xs mt-2 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Áp dụng thành công! Giảm{" "}
                  {formatCurrency(discount)}{" "}
                </p>
              )}
              {promoError && (
                <p className="text-red-400 text-xs mt-2">{promoError}</p>
              )}
              <p className="text-zinc-400 text-xs mt-2">
                Mã khuyến mãi áp dụng cho vé xem phim (không áp dụng cho combo).
              </p>
            </div>

            {/* Payment Methods */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: "var(--color-cinema-surface)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-400" /> Phương thức
                thanh toán
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                      selectedPaymentMethod === method.id
                        ? "border-red-500 bg-red-500/10"
                        : "border-zinc-700 bg-zinc-900 hover:border-zinc-600"
                    }`}
                  >
                    <span className="text-xl">{method.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs truncate font-semibold ${selectedPaymentMethod === method.id ? "text-white" : "text-zinc-300"}`}
                      >
                        {method.label}
                      </p>
                      <p className="text-zinc-400 text-xs">{method.desc}</p>
                    </div>
                    {selectedPaymentMethod === method.id && (
                      <div className="w-4 h-4 rounded-full flex items-center justify-center bg-red-600">
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

          {/* Right Column - Summary */}
          <div className="lg:w-80">
            <div
              className="rounded-2xl p-5 sticky top-20"
              style={{
                background: "var(--color-cinema-surface)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <h3 className="text-white font-bold mb-4">Tóm tắt đơn hàng</h3>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between text-zinc-400">
                  <span>{seats.length} vé xem phim</span>
                  <span>{formatCurrency(ticketTotal)}</span>
                </div>
                {comboTotal > 0 && (
                  <div className="flex justify-between text-zinc-400">
                    <span>Combo bắp nước</span>
                    <span>{formatCurrency(comboTotal)}</span>
                  </div>
                )}
                {promoApplied && (
                  <div className="flex justify-between text-green-400">
                    <span>Giảm giá</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-400">
                  <span>Phí dịch vụ</span>
                  <span>Miễn phí</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-3 border-t border-zinc-700 mb-4">
                <span className="text-white font-bold">Tổng thanh toán</span>
                <span className="text-lg text-red-500 font-bold">
                  {formatCurrency(grandTotal)}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-4 rounded-xl p-3 bg-green-500/10 border border-green-500/20">
                <Shield className="w-4 h-4 text-green-500 flex-shrink-0" />
                <p className="text-green-400 text-xs">
                  Thanh toán được mã hóa SSL an toàn 100%
                </p>
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
                    Thanh toán {formatCurrency(grandTotal)}
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
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              }}
            >
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-5 border border-red-500/20">
                  <AlertCircle size={32} className="text-red-500" />
                </div>

                <h3 className="text-white text-xl font-bold mb-3 tracking-tight">
                  Giao dịch chưa hoàn tất!
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                  Nếu thoát ra, các ghế bạn đang giữ có thể bị hủy. Bạn có muốn
                  tiếp tục thanh toán không?
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
    </div>
  );
}
