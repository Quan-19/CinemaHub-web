import { useState } from "react";
import { Plus, Edit2, Trash2, Eye, EyeOff, GripVertical, Image, Upload, Toggle } from "lucide-react";

// Định nghĩa mockBanners dạng mảng object JS thuần
const positionLabel = {
  "home-hero": "Trang chủ — Hero",
  "home-middle": "Trang chủ — Giữa",
  "movie-list": "Danh sách phim",
  "sidebar": "Thanh bên",
};

const mockBanners = [
  { id: "BN001", title: "Banner Hành Trình Vũ Trụ", image: "https://images.unsplash.com/photo-1513704519535-f5c81aa78d0d?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=800&h=300", link: "/movies/2", position: "home-hero", status: "active", startDate: "01/03/2026", endDate: "31/03/2026", clicks: 2840, views: 48200, order: 1 },
  { id: "BN002", title: "Khuyến mãi Thứ 4 Vui Vẻ", image: "https://images.unsplash.com/photo-1742822050771-588f61785322?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=800&h=300", link: "/promotions", position: "home-hero", status: "active", startDate: "01/01/2026", endDate: "31/12/2026", clicks: 1560, views: 32100, order: 2 },
  { id: "BN003", title: "Combo Cặp Đôi Đặc Biệt", image: "https://images.unsplash.com/photo-1608170825938-a8ea0305d46c?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=800&h=300", link: "/promotions", position: "home-middle", status: "active", startDate: "14/02/2026", endDate: "14/03/2026", clicks: 890, views: 18500, order: 1 },
  { id: "BN004", title: "Biệt Đội Chiến Thần — Ra rạp", image: "https://images.unsplash.com/photo-1742274317501-57e147afc0c4?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=800&h=300", link: "/movies/1", position: "movie-list", status: "inactive", startDate: "14/02/2026", endDate: "14/03/2026", clicks: 420, views: 9800, order: 1 },
  { id: "BN005", title: "Ứng dụng CineStar Mobile", image: "https://images.unsplash.com/photo-1766267190781-73203979c4ac?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=400&h=600", link: "#download", position: "sidebar", status: "active", startDate: "01/01/2026", endDate: "31/12/2026", clicks: 320, views: 72000, order: 1 },
];

