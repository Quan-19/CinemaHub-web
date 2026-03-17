import { Plus } from "lucide-react";

export default function MoviesHeader({ total, onAdd }) {
  return (
    <div className="flex items-center justify-between">

      <div>
        <h1 className="text-white text-[22px] font-bold">
          Quản lý phim
        </h1>
        <p className="text-gray-400 text-sm">
          Tổng: {total} phim
        </p>
      </div>

      <button
        onClick={onAdd}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium"
      >
        <Plus size={16} />
        Thêm phim
      </button>

    </div>
  );
}
