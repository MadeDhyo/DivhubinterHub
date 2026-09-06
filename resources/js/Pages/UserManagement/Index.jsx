import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useState } from 'react';

export default function UserManagement({ users }) {
    const { auth, flash, errors } = usePage().props;
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [resettingUser, setResettingUser] = useState(null);
    const [roleFilter, setRoleFilter] = useState('all');

    // Create Form
    const createForm = useForm({
        name: '',
        email: '',
        role: 'staf',
        password: '',
    });

    // Edit Form
    const editForm = useForm({
        name: '',
        email: '',
        role: 'staf',
    });

    // Reset Password Form
    const resetPasswordForm = useForm({
        password: '',
        password_confirmation: '',
    });

    const handleCreateUser = (e) => {
        e.preventDefault();
        createForm.post(route('user-management.store'), {
            onSuccess: () => {
                createForm.reset();
                setIsAddModalOpen(false);
            },
        });
    };

    const handleOpenEditModal = (user) => {
        setEditingUser(user);
        editForm.setData({
            name: user.name,
            email: user.email,
            role: user.role,
        });
    };

    const handleUpdateUser = (e) => {
        e.preventDefault();
        if (!editingUser) return;

        editForm.put(route('user-management.update', editingUser.id), {
            onSuccess: () => {
                setEditingUser(null);
                editForm.reset();
            },
        });
    };

    const handleOpenResetModal = (user) => {
        setResettingUser(user);
        resetPasswordForm.reset();
    };

    const handleResetPassword = (e) => {
        e.preventDefault();
        if (!resettingUser) return;

        resetPasswordForm.post(route('user-management.reset-password', resettingUser.id), {
            onSuccess: () => {
                setResettingUser(null);
                resetPasswordForm.reset();
            },
        });
    };

    const handleDeleteUser = (userId, userName) => {
        if (confirm(`Apakah Anda yakin ingin menghapus akun ${userName} secara permanen?`)) {
            router.delete(route('user-management.destroy', userId));
        }
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case 'admin':
                return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            case 'pimpinan':
                return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            default:
                return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        }
    };

    const filteredUsers = users.filter((u) => {
        if (roleFilter === 'all') return true;
        return u.role === roleFilter;
    });

    return (
        <AuthenticatedLayout>
            <Head title="Manajemen Personel" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl">
                    {/* Flash Success & Error Banners */}
                    {flash?.success && (
                        <div className="mb-6 p-4 bg-emerald-500/10 border-l-4 border-emerald-500 text-emerald-300 rounded-r-md text-sm font-semibold flex items-center justify-between">
                            <span>✅ {flash.success}</span>
                        </div>
                    )}
                    {errors?.error && (
                        <div className="mb-6 p-4 bg-red-500/10 border-l-4 border-red-500 text-red-300 rounded-r-md text-sm font-semibold">
                            ⚠️ {errors.error}
                        </div>
                    )}

                    <div className="overflow-hidden bg-[rgba(10,31,73,0.7)] border border-white/10 shadow-lg rounded-xl p-6 backdrop-blur-md text-white">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
                            <div>
                                <h3 className="text-lg font-bold text-[#d4af37] flex items-center gap-2">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                    Manajemen Personel & Akun Sistem
                                </h3>
                                <p className="text-xs text-gray-400 mt-1">Kelola akun pengguna, wewenang akses, dan role personel NCB Interpol.</p>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Role Filter */}
                                <select
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                    className="bg-[#001b3d] border border-white/10 rounded-lg px-3 py-2 text-xs font-semibold text-white focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
                                >
                                    <option value="all">Semua Role ({users.length})</option>
                                    <option value="admin">Super Admin ({users.filter(u => u.role === 'admin').length})</option>
                                    <option value="pimpinan">Kasubbag Pimpinan ({users.filter(u => u.role === 'pimpinan').length})</option>
                                    <option value="staf">Staf Anggota / Operator ({users.filter(u => u.role === 'staf').length})</option>
                                </select>

                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#d4af37] hover:bg-[#b5952f] text-[#001b3d] font-bold text-xs uppercase tracking-wider rounded-lg shadow-md hover:brightness-110 transition cursor-pointer"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                                    </svg>
                                    Tambah Akun Baru
                                </button>
                            </div>
                        </div>

                        {/* Users Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-400 uppercase bg-[#001b3d]/50 border-b border-white/10">
                                    <tr>
                                        <th className="px-6 py-3 font-semibold tracking-wider">Nama Personel</th>
                                        <th className="px-6 py-3 font-semibold tracking-wider">Email</th>
                                        <th className="px-6 py-3 font-semibold tracking-wider">Role</th>
                                        <th className="px-6 py-3 font-semibold tracking-wider">Tanggal Dibuat</th>
                                        <th className="px-6 py-3 font-semibold tracking-wider text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredUsers.length > 0 ? (
                                        filteredUsers.map((user) => (
                                            <tr key={user.id} className="hover:bg-white/5 transition">
                                                <td className="px-6 py-4 font-semibold text-white flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-[#d4af37]">
                                                        {user.name.slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p>{user.name}</p>
                                                        {user.id === auth.user.id && (
                                                            <span className="text-[9px] text-[#d4af37] font-bold tracking-widest uppercase">(Akun Anda)</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-300 font-mono text-xs">{user.email}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getRoleBadge(user.role)}`}>
                                                        {user.role === 'staf' ? 'Staf (Operator)' : user.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-400 text-xs">
                                                    {new Date(user.created_at).toLocaleDateString('id-ID')}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleOpenEditModal(user)}
                                                            className="text-xs font-bold text-yellow-400 hover:text-yellow-300 transition uppercase tracking-wider p-1"
                                                            title="Edit User"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleOpenResetModal(user)}
                                                            className="text-xs font-bold text-blue-400 hover:text-blue-300 transition uppercase tracking-wider p-1"
                                                            title="Reset Password"
                                                        >
                                                            Reset
                                                        </button>

                                                        {user.id === auth.user.id ? (
                                                            <span className="text-xs text-gray-500 italic select-none ml-2" title="Tidak dapat menghapus akun sendiri">
                                                                Locked
                                                            </span>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleDeleteUser(user.id, user.name)}
                                                                className="text-xs font-bold text-red-400 hover:text-red-300 transition uppercase tracking-wider p-1 ml-1"
                                                                title="Hapus Akun"
                                                            >
                                                                Hapus
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-gray-400 text-sm">
                                                Tidak ada personel yang sesuai dengan filter role.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Tambah User */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#031433] border border-white/20 rounded-xl max-w-md w-full p-6 text-white shadow-2xl">
                        <div className="flex justify-between items-center pb-4 border-b border-white/10">
                            <h4 className="font-bold text-[#d4af37]">Tambah Akun Personel Baru</h4>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="text-gray-400 hover:text-white text-lg font-bold"
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleCreateUser} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">Nama Lengkap</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
                                    placeholder="Contoh: Bripda Andi"
                                    value={createForm.data.name}
                                    onChange={(e) => createForm.setData('name', e.target.value)}
                                />
                                {createForm.errors.name && <p className="text-xs text-red-400 mt-1">{createForm.errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
                                    placeholder="andi@ocms.local"
                                    value={createForm.data.email}
                                    onChange={(e) => createForm.setData('email', e.target.value)}
                                />
                                {createForm.errors.email && <p className="text-xs text-red-400 mt-1">{createForm.errors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">Role Akun</label>
                                <select
                                    className="w-full bg-[#001b3d] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
                                    value={createForm.data.role}
                                    onChange={(e) => createForm.setData('role', e.target.value)}
                                >
                                    <option value="staf">Staf Anggota (Operator)</option>
                                    <option value="pimpinan">Kasubbag Pimpinan (Reviewer)</option>
                                    <option value="admin">Super Admin (System Control)</option>
                                </select>
                                {createForm.errors.role && <p className="text-xs text-red-400 mt-1">{createForm.errors.role}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
                                    placeholder="••••••••"
                                    value={createForm.data.password}
                                    onChange={(e) => createForm.setData('password', e.target.value)}
                                />
                                {createForm.errors.password && <p className="text-xs text-red-400 mt-1">{createForm.errors.password}</p>}
                            </div>

                            <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold uppercase rounded-lg transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={createForm.processing}
                                    className="px-4 py-2 bg-[#d4af37] hover:bg-[#b5952f] text-[#001b3d] text-xs font-bold uppercase rounded-lg transition shadow"
                                >
                                    Simpan Akun
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Edit User */}
            {editingUser && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#031433] border border-white/20 rounded-xl max-w-md w-full p-6 text-white shadow-2xl">
                        <div className="flex justify-between items-center pb-4 border-b border-white/10">
                            <h4 className="font-bold text-[#d4af37]">Edit Data Personel</h4>
                            <button
                                onClick={() => setEditingUser(null)}
                                className="text-gray-400 hover:text-white text-lg font-bold"
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleUpdateUser} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">Nama Lengkap</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
                                    value={editForm.data.name}
                                    onChange={(e) => editForm.setData('name', e.target.value)}
                                />
                                {editForm.errors.name && <p className="text-xs text-red-400 mt-1">{editForm.errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
                                    value={editForm.data.email}
                                    onChange={(e) => editForm.setData('email', e.target.value)}
                                />
                                {editForm.errors.email && <p className="text-xs text-red-400 mt-1">{editForm.errors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">Role Akun</label>
                                <select
                                    className="w-full bg-[#001b3d] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
                                    value={editForm.data.role}
                                    onChange={(e) => editForm.setData('role', e.target.value)}
                                >
                                    <option value="staf">Staf Anggota (Operator)</option>
                                    <option value="pimpinan">Kasubbag Pimpinan (Reviewer)</option>
                                    <option value="admin">Super Admin (System Control)</option>
                                </select>
                                {editForm.errors.role && <p className="text-xs text-red-400 mt-1">{editForm.errors.role}</p>}
                            </div>

                            <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setEditingUser(null)}
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold uppercase rounded-lg transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="px-4 py-2 bg-[#d4af37] hover:bg-[#b5952f] text-[#001b3d] text-xs font-bold uppercase rounded-lg transition shadow"
                                >
                                    Update Akun
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Reset Password */}
            {resettingUser && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#031433] border border-white/20 rounded-xl max-w-md w-full p-6 text-white shadow-2xl">
                        <div className="flex justify-between items-center pb-4 border-b border-white/10">
                            <div>
                                <h4 className="font-bold text-[#d4af37]">Reset Password Personel</h4>
                                <p className="text-xs text-gray-400">{resettingUser.name} ({resettingUser.email})</p>
                            </div>
                            <button
                                onClick={() => setResettingUser(null)}
                                className="text-gray-400 hover:text-white text-lg font-bold"
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleResetPassword} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">Password Baru</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
                                    placeholder="Minimal 8 karakter"
                                    value={resetPasswordForm.data.password}
                                    onChange={(e) => resetPasswordForm.setData('password', e.target.value)}
                                />
                                {resetPasswordForm.errors.password && (
                                    <p className="text-xs text-red-400 mt-1">{resetPasswordForm.errors.password}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">Konfirmasi Password Baru</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
                                    placeholder="Ulangi password baru"
                                    value={resetPasswordForm.data.password_confirmation}
                                    onChange={(e) => resetPasswordForm.setData('password_confirmation', e.target.value)}
                                />
                            </div>

                            <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setResettingUser(null)}
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold uppercase rounded-lg transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={resetPasswordForm.processing}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase rounded-lg transition shadow"
                                >
                                    Simpan Password Baru
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
