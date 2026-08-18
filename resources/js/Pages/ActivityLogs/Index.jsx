import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function ActivityLogs({ logs }) {
    const getActionBadge = (action) => {
        if (action.includes('CREATED')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        if (action.includes('DELETED')) return 'bg-red-500/10 text-red-400 border-red-500/20';
        if (action.includes('VERIF')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    };

    return (
        <AuthenticatedLayout>
            <Head title="Log Aktivitas Sistem" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl">
                    <div className="overflow-hidden bg-[rgba(10,31,73,0.7)] border border-white/10 shadow-lg rounded-xl p-6 backdrop-blur-md text-white">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
                            <div>
                                <h3 className="text-lg font-bold text-[#d4af37] flex items-center gap-2">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Log Aktivitas & Audit Trail Sistem
                                </h3>
                                <p className="text-xs text-gray-400 mt-1">Catatan riwayat aktivitas pengguna, perubahan data, dan keamanan sistem secara real-time.</p>
                            </div>
                        </div>

                        {/* Logs Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-400 uppercase bg-[#001b3d]/50 border-b border-white/10">
                                    <tr>
                                        <th className="px-6 py-3 font-semibold tracking-wider">Waktu</th>
                                        <th className="px-6 py-3 font-semibold tracking-wider">Pengguna</th>
                                        <th className="px-6 py-3 font-semibold tracking-wider">Aksi</th>
                                        <th className="px-6 py-3 font-semibold tracking-wider">Deskripsi Aktivitas</th>
                                        <th className="px-6 py-3 font-semibold tracking-wider text-right">IP Address</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {logs.data.length > 0 ? (
                                        logs.data.map(log => (
                                            <tr key={log.id} className="hover:bg-white/5 transition">
                                                <td className="px-6 py-4 text-xs text-gray-400 font-mono">
                                                    {new Date(log.created_at).toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-6 py-4 font-semibold text-white">
                                                    {log.user ? (
                                                        <div>
                                                            <p className="text-sm">{log.user.name}</p>
                                                            <span className="text-[9px] text-[#d4af37] font-bold tracking-widest uppercase">{log.user.role}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-500 italic">Sistem / Terhapus</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getActionBadge(log.action)}`}>
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-200 text-xs">
                                                    {log.description || '-'}
                                                </td>
                                                <td className="px-6 py-4 text-right text-gray-400 font-mono text-xs">
                                                    {log.ip_address || '127.0.0.1'}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-gray-400 text-sm">
                                                Belum ada catatan log aktivitas sistem.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {logs.links && logs.links.length > 3 && (
                            <div className="mt-6 flex justify-center gap-1">
                                {logs.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1.5 rounded text-xs font-bold transition ${
                                            link.active
                                                ? 'bg-[#d4af37] text-[#001b3d]'
                                                : link.url
                                                ? 'bg-white/5 text-gray-300 hover:bg-white/10'
                                                : 'text-gray-600 cursor-not-allowed'
                                        }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
