// src/pages/RevenueReport.jsx
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  Building,
  Calendar,
  Clapperboard,
  DollarSign,
  Download,
  ChevronDown,
  RefreshCw,
  Ticket,
  TrendingUp,
  Users,
} from "lucide-react";

function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(value || 0));
}

function formatNumber(value) {
  return new Intl.NumberFormat("vi-VN").format(Number(value || 0));
}

function RevenueChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const first = payload?.[0];
  const labelText =
    label !== undefined && label !== null && String(label).trim() !== ""
      ? String(label)
      : first?.name || "";
  const value = first?.value;
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-950/90 px-3 py-2 text-sm backdrop-blur">
      <div className="text-xs font-semibold text-zinc-100">{labelText}</div>
      <div className="mt-1 text-xs font-semibold text-cinema-primary">
        {formatCurrency(value)}
      </div>
    </div>
  );
}

export default function RevenueReport() {
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState([]);
  const [cinemaRevenue, setCinemaRevenue] = useState([]);
  const [movieRevenue, setMovieRevenue] = useState([]);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalTickets: 0,
    averageTicketPrice: 0,
    totalBookings: 0,
    growthRate: 0,
  });

  // Filters
  const [reportType, setReportType] = useState("month");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedQuarter, setSelectedQuarter] = useState(1);
  const [selectedCinema, setSelectedCinema] = useState("all");
  const [cinemas, setCinemas] = useState([]);

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    const list = [];
    for (let y = current; y >= 2020; y--) list.push(y);
    return list;
  }, []);

  const months = useMemo(
    () => Array.from({ length: 12 }, (_, i) => i + 1),
    []
  );

  // Chart colors (avoid hard-coded hex; rely on theme vars + neutral rgba)
  const CHART_COLORS = useMemo(
    () => [
      "var(--color-cinema-primary)",
      "var(--color-cinema-gold)",
      "var(--color-cinema-primary-dark)",
      "rgba(255, 255, 255, 0.28)",
      "rgba(255, 255, 255, 0.18)",
      "rgba(255, 255, 255, 0.1)",
    ],
    []
  );

  const getDateRangeLabel = () => {
    switch (reportType) {
      case "day":
        return `Tháng ${selectedMonth}/${selectedYear}`;
      case "month":
        return `Năm ${selectedYear}`;
      case "quarter":
        return `Quý ${selectedQuarter}/${selectedYear}`;
      case "year":
        return "Nhiều năm";
      default:
        return "";
    }
  };

  const buildReportParams = () => {
    const params = new URLSearchParams();
    params.set("type", reportType);

    // Backend behavior:
    // - day: requires year + month (group by day within month)
    // - month: requires year (group by months within year)
    // - quarter: requires year + quarter
    // - year: do NOT send year/month/quarter (group by years)
    if (reportType !== "year") {
      params.set("year", String(selectedYear));
    }

    if (reportType === "day") {
      params.set("month", String(selectedMonth));
    }

    if (reportType === "quarter") {
      params.set("quarter", String(selectedQuarter));
    }

    if (selectedCinema && selectedCinema !== "all") {
      params.set("cinema_id", selectedCinema);
    }

    return params;
  };

  const fetchCinemas = async () => {
    try {
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/reports/cinemas", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCinemas(data);
      }
    } catch (err) {
      console.error("Error fetching cinemas:", err);
    }
  };

  const fetchRevenueData = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      const params = buildReportParams();

      const response = await fetch(
        `http://localhost:5000/api/reports/revenue/details?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch revenue data");
      }

      const result = await response.json();

      // Set data from API response
      setRevenueData(result.revenueByPeriod || []);
      setCinemaRevenue(result.revenueByCinema || []);
      setMovieRevenue(result.revenueByMovie || []);

      // Update summary
      setSummary({
        totalRevenue: result.summary?.totalRevenue || 0,
        totalTickets: result.summary?.totalTickets || 0,
        averageTicketPrice: result.summary?.averageTicketPrice || 0,
        totalBookings: result.summary?.totalBookings || 0,
        growthRate: result.summary?.growthRate || 0,
      });
    } catch (err) {
      console.error("Error fetching revenue data:", err);
      setRevenueData([]);
      setCinemaRevenue([]);
      setMovieRevenue([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      const params = buildReportParams();

      const res = await fetch(
        `http://localhost:5000/api/reports/revenue/export?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Không thể xuất báo cáo.");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Bao-cao-doanh-thu-${reportType}-${selectedYear}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
    }
  };

  // Fetch danh sách rạp khi component mount
  useEffect(() => {
    fetchCinemas();
  }, []);

  // Fetch data when filters change
  useEffect(() => {
    fetchRevenueData();
  }, [reportType, selectedYear, selectedMonth, selectedQuarter, selectedCinema]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-zinc-200">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4" size={40} />
          <p>Đang tải dữ liệu doanh thu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-zinc-100">
      <section className="cinema-surface p-4 sm:p-6 print:border-0 print:p-0">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Báo cáo doanh thu</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Thống kê doanh thu theo thời gian, rạp và phim
            </p>
            <div className="mt-2 text-xs font-medium text-zinc-400">
              Kỳ báo cáo: {getDateRangeLabel()}
            </div>
          </div>

          <div className="flex gap-2 print:hidden">
            <button
              type="button"
              onClick={fetchRevenueData}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition"
              title="Xem báo cáo"
            >
              <RefreshCw size={16} />
              Xem báo cáo
            </button>
            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-2 rounded-lg bg-cinema-primary px-4 py-2 text-sm font-semibold text-white hover:bg-cinema-primary-dark transition"
            >
              <Download size={16} />
              Xuất Excel
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-5 cinema-surface p-4 print:hidden">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg bg-zinc-900 border border-white/10 px-3 py-2">
              <Calendar size={16} className="text-zinc-400" />
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="bg-transparent text-sm font-medium text-white outline-none cursor-pointer [&>option]:bg-zinc-900"
              >
                <option value="day">Theo tháng</option>
                <option value="month">Theo năm</option>
                <option value="quarter">Theo quý</option>
                <option value="year">Theo nhiều năm</option>
              </select>
              <ChevronDown size={14} className="text-zinc-500" />
            </div>

            {reportType !== "year" && (
              <div className="flex items-center gap-2 rounded-lg bg-zinc-900 border border-white/10 px-3 py-2">
                <span className="text-xs font-semibold text-zinc-400">Năm</span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="bg-transparent text-sm font-medium text-white outline-none cursor-pointer [&>option]:bg-zinc-900"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="text-zinc-500" />
              </div>
            )}

            {reportType === "day" && (
              <div className="flex items-center gap-2 rounded-lg bg-zinc-900 border border-white/10 px-3 py-2">
                <span className="text-xs font-semibold text-zinc-400">Tháng</span>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="bg-transparent text-sm font-medium text-white outline-none cursor-pointer [&>option]:bg-zinc-900"
                >
                  {months.map((m) => (
                    <option key={m} value={m}>
                      Tháng {m}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="text-zinc-500" />
              </div>
            )}

            {reportType === "quarter" && (
              <div className="flex items-center gap-2 rounded-lg bg-zinc-900 border border-white/10 px-3 py-2">
                <span className="text-xs font-semibold text-zinc-400">Quý</span>
                <select
                  value={selectedQuarter}
                  onChange={(e) => setSelectedQuarter(parseInt(e.target.value))}
                  className="bg-transparent text-sm font-medium text-white outline-none cursor-pointer [&>option]:bg-zinc-900"
                >
                  <option value={1}>Quý 1 (Tháng 1-3)</option>
                  <option value={2}>Quý 2 (Tháng 4-6)</option>
                  <option value={3}>Quý 3 (Tháng 7-9)</option>
                  <option value={4}>Quý 4 (Tháng 10-12)</option>
                </select>
                <ChevronDown size={14} className="text-zinc-500" />
              </div>
            )}

            {cinemas.length > 0 && (
              <div className="flex items-center gap-2 rounded-lg bg-zinc-900 border border-white/10 px-3 py-2">
                <Building size={16} className="text-zinc-400" />
                <select
                  value={selectedCinema}
                  onChange={(e) => setSelectedCinema(e.target.value)}
                  className="bg-transparent text-sm font-medium text-white outline-none cursor-pointer [&>option]:bg-zinc-900"
                >
                  <option value="all">Tất cả rạp</option>
                  {cinemas.map((cinema) => (
                    <option key={cinema.cinema_id} value={cinema.cinema_id}>
                      {cinema.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="text-zinc-400" />
              </div>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="cinema-surface p-4 sm:p-5">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-2xl bg-cinema-primary/15 flex items-center justify-center">
                <DollarSign size={20} className="text-cinema-primary" />
              </div>
              <span
                className={`text-xs flex items-center gap-1 ${
                  summary.growthRate >= 0 ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {summary.growthRate >= 0 ? (
                  <ArrowUpRight size={12} />
                ) : (
                  <ArrowDownRight size={12} />
                )}
                {Math.abs(summary.growthRate).toFixed(1)}%
              </span>
            </div>
            <div className="mt-3">
              <h2 className="text-2xl font-bold text-zinc-100">
                {formatCurrency(summary.totalRevenue)}
              </h2>
              <p className="text-zinc-400 text-sm mt-1">Tổng doanh thu</p>
            </div>
          </div>

          <div className="cinema-surface p-4 sm:p-5">
            <div className="w-10 h-10 rounded-2xl bg-cinema-gold/15 flex items-center justify-center">
              <Ticket size={20} className="text-cinema-gold" />
            </div>
            <div className="mt-3">
              <h2 className="text-2xl font-bold text-zinc-100">
                {formatNumber(summary.totalTickets)}
              </h2>
              <p className="text-zinc-400 text-sm mt-1">Tổng vé đã bán</p>
            </div>
          </div>

          <div className="cinema-surface p-4 sm:p-5">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
              <TrendingUp size={20} className="text-zinc-100" />
            </div>
            <div className="mt-3">
              <h2 className="text-2xl font-bold text-zinc-100">
                {formatCurrency(summary.averageTicketPrice)}
              </h2>
              <p className="text-zinc-400 text-sm mt-1">Giá vé trung bình</p>
            </div>
          </div>

          <div className="cinema-surface p-4 sm:p-5">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
              <Users size={20} className="text-zinc-100" />
            </div>
            <div className="mt-3">
              <h2 className="text-2xl font-bold text-zinc-100">
                {formatNumber(summary.totalBookings)}
              </h2>
              <p className="text-zinc-400 text-sm mt-1">Tổng giao dịch</p>
            </div>
          </div>
        </div>

        {/* Revenue Trend Chart */}
        <div className="mt-6 cinema-surface p-5">
          <h3 className="font-semibold mb-1">Xu hướng doanh thu</h3>
          <div className="text-sm text-zinc-400 mb-4">{getDateRangeLabel()}</div>
          {revenueData.length > 0 ? (
            <div className="text-zinc-300">
              <ResponsiveContainer width="100%" height={360}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient
                      id="revenueGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="var(--color-cinema-primary)"
                        stopOpacity={0.25}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-cinema-primary)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255, 255, 255, 0.06)"
                  />
                  <XAxis
                    dataKey="period"
                    stroke="rgba(255, 255, 255, 0.35)"
                    tick={{ fill: "rgba(255, 255, 255, 0.65)", fontSize: 12 }}
                  />
                  <YAxis
                    stroke="rgba(255, 255, 255, 0.35)"
                    tick={{ fill: "rgba(255, 255, 255, 0.65)", fontSize: 12 }}
                    tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
                  />
                  <Tooltip content={<RevenueChartTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Doanh thu"
                    stroke="var(--color-cinema-primary)"
                    fill="url(#revenueGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-12 text-zinc-400">
              Không có dữ liệu doanh thu trong khoảng thời gian này
            </div>
          )}
        </div>

        {/* Revenue by Cinema & Revenue by Movie */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Doanh thu theo rạp */}
          <div className="cinema-surface p-5">
            <div className="flex items-center gap-2 mb-4">
              <Building size={20} className="text-zinc-200" />
              <h3 className="font-semibold">Doanh thu theo rạp</h3>
            </div>
            {cinemaRevenue.length > 0 ? (
              <>
                <div className="text-zinc-300">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart
                      data={cinemaRevenue}
                      layout="vertical"
                      margin={{ left: 8 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255, 255, 255, 0.06)"
                      />
                      <XAxis
                        type="number"
                        stroke="rgba(255, 255, 255, 0.35)"
                        tick={{ fill: "rgba(255, 255, 255, 0.65)", fontSize: 12 }}
                        tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
                      />
                      <YAxis
                        type="category"
                        dataKey="cinema_name"
                        width={110}
                        stroke="rgba(255, 255, 255, 0.35)"
                        tick={{ fill: "rgba(255, 255, 255, 0.65)", fontSize: 12 }}
                      />
                      <Tooltip content={<RevenueChartTooltip />} />
                      <Bar dataKey="revenue" radius={[0, 6, 6, 0]}>
                        {cinemaRevenue.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium text-zinc-400 mb-2">
                    Chi tiết từng rạp
                  </h4>
                  {cinemaRevenue.map((cinema, idx) => {
                    const percentage =
                      summary.totalRevenue > 0
                        ? (cinema.revenue / summary.totalRevenue) * 100
                        : 0;
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-lg p-2 hover:bg-white/5"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{cinema.cinema_name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-cinema-primary rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-zinc-400">
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-zinc-100">
                            {formatCurrency(cinema.revenue)}
                          </p>
                          <p className="text-xs text-zinc-400">
                            {formatNumber(cinema.tickets)} vé
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-zinc-400">
                <Building size={40} className="mx-auto mb-2 opacity-40" />
                <p>Chưa có dữ liệu doanh thu theo rạp</p>
              </div>
            )}
          </div>

          {/* Doanh thu theo phim */}
          <div className="cinema-surface p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clapperboard size={20} className="text-zinc-200" />
              <h3 className="font-semibold">Doanh thu theo phim</h3>
            </div>
            {movieRevenue.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={movieRevenue}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ payload, percent }) =>
                        `${payload?.movie_title || ""}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      dataKey="revenue"
                      nameKey="movie_title"
                    >
                      {movieRevenue.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<RevenueChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                <div className="mt-4 space-y-2 max-h-[300px] overflow-y-auto">
                  <h4 className="text-sm font-medium text-zinc-400 mb-2">
                    Top phim doanh thu cao
                  </h4>
                  {movieRevenue.map((movie, idx) => {
                    const percentage =
                      summary.totalRevenue > 0
                        ? (movie.revenue / summary.totalRevenue) * 100
                        : 0;
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-lg p-2 hover:bg-white/5"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-6 h-6 rounded-full bg-white/10 text-zinc-100 flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {movie.movie_title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-cinema-primary rounded-full"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-xs text-zinc-400">
                                {percentage.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-zinc-100 text-sm">
                            {formatCurrency(movie.revenue)}
                          </p>
                          <p className="text-xs text-zinc-400">
                            {formatNumber(movie.tickets)} vé
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-zinc-400">
                <Clapperboard size={40} className="mx-auto mb-2 opacity-40" />
                <p>Chưa có dữ liệu doanh thu theo phim</p>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Data Table */}
        <div className="mt-6 cinema-surface p-5 overflow-x-auto">
          <h3 className="font-semibold mb-4">Chi tiết doanh thu theo kỳ</h3>
          {revenueData.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-zinc-300 font-medium">
                    {reportType === "day" && "Ngày"}
                    {reportType === "month" && "Tháng"}
                    {reportType === "quarter" && "Quý"}
                    {reportType === "year" && "Năm"}
                  </th>
                  <th className="text-right py-3 px-4 text-zinc-300 font-medium">
                    Doanh thu
                  </th>
                  <th className="text-right py-3 px-4 text-zinc-300 font-medium">
                    Số vé
                  </th>
                  <th className="text-right py-3 px-4 text-zinc-300 font-medium">
                    Giá vé TB
                  </th>
                  <th className="text-right py-3 px-4 text-zinc-300 font-medium">
                    Tỉ lệ
                  </th>
                </tr>
              </thead>
              <tbody>
                {revenueData.map((item, idx) => {
                  const percentage =
                    summary.totalRevenue > 0
                      ? (item.revenue / summary.totalRevenue) * 100
                      : 0;
                  return (
                    <tr
                      key={idx}
                      className="border-b border-white/5 hover:bg-white/5 transition"
                    >
                      <td className="py-3 px-4 font-medium">{item.period}</td>
                      <td className="text-right py-3 px-4 font-semibold text-cinema-primary">
                        {formatCurrency(item.revenue)}
                      </td>
                      <td className="text-right py-3 px-4">
                        {formatNumber(item.tickets)}
                      </td>
                      <td className="text-right py-3 px-4 text-zinc-300">
                        {item.tickets > 0
                          ? formatCurrency(item.revenue / item.tickets)
                          : "0"}
                      </td>
                      <td className="text-right py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-cinema-primary rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-zinc-400">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="border-t border-white/10">
                <tr>
                  <td className="py-3 px-4 font-bold">Tổng cộng</td>
                  <td className="text-right py-3 px-4 font-bold text-cinema-primary">
                    {formatCurrency(summary.totalRevenue)}
                  </td>
                  <td className="text-right py-3 px-4 font-bold">
                    {formatNumber(summary.totalTickets)}
                  </td>
                  <td className="text-right py-3 px-4 font-bold text-zinc-300">
                    {formatCurrency(summary.averageTicketPrice)}
                  </td>
                  <td className="text-right py-3 px-4">100%</td>
                </tr>
              </tfoot>
            </table>
          ) : (
            <div className="text-center py-12 text-zinc-400">
              Không có dữ liệu chi tiết
            </div>
          )}
        </div>
      </section>
    </div>
  );
}