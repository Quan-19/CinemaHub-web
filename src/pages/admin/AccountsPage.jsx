import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AccountsHeader from "../../components/admin/Accounts/AccountsHeader";
import AccountsStats from "../../components/admin/Accounts/AccountsStats";
import AccountsFilter from "../../components/admin/Accounts/AccountsFilter";
import AccountsTable from "../../components/admin/Accounts/AccountsTable";
import AccountModal from "../../components/admin/Accounts/AccountModal";
import DeleteConfirmModal from "../../components/admin/Accounts/DeleteConfirmModal";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editAccount, setEditAccount] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteAccount, setDeleteAccount] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  // 🔥 FETCH FUNCTION (ĐƯA RA NGOÀI)
  const fetchAccounts = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();

      const res = await fetch("http://localhost:5000/api/users/assign-users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      const formatted = data.map((u) => ({
        id: u.id, // ✅ QUAN TRỌNG
        name: u.name || "-",
        email: u.email || "-",
        phone: u.phone || "-",
        role: u.role || "customer",
        status: u.status || "active",
        bookings: u.bookings || 0,
        lastLogin: u.lastLogin
          ? new Date(u.lastLogin).toLocaleDateString("vi-VN")
          : "Chưa đăng nhập",
      }));

      setAccounts(formatted);
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setLoading(false);
    }
  };

  // 🔥 LOAD DATA
  useEffect(() => {
    fetchAccounts();
  }, []);

  // FILTER
  const filteredAccounts = accounts.filter((a) => {
    return (
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      a.phone.includes(search)
    );
  });

  // PAGINATION
  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAccounts = filteredAccounts.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // HANDLERS
  const handleEditAccount = (account) => {
    console.log("EDIT ACCOUNT:", account); // DEBUG
    setEditAccount(account);
    setShowModal(true);
  };

  const handleSaveAccount = async (accountData) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const token = await user.getIdToken();

      // 🔥 CHECK ID
      if (!editAccount?.id) {
        console.error("❌ ID undefined:", editAccount);
        alert("Lỗi ID user!");
        return;
      }

      const res = await fetch(
        `http://localhost:5000/api/users/${editAccount.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(accountData),
        },
      );

      const result = await res.json();
      console.log("UPDATE RESULT:", result);

      // 🔥 LOAD LẠI DATA
      await fetchAccounts();

      setShowModal(false);
      setEditAccount(null);
    } catch (err) {
      console.error("UPDATE ERROR:", err);
    }
  };

  const handleDeleteClick = (account) => {
    setDeleteAccount(account);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    const updated = accounts.filter((a) => a.id !== deleteAccount.id);
    setAccounts(updated);
    setShowDeleteModal(false);
    setDeleteAccount(null);
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <AccountsHeader total={accounts.length} />

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
      ) : (
        <AccountsTable
          data={paginatedAccounts}
          onEdit={handleEditAccount}
          onDelete={handleDeleteClick}
        />
      )}

      {/* MODAL */}
      {showModal && (
        <AccountModal
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
        />
      )}
    </div>
  );
}