import { Tag, Clock, Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";

export const PromotionsPage = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);

  // ========== FETCH PROMOTIONS FROM API (Code 1) ==========
  useEffect(() => {
    const fetchPromotions = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          "http://localhost:5000/api/promotions?scope=public"
        );
        const payload = await res.json();
        const data = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
          ? payload
          : [];

        // Format dữ liệu từ API để tương thích với UI
        const formatted = data.map((promo) => ({
          id: promo.promotion_id || promo.id,
          title: promo.title || "",
          description: promo.description || "",
          discount: promo.discount_percent || promo.discount,
          discount_percent: promo.discount_percent,
          code: promo.code || "",
          image:
            promo.image || "https://via.placeholder.com/400x200?text=Promotion",
          expiry: promo.end_date
            ? new Date(promo.end_date).toLocaleDateString("vi-VN")
            : promo.expiry || "Đang cập nhật",
          end_date: promo.end_date,
        }));

        setPromotions(formatted);
      } catch (err) {
        console.error("Error loading promotions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, []);

  const handleCopy = (code) => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  // ========== LOADING STATE ==========
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--color-cinema-bg)" }}
      >
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Đang tải khuyến mãi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--color-cinema-bg)" }}>
      {/* HEADER - Giữ nguyên từ cả 2 code */}
      <div
        className="py-10 border-b border-zinc-700"
        style={{
          background:
            "linear-gradient(to bottom, var(--color-cinema-surface), var(--color-cinema-bg))",
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h1
            className="text-white mb-1"
            style={{ fontSize: "2rem", fontWeight: 800 }}
          >
            Khuyến mãi
          </h1>
          <p className="text-zinc-400 text-sm">Ưu đãi hấp dẫn dành cho bạn</p>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* EMPTY STATE - Từ Code 1 */}
        {promotions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎁</div>
            <p className="text-zinc-400 mb-2">Chưa có khuyến mãi</p>
            <p className="text-zinc-400 text-sm">
              Hãy quay lại sau để xem ưu đãi mới nhất
            </p>
          </div>
        )}

        {/* PROMOTIONS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promo) => (
            <div
              key={promo.id}
              className="group rounded-2xl overflow-hidden border border-zinc-700 hover:border-zinc-700 transition-all hover:-translate-y-1 duration-300"
              style={{ background: "var(--color-cinema-surface)" }}
            >
              {/* Image Section */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={promo.image}
                  alt={promo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Discount Badge */}
                <div
                  className="absolute top-3 right-3 px-3 py-1.5 rounded-lg text-white text-sm font-bold shadow-lg"
                  style={{ background: "var(--color-cinema-primary)" }}
                >
                  -{promo.discount_percent || promo.discount}%
                </div>
              </div>

              {/* Content Section */}
              <div className="p-5">
                <h3 className="text-white mb-2 line-clamp-1 text-base font-bold group-hover:text-red-400 transition-colors">
                  {promo.title}
                </h3>

                <p className="text-zinc-400 text-sm mb-4 line-clamp-2 leading-relaxed">
                  {promo.description}
                </p>

                {/* Expiry Date */}
                <div className="flex items-center gap-2 mb-3 text-zinc-400 text-xs">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Hạn sử dụng: {promo.expiry}</span>
                </div>

                {/* Promo Code & Copy Button */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-zinc-900 border border-dashed border-zinc-600 rounded-xl px-4 py-2.5 flex items-center gap-2 group-hover:border-red-500/50 transition-colors">
                    <Tag className="w-4 h-4 text-red-500 shrink-0" />
                    <span className="text-white text-sm tracking-wider font-bold">
                      {promo.code}
                    </span>
                  </div>

                  <button
                    onClick={() => handleCopy(promo.code)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      copied === promo.code
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-zinc-700 hover:bg-zinc-600"
                    }`}
                  >
                    {copied === promo.code ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : (
                      <Copy className="w-4 h-4 text-white" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Optional: Show more promotions message */}
        {promotions.length > 0 && promotions.length >= 6 && (
          <div className="text-center mt-8">
            <p className="text-zinc-400 text-sm">
              Còn nhiều ưu đãi hấp dẫn khác đang chờ bạn!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromotionsPage;
