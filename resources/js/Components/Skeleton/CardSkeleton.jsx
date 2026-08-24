import React from 'react';

export default function CardSkeleton({ count = 4 }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: count }).map((_, idx) => (
                <div
                    key={idx}
                    className="bg-[#031433]/65 backdrop-blur-md border border-white/10 rounded-xl p-6 relative overflow-hidden skeleton-box"
                >
                    <div className="flex items-center justify-between">
                        <div className="h-3 w-24 bg-white/10 rounded" />
                        <div className="h-6 w-6 rounded-full bg-white/10" />
                    </div>
                    <div className="h-8 w-16 bg-white/15 rounded mt-4" />
                    <div className="h-2 w-32 bg-white/10 rounded mt-3" />
                </div>
            ))}
        </div>
    );
}
