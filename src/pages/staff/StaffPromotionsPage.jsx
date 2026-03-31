import { useEffect, useMemo, useRef, useState } from "react";
import {
  Calendar,
  Check,
  Copy,
  Pencil,
  Plus,
  Search,
  Tag,
  Trash2,
} from "lucide-react";

import {
  ddmmyyyyToInput,
  inputToDdmmyyyy,
  makeId,
} from "../../components/staff/staffUtils.js";
import { StaffScrollableModalShell } from "../../components/staff/StaffModalShell.jsx";
import StaffIconButton from "../../components/staff/StaffIconButton.jsx";
import StaffConfirmModal from "../../components/staff/StaffConfirmModal.jsx";

const DAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

const PROMOTION_TYPES = [
  { label: "Phần trăm", value: "percent" },
  { label: "Giảm tiền", value: "fixed" },
];

const EXTRA_PROMOTIONS = [
  {
    id: "wed30",
    name: "Thứ 4 vui vẻ - Giảm 30%",
    description:
      "Mua vé xem phim vào thứ 4 hàng tuần, giảm ngay 30% cho tất cả các suất chiếu.",
    type: "percent",
    discountValue: 30,
    minOrder: 0,
    code: "WED30",
    usageLimit: 1000,
    usedCount: 342,
    startDate: "01/01/2026",
    endDate: "31/12/2026",
    days: [3],
    status: "active",
    image:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "couple2026",
    name: "Combo Cặp Đôi Siêu Tiết Kiệm",
    description:
      "2 vé + 2 bắp rang + 2 nước. Tiết kiệm đến 50.000đ so với mua lẻ.",
    type: "fixed",
    discountValue: 50000,
    minOrder: 0,
    code: "COUPLE2026",
    usageLimit: 500,
    usedCount: 178,
    startDate: "01/01/2026",
    endDate: "30/06/2026",
    days: [0, 1, 2, 3, 4, 5, 6],
    status: "active",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "cgv10years",
    name: "Kỷ niệm 10 năm - Giảm 50%",
    description: "Sinh nhật CGV - Giảm 50% cho vé đặt online trong tuần này.",
    type: "percent",
    discountValue: 50,
    minOrder: 0,
    code: "CGV10YEARS",
    usageLimit: 200,
    usedCount: 156,
    startDate: "04/03/2026",
    endDate: "10/03/2026",
    days: [2, 3, 4, 5, 6],
    status: "expired",
    image:
      "https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "promo30",
    name: "Ưu đãi vé đôi - 30K",
    description:
      "Tặng 30.000đ khi mua combo vé đôi áp dụng cho một số suất chiếu.",
    type: "fixed",
    discountValue: 30000,
    minOrder: 120000,
    code: "PROMO30",
    usageLimit: 300,
    usedCount: 120,
    startDate: "01/02/2026",
    endDate: "30/04/2026",
    days: [5, 6],
    status: "paused",
    image:
      "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=1600&q=80",
  },
];

function formatMoneyVnd(value) {
  const n = Number(value || 0);
  return `${n.toLocaleString("vi-VN")}đ`;
}

function formatDiscount(promo) {
  if (promo.type === "percent") return `${Number(promo.discountValue || 0)}%`;
  const amount = Number(promo.discountValue || 0);
  if (amount >= 1000) return `${Math.round(amount / 1000)}K`;
  return formatMoneyVnd(amount);
}

function StatusPill({ status }) {
  const config = {
    active: {
      label: "Đang hoạt động",
      cls: "bg-emerald-500/20 text-emerald-300",
    },
    paused: { label: "Tạm dừng", cls: "bg-amber-500/20 text-amber-300" },
    expired: { label: "Hết hạn", cls: "bg-zinc-500/15 text-zinc-300" },
  };
  const item = config[status] || config.active;
  return (
    <span
      className={[
        "rounded-full px-3 py-1 text-[11px] font-semibold",
        item.cls,
      ].join(" ")}
    >
      {item.label}
    </span>
  );
}

function StatMini({ accentClassName, value, label }) {
  return (
    <div className="cinema-surface p-4 sm:p-5">
      <div className="flex items-center gap-4">
        <div
          className={["h-12 w-1.5 rounded-full", accentClassName].join(" ")}
        />
        <div>
          <div className="text-2xl font-bold tracking-tight sm:text-3xl">
            {value}
          </div>
          <div className="mt-1 text-sm text-zinc-400">{label}</div>
        </div>
      </div>
    </div>
  );
}

