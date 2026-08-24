<?php

namespace App\Services;

use App\Models\Operation;
use App\Models\OperationChecklistItem;
use App\Models\ReadinessSnapshot;

class ReadinessService
{
    /**
     * Hitung kesiapan operasi berdasarkan skor berbobot (weighted score).
     */
    public function calculate(Operation $operation): array
    {
        $operation->loadMissing('checklists.items.templateItem');

        $allItems = $operation->checklists->flatMap->items;

        $mandatoryItems = $allItems->filter(function ($item) {
            return $item->templateItem && $item->templateItem->is_mandatory;
        });

        $totalMandatoryCount = $mandatoryItems->count();
        $completedMandatoryCount = $mandatoryItems->where('status', 'Completed')->count();

        // Hitung total bobot mandatory dan total bobot mandatory yang completed
        $totalWeight = 0;
        $completedWeight = 0;

        foreach ($mandatoryItems as $item) {
            $baseWeight = (float) ($item->templateItem->weight ?? 1.0);
            if ($item->templateItem->is_critical && $baseWeight == 1.0) {
                $baseWeight = 1.5; // Multiplier otomatis untuk critical item jika masih default
            }

            $totalWeight += $baseWeight;

            if ($item->status === 'Completed' || $item->status === 'Verified') {
                $completedWeight += $baseWeight;
            }
        }

        // Identifikasi Overdue dan Critical Blocker
        $now = now();
        $overdueItems = $allItems->filter(function ($item) use ($now) {
            return !in_array($item->status, ['Completed', 'Verified'])
                && $item->deadline 
                && $item->deadline < $now;
        });

        $uncompletedCriticalBlockers = $allItems->filter(function ($item) {
            return !in_array($item->status, ['Completed', 'Verified']) && $this->isCriticalBlocker($item);
        });

        $hasUncompletedCritical = $uncompletedCriticalBlockers->isNotEmpty();

        if ($totalMandatoryCount === 0 || $totalWeight === 0) {
            return [
                'score' => 0,
                'total_mandatory' => 0,
                'completed_mandatory' => 0,
                'total_weight' => 0,
                'completed_weight' => 0,
                'status' => 'PENDING_CONFIGURATION',
                'has_mandatory_items' => false,
                'message' => 'Operasi belum memiliki mandatory checklist yang dikonfigurasi.',
                'overdue_items' => $this->formatItems($overdueItems),
                'has_overdue' => $overdueItems->isNotEmpty(),
                'uncompleted_critical_blockers' => $this->formatItems($uncompletedCriticalBlockers),
                'has_uncompleted_critical_blockers' => $hasUncompletedCritical,
                'history' => [],
                'trend' => 'STABLE',
            ];
        }

        // Perhitungan Skor Kesiapan Berbobot
        $score = ($completedWeight / $totalWeight) * 100;
        $score = round($score, 2);

        // Penentuan Status
        if ($completedWeight >= $totalWeight && !$hasUncompletedCritical) {
            $status = 'READY';
            $message = 'Semua persyaratan berbobot wajib telah dipenuhi.';
        } else {
            if ($completedWeight >= $totalWeight && $hasUncompletedCritical) {
                $status = 'NOT_READY';
                $message = 'Seluruh persyaratan wajib terpenuhi, namun terdapat blocker kritis yang belum diselesaikan.';
            } elseif ($completedWeight > 0) {
                $status = 'PARTIALLY_READY';
                $message = $hasUncompletedCritical 
                    ? "Persyaratan wajib baru terpenuhi sebagian ($completedMandatoryCount dari $totalMandatoryCount item) dan terhambat blocker kritis."
                    : "Persyaratan wajib terpenuhi sebagian (Skor $score%).";
            } else {
                $status = 'NOT_READY';
                $message = $hasUncompletedCritical 
                    ? 'Belum ada persyaratan wajib yang dipenuhi dan terhambat oleh blocker kritis.'
                    : 'Belum ada persyaratan wajib yang dipenuhi.';
            }
        }

        // Ambil Riwayat Snapshot
        $historySnapshots = ReadinessSnapshot::where('operation_id', $operation->id)
            ->orderBy('created_at', 'asc')
            ->get();

        $trend = 'STABLE';
        if ($historySnapshots->count() >= 2) {
            $lastScore = $historySnapshots[$historySnapshots->count() - 1]->score;
            $prevScore = $historySnapshots[$historySnapshots->count() - 2]->score;
            if ($lastScore > $prevScore) $trend = 'UP';
            elseif ($lastScore < $prevScore) $trend = 'DOWN';
        }

        return [
            'score' => $score,
            'total_mandatory' => $totalMandatoryCount,
            'completed_mandatory' => $completedMandatoryCount,
            'total_weight' => round($totalWeight, 2),
            'completed_weight' => round($completedWeight, 2),
            'status' => $status,
            'has_mandatory_items' => true,
            'message' => $message,
            'overdue_items' => $this->formatItems($overdueItems),
            'has_overdue' => $overdueItems->isNotEmpty(),
            'uncompleted_critical_blockers' => $this->formatItems($uncompletedCriticalBlockers),
            'has_uncompleted_critical_blockers' => $hasUncompletedCritical,
            'history' => $historySnapshots->map(fn($s) => [
                'id' => $s->id,
                'score' => $s->score,
                'status' => $s->status,
                'date' => $s->created_at->format('d M H:i'),
            ])->toArray(),
            'trend' => $trend,
        ];
    }

    /**
     * Record a snapshot of readiness score in database
     */
    public function recordSnapshot(Operation $operation, ?int $userId = null): ReadinessSnapshot
    {
        $readiness = $this->calculate($operation);

        return ReadinessSnapshot::create([
            'operation_id' => $operation->id,
            'score' => $readiness['score'],
            'status' => $readiness['status'],
            'snapshot_data' => $readiness,
            'evaluated_by' => $userId ?? auth()->id(),
        ]);
    }

    public function isCriticalBlocker(OperationChecklistItem $item): bool
    {
        if (!$item->templateItem) {
            return false;
        }

        return (bool) $item->templateItem->is_critical;
    }

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
