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
    StopCircle
} from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { getAuth } from "firebase/auth";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function StaffScannerPage() {
    const { subtitle } = useOutletContext();
    const [scanResult, setScanResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [cameraLoading, setCameraLoading] = useState(false);

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

    const handleCheckIn = async () => {
        if (!scanResult) return;

        setLoading(true);
        try {
            const auth = getAuth();
            const user = auth.currentUser;
            const token = await user?.getIdToken();

            await axios.patch(`${API_BASE_URL}/api/bookings/${scanResult.booking_id}/status`,
                { status: 'confirmed' },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success("Check-in thành công!");
            setScanResult(null);
            startScanner();
        } catch (err) {
            toast.error("Lỗi khi cập nhật trạng thái check-in");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto px-4">
            <div>
                <h1 className="text-2xl font-bold sm:text-3xl flex items-center gap-3">
                    <div className="p-2 bg-cinema-primary/10 rounded-xl">
                        <QrCode className="text-cinema-primary w-6 h-6" />
                    </div>
                    Kiểm soát vé
                </h1>
                <p className="mt-1 text-sm text-zinc-400 font-medium">{subtitle}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Scanner Card */}
                <div className="lg:col-span-5 cinema-surface p-6 overflow-hidden">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Máy quét QR</h3>
                        <div className={`flex items-center gap-2 text-xs ${cameraActive ? 'text-green-500' : 'text-zinc-500'}`}>
                            <div className={`w-2 h-2 rounded-full ${cameraActive ? 'bg-green-500 animate-pulse' : 'bg-zinc-700'}`} />
                            {cameraActive ? 'Camera đang bật' : 'Camera đang tắt'}
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
                </div>

                {/* Info Card */}
                <div className="lg:col-span-7 cinema-surface p-6 min-h-[400px] flex flex-col">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-6 border-b border-white/5 pb-2">Thông tin vé</h3>

                    <div className="flex-1 flex flex-col">
                        {loading && !scanResult && (
                            <div className="flex-1 flex flex-col items-center justify-center py-12">
                                <div className="relative">
                                    <Loader2 className="w-12 h-12 text-cinema-primary animate-spin" />
                                    <div className="absolute inset-0 blur-xl bg-cinema-primary/20 animate-pulse"></div>
                                </div>
                                <p className="text-zinc-400 font-bold mt-6 text-lg">Đang xác thực bảo mật...</p>
                                <p className="text-zinc-500 text-sm mt-1">Đang giải mã token...</p>
                            </div>
                        )}

                        {error && (
                            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                                <div className="p-6 bg-red-500/10 rounded-full mb-6 ring-2 ring-red-500/20">
                                    <XCircle className="w-16 h-16 text-red-500" />
                                </div>
                                <h4 className="text-red-500 font-black text-xl mb-3 tracking-tight">XÁC THỰC THẤT BẠI</h4>
                                <div className="max-w-md mx-auto p-4 bg-red-500/5 rounded-2xl border border-red-500/10">
                                    <p className="text-zinc-300 text-sm leading-relaxed">{error}</p>
                                </div>
                                <button
                                    onClick={startScanner}
                                    className="mt-8 px-8 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-bold transition-all shadow-xl"
                                >
                                    Quét lại mã khác
                                </button>
                            </div>
                        )}

                        {!loading && !scanResult && !error && (
                            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center space-y-6">
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-cinema-primary/10 rounded-full blur-3xl group-hover:bg-cinema-primary/20 transition-all duration-700"></div>
                                    <Ticket className="w-20 h-20 text-zinc-800 relative z-10 opacity-30" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-zinc-400 font-bold text-lg">Sẵn sàng kiểm tra</p>
                                    <p className="text-zinc-600 text-sm max-w-[280px] mx-auto">Vui lòng quét mã QR trên vé của khách hàng để hiển thị thông tin xác thực.</p>
                                </div>
                            </div>
                        )}

                        {scanResult && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 flex-1 flex flex-col">
                                <div className="flex items-center justify-between bg-zinc-950/40 p-4 rounded-2xl border border-white/5 shadow-inner">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Trạng thái đặt vé</p>
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-tight ${scanResult.booking_status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-500'
                                            }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${scanResult.booking_status === 'paid' ? 'bg-emerald-500' : 'bg-yellow-500'}`} />
                                            {scanResult.booking_status === 'paid' ? 'Hợp lệ' : scanResult.booking_status}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Mã đặt vé</p>
                                        <div className="text-white font-black text-lg">#{scanResult.ticket_code}</div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-6 p-1">
                                    <div className="relative shrink-0 group">
                                        <img
                                            src={scanResult.movie?.poster}
                                            alt={scanResult.movie?.title}
                                            className="w-32 h-44 object-cover rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-cinema-primary rounded-xl flex items-center justify-center text-white font-black text-xs shadow-xl ring-4 ring-[#12121e]">
                                            {scanResult.movie?.age_rating || 'T13'}
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <h4 className="text-xl font-black text-white leading-tight mb-1">{scanResult.movie?.title}</h4>
                                            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-zinc-500">
                                                <span className="px-2 py-0.5 bg-zinc-800 rounded">{scanResult.movie?.genre}</span>
                                                <span>•</span>
                                                <span>{scanResult.movie?.duration} phút</span>
                                            </div>
                                        </div>

                                        <div className="space-y-3 pt-2">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-cinema-primary/10 rounded-lg"><User size={14} className="text-cinema-primary" /></div>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-black uppercase text-zinc-500 leading-none mb-1">Khách hàng</p>
                                                    <p className="text-sm font-bold text-white truncate">{scanResult.customer_name}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-cinema-primary/10 rounded-lg"><MapPin size={14} className="text-cinema-primary" /></div>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-black uppercase text-zinc-500 leading-none mb-1">Địa điểm</p>
                                                    <p className="text-sm font-bold text-white truncate">{scanResult.cinema?.name}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {[
                                        { icon: Calendar, label: "Ngày", val: new Date(scanResult.showtime?.start_time).toLocaleDateString('vi-VN') },
                                        { icon: Clock, label: "Giờ", val: new Date(scanResult.showtime?.start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) },
                                        { icon: Film, label: "Phòng", val: scanResult.showtime?.room?.name },
                                        { icon: Ticket, label: "Ghế", val: scanResult.seat_labels?.join(', ') }
                                    ].map((item, i) => (
                                        <div key={i} className="bg-white/5 p-3 rounded-2xl border border-white/5 flex flex-col items-center text-center">
                                            <item.icon size={14} className="text-cinema-primary mb-2" />
                                            <p className="text-[9px] font-black uppercase text-zinc-500 leading-none mb-1.5">{item.label}</p>
                                            <p className="text-xs font-black text-white">{item.val}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-auto pt-6 flex gap-3">
                                    <button
                                        onClick={handleCheckIn}
                                        disabled={loading || scanResult.booking_status === 'confirmed'}
                                        className="flex-1 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-900/20 active:scale-95"
                                    >
                                        <CheckCircle2 size={24} />
                                        XÁC NHẬN VÉ HỢP LỆ
                                    </button>
                                    <button
                                        onClick={stopScanner}
                                        className="p-4 rounded-2xl border border-white/10 text-zinc-500 hover:bg-white/5 hover:text-white transition-all"
                                        title="Hủy"
                                    >
                                        <RefreshCw size={24} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

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
        </div>
    );
}
