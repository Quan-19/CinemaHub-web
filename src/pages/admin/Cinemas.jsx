import { useState } from "react";
import {
  Search, Plus, Edit2, Trash2, MapPin, Building2,
  ChevronLeft, ChevronRight, Filter, X, UserCog,
  ShieldCheck, Users, Phone, Star,
} from "lucide-react";

// Định nghĩa mockCinemas dạng mảng object JS thuần
const mockCinemas = [
  { id: "CIN001", name: "CGV Vincom Center Bà Triệu", brand: "CGV", city: "Hà Nội", address: "191 Bà Triệu, Hai Bà Trưng", phone: "024 3974 3333", rooms: 8, status: "active", managerId: "STF002", managerName: "Trần Thị Staff" },
  { id: "CIN002", name: "CGV Aeon Mall Hà Đông", brand: "CGV", city: "Hà Nội", address: "Aeon Mall Hà Đông, Quang Trung", phone: "024 3999 4444", rooms: 6, status: "active", managerId: null, managerName: null },
  { id: "CIN003", name: "Lotte Cinema Hà Đông", brand: "Lotte", city: "Hà Nội", address: "Tầng 5, Lotte Mall, Tố Hữu", phone: "024 2233 1555", rooms: 5, status: "active", managerId: "STF006", managerName: "Vũ Thị Mai" },
  { id: "CIN004", name: "BHD Star Phạm Ngọc Thạch", brand: "BHD", city: "Hà Nội", address: "33 Phạm Ngọc Thạch, Đống Đa", phone: "024 3578 8999", rooms: 4, status: "active", managerId: null, managerName: null },
  { id: "CIN005", name: "Galaxy Nguyễn Du", brand: "Galaxy", city: "TP.HCM", address: "116 Nguyễn Du, Quận 1", phone: "028 3822 7777", rooms: 5, status: "maintenance", managerId: null, managerName: null },
  { id: "CIN006", name: "CGV Vincom Đồng Khởi", brand: "CGV", city: "TP.HCM", address: "Vincom Center, 72 Lê Thánh Tôn, Q1", phone: "028 3520 8888", rooms: 7, status: "active", managerId: null, managerName: null },
  { id: "CIN007", name: "Lotte Cinema Cantavil", brand: "Lotte", city: "TP.HCM", address: "Cantavil An Phú, Q2", phone: "028 3740 6699", rooms: 4, status: "closed", managerId: null, managerName: null },
];

const mockStaff: StaffAccount[] = [
  { id: "STF001", name: "Nguyễn Hữu Thành", email: "thanh.nh@cinestar.vn", currentRole: "staff", assignedCinema: null },
  { id: "STF002", name: "Trần Thị Staff", email: "staff1@cinestar.vn", currentRole: "manager", assignedCinema: "CIN001" },
  { id: "STF003", name: "Lê Quang Huy", email: "huy.lq@cinestar.vn", currentRole: "staff", assignedCinema: null },
  { id: "STF004", name: "Phạm Minh Tuấn", email: "tuan.pm@cinestar.vn", currentRole: "staff", assignedCinema: null },
  { id: "STF005", name: "Đỗ Thị Linh", email: "linh.dt@cinestar.vn", currentRole: "staff", assignedCinema: null },
  { id: "STF006", name: "Vũ Thị Mai", email: "mai.vu@gmail.com", currentRole: "manager", assignedCinema: "CIN003" },
];

const brandColors: Record<string, { color: string; bg: string }> = {
  CGV: { color: "#e50914", bg: "rgba(229,9,20,0.12)" },
  Lotte: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  BHD: { color: "#8b5cf6", bg: "rgba(139,92,246,0.12)" },
  Galaxy: { color: "#06b6d4", bg: "rgba(6,182,212,0.12)" },
};

