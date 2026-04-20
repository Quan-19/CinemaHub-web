import { TrendingUp, TrendingDown, Calendar, Sparkles } from "lucide-react";
import { getTodayDate, formatDateToDisplay, getTodayDisplay } from "../../../utils/dateUtils";

export default function ShowtimesStats({ showtimes, onDateChange, specialTypes }) {
  const today = getTodayDate();
  const todayDisplay = getTodayDisplay();

  const stats = {
    today: showtimes.filter(s => s.date === today).length,
    upcoming: showtimes.filter(s => s.date > today && s.status === "scheduled").length,
    ongoing: showtimes.filter(s => s.status === "ongoing").length,
    special: showtimes.filter(s => s.special).length,
  };

  return (
    <div className="grid grid-cols-4 gap-3">
      <div
        onClick={() => onDateChange('today')}
        className="bg-cinema-surface border border-white/10 rounded-xl p-4 cursor-pointer hover:bg-white/5 transition"
      >
        <div className="flex items-center justify-between">
          <Calendar size={18} className="text-blue-400" />
          <span className="text-xs text-white/40">Hôm nay ({todayDisplay})</span>
        </div>
        <div className="text-2xl font-bold text-white mt-2">{stats.today}</div>
        <div className="text-xs text-white/40">suất chiếu</div>
      </div>

      <div className="bg-cinema-surface border border-white/10 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <TrendingUp size={18} className="text-green-400" />
          <span className="text-xs text-white/40">Sắp tới</span>
        </div>
        <div className="text-2xl font-bold text-white mt-2">{stats.upcoming}</div>
        <div className="text-xs text-white/40">suất chiếu</div>
      </div>

      <div className="bg-cinema-surface border border-white/10 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <TrendingDown size={18} className="text-yellow-400" />
          <span className="text-xs text-white/40">Đang chiếu</span>
        </div>
        <div className="text-2xl font-bold text-white mt-2">{stats.ongoing}</div>
        <div className="text-xs text-white/40">suất chiếu</div>
      </div>

      <div className="bg-cinema-surface border border-white/10 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <Sparkles size={18} className="text-purple-400" />
          <span className="text-xs text-white/40">Suất đặc biệt</span>
        </div>
        <div className="text-2xl font-bold text-white mt-2">{stats.special}</div>
        <div className="text-xs text-white/40">suất</div>
      </div>
    </div>
  );
}