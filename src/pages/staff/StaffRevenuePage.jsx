import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { getAuth } from "firebase/auth";

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

function StaffRevenuePage() {
  const { subtitle } = useOutletContext();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [reportType, setReportType] = useState("month");
  const [year, setYear] = useState(getCurrentYear());
  const [month, setMonth] = useState(getCurrentMonth());
  const [quarter, setQuarter] = useState(1);

  const [data, setData] = useState(null);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("type", reportType);
    params.set("year", String(year));

    if (reportType === "day" || reportType === "month") {
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

  const summary = data?.summary || {};
  const revenueByPeriod = Array.isArray(data?.revenueByPeriod)
    ? data.revenueByPeriod
    : [];
  const revenueByMovie = Array.isArray(data?.revenueByMovie)
    ? data.revenueByMovie
    : [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Doanh thu rạp</h1>
        <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>
      </div>

      <section className="cinema-surface p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm font-semibold">Bộ lọc</div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="rounded-xl border border-zinc-700 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-100 focus:outline-none"
            >
              <option value="day">Theo ngày</option>
              <option value="month">Theo tháng</option>
              <option value="quarter">Theo quý</option>
              <option value="year">Theo năm</option>
            </select>

            <input
              type="number"
              min={2000}
              max={2100}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-28 rounded-xl border border-zinc-700 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-100 focus:outline-none"
              placeholder="Năm"
            />

            {(reportType === "day" || reportType === "month") && (
              <input
                type="number"
                min={1}
                max={12}
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="w-20 rounded-xl border border-zinc-700 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-100 focus:outline-none"
                placeholder="Tháng"
              />
            )}

            {reportType === "quarter" && (
              <select
                value={quarter}
                onChange={(e) => setQuarter(Number(e.target.value))}
                className="rounded-xl border border-zinc-700 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-100 focus:outline-none"
              >
                <option value={1}>Quý 1</option>
                <option value={2}>Quý 2</option>
                <option value={3}>Quý 3</option>
                <option value={4}>Quý 4</option>
              </select>
            )}
          </div>
        </div>

        {loading ? (
          <div className="mt-4 text-sm text-zinc-400">Đang tải dữ liệu...</div>
        ) : error ? (
          <div className="mt-4 text-sm font-semibold text-red-400">{error}</div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-zinc-700 bg-zinc-950/20 p-4">
              <div className="text-xs text-zinc-400">Tổng doanh thu</div>
              <div className="mt-1 text-lg font-bold">
                {formatCurrency(summary.totalRevenue)}
              </div>
            </div>
            <div className="rounded-2xl border border-zinc-700 bg-zinc-950/20 p-4">
              <div className="text-xs text-zinc-400">Tổng vé</div>
              <div className="mt-1 text-lg font-bold">
                {summary.totalTickets || 0}
              </div>
            </div>
            <div className="rounded-2xl border border-zinc-700 bg-zinc-950/20 p-4">
              <div className="text-xs text-zinc-400">Tổng booking</div>
              <div className="mt-1 text-lg font-bold">
                {summary.totalBookings || 0}
              </div>
            </div>
            <div className="rounded-2xl border border-zinc-700 bg-zinc-950/20 p-4">
              <div className="text-xs text-zinc-400">Tăng trưởng</div>
              <div className="mt-1 text-lg font-bold">
                {Number(summary.growthRate || 0).toFixed(1)}%
              </div>
            </div>
          </div>
        )}
      </section>

      {!loading && !error ? (
        <section className="cinema-surface p-4 sm:p-5">
          <h2 className="text-base font-semibold">Doanh thu theo kỳ</h2>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-700 text-left text-zinc-300">
                  <th className="py-2 pr-4">Kỳ</th>
                  <th className="py-2 pr-4">Doanh thu</th>
                  <th className="py-2 pr-4">Vé</th>
                  <th className="py-2 pr-4">Booking</th>
                </tr>
              </thead>
              <tbody>
                {revenueByPeriod.length === 0 ? (
                  <tr className="text-zinc-400">
                    <td className="py-3" colSpan={4}>
                      Không có dữ liệu.
                    </td>
                  </tr>
                ) : (
                  revenueByPeriod.map((row, idx) => (
                    <tr
                      key={`${row.period || "period"}-${idx}`}
                      className="border-b border-zinc-800 text-zinc-200"
                    >
                      <td className="py-2 pr-4">{row.period}</td>
                      <td className="py-2 pr-4">{formatCurrency(row.revenue)}</td>
                      <td className="py-2 pr-4">{row.tickets || 0}</td>
                      <td className="py-2 pr-4">{row.bookings || 0}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <h2 className="mt-6 text-base font-semibold">Top phim theo doanh thu</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-700 text-left text-zinc-300">
                  <th className="py-2 pr-4">Phim</th>
                  <th className="py-2 pr-4">Doanh thu</th>
                  <th className="py-2 pr-4">Vé</th>
                  <th className="py-2 pr-4">Tỷ lệ</th>
                </tr>
              </thead>
              <tbody>
                {revenueByMovie.length === 0 ? (
                  <tr className="text-zinc-400">
                    <td className="py-3" colSpan={4}>
                      Không có dữ liệu.
                    </td>
                  </tr>
                ) : (
                  revenueByMovie.map((row, idx) => (
                    <tr
                      key={`${row.movie_id || row.movie_title || "movie"}-${idx}`}
                      className="border-b border-zinc-800 text-zinc-200"
                    >
                      <td className="py-2 pr-4">{row.movie_title}</td>
                      <td className="py-2 pr-4">{formatCurrency(row.revenue)}</td>
                      <td className="py-2 pr-4">{row.tickets || 0}</td>
                      <td className="py-2 pr-4">
                        {Number(row.percentage || 0).toFixed(1)}%
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default StaffRevenuePage;
