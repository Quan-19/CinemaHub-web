import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { getAuth } from "firebase/auth";
import {
  TrendingUp,
  Ticket,
  ShoppingBag,
  Percent,
  Download,
  Calendar,
  Filter,
} from "lucide-react";

function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(value || 0));
}

function getCurrentYear() {
  return new Date().getFullYear();
}

function getCurrentMonth() {
  return new Date().getMonth() + 1;
}

function StatCard({ icon: Icon, title, value, sub, accentClass }) {
  return (
    <div className="cinema-surface p-4 sm:p-5 transition-all hover:shadow-lg hover:shadow-zinc-900/50">
      <div className="flex items-center gap-4">
        <div
          className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${accentClass}`}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <div className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            {title}
          </div>
          <div className="mt-1 text-2xl font-bold tracking-tight text-zinc-100">
            {value}
          </div>
          {sub && <div className="mt-1 text-xs text-zinc-400">{sub}</div>}
        </div>
      </div>
    </div>
  );
}

function StaffRevenuePage() {
  const { subtitle } = useOutletContext();

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [error, setError] = useState("");

  const [reportType, setReportType] = useState("month");
  const [year, setYear] = useState(getCurrentYear());
  const [month, setMonth] = useState(getCurrentMonth());
  const [quarter, setQuarter] = useState(1);

  const [data, setData] = useState(null);

  // Dynamic document title for SEO/standards
  useEffect(() => {
    document.title = "Báo cáo doanh thu | CinemaHub Staff";
  }, []);

  const years = useMemo(() => {
    const current = getCurrentYear();
    const list = [];
    for (let i = current; i >= 2020; i--) {
      list.push(i);
    }
    return list;
  }, []);

  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("type", reportType);

    // Filter logic based on backend requirements
    if (reportType !== "year") {
      params.set("year", String(year));
    }

    if (reportType === "day") {
      params.set("month", String(month));
    }

    if (reportType === "quarter") {
      params.set("quarter", String(quarter));
    }

    return params.toString();
  }, [reportType, year, month, quarter]);

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        setLoading(true);
        setError("");

        const auth = getAuth();
        const token = await auth.currentUser?.getIdToken();
        if (!token) {
          throw new Error("Không lấy được token xác thực. Vui lòng đăng nhập lại.");
        }

        const res = await fetch(
          `http://localhost:5000/api/reports/revenue/details?${queryString}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const json = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(json?.message || json?.error || `Lỗi từ hệ thống: ${res.status}`);
        }

        setData(json);
      } catch (err) {
        setData(null);
        setError(err?.message || "Không tải được báo cáo doanh thu");
      } finally {
        setLoading(false);
      }
    };

    fetchRevenue();
  }, [queryString]);

  const handleExport = async () => {
    try {
      setExporting(true);
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Vui lòng đăng nhập lại.");

      const res = await fetch(
        `http://localhost:5000/api/reports/revenue/export?${queryString}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Không thể xuất báo cáo.");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Bao-cao-doanh-thu-${reportType}-${year}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("Lỗi khi xuất file: " + err.message);
    } finally {
      setExporting(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setExportingPDF(true);
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Vui lòng đăng nhập lại.");

      const res = await fetch(
        `http://localhost:5000/api/reports/revenue/export/pdf?${queryString}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Không thể xuất báo cáo PDF.");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
      setIsPreviewOpen(true);
    } catch (err) {
      setError("Lỗi khi xuất PDF: " + err.message);
    } finally {
      setExportingPDF(false);
    }
  };

  const closePreview = () => {
    if (pdfUrl) {
      window.URL.revokeObjectURL(pdfUrl);
    }
    setPdfUrl(null);
    setIsPreviewOpen(false);
  };

  const confirmDownload = () => {
    if (!pdfUrl) return;
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = `Bao-cao-doanh-thu-${reportType}-${year}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const summary = data?.summary || {};
  const revenueByPeriod = Array.isArray(data?.revenueByPeriod)
    ? data.revenueByPeriod
    : [];
  const revenueByMovie = Array.isArray(data?.revenueByMovie)
    ? data.revenueByMovie
    : [];

  const periodHeader = useMemo(() => {
    switch (reportType) {
      case "day":
        return "Ngày";
      case "month":
        return "Tháng";
      case "quarter":
        return "Quý";
      case "year":
        return "Năm";
      default:
        return "Kỳ";
    }
  }, [reportType]);

  return (
    <main className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            Doanh thu rạp
          </h1>
          <p className="mt-1 text-sm text-zinc-300">{subtitle || "Phân tích và thống kê doanh thu"}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExport}
            disabled={exporting || exportingPDF || loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-100 px-4 py-2.5 text-sm font-bold text-zinc-950 transition-all hover:bg-white active:scale-95 disabled:opacity-50 shadow-lg shadow-white/5"
          >
            {exporting ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Excel (.xlsx)
          </button>

          <button
            onClick={handleExportPDF}
            disabled={exporting || exportingPDF || loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-cinema-primary px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-red-500 active:scale-95 disabled:opacity-50 shadow-lg shadow-red-500/10"
          >
            {exportingPDF ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            PDF (.pdf)
          </button>
        </div>
      </header>

      {/* FILTER SECTION */}
      <section className="cinema-surface p-4 sm:p-5" aria-labelledby="filter-heading">
        <div className="flex items-center gap-2 mb-4 text-zinc-300">
          <Filter className="h-4 w-4 text-zinc-200" />
          <h2 id="filter-heading" className="text-sm font-semibold uppercase tracking-wider text-zinc-100">Bộ lọc báo cáo</h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="report-type" className="text-[10px] font-bold uppercase text-zinc-400 ml-1">Loại báo cáo</label>
            <select
              id="report-type"
              aria-label="Chọn loại báo cáo"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="rounded-xl border border-zinc-700 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-600 transition-all cursor-pointer hover:border-zinc-500"
            >
              <option value="day">Theo ngày (trong tháng)</option>
              <option value="month">Theo tháng (trong năm)</option>
              <option value="quarter">Theo quý (trong năm)</option>
              <option value="year">Theo các năm</option>
            </select>
          </div>

          {reportType !== "year" && (
            <div className="flex flex-col gap-1.5">
            <label htmlFor="year-select" className="text-[10px] font-bold uppercase text-zinc-400 ml-1">Năm</label>
              <select
                id="year-select"
                aria-label="Chọn năm"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-28 rounded-xl border border-zinc-700 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-600 transition-all cursor-pointer hover:border-zinc-500"
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          )}

          {reportType === "day" && (
            <div className="flex flex-col gap-1.5">
            <label htmlFor="month-select" className="text-[10px] font-bold uppercase text-zinc-400 ml-1">Tháng</label>
              <select
                id="month-select"
                aria-label="Chọn tháng"
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="w-32 rounded-xl border border-zinc-700 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-600 transition-all cursor-pointer hover:border-zinc-500"
              >
                {months.map((m) => (
                  <option key={m} value={m}>Tháng {m}</option>
                ))}
              </select>
            </div>
          )}

          {reportType === "quarter" && (
            <div className="flex flex-col gap-1.5">
            <label htmlFor="quarter-select" className="text-[10px] font-bold uppercase text-zinc-400 ml-1">Quý</label>
              <select
                id="quarter-select"
                aria-label="Chọn quý"
                value={quarter}
                onChange={(e) => setQuarter(Number(e.target.value))}
                className="w-28 rounded-xl border border-zinc-700 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-600 transition-all cursor-pointer hover:border-zinc-500"
              >
                <option value={1}>Quý 1</option>
                <option value={2}>Quý 2</option>
                <option value={3}>Quý 3</option>
                <option value={4}>Quý 4</option>
              </select>
            </div>
          )}
        </div>
      </section>

      {/* SUMMARY STATS */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="cinema-surface h-28 animate-pulse bg-zinc-900/40" />
          ))
        ) : error ? (
          <div className="col-span-full cinema-surface p-5 text-center text-red-400 font-semibold border-red-500/20 bg-red-500/5">
            {error}
          </div>
        ) : (
          <>
            <StatCard
              icon={TrendingUp}
              title="Tổng doanh thu"
              value={formatCurrency(summary.totalRevenue)}
              sub="Dựa trên bộ lọc đã chọn"
              accentClass="bg-emerald-500/15 text-emerald-400"
            />
            <StatCard
              icon={Ticket}
              title="Tổng vé đã bán"
              value={summary.totalTickets || 0}
              sub={`${summary.totalBookings || 0} đơn đặt vé`}
              accentClass="bg-cinema-primary/15 text-cinema-primary"
            />
            <StatCard
              icon={ShoppingBag}
              title="Giá vé trung bình"
              value={formatCurrency(summary.averageTicketPrice)}
              accentClass="bg-violet-500/15 text-violet-400"
            />
            <StatCard
              icon={Percent}
              title="Tỷ lệ tăng trưởng"
              value={`${Number(summary.growthRate || 0).toFixed(1)}%`}
              sub="So với kỳ trước"
              accentClass="bg-amber-500/15 text-amber-400"
            />
          </>
        )}
      </section>

      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* REVENUE BY PERIOD */}
          <section className="cinema-surface p-4 sm:p-5 lg:col-span-2 overflow-hidden">
            <div className="flex items-center gap-2 mb-5">
              <Calendar className="h-4 w-4 text-zinc-300" />
              <h2 className="text-base font-bold text-zinc-100">Chi tiết doanh thu theo {periodHeader.toLowerCase()}</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <caption className="sr-only">Bảng chi tiết doanh thu theo từng {periodHeader.toLowerCase()}</caption>
                <thead>
                  <tr className="border-b border-zinc-800 text-left text-zinc-400 font-bold uppercase text-[10px] tracking-widest">
                    <th className="pb-3 pr-4">{periodHeader}</th>
                    <th className="pb-3 pr-4 text-right">Doanh thu</th>
                    <th className="pb-3 pr-4 text-right">Số vé</th>
                    <th className="pb-3 text-right">Đơn đặt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {revenueByPeriod.length === 0 ? (
                    <tr>
                      <td className="py-8 text-center text-zinc-400 italic" colSpan={4}>Không tìm thấy dữ liệu trong kỳ này.</td>
                    </tr>
                  ) : (
                    revenueByPeriod.map((row, idx) => (
                      <tr key={idx} className="hover:bg-zinc-800/20 transition-colors group">
                        <td className="py-3 pr-4 font-semibold text-zinc-200 group-hover:text-white transition-colors">{row.period}</td>
                        <td className="py-3 pr-4 text-right text-emerald-400 font-mono font-bold">{formatCurrency(row.revenue)}</td>
                        <td className="py-3 pr-4 text-right text-zinc-200">{row.tickets || 0}</td>
                        <td className="py-3 text-right text-zinc-300">{row.bookings || 0}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* TOP MOVIES */}
          <section className="cinema-surface p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-5">
              <Ticket className="h-4 w-4 text-zinc-300" />
              <h2 className="text-base font-bold text-zinc-100">Top phim doanh thu</h2>
            </div>
            
            <div className="space-y-4">
              {revenueByMovie.length === 0 ? (
                <div className="py-8 text-center text-zinc-400 italic text-sm">Chưa có dữ liệu phim</div>
              ) : (
                revenueByMovie.map((row, idx) => (
                  <div key={idx} className="space-y-2 group">
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="font-bold text-zinc-100 truncate group-hover:text-cinema-primary transition-colors">{row.movie_title}</span>
                      <span className="text-zinc-300 flex-shrink-0 font-mono">{formatCurrency(row.revenue)}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-cinema-primary shadow-[0_0_8px_rgba(239,68,68,0.3)] transition-all duration-1000 ease-out"
                        style={{ width: `${Math.max(2, row.percentage)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-zinc-400">
                      <span>{row.tickets || 0} vé</span>
                      <span className="font-bold">{Number(row.percentage || 0).toFixed(1)}%</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      )}

      {/* PDF PREVIEW MODAL */}
      {isPreviewOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm transition-all duration-300"
          aria-modal="true"
          role="dialog"
        >
          <div className="cinema-surface w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden shadow-2xl shadow-black/50 border-zinc-700/50">
            <header className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50">
              <div>
                <h3 className="text-lg font-bold text-zinc-100 italic tracking-tight">Cổng xem trước báo cáo PDF</h3>
                <p className="text-[10px] text-zinc-400 mt-0.5 uppercase font-bold tracking-widest">Dữ liệu nội bộ - CinemaHub Entertainment</p>
              </div>
              <button 
                onClick={closePreview}
                className="h-10 w-10 flex items-center justify-center rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all transform hover:rotate-90"
                aria-label="Đóng xem trước"
              >
                ×
              </button>
            </header>
            
            <div className="flex-1 bg-zinc-950 p-1 sm:p-2 min-h-0 relative">
              {pdfUrl ? (
                <iframe 
                  src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                  className="w-full h-full rounded-lg border border-zinc-900 shadow-inner"
                  title="PDF Preview content"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-zinc-500 italic text-sm animate-pulse">Đang nạp dữ liệu báo cáo...</div>
              )}
            </div>

            <footer className="p-4 border-t border-zinc-800 bg-zinc-900/50 flex flex-wrap items-center justify-end gap-3">
              <button 
                onClick={closePreview}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-zinc-400 hover:text-white transition-all"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={confirmDownload}
                className="inline-flex items-center gap-2 rounded-xl bg-cinema-primary px-8 py-2.5 text-sm font-bold text-white transition-all hover:bg-red-500 active:scale-95 shadow-lg shadow-red-500/20"
              >
                <Download className="h-4 w-4" />
                Xác nhận & Tải về máy
              </button>
            </footer>
          </div>
        </div>
      )}
    </main>
  );
}

export default StaffRevenuePage;

