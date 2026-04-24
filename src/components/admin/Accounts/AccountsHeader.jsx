export default function AccountsHeader({ total, onAdd }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
      <div>
        <h1 className="text-white text-2xl font-semibold">Quản lý tài khoản</h1>
        <p className="text-white/50 text-sm mt-1">Tổng: {total} tài khoản</p>
      </div>

      {/* <button
        onClick={onAdd}
        className="w-full sm:w-auto bg-red-600 hover:bg-red-700 px-5 py-2.5 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition"
      >
        <span className="text-lg">+</span> Thêm tài khoản
      </button> */}
    </div>
  );
}