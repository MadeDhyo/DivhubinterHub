import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({ auth, operations = [] }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard Pimpinan - OCMS
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-bold mb-4">Active Operations</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3">Op Number</th>
                                        <th className="px-6 py-3">Name</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3">Target</th>
                                        <th className="px-6 py-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {operations.map(op => (
                                        <tr key={op.id} className="bg-white border-b">
                                            <td className="px-6 py-4">{op.operation_number}</td>
                                            <td className="px-6 py-4">{op.name}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">{op.status}</span>
                                            </td>
                                            <td className="px-6 py-4">{op.targets[0]?.name || 'N/A'}</td>
                                            <td className="px-6 py-4">
                                                <Link href={`/operations/${op.id}`} className="text-indigo-600 hover:underline">View Detail</Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
