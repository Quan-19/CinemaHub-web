// ProfilePage.jsx - Refined Redesign
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
  ArrowLeft,
  Camera,
  History,
  Settings,
  Armchair,
  Search,
  Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
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
  today.getDate()
).toISOString().split("T")[0];
const minDob = new Date(
  today.getFullYear() - 120,
  today.getMonth(),
  today.getDate()
).toISOString().split("T")[0];

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
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [posterErrors, setPosterErrors] = useState({});

  const [moviePosterCache, setMoviePosterCache] = useState({});
  const [allMovies, setAllMovies] = useState([]);

  const parseCustomDate = (dateString) => {
    if (!dateString) return null;
    try {
      let match = dateString.match(/(\d{1,2}):(\d{1,2}):(\d{1,2})\s+(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      if (!match) {
        match = dateString.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{1,2}):(\d{1,2})/);
      }
      if (match) {
        let hour, minute, second, day, month, year;
        if (match[1].length <= 2 && match[2].length <= 2 && match[3].length <= 2 && match[1] <= 23) {
          hour = parseInt(match[1]); minute = parseInt(match[2]); second = parseInt(match[3]);
          day = parseInt(match[4]); month = parseInt(match[5]) - 1; year = parseInt(match[6]);
        } else {
          day = parseInt(match[1]); month = parseInt(match[2]) - 1; year = parseInt(match[3]);
          hour = parseInt(match[4]); minute = parseInt(match[5]); second = parseInt(match[6]);
        }
        const date = new Date(year, month, day, hour, minute, second);
        if (!isNaN(date.getTime())) return date;
      }
      return null;
    } catch { return null; }
  };

  const formatDisplayDateTime = (dateValue) => {
    if (!dateValue) return "Đang cập nhật";
    const date = typeof dateValue === "string" ? parseCustomDate(dateValue) : dateValue;
    if (!date) return "Đang cập nhật";
    return date.toLocaleDateString("vi-VN", {
      year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
    });
  };

  const fetchWithAuth = async (url) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return null;
      const token = await currentUser.getIdToken(true);
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (!response.ok) return null;
      return await response.json();
    } catch (error) { return null; }
  };

  const loadAllMovies = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/movies`);
      if (response.ok) {
        const movies = await response.json();
        setAllMovies(movies);
      }
    } catch (error) { console.error(error); }
  };

  const getFullPosterUrl = (posterPath) => {
    if (!posterPath || typeof posterPath !== "string") return null;
    if (posterPath.startsWith("http") || posterPath.startsWith("data:")) return posterPath;
    return `${API_BASE_URL}${posterPath.startsWith("/") ? "" : "/"}${posterPath}`;
  };

  const fetchMoviePoster = async (movieName) => {
    if (!movieName || movieName === "Đang cập nhật") return null;
    if (moviePosterCache[movieName]) return moviePosterCache[movieName];
    try {
      let movies = allMovies;
      if (movies.length === 0) {
        const response = await fetch(`${API_BASE_URL}/api/movies`);
        if (!response.ok) return null;
        movies = await response.json();
      }
      const movie = movies.find(m =>
        m.title?.toLowerCase().includes(movieName.toLowerCase()) ||
        m.originalTitle?.toLowerCase().includes(movieName.toLowerCase())
      );
      if (movie?.poster) {
        const url = getFullPosterUrl(movie.poster);
        setMoviePosterCache(prev => ({ ...prev, [movieName]: url }));
        return url;
      }
      return null;
    } catch { return null; }
  };

  useEffect(() => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    getDoc(userRef).then(snap => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.phone) setPhone(data.phone);
        if (data.dob) setDob(data.dob);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  useEffect(() => { loadAllMovies(); }, []);

  useEffect(() => {
    if (!user || activeTab !== "history") return;
    const fetchBookings = async () => {
      setLoadingHistory(true);
      try {
        const data = await fetchWithAuth(`${API_BASE_URL}/api/booking-history`);
        if (!data || !Array.isArray(data)) {
          setBookings([]);
          return;
        }
        const formatted = [];
        for (const booking of data) {
          const bookingDate = parseCustomDate(booking.booking_date);
          const startTime = parseCustomDate(booking.start_time);
          let posterUrl = booking.poster_url ? getFullPosterUrl(booking.poster_url) : await fetchMoviePoster(booking.movie_name);
          formatted.push({
            booking_id: booking.booking_id,
            booking_date: bookingDate,
            booking_date_raw: booking.booking_date,
            total_amount: parseFloat(booking.total_amount || 0),
            ticket_amount: parseFloat(booking.ticket_amount || 0),
            foods_amount: parseFloat(booking.foods_amount || 0),
            food_items: booking.food_items,
            payment_status: booking.booking_status,
            movie_name: booking.movie_name || "Đang cập nhật",
            poster_url: posterUrl,
            duration: booking.duration,
            room_name: booking.room_name || "Đang cập nhật",
            cinema_name: booking.cinema_name || "Đang cập nhật",
            seats: booking.seats || [],
            start_time: startTime,
            start_time_raw: booking.start_time,
            formatted_show_time: startTime ? startTime.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : null,
            formatted_show_date: startTime ? startTime.toLocaleDateString("vi-VN") : null,
          });
        }
        setBookings(formatted);
      } catch { setBookings([]); } finally { setLoadingHistory(false); }
    };
    fetchBookings();
  }, [user, activeTab, allMovies]);

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = (b.movie_name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || b.payment_status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handlePosterError = (bookingId) => setPosterErrors(prev => ({ ...prev, [bookingId]: true }));
  const getPosterUrl = (booking) => posterErrors[booking.booking_id] ? FALLBACK_POSTER : (booking.poster_url || FALLBACK_POSTER);

  if (!user) { navigate("/auth"); return null; }

  const handleLogout = async () => { await logout(); navigate("/"); };

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(val);
    setPhoneError(val && !/^0\d{9}$/.test(val) ? "Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0" : "");
  };

  const handleDobChange = (e) => {
    const val = e.target.value;
    setDob(val);
    setDobError(val < minDob || val > maxDob ? "Ngày sinh không hợp lệ" : "");
  };

  const handleSave = async () => {
    if (phoneError || dobError) return;
    setSaving(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, { phone, dob, updatedAt: serverTimestamp() }, { merge: true });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { } finally { setSaving(false); }
  };

  const formatCurrency = (amount) => amount ? new Intl.NumberFormat("vi-VN").format(amount) + " đ" : "0 đ";

  const tabs = [
    { id: "profile", label: "Cá nhân", icon: User },
    { id: "history", label: "Lịch sử", icon: History },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="h-10 w-10 border-4 border-cinema-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-zinc-200 pb-20 pt-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-white sm:text-4xl"
            >
              Hồ sơ <span className="text-cinema-primary text-gradient">Cá nhân</span>
            </motion.h1>
            <p className="mt-1 text-zinc-500 text-sm">Quản lý thông tin và theo dõi lịch sử đặt vé của bạn.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate("/")} className="px-4 py-2 rounded-xl bg-zinc-800/50 border border-zinc-700 hover:bg-zinc-800 transition-all flex items-center gap-2 text-xs font-semibold">
              <ArrowLeft className="h-4 w-4" /> Quay lại
            </button>
            <button onClick={handleLogout} className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-500 transition-all flex items-center gap-2 text-xs font-semibold">
              <LogOut className="h-4 w-4" /> Đăng xuất
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Profile Summary */}
          <aside className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 rounded-3xl border border-white/5 bg-zinc-900/50 shadow-xl flex flex-col items-center text-center"
            >
              <div className="relative mb-6">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} referrerPolicy="no-referrer" className="h-24 w-24 rounded-full border-4 border-zinc-800 object-cover shadow-2xl" />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-zinc-800 flex items-center justify-center border-2 border-zinc-700">
                    <User className="h-10 w-10 text-zinc-500" />
                  </div>
                )}
                <button className="absolute bottom-0 right-0 p-1.5 bg-cinema-primary rounded-full text-white shadow-lg">
                  <Camera className="h-3 w-3" />
                </button>
              </div>
              <h2 className="text-lg font-bold text-white mb-1">{user.displayName || "Thành viên"}</h2>
              <p className="text-zinc-500 text-xs mb-6 truncate max-w-full">{user.email}</p>

              <div className="w-full h-px bg-zinc-800 mb-6" />

              <nav className="w-full space-y-2">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm border ${activeTab === tab.id
                      ? "bg-cinema-primary text-white border-cinema-primary"
                      : "text-zinc-400 border-transparent hover:bg-zinc-800"
                      }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </motion.div>
          </aside>

          {/* Main Content */}
          <section className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {activeTab === "profile" && (
                <motion.div key="prof" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Settings className="h-5 w-5 text-cinema-primary" />
                    <h3 className="text-xl font-bold text-white">Chỉnh sửa thông tin</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-3xl border border-white/5 bg-zinc-900/30 space-y-5">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Họ và tên</label>
                        <p className="text-sm font-semibold text-white px-1">{user.displayName || "N/A"}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Email</label>
                        <p className="text-sm font-semibold text-white px-1 truncate">{user.email}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Xác thực</label>
                        <span className="inline-block px-2 py-0.5 bg-zinc-800 text-zinc-400 text-[10px] rounded-md border border-zinc-700">
                          {user.providerData?.[0]?.providerId === "google.com" ? "Google Account" : "Hệ thống"}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 rounded-3xl border border-white/5 bg-zinc-900/30 space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Số điện thoại</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                          <input type="tel" value={phone} onChange={handlePhoneChange} placeholder="0xxxxxxxxx" className="w-full pl-11 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-sm text-white focus:border-cinema-primary outline-none transition-all" />
                        </div>
                        {phoneError && <p className="text-[10px] text-red-500 mt-1">{phoneError}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Ngày sinh</label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                          <input type="date" value={dob} onChange={handleDobChange} min={minDob} max={maxDob} className="w-full pl-11 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-sm text-white focus:border-cinema-primary outline-none transition-all [color-scheme:dark]" />
                        </div>
                        {dobError && <p className="text-[10px] text-red-500 mt-1">{dobError}</p>}
                      </div>

                      <button onClick={handleSave} disabled={saving || !!phoneError || !!dobError} className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${saved ? "bg-emerald-600" : saving ? "bg-zinc-800 opacity-50" : "bg-cinema-primary hover:bg-cinema-primary/90"} text-white`}>
                        {saving ? <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : saved ? <CheckCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                        {saving ? "Đang lưu..." : saved ? "Đã cập nhật" : "Lưu thay đổi"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "history" && (
                <motion.div key="hist" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                    <div className="flex items-center gap-2">
                      <Ticket className="h-5 w-5 text-cinema-primary" />
                      <h3 className="text-xl font-bold text-white">Lịch sử đặt vé</h3>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase px-2 py-0.5 bg-zinc-900 rounded-lg border border-zinc-800 ml-1">{filteredBookings.length} Vé</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      {/* Search Bar */}
                      <div className="relative flex-1 sm:w-48">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                        <input
                          type="text"
                          placeholder="Tìm phim..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full bg-zinc-900/50 border border-white/5 rounded-xl py-1.5 pl-8 pr-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-cinema-primary/30 transition-all"
                        />
                      </div>

                      {/* Status Filter */}
                      <div className="flex items-center gap-1 bg-zinc-900/50 p-1 rounded-xl border border-white/5">
                        {['all', 'paid', 'pending', 'cancelled'].map((status) => (
                          <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all uppercase tracking-tighter ${filterStatus === status
                              ? 'bg-cinema-primary text-white shadow-lg'
                              : 'text-zinc-500 hover:text-white'
                              }`}
                          >
                            {status === 'all' ? 'Tất cả' : status === 'paid' ? 'Đã thanh toán' : status === 'pending' ? 'Chờ xử lý' : 'Đã hủy'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {loadingHistory ? (
                    <div className="py-20 text-center text-zinc-500 text-sm font-medium italic">Đang tải dữ liệu...</div>
                  ) : filteredBookings.length === 0 ? (
                    <div className="py-20 text-center bg-zinc-900/20 border border-dashed border-zinc-800 rounded-3xl">
                      <Ticket className="h-10 w-10 text-zinc-800 mx-auto mb-4" />
                      <p className="text-zinc-500 text-sm">Không tìm thấy giao dịch nào.</p>
                      {(searchTerm || filterStatus !== 'all') && (
                        <button onClick={() => { setSearchTerm(""); setFilterStatus("all"); }} className="mt-4 px-6 py-2 bg-zinc-800 text-white rounded-xl text-xs font-bold hover:bg-zinc-700 transition-all">Đặt lại bộ lọc</button>
                      )}
                    </div>
                  ) : (
                    <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredBookings.map(booking => (
                          <div key={booking.booking_id} onClick={() => { setSelectedBooking(booking); setShowModal(true); }} className="group p-3 border border-white/5 bg-zinc-900/40 rounded-[1.5rem] hover:border-cinema-primary/30 transition-all cursor-pointer flex gap-4 overflow-hidden">
                            <img src={getPosterUrl(booking)} alt={booking.movie_name} className="w-20 h-28 rounded-xl object-cover shadow-lg group-hover:scale-105 transition-transform duration-500" onError={() => handlePosterError(booking.booking_id)} />
                            <div className="flex-1 flex flex-col justify-between py-1">
                              <div>
                                <h4 className="text-white font-bold text-sm line-clamp-1">{booking.movie_name}</h4>
                                <p className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1.5"><Clock className="h-3 w-3 text-cinema-primary" /> {booking.formatted_show_time} • {booking.formatted_show_date}</p>
                                <p className="text-[10px] text-zinc-500 mt-0.5 flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {booking.cinema_name}</p>
                              </div>
                              <div className="flex justify-between items-center pt-2 border-t border-zinc-800/50">
                                <span className="text-cinema-primary font-bold text-sm leading-none">{formatCurrency(booking.total_amount)}</span>
                                <div className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-tighter flex items-center gap-1 ${booking.payment_status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' :
                                  booking.payment_status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                                    'bg-rose-500/10 text-rose-500'
                                  }`}>
                                  {booking.payment_status === 'paid' ? <CheckCircle className="h-2.5 w-2.5" /> :
                                    booking.payment_status === 'pending' ? <Clock className="h-2.5 w-2.5" /> :
                                      <X className="h-2.5 w-2.5" />}
                                  {booking.payment_status === 'paid' ? 'Thành công' :
                                    booking.payment_status === 'pending' ? 'Chờ xử lý' : 'Đã hủy'}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </div>

      {/* Basic Modal */}
      <AnimatePresence>
        {showModal && selectedBooking && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-[#12121e] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="p-5 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-lg font-bold text-white uppercase tracking-tight">Chi tiết vé</h3>
                <button onClick={() => setShowModal(false)} className="p-1 hover:bg-white/5 rounded-full text-zinc-500"><X /></button>
              </div>
              <div className="p-8 space-y-6 overflow-y-auto">
                <div className="flex gap-6">
                  <img src={getPosterUrl(selectedBooking)} alt={selectedBooking.movie_name} className="w-28 h-40 object-cover rounded-xl shadow-lg flex-shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div>
                      <h4 className="text-lg font-bold text-white leading-tight mb-1">{selectedBooking.movie_name}</h4>
                      <span className={`inline-block px-2 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider ${selectedBooking.payment_status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' :
                          selectedBooking.payment_status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                            'bg-rose-500/10 text-rose-500'
                        }`}>
                        {selectedBooking.payment_status === 'paid' ? 'Đã xác nhận' :
                          selectedBooking.payment_status === 'pending' ? 'Chờ xử lý' : 'Đã hủy'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2 border-t border-white/5 pt-3">
                      <div className="flex items-center gap-2 text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-cinema-primary" />
                        <span className="text-zinc-400">Thời gian:</span>
                        <span className="text-white font-bold">{selectedBooking.formatted_show_time} • {selectedBooking.formatted_show_date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px]">
                        <Ticket className="w-3.5 h-3.5 text-cinema-primary" />
                        <span className="text-zinc-400">Mã vé:</span>
                        <span className="text-white font-bold">#{selectedBooking.booking_id}</span>
                      </div>
                      <div className="flex items-start gap-2 text-[11px]">
                        <MapPin className="w-3.5 h-3.5 text-cinema-primary mt-0.5" />
                        <div>
                          <span className="text-zinc-400">Rạp/Phòng:</span>
                          <p className="text-white font-bold leading-tight mt-0.5">{selectedBooking.cinema_name} / {selectedBooking.room_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[11px]">
                        <Armchair className="w-3.5 h-3.5 text-cinema-primary" />
                        <span className="text-zinc-400">Ghế:</span>
                        <span className="text-white font-bold">{selectedBooking.seats?.join(", ") || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-zinc-800 flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="space-y-2 bg-white/[0.03] p-3 rounded-2xl border border-white/10 max-w-[220px]">
                      <p className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Chi tiết thanh toán</p>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-zinc-400">Tiền vé:</span>
                        <span className="text-white font-bold">{formatCurrency(selectedBooking.ticket_amount)}</span>
                      </div>
                      {selectedBooking.foods_amount > 0 && (
                        <div className="flex justify-between items-start gap-4 pt-1.5 border-t border-white/5 text-[11px]">
                          <span className="text-zinc-400 font-medium leading-relaxed italic">
                            {selectedBooking.food_items || "Bắp nước"}:
                          </span>
                          <span className="text-white font-bold whitespace-nowrap">
                            {formatCurrency(selectedBooking.foods_amount)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right flex flex-col justify-between h-full py-1">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Tổng thanh toán</p>
                      <p className="text-3xl font-bold text-cinema-primary leading-none tracking-tight">{formatCurrency(selectedBooking.total_amount)}</p>
                    </div>
                    <div className="mt-6">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Ngày đặt: {formatDisplayDateTime(selectedBooking.booking_date_raw || selectedBooking.booking_date)}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-zinc-900/50">
                <button onClick={() => setShowModal(false)} className="w-full py-3 bg-zinc-100 hover:bg-white text-black font-bold rounded-xl transition-all">Đóng</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default ProfilePage;
