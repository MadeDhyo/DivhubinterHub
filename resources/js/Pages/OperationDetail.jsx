import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DetailSkeleton from '@/Components/Skeleton/DetailSkeleton';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function OperationDetail({ auth, operation, readiness }) {
    const [activeTab, setActiveTab] = useState('overview');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 400);
        return () => clearTimeout(timer);
    }, []);

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
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Detail - ${operation.name}`} />

            {isLoading ? (
                <DetailSkeleton />
            ) : (
                <div className="space-y-6 animate-fade-in-up">
                    {/* Header title & back button */}
                    <div className="flex items-center gap-4 mb-6">
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-white/10 bg-[#031433]/80 hover:bg-[#d4af37]/20 text-[#d4af37] transition duration-300 shadow-md gold-glow-hover"
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
                            {(auth?.user?.role === 'admin' || auth?.user?.role === 'pimpinan') && (
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

                    {/* Content Card with Visual Details */}
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
                                        } whitespace-nowrap py-4 px-1 border-b-2 font-bold text-xs uppercase tracking-wider transition duration-300`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Animated Tab Content Wrapper */}
                        <div key={activeTab} className="animate-scale-in">
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
                                            <div className="bg-[#001b3d]/50 p-5 rounded-lg border border-white/5 gold-glow-hover">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Operation Name</p>
                                                <p className="font-extrabold text-lg text-white mt-1">{operation.name}</p>
                                            </div>

                                            {/* Status */}
                                            <div className="bg-[#001b3d]/50 p-5 rounded-lg border border-white/5 gold-glow-hover">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status</p>
                                                <div className="mt-1">
                                                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusBadgeClass(operation.status)}`}>
                                                        {operation.status.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Priority */}
                                            <div className="bg-[#001b3d]/50 p-5 rounded-lg border border-white/5 gold-glow-hover">
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
                                        <div className="bg-black/20 border border-white/10 rounded-lg p-5 flex flex-col justify-between gold-glow-hover">
                                            <div className="flex justify-between items-start">
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date Initiated</span>
                                                <svg className="h-5 w-5 text-[#d4af37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <p className="font-extrabold text-base text-white mt-4">{formatDate(operation.created_at)}</p>
                                        </div>

                                        <div className="bg-black/20 border border-white/10 rounded-lg p-5 flex flex-col justify-between gold-glow-hover">
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

                                        <div className="bg-black/20 border border-white/10 rounded-lg p-5 flex flex-col justify-between gold-glow-hover">
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
                                            <div key={target.id} className="mt-4 border border-white/10 p-5 rounded bg-[#001b3d]/50 grid grid-cols-1 md:grid-cols-3 gap-6 gold-glow-hover">
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
                                                        <li key={item.id} className="p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 hover:bg-white/5 transition duration-200">
                                                            <div>
                                                                <span className="font-medium text-white flex items-center gap-1.5">
                                                                    {item.template_item?.name}
                                                                    {item.template_item?.is_mandatory && <span className="text-red-500 font-bold" title="Mandatory">*</span>}
                                                                    {item.template_item?.is_critical && <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-red-500/10 text-red-400 border border-red-500/20 uppercase animate-pulse">CRITICAL</span>}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-3 self-end sm:self-auto">
                                                                <select
                                                                    className="text-xs bg-[#031433] border-white/10 text-white rounded-md shadow-sm focus:border-[#d4af37] focus:ring-[#d4af37] transition"
                                                                    value={item.status}
                                                                    onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                                                    disabled={
                                                                        (auth?.user?.role === 'staf' && (item.status === 'Verified' || item.status === 'Rejected'))
                                                                    }
                                                                >
                                                                    <option value="Not Started" disabled={auth?.user?.role !== 'staf'}>Not Started</option>
                                                                    <option value="In Progress" disabled={auth?.user?.role !== 'staf'}>In Progress</option>
                                                                    <option value="Completed" disabled={auth?.user?.role !== 'staf'}>Completed</option>
                                                                    {(auth?.user?.role === 'admin' || auth?.user?.role === 'pimpinan' || item.status === 'Verified' || item.status === 'Rejected') && (
                                                                        <>
                                                                            <option value="Verified" disabled={auth?.user?.role === 'staf'}>Verified</option>
                                                                            <option value="Rejected" disabled={auth?.user?.role === 'staf'}>Rejected</option>
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
                                    <h3 className="text-lg font-bold text-[#d4af37] border-b border-white/10 pb-3">Readiness Assessment</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="bg-[#001b3d]/50 border border-white/10 rounded-lg p-5 shadow-sm flex flex-col items-center justify-center gold-glow-hover">
                                            <span className="text-sm text-gray-400 font-medium">Readiness Score</span>
                                            <span className="text-4xl font-extrabold text-[#d4af37] mt-2">{readiness.score}%</span>
                                        </div>
                                        <div className="bg-[#001b3d]/50 border border-white/10 rounded-lg p-5 shadow-sm flex flex-col items-center justify-center gold-glow-hover">
                                            <span className="text-sm text-gray-400 font-medium">Readiness Status</span>
                                            <span className={`inline-flex items-center px-3 py-1 mt-3 rounded-full text-sm font-bold uppercase tracking-wider ${
                                                readiness.status === 'READY' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                readiness.status === 'PARTIALLY_READY' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                                readiness.status === 'PENDING_CONFIGURATION' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                            }`}>
                                                {readiness.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <div className="bg-[#001b3d]/50 border border-white/10 rounded-lg p-5 shadow-sm flex flex-col items-center justify-center gold-glow-hover">
                                            <span className="text-sm text-gray-400 font-medium">Mandatory Checklist Progress</span>
                                            <span className="text-2xl font-bold text-white mt-2">{readiness.completed_mandatory} / {readiness.total_mandatory}</span>
                                            <span className="text-xs text-gray-500 mt-1">items completed</span>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-blue-500/10 border-l-4 border-blue-500 text-blue-300 rounded-r-md text-sm">
                                        {readiness.message}
                                    </div>

                                    {!readiness.has_mandatory_items && (
                                        <div className="p-4 bg-yellow-500/10 border-l-4 border-yellow-500 text-yellow-300 rounded-r-md text-sm">
                                            <strong>Peringatan:</strong> Operasi ini belum memiliki konfigurasi item checklist wajib (mandatory).
                                        </div>
                                    )}

                                    <div className="border border-white/10 rounded-lg p-5 shadow-sm bg-[#001b3d]/50 gold-glow-hover">
                                        <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
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

                                    <div className="border border-white/10 rounded-lg p-5 shadow-sm bg-[#001b3d]/50 gold-glow-hover">
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
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
