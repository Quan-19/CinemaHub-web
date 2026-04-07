import { getPricingRuleRoomType, isHolidayPricingRule } from "../../../utils/pricingRuleUtils";

export default function PricingStats({ data, filterCategory = "all" }) {
  const regularData = data.filter((d) => !isHolidayPricingRule(d));
  const holidayData = data.filter((d) => isHolidayPricingRule(d));
  
  const displayRegularData = filterCategory === "holiday" ? [] : regularData;
  const displayHolidayData = filterCategory === "regular" ? [] : holidayData;
  
  const activeCount = displayRegularData.filter(d => d.active).length;

  const getRuleEffectivePrice = (rule) => {
    const rawFinal = rule?.final ?? rule?.final_price ?? rule?.finalPrice;
    const rawBase = rule?.base ?? rule?.base_price ?? rule?.basePrice;
    const candidate = Number(rawFinal ?? rawBase);
    if (!Number.isFinite(candidate)) return null;
    if (candidate <= 0) return null;
    return candidate;
  };
  
  const seatTypes = ["Thường", "VIP", "Couple"];
  const seatStats = {};
  
  seatTypes.forEach(seat => {
    const seatData = displayRegularData.filter((d) => d.seat === seat && d.active);
    const seatPrices = seatData
      .map(getRuleEffectivePrice)
      .filter((value) => Number.isFinite(value));

    if (seatPrices.length > 0) {
      const sum = seatPrices.reduce((acc, value) => acc + value, 0);
      const avg = sum / seatPrices.length;
      const min = Math.min(...seatPrices);
      const max = Math.max(...seatPrices);
      seatStats[seat] = { avg, min, max, count: seatPrices.length };
    } else {
      seatStats[seat] = null;
    }
  });
  
  const activeData = displayRegularData.filter((d) => d.active);
  const activePrices = activeData
    .map(getRuleEffectivePrice)
    .filter((value) => Number.isFinite(value));

  const avgPrice =
    activePrices.length > 0
      ? Math.round(activePrices.reduce((sum, value) => sum + value, 0) / activePrices.length)
      : 0;

  const minPrice = activePrices.length > 0 ? Math.min(...activePrices) : 0;
  const maxPrice = activePrices.length > 0 ? Math.max(...activePrices) : 0;
  
  const formatPrice = (price) => {
    const value = Number(price);
    if (!Number.isFinite(value)) return "0₫";
    return Math.round(value).toLocaleString("vi-VN") + "₫";
  };
  
  
  const getSeatColor = (seat) => {
    switch(seat) {
      case 'VIP': return 'text-amber-400';
      case 'Couple': return 'text-pink-400';
      default: return 'text-gray-400';
    }
  };
  
  const getSeatBgColor = (seat) => {
    switch(seat) {
      case 'VIP': return 'bg-amber-500/10';
      case 'Couple': return 'bg-pink-500/10';
      default: return 'bg-gray-500/10';
    }
  };
  
  const getSeatBorderColor = (seat) => {
    switch(seat) {
      case 'VIP': return 'border-amber-500/20';
      case 'Couple': return 'border-pink-500/20';
      default: return 'border-gray-500/20';
    }
  };
  
  const getSeatPercentage = (seat) => {
    if (!seatStats[seat] || activePrices.length === 0) return 0;
    return ((seatStats[seat].count / activePrices.length) * 100).toFixed(0);
  };

  if (filterCategory === "holiday") {
    const activeHolidayCount = displayHolidayData.filter(d => d.active).length;
    return (
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-cinema-surface p-4 rounded-xl border border-white/10">
            <div className="text-2xl font-bold text-yellow-400">{displayHolidayData.length}</div>
            <div className="text-xs text-gray-400 mt-1">Tổng quy tắc ngày lễ</div>
            <div className="text-[10px] text-gray-500">{activeHolidayCount} đang áp dụng</div>
          </div>
          <div className="bg-cinema-surface p-4 rounded-xl border border-white/10">
            <div className="text-2xl font-bold text-white">
              {displayHolidayData.filter((d) => getPricingRuleRoomType(d) === "2D").length}
            </div>
            <div className="text-xs text-gray-400 mt-1">Quy tắc cho 2D</div>
          </div>
          <div className="bg-cinema-surface p-4 rounded-xl border border-white/10">
            <div className="text-2xl font-bold text-white">
              {displayHolidayData.filter((d) => getPricingRuleRoomType(d) !== "2D").length}
            </div>
            <div className="text-xs text-gray-400 mt-1">Quy tắc cho 3D/IMAX/4DX</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-cinema-surface p-4 rounded-xl border border-white/10">
          <div className="text-2xl font-bold text-white">{displayRegularData.length}</div>
          <div className="text-xs text-gray-400 mt-1">Tổng quy tắc thường</div>
          <div className="text-[10px] text-gray-500">{activeCount} đang áp dụng</div>
        </div>
        
        <div className="bg-cinema-surface p-4 rounded-xl border border-white/10">
          <div className="text-2xl font-bold text-red-400">{displayHolidayData.length}</div>
          <div className="text-xs text-gray-400 mt-1">Quy tắc ngày lễ</div>
        </div>
        
        <div className="bg-cinema-surface p-4 rounded-xl border border-white/10">
          <div className="text-2xl font-bold text-yellow-400">{formatPrice(avgPrice)}</div>
          <div className="text-xs text-gray-400 mt-1">Giá trung bình (đang áp dụng)</div>
        </div>
        
        <div className="bg-cinema-surface p-4 rounded-xl border border-white/10">
          <div className="text-2xl font-bold text-blue-400">
            {[...new Set(displayRegularData.map(item => item.seat))].length}
          </div>
          <div className="text-xs text-gray-400 mt-1">Loại ghế</div>
        </div>
        
        <div className="bg-cinema-surface p-4 rounded-xl border border-white/10">
          <div className="text-sm font-bold text-white">
            <span className="text-green-400">{formatPrice(minPrice)}</span>
            {" → "}
            <span className="text-red-400">{formatPrice(maxPrice)}</span>
          </div>
          <div className="text-xs text-gray-400 mt-1">Khoảng giá (đang áp dụng)</div>
        </div>
      </div>

      <div className="bg-cinema-surface rounded-xl border border-white/10 p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Giá vé theo loại ghế</h3>
        <p className="text-xs text-gray-500 -mt-3 mb-4">Tổng hợp từ các quy tắc thường đang áp dụng.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {seatTypes.map(seat => {
            const stats = seatStats[seat];
            if (!stats) {
              return (
                <div key={seat} className={`p-4 rounded-xl border border-dashed ${getSeatBorderColor(seat)}`}>
                  <div className={`text-sm font-medium ${getSeatColor(seat)} mb-3`}>{seat}</div>
                  <div className="text-center py-6 text-gray-500 text-sm">Chưa có dữ liệu</div>
                </div>
              );
            }
            
            return (
              <div key={seat} className={`p-4 rounded-xl border ${getSeatBorderColor(seat)} ${getSeatBgColor(seat)}`}>
                <div className="flex justify-between items-center mb-3">
                  <span className={`text-base font-bold ${getSeatColor(seat)}`}>{seat}</span>
                  <span className="text-xs text-gray-400">{stats.count} quy tắc</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-400">Giá trung bình</span>
                    <span className="text-yellow-400 font-bold">{formatPrice(stats.avg)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-400">Thấp nhất / Cao nhất</span>
                    <span className="text-xs">{formatPrice(stats.min)} - {formatPrice(stats.max)}</span>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div className={`h-full rounded-full ${seat === 'VIP' ? 'bg-amber-400' : seat === 'Couple' ? 'bg-pink-400' : 'bg-gray-400'}`} 
                         style={{ width: `${getSeatPercentage(seat)}%` }}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}