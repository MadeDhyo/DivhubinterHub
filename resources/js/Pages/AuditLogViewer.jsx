import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

export default function AuditLogViewer({ auth, logs, filters = {} }) {
    const [moduleFilter, setModuleFilter] = useState(filters.module || '');
    const [actionFilter, setActionFilter] = useState(filters.action || '');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get('/audit-logs', {
            module: moduleFilter,
            action: actionFilter
        }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Audit Trail & Integrity Log System
                    </h2>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full border border-green-300">
                        ✓ Rantai Hash HMAC-SHA256 Aktif
                    </span>
                </div>
            }
        >
            <Head title="Audit Trail Logs" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">

                        {/* Filter Bar */}
                        <form onSubmit={handleFilter} className="mb-6 flex gap-4 items-end bg-gray-50 p-4 rounded-lg border">
                            <div>
                                <label className="block text-xs font-medium text-gray-700">Filter Modul</label>
                                <select
                                    className="mt-1 border-gray-300 rounded-md text-sm"
                                    value={moduleFilter}
                                    onChange={(e) => setModuleFilter(e.target.value)}
                                >
                                    <option value="">Semua Modul</option>
                                    <option value="DOCUMENT">DOCUMENT</option>
                                    <option value="OPERATION">OPERATION</option>
                                    <option value="CHECKLIST">CHECKLIST</option>
                                    <option value="APPROVAL">APPROVAL</option>
                                    <option value="USER">USER</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700">Filter Aksi</label>
                                <select
                                    className="mt-1 border-gray-300 rounded-md text-sm"
                                    value={actionFilter}
                                    onChange={(e) => setActionFilter(e.target.value)}
                                >
                                    <option value="">Semua Aksi</option>
                                    <option value="CREATE">CREATE</option>
                                    <option value="UPDATE">UPDATE</option>
                                    <option value="DELETE">DELETE</option>
                                    <option value="DOWNLOAD">DOWNLOAD</option>
                                    <option value="NEW_VERSION">NEW_VERSION</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-medium"
                            >
                                Terapkan Filter
                            </button>
                        </form>

                        {/* Audit Log Table */}
                        <div className="overflow-x-auto border rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Waktu Log</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Aktor / Pengguna</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Modul & Aksi</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Entitas ID</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">IP & User Agent</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">HMAC Record Hash</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 text-xs font-mono">
                                    {logs.data && logs.data.length > 0 ? (
                                        logs.data.map((log) => (
                                            <tr key={log.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                                                    {new Date(log.event_time).toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-4 py-3 font-sans">
                                                    <div className="font-semibold text-gray-900">{log.actor_name}</div>
                                                    <div className="text-xs text-gray-400">{log.actor_role}</div>
                                                </td>
                                                <td className="px-4 py-3 font-sans">
                                                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-100 text-indigo-800">
                                                        {log.module}
                                                    </span>
                                                    <span className="ml-2 font-medium text-gray-800">{log.action_type}</span>
                                                </td>
                                                <td className="px-4 py-3 text-gray-500">{log.entity_name} #{log.entity_id}</td>
                                                <td className="px-4 py-3 text-gray-500">{log.ip_address}</td>
                                                <td className="px-4 py-3 font-mono text-gray-400" title={log.record_hash}>
                                                    <span className="text-green-600 font-bold mr-1">✓ Verified</span>
                                                    {log.record_hash.substring(0, 16)}...
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="p-6 text-center text-gray-500 font-sans">
                                                Tidak ada data audit log ditemukan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
