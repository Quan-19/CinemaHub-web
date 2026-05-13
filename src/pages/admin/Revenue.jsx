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
  Clapperboard,
  DollarSign,
  Download,
  Filter,
  History,
  LayoutDashboard,
  PieChart as PieChartIcon,
  RefreshCw,
  Search,
  Star,
  Ticket,
  TrendingUp,
  Users,
} from "lucide-react";

const StatCard = ({ icon: Icon, accentClassName, value, title, subtitle, trend }) => (
  <div className="cinema-surface p-5 group hover:border-red-500/30 transition-all duration-300">
    <div className="flex items-start justify-between mb-4">
      <div className={[
        "inline-flex h-12 w-12 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 duration-300",
        accentClassName
      ].join(" ")}>
        <Icon className="h-6 w-6" />
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trend >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
          {trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {Math.abs(trend).toFixed(1)}%
        </div>
      )}
    </div>
    <div>
      <div className="text-2xl font-black tracking-tight text-white">{value}</div>
      <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">{title}</div>
      {subtitle && <div className="text-[10px] text-zinc-500 mt-2 font-medium">{subtitle}</div>}
    </div>
  </div>
);

function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(value || 0));
}

function formatNumber(value) {
  return new Intl.NumberFormat("vi-VN").format(Number(value || 0));
}

