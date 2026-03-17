import { Search, Filter } from "lucide-react";

export default function MoviesFilter({
  search,
  setSearch,
  statusFilter,
  setStatusFilter
}) {
  return (
    <div className="rounded-xl p-4 flex gap-3 bg-[#0d0d1a] border border-white/10">

      <div className="flex items-center gap-2 flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
        <Search size={14} className="text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên phim..."
          className="bg-transparent outline-none text-white w-full text-sm"
        />
      </div>

      <div className="flex items-center gap-2">
        <Filter size={14} className="text-gray-400" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
        >
          <option value="all">Tất cả</option>
          <option value="now-showing">Đang chiếu</option>
          <option value="coming-soon">Sắp chiếu</option>
          <option value="ended">Đã kết thúc</option>
        </select>
      </div>

    </div>
  );
}