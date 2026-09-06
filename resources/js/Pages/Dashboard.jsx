import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Dashboard({ auth, operations = [], averageReadinessScore = 0, dpoPersons = [], users = [] }) {
    const { flash } = usePage().props;
    const [searchQuery, setSearchQuery] = useState('');
    const [dpoSearchQuery, setDpoSearchQuery] = useState('');
    const [showCreateOperationModal, setShowCreateOperationModal] = useState(false);

    const isAdmin = auth?.user?.role?.toLowerCase() === 'admin';

    // Filter operasi berdasarkan input pencarian (client-side search)
    const filteredOperations = operations.filter(op =>
        op.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        op.operation_number.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Filter subjek DPO untuk modal tambah operasi (search by name, alias, red notice, case_info)
    const filteredDpoForModal = dpoPersons
        .filter(d => d.status === 'Active')
        .filter(d =>
            (d.name && d.name.toLowerCase().includes(dpoSearchQuery.toLowerCase())) ||
            (d.alias && d.alias.toLowerCase().includes(dpoSearchQuery.toLowerCase())) ||
            (d.case_info && d.case_info.toLowerCase().includes(dpoSearchQuery.toLowerCase())) ||
            (d.red_notice_ref && d.red_notice_ref.toLowerCase().includes(dpoSearchQuery.toLowerCase()))
        );

    // Hitung total operasi aktif (status selain 'Closed')
    const activeOperationsCount = operations.filter(op => op.status !== 'Closed').length;

    // Create Operation Form
    const createOpForm = useForm({
        operation_number: '',
        name: '',
        description: '',
        priority: 'Medium',
        status: 'Planning',
        start_date: '',
        end_date: '',
        pic_id: '',
        dpo_person_ids: [],
    });

    const handleCreateOperation = (e) => {
        e.preventDefault();
        createOpForm.post(route('operations.store'), {
            onSuccess: () => {
                createOpForm.reset();
                setShowCreateOperationModal(false);
            },
        });
    };

    const toggleDpoSelection = (dpoId) => {
        const current = createOpForm.data.dpo_person_ids;
        if (current.includes(dpoId)) {
            createOpForm.setData('dpo_person_ids', current.filter(id => id !== dpoId));
        } else {
            createOpForm.setData('dpo_person_ids', [...current, dpoId]);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Pusat Komando Operasional" />

            <div className="space-y-8">
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="p-4 bg-emerald-500/10 border-l-4 border-emerald-500 text-emerald-300 rounded-r-md text-sm font-semibold">
                        ✅ {flash.success}
                    </div>
                )}

                {/* SUMMARY CARDS */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
                    {/* Card 1: Kasus Aktif */}
                    <div className="bg-[#031433]/65 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:border-[#d4af37]/60 transition group relative overflow-hidden animate-stagger-1 hover:-translate-y-1 duration-300">
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
                    <div className="bg-[#031433]/65 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:border-red-500/60 transition group relative overflow-hidden animate-stagger-2 hover:-translate-y-1 duration-300">
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
                    <div className="bg-[#031433]/65 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:border-yellow-500/60 transition group relative overflow-hidden animate-stagger-3 hover:-translate-y-1 duration-300">
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

                    {/* Card 4: Skor Kesiapan (Real Aggregate) */}
                    <div className="bg-[#031433]/65 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:border-emerald-500/60 transition group relative overflow-hidden animate-stagger-4 hover:-translate-y-1 duration-300">
                        <div className="absolute top-0 right-0 h-16 w-16 bg-emerald-500/5 rounded-bl-full flex items-center justify-center group-hover:bg-emerald-500/10 transition" />
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Skor Kesiapan</span>
                            <svg className="h-6 w-6 text-emerald-500 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-3xl font-extrabold mt-3 text-white">{averageReadinessScore}%</p>
                        <p className="text-[10px] text-emerald-400 mt-2 font-semibold">Rata-rata skor kesiapan operasi aktif</p>
                    </div>
                </section>

                {/* TABLE & RISK REGIONAL SIDEBAR GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT TABLE: Operasi Prioritas Tinggi */}
                    <div className="lg:col-span-2 bg-[#031433]/65 backdrop-blur-md border border-white/10 rounded-xl p-6 animate-fade-in-up">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-white">Operasi Prioritas Tinggi</h3>
                                <p className="text-xs text-gray-400">Daftar kasus operasi aktif OCMS</p>
                            </div>
                            <div className="flex items-center gap-3">
                                {isAdmin && (
                                    <button
                                        onClick={() => setShowCreateOperationModal(true)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#d4af37] hover:bg-[#b5952f] text-[#001b3d] font-bold text-xs uppercase tracking-wider rounded-lg shadow-md hover:brightness-110 transition cursor-pointer"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                                        Tambah Operasi
                                    </button>
                                )}
                                <button
                                    onClick={() => alert('Fitur Lihat Semua Kasus segera tersedia.')}
                                    className="text-xs text-[#d4af37] hover:underline font-semibold"
                                >
                                    Lihat Semua
                                </button>
                            </div>
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

                    {/* RIGHT SIDEBAR: Penilaian Risiko Regional */}
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
                                            <span className="font-bold text-gray-400">{risk.level} ({risk.score}%)</span>
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
                                * Sumber: Visualiasi dashboard real-time OCMS DivHubInter.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════ MODAL: TAMBAH OPERASI BARU ═══════════ */}
            {showCreateOperationModal && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#031433] border border-white/20 rounded-xl max-w-2xl w-full p-6 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center pb-4 border-b border-white/10">
                            <div>
                                <h4 className="font-bold text-[#d4af37]">Tambah Operasi Baru</h4>
                                <p className="text-xs text-gray-400">Buat kasus operasi baru dan hubungkan dengan subjek DPO.</p>
                            </div>
                            <button onClick={() => setShowCreateOperationModal(false)} className="text-gray-400 hover:text-white text-lg font-bold">&times;</button>
                        </div>

                        <form onSubmit={handleCreateOperation} className="mt-4 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">Nomor Operasi <span className="text-red-400">*</span></label>
                                    <input type="text" required className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]" placeholder="e.g. OP-2026-001" value={createOpForm.data.operation_number} onChange={e => createOpForm.setData('operation_number', e.target.value)} />
                                    {createOpForm.errors.operation_number && <p className="text-xs text-red-400 mt-1">{createOpForm.errors.operation_number}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">Nama Operasi <span className="text-red-400">*</span></label>
                                    <input type="text" required className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]" placeholder="Nama operasi" value={createOpForm.data.name} onChange={e => createOpForm.setData('name', e.target.value)} />
                                    {createOpForm.errors.name && <p className="text-xs text-red-400 mt-1">{createOpForm.errors.name}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">Deskripsi</label>
                                <textarea rows="2" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] resize-none" placeholder="Deskripsi ringkas operasi..." value={createOpForm.data.description} onChange={e => createOpForm.setData('description', e.target.value)} />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">Prioritas <span className="text-red-400">*</span></label>
                                    <select className="w-full bg-[#001b3d] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]" value={createOpForm.data.priority} onChange={e => createOpForm.setData('priority', e.target.value)}>
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Critical">Critical</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">Status</label>
                                    <select className="w-full bg-[#001b3d] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]" value={createOpForm.data.status} onChange={e => createOpForm.setData('status', e.target.value)}>
                                        <option value="Planning">Planning</option>
                                        <option value="Preparation">Preparation</option>
                                        <option value="Verification">Verification</option>
                                        <option value="Active">Active</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">
                                        PIC / Petugas Assigned <span className="text-red-400">*</span>
                                    </label>
                                    <select
                                        required
                                        className="w-full bg-[#001b3d] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
                                        value={createOpForm.data.pic_id}
                                        onChange={e => createOpForm.setData('pic_id', e.target.value)}
                                    >
                                        <option value="">-- Pilih Petugas PIC --</option>
                                        {users.map(u => (
                                            <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                                        ))}
                                    </select>
                                    {createOpForm.errors.pic_id && (
                                        <p className="text-xs text-red-400 mt-1">{createOpForm.errors.pic_id}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">Tanggal Mulai</label>
                                    <input type="date" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]" value={createOpForm.data.start_date} onChange={e => createOpForm.setData('start_date', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">Tanggal Selesai</label>
                                    <input type="date" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]" value={createOpForm.data.end_date} onChange={e => createOpForm.setData('end_date', e.target.value)} />
                                    {createOpForm.errors.end_date && <p className="text-xs text-red-400 mt-1">{createOpForm.errors.end_date}</p>}
                                </div>
                            </div>

                            {/* DPO Person Search & Select */}
                            <div>
                                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                                    Subjek DPO Terkait
                                    <span className="text-gray-500 font-normal normal-case ml-1">(opsional)</span>
                                </label>

                                {/* Input Cari DPO */}
                                <div className="relative">
                                    <svg className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <input
                                        type="text"
                                        placeholder="Ketik untuk mencari nama, alias, atau nomor red notice DPO..."
                                        value={dpoSearchQuery}
                                        onChange={e => setDpoSearchQuery(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-8 py-2 text-xs text-white placeholder-gray-400 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
                                    />
                                    {dpoSearchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setDpoSearchQuery('')}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs font-bold"
                                        >
                                            &times;
                                        </button>
                                    )}
                                </div>

                                {/* Dropdown Hasil Pencarian (hanya muncul saat mengetik) */}
                                {dpoSearchQuery.trim() !== '' && (
                                    <div className="mt-1 max-h-44 overflow-y-auto bg-[#001b3d] border border-[#d4af37]/40 rounded-lg p-2 space-y-1 shadow-xl">
                                        {filteredDpoForModal.length > 0 ? (
                                            filteredDpoForModal.map(dpo => (
                                                <div
                                                    key={dpo.id}
                                                    onClick={() => toggleDpoSelection(dpo.id)}
                                                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition ${
                                                        createOpForm.data.dpo_person_ids.includes(dpo.id)
                                                            ? 'bg-[#d4af37]/20 border border-[#d4af37]/40'
                                                            : 'hover:bg-white/10 border border-transparent'
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={createOpForm.data.dpo_person_ids.includes(dpo.id)}
                                                        onChange={() => {}}
                                                        className="rounded border-white/20 bg-white/5 text-[#d4af37] focus:ring-[#d4af37] focus:ring-offset-0 pointer-events-none"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-semibold text-white truncate">{dpo.name}</p>
                                                        {dpo.alias && <p className="text-[10px] text-gray-400">a.k.a. {dpo.alias}</p>}
                                                        {dpo.red_notice_ref && <p className="text-[9px] text-[#d4af37]/80">Ref: {dpo.red_notice_ref}</p>}
                                                    </div>
                                                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-red-500/10 text-red-400 border border-red-500/20">Aktif</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-xs text-gray-400 py-3 text-center">
                                                Tidak ditemukan DPO yang cocok dengan <span className="text-[#d4af37]">"{dpoSearchQuery}"</span>
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Badges DPO Terpilih */}
                                {createOpForm.data.dpo_person_ids.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {createOpForm.data.dpo_person_ids.map(id => {
                                            const person = dpoPersons.find(p => p.id === id);
                                            if (!person) return null;
                                            return (
                                                <span key={id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#d4af37] text-xs font-semibold">
                                                    <span>{person.name}</span>
                                                    {person.alias && <span className="text-[10px] text-gray-400">({person.alias})</span>}
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleDpoSelection(id)}
                                                        className="hover:text-red-400 font-bold ml-1"
                                                    >
                                                        &times;
                                                    </button>
                                                </span>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowCreateOperationModal(false)} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold uppercase rounded-lg transition">Batal</button>
                                <button type="submit" disabled={createOpForm.processing} className="px-4 py-2 bg-[#d4af37] hover:bg-[#b5952f] text-[#001b3d] text-xs font-bold uppercase rounded-lg transition shadow-md hover:brightness-110 disabled:opacity-50 font-extrabold cursor-pointer">
                                    {createOpForm.processing ? 'Menyimpan...' : 'Buat Operasi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}

