<?php

namespace App\Jobs;

use App\Models\OperationChecklistItem;
use App\Models\ActivityLog;
use App\Services\GeminiVerificationService;
use App\Services\ReadinessService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class VerifyChecklistDocumentJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Jumlah percobaan ulang jika Job gagal.
     */
    public int $tries = 2;

    /**
     * Timeout maksimal per percobaan (detik).
     */
    public int $timeout = 60;

    public function __construct(public OperationChecklistItem $item)
    {
    }

    /**
     * Jalankan verifikasi AI di latar belakang.
     */
    public function handle(GeminiVerificationService $gemini, ReadinessService $readiness): void
    {
        $item       = $this->item->fresh(['templateItem', 'operationChecklist.operation']);
        $itemName   = $item->templateItem?->name ?? "Item #{$item->id}";
        $prompt     = $item->templateItem?->ai_validation_prompt;
        $filePath   = $item->attachment_path;
        $opNumber   = $item->operationChecklist?->operation?->operation_number ?? 'Unknown';
        $operation  = $item->operationChecklist?->operation;

        // Jika item tidak punya prompt, lewati verifikasi AI
        if (empty($prompt)) {
            Log::info("[GeminiAI] Item '{$itemName}' tidak memiliki ai_validation_prompt, verifikasi AI dilewati.");
            return;
        }

        // Jika tidak ada file yang di-upload, lewati
        if (empty($filePath)) {
            Log::info("[GeminiAI] Item '{$itemName}' belum memiliki attachment, verifikasi AI dilewati.");
            return;
        }

        Log::info("[GeminiAI] Memulai verifikasi untuk item: {$itemName} (ID: {$item->id})");

        // Kirim ke Gemini
        $result = $gemini->verify($filePath, $prompt);

        $newStatus    = $result['is_valid'] ? 'Verified' : 'Rejected';
        $aiReason     = $result['reason'];

        // Update status dan simpan hasil analisa AI
        $item->update([
            'status'              => $newStatus,
            'ai_validation_result' => "[AI] {$aiReason}",
        ]);

        // Recalculate readiness score
        if ($operation) {
            $readiness->recordSnapshot($operation, null);
        }

        // Catat di activity log
        ActivityLog::record(
            'CHECKLIST_AI_VERIFIED',
            "AI memverifikasi berkas checklist '{$itemName}' pada operasi {$opNumber}: {$newStatus}. Alasan: {$aiReason}",
            ['status' => 'In Progress'],
            ['status' => $newStatus, 'ai_reason' => $aiReason],
            ['item_id' => $item->id, 'operation_number' => $opNumber]
        );

        Log::info("[GeminiAI] Selesai. Item '{$itemName}' => {$newStatus}. Alasan: {$aiReason}");
    }

    /**
     * Tangani kegagalan Job setelah semua percobaan habis.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("[GeminiAI] Job gagal untuk item ID {$this->item->id}: " . $exception->getMessage());

        // Set ke 'Needs Review' agar admin tahu harus verifikasi manual
        $this->item->update([
            'ai_validation_result' => '[AI] Verifikasi otomatis gagal. Mohon verifikasi manual.',
        ]);
    }
}
