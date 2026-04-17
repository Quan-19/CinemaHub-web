// src/pages/Orders.jsx - Phiên bản sửa lỗi

import { useState, useEffect } from "react";
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  Ticket,
  CalendarDays,
  DollarSign,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const itemsPerPage = 10;

  const getAuthToken = () => {
    return localStorage.getItem("token") || sessionStorage.getItem("token");
  };

  const fetchAPI = async (url, options = {}) => {
    const token = getAuthToken();
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, { ...options, headers });
      
      if (!response.ok) {
        console.warn(`⚠️ API ${url} returned status ${response.status}`);
        return null;
      }
      
      const text = await response.text();
      
      if (!text || text.trim() === "") {
        console.warn(`⚠️ API ${url} returned empty response`);
        return null;
      }
      
      try {
        const data = JSON.parse(text);
        return data.data || data;
      } catch (parseError) {
        console.warn(`⚠️ API ${url} returned non-JSON response:`, text.substring(0, 100));
        return null;
      }
    } catch (error) {
      console.error(`❌ Fetch error (${url}):`, error);
      return null;
    }
  };

  const fetchBookingSeats = async (bookingId) => {
    const seatsData = await fetchAPI(
      `http://localhost:5000/api/booking-seats/booking/${bookingId}`
    );
    if (Array.isArray(seatsData)) {
      return seatsData.map((seat) => seat.seat_id);
    }
    return [];
  };

  const fetchOrderDetails = async (booking, showtimesCache, moviesCache, cinemasCache, roomsCache) => {
    console.log(`📦 Processing booking ID: ${booking.booking_id}`, booking);

    let totalPrice = booking.total_price ?? booking.total_amount ?? 0;
    let paymentMethod = booking.payment_method;
    let paymentStatus = booking.status;
    let showtime = null;
    let movie = null;
    let cinemaName = null;
    let roomName = null;
    let showDate = null;
    let showTime = null;
    let seatIds = [];

    seatIds = await fetchBookingSeats(booking.booking_id);
    console.log(`💺 Booking ${booking.booking_id} seats:`, seatIds);

    if (booking.showtime_id) {
      if (showtimesCache[booking.showtime_id]) {
        showtime = showtimesCache[booking.showtime_id];
      } else {
        console.log(`📽️ Fetching showtime ${booking.showtime_id}...`);
        showtime = await fetchAPI(
          `http://localhost:5000/api/showtimes/${booking.showtime_id}`
        );
        console.log(`📽️ Showtime response:`, showtime);
        if (showtime) showtimesCache[booking.showtime_id] = showtime;
      }
      
      if (showtime) {
        // Lấy thông tin phim từ movieId
        const movieId = showtime.movieId || showtime.movie_id;
        if (movieId) {
          if (moviesCache[movieId]) {
            movie = moviesCache[movieId];
          } else {
            console.log(`🎬 Fetching movie ${movieId}...`);
            movie = await fetchAPI(
              `http://localhost:5000/api/movies/${movieId}`
            );
            console.log(`🎬 Movie response:`, movie);
            if (movie) moviesCache[movieId] = movie;
          }
        }
        
        // Lấy thông tin phòng chiếu và rạp
        const roomId = showtime.roomId || showtime.room_id;
        if (roomId) {
          if (roomsCache[roomId]) {
            const room = roomsCache[roomId];
            if (room?.cinema_id || room?.cinemaId) {
              const cinemaId = room.cinema_id || room.cinemaId;
              if (cinemasCache[cinemaId]) {
                cinemaName = cinemasCache[cinemaId].name;
              } else {
                console.log(`🏢 Fetching cinema ${cinemaId}...`);
                const cinema = await fetchAPI(
                  `http://localhost:5000/api/cinemas/${cinemaId}`
                );
                console.log(`🏢 Cinema response:`, cinema);
                cinemaName = cinema?.name || "Đang cập nhật";
                if (cinema) cinemasCache[cinemaId] = cinema;
              }
            }
            roomName = room?.name;
          } else {
            console.log(`🏠 Fetching room ${roomId}...`);
            const room = await fetchAPI(
              `http://localhost:5000/api/rooms/${roomId}`
            );
            console.log(`🏠 Room response:`, room);
            if (room) {
              roomsCache[roomId] = room;
              const cinemaId = room.cinema_id || room.cinemaId;
              if (cinemaId) {
                if (cinemasCache[cinemaId]) {
                  cinemaName = cinemasCache[cinemaId].name;
                } else {
                  console.log(`🏢 Fetching cinema ${cinemaId}...`);
                  const cinema = await fetchAPI(
                    `http://localhost:5000/api/cinemas/${cinemaId}`
                  );
                  console.log(`🏢 Cinema response:`, cinema);
                  cinemaName = cinema?.name || "Đang cập nhật";
                  if (cinema) cinemasCache[cinemaId] = cinema;
                }
              }
            }
          }
        }
        
        // Lấy ngày và giờ chiếu
        const showDateRaw = showtime.show_date || showtime.date;
        if (showDateRaw) {
          showDate = new Date(showDateRaw);
        }
        
        showTime = showtime.start_time || showtime.time;
      }
    } else {
      console.warn(`⚠️ Booking ${booking.booking_id} has NO showtime_id!`);
    }

    // Lấy thông tin thanh toán
    try {
      const payment = await fetchAPI(
        `http://localhost:5000/api/payments/booking/${booking.booking_id}`
      );
      if (payment) {
        paymentMethod = payment.method || booking.payment_method;
        paymentStatus = payment.status;
        if (payment.amount && payment.amount > 0) {
          totalPrice = payment.amount;
        }
      }
    } catch (err) {
      console.log(`No payment data for booking ${booking.booking_id}`);
    }

    // Xác định trạng thái cuối cùng
    let finalStatus = "pending";
    if (paymentStatus === "paid" || booking.booking_status === "confirmed" || booking.status === "paid") {
      finalStatus = "paid";
    } else if (
      paymentStatus === "cancelled" ||
      booking.booking_status === "cancelled"
    ) {
      finalStatus = "cancelled";
    }

    // Chuyển đổi totalPrice sang number
    const totalAmountNum = parseFloat(totalPrice) || 0;

    return {
      booking_id: booking.booking_id,
      user_id: booking.user_id,
      showtime_id: booking.showtime_id,
      ticket_code: booking.ticket_code,
      total_amount: totalAmountNum,
      booking_status: booking.booking_status,
      status: finalStatus,
      created_at: booking.created_at,
      updated_at: booking.updated_at,
      payment_method: paymentMethod,
      promo_code: booking.promo_code,
      movie: movie,
      showtime: showtime,
      seat_ids: seatIds,
      formatted_show_date: showDate,
      formatted_show_time: showTime,
      formatted_cinema: cinemaName,
      room_name: roomName,
    };
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const showtimesCache = {};
      const moviesCache = {};
      const cinemasCache = {};
      const roomsCache = {};
      
      console.log("🔄 Fetching bookings from API...");
      const bookings = await fetchAPI("http://localhost:5000/api/bookings");
      console.log("📋 Raw bookings response:", bookings);
      
      if (!bookings || !Array.isArray(bookings)) {
        console.error("❌ Bookings is not an array:", bookings);
        setOrders([]);
        setLoading(false);
        return;
      }

      console.log(`📋 Found ${bookings.length} bookings`);

      const ordersWithDetails = await Promise.all(
        bookings.map(booking => 
          fetchOrderDetails(booking, showtimesCache, moviesCache, cinemasCache, roomsCache)
        )
      );

      console.log("✅ Final orders with details:", ordersWithDetails);

      ordersWithDetails.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      setOrders(ordersWithDetails);
      setTotalPages(Math.ceil(ordersWithDetails.length / itemsPerPage));
    } catch (err) {
      console.error("Error fetching orders:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.booking_id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.movie?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user_id?.toString().includes(searchTerm);
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
            <CheckCircle className="w-3 h-3" />
            Đã thanh toán
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
            <Clock className="w-3 h-3" />
            Chờ thanh toán
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
            <XCircle className="w-3 h-3" />
            Đã hủy
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30">
            {status}
          </span>
        );
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case "vnpay":
        return <CreditCard className="w-4 h-4" />;
      case "momo":
        return <div className="w-4 h-4 font-bold text-purple-400">M</div>;
      case "zalopay":
        return <div className="w-4 h-4 font-bold text-blue-400">Z</div>;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatShowDate = (date) => {
    if (!date) return "N/A";
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const exportToCSV = () => {
    const headers = [
      "Mã đơn",
      "Khách hàng",
      "Phim",
      "Ngày chiếu",
      "Suất chiếu",
      "Rạp",
      "Phòng chiếu",
      "Số vé",
      "Tổng tiền",
      "Trạng thái",
      "PT thanh toán",
      "Ngày đặt",
    ];
    const rows = filteredOrders.map((order) => [
      order.booking_id,
      `User ${order.user_id}`,
      order.movie?.title || "N/A",
      formatShowDate(order.formatted_show_date),
      order.formatted_show_time?.slice(0, 5) || "N/A",
      order.formatted_cinema || "N/A",
      order.room_name || "N/A",
      order.seat_ids?.length || 0,
      order.total_amount,
      order.status === "paid" ? "Đã thanh toán" : "Chờ thanh toán",
      order.payment_method?.toUpperCase() || "N/A",
      formatDate(order.created_at),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute(
      "download",
      `orders_${new Date().toISOString().slice(0, 19)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--color-cinema-bg)" }}
      >
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--color-cinema-bg)" }}>
      <div className="mx-auto w-full px-3 py-6 sm:px-6 lg:px-10">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Quản lý đơn hàng</h1>
            <p className="text-zinc-400 text-sm mt-1">
              Quản lý tất cả đơn đặt vé của khách hàng
            </p>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
          >
            <Download className="w-4 h-4" />
            Xuất CSV
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Tổng đơn hàng</p>
                <p className="text-2xl font-bold text-white">{orders.length}</p>
              </div>
              <Ticket className="w-8 h-8 text-red-500 opacity-50" />
            </div>
          </div>
          <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Đã thanh toán</p>
                <p className="text-2xl font-bold text-green-400">
                  {orders.filter((o) => o.status === "paid").length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </div>
          <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Chờ thanh toán</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {orders.filter((o) => o.status === "pending").length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500 opacity-50" />
            </div>
          </div>
          <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Doanh thu</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(
                    orders
                      .filter((o) => o.status === "paid")
                      .reduce((sum, o) => sum + (o.total_amount || 0), 0)
                  )}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã đơn, phim, khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-400 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-red-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="paid">Đã thanh toán</option>
              <option value="pending">Chờ thanh toán</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        {filteredOrders.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
            <Ticket className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400">Chưa có đơn hàng nào</p>
            <p className="text-zinc-500 text-sm mt-1">
              Đơn hàng sẽ hiển thị sau khi khách hàng đặt vé
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/50">
              <table className="w-full min-w-[900px]">
                <thead className="border-b border-zinc-800 bg-zinc-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">
                      Mã đơn
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">
                      Phim
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">
                      Ngày chiếu
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">
                      Suất chiếu
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">
                      Rạp
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">
                      Số vé
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">
                      Tổng tiền
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((order) => (
                    <tr
                      key={order.booking_id}
                      className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="text-white font-mono text-sm">
                          #{order.booking_id}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-white text-sm font-medium">
                          {order.movie?.title || order.showtime?.movieTitle || "Đang tải..."}
                        </p>
                        <p className="text-zinc-400 text-xs">
                          {order.movie?.duration
                            ? `${order.movie.duration} phút`
                            : order.showtime?.type ? `${order.showtime.type}` : ""}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-zinc-300 text-sm">
                          <CalendarDays className="w-3 h-3 text-zinc-400" />
                          {formatShowDate(order.formatted_show_date)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-zinc-300 text-sm">
                          <Clock className="w-3 h-3 text-zinc-400" />
                          {order.formatted_show_time?.slice(0, 5) || "Đang tải..."}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-zinc-300 text-sm">
                          {order.formatted_cinema || order.showtime?.cinemaName || "Đang tải..."}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-zinc-300 text-sm">
                          <Ticket className="w-3 h-3 text-zinc-400" />
                          {order.seat_ids?.length || 0} vé
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-white font-semibold">
                          {formatCurrency(order.total_amount)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors text-sm"
                        >
                          <Eye className="w-3 h-3" />
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-zinc-400">
                  Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{" "}
                  {Math.min(currentPage * itemsPerPage, filteredOrders.length)}{" "}
                  trên {filteredOrders.length} đơn
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-zinc-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-700 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-white text-sm">
                    Trang {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-zinc-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-700 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">
                  Chi tiết đơn hàng #{selectedOrder.booking_id}
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-zinc-400 text-xs uppercase">
                      Mã đơn hàng
                    </label>
                    <p className="text-white font-mono">
                      {selectedOrder.booking_id}
                    </p>
                  </div>
                  <div>
                    <label className="text-zinc-400 text-xs uppercase">
                      Trạng thái
                    </label>
                    <div>{getStatusBadge(selectedOrder.status)}</div>
                  </div>
                </div>

                <div>
                  <label className="text-zinc-400 text-xs uppercase">
                    Thông tin phim
                  </label>
                  <div className="mt-1 p-3 rounded-lg bg-zinc-800/50">
                    <p className="text-white font-medium">
                      {selectedOrder.movie?.title || selectedOrder.showtime?.movieTitle || "Không có dữ liệu"}
                    </p>
                    {selectedOrder.movie?.duration && (
                      <p className="text-zinc-400 text-sm">
                        Thời lượng: {selectedOrder.movie.duration} phút
                      </p>
                    )}
                    {selectedOrder.showtime?.type && (
                      <p className="text-zinc-400 text-sm">
                        Định dạng: {selectedOrder.showtime.type}
                      </p>
                    )}
                    {selectedOrder.movie?.director && (
                      <p className="text-zinc-400 text-sm">
                        Đạo diễn: {selectedOrder.movie.director}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-zinc-400 text-xs uppercase">
                      Ngày chiếu
                    </label>
                    <p className="text-white">
                      {formatShowDate(selectedOrder.formatted_show_date)}
                    </p>
                  </div>
                  <div>
                    <label className="text-zinc-400 text-xs uppercase">
                      Suất chiếu
                    </label>
                    <p className="text-white">
                      {selectedOrder.formatted_show_time?.slice(0, 5) || "Không có dữ liệu"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-zinc-400 text-xs uppercase">
                      Rạp
                    </label>
                    <p className="text-white">
                      {selectedOrder.formatted_cinema || selectedOrder.showtime?.cinemaName || "Không có dữ liệu"}
                    </p>
                  </div>
                  <div>
                    <label className="text-zinc-400 text-xs uppercase">
                      Phòng chiếu
                    </label>
                    <p className="text-white">
                      {selectedOrder.room_name || selectedOrder.showtime?.roomName || "Không có dữ liệu"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-zinc-400 text-xs uppercase">
                      Số ghế
                    </label>
                    <p className="text-white">
                      {selectedOrder.seat_ids?.length > 0
                        ? selectedOrder.seat_ids.join(", ")
                        : "Không có dữ liệu"}
                    </p>
                  </div>
                  <div>
                    <label className="text-zinc-400 text-xs uppercase">
                      Phương thức thanh toán
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      {getPaymentMethodIcon(selectedOrder.payment_method)}
                      <span className="text-white">
                        {selectedOrder.payment_method?.toUpperCase() || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-zinc-400 text-xs uppercase">
                    Ngày đặt
                  </label>
                  <p className="text-white">
                    {formatDate(selectedOrder.created_at)}
                  </p>
                </div>

                <div className="border-t border-zinc-800 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Số lượng vé:</span>
                    <span className="text-white font-medium">
                      {selectedOrder.seat_ids?.length || 0} vé
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-zinc-400">Tổng tiền:</span>
                    <span className="text-2xl font-bold text-red-500">
                      {formatCurrency(selectedOrder.total_amount)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;