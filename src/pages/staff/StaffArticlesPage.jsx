import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Image as ImageIcon,
  FileText,
  Star,
  Heart,
  Monitor,
  Ticket,
  Smartphone,
  Calendar,
  Eye,
} from "lucide-react";
import { makeId } from "../../components/staff/staffUtils.js";
import { StaffCenteredModalShell } from "../../components/staff/StaffModalShell.jsx";
import StaffSuccessToast from "../../components/staff/StaffSuccessToast.jsx";
import StaffConfirmModal from "../../components/staff/StaffConfirmModal.jsx";

const CATEGORY_STYLES = {
  news: { label: "Tin tức", colorClass: "text-[#3AB0FF] bg-[#3AB0FF]/10" },
  review: { label: "Đánh giá", colorClass: "text-[#FFB344] bg-[#FFB344]/10" },
  promotion: { label: "Khuyến mãi", colorClass: "text-[#00E676] bg-[#00E676]/10" },
  event: { label: "Sự kiện", colorClass: "text-[#B388FF] bg-[#B388FF]/10" },
};

const CATEGORIES = [
  { value: "news", label: "Tin tức" },
  { value: "review", label: "Đánh giá" },
  { value: "promotion", label: "Khuyến mãi" },
  { value: "event", label: "Sự kiện" },
];

const STATUS_OPTIONS = [
  { value: "published", label: "Đã đăng" },
  { value: "draft", label: "Bản nháp" },
];

const MOCK_ARTICLES = [
  {
    id: "a1",
    title: "Top 10 phim chiếu rạp không thể bỏ lỡ tháng 3/2026",
    slug: "/blog/top-10-phim-thang-3-2026",
    category: "news",
    author: "Nguyễn An",
    publishDate: "2026-03-01",
    views: 12450,
    status: "published",
    summary: "Danh sách 10 bộ phim chiếu rạp đáng xem nhất trong tháng 3 tới.",
    iconType: "clapper",
  },
  {
    id: "a2",
    title: "Review: Biệt Đội Chiến Thần - Màn trình diễn mãn nhãn",
    slug: "/blog/review-biet-doi-chien-than",
    category: "review",
    author: "Trần Bình",
    publishDate: "2026-02-20",
    views: 8920,
    status: "published",
    summary: "Đánh giá chi tiết về siêu bom tấn hành động mới nhất của năm.",
    iconType: "star",
  },
  {
    id: "a3",
    title: "Ưu đãi đặc biệt Valentine - Xem phim giảm 20%",
    slug: "/blog/uu-dai-valentine-2026",
    category: "promotion",
    author: "Marketing",
    publishDate: "2026-02-13",
    views: 15800,
    status: "published",
    summary: "Chương trình khuyến mãi đặc biệt nhân dịp Lễ Tình Nhân 14/2.",
    iconType: "heart",
  },
  {
    id: "a4",
    title: "EbizCinema ra mắt công nghệ ScreenX tại Hà Nội",
    slug: "/blog/ebizcinema-ra-mat-screenx-ha-noi",
    category: "news",
    author: "Nguyễn An",
    publishDate: "2026-02-25",
    views: 6780,
    status: "published",
    summary: "Trải nghiệm điện ảnh 270 độ lần đầu tiên xuất hiện tại Hà Nội.",
    iconType: "monitor",
  },
  {
    id: "a5",
    title: "Lễ hội phim Việt Nam 2026 - Những tác phẩm đáng mong đợi",
    slug: "/blog/le-hoi-phim-viet-2026",
    category: "event",
    author: "Lê Cường",
    publishDate: "",
    views: 0,
    status: "draft",
    summary: "Điểm qua những bộ phim nổi bật sắp tranh giải tại Liên hoan phim.",
    iconType: "masks",
  },
  {
    id: "a6",
    title: "Hướng dẫn đặt vé online trên EbizCinema",
    slug: "/blog/huong-dan-dat-ve-online",
    category: "news",
    author: "Support Team",
    publishDate: "2026-01-15",
    views: 22300,
    status: "published",
    summary: "Các bước đơn giản để mua vé xem phim và bắp nước trực tuyến.",
    iconType: "mobile",
  },
];

function getArticleIcon(type) {
  switch (type) {
    case "star":
      return <Star className="h-5 w-5 text-yellow-400 fill-current" />;
    case "heart":
      return <Heart className="h-5 w-5 text-pink-500 fill-current" />;
    case "monitor":
      return <Monitor className="h-5 w-5 text-blue-400" />;
    case "masks":
      return <Ticket className="h-5 w-5 text-purple-400" />;
    case "mobile":
      return <Smartphone className="h-5 w-5 text-indigo-400" />;
    case "clapper":
    default:
      return <FileText className="h-5 w-5 text-indigo-300 fill-indigo-300/30" />;
  }
}

function formatDateDisplay(dateStr) {
  if (!dateStr) return "—";
  return dateStr;
}

