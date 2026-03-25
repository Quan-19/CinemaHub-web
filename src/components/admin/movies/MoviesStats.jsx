import { useState } from "react";
import { Calendar, Clock, Film, TrendingUp, Star } from "lucide-react";

export default function MoviesStats({ movies }) {
  const today = new Date();
  const [hoveredStat, setHoveredStat] = useState(null);

  // Tính trạng thái dựa trên ngày và status
  const getStatus = (movie) => {
    const releaseDate = new Date(movie.releaseDate);
    if (releaseDate > today) return "coming_soon";
    if (releaseDate <= today && movie.status === "now_showing") return "now_showing";
    return "ended";
  };

  // Tính các chỉ số
  const totalMovies = movies.length;
  const averageDuration = Math.round(
    movies.reduce((sum, m) => sum + (m.duration || 0), 0) / totalMovies || 0
  );
  const averageRating = movies.reduce((sum, m) => sum + (m.ratingScore || 0), 0) / totalMovies || 0;
  const totalTickets = movies.reduce((sum, m) => sum + (m.tickets || 0), 0);

  const stats = [
    {
      label: "Đang chiếu",
      key: "now_showing",
      count: movies.filter((m) => getStatus(m) === "now_showing").length,
      color: "#22c55e",
      bgColor: "bg-green-500/10",
      textColor: "text-green-400",
      borderColor: "border-green-500/20",
      icon: Film,
      description: "Phim đang được chiếu tại các rạp",
    },
    {
      label: "Sắp chiếu",
      key: "coming_soon",
      count: movies.filter((m) => getStatus(m) === "coming_soon").length,
      color: "#f59e0b",
      bgColor: "bg-orange-500/10",
      textColor: "text-orange-400",
      borderColor: "border-orange-500/20",
      icon: Clock,
      description: "Phim sắp ra mắt trong thời gian tới",
    },
    {
      label: "Đã kết thúc",
      key: "ended",
      count: movies.filter((m) => getStatus(m) === "ended").length,
      color: "#6b7280",
      bgColor: "bg-gray-500/10",
      textColor: "text-gray-400",
      borderColor: "border-gray-500/20",
      icon: Calendar,
      description: "Phim đã kết thúc suất chiếu",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => {
          const IconComponent = s.icon;
          const percentage = totalMovies > 0 ? ((s.count / totalMovies) * 100).toFixed(0) : 0;
          
          return (
            <div
              key={s.label}
              className="group relative rounded-xl p-4 bg-[#0d0d1a] border border-white/10 hover:bg-[#12121f] hover:border-white/20 transition-all duration-200 cursor-pointer"
              onMouseEnter={() => setHoveredStat(s.label)}
              onMouseLeave={() => setHoveredStat(null)}
            >
              <div className="flex items-center gap-3">
                {/* Thanh màu bên trái */}
                <div 
                  className="w-2 h-10 rounded-full transition-all group-hover:h-12 group-hover:w-3" 
                  style={{ background: s.color }} 
                />
                
                <div className="flex-1">
                  {/* Số lượng */}
                  <div className="text-white text-2xl font-bold group-hover:scale-105 transition-transform inline-block">
                    {s.count}
                  </div>
                  
                  {/* Label */}
                  <div className="text-gray-400 text-xs mt-1">{s.label}</div>
                  
                  {/* Percentage bar */}
                  {percentage > 0 && (
                    <div className="mt-2">
                      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${percentage}%`,
                            background: s.color 
                          }}
                        />
                      </div>
                      <div className="text-[10px] text-gray-500 mt-1">{percentage}% tổng số phim</div>
                    </div>
                  )}
                </div>
                
                {/* Icon */}
                <div className={`p-2 rounded-lg ${s.bgColor} group-hover:scale-110 transition-transform`}>
                  <IconComponent size={20} className={s.textColor} />
                </div>
              </div>
              
              {/* Tooltip */}
              {hoveredStat === s.label && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-10 border border-white/10">
                  {s.description}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Thêm thông tin tổng quan */}
      <div className="flex items-center justify-between text-xs text-gray-500 px-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <TrendingUp size={12} />
            <span>Tổng số phim: {totalMovies}</span>
          </div>
          {averageDuration > 0 && (
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>TB thời lượng: {averageDuration} phút</span>
            </div>
          )}
          {averageRating > 0 && (
            <div className="flex items-center gap-1">
              <Star size={12} />
              <span>TB đánh giá: {averageRating.toFixed(1)}/10</span>
            </div>
          )}
          {totalTickets > 0 && (
            <div className="flex items-center gap-1">
              <TrendingUp size={12} />
              <span>Tổng vé: {totalTickets}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}