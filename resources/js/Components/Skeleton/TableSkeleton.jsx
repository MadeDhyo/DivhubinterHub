import React from 'react';

export default function TableSkeleton({ rows = 4 }) {
    return (
        <div className="bg-[#031433]/65 backdrop-blur-md border border-white/10 rounded-xl p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-6">
                <div className="space-y-2">
                    <div className="h-4 w-40 bg-white/15 rounded skeleton-box" />
                    <div className="h-3 w-56 bg-white/10 rounded skeleton-box" />
                </div>
                <div className="h-3 w-20 bg-white/10 rounded skeleton-box" />
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-300">
                    <thead className="text-[11px] uppercase border-b border-white/10">
                        <tr>
                            <th className="py-3 px-4"><div className="h-3 w-20 bg-white/10 rounded skeleton-box" /></th>
                            <th className="py-3 px-4"><div className="h-3 w-32 bg-white/10 rounded skeleton-box" /></th>
                            <th className="py-3 px-4"><div className="h-3 w-24 bg-white/10 rounded skeleton-box" /></th>
                            <th className="py-3 px-4 text-center"><div className="h-3 w-16 bg-white/10 rounded mx-auto skeleton-box" /></th>
                            <th className="py-3 px-4 text-right"><div className="h-3 w-12 bg-white/10 rounded ml-auto skeleton-box" /></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {Array.from({ length: rows }).map((_, idx) => (
                            <tr key={idx} className="animate-pulse">
                                <td className="py-4 px-4"><div className="h-4 w-28 bg-[#d4af37]/20 rounded skeleton-box" /></td>
                                <td className="py-4 px-4"><div className="h-4 w-36 bg-white/10 rounded skeleton-box" /></td>
                                <td className="py-4 px-4"><div className="h-3 w-24 bg-white/5 rounded skeleton-box" /></td>
                                <td className="py-4 px-4 text-center"><div className="h-5 w-20 bg-white/10 rounded-full mx-auto skeleton-box" /></td>
                                <td className="py-4 px-4 text-right"><div className="h-6 w-16 bg-[#d4af37]/15 rounded ml-auto skeleton-box" /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
