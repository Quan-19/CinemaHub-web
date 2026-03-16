import {
  LineChart,
  Line,
  XAxis,
  YAxis,
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
  Film
} from "lucide-react";

const revenueData = [
  { month: "T1", revenue: 120 },
  { month: "T2", revenue: 140 },
  { month: "T3", revenue: 130 },
  { month: "T4", revenue: 180 },
  { month: "T5", revenue: 160 },
  { month: "T6", revenue: 200 },
  { month: "T7", revenue: 190 },
  { month: "T8", revenue: 220 },
  { month: "T9", revenue: 180 },
  { month: "T10", revenue: 240 },
  { month: "T11", revenue: 260 },
  { month: "T12", revenue: 320 }
];

const genreData = [
  { name: "Hành động", value: 35 },
  { name: "Tình cảm", value: 22 },
  { name: "Kinh dị", value: 18 },
  { name: "Hoạt hình", value: 15 },
  { name: "Khác", value: 10 }
];

const COLORS = [
  "#ef4444",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
  "#6b7280"
];

export default function Dashboard() {

  return (
    <div className="p-6 text-white">

      {/* HEADER */}

      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          Dashboard Admin
        </h1>

        <p className="text-gray-400 text-sm">
          Tổng quan hệ thống CineStar — Cập nhật 06/03/2026
        </p>
      </div>

      {/* STATS */}

      <div className="grid grid-cols-4 gap-6 mb-8">

        <div className="bg-[#0f172a] p-5 rounded-xl border border-gray-800">
          <div className="flex justify-between items-start">

            <div className="bg-red-500/10 p-2 rounded-lg">
              <DollarSign size={18} className="text-red-500"/>
            </div>

            <span className="text-green-400 text-sm">
              +15%
            </span>

          </div>

          <h2 className="text-3xl font-bold mt-4">
            312Mđ
          </h2>

          <p className="text-gray-400 text-sm">
            Doanh thu tháng này
          </p>
        </div>


        <div className="bg-[#0f172a] p-5 rounded-xl border border-gray-800">

          <div className="flex justify-between items-start">

            <div className="bg-yellow-500/10 p-2 rounded-lg">
              <Ticket size={18} className="text-yellow-500"/>
            </div>

            <span className="text-green-400 text-sm">
              +8%
            </span>

          </div>

          <h2 className="text-3xl font-bold mt-4">
            3,600
          </h2>

          <p className="text-gray-400 text-sm">
            Vé đã bán
          </p>

        </div>


        <div className="bg-[#0f172a] p-5 rounded-xl border border-gray-800">

          <div className="flex justify-between items-start">

            <div className="bg-purple-500/10 p-2 rounded-lg">
              <Users size={18} className="text-purple-500"/>
            </div>

            <span className="text-green-400 text-sm">
              +5%
            </span>

          </div>

          <h2 className="text-3xl font-bold mt-4">
            24,815
          </h2>

          <p className="text-gray-400 text-sm">
            Người dùng
          </p>

        </div>


        <div className="bg-[#0f172a] p-5 rounded-xl border border-gray-800">

          <div className="flex justify-between items-start">

            <div className="bg-cyan-500/10 p-2 rounded-lg">
              <Film size={18} className="text-cyan-500"/>
            </div>

            <span className="text-red-400 text-sm">
              -10%
            </span>

          </div>

          <h2 className="text-3xl font-bold mt-4">
            6
          </h2>

          <p className="text-gray-400 text-sm">
            Phim đang chiếu
          </p>

        </div>

      </div>

      {/* CHARTS */}

      <div className="grid grid-cols-3 gap-6 mb-8">

        {/* REVENUE */}

        <div className="col-span-2 bg-[#0f172a] p-6 rounded-xl border border-gray-800">

          <div className="flex justify-between mb-4">

            <h3 className="font-semibold">
              Doanh thu theo tháng
            </h3>

            <div className="flex gap-2 text-sm">
              <span className="bg-red-500 px-2 py-1 rounded">
                2025
              </span>
              <span className="bg-gray-700 px-2 py-1 rounded">
                2024
              </span>
            </div>

          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <XAxis dataKey="month" stroke="#aaa"/>
              <YAxis stroke="#aaa"/>
              <Tooltip/>

              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#ef4444"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>

        </div>

        {/* GENRE */}

        <div className="bg-[#0f172a] p-6 rounded-xl border border-gray-800">

          <h3 className="mb-4 font-semibold">
            Thể loại phổ biến
          </h3>

          <ResponsiveContainer width="100%" height={260}>

            <PieChart>

              <Pie
                data={genreData}
                dataKey="value"
                innerRadius={60}
                outerRadius={90}
              >
                {genreData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index]}
                  />
                ))}
              </Pie>

            </PieChart>

          </ResponsiveContainer>

          <div className="mt-4 text-sm space-y-1">

            {genreData.map((g, i) => (
              <div
                key={i}
                className="flex justify-between"
              >
                <span>{g.name}</span>
                <span>{g.value}%</span>
              </div>
            ))}

          </div>

        </div>

      </div>

      {/* BOTTOM */}

      <div className="grid grid-cols-2 gap-6">

        {/* RECENT BOOKINGS */}

        <div className="bg-[#0f172a] p-6 rounded-xl border border-gray-800">

          <div className="flex justify-between mb-4">

            <h3 className="font-semibold">
              Đặt vé gần đây
            </h3>

            <span className="text-red-500 text-sm">
              Xem tất cả
            </span>

          </div>

          <div className="space-y-3 text-sm">

            <div className="flex justify-between">
              <span>Nguyễn Văn A</span>
              <span className="text-green-400">
                220K
              </span>
            </div>

            <div className="flex justify-between">
              <span>Trần Thị B</span>
              <span className="text-green-400">
                330K
              </span>
            </div>

            <div className="flex justify-between">
              <span>Lê Minh C</span>
              <span className="text-yellow-400">
                110K
              </span>
            </div>

            <div className="flex justify-between">
              <span>Phạm Thu D</span>
              <span className="text-green-400">
                400K
              </span>
            </div>

          </div>

        </div>

        {/* TOP MOVIES */}

        <div className="bg-[#0f172a] p-6 rounded-xl border border-gray-800">

          <h3 className="font-semibold mb-4">
            Phim bán chạy nhất
          </h3>

          <ol className="space-y-3 text-sm">

            <li className="flex justify-between">
              <span>1. Hành Trình Vũ Trụ</span>
              <span>423Mđ</span>
            </li>

            <li className="flex justify-between">
              <span>2. Biệt Đội Chiến Thần</span>
              <span>347Mđ</span>
            </li>

            <li className="flex justify-between">
              <span>3. Rồng Bay Lên</span>
              <span>264Mđ</span>
            </li>

            <li className="flex justify-between">
              <span>4. Chuyến Đi Cuối Cùng</span>
              <span>196Mđ</span>
            </li>

            <li className="flex justify-between">
              <span>5. Bóng Đêm Vĩnh Cửu</span>
              <span>148Mđ</span>
            </li>

          </ol>

        </div>

      </div>

    </div>
  );
}