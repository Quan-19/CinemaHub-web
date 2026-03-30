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
  const averageDuration = totalMovies > 0 
    ? Math.round(movies.reduce((sum, m) => sum + (m.duration || 0), 0) / totalMovies) 
    : 0;
  const averageRating = totalMovies > 0 
    ? movies.reduce((sum, m) => sum + (m.rating || 0), 0) / totalMovies 
    : 0;

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  className="w-2 h-12 rounded-full transition-all group-hover:h-14 group-hover:w-3" 
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
    </div>
  );
}