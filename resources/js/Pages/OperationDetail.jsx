import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import NotificationDropdown from '@/Components/NotificationDropdown';

export default function OperationDetail({ auth, operation, readiness }) {
    const [activeTab, setActiveTab] = useState('overview');
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    const handleStatusChange = (itemId, newStatus) => {
        router.post(`/checklists/${itemId}/status`, {
            status: newStatus
        }, {
            preserveScroll: true
        });
    };

    const getStatusBadgeClass = (status) => {
        const s = (status || '').toLowerCase();
        if (s === 'ready' || s === 'completed' || s === 'success' || s === 'aktif' || s === 'active') {
            return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
        }
        if (s === 'preparation' || s === 'verification' || s === 'pending' || s === 'partially_ready') {
            return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
        }
        if (s === 'failed' || s === 'rejected' || s === 'closed') {
            return 'bg-red-500/10 text-red-400 border border-red-500/20';
        }
        return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
    };

    const getPriorityBadgeClass = (priority) => {
        const p = (priority || '').toLowerCase();
        if (p === 'high' || p === 'critical') {
            return 'bg-red-500/10 text-red-400 border border-red-500/20';
        }
        if (p === 'medium') {
            return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
        }
        if (p === 'low') {
            return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
        }
        return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const day = date.getDate();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    };

    const getUserInitials = (name) => {
        return name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U';
    };

    return (
        <div className="min-h-screen bg-[#001b3d] font-sans text-white flex flex-col justify-between">
            <Head title={`Detail - ${operation.name}`} />

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
                                className="h-16 w-auto object-contain"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23d4af37'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 009 11c0-3.517 1.009-6.799 2.753-9.571m-3.44 2.04A13.916 13.916 0 009 11c0 3.517 1.009 6.799 2.753 9.571m3 0c1.744-2.772 2.753-6.054 2.753-9.571 0-3.517-1.009-6.799-2.753-9.571m-3 0c-1.744 2.772-2.753 6.054-2.753 9.571'/%3E%3C/svg%3E";
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
                                href="/dashboard"
                                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white font-medium text-sm transition"
                            >
                                <svg className="h-5 w-5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

                            {/* Manajemen Kasus is active */}
                            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/10 text-[#d4af37] border-l-4 border-[#d4af37] font-semibold text-sm">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                                Manajemen Kasus
                            </div>

                            {['Intelijen Operasional', 'Laporan Statistik', 'Pengaturan Sistem'].map((menu) => (
                                <button
                                    key={menu}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white font-medium text-sm transition text-left"
                                    onClick={() => alert(`${menu} - Segera Hadir`)}
                                >
                                    <svg className="h-5 w-5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                    {menu}
                                </button>
                            ))}
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
                                    placeholder="Pencarian Cepat..."
                                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition"
                                    readOnly
                                />
                            </div>
                        </div>

                        {/* Profile & Notifications */}
                        <div className="flex items-center gap-6">
                            <NotificationDropdown />
                            <div className="h-8 w-px bg-white/10 hidden sm:block" />

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

                    {/* MAIN CONTENT AREA */}
                    <main className="flex-1 p-6 md:p-8">
                        {/* Page header title & back link inside container */}
                        <div className="flex items-center gap-4 mb-6">
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-white/10 bg-[#031433]/80 hover:bg-[#d4af37]/20 text-[#d4af37] transition shadow-md"
                                title="Kembali ke Dashboard"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </Link>
                            <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-extrabold text-white leading-tight">
                                        Detail Operasi: <span className="text-[#d4af37] font-mono">{operation.operation_number}</span>
                                    </h2>
                                    <p className="text-xs text-gray-400 mt-0.5">NCB Interpol Command Center</p>
                                </div>
                                {(auth.user.role === 'admin' || auth.user.role === 'pimpinan') && (
                                    <div className="flex gap-3">
                                        <button className="px-4 py-2 bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/50 rounded text-xs font-bold uppercase tracking-wider hover:bg-[#d4af37]/20 transition shadow-sm" onClick={() => alert('Fitur Ubah Status sedang dikembangkan')}>
                                            Ubah Status
                                        </button>
                                        <button className="px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/50 rounded text-xs font-bold uppercase tracking-wider hover:bg-emerald-500/20 transition shadow-sm" onClick={() => alert('Fitur Approve Readiness sedang dikembangkan')}>
                                            Approve
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Content Card with overview visual details */}
                        <div className="overflow-hidden bg-[rgba(10,31,73,0.7)] border border-white/10 shadow-lg sm:rounded-lg p-6 backdrop-blur-md text-white">

                            {/* Tabs Navigation */}
                            <div className="border-b border-white/10 mb-6">
                                <nav className="-mb-px flex space-x-8">
                                    {['overview', 'target', 'checklist', 'readiness'].map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`${
                                                activeTab === tab
                                                    ? 'border-[#d4af37] text-[#d4af37]'
                                                    : 'border-transparent text-gray-400 hover:text-white hover:border-white/20'
                                            } whitespace-nowrap py-4 px-1 border-b-2 font-bold text-xs uppercase tracking-wider transition`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            {/* Tab: Overview */}
                            {activeTab === 'overview' && (
                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-lg font-bold text-[#d4af37] border-b border-white/10 pb-3 flex items-center gap-2">
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Overview
                                        </h3>

                                        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {/* Operation Name */}
                                            <div className="bg-[#001b3d]/50 p-5 rounded-lg border border-white/5">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Operation Name</p>
                                                <p className="font-extrabold text-lg text-white mt-1">{operation.name}</p>
                                            </div>

                                            {/* Status */}
                                            <div className="bg-[#001b3d]/50 p-5 rounded-lg border border-white/5">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status</p>
                                                <div className="mt-1">
                                                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusBadgeClass(operation.status)}`}>
                                                        {operation.status.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Priority */}
                                            <div className="bg-[#001b3d]/50 p-5 rounded-lg border border-white/5">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Priority</p>
                                                <div className="mt-1">
                                                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getPriorityBadgeClass(operation.priority)}`}>
                                                        {operation.priority}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Information Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                                        {/* Card 1: Date Initiated */}
                                        <div className="bg-black/20 border border-white/10 rounded-lg p-5 flex flex-col justify-between">
                                            <div className="flex justify-between items-start">
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date Initiated</span>
                                                <svg className="h-5 w-5 text-[#d4af37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <p className="font-extrabold text-base text-white mt-4">{formatDate(operation.created_at)}</p>
                                        </div>

                                        {/* Card 2: Lead Investigator */}
                                        <div className="bg-black/20 border border-white/10 rounded-lg p-5 flex flex-col justify-between">
                                            <div className="flex justify-between items-start">
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Lead Investigator</span>
                                                <svg className="h-5 w-5 text-[#d4af37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            <p className="font-extrabold text-base text-white mt-4">
                                                {operation.pic?.name || (operation.pic_id ? `PIC ID: ${operation.pic_id}` : 'PIC ID: -')}
                                            </p>
                                        </div>

                                        {/* Card 3: Related Target ID */}
                                        <div className="bg-black/20 border border-white/10 rounded-lg p-5 flex flex-col justify-between">
                                            <div className="flex justify-between items-start">
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Related Target ID</span>
                                                <svg className="h-5 w-5 text-[#d4af37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                                </svg>
                                            </div>
                                            <p className="font-extrabold text-base text-white mt-4 font-mono">
                                                {operation.targets && operation.targets.length > 0
                                                    ? (operation.targets[0].red_notice_ref || operation.targets[0].id)
                                                    : 'No target assigned'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab: Target */}
                            {activeTab === 'target' && (
                                <div>
                                    <h3 className="text-lg font-bold text-[#d4af37] border-b border-white/10 pb-3 mb-4">Targets</h3>
                                    {operation.targets.length > 0 ? (
                                        operation.targets.map(target => (
                                            <div key={target.id} className="mt-4 border border-white/10 p-5 rounded bg-[#001b3d]/50 grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div>
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Name</p>
                                                    <p className="font-extrabold text-base text-white mt-1">{target.name}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Alias</p>
                                                    <p className="font-extrabold text-base text-white mt-1">{target.alias || '-'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Red Notice Ref</p>
                                                    <p className="font-extrabold text-base text-white mt-1 font-mono">{target.red_notice_ref || '-'}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="mt-4 text-gray-400 text-sm">No targets assigned to this operation.</p>
                                    )}
                                </div>
                            )}

                            {/* Tab: Checklist Engine */}
                            {activeTab === 'checklist' && (
                                <div>
                                    <h3 className="text-lg font-bold text-[#d4af37] border-b border-white/10 pb-3 mb-6">Checklist Engine</h3>
                                    {operation.checklists.length > 0 ? (
                                        operation.checklists.map(checklist => (
                                            <div key={checklist.id} className="mb-6 border border-white/10 rounded-lg shadow-sm bg-[#001b3d]/50 overflow-hidden">
                                                <div className="bg-[#031433]/70 px-4 py-3 border-b border-white/10 flex justify-between items-center">
                                                    <h4 className="font-bold text-white text-sm">{checklist.template?.name}</h4>
                                                </div>
                                                <ul className="divide-y divide-white/5">
                                                    {checklist.items.map(item => (
                                                        <li key={item.id} className="p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 hover:bg-white/5 transition">
                                                            <div className="space-y-1">
                                                                <span className="font-medium text-white flex items-center gap-1.5">
                                                                    {item.template_item?.name}
                                                                    {item.template_item?.is_mandatory && <span className="text-red-500 font-bold" title="Mandatory">*</span>}
                                                                    {item.template_item?.is_critical && <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-red-500/10 text-red-400 border border-red-500/20 uppercase">CRITICAL</span>}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-3 self-end sm:self-auto">
                                                                <select
                                                                    className="text-xs bg-[#031433] border-white/10 text-white rounded-md shadow-sm focus:border-[#d4af37] focus:ring-[#d4af37]"
                                                                    value={item.status}
                                                                    onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                                                    disabled={
                                                                        (auth.user.role === 'staf' && (item.status === 'Verified' || item.status === 'Rejected'))
                                                                    }
                                                                >
                                                                    <option value="Not Started" disabled={auth.user.role !== 'staf'}>Not Started</option>
                                                                    <option value="In Progress" disabled={auth.user.role !== 'staf'}>In Progress</option>
                                                                    <option value="Completed" disabled={auth.user.role !== 'staf'}>Completed</option>
                                                                    {(auth.user.role === 'admin' || auth.user.role === 'pimpinan' || item.status === 'Verified' || item.status === 'Rejected') && (
                                                                        <>
                                                                            <option value="Verified" disabled={auth.user.role === 'staf'}>Verified</option>
                                                                            <option value="Rejected" disabled={auth.user.role === 'staf'}>Rejected</option>
                                                                        </>
                                                                    )}
                                                                </select>
                                                                <span className={`px-2.5 py-0.5 text-[10px] rounded-full font-bold uppercase tracking-wider ${
                                                                    item.status === 'Verified' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                                                    item.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                                    item.status === 'In Progress' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                                                    item.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                                    'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                                                                }`}>
                                                                    {item.status}
                                                                </span>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="mt-4 text-gray-400 text-sm">No checklists available for this operation.</p>
                                    )}
                                </div>
                            )}

                            {/* Tab: Readiness */}
                            {activeTab === 'readiness' && readiness && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                        <h3 className="text-lg font-bold text-[#d4af37]">Readiness Assessment & Weighted Score</h3>
                                        {readiness.trend && (
                                            <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider flex items-center gap-1 ${
                                                readiness.trend === 'UP' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                readiness.trend === 'DOWN' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                            }`}>
                                                {readiness.trend === 'UP' ? '▲ Trend Naik' : readiness.trend === 'DOWN' ? '▼ Trend Turun' : '● Trend Stabil'}
                                            </span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                        <div className="bg-[#001b3d]/50 border border-white/10 rounded-lg p-5 shadow-sm flex flex-col items-center justify-center">
                                            <span className="text-sm text-gray-400 font-medium">Weighted Score</span>
                                            <span className="text-4xl font-extrabold text-[#d4af37] mt-2">{readiness.score}%</span>
                                        </div>
                                        <div className="bg-[#001b3d]/50 border border-white/10 rounded-lg p-5 shadow-sm flex flex-col items-center justify-center">
                                            <span className="text-sm text-gray-400 font-medium">Status Kesiapan</span>
                                            <span className={`inline-flex items-center px-3 py-1 mt-3 rounded-full text-xs font-bold uppercase tracking-wider ${
                                                readiness.status === 'READY' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                readiness.status === 'PARTIALLY_READY' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                                readiness.status === 'PENDING_CONFIGURATION' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                            }`}>
                                                {readiness.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <div className="bg-[#001b3d]/50 border border-white/10 rounded-lg p-5 shadow-sm flex flex-col items-center justify-center">
                                            <span className="text-sm text-gray-400 font-medium">Akumulasi Bobot</span>
                                            <span className="text-2xl font-bold text-white mt-2">{readiness.completed_weight} / {readiness.total_weight}</span>
                                            <span className="text-xs text-gray-500 mt-1">total bobot diselesaikan</span>
                                        </div>
                                        <div className="bg-[#001b3d]/50 border border-white/10 rounded-lg p-5 shadow-sm flex flex-col items-center justify-center">
                                            <span className="text-sm text-gray-400 font-medium">Progress Mandatory</span>
                                            <span className="text-2xl font-bold text-white mt-2">{readiness.completed_mandatory} / {readiness.total_mandatory}</span>
                                            <span className="text-xs text-gray-500 mt-1">item diselesaikan</span>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-blue-500/10 border-l-4 border-blue-500 text-blue-300 rounded-r-md text-sm font-medium">
                                        {readiness.message}
                                    </div>

                                    {/* Snapshot Histori Tren */}
                                    {readiness.history && readiness.history.length > 0 && (
                                        <div className="border border-white/10 rounded-lg p-5 shadow-sm bg-[#001b3d]/50">
                                            <h4 className="font-bold text-[#d4af37] mb-4 flex items-center gap-2">
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                                </svg>
                                                Riwayat Snapshot Skor Kesiapan (Timeline)
                                            </h4>
                                            <div className="flex items-center gap-4 overflow-x-auto pb-2">
                                                {readiness.history.map((snapshot, idx) => (
                                                    <div key={snapshot.id} className="min-w-[140px] bg-white/5 border border-white/10 rounded-lg p-3 text-center">
                                                        <p className="text-[10px] text-gray-400 font-mono">{snapshot.date}</p>
                                                        <p className="text-lg font-extrabold text-[#d4af37] mt-1">{snapshot.score}%</p>
                                                        <span className="text-[9px] font-bold uppercase text-gray-300">{snapshot.status}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="border border-white/10 rounded-lg p-5 shadow-sm bg-[#001b3d]/50">
                                        <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full bg-red-500"></span>
                                            Critical Blockers ({readiness.uncompleted_critical_blockers.length})
                                        </h4>
                                        {readiness.has_uncompleted_critical_blockers ? (
                                            <ul className="divide-y divide-white/5">
                                                {readiness.uncompleted_critical_blockers.map(item => (
                                                    <li key={item.id} className="py-2.5 flex items-center justify-between text-sm">
                                                        <span className="font-medium text-gray-300">{item.name}</span>
                                                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 uppercase">{item.status}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-gray-400">Tidak ada blocker kritis. Semua persyaratan utama terpenuhi atau belum dikonfigurasi.</p>
                                        )}
                                    </div>

                                    <div className="border border-white/10 rounded-lg p-5 shadow-sm bg-[#001b3d]/50">
                                        <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                                            Overdue Items ({readiness.overdue_items.length})
                                        </h4>
                                        {readiness.has_overdue ? (
                                            <ul className="divide-y divide-white/5">
                                                {readiness.overdue_items.map(item => (
                                                    <li key={item.id} className="py-2.5 flex items-center justify-between text-sm">
                                                        <div>
                                                            <p className="font-medium text-gray-300">{item.name}</p>
                                                            {item.deadline && (
                                                                <p className="text-xs text-red-400 mt-0.5">
                                                                    Batas waktu: {new Date(item.deadline).toLocaleString('id-ID')}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 uppercase">{item.status}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-gray-400">Tidak ada item yang melewati batas waktu (overdue).</p>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>
                    </main>
                </div>
            </div>

            {/* 3. FOOTER */}
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
