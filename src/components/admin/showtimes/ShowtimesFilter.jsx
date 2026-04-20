import { Search, Calendar, Filter, X, RotateCcw } from "lucide-react";
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

  const selectClass =
    "bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-red-500/50 transition duration-200 [&>option]:bg-zinc-900";

  const isFiltered = search || dateFilter !== "all" || statusFilter !== "all" || cinemaFilter !== "all";

  return (
    <div className="space-y-4">
      <div className="bg-cinema-surface border border-white/10 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search Section */}
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-red-500 transition-colors">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Tìm theo tên phim, rạp hoặc phòng chiếu..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-white text-sm outline-none focus:border-red-500/50 focus:bg-zinc-900/50 transition-all placeholder:text-gray-600"
            />
            {search && (
              <button 
                onClick={() => setSearch("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Quick date filters */}
            <div className="flex items-center bg-[#1a1a1a] p-1 rounded-xl border border-white/5">
              {[
                { id: 'today', label: `Hôm nay` },
                { id: 'tomorrow', label: 'Ngày mai' },
                { id: 'week', label: 'Trong tuần' }
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setDateFilter(btn.id)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 uppercase tracking-tight ${
                    dateFilter === btn.id
                      ? "bg-red-600 text-white shadow-md shadow-red-600/20"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            <div className="h-6 w-[1px] bg-white/10 hidden lg:block" />

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all border ${
                  showAdvanced 
                    ? "bg-white text-black border-white" 
                    : "bg-[#1a1a1a] text-gray-400 border-white/10 hover:border-white/20 hover:text-white"
                }`}
              >
                <Filter size={14} />
                Bộ lọc nâng cao
              </button>

              {isFiltered && (
                <button
                  onClick={() => {
                    setSearch("");
                    setDateFilter("all");
                    setStatusFilter("all");
                    setCinemaFilter("all");
                  }}
                  className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                  title="Đặt lại tất cả"
                >
                  <RotateCcw size={18} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Advanced Filters Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 transition-all duration-300 ease-in-out ${
          showAdvanced ? 'mt-5 pt-5 border-t border-white/5 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-gray-500 ml-1">Hệ thống rạp</label>
            <select
              value={cinemaFilter}
              onChange={e => setCinemaFilter(e.target.value)}
              className={`${selectClass} w-full`}
            >
              <option value="all">Tất cả chi nhánh</option>
              {cinemas.map(cinema => (
                <option key={cinema.id} value={cinema.id}>{cinema.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-gray-500 ml-1">Thời gian chiếu</label>
            <select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className={`${selectClass} w-full`}
            >
              <option value="all">Tất cả các ngày</option>
              <option value="today">Hôm nay ({getTodayDisplay()})</option>
              <option value="tomorrow">Ngày mai</option>
              <option value="week">Trong tuần này</option>
              {availableDates.map(date => (
                <option key={date} value={date}>{formatDateToDisplay(date)}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-gray-500 ml-1">Trạng thái vận hành</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className={`${selectClass} w-full`}
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Filter Tags */}
      {isFiltered && (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-2 border-r border-white/10 mr-1">Đang lọc</span>
          
          <div className="flex items-center gap-2 flex-wrap">
            {search && (
              <Tag label={`"${search}"`} icon={<Search size={10} />} onClear={() => setSearch("")} />
            )}
            {dateFilter !== "all" && (
              <Tag 
                label={dateFilter === "today" ? `Hôm nay` : dateFilter === "tomorrow" ? "Ngày mai" : dateFilter === "week" ? "Trong tuần" : formatDateToDisplay(dateFilter)} 
                icon={<Calendar size={10} />} 
                onClear={() => setDateFilter("all")} 
              />
            )}
            {statusFilter !== "all" && (
              <Tag 
                label={statusOptions.find(o => o.value === statusFilter)?.label} 
                onClear={() => setStatusFilter("all")}
                color={statusOptions.find(o => o.value === statusFilter)?.color}
              />
            )}
            {cinemaFilter !== "all" && (
              <Tag 
                label={cinemas.find(c => c.id === cinemaFilter)?.name} 
                onClear={() => setCinemaFilter("all")} 
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Tag({ label, icon, onClear, color }) {
  return (
    <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-white/[0.03] border border-white/10 rounded-lg text-xs font-medium group hover:border-red-500/30 transition-all">
      {icon && <span className="text-gray-500">{icon}</span>}
      <span style={color ? { color } : {}} className="text-gray-300 font-bold">{label}</span>
      <button 
        onClick={onClear} 
        className="text-gray-600 hover:text-red-500 transition-colors"
      >
        <X size={12} />
      </button>
    </div>
  );
}