function EditArticleModal({
  article,
  onCancel,
  onSave,
  title = "Tạo bài viết mới",
  submitLabel = "Đăng bài",
}) {
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState(() => ({
    title: article?.title || "",
    category: article?.category || "news",
    author: article?.author || "",
    summary: article?.summary || "",
    status: article?.status || "draft",
  }));

  const save = (e) => {
    e.preventDefault();
    const nextErrors = {};

    if (!form.title.trim()) nextErrors.title = "Vui lòng nhập tiêu đề";
    if (!form.author.trim()) nextErrors.author = "Vui lòng nhập tác giả";
    if (!form.summary.trim()) nextErrors.summary = "Vui lòng nhập tóm tắt";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const slug = `/blog/${form.title
      .toLowerCase()
      .replace(/ /g, "-")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9-]/g, "")}`;

    const updated = {
      ...article,
      ...form,
      slug: article?.slug || slug,
      publishDate: form.status === "published" && !article?.publishDate
        ? new Date().toISOString().split("T")[0]
        : article?.publishDate || "",
      views: article?.views || 0,
      iconType: article?.iconType || "clapper",
      id: article?.id || makeId(),
    };
    onSave(updated);
  };

  const inputBase =
    "mt-1.5 w-full rounded-xl border border-zinc-700 bg-zinc-900/50 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-red-500 focus:bg-zinc-900";
  const labelBase = "text-sm font-semibold text-zinc-300";
  const errorText = "mt-1.5 text-xs font-semibold text-red-500";

  return (
    <StaffCenteredModalShell
      title={title}
      onClose={onCancel}
      maxWidthClassName="max-w-2xl"
    >
      <form onSubmit={save} className="flex flex-col gap-5">
        <div>
          <label className={labelBase}>Tiêu đề bài viết</label>
          <input
            className={[inputBase, errors.title ? "border-red-500" : ""].join(" ")}
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="Nhập tiêu đề"
          />
          {errors.title ? <div className={errorText}>{errors.title}</div> : null}
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className={labelBase}>Danh mục</label>
            <select
              className={inputBase}
              value={form.category}
              onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
            >
              {CATEGORIES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelBase}>Tác giả</label>
            <input
              className={[inputBase, errors.author ? "border-red-500" : ""].join(" ")}
              value={form.author}
              onChange={(e) => setForm((p) => ({ ...p, author: e.target.value }))}
              placeholder="Tên tác giả"
            />
            {errors.author ? <div className={errorText}>{errors.author}</div> : null}
          </div>
        </div>

        <div>
          <label className={labelBase}>Tóm tắt</label>
          <textarea
            className={[inputBase, "min-h-[120px] resize-none", errors.summary ? "border-red-500" : ""].join(" ")}
            value={form.summary}
            onChange={(e) => setForm((p) => ({ ...p, summary: e.target.value }))}
            placeholder="Nhập nội dung tóm tắt..."
          />
          {errors.summary ? <div className={errorText}>{errors.summary}</div> : null}
        </div>

        <div>
          <label className={labelBase}>Trạng thái</label>
          <select
            className={inputBase}
            value={form.status}
            onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex h-12 items-center justify-center rounded-xl bg-zinc-800/80 text-sm font-semibold text-white transition hover:bg-zinc-700"
          >
            Huỷ
          </button>
          <button
            type="submit"
            className="flex h-12 items-center justify-center rounded-xl bg-red-600 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-500"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </StaffCenteredModalShell>
  );
}

function StatCard({ label, value, colorClass }) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-zinc-700/80 bg-zinc-900/30 p-5 p-6 transition-colors hover:border-zinc-700">
      <div className={["text-3xl font-bold", colorClass].join(" ")}>{value}</div>
      <div className="mt-2 text-sm font-medium text-zinc-400">{label}</div>
    </div>
  );
}

