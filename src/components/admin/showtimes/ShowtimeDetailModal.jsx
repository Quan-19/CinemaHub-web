import React from 'react';
import {
   X,
   Film,
   MapPin,
   Calendar,
   Clock,
   Ticket,
   Users,
   Monitor,
   Info,
   DollarSign
} from 'lucide-react';
import { formatDateToDisplay } from '../../../utils/dateUtils';

export default function ShowtimeDetailModal({ showtime, isOpen, onClose }) {
   if (!isOpen || !showtime) return null;

   const formatMoney = (value) => {
      const amount = Number(value);
      if (!Number.isFinite(amount) || amount <= 0) return "—";
      return `${amount.toLocaleString()}₫`;
   };

   const getStatusInfo = (status) => {
      const statuses = {
         scheduled: { label: "Sắp chiếu", color: "text-green-500", bg: "bg-green-500/10" },
         ongoing: { label: "Đang diễn ra", color: "text-yellow-500", bg: "bg-yellow-500/10" },
         ended: { label: "Đã kết thúc", color: "text-zinc-500", bg: "bg-zinc-500/10" },
         cancelled: { label: "Đã hủy", color: "text-red-500", bg: "bg-red-500/10" },
      };
      return statuses[status] || statuses.scheduled;
   };

   const status = getStatusInfo(showtime.status);
   const isSpecial = Boolean(showtime.isSpecial || showtime.special);
   const prices = isSpecial
      ? (showtime.specialPrices || {})
      : (showtime.regularPrices || showtime.prices || {});

   return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
         {/* Backdrop */}
         <div
            className="absolute inset-0 bg-black/60 transition-opacity"
            onClick={onClose}
         />

         {/* Modal Content */}
         <div className="relative w-full max-w-xl bg-cinema-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/5">
               <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                     <Info size={20} className="text-red-500" />
                     Chi tiết suất chiếu
                  </h2>
               </div>
               <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-all"
               >
                  <X size={20} />
               </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">

               {/* Movie Header */}
               <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/5">
                  <div className="flex gap-4">
                     {/* Placeholder for Poster if needed, but keeping it clean */}
                     <div className="w-12 h-12 rounded-lg bg-red-600/10 flex items-center justify-center text-red-500 shrink-0">
                        <Film size={24} />
                     </div>
                     <div>
                        <h3 className="text-base font-bold text-white leading-tight mb-1">{showtime.movieTitle}</h3>
                        <div className="flex items-center gap-3">
                           <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${status.bg} ${status.color}`}>
                              {status.label}
                           </span>
                           <span className="text-xs text-zinc-500 font-medium">Định dạng: {showtime.type} • {showtime.language === 'DUB' ? 'Lồng tiếng' : 'Phụ đề'}</span>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Logistics Grid */}
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                     <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Ngày chiếu</label>
                     <div className="flex items-center gap-2 text-zinc-200 text-sm">
                        <Calendar size={14} className="text-zinc-500" />
                        {formatDateToDisplay(showtime.date)}
                     </div>
                  </div>
                  <div className="space-y-1">
                     <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Thời gian</label>
                     <div className="flex items-center gap-2 text-zinc-200 text-sm">
                        <Clock size={14} className="text-zinc-500" />
                        <span className="font-bold">{showtime.time}</span>
                        <span className="text-zinc-600">-</span>
                        <span className="text-zinc-400">{showtime.endTime || "---"}</span>
                     </div>
                  </div>
                  <div className="space-y-1">
                     <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Địa điểm</label>
                     <div className="flex items-center gap-2 text-zinc-200 text-sm">
                        <MapPin size={14} className="text-zinc-500" />
                        {showtime.cinemaName}
                     </div>
                  </div>
                  <div className="space-y-1">
                     <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Phòng chiếu</label>
                     <div className="flex items-center gap-2 text-zinc-200 text-sm">
                        <Monitor size={14} className="text-zinc-500" />
                        {showtime.roomName}
                     </div>
                  </div>
               </div>

               {/* Statistics */}
               <div className="space-y-3">
                  <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Tình trạng ghế</label>
                  <div className="bg-zinc-900 border border-white/5 rounded-xl p-4">
                     <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-zinc-400">Đã đặt: <span className="text-white font-bold">{showtime.bookedCount || 0}</span> / {showtime.totalSeats || 0} ghế</span>
                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                           Còn trống {Math.max(0, (showtime.totalSeats || 0) - (showtime.bookedCount || 0))}
                        </span>
                     </div>
                     <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                           className="h-full bg-red-600 transition-all duration-500"
                           style={{ width: `${Math.min(100, ((showtime.bookedCount || 0) / (showtime.totalSeats || 1)) * 100)}%` }}
                        />
                     </div>
                  </div>
               </div>

               {/* Pricing Table */}
               <div className="space-y-3">
                  <div className="flex items-center justify-between">
                     <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Cấu trúc giá vé</label>
                     {isSpecial && (
                        <span className="text-[10px] text-amber-500 font-bold px-2 py-0.5 bg-amber-500/10 rounded border border-amber-500/20">Suất đặc biệt</span>
                     )}
                  </div>
                  <div className="bg-zinc-900/30 border border-white/5 rounded-xl overflow-hidden">
                     <div className="grid grid-cols-2 border-b border-white/5 bg-zinc-900/50 px-4 py-2">
                        <span className="text-[10px] uppercase font-bold text-zinc-500">Loại ghế</span>
                        <span className="text-[10px] uppercase font-bold text-zinc-500 text-right">Giá tiền</span>
                     </div>
                     <div className="divide-y divide-white/5">
                        <div className="flex justify-between items-center px-4 py-3">
                           <span className="text-xs text-zinc-300">Ghế thường</span>
                           <span className="text-sm font-bold text-white">{formatMoney(prices.Thường)}</span>
                        </div>
                        <div className="flex justify-between items-center px-4 py-3">
                           <span className="text-xs text-purple-400/80">Ghế VIP</span>
                           <span className="text-sm font-bold text-purple-400">{formatMoney(prices.VIP)}</span>
                        </div>
                        <div className="flex justify-between items-center px-4 py-3">
                           <span className="text-xs text-red-400/80">Ghế Couple</span>
                           <span className="text-sm font-bold text-red-400">{formatMoney(prices.Couple)}</span>
                        </div>
                     </div>
                  </div>
               </div>

            </div>
         </div>
      </div>
   );
}
