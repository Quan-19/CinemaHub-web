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
  const [loadingDetailId, setLoadingDetailId] = useState(null);
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
    setLoadingDetailId(bookingId);
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
      setLoadingDetailId(null);
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

  const exportToExcel = useCallback(() => {
    // Xuất dạng bảng (Excel mở ra đúng cột/hàng) bằng HTML Table (.xls)
    const escapeHtml = (value) => {
      if (value === null || value === undefined) return "";
      return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    };

    const pad2 = (n) => String(n).padStart(2, "0");
    const now = new Date();
    const safeTimestamp = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}_${pad2(now.getHours())}-${pad2(now.getMinutes())}-${pad2(now.getSeconds())}`;

    const headers = [
      "Mã đơn",
      "Khách hàng",
      "Phim",
      "Ngày chiếu",
      "Rạp",
      "Phòng chiếu",
      "Số vé",
      "Danh sách ghế",
      "Tổng tiền (VND)",
      "Ngày đặt",
    ];

    const rows = orders.map((order) => {
      const customer = order.customer_name || `User ${order.user_id}`;
      const seats = (order.seats_preview || []).join(", ");
      const amount = Math.round(parseFloat(order.total_amount) || 0);
      return [
        order.booking_id,
        customer,
        order.movie_title || "N/A",
        formatShowDate(order.show_time),
        order.cinema_name || "N/A",
        order.room_name || "N/A",
        order.seat_count || 0,
        seats,
        amount,
        formatDate(order.created_at),
      ];
    });

    const headerHtml = headers
      .map(
        (h) =>
          `<th style="padding:8px 10px;border:1px solid #ddd;background:#f3f4f6;font-weight:700;white-space:nowrap;">${escapeHtml(h)}</th>`,
      )
      .join("");

    const rowsHtml = rows
      .map((row) => {
        const cells = row
          .map((cell, index) => {
            // Cột mã đơn và text: ép text để Excel không tự chuyển định dạng.
            const isTextCol = index !== 8 && index !== 6;
            const style = isTextCol
              ? "mso-number-format:'\\@';"
              : index === 8
                ? "mso-number-format:'#,##0';"
                : "";

            return `<td style="padding:8px 10px;border:1px solid #ddd;${style}">${escapeHtml(cell)}</td>`;
          })
          .join("");
        return `<tr>${cells}</tr>`;
      })
      .join("");

    const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  </head>
  <body>
    <table style="border-collapse:collapse;font-family:Arial, sans-serif;font-size:12px;">
      <thead><tr>${headerHtml}</tr></thead>
      <tbody>${rowsHtml}</tbody>
    </table>
  </body>
</html>`;

    const blob = new Blob([html], {
      type: "application/vnd.ms-excel;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", `orders_${safeTimestamp}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [orders, formatShowDate, formatDate]);

  // Skeleton loading
  const OrderSkeleton = () => (
    <div className="animate-pulse">
      <div className="cinema-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-white/5">
                  <td className="px-6 py-4">
                    <div className="h-6 bg-white/10 rounded w-24"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 bg-white/10 rounded w-32"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 bg-white/10 rounded w-28"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 bg-white/10 rounded w-36"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 bg-white/10 rounded w-16"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 bg-white/10 rounded w-24"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-8 bg-white/10 rounded w-20"></div>
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
            <div className="h-8 bg-white/10 rounded w-64 mb-2"></div>
            <div className="h-4 bg-white/10 rounded w-96"></div>
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
      <div className="mx-auto w-full px-4 py-6 sm:px-8 lg:px-12 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Quản lý đơn hàng đã thanh toán
            </h1>
            <p className="text-white/50 text-sm sm:text-base mt-2">
              Danh sách các đơn đặt vé đã được thanh toán thành công
            </p>
          </div>
          <button
            onClick={exportToExcel}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-cinema-primary hover:bg-cinema-primary-dark text-white transition text-sm font-semibold"
          >
            <Download className="w-5 h-5" />
            Xuất Excel
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="cinema-surface p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/50 text-sm font-medium">
                  Tổng đơn đã thanh toán
                </p>
                <p className="text-3xl sm:text-4xl font-bold text-white mt-2">
                  {totalOrders}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-cinema-primary/15 flex items-center justify-center">
                <Ticket className="w-6 h-6 text-cinema-primary" />
              </div>
            </div>
          </div>
          <div className="cinema-surface p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/50 text-sm font-medium">
                  Tổng doanh thu (trang hiện tại)
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-white mt-2">
                  {formatCurrency(
                    orders.reduce(
                      (sum, o) => sum + (parseFloat(o.total_amount) || 0),
                      0,
                    ),
                  )}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white/70" />
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="cinema-surface p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã đơn, phim, khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-zinc-900/60 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-cinema-primary/60 transition text-sm"
            />
          </div>
        </div>

        {/* Orders Table */}
        {orders.length === 0 && !loading ? (
          <div className="cinema-surface p-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5">
              <Ticket className="w-7 h-7 text-white/40" />
            </div>
            <p className="text-white/60 text-base font-medium">
              Chưa có đơn hàng đã thanh toán nào
            </p>
            <p className="text-white/40 text-sm mt-2">
              Đơn hàng sẽ hiển thị sau khi khách hàng thanh toán thành công
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto cinema-surface">
              <table className="w-full table-auto">
                <thead className="bg-zinc-950/70 text-gray-200 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-3 text-left text-[11px] font-bold text-white/50 uppercase tracking-wider whitespace-nowrap">
                      Mã đơn
                    </th>
                    <th className="px-6 py-3 text-left text-[11px] font-bold text-white/50 uppercase tracking-wider">
                      Phim
                    </th>
                    <th className="hidden lg:table-cell px-6 py-3 text-left text-[11px] font-bold text-white/50 uppercase tracking-wider whitespace-nowrap">
                      Ngày chiếu
                    </th>
                    <th className="hidden md:table-cell px-6 py-3 text-left text-[11px] font-bold text-white/50 uppercase tracking-wider">
                      Rạp
                    </th>
                    <th className="px-6 py-3 text-left text-[11px] font-bold text-white/50 uppercase tracking-wider whitespace-nowrap">
                      Số vé
                    </th>
                    <th className="px-6 py-3 text-left text-[11px] font-bold text-white/50 uppercase tracking-wider whitespace-nowrap">
                      Tổng tiền
                    </th>
                    <th className="px-6 py-3 text-left text-[11px] font-bold text-white/50 uppercase tracking-wider whitespace-nowrap">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, idx) => (
                    <tr
                      key={order.booking_id}
                      className={`border-b border-white/5 hover:bg-white/[0.04] transition-colors ${
                        idx % 2 === 0 ? "bg-white/[0.01]" : "bg-transparent"
                      }`}
                    >
                      <td className="px-6 py-3 align-middle">
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <span className="inline-flex h-2 w-2 rounded-full bg-cinema-primary shadow-[0_0_10px_rgba(229,9,20,0.35)]" />
                          <span className="text-white font-mono text-sm font-semibold">
                            #{order.booking_id}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3 align-middle">
                        <p className="text-white text-sm font-semibold truncate">
                          {order.movie_title || "Đang tải..."}
                        </p>

                        {/* Mobile summary (không cần kéo ngang) */}
                        <div className="mt-1 flex flex-wrap items-center gap-2 md:hidden">
                          <span className="inline-flex h-7 items-center gap-2 px-2.5 rounded-full bg-white/5 border border-white/10 text-white/70 text-[11px] whitespace-nowrap">
                            <CalendarDays className="w-3.5 h-3.5 text-white/50" />
                            {formatShowDate(order.show_time)}
                          </span>
                          <span className="inline-flex h-7 items-center px-2.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[11px] font-semibold truncate max-w-[240px]">
                            {order.cinema_name || "Đang tải..."}
                            {order.room_name ? ` • ${order.room_name}` : ""}
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {order.movie_duration ? (
                            <span className="inline-flex h-7 items-center px-2 rounded-full text-[11px] font-semibold bg-white/5 text-white/70 border border-white/10 whitespace-nowrap">
                              {order.movie_duration} phút
                            </span>
                          ) : null}
                          {order.show_format ? (
                            <span className="inline-flex h-7 items-center px-2 rounded-full text-[11px] font-semibold bg-cinema-primary/10 text-cinema-primary border border-cinema-primary/20 whitespace-nowrap">
                              {order.show_format}
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="hidden lg:table-cell px-6 py-3 align-middle">
                        <span className="inline-flex h-9 items-center gap-2 px-3 rounded-xl bg-white/5 border border-white/10 text-white/80 text-sm whitespace-nowrap">
                          <CalendarDays className="w-4 h-4 text-white/50" />
                          {formatShowDate(order.show_time)}
                        </span>
                      </td>
                      <td className="hidden md:table-cell px-6 py-3 align-middle">
                        <div className="flex flex-col gap-1 leading-tight">
                          <span className="text-white/85 text-sm font-semibold truncate">
                            {order.cinema_name || "Đang tải..."}
                          </span>
                          <span
                            className={`inline-flex w-fit h-7 items-center px-2 rounded-full text-[11px] font-semibold border whitespace-nowrap ${
                              order.room_name
                                ? "bg-indigo-500/10 text-indigo-300 border-indigo-500/20"
                                : "bg-white/5 text-white/50 border-white/10"
                            }`}
                          >
                            Phòng: {order.room_name || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3 align-middle">
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex h-9 w-fit items-center gap-2 px-3 rounded-xl bg-sky-500/10 text-sky-300 border border-sky-500/20 text-sm font-semibold whitespace-nowrap">
                            <Ticket className="w-4 h-4" />
                            {order.seat_count || 0} vé
                          </span>
                          {order.seats_preview &&
                          order.seats_preview.length > 0 ? (
                            <div className="hidden lg:block text-white/40 text-[11px] truncate">
                              Ghế: {order.seats_preview.join(", ")}
                              {order.has_more_seats && "..."}
                            </div>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-6 py-3 align-middle">
                        <span className="inline-flex h-9 items-center px-3 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/20 font-extrabold text-sm whitespace-nowrap">
                          {formatCurrency(order.total_amount)}
                        </span>
                      </td>
                      <td className="px-6 py-3 align-middle">
                        <div className="flex items-center">
                          <button
                            onClick={() => handleViewDetails(order)}
                            disabled={loadingDetail}
                            className="inline-flex h-9 items-center gap-2 px-3 rounded-xl bg-cinema-primary/10 hover:bg-cinema-primary/15 text-cinema-primary hover:text-white transition-colors text-xs font-bold border border-cinema-primary/20 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                          >
                            {loadingDetailId === order.booking_id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                            Chi tiết
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between flex-wrap gap-4">
                <p className="text-sm text-white/40">
                  Hiển thị {orders.length} trên {totalOrders} đơn
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    className="p-2 rounded-lg bg-white/5 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-white text-sm font-semibold">
                    Trang {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || loading}
                    className="p-2 rounded-lg bg-white/5 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
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
            className="relative max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-2xl bg-cinema-surface border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">
                  Chi tiết đơn hàng #{selectedOrder.booking_id}
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-white/50 hover:text-white transition-colors"
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
                  <div className="mt-1 p-4 rounded-xl bg-white/5 border border-white/10">
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
                  <div className="mt-1 p-4 rounded-xl bg-white/5 border border-white/10">
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
                  className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors text-base border border-white/10"
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