export const AdminBannersPage = () => {
  const [banners, setBanners] = useState(mockBanners);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [filterPos, setFilterPos] = useState("all");
  const [previewBanner, setPreviewBanner] = useState(null);

  const filtered = filterPos === "all" ? banners : banners.filter(b => b.position === filterPos);

  const toggleStatus = (id) => {
    setBanners(prev => prev.map(b => b.id === id ? { ...b, status: b.status === "active" ? "inactive" : "active" } : b));
  };

  const ctr = (b) => b.views > 0 ? ((b.clicks / b.views) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>Banner quảng cáo</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Quản lý banner hiển thị trên hệ thống</p>
        </div>
        <button
          onClick={() => { setEditItem(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          style={{ background: "#e50914", color: "#fff", fontSize: 14 }}
        >
          <Plus size={16} />
          Thêm banner
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Tổng banner", value: banners.length, color: "#8b5cf6" },
          { label: "Đang hoạt động", value: banners.filter(b => b.status === "active").length, color: "#22c55e" },
          { label: "Tổng lượt xem", value: banners.reduce((s, b) => s + b.views, 0).toLocaleString(), color: "#06b6d4" },
          { label: "Tổng lượt click", value: banners.reduce((s, b) => s + b.clicks, 0).toLocaleString(), color: "#f59e0b" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-4 flex items-center gap-3"
            style={{ background: "var(--color-cinema-surface)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="w-2 h-10 rounded-full" style={{ background: s.color }} />
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Position filter */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: "all", label: "Tất cả" },
          { key: "home-hero", label: "Hero" },
          { key: "home-middle", label: "Giữa trang" },
          { key: "movie-list", label: "Danh sách phim" },
          { key: "sidebar", label: "Sidebar" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilterPos(f.key)}
            className="px-4 py-2 rounded-lg text-sm transition-colors"
            style={
              filterPos === f.key
                ? { background: "#e50914", color: "#fff" }
                : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Banner cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((banner) => (
          <div
            key={banner.id}
            className="rounded-xl overflow-hidden"
            style={{
              background: "var(--color-cinema-surface)",
              border: `1px solid ${banner.status === "active" ? "rgba(229,9,20,0.3)" : "rgba(255,255,255,0.07)"}`,
            }}
          >
            {/* Banner image */}
            <div className="relative" style={{ height: 160, overflow: "hidden" }}>
              <img
                src={banner.image}
                alt={banner.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(13,13,26,0.9), transparent)" }} />
              {/* Status badge */}
              <div className="absolute top-3 left-3">
                <span
                  className="px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: banner.status === "active" ? "rgba(34,197,94,0.9)" : "rgba(107,114,128,0.9)",
                    color: "#fff",
                  }}
                >
                  {banner.status === "active" ? "● Hoạt động" : "○ Tạm dừng"}
                </span>
              </div>
              {/* Position badge */}
              <div className="absolute top-3 right-3">
                <span className="px-2.5 py-1 rounded-full text-xs"
                  style={{ background: "rgba(0,0,0,0.6)", color: "rgba(255,255,255,0.8)", backdropFilter: "blur(4px)" }}>
                  {positionLabel[banner.position]}
                </span>
              </div>
              {/* Order handle */}
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                <GripVertical size={14} style={{ color: "rgba(255,255,255,0.5)" }} />
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>#{banner.order}</span>
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{banner.title}</h3>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                    {banner.startDate} → {banner.endDate}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => setPreviewBanner(banner)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                    style={{ color: "rgba(255,255,255,0.5)" }}>
                    <Eye size={14} />
                  </button>
                  <button onClick={() => { setEditItem(banner); setShowModal(true); }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-blue-900/30 transition-colors"
                    style={{ color: "#60a5fa" }}>
                    <Edit2 size={14} />
                  </button>
                  <button
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-900/30 transition-colors"
                    style={{ color: "#ef4444" }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-3 mb-3">
                {[
                  { label: "Lượt xem", value: banner.views.toLocaleString() },
                  { label: "Lượt click", value: banner.clicks.toLocaleString() },
                  { label: "CTR", value: `${ctr(banner)}%` },
                ].map((m) => (
                  <div key={m.label} className="rounded-lg p-2.5 text-center"
                    style={{ background: "rgba(255,255,255,0.04)" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{m.value}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{m.label}</div>
                  </div>
                ))}
              </div>

              {/* Toggle */}
              <div className="flex items-center justify-between">
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                  Link: <span style={{ color: "#60a5fa" }}>{banner.link}</span>
                </span>
                <button
                  onClick={() => toggleStatus(banner.id)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors"
                  style={
                    banner.status === "active"
                      ? { background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }
                      : { background: "rgba(107,114,128,0.1)", color: "#9ca3af", border: "1px solid rgba(107,114,128,0.2)" }
                  }
                >
                  {banner.status === "active" ? <Eye size={12} /> : <EyeOff size={12} />}
                  {banner.status === "active" ? "Đang hiện" : "Tạm ẩn"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-full max-w-lg rounded-2xl p-6 space-y-4"
            style={{ background: "var(--color-cinema-surface)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>
              {editItem ? "Chỉnh sửa banner" : "Thêm banner mới"}
            </h2>

            {/* Image upload */}
            <div>
              <label style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", display: "block", marginBottom: 8 }}>Hình ảnh banner</label>
              <div className="flex items-center justify-center w-full h-32 rounded-xl border-2 border-dashed cursor-pointer transition-colors hover:border-red-500/50"
                style={{ borderColor: "rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.03)" }}>
                {editItem ? (
                  <img src={editItem.image} alt="" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-center">
                    <Upload size={24} style={{ color: "rgba(255,255,255,0.3)" }} />
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Click để tải ảnh lên</span>
                  </div>
                )}
              </div>
            </div>

            {[
              { label: "Tiêu đề banner", placeholder: "Nhập tiêu đề", defaultValue: editItem?.title || "" },
              { label: "URL liên kết", placeholder: "/movies/1 hoặc /promotions", defaultValue: editItem?.link || "" },
            ].map((f) => (
              <div key={f.label}>
                <label style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", display: "block", marginBottom: 6 }}>{f.label}</label>
                <input defaultValue={f.defaultValue} placeholder={f.placeholder}
                  style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 12px", color: "#fff", fontSize: 14, outline: "none" }} />
              </div>
            ))}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", display: "block", marginBottom: 6 }}>Vị trí hiển thị</label>
                <select defaultValue={editItem?.position || "home-hero"}
                  style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 12px", color: "#fff", fontSize: 13, outline: "none" }}>
                  <option value="home-hero">Trang chủ — Hero</option>
                  <option value="home-middle">Trang chủ — Giữa</option>
                  <option value="movie-list">Danh sách phim</option>
                  <option value="sidebar">Sidebar</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", display: "block", marginBottom: 6 }}>Thứ tự</label>
                <input type="number" defaultValue={editItem?.order || 1} min={1}
                  style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 12px", color: "#fff", fontSize: 14, outline: "none" }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Ngày bắt đầu", defaultValue: editItem?.startDate || "" },
                { label: "Ngày kết thúc", defaultValue: editItem?.endDate || "" },
              ].map((f) => (
                <div key={f.label}>
                  <label style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", display: "block", marginBottom: 6 }}>{f.label}</label>
                  <input type="text" placeholder="dd/mm/yyyy" defaultValue={f.defaultValue}
                    style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 12px", color: "#fff", fontSize: 14, outline: "none" }} />
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-lg"
                style={{ background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: 14 }}>
                Huỷ
              </button>
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
                style={{ background: "#e50914", color: "#fff", fontSize: 14 }}>
                {editItem ? "Lưu thay đổi" : "Tạo banner"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview modal */}
      {previewBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={() => setPreviewBanner(null)}>
          <div className="w-full max-w-3xl rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <img src={previewBanner.image} alt={previewBanner.title} className="w-full object-cover" style={{ maxHeight: 400 }} />
            <div className="p-4 flex items-center justify-between"
              style={{ background: "var(--color-cinema-surface)" }}>
              <div>
                <h3 style={{ color: "#fff", fontWeight: 600 }}>{previewBanner.title}</h3>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{positionLabel[previewBanner.position]}</p>
              </div>
              <button onClick={() => setPreviewBanner(null)}
                className="px-4 py-2 rounded-lg"
                style={{ background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: 13 }}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminBannersPage;