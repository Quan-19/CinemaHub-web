import { X, FileText, Calendar, User } from "lucide-react";
import { renderArticleContent } from "../../../utils/articleContent";

const formatDate = (value) => {
  if (!value) return "---";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "---";
  return parsed.toLocaleDateString("vi-VN");
};

export default function ArticlePreviewModal({ show, item, onClose }) {
  if (!show || !item) return null;

  const contentHtml = renderArticleContent(item.content || "");

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="w-full max-w-5xl bg-cinema-surface rounded-2xl border border-white/10 shadow-2xl">
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <FileText size={20} className="text-emerald-400" />
            Xem bài viết
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            title="Đóng"
          >
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            <header className="relative pb-8">
              <h1 className="text-white text-3xl md:text-4xl font-black">
                {item.title}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-zinc-400">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {formatDate(item.publish_date)}
                </span>
                {item.author ? (
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {item.author}
                  </span>
                ) : null}
              </div>
            </header>

            <section>
              <div
                className={`grid gap-8 ${
                  item.image ? "lg:grid-cols-[360px_1fr]" : ""
                }`}
              >
                {item.image ? (
                  <div className="w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/70 self-start">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-auto"
                    />
                  </div>
                ) : null}

                <div className="space-y-6">
                  {item.summary ? (
                    <p className="text-zinc-300 text-base sm:text-lg">
                      {item.summary}
                    </p>
                  ) : null}

                  <div
                    className="article-richtext leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: contentHtml }}
                  />
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="flex-1 h-10 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-gray-300 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
