import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";


import {
  DollarSign,
  Ticket,
  Users,
  Film,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

import { useState } from "react";


/* ===================== DATA ===================== */

const now = new Date();
const currentYear = now.getFullYear();
const revenueData = Array.from({ length: 12 }, (_, i) => {
  const month = `${i + 1}/${currentYear}`;
  // Số liệu giả lập, bạn có thể thay bằng dữ liệu thật
  const revenue = 200 + Math.floor(Math.random() * 150);
  return { month, revenue };
});

const genreData = [
  { name: "Hành động", value: 35, color: "#ef4444" },
  { name: "Tình cảm", value: 22, color: "#f59e0b" },
  { name: "Kinh dị", value: 18, color: "#8b5cf6" },
  { name: "Hoạt hình", value: 15, color: "#06b6d4" },
  { name: "Khác", value: 10, color: "#6b7280" }
];

const recentBookings = [
  { user: "Nguyễn Văn A", movie: "Biệt Đội Chiến Thần", price: "220K", status: "success" },
  { user: "Trần Thị B", movie: "Hành Trình Vũ Trụ", price: "330K", status: "success" },
  { user: "Lê Minh C", movie: "Bóng Đêm Vĩnh Cửu", price: "110K", status: "pending" },
  { user: "Phạm Thu D", movie: "Mùa Hè Rực Rỡ", price: "400K", status: "success" }
];

const topMovies = [
  { rank: 1, title: "Hành Trình Vũ Trụ", tickets: 3842, revenue: "423M", change: 12 },
  { rank: 2, title: "Biệt Đội Chiến Thần", tickets: 3156, revenue: "347M", change: 8 },
  { rank: 3, title: "Rồng Bay Lên", tickets: 2941, revenue: "264M", change: -3 },
  { rank: 4, title: "Chuyến Đi Cuối Cùng", tickets: 2187, revenue: "196M", change: 15 }
];


/* ===================== STAT CARD ===================== */

const StatCard = ({ icon, label, value, change, color }) => (

  <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-5 flex flex-col gap-4">

    <div className="flex justify-between">

      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ background: `${color}20` }}
      >
        <span style={{ color }}>{icon}</span>
      </div>

      <span
        className={`text-xs flex items-center gap-1 ${
          change >= 0 ? "text-green-400" : "text-red-400"
        }`}
      >
        {change >= 0 ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>}
        {Math.abs(change)}%
      </span>

    </div>

    <div>

      <h2 className="text-2xl font-bold text-white">
        {value}
      </h2>

      <p className="text-gray-400 text-sm">
        {label}
      </p>

    </div>

  </div>

);
/* ===================== DASHBOARD ===================== */

