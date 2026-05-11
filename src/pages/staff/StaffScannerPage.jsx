import { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useOutletContext } from "react-router-dom";
import {
    QrCode,
    CheckCircle2,
    XCircle,
    Loader2,
    Ticket,
    User,
    Calendar,
    Clock,
    Film,
    MapPin,
    RefreshCw,
    Camera,
    Play,
    StopCircle,
    Hash,
    Search,
    Printer,
    X,
    Utensils,
    Coffee,
    CreditCard,
    Tag
} from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { getAuth } from "firebase/auth";
import TicketPrintTemplate from "../../components/staff/TicketPrintTemplate";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function StaffScannerPage() {
    const { subtitle } = useOutletContext();
    const [scanResult, setScanResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [cameraLoading, setCameraLoading] = useState(false);
    const [manualCode, setManualCode] = useState("");
    const [manualLoading, setManualLoading] = useState(false);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

    const html5QrCodeRef = useRef(null);
    const scannerId = "reader";

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopScanner();
        };
    }, []);

    const startScanner = async () => {
        if (html5QrCodeRef.current?.isScanning) return;

        setCameraLoading(true);
        setScanResult(null);
        setError(null);

        try {
            if (!html5QrCodeRef.current) {
                html5QrCodeRef.current = new Html5Qrcode(scannerId);
            }

            const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0
            };

            await html5QrCodeRef.current.start(
                { facingMode: "environment" },
                config,
                onScanSuccess
            );

            setCameraActive(true);
        } catch (err) {
            console.error("Failed to start scanner:", err);
            toast.error("Không thể khởi động camera. Hãy đảm bảo bạn đã cấp quyền.");
        } finally {
            setCameraLoading(false);
        }
    };

    const stopScanner = async () => {
        if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
            try {
                await html5QrCodeRef.current.stop();
                setCameraActive(false);
            } catch (err) {
                console.error("Failed to stop scanner:", err);
            }
        }
    };

    const onScanSuccess = (decodedText) => {
        console.log("Scan success:", decodedText);
        stopScanner();
        handleVerifyTicket(decodedText);
    };

    const handleVerifyTicket = async (code) => {
        setLoading(true);
        setError(null);
        setScanResult(null);

        try {
            const auth = getAuth();
            const user = auth.currentUser;
            const token = await user?.getIdToken();

            const response = await axios.get(`${API_BASE_URL}/api/tickets/${encodeURIComponent(code)}?source=scanner`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setScanResult(response.data);
            toast.success("Xác thực vé thành công!");
        } catch (err) {
            console.error("Verification error:", err);
            setError(err.response?.data?.message || "Không thể xác thực vé này. Vui lòng kiểm tra lại.");
            toast.error("Xác thực thất bại");
        } finally {
            setLoading(false);
        }
    };

    const handleManualLookup = async (e) => {
        e?.preventDefault();
        const code = manualCode.trim().toUpperCase();
        if (!code) {
            toast.error("Vui lòng nhập mã đặt vé");
            return;
        }

        setManualLoading(true);
        setError(null);
        setScanResult(null);

        try {
            const auth = getAuth();
            const user = auth.currentUser;
            const token = await user?.getIdToken();

            const response = await axios.get(
                `${API_BASE_URL}/api/tickets/${encodeURIComponent(code)}?source=manual`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setScanResult(response.data);
            toast.success("Xác thực vé thành công!");
            setManualCode("");
        } catch (err) {
            console.error("Manual lookup error:", err);
            const msg = err.response?.data?.message;
            setError(msg || "Không tìm thấy mã vé. Vui lòng kiểm tra lại.");
            toast.error("Xác thực thất bại");
        } finally {
            setManualLoading(false);
        }
    };

    const handleCheckIn = async () => {
        if (!scanResult) return;

        setLoading(true);
        try {
            const auth = getAuth();
            const user = auth.currentUser;
            const token = await user?.getIdToken();

            await axios.put(`${API_BASE_URL}/api/bookings/${scanResult.booking_id}/status`,
                { status: 'confirmed' },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success("Check-in thành công!");
            // Refresh scan result to get confirmed status
            setScanResult(prev => ({ ...prev, booking_status: 'confirmed' }));
        } catch (err) {
            console.error("Check-in error:", err);
            toast.error("Lỗi khi cập nhật trạng thái check-in");
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto px-4">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold sm:text-2xl flex items-center gap-2">
                    <div className="p-1.5 bg-cinema-primary/10 rounded-lg">
                        <QrCode className="text-cinema-primary w-5 h-5" />
                    </div>
                    Kiểm soát vé
                </h1>
                <p className="text-xs text-zinc-500 font-medium">{subtitle}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Scanner Card */}
                <div className="lg:col-span-5 cinema-surface p-5 overflow-hidden">
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Máy quét QR</h3>
                        <div className={`flex items-center gap-1.5 text-[10px] ${cameraActive ? 'text-green-500' : 'text-zinc-500'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${cameraActive ? 'bg-green-500 animate-pulse' : 'bg-zinc-700'}`} />
                            {cameraActive ? 'Đang bật' : 'Đang tắt'}
                        </div>
                    </div>

                    <div className="relative aspect-square w-full rounded-2xl overflow-hidden border-2 border-white/5 bg-black group shadow-2xl">
                        <div id={scannerId} className="w-full h-full object-cover"></div>

                        {/* Overlay indicators */}
                        {cameraActive && (
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                <div className="w-64 h-64 border-2 border-cinema-primary/50 rounded-3xl relative">
                                    <div className="absolute inset-0 border-4 border-cinema-primary rounded-3xl opacity-20"></div>
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-0.5 bg-cinema-primary/50 shadow-[0_0_15px_rgba(229,9,20,0.8)] animate-scanner-line"></div>
                                </div>
                            </div>
                        )}

                        {!cameraActive && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/80 backdrop-blur-sm transition-all">
                                {cameraLoading ? (
                                    <Loader2 className="w-12 h-12 text-cinema-primary animate-spin" />
                                ) : (
                                    <>
                                        <div className="p-5 bg-zinc-900 rounded-full mb-4 ring-1 ring-white/10 group-hover:scale-110 transition-transform duration-500">
                                            <Camera className="w-10 h-10 text-zinc-500" />
                                        </div>
                                        <button
                                            onClick={startScanner}
                                            className="px-8 py-3 bg-cinema-primary hover:bg-cinema-primary-dark text-white rounded-2xl font-bold shadow-lg shadow-cinema-primary/20 transition-all flex items-center gap-2 group"
                                        >
                                            <Play size={20} fill="currentColor" /> Bật Camera
                                        </button>
                                        <p className="text-zinc-500 text-xs mt-4">Vui lòng cấp quyền truy cập camera</p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="mt-6">
                        {cameraActive && (
                            <button
                                onClick={stopScanner}
                                className="w-full py-3 border border-zinc-700 hover:bg-white/5 text-zinc-300 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                            >
                                <StopCircle size={18} /> Dừng quét
                            </button>
                        )}
                    </div>

                    {/* Manual Code Input */}
                    <div className="mt-6 border-t border-white/5 pt-6">
                        <div className="flex items-center gap-2 mb-3">
                            <Hash size={14} className="text-zinc-500" />
                            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Nhập mã vé thủ công</p>
                        </div>
                        <form onSubmit={handleManualLookup} className="flex gap-2">
                            <input
                                type="text"
                                value={manualCode}
                                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                                placeholder="VD: CS1234567890"
                                className="flex-1 bg-zinc-900 border border-white/10 focus:border-cinema-primary/60 focus:ring-2 focus:ring-cinema-primary/20 rounded-xl px-4 py-2.5 text-sm font-mono text-white placeholder-zinc-600 outline-none transition-all"
                                disabled={manualLoading}
                                maxLength={20}
                                autoComplete="off"
                                spellCheck={false}
                            />
                            <button
                                type="submit"
                                disabled={manualLoading || !manualCode.trim()}
                                className="px-4 py-2.5 bg-cinema-primary hover:bg-cinema-primary-dark disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-cinema-primary/20 active:scale-95 whitespace-nowrap"
                            >
                                {manualLoading
                                    ? <Loader2 size={16} className="animate-spin" />
                                    : <Search size={16} />}
                                Xác thực
                            </button>
                        </form>
                    </div>
                </div>

                {/* Info Card */}
                <div className="lg:col-span-7 cinema-surface p-5 min-h-[400px] flex flex-col">
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-4 border-b border-white/5 pb-2">Thông tin vé</h3>

                    <div className="flex-1 flex flex-col">
                        {loading && !scanResult && (
                            <div className="flex-1 flex flex-col items-center justify-center p-10 text-zinc-500 space-y-4">
                                <Loader2 className="w-10 h-10 animate-spin text-cinema-primary" />
                                <p className="text-sm font-medium animate-pulse">Đang kiểm tra thông tin vé...</p>
                            </div>
                        )}

                        {!loading && !scanResult && !error && (
                            <div className="flex-1 flex flex-col items-center justify-center p-10 text-zinc-500 space-y-4">
                                <div className="p-5 bg-zinc-900 rounded-full">
                                    <QrCode className="w-12 h-12 opacity-20" />
                                </div>
                                <p className="text-sm font-medium">Vui lòng quét mã QR hoặc nhập mã vé để đối soát</p>
                            </div>
                        )}

                        {error && !scanResult && (
                            <div className="flex-1 flex flex-col items-center justify-center p-10 text-red-500 bg-red-500/5 rounded-2xl border border-red-500/10 space-y-4">
                                <div className="p-4 bg-red-500/10 rounded-full">
                                    <XCircle className="w-10 h-10" />
                                </div>
                                <p className="text-sm font-bold text-center leading-relaxed max-w-xs">{error}</p>
                                <button
                                    onClick={() => { setError(null); startScanner(); }}
                                    className="px-6 py-2 bg-red-500 text-white rounded-full text-xs font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-900/20"
                                >
                                    Thử lại
                                </button>
                            </div>
                        )}

                        {scanResult && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-500 flex-1 flex flex-col">
                                <div className="flex items-center justify-between bg-zinc-950/40 p-2 rounded-lg border border-white/5 shadow-inner">
                                    <div className="space-y-0.5">
                                        <p className="text-[8px] font-black uppercase text-zinc-500 tracking-widest">Trạng thái</p>
                                        <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-tight ${scanResult.booking_status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-500'
                                            }`}>
                                            <div className={`w-1 h-1 rounded-full ${scanResult.booking_status === 'paid' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                            {scanResult.booking_status === 'paid' ? 'Hợp lệ' : 'ĐÃ CHECK-IN'}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[8px] font-black uppercase text-zinc-500 tracking-widest">Mã vé</p>
                                        <div className="text-white font-black text-sm">#{scanResult.ticket_code}</div>
                                    </div>
                                </div>

                                <div className="flex flex-row gap-4 p-1">
                                    <div className="relative shrink-0">
                                        <img
                                            src={scanResult.movie?.poster}
                                            alt={scanResult.movie?.title}
                                            className="w-20 h-28 object-cover rounded-xl shadow-lg border border-white/5"
                                        />
                                        <div className="absolute bottom-1 right-1 w-6 h-6 bg-cinema-primary rounded flex items-center justify-center text-white font-bold text-[9px] shadow-lg ring-1 ring-white/20">
                                            {scanResult.movie?.age_rating || 'T13'}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-3">
                                        <div>
                                            <h4 className="text-base font-black text-white leading-tight truncate">{scanResult.movie?.title}</h4>
                                            <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-zinc-500 mt-1">
                                                <span className="px-1.5 py-0.5 bg-zinc-800 rounded">{scanResult.showtime?.format}</span>
                                                <span className={`px-1.5 py-0.5 rounded ${
                                                    scanResult.showtime?.language === 'DUB' ? 'bg-purple-600/20 text-purple-400' : 'bg-zinc-800 text-zinc-400'
                                                }`}>
                                                    {scanResult.showtime?.language === 'DUB' ? 'Lồng tiếng' : 'Phụ đề'}
                                                </span>
                                                <span>•</span>
                                                <span className="truncate">{scanResult.movie?.genre}</span>
                                                <span>•</span>
                                                <span>{scanResult.movie?.duration}p</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-x-6 gap-y-3 pt-2 border-t border-white/5">
                                            {[
                                                { icon: User, val: scanResult.customer_name, color: "text-cinema-primary" },
                                                { icon: Clock, val: new Date(scanResult.showtime?.start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }), color: "text-cinema-primary" },
                                                { icon: MapPin, val: scanResult.cinema?.name, color: "text-zinc-400" },
                                                { icon: Calendar, val: new Date(scanResult.showtime?.start_time).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }), color: "text-zinc-400" },
                                                { icon: Film, val: scanResult.showtime?.room?.name, color: "text-zinc-400" },
                                                { icon: Ticket, val: scanResult.seat_labels?.join(','), color: "text-zinc-400" }
                                            ].map((item, i) => (
                                                <div key={i} className="flex items-center gap-2.5 min-w-0">
                                                    <item.icon size={14} className={`${item.color} shrink-0`} />
                                                    <p className={`text-sm font-bold truncate tracking-tight ${item.color.includes('cinema-primary') ? 'text-white' : 'text-zinc-300'}`}>
                                                        {item.val}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Bill Details */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-zinc-400">
                                        <CreditCard size={14} />
                                        <h4 className="text-[10px] font-bold uppercase tracking-widest">Hóa đơn chi tiết</h4>
                                    </div>
                                    <div className="bg-zinc-950/40 rounded-xl border border-white/5 divide-y divide-white/5">
                                        {/* Tickets */}
                                        <div className="p-3 space-y-2">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Ticket size={12} className="text-cinema-primary" />
                                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Vé xem phim ({scanResult.seats?.length})</span>
                                            </div>
                                            {scanResult.seats?.map((seat, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-[13px]">
                                                    <span className="text-zinc-300">{seat.label} <span className="text-[9px] text-zinc-500 ml-1">({seat.seat_type})</span></span>
                                                    <span className="font-mono text-white/80">{Math.round(seat.price || 0).toLocaleString('vi-VN')} VNĐ</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Foods */}
                                        {scanResult.foods?.length > 0 && (
                                            <div className="p-3 space-y-2">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Coffee size={12} className="text-cinema-primary" />
                                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Dịch vụ ăn uống ({scanResult.foods?.length})</span>
                                                </div>
                                                {scanResult.foods?.map((food, idx) => (
                                                    <div key={idx} className="flex justify-between items-center text-[13px]">
                                                        <span className="text-zinc-300 truncate max-w-[150px]">{food.name} <span className="text-[9px] text-zinc-500 ml-1">x{food.quantity}</span></span>
                                                        <span className="font-mono text-white/80">{Math.round(food.price * food.quantity).toLocaleString('vi-VN')} VNĐ</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Promotion */}
                                        {scanResult.promo_code && (
                                            <div className="p-3 space-y-2">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Tag size={12} className="text-emerald-500" />
                                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Khuyến mãi</span>
                                                </div>
                                                <div className="flex justify-between items-center text-[13px]">
                                                    <span className="text-emerald-400 font-bold uppercase tracking-tight">{scanResult.promo_code}</span>
                                                    <span className="font-mono text-emerald-400">-{Math.round(scanResult.discount_amount || 0).toLocaleString('vi-VN')} VNĐ</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Total */}
                                        <div className="p-3 bg-cinema-primary/5 rounded-b-xl">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-white">TỔNG CỘNG</span>
                                                <span className="text-base font-black text-cinema-primary">{Math.round(scanResult.total_price || 0).toLocaleString('vi-VN')} VNĐ</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>



                                <div className="mt-auto pt-4 flex flex-col gap-2">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleCheckIn}
                                            disabled={loading || scanResult.booking_status === 'confirmed'}
                                            className={`flex-1 py-3 rounded-xl font-black transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 ${scanResult.booking_status === 'confirmed'
                                                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5'
                                                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                                }`}
                                        >
                                            <CheckCircle2 size={18} />
                                            <span className="text-xs">{scanResult.booking_status === 'confirmed' ? 'ĐÃ CHECK-IN' : 'XÁC NHẬN VÉ'}</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setScanResult(null);
                                                setError(null);
                                                startScanner();
                                            }}
                                            className="p-3 rounded-xl border border-white/10 text-zinc-500 hover:bg-white/5 hover:text-white transition-all"
                                            title="Quét lại"
                                        >
                                            <RefreshCw size={18} />
                                        </button>
                                    </div>

                                    {scanResult.booking_status === 'confirmed' && (
                                        <button
                                            onClick={() => setIsPrintModalOpen(true)}
                                            className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-black transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 border border-white/10"
                                        >
                                            <Printer size={18} />
                                            <span className="text-xs">IN VÉ GIẤY</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div >


            {/* Print Preview Modal */}
            {
                isPrintModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
                        <div className="bg-white text-black w-full max-w-md rounded-3xl overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-300">
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                                <h3 className="font-bold flex items-center gap-2"><Printer size={18} /> Xem trước bản in</h3>
                                <button onClick={() => setIsPrintModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Ticket Content (The printable part) */}
                            <div id="printable-ticket" className="flex-1 overflow-auto bg-white">
                                <TicketPrintTemplate scanResult={scanResult} />
                            </div>

                            <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                                <button
                                    onClick={() => setIsPrintModalOpen(false)}
                                    className="flex-1 py-3 border border-gray-300 rounded-xl font-bold hover:bg-gray-100 transition-colors"
                                >
                                    Đóng
                                </button>
                                <button
                                    onClick={handlePrint}
                                    className="flex-1 py-3 bg-cinema-primary text-white rounded-xl font-bold shadow-lg shadow-cinema-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    <Printer size={18} /> In ngay
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            <style>{`
        @keyframes scanner-line {
            0% { top: 0%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
        }
        .animate-scanner-line {
            animation: scanner-line 2.5s infinite linear;
        }
      `}</style>
        </div >
    );
}
