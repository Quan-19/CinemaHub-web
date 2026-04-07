import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AccountsHeader from "../../components/admin/Accounts/AccountsHeader";
import AccountsStats from "../../components/admin/Accounts/AccountsStats";
import AccountsFilter from "../../components/admin/Accounts/AccountsFilter";
import AccountsTable from "../../components/admin/Accounts/AccountsTable";
import AccountModal from "../../components/admin/Accounts/AccountModal";
import DeleteConfirmModal from "../../components/admin/Accounts/DeleteConfirmModal";

const API_BASE_URL = "http://localhost:5000";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editAccount, setEditAccount] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteAccount, setDeleteAccount] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  // 🔥 FETCH FUNCTION (ĐƯA RA NGOÀI)
  const fetchAccounts = async () => {
    try {
      setError(null);
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        setAccounts([]);
        setLoading(false);
        setError("Bạn chưa đăng nhập.");
        return;
      }

      const token = await user.getIdToken();

      const res = await fetch(`${API_BASE_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const raw = await res.text();
        throw new Error(raw || `Request failed (${res.status})`);
      }

      const data = await res.json();

      const formatted = (Array.isArray(data) ? data : []).map((u) => {
        const createdAt = u.createdAt ? new Date(u.createdAt) : null;
        const dob = u.dob ? new Date(u.dob) : null;

        return {
          id: u.id,
          name: u.name || "-",
          email: u.email || "-",
          phone: u.phone || "-",
          role: u.role || "customer",
          status: u.status || "active",
          avatar: u.avatar || null,
          cinemaId: u.cinemaId ?? null,
          cinemaName: u.cinemaName || "-",
          bookings: Number(u.bookings) || 0,
          createdAt: createdAt && !Number.isNaN(createdAt.valueOf())
            ? createdAt.toLocaleDateString("vi-VN")
            : "-",
          dob: dob && !Number.isNaN(dob.valueOf())
            ? dob.toLocaleDateString("vi-VN")
            : "-",
        };
      });

      setAccounts(formatted);
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setLoading(false);
      setError("Không thể tải danh sách tài khoản.");
    }
  };

  // 🔥 LOAD DATA
  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter, statusFilter, itemsPerPage]);

  // FILTER
  const filteredAccounts = accounts.filter((a) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      String(a.id).includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      String(a.phone).toLowerCase().includes(q);

    const matchesRole = roleFilter === "all" ? true : a.role === roleFilter;
    const matchesStatus = statusFilter === "all" ? true : a.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // PAGINATION
  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAccounts = filteredAccounts.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage((p) => {
      const nextTotal = Math.max(totalPages, 1);
      return Math.min(Math.max(p, 1), nextTotal);
    });
  }, [totalPages]);

  // HANDLERS
  const handleEditAccount = (account) => {
    setEditAccount(account);
    setShowModal(true);
  };

  const handleAddAccount = () => {
    setEditAccount(null);
    setShowModal(true);
  };

  const handleSaveAccount = async (accountData) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        alert("Bạn chưa đăng nhập");
        return;
      }
      const token = await user.getIdToken();

      const isEdit = Boolean(editAccount?.id);

      const url = isEdit
        ? `${API_BASE_URL}/api/users/${editAccount.id}`
        : `${API_BASE_URL}/api/users`;

      const method = isEdit ? "PUT" : "POST";

      const payload = {
        name: accountData.name,
        email: accountData.email,
        phone: accountData.phone,
        role: accountData.role,
        ...(isEdit ? { status: accountData.status } : {}),
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const raw = await res.text();
        throw new Error(raw || `Request failed (${res.status})`);
      }

      // 🔥 LOAD LẠI DATA
      await fetchAccounts();

      setShowModal(false);
      setEditAccount(null);
    } catch (err) {
      console.error("UPDATE ERROR:", err);
      alert("Không thể lưu tài khoản. Vui lòng thử lại.");
    }
  };

  const handleDeleteClick = (account) => {
    setDeleteAccount(account);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteAccount?.id) return;

    try {
      setDeleteLoading(true);
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        alert("Bạn chưa đăng nhập");
        return;
      }
      const token = await user.getIdToken();

      const res = await fetch(`${API_BASE_URL}/api/users/${deleteAccount.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const raw = await res.text();
        throw new Error(raw || `Request failed (${res.status})`);
      }

      await fetchAccounts();
      setShowDeleteModal(false);
      setDeleteAccount(null);
    } catch (err) {
      console.error("DELETE ERROR:", err);
      alert("Không thể xoá tài khoản. Vui lòng thử lại.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const safeTotalPages = Math.max(totalPages, 1);
  const canPrev = currentPage > 1;
  const canNext = currentPage < safeTotalPages;
  const handlePrev = () => {
    if (canPrev) setCurrentPage((p) => p - 1);
  };
  const handleNext = () => {
    if (canNext) setCurrentPage((p) => p + 1);
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <AccountsHeader total={accounts.length} onAdd={handleAddAccount} />

      <AccountsStats data={accounts} />

      <AccountsFilter
        search={search}
        setSearch={setSearch}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      {loading ? (
        <p className="text-white text-center mt-6">Đang tải...</p>
      ) : error ? (
        <p className="text-red-400 text-center mt-6">{error}</p>
      ) : filteredAccounts.length === 0 ? (
        <div className="bg-cinema-surface border border-white/10 rounded-xl p-8 text-center">
          <div className="text-white font-semibold">Không có tài khoản phù hợp</div>
          <div className="text-white/50 text-sm mt-1">Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm.</div>
        </div>
      ) : (
        <>
          <AccountsTable
            data={paginatedAccounts}
            onEdit={handleEditAccount}
            onDelete={handleDeleteClick}
          />

          {/* Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-white/60 text-sm">
              Hiển thị {paginatedAccounts.length} / {filteredAccounts.length} kết quả
            </div>

            <div className="flex items-center gap-3">
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-red-500/50 transition appearance-none cursor-pointer"
              >
                <option value={8} className="bg-zinc-900 text-white">8 / trang</option>
                <option value={12} className="bg-zinc-900 text-white">12 / trang</option>
                <option value={20} className="bg-zinc-900 text-white">20 / trang</option>
              </select>

              <button
                type="button"
                onClick={handlePrev}
                disabled={!canPrev}
                className="h-9 w-9 inline-flex items-center justify-center rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white disabled:opacity-40 disabled:hover:bg-zinc-900 transition"
                title="Trang trước"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="text-white/70 text-sm min-w-[92px] text-center">
                {currentPage} / {safeTotalPages}
              </div>
              <button
                type="button"
                onClick={handleNext}
                disabled={!canNext}
                className="h-9 w-9 inline-flex items-center justify-center rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white disabled:opacity-40 disabled:hover:bg-zinc-900 transition"
                title="Trang sau"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* MODAL */}
      {showModal && (
        <AccountModal
          key={editAccount?.id ?? "new"}
          data={editAccount}
          onClose={() => setShowModal(false)}
          onSave={handleSaveAccount}
        />
      )}

      {showDeleteModal && (
        <DeleteConfirmModal
          account={deleteAccount}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmDelete}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}