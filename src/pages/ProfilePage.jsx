// ProfilePage.jsx - Fixed with correct poster URL from movies API
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  LogOut,
  ShieldCheck,
  Phone,
  Calendar,
  Save,
  Ticket,
  ChevronRight,
  CreditCard,
  Clock,
  MapPin,
  Film,
  Calendar as CalendarIcon,
  X,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { getAuth } from "firebase/auth";

// Base URL cho API
const API_BASE_URL = "http://localhost:5000";

// Fallback image as data URL
const FALLBACK_POSTER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='112' viewBox='0 0 80 112'%3E%3Crect width='80' height='112' fill='%231f1f2e'/%3E%3Crect x='10' y='10' width='60' height='92' rx='4' fill='%2327273a'/%3E%3Cpath d='M35 45 L45 45 L40 55 Z' fill='%233a3a4e'/%3E%3Crect x='25' y='60' width='30' height='4' fill='%233a3a4e'/%3E%3Crect x='25' y='68' width='30' height='4' fill='%233a3a4e'/%3E%3Crect x='25' y='76' width='20' height='4' fill='%233a3a4e'/%3E%3C/svg%3E";

const today = new Date();
const maxDob = new Date(
  today.getFullYear() - 5,
  today.getMonth(),
  today.getDate(),
)
  .toISOString()
  .split("T")[0];
const minDob = new Date(
  today.getFullYear() - 120,
  today.getMonth(),
  today.getDate(),
)
  .toISOString()
  .split("T")[0];

