import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, User, AlertCircle } from "lucide-react";
import { renderArticleContent } from "../utils/articleContent";

const formatDate = (value) => {
  if (!value) return "Không rõ";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Không rõ";
  return date.toLocaleDateString("vi-VN");
};


export default function ArticleDetailPage() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:5000/api/articles/${id}`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const payload = await res.json();
        const data = payload?.data || null;
        setArticle(data);
      } catch (err) {
        console.error("Error loading article:", err);
        setError("Không thể tải bài viết. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  const contentHtml = useMemo(
    () => renderArticleContent(article?.content || ""),
    [article?.content]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cinema-bg">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-zinc-400 font-medium animate-pulse">Đang tải bài viết...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cinema-bg">
        <div className="text-center p-8 glass-card max-w-md">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-white text-xl font-bold mb-3">Rất tiếc!</h2>
          <p className="text-zinc-300 text-base mb-6">{error || "Bài viết không tồn tại."}</p>
          <Link to="/promotions" className="cinema-btn-primary w-full inline-flex justify-center">
            Quay lại ưu đãi
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-cinema-bg pb-20">
      <header className="relative py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <Link
            to="/promotions"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Tin moi & uu dai
          </Link>

          <h1 className="text-white text-3xl md:text-4xl font-black mt-4 mb-3">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="flex items-center gap-2 text-zinc-300">
              <Calendar className="w-4 h-4 text-zinc-500" />
              <strong className="text-white">Ngày đăng:</strong> {formatDate(article.publish_date)}
            </span>
            {article.author ? (
              <span className="flex items-center gap-2 text-zinc-300">
                <User className="w-4 h-4 text-zinc-500" />
                <strong className="text-white">Tác giả:</strong> {article.author}
              </span>
            ) : null}
          </div>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div
          className={`grid gap-8 ${
            article.image ? "lg:grid-cols-[360px_1fr]" : ""
          }`}
        >
          {article.image ? (
            <div className="w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/70 self-start">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-auto"
              />
            </div>
          ) : null}

          <div className="space-y-6">
            {article.summary ? (
              <p className="text-zinc-400 text-sm font-normal leading-relaxed">
                {article.summary}
              </p>
            ) : null}

            <div
              className="article-richtext leading-relaxed"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
