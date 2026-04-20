import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { auth } from "../../firebase/firebaseConfig";
import toast from "react-hot-toast";
import axios from "axios";

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [socket, setSocket] = useState(null);

    const fetchNotifications = useCallback(async () => {
        if (!user || !auth.currentUser) return;
        try {
            const token = await auth.currentUser.getIdToken();
            console.log(`📡 Fetching notifications for user_id: ${user.user_id}`);
            const res = await axios.get(`http://localhost:5000/api/notifications/user/${user.user_id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log(`✅ Fetched ${res.data.length} notifications`, res.data);
            setNotifications(res.data);
            setUnreadCount(res.data.filter((n) => !n.is_read).length);
        } catch (err) {
            console.error("Fetch notifications error:", err);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchNotifications();

            const newSocket = io("http://localhost:5000");
            setSocket(newSocket);

            newSocket.emit("join", user.user_id);

            newSocket.on("new-notification", (notification) => {
                console.log("🆕 New notification received via socket:", notification);
                setNotifications((prev) => [notification, ...prev]);
                setUnreadCount((prev) => prev + 1);

                toast.custom((t) => (
                    <div
                        className={`${t.visible ? "animate-enter" : "animate-leave"
                            } max-w-md w-full bg-cinema-surface/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
                    >
                        <div className="flex-1 w-0 p-4">
                            <div className="flex items-start">
                                <div className="ml-3 flex-1">
                                    <p className="text-sm font-bold text-white">
                                        {notification.title}
                                    </p>
                                    <p className="mt-1 text-xs text-zinc-400">
                                        {notification.message}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex border-l border-white/10">
                            <button
                                onClick={() => toast.dismiss(t.id)}
                                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-cinema-primary hover:text-cinema-primary-dark focus:outline-none"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                ));
            });

            return () => {
                newSocket.disconnect();
            };
        } else {
            setNotifications([]);
            setUnreadCount(0);
            if (socket) socket.disconnect();
        }
    }, [user]);

    const markAsRead = async (id) => {
        try {
            if (!auth.currentUser) return;
            const token = await auth.currentUser.getIdToken();
            await axios.put(`http://localhost:5000/api/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications((prev) =>
                prev.map((n) => (n.notification_id === id ? { ...n, is_read: 1 } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Mark as read error:", err);
        }
    };

    const markAllAsRead = async () => {
        // Optional: Implement bulk update on backend
        notifications.forEach(n => {
            if (!n.is_read) markAsRead(n.notification_id);
        });
    };

    return (
        <NotificationContext.Provider
            value={{ notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications }}
        >
            {children}
        </NotificationContext.Provider>
    );
};
