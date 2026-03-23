import { TrendingUp, TrendingDown, Calendar, DollarSign, Sparkles } from "lucide-react";

export default function ShowtimesStats({ showtimes, onDateChange, specialTypes }) {
  const today = new Date().toISOString().split('T')[0];
  
  const stats = {
    today: showtimes.filter(s => s.date === today).length,
    upcoming: showtimes.filter(s => s.date > today && s.status === "scheduled").length,
    ongoing: showtimes.filter(s => s.status === "ongoing").length,
    special: showtimes.filter(s => s.special).length,
    revenue: showtimes.reduce((sum, s) => sum + (s.revenue || 0), 0),
    specialRevenue: showtimes
      .filter(s => s.special)
      .reduce((sum, s) => sum + (s.revenue || 0), 0)
  };

  return (
    <div className="grid grid-cols-5 gap-3">
      <div 
        onClick={() => onDateChange('today')}
        className="bg-[#0d0d1a] border border-white/10 rounded-xl p-4 cursor-pointer hover:bg-white/5 transition col-span-1"
      >
        <div className="flex items-center justify-between">
          <Calendar size={18} className="text-blue-400" />
          <span className="text-xs text-white/40">Hôm nay</span>
        </div>
        <div className="text-2xl font-bold text-white mt-2">{stats.today}</div>
        <div className="text-xs text-white/40">suất chiếu</div>
      </div>

      <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-4 col-span-1">
        <div className="flex items-center justify-between">
          <TrendingUp size={18} className="text-green-400" />
          <span className="text-xs text-white/40">Sắp tới</span>
        </div>
        <div className="text-2xl font-bold text-white mt-2">{stats.upcoming}</div>
        <div className="text-xs text-white/40">suất chiếu</div>
      </div>

      <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-4 col-span-1">
        <div className="flex items-center justify-between">
          <TrendingDown size={18} className="text-yellow-400" />
          <span className="text-xs text-white/40">Đang chiếu</span>
        </div>
        <div className="text-2xl font-bold text-white mt-2">{stats.ongoing}</div>
        <div className="text-xs text-white/40">suất chiếu</div>
      </div>

      <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-4 col-span-1">
        <div className="flex items-center justify-between">
          <Sparkles size={18} className="text-purple-400" />
          <span className="text-xs text-white/40">Suất đặc biệt</span>
        </div>
        <div className="text-2xl font-bold text-white mt-2">{stats.special}</div>
        <div className="text-xs text-white/40">suất</div>
      </div>

      <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-4 col-span-1">
        <div className="flex items-center justify-between">
          <DollarSign size={18} className="text-purple-400" />
          <span className="text-xs text-white/40">Doanh thu</span>
        </div>
        <div className="text-2xl font-bold text-white mt-2">
          {stats.revenue.toLocaleString()}đ
        </div>
        <div className="text-xs text-white/40">
          Đặc biệt: {stats.specialRevenue.toLocaleString()}đ
        </div>
      </div>
    </div>
  );
}