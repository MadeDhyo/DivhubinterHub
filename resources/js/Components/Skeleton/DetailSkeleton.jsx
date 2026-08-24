import React from 'react';

export default function DetailSkeleton() {
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header skeleton */}
            <div className="flex items-center gap-4 mb-6">
                <div className="h-10 w-10 rounded-full bg-white/10 skeleton-box" />
                <div className="space-y-2">
                    <div className="h-6 w-64 bg-white/15 rounded skeleton-box" />
                    <div className="h-3 w-40 bg-white/10 rounded skeleton-box" />
                </div>
            </div>

            {/* Container card skeleton */}
            <div className="overflow-hidden bg-[rgba(10,31,73,0.7)] border border-white/10 shadow-lg rounded-xl p-6 backdrop-blur-md">
                {/* Tabs skeleton */}
                <div className="border-b border-white/10 mb-6 pb-4 flex gap-6">
                    <div className="h-4 w-20 bg-[#d4af37]/20 rounded skeleton-box" />
                    <div className="h-4 w-20 bg-white/10 rounded skeleton-box" />
                    <div className="h-4 w-20 bg-white/10 rounded skeleton-box" />
                    <div className="h-4 w-20 bg-white/10 rounded skeleton-box" />
                </div>

                {/* Content grid skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                    <div className="bg-[#001b3d]/50 p-5 rounded-lg border border-white/5 space-y-3 skeleton-box">
                        <div className="h-3 w-28 bg-white/10 rounded" />
                        <div className="h-6 w-40 bg-white/15 rounded" />
                    </div>
                    <div className="bg-[#001b3d]/50 p-5 rounded-lg border border-white/5 space-y-3 skeleton-box">
                        <div className="h-3 w-28 bg-white/10 rounded" />
                        <div className="h-6 w-24 bg-white/15 rounded" />
                    </div>
                    <div className="bg-[#001b3d]/50 p-5 rounded-lg border border-white/5 space-y-3 skeleton-box">
                        <div className="h-3 w-28 bg-white/10 rounded" />
                        <div className="h-6 w-24 bg-white/15 rounded" />
                    </div>
                </div>
            </div>
        </div>
    );
}
