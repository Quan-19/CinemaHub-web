import { useState, useEffect, useCallback } from "react";
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
  const [totalOrders, setTotalOrders] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const itemsPerPage = 10;

  const getAuthToken = () => {
    return localStorage.getItem("token") || sessionStorage.getItem("token");
  };

  // Fetch orders với phân trang
  const fetchOrders = useCallback(async (page = 1, search = "") => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const url = new URL("http://localhost:5000/api/bookings/paginated");
      url.searchParams.append("page", page);
      url.searchParams.append("limit", itemsPerPage);
      url.searchParams.append("status", "paid");
      if (search) {
        url.searchParams.append("search", search);
      }

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        const ordersWithAmount = result.data.map((order) => ({
          ...order,
          total_amount: parseFloat(order.total_amount) || 0,
        }));
        setOrders(ordersWithAmount);
        setTotalPages(result.pagination.total_pages);
        setTotalOrders(result.pagination.total);
        setCurrentPage(result.pagination.current_page);
      } else {
        setOrders([]);
        setTotalPages(1);
        setTotalOrders(0);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch chi tiết đơn hàng
  const fetchOrderDetail = useCallback(async (bookingId) => {
    setLoadingDetail(true);
    try {
      const token = getAuthToken();

      const response = await fetch(
        `http://localhost:5000/api/bookings/${bookingId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const orderData = await response.json();
      console.log("📦 Order detail:", orderData);

      // Fetch thông tin ghế
      let seats = [];
      try {
        const seatsResponse = await fetch(
          `http://localhost:5000/api/booking-seats/booking/${bookingId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (seatsResponse.ok) {
          const seatsData = await seatsResponse.json();
          let seatsArray = [];
          if (seatsData.data && Array.isArray(seatsData.data)) {
            seatsArray = seatsData.data;
          } else if (Array.isArray(seatsData)) {
            seatsArray = seatsData;
          }
          seats = seatsArray.map((seat) => ({
            ...seat,
            seat_name:
              seat.seat_name ||
              `${seat.seat_row || ""}${seat.seat_number || ""}` ||
              seat.seat_id,
          }));
        }
      } catch (err) {
        console.error("Error fetching seats:", err);
      }

      // Fetch thông tin đồ ăn
      let foods = [];
      let foodsTotal = 0;
      try {
        const foodsResponse = await fetch(
          `http://localhost:5000/api/booking-foods/booking/${bookingId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (foodsResponse.ok) {
          const foodsData = await foodsResponse.json();
          let foodsArray = [];
          if (foodsData.data && Array.isArray(foodsData.data)) {
            foodsArray = foodsData.data;
          } else if (Array.isArray(foodsData)) {
            foodsArray = foodsData;
          }
          foods = foodsArray.map((f) => ({
            ...f,
            total: (parseFloat(f.price) || 0) * (parseInt(f.quantity) || 0),
          }));
          foodsTotal = foods.reduce((sum, f) => sum + (f.total || 0), 0);
        }
      } catch (err) {
        console.error("Error fetching foods:", err);
      }

      // Format seat names
      const seatNames = seats.map((seat) => seat.seat_name).filter(Boolean);

      // QUAN TRỌNG: Lấy tổng tiền từ payment_amount (đã bao gồm vé + đồ ăn)
      const totalAmount = parseFloat(
        orderData.payment_amount ||
          orderData.total_price ||
          orderData.total_amount ||
          0,
      );
      const ticketTotal = parseFloat(orderData.total_price || 0);

      console.log("💰 Payment amount (total):", totalAmount);
      console.log("💰 Ticket total:", ticketTotal);
      console.log("🍿 Foods total:", foodsTotal);

      setSelectedOrder({
        ...orderData,
        seats: seats,
        foods: foods,
        seat_ids: seatNames,
        ticket_total: ticketTotal,
        foods_total: foodsTotal,
        total_amount: totalAmount, // Đây là tổng tiền bao gồm cả đồ ăn
        movie_title: orderData.movie_title || "Không có dữ liệu",
        movie_duration: orderData.movie_duration,
        cinema_name: orderData.cinema_name || "Không có dữ liệu",
        room_name: orderData.room_name || "Không có dữ liệu",
        show_time: orderData.show_time,
        show_format: orderData.show_format,
        payment_method: orderData.payment_method,
      });

      setShowDetailModal(true);
    } catch (error) {
      console.error("Error fetching order detail:", error);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  // Handle search với debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchOrders(1, searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, fetchOrders]);

  // Load orders khi page thay đổi
  useEffect(() => {
    fetchOrders(currentPage, searchTerm);
  }, [currentPage, fetchOrders, searchTerm]);

  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [totalPages],
  );

  const handleViewDetails = useCallback(
    (order) => {
      fetchOrderDetail(order.booking_id);
    },
    [fetchOrderDetail],
  );

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

  const formatShowDate = useCallback((dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }, []);

  const formatCurrency = useCallback((amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) return "0 ₫";
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

    const rows = orders.map((order) => [
      order.booking_id,
      order.customer_name || `User ${order.user_id}`,
      order.movie_title || "N/A",
      formatShowDate(order.show_time),
      order.cinema_name || "N/A",
      order.room_name || "N/A",
      order.seat_count || 0,
      order.seats_preview?.join(", ") || "",
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
    link.setAttribute(
      "download",
      `orders_${new Date().toISOString().slice(0, 19)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [orders, formatShowDate, formatDate]);

  // Skeleton loading
  const OrderSkeleton = () => (
    <div className="animate-pulse">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-zinc-800">
                  <td className="px-6 py-4">
                    <div className="h-6 bg-zinc-800 rounded w-24"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 bg-zinc-800 rounded w-32"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 bg-zinc-800 rounded w-28"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 bg-zinc-800 rounded w-36"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 bg-zinc-800 rounded w-16"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 bg-zinc-800 rounded w-24"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-8 bg-zinc-800 rounded w-20"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  if (loading && orders.length === 0) {
    return (
      <div
        className="min-h-screen"
        style={{ background: "var(--color-cinema-bg)" }}
      >
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
    <div
      className="min-h-screen"
      style={{ background: "var(--color-cinema-bg)" }}
    >
      <div className="mx-auto w-full px-4 py-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Quản lý đơn hàng đã thanh toán
            </h1>
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
                <p className="text-zinc-400 text-base">
                  Tổng đơn đã thanh toán
                </p>
                <p className="text-4xl font-bold text-white mt-2">
                  {totalOrders}
                </p>
              </div>
              <Ticket className="w-12 h-12 text-red-500 opacity-50" />
            </div>
          </div>
          <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-base">
                  Tổng doanh thu (trang hiện tại)
                </p>
                <p className="text-4xl font-bold text-green-400 mt-2">
                  {formatCurrency(
                    orders.reduce(
                      (sum, o) => sum + (parseFloat(o.total_amount) || 0),
                      0,
                    ),
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
        {orders.length === 0 && !loading ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-16 text-center">
            <Ticket className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400 text-lg">
              Chưa có đơn hàng đã thanh toán nào
            </p>
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
                  {orders.map((order) => (
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
                          {order.movie_title || "Đang tải..."}
                        </p>
                        <p className="text-zinc-400 text-sm mt-1">
                          {order.movie_duration
                            ? `${order.movie_duration} phút`
                            : order.show_format || ""}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-zinc-300 text-base">
                          <CalendarDays className="w-4 h-4 text-zinc-400" />
                          {formatShowDate(order.show_time)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-zinc-300 text-base">
                          {order.cinema_name || "Đang tải..."}
                        </span>
                        <p className="text-zinc-500 text-sm mt-1">
                          {order.room_name || ""}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-zinc-300 text-base">
                          <Ticket className="w-4 h-4 text-zinc-400" />
                          <span className="font-semibold text-white">
                            {order.seat_count || 0}
                          </span>{" "}
                          vé
                        </div>
                        {order.seats_preview &&
                          order.seats_preview.length > 0 && (
                            <div className="text-zinc-500 text-xs mt-1 truncate max-w-[150px]">
                              ({order.seats_preview.join(", ")}
                              {order.has_more_seats && "..."})
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
                  Hiển thị {orders.length} trên {totalOrders} đơn
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    className="p-2 rounded-lg bg-zinc-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-700 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-white text-base font-medium">
                    Trang {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || loading}
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
                      {selectedOrder.movie_title}
                    </p>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      {selectedOrder.movie_duration && (
                        <p className="text-zinc-400 text-sm">
                          Thời lượng: {selectedOrder.movie_duration} phút
                        </p>
                      )}
                      {selectedOrder.show_format && (
                        <p className="text-zinc-400 text-sm">
                          Định dạng: {selectedOrder.show_format}
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
                      {formatShowDate(selectedOrder.show_time)}
                    </p>
                  </div>
                  <div>
                    <label className="text-zinc-400 text-sm uppercase font-semibold">
                      Suất chiếu
                    </label>
                    <p className="text-white text-base mt-1">
                      {selectedOrder.show_time
                        ? new Date(selectedOrder.show_time).toLocaleTimeString(
                            "vi-VN",
                            { hour: "2-digit", minute: "2-digit" },
                          )
                        : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-zinc-400 text-sm uppercase font-semibold">
                      Rạp
                    </label>
                    <p className="text-white text-base mt-1">
                      {selectedOrder.cinema_name}
                    </p>
                  </div>
                  <div>
                    <label className="text-zinc-400 text-sm uppercase font-semibold">
                      Phòng chiếu
                    </label>
                    <p className="text-white text-base mt-1">
                      {selectedOrder.room_name}
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
                              <span className="text-white text-base">
                                {food.name}
                              </span>
                              <span className="text-zinc-400 text-sm">
                                x{food.quantity}
                              </span>
                            </div>
                            <span className="text-white font-semibold text-base">
                              {formatCurrency(food.total)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-zinc-500 text-base">
                        Không có đặt thêm đồ ăn
                      </p>
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
                    <span className="text-zinc-400 text-base">Tiền vé:</span>
                    <span className="text-white font-semibold text-base">
                      {formatCurrency(selectedOrder.ticket_total || 0)}
                    </span>
                  </div>
                  {selectedOrder.foods && selectedOrder.foods.length > 0 && (
                    <>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-zinc-400 text-base">
                          Tiền đồ ăn:
                        </span>
                        <span className="text-white font-semibold text-base">
                          {formatCurrency(selectedOrder.foods_total || 0)}
                        </span>
                      </div>
                      <div className="h-px bg-zinc-700 my-2"></div>
                    </>
                  )}
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-zinc-400 text-lg font-semibold">
                      Tổng tiền:
                    </span>
                    <span className="text-3xl font-bold text-white">
                      {formatCurrency(selectedOrder.total_amount || 0)}
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
