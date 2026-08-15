import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

export default function OperationDetail({ auth, operation, readiness }) {
    const [activeTab, setActiveTab] = useState('overview');

    const handleStatusChange = (itemId, newStatus) => {
        router.post(`/checklists/${itemId}/status`, {
            status: newStatus
        }, {
            preserveScroll: true
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Detail Operasi: {operation.operation_number}
                </h2>
            }
        >
            <Head title={`Detail - ${operation.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg p-6">
                        
                        {/* Tabs Navigation */}
                        <div className="border-b border-gray-200 mb-6">
                            <nav className="-mb-px flex space-x-8">
                                {['overview', 'target', 'checklist', 'readiness'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`${
                                            activeTab === tab
                                                ? 'border-indigo-500 text-indigo-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
                                    >
                                        {tab}
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
                                {operation.targets.length > 0 ? (
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
                                {operation.checklists.length > 0 ? (
                                    operation.checklists.map(checklist => (
                                        <div key={checklist.id} className="mb-6 border rounded-md shadow-sm">
                                            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                                                <h4 className="font-semibold text-gray-800">{checklist.template?.name}</h4>
                                            </div>
                                            <ul className="divide-y divide-gray-200">
                                                {checklist.items.map(item => (
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

                        {/* Tab: Readiness */}
                        {activeTab === 'readiness' && readiness && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-gray-900">Readiness Assessment</h3>
                                
                                {/* Status Card and Progress Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Score Card */}
                                    <div className="bg-white border rounded-lg p-5 shadow-sm flex flex-col items-center justify-center">
                                        <span className="text-sm text-gray-500 font-medium">Readiness Score</span>
                                        <span className="text-4xl font-extrabold text-indigo-600 mt-2">{readiness.score}%</span>
                                    </div>

                                    {/* Status Card */}
                                    <div className="bg-white border rounded-lg p-5 shadow-sm flex flex-col items-center justify-center">
                                        <span className="text-sm text-gray-500 font-medium">Readiness Status</span>
                                        <span className={`inline-flex items-center px-3 py-1 mt-3 rounded-full text-sm font-bold ${
                                            readiness.status === 'READY' ? 'bg-green-100 text-green-800' :
                                            readiness.status === 'PARTIALLY_READY' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {readiness.status}
                                        </span>
                                    </div>

                                    {/* Progress Card */}
                                    <div className="bg-white border rounded-lg p-5 shadow-sm flex flex-col items-center justify-center">
                                        <span className="text-sm text-gray-500 font-medium">Mandatory Checklist Progress</span>
                                        <span className="text-2xl font-bold text-gray-900 mt-2">
                                            {readiness.completed_mandatory} / {readiness.total_mandatory}
                                        </span>
                                        <span className="text-xs text-gray-400 mt-1">items completed</span>
                                    </div>
                                </div>

                                {/* Message */}
                                <div className="p-4 bg-indigo-50 border-l-4 border-indigo-500 text-indigo-700 rounded-r-md text-sm">
                                    {readiness.message}
                                </div>

                                {/* Warning: Missing Mandatory Items */}
                                {!readiness.has_mandatory_items && (
                                    <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded-r-md text-sm">
                                        <strong>Peringatan:</strong> Operasi ini belum memiliki konfigurasi item checklist wajib (mandatory).
                                    </div>
                                )}

                                {/* Critical Blockers Section */}
                                <div className="border rounded-lg p-5 shadow-sm bg-white">
                                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-red-500"></span>
                                        Critical Blockers ({readiness.uncompleted_critical_blockers.length})
                                    </h4>
                                    {readiness.has_uncompleted_critical_blockers ? (
                                        <ul className="divide-y divide-gray-100">
                                            {readiness.uncompleted_critical_blockers.map(item => (
                                                <li key={item.id} className="py-2.5 flex items-center justify-between text-sm">
                                                    <span className="font-medium text-gray-700">{item.name}</span>
                                                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800 uppercase">
                                                        {item.status}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-500">Tidak ada blocker kritis. Semua persyaratan utama terpenuhi atau belum dikonfigurasi.</p>
                                    )}
                                </div>

                                {/* Overdue Items Section */}
                                <div className="border rounded-lg p-5 shadow-sm bg-white">
                                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                                        Overdue Items ({readiness.overdue_items.length})
                                    </h4>
                                    {readiness.has_overdue ? (
                                        <ul className="divide-y divide-gray-100">
                                            {readiness.overdue_items.map(item => (
                                                <li key={item.id} className="py-2.5 flex items-center justify-between text-sm">
                                                    <div>
                                                        <p className="font-medium text-gray-700">{item.name}</p>
                                                        {item.deadline && (
                                                            <p className="text-xs text-red-500 mt-0.5">
                                                                Batas waktu: {new Date(item.deadline).toLocaleString('id-ID')}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-yellow-100 text-yellow-800 uppercase">
                                                        {item.status}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-500">Tidak ada item yang melewati batas waktu (overdue).</p>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
