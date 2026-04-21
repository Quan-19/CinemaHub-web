import { useEffect, useState } from "react";
import { useNotification } from "../context/NotificationContext";
import { Bell, CreditCard, Zap, Info, Clock, CheckCircle2, ChevronRight, Inbox } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationPage() {
    const { notifications, markAsRead, markAllAsRead } = useNotification();
    const [filter, setFilter] = useState("all");

    // SEO Optimization
    useEffect(() => {
        document.title = "Thông báo hệ thống | EbizCinema";
    }, []);

    const filteredNotifs = notifications.filter(n => {
        if (filter === "all") return true;
        if (filter === "payment") return n.type === "payment_success" || n.type === "payment";
        if (filter === "movie") return n.type === "movie_update" || n.type === "movie";
        return true;
    });

    const getIcon = (type) => {
        switch (type) {
            case "payment_success":
            case "payment": return <CreditCard className="h-5 w-5 text-emerald-400" />;
            case "movie_update":
            case "movie": return <Zap className="h-5 w-5 text-blue-400" />;
            default: return <Info className="h-5 w-5 text-zinc-400" />;
        }
    };

    const getTimeString = (date) => {
        return new Date(date).toLocaleString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    };

    return (
        <div className="min-h-screen bg-cinema-bg pt-20 pb-20 mt-4 md:mt-0">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section - Sticky */}
                <header className="sticky top-20 z-40 mb-10 py-6 bg-cinema-bg/80 backdrop-blur-lg border-b border-white/5 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-cinema-primary/10 rounded-lg">
                                <Bell className="h-6 w-6 text-cinema-primary" />
                            </div>
                            <h1 className="text-3xl font-bold text-white tracking-tight">Trung tâm thông báo</h1>
                        </div>
                        <p className="text-zinc-400 text-sm max-w-lg">
                            Duy trì cập nhật thông tin về các giao dịch, lịch chiếu phim và các ưu đãi đặc quyền dành riêng cho bạn.
                        </p>
                    </div>

                    <button
                        onClick={markAllAsRead}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-semibold border border-white/10 transition-all active:scale-95"
                    >
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        Đánh dấu tất cả đã đọc
                    </button>
                </header>

                {/* Filter Tabs */}
                <nav className="flex gap-2 p-1 bg-white/5 rounded-2xl mb-8 w-fit border border-white/5">
                    {[
                        { id: "all", label: "Tất cả", icon: Inbox },
                        { id: "payment", label: "Thanh toán", icon: CreditCard },
                        { id: "movie", label: "Lịch chiếu & Phim", icon: Zap },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id)}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${filter === tab.id
                                ? "bg-cinema-primary text-white shadow-lg shadow-cinema-primary/20"
                                : "text-zinc-400 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    ))}
                </nav>

                {/* Notification List */}
                <main className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {filteredNotifs.length > 0 ? (
                            filteredNotifs.map((n) => (
                                <motion.article
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    key={n.notification_id}
                                    onClick={() => !n.is_read && markAsRead(n.notification_id)}
                                    className={`group relative overflow-hidden p-5 sm:p-6 rounded-2xl border transition-all duration-300 ${!n.is_read
                                        ? "bg-zinc-900/50 border-cinema-primary/30 shadow-[0_8px_30px_rgb(0,0,0,0.4)]"
                                        : "bg-zinc-900/20 border-white/5 hover:border-white/10"
                                        }`}
                                >
                                    <div className="flex gap-4 sm:gap-6">
                                        <div className={`h-12 w-12 shrink-0 rounded-2xl flex items-center justify-center bg-zinc-800 border border-white/10 group-hover:scale-110 transition-transform`}>
                                            {getIcon(n.type)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4 mb-1">
                                                <h2 className={`text-base sm:text-lg font-bold text-white transition-opacity ${n.is_read ? "opacity-60" : ""}`}>
                                                    {n.title}
                                                </h2>
                                                <div className="flex items-center gap-3">
                                                    {!n.is_read && (
                                                        <span className="flex h-2 w-2 rounded-full bg-cinema-primary shadow-[0_0_12px_rgba(220,38,38,1)]" />
                                                    )}
                                                    <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-white transition-colors" />
                                                </div>
                                            </div>

                                            <p className={`text-sm sm:text-base text-zinc-400 mb-4 leading-relaxed line-clamp-2 ${n.is_read ? "opacity-50" : ""}`}>
                                                {n.message}
                                            </p>

                                            <footer className="flex items-center justify-between">
                                                <div className="flex items-center gap-4 text-[11px] sm:text-xs">
                                                    <span className="flex items-center gap-1.5 text-zinc-500 font-medium">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        {getTimeString(n.created_at)}
                                                    </span>
                                                    <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] ${n.type === 'payment_success' ? 'bg-emerald-500/10 text-emerald-400' :
                                                        n.type === 'movie_update' ? 'bg-blue-500/10 text-blue-400' :
                                                            'bg-zinc-500/10 text-zinc-400'
                                                        }`}>
                                                        {n.type === 'payment_success' ? 'Thanh toán' : n.type === 'movie_update' ? 'Lịch chiếu' : 'Hệ thống'}
                                                    </span>
                                                </div>
                                            </footer>
                                        </div>
                                    </div>
                                </motion.article>
                            ))
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-24 bg-white/[0.02] rounded-3xl border border-white/5 border-dashed"
                            >
                                <div className="relative inline-block mb-6">
                                    <Inbox className="h-16 w-16 text-zinc-800 opacity-50" />
                                    <div className="absolute -top-1 -right-1 h-4 w-4 bg-zinc-800 rounded-full border-2 border-[#0a0a0a]" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Hộp thư trống</h3>
                                <p className="text-zinc-500 text-sm max-w-xs mx-auto">
                                    Hiện tại chưa có thông báo mới nào dành cho bạn. Hãy quay lại sau nhé!
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}
