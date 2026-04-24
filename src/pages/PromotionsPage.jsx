// PromotionsPage.jsx
import { Tag, Clock, Copy, Check, Info, Gift, Calendar, Percent, MapPin, Users, Ticket, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

export const PromotionsPage = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);
  const [expandedPromo, setExpandedPromo] = useState(null);
  const [error, setError] = useState(null);

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

        // Format data theo đúng cấu trúc bảng promotion
        const formatted = data.map((promo) => ({
          promotion_id: promo.promotion_id || promo.id,
          title: promo.title || "",
          description: promo.description || "",
          code: promo.code || "",
          image: promo.image || "",
          
          // Discount fields
          discount_percent: promo.discount_percent || 0,
          discount_value: promo.discount_value || 0,
          discount_type: promo.discount_type || "percent",
          
          // Order conditions
          min_order: promo.min_order || 0,
          
          // Date fields
          start_date: promo.start_date,
          end_date: promo.end_date,
          
          // Status
          status: promo.status || "active",
          
          // Cinema
          cinema_id: promo.cinema_id || null,
          
          // Apply conditions - parse JSON string if needed
          apply_days: typeof promo.apply_days === "string" ? JSON.parse(promo.apply_days || "[]") : (promo.apply_days || []),
          apply_seat_types: typeof promo.apply_seat_types === "string" ? JSON.parse(promo.apply_seat_types || "[]") : (promo.apply_seat_types || []),
          
          // Usage limits
          usage_limit: promo.usage_limit || 0,
          used_count: promo.used_count || 0,
          
          // Holiday pricing
          has_holiday_prices: promo.has_holiday_prices || false,
          holiday_prices: typeof promo.holiday_prices === "string" ? JSON.parse(promo.holiday_prices || "[]") : (promo.holiday_prices || []),
          
          // Timestamps
          created_at: promo.created_at,
          updated_at: promo.updated_at,
        }));

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

  const handleCopy = (code) => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleExpand = (id) => {
    setExpandedPromo(expandedPromo === id ? null : id);
  };

  const getDiscountDisplay = (promo) => {
    if (promo.discount_type === "percent") {
      return `-${promo.discount_percent}%`;
    } else if (promo.discount_type === "fixed") {
      return `-${promo.discount_value.toLocaleString()}đ`;
    } else if (promo.discount_type === "combo") {
      return "Tặng Combo";
    }
    return "Khuyến mãi";
  };

  const getDayName = (day) => {
    const days = ["Chủ Nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
    return days[day];
  };

  const getSeatTypeName = (type) => {
    const types = {
      standard: "Ghế Thường",
      vip: "Ghế VIP",
      couple: "Ghế Đôi",
      deluxe: "Ghế Deluxe",
    };
    return types[type] || type;
  };

  const getStatusBadge = (status, start_date, end_date) => {
    const now = new Date();
    const start = new Date(start_date);
    const end = new Date(end_date);
    
    if (status === "inactive") {
      return { text: "Đã kết thúc", color: "bg-zinc-600" };
    }
    if (now < start) {
      return { text: "Sắp diễn ra", color: "bg-blue-600" };
    }
    if (now > end) {
      return { text: "Đã hết hạn", color: "bg-zinc-600" };
    }
    return { text: "Đang áp dụng", color: "bg-green-600" };
  };

  const getRemainingUsage = (promo) => {
    if (!promo.usage_limit) return null;
    const remaining = promo.usage_limit - (promo.used_count || 0);
    return remaining > 0 ? remaining : 0;
  };

  // Filter active promotions
  const activePromotions = promotions.filter(promo => {
    const now = new Date();
    const start = new Date(promo.start_date);
    const end = new Date(promo.end_date);
    return promo.status === "active" && now >= start && now <= end;
  });

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

  // ========== ERROR STATE ==========
  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--color-cinema-bg)" }}
      >
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-red-400 mb-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--color-cinema-bg)" }}>
      {/* HEADER */}
      <div
        className="py-10 border-b border-zinc-700"
        style={{
          background:
            "linear-gradient(to bottom, var(--color-cinema-surface), var(--color-cinema-bg))",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-2">
            <Gift className="w-8 h-8 text-red-500" />
            <h1 className="text-white" style={{ fontSize: "2rem", fontWeight: 800 }}>
              Khuyến mãi & Ưu đãi
            </h1>
          </div>
          <p className="text-zinc-400 text-sm">
            Những ưu đãi hấp dẫn dành riêng cho bạn. Nhanh tay săn vé để không bỏ lỡ!
          </p>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* STATS BANNER */}
        {activePromotions.length > 0 && (
          <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-red-900/20 to-red-800/10 border border-red-500/20">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                  <Percent className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-zinc-300 text-sm">Đang có</p>
                  <p className="text-white text-xl font-bold">{activePromotions.length} chương trình</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-zinc-300 text-sm">Sắp kết thúc</p>
                  <p className="text-white text-xl font-bold">
                    {activePromotions
                      .filter(p => new Date(p.end_date) > new Date())
                      .sort((a, b) => new Date(a.end_date) - new Date(b.end_date))[0]?.end_date
                      ? new Date(activePromotions.sort((a,b) => new Date(a.end_date) - new Date(b.end_date))[0]?.end_date).toLocaleDateString("vi-VN")
                      : "Chưa cập nhật"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EMPTY STATE */}
        {activePromotions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎁</div>
            <p className="text-zinc-400 mb-2">Chưa có khuyến mãi</p>
            <p className="text-zinc-400 text-sm">
              Hãy quay lại sau để xem ưu đãi mới nhất
            </p>
          </div>
        )}

        {/* PROMOTIONS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {activePromotions.map((promo) => {
            const statusBadge = getStatusBadge(promo.status, promo.start_date, promo.end_date);
            const remainingUsage = getRemainingUsage(promo);
            
            return (
              <div
                key={promo.promotion_id}
                className="group rounded-2xl overflow-hidden border border-zinc-700 hover:border-red-500/30 transition-all duration-300"
                style={{ background: "var(--color-cinema-surface)" }}
              >
                <div className="flex flex-col md:flex-row">
                  {/* Image Section */}
                  <div className="relative md:w-2/5 h-48 md:h-auto overflow-hidden">
                    {promo.image ? (
                      <img
                        src={promo.image}
                        alt={promo.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-red-900/50 to-zinc-800 flex items-center justify-center">
                        <Gift className="w-12 h-12 text-red-500/50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent md:bg-gradient-to-r" />

                    {/* Discount Badge */}
                    <div
                      className="absolute top-3 left-3 px-3 py-1.5 rounded-lg text-white text-sm font-bold shadow-lg flex items-center gap-1"
                      style={{ background: "var(--color-cinema-primary)" }}
                    >
                      <Gift className="w-3.5 h-3.5" />
                      {getDiscountDisplay(promo)}
                    </div>

                    {/* Status Badge */}
                    <div className={`absolute top-3 right-3 px-2 py-1 rounded-md ${statusBadge.color} text-white text-xs font-semibold`}>
                      {statusBadge.text}
                    </div>

                    {/* Date Range */}
                    <div className="absolute bottom-3 left-3 right-3 bg-black/60 backdrop-blur-sm rounded-lg p-2">
                      <div className="flex items-center gap-2 text-zinc-300 text-xs">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {promo.start_date ? new Date(promo.start_date).toLocaleDateString("vi-VN") : "???"} - {promo.end_date ? new Date(promo.end_date).toLocaleDateString("vi-VN") : "???"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 p-5">
                    <h3 className="text-white mb-2 text-lg font-bold group-hover:text-red-400 transition-colors line-clamp-1">
                      {promo.title}
                    </h3>

                    <p className="text-zinc-400 text-sm mb-3 leading-relaxed line-clamp-2">
                      {promo.description}
                    </p>

                    {/* Apply Conditions */}
                    <div className="space-y-2 mb-3">
                      {/* Min Order */}
                      {promo.min_order > 0 && (
                        <div className="flex items-center gap-2 text-zinc-400 text-xs">
                          <Ticket className="w-3.5 h-3.5" />
                          <span>Áp dụng cho đơn hàng tối thiếu: {promo.min_order}đ</span>
                        </div>
                      )}

                      {/* Cinema */}
                      {promo.cinema_id && (
                        <div className="flex items-center gap-2 text-zinc-400 text-xs">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Áp dụng tại rạp #{promo.cinema_id}</span>
                        </div>
                      )}

                      {/* Apply Days */}
                      {promo.apply_days && promo.apply_days.length > 0 && promo.apply_days.length !== 7 && (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-zinc-500 text-xs">Áp dụng:</span>
                          {promo.apply_days.map((day) => (
                            <span
                              key={day}
                              className="px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 text-xs"
                            >
                              {getDayName(day)}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Apply Seat Types */}
                      {promo.apply_seat_types && promo.apply_seat_types.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-zinc-500 text-xs">Loại ghế:</span>
                          {promo.apply_seat_types.map((type) => (
                            <span
                              key={type}
                              className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-xs"
                            >
                              {getSeatTypeName(type)}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Usage Limit */}
                      {remainingUsage !== null && remainingUsage > 0 && (
                        <div className="flex items-center gap-2 text-zinc-400 text-xs">
                          <Users className="w-3.5 h-3.5" />
                          <span>Còn {remainingUsage} lượt sử dụng</span>
                          <div className="flex-1 h-1 bg-zinc-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-red-500 rounded-full"
                              style={{ width: `${((promo.used_count || 0) / promo.usage_limit) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Holiday Pricing */}
                      {promo.has_holiday_prices && promo.holiday_prices.length > 0 && (
                        <div className="flex items-center gap-2 text-orange-400 text-xs">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Áp dụng riêng ngày lễ</span>
                        </div>
                      )}
                    </div>

                    {/* Terms & Conditions - Collapsible */}
                    <div className="mt-3">
                      <button
                        onClick={() => toggleExpand(promo.promotion_id)}
                        className="flex items-center gap-1 text-xs text-zinc-500 hover:text-red-400 transition-colors"
                      >
                        <Info className="w-3.5 h-3.5" />
                        <span>{expandedPromo === promo.promotion_id ? "Thu gọn" : "Xem chi tiết"}</span>
                      </button>
                      
                      {expandedPromo === promo.promotion_id && (
                        <div className="mt-2 p-3 rounded-lg bg-black/30 border border-zinc-700">
                          <p className="text-zinc-400 text-xs font-medium mb-2">Chi tiết chương trình:</p>
                          <ul className="space-y-1">
                            <li className="text-zinc-500 text-xs flex items-start gap-2">
                              <span className="text-red-400">•</span>
                              Mã khuyến mãi: {promo.code}
                            </li>
                            <li className="text-zinc-500 text-xs flex items-start gap-2">
                              <span className="text-red-400">•</span>
                              Hạn sử dụng: {promo.end_date ? new Date(promo.end_date).toLocaleDateString("vi-VN") : "Đang cập nhật"}
                            </li>
                            {promo.min_order > 0 && (
                              <li className="text-zinc-500 text-xs flex items-start gap-2">
                                <span className="text-red-400">•</span>
                                Áp dụng cho đơn hàng tối thiếu: {promo.min_order}đ
                              </li>
                            )}
                            {promo.usage_limit > 0 && (
                              <li className="text-zinc-500 text-xs flex items-start gap-2">
                                <span className="text-red-400">•</span>
                                Số lượng có hạn, áp dụng đến khi hết lượt
                              </li>
                            )}
                            <li className="text-zinc-500 text-xs flex items-start gap-2">
                              <span className="text-red-400">•</span>
                              Không áp dụng cùng lúc với các chương trình khác
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Promo Code & Copy Button */}
                    <div className="flex items-center gap-2 mt-4">
                      <div className="flex-1 bg-zinc-900 border border-dashed border-zinc-600 rounded-xl px-4 py-2.5 flex items-center gap-2 group-hover:border-red-500/50 transition-colors">
                        <Tag className="w-4 h-4 text-red-500 shrink-0" />
                        <span className="text-white text-sm tracking-wider font-mono font-bold">
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

                    {/* Action Button */}
                    <button
                      onClick={() => window.location.href = "/movies"}
                      className="w-full mt-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-all"
                    >
                      Áp dụng ngay
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Show more promotions message */}
        {activePromotions.length >= 4 && (
          <div className="text-center mt-8 py-6">
            <p className="text-zinc-400 text-sm">
              Còn nhiều ưu đãi hấp dẫn khác đang chờ bạn!
            </p>
            <p className="text-zinc-500 text-xs mt-1">
              Theo dõi fanpage để không bỏ lỡ bất kỳ chương trình khuyến mãi nào
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromotionsPage;