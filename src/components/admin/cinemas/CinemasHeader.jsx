export default function CinemasHeader({ total, onAdd }) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-semibold text-white">
          Quản lý rạp chiếu phim
        </h1>
        <p className="text-sm text-white/40 mt-1">
          Tổng: {total} chi nhánh
        </p>
      </div>

      <button
        onClick={onAdd}
        className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-lg text-sm font-medium"
      >
        + Thêm rạp
      </button>
    </div>
  );
}