import { Tag, Percent, Calendar, TrendingUp, Clock } from "lucide-react";

export default function PromotionsStats({ promotions }) {
  const today = new Date().toISOString().split('T')[0];
  
  const activePromos = promotions.filter(p => 
    p.status === 'active' && p.start_date <= today && p.end_date >= today
  ).length;
  
  const codePromos = promotions.filter(p => !p.has_holiday_prices).length;
  const holidayPromos = promotions.filter(p => p.has_holiday_prices).length;
  
  const totalDiscountValue = promotions.reduce((sum, p) => {
    if (p.discount_type === 'percent') {
      return sum + (p.discount_value || 0);
    }
    return sum + (p.discount_value || 0);
  }, 0);
  
  const avgDiscount = promotions.length > 0 
    ? Math.round(totalDiscountValue / promotions.length)
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <div className="bg-cinema-surface p-4 rounded-xl border border-white/10 hover:bg-white/5 transition-colors">
        <div className="flex items-center justify-between">
          <Tag size={20} className="text-purple-400" />
          <span className="text-xs text-gray-500">Tổng số</span>
        </div>
        <div className="text-2xl font-bold text-white mt-2">{promotions.length}</div>
        <div className="text-xs text-gray-400">khuyến mãi</div>
      </div>

      <div className="bg-cinema-surface p-4 rounded-xl border border-white/10 hover:bg-white/5 transition-colors">
        <div className="flex items-center justify-between">
          <TrendingUp size={20} className="text-green-400" />
          <span className="text-xs text-gray-500">Đang áp dụng</span>
        </div>
        <div className="text-2xl font-bold text-green-400 mt-2">{activePromos}</div>
        <div className="text-xs text-gray-400">
          {promotions.length > 0 ? Math.round((activePromos / promotions.length) * 100) : 0}% tổng số
        </div>
      </div>

      <div className="bg-cinema-surface p-4 rounded-xl border border-white/10 hover:bg-white/5 transition-colors">
        <div className="flex items-center justify-between">
          <Percent size={20} className="text-yellow-400" />
          <span className="text-xs text-gray-500">Mã giảm giá</span>
        </div>
        <div className="text-2xl font-bold text-yellow-400 mt-2">{codePromos}</div>
        <div className="text-xs text-gray-400">khuyến mãi</div>
      </div>

      <div className="bg-cinema-surface p-4 rounded-xl border border-white/10 hover:bg-white/5 transition-colors">
        <div className="flex items-center justify-between">
          <Calendar size={20} className="text-red-400" />
          <span className="text-xs text-gray-500">Giá ngày lễ</span>
        </div>
        <div className="text-2xl font-bold text-red-400 mt-2">{holidayPromos}</div>
        <div className="text-xs text-gray-400">chương trình</div>
      </div>

      <div className="bg-cinema-surface p-4 rounded-xl border border-white/10 hover:bg-white/5 transition-colors">
        <div className="flex items-center justify-between">
          <Clock size={20} className="text-blue-400" />
          <span className="text-xs text-gray-500">Giảm TB</span>
        </div>
        <div className="text-2xl font-bold text-blue-400 mt-2">
          {avgDiscount > 0 ? (avgDiscount > 100 ? `${(avgDiscount / 1000).toFixed(0)}K` : `${avgDiscount}%`) : '0'}
        </div>
        <div className="text-xs text-gray-400">
          {avgDiscount > 100 ? 'VNĐ' : '%'} giảm
        </div>
      </div>
    </div>
  );
}