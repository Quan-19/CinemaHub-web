import { Search, Filter, X, Film, Calendar, Clock } from "lucide-react";
import { useState } from "react";

export default function MoviesFilter({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  moviesCount = { total: 0, nowShowing: 0, comingSoon: 0, ended: 0 }
}) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Hàm xóa tìm kiếm
  const clearSearch = () => {
    setSearch("");
  };

  // Các tùy chọn lọc
  const filterOptions = [
    { value: "all", label: "Tất cả", icon: Film, color: "text-gray-400", count: moviesCount.total },
    { value: "now_showing", label: "Đang chiếu", icon: Film, color: "text-green-400", count: moviesCount.nowShowing },
    { value: "coming_soon", label: "Sắp chiếu", icon: Calendar, color: "text-yellow-400", count: moviesCount.comingSoon },
    { value: "ended", label: "Đã kết thúc", icon: Clock, color: "text-gray-400", count: moviesCount.ended }
  ];

  return (
    <div className="space-y-3">
      <div className="rounded-xl p-4 flex gap-3 bg-[#0d0d1a] border border-white/10">
        {/* Ô tìm kiếm */}
        <div className="flex-1 relative">
          <div className="flex items-center gap-2 w-full bg-[#020617] border border-white/10 rounded-lg px-3 py-2 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500 transition-all">
            <Search size={16} className="text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên phim..."
              className="bg-transparent outline-none text-white w-full text-sm placeholder:text-gray-500"
            />
            {search && (
              <button
                onClick={clearSearch}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Bộ lọc trạng thái - Desktop */}
        <div className="hidden md:flex items-center gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                statusFilter === option.value
                  ? `bg-red-600 text-white shadow-lg shadow-red-600/20`
                  : `bg-[#020617] text-gray-400 hover:text-white hover:bg-white/5 border border-white/10`
              }`}
            >
              <option.icon size={14} className={statusFilter === option.value ? "text-white" : option.color} />
              <span className="text-sm font-medium">{option.label}</span>
              {option.count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  statusFilter === option.value
                    ? "bg-white/20 text-white"
                    : "bg-white/10 text-gray-400"
                }`}>
                  {option.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Bộ lọc trạng thái - Mobile */}
        <div className="md:hidden relative">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 bg-[#020617] border border-white/10 rounded-lg px-3 py-2 hover:border-red-500 transition-all"
          >
            <Filter size={14} className="text-gray-400" />
            <span className="text-white text-sm">
              {filterOptions.find(opt => opt.value === statusFilter)?.label || "Lọc"}
            </span>
          </button>
          
          {isFilterOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsFilterOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#020617] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setStatusFilter(option.value);
                      setIsFilterOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 transition-colors ${
                      statusFilter === option.value
                        ? "bg-red-600/20 text-red-400"
                        : "text-gray-300 hover:bg-white/5"
                    }`}
                  >
                    <option.icon size={14} className={option.color} />
                    <span className="text-sm flex-1 text-left">{option.label}</span>
                    {option.count > 0 && (
                      <span className="text-xs text-gray-500">{option.count}</span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Hiển thị kết quả tìm kiếm */}
      {search && (
        <div className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-sm text-gray-300">
            🔍 Kết quả tìm kiếm cho: <span className="text-red-400 font-medium">"{search}"</span>
          </p>
        </div>
      )}
    </div>
  );
}