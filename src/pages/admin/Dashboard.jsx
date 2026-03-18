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

import { useState, useEffect } from "react";

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
      <h2 className="text-2xl font-bold text-white">{value}</h2>
      <p className="text-gray-400 text-sm">{label}</p>
    </div>
  </div>
);

/* ===================== DASHBOARD ===================== */

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedRevenue, setSelectedRevenue] = useState(null);

  // 🔥 CALL API
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:5000/api/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const result = await res.json();
        console.log("DASHBOARD:", result);

        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <div className="p-6 text-white">Loading...</div>;

  /* ===================== MAP DATA ===================== */

  const revenueData = data?.revenue?.map(r => ({
    month: `Tháng ${r.month}`,
    revenue: Number(r.revenue)
  })) || [];

  const handleMonthClick = (payload) => {
    setSelectedMonth(payload.month);
    setSelectedRevenue(payload.revenue);
  };

  return (
    <div className="p-6 space-y-6 text-white">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard Admin</h1>
      </div>

      {/* STAT */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        <StatCard
          label="Doanh thu tháng"
          value={Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
            .format(data?.revenue?.slice(-1)[0]?.revenue || 0)}
          change={10}
          icon={<DollarSign size={20}/>}
          color="#ef4444"
        />

        <StatCard
          label="Vé đã bán"
          value={data?.tickets || 0}
          change={8}
          icon={<Ticket size={20}/>}
          color="#f59e0b"
        />

        <StatCard
          label="Người dùng"
          value={data?.users || 0}
          change={5}
          icon={<Users size={20}/>}
          color="#8b5cf6"
        />

        <StatCard
          label="Phim"
          value={data?.movies || 0}
          change={-2}
          icon={<Film size={20}/>}
          color="#06b6d4"
        />
      </div>

      {/* CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        <div className="lg:col-span-2 bg-[#0d0d1a] border border-white/10 rounded-xl p-5">
          <h3 className="font-semibold mb-4">Doanh thu theo tháng</h3>

          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)"/>
              <YAxis stroke="rgba(255,255,255,0.4)"/>

              <Tooltip />

              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#ef4444"
                fillOpacity={0.2}
                activeDot={{
                  onClick: (e, payload) => handleMonthClick(payload.payload),
                  r: 8,
                  style: { cursor: "pointer" }
                }}
              />
            </AreaChart>
          </ResponsiveContainer>

          {selectedMonth && (
            <div className="mt-4">
              <h3 className="font-bold">
                {selectedMonth}:
                {Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
                  .format(selectedRevenue)}
              </h3>
            </div>
          )}
        </div>

        {/* PIE (fake giữ lại nếu chưa có API) */}
        <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-5">
          <h3 className="font-semibold mb-4">Thể loại</h3>

          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={[
                  { name: "Action", value: 40 },
                  { name: "Drama", value: 30 },
                  { name: "Horror", value: 30 }
                ]}
                dataKey="value"
                innerRadius={40}
                outerRadius={70}
              >
                <Cell fill="#ef4444"/>
                <Cell fill="#f59e0b"/>
                <Cell fill="#8b5cf6"/>
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* RECENT */}
      <div className="bg-[#0d0d1a] p-5 rounded-xl">
        <h3 className="mb-4">Đặt vé gần đây</h3>

        {data?.recent?.map((b, i) => (
          <div key={i} className="flex justify-between text-sm py-1">
            <span>{b.user} - {b.movie}</span>
            <span>
              {Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(b.total_price)}
            </span>
          </div>
        ))}
      </div>

      {/* TOP MOVIES */}
      <div className="bg-[#0d0d1a] p-5 rounded-xl">
        <h3 className="mb-4">Top phim</h3>

        {data?.topMovies?.map((m, i) => (
          <div key={i} className="flex justify-between text-sm py-1">
            <span>{m.title}</span>
            <span>{m.tickets} vé</span>
          </div>
        ))}
      </div>

    </div>
  );
}