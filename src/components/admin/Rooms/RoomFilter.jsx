export default function RoomFilter({ cinemaFilter, setCinemaFilter, cinemas, onPageChange }) {
  if (cinemas.length === 0) return null;

  const handleChange = (value) => {
    setCinemaFilter(value);
    onPageChange();
  };

  return (
    <div className="flex gap-3">
      <select
        value={cinemaFilter}
        onChange={(e) => handleChange(e.target.value)}
        className="px-4 py-2 rounded-lg text-sm outline-none transition-colors cursor-pointer bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white"
      >
        <option value="all">Tất cả rạp ({cinemas.length})</option>
        {cinemas.map(cinema => (
          <option key={cinema} value={cinema}>
            {cinema}
          </option>
        ))}
      </select>
    </div>
  );
}