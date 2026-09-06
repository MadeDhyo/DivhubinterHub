import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function ActivityLogs({ logs }) {
    const [selectedLog, setSelectedLog] = useState(null);
    const [actionFilter, setActionFilter] = useState('all');

    const getActionBadge = (action) => {
        if (action.includes('CREATED')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        if (action.includes('DELETED')) return 'bg-red-500/10 text-red-400 border-red-500/20';
        if (action.includes('UPDATED') || action.includes('RESET')) return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
        if (action.includes('VERIF')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    };

    const filteredLogs = logs.data.filter((log) => {
        if (actionFilter === 'all') return true;
        if (actionFilter === 'USER') return log.action.includes('USER');
        if (actionFilter === 'CHECKLIST') return log.action.includes('CHECKLIST');
        if (actionFilter === 'OPERATION') return log.action.includes('OPERATION');
        return true;
    });

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
                                <p className="text-xs text-gray-400 mt-1">Catatan riwayat aktivitas pengguna, perubahan data, dan audit trail keamanan tersimpan permanen.</p>
                            </div>

                            {/* Action Filter */}
                            <select
                                value={actionFilter}
                                onChange={(e) => setActionFilter(e.target.value)}
                                className="bg-[#001b3d] border border-white/10 rounded-lg px-3 py-2 text-xs font-semibold text-white focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
                            >
                                <option value="all">Semua Tipe Aktivitas</option>
                                <option value="USER">Pengguna & Akun</option>
                                <option value="CHECKLIST">Checklist Operasi</option>
                                <option value="OPERATION">Manajemen Kasus Operasi</option>
                            </select>
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
                                        <th className="px-6 py-3 font-semibold tracking-wider text-right">Detail Diff</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredLogs.length > 0 ? (
                                        filteredLogs.map((log) => (
                                            <tr key={log.id} className="hover:bg-white/5 transition">
                                                <td className="px-6 py-4 text-xs text-gray-400 font-mono whitespace-nowrap">
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
                                                <td className="px-6 py-4 text-right">
                                                    {log.properties ? (
                                                        <button
                                                            onClick={() => setSelectedLog(log)}
                                                            className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-[#d4af37] text-xs font-bold rounded border border-[#d4af37]/30 transition"
                                                        >
                                                            Lihat Diff Payload
                                                        </button>
                                                    ) : (
                                                        <span className="text-xs text-gray-500 italic">-</span>
                                                    )}
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

            {/* Modal Detail Diff */}
            {selectedLog && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#031433] border border-white/20 rounded-xl max-w-2xl w-full p-6 text-white shadow-2xl">
                        <div className="flex justify-between items-center pb-4 border-b border-white/10">
                            <div>
                                <h4 className="font-bold text-[#d4af37]">Detail Audit Trail Payload</h4>
                                <p className="text-xs text-gray-400">Aksi: {selectedLog.action} | {new Date(selectedLog.created_at).toLocaleString('id-ID')}</p>
                            </div>
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="text-gray-400 hover:text-white text-lg font-bold"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="mt-4 space-y-4 max-h-96 overflow-y-auto pr-2">
                            <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                                <p className="text-xs font-bold text-gray-300 mb-1">Deskripsi:</p>
                                <p className="text-xs text-white">{selectedLog.description}</p>
                            </div>

                            {selectedLog.properties?.old && (
                                <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                                    <p className="text-xs font-bold text-red-400 mb-2">Nilai Sebelum Perubahan (Before):</p>
                                    <pre className="text-xs font-mono text-red-300 whitespace-pre-wrap">
                                        {JSON.stringify(selectedLog.properties.old, null, 2)}
                                    </pre>
                                </div>
                            )}

                            {selectedLog.properties?.new && (
                                <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                    <p className="text-xs font-bold text-emerald-400 mb-2">Nilai Setelah Perubahan (After):</p>
                                    <pre className="text-xs font-mono text-emerald-300 whitespace-pre-wrap">
                                        {JSON.stringify(selectedLog.properties.new, null, 2)}
                                    </pre>
                                </div>
                            )}

                            {selectedLog.properties?.extra && (
                                <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                    <p className="text-xs font-bold text-blue-400 mb-2">Metadata Tambahan:</p>
                                    <pre className="text-xs font-mono text-blue-300 whitespace-pre-wrap">
                                        {JSON.stringify(selectedLog.properties.extra, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>

                        <div className="pt-4 border-t border-white/10 flex justify-end">
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="px-4 py-2 bg-[#d4af37] hover:bg-[#b5952f] text-[#001b3d] text-xs font-bold uppercase rounded-lg transition"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
