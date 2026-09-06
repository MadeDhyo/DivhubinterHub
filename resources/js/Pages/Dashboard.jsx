import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function Dashboard({ auth, operations = [] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    // Filter operasi berdasarkan input pencarian (client-side search)
    const filteredOperations = operations.filter(op =>
        op.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        op.operation_number.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Hitung total operasi aktif (status selain 'Closed')
    const activeOperationsCount = operations.filter(op => op.status !== 'Closed').length;

    // Mendapatkan inisial nama untuk avatar
    const getUserInitials = (name) => {
        return name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U';
    };

    return (
        <div className="min-h-screen bg-[#001b3d] font-sans text-white flex flex-col justify-between">
            <Head title="Pusat Komando Operasional" />

            <div className="flex flex-1 relative">
                {/* 1. SIDEBAR KIRI (Desktop & Mobile) */}
                <aside className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#031433]/85 backdrop-blur-md border-r border-white/10 flex flex-col justify-between p-6 transition-transform duration-300 md:translate-x-0 ${
                    isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                    <div className="space-y-8">
                        {/* Logo OCMS INTERPOL */}
                        <div className="flex items-center gap-3 border-b border-white/10 pb-6">
                            <img
                                src="/images/INTERPOL_Logo.png"
                                alt="Logo INTERPOL"
                                className="h-12 w-auto object-contain"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23d4af37'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 009 11c0-3.517 1.009-6.799 2.753-9.571m-3.44 2.04A13.916 13.916 0 009 11c0 3.517 1.009 6.799 2.753 9.571m3 0c1.744-2.772 2.753-6.054 2.753-9.571 0-3.517-1.009-6.799-2.753-9.571m-3 0c-1.744 2.772-2.753 6.054-2.753 9.571'/%3E%3C/svg%3E";
                                }}
                            />
                            <div>
                                <h1 className="text-sm font-extrabold tracking-wider text-white">OCMS</h1>
                                <p className="text-[10px] font-bold text-[#d4af37] tracking-widest">NCB INTERPOL</p>
                            </div>
                        </div>

                        {/* Navigation Menu */}
                        <nav className="space-y-2">
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/10 text-[#d4af37] border-l-4 border-[#d4af37] font-semibold text-sm transition"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
                                </svg>
                                Dashboard
                            </Link>

                            {['Daftar Pencarian Orang', 'Manajemen Kasus', 'Intelijen Operasional', 'Laporan Statistik', 'Pengaturan Sistem'].map((menu) => (
                                <button
                                    key={menu}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white font-medium text-sm transition text-left"
                                    onClick={() => alert(`${menu} - Segera Hadir`)}
                                >
                                    <svg className="h-5 w-5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 002 2v12a2 2 0 002 2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                    {menu}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Bottom Sidebar */}
                    <div className="border-t border-white/10 pt-4 text-center">
                        <p className="text-[10px] text-gray-500 font-bold tracking-widest">
                            &copy; 2024 NCB INTERPOL
                        </p>
                        <p className="text-[9px] text-[#d4af37] font-semibold tracking-widest uppercase mt-0.5">
                            INDONESIA
                        </p>
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
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Profile & Notifications */}
                        <div className="flex items-center gap-6">
                            {/* Notification */}
                            <button className="relative p-2 hover:bg-white/5 rounded-full text-gray-300 hover:text-white transition">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
                            </button>

                            {/* Divider */}
                            <div className="h-8 w-px bg-white/10 hidden sm:block" />

                            {/* User Profile */}
                            <div className="flex items-center gap-3">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-semibold text-white">{auth.user.name}</p>
                                    <p className="text-[10px] text-[#d4af37] font-bold tracking-widest uppercase">Pusat Komando Operasional</p>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#d4af37] to-yellow-600 flex items-center justify-center font-extrabold text-sm text-[#001b3d] shadow-md border border-white/20 select-none">
                                    {getUserInitials(auth.user.name)}
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

                    {/* 3. MAIN CONTENT */}
                    <main className="flex-1 p-6 md:p-8 space-y-8">

                        {/* 4. SUMMARY CARDS */}
                        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Card 1: Kasus Aktif */}
                            <div className="bg-[#031433]/65 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:border-[#d4af37]/60 transition group relative overflow-hidden">
                                <div className="absolute top-0 right-0 h-16 w-16 bg-[#d4af37]/5 rounded-bl-full flex items-center justify-center group-hover:bg-[#d4af37]/10 transition" />
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Kasus Aktif</span>
                                    <svg className="h-6 w-6 text-[#d4af37] opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <p className="text-3xl font-extrabold mt-3 text-white">{activeOperationsCount}</p>
                                <p className="text-[10px] text-gray-400 mt-2">Kasus dalam penanganan aktif</p>
                            </div>

                            {/* Card 2: Red Notices */}
                            <div className="bg-[#031433]/65 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:border-red-500/60 transition group relative overflow-hidden">
                                <div className="absolute top-0 right-0 h-16 w-16 bg-red-500/5 rounded-bl-full flex items-center justify-center group-hover:bg-red-500/10 transition" />
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Red Notices</span>
                                    <svg className="h-6 w-6 text-red-500 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <p className="text-3xl font-extrabold mt-3 text-white">--</p>
                                <p className="text-[10px] text-gray-500 mt-2">Statistik backend belum terhubung</p>
                            </div>

                            {/* Card 3: Menunggu Persetujuan */}
                            <div className="bg-[#031433]/65 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:border-yellow-500/60 transition group relative overflow-hidden">
                                <div className="absolute top-0 right-0 h-16 w-16 bg-yellow-500/5 rounded-bl-full flex items-center justify-center group-hover:bg-yellow-500/10 transition" />
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Menunggu Persetujuan</span>
                                    <svg className="h-6 w-6 text-yellow-500 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <p className="text-3xl font-extrabold mt-3 text-white">--</p>
                                <p className="text-[10px] text-gray-500 mt-2">Data persetujuan belum dikonfigurasi</p>
                            </div>

                            {/* Card 4: Skor Kesiapan */}
                            <div className="bg-[#031433]/65 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:border-emerald-500/60 transition group relative overflow-hidden">
                                <div className="absolute top-0 right-0 h-16 w-16 bg-emerald-500/5 rounded-bl-full flex items-center justify-center group-hover:bg-emerald-500/10 transition" />
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Skor Kesiapan</span>
                                    <svg className="h-6 w-6 text-emerald-500 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <p className="text-3xl font-extrabold mt-3 text-white">--</p>
                                <p className="text-[10px] text-gray-500 mt-2">Aggregate readiness belum tersedia di backend</p>
                            </div>
                        </section>

                        {/* 5. TABLE & RISK REGIONAL SIDEBAR GRID */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                            {/* LEFT TABLE: Operasi Prioritas Tinggi */}
                            <div className="lg:col-span-2 bg-[#031433]/65 backdrop-blur-md border border-white/10 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Operasi Prioritas Tinggi</h3>
                                        <p className="text-xs text-gray-400">Daftar kasus operasi aktif OCMS</p>
                                    </div>
                                    <button
                                        onClick={() => alert('Fitur Lihat Semua Kasus segera tersedia.')}
                                        className="text-xs text-[#d4af37] hover:underline font-semibold"
                                    >
                                        Lihat Semua
                                    </button>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm text-gray-300">
                                        <thead className="text-[11px] text-gray-400 uppercase tracking-wider border-b border-white/10">
                                            <tr>
                                                <th className="py-3 px-4">ID Referensi</th>
                                                <th className="py-3 px-4">Nama Operasi</th>
                                                <th className="py-3 px-4">Tipe</th>
                                                <th className="py-3 px-4 text-center">Status</th>
                                                <th className="py-3 px-4 text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {filteredOperations.length > 0 ? (
                                                filteredOperations.map(op => (
                                                    <tr key={op.id} className="hover:bg-white/5 transition">
                                                        <td className="py-4 px-4 font-mono text-xs font-semibold text-[#d4af37]">{op.operation_number}</td>
                                                        <td className="py-4 px-4 font-semibold text-white">{op.name}</td>
                                                        <td className="py-4 px-4 text-xs text-gray-400">
                                                            {op.targets && op.targets.length > 0
                                                                ? `${op.targets[0].nationality || 'Transnational'} Subject`
                                                                : 'Transnational Crime'}
                                                        </td>
                                                        <td className="py-4 px-4 text-center">
                                                            <span className={`inline-flex px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                                                op.status === 'READY' || op.status === 'Completed'
                                                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                                    : op.status === 'PARTIALLY_READY' || op.status === 'Verification'
                                                                    ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                                                    : op.status === 'PENDING_CONFIGURATION'
                                                                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                                                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                            }`}>
                                                                {op.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-4 text-right">
                                                            <Link
                                                                href={`/operations/${op.id}`}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#d4af37]/10 hover:bg-[#d4af37]/20 text-[#d4af37] text-xs font-semibold tracking-wide transition"
                                                            >
                                                                Detail
                                                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                                </svg>
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="py-8 text-center text-gray-500 text-sm">
                                                        Tidak ada data operasi aktif yang ditemukan.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* RIGHT SIDEBAR: Penilaian Risiko Regional (Placeholders) */}
                            <div className="bg-[#031433]/65 backdrop-blur-md border border-white/10 rounded-xl p-6 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-2">Penilaian Risiko Regional</h3>
                                    <p className="text-xs text-gray-500 mb-6">Peta kerentanan ancaman nasional berdasarkan statistik intelijen terbaru.</p>

                                    <div className="space-y-6">
                                        {[
                                            { name: 'Kejahatan Transnasional', level: 'Tinggi', score: 85, color: 'bg-red-500' },
                                            { name: 'Kejahatan Siber', level: 'Sedang-Tinggi', score: 70, color: 'bg-orange-500' },
                                            { name: 'Terorisme', level: 'Sedang', score: 50, color: 'bg-yellow-500' },
                                            { name: 'Kejahatan Lingkungan', level: 'Rendah-Sedang', score: 30, color: 'bg-blue-500' }
                                        ].map((risk) => (
                                            <div key={risk.name} className="space-y-2">
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="font-semibold text-gray-300">{risk.name}</span>
                                                    <span className="font-bold text-gray-400">{risk.level} (--%)</span>
                                                </div>
                                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                                    <div className={`h-full ${risk.color} rounded-full`} style={{ width: `${risk.score}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-8 pt-4 border-t border-white/10 text-center">
                                    <p className="text-[10px] text-gray-500">
                                        * Sumber: Visualiasi dashboard placeholder. Koneksi database risikologi belum tersedia.
                                    </p>
                                </div>
                            </div>
                        </div>

                    </main>
                </div>
            </div>

            {/* 8. FOOTER */}
            <footer className="h-12 bg-black/40 backdrop-blur-md border-t border-[#d4af37]/20 flex items-center justify-center z-30">
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
