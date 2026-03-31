import { useEffect, useMemo, useRef, useState } from "react";
import {
  Eye,
  Image as ImageIcon,
  MoreVertical,
  Pencil,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { makeId } from "../../components/staff/staffUtils.js";
import { StaffCenteredModalShell } from "../../components/staff/StaffModalShell.jsx";
import StaffSuccessToast from "../../components/staff/StaffSuccessToast.jsx";
import StaffConfirmModal from "../../components/staff/StaffConfirmModal.jsx";

const MOCK_BANNERS = [
  {
    id: "b1",
    title: "Banner Hành Trình Vũ Trụ",
    link: "/movies/2",
    placement: "hero",
    placementLabel: "Trang chủ — Hero",
    order: 1,
    startDate: "2026-03-01",
    endDate: "2026-03-31",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80",
    status: "active",
    views: 48200,
    clicks: 2840,
    ctr: 5.9,
  },
  {
    id: "b2",
    title: "Khuyến mãi Thứ 4 Vui Vẻ",
    link: "/promotions",
    placement: "hero",
    placementLabel: "Trang chủ — Hero",
    order: 2,
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1600&q=80",
    status: "active",
    views: 32100,
    clicks: 1560,
    ctr: 4.9,
  },
  {
    id: "b3",
    title: "Flash Sale Vé VIP",
    link: "/promotions",
    placement: "movie-list",
    placementLabel: "Danh sách phim",
    order: 1,
    startDate: "2026-03-15",
    endDate: "2026-03-20",
    image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1600&q=80",
    status: "active",
    views: 15400,
    clicks: 980,
    ctr: 6.3,
  },
  {
    id: "b4",
    title: "Combo Bắp Nước Ưu Đãi",
    link: "/promotions",
    placement: "middle",
    placementLabel: "Trang chủ — Giữa trang",
    order: 1,
    startDate: "2026-02-01",
    endDate: "2026-04-30",
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1600&q=80",
    status: "inactive",
    views: 8900,
    clicks: 420,
    ctr: 4.7,
  },
  {
    id: "b5",
    title: "Xem Phim Đêm Giá Sốc",
    link: "/movies",
    placement: "sidebar",
    placementLabel: "Sidebar",
    order: 1,
    startDate: "2026-03-10",
    endDate: "2026-04-10",
    image: "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?auto=format&fit=crop&w=1600&q=80",
    status: "active",
    views: 22050,
    clicks: 1105,
    ctr: 5.0,
  },
  {
    id: "b6",
    title: "Trải Nghiệm IMAX Cực Đỉnh",
    link: "/movies/3",
    placement: "hero",
    placementLabel: "Trang chủ — Hero",
    order: 3,
    startDate: "2026-03-05",
    endDate: "2026-04-05",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=80",
    status: "active",
    views: 12431,
    clicks: 850,
    ctr: 6.8,
  },
  {
    id: "b7",
    title: "Thành Viên Mới Tặng Bắp",
    link: "/promotions",
    placement: "movie-list",
    placementLabel: "Danh sách phim",
    order: 2,
    startDate: "2026-01-15",
    endDate: "2026-12-31",
    image: "https://images.unsplash.com/photo-1513106580091-1d82408b8cd6?auto=format&fit=crop&w=1600&q=80",
    status: "active",
    views: 45200,
    clicks: 3120,
    ctr: 6.9,
  },
  {
    id: "b8",
    title: "Phòng Chiếu Gold Class",
    link: "/cinemas",
    placement: "sidebar",
    placementLabel: "Sidebar",
    order: 2,
    startDate: "2026-02-20",
    endDate: "2026-05-20",
    image: "https://images.unsplash.com/photo-1502136969935-8d8eef54d77d?auto=format&fit=crop&w=1600&q=80",
    status: "active",
    views: 7800,
    clicks: 390,
    ctr: 5.0,
  },
];

const PLACEMENT_OPTIONS = [
  { value: "hero", label: "Trang chủ — Hero" },
  { value: "middle", label: "Trang chủ — Giữa trang" },
  { value: "movie-list", label: "Danh sách phim" },
  { value: "sidebar", label: "Sidebar" },
];

function formatDateDisplay(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

function EditBannerModal({
  banner,
  onCancel,
  onSave,
  title = "Thêm banner mới",
  submitLabel = "Tạo banner",
  mode = "add",
}) {
  const isAdd = mode === "add";
  const [errors, setErrors] = useState({});
  const imageRef = useRef(null);

  const [form, setForm] = useState(() => ({
    title: banner?.title || "",
    link: banner?.link || "",
    placement: banner?.placement || "hero",
    order: banner?.order || 1,
    startDate: banner?.startDate || "",
    endDate: banner?.endDate || "",
    image: banner?.image || "",
    status: banner?.status || "active",
  }));

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setForm((prev) => ({ ...prev, image: url }));
    }
  };

  const save = (e) => {
    e.preventDefault();
    const nextErrors = {};

    if (!form.image) nextErrors.image = "Vui lòng chọn hình ảnh";
    if (!form.title.trim()) nextErrors.title = "Vui lòng nhập tiêu đề";
    if (!form.link.trim()) nextErrors.link = "Vui lòng nhập link";
    if (!form.startDate) nextErrors.startDate = "Vui lòng chọn ngày bắt đầu";
    if (!form.endDate) nextErrors.endDate = "Vui lòng chọn ngày kết thúc";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const selectedPlacement = PLACEMENT_OPTIONS.find((p) => p.value === form.placement);

    const updated = {
      ...banner,
      ...form,
      placementLabel: selectedPlacement?.label || form.placement,
      views: banner?.views || 0,
      clicks: banner?.clicks || 0,
      ctr: banner?.ctr || 0,
      id: banner?.id || makeId(),
    };
    onSave(updated);
  };

  const inputBase =
    "mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900/40 px-3 py-2 text-sm text-white outline-none transition focus:border-cinema-primary";
  const labelBase = "text-xs font-semibold text-zinc-400";
  const errorText = "mt-1 text-xs font-semibold text-red-500";

  return (
    <StaffCenteredModalShell
      title={title}
      onClose={onCancel}
      maxWidthClassName="max-w-xl"
    >
      <form onSubmit={save} className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
          <div>
            <label className={labelBase}>Hình ảnh banner</label>
            <div
              onClick={() => imageRef.current?.click()}
              className={[
                "mt-1.5 relative flex aspect-[21/9] w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-all hover:border-cinema-primary/50 hover:bg-zinc-900/60",
                errors.image
                  ? "border-red-500/50 bg-red-500/5"
                  : "border-zinc-700 bg-zinc-900/40",
              ].join(" ")}
            >
              {form.image ? (
                <>
                  <img
                    src={form.image}
                    alt="Banner"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-6 w-6 text-white" />
                      <span className="text-xs font-bold text-white">
                        Thay đổi ảnh
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3 p-6 text-center">
                  <div className="rounded-full bg-zinc-800/50 p-3">
                    <Upload className="h-6 w-6 text-zinc-400" />
                  </div>
                  <div className="text-sm font-semibold text-zinc-400">
                    Click để tải ảnh lên
                  </div>
                </div>
              )}
              <input
                ref={imageRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            {errors.image ? <div className={errorText}>{errors.image}</div> : null}
          </div>

          <div>
            <label className={labelBase}>Tiêu đề banner</label>
            <input
              className={[inputBase, errors.title ? "border-red-500" : ""].join(" ")}
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="Nhập tiêu đề"
            />
            {errors.title ? <div className={errorText}>{errors.title}</div> : null}
          </div>

          <div>
            <label className={labelBase}>URL liên kết</label>
            <input
              className={[inputBase, errors.link ? "border-red-500" : ""].join(" ")}
              value={form.link}
              onChange={(e) => setForm((p) => ({ ...p, link: e.target.value }))}
              placeholder="/movies/1 hoặc /promotions"
            />
            {errors.link ? <div className={errorText}>{errors.link}</div> : null}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelBase}>Vị trí hiển thị</label>
              <select
                className={inputBase}
                value={form.placement}
                onChange={(e) => setForm((p) => ({ ...p, placement: e.target.value }))}
              >
                {PLACEMENT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelBase}>Thứ tự</label>
              <input
                type="number"
                className={inputBase}
                value={form.order}
                onChange={(e) => setForm((p) => ({ ...p, order: Number(e.target.value) }))}
                min="1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelBase}>Ngày bắt đầu</label>
              <input
                type="date"
                className={[inputBase, errors.startDate ? "border-red-500" : ""].join(
                  " "
                )}
                value={form.startDate}
                onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
              />
              {errors.startDate ? (
                <div className={errorText}>{errors.startDate}</div>
              ) : null}
            </div>
            <div>
              <label className={labelBase}>Ngày kết thúc</label>
              <input
                type="date"
                className={[inputBase, errors.endDate ? "border-red-500" : ""].join(
                  " "
                )}
                value={form.endDate}
                onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
              />
              {errors.endDate ? (
                <div className={errorText}>{errors.endDate}</div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="shrink-0 pt-6">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="h-11 rounded-xl border border-zinc-700 bg-zinc-900/40 text-sm font-semibold text-zinc-200 hover:bg-zinc-900"
            >
              Huỷ
            </button>
            <button
              type="submit"
              className="h-11 rounded-xl bg-red-600 text-sm font-semibold text-white hover:bg-red-500"
            >
              {submitLabel}
            </button>
          </div>
        </div>
      </form>
    </StaffCenteredModalShell>
  );
}

function ViewBannerModal({ banner, onClose }) {
  if (!banner) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-xl overflow-hidden rounded-[24px] border border-zinc-700 bg-[#12121A] shadow-2xl opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-[21/9] w-full bg-zinc-900 border-b border-zinc-700/50">
          {banner.image ? (
            <img
              src={banner.image}
              alt={banner.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-zinc-700">
              <ImageIcon className="h-16 w-16 opacity-10" />
            </div>
          )}
        </div>
        <div className="flex items-center justify-between bg-[#08080A] p-6 opacity-100 relative z-20">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">{banner.title}</h3>
            <p className="text-xs text-zinc-400 font-medium">{banner.placementLabel}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-zinc-700 bg-zinc-800 px-6 py-2 text-xs font-bold text-white transition hover:bg-zinc-700 active:scale-95"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, colorClass }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-zinc-700/80 bg-zinc-900/30 p-5">
      <div className={["h-8 w-1.5 rounded-full", colorClass].join(" ")} />
      <div>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-sm font-medium text-zinc-400">{label}</div>
      </div>
    </div>
  );
}

function BannerCard({ banner, onEdit, onDelete, onToggleStatus, onView }) {
  const isActive = banner.status === "active";

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-zinc-700 bg-[#1A1A24] transition-all hover:border-zinc-700 hover:shadow-xl hover:shadow-black/20">
      <div className="relative w-full overflow-hidden bg-zinc-900" style={{ height: 0, paddingBottom: "42.85%" }}>
        <div className="absolute inset-0">
          {banner.image ? (
            <img
              src={banner.image}
              alt={banner.title}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
                const fallback = e.target.parentElement.querySelector(".image-fallback");
                if (fallback) fallback.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className={[
              "image-fallback absolute inset-0 items-center justify-center bg-zinc-800 text-zinc-400",
              banner.image ? "hidden" : "flex",
            ].join(" ")}
          >
            <ImageIcon className="h-10 w-10 opacity-20" />
          </div>
          <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/60 to-transparent p-3">
            <div className="flex items-center justify-between">
              <div
                className={[
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold",
                  isActive
                    ? "bg-green-500 text-white"
                    : "bg-zinc-600 text-white",
                ].join(" ")}
              >
                <div className="h-1.5 w-1.5 rounded-full bg-white" />
                {isActive ? "Hoạt động" : "Tạm dừng"}
              </div>
              <div className="rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-md ring-1 ring-white/10">
                {banner.placementLabel}
              </div>
            </div>
          </div>
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 rounded-md bg-black/50 px-2 py-0.5 text-[10px] font-bold text-white/90 backdrop-blur-md ring-1 ring-white/5">
            <MoreVertical className="h-3 w-3" /> #{banner.order}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-white">{banner.title}</h3>
            <p className="mt-1 text-xs text-zinc-400">
              {formatDateDisplay(banner.startDate)} &rarr;{" "}
              {formatDateDisplay(banner.endDate)}
            </p>
          </div>
          <div className="flex items-center gap-1.5 pt-1">
            <button
              onClick={onView}
              className="p-1.5 text-zinc-400 hover:text-white"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={onEdit}
              className="p-1.5 text-blue-500 hover:text-blue-400"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 text-red-500 hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-zinc-900/50 p-3 text-center">
            <div className="font-bold text-white">
              {banner.views.toLocaleString("vi-VN")}
            </div>
            <div className="text-[11px] font-medium text-zinc-400">Lượt xem</div>
          </div>
          <div className="rounded-xl bg-zinc-900/50 p-3 text-center">
            <div className="font-bold text-white">
              {banner.clicks.toLocaleString("vi-VN")}
            </div>
            <div className="text-[11px] font-medium text-zinc-400">Lượt click</div>
          </div>
          <div className="rounded-xl bg-zinc-900/50 p-3 text-center">
            <div className="font-bold text-white">{banner.ctr}%</div>
            <div className="text-[11px] font-medium text-zinc-400">CTR</div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-zinc-700/80 pt-4">
          <div className="text-xs text-zinc-400">
            Link: <span className="font-medium text-blue-400">{banner.link}</span>
          </div>
          <button
            onClick={onToggleStatus}
            className={[
              "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
              isActive
                ? "border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20"
                : "border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700",
            ].join(" ")}
          >
            <Eye className="h-3.5 w-3.5" />
            {isActive ? "Đang hiện" : "Hiện lại"}
          </button>
        </div>
      </div>
    </div>
  );
}

function StaffBannersPage() {
  const [banners, setBanners] = useState(MOCK_BANNERS);
  const [tab, setTab] = useState("all");
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = null;
      }
    };
  }, []);

  const showSuccess = (message) => {
    setToast({ message });
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const closeEdit = () => setEditing(null);
  const closeDelete = () => setConfirmDelete(null);
  const closeAdd = () => setAdding(false);

  const onSave = (updated) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === updated.id ? updated : b))
    );
    closeEdit();
    showSuccess("Cập nhật banner thành công");
  };

  const onAdd = (created) => {
    setBanners((prev) => [created, ...prev]);
    closeAdd();
    showSuccess("Tạo banner thành công");
  };

  const onDelete = (id) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
    closeDelete();
    showSuccess("Xoá banner thành công");
  };

  const onToggleStatus = (id) => {
    setBanners((prev) =>
      prev.map((b) =>
        b.id === id
          ? { ...b, status: b.status === "active" ? "inactive" : "active" }
          : b
      )
    );
  };

  const filteredBanners = useMemo(() => {
    if (tab === "all") return banners;
    return banners.filter((b) => b.placement === tab);
  }, [banners, tab]);

  const stats = useMemo(() => {
    const total = banners.length;
    const active = banners.filter((b) => b.status === "active").length;
    const views = banners.reduce((acc, b) => acc + b.views, 0);
    const clicks = banners.reduce((acc, b) => acc + b.clicks, 0);
    return { total, active, views, clicks };
  }, [banners]);

  return (
    <div className="space-y-6">
      <StaffSuccessToast message={toast?.message} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Banner quảng cáo
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Quản lý banner hiển thị trên hệ thống
          </p>
        </div>

        <button
          type="button"
          onClick={() => setAdding(true)}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-500"
        >
          <Plus className="h-4 w-4" />
          Thêm banner
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Tổng banner"
          value={stats.total}
          colorClass="bg-purple-500"
        />
        <StatCard
          label="Đang hoạt động"
          value={stats.active}
          colorClass="bg-green-500"
        />
        <StatCard
          label="Tổng lượt xem"
          value={stats.views.toLocaleString("vi-VN")}
          colorClass="bg-cyan-500"
        />
        <StatCard
          label="Tổng lượt click"
          value={stats.clicks.toLocaleString("vi-VN")}
          colorClass="bg-amber-500"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {[
          { label: "Tất cả", value: "all" },
          { label: "Hero", value: "hero" },
          { label: "Giữa trang", value: "middle" },
          { label: "Danh sách phim", value: "movie-list" },
          { label: "Sidebar", value: "sidebar" },
        ].map((t) => {
          const active = tab === t.value;
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => setTab(t.value)}
              className={[
                "rounded-full px-5 py-2.5 text-sm font-semibold transition",
                active
                  ? "bg-red-600 text-white"
                  : "bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 hover:text-white",
              ].join(" ")}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredBanners.map((banner) => (
          <BannerCard
            key={banner.id}
            banner={banner}
            onView={() => setViewing(banner)}
            onEdit={() => setEditing(banner)}
            onDelete={() => setConfirmDelete(banner)}
            onToggleStatus={() => onToggleStatus(banner.id)}
          />
        ))}
        {filteredBanners.length === 0 && (
          <div className="col-span-full py-12 text-center text-zinc-400">
            Không có banner nào ở mục này.
          </div>
        )}
      </div>

      {editing ? (
        <EditBannerModal
          banner={editing}
          onCancel={closeEdit}
          onSave={onSave}
          title="Chỉnh sửa banner"
          submitLabel="Lưu thay đổi"
          mode="edit"
        />
      ) : null}

      {viewing ? (
        <ViewBannerModal
          banner={viewing}
          onClose={() => setViewing(null)}
        />
      ) : null}

      {adding ? (
        <EditBannerModal
          onCancel={closeAdd}
          onSave={onAdd}
          title="Thêm banner mới"
          submitLabel="Tạo banner"
          mode="add"
        />
      ) : null}

      {confirmDelete ? (
        <StaffConfirmModal
          shell="centered"
          headerTitle="Xác nhận xoá"
          title={confirmDelete.title}
          onCancel={closeDelete}
          onConfirm={() => onDelete(confirmDelete.id)}
          cancelLabel="Huỷ"
          confirmLabel="Xoá banner"
          maxWidthClassName="max-w-md"
          buttonRadiusClassName="rounded-xl"
        >
          <p className="text-sm text-zinc-300">
            Bạn chắc chắn muốn xoá banner{" "}
            <span className="font-semibold text-white">
              {confirmDelete.title}
            </span>
            ? Hành động này không thể hoàn tác.
          </p>
        </StaffConfirmModal>
      ) : null}
    </div>
  );
}

export default StaffBannersPage;
