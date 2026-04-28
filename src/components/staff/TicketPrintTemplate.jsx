import React from 'react';
import './TicketPrintTemplate.css';

/**
 * TicketPrintTemplate Component
 * Used for both Print Preview and actual Window Printing
 * Styled to match Lotte Cinema ticket standards
 */
const TicketPrintTemplate = React.forwardRef(({ scanResult }, ref) => {
    if (!scanResult) return null;

    const showDate = new Date(scanResult.showtime?.start_time).toLocaleDateString('vi-VN');
    const showTime = new Date(scanResult.showtime?.start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const transDate = new Date(scanResult.created_at).toLocaleDateString('vi-VN');
    const minAge = scanResult.movie?.age_rating?.replace(/\D/g, '') || '13';

    return (
        <div ref={ref} className="printable-ticket-container ticket-preview-wrapper p-8 text-[11px]">
            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-xl font-bold uppercase tracking-tighter">VÉ XEM PHIM</h1>
                <p className="font-bold">Công ty TNHH EbizCinema Việt Nam</p>
                <p className="max-w-[200px] mx-auto opacity-70">
                    {scanResult.cinema?.address}
                </p>
            </div>

            {/* Transaction Info */}
            <div className="border-t border-b border-dashed border-black/30 py-3 mt-4 space-y-1">
                <p className="font-bold text-sm uppercase">{scanResult.cinema?.name}</p>
                <div className="flex justify-between">
                    <span>TransDate: {transDate}</span>
                    <span>AM</span>
                </div>
                <div className="flex justify-between">
                    <span>Cinema/POS: {scanResult.cinema?.cinema_id?.toString().padStart(4, '0')}-001</span>
                    <span>TransSeq: {scanResult.booking_id?.toString().padStart(4, '0')}</span>
                </div>
            </div>

            {/* Movie Info Section */}
            <div className="py-4 space-y-3">
                <div className="flex items-start gap-4">
                    <span className="font-bold border border-black px-1.5 py-0.5 leading-none mt-0.5">
                        [{scanResult.showtime?.format}]
                    </span>
                    <div>
                        <p className="font-black text-sm uppercase leading-tight">{scanResult.movie?.title}</p>
                        <p className="text-[10px]">
                            ({scanResult.movie?.age_rating}) Trên {minAge} tuổi
                        </p>
                    </div>
                </div>
                <div className="flex items-baseline gap-x-8 py-1">
                    <span className="font-black truncate uppercase">{scanResult.showtime?.room?.name}</span>
                    <span className="font-black shrink-0 text-xl whitespace-nowrap">GHẾ: {scanResult.seat_labels?.join(', ')}</span>
                </div>
                <p className="font-black text-sm uppercase">
                    SUẤT CHIẾU: {showDate} <span className="ml-8">{showTime}</span>
                </p>
            </div>

            {/* Pricing Details */}
            <div className="border-t border-dashed border-black/30 pt-3 space-y-2">
                {/* Seats list */}
                {scanResult.seats?.map((seat, i) => (
                    <div key={i} className="flex justify-between items-center">
                        <div className="space-y-0.5">
                            <p className="font-bold">Ghế {seat.label} ({seat.seat_type})</p>
                            <p className="text-[9px] opacity-70 italic">- Ticket Price (Da bao gom 5% VAT)</p>
                        </div>
                        <span className="font-bold">{Math.round(seat.price || 0).toLocaleString('vi-VN')} VNĐ</span>
                    </div>
                ))}

                {/* Service Charge */}
                <div className="flex justify-between">
                    <span>- Service Charge</span>
                    <span className="font-bold">0 VNĐ</span>
                </div>

                {/* Foods list */}
                {scanResult.foods?.map((food, i) => (
                    <div key={i} className="flex justify-between items-center">
                        <div className="space-y-0.5">
                            <p className="font-bold">{food.name} x{food.quantity}</p>
                            <p className="text-[9px] opacity-70 italic">- Da bao gom 8% VAT</p>
                        </div>
                        <span className="font-bold">{Math.round(food.price * food.quantity).toLocaleString('vi-VN')} VNĐ</span>
                    </div>
                ))}

                {/* Discount */}
                {scanResult.discount_amount > 0 && (
                    <div className="flex justify-between border-t border-black/10 pt-2">
                        <span className="font-bold">Khuyến mãi ({scanResult.promo_code})</span>
                        <span className="font-bold">-{Math.round(scanResult.discount_amount).toLocaleString('vi-VN')} VNĐ</span>
                    </div>
                )}

                {/* Total */}
                <div className="pt-3 mt-2 border-t-2 border-black flex justify-between text-base font-black">
                    <span className="uppercase">Tổng cộng</span>
                    <span>{Math.round(scanResult.total_price || 0).toLocaleString('vi-VN')} VNĐ</span>
                </div>

                {/* Footer Message */}
                <div className="text-center mt-6 space-y-1">
                    <p className="text-[10px] font-bold uppercase">CHÚC QUÝ KHÁCH XEM PHIM VUI VẺ!</p>
                    <p className="text-[8px] opacity-50 italic">Cảm ơn quý khách đã sử dụng dịch vụ của EbizCinema</p>
                </div>
            </div>
        </div>
    );
});

TicketPrintTemplate.displayName = 'TicketPrintTemplate';

export default TicketPrintTemplate;
