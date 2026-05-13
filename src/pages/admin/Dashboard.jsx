import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  DollarSign,
  Ticket,
  Users,
  Film,
  Clapperboard,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingBag,
  Activity,
  History,
  Star,
} from "lucide-react";

import { useMemo, useState, useEffect } from "react";
import axios from "axios";
/* ===================== STAT CARD ===================== */

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(value || 0));

const formatNumber = (value) =>
  new Intl.NumberFormat("vi-VN").format(Number(value || 0));

const getQuarterMonthRange = (quarter) => {
  switch (Number(quarter)) {
    case 1:
      return "T1–T3";
    case 2:
      return "T4–T6";
    case 3:
      return "T7–T9";
    case 4:
      return "T10–T12";
    default:
      return "";
  }
};

const StatCard = ({ icon: Icon, accentClassName, value, title, subtitle, trend }) => (
  <div className="cinema-surface p-5 group hover:border-red-500/30 transition-all duration-300">
    <div className="flex items-start justify-between">
      <div
        className={[
          "inline-flex h-12 w-12 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 duration-300",
          accentClassName,
        ].join(" ")}
      >
        <Icon className="h-6 w-6" />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
          {trend > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>

    <div className="mt-5">
      <div className="flex items-baseline gap-2">
        <div className="text-3xl font-black tracking-tight text-white">{value}</div>
      </div>
      <div className="mt-1 flex items-center justify-between">
        <div className="text-sm font-medium text-zinc-400 uppercase tracking-wider">{title}</div>
        {subtitle && <div className="text-[10px] text-zinc-500 font-bold">{subtitle}</div>}
      </div>
    </div>
  </div>
);

const RevenueTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const value = payload?.[0]?.value;
  const labelString = String(label || "");
  const labelText = labelString.startsWith("T")
    ? `Tháng ${labelString.slice(1)}`
    : labelString.startsWith("D")
      ? `Ngày ${labelString.slice(1)}`
      : labelString.startsWith("Q")
        ? `Quý ${labelString.slice(1)} (${getQuarterMonthRange(labelString.slice(1))})`
        : labelString;
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-950/90 px-3 py-2 text-sm backdrop-blur">
      <div className="text-xs font-semibold text-zinc-100">{labelText}</div>
      <div className="mt-1 text-xs font-semibold text-cinema-primary">
        {formatCurrency(value)}
      </div>
    </div>
  );
};

