import { Search } from "lucide-react";

export default function AccountsFilter({
  search,
  setSearch,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
}) {
  return (
    <div className="flex gap-3 mb-6">
      {/* Search */}
      <div className="flex-1 relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm tên, email, SĐT..."
          className="w-full bg-zinc-900 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm outline-none focus:border-red-500/50 transition placeholder:text-white/30"
        />
      </div>

      {/* Filters */}
      <select
        value={roleFilter}
        onChange={(e) => setRoleFilter(e.target.value)}
        className="bg-zinc-900 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm outline-none min-w-[140px] focus:border-red-500/50 transition appearance-none cursor-pointer"
      >
        <option value="all" className="bg-zinc-900 text-white">Tất cả vai trò</option>
        <option value="admin" className="bg-zinc-900 text-white">Admin</option>
        <option value="staff" className="bg-zinc-900 text-white">Nhân viên</option>
        <option value="user" className="bg-zinc-900 text-white">Khách hàng</option>
      </select>

      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="bg-zinc-900 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm outline-none min-w-[140px] focus:border-red-500/50 transition appearance-none cursor-pointer"
      >
        <option value="all" className="bg-zinc-900 text-white">Tất cả trạng thái</option>
        <option value="active" className="bg-zinc-900 text-white">Hoạt động</option>
        <option value="inactive" className="bg-zinc-900 text-white">Tạm ngưng</option>
        <option value="banned" className="bg-zinc-900 text-white">Bị khoá</option>
      </select>
    </div>
  );
}