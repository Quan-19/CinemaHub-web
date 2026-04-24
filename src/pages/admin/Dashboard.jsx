import {
  AreaChart,
  Area,
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
} from "lucide-react";

import { useMemo, useState, useEffect } from "react";

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

const StatCard = ({ icon: Icon, accentClassName, value, title, subtitle }) => (
  <div className="cinema-surface p-4 sm:p-5">
    <div className="flex items-start justify-between gap-4">
      <div
        className={[
          "inline-flex h-10 w-10 items-center justify-center rounded-2xl",
          accentClassName,
        ].join(" ")}
      >
        <Icon className="h-5 w-5" />
      </div>
      {subtitle ? (
        <div className="text-right text-xs font-medium text-zinc-400">
          {subtitle}
        </div>
      ) : null}
    </div>

    <div className="mt-4">
      <div className="text-3xl font-bold tracking-tight">{value}</div>
      <div className="mt-1 text-sm text-zinc-400">{title}</div>
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
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [revenueView, setRevenueView] = useState("month");
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth() + 1);
  const [selectedQuarter, setSelectedQuarter] = useState(
    () => Math.floor(new Date().getMonth() / 3) + 1
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
      revenueByMonthRaw.map((r) => [Number(r.month), Number(r.revenue || 0)])
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
      revenueByDayRaw.map((r) => [Number(r.day), Number(r.revenue || 0)])
    );
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();

    return Array.from({ length: daysInMonth }, (_, i) => {
      const dayNumber = i + 1;
      return {
        period: `D${dayNumber}`,
        revenue: dayToRevenue.get(dayNumber) || 0,
      };
    });
  }, [revenueByDayRaw, selectedMonth, selectedYear]);

  const revenueByQuarterMonthsData = useMemo(() => {
    const quarterNumber = Number(selectedQuarter);
    const startMonth = (quarterNumber - 1) * 3 + 1;
    const months = [startMonth, startMonth + 1, startMonth + 2].filter(
      (m) => m >= 1 && m <= 12
    );

    const monthToRevenue = new Map(
      revenueByMonthRaw.map((r) => [Number(r.month), Number(r.revenue || 0)])
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
      revenueByQuarterRaw.map((r) => [
        Number(r.quarter),
        Number(r.revenue || 0),
      ])
    );
    return [1, 2, 3, 4].map((q) => ({
      quarter: q,
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
      (a, b) => b - a
    );
  }, [data, selectedYear]);

  const latestRevenuePoint =
    revenueByMonthRaw.length ? revenueByMonthRaw[revenueByMonthRaw.length - 1] : null;

  const latestMonthLabel = latestRevenuePoint?.month
    ? `Tháng ${latestRevenuePoint.month}`
    : null;

  // 🔥 CALL API
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");
        const token =
          sessionStorage.getItem("token") || localStorage.getItem("token");

        const params = new URLSearchParams({
          year: String(selectedYear),
          month: String(selectedMonth),
        });
        const res = await fetch(`http://localhost:5000/api/dashboard?${params}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(
            result?.message || result?.error || `Lỗi từ hệ thống: ${res.status}`
          );
        }
        setData(result);
      } catch (err) {
        console.error(err);
        setError(err?.message || "Không tải được dashboard");
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
        <h1 className="text-2xl font-bold sm:text-3xl">Dashboard</h1>
        <p className="text-sm text-zinc-400">Cập nhật theo ngày: {todayLabel}</p>
      </div>

      <section>
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-base font-semibold">Hôm nay</h2>
          <span className="text-xs text-zinc-400">Chỉ số phát sinh trong ngày</span>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            icon={DollarSign}
            accentClassName="bg-cinema-primary/15 text-cinema-primary"
            value={formatCurrency(data?.todayRevenue)}
            title="Doanh thu"
            subtitle={todayLabel}
          />
          <StatCard
            icon={Ticket}
            accentClassName="bg-amber-500/15 text-amber-300"
            value={formatNumber(data?.todayTickets)}
            title="Vé đã bán"
            subtitle={todayLabel}
          />
          <StatCard
            icon={Clapperboard}
            accentClassName="bg-emerald-500/15 text-emerald-400"
            value={formatNumber(data?.showtimes)}
            title="Suất chiếu"
            subtitle={todayLabel}
          />
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-base font-semibold">Tổng quan</h2>
          <span className="text-xs text-zinc-400">Tích lũy (không giới hạn thời gian)</span>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            icon={Ticket}
            accentClassName="bg-cinema-primary/10 text-cinema-primary"
            value={formatNumber(data?.tickets)}
            title="Tổng vé đã bán"
          />
          <StatCard
            icon={Users}
            accentClassName="bg-violet-500/15 text-violet-300"
            value={formatNumber(data?.users)}
            title="Tổng người dùng"
          />
          <StatCard
            icon={Film}
            accentClassName="bg-sky-500/15 text-sky-300"
            value={formatNumber(data?.movies)}
            title="Tổng phim"
          />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="cinema-surface p-4 sm:p-5 lg:col-span-2">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <h2 className="text-base font-semibold">Doanh thu</h2>
            <div className="flex flex-wrap items-center gap-3">
              <label
                className="text-xs font-semibold text-zinc-400"
                htmlFor="admin-dashboard-revenue-view"
              >
                Xem
              </label>
              <select
                id="admin-dashboard-revenue-view"
                className="rounded-xl border border-white/10 bg-zinc-950/40 px-3 py-2 text-xs font-semibold text-zinc-100 outline-none"
                value={revenueView}
                onChange={(e) => setRevenueView(e.target.value)}
              >
                <option value="month">Theo tháng</option>
                <option value="day">Theo ngày</option>
                <option value="quarter">Theo quý</option>
              </select>

              <label
                className="text-xs font-semibold text-zinc-400"
                htmlFor="admin-dashboard-year"
              >
                Năm
              </label>
              <select
                id="admin-dashboard-year"
                className="rounded-xl border border-white/10 bg-zinc-950/40 px-3 py-2 text-xs font-semibold text-zinc-100 outline-none"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>

              {revenueView === "day" ? (
                <>
                  <label
                    className="text-xs font-semibold text-zinc-400"
                    htmlFor="admin-dashboard-month"
                  >
                    Tháng
                  </label>
                  <select
                    id="admin-dashboard-month"
                    className="rounded-xl border border-white/10 bg-zinc-950/40 px-3 py-2 text-xs font-semibold text-zinc-100 outline-none"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m}>
                        Tháng {m}
                      </option>
                    ))}
                  </select>
                </>
              ) : null}

              {revenueView === "quarter" ? (
                <>
                  <label
                    className="text-xs font-semibold text-zinc-400"
                    htmlFor="admin-dashboard-quarter"
                  >
                    Quý
                  </label>
                  <select
                    id="admin-dashboard-quarter"
                    className="rounded-xl border border-white/10 bg-zinc-950/40 px-3 py-2 text-xs font-semibold text-zinc-100 outline-none"
                    value={selectedQuarter}
                    onChange={(e) => setSelectedQuarter(Number(e.target.value))}
                  >
                    {[1, 2, 3, 4].map((q) => (
                      <option key={q} value={q}>
                        Quý {q} ({getQuarterMonthRange(q)})
                      </option>
                    ))}
                  </select>
                </>
              ) : null}
            </div>
          </div>

          <div className="mt-4">
            {chartData.length ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart
                  data={chartData}
                  margin={{ top: 8, right: 28, left: 0, bottom: 8 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.06)"
                  />
                  <XAxis
                    dataKey="period"
                    stroke="rgba(255,255,255,0.45)"
                    interval={revenueView === "day" ? "preserveStartEnd" : 0}
                    tick={{ fontSize: 11 }}
                    tickMargin={8}
                    padding={{ left: 8, right: 16 }}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.45)"
                    width={110}
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => `${formatNumber(v)}\u00A0₫`}
                  />
                  <Tooltip content={<RevenueTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-cinema-primary)"
                    fill="var(--color-cinema-primary)"
                    fillOpacity={0.14}
                    dot={{ r: 3 }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-sm text-zinc-400">Chưa có dữ liệu doanh thu.</div>
            )}
          </div>

          {revenueView === "month" && latestMonthLabel ? (
            <div className="mt-3 text-sm text-zinc-400">
              Tháng gần nhất: <span className="font-semibold text-zinc-100">{latestMonthLabel}</span> —{" "}
              <span className="font-semibold text-zinc-100">
                {formatCurrency(latestRevenuePoint?.revenue)}
              </span>
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="cinema-surface p-4 sm:p-5">
            <h2 className="text-base font-semibold">Xếp hạng doanh thu phim</h2>
            <p className="mt-1 text-xs text-zinc-400">Theo số vé (tích lũy)</p>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-semibold text-zinc-400">
                    <th className="pb-2">Phim</th>
                    <th className="pb-2 text-right">Vé</th>
                    <th className="pb-2 text-right">Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.topMovies || []).map((m) => (
                    <tr key={m.title} className="border-t border-white/5">
                      <td className="py-2 pr-2">
                        <div className="max-w-[220px] truncate font-medium text-zinc-100">
                          {m.title}
                        </div>
                      </td>
                      <td className="py-2 text-right text-zinc-200">
                        {formatNumber(m.tickets)}
                      </td>
                      <td className="py-2 text-right text-zinc-200">
                        {formatCurrency(m.revenue)}
                      </td>
                    </tr>
                  ))}

                  {!data?.topMovies?.length ? (
                    <tr>
                      <td colSpan={3} className="py-3 text-sm text-zinc-400">
                        Chưa có dữ liệu.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>

          <div className="cinema-surface p-4 sm:p-5">
            <h2 className="text-base font-semibold">Doanh thu theo kỳ</h2>
            <p className="mt-1 text-xs text-zinc-400">Rõ theo tháng / quý / năm</p>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <div className="text-xs font-semibold text-zinc-400">Theo quý (Năm {selectedYear})</div>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs font-semibold text-zinc-400">
                        <th className="pb-2">Quý</th>
                        <th className="pb-2 text-right">Doanh thu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {revenueByQuarter.map((q) => (
                        <tr key={q.quarter} className="border-t border-white/5">
                          <td className="py-2 font-medium text-zinc-100">
                            Quý {q.quarter} ({getQuarterMonthRange(q.quarter)})
                          </td>
                          <td className="py-2 text-right font-semibold text-zinc-100">
                            {formatCurrency(q.revenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-zinc-400">Theo năm</div>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs font-semibold text-zinc-400">
                        <th className="pb-2">Năm</th>
                        <th className="pb-2 text-right">Doanh thu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {revenueByYear.map((y) => (
                        <tr key={y.year} className="border-t border-white/5">
                          <td className="py-2 font-medium text-zinc-100">{y.year}</td>
                          <td className="py-2 text-right font-semibold text-zinc-100">
                            {formatCurrency(y.revenue)}
                          </td>
                        </tr>
                      ))}

                      {!revenueByYear.length ? (
                        <tr>
                          <td colSpan={2} className="py-3 text-sm text-zinc-400">
                            Chưa có dữ liệu.
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
