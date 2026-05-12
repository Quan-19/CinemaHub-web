import { FileText, CheckCircle, Clock, Pencil } from "lucide-react";

export default function ArticlesStats({ articles }) {
  const toDateKey = (value) => {
    if (!value) return "";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "";
    return parsed.toISOString().split("T")[0];
  };

  const today = toDateKey(new Date());

  const publishedCount = articles.filter((a) => {
    const publishDate = toDateKey(a.publish_date);
    return (
      a.status === "published" && (!publishDate || publishDate <= today)
    );
  }).length;

  const scheduledCount = articles.filter((a) => {
    const publishDate = toDateKey(a.publish_date);
    return a.status === "published" && publishDate && publishDate > today;
  }).length;

  const draftCount = articles.filter((a) => a.status === "draft").length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-cinema-surface p-4 rounded-xl border border-white/10 hover:bg-white/5 transition-colors">
        <div className="flex items-center justify-between">
          <FileText size={20} className="text-purple-400" />
          <span className="text-xs text-gray-500">Tổng số</span>
        </div>
        <div className="text-2xl font-bold text-white mt-2">
          {articles.length}
        </div>
        <div className="text-xs text-gray-400">bài viết</div>
      </div>

      <div className="bg-cinema-surface p-4 rounded-xl border border-white/10 hover:bg-white/5 transition-colors">
        <div className="flex items-center justify-between">
          <CheckCircle size={20} className="text-green-400" />
          <span className="text-xs text-gray-500">Đã đăng</span>
        </div>
        <div className="text-2xl font-bold text-green-400 mt-2">
          {publishedCount}
        </div>
        <div className="text-xs text-gray-400">đang hiển thị</div>
      </div>

      <div className="bg-cinema-surface p-4 rounded-xl border border-white/10 hover:bg-white/5 transition-colors">
        <div className="flex items-center justify-between">
          <Clock size={20} className="text-yellow-400" />
          <span className="text-xs text-gray-500">Hẹn giờ</span>
        </div>
        <div className="text-2xl font-bold text-yellow-400 mt-2">
          {scheduledCount}
        </div>
        <div className="text-xs text-gray-400">sắp hiển thị</div>
      </div>

      <div className="bg-cinema-surface p-4 rounded-xl border border-white/10 hover:bg-white/5 transition-colors">
        <div className="flex items-center justify-between">
          <Pencil size={20} className="text-blue-400" />
          <span className="text-xs text-gray-500">Bản nháp</span>
        </div>
        <div className="text-2xl font-bold text-blue-400 mt-2">
          {draftCount}
        </div>
        <div className="text-xs text-gray-400">chưa đăng</div>
      </div>
    </div>
  );
}
