// PromotionsPage.jsx
import {
  Clock, Copy, Check, Info, Gift, MapPin, AlertCircle,
  Search, Filter, ChevronRight, FileText, Calendar, Tag,
  Ticket, Sparkles, TrendingUp, Share2, MousePointer2
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export const PromotionsPage = () => {
  const { user } = useAuth();
  const [promotions, setPromotions] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [copiedPromoId, setCopiedPromoId] = useState(null);
  const [expandedPromos, setExpandedPromos] = useState(() => new Set());
  const [error, setError] = useState(null);
  const [articlesError, setArticlesError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRef = useRef(null);

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

  useEffect(() => {
    // Scroll to section if hash exists in URL
    const hash = window.location.hash;
    if (hash) {
      const id = hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 500); // Small delay to ensure content is loaded
      }
    }
  }, [loading]);

  useEffect(() => {
    const fetchArticles = async () => {
      setArticlesLoading(true);
      setArticlesError(null);
      try {
        const res = await fetch(
          "http://localhost:5000/api/articles?scope=public"
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

        const formatted = data.map((article, index) => ({
          article_id: article.article_id || article.id || null,
          client_id: `${article.article_id || article.id || "article"}-${index}`,
          title: article.title || "",
          summary: article.summary || "",
          content: article.content || "",
          image: article.image || "",
          category: article.category || "promotion",
          author: article.author || "",
          status: article.status || "draft",
          publish_date: article.publish_date || null,
        }));

        setArticles(formatted);
      } catch (err) {
        console.error("Error loading articles:", err);
        setArticlesError("Không thể tải dữ liệu bài viết. Vui lòng thử lại sau.");
      } finally {
        setArticlesLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const handleCopy = (promoId, code) => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(code)
        .then(() => {
          toast.success("Đã sao chép mã ưu đãi!");
        })
        .catch(() => { 
          toast.error("Không thể sao chép mã.");
        });
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

  const ARTICLE_CATEGORIES = {
    promotion: { label: "Khuyến mãi", cls: "bg-red-500/90 text-white" },
    gift: { label: "Quà tặng", cls: "bg-emerald-500/90 text-white" },
    news: { label: "Tin mới", cls: "bg-blue-500/90 text-white" },
    event: { label: "Sự kiện", cls: "bg-purple-500/90 text-white" },
  };

  const getArticleCategory = (category) => {
    const key = String(category || "promotion").toLowerCase();
    return ARTICLE_CATEGORIES[key] || ARTICLE_CATEGORIES.promotion;
  };

  const filteredArticles = articles.filter((article) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const inTitle = article.title.toLowerCase().includes(q);
    const inSummary = article.summary.toLowerCase().includes(q);
    return inTitle || inSummary;
  });

  const filteredPromotions = promotions.filter(promo => {
    if (activeTab === "system" && promo.cinema_id) return false;
    if (activeTab === "cinema" && !promo.cinema_id) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inTitle = promo.title.toLowerCase().includes(q);
      const inCinema = promo.cinema_name?.toLowerCase().includes(q);
      const inCode = promo.code.toLowerCase().includes(q);
      return inTitle || inCinema || inCode;
    }

    return true;
  });

  // Structured Data for SEO
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
          <div className="w-16 h-16 border-4 border-cinema-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-zinc-400 text-sm font-medium animate-pulse">Đang tải vũ trụ ưu đãi...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cinema-bg">
        <div className="text-center p-8 glass-card max-w-md mx-4">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-white text-xl font-bold mb-3">Kết nối gián đoạn</h2>
          <p className="text-zinc-400 text-base mb-6">{error}</p>
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
    <main className="min-h-screen bg-cinema-bg pb-24 overflow-x-hidden">
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>

      {/* HERO SECTION - REFINED */}
      <header className="relative pt-20 pb-12 md:pt-28 md:pb-20 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-cinema-primary/10 blur-[120px] rounded-full"></div>
          <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-blue-600/5 blur-[100px] rounded-full"></div>
          <div className="absolute top-1/4 right-1/4 w-[30%] h-[30%] bg-cinema-gold/5 blur-[80px] rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-sm"
            >
              <Sparkles className="w-4 h-4 text-cinema-gold" />
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Ưu đãi độc quyền cho thành viên</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-white text-4xl md:text-7xl font-black mb-6 tracking-tight leading-[1.1]"
            >
              KHÁM PHÁ <span className="text-gradient">ƯU ĐÃI</span><br />
              <span className="text-zinc-500">PHẤN KHÍCH MỖI NGÀY</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Hàng ngàn mã giảm giá, quà tặng combo và chương trình hoàn tiền đang chờ đón bạn tại CinemaHub. Đừng bỏ lỡ!
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="max-w-2xl mx-auto relative group"
            >
              <div className="absolute inset-0 bg-cinema-primary/20 blur-2xl group-focus-within:bg-cinema-primary/30 transition-colors rounded-3xl"></div>
              <div className="relative flex items-center">
                <Search className="absolute left-5 w-5 h-5 text-zinc-500 group-focus-within:text-cinema-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Tìm kiếm ưu đãi, phim hoặc rạp..."
                  className="w-full bg-zinc-900/80 border border-white/10 rounded-2xl py-4 md:py-5 pl-14 pr-6 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-cinema-primary/50 focus:border-cinema-primary/50 transition-all backdrop-blur-xl text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* STICKY FILTER TABS */}
      <div className="sticky top-0 z-40 bg-cinema-bg/80 backdrop-blur-xl border-b border-white/5 py-4 mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-center gap-2 md:gap-4 overflow-x-auto no-scrollbar">
            {[
              { id: "all", label: "Tất cả", icon: TrendingUp },
              { id: "system", label: "Toàn hệ thống", icon: Sparkles },
              { id: "cinema", label: "Ưu đãi tại rạp", icon: MapPin },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap overflow-hidden group ${
                  activeTab === tab.id
                    ? "text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-cinema-primary shadow-lg shadow-cinema-primary/20"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <tab.icon className={`relative w-4 h-4 ${activeTab === tab.id ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"}`} />
                <span className="relative">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ARTICLES / NEWS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-20">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 bg-cinema-primary rounded-full"></div>
            <div>
              <h2 className="text-white text-2xl md:text-3xl font-black uppercase tracking-tight">Tin tức & Sự kiện</h2>
              <p className="text-zinc-500 text-sm">Cập nhật những chuyển động mới nhất từ CinemaHub</p>
            </div>
          </div>
          <Link to="/articles" className="text-zinc-400 hover:text-white text-sm font-bold flex items-center gap-1 group transition-colors">
            Xem tất cả <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {articlesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="aspect-[16/10] bg-white/5 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredArticles.slice(0, 3).map((article, idx) => {
              const category = getArticleCategory(article.category);
              return (
                <motion.div
                  key={article.client_id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group"
                >
                  <Link to={`/articles/${article.article_id || article.id}`} className="block">
                    <div className="relative aspect-[16/10] rounded-3xl overflow-hidden mb-5">
                      <img
                        src={article.image || "https://via.placeholder.com/800x500?text=CinemaHub+News"}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-cinema-bg via-transparent to-transparent opacity-60"></div>
                      <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider backdrop-blur-md ${category.cls}`}>
                          {category.label}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-zinc-500 text-xs font-bold">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(article.publish_date)}</span>
                        <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                        <span className="flex items-center gap-1"><MousePointer2 className="w-3 h-3" /> 5 phút đọc</span>
                      </div>
                      <h3 className="text-white text-xl font-bold leading-tight group-hover:text-cinema-primary transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-zinc-500 text-sm line-clamp-2 leading-relaxed">
                        {article.summary}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 glass-card rounded-3xl border-dashed border-white/10">
             <FileText className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
             <p className="text-zinc-500 font-medium">Hiện tại không có tin tức nào phù hợp.</p>
          </div>
        )}
      </section>

      {/* PROMOTIONS GRID - TICKET DESIGN */}
      <section id="promotions-list" className="max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 bg-cinema-gold rounded-full"></div>
            <div>
              <h2 className="text-white text-2xl md:text-3xl font-black uppercase tracking-tight">Mã Giảm Giá & Ưu Đãi</h2>
              <p className="text-zinc-500 text-sm">Lấy mã ngay để tận hưởng rạp phim chất lượng cao với giá hời</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-zinc-400 text-xs font-bold">
            <Filter className="w-3.5 h-3.5" />
            Hiển thị {filteredPromotions.length} kết quả
          </div>
        </div>

        {filteredPromotions.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {filteredPromotions.map((promo, idx) => (
              <motion.article
                key={promo.client_id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="group relative"
              >
                {/* TICKET STYLE CONTAINER */}
                <div className="relative flex flex-col md:flex-row h-auto rounded-3xl overflow-hidden bg-zinc-900/50 border border-white/5 backdrop-blur-md group-hover:border-cinema-primary/30 group-hover:bg-zinc-900/80 transition-all duration-500">
                  
                  {/* Left Side - Discount Badge */}
                  <div className="relative w-full md:w-32 h-24 md:h-auto shrink-0 flex items-center justify-center bg-zinc-800/30 overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '12px 12px' }}></div>
                    </div>
                    
                    <div className="relative z-10 flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-cinema-primary text-white shadow-xl rotate-[-5deg] group-hover:rotate-0 transition-transform duration-500">
                        <span className="text-[10px] font-black uppercase leading-none opacity-80">Giảm</span>
                        <span className="text-xl font-black leading-none">{getDiscountDisplay(promo).replace('-', '')}</span>
                    </div>
                  </div>

                  {/* Divider Dash (Horizontal on Desktop, Vertical on Mobile) */}
                  <div className="hidden md:flex flex-col items-center justify-center gap-2 px-1 relative">
                    <div className="absolute -top-3 w-6 h-6 bg-cinema-bg rounded-full border border-white/5"></div>
                    <div className="w-[1px] h-full border-l border-dashed border-white/20"></div>
                    <div className="absolute -bottom-3 w-6 h-6 bg-cinema-bg rounded-full border border-white/5"></div>
                  </div>

                  {/* Right Side - Content */}
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5 text-cinema-gold text-[10px] font-black uppercase tracking-widest">
                          {promo.cinema_id ? <><MapPin className="w-3 h-3" /> Tại rạp</> : <><Sparkles className="w-3 h-3" /> Toàn hệ thống</>}
                        </div>
                        <div className="flex items-center gap-1 text-zinc-500 text-xs font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDate(promo.end_date)}
                        </div>
                      </div>

                      <h3 className="text-white text-xl font-bold mb-2 group-hover:text-cinema-primary transition-colors">
                        {promo.title}
                      </h3>
                      <p className="text-zinc-400 text-sm line-clamp-2 mb-6">
                        {promo.description}
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Code and Copy */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-black/40 border border-white/5 rounded-2xl p-4 flex items-center justify-between group/code">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Mã ưu đãi</span>
                            <span className="text-white font-mono font-black tracking-[0.2em] text-lg">
                              {promo.code}
                            </span>
                          </div>
                          <button
                            onClick={() => handleCopy(promo.client_id, promo.code)}
                            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                              copiedPromoId === promo.client_id ? "bg-green-500/20 text-green-500" : "bg-white/5 text-zinc-400 hover:bg-cinema-primary hover:text-white"
                            }`}
                          >
                            <AnimatePresence mode="wait">
                              {copiedPromoId === promo.client_id ? (
                                <motion.div key="check" initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }}>
                                  <Check className="w-5 h-5" />
                                </motion.div>
                              ) : (
                                <motion.div key="copy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                  <Copy className="w-5 h-5" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </button>
                        </div>
                        
                        <button 
                          onClick={() => toggleExpand(promo.client_id)}
                          className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-400 hover:bg-white/10 hover:text-white transition-all shrink-0"
                          title="Xem điều kiện"
                        >
                          <Info className={`w-6 h-6 transition-transform ${expandedPromos.has(promo.client_id) ? "rotate-180 text-cinema-primary" : ""}`} />
                        </button>
                      </div>

                      {/* Expandable Info */}
                      <AnimatePresence>
                        {expandedPromos.has(promo.client_id) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-4 border-t border-white/5 space-y-4">
                               <div className="grid grid-cols-2 gap-3">
                                  <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                                    <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Đơn tối thiểu</span>
                                    <span className="text-white text-sm font-bold">{promo.min_order > 0 ? `${promo.min_order.toLocaleString()}đ` : "Mọi đơn hàng"}</span>
                                  </div>
                                  <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                                    <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Lượt dùng</span>
                                    <span className="text-white text-sm font-bold">{promo.usage_limit > 0 ? `${promo.used_count}/${promo.usage_limit}` : "Không giới hạn"}</span>
                                  </div>
                               </div>
                               <div className="text-[11px] text-zinc-400 leading-relaxed bg-cinema-primary/5 p-3 rounded-xl border border-cinema-primary/10">
                                  <span className="text-white font-bold block mb-1 flex items-center gap-1">
                                    <Tag className="w-3 h-3" /> Điều kiện áp dụng:
                                  </span>
                                  • {promo.apply_days.length > 0 && promo.apply_days.length < 7 ? `Chỉ áp dụng các ngày: ${promo.apply_days.map(d => getDayName(d)).join(", ")}` : "Áp dụng tất cả các ngày trong tuần"}<br/>
                                  • {promo.apply_seat_types.length > 0 ? `Dành cho: ${promo.apply_seat_types.join(", ")}` : "Áp dụng cho mọi loại ghế"}<br/>
                                  • Mỗi tài khoản được sử dụng tối đa 1 lần trong suốt chương trình.
                               </div>
                               <Link to="/movies" className="cinema-btn-primary w-full flex items-center justify-center gap-2 py-3">
                                  Sử dụng ngay <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 glass-card rounded-3xl">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8">
              <Ticket className="w-10 h-10 text-zinc-700" />
            </div>
            <h2 className="text-white text-2xl font-bold mb-3">Không tìm thấy mã ưu đãi</h2>
            <p className="text-zinc-500 text-sm mb-8 max-w-md mx-auto">
              Rất tiếc, không có khuyến mãi nào khớp với từ khóa của bạn. Thử thay đổi bộ lọc hoặc quay lại sau nhé!
            </p>
            <button
              onClick={() => { setSearchQuery(""); setActiveTab("all"); }}
              className="text-cinema-primary font-black hover:underline transition-all"
            >
              Xóa tất cả bộ lọc
            </button>
          </div>
        )}
      </section>

      {/* FOOTER CALL TO ACTION */}
      {!user && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-20">
          <div className="relative rounded-[40px] overflow-hidden p-8 md:p-16 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-cinema-primary/20 via-cinema-bg to-cinema-gold/10"></div>
            <div className="absolute inset-0 border border-white/5 rounded-[40px]"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Bạn chưa có tài khoản?</h2>
              <p className="text-zinc-400 text-lg mb-10 max-w-2xl mx-auto">
                Đăng ký ngay để nhận thêm nhiều ưu đãi độc quyền và tích điểm đổi quà hấp dẫn cho mỗi lượt xem phim.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/auth?tab=register" className="cinema-btn-primary px-10 py-4 text-base w-full sm:w-auto">
                  Đăng ký ngay
                </Link>
                <Link to="/auth?tab=login" className="px-10 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all w-full sm:w-auto">
                  Đăng nhập
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
};

export default PromotionsPage;