function PromotionFormModal({
  promotion,
  title,
  submitLabel,
  onCancel,
  onSubmit,
}) {
  const startDateRef = useRef(null);
  const endDateRef = useRef(null);

  const [form, setForm] = useState(() => {
    const p = promotion;
    return {
      name: p.name || "",
      description: p.description || "",
      type: p.type || "percent",
      discountValue: p.discountValue ?? 0,
      minOrder: p.minOrder ?? 0,
      code: p.code || "",
      usageLimit: p.usageLimit ?? 0,
      startDate: ddmmyyyyToInput(p.startDate) || "",
      endDate: ddmmyyyyToInput(p.endDate) || "",
      days: Array.isArray(p.days) ? [...p.days] : [],
    };
  });

  const toggleDay = (dayIndex) => {
    setForm((prev) => {
      const has = prev.days.includes(dayIndex);
      return {
        ...prev,
        days: has
          ? prev.days.filter((d) => d !== dayIndex)
          : [...prev.days, dayIndex],
      };
    });
  };

  const submit = (e) => {
    e.preventDefault();
    onSubmit({
      ...promotion,
      name: form.name.trim(),
      description: form.description.trim(),
      type: form.type,
      discountValue: Number(form.discountValue || 0),
      minOrder: Number(form.minOrder || 0),
      code: form.code.trim().toUpperCase(),
      usageLimit: Number(form.usageLimit || 0),
      startDate: inputToDdmmyyyy(form.startDate),
      endDate: inputToDdmmyyyy(form.endDate),
      days: [...form.days].sort((a, b) => a - b),
    });
  };

  const inputCls =
    "mt-1 w-full rounded-2xl border border-zinc-700 bg-zinc-900/40 px-3 py-2.5 text-sm text-white outline-none transition focus:border-cinema-primary";
  const labelCls = "text-[11px] font-semibold text-zinc-400";
  const openPicker = (ref) => {
    const el = ref?.current;
    if (!el) return;
    if (typeof el.showPicker === "function") {
      el.showPicker();
      return;
    }
    el.focus();
  };

  return (
    <StaffScrollableModalShell
      title={title}
      onClose={onCancel}
      maxWidthClassName="max-w-lg"
    >
      <form onSubmit={submit} className="space-y-3">
        <div>
          <div className={labelCls}>Tên khuyến mãi</div>
          <input
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Nhập tên khuyến mãi"
            className={inputCls}
          />
        </div>

        <div>
          <div className={labelCls}>Mô tả</div>
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm((p) => ({ ...p, description: e.target.value }))
            }
            placeholder="Mô tả khuyến mãi..."
            rows={2}
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <div>
            <div className={labelCls}>Loại KM</div>
            <select
              value={form.type}
              onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
              className={inputCls}
            >
              {PROMOTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className={labelCls}>Mức giảm (%)</div>
            <input
              type="number"
              value={form.discountValue}
              onChange={(e) =>
                setForm((p) => ({ ...p, discountValue: e.target.value }))
              }
              className={inputCls}
            />
          </div>
          <div>
            <div className={labelCls}>Đơn tối thiểu (đ)</div>
            <input
              type="number"
              value={form.minOrder}
              onChange={(e) =>
                setForm((p) => ({ ...p, minOrder: e.target.value }))
              }
              className={inputCls}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div>
            <div className={labelCls}>Mã code</div>
            <input
              value={form.code}
              onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
              placeholder="VD: PROMO30"
              className={inputCls}
            />
          </div>
          <div>
            <div className={labelCls}>Giới hạn lượt dùng</div>
            <input
              type="number"
              value={form.usageLimit}
              onChange={(e) =>
                setForm((p) => ({ ...p, usageLimit: e.target.value }))
              }
              className={inputCls}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div>
            <div className={labelCls}>Ngày bắt đầu</div>
            <div className="relative">
              <input
                ref={startDateRef}
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, startDate: e.target.value }))
                }
                className={[inputCls, "pr-12"].join(" ")}
              />
              <button
                type="button"
                onClick={() => openPicker(startDateRef)}
                aria-label="Chọn ngày bắt đầu"
                className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/40 text-zinc-200 hover:bg-zinc-900"
              >
                <Calendar className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div>
            <div className={labelCls}>Ngày kết thúc</div>
            <div className="relative">
              <input
                ref={endDateRef}
                type="date"
                value={form.endDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, endDate: e.target.value }))
                }
                className={[inputCls, "pr-12"].join(" ")}
              />
              <button
                type="button"
                onClick={() => openPicker(endDateRef)}
                aria-label="Chọn ngày kết thúc"
                className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/40 text-zinc-200 hover:bg-zinc-900"
              >
                <Calendar className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div>
          <div className={labelCls}>Áp dụng các ngày</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {DAY_LABELS.map((lbl, idx) => {
              const active = form.days.includes(idx);
              return (
                <button
                  key={lbl}
                  type="button"
                  onClick={() => toggleDay(idx)}
                  className={[
                    "h-9 min-w-10 rounded-2xl px-3 text-xs font-semibold transition",
                    active
                      ? "bg-cinema-primary text-white"
                      : "border border-zinc-700 bg-zinc-900/30 text-zinc-200 hover:bg-zinc-900",
                  ].join(" ")}
                >
                  {lbl}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="h-11 rounded-2xl border border-zinc-700 bg-zinc-900/40 text-sm font-semibold text-zinc-200 hover:bg-zinc-900"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="h-11 rounded-2xl bg-cinema-primary text-sm font-semibold text-white hover:opacity-95"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </StaffScrollableModalShell>
  );
}

function PromotionCard({ promo, onEdit, onDelete, onCopy, copied }) {
  const used = Number(promo.usedCount || 0);
  const limit = Math.max(0, Number(promo.usageLimit || 0));
  const pct = limit > 0 ? Math.round((used / limit) * 100) : 0;
  const safePct = Math.min(100, Math.max(0, pct));

  return (
    <div className="cinema-surface overflow-hidden">
      <div className="relative h-36 sm:h-40">
        <img
          src={promo.image}
          alt={promo.name}
          className="h-full w-full object-cover opacity-90"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cinema-bg/90 via-cinema-bg/30 to-transparent" />

        <div className="absolute left-4 top-6">
          <div className="text-4xl font-black tracking-tight sm:text-5xl">
            {formatDiscount(promo)}
          </div>
          <div className="mt-1 text-sm font-semibold text-zinc-300">
            {promo.type === "percent" ? "Phần trăm" : "Combo"}
          </div>
        </div>

        <div className="absolute right-4 top-4">
          <StatusPill status={promo.status} />
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-base font-semibold text-white">
              {promo.name}
            </div>
            <div className="mt-1 text-sm text-zinc-400 line-clamp-2">
              {promo.description}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <StaffIconButton label="Chỉnh sửa" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
            </StaffIconButton>
            <StaffIconButton label="Xóa" variant="danger" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </StaffIconButton>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 rounded-2xl border border-zinc-700 bg-zinc-900/30 px-3 py-2">
          <div className="flex min-w-0 items-center gap-2">
            <Tag className="h-4 w-4 text-amber-300" aria-hidden="true" />
            <div className="truncate text-sm font-semibold tracking-wide text-white">
              {promo.code}
            </div>
          </div>
          <button
            type="button"
            onClick={onCopy}
            aria-label="Copy"
            className={[
              "relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/40 text-zinc-200 transition-colors duration-200 hover:bg-zinc-900",
              copied ? "ring-2 ring-emerald-500/10" : "",
            ].join(" ")}
          >
            <span
              className={[
                "absolute inset-0 flex items-center justify-center transition-all duration-200",
                copied ? "scale-90 opacity-0" : "scale-100 opacity-100",
              ].join(" ")}
            >
              <Copy className="h-4 w-4" />
            </span>
            <span
              className={[
                "absolute inset-0 flex items-center justify-center transition-all duration-200",
                copied ? "scale-100 opacity-100" : "scale-90 opacity-0",
              ].join(" ")}
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30">
                <Check className="h-4 w-4" />
              </span>
            </span>
          </button>
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Đã sử dụng</span>
            <span>
              {used}/{limit} ({safePct}%)
            </span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-zinc-900">
            <div
              className="h-2 rounded-full bg-emerald-500"
              style={{ width: `${safePct}%` }}
            />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" aria-hidden="true" />
            <span>
              {promo.startDate} — {promo.endDate}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {DAY_LABELS.map((lbl, idx) => {
              const active =
                Array.isArray(promo.days) && promo.days.includes(idx);
              return (
                <span
                  key={lbl}
                  className={[
                    "text-[11px] font-semibold",
                    active ? "text-cinema-primary" : "text-zinc-400",
                  ].join(" ")}
                >
                  {lbl}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function StaffPromotionsPage() {
  const [promotions, setPromotions] = useState(() => [...EXTRA_PROMOTIONS]);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("all");
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const copiedTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current) {
        clearTimeout(copiedTimeoutRef.current);
        copiedTimeoutRef.current = null;
      }
    };
  }, []);

  const activeCount = useMemo(
    () => promotions.filter((p) => p.status === "active").length,
    [promotions]
  );

  const totalUses = useMemo(
    () => promotions.reduce((sum, p) => sum + Number(p.usedCount || 0), 0),
    [promotions]
  );

  const expiredCount = useMemo(
    () => promotions.filter((p) => p.status === "expired").length,
    [promotions]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return promotions.filter((p) => {
      if (tab !== "all" && p.status !== tab) return false;
      if (!q) return true;
      return (
        (p.name || "").toLowerCase().includes(q) ||
        (p.code || "").toLowerCase().includes(q)
      );
    });
  }, [promotions, query, tab]);

  const addTemplate = useMemo(() => {
    if (!adding) return null;
    return {
      id: makeId(),
      name: "",
      description: "",
      type: "percent",
      discountValue: 10,
      minOrder: 0,
      code: "",
      usageLimit: 100,
      usedCount: 0,
      startDate: "",
      endDate: "",
      days: [0, 1, 2, 3, 4, 5, 6],
      status: "active",
      image:
        "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=80",
    };
  }, [adding]);

  const tabs = [
    { label: "Tất cả", value: "all" },
    { label: "Đang hoạt động", value: "active" },
    { label: "Tạm dừng", value: "paused" },
    { label: "Hết hạn", value: "expired" },
  ];

  const copyCode = async (promoId, code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(promoId);
      if (copiedTimeoutRef.current) {
        clearTimeout(copiedTimeoutRef.current);
      }
      copiedTimeoutRef.current = setTimeout(() => {
        setCopiedId((current) => (current === promoId ? null : current));
      }, 5000);
    } catch {
      // ignore
    }
  };

  const onAdd = (created) => {
    setPromotions((prev) => [created, ...prev]);
    setAdding(false);
  };

  const onSave = (updated) => {
    setPromotions((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
    setEditing(null);
  };

  const onDelete = (id) => {
    setPromotions((prev) => prev.filter((p) => p.id !== id));
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Quản lý khuyến mãi</h1>
          <p className="mt-1 text-sm text-zinc-400">
            {activeCount} khuyến mãi đang chạy
          </p>
        </div>

        <button
          type="button"
          onClick={() => setAdding(true)}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-cinema-primary px-5 text-sm font-semibold text-white hover:opacity-95"
        >
          <Plus className="h-4 w-4" />
          Thêm khuyến mãi
        </button>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatMini
          accentClassName="bg-violet-500"
          value={promotions.length}
          label="Tổng KM"
        />
        <StatMini
          accentClassName="bg-emerald-500"
          value={activeCount}
          label="Đang hoạt động"
        />
        <StatMini
          accentClassName="bg-amber-400"
          value={totalUses}
          label="Lượt sử dụng"
        />
        <StatMini
          accentClassName="bg-zinc-500"
          value={expiredCount}
          label="Hết hạn"
        />
      </section>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm khuyến mãi, mã code..."
            className="w-full rounded-2xl border border-zinc-700 bg-zinc-900/60 py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-cinema-primary focus:bg-zinc-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          {tabs.map((t) => {
            const active = tab === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setTab(t.value)}
                className={[
                  "h-11 rounded-2xl px-5 text-sm font-semibold transition",
                  active
                    ? "bg-cinema-primary text-white"
                    : "border border-zinc-700 bg-zinc-900/30 text-zinc-200 hover:bg-zinc-900",
                ].join(" ")}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {filtered.map((promo) => (
          <PromotionCard
            key={promo.id}
            promo={promo}
            onEdit={() => setEditing(promo)}
            onDelete={() => setConfirmDelete(promo)}
            onCopy={() => copyCode(promo.id, promo.code)}
            copied={copiedId === promo.id}
          />
        ))}
      </section>

      {adding && addTemplate ? (
        <PromotionFormModal
          promotion={addTemplate}
          title="Thêm khuyến mãi mới"
          submitLabel="Thêm"
          onCancel={() => setAdding(false)}
          onSubmit={onAdd}
        />
      ) : null}

      {editing ? (
        <PromotionFormModal
          promotion={editing}
          title="Chỉnh sửa khuyến mãi"
          submitLabel="Lưu"
          onCancel={() => setEditing(null)}
          onSubmit={onSave}
        />
      ) : null}

      {confirmDelete ? (
        <StaffConfirmModal
          shell="scrollable"
          headerTitle="Xóa khuyến mãi"
          title={confirmDelete.name}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => onDelete(confirmDelete.id)}
          cancelLabel="Hủy"
          confirmLabel="Xóa"
          maxWidthClassName="max-w-md"
          buttonRadiusClassName="rounded-2xl"
        >
          <p className="text-sm text-zinc-300">
            Bạn có chắc chắn muốn xóa{" "}
            <span className="font-semibold text-white">
              {confirmDelete.name}
            </span>
            ?
          </p>
        </StaffConfirmModal>
      ) : null}
    </div>
  );
}

export default StaffPromotionsPage;
