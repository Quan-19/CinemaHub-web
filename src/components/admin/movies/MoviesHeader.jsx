import { Plus, Film } from "lucide-react";

export default function MoviesHeader({ total, onAdd }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-white flex items-center gap-2">
          <Film size={24} className="text-red-500" />
          Quản lý phim
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Tổng số: {total} phim
        </p>
      </div>

      <button
        onClick={onAdd}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors shadow-lg hover:shadow-red-500/20"
      >
        <Plus size={18} />
        Thêm phim mới
      </button>
    </div>
  );
}