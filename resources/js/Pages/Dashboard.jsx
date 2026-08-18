import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function Dashboard({ auth, operations = [] }) {
    const [searchQuery, setSearchQuery] = useState('');

    // Filter operasi berdasarkan input pencarian (client-side search)
    const filteredOperations = operations.filter(op =>
        op.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        op.operation_number.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Hitung total operasi aktif (status selain 'Closed')
    const activeOperationsCount = operations.filter(op => op.status !== 'Closed').length;

    return (
        <AuthenticatedLayout>
            <Head title="Pusat Komando Operasional" />

            <div className="space-y-8">
                {/* SUMMARY CARDS */}
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

                {/* TABLE & RISK REGIONAL SIDEBAR GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT TABLE: Operasi Prioritas Tinggi */}
                    <div className="lg:col-span-2 bg-[#031433]/65 backdrop-blur-md border border-white/10 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-white">Operasi Prioritas Tinggi</h3>
                                <p className="text-xs text-gray-400">Daftar kasus operasi aktif DivHubInter</p>
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
            </div>
        </AuthenticatedLayout>
    );
}