function formatCompactValue(value) {
  const num = Number(value || 0);
  const abs = Math.abs(num);
  if (abs >= 1_000_000_000) {
    const digits = abs >= 10_000_000_000 ? 0 : 1;
    return `${(num / 1_000_000_000).toFixed(digits)}B`;
  }
  if (abs >= 1_000_000) {
    const digits = abs >= 10_000_000 ? 0 : 1;
    return `${(num / 1_000_000).toFixed(digits)}M`;
  }
  if (abs >= 1_000) {
    const digits = abs >= 10_000 ? 0 : 1;
    return `${(num / 1_000).toFixed(digits)}K`;
  }
  return formatNumber(num);
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

// Custom label cho pie chart để tránh tràn chữ
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
  payload,
}) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius * 1.2;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  let movieName = payload?.movie_title || "";
  if (movieName.length > 15) {
    movieName = movieName.substring(0, 12) + "...";
  }

  return (
    <text
      x={x}
      y={y}
      fill="rgba(255, 255, 255, 0.7)"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={11}
    >
      {`${movieName} (${(percent * 100).toFixed(0)}%)`}
    </text>
  );
};

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

  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);

  const detailRevenueData = useMemo(() => {
    return (revenueData || []).filter((item) => {
      const revenue = Number(item?.revenue || 0);
      const tickets = Number(item?.tickets || 0);
      return revenue > 0 || tickets > 0;
    });
  }, [revenueData]);

  const cinemaChartHeight = useMemo(() => {
    const count = cinemaRevenue?.length || 0;
    if (count <= 1) return 160;
    if (count === 2) return 200;
    return 280;
  }, [cinemaRevenue]);

  const cinemaBarSize = useMemo(() => {
    const count = cinemaRevenue?.length || 0;
    if (count <= 1) return 18;
    if (count === 2) return 20;
    return undefined;
  }, [cinemaRevenue]);

  const isSingleCinema = (cinemaRevenue?.length || 0) === 1;

  // Chart colors
  const CHART_COLORS = useMemo(
    () => [
      "var(--color-cinema-primary)",
      "var(--color-cinema-gold)",
      "#3b82f6",
      "#10b981",
      "#f59e0b",
      "#ef4444",
      "#8b5cf6",
      "#ec4899",
      "#06b6d4",
      "#84cc16",
    ],
    [],
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
      const token =
        sessionStorage.getItem("token") || localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5000/api/reports/cinemas",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

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
      const token =
        sessionStorage.getItem("token") || localStorage.getItem("token");
      const params = buildReportParams();

      const response = await fetch(
        `http://localhost:5000/api/reports/revenue/details?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch revenue data");
      }

      const result = await response.json();

      // Tạo đủ 12 tháng nếu là báo cáo theo năm
      let processedData = result.revenueByPeriod || [];

      if (reportType === "month") {
        // Tạo mảng 12 tháng
        const fullYearData = [];
        for (let i = 1; i <= 12; i++) {
          const existingData = processedData.find((item) => {
            const monthNum = parseInt(item.period.match(/\d+/)?.[0] || 0);
            return monthNum === i;
          });

          if (existingData) {
            fullYearData.push(existingData);
          } else {
            fullYearData.push({
              period: `Tháng ${i}`,
              revenue: 0,
              tickets: 0,
            });
          }
        }
        processedData = fullYearData;
      }

      // Sắp xếp dữ liệu
      const sortedRevenueData = processedData.sort((a, b) => {
        if (reportType === "year") {
          return parseInt(a.period) - parseInt(b.period);
        }
        if (reportType === "month") {
          const aNum = parseInt(a.period.match(/\d+/)?.[0] || 0);
          const bNum = parseInt(b.period.match(/\d+/)?.[0] || 0);
          return aNum - bNum;
        }
        if (reportType === "quarter") {
          const aNum = parseInt(a.period.match(/\d+/)?.[0] || 0);
          const bNum = parseInt(b.period.match(/\d+/)?.[0] || 0);
          return aNum - bNum;
        }
        return 0;
      });

      setRevenueData(sortedRevenueData);
      setCinemaRevenue(result.revenueByCinema || []);
      setMovieRevenue(result.revenueByMovie || []);

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
      const token =
        sessionStorage.getItem("token") || localStorage.getItem("token");
      const params = buildReportParams();

      const res = await fetch(
        `http://localhost:5000/api/reports/revenue/export?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } },
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

  useEffect(() => {
    fetchCinemas();
  }, []);

  useEffect(() => {
    fetchRevenueData();
  }, [
    reportType,
    selectedYear,
    selectedMonth,
    selectedQuarter,
    selectedCinema,
  ]);

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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <TrendingUp className="text-red-600" size={32} />
            Báo cáo doanh thu
          </h1>
          <p className="text-sm text-zinc-500 font-medium">Phân tích chuyên sâu về tình hình tài chính của CinemaHub</p>
        </div>

        <div className="flex items-center gap-3 print:hidden">
          <button
            onClick={fetchRevenueData}
            className="p-2.5 rounded-xl bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
            title="Tải lại dữ liệu"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-lg shadow-red-600/20"
          >
            <Download size={18} />
            Xuất báo cáo (Excel)
          </button>
        </div>
      </div>

      <div className="cinema-surface p-5 print:hidden">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={16} className="text-red-500" />
          <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Bộ lọc báo cáo</h3>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-zinc-500 uppercase px-1">Chế độ xem</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="rounded-xl bg-zinc-950 border border-white/10 px-4 py-2.5 text-sm font-bold text-white outline-none focus:border-red-500/50 transition-all cursor-pointer min-w-[160px]"
            >
              <option value="day">📅 Theo tháng (Ngày)</option>
              <option value="month">📆 Theo năm (Tháng)</option>
              <option value="quarter">📊 Theo quý</option>
              <option value="year">📈 Theo nhiều năm</option>
            </select>
          </div>

          {reportType !== "year" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase px-1">Năm</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="rounded-xl bg-zinc-950 border border-white/10 px-4 py-2.5 text-sm font-bold text-white outline-none focus:border-red-500/50 transition-all cursor-pointer min-w-[100px]"
              >
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          )}

          {reportType === "day" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase px-1">Tháng</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="rounded-xl bg-zinc-950 border border-white/10 px-4 py-2.5 text-sm font-bold text-white outline-none focus:border-red-500/50 transition-all cursor-pointer min-w-[120px]"
              >
                {months.map((m) => <option key={m} value={m}>Tháng {m}</option>)}
              </select>
            </div>
          )}

          {reportType === "quarter" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase px-1">Quý</label>
              <select
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(parseInt(e.target.value))}
                className="rounded-xl bg-zinc-950 border border-white/10 px-4 py-2.5 text-sm font-bold text-white outline-none focus:border-red-500/50 transition-all cursor-pointer min-w-[160px]"
              >
                <option value={1}>Quý 1 (T1-T3)</option>
                <option value={2}>Quý 2 (T4-T6)</option>
                <option value={3}>Quý 3 (T7-T9)</option>
                <option value={4}>Quý 4 (T10-T12)</option>
              </select>
            </div>
          )}

          {cinemas.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase px-1">Rạp chiếu</label>
              <select
                value={selectedCinema}
                onChange={(e) => setSelectedCinema(e.target.value)}
                className="rounded-xl bg-zinc-950 border border-white/10 px-4 py-2.5 text-sm font-bold text-white outline-none focus:border-red-500/50 transition-all cursor-pointer min-w-[200px]"
              >
                <option value="all">🏠 Tất cả rạp</option>
                {cinemas.map((cinema) => (
                  <option key={cinema.cinema_id} value={cinema.cinema_id}>{cinema.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

        {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={DollarSign}
          accentClassName="bg-red-600/20 text-red-500 shadow-[0_0_20px_rgba(220,38,38,0.2)]"
          value={formatCurrency(summary.totalRevenue)}
          title="Tổng doanh thu"
          subtitle={getDateRangeLabel()}
          trend={summary.growthRate}
        />
        <StatCard
          icon={Ticket}
          accentClassName="bg-amber-500/20 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
          value={formatNumber(summary.totalTickets)}
          title="Tổng vé bán"
          subtitle="Giao dịch thành công"
        />
        <StatCard
          icon={TrendingUp}
          accentClassName="bg-emerald-500/20 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
          value={formatCurrency(summary.averageTicketPrice)}
          title="Giá vé trung bình"
          subtitle="Dựa trên tổng doanh thu/vé"
        />
        <StatCard
          icon={Users}
          accentClassName="bg-blue-500/20 text-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
          value={formatNumber(summary.totalBookings)}
          title="Tổng đơn hàng"
          subtitle="Tính cả bắp nước & dịch vụ"
        />
      </div>

      <div className="cinema-surface p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp size={20} className="text-red-500" />
              Xu hướng doanh thu
            </h3>
            <p className="text-xs text-zinc-500 font-medium">Thống kê chi tiết theo {getDateRangeLabel()}</p>
          </div>
        </div>
        
        {revenueData.length > 0 ? (
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e50914" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#e50914" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis 
                  dataKey="period" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#71717a', fontSize: 11, fontWeight: 600 }}
                  interval={reportType === "month" ? 0 : "preserveStartEnd"}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#71717a', fontSize: 11, fontWeight: 600 }}
                  tickFormatter={formatCompactValue}
                  width={50}
                />
                <Tooltip content={<RevenueChartTooltip />} cursor={{ stroke: '#e50914', strokeWidth: 1 }} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#e50914"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#revGradient)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-60 items-center justify-center text-zinc-500 italic">
            Chưa có dữ liệu thống kê cho kỳ này
          </div>
        )}
      </div>
        {/* Revenue by Cinema & Revenue by Movie */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="cinema-surface p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <PieChartIcon size={20} className="text-amber-500" />
              Doanh thu theo rạp
            </h3>
          </div>
          {cinemaRevenue.length > 0 ? (
            <div className="space-y-6">
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cinemaRevenue} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255, 255, 255, 0.05)" />
                    <XAxis type="number" hide />
                    <YAxis 
                      type="category" 
                      dataKey="cinema_name" 
                      width={100} 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#71717a', fontSize: 11, fontWeight: 600 }}
                    />
                    <Tooltip content={<RevenueChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                    <Bar dataKey="revenue" radius={[0, 4, 4, 0]} barSize={20}>
                      {cinemaRevenue.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                {cinemaRevenue.map((cinema, idx) => {
                  const percentage = summary.totalRevenue > 0 ? (cinema.revenue / summary.totalRevenue) * 100 : 0;
                  return (
                    <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/5 group hover:border-red-500/30 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-zinc-200">{cinema.cinema_name}</span>
                        <span className="text-sm font-black text-white">{formatCurrency(cinema.revenue)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-red-600 rounded-full transition-all duration-1000" 
                            style={{ width: `${percentage}%` }} 
                          />
                        </div>
                        <span className="text-[10px] font-black text-zinc-500 w-10 text-right">{percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex h-60 items-center justify-center text-zinc-500 italic text-sm">Chưa có dữ liệu rạp</div>
          )}
        </div>

        <div className="cinema-surface p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Star size={20} className="text-yellow-500" />
              Doanh thu theo phim
            </h3>
          </div>
          {movieRevenue.length > 0 ? (
            <div className="space-y-6">
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={movieRevenue}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="revenue"
                      nameKey="movie_title"
                    >
                      {movieRevenue.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip content={<RevenueChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3 max-h-[360px] overflow-y-auto custom-scrollbar pr-2">
                {movieRevenue.map((movie, idx) => {
                  const percentage = summary.totalRevenue > 0 ? (movie.revenue / summary.totalRevenue) * 100 : 0;
                  return (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 group hover:border-yellow-500/30 transition-all">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-[10px] font-black text-zinc-500 group-hover:bg-yellow-600 group-hover:text-white transition-colors">
                          {idx + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-zinc-200 truncate">{movie.movie_title}</p>
                          <p className="text-[10px] text-zinc-500 font-bold uppercase">{formatNumber(movie.tickets)} vé</p>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-sm font-black text-white">{formatCurrency(movie.revenue)}</div>
                        <div className="text-[10px] font-bold text-yellow-500">{percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex h-60 items-center justify-center text-zinc-500 italic text-sm">Chưa có dữ liệu phim</div>
          )}
        </div>
      </div>

      <div className="cinema-surface p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <History size={20} className="text-blue-500" />
            Chi tiết doanh thu theo kỳ
          </h3>
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md">Bảng kê chi tiết</span>
        </div>
        
        {detailRevenueData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">
                  <th className="pb-4 px-4">Kỳ báo cáo</th>
                  <th className="pb-4 px-4 text-right">Doanh thu</th>
                  <th className="pb-4 px-4 text-right">Số vé</th>
                  <th className="pb-4 px-4 text-right">Giá vé TB</th>
                  <th className="pb-4 px-4 text-right">Tỉ lệ (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {detailRevenueData.map((item, idx) => {
                  const percentage = summary.totalRevenue > 0 ? (item.revenue / summary.totalRevenue) * 100 : 0;
                  return (
                    <tr key={idx} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-4 text-sm font-bold text-zinc-200">{item.period}</td>
                      <td className="py-4 px-4 text-right text-sm font-black text-white">{formatCurrency(item.revenue)}</td>
                      <td className="py-4 px-4 text-right text-sm font-bold text-zinc-400">{formatNumber(item.tickets)}</td>
                      <td className="py-4 px-4 text-right text-xs font-medium text-zinc-500">
                        {item.tickets > 0 ? formatCurrency(item.revenue / item.tickets) : "0"}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-3">
                          <div className="w-20 h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-red-600 rounded-full" style={{ width: `${percentage}%` }} />
                          </div>
                          <span className="text-[10px] font-black text-zinc-400 w-8 text-right">{percentage.toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-red-600/5">
                  <td className="py-5 px-4 text-sm font-black text-white uppercase tracking-widest">Tổng cộng</td>
                  <td className="py-5 px-4 text-right text-lg font-black text-red-500">{formatCurrency(summary.totalRevenue)}</td>
                  <td className="py-5 px-4 text-right text-sm font-black text-white">{formatNumber(summary.totalTickets)}</td>
                  <td className="py-5 px-4 text-right text-sm font-bold text-zinc-400">{formatCurrency(summary.averageTicketPrice)}</td>
                  <td className="py-5 px-4 text-right text-sm font-black text-zinc-300">100%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-zinc-500 italic">Không có dữ liệu chi tiết</div>
        )}
      </div>
    </div>
  );
}
