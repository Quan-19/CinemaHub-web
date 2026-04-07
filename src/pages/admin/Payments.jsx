import { useState } from "react";
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  RefreshCw,
} from "lucide-react";

// Định nghĩa mockPayments dạng mảng object JS thuần
const mockPayments = [
  { id: "PAY001", bookingId: "BK1001", user: "Nguyễn Văn A", movie: "Hành Trình Vũ Trụ", cinema: "CGV Vincom", seats: "D5, D6", amount: 220000, method: "momo", status: "success", date: "06/03/2026", time: "14:32" },
  { id: "PAY002", bookingId: "BK1002", user: "Trần Thị B", movie: "Biệt Đội Chiến Thần", cinema: "Lotte Hà Đông", seats: "E3, E4, E5", amount: 315000, method: "vnpay", status: "success", date: "06/03/2026", time: "13:15" },
  { id: "PAY003", bookingId: "BK1003", user: "Lê Minh C", movie: "Bóng Đêm Vĩnh Cửu", cinema: "BHD Phạm Ngọc", seats: "B8", amount: 95000, method: "zalopay", status: "pending", date: "06/03/2026", time: "12:48" },
  { id: "PAY004", bookingId: "BK1004", user: "Phạm Thu D", movie: "Mùa Hè Rực Rỡ", cinema: "Galaxy Nguyễn Du", seats: "F2, F3, F4, F5", amount: 360000, method: "card", status: "success", date: "06/03/2026", time: "11:20" },
  { id: "PAY005", bookingId: "BK1005", user: "Hoàng Anh E", movie: "Rồng Bay Lên", cinema: "CGV Aeon Mall", seats: "H7, H8", amount: 190000, method: "momo", status: "failed", date: "06/03/2026", time: "10:55" },
  { id: "PAY006", bookingId: "BK1006", user: "Vũ Thị Mai", movie: "Hành Trình Vũ Trụ", cinema: "CGV Vincom", seats: "A1, A2", amount: 280000, method: "vnpay", status: "success", date: "05/03/2026", time: "20:10" },
  { id: "PAY007", bookingId: "BK1007", user: "Đinh Văn Long", movie: "Chuyến Đi Cuối Cùng", cinema: "BHD Phạm Ngọc", seats: "C6", amount: 95000, method: "cash", status: "refunded", date: "05/03/2026", time: "18:30" },
  { id: "PAY008", bookingId: "BK1008", user: "Bùi Thị Lan", movie: "Biệt Đội Chiến Thần", cinema: "CGV Aeon Mall", seats: "G4, G5", amount: 330000, method: "momo", status: "success", date: "05/03/2026", time: "16:45" },
  { id: "PAY009", bookingId: "BK1009", user: "Đỗ Minh Đức", movie: "Lễ Hội Huyền Bí", cinema: "Lotte Hà Đông", seats: "D9, D10", amount: 200000, method: "zalopay", status: "success", date: "05/03/2026", time: "15:00" },
  { id: "PAY010", bookingId: "BK1010", user: "Ngô Thị Hoa", movie: "Rồng Bay Lên", cinema: "Galaxy Nguyễn Du", seats: "E1", amount: 90000, method: "card", status: "pending", date: "05/03/2026", time: "11:20" },
];

const methodLabel = {
  momo: "MoMo",
  vnpay: "VNPay",
  zalopay: "ZaloPay",
  cash: "Tiền mặt",
  card: "Thẻ ngân hàng",
};
const methodColor = {
  momo: "#ae2070",
  vnpay: "#0062cc",
  zalopay: "#1a94ff",
  cash: "#22c55e",
  card: "#f59e0b",
};
const statusLabel = {
  success: "Thành công",
  pending: "Chờ xử lý",
  failed: "Thất bại",
  refunded: "Hoàn tiền",
};
const statusColor = {
  success: "#22c55e",
  pending: "#f59e0b",
  failed: "#ef4444",
  refunded: "#8b5cf6",
};