function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const auth = getAuth();

  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [dobError, setDobError] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [posterErrors, setPosterErrors] = useState({});

  // Cache for movie posters
  const [moviePosterCache, setMoviePosterCache] = useState({});
  // Cache for all movies
  const [allMovies, setAllMovies] = useState([]);

  // Custom parser for format "HH:mm:ss DD/MM/YYYY" or "DD/MM/YYYY HH:mm:ss"
  const parseCustomDate = (dateString) => {
    if (!dateString) return null;

    try {
      let match = dateString.match(
        /(\d{1,2}):(\d{1,2}):(\d{1,2})\s+(\d{1,2})\/(\d{1,2})\/(\d{4})/,
      );

      if (!match) {
        match = dateString.match(
          /(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{1,2}):(\d{1,2})/,
        );
      }

      if (match) {
        let hour, minute, second, day, month, year;

        if (
          match[1].length <= 2 &&
          match[2].length <= 2 &&
          match[3].length <= 2 &&
          match[1] <= 23
        ) {
          hour = parseInt(match[1]);
          minute = parseInt(match[2]);
          second = parseInt(match[3]);
          day = parseInt(match[4]);
          month = parseInt(match[5]) - 1;
          year = parseInt(match[6]);
        } else {
          day = parseInt(match[1]);
          month = parseInt(match[2]) - 1;
          year = parseInt(match[3]);
          hour = parseInt(match[4]);
          minute = parseInt(match[5]);
          second = parseInt(match[6]);
        }

        const date = new Date(year, month, day, hour, minute, second);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }

      return null;
    } catch {
      return null;
    }
  };

  // Format date for display
  const formatDisplayDate = (dateValue) => {
    if (!dateValue) return "Đang cập nhật";
    const date =
      typeof dateValue === "string" ? parseCustomDate(dateValue) : dateValue;
    if (!date) return "Đang cập nhật";
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatDisplayDateTime = (dateValue) => {
    if (!dateValue) return "Đang cập nhật";
    const date =
      typeof dateValue === "string" ? parseCustomDate(dateValue) : dateValue;
    if (!date) return "Đang cập nhật";
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Helper function to fetch API with auth token
  const fetchWithAuth = async (url) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error("No current user");
        return null;
      }

      const token = await currentUser.getIdToken(true);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error(`API ${url} returned ${response.status}`);
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Fetch error (${url}):`, error);
      return null;
    }
  };

  // Load all movies once for caching
  const loadAllMovies = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/movies`);
      if (!response.ok) {
        console.error("Failed to fetch movies:", response.status);
        return;
      }
      const movies = await response.json();
      setAllMovies(movies);
      console.log("Loaded all movies:", movies.length);
    } catch (error) {
      console.error("Error loading movies:", error);
    }
  };

  // Get full poster URL
  // Get full poster URL - FIXED with type checking
  const getFullPosterUrl = (posterPath) => {
    if (!posterPath) return null;
    // Kiểm tra nếu không phải string thì return null
    if (typeof posterPath !== "string") return null;
    if (posterPath.startsWith("http") || posterPath.startsWith("data:")) {
      return posterPath;
    }
    // Nếu là đường dẫn tương đối, thêm base URL
    return `${API_BASE_URL}${posterPath.startsWith("/") ? "" : "/"}${posterPath}`;
  };
  // Fetch movie poster by movie name
  const fetchMoviePoster = async (movieName) => {
    if (!movieName || movieName === "Đang cập nhật") return null;

    // Check cache first
    if (moviePosterCache[movieName]) {
      return moviePosterCache[movieName];
    }

    try {
      // Use cached movies if available
      let movies = allMovies;
      if (movies.length === 0) {
        const response = await fetch(`${API_BASE_URL}/api/movies`);
        if (!response.ok) return null;
        movies = await response.json();
      }

      // Tìm movie theo tên (case-insensitive)
      const movie = movies.find(
        (m) =>
          m.title?.toLowerCase() === movieName.toLowerCase() ||
          m.title?.toLowerCase().includes(movieName.toLowerCase()) ||
          m.originalTitle?.toLowerCase().includes(movieName.toLowerCase()),
      );

      let posterUrl = null;
      if (movie?.poster) {
        posterUrl = getFullPosterUrl(movie.poster);
        console.log(`✅ Found poster for "${movieName}":`, posterUrl);
        setMoviePosterCache((prev) => ({ ...prev, [movieName]: posterUrl }));
      } else {
        console.log(`❌ No poster found for "${movieName}"`);
      }

      return posterUrl;
    } catch (error) {
      console.error("Error fetching movie poster:", error);
      return null;
    }
  };

  // Load existing user data from Firestore
  useEffect(() => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    getDoc(userRef)
      .then((snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.phone) setPhone(data.phone);
          if (data.dob) setDob(data.dob);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  // Load all movies when component mounts
  useEffect(() => {
    loadAllMovies();
  }, []);

  // Load booking history
  // Load booking history - FIXED phần xử lý poster
  useEffect(() => {
    if (!user || activeTab !== "history") return;

    const fetchBookings = async () => {
      setBookingsLoading(true);
      try {
        const data = await fetchWithAuth(`${API_BASE_URL}/api/booking-history`);

        if (!data || !Array.isArray(data)) {
          console.error("No bookings data or invalid format");
          setBookings([]);
          setBookingsLoading(false);
          return;
        }

        // Filter only paid bookings and format
        const formattedBookings = [];

        for (const booking of data.filter((b) => b.booking_status === "paid")) {
          const bookingDate = parseCustomDate(booking.booking_date);
          const startTime = parseCustomDate(booking.start_time);

          // Get poster URL - FIXED with proper type checking
          let posterUrl = null;

          // Kiểm tra nếu booking.poster_url tồn tại và là string
          if (
            booking.poster_url &&
            typeof booking.poster_url === "string" &&
            booking.poster_url !== ""
          ) {
            posterUrl = getFullPosterUrl(booking.poster_url);
          }

          // Nếu chưa có poster, fetch từ movies API
          if (!posterUrl) {
            posterUrl = await fetchMoviePoster(booking.movie_name);
          }

          formattedBookings.push({
            booking_id: booking.booking_id,
            booking_date: bookingDate,
            booking_date_raw: booking.booking_date,
            total_amount: parseFloat(booking.total_amount || 0),
            payment_status: booking.booking_status,
            movie_name: booking.movie_name || "Đang cập nhật",
            poster_url: posterUrl,
            duration: booking.duration,
            room_name: booking.room_name || "Đang cập nhật",
            cinema_name: booking.cinema_name || "Đang cập nhật",
            seats: booking.seats || [],
            start_time: startTime,
            start_time_raw: booking.start_time,
            formatted_show_time: startTime
              ? startTime.toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : null,
            formatted_show_date: startTime
              ? startTime.toLocaleDateString("vi-VN")
              : null,
          });
        }

        console.log("Formatted bookings:", formattedBookings);
        setBookings(formattedBookings);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setBookings([]);
      } finally {
        setBookingsLoading(false);
      }
    };

    fetchBookings();
  }, [user, activeTab, allMovies]);

  // Handle poster image error
  const handlePosterError = (bookingId) => {
    setPosterErrors((prev) => ({ ...prev, [bookingId]: true }));
  };

  // Get poster URL with fallback
  const getPosterUrl = (booking) => {
    if (posterErrors[booking.booking_id]) return FALLBACK_POSTER;
    return booking.poster_url || FALLBACK_POSTER;
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(val);
    if (val && !/^0\d{9}$/.test(val)) {
      setPhoneError("Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0");
    } else {
      setPhoneError("");
    }
  };

  const handleDobChange = (e) => {
    const val = e.target.value;
    setDob(val);
    if (val < minDob || val > maxDob) {
      setDobError("Ngày sinh không hợp lệ");
    } else {
      setDobError("");
    }
  };

  const handleSave = async () => {
    if (phoneError || dobError) return;
    setSaving(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(
        userRef,
        { phone, dob, updatedAt: serverTimestamp() },
        { merge: true },
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Lưu thất bại", err);
    } finally {
      setSaving(false);
    }
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const formatCurrency = (amount) => {
    if (!amount) return "0 đ";
    return new Intl.NumberFormat("vi-VN").format(amount) + " đ";
  };

  const provider = user.providerData?.[0]?.providerId ?? "password";
  const providerLabel =
    provider === "google.com" ? "Google" : "Email / Mật khẩu";

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#0a0a0f" }}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cinema-primary"></div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ background: "#0a0a0f" }}
    >
      <div className="w-full max-w-4xl space-y-4">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-zinc-800">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-6 py-3 text-sm font-medium transition-all relative ${
              activeTab === "profile"
                ? "text-cinema-primary"
                : "text-zinc-400 hover:text-zinc-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Thông tin cá nhân
            </div>
            {activeTab === "profile" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cinema-primary"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-6 py-3 text-sm font-medium transition-all relative ${
              activeTab === "history"
                ? "text-cinema-primary"
                : "text-zinc-400 hover:text-zinc-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              Lịch sử đặt vé
            </div>
            {activeTab === "history" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cinema-primary"></div>
            )}
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <>
            <div
              className="rounded-2xl border border-zinc-700 p-6 flex items-center gap-5"
              style={{ background: "#12121f" }}
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName ?? "avatar"}
                  referrerPolicy="no-referrer"
                  className="h-20 w-20 rounded-full object-cover border-2 border-zinc-700 shrink-0"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-cinema-primary/80 flex items-center justify-center border-2 border-zinc-700 shrink-0">
                  <User className="h-9 w-9 text-white" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-white text-xl font-bold truncate">
                  {user.displayName ?? "Người dùng"}
                </p>
                <p className="text-zinc-400 text-sm mt-0.5 truncate">
                  {user.email}
                </p>
              </div>
            </div>

            <div
              className="rounded-2xl border border-zinc-700 divide-y divide-zinc-800"
              style={{ background: "#12121f" }}
            >
              <div className="flex items-center gap-4 px-5 py-4">
                <User className="h-4 w-4 text-zinc-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-zinc-400 text-xs mb-0.5">Tên hiển thị</p>
                  <p className="text-white text-sm font-medium truncate">
                    {user.displayName ?? "Chưa cập nhật"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 px-5 py-4">
                <Mail className="h-4 w-4 text-zinc-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-zinc-400 text-xs mb-0.5">Email</p>
                  <p className="text-white text-sm font-medium truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 px-5 py-4">
                <ShieldCheck className="h-4 w-4 text-zinc-400 shrink-0" />
                <div>
                  <p className="text-zinc-400 text-xs mb-0.5">
                    Phương thức đăng nhập
                  </p>
                  <p className="text-white text-sm font-medium">
                    {providerLabel}
                  </p>
                </div>
              </div>
            </div>

            <div
              className="rounded-2xl border border-zinc-700 divide-y divide-zinc-800"
              style={{ background: "#12121f" }}
            >
              <div className="px-5 py-4">
                <label className="flex items-center gap-2 text-zinc-400 text-xs font-medium mb-2">
                  <Phone className="h-3.5 w-3.5 text-cinema-primary" />
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="0xxxxxxxxx"
                  maxLength={10}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800/60 px-4 py-2.5 text-sm text-white outline-none placeholder:text-zinc-400 focus:border-cinema-primary focus:ring-1 focus:ring-cinema-primary/40 transition-colors"
                />
                {phoneError && (
                  <p className="mt-1.5 text-xs text-red-400">{phoneError}</p>
                )}
              </div>

              <div className="px-5 py-4">
                <label className="flex items-center gap-2 text-zinc-400 text-xs font-medium mb-2">
                  <Calendar className="h-3.5 w-3.5 text-cinema-primary" />
                  Ngày sinh
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={handleDobChange}
                  min={minDob}
                  max={maxDob}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800/60 px-4 py-2.5 text-sm text-white outline-none focus:border-cinema-primary focus:ring-1 focus:ring-cinema-primary/40 transition-colors"
                  style={{ colorScheme: "dark" }}
                />
                {dobError && (
                  <p className="mt-1.5 text-xs text-red-400">{dobError}</p>
                )}
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving || !!phoneError || !!dobError}
              className={`flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                saved
                  ? "bg-emerald-700 text-white"
                  : saving
                    ? "bg-cinema-primary/60 text-white/70 cursor-not-allowed"
                    : "bg-cinema-primary text-white hover:bg-cinema-primary-dark active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              }`}
            >
              <Save className="h-4 w-4" />
              {saving ? "Đang lưu..." : saved ? "Đã lưu!" : "Lưu thay đổi"}
            </button>
          </>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div
            className="rounded-2xl border border-zinc-700"
            style={{ background: "#12121f" }}
          >
            <div className="p-6 border-b border-zinc-800">
              <h3 className="text-white text-lg font-semibold flex items-center gap-2">
                <Ticket className="h-5 w-5 text-cinema-primary" />
                Lịch sử đặt vé
              </h3>
              <p className="text-zinc-500 text-xs mt-1">
                Các vé đã đặt và thanh toán thành công
              </p>
            </div>

            {bookingsLoading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cinema-primary"></div>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Ticket className="h-8 w-8 text-zinc-600" />
                </div>
                <p className="text-zinc-400">Chưa có vé nào</p>
                <p className="text-zinc-500 text-xs mt-1">
                  Đặt vé ngay để xem phim
                </p>
                <button
                  onClick={() => navigate("/")}
                  className="mt-4 px-5 py-2.5 bg-cinema-primary text-white rounded-xl text-sm font-medium hover:bg-cinema-primary-dark transition-all duration-300"
                >
                  Đặt vé ngay
                </button>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {bookings.map((booking) => (
                  <div
                    key={booking.booking_id}
                    className="p-5 hover:bg-white/5 transition-all duration-300 cursor-pointer group"
                    onClick={() => handleViewDetails(booking)}
                  >
                    <div className="flex gap-5">
                      {/* Poster */}
                      <div className="shrink-0">
                        <img
                          src={getPosterUrl(booking)}
                          alt={booking.movie_name}
                          className="w-20 h-28 object-cover rounded-xl shadow-lg"
                          onError={() => handlePosterError(booking.booking_id)}
                          loading="lazy"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-white font-bold text-base group-hover:text-cinema-primary transition-colors line-clamp-1">
                            {booking.movie_name}
                          </h4>
                          <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-cinema-primary transition-colors shrink-0" />
                        </div>

                        {/* Booking details */}
                        <div className="space-y-1.5 mt-2">
                          <div className="flex items-center gap-2 text-xs">
                            <CalendarIcon className="h-3.5 w-3.5 text-cinema-primary/70" />
                            <span className="text-zinc-400">
                              {formatDisplayDateTime(
                                booking.booking_date_raw ||
                                  booking.booking_date,
                              )}
                            </span>
                          </div>

                          {booking.formatted_show_time &&
                            booking.formatted_show_date && (
                              <div className="flex items-center gap-2 text-xs">
                                <Clock className="h-3.5 w-3.5 text-cinema-primary/70" />
                                <span className="text-zinc-400">
                                  {booking.formatted_show_time} •{" "}
                                  {booking.formatted_show_date}
                                </span>
                              </div>
                            )}

                          <div className="flex items-center gap-2 text-xs">
                            <MapPin className="h-3.5 w-3.5 text-cinema-primary/70" />
                            <span className="text-zinc-400 truncate">
                              {booking.cinema_name} • {booking.room_name}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs">
                            <Film className="h-3.5 w-3.5 text-cinema-primary/70" />
                            <span className="text-zinc-400">
                              Ghế:{" "}
                              {booking.seats?.length > 0
                                ? booking.seats.join(", ")
                                : "N/A"}
                            </span>
                          </div>
                        </div>

                        {/* Price and status */}
                        <div className="flex justify-between items-center mt-3 pt-2 border-t border-zinc-800/50">
                          <div className="flex items-center gap-1">
                            <CreditCard className="h-3.5 w-3.5 text-cinema-primary/70" />
                            <span className="text-cinema-primary font-semibold text-sm">
                              {formatCurrency(booking.total_amount)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-400/10">
                            <CheckCircle className="h-3 w-3 text-emerald-400" />
                            <span className="text-emerald-400 text-xs font-medium">
                              Đã thanh toán
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Logout button */}
        {activeTab === "profile" && (
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-700 px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </button>
        )}
      </div>

      {/* Booking Details Modal */}
      {showModal && selectedBooking && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            style={{ background: "#12121f" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-[#12121f] border-b border-zinc-800 p-4 flex justify-between items-center">
              <h3 className="text-white text-xl font-bold">Chi tiết vé</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-zinc-400" />
              </button>
            </div>

            <div className="p-6">
              {/* Movie info */}
              <div className="flex gap-4 mb-6">
                <img
                  src={getPosterUrl(selectedBooking)}
                  alt={selectedBooking.movie_name}
                  className="w-28 h-40 object-cover rounded-xl shadow-lg"
                  onError={() => handlePosterError(selectedBooking.booking_id)}
                  loading="lazy"
                />
                <div>
                  <h4 className="text-white text-xl font-bold mb-2">
                    {selectedBooking.movie_name}
                  </h4>
                  {selectedBooking.duration && (
                    <p className="text-zinc-400 text-sm">
                      {selectedBooking.duration} phút
                    </p>
                  )}
                </div>
              </div>

              {/* Booking info */}
              <div className="space-y-3 border-t border-zinc-800 pt-4">
                <div className="flex justify-between py-2">
                  <span className="text-zinc-400">Mã đặt vé:</span>
                  <span className="text-white font-mono text-sm">
                    #{selectedBooking.booking_id}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-zinc-400">Ngày đặt:</span>
                  <span className="text-white">
                    {formatDisplayDateTime(
                      selectedBooking.booking_date_raw ||
                        selectedBooking.booking_date,
                    )}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-zinc-400">Rạp:</span>
                  <span className="text-white">
                    {selectedBooking.cinema_name}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-zinc-400">Phòng:</span>
                  <span className="text-white">
                    {selectedBooking.room_name}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-zinc-400">Suất chiếu:</span>
                  <span className="text-white">
                    {selectedBooking.formatted_show_time &&
                    selectedBooking.formatted_show_date
                      ? `${selectedBooking.formatted_show_time} • ${selectedBooking.formatted_show_date}`
                      : "Đang cập nhật"}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-zinc-400">Ghế:</span>
                  <span className="text-white font-semibold">
                    {selectedBooking.seats?.join(", ") || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-t border-zinc-800 mt-2 pt-3">
                  <span className="text-white font-semibold">Tổng tiền:</span>
                  <span className="text-cinema-primary font-bold text-xl">
                    {formatCurrency(selectedBooking.total_amount)}
                  </span>
                </div>
              </div>

              {/* QR Code placeholder */}
              <div className="mt-6 pt-4 border-t border-zinc-800 text-center">
                <p className="text-zinc-500 text-xs">
                  Vui lòng xuất trình mã này tại quầy
                </p>
                <div className="mt-3 inline-block bg-white p-3 rounded-xl">
                  <div className="w-28 h-28 bg-gradient-to-br from-zinc-200 to-zinc-300 flex items-center justify-center rounded-lg">
                    <span className="text-zinc-600 text-xs font-mono text-center break-all px-2">
                      {selectedBooking.booking_id}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
