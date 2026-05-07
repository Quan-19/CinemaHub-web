// components/CancelConfirmModal.jsx
import React from 'react';
import { X, AlertTriangle, Calendar, Clock, MapPin, Film } from 'lucide-react';
import { formatDateToDisplay } from '../../../utils/dateUtils';

export default function CancelConfirmModal({ isOpen, onClose, onConfirm, showtime, loading }) {
  if (!isOpen || !showtime) return null;

  const handleConfirm = () => {
    onConfirm(showtime.id, showtime.movieTitle, showtime);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-cinema-surface border border-red-500/30 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-red-500/20 bg-red-600/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="text-red-500" size={20} />
            </div>
            <h2 className="text-lg font-bold text-white">Xác nhận hủy suất chiếu</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <p className="text-zinc-300 text-sm">
            Bạn có chắc chắn muốn hủy suất chiếu này không? Hành động này có thể ảnh hưởng đến khách hàng đã đặt vé.
          </p>

          {/* Showtime Info */}
          <div className="bg-zinc-900/50 rounded-xl p-4 space-y-2 border border-white/5">
            <div className="flex items-center gap-2 text-sm">
              <Film size={16} className="text-red-400" />
              <span className="text-white font-medium">{showtime.movieTitle}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={16} className="text-zinc-500" />
              <span className="text-zinc-300">{formatDateToDisplay(showtime.date)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock size={16} className="text-zinc-500" />
              <span className="text-zinc-300">{showtime.time} - {showtime.endTime}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin size={16} className="text-zinc-500" />
              <span className="text-zinc-300">{showtime.cinemaName} - Phòng {showtime.roomName}</span>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
            <p className="text-yellow-400 text-xs flex items-center gap-2">
              <AlertTriangle size={14} />
              <span>Sau khi hủy, suất chiếu sẽ chuyển sang trạng thái "Đã hủy" và không thể khôi phục.</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 pt-0">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition disabled:opacity-50"
          >
            Quay lại
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <AlertTriangle size={16} />
                Xác nhận hủy
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}