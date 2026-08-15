<?php

namespace App\Services;

use App\Models\Operation;
use App\Models\OperationChecklistItem;

class ReadinessService
{
    /**
     * Hitung kesiapan operasi berdasarkan checklist wajib (mandatory).
     *
     * @param Operation $operation
     * @return array{
     *     score: float|int,
     *     total_mandatory: int,
     *     completed_mandatory: int,
     *     status: string,
     *     has_mandatory_items: bool,
     *     message: string,
     *     overdue_items: array,
     *     has_overdue: bool,
     *     uncompleted_critical_blockers: array,
     *     has_uncompleted_critical_blockers: bool
     * }
     */
    public function calculate(Operation $operation): array
    {
        // Pastikan relasi checklist termuat untuk menghindari N+1 query
        $operation->loadMissing('checklists.items.templateItem');

        // Kumpulkan semua item checklist dari setiap checklist dalam operasi
        $allItems = $operation->checklists->flatMap->items;

        // Filter hanya item yang bersifat mandatory (wajib)
        $mandatoryItems = $allItems->filter(function ($item) {
            return $item->templateItem && $item->templateItem->is_mandatory;
        });

        $totalMandatory = $mandatoryItems->count();
        $completedMandatory = $mandatoryItems->where('status', 'Completed')->count();

        // 1. Identifikasi item Overdue (belum Completed dan melewati deadline)
        $now = now();
        $overdueItems = $allItems->filter(function ($item) use ($now) {
            return $item->status !== 'Completed' 
                && $item->deadline 
                && $item->deadline < $now;
        });

        // 2. Identifikasi Critical Blocker yang belum Completed
        $uncompletedCriticalBlockers = $allItems->filter(function ($item) {
            return $item->status !== 'Completed' && $this->isCriticalBlocker($item);
        });

        $hasUncompletedCritical = $uncompletedCriticalBlockers->isNotEmpty();

        // 3. Penanganan Kondisi Khusus: Jika tidak ada item mandatory
        if ($totalMandatory === 0) {
            return [
                'score' => 100,
                'total_mandatory' => 0,
                'completed_mandatory' => 0,
                'status' => $hasUncompletedCritical ? 'NOT_READY' : 'READY',
                'has_mandatory_items' => false,
                'message' => $hasUncompletedCritical 
                    ? 'Operasi tidak memiliki item wajib, tetapi terhambat oleh blocker kritis non-mandatory.'
                    : 'Operasi ini tidak memiliki item checklist wajib (mandatory). Secara administratif dianggap siap.',
                'overdue_items' => $this->formatItems($overdueItems),
                'has_overdue' => $overdueItems->isNotEmpty(),
                'uncompleted_critical_blockers' => $this->formatItems($uncompletedCriticalBlockers),
                'has_uncompleted_critical_blockers' => $hasUncompletedCritical,
            ];
        }

        // 4. Perhitungan Skor Kesiapan (hanya didasarkan pada item wajib)
        $score = ($completedMandatory / $totalMandatory) * 100;

        // 5. Penentuan Status Berdasarkan Kelayakan Bisnis & Critical Blocker
        if ($completedMandatory === $totalMandatory && !$hasUncompletedCritical) {
            $status = 'READY';
            $message = 'Semua persyaratan wajib telah dipenuhi.';
        } else {
            if ($completedMandatory > 0) {
                $status = 'PARTIALLY_READY';
                $message = $hasUncompletedCritical 
                    ? "Persyaratan wajib terpenuhi sebagian dan terhambat oleh blocker kritis."
                    : "Persyaratan wajib baru terpenuhi sebagian ($completedMandatory dari $totalMandatory).";
            } else {
                $status = 'NOT_READY';
                $message = $hasUncompletedCritical 
                    ? 'Belum ada persyaratan wajib yang dipenuhi dan terhambat oleh blocker kritis.'
                    : 'Belum ada persyaratan wajib yang dipenuhi.';
            }
        }

        return [
            'score' => round($score, 2),
            'total_mandatory' => $totalMandatory,
            'completed_mandatory' => $completedMandatory,
            'status' => $status,
            'has_mandatory_items' => true,
            'message' => $message,
            'overdue_items' => $this->formatItems($overdueItems),
            'has_overdue' => $overdueItems->isNotEmpty(),
            'uncompleted_critical_blockers' => $this->formatItems($uncompletedCriticalBlockers),
            'has_uncompleted_critical_blockers' => $hasUncompletedCritical,
        ];
    }

    /**
     * Tentukan apakah item checklist adalah critical blocker (Abstraksi Bisnis).
     *
     * @param OperationChecklistItem $item
     * @return bool
     */
    public function isCriticalBlocker(OperationChecklistItem $item): bool
    {
        if (!$item->templateItem) {
            return false;
        }

        // Karena tidak ada kolom khusus, kita gunakan pendeteksian nama/kata kunci secara dinamis.
        $criticalKeywords = ['red notice', 'identifikasi', 'critical', 'blocker'];
        $nameLower = strtolower($item->templateItem->name);

        foreach ($criticalKeywords as $keyword) {
            if (str_contains($nameLower, $keyword)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Helper untuk memformat output data item checklist.
     */
    private function formatItems($itemsCollection): array
    {
        return $itemsCollection->map(fn($item) => [
            'id' => $item->id,
            'name' => $item->templateItem?->name ?? 'Unknown',
            'status' => $item->status,
            'deadline' => $item->deadline,
        ])->values()->toArray();
    }
}
