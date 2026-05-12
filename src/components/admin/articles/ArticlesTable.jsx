import { Edit2, Trash2, Image as ImageIcon, Eye } from "lucide-react";
import { useState } from "react";

const CATEGORY_LABELS = {
  promotion: { label: "Khuyến mãi", color: "text-red-400", bg: "bg-red-400/10" },
  gift: { label: "Quà tặng", color: "text-emerald-400", bg: "bg-emerald-400/10" },
  news: { label: "Tin mới", color: "text-blue-400", bg: "bg-blue-400/10" },
  event: { label: "Sự kiện", color: "text-purple-400", bg: "bg-purple-400/10" },
};

export default function ArticlesTable({ articles, onEdit, onDelete, onView }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(articles.length / itemsPerPage));

  const paginatedData = articles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (date) => {
    if (!date) return "---";
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "---";
    return parsed.toLocaleDateString("vi-VN");
  };

  const toDateKey = (value) => {
    if (!value) return "";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "";
    return parsed.toISOString().split("T")[0];
  };

  const getStatusBadge = (article) => {
    const today = toDateKey(new Date());
    const publishDate = toDateKey(article.publish_date);
    if (article.status === "draft") {
      return { label: "Bản nháp", color: "text-gray-400", bg: "bg-gray-400/10" };
    }

    if (publishDate && publishDate > today) {
      return { label: "Hẹn giờ", color: "text-yellow-400", bg: "bg-yellow-400/10" };
    }

    return { label: "Đã đăng", color: "text-green-400", bg: "bg-green-400/10" };
  };

  const getCategoryBadge = (article) => {
    const raw = String(article.category || "promotion").toLowerCase();
    return CATEGORY_LABELS[raw] || CATEGORY_LABELS.promotion;
  };

  const truncateText = (value, maxLength = 60) => {
    if (!value) return "---";
    const text = String(value).trim();
    if (text.length <= maxLength) return text;
    return `${text.slice(0, Math.max(0, maxLength - 1))}…`;
  };

  return (
    <div className="bg-cinema-surface rounded-xl border border-white/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-[980px] w-full text-sm">
          <thead className="bg-cinema-bg text-gray-400 border-b border-white/10">
            <tr>
              <th className="p-4 text-left">Bài viết</th>
              <th className="p-4 text-left">Danh mục</th>
              <th className="p-4 text-left">Tác giả</th>
              <th className="p-4 text-left">Ngày đăng</th>
              <th className="p-4 text-left">Trạng thái</th>
              <th className="p-4 text-left">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item) => {
                const status = getStatusBadge(item);
                const category = getCategoryBadge(item);
                return (
                  <tr
                    key={item.article_id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-14 h-10 object-cover rounded-lg border border-white/10"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-14 h-10 rounded-lg border border-white/10 bg-zinc-900/60 flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-zinc-500" />
                          </div>
                        )}
                        <div>
                          <div
                            className="text-white font-medium line-clamp-2 max-w-[280px]"
                            title={item.title}
                          >
                            {truncateText(item.title, 60)}
                          </div>
                          <div className="text-xs text-zinc-500 line-clamp-1">
                            {item.summary || "Chưa có tóm tắt"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${category.color} ${category.bg}`}
                      >
                        {category.label}
                      </span>
                    </td>
                    <td className="p-4 text-zinc-300">
                      {item.author || "---"}
                    </td>
                    <td className="p-4 text-zinc-300">
                      {formatDate(item.publish_date)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${status.color} ${status.bg}`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => onView?.(item)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          title="Xem bài viết"
                        >
                          <Eye size={16} className="text-emerald-400" />
                        </button>
                        <button
                          onClick={() => onEdit(item)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={16} className="text-blue-400" />
                        </button>
                        <button
                          onClick={() => onDelete(item)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 size={16} className="text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-zinc-500">
                  Không có bài viết phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/10 text-sm text-zinc-400">
          <span>
            Trang {currentPage} / {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              className="px-3 py-1 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
