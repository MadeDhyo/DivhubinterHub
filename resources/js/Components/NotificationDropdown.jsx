import { useState, useRef, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';

export default function NotificationDropdown() {
    const { unread_notifications_count = 0, notifications = [] } = usePage().props;
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAsRead = (id) => {
        router.post(route('notifications.read', id), {}, { preserveScroll: true });
    };

    const handleMarkAllAsRead = () => {
        router.post(route('notifications.readAll'), {}, { preserveScroll: true });
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 hover:bg-white/5 rounded-full text-gray-300 hover:text-white transition focus:outline-none"
                title="Notifikasi"
            >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unread_notifications_count > 0 && (
                    <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                        {unread_notifications_count > 9 ? '9+' : unread_notifications_count}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#031433] border border-white/20 rounded-xl shadow-2xl z-50 overflow-hidden text-white backdrop-blur-md">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#001b3d]/60">
                        <div className="flex items-center gap-2">
                            <h4 className="font-bold text-[#d4af37] text-sm">Notifikasi Real-time</h4>
                            {unread_notifications_count > 0 && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-500/20 text-red-400 border border-red-500/30">
                                    {unread_notifications_count} Baru
                                </span>
                            )}
                        </div>
                        {unread_notifications_count > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-[11px] text-[#d4af37] hover:underline font-semibold"
                            >
                                Tandai Semua Dibaca
                            </button>
                        )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
                        {notifications.length > 0 ? (
                            notifications.map((n) => (
                                <div
                                    key={n.id}
                                    className={`p-4 hover:bg-white/5 transition flex justify-between items-start gap-3 ${
                                        !n.read_at ? 'bg-blue-500/5' : ''
                                    }`}
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            {!n.read_at && <span className="h-2 w-2 rounded-full bg-red-500 flex-shrink-0" />}
                                            <p className="text-xs font-bold text-white">{n.title}</p>
                                        </div>
                                        <p className="text-xs text-gray-300 mt-1 leading-relaxed">{n.message}</p>
                                        <p className="text-[10px] text-gray-400 mt-1.5 font-mono">{n.created_at}</p>
                                    </div>
                                    {!n.read_at && (
                                        <button
                                            onClick={() => handleMarkAsRead(n.id)}
                                            className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold uppercase flex-shrink-0"
                                            title="Tandai dibaca"
                                        >
                                            Dibaca
                                        </button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="p-6 text-center text-gray-400 text-xs">
                                Tidak ada notifikasi terbaru.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
