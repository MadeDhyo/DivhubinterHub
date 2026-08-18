import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ children }) {
    const user = usePage().props.auth.user;
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    const getUserInitials = (name) => {
        return name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U';
    };

    return (
        <div className="min-h-screen bg-[#001b3d] font-sans text-white flex flex-col justify-between">
            <div className="flex flex-1 relative">
                {/* 1. SIDEBAR KIRI (Desktop & Mobile) */}
                <aside className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#031433]/85 backdrop-blur-md border-r border-white/10 flex flex-col justify-between p-6 transition-transform duration-300 md:translate-x-0 ${
                    isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                    <div className="space-y-8">
                        {/* Logo DivHubInter */}
                        <div className="flex items-center gap-3 border-b border-white/10 pb-6">
                            <img
                                src="/images/logo.png"
                                alt="Logo DivHubInter"
                                className="h-14 w-auto object-contain"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23d4af37'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 009 11c0-3.517 1.009-6.799 2.753-9.571m-3.44 2.04A13.916 13.916 0 009 11c0 3.517 1.009-6.799 2.753 9.571m3 0c1.744-2.772 2.753-6.054 2.753-9.571m-3 0c-1.744 2.772-2.753 6.054-2.753 9.571'/%3E%3C/svg%3E";
                                }}
                            />
                            <div>
                                <h1 className="text-sm font-extrabold tracking-wider text-white">DIVHUBINTER</h1>
                                <p className="text-xs font-bold text-[#d4af37] tracking-widest">POLRI</p>
                            </div>
                        </div>

                        {/* Navigation Menu */}
                        <nav className="space-y-2">
                            <Link
                                href={route('dashboard')}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm transition ${
                                    route().current('dashboard')
                                        ? 'bg-white/10 text-[#d4af37] border-l-4 border-[#d4af37]'
                                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
                                </svg>
                                Dashboard
                            </Link>

                            <button
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white font-medium text-sm transition text-left"
                                onClick={() => alert('Daftar Pencarian Orang - Segera Hadir')}
                            >
                                <svg className="h-5 w-5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                                Daftar Pencarian Orang
                            </button>

                            {/* Manajemen Kasus */}
                            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm transition ${
                                route().current('operations.show')
                                    ? 'bg-white/10 text-[#d4af37] border-l-4 border-[#d4af37]'
                                    : 'text-gray-300'
                            }`}>
                                <svg className="h-5 w-5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                                Manajemen Kasus
                            </div>

                            {/* Menu Khusus Admin */}
                            {user.role === 'admin' && (
                                <>
                                    <div className="pt-4 border-t border-white/10 text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4">
                                        Administrasi Sistem
                                    </div>
                                    <Link
                                        href={route('user-management.index')}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm transition ${
                                            route().current('user-management.index')
                                                ? 'bg-white/10 text-[#d4af37] border-l-4 border-[#d4af37]'
                                                : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                        }`}
                                    >
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                        Manajemen Personel
                                    </Link>
                                    <Link
                                        href={route('activity-logs.index')}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm transition ${
                                            route().current('activity-logs.index')
                                                ? 'bg-white/10 text-[#d4af37] border-l-4 border-[#d4af37]'
                                                : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                        }`}
                                    >
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Log Aktivitas
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>

                    {/* Bottom Sidebar */}
                    <div className="border-t border-white/10 pt-4 text-center">
                        <p className="text-[10px] text-gray-500 font-bold tracking-widest">&copy; 2024 NCB INTERPOL</p>
                        <p className="text-[9px] text-[#d4af37] font-semibold tracking-widest uppercase mt-0.5">INDONESIA</p>
                    </div>
                </aside>

                {/* Overlay for mobile sidebar */}
                {isMobileSidebarOpen && (
                    <div
                        className="fixed inset-0 z-30 bg-black/60 md:hidden"
                        onClick={() => setIsMobileSidebarOpen(false)}
                    />
                )}

                {/* MAIN CONTENT WRAPPER */}
                <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
                    {/* 2. TOP HEADER */}
                    <header className="h-20 border-b border-white/10 bg-[#031433]/40 backdrop-blur-md px-6 md:px-8 flex items-center justify-between sticky top-0 z-20">
                        {/* Mobile Toggle Menu */}
                        <button
                            className="md:hidden p-2 hover:bg-white/5 rounded text-gray-300"
                            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        {/* Search Bar */}
                        <div className="flex-1 max-w-md mx-4 md:mx-0">
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </span>
                                <input
                                    type="text"
                                    placeholder="Cari kasus, subjek, atau referensi..."
                                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition"
                                />
                            </div>
                        </div>

                        {/* Profile & Actions */}
                        <div className="flex items-center gap-6">
                            <button className="relative p-2 hover:bg-white/5 rounded-full text-gray-300 hover:text-white transition">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
                            </button>
                            <div className="h-8 w-px bg-white/10 hidden sm:block" />
                            <div className="flex items-center gap-3">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-semibold text-white">{user.name}</p>
                                    <p className="text-[10px] text-[#d4af37] font-bold tracking-widest uppercase">
                                        Role: {user.role}
                                    </p>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#d4af37] to-yellow-600 flex items-center justify-center font-extrabold text-sm text-[#001b3d] shadow-md border border-white/20 select-none">
                                    {getUserInitials(user.name)}
                                </div>
                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    className="p-1.5 hover:bg-red-500/10 hover:text-red-400 rounded text-gray-400 transition"
                                    title="Log Out"
                                >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </header>

                    {/* MAIN CONTENT */}
                    <main className="flex-1 p-6 md:p-8">
                        {children}
                    </main>
                </div>
            </div>

            {/* FOOTER */}
            <footer className="h-12 bg-black/40 backdrop-blur-md border-t border-[#d4af37]/20 flex items-center justify-center z-30 md:ml-64">
                <p className="text-[9px] font-bold tracking-widest text-gray-400 flex items-center gap-1.5 sm:gap-3">
                    <span>INTEGRITY</span>
                    <span className="text-[#d4af37] font-semibold">|</span>
                    <span>COOPERATION</span>
                    <span className="text-[#d4af37] font-semibold">|</span>
                    <span>PROFESSIONALISM</span>
                    <span className="text-[#d4af37] font-semibold">|</span>
                    <span>INNOVATION</span>
                </p>
            </footer>
        </div>
    );
}