export default function StaffArticlesPage() {
  const [articles, setArticles] = useState(MOCK_ARTICLES);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const showToast = (message) => {
    setToast({ message });
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToast(null), 3000);
  };

  const closeEdit = () => setEditing(null);
  const closeDelete = () => setConfirmDelete(null);
  const closeAdd = () => setAdding(false);

  const onSave = (updated) => {
    setArticles((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    closeEdit();
    showToast("Cập nhật bài viết thành công");
  };

  const onAdd = (created) => {
    setArticles((prev) => [created, ...prev]);
    closeAdd();
    showToast("Đã tạo bài viết mới");
  };

  const onDelete = (id) => {
    setArticles((prev) => prev.filter((a) => a.id !== id));
    closeDelete();
    showToast("Đã xoá bài viết");
  };

  const filteredArticles = useMemo(() => {
    return articles.filter((a) => {
      if (categoryFilter !== "all" && a.category !== categoryFilter) return false;
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (search) {
        const query = search.toLowerCase();
        return (
          a.title.toLowerCase().includes(query) ||
          a.author.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [articles, search, categoryFilter, statusFilter]);

  const stats = useMemo(() => {
    return {
      news: articles.filter((a) => a.category === "news").length,
      review: articles.filter((a) => a.category === "review").length,
      promotion: articles.filter((a) => a.category === "promotion").length,
      event: articles.filter((a) => a.category === "event").length,
    };
  }, [articles]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <StaffSuccessToast message={toast?.message} />

      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Quản lý bài viết
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Tin tức, đánh giá phim và sự kiện
          </p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-500"
        >
          <Plus className="h-4 w-4" />
          Viết bài
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Tin tức" value={stats.news} colorClass="text-[#3AB0FF]" />
        <StatCard label="Đánh giá" value={stats.review} colorClass="text-[#FFB344]" />
        <StatCard label="Khuyến mãi" value={stats.promotion} colorClass="text-[#00E676]" />
        <StatCard label="Sự kiện" value={stats.event} colorClass="text-[#B388FF]" />
      </div>

      <div className="flex flex-col gap-3 rounded-2xl bg-[#12121A] p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Tìm tiêu đề, tác giả..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full rounded-xl border border-zinc-700 bg-zinc-900/50 pl-10 pr-4 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-cinema-primary"
          />
        </div>
        <div className="flex shrink-0 items-center md:gap-3">
          <select
            className="h-11 rounded-xl border border-zinc-700 bg-zinc-900/50 px-4 text-sm text-white outline-none transition focus:border-cinema-primary"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">Tất cả danh mục</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <select
            className="ml-3 h-11 rounded-xl border border-zinc-700 bg-zinc-900/50 px-4 text-sm text-white outline-none transition focus:border-cinema-primary"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="published">Đã đăng</option>
            <option value="draft">Bản nháp</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-700 bg-[#12121A]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="border-b border-zinc-700 bg-zinc-900/30 text-xs font-semibold text-zinc-400">
              <tr>
                <th className="px-5 py-4 font-semibold">Bài viết</th>
                <th className="px-5 py-4 font-semibold">Danh mục</th>
                <th className="px-5 py-4 font-semibold">Tác giả</th>
                <th className="px-5 py-4 font-semibold">Ngày đăng</th>
                <th className="px-5 py-4 font-semibold">Lượt xem</th>
                <th className="px-5 py-4 font-semibold">Trạng thái</th>
                <th className="px-5 py-4 text-right font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {filteredArticles.map((article) => {
                const catStyle = CATEGORY_STYLES[article.category] || CATEGORY_STYLES.news;
                const isPub = article.status === "published";

                return (
                  <tr key={article.id} className="transition-colors hover:bg-zinc-800/20">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
                          {getArticleIcon(article.iconType)}
                        </div>
                        <div>
                          <div className="font-semibold text-white line-clamp-1 break-all">
                            {article.title}
                          </div>
                          <div className="mt-0.5 text-xs text-zinc-400">
                            {article.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={[
                          "inline-flex tracking-wide items-center rounded-md px-2 py-1 text-[11px] font-bold",
                          catStyle.colorClass,
                        ].join(" ")}
                      >
                        {catStyle.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-medium text-zinc-300">
                      {article.author}
                    </td>
                    <td className="px-5 py-4 text-zinc-400 flex items-center gap-1.5 h-16">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDateDisplay(article.publishDate)}
                    </td>
                    <td className="px-5 py-4 text-zinc-300 font-medium">
                      <div className="flex items-center gap-1.5 h-full">
                        <Eye className="h-3.5 w-3.5 text-zinc-400" />
                        {article.views > 0 ? article.views.toLocaleString("vi-VN") : "—"}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={[
                          "inline-flex font-bold text-[11px] tracking-wide",
                          isPub ? "text-[#00E676]" : "text-[#FFB344]",
                        ].join(" ")}
                      >
                        {isPub ? "Đã đăng" : "Bản nháp"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => setEditing(article)}
                          className="text-blue-500 hover:text-blue-400 p-1"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(article)}
                          className="text-red-500 hover:text-red-400 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredArticles.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-zinc-400">
                    Không tìm thấy bài viết nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {adding && (
        <EditArticleModal onCancel={closeAdd} onSave={onAdd} />
      )}

      {editing && (
        <EditArticleModal
          article={editing}
          onCancel={closeEdit}
          onSave={onSave}
          title="Chỉnh sửa bài viết"
          submitLabel="Lưu thay đổi"
        />
      )}

      {confirmDelete && (
        <StaffConfirmModal
          shell="centered"
          headerTitle="Xác nhận xoá"
          title={confirmDelete.title}
          onCancel={closeDelete}
          onConfirm={() => onDelete(confirmDelete.id)}
          cancelLabel="Huỷ"
          confirmLabel="Xoá bài viết"
          maxWidthClassName="max-w-md"
          buttonRadiusClassName="rounded-xl"
        >
          <p className="text-sm text-zinc-300">
            Bạn chắc chắn muốn xoá bài viết{" "}
            <span className="font-semibold text-white">
              {confirmDelete.title}
            </span>
            ? Hành động này không thể hoàn tác.
          </p>
        </StaffConfirmModal>
      )}
    </div>
  );
}