export const AdminPaymentsPage = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const perPage = 8;

  const filtered = mockPayments.filter((p) => {
    const matchSearch =
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.user.toLowerCase().includes(search.toLowerCase()) ||
      p.movie.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    const matchMethod = methodFilter === "all" || p.method === methodFilter;
    return matchSearch && matchStatus && matchMethod;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalRevenue = mockPayments.filter(p => p.status === "success").reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>Quản lý thanh toán</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Theo dõi và quản lý giao dịch</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-opacity hover:opacity-80"
          style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.8)", fontSize: 13 }}
        >
          <Download size={15} />
          Xuất báo cáo
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Tổng giao dịch", value: mockPayments.length, color: "#8b5cf6" },
          { label: "Thành công", value: mockPayments.filter(p => p.status === "success").length, color: "#22c55e" },
          { label: "Chờ xử lý", value: mockPayments.filter(p => p.status === "pending").length, color: "#f59e0b" },
          { label: "Tổng thu (thành công)", value: `${(totalRevenue / 1000000).toFixed(1)}M₫`, color: "#e50914" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-4 flex items-center gap-3"
            style={{ background: "var(--color-cinema-surface)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="w-2 h-10 rounded-full flex-shrink-0" style={{ background: s.color }} />
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-xl p-4 flex flex-wrap gap-3"
        style={{ background: "var(--color-cinema-surface)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-2 flex-1 min-w-[200px] rounded-lg px-3 py-2"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <Search size={14} style={{ color: "rgba(255,255,255,0.35)" }} />
          <input
            placeholder="Tìm mã GD, tên KH, tên phim..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: 13, width: "100%" }}
          />
        </div>
        <div className="flex gap-2">
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "6px 12px", color: "#fff", fontSize: 13, outline: "none" }}>
            <option value="all">Tất cả trạng thái</option>
            <option value="success">Thành công</option>
            <option value="pending">Chờ xử lý</option>
            <option value="failed">Thất bại</option>
            <option value="refunded">Hoàn tiền</option>
          </select>
          <select value={methodFilter} onChange={(e) => { setMethodFilter(e.target.value); setPage(1); }}
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "6px 12px", color: "#fff", fontSize: 13, outline: "none" }}>
            <option value="all">Tất cả hình thức</option>
            <option value="momo">MoMo</option>
            <option value="vnpay">VNPay</option>
            <option value="zalopay">ZaloPay</option>
            <option value="cash">Tiền mặt</option>
            <option value="card">Thẻ ngân hàng</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden"
        style={{ background: "var(--color-cinema-surface)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="overflow-x-auto">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {["Mã GD", "Khách hàng", "Phim", "Rạp", "Ghế", "Số tiền", "Hình thức", "Trạng thái", "Ngày giờ", ""].map((h) => (
                  <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((p) => (
                <tr key={p.id}
                  className="transition-colors"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "12px 14px", fontSize: 12, color: "#e50914", fontWeight: 600 }}>{p.id}</td>
                  <td style={{ padding: "12px 14px" }}>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(229,9,20,0.15)", fontSize: 11, fontWeight: 700, color: "#e50914" }}>
                        {p.user.charAt(0)}
                      </div>
                      <span style={{ fontSize: 13, color: "#fff" }}>{p.user}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: 13, color: "rgba(255,255,255,0.7)", maxWidth: 140 }}>
                    <span className="truncate block">{p.movie}</span>
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{p.cinema}</td>
                  <td style={{ padding: "12px 14px", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{p.seats}</td>
                  <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700, color: "#f59e0b" }}>
                    {p.amount.toLocaleString()}₫
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ background: `${methodColor[p.method]}20`, color: methodColor[p.method] }}>
                      {methodLabel[p.method]}
                    </span>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <span className="flex items-center gap-1.5 text-xs"
                      style={{ color: statusColor[p.status] }}>
                      {p.status === "success" ? <CheckCircle size={12} /> :
                        p.status === "pending" ? <Clock size={12} /> :
                        p.status === "refunded" ? <RefreshCw size={12} /> :
                        <XCircle size={12} />}
                      {statusLabel[p.status]}
                    </span>
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                    <div>{p.date}</div>
                    <div>{p.time}</div>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <button onClick={() => setSelectedPayment(p)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                      style={{ color: "rgba(255,255,255,0.5)" }}>
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
            {Math.min((page - 1) * perPage + 1, filtered.length)}–{Math.min(page * perPage, filtered.length)} / {filtered.length} giao dịch
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30"
              style={{ background: "rgba(255,255,255,0.06)", color: "#fff" }}>
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
              <button key={pg} onClick={() => setPage(pg)}
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: pg === page ? "#e50914" : "rgba(255,255,255,0.06)", color: "#fff", fontSize: 13 }}>
                {pg}
              </button>
            ))}
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
              className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30"
              style={{ background: "rgba(255,255,255,0.06)", color: "#fff" }}>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Detail modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-full max-w-md rounded-2xl p-6"
            style={{ background: "var(--color-cinema-surface)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center justify-between mb-5">
              <h2 style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>Chi tiết giao dịch</h2>
              <span className="px-2 py-1 rounded-full text-xs font-semibold"
                style={{ background: `${statusColor[selectedPayment.status]}20`, color: statusColor[selectedPayment.status] }}>
                {statusLabel[selectedPayment.status]}
              </span>
            </div>
            <div className="space-y-3">
              {[
                { label: "Mã giao dịch", value: selectedPayment.id },
                { label: "Mã đặt vé", value: selectedPayment.bookingId },
                { label: "Khách hàng", value: selectedPayment.user },
                { label: "Phim", value: selectedPayment.movie },
                { label: "Rạp", value: selectedPayment.cinema },
                { label: "Ghế ngồi", value: selectedPayment.seats },
                { label: "Hình thức TT", value: methodLabel[selectedPayment.method] },
                { label: "Ngày giờ", value: `${selectedPayment.date} ${selectedPayment.time}` },
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center py-2"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>{row.label}</span>
                  <span style={{ fontSize: 13, color: "#fff", fontWeight: 500 }}>{row.value}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2">
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>Tổng tiền</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: "#f59e0b" }}>
                  {selectedPayment.amount.toLocaleString()}₫
                </span>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              {selectedPayment.status === "success" && (
                <button className="flex-1 py-2.5 rounded-lg text-sm"
                  style={{ background: "rgba(139,92,246,0.15)", color: "#8b5cf6", border: "1px solid rgba(139,92,246,0.3)" }}>
                  Hoàn tiền
                </button>
              )}
              <button onClick={() => setSelectedPayment(null)}
                className="flex-1 py-2.5 rounded-lg text-sm"
                style={{ background: "rgba(255,255,255,0.08)", color: "#fff" }}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