export default function Dashboard() {
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedRevenue, setSelectedRevenue] = useState(null);

  const handleMonthClick = (data) => {
    setSelectedMonth(data.month);
    setSelectedRevenue(data.revenue);
  };

  return (
    <div className="p-6 space-y-6 text-white">


      {/* HEADER */}

      <div>

        <h1 className="text-2xl font-bold">
          Dashboard Admin
        </h1>

        <p className="text-gray-400 text-sm">
          {/* Tổng quan hệ thống CinemaHub — Cập nhật 06/03/2026 */}
        </p>

      </div>



      {/* STAT CARDS */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        <StatCard
          label="Doanh thu tháng này"
          value={Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(312000000)}
          change={15}
          icon={<DollarSign size={20}/>}
          color="#ef4444"
        />

        <StatCard
          label="Vé đã bán"
          value="3,600"
          change={8}
          icon={<Ticket size={20}/>}
          color="#f59e0b"
        />

        <StatCard
          label="Người dùng"
          value="24,815"
          change={5}
          icon={<Users size={20}/>}
          color="#8b5cf6"
        />

        <StatCard
          label="Phim đang chiếu"
          value="6"
          change={-10}
          icon={<Film size={20}/>}
          color="#06b6d4"
        />

      </div>

      {/* CHARTS */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* REVENUE CHART */}

        <div className="lg:col-span-2 bg-[#0d0d1a] border border-white/10 rounded-xl p-5">

          <h3 className="font-semibold mb-4">
            Doanh thu theo tháng
          </h3>

          <ResponsiveContainer width="100%" height={250}>

            <AreaChart data={revenueData}>

              <defs>

                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>

              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>

              <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)"/>
              <YAxis stroke="rgba(255,255,255,0.4)"/>

              <Tooltip
                contentStyle={{
                  background:"#1a1a2e",
                  border:"1px solid rgba(255,255,255,0.1)",
                  borderRadius:8
                }}
              />

              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#ef4444"
                fill="url(#colorRevenue)"
                strokeWidth={2}
                activeDot={{ onClick: (e, payload) => handleMonthClick(payload.payload), r: 8, style: { cursor: 'pointer' } }}
              />

            </AreaChart>

          </ResponsiveContainer>
        {selectedMonth && (
          <div className="mt-4 p-6 bg-zinc-900 rounded-2xl border border-zinc-700 shadow-lg max-w-lg">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign size={28} className="text-cinema-primary" />
              <div className="text-lg font-bold">Chi tiết doanh thu tháng {selectedMonth}</div>
            </div>
            <div className="text-2xl text-cinema-primary font-bold mb-2">
              {Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedRevenue * 1000000)}
            </div>
            <div className="mb-4 text-sm text-gray-400">So sánh với tháng trước:</div>
            <table className="w-full text-sm mb-4">
              <thead>
                <tr className="text-gray-400">
                  <th className="text-left">Chỉ số</th>
                  <th className="text-right">Giá trị</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Doanh thu</td>
                  <td className="text-right text-cinema-primary font-semibold">
                    {Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedRevenue * 1000000)}
                  </td>
                </tr>
                <tr>
                  <td>Tháng trước</td>
                  <td className="text-right">
                    {(() => {
                      const idx = revenueData.findIndex(r => r.month === selectedMonth);
                      if (idx > 0) {
                        return Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(revenueData[idx-1].revenue * 1000000);
                      }
                      return "-";
                    })()}
                  </td>
                </tr>
                <tr>
                  <td>Tăng/giảm</td>
                  <td className="text-right">
                    {(() => {
                      const idx = revenueData.findIndex(r => r.month === selectedMonth);
                      if (idx > 0) {
                        const diff = selectedRevenue - revenueData[idx-1].revenue;
                        const percent = ((diff / revenueData[idx-1].revenue) * 100).toFixed(1);
                        return `${diff > 0 ? '+' : ''}${Intl.NumberFormat('vi-VN').format(diff * 1000000)} VNĐ (${percent}%)`;
                      }
                      return "-";
                    })()}
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="mb-4 text-xs text-gray-400">
              <span>Thống kê chi tiết doanh thu theo tháng giúp bạn đánh giá hiệu quả kinh doanh, phát hiện xu hướng tăng trưởng và lập kế hoạch tối ưu.</span>
            </div>
            <button
              className="mt-2 px-4 py-2 rounded bg-cinema-primary text-white hover:opacity-90 font-semibold"
              onClick={() => setSelectedMonth(null)}
            >Đóng</button>
          </div>
        )}

        </div>



        {/* PIE CHART */}

        <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-5">

          <h3 className="font-semibold mb-4">
            Thể loại phổ biến
          </h3>

          <ResponsiveContainer width="100%" height={180}>

            <PieChart>

              <Pie
                data={genreData}
                dataKey="value"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
              >

                {genreData.map((g,i)=>(
                  <Cell key={i} fill={g.color}/>
                ))}

              </Pie>

            </PieChart>

          </ResponsiveContainer>

          <div className="space-y-1 mt-3 text-sm">

            {genreData.map(g=>(
              <div key={g.name} className="flex justify-between">

                <span className="flex items-center gap-2">

                  <div
                    className="w-2 h-2 rounded-full"
                    style={{background:g.color}}
                  />

                  {g.name}

                </span>

                <span>{g.value}%</span>

              </div>
            ))}

          </div>

        </div>

      </div>



      {/* BOTTOM */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">


        {/* RECENT BOOKINGS */}

        <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-5">

          <h3 className="font-semibold mb-4">
            Đặt vé gần đây
          </h3>

          <div className="space-y-3">

            {recentBookings.map((b,i)=>(
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 font-bold">
                  {b.user.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="font-semibold">
                      {b.user}
                    </span>
                    <span className={`text-xs ${
                      b.status==="success"
                        ? "text-green-400"
                        : "text-yellow-400"
                    }`}>
                      {b.status==="success" ? "Thành công":"Chờ xử lý"}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{b.movie}</span>
                    <span className="text-yellow-400 font-semibold">
                      {Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseInt(b.price.replace(/[^0-9]/g, ""))*1000)}
                    </span>
                  </div>
                </div>
              </div>
            ))}

          </div>

        </div>



        {/* TOP MOVIES */}

        <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-5">

          <h3 className="font-semibold mb-4">
            Phim bán chạy nhất
          </h3>

          <div className="space-y-3">

            {topMovies.map(m=>(
              <div key={m.rank} className="flex items-center gap-3">
                <div className="w-7 h-7 bg-red-500 rounded-lg flex items-center justify-center text-xs font-bold">
                  {m.rank}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="font-semibold">
                      {m.title}
                    </span>
                    <span className={`text-xs flex items-center gap-1 ${
                      m.change>=0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}>
                      {m.change>=0
                        ? <TrendingUp size={12}/>
                        : <ArrowDownRight size={12}/>
                      }
                      {Math.abs(m.change)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>
                      {m.tickets.toLocaleString()} vé
                    </span>
                    <span className="text-yellow-400 font-semibold">
                      {Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseInt(m.revenue.replace(/[^0-9]/g, ""))*1000000)}
                    </span>
                  </div>
                </div>
              </div>
            ))}

          </div>

        </div>

      </div>

    </div>

  );
}