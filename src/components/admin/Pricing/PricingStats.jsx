export default function PricingStats({ data }) {
  const activeCount = data.filter(d => d.active).length;
  
  const avgPrice = data.length > 0 
    ? Math.round(data.reduce((sum, item) => sum + item.final, 0) / data.length / 1000) + "K₫"
    : "0K₫";
  
  const minPrice = data.length > 0 
    ? Math.min(...data.map(item => item.final)) / 1000 + "K₫"
    : "0K₫";
  
  const maxPrice = data.length > 0 
    ? Math.max(...data.map(item => item.final)) / 1000 + "K₫"
    : "0K₫";
  
  const seatTypes = [...new Set(data.map(item => item.seat))].length + " loại";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <div className="bg-[#0d0d1a] p-4 rounded-xl border border-white/10">
        <div className="text-2xl font-bold text-white">{data.length}</div>
        <div className="text-xs text-gray-400 mt-1">Tổng quy tắc</div>
      </div>
      
      <div className="bg-[#0d0d1a] p-4 rounded-xl border border-white/10">
        <div className="text-2xl font-bold text-green-400">{activeCount}</div>
        <div className="text-xs text-gray-400 mt-1">Đang áp dụng</div>
      </div>
      
      <div className="bg-[#0d0d1a] p-4 rounded-xl border border-white/10">
        <div className="text-2xl font-bold text-yellow-400">{avgPrice}</div>
        <div className="text-xs text-gray-400 mt-1">Giá trung bình</div>
      </div>
      
      <div className="bg-[#0d0d1a] p-4 rounded-xl border border-white/10">
        <div className="text-2xl font-bold text-blue-400">{seatTypes}</div>
        <div className="text-xs text-gray-400 mt-1">Loại ghế</div>
      </div>
      
      <div className="bg-[#0d0d1a] p-4 rounded-xl border border-white/10">
        <div className="text-sm font-bold text-white">
          Từ <span className="text-lg text-green-400">{minPrice}</span> 
          {" → "} 
          <span className="text-lg text-red-400">{maxPrice}</span>
        </div>
        <div className="text-xs text-gray-400 mt-1">Khoảng giá/vé</div>
      </div>
    </div>
  );
}