const statusConfig = {
  active: { label: "Đang hoạt động", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  maintenance: { label: "Bảo trì", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  closed: { label: "Tạm đóng", color: "#6b7280", bg: "rgba(107,114,128,0.12)" },
};

export const AdminCinemasPage = () => {
  const [cinemas, setCinemas] = useState(mockCinemas);
  const [staff, setStaff] = useState(mockStaff);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [showCinemaModal, setShowCinemaModal] = useState(false);
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [editCinema, setEditCinema] = useState<Cinema | null>(null);
  const [selectedCinema, setSelectedCinema] = useState<Cinema | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const perPage = 5;

  const filtered = cinemas.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.address.toLowerCase().includes(search.toLowerCase());
    const matchCity = cityFilter === "all" || c.city === cityFilter;
    return matchSearch && matchCity;
  });
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const cities = [...new Set(cinemas.map(c => c.city))];
  const availableStaff = staff.filter(s => s.currentRole === "staff" || s.id === selectedCinema?.managerId);

  const openManagerModal = (cinema: Cinema) => {
    setSelectedCinema(cinema);
    setSelectedStaffId(cinema.managerId || "");
    setShowManagerModal(true);
  };

  const handleAssignManager = () => {
    if (!selectedCinema) return;
    const chosenStaff = staff.find(s => s.id === selectedStaffId);
    // Demote old manager if different
    setStaff(prev => prev.map(s => {
      if (s.id === selectedCinema.managerId && s.id !== selectedStaffId) return { ...s, currentRole: "staff", assignedCinema: null };
      if (s.id === selectedStaffId) return { ...s, currentRole: "manager", assignedCinema: selectedCinema.id };
      return s;
    }));
    setCinemas(prev => prev.map(c =>
      c.id === selectedCinema.id
        ? { ...c, managerId: selectedStaffId || null, managerName: chosenStaff?.name || null }
        : c
    ));
    setShowManagerModal(false);
  };

  const handleDeleteCinema = (id: string) => setCinemas(prev => prev.filter(c => c.id !== id));

  const emptyCinema: Omit<Cinema, "id" | "managerId" | "managerName"> = {
    name: "", brand: "CGV", city: "", address: "", phone: "", rooms: 4, status: "active",
  };
  const [form, setForm] = useState<typeof emptyCinema>(emptyCinema);

  const openAdd = () => { setEditCinema(null); setForm(emptyCinema); setShowCinemaModal(true); };
  const openEdit = (c: Cinema) => { setEditCinema(c); setForm(c); setShowCinemaModal(true); };
  const handleSave = () => {
    if (editCinema) {
      setCinemas(prev => prev.map(c => c.id === editCinema.id ? { ...c, ...form } : c));
    } else {
      setCinemas(prev => [...prev, { ...form, id: `CIN${Date.now()}`, managerId: null, managerName: null }]);
    }
    setShowCinemaModal(false);
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>Quản lý rạp chiếu phim</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Tổng: {cinemas.length} chi nhánh</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          style={{ background: "#e50914", color: "#fff", fontSize: 14 }}>
          <Plus size={16} /> Thêm rạp
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Tổng rạp", count: cinemas.length, color: "#8b5cf6", icon: <Building2 size={16} /> },
          { label: "Đang hoạt động", count: cinemas.filter(c => c.status === "active").length, color: "#22c55e", icon: <Star size={16} /> },
          { label: "Chưa có quản lý", count: cinemas.filter(c => !c.managerId).length, color: "#f59e0b", icon: <UserCog size={16} /> },
          { label: "Nhân viên", count: staff.length, color: "#06b6d4", icon: <Users size={16} /> },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4 flex items-center gap-3"
            style={{ background: "#0d0d1a", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${s.color}20` }}>
              <span style={{ color: s.color }}>{s.icon}</span>
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>{s.count}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-xl p-4 flex flex-wrap gap-3"
        style={{ background: "#0d0d1a", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-2 flex-1 min-w-[200px] rounded-lg px-3 py-2"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <Search size={14} style={{ color: "rgba(255,255,255,0.35)" }} />
          <input placeholder="Tìm tên rạp, địa chỉ..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: 13, width: "100%" }} />
        </div>
        <select value={cityFilter} onChange={e => { setCityFilter(e.target.value); setPage(1); }}
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "6px 12px", color: "#fff", fontSize: 13, outline: "none" }}>
          <option value="all">Tất cả thành phố</option>
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: "#0d0d1a", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="overflow-x-auto">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {["Tên rạp", "Thương hiệu", "Thành phố", "Địa chỉ", "Phòng chiếu", "Trạng thái", "Quản lý chi nhánh", "Thao tác"].map(h => (
                  <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map(cinema => (
                <tr key={cinema.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{cinema.name}</div>
                    <div className="flex items-center gap-1 mt-0.5" style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                      <Phone size={10} />{cinema.phone}
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <span className="px-2 py-1 rounded" style={{ background: brandColors[cinema.brand].bg, color: brandColors[cinema.brand].color, fontSize: 12, fontWeight: 700 }}>
                      {cinema.brand}
                    </span>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <div className="flex items-center gap-1" style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                      <MapPin size={12} />{cinema.city}
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: 12, color: "rgba(255,255,255,0.5)", maxWidth: 200 }}>
                    <div className="truncate">{cinema.address}</div>
                  </td>
                  <td style={{ padding: "12px 14px", textAlign: "center", fontSize: 13, fontWeight: 700, color: "#fff" }}>{cinema.rooms}</td>
                  <td style={{ padding: "12px 14px" }}>
                    <span className="px-2 py-1 rounded-full" style={{ background: statusConfig[cinema.status].bg, color: statusConfig[cinema.status].color, fontSize: 12, fontWeight: 600 }}>
                      {statusConfig[cinema.status].label}
                    </span>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    {cinema.managerName ? (
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "rgba(139,92,246,0.2)", fontSize: 11, fontWeight: 700, color: "#8b5cf6" }}>
                          {cinema.managerName.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontSize: 12, color: "#fff", fontWeight: 500 }}>{cinema.managerName}</div>
                          <div style={{ fontSize: 10, color: "rgba(139,92,246,0.8)" }}>Quản lý chi nhánh</div>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => openManagerModal(cinema)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs hover:opacity-80 transition-opacity"
                        style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.25)" }}>
                        <UserCog size={11} /> Phân quyền
                      </button>
                    )}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => openManagerModal(cinema)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-purple-900/30 transition-colors"
                        style={{ color: "#a78bfa" }} title="Phân quyền quản lý">
                        <ShieldCheck size={13} />
                      </button>
                      <button onClick={() => openEdit(cinema)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-blue-900/30 transition-colors"
                        style={{ color: "#60a5fa" }}>
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => handleDeleteCinema(cinema.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-900/30 transition-colors"
                        style={{ color: "#ef4444" }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
            Hiển thị {Math.min((page - 1) * perPage + 1, filtered.length)}–{Math.min(page * perPage, filtered.length)} / {filtered.length} rạp
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30"
              style={{ background: "rgba(255,255,255,0.06)", color: "#fff" }}><ChevronLeft size={15} /></button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} className="w-8 h-8 rounded-lg"
                style={{ background: p === page ? "#e50914" : "rgba(255,255,255,0.06)", color: "#fff", fontSize: 13 }}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30"
              style={{ background: "rgba(255,255,255,0.06)", color: "#fff" }}><ChevronRight size={15} /></button>
          </div>
        </div>
      </div>

      {/* Assign Manager Modal */}
      {showManagerModal && selectedCinema && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.75)" }}>
          <div className="w-full max-w-md rounded-2xl" style={{ background: "#0d0d1a", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center justify-between p-6 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>Phân quyền quản lý chi nhánh</h2>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{selectedCinema.name}</p>
              </div>
              <button onClick={() => setShowManagerModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10" style={{ color: "rgba(255,255,255,0.5)" }}>
                <X size={16} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="rounded-xl p-4" style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)" }}>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>ℹ️ Khi phân quyền, tài khoản nhân viên sẽ được nâng lên vai trò <strong style={{ color: "#a78bfa" }}>Quản lý chi nhánh</strong> và có quyền quản lý toàn bộ hoạt động của rạp này.</div>
              </div>

              <div>
                <label style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", display: "block", marginBottom: 8 }}>Chọn nhân viên để phân quyền</label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  <div className="flex items-center gap-3 p-3 rounded-lg cursor-pointer"
                    style={{ background: selectedStaffId === "" ? "rgba(107,114,128,0.15)" : "transparent", border: `1px solid ${selectedStaffId === "" ? "rgba(107,114,128,0.3)" : "rgba(255,255,255,0.07)"}`, transition: "all 0.15s" }}
                    onClick={() => setSelectedStaffId("")}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(107,114,128,0.2)" }}>
                      <X size={14} style={{ color: "#6b7280" }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>Không phân quyền (xoá quản lý hiện tại)</div>
                    </div>
                  </div>
                  {availableStaff.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-3 rounded-lg cursor-pointer"
                      style={{ background: selectedStaffId === s.id ? "rgba(139,92,246,0.15)" : "transparent", border: `1px solid ${selectedStaffId === s.id ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.07)"}`, transition: "all 0.15s" }}
                      onClick={() => setSelectedStaffId(s.id)}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: selectedStaffId === s.id ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.08)", fontSize: 12, fontWeight: 700, color: selectedStaffId === s.id ? "#a78bfa" : "#fff" }}>
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{s.name}</div>
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{s.email}</div>
                        </div>
                      </div>
                      {s.currentRole === "manager" && (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(139,92,246,0.2)", color: "#a78bfa" }}>Đang quản lý</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-6 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
              <button onClick={() => setShowManagerModal(false)} className="flex-1 py-2.5 rounded-lg"
                style={{ background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: 14 }}>Huỷ</button>
              <button onClick={handleAssignManager} className="flex-1 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
                style={{ background: "#8b5cf6", color: "#fff", fontSize: 14 }}>
                <span className="flex items-center justify-center gap-2"><ShieldCheck size={15} /> Xác nhận phân quyền</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cinema Form Modal */}
      {showCinemaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.75)" }}>
          <div className="w-full max-w-lg rounded-2xl" style={{ background: "#0d0d1a", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center justify-between p-6 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>{editCinema ? "Chỉnh sửa rạp" : "Thêm rạp mới"}</h2>
              <button onClick={() => setShowCinemaModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10" style={{ color: "rgba(255,255,255,0.5)" }}>
                <X size={16} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", display: "block", marginBottom: 6 }}>Tên rạp</label>
                  <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="VD: CGV Vincom Center Bà Triệu"
                    style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "9px 12px", color: "#fff", fontSize: 13, outline: "none" }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", display: "block", marginBottom: 6 }}>Thương hiệu</label>
                  <select value={form.brand} onChange={e => setForm(p => ({ ...p, brand: e.target.value as any }))}
                    style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "9px 12px", color: "#fff", fontSize: 13, outline: "none" }}>
                    {["CGV", "Lotte", "BHD", "Galaxy"].map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", display: "block", marginBottom: 6 }}>Thành phố</label>
                  <input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} placeholder="Hà Nội / TP.HCM"
                    style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "9px 12px", color: "#fff", fontSize: 13, outline: "none" }} />
                </div>
                <div className="col-span-2">
                  <label style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", display: "block", marginBottom: 6 }}>Địa chỉ</label>
                  <input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="Số nhà, đường, quận..."
                    style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "9px 12px", color: "#fff", fontSize: 13, outline: "none" }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", display: "block", marginBottom: 6 }}>Số điện thoại</label>
                  <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "9px 12px", color: "#fff", fontSize: 13, outline: "none" }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", display: "block", marginBottom: 6 }}>Số phòng chiếu</label>
                  <input type="number" value={form.rooms} onChange={e => setForm(p => ({ ...p, rooms: Number(e.target.value) }))}
                    style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "9px 12px", color: "#fff", fontSize: 13, outline: "none" }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", display: "block", marginBottom: 6 }}>Trạng thái</label>
                  <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as any }))}
                    style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "9px 12px", color: "#fff", fontSize: 13, outline: "none" }}>
                    <option value="active">Đang hoạt động</option>
                    <option value="maintenance">Bảo trì</option>
                    <option value="closed">Tạm đóng</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-6 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
              <button onClick={() => setShowCinemaModal(false)} className="flex-1 py-2.5 rounded-lg"
                style={{ background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: 14 }}>Huỷ</button>
              <button onClick={handleSave} className="flex-1 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
                style={{ background: "#e50914", color: "#fff", fontSize: 14 }}>{editCinema ? "Lưu thay đổi" : "Thêm rạp"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
