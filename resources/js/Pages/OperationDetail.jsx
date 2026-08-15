import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

export default function OperationDetail({ auth, operation, auditLogs = [], flash = {} }) {
    const [activeTab, setActiveTab] = useState('overview');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showVersionModal, setShowVersionModal] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    // Form for new document
    const uploadForm = useForm({
        operation_id: operation.id,
        title: '',
        document_type: 'RED_NOTICE',
        classification_level: 'RAHASIA',
        source_agency: 'NCB Jakarta',
        file: null,
        retention_until: '',
    });

    // Form for new version
    const versionForm = useForm({
        file: null,
        change_description: '',
    });

    const handleStatusChange = (itemId, newStatus) => {
        router.post(`/checklists/${itemId}/status`, {
            status: newStatus
        }, {
            preserveScroll: true
        });
    };

    const handleUploadDocument = (e) => {
        e.preventDefault();
        uploadForm.post('/documents', {
            onSuccess: () => {
                setShowUploadModal(false);
                uploadForm.reset();
            }
        });
    };

    const handleUploadVersion = (e) => {
        e.preventDefault();
        if (!selectedDoc) return;
        versionForm.post(`/documents/${selectedDoc.id}/versions`, {
            onSuccess: () => {
                setShowVersionModal(false);
                versionForm.reset();
                setSelectedDoc(null);
            }
        });
    };

    const getClassificationBadge = (level) => {
        switch (level) {
            case 'SANGAT_RAHASIA':
                return <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-red-100 text-red-800 border border-red-300">SANGAT RAHASIA</span>;
            case 'RAHASIA':
                return <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">RAHASIA</span>;
            case 'TERBATAS':
                return <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">TERBATAS</span>;
            default:
                return <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-800 border border-gray-300">BIASA</span>;
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Detail Operasi: {operation.operation_number}
                    </h2>
                    <span className="text-xs px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full font-medium">
                        Clearance Anda: {auth?.user?.classification_clearance || 'RAHASIA'}
                    </span>
                </div>
            }
        >
            <Head title={`Detail - ${operation.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">

                    {/* Flash Notifications */}
                    {flash?.success && (
                        <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm rounded shadow-sm">
                            {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded shadow-sm">
                            {flash.error}
                        </div>
                    )}

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg p-6">
                        
                        {/* Tabs Navigation */}
                        <div className="border-b border-gray-200 mb-6">
                            <nav className="-mb-px flex space-x-8">
                                {['overview', 'target', 'checklist', 'documents', 'audit_logs'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`${
                                            activeTab === tab
                                                ? 'border-indigo-500 text-indigo-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm uppercase tracking-wider`}
                                    >
                                        {tab.replace('_', ' ')}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Tab: Overview */}
                        {activeTab === 'overview' && (
                            <div>
                                <h3 className="text-lg font-bold">Overview</h3>
                                <div className="mt-4 grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Operation Name</p>
                                        <p className="font-medium text-gray-900">{operation.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Status</p>
                                        <p className="font-medium text-gray-900">{operation.status}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Priority</p>
                                        <p className="font-medium text-gray-900">{operation.priority}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab: Target */}
                        {activeTab === 'target' && (
                            <div>
                                <h3 className="text-lg font-bold">Targets</h3>
                                {operation.targets && operation.targets.length > 0 ? (
                                    operation.targets.map(target => (
                                        <div key={target.id} className="mt-4 border p-4 rounded bg-gray-50 grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-500">Name</p>
                                                <p className="font-medium">{target.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Alias</p>
                                                <p className="font-medium">{target.alias || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Red Notice Ref</p>
                                                <p className="font-medium">{target.red_notice_ref || '-'}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="mt-4 text-gray-500">No targets assigned to this operation.</p>
                                )}
                            </div>
                        )}

                        {/* Tab: Checklist Engine */}
                        {activeTab === 'checklist' && (
                            <div>
                                <h3 className="text-lg font-bold mb-4">Checklist Engine</h3>
                                {operation.checklists && operation.checklists.length > 0 ? (
                                    operation.checklists.map(checklist => (
                                        <div key={checklist.id} className="mb-6 border rounded-md shadow-sm">
                                            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                                                <h4 className="font-semibold text-gray-800">{checklist.template?.name}</h4>
                                            </div>
                                            <ul className="divide-y divide-gray-200">
                                                {checklist.items && checklist.items.map(item => (
                                                    <li key={item.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                                                        <div>
                                                            <span className="font-medium text-gray-900">
                                                                {item.template_item?.name}
                                                                {item.template_item?.is_mandatory && <span className="text-red-500 ml-1" title="Mandatory">*</span>}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <select 
                                                                className="text-sm border-gray-300 rounded-md shadow-sm"
                                                                value={item.status}
                                                                onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                                            >
                                                                <option value="Not Started">Not Started</option>
                                                                <option value="In Progress">In Progress</option>
                                                                <option value="Completed">Completed</option>
                                                            </select>
                                                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                                                item.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                                                                item.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
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
                                    <p className="mt-4 text-gray-500">No checklists available for this operation.</p>
                                )}
                            </div>
                        )}

                        {/* Tab: Documents Management (Ardy's Module) */}
                        {activeTab === 'documents' && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Repository Dokumen Operasi</h3>
                                        <p className="text-sm text-gray-500">Seluruh dokumen terenkripsi AES-256 dan dilindungi verifikasi integritas SHA-256.</p>
                                    </div>
                                    <button
                                        onClick={() => setShowUploadModal(true)}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium shadow-sm flex items-center gap-2"
                                    >
                                        + Unggah Dokumen Baru
                                    </button>
                                </div>

                                {operation.documents && operation.documents.length > 0 ? (
                                    <div className="overflow-x-auto border rounded-lg shadow-sm">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">No. Dokumen & Judul</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Jenis</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Kerahasiaan</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Versi & SHA-256</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Pengunggah</th>
                                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200 text-sm">
                                                {operation.documents.map((doc) => {
                                                    const latestVer = doc.versions?.[doc.versions.length - 1];
                                                    return (
                                                        <tr key={doc.id} className="hover:bg-gray-50">
                                                            <td className="px-4 py-3">
                                                                <div className="font-semibold text-gray-900">{doc.title}</div>
                                                                <div className="text-xs text-gray-400 font-mono">{doc.document_number}</div>
                                                                <div className="text-xs text-gray-500">Sumber: {doc.source_agency}</div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                                                                    {doc.document_type}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                {getClassificationBadge(doc.classification_level)}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="font-medium text-indigo-600">v{doc.current_version}</div>
                                                                {latestVer && (
                                                                    <div className="text-xs text-gray-400 font-mono" title={latestVer.checksum_sha256}>
                                                                        SHA: {latestVer.checksum_sha256.substring(0, 10)}...
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3 text-xs text-gray-600">
                                                                {doc.uploader?.name || 'Officer'}
                                                            </td>
                                                            <td className="px-4 py-3 text-right space-x-2">
                                                                <a
                                                                    href={`/documents/${doc.id}/download`}
                                                                    target="_blank"
                                                                    className="px-2.5 py-1 bg-green-50 text-green-700 hover:bg-green-100 rounded text-xs font-medium border border-green-200"
                                                                    title="Unduh Berkas Ter-Watermark"
                                                                >
                                                                    Unduh
                                                                </a>
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedDoc(doc);
                                                                        setShowVersionModal(true);
                                                                    }}
                                                                    className="px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded text-xs font-medium border border-indigo-200"
                                                                >
                                                                    + Versi Baru
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="p-8 text-center border-2 border-dashed rounded-lg bg-gray-50">
                                        <p className="text-gray-500">Belum ada dokumen operasional yang diunggah.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab: Audit Logs (Non-Repudiation Trail) */}
                        {activeTab === 'audit_logs' && (
                            <div>
                                <div className="mb-4">
                                    <h3 className="text-lg font-bold text-gray-900">Audit Trail System (Tamper-Evident Logs)</h3>
                                    <p className="text-sm text-gray-500">Jejak aktivitas kronologis terlindungi dengan HMAC-SHA256 hash berantai.</p>
                                </div>

                                <div className="overflow-x-auto border rounded-lg shadow-sm">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Waktu</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Aktor</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Modul & Aksi</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">IP Address</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Record Hash (HMAC-SHA256)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200 text-xs font-mono">
                                            {auditLogs.length > 0 ? (
                                                auditLogs.map((log) => (
                                                    <tr key={log.id} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 text-gray-600">{new Date(log.event_time).toLocaleString('id-ID')}</td>
                                                        <td className="px-4 py-3 font-sans">
                                                            <div className="font-semibold text-gray-900">{log.actor_name}</div>
                                                            <div className="text-xs text-gray-400">{log.actor_role}</div>
                                                        </td>
                                                        <td className="px-4 py-3 font-sans">
                                                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-50 text-indigo-700">
                                                                {log.module}
                                                            </span>
                                                            <span className="ml-2 font-medium text-gray-700">{log.action_type}</span>
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-500">{log.ip_address}</td>
                                                        <td className="px-4 py-3 text-gray-400" title={log.record_hash}>
                                                            <span className="text-green-600 font-bold mr-1">✓</span>
                                                            {log.record_hash.substring(0, 16)}...
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="p-4 text-center text-gray-500 font-sans">
                                                        Belum ada jejak audit log tercatat untuk operasi ini.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* Modal Upload Dokumen Baru */}
            {showUploadModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Unggah Dokumen Operasi Baru</h3>
                        <form onSubmit={handleUploadDocument} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700">Judul Dokumen</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 w-full border-gray-300 rounded-md text-sm"
                                    value={uploadForm.data.title}
                                    onChange={(e) => uploadForm.setData('title', e.target.value)}
                                    placeholder="Contoh: Red Notice Interpol - Fugitive X"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Jenis Dokumen</label>
                                    <select
                                        className="mt-1 w-full border-gray-300 rounded-md text-sm"
                                        value={uploadForm.data.document_type}
                                        onChange={(e) => uploadForm.setData('document_type', e.target.value)}
                                    >
                                        <option value="RED_NOTICE">RED NOTICE</option>
                                        <option value="DIFFUSION">DIFFUSION</option>
                                        <option value="WARRANT">SURAT PERINTAH / WARRANT</option>
                                        <option value="PASSPORT">PASPOR / IDENTITAS</option>
                                        <option value="EXTRADITION">DOKUMEN EKSTRADISI</option>
                                        <option value="OTHER">LAINNYA</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Tingkat Kerahasiaan</label>
                                    <select
                                        className="mt-1 w-full border-gray-300 rounded-md text-sm"
                                        value={uploadForm.data.classification_level}
                                        onChange={(e) => uploadForm.setData('classification_level', e.target.value)}
                                    >
                                        <option value="SANGAT_RAHASIA">SANGAT RAHASIA</option>
                                        <option value="RAHASIA">RAHASIA</option>
                                        <option value="TERBATAS">TERBATAS</option>
                                        <option value="BIASA">BIASA</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700">Instansi Sumber</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 w-full border-gray-300 rounded-md text-sm"
                                    value={uploadForm.data.source_agency}
                                    onChange={(e) => uploadForm.setData('source_agency', e.target.value)}
                                    placeholder="NCB Jakarta / Interpol Lyon / Polda"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700">Berkas Dokumen (PDF, Max 50MB)</label>
                                <input
                                    type="file"
                                    required
                                    className="mt-1 w-full text-xs"
                                    onChange={(e) => uploadForm.setData('file', e.target.files[0])}
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setShowUploadModal(false)}
                                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-xs font-medium text-gray-700"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploadForm.processing}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium shadow"
                                >
                                    {uploadForm.processing ? 'Mengunggah & Enkripsi...' : 'Unggah & Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Upload Versi Baru */}
            {showVersionModal && selectedDoc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Unggah Versi Baru Dokumen</h3>
                        <p className="text-xs text-gray-500 mb-4">Versi saat ini: v{selectedDoc.current_version} ({selectedDoc.title})</p>
                        <form onSubmit={handleUploadVersion} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700">Deskripsi Perubahan Versi</label>
                                <textarea
                                    required
                                    rows="3"
                                    className="mt-1 w-full border-gray-300 rounded-md text-sm"
                                    value={versionForm.data.change_description}
                                    onChange={(e) => versionForm.setData('change_description', e.target.value)}
                                    placeholder="Contoh: Pembaruan stempel terjemahan resmi..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700">Berkas Revisi Baru</label>
                                <input
                                    type="file"
                                    required
                                    className="mt-1 w-full text-xs"
                                    onChange={(e) => versionForm.setData('file', e.target.files[0])}
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowVersionModal(false);
                                        setSelectedDoc(null);
                                    }}
                                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-xs font-medium text-gray-700"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={versionForm.processing}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium shadow"
                                >
                                    {versionForm.processing ? 'Menyimpan Versi...' : 'Unggah Versi v' + (selectedDoc.current_version + 1)}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </AuthenticatedLayout>
    );
}

