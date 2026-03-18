import { useState } from "react";
import AccountsHeader from "../../components/admin/Accounts/AccountsHeader";
import AccountsStats from "../../components/admin/Accounts/AccountsStats";
import AccountsFilter from "../../components/admin/Accounts/AccountsFilter";
import AccountsTable from "../../components/admin/Accounts/AccountsTable";
import AccountModal from "../../components/admin/Accounts/AccountModal";
import DeleteConfirmModal from "../../components/admin/Accounts/DeleteConfirmModal";

const mockAccounts = [
  {
    id: "ACC001",
    name: "Nguyễn Văn Admin",
    email: "admin@cinestar.vn",
    phone: "0912 345 678",
    role: "admin",
    status: "active",
    lastLogin: "06/03/2026",
    bookings: 0,
  },
  {
    id: "ACC002",
    name: "Trần Thị Staff",
    email: "staff1@cinestar.vn",
    phone: "0923 456 789",
    role: "staff",
    status: "active",
    lastLogin: "05/03/2026",
    bookings: 0,
  },
  {
    id: "ACC003",
    name: "Lê Minh Khoa",
    email: "khoa.le@gmail.com",
    phone: "0934 567 890",
    role: "user",
    status: "active",
    lastLogin: "06/03/2026",
    bookings: 24,
  },
  {
    id: "ACC004",
    name: "Phạm Thu Hương",
    email: "huong.pham@gmail.com",
    phone: "0945 678 901",
    role: "user",
    status: "active",
    lastLogin: "04/03/2026",
    bookings: 18,
  },
  {
    id: "ACC005",
    name: "Hoàng Anh Tuấn",
    email: "tuan.hoang@gmail.com",
    phone: "0956 789 012",
    role: "user",
    status: "inactive",
    lastLogin: "01/02/2026",
    bookings: 7,
  },
  {
    id: "ACC006",
    name: "Vũ Thị Mai",
    email: "mai.vu@gmail.com",
    phone: "0967 890 123",
    role: "staff",
    status: "active",
    lastLogin: "08/03/2026",
    bookings: 0,
  },
  {
    id: "ACC007",
    name: "Đinh Văn Long",
    email: "long.dinh@gmail.com",
    phone: "0978 901 234",
    role: "user",
    status: "banned",
    lastLogin: "15/01/2026",
    bookings: 3,
  },
  {
    id: "ACC008",
    name: "Bùi Thị Lan",
    email: "lan.bui@gmail.com",
    phone: "0989 012 345",
    role: "user",
    status: "active",
    lastLogin: "05/03/2026",
    bookings: 31,
  }
];

export default function AccountsPage() {
  // State cho accounts
  const [accounts, setAccounts] = useState(mockAccounts);
  
  // State cho filter
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // State cho modal
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editAccount, setEditAccount] = useState(null);
  const [deleteAccount, setDeleteAccount] = useState(null);
  
  // State cho pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter accounts
  const filteredAccounts = accounts.filter((a) => {
    const matchSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      a.phone.includes(search);

    const matchRole = roleFilter === "all" || a.role === roleFilter;
    const matchStatus = statusFilter === "all" || a.status === statusFilter;

    return matchSearch && matchRole && matchStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAccounts = filteredAccounts.slice(startIndex, startIndex + itemsPerPage);

  // Handlers
  const handleAddAccount = () => {
    setEditAccount(null);
    setShowModal(true);
  };

  const handleEditAccount = (account) => {
    setEditAccount(account);
    setShowModal(true);
  };

  const handleDeleteClick = (account) => {
    setDeleteAccount(account);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (deleteAccount) {
      setAccounts(accounts.filter(a => a.id !== deleteAccount.id));
      setShowDeleteModal(false);
      setDeleteAccount(null);
    }
  };

  const handleSaveAccount = (accountData) => {
    if (editAccount) {
      // Edit existing account
      setAccounts(accounts.map(a => 
        a.id === editAccount.id ? { ...a, ...accountData } : a
      ));
    } else {
      // Add new account
      const newAccount = {
        id: `ACC${String(accounts.length + 1).padStart(3, '0')}`,
        ...accountData,
        lastLogin: "Chưa đăng nhập",
        bookings: 0,
      };
      setAccounts([...accounts, newAccount]);
    }
    setShowModal(false);
    setEditAccount(null);
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <AccountsHeader
        total={accounts.length}
        onAdd={handleAddAccount}
      />

      <AccountsStats data={accounts} />

      <AccountsFilter
        search={search}
        setSearch={setSearch}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      <AccountsTable
        data={paginatedAccounts}
        onEdit={handleEditAccount}
        onDelete={handleDeleteClick}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-end items-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="w-10 h-10 rounded-lg bg-[#0d0d1a] border border-white/10 text-white/60 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            ‹
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-10 h-10 rounded-lg font-medium transition ${
                currentPage === page
                  ? "bg-red-600 text-white"
                  : "bg-[#0d0d1a] border border-white/10 text-white/60 hover:bg-white/5"
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="w-10 h-10 rounded-lg bg-[#0d0d1a] border border-white/10 text-white/60 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            ›
          </button>
        </div>
      )}

      {/* Modals */}
      {showModal && (
        <AccountModal
          data={editAccount}
          onClose={() => {
            setShowModal(false);
            setEditAccount(null);
          }}
          onSave={handleSaveAccount}
        />
      )}

      {showDeleteModal && (
        <DeleteConfirmModal
          account={deleteAccount}
          onClose={() => {
            setShowDeleteModal(false);
            setDeleteAccount(null);
          }}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}