// PromotionsPage.jsx
import {
  Clock, Copy, Check, Info, Gift, MapPin, AlertCircle,
  Search, Filter, ChevronRight
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export const PromotionsPage = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedPromoId, setCopiedPromoId] = useState(null);
  const [expandedPromos, setExpandedPromos] = useState(() => new Set());
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchPromotions = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          "http://localhost:5000/api/promotions?scope=public"
        );

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const payload = await res.json();
        const data = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
            ? payload
            : [];

        // Format data
        const parseArrayField = (value) => {
          if (Array.isArray(value)) return value;
          if (typeof value === "string") {
            try {
              return JSON.parse(value || "[]");
            } catch {
              return [];
            }
          }
          return [];
        };

        const formatted = data.map((promo, index) => {
          const discountType = promo.discount_type || "percent";
          const rawPercent = Number(promo.discount_percent ?? 0);
          const rawValue = Number(promo.discount_value ?? 0);
          let discountPercent = Number.isFinite(rawPercent) ? rawPercent : 0;
          let discountValue = Number.isFinite(rawValue) ? rawValue : 0;

          if (discountType === "percent" && discountPercent <= 0 && discountValue > 0) {
            discountPercent = discountValue;
          }

          if ((discountType === "value" || discountType === "fixed") && discountValue <= 0 && discountPercent > 0) {
            discountValue = discountPercent;
          }

          return {
            promotion_id: promo.promotion_id || promo.id || null,
            client_id: `${promo.promotion_id || promo.id || promo.code || "promo"}-${index}`,
            title: promo.title || "",
            description: promo.description || "",
            code: promo.code || "",
            image: promo.image || "",
            discount_percent: discountPercent,
            discount_value: discountValue,
            discount_type: discountType,
            min_order: promo.min_order || 0,
            start_date: promo.start_date,
            end_date: promo.end_date,
            status: promo.status || "active",
            cinema_id: promo.cinema_id || null,
            cinema_name: promo.cinema_name || null,
            apply_days: parseArrayField(promo.apply_days),
            apply_seat_types: parseArrayField(promo.apply_seat_types),
            usage_limit: promo.usage_limit || 0,
            used_count: promo.used_count || 0,
          };
        });

        setPromotions(formatted);
      } catch (err) {
        console.error("Error loading promotions:", err);
        setError("Không thể tải dữ liệu khuyến mãi. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, []);

  const handleCopy = (promoId, code) => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(code).catch(() => { });
    }
    setCopiedPromoId(promoId);
    setTimeout(() => setCopiedPromoId(null), 2000);
  };

  const toggleExpand = (id) => {
    setExpandedPromos((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getDiscountDisplay = (promo) => {
    if (promo.discount_type === "percent") {
      const pct = promo.discount_percent || promo.discount_value || 0;
      return `-${pct}%`;
    } else if (promo.discount_type === "value" || promo.discount_type === "fixed") {
      const value = promo.discount_value || promo.discount_percent || 0;
      return `-${value.toLocaleString()}đ`;
    }
    return "Ưu đãi";
  };

  const getDayName = (day) => {
    const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    return days[day] || day;
  };

  const formatDate = (value) => {
    if (!value) return "Không rõ";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Không rõ";
    return date.toLocaleDateString("vi-VN");
  };

  const filteredPromotions = promotions.filter(promo => {
    // Tab filter
    if (activeTab === "system" && promo.cinema_id) return false;
    if (activeTab === "cinema" && !promo.cinema_id) return false;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inTitle = promo.title.toLowerCase().includes(q);
      const inCinema = promo.cinema_name?.toLowerCase().includes(q);
      const inCode = promo.code.toLowerCase().includes(q);
      return inTitle || inCinema || inCode;
    }

    return true;
  });

  // JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": filteredPromotions.map((promo, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Offer",
        "name": promo.title,
        "description": promo.description,
        "priceCurrency": "VND",
        "validFrom": promo.start_date,
        "validThrough": promo.end_date,
        "seller": {
          "@type": "Organization",
          "name": "CinemaHub"
        }
      }
    }))
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cinema-bg">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-zinc-400 font-medium animate-pulse">Đang chuẩn bị ưu đãi đặc biệt...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cinema-bg">
        <div className="text-center p-8 glass-card max-w-md">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-white text-xl font-bold mb-3">Rất tiếc!</h2>
          <p className="text-zinc-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="cinema-btn-primary w-full"
          >
            Thử lại ngay
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-cinema-bg pb-20 overflow-x-hidden">
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>

      {/* HERO SECTION */}
      <header className="relative py-12 md:py-16 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[80%] bg-red-600/10 blur-[120px] rounded-full rotate-12"></div>
          <div className="absolute -bottom-[20%] -right-[10%] w-[40%] h-[60%] bg-blue-600/10 blur-[100px] rounded-full -rotate-12"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-white text-3xl md:text-5xl font-black mb-4 tracking-tight animate-fade-slide-up">
              SĂN <span className="text-gradient">ƯU ĐÃI</span><br />
              NHẬN NIỀM VUI
            </h1>
            <p className="text-zinc-400 text-base md:text-lg leading-relaxed mb-8 animate-fade-slide-up" style={{ animationDelay: "0.1s" }}>
              Hàng ngàn mã giảm giá và chương trình khuyến mãi hấp dẫn đang chờ đón bạn.
              Đặt vé ngay để tận hưởng trải nghiệm điện ảnh tuyệt vời nhất!
            </p>

            <div className="max-w-xl mx-auto relative animate-fade-slide-up" style={{ animationDelay: "0.2s" }}>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="text"
                placeholder="Tìm tên phim, rạp hoặc mã..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all backdrop-blur-md text-sm sm:text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      {/* FILTER TABS */}
      <nav className="sticky top-0 z-40 bg-cinema-bg/80 backdrop-blur-md border-y border-white/5 py-3 md:py-4 mb-8 md:mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-start sm:justify-center gap-2 md:gap-4 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 md:px-5 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap ${activeTab === "all"
                ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setActiveTab("system")}
              className={`px-4 md:px-5 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap ${activeTab === "system"
                ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
            >
              Toàn hệ thống
            </button>
            <button
              onClick={() => setActiveTab("cinema")}
              className={`px-4 md:px-5 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap ${activeTab === "cinema"
                ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
            >
              Tại rạp
            </button>
          </div>
        </div>
      </nav>

      {/* CONTENT GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        {filteredPromotions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 items-start">
            {filteredPromotions.map((promo, idx) => (
              <article
                key={promo.client_id}
                className="group relative glass-card overflow-hidden hover:translate-y-[-8px] transition-all duration-500 animate-scale-in"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                {/* Promo Image & Overlay */}
                <div className="relative h-40 sm:h-44 overflow-hidden">
                  {promo.image ? (
                    <img
                      src={promo.image}
                      alt={`Khuyến mãi: ${promo.title}`}
                      title={promo.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                      <Gift className="w-12 h-12 text-zinc-700 group-hover:text-red-500/50 transition-colors" />
                    </div>
                  )}

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 z-20">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${promo.cinema_id ? "bg-blue-600 text-white" : "bg-red-600 text-white"
                      }`}>
                      {promo.cinema_id ? "Tại rạp" : "Toàn hệ thống"}
                    </span>
                  </div>

                  {/* Discount Badge */}
                  <div className="absolute bottom-4 right-4 z-20">
                    <div className="bg-white text-black px-4 py-2 rounded-2xl font-black text-lg shadow-xl">
                      {getDiscountDisplay(promo)}
                    </div>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-60"></div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5">
                  {promo.cinema_name && (
                    <div className="flex items-center gap-1.5 text-blue-400 text-xs font-bold mb-1.5">
                      <MapPin className="w-3 h-3" />
                      {promo.cinema_name}
                    </div>
                  )}

                  <h2 className="text-white text-lg font-bold mb-2 line-clamp-1 group-hover:text-red-400 transition-colors">
                    {promo.title}
                  </h2>

                  <p className="text-zinc-400 text-xs mb-4 line-clamp-2 leading-relaxed">
                    {promo.description}
                  </p>

                  <div className="flex items-center justify-between gap-4 mb-4 pt-4 border-t border-white/5">
                    <div className="flex flex-col gap-1">
                      <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Hết hạn</span>
                      <div className="flex items-center gap-1.5 text-zinc-300 text-sm font-medium">
                        <Clock className="w-4 h-4 text-zinc-500" />
                        {formatDate(promo.end_date)}
                      </div>
                    </div>

                    {promo.min_order > 0 && (
                      <div className="flex flex-col gap-1 text-right">
                        <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Tối thiểu</span>
                        <div className="text-zinc-300 text-sm font-bold">
                          {promo.min_order.toLocaleString()}đ
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Copy Code Area */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 bg-black/40 border border-white/10 rounded-xl p-2.5 flex items-center justify-between group/code hover:border-red-500/30 transition-colors">
                      <span className="text-white font-mono font-bold tracking-widest text-sm">
                        {promo.code}
                      </span>
                      <button
                        onClick={() => handleCopy(promo.client_id, promo.code)}
                        className="text-zinc-500 hover:text-white transition-all duration-300 relative"
                      >
                        <AnimatePresence mode="wait">
                          {copiedPromoId === promo.client_id ? (
                            <motion.div
                              key="check"
                              initial={{ scale: 0.5, opacity: 0, rotate: -45 }}
                              animate={{ scale: 1.2, opacity: 1, rotate: 0 }}
                              exit={{ scale: 0.5, opacity: 0 }}
                              transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            >
                              <Check className="w-4 h-4 text-green-500" />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="copy"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            >
                              <Copy className="w-4 h-4 hover:scale-110 transition-transform" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleExpand(promo.client_id)}
                    className="w-full py-2.5 rounded-xl bg-white/5 text-zinc-300 text-xs sm:text-sm font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                  >
                    {expandedPromos.has(promo.client_id) ? "Thu gọn" : "Xem điều kiện"}
                    <ChevronRight className={`w-4 h-4 transition-transform ${expandedPromos.has(promo.client_id) ? "-rotate-90" : "rotate-0"}`} />
                  </button>

                  {/* Expanded Content */}
                  {expandedPromos.has(promo.client_id) && (
                    <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/5 animate-fade-slide-up">
                      <h3 className="text-white text-xs font-bold mb-3 uppercase tracking-wider flex items-center gap-2">
                        <Info className="w-3.5 h-3.5 text-blue-400" />
                        Thông tin khuyến mãi
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-300 mb-4">
                        <div className="flex items-center justify-between gap-3 bg-black/30 rounded-lg px-3 py-2">
                          <span className="text-zinc-500">Mức ưu đãi</span>
                          <span className="font-bold text-white">{getDiscountDisplay(promo)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3 bg-black/30 rounded-lg px-3 py-2">
                          <span className="text-zinc-500">Áp dụng tại</span>
                          <span className="font-bold text-white">{promo.cinema_name || "Toàn hệ thống"}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3 bg-black/30 rounded-lg px-3 py-2">
                          <span className="text-zinc-500">Thời gian</span>
                          <span className="font-bold text-white">{formatDate(promo.start_date)} - {formatDate(promo.end_date)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3 bg-black/30 rounded-lg px-3 py-2">
                          <span className="text-zinc-500">Tối thiểu</span>
                          <span className="font-bold text-white">{promo.min_order > 0 ? `${promo.min_order.toLocaleString()}đ` : "Không yêu cầu"}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3 bg-black/30 rounded-lg px-3 py-2">
                          <span className="text-zinc-500">Giới hạn</span>
                          <span className="font-bold text-white">{promo.usage_limit > 0 ? `${promo.used_count}/${promo.usage_limit}` : "Không giới hạn"}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3 bg-black/30 rounded-lg px-3 py-2">
                          <span className="text-zinc-500">Trạng thái</span>
                          <span className={`font-bold ${promo.status === "active" ? "text-green-400" : "text-zinc-400"}`}>{promo.status === "active" ? "Đang hoạt động" : "Tạm dừng"}</span>
                        </div>
                      </div>

                      <h3 className="text-white text-xs font-bold mb-3 uppercase tracking-wider flex items-center gap-2">
                        <Info className="w-3.5 h-3.5 text-red-500" />
                        Điều khoản áp dụng
                      </h3>
                      <ul className="space-y-2">
                        {promo.apply_days.length > 0 && promo.apply_days.length < 7 ? (
                          <li className="text-zinc-400 text-xs flex gap-2">
                            <span className="text-red-500">•</span>
                            Chỉ áp dụng các ngày: {promo.apply_days.map(d => getDayName(d)).join(", ")}
                          </li>
                        ) : (
                          <li className="text-zinc-400 text-xs flex gap-2">
                            <span className="text-red-500">•</span>
                            Áp dụng tất cả các ngày trong tuần.
                          </li>
                        )}
                        {promo.apply_seat_types.length > 0 ? (
                          <li className="text-zinc-400 text-xs flex gap-2">
                            <span className="text-red-500">•</span>
                            Loại ghế: {promo.apply_seat_types.join(", ")}
                          </li>
                        ) : (
                          <li className="text-zinc-400 text-xs flex gap-2">
                            <span className="text-red-500">•</span>
                            Áp dụng cho tất cả loại ghế.
                          </li>
                        )}
                        {promo.usage_limit > 0 ? (
                          <li className="text-zinc-400 text-xs flex gap-2">
                            <span className="text-red-500">•</span>
                            Lượt sử dụng: {promo.used_count}/{promo.usage_limit}
                          </li>
                        ) : null}
                        <li className="text-zinc-400 text-xs flex gap-2">
                          <span className="text-red-500">•</span>
                          Mỗi tài khoản chỉ được sử dụng 1 lần cho chương trình này.
                        </li>
                      </ul>

                      <Link
                        to="/movies"
                        title={`Đặt vé và áp dụng ưu đãi ${promo.title}`}
                        className="cinema-btn-primary w-full mt-6 py-2.5 text-xs flex justify-center items-center"
                      >
                        Đặt vé ngay
                      </Link>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 glass-card max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 animate-float">
              <Filter className="w-10 h-10 text-zinc-700" />
            </div>
            <h2 className="text-white text-2xl font-bold mb-4">Không tìm thấy ưu đãi</h2>
            <p className="text-zinc-400 mb-8 max-w-md mx-auto leading-relaxed">
              Rất tiếc, chúng tôi không tìm thấy khuyến mãi nào phù hợp với yêu cầu của bạn.
              Hãy thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác.
            </p>
            <button
              onClick={() => { setSearchQuery(""); setActiveTab("all"); }}
              className="text-red-500 font-bold hover:text-red-400 transition-colors"
            >
              Xóa tất cả bộ lọc
            </button>
          </div>
        )}
      </section>

    </main>
  );
};

export default PromotionsPage;