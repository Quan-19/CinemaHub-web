import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  const [itemsPerPage, setItemsPerPage] = useState(8);

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

  // Generate page numbers to display
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

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
      const updatedAccounts = accounts.filter(a => a.id !== deleteAccount.id);
      setAccounts(updatedAccounts);
      setShowDeleteModal(false);
      setDeleteAccount(null);
      
      // Adjust current page if needed
      const newTotalPages = Math.ceil(updatedAccounts.length / itemsPerPage);
      if (currentPage > newTotalPages) {
        setCurrentPage(Math.max(1, newTotalPages));
      }
    }
  };

  const handleSaveAccount = (accountData) => {
    if (editAccount) {
      // Edit existing account
      const updatedAccounts = accounts.map(a => 
        a.id === editAccount.id ? { ...a, ...accountData } : a
      );
      setAccounts(updatedAccounts);
    } else {
      // Add new account
      const newAccount = {
        id: `ACC${String(accounts.length + 1).padStart(3, '0')}`,
        ...accountData,
        lastLogin: "Chưa đăng nhập",
        bookings: 0,
      };
      const updatedAccounts = [...accounts, newAccount];
      setAccounts(updatedAccounts);
      
      // Go to the page containing the new account
      const newTotalPages = Math.ceil(updatedAccounts.length / itemsPerPage);
      setCurrentPage(newTotalPages);
    }
    setShowModal(false);
    setEditAccount(null);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
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
      {filteredAccounts.length > 0 && (
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-4">
            {/* Items per page selector */}
            <div className="flex items-center gap-2">
              <span className="text-white/50 text-sm">Hiển thị:</span>
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="bg-[#0d0d1a] border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm outline-none focus:border-red-500/50 transition cursor-pointer"
              >
                <option value={5} className="bg-[#1a1a2e] text-white">5</option>
                <option value={8} className="bg-[#1a1a2e] text-white">8</option>
                <option value={10} className="bg-[#1a1a2e] text-white">10</option>
                <option value={20} className="bg-[#1a1a2e] text-white">20</option>
                <option value={50} className="bg-[#1a1a2e] text-white">50</option>
              </select>
            </div>
            
            <div className="text-white/50 text-sm">
              {filteredAccounts.length > 0 ? (
                <>Hiển thị {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredAccounts.length)} trong tổng số {filteredAccounts.length} tài khoản</>
              ) : (
                <>Không có tài khoản nào</>
              )}
            </div>
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              {/* Previous button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-10 h-10 rounded-lg bg-[#0d0d1a] border border-white/10 text-white/60 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center"
              >
                <ChevronLeft size={18} />
              </button>

              {/* Page numbers */}
              {getPageNumbers().map((page, index) => (
                page === "..." ? (
                  <span key={`dots-${index}`} className="text-white/40 px-2">...</span>
                ) : (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`min-w-[40px] h-10 rounded-lg font-medium transition ${
                      currentPage === page
                        ? "bg-red-600 text-white"
                        : "bg-[#0d0d1a] border border-white/10 text-white/60 hover:bg-white/5"
                    }`}
                  >
                    {page}
                  </button>
                )
              ))}

              {/* Next button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-10 h-10 rounded-lg bg-[#0d0d1a] border border-white/10 text-white/60 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
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