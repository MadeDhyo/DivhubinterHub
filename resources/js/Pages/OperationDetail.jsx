import DetailSkeleton from '@/Components/Skeleton/DetailSkeleton';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import NotificationDropdown from '@/Components/NotificationDropdown';

export default function OperationDetail({ auth, operation, readiness, auditLogs = [], flash = {} }) {
    const [activeTab, setActiveTab] = useState('overview');
    const [isLoading, setIsLoading] = useState(true);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 400);
        return () => clearTimeout(timer);
    }, []);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showVersionModal, setShowVersionModal] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [openDocTypeDropdown, setOpenDocTypeDropdown] = useState(false);
    const [openClassDropdown, setOpenClassDropdown] = useState(false);
    const [docToDelete, setDocToDelete] = useState(null);

    const DOC_TYPE_OPTIONS = [
        { value: 'IDENTIFIKASI_PROFIL',   label: 'Identifikasi Profil' },
        { value: 'CEK_STATUS_RED_NOTICE', label: 'Cek Status Red Notice' },
        { value: 'SURAT_TUGAS',           label: 'Surat Tugas' },
        { value: 'LAINNYA',               label: 'Lainnya' },
    ];

    const CLASS_OPTIONS = [
        { value: 'SANGAT_RAHASIA', label: 'SANGAT RAHASIA' },
        { value: 'RAHASIA',        label: 'RAHASIA' },
        { value: 'TERBATAS',       label: 'TERBATAS' },
        { value: 'BIASA',          label: 'BIASA' },
    ];

    const uploadForm = useForm({
        operation_id: operation.id,
        title: '',
        document_type: 'IDENTIFIKASI_PROFIL',
        classification_level: 'RAHASIA',
        source_agency: 'NCB Jakarta',
        file: null,
        retention_until: '',
    });

    const versionForm = useForm({
        file: null,
        change_description: '',
    });

    const handleStatusChange = (itemId, newStatus) => {
        router.post(`/checklists/${itemId}/status`, { status: newStatus }, { preserveScroll: true });
    };

    const handleUploadDocument = (e) => {
        e.preventDefault();
        uploadForm.post('/documents', {
            onSuccess: () => { setShowUploadModal(false); uploadForm.reset(); }
        });
    };

    const handleUploadVersion = (e) => {
        e.preventDefault();
        if (!selectedDoc) return;
        versionForm.post(`/documents/${selectedDoc.id}/versions`, {
            onSuccess: () => { setShowVersionModal(false); versionForm.reset(); setSelectedDoc(null); }
        });
    };

    const handleDeleteDocument = () => {
        if (!docToDelete) return;
        router.delete(`/documents/${docToDelete.id}`, {
            preserveScroll: true,
            onSuccess: () => setDocToDelete(null),
            onError:   () => setDocToDelete(null),
        });
    };

    // ── Role helpers ──────────────────────────────────────────────────────
    // staf     → read + download only
    // pimpinan → read + download + update (versi baru)
    // admin    → full CRUD
    const userRole    = auth.user.role;
    const canUpload   = userRole === 'admin';
    const canUpdate   = userRole === 'admin' || userRole === 'pimpinan';
    const canDelete   = userRole === 'admin';
    const updateLabel = userRole === 'admin' ? '+ Versi Baru' : 'Update';

    const dpoTargets    = operation.dpo_persons || operation.dpoPersons || [];
    const legacyTargets = operation.targets || [];
    const targetsList   = dpoTargets.length > 0 ? dpoTargets : legacyTargets;

    const getStatusBadgeClass = (status) => {
        const s = (status || '').toLowerCase();
        if (s === 'ready' || s === 'completed' || s === 'success' || s === 'aktif' || s === 'active')
            return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
        if (s === 'preparation' || s === 'verification' || s === 'pending' || s === 'partially_ready')
            return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
        if (s === 'failed' || s === 'rejected' || s === 'closed')
            return 'bg-red-500/10 text-red-400 border border-red-500/20';
        return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
    };

    const getPriorityBadgeClass = (priority) => {
        const p = (priority || '').toLowerCase();
        if (p === 'high' || p === 'critical') return 'bg-red-500/10 text-red-400 border border-red-500/20';
        if (p === 'medium') return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
        if (p === 'low')    return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
        return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
    };

    const getClassificationBadge = (level) => {
        switch (level) {
            case 'SANGAT_RAHASIA': return <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">SANGAT RAHASIA</span>;
            case 'RAHASIA':        return <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">RAHASIA</span>;
            case 'TERBATAS':       return <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">TERBATAS</span>;
            default:               return <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-gray-500/10 text-gray-400 border border-gray-500/20">BIASA</span>;
        }
    };

    const getAiStatusBadge = (status) => {
        switch (status) {
            case 'VERIFIED': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">✓ Terverifikasi</span>;
            case 'REJECTED': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 uppercase">✗ Ditolak</span>;
            case 'PENDING':  return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 uppercase animate-pulse">⏳ Proses</span>;
            case 'SKIPPED':  return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-500/10 text-gray-400 border border-gray-500/20 uppercase">— Dilewati</span>;
            default:         return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-500/10 text-gray-400 border border-gray-500/20">-</span>;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const d = new Date(dateString);
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    };

    const getUserInitials = (name) =>
        name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U';

    return (
        <div className="min-h-screen bg-[#001b3d] font-sans text-white flex flex-col justify-between">
            <Head title={`Detail - ${operation.name}`} />

            <div className="flex flex-1 relative">
                {/* SIDEBAR */}
                <aside className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#031433]/85 backdrop-blur-md border-r border-white/10 flex flex-col justify-between p-6 transition-transform duration-300 md:translate-x-0 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="space-y-8">
                        <div className="flex items-center gap-3 border-b border-white/10 pb-6">
                            <img src="/images/INTERPOL_Logo.png" alt="Logo INTERPOL" className="h-10 w-auto object-contain"
                                onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23d4af37'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 009 11c0-3.517 1.009-6.799 2.753-9.571m-3.44 2.04A13.916 13.916 0 009 11c0 3.517 1.009 6.799 2.753 9.571m3 0c1.744-2.772 2.753-6.054 2.753-9.571 0-3.517-1.009-6.799-2.753-9.571m-3 0c-1.744 2.772-2.753 6.054-2.753 9.571'/%3E%3C/svg%3E"; }}
                            />
                            <div>
                                <h1 className="text-sm font-extrabold tracking-wider text-white">OCMS</h1>
                                <p className="text-[10px] font-bold text-[#d4af37] tracking-widest">NCB INTERPOL</p>
                            </div>
                        </div>

                        <nav className="space-y-2">
                            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white font-medium text-sm transition">
                                <svg className="h-5 w-5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" /></svg>
                                Dashboard
                            </Link>
                            <Link href="/dpo" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white font-medium text-sm transition text-left">
                                <svg className="h-5 w-5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                Daftar Pencarian Orang
                            </Link>
                            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/10 text-[#d4af37] border-l-4 border-[#d4af37] font-semibold text-sm">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                                Manajemen Kasus
                            </div>
                            {['Intelijen Operasional', 'Laporan Statistik', 'Pengaturan Sistem'].map((menu) => (
                                <button key={menu} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white font-medium text-sm transition text-left" onClick={() => alert(`${menu} - Segera Hadir`)}>
                                    <svg className="h-5 w-5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                                    {menu}
                                </button>
                            ))}
                        </nav>
                    </div>
                    <div className="border-t border-white/10 pt-4 text-center">
                        <p className="text-[10px] text-gray-500 font-bold tracking-widest">&copy; 2024 NCB INTERPOL</p>
                        <p className="text-[9px] text-[#d4af37] font-semibold tracking-widest uppercase mt-0.5">INDONESIA</p>
                    </div>
                </aside>

                {isMobileSidebarOpen && <div className="fixed inset-0 z-30 bg-black/60 md:hidden" onClick={() => setIsMobileSidebarOpen(false)} />}

                {/* MAIN CONTENT */}
                <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
                    {/* HEADER */}
                    <header className="h-20 border-b border-white/10 bg-[#031433]/40 backdrop-blur-md px-6 md:px-8 flex items-center justify-between sticky top-0 z-20">
                        <button className="md:hidden p-2 hover:bg-white/5 rounded text-gray-300" onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                        <div className="flex-1 max-w-md mx-4 md:mx-0">
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </span>
                                <input type="text" placeholder="Pencarian Cepat..." className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition" readOnly />
                            </div>
                        </div>
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
                                <Link href="/logout" method="post" as="button" className="p-1.5 hover:bg-red-500/10 hover:text-red-400 rounded text-gray-400 transition" title="Log Out">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                </Link>
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 p-6 md:p-8">
                        {isLoading ? (
                            <DetailSkeleton />
                        ) : (
                            <div className="space-y-6 animate-fade-in-up">
                                {/* Flash */}
                                {flash?.success && <div className="mb-4 p-4 bg-emerald-500/10 border-l-4 border-emerald-500 text-emerald-300 text-sm rounded">{flash.success}</div>}
                                {flash?.error   && <div className="mb-4 p-4 bg-red-500/10 border-l-4 border-red-500 text-red-300 text-sm rounded">{flash.error}</div>}

                                {/* Page Header */}
                                <div className="flex items-center gap-4 mb-6">
                                    <Link href="/dashboard" className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-white/10 bg-[#031433]/80 hover:bg-[#d4af37]/20 text-[#d4af37] transition duration-300 shadow-md gold-glow-hover" title="Kembali">
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                    </Link>
                                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                            <h2 className="text-xl font-extrabold text-white leading-tight">
                                                Detail Operasi: <span className="text-[#d4af37] font-mono">{operation.operation_number}</span>
                                            </h2>
                                            <p className="text-xs text-gray-400 mt-0.5">NCB Interpol Command Center</p>
                                        </div>
                                        {(userRole === 'admin' || userRole === 'pimpinan') && (
                                            <div className="flex gap-3">
                                                <button className="px-4 py-2 bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/50 rounded text-xs font-bold uppercase tracking-wider hover:bg-[#d4af37]/20 transition shadow-sm" onClick={() => alert('Fitur Ubah Status sedang dikembangkan')}>Ubah Status</button>
                                                <button className="px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/50 rounded text-xs font-bold uppercase tracking-wider hover:bg-emerald-500/20 transition shadow-sm" onClick={() => alert('Fitur Approve Readiness sedang dikembangkan')}>Approve</button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Content Card */}
                                <div className="overflow-hidden bg-[rgba(10,31,73,0.7)] border border-white/10 shadow-lg sm:rounded-lg p-6 backdrop-blur-md">

                                    {/* Tabs */}
                                    <div className="border-b border-white/10 mb-6">
                                        <nav className="-mb-px flex space-x-8 overflow-x-auto">
                                            {['overview', 'target', 'checklist', 'audit_logs', 'readiness'].map(tab => (
                                                <button key={tab} onClick={() => setActiveTab(tab)}
                                                    className={`${activeTab === tab ? 'border-[#d4af37] text-[#d4af37]' : 'border-transparent text-gray-400 hover:text-white hover:border-white/20'} whitespace-nowrap py-4 px-1 border-b-2 font-bold text-xs uppercase tracking-wider transition duration-300`}>
                                                    {tab.replace('_', ' ')}
                                                </button>
                                            ))}
                                        </nav>
                                    </div>

                                    {/* Animated Tab Content Container */}
                                    <div key={activeTab} className="animate-scale-in">
                                        {/* ── TAB: OVERVIEW ── */}
                                        {activeTab === 'overview' && (
                                            <div className="space-y-8">
                                                <div>
                                                    <h3 className="text-lg font-bold text-[#d4af37] border-b border-white/10 pb-3 flex items-center gap-2">
                                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                        Overview
                                                    </h3>
                                                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                                                        <div className="bg-[#001b3d]/50 p-5 rounded-lg border border-white/5 gold-glow-hover">
                                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Operation Name</p>
                                                            <p className="font-extrabold text-lg text-white mt-1">{operation.name}</p>
                                                        </div>
                                                        <div className="bg-[#001b3d]/50 p-5 rounded-lg border border-white/5 gold-glow-hover">
                                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status</p>
                                                            <div className="mt-1"><span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusBadgeClass(operation.status)}`}>{operation.status.replace('_', ' ')}</span></div>
                                                        </div>
                                                        <div className="bg-[#001b3d]/50 p-5 rounded-lg border border-white/5 gold-glow-hover">
                                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Priority</p>
                                                            <div className="mt-1"><span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getPriorityBadgeClass(operation.priority)}`}>{operation.priority}</span></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                                                    <div className="bg-black/20 border border-white/10 rounded-lg p-5 flex flex-col justify-between gold-glow-hover">
                                                        <div className="flex justify-between items-start">
                                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date Initiated</span>
                                                            <svg className="h-5 w-5 text-[#d4af37]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                        </div>
                                                        <p className="font-extrabold text-base text-white mt-4">{formatDate(operation.created_at)}</p>
                                                    </div>
                                                    <div className="bg-black/20 border border-white/10 rounded-lg p-5 flex flex-col justify-between gold-glow-hover">
                                                        <div className="flex justify-between items-start">
                                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Lead Investigator</span>
                                                            <svg className="h-5 w-5 text-[#d4af37]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                                        </div>
                                                        <p className="font-extrabold text-base text-white mt-4">{operation.pic?.name || (operation.pic_id ? `PIC ID: ${operation.pic_id}` : 'PIC ID: -')}</p>
                                                    </div>
                                                    <div className="bg-black/20 border border-white/10 rounded-lg p-5 flex flex-col justify-between gold-glow-hover">
                                                        <div className="flex justify-between items-start">
                                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Subjek DPO Terkait</span>
                                                            <svg className="h-5 w-5 text-[#d4af37]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                                                        </div>
                                                        <p className="font-extrabold text-base text-white mt-4 font-mono truncate">
                                                {targetsList.length > 0 ? (
                                                    targetsList.map(t => t.name).join(', ')
                                                ) : 'Belum ada DPO'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── TAB: TARGET ── */}
                            {activeTab === 'target' && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
                                        <h3 className="text-lg font-bold text-[#d4af37]">Subjek DPO / Target Operasi</h3>
                                        <span className="text-xs font-bold text-gray-400 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                                            Total: {targetsList.length} Subjek DPO
                                        </span>
                                    </div>

                                    {targetsList.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-4">
                                            {targetsList.map(target => (
                                                <div key={target.id} className="border border-white/10 p-5 rounded-xl bg-[#001b3d]/50 hover:border-[#d4af37]/40 transition grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-center gold-glow-hover">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nama Subjek DPO</p>
                                                        <p className="font-extrabold text-base text-white mt-0.5">{target.name}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Alias / Panggilan</p>
                                                        <p className="font-semibold text-sm text-gray-300 mt-0.5">{target.alias || '-'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Red Notice Ref</p>
                                                        <p className="font-bold text-sm text-[#d4af37] font-mono mt-0.5">{target.red_notice_ref || '-'}</p>
                                                    </div>
                                                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0">
                                                        <span className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase ${
                                                            target.status === 'Captured' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                            target.status === 'Deceased' ? 'bg-gray-500/10 text-gray-400 border border-gray-500/20' :
                                                            target.status === 'Withdrawn' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                                            'bg-red-500/10 text-red-400 border border-red-500/20'
                                                        }`}>
                                                            {target.status || 'Aktif'}
                                                        </span>
                                                        <Link href="/dpo" className="text-xs text-[#d4af37] hover:underline font-semibold flex items-center gap-1">
                                                            Detail DPO &rarr;
                                                        </Link>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="mt-4 text-gray-400 text-sm bg-[#001b3d]/30 border border-white/10 p-6 rounded-xl text-center">
                                            Belum ada subjek DPO yang terhubung dengan operasi ini.
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* ── TAB: CHECKLIST ── */}
                            {activeTab === 'checklist' && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-bold text-[#d4af37] border-b border-white/10 pb-3">Checklist &amp; Verifikasi Dokumen</h3>

                                    {operation.checklists.length > 0 ? operation.checklists.map(checklist => (
                                        <div key={checklist.id} className="border border-white/10 rounded-lg bg-[#001b3d]/50 overflow-hidden">
                                            <div className="bg-[#031433]/70 px-5 py-3 border-b border-white/10">
                                                <h4 className="font-bold text-white text-sm">{checklist.template?.name}</h4>
                                            </div>
                                            <div className="divide-y divide-white/5">
                                                {checklist.items.map(item => {
                                                    let aiResult = null;
                                                    try { aiResult = item.ai_validation_result ? JSON.parse(item.ai_validation_result) : null; } catch(e) {}
                                                    const isRejected = item.status === 'Rejected';
                                                    const isVerified = item.status === 'Verified';

                                                    return (
                                                        <div key={item.id} className="p-5 hover:bg-white/5 transition duration-200">
                                                            {/* Row 1: Nama + Status selector */}
                                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <span className="font-semibold text-white">{item.template_item?.name}</span>
                                                                    {item.template_item?.is_mandatory && <span className="text-red-500 font-bold text-sm" title="Mandatory">*</span>}
                                                                    {item.template_item?.is_critical && <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-red-500/10 text-red-400 border border-red-500/20 uppercase animate-pulse">CRITICAL</span>}
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`px-3 py-1 text-xs rounded-full font-bold uppercase tracking-wider ${
                                                                        isVerified   ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                                                        item.status === 'Completed'  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                                        item.status === 'In Progress'? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                                                        isRejected   ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                                        'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                                                                    }`}>{item.status}</span>
                                                                </div>
                                                            </div>




                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )) : <p className="text-gray-400 text-sm">No checklists available for this operation.</p>}

                                    {/* Mini Repository di dalam Checklist */}
                                    <div className="border border-white/10 rounded-lg bg-[#001b3d]/50 overflow-hidden">
                                        <div className="bg-[#031433]/70 px-5 py-3 border-b border-white/10 flex items-center justify-between">
                                            <div>
                                                <h4 className="font-bold text-white text-sm">Repository Dokumen Operasi</h4>
                                                <p className="text-[11px] text-gray-400 mt-0.5">Terenkripsi AES-256 · Verifikasi integritas SHA-256</p>
                                            </div>
                                            {canUpload && (
                                                <button onClick={() => setShowUploadModal(true)} className="px-3 py-1.5 bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30 rounded text-[10px] font-bold uppercase tracking-wider hover:bg-[#d4af37]/20 transition">
                                                    + Unggah Dokumen
                                                </button>
                                            )}
                                        </div>

                                        {operation.documents && operation.documents.length > 0 ? (
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-white/5">
                                                    <thead className="bg-[#031433]/40">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Dokumen</th>
                                                            <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Jenis</th>
                                                            <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Klasifikasi</th>
                                                            <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status AI</th>
                                                            <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider min-w-[200px]">Alasan AI</th>
                                                            <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Versi</th>
                                                            <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Diunggah</th>
                                                            <th className="px-4 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-wider">Aksi</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-white/5">
                                                        {operation.documents.map(doc => {
                                                            return (
                                                                <tr key={doc.id} className="hover:bg-white/[0.02] transition">
                                                                    <td className="px-4 py-3">
                                                                        <p className="text-[11px] font-bold text-white">{doc.title}</p>
                                                                        <p className="text-[10px] text-gray-500 font-mono">{doc.document_number}</p>
                                                                    </td>
                                                                    <td className="px-4 py-3 text-[10px] text-gray-300">{doc.document_type?.replace(/_/g, ' ')}</td>
                                                                    <td className="px-4 py-3">{getClassificationBadge(doc.classification_level)}</td>
                                                                    <td className="px-4 py-3">{getAiStatusBadge(doc.ai_verification_status)}</td>
                                                                    <td className="px-4 py-3">
                                                                        {(() => {
                                                                            let reason = null;
                                                                            try {
                                                                                const p = doc.ai_verification_result ? JSON.parse(doc.ai_verification_result) : null;
                                                                                reason = p?.reason || doc.ai_verification_result;
                                                                            } catch(e) { reason = doc.ai_verification_result; }
                                                                            return reason
                                                                                ? <p className="text-[10px] text-gray-300 leading-relaxed max-w-[220px]">{reason}</p>
                                                                                : <span className="text-[10px] text-gray-600 italic">-</span>;
                                                                        })()}
                                                                    </td>
                                                                    <td className="px-4 py-3">
                                                                        <div className="font-medium text-[#d4af37] text-[10px]">v{doc.current_version}</div>
                                                                        {doc.versions?.[0] && <div className="text-[9px] text-gray-500 font-mono">SHA: {doc.versions[0].checksum_sha256?.substring(0, 10)}...</div>}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-[10px] text-gray-400">{doc.uploader?.name || 'Officer'}</td>
                                                                    <td className="px-4 py-3 text-right space-x-1">
                                                                        <a href={`/documents/${doc.id}/download`} target="_blank" className="inline-block px-2.5 py-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded text-[10px] font-medium border border-emerald-500/20">Unduh</a>
                                                                        {canUpdate && (
                                                                            <button onClick={() => { setSelectedDoc(doc); setShowVersionModal(true); }} className="px-2.5 py-1 bg-[#d4af37]/10 text-[#d4af37] hover:bg-[#d4af37]/20 rounded text-[10px] font-medium border border-[#d4af37]/20">{updateLabel}</button>
                                                                        )}
                                                                        {canDelete && (
                                                                            <button onClick={() => setDocToDelete(doc)} className="px-2.5 py-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded text-[10px] font-medium border border-red-500/20">Hapus</button>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="p-8 text-center"><p className="text-gray-500 text-sm">Belum ada dokumen operasional yang diunggah.</p></div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ── TAB: DOCUMENTS ── */}
                            {activeTab === 'documents' && (
                                <div>
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-[#d4af37] border-b border-white/10 pb-3">Repository Dokumen Operasi</h3>
                                            <p className="text-sm text-gray-400 mt-2">Seluruh dokumen terenkripsi AES-256 dan dilindungi verifikasi integritas SHA-256.</p>
                                        </div>
                                        {canUpload && (
                                            <button onClick={() => setShowUploadModal(true)} className="px-4 py-2 bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/50 rounded text-xs font-bold uppercase tracking-wider hover:bg-[#d4af37]/20 transition shadow-sm flex items-center gap-2">
                                                + Unggah Dokumen Baru
                                            </button>
                                        )}
                                    </div>

                                    {operation.documents && operation.documents.length > 0 ? (
                                        <div className="overflow-x-auto border border-white/10 rounded-lg shadow-sm">
                                            <table className="min-w-full divide-y divide-white/10">
                                                <thead className="bg-[#031433]/70">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">No. Dokumen &amp; Judul</th>
                                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Jenis</th>
                                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Kerahasiaan</th>
                                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status AI</th>
                                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider min-w-[220px]">Alasan / Catatan AI</th>
                                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Versi</th>
                                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Diunggah Oleh</th>
                                                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Aksi</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/10">
                                                    {operation.documents.map(doc => {
                                                        const latestVer = doc.versions?.[0];
                                                        let aiReason = null;
                                                        try {
                                                            const parsed = doc.ai_verification_notes ? JSON.parse(doc.ai_verification_notes) : null;
                                                            aiReason = parsed?.reason || doc.ai_verification_notes;
                                                        } catch(e) { aiReason = doc.ai_verification_notes; }

                                                        return (
                                                            <tr key={doc.id} className="hover:bg-white/[0.02] transition">
                                                                <td className="px-4 py-3">
                                                                    <p className="text-sm font-bold text-white">{doc.title}</p>
                                                                    <p className="text-xs text-gray-500 font-mono">{doc.document_number}</p>
                                                                </td>
                                                                <td className="px-4 py-3 text-xs text-gray-300">{doc.document_type?.replace(/_/g, ' ')}</td>
                                                                <td className="px-4 py-3">{getClassificationBadge(doc.classification_level)}</td>
                                                                <td className="px-4 py-3">{getAiStatusBadge(doc.ai_verification_status)}</td>
                                                                <td className="px-4 py-3">
                                                                    {aiReason ? (
                                                                        <p className="text-xs text-gray-300 leading-relaxed max-w-xs">{aiReason}</p>
                                                                    ) : (
                                                                        <span className="text-[11px] text-gray-500 italic">-</span>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <div className="font-medium text-[#d4af37] text-xs">v{doc.current_version}</div>
                                                                    {latestVer && <div className="text-[10px] text-gray-500 font-mono" title={latestVer.checksum_sha256}>SHA: {latestVer.checksum_sha256?.substring(0, 10)}...</div>}
                                                                </td>
                                                                <td className="px-4 py-3 text-xs text-gray-400">{doc.uploader?.name || 'Officer'}</td>
                                                                <td className="px-4 py-3 text-right space-x-2">
                                                                    <a href={`/documents/${doc.id}/download`} target="_blank" className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded text-xs font-medium border border-emerald-500/20" title="Unduh Berkas">Unduh</a>
                                                                    {canUpdate && (
                                                                        <button onClick={() => { setSelectedDoc(doc); setShowVersionModal(true); }} className="px-2.5 py-1 bg-[#d4af37]/10 text-[#d4af37] hover:bg-[#d4af37]/20 rounded text-xs font-medium border border-[#d4af37]/20">{updateLabel}</button>
                                                                    )}
                                                                    {canDelete && (
                                                                        <button onClick={() => setDocToDelete(doc)} className="px-2.5 py-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded text-xs font-medium border border-red-500/20">Hapus</button>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center border-2 border-dashed border-white/10 rounded-lg bg-[#001b3d]/50">
                                            <p className="text-gray-400">Belum ada dokumen operasional yang diunggah.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── TAB: AUDIT LOGS ── */}
                            {activeTab === 'audit_logs' && (
                                <div>
                                    <div className="mb-4">
                                        <h3 className="text-lg font-bold text-[#d4af37] border-b border-white/10 pb-3">Audit Trail System (Tamper-Evident Logs)</h3>
                                        <p className="text-sm text-gray-400 mt-2">Jejak aktivitas kronologis terlindungi dengan HMAC-SHA256 hash berantai.</p>
                                    </div>
                                    <div className="overflow-x-auto border border-white/10 rounded-lg shadow-sm">
                                        <table className="min-w-full divide-y divide-white/10">
                                            <thead className="bg-[#031433]/70">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Waktu</th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Pengguna</th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Modul</th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Aksi</th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Entitas</th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Hash</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {auditLogs.length > 0 ? auditLogs.map(log => (
                                                    <tr key={log.id} className="hover:bg-white/[0.02] transition text-xs">
                                                        <td className="px-4 py-3 text-gray-400 font-mono whitespace-nowrap">{new Date(log.created_at).toLocaleString('id-ID')}</td>
                                                        <td className="px-4 py-3 text-white">{log.actor?.name || 'System'}</td>
                                                        <td className="px-4 py-3"><span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono text-[10px]">{log.module}</span></td>
                                                        <td className="px-4 py-3 font-mono text-yellow-400">{log.action_type}</td>
                                                        <td className="px-4 py-3 text-gray-300">{log.entity_name} #{log.entity_id}</td>
                                                        <td className="px-4 py-3 font-mono text-gray-600 text-[10px]" title={log.log_hash}>{log.log_hash?.substring(0, 12)}...</td>
                                                    </tr>
                                                )) : (
                                                    <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-500 text-sm">Belum ada log aktivitas untuk operasi ini.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* ── TAB: READINESS ── */}
                            {activeTab === 'readiness' && readiness && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                        <h3 className="text-lg font-bold text-[#d4af37]">Readiness Assessment &amp; Weighted Score</h3>
                                        {readiness.trend && (
                                            <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider flex items-center gap-1 ${
                                                readiness.trend === 'UP'   ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                readiness.trend === 'DOWN' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                            }`}>
                                                {readiness.trend === 'UP' ? '▲ Trend Naik' : readiness.trend === 'DOWN' ? '▼ Trend Turun' : '● Trend Stabil'}
                                            </span>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                        <div className="bg-[#001b3d]/50 border border-white/10 rounded-lg p-5 shadow-sm flex flex-col items-center justify-center gold-glow-hover">
                                            <span className="text-sm text-gray-400 font-medium">Weighted Score</span>
                                            <span className="text-4xl font-extrabold text-[#d4af37] mt-2">{readiness.score}%</span>
                                        </div>
                                        <div className="bg-[#001b3d]/50 border border-white/10 rounded-lg p-5 shadow-sm flex flex-col items-center justify-center gold-glow-hover">
                                            <span className="text-sm text-gray-400 font-medium">Status Kesiapan</span>
                                            <span className={`inline-flex items-center px-3 py-1 mt-3 rounded-full text-xs font-bold uppercase tracking-wider ${
                                                readiness.status === 'READY'                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                readiness.status === 'PARTIALLY_READY'      ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                                readiness.status === 'PENDING_CONFIGURATION'? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                                                'bg-red-500/10 text-red-400 border border-red-500/20'
                                            }`}>{readiness.status.replace('_', ' ')}</span>
                                        </div>
                                        <div className="bg-[#001b3d]/50 border border-white/10 rounded-lg p-5 shadow-sm flex flex-col items-center justify-center gold-glow-hover">
                                            <span className="text-sm text-gray-400 font-medium">Akumulasi Bobot</span>
                                            <span className="text-2xl font-bold text-white mt-2">{readiness.completed_weight} / {readiness.total_weight}</span>
                                            <span className="text-xs text-gray-500 mt-1">total bobot diselesaikan</span>
                                        </div>
                                        <div className="bg-[#001b3d]/50 border border-white/10 rounded-lg p-5 shadow-sm flex flex-col items-center justify-center gold-glow-hover">
                                            <span className="text-sm text-gray-400 font-medium">Progress Mandatory</span>
                                            <span className="text-2xl font-bold text-white mt-2">{readiness.completed_mandatory} / {readiness.total_mandatory}</span>
                                            <span className="text-xs text-gray-500 mt-1">item diselesaikan</span>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-blue-500/10 border-l-4 border-blue-500 text-blue-300 rounded-r-md text-sm font-medium">{readiness.message}</div>
                                    {readiness.history && readiness.history.length > 0 && (
                                        <div className="border border-white/10 rounded-lg p-5 shadow-sm bg-[#001b3d]/50 gold-glow-hover">
                                            <h4 className="font-bold text-[#d4af37] mb-4 flex items-center gap-2">
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                                Riwayat Snapshot Skor Kesiapan (Timeline)
                                            </h4>
                                            <div className="flex items-center gap-4 overflow-x-auto pb-2">
                                                {readiness.history.map((snapshot) => (
                                                    <div key={snapshot.id} className="min-w-[140px] bg-white/5 border border-white/10 rounded-lg p-3 text-center">
                                                        <p className="text-[10px] text-gray-400 font-mono">{snapshot.date}</p>
                                                        <p className="text-lg font-extrabold text-[#d4af37] mt-1">{snapshot.score}%</p>
                                                        <span className="text-[9px] font-bold uppercase text-gray-300">{snapshot.status}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div className="border border-white/10 rounded-lg p-5 shadow-sm bg-[#001b3d]/50 gold-glow-hover">
                                        <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                            </span>
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
                                        ) : <p className="text-sm text-gray-400">Tidak ada blocker kritis. Semua persyaratan utama terpenuhi atau belum dikonfigurasi.</p>}
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
                                                            {item.deadline && <p className="text-xs text-red-400 mt-0.5">Batas waktu: {new Date(item.deadline).toLocaleString('id-ID')}</p>}
                                                        </div>
                                                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 uppercase">{item.status}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : <p className="text-sm text-gray-400">Tidak ada item yang melewati batas waktu (overdue).</p>}
                                    </div>
                                </div>
                            )}

                                    </div>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* FOOTER */}
            <footer className="h-12 bg-black/40 backdrop-blur-md border-t border-[#d4af37]/20 flex items-center justify-center z-30 md:ml-64">
                <p className="text-[9px] font-bold tracking-widest text-gray-400 flex items-center gap-1.5 sm:gap-3">
                    <span>INTEGRITY</span><span className="text-[#d4af37] font-semibold">|</span>
                    <span>COOPERATION</span><span className="text-[#d4af37] font-semibold">|</span>
                    <span>PROFESSIONALISM</span><span className="text-[#d4af37] font-semibold">|</span>
                    <span>INNOVATION</span>
                </p>
            </footer>

            {/* ── MODAL: Upload Dokumen Baru ── */}
            {showUploadModal && (
                <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-[#031433] border border-white/20 rounded-lg max-w-lg w-full p-6 shadow-2xl my-8">
                        <h3 className="text-lg font-bold text-[#d4af37] mb-4">Unggah Dokumen Operasi Baru</h3>
                        <form onSubmit={handleUploadDocument} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">Judul Dokumen</label>
                                <input type="text" required placeholder="Judul dokumen..." value={uploadForm.data.title} onChange={(e) => uploadForm.setData('title', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] placeholder-gray-500" />
                                {uploadForm.errors.title && <p className="text-xs text-red-400 mt-1">{uploadForm.errors.title}</p>}
                            </div>

                            {/* Custom Dropdown: Jenis Dokumen */}
                            <div>
                                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">Jenis Dokumen</label>
                                <div className="relative">
                                    <button type="button" onClick={() => { setOpenDocTypeDropdown(!openDocTypeDropdown); setOpenClassDropdown(false); }}
                                        className="w-full bg-[#001b3d] border border-white/10 rounded-lg px-3 py-2 text-sm text-white text-left flex justify-between items-center hover:border-[#d4af37]/50 transition">
                                        <span>{DOC_TYPE_OPTIONS.find(o => o.value === uploadForm.data.document_type)?.label}</span>
                                        <svg className={`h-4 w-4 text-gray-400 transition-transform ${openDocTypeDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                    </button>
                                    {openDocTypeDropdown && (
                                        <div className="absolute z-10 mt-1 w-full bg-[#031433] border border-white/20 rounded-lg shadow-xl overflow-hidden">
                                            {DOC_TYPE_OPTIONS.map(opt => (
                                                <button key={opt.value} type="button"
                                                    onClick={() => { uploadForm.setData('document_type', opt.value); setOpenDocTypeDropdown(false); }}
                                                    className={`w-full text-left px-4 py-2.5 text-sm transition ${uploadForm.data.document_type === opt.value ? 'bg-[#d4af37]/20 text-[#d4af37] font-semibold' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Custom Dropdown: Klasifikasi */}
                            <div>
                                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">Tingkat Kerahasiaan</label>
                                <div className="relative">
                                    <button type="button" onClick={() => { setOpenClassDropdown(!openClassDropdown); setOpenDocTypeDropdown(false); }}
                                        className="w-full bg-[#001b3d] border border-white/10 rounded-lg px-3 py-2 text-sm text-white text-left flex justify-between items-center hover:border-[#d4af37]/50 transition">
                                        <span>{CLASS_OPTIONS.find(o => o.value === uploadForm.data.classification_level)?.label}</span>
                                        <svg className={`h-4 w-4 text-gray-400 transition-transform ${openClassDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                    </button>
                                    {openClassDropdown && (
                                        <div className="absolute z-10 mt-1 w-full bg-[#031433] border border-white/20 rounded-lg shadow-xl overflow-hidden">
                                            {CLASS_OPTIONS.map(opt => (
                                                <button key={opt.value} type="button"
                                                    onClick={() => { uploadForm.setData('classification_level', opt.value); setOpenClassDropdown(false); }}
                                                    className={`w-full text-left px-4 py-2.5 text-sm transition ${uploadForm.data.classification_level === opt.value ? 'bg-[#d4af37]/20 text-[#d4af37] font-semibold' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">Instansi Sumber</label>
                                <input type="text" value={uploadForm.data.source_agency} onChange={(e) => uploadForm.setData('source_agency', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]" />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">File Dokumen (PDF/JPG/PNG)</label>
                                <input type="file" accept=".pdf,.jpg,.jpeg,.png" required
                                    className="mt-1 w-full text-xs text-gray-400"
                                    onChange={(e) => uploadForm.setData('file', e.target.files[0])} />
                                {uploadForm.errors.file && <p className="text-xs text-red-400 mt-1">{uploadForm.errors.file}</p>}
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
                                <button type="button" onClick={() => setShowUploadModal(false)} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded text-xs font-medium text-gray-400 border border-white/10">Batal</button>
                                <button type="submit" disabled={uploadForm.processing}
                                    className="px-4 py-2 bg-[#d4af37]/20 hover:bg-[#d4af37]/30 text-[#d4af37] rounded text-xs font-bold border border-[#d4af37]/50 shadow">
                                    {uploadForm.processing ? 'Mengunggah & Enkripsi...' : (
                                        uploadForm.data.document_type === 'LAINNYA' ? 'Unggah & Simpan' : 'Unggah & Verifikasi AI'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── MODAL: Upload Versi Baru ── */}
            {showVersionModal && selectedDoc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-[#031433] border border-white/20 rounded-lg max-w-md w-full p-6 shadow-2xl">
                        <h3 className="text-lg font-bold text-[#d4af37] mb-2">Unggah Versi Baru Dokumen</h3>
                        <p className="text-xs text-gray-400 mb-4">{selectedDoc.title} — <span className="font-mono">v{selectedDoc.current_version} → v{selectedDoc.current_version + 1}</span></p>
                        <form onSubmit={handleUploadVersion} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">Deskripsi Perubahan</label>
                                <input type="text" placeholder="Misal: Perbaikan data identitas..." value={versionForm.data.change_description} onChange={(e) => versionForm.setData('change_description', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] placeholder-gray-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">File Versi Baru</label>
                                <input type="file" accept=".pdf,.jpg,.jpeg,.png" required
                                    className="mt-1 w-full text-xs text-gray-400"
                                    onChange={(e) => versionForm.setData('file', e.target.files[0])} />
                            </div>
                            <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
                                <button type="button" onClick={() => { setShowVersionModal(false); setSelectedDoc(null); }} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded text-xs font-medium text-gray-400 border border-white/10">Batal</button>
                                <button type="submit" disabled={versionForm.processing}
                                    className="px-4 py-2 bg-[#d4af37]/20 hover:bg-[#d4af37]/30 text-[#d4af37] rounded text-xs font-bold border border-[#d4af37]/50 shadow">
                                    {versionForm.processing ? 'Menyimpan Versi...' : `Unggah Versi v${selectedDoc.current_version + 1}`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── MODAL: Konfirmasi Hapus ── */}
            {docToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-[#031433] border border-red-500/30 rounded-lg max-w-md w-full p-6 shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-white">Konfirmasi Hapus Dokumen</h3>
                                <p className="text-xs text-gray-400 mt-0.5">Tindakan ini tidak dapat dibatalkan</p>
                            </div>
                        </div>
                        <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3 mb-5">
                            <p className="text-sm text-gray-300">Apakah kamu yakin ingin menghapus dokumen:</p>
                            <p className="text-sm font-bold text-white mt-1">&ldquo;{docToDelete.title}&rdquo;</p>
                            <p className="text-[11px] text-gray-500 font-mono mt-1">{docToDelete.document_number}</p>
                            <p className="text-xs text-red-400 mt-2">⚠ Semua versi file akan dihapus permanen dari server.</p>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => setDocToDelete(null)} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded text-xs font-medium text-gray-400 border border-white/10">Batal</button>
                            <button type="button" onClick={handleDeleteDocument} className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-xs font-bold border border-red-500/40">Ya, Hapus Dokumen</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
