// src/pages/RevenueReport.jsx
import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  DollarSign,
  Building,
  Calendar,
  TrendingUp,
  Download,
  Filter,
  ChevronDown,
  RefreshCw,
  Ticket,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Printer,
  Clapperboard,
} from "lucide-react";

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
  
  // Colors for pie chart
  const COLORS = ['#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4', '#10b981', '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#84cc16'];

  // Fetch danh sách rạp khi component mount
  useEffect(() => {
    fetchCinemas();
  }, []);

  // Fetch data when filters change
  useEffect(() => {
    fetchRevenueData();
  }, [reportType, selectedYear, selectedMonth, selectedQuarter, selectedCinema]);

  // Lấy danh sách rạp từ API
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
      
      // Build query params
      const params = new URLSearchParams({
        type: reportType,
        year: selectedYear,
      });
      
      if (selectedMonth && (reportType === "day" || reportType === "month")) {
        params.append("month", selectedMonth);
      }
      
      if (selectedQuarter && reportType === "quarter") {
        params.append("quarter", selectedQuarter);
      }
      
      if (selectedCinema && selectedCinema !== "all") {
        params.append("cinema_id", selectedCinema);
      }

      const response = await fetch(`http://localhost:5000/api/reports/revenue/details?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

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

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value || 0);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat("vi-VN").format(value || 0);
  };

  const getDateRangeLabel = () => {
    switch(reportType) {
      case "day":
        return `Ngày ${selectedMonth}/${selectedYear}`;
      case "month":
        return `Tháng ${selectedMonth}/${selectedYear}`;
      case "quarter":
        return `Quý ${selectedQuarter}/${selectedYear}`;
      case "year":
        return `Năm ${selectedYear}`;
      default:
        return "";
    }
  };

  const handleExportExcel = async () => {
    try {
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      const params = new URLSearchParams({
        type: reportType,
        year: selectedYear,
      });
      
      if (selectedMonth && (reportType === "day" || reportType === "month")) {
        params.append("month", selectedMonth);
      }
      
      if (selectedQuarter && reportType === "quarter") {
        params.append("quarter", selectedQuarter);
      }
      
      if (selectedCinema && selectedCinema !== "all") {
        params.append("cinema_id", selectedCinema);
      }
      
      window.open(`http://localhost:5000/api/reports/revenue/export?${params}`, "_blank");
    } catch (err) {
      console.error("Export error:", err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-white">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4" size={40} />
          <p>Đang tải dữ liệu doanh thu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Báo cáo doanh thu chi tiết</h1>
          <p className="text-gray-400 text-sm mt-1">
            Thống kê doanh thu theo rạp, phim và khoảng thời gian
          </p>
        </div>

        <div className="flex gap-3 print:hidden">
          <button
            onClick={handleExportExcel}
            className="bg-green-600 hover:bg-green-700 rounded-lg px-4 py-2 text-sm flex items-center gap-2 transition"
          >
            <Download size={16} />
            Xuất Excel
          </button>
          <button
            onClick={handlePrint}
            className="bg-cinema-surface border border-white/10 rounded-lg px-4 py-2 text-sm flex items-center gap-2 hover:bg-white/5 transition"
          >
            <Printer size={16} />
            In báo cáo
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-cinema-surface border border-white/10 rounded-xl p-4 print:hidden">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
            <Calendar size={16} className="text-gray-400" />
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="bg-transparent text-white text-sm outline-none cursor-pointer"
            >
              <option value="day">Theo ngày</option>
              <option value="month">Theo tháng</option>
              <option value="quarter">Theo quý</option>
              <option value="year">Theo năm</option>
            </select>
            <ChevronDown size={14} className="text-gray-400" />
          </div>

          {reportType !== "year" && (
            <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
              <Filter size={16} className="text-gray-400" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="bg-transparent text-white text-sm outline-none cursor-pointer"
              >
                <option value={2023}>Năm 2023</option>
                <option value={2024}>Năm 2024</option>
                <option value={2025}>Năm 2025</option>
                <option value={2026}>Năm 2026</option>
              </select>
              <ChevronDown size={14} className="text-gray-400" />
            </div>
          )}

          {(reportType === "day" || reportType === "month") && (
            <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
              <Filter size={16} className="text-gray-400" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="bg-transparent text-white text-sm outline-none cursor-pointer"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <option key={month} value={month}>Tháng {month}</option>
                ))}
              </select>
              <ChevronDown size={14} className="text-gray-400" />
            </div>
          )}

          {reportType === "quarter" && (
            <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
              <Filter size={16} className="text-gray-400" />
              <select
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(parseInt(e.target.value))}
                className="bg-transparent text-white text-sm outline-none cursor-pointer"
              >
                <option value={1}>Quý 1 (Tháng 1-3)</option>
                <option value={2}>Quý 2 (Tháng 4-6)</option>
                <option value={3}>Quý 3 (Tháng 7-9)</option>
                <option value={4}>Quý 4 (Tháng 10-12)</option>
              </select>
              <ChevronDown size={14} className="text-gray-400" />
            </div>
          )}

          {cinemas.length > 0 && (
            <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
              <Building size={16} className="text-gray-400" />
              <select
                value={selectedCinema}
                onChange={(e) => setSelectedCinema(e.target.value)}
                className="bg-transparent text-white text-sm outline-none cursor-pointer"
              >
                <option value="all">Tất cả rạp</option>
                {cinemas.map((cinema) => (
                  <option key={cinema.cinema_id} value={cinema.cinema_id}>
                    {cinema.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="text-gray-400" />
            </div>
          )}

          <button
            onClick={fetchRevenueData}
            className="ml-auto bg-red-500 hover:bg-red-600 rounded-lg px-4 py-2 text-sm flex items-center gap-2 transition"
          >
            <Search size={16} />
            Xem báo cáo
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-cinema-surface border border-white/10 rounded-xl p-5">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <DollarSign size={20} className="text-red-400" />
            </div>
            <span className={`text-xs flex items-center gap-1 ${
              summary.growthRate >= 0 ? "text-green-400" : "text-red-400"
            }`}>
              {summary.growthRate >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {Math.abs(summary.growthRate).toFixed(1)}%
            </span>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-bold">{formatCurrency(summary.totalRevenue)}</h2>
            <p className="text-gray-400 text-sm mt-1">Tổng doanh thu • {getDateRangeLabel()}</p>
          </div>
        </div>

        <div className="bg-cinema-surface border border-white/10 rounded-xl p-5">
          <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
            <Ticket size={20} className="text-yellow-400" />
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-bold">{formatNumber(summary.totalTickets)}</h2>
            <p className="text-gray-400 text-sm mt-1">Tổng vé đã bán</p>
          </div>
        </div>

        <div className="bg-cinema-surface border border-white/10 rounded-xl p-5">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <TrendingUp size={20} className="text-purple-400" />
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-bold">{formatCurrency(summary.averageTicketPrice)}</h2>
            <p className="text-gray-400 text-sm mt-1">Giá vé trung bình</p>
          </div>
        </div>

        <div className="bg-cinema-surface border border-white/10 rounded-xl p-5">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
            <Users size={20} className="text-cyan-400" />
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-bold">{formatNumber(summary.totalBookings)}</h2>
            <p className="text-gray-400 text-sm mt-1">Tổng giao dịch</p>
          </div>
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <div className="bg-cinema-surface border border-white/10 rounded-xl p-5">
        <h3 className="font-semibold mb-4">
          Biểu đồ xu hướng doanh thu {reportType === "day" && "theo ngày"}
          {reportType === "month" && "theo tháng"}
          {reportType === "quarter" && "theo quý"}
          {reportType === "year" && "theo năm"}
        </h3>
        {revenueData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="period" stroke="rgba(255,255,255,0.4)" />
              <YAxis 
                stroke="rgba(255,255,255,0.4)" 
                tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)" }}
                formatter={(value, name) => {
                  if (name === "Doanh thu") return formatCurrency(value);
                  return formatNumber(value);
                }}
              />
              <Legend />
              <Area 
                type="monotone"
                dataKey="revenue" 
                name="Doanh thu" 
                stroke="#ef4444" 
                fill="url(#revenueGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-gray-400">
            Không có dữ liệu doanh thu trong khoảng thời gian này
          </div>
        )}
      </div>

      {/* Revenue by Cinema & Revenue by Movie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Doanh thu theo rạp */}
        <div className="bg-cinema-surface border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Building size={20} className="text-blue-400" />
            <h3 className="font-semibold">Doanh thu theo rạp</h3>
          </div>
          {cinemaRevenue.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cinemaRevenue} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                  <YAxis type="category" dataKey="cinema_name" width={100} />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                  <Bar dataKey="revenue" fill="#8b5cf6" radius={[0, 4, 4, 0]}>
                    {cinemaRevenue.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              
              {/* Bảng chi tiết doanh thu theo rạp */}
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Chi tiết từng rạp</h4>
                {cinemaRevenue.map((cinema, idx) => {
                  const percentage = summary.totalRevenue > 0 ? (cinema.revenue / summary.totalRevenue) * 100 : 0;
                  return (
                    <div key={idx} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{cinema.cinema_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-purple-500 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400">{percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-purple-400">{formatCurrency(cinema.revenue)}</p>
                        <p className="text-xs text-gray-400">{formatNumber(cinema.tickets)} vé</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <Building size={40} className="mx-auto mb-2 opacity-50" />
              <p>Chưa có dữ liệu doanh thu theo rạp</p>
            </div>
          )}
        </div>

        {/* Doanh thu theo phim */}
        <div className="bg-cinema-surface border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clapperboard size={20} className="text-green-400" />
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
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="revenue"
                    nameKey="movie_title"
                  >
                    {movieRevenue.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Bảng chi tiết doanh thu theo phim */}
              <div className="mt-4 space-y-2 max-h-[300px] overflow-y-auto">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Top phim doanh thu cao</h4>
                {movieRevenue.map((movie, idx) => {
                  const percentage = summary.totalRevenue > 0 ? (movie.revenue / summary.totalRevenue) * 100 : 0;
                  return (
                    <div key={idx} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{movie.movie_title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-green-500 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-400">{percentage.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-400 text-sm">{formatCurrency(movie.revenue)}</p>
                        <p className="text-xs text-gray-400">{formatNumber(movie.tickets)} vé</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <Clapperboard size={40} className="mx-auto mb-2 opacity-50" />
              <p>Chưa có dữ liệu doanh thu theo phim</p>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Data Table */}
      <div className="bg-cinema-surface border border-white/10 rounded-xl p-5 overflow-x-auto">
        <h3 className="font-semibold mb-4">Chi tiết doanh thu theo kỳ</h3>
        {revenueData.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">
                  {reportType === "day" && "Ngày"}
                  {reportType === "month" && "Tháng"}
                  {reportType === "quarter" && "Quý"}
                  {reportType === "year" && "Năm"}
                </th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Doanh thu</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Số vé</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Giá vé TB</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Tỉ lệ</th>
               </tr>
            </thead>
            <tbody>
              {revenueData.map((item, idx) => {
                const percentage = summary.totalRevenue > 0 ? (item.revenue / summary.totalRevenue) * 100 : 0;
                return (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="py-3 px-4 font-medium">{item.period}</td>
                    <td className="text-right py-3 px-4 text-red-400">
                      {formatCurrency(item.revenue)}
                    </td>
                    <td className="text-right py-3 px-4">{formatNumber(item.tickets)}</td>
                    <td className="text-right py-3 px-4 text-gray-300">
                      {item.tickets > 0 ? formatCurrency(item.revenue / item.tickets) : "0"}
                    </td>
                    <td className="text-right py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-red-500 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">{percentage.toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="border-t border-white/10">
              <tr>
                <td className="py-3 px-4 font-bold">Tổng cộng</td>
                <td className="text-right py-3 px-4 font-bold text-red-400">
                  {formatCurrency(summary.totalRevenue)}
                </td>
                <td className="text-right py-3 px-4 font-bold">
                  {formatNumber(summary.totalTickets)}
                </td>
                <td className="text-right py-3 px-4 font-bold text-gray-300">
                  {formatCurrency(summary.averageTicketPrice)}
                </td>
                <td className="text-right py-3 px-4">100%</td>
              </tr>
            </tfoot>
          </table>
        ) : (
          <div className="text-center py-12 text-gray-400">
            Không có dữ liệu chi tiết
          </div>
        )}
      </div>
    </div>
  );
}