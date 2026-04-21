// src/pages/Orders.jsx - Phiên bản tối ưu hiệu suất

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Eye,
  CheckCircle,
  CreditCard,
  Ticket,
  CalendarDays,
  DollarSign,
  Download,
  ChevronLeft,
  ChevronRight,
  Package,
  X,
  Loader2,
} from "lucide-react";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const itemsPerPage = 10;

  // Cache system
  const cache = useMemo(() => ({
    data: new Map(),
    ttl: 5 * 60 * 1000, // 5 minutes
    
    get(key) {
      const item = this.data.get(key);
      if (!item) return null;
      if (Date.now() > item.expiry) {
        this.data.delete(key);
        return null;
      }
      return item.value;
    },
    
    set(key, value) {
      this.data.set(key, {
        value,
        expiry: Date.now() + this.ttl
      });
    },
    
    clear() {
      this.data.clear();
    }
  }), []);

  const getAuthToken = () => {
    return localStorage.getItem("token") || sessionStorage.getItem("token");
  };

  const fetchAPI = useCallback(async (url, options = {}) => {
    const token = getAuthToken();
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Check cache first
    const cacheKey = url;
    if (!options.skipCache) {
      const cached = cache.get(cacheKey);
      if (cached) {
        console.log(`🔄 Using cached: ${url}`);
        return cached;
      }
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
        const result = data.data || data;
        
        // Store in cache
        if (result && !options.skipCache) {
          cache.set(cacheKey, result);
        }
        
        return result;
      } catch (parseError) {
        console.warn(
          `⚠️ API ${url} returned non-JSON response:`,
          text.substring(0, 100),
        );
        return null;
      }
    } catch (error) {
      console.error(`❌ Fetch error (${url}):`, error);
      return null;
    }
  }, [cache]);

  // Tối ưu fetch booking seats - gọi 1 lần duy nhất
  const fetchBookingSeats = useCallback(async (bookingId) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`http://localhost:5000/api/booking-seats/booking/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) return [];
      
      const rawText = await response.text();
      if (!rawText || rawText.trim() === '') return [];
      
      let data;
      try {
        data = JSON.parse(rawText);
      } catch (e) {
        return [];
      }
      
      let seatIds = [];
      
      if (data && data.data && Array.isArray(data.data)) {
        seatIds = data.data.map(seat => {
          const seatId = seat.seat_id || seat.seatId || seat.id;
          return String(seatId);
        });
      } else if (Array.isArray(data)) {
        seatIds = data.map(seat => {
          const seatId = seat.seat_id || seat.seatId || seat.id;
          return String(seatId);
        });
      } else if (data && typeof data === 'object') {
        if (data.seat_ids) seatIds = data.seat_ids.map(s => String(s));
        else if (data.seats) seatIds = data.seats.map(s => String(s));
      }
      
      return seatIds.filter(id => id && id !== 'null' && id !== 'undefined');
      
    } catch (error) {
      console.error(`❌ Error fetching seats:`, error);
      return [];
    }
  }, []);

  const fetchBookingFoods = useCallback(async (bookingId) => {
    const foodsData = await fetchAPI(`http://localhost:5000/api/booking-foods/booking/${bookingId}`);
    if (Array.isArray(foodsData)) {
      return foodsData.map((food) => ({
        id: food.id,
        name: food.name,
        quantity: food.quantity,
        price: food.price,
        total: food.price * food.quantity,
      }));
    }
    return [];
  }, [fetchAPI]);

  // Tối ưu fetch order details - gọi song song
  const fetchOrderDetailsOptimized = useCallback(async (booking) => {
    console.log(`📦 Processing booking ID: ${booking.booking_id}`);
    
    // Gọi tất cả API song song
    const [seatsData, foodsData, paymentData, showtimeData] = await Promise.allSettled([
      fetchBookingSeats(booking.booking_id),
      fetchBookingFoods(booking.booking_id),
      fetchAPI(`http://localhost:5000/api/payments/booking/${booking.booking_id}`),
      booking.showtime_id ? fetchAPI(`http://localhost:5000/api/showtimes/${booking.showtime_id}`) : Promise.resolve(null)
    ]);
    
    const seatIds = seatsData.status === 'fulfilled' ? seatsData.value : [];
    const foods = foodsData.status === 'fulfilled' ? foodsData.value : [];
    const payment = paymentData.status === 'fulfilled' ? paymentData.value : null;
    const showtime = showtimeData.status === 'fulfilled' ? showtimeData.value : null;
    
    let movie = null, cinemaName = null, roomName = null, showDate = null, showTime = null;
    
    if (showtime) {
      const movieId = showtime.movieId || showtime.movie_id;
      const roomId = showtime.roomId || showtime.room_id;
      
      const [movieData, roomData] = await Promise.allSettled([
        movieId ? fetchAPI(`http://localhost:5000/api/movies/${movieId}`) : Promise.resolve(null),
        roomId ? fetchAPI(`http://localhost:5000/api/rooms/${roomId}`) : Promise.resolve(null)
      ]);
      
      movie = movieData.status === 'fulfilled' ? movieData.value : null;
      const room = roomData.status === 'fulfilled' ? roomData.value : null;
      
      if (room && (room.cinema_id || room.cinemaId)) {
        const cinemaId = room.cinema_id || room.cinemaId;
        const cinemaData = await fetchAPI(`http://localhost:5000/api/cinemas/${cinemaId}`);
        cinemaName = cinemaData?.name || "Đang cập nhật";
      }
      roomName = room?.name;
      
      const showDateRaw = showtime.show_date || showtime.date;
      if (showDateRaw) showDate = new Date(showDateRaw);
      showTime = showtime.start_time || showtime.time;
    }
    
    let totalPrice = booking.total_price ?? booking.total_amount ?? 0;
    let paymentMethod = booking.payment_method;
    let paymentStatus = booking.status;
    
    if (payment) {
      if (payment.amount && payment.amount > 0) totalPrice = payment.amount;
      paymentMethod = payment.method || booking.payment_method;
      paymentStatus = payment.status;
    }
    
    const finalStatus = paymentStatus === "paid" || booking.booking_status === "confirmed" ? "paid" : 
                       (paymentStatus === "cancelled" || booking.booking_status === "cancelled") ? "cancelled" : "pending";
    
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
      foods: foods,
      formatted_show_date: showDate,
      formatted_show_time: showTime,
      formatted_cinema: cinemaName,
      room_name: roomName,
    };
  }, [fetchBookingSeats, fetchBookingFoods, fetchAPI]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      console.log("🔄 Fetching bookings from API...");
      const bookings = await fetchAPI("http://localhost:5000/api/bookings");
      
      if (!bookings || !Array.isArray(bookings)) {
        console.error("❌ Bookings is not an array:", bookings);
        setOrders([]);
        setLoading(false);
        return;
      }
      
      console.log(`📋 Found ${bookings.length} bookings`);
      
      // Giới hạn số lượng đơn cần xử lý (50 đơn gần nhất)
      const recentBookings = bookings.slice(0, 50);
      
      // Xử lý theo batch, mỗi batch 5 đơn để tránh quá tải
      const batchSize = 5;
      const ordersWithDetails = [];
      
      for (let i = 0; i < recentBookings.length; i += batchSize) {
        const batch = recentBookings.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map(booking => fetchOrderDetailsOptimized(booking))
        );
        ordersWithDetails.push(...batchResults);
        
        // Cập nhật UI dần dần
        if (ordersWithDetails.length % 10 === 0 && ordersWithDetails.length < recentBookings.length) {
          const paidOrders = ordersWithDetails.filter(order => order.status === "paid");
          setOrders(paidOrders);
        }
      }
      
      console.log("✅ Final orders with details:", ordersWithDetails);
      
      const paidOrders = ordersWithDetails.filter(order => order.status === "paid");
      console.log(`💰 Paid orders: ${paidOrders.length}`);
      
      paidOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      setOrders(paidOrders);
      setTotalPages(Math.ceil(paidOrders.length / itemsPerPage));
      setCurrentPage(1);
      
    } catch (err) {
      console.error("Error fetching orders:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [fetchAPI, fetchOrderDetailsOptimized]);

  useEffect(() => {
    let isMounted = true;
    
    const loadOrders = async () => {
      if (!isMounted) return;
      await fetchOrders();
    };
    
    loadOrders();
    
    return () => {
      isMounted = false;
    };
  }, [fetchOrders]);

  // Lazy load chi tiết đơn hàng khi click
  const handleViewDetails = useCallback(async (order) => {
    setLoadingDetail(true);
    
    try {
      // Nếu đã có đủ thông tin thì hiển thị luôn
      if (order.movie && order.seat_ids?.length > 0 && order.foods) {
        setSelectedOrder(order);
        setShowDetailModal(true);
        setLoadingDetail(false);
        return;
      }
      
      // Nếu chưa có, fetch chi tiết
      const fullOrder = await fetchOrderDetailsOptimized({ 
        booking_id: order.booking_id,
        ...order 
      });
      setSelectedOrder(fullOrder);
      setShowDetailModal(true);
    } catch (error) {
      console.error("Error fetching order details:", error);
    } finally {
      setLoadingDetail(false);
    }
  }, [fetchOrderDetailsOptimized]);

  // Filter orders
  const filteredOrders = useMemo(() => {
    if (!searchTerm.trim()) return orders;
    
    return orders.filter((order) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        order.booking_id?.toString().toLowerCase().includes(searchLower) ||
        order.movie?.title?.toLowerCase().includes(searchLower) ||
        order.user_id?.toString().includes(searchLower) ||
        order.seat_ids?.some(seat => seat.toLowerCase().includes(searchLower))
      );
    });
  }, [orders, searchTerm]);

  const paginatedOrders = useMemo(() => {
    return filteredOrders.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredOrders, currentPage]);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const formatShowDate = useCallback((date) => {
    if (!date) return "N/A";
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }, []);

  const formatCurrency = useCallback((amount) => {
    if (amount === undefined || amount === null) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  }, []);

  const exportToCSV = useCallback(() => {
    const headers = [
      "Mã đơn",
      "Khách hàng",
      "Phim",
      "Ngày chiếu",
      "Rạp",
      "Phòng chiếu",
      "Số vé",
      "Danh sách ghế",
      "Tổng tiền",
      "Ngày đặt",
    ];
    
    const rows = filteredOrders.map((order) => [
      order.booking_id,
      `User ${order.user_id}`,
      order.movie?.title || "N/A",
      formatShowDate(order.formatted_show_date),
      order.formatted_cinema || "N/A",
      order.room_name || "N/A",
      order.seat_ids?.length || 0,
      order.seat_ids?.join(", ") || "",
      order.total_amount,
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
    link.setAttribute("download", `orders_${new Date().toISOString().slice(0, 19)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [filteredOrders, formatShowDate, formatDate]);

  // Skeleton loading component
  const OrderSkeleton = () => (
    <div className="animate-pulse">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-zinc-800">
                  <td className="px-6 py-4"><div className="h-6 bg-zinc-800 rounded w-24"></div></td>
                  <td className="px-6 py-4"><div className="h-6 bg-zinc-800 rounded w-32"></div></td>
                  <td className="px-6 py-4"><div className="h-6 bg-zinc-800 rounded w-28"></div></td>
                  <td className="px-6 py-4"><div className="h-6 bg-zinc-800 rounded w-36"></div></td>
                  <td className="px-6 py-4"><div className="h-6 bg-zinc-800 rounded w-16"></div></td>
                  <td className="px-6 py-4"><div className="h-6 bg-zinc-800 rounded w-24"></div></td>
                  <td className="px-6 py-4"><div className="h-8 bg-zinc-800 rounded w-20"></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: "var(--color-cinema-bg)" }}>
        <div className="mx-auto w-full px-4 py-6 sm:px-8 lg:px-12">
          <div className="mb-8">
            <div className="h-8 bg-zinc-800 rounded w-64 mb-2"></div>
            <div className="h-4 bg-zinc-800 rounded w-96"></div>
          </div>
          <OrderSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--color-cinema-bg)" }}>
      <div className="mx-auto w-full px-4 py-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Quản lý đơn hàng đã thanh toán</h1>
            <p className="text-zinc-400 text-base mt-2">
              Danh sách các đơn đặt vé đã được thanh toán thành công
            </p>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white transition-colors text-base"
          >
            <Download className="w-5 h-5" />
            Xuất CSV
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-base">Tổng đơn đã thanh toán</p>
                <p className="text-4xl font-bold text-white mt-2">{orders.length}</p>
              </div>
              <Ticket className="w-12 h-12 text-red-500 opacity-50" />
            </div>
          </div>
          <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-base">Tổng doanh thu</p>
                <p className="text-4xl font-bold text-green-400 mt-2">
                  {formatCurrency(
                    orders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
                  )}
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-yellow-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã đơn, phim, khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-400 focus:outline-none focus:border-red-500 transition-colors text-base"
            />
          </div>
        </div>

        {/* Orders Table */}
        {filteredOrders.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-16 text-center">
            <Ticket className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400 text-lg">Chưa có đơn hàng đã thanh toán nào</p>
            <p className="text-zinc-500 text-base mt-2">
              Đơn hàng sẽ hiển thị sau khi khách hàng thanh toán thành công
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/50">
              <table className="w-full min-w-[900px]">
                <thead className="border-b border-zinc-800 bg-zinc-900">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400 uppercase">
                      Mã đơn
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400 uppercase">
                      Phim
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400 uppercase">
                      Ngày chiếu
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400 uppercase">
                      Rạp
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400 uppercase">
                      Số vé
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400 uppercase">
                      Tổng tiền
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400 uppercase">
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
                      <td className="px-6 py-4">
                        <span className="text-white font-mono text-base font-semibold">
                          #{order.booking_id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-white text-base font-medium">
                          {order.movie?.title ||
                            order.showtime?.movieTitle ||
                            "Đang tải..."}
                        </p>
                        <p className="text-zinc-400 text-sm mt-1">
                          {order.movie?.duration
                            ? `${order.movie.duration} phút`
                            : order.showtime?.type
                              ? `${order.showtime.type}`
                              : ""}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-zinc-300 text-base">
                          <CalendarDays className="w-4 h-4 text-zinc-400" />
                          {formatShowDate(order.formatted_show_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-zinc-300 text-base">
                          {order.formatted_cinema ||
                            order.showtime?.cinemaName ||
                            "Đang tải..."}
                        </span>
                        <p className="text-zinc-500 text-sm mt-1">
                          {order.room_name || ""}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-zinc-300 text-base">
                          <Ticket className="w-4 h-4 text-zinc-400" />
                          <span className="font-semibold text-white">{order.seat_ids?.length || 0}</span> vé
                        </div>
                        {order.seat_ids && order.seat_ids.length > 0 && (
                          <div className="text-zinc-500 text-xs mt-1 truncate max-w-[150px]">
                            ({order.seat_ids.join(", ")})
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white font-bold text-lg">
                          {formatCurrency(order.total_amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleViewDetails(order)}
                          disabled={loadingDetail}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium border border-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loadingDetail ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
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
              <div className="mt-6 flex items-center justify-between flex-wrap gap-4">
                <p className="text-base text-zinc-400">
                  Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{" "}
                  {Math.min(currentPage * itemsPerPage, filteredOrders.length)}{" "}
                  trên {filteredOrders.length} đơn
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-zinc-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-700 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-white text-base font-medium">
                    Trang {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-zinc-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-700 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
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
            className="relative max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">
                  Chi tiết đơn hàng #{selectedOrder.booking_id}
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-zinc-400 text-sm uppercase font-semibold">
                      Mã đơn hàng
                    </label>
                    <p className="text-white font-mono text-lg mt-1">
                      {selectedOrder.booking_id}
                    </p>
                  </div>
                  <div>
                    <label className="text-zinc-400 text-sm uppercase font-semibold">
                      Trạng thái
                    </label>
                    <div className="mt-1">
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                        <CheckCircle className="w-4 h-4" />
                        Đã thanh toán
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-zinc-400 text-sm uppercase font-semibold">
                    Thông tin phim
                  </label>
                  <div className="mt-1 p-4 rounded-lg bg-zinc-800/50">
                    <p className="text-white font-semibold text-lg">
                      {selectedOrder.movie?.title ||
                        selectedOrder.showtime?.movieTitle ||
                        "Không có dữ liệu"}
                    </p>
                    <div className="grid grid-cols-2 gap-4 mt-2">
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-zinc-400 text-sm uppercase font-semibold">
                      Ngày chiếu
                    </label>
                    <p className="text-white text-base mt-1">
                      {formatShowDate(selectedOrder.formatted_show_date)}
                    </p>
                  </div>
                  <div>
                    <label className="text-zinc-400 text-sm uppercase font-semibold">
                      Suất chiếu
                    </label>
                    <p className="text-white text-base mt-1">
                      {selectedOrder.formatted_show_time?.slice(0, 5) ||
                        "Không có dữ liệu"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-zinc-400 text-sm uppercase font-semibold">
                      Rạp
                    </label>
                    <p className="text-white text-base mt-1">
                      {selectedOrder.formatted_cinema ||
                        selectedOrder.showtime?.cinemaName ||
                        "Không có dữ liệu"}
                    </p>
                  </div>
                  <div>
                    <label className="text-zinc-400 text-sm uppercase font-semibold">
                      Phòng chiếu
                    </label>
                    <p className="text-white text-base mt-1">
                      {selectedOrder.room_name ||
                        selectedOrder.showtime?.roomName ||
                        "Không có dữ liệu"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-zinc-400 text-sm uppercase font-semibold">
                      Danh sách ghế
                    </label>
                    <p className="text-white text-base mt-1">
                      {selectedOrder.seat_ids?.length > 0
                        ? selectedOrder.seat_ids.join(", ")
                        : "Không có dữ liệu"}
                    </p>
                    <p className="text-zinc-500 text-sm mt-1">
                      Tổng số: {selectedOrder.seat_ids?.length || 0} vé
                    </p>
                  </div>
                  <div>
                    <label className="text-zinc-400 text-sm uppercase font-semibold">
                      Phương thức thanh toán
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <CreditCard className="w-4 h-4 text-zinc-400" />
                      <span className="text-white text-base">
                        {selectedOrder.payment_method?.toUpperCase() || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Combo & Đồ ăn */}
                <div>
                  <label className="text-zinc-400 text-sm uppercase font-semibold">
                    Combo & Đồ ăn
                  </label>
                  <div className="mt-1 p-4 rounded-lg bg-zinc-800/50">
                    {selectedOrder.foods && selectedOrder.foods.length > 0 ? (
                      <div className="space-y-2">
                        {selectedOrder.foods.map((food, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-zinc-400" />
                              <span className="text-white text-base">{food.name}</span>
                              <span className="text-zinc-400 text-sm">
                                x{food.quantity}
                              </span>
                            </div>
                            <span className="text-white font-semibold text-base">
                              {formatCurrency(food.total)}
                            </span>
                          </div>
                        ))}
                        <div className="border-t border-zinc-700 pt-2 mt-2">
                          <div className="flex justify-between items-center">
                            <span className="text-zinc-400 text-base">
                              Tổng tiền đồ ăn:
                            </span>
                            <span className="text-white font-semibold text-base">
                              {formatCurrency(
                                selectedOrder.foods.reduce(
                                  (sum, f) => sum + f.total,
                                  0,
                                ),
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-zinc-500 text-base">Không có đặt thêm đồ ăn</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-zinc-400 text-sm uppercase font-semibold">
                    Ngày đặt
                  </label>
                  <p className="text-white text-base mt-1">
                    {formatDate(selectedOrder.created_at)}
                  </p>
                </div>

                <div className="border-t border-zinc-800 pt-4 mt-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-zinc-400 text-base">Số lượng vé:</span>
                    <span className="text-white font-semibold text-base">
                      {selectedOrder.seat_ids?.length || 0} vé
                    </span>
                  </div>
                  {selectedOrder.foods && selectedOrder.foods.length > 0 && (
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-zinc-400 text-base">Tiền đồ ăn:</span>
                      <span className="text-white font-semibold text-base">
                        {formatCurrency(
                          selectedOrder.foods.reduce(
                            (sum, f) => sum + f.total,
                            0,
                          ),
                        )}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-zinc-400 text-lg font-semibold">Tổng tiền:</span>
                    <span className="text-3xl font-bold text-white">
                      {formatCurrency(selectedOrder.total_amount)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 py-3 rounded-xl bg-zinc-700 hover:bg-zinc-600 text-white font-semibold transition-colors text-base"
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