import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useState } from 'react';

export default function DpoListIndex({ dpoPersons = [], canManage = false }) {
    const { auth, flash, errors } = usePage().props;
    const isAdmin = canManage || auth?.user?.role?.toLowerCase() === 'admin';
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingDpo, setEditingDpo] = useState(null);
    const [viewingDpo, setViewingDpo] = useState(null);

    // Create Form
    const createForm = useForm({
        name: '',
        alias: '',
        date_of_birth: '',
        nationality: '',
        passport_number: '',
        red_notice_ref: '',
        case_info: '',
        crime_type: '',
        photo: null,
        status: 'Active',
    });

    // Edit Form
    const editForm = useForm({
        name: '',
        alias: '',
        date_of_birth: '',
        nationality: '',
        passport_number: '',
        red_notice_ref: '',
        case_info: '',
        crime_type: '',
        photo: null,
        status: 'Active',
    });

    const handleCreateDpo = (e) => {
        e.preventDefault();
        createForm.post(route('dpo.store'), {
            forceFormData: true,
            onSuccess: () => {
                createForm.reset();
                setIsAddModalOpen(false);
            },
        });
    };

    const handleOpenEditModal = (dpo) => {
        setEditingDpo(dpo);
        editForm.setData({
            name: dpo.name || '',
            alias: dpo.alias || '',
            date_of_birth: dpo.date_of_birth ? dpo.date_of_birth.split('T')[0] : '',
            nationality: dpo.nationality || '',
            passport_number: dpo.passport_number || '',
            red_notice_ref: dpo.red_notice_ref || '',
            case_info: dpo.case_info || '',
            crime_type: dpo.crime_type || '',
            photo: null,
            status: dpo.status || 'Active',
        });
    };

    const handleUpdateDpo = (e) => {
        e.preventDefault();
        if (!editingDpo) return;
        editForm.post(route('dpo.update', editingDpo.id), {
            forceFormData: true,
            onSuccess: () => {
                setEditingDpo(null);
                editForm.reset();
            },
        });
    };

    const handleDeleteDpo = (dpo) => {
        if (confirm(`Apakah Anda yakin ingin menghapus data DPO "${dpo.name}" secara permanen?`)) {
            router.delete(route('dpo.destroy', dpo.id));
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Active':
                return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 'Captured':
                return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'Deceased':
                return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
            case 'Withdrawn':
                return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            default:
                return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'Active':    return 'Aktif Dicari';
            case 'Captured':  return 'Tertangkap';
            case 'Deceased':  return 'Meninggal';
            case 'Withdrawn': return 'Dicabut';
            default:          return status;
        }
    };

    // Filter
    const filteredDpo = dpoPersons.filter(dpo => {
        const matchesSearch =
            dpo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (dpo.alias && dpo.alias.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (dpo.nationality && dpo.nationality.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (dpo.red_notice_ref && dpo.red_notice_ref.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus = statusFilter === 'all' || dpo.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const statusCounts = {
        all: dpoPersons.length,
        Active: dpoPersons.filter(d => d.status === 'Active').length,
        Captured: dpoPersons.filter(d => d.status === 'Captured').length,
        Deceased: dpoPersons.filter(d => d.status === 'Deceased').length,
        Withdrawn: dpoPersons.filter(d => d.status === 'Withdrawn').length,
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const d = new Date(dateString);
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    };

    // Reusable form fields renderer
    const renderFormFields = (form) => (
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">Nama Lengkap <span className="text-red-400">*</span></label>
                    <input type="text" required className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]" placeholder="Nama lengkap subjek" value={form.data.name} onChange={e => form.setData('name', e.target.value)} />
                    {form.errors.name && <p className="text-xs text-red-400 mt-1">{form.errors.name}</p>}
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">Alias / Nama Samaran</label>
                    <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]" placeholder="Alias jika ada" value={form.data.alias} onChange={e => form.setData('alias', e.target.value)} />
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">Tanggal Lahir</label>
                    <input type="date" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]" value={form.data.date_of_birth} onChange={e => form.setData('date_of_birth', e.target.value)} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">Kebangsaan</label>
                    <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]" placeholder="e.g. Indonesian" value={form.data.nationality} onChange={e => form.setData('nationality', e.target.value)} />
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">Nomor Paspor</label>
                    <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]" placeholder="Nomor paspor" value={form.data.passport_number} onChange={e => form.setData('passport_number', e.target.value)} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">Red Notice Ref</label>
                    <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]" placeholder="e.g. A-1234/5-2024" value={form.data.red_notice_ref} onChange={e => form.setData('red_notice_ref', e.target.value)} />
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">Jenis Kejahatan</label>
                    <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]" placeholder="e.g. Narkotika, Penipuan" value={form.data.crime_type} onChange={e => form.setData('crime_type', e.target.value)} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">Status <span className="text-red-400">*</span></label>
                    <select className="w-full bg-[#001b3d] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]" value={form.data.status} onChange={e => form.setData('status', e.target.value)}>
                        <option value="Active">Aktif Dicari</option>
                        <option value="Captured">Tertangkap</option>
                        <option value="Deceased">Meninggal</option>
                        <option value="Withdrawn">Dicabut</option>
                    </select>
                </div>
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">Info Kasus</label>
                <textarea rows="3" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] resize-none" placeholder="Deskripsi ringkas kasus yang melibatkan subjek..." value={form.data.case_info} onChange={e => form.setData('case_info', e.target.value)} />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">Foto Subjek</label>
                <input type="file" accept="image/jpeg,image/png,image/webp" className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#d4af37]/10 file:text-[#d4af37] hover:file:bg-[#d4af37]/20 file:cursor-pointer file:uppercase file:tracking-wider" onChange={e => form.setData('photo', e.target.files[0])} />
                {form.errors.photo && <p className="text-xs text-red-400 mt-1">{form.errors.photo}</p>}
            </div>
        </div>
    );

    return (
        <AuthenticatedLayout>
            <Head title="Daftar Pencarian Orang (DPO)" />

            <div className="space-y-6">
                {/* Flash Success & Error Banners */}
                {flash?.success && (
                    <div className="p-4 bg-emerald-500/10 border-l-4 border-emerald-500 text-emerald-300 rounded-r-md text-sm font-semibold flex items-center justify-between">
                        <span>✅ {flash.success}</span>
                    </div>
                )}
                {errors?.error && (
                    <div className="p-4 bg-red-500/10 border-l-4 border-red-500 text-red-300 rounded-r-md text-sm font-semibold">
                        ⚠️ {errors.error}
                    </div>
                )}

                {/* Page Header */}
                <div className="overflow-hidden bg-[rgba(10,31,73,0.7)] border border-white/10 shadow-lg rounded-xl p-6 backdrop-blur-md text-white">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                        <div>
                            <h3 className="text-lg font-bold text-[#d4af37] flex items-center gap-2">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                Daftar Pencarian Orang (DPO)
                            </h3>
                            <p className="text-xs text-gray-400 mt-1">Database subjek yang masuk dalam daftar pencarian NCB Interpol Indonesia.</p>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                            {/* Search */}
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </span>
                                <input
                                    type="text"
                                    placeholder="Cari nama, alias, nationality..."
                                    className="bg-[#001b3d] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] w-56"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {/* Status Filter */}
                            <select
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                                className="bg-[#001b3d] border border-white/10 rounded-lg px-3 py-2 text-xs font-semibold text-white focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
                            >
                                <option value="all">Semua Status ({statusCounts.all})</option>
                                <option value="Active">🔴 Aktif Dicari ({statusCounts.Active})</option>
                                <option value="Captured">🟢 Tertangkap ({statusCounts.Captured})</option>
                                <option value="Deceased">⚫ Meninggal ({statusCounts.Deceased})</option>
                                <option value="Withdrawn">🔵 Dicabut ({statusCounts.Withdrawn})</option>
                            </select>

                            {/* Add DPO Button (admin only) */}
                            {isAdmin && (
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#d4af37] hover:bg-[#b5952f] text-[#001b3d] font-bold text-xs uppercase tracking-wider rounded-lg shadow-md hover:brightness-110 transition cursor-pointer"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                                    Tambah DPO
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                        <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-3 text-center">
                            <p className="text-2xl font-extrabold text-red-400">{statusCounts.Active}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Aktif Dicari</p>
                        </div>
                        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3 text-center">
                            <p className="text-2xl font-extrabold text-emerald-400">{statusCounts.Captured}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Tertangkap</p>
                        </div>
                        <div className="bg-gray-500/5 border border-gray-500/10 rounded-lg p-3 text-center">
                            <p className="text-2xl font-extrabold text-gray-400">{statusCounts.Deceased}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Meninggal</p>
                        </div>
                        <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-3 text-center">
                            <p className="text-2xl font-extrabold text-blue-400">{statusCounts.Withdrawn}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Dicabut</p>
                        </div>
                    </div>
                </div>

                {/* DPO Card Grid */}
                {filteredDpo.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {filteredDpo.map(dpo => (
                            <div key={dpo.id} className="group bg-[#031433]/65 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden hover:border-[#d4af37]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#d4af37]/5">
                                {/* Photo Area */}
                                <div className="relative h-44 bg-gradient-to-br from-[#001b3d] to-[#031433] flex items-center justify-center overflow-hidden">
                                    {dpo.photo_path ? (
                                        <img
                                            src={`/storage/${dpo.photo_path}`}
                                            alt={dpo.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="h-20 w-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                                <svg className="h-10 w-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                            </div>
                                            <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">Foto Tidak Tersedia</span>
                                        </div>
                                    )}
                                    {/* Status Badge Overlay */}
                                    <div className="absolute top-3 right-3">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-sm ${getStatusBadge(dpo.status)}`}>
                                            {getStatusLabel(dpo.status)}
                                        </span>
                                    </div>
                                    {dpo.status === 'Active' && (
                                        <div className="absolute top-3 left-3">
                                            <span className="flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="p-4 space-y-3">
                                    <div>
                                        <h4 className="font-extrabold text-white text-sm leading-tight">{dpo.name}</h4>
                                        {dpo.alias && <p className="text-[11px] text-gray-400 mt-0.5">a.k.a. <span className="text-gray-300 font-semibold">{dpo.alias}</span></p>}
                                    </div>

                                    <div className="space-y-1.5">
                                        {dpo.nationality && (
                                            <div className="flex items-center gap-2 text-[11px]">
                                                <svg className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                <span className="text-gray-300">{dpo.nationality}</span>
                                            </div>
                                        )}
                                        {dpo.crime_type && (
                                            <div className="flex items-center gap-2 text-[11px]">
                                                <svg className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                                <span className="text-gray-300">{dpo.crime_type}</span>
                                            </div>
                                        )}
                                        {dpo.red_notice_ref && (
                                            <div className="flex items-center gap-2 text-[11px]">
                                                <svg className="h-3.5 w-3.5 text-red-500/70 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                                                <span className="text-red-400 font-mono text-[10px]">{dpo.red_notice_ref}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                                        <button
                                            onClick={() => setViewingDpo(dpo)}
                                            className="flex-1 text-center px-2 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded text-[10px] font-bold uppercase tracking-wider transition"
                                        >
                                            Detail
                                        </button>
                                        {isAdmin && (
                                            <>
                                                <button
                                                    onClick={() => handleOpenEditModal(dpo)}
                                                    className="px-2 py-1.5 bg-[#d4af37]/10 hover:bg-[#d4af37]/20 text-[#d4af37] rounded text-[10px] font-bold uppercase tracking-wider transition"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteDpo(dpo)}
                                                    className="px-2 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded text-[10px] font-bold uppercase tracking-wider transition"
                                                >
                                                    Hapus
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-[#031433]/65 backdrop-blur-md border border-white/10 rounded-xl p-12 text-center">
                        <svg className="h-16 w-16 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <p className="text-gray-400 text-sm font-semibold">Tidak ada data DPO yang ditemukan.</p>
                        <p className="text-gray-500 text-xs mt-1">Coba ubah filter atau kata kunci pencarian Anda.</p>
                    </div>
                )}
            </div>

            {/* ═══════════ MODAL: TAMBAH DPO ═══════════ */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#031433] border border-white/20 rounded-xl max-w-2xl w-full p-6 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center pb-4 border-b border-white/10">
                            <div>
                                <h4 className="font-bold text-[#d4af37]">Tambah Data DPO Baru</h4>
                                <p className="text-xs text-gray-400">Isi formulir di bawah untuk menambahkan subjek ke daftar pencarian.</p>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-white text-lg font-bold">&times;</button>
                        </div>
                        <form onSubmit={handleCreateDpo} className="mt-4">
                            {renderFormFields(createForm)}
                            <div className="pt-4 mt-4 border-t border-white/10 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold uppercase rounded-lg transition">Batal</button>
                                <button type="submit" disabled={createForm.processing} className="px-4 py-2 bg-[#d4af37] hover:bg-[#b5952f] text-[#001b3d] text-xs font-bold uppercase rounded-lg transition shadow disabled:opacity-50">
                                    {createForm.processing ? 'Menyimpan...' : 'Simpan Data DPO'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ═══════════ MODAL: EDIT DPO ═══════════ */}
            {editingDpo && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#031433] border border-white/20 rounded-xl max-w-2xl w-full p-6 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center pb-4 border-b border-white/10">
                            <div>
                                <h4 className="font-bold text-[#d4af37]">Edit Data DPO</h4>
                                <p className="text-xs text-gray-400">Memperbarui data: {editingDpo.name}</p>
                            </div>
                            <button onClick={() => setEditingDpo(null)} className="text-gray-400 hover:text-white text-lg font-bold">&times;</button>
                        </div>
                        <form onSubmit={handleUpdateDpo} className="mt-4">
                            {renderFormFields(editForm)}
                            <div className="pt-4 mt-4 border-t border-white/10 flex justify-end gap-3">
                                <button type="button" onClick={() => setEditingDpo(null)} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold uppercase rounded-lg transition">Batal</button>
                                <button type="submit" disabled={editForm.processing} className="px-4 py-2 bg-[#d4af37] hover:bg-[#b5952f] text-[#001b3d] text-xs font-bold uppercase rounded-lg transition shadow disabled:opacity-50">
                                    {editForm.processing ? 'Menyimpan...' : 'Update Data DPO'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ═══════════ MODAL: DETAIL DPO ═══════════ */}
            {viewingDpo && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#031433] border border-white/20 rounded-xl max-w-2xl w-full p-6 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center pb-4 border-b border-white/10">
                            <h4 className="font-bold text-[#d4af37]">Detail Subjek DPO</h4>
                            <button onClick={() => setViewingDpo(null)} className="text-gray-400 hover:text-white text-lg font-bold">&times;</button>
                        </div>

                        <div className="mt-4 space-y-6">
                            {/* Photo + Name Header */}
                            <div className="flex items-start gap-5">
                                <div className="h-28 w-28 rounded-xl bg-[#001b3d] border border-white/10 overflow-hidden flex-shrink-0">
                                    {viewingDpo.photo_path ? (
                                        <img src={`/storage/${viewingDpo.photo_path}`} alt={viewingDpo.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <svg className="h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-xl font-extrabold text-white">{viewingDpo.name}</h3>
                                    {viewingDpo.alias && <p className="text-sm text-gray-400">a.k.a. <span className="font-semibold text-gray-300">{viewingDpo.alias}</span></p>}
                                    <div className="mt-2">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(viewingDpo.status)}`}>
                                            {getStatusLabel(viewingDpo.status)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Detail Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-[#001b3d]/50 p-4 rounded-lg border border-white/5">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tanggal Lahir</p>
                                    <p className="font-semibold text-white mt-1">{formatDate(viewingDpo.date_of_birth)}</p>
                                </div>
                                <div className="bg-[#001b3d]/50 p-4 rounded-lg border border-white/5">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Kebangsaan</p>
                                    <p className="font-semibold text-white mt-1">{viewingDpo.nationality || '-'}</p>
                                </div>
                                <div className="bg-[#001b3d]/50 p-4 rounded-lg border border-white/5">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nomor Paspor</p>
                                    <p className="font-semibold text-white mt-1 font-mono">{viewingDpo.passport_number || '-'}</p>
                                </div>
                                <div className="bg-[#001b3d]/50 p-4 rounded-lg border border-white/5">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Red Notice Ref</p>
                                    <p className="font-semibold text-red-400 mt-1 font-mono">{viewingDpo.red_notice_ref || '-'}</p>
                                </div>
                                <div className="bg-[#001b3d]/50 p-4 rounded-lg border border-white/5">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Jenis Kejahatan</p>
                                    <p className="font-semibold text-white mt-1">{viewingDpo.crime_type || '-'}</p>
                                </div>
                                <div className="bg-[#001b3d]/50 p-4 rounded-lg border border-white/5">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Terdaftar Pada</p>
                                    <p className="font-semibold text-white mt-1">{formatDate(viewingDpo.created_at)}</p>
                                </div>
                            </div>

                            {/* Case Info */}
                            {viewingDpo.case_info && (
                                <div className="bg-[#001b3d]/50 p-4 rounded-lg border border-white/5">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Info Kasus</p>
                                    <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">{viewingDpo.case_info}</p>
                                </div>
                            )}

                            {/* Linked Operations */}
                            {viewingDpo.operations && viewingDpo.operations.length > 0 && (
                                <div className="bg-[#001b3d]/50 p-4 rounded-lg border border-white/5">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Operasi Terkait</p>
                                    <div className="space-y-2">
                                        {viewingDpo.operations.map(op => (
                                            <a key={op.id} href={`/operations/${op.id}`} className="flex items-center justify-between p-2 rounded bg-white/5 hover:bg-white/10 transition group">
                                                <div>
                                                    <span className="text-xs font-mono text-[#d4af37]">{op.operation_number}</span>
                                                    <span className="text-xs text-gray-300 ml-2">{op.name}</span>
                                                </div>
                                                <svg className="h-4 w-4 text-gray-500 group-hover:text-[#d4af37] transition" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="pt-4 mt-4 border-t border-white/10 flex justify-end">
                            <button onClick={() => setViewingDpo(null)} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold uppercase rounded-lg transition">Tutup</button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
