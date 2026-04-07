import { Search } from "lucide-react";

export default function CinemasFilter({
  search,
  setSearch,
  cityFilter,
  setCityFilter,
  cinemas,
}) {
  const cities = [...new Set(cinemas.map(c => c.city))];

  return (
    <div className="flex gap-3">

      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Tìm tên rạp, địa chỉ..."
          className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-white/20"
        />
      </div>

      <select
        value={cityFilter}
        onChange={e => setCityFilter(e.target.value)}
        className="px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-white/20"
      >
        <option value="all">Tất cả thành phố</option>
        {cities.map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

    </div>
  );
}