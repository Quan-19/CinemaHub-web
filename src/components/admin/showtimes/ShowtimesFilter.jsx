import { Search, Calendar, Filter, X } from "lucide-react";
import { useState } from "react";
import { formatDateToDisplay, getTodayDisplay } from "../../../utils/dateUtils";

const statusOptions = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "scheduled", label: "Sắp chiếu", color: "#22c55e" },
  { value: "ongoing", label: "Đang chiếu", color: "#f59e0b" },
  { value: "ended", label: "Đã kết thúc", color: "#6b7280" },
  { value: "cancelled", label: "Đã hủy", color: "#ef4444" },
];

export default function ShowtimesFilter({
  search,
  setSearch,
  dateFilter,
  setDateFilter,
  statusFilter,
  setStatusFilter,
  cinemaFilter,
  setCinemaFilter,
  availableDates,
  cinemas,
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const selectClass = "bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-red-500/50 transition [&>option]:bg-[#2d2d44] [&>option]:text-white";

  return (
    <div className="space-y-3">
      {/* Filter cơ bản */}
      <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-4">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="flex-1 min-w-[250px]">
            <div className="flex items-center gap-2 bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-2 focus-within:border-red-500/50 transition">
              <Search size={16} className="text-white/35" />
              <input
                placeholder="Tìm theo tên phim, rạp, phòng..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-white/30"
              />
              {search && (
                <X
                  size={14}
                  className="text-white/35 cursor-pointer hover:text-white"
                  onClick={() => setSearch("")}
                />
              )}
            </div>
          </div>

          {/* Quick date filters */}
          <div className="flex gap-2">
            <button
              onClick={() => setDateFilter("today")}
              className={`px-3 py-2 rounded-lg text-sm transition ${
                dateFilter === "today"
                  ? "bg-red-600 text-white"
                  : "bg-[#1a1a2e] text-white/70 hover:bg-[#2d2d44] border border-white/10"
              }`}
            >
              Hôm nay ({getTodayDisplay()})
            </button>
            <button
              onClick={() => setDateFilter("tomorrow")}
              className={`px-3 py-2 rounded-lg text-sm transition ${
                dateFilter === "tomorrow"
                  ? "bg-red-600 text-white"
                  : "bg-[#1a1a2e] text-white/70 hover:bg-[#2d2d44] border border-white/10"
              }`}
            >
              Ngày mai
            </button>
            <button
              onClick={() => setDateFilter("week")}
              className={`px-3 py-2 rounded-lg text-sm transition ${
                dateFilter === "week"
                  ? "bg-red-600 text-white"
                  : "bg-[#1a1a2e] text-white/70 hover:bg-[#2d2d44] border border-white/10"
              }`}
            >
              Trong tuần
            </button>
          </div>

          {/* Toggle advanced filter */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition border ${
              showAdvanced 
                ? "bg-red-600 text-white border-red-600" 
                : "bg-[#1a1a2e] text-white/70 hover:bg-[#2d2d44] border-white/10"
            }`}
          >
            <Filter size={14} />
            Bộ lọc nâng cao
          </button>
        </div>

        {/* Filter nâng cao */}
        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 pt-3 border-t border-white/10">
            {/* Chọn rạp */}
            <select
              value={cinemaFilter}
              onChange={e => setCinemaFilter(e.target.value)}
              className={selectClass}
              style={{ backgroundColor: '#1a1a2e' }}
            >
              <option value="all" className="bg-[#2d2d44] text-white">Tất cả rạp</option>
              {cinemas.map(cinema => (
                <option key={cinema.id} value={cinema.id} className="bg-[#2d2d44] text-white">
                  {cinema.name}
                </option>
              ))}
            </select>

            {/* Chọn ngày cụ thể */}
            <select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className={selectClass}
              style={{ backgroundColor: '#1a1a2e' }}
            >
              <option value="all" className="bg-[#2d2d44] text-white">Tất cả ngày</option>
              <option value="today" className="bg-[#2d2d44] text-white">Hôm nay ({getTodayDisplay()})</option>
              <option value="tomorrow" className="bg-[#2d2d44] text-white">Ngày mai</option>
              <option value="week" className="bg-[#2d2d44] text-white">Trong tuần</option>
              {availableDates.map(date => (
                <option key={date} value={date} className="bg-[#2d2d44] text-white">
                  {formatDateToDisplay(date)}
                </option>
              ))}
            </select>

            {/* Chọn trạng thái */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className={selectClass}
              style={{ backgroundColor: '#1a1a2e' }}
            >
              {statusOptions.map(option => (
                <option 
                  key={option.value} 
                  value={option.value} 
                  className="bg-[#2d2d44] text-white"
                  style={option.color ? { color: option.color } : {}}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Active filters */}
      {(search || dateFilter !== "all" || statusFilter !== "all" || cinemaFilter !== "all") && (
        <div className="flex items-center gap-2 flex-wrap bg-[#0d0d1a] border border-white/10 rounded-lg p-2">
          <span className="text-xs text-white/40 px-1">Bộ lọc đang áp dụng:</span>
          
          {search && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#2d2d44] rounded text-xs text-white border border-white/10">
              <Search size={10} className="text-white/40" />
              "{search}"
              <X 
                size={12} 
                className="cursor-pointer hover:text-red-400 ml-1" 
                onClick={() => setSearch("")} 
              />
            </span>
          )}
          
          {dateFilter !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#2d2d44] rounded text-xs text-white border border-white/10">
              <Calendar size={10} className="text-white/40" />
              {dateFilter === "today" ? `Hôm nay (${getTodayDisplay()})` : 
               dateFilter === "tomorrow" ? "Ngày mai" : 
               dateFilter === "week" ? "Trong tuần" : 
               formatDateToDisplay(dateFilter)}
              <X 
                size={12} 
                className="cursor-pointer hover:text-red-400 ml-1" 
                onClick={() => setDateFilter("all")} 
              />
            </span>
          )}
          
          {statusFilter !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#2d2d44] rounded text-xs border border-white/10"
              style={{ color: statusOptions.find(o => o.value === statusFilter)?.color || '#fff' }}
            >
              {statusOptions.find(o => o.value === statusFilter)?.label}
              <X 
                size={12} 
                className="cursor-pointer hover:text-red-400 ml-1 text-white" 
                onClick={() => setStatusFilter("all")} 
              />
            </span>
          )}
          
          {cinemaFilter !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#2d2d44] rounded text-xs text-white border border-white/10">
              {cinemas.find(c => c.id === cinemaFilter)?.name}
              <X 
                size={12} 
                className="cursor-pointer hover:text-red-400 ml-1" 
                onClick={() => setCinemaFilter("all")} 
              />
            </span>
          )}

          <button
            onClick={() => {
              setSearch("");
              setDateFilter("all");
              setStatusFilter("all");
              setCinemaFilter("all");
            }}
            className="text-xs text-red-400 hover:text-red-300 ml-auto"
          >
            Xóa tất cả
          </button>
        </div>
      )}
    </div>
  );
}