/* ===================== DASHBOARD ===================== */

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedYear, setSelectedYear] = useState(() =>
    new Date().getFullYear(),
  );
  const [revenueView, setRevenueView] = useState("month");
  const [selectedMonth, setSelectedMonth] = useState(
    () => new Date().getMonth() + 1,
  );
  const [selectedQuarter, setSelectedQuarter] = useState(
    () => Math.floor(new Date().getMonth() / 3) + 1,
  );

  const todayLabel = new Date().toLocaleDateString("vi-VN");

  const revenueByMonthRaw = useMemo(() => {
    if (Array.isArray(data?.revenueByMonth)) return data.revenueByMonth;
    if (Array.isArray(data?.revenue)) return data.revenue;
    return [];
  }, [data]);

  const revenueByQuarterRaw = useMemo(() => {
    if (Array.isArray(data?.revenueByQuarter)) return data.revenueByQuarter;
    return [];
  }, [data]);

  const revenueByDayRaw = useMemo(() => {
    if (Array.isArray(data?.revenueByDay)) return data.revenueByDay;
    return [];
  }, [data]);

  const revenueByYearRaw = useMemo(() => {
    if (Array.isArray(data?.revenueByYear)) return data.revenueByYear;
    return [];
  }, [data]);

  const revenueData = useMemo(() => {
    const monthToRevenue = new Map(
      revenueByMonthRaw.map((r) => [Number(r.month), Number(r.revenue || 0)]),
    );

    return Array.from({ length: 12 }, (_, i) => {
      const monthNumber = i + 1;
      return {
        period: `T${monthNumber}`,
        revenue: monthToRevenue.get(monthNumber) || 0,
      };
    });
  }, [revenueByMonthRaw]);

  const revenueByDayData = useMemo(() => {
    const dayToRevenue = new Map(
      revenueByDayRaw.map((r) => [Number(r.day), Number(r.revenue || 0)]),
    );
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();

    return Array.from({ length: daysInMonth }, (_, i) => {
      const dayNumber = i + 1;
      return {
        period: `Ngày ${dayNumber}`,
        revenue: dayToRevenue.get(dayNumber) || 0,
      };
    });
  }, [revenueByDayRaw, selectedMonth, selectedYear]);

  const revenueByQuarterMonthsData = useMemo(() => {
    const quarterNumber = Number(selectedQuarter);
    const startMonth = (quarterNumber - 1) * 3 + 1;
    const months = [startMonth, startMonth + 1, startMonth + 2].filter(
      (m) => m >= 1 && m <= 12,
    );

    const monthToRevenue = new Map(
      revenueByMonthRaw.map((r) => [Number(r.month), Number(r.revenue || 0)]),
    );

    return months.map((m) => ({
      period: `T${m}`,
      revenue: monthToRevenue.get(m) || 0,
    }));
  }, [revenueByMonthRaw, selectedQuarter]);

  const chartData =
    revenueView === "day"
      ? revenueByDayData
      : revenueView === "quarter"
        ? revenueByQuarterMonthsData
        : revenueData;

  const revenueByQuarter = useMemo(() => {
    const quarterToRevenue = new Map(
      revenueByQuarterRaw.map((r) => [Number(r.quarter), Number(r.revenue || 0)])
    );
    return [1, 2, 3, 4].map((q) => ({
      quarter: q,
      period: `Q${q}`,
      revenue: quarterToRevenue.get(q) || 0,
    }));
  }, [revenueByQuarterRaw]);

  const revenueByYear = useMemo(() => {
    return [...revenueByYearRaw]
      .map((r) => ({
        year: Number(r.year),
        revenue: Number(r.revenue || 0),
      }))
      .sort((a, b) => b.year - a.year);
  }, [revenueByYearRaw]);

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const fallback = Array.from({ length: 5 }, (_, i) => currentYear - i);
    const apiYears = Array.isArray(data?.revenueByYear)
      ? data.revenueByYear
          .map((x) => Number(x.year))
          .filter((y) => Number.isFinite(y))
      : [];

    return Array.from(new Set([selectedYear, ...fallback, ...apiYears])).sort(
      (a, b) => b - a,
    );
  }, [data, selectedYear]);

  const latestRevenuePoint = revenueByMonthRaw.length
    ? revenueByMonthRaw[revenueByMonthRaw.length - 1]
    : null;

  const latestMonthLabel = latestRevenuePoint?.month
    ? `Tháng ${latestRevenuePoint.month}`
    : null;
  // Thêm vào đầu Dashboard component
  useEffect(() => {
    console.log("========== STORAGE CHECK ==========");
    console.log("localStorage token:", localStorage.getItem("token"));
    console.log("sessionStorage token:", sessionStorage.getItem("token"));
    console.log(
      "localStorage twoFactorVerified:",
      localStorage.getItem("twoFactorVerified"),
    );
    console.log(
      "sessionStorage twoFactorVerified:",
      sessionStorage.getItem("twoFactorVerified"),
    );
    console.log(
      "typeof twoFactorVerified:",
      typeof localStorage.getItem("twoFactorVerified"),
    );
  }, []);
  // 🔥 CALL API
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        const twoFactorVerified =
          localStorage.getItem("twoFactorVerified") ||
          sessionStorage.getItem("twoFactorVerified");

        // 🔥 LOG ĐỂ KIỂM TRA
        console.log("========== DASHBOARD FETCH ==========");
        console.log("token:", token);
        console.log("twoFactorVerified:", twoFactorVerified);
        console.log("twoFactorVerified type:", typeof twoFactorVerified);
        console.log(
          'twoFactorVerified === "true":',
          twoFactorVerified === "true",
        );

        const params = {
          year: selectedYear,
          month: selectedMonth,
        };

        const response = await axios.get(
          "http://localhost:5000/api/dashboard",
          {
            params: params,
            headers: {
              Authorization: `Bearer ${token}`,
              "x-2fa-verified": twoFactorVerified === "true" ? "true" : "false",
            },
          },
        );

        setData(response.data);
      } catch (err) {
        console.error("Dashboard error:", err);
        setError(err?.response?.data?.message || "Không tải được dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [selectedMonth, selectedYear]);

  if (loading) return <div className="text-white p-6">Loading...</div>;

  if (error) {
    return (
      <div className="cinema-surface p-4 sm:p-5">
        <div className="text-sm font-semibold text-red-400">{error}</div>
      </div>
    );
  }

  /* ===================== MAP DATA ===================== */

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black sm:text-3xl text-white">Dashboard Thống Kê</h1>
        <p className="text-sm text-zinc-500 font-medium">
          Dữ liệu hệ thống cập nhật lúc: {todayLabel}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={DollarSign}
          accentClassName="bg-red-600/20 text-red-500 shadow-[0_0_20px_rgba(220,38,38,0.2)]"
          value={formatCurrency(data?.todayRevenue)}
          title="Doanh thu ngày"
          subtitle={todayLabel}
          trend={12.5}
        />
        <StatCard
          icon={Ticket}
          accentClassName="bg-amber-500/20 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
          value={formatNumber(data?.todayTickets)}
          title="Vé bán ngày"
          subtitle={todayLabel}
          trend={8.2}
        />
        <StatCard
          icon={Clapperboard}
          accentClassName="bg-emerald-500/20 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
          value={formatNumber(data?.showtimes)}
          title="Suất chiếu hôm nay"
          subtitle={todayLabel}
        />
        <StatCard
          icon={Users}
          accentClassName="bg-blue-500/20 text-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
          value={formatNumber(data?.users)}
          title="Tổng người dùng"
          trend={2.4}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Unified Revenue Analytics Card */}
          <div className="cinema-surface p-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between mb-8">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-3">
                  <TrendingUp size={24} className="text-red-600" />
                  Phân tích doanh thu
                </h2>
                <p className="text-xs text-zinc-500 font-medium">Theo dõi biến động dòng tiền theo ngày và tháng</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-zinc-600 uppercase">Xem theo</label>
                  <select
                    className="rounded-lg border border-white/5 bg-zinc-900 px-3 py-1.5 text-xs font-bold text-zinc-300 outline-none focus:border-red-500/50"
                    value={revenueView}
                    onChange={(e) => setRevenueView(e.target.value)}
                  >
                    <option value="month">Từng Tháng</option>
                    <option value="day">Từng Ngày</option>
                    <option value="quarter">Từng Quý</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-zinc-600 uppercase">Năm</label>
                  <select
                    className="rounded-lg border border-white/5 bg-zinc-900 px-3 py-1.5 text-xs font-bold text-zinc-300 outline-none focus:border-red-500/50"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                  >
                    {yearOptions.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                {revenueView === "day" && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-zinc-600 uppercase">Tháng</label>
                    <select
                      className="rounded-lg border border-white/5 bg-zinc-900 px-3 py-1.5 text-xs font-bold text-zinc-300 outline-none focus:border-emerald-500/50"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <option key={m} value={m}>T{m}</option>
                      ))}
                    </select>
                  </div>
                )}
                {revenueView === "quarter" && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-zinc-600 uppercase">Quý</label>
                    <select
                      className="rounded-lg border border-white/5 bg-zinc-900 px-3 py-1.5 text-xs font-bold text-zinc-300 outline-none focus:border-blue-500/50"
                      value={selectedQuarter}
                      onChange={(e) => setSelectedQuarter(Number(e.target.value))}
                    >
                      {[1, 2, 3, 4].map((q) => (
                        <option key={q} value={q}>Quý {q}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="h-[320px] w-full">
              {revenueView === "month" ? (
                revenueData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevMonth" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#e50914" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#e50914" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 10, fontWeight: 600 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 10, fontWeight: 600 }} tickFormatter={(v) => `${(v/1000000).toFixed(1)}M`} width={40} />
                      <Tooltip content={<RevenueTooltip />} cursor={{ stroke: '#e50914', strokeWidth: 1 }} />
                      <Area type="monotone" dataKey="revenue" stroke="#e50914" strokeWidth={3} fillOpacity={1} fill="url(#colorRevMonth)" animationDuration={1000} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : <div className="flex h-full items-center justify-center text-zinc-500 italic">Đang tải...</div>
              ) : revenueView === "day" ? (
                revenueByDayData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueByDayData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevDay" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 10, fontWeight: 500 }} tickFormatter={(v) => v.replace('Ngày ', '')} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 10, fontWeight: 600 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} width={40} />
                      <Tooltip content={<RevenueTooltip />} cursor={{ stroke: '#10b981', strokeWidth: 1 }} />
                      <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevDay)" animationDuration={1000} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : <div className="flex h-full items-center justify-center text-zinc-500 italic">Không có dữ liệu ngày</div>
              ) : (
                revenueByQuarterMonthsData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueByQuarterMonthsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevQuarter" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 10, fontWeight: 500 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 10, fontWeight: 600 }} tickFormatter={(v) => `${(v/1000000).toFixed(1)}M`} width={40} />
                      <Tooltip content={<RevenueTooltip />} cursor={{ stroke: '#3b82f6', strokeWidth: 1 }} />
                      <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevQuarter)" animationDuration={1000} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : <div className="flex h-full items-center justify-center text-zinc-500 italic">Không có dữ liệu quý</div>
              )}
            </div>
          </div>

          {/* Unified Statistics Overview Card */}
          <div className="cinema-surface p-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-3">
                  <BarChart size={24} className="text-blue-500" />
                  Thống kê chi tiết
                </h2>
                <p className="text-xs text-zinc-500 font-medium">Bảng xếp hạng phim và doanh thu theo kỳ</p>
              </div>
              <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl">
                <span className="px-3 py-1.5 rounded-lg bg-red-600 text-[10px] font-black text-white uppercase tracking-widest">Tổng hợp</span>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
              {/* Top Movies Sub-section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black text-zinc-300 uppercase tracking-widest flex items-center gap-2">
                    <Star size={16} className="text-yellow-500" />
                    Top Phim Doanh Thu
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-[10px] font-black text-zinc-600 uppercase tracking-widest border-b border-white/5">
                        <th className="pb-3 pr-4">Hạng</th>
                        <th className="pb-3">Phim</th>
                        <th className="pb-3 text-right px-4">Số vé</th>
                        <th className="pb-3 text-right">Doanh thu</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {(data?.topMovies || []).map((m, idx) => (
                        <tr key={idx} className="group hover:bg-white/[0.02] transition-colors">
                          <td className="py-4 pr-4">
                            <span className={`text-xs font-black ${idx === 0 ? 'text-red-500' : idx === 1 ? 'text-amber-500' : 'text-zinc-500'}`}>
                              #{idx + 1}
                            </span>
                          </td>
                          <td className="py-4 min-w-[150px]">
                            <div className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors truncate max-w-[200px]">
                              {m.title}
                            </div>
                          </td>
                          <td className="py-4 text-right px-4 text-xs font-bold text-zinc-400">{formatNumber(m.tickets)}</td>
                          <td className="py-4 text-right text-sm font-black text-white">{formatCurrency(m.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Period Stats Sub-section */}
              <div className="space-y-6">
                <h3 className="text-sm font-black text-zinc-300 uppercase tracking-widest flex items-center gap-2">
                  <DollarSign size={16} className="text-emerald-500" />
                  Doanh thu định kỳ
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-[10px] font-black text-zinc-600 uppercase mb-3">Năm {selectedYear} (Quý)</h4>
                    <div className="space-y-2">
                      {revenueByQuarter.map((q) => (
                        <div key={q.quarter} className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/50 border border-white/5 group hover:border-red-500/30 transition-all">
                          <span className="text-[10px] font-bold text-zinc-500">Quý {q.quarter}</span>
                          <span className="text-xs font-black text-white">{formatCurrency(q.revenue)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-black text-zinc-600 uppercase mb-3">Lịch sử các năm</h4>
                    <div className="space-y-2 max-h-[190px] overflow-y-auto custom-scrollbar pr-2">
                      {revenueByYear.map((y) => (
                        <div key={y.year} className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/50 border border-white/5 group hover:border-emerald-500/30 transition-all">
                          <span className="text-[10px] font-bold text-zinc-500">{y.year}</span>
                          <span className="text-xs font-black text-white">{formatCurrency(y.revenue)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="cinema-surface p-5">
            <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-4">
              <Activity size={16} className="text-amber-500" />
              Chỉ số tích lũy
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
                    <Ticket size={18} />
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500 font-bold">TỔNG VÉ</div>
                    <div className="text-lg font-black text-white">{formatNumber(data?.tickets)}</div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                    <Film size={18} />
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500 font-bold">TỔNG PHIM</div>
                    <div className="text-lg font-black text-white">{formatNumber(data?.movies)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="cinema-surface p-5">
            <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-4">
              <History size={16} className="text-emerald-500" />
              Giao dịch gần đây
            </h2>
            <div className="space-y-3">
              {(data?.recent || []).map((order, idx) => (
                <div key={idx} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-zinc-400 group-hover:bg-red-600 group-hover:text-white transition-colors">
                      {order.user?.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-zinc-200 truncate">{order.user}</div>
                      <div className="text-[10px] text-zinc-500 truncate">{order.movie}</div>
                    </div>
                  </div>
                  <div className="text-xs font-black text-zinc-100 whitespace-nowrap">
                    {formatCurrency(order.total_price)}
                  </div>
                </div>
              ))}
              {!data?.recent?.length && <p className="text-xs text-zinc-500 italic">Chưa có giao dịch mới</p>}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
