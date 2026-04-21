import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, CheckCircle2, X, Clock, Zap, CreditCard, Tag, Info, ChevronRight, Inbox } from "lucide-react";
import { useNotification } from "../context/NotificationContext";
import { motion, AnimatePresence } from "framer-motion";

const NotificationDropdown = ({ isOpen, onClose }) => {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
    const [filter, setFilter] = useState("all");
    const dropdownRef = useRef(null);

    const filteredNotifications = filter === "all"
        ? notifications
        : notifications.filter(n => !n.is_read);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                onClose();
            }
        };
        if (isOpen) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, onClose]);

    const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return "Vừa xong";
        if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
        return new Date(date).toLocaleDateString("vi-VN");
    };

    const getIcon = (type) => {
        switch (type) {
            case "payment_success":
            case "payment": return <CreditCard className="h-4 w-4 text-emerald-400" />;
            case "promotion": return <Tag className="h-4 w-4 text-amber-400" />;
            case "movie_update":
            case "movie": return <Zap className="h-4 w-4 text-blue-400" />;
            default: return <Info className="h-4 w-4 text-zinc-400" />;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95, filter: "blur(10px)" }}
                    animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: 10, scale: 0.95, filter: "blur(10px)" }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    ref={dropdownRef}
                    className="absolute right-0 top-full mt-4 w-80 sm:w-[400px] rounded-2xl border border-white/10 bg-cinema-bg/95 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.6)] overflow-hidden z-[100]"
                >
                    {/* Header */}
                    <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="relative">
                                <Bell className="h-5 w-5 text-cinema-primary" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-cinema-bg animate-pulse" />
                                )}
                            </div>
                            <h3 className="text-[17px] font-bold text-white tracking-tight">Thông báo</h3>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={markAllAsRead}
                                className="p-2 rounded-xl hover:bg-white/10 text-zinc-400 hover:text-white transition-all active:scale-90"
                                title="Đánh dấu tất cả đã đọc"
                            >
                                <CheckCircle2 className="h-4 w-4" />
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-xl hover:bg-white/10 text-zinc-400 hover:text-white transition-all md:hidden"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex p-2 gap-1 bg-black/20">
                        <button
                            onClick={() => setFilter("all")}
                            className={`flex-1 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${filter === "all" ? "bg-cinema-primary text-white shadow-lg" : "text-zinc-500 hover:text-white hover:bg-white/5"}`}
                        >
                            Tất cả
                        </button>
                        <button
                            onClick={() => setFilter("unread")}
                            className={`flex-1 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${filter === "unread" ? "bg-cinema-primary text-white shadow-lg" : "text-zinc-500 hover:text-white hover:bg-white/5"}`}
                        >
                            Chưa đọc ({unreadCount})
                        </button>
                    </div>

                    {/* Notification List */}
                    <div className="max-h-[420px] overflow-y-auto custom-scrollbar bg-[#0a0a0a]/50">
                        <AnimatePresence mode="popLayout">
                            {filteredNotifications.length > 0 ? (
                                filteredNotifications.map((n) => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        key={n.notification_id}
                                        onClick={() => !n.is_read && markAsRead(n.notification_id)}
                                        className={`group relative p-4 border-b border-white/5 transition-all cursor-pointer hover:bg-white/[0.04] ${!n.is_read ? "bg-cinema-primary/[0.03]" : ""}`}
                                    >
                                        <div className="flex gap-4">
                                            <div className={`mt-0.5 h-10 w-10 shrink-0 rounded-2xl flex items-center justify-center bg-zinc-800 border border-white/5 group-hover:border-white/20 transition-all`}>
                                                {getIcon(n.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <p className={`text-sm font-bold text-white leading-snug break-words ${!n.is_read ? "" : "text-zinc-400 font-medium"}`}>
                                                        {n.title}
                                                    </p>
                                                    {!n.is_read && <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-cinema-primary shrink-0 shadow-[0_0_8px_rgba(220,38,38,0.6)]" />}
                                                </div>
                                                <p className={`text-xs leading-relaxed line-clamp-2 ${!n.is_read ? "text-zinc-300" : "text-zinc-500 font-normal"}`}>
                                                    {n.message}
                                                </p>
                                                <div className="mt-2.5 flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-medium italic">
                                                        <Clock className="h-3 w-3" />
                                                        {getTimeAgo(n.created_at)}
                                                    </div>
                                                    <ChevronRight className="h-3 w-3 text-zinc-600 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="p-12 text-center text-xs text-zinc-500">
                                    <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                                        <Inbox className="h-8 w-8 text-zinc-700" />
                                    </div>
                                    <p className="font-medium">Bạn chưa có thông báo nào</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer */}
                    <Link
                        to="/notifications"
                        onClick={onClose}
                        className="group flex items-center justify-center gap-2 p-4 text-[11px] font-extrabold uppercase tracking-widest text-zinc-400 hover:text-white bg-white/5 hover:bg-cinema-primary transition-all duration-300"
                    >
                        <span>Xem tất cả thông báo</span>
                        <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default NotificationDropdown;
