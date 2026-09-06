<?php

namespace App\Console\Commands;

use App\Jobs\VerifyChecklistDocumentJob;
use App\Models\OperationChecklistItem;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class TestAiVerify extends Command
{
    /**
     * Nama dan signature perintah.
     *
     * @var string
     */
    protected $signature = 'test:ai-verify
                            {item_id : ID dari OperationChecklistItem yang ingin diverifikasi}
                            {--sync : Jalankan secara langsung (sinkron) tanpa Queue, cocok untuk testing}';

    /**
     * Deskripsi perintah.
     *
     * @var string
     */
    protected $description = 'Simulasikan verifikasi AI Gemini untuk sebuah item checklist secara manual (untuk keperluan testing).';

    public function handle(): int
    {
        $itemId = $this->argument('item_id');
        $item   = OperationChecklistItem::with(['templateItem', 'operationChecklist.operation'])->find($itemId);

        if (!$item) {
            $this->error("Item checklist dengan ID {$itemId} tidak ditemukan.");
            return self::FAILURE;
        }

        $itemName = $item->templateItem?->name ?? "Item #{$item->id}";
        $prompt   = $item->templateItem?->ai_validation_prompt;
        $filePath = $item->attachment_path;

        $this->info("=== Simulasi Verifikasi AI Gemini ===");
        $this->line("Item     : {$itemName} (ID: {$item->id})");
        $this->line("Status   : {$item->status}");
        $this->line("File     : " . ($filePath ?: '(tidak ada)'));
        $this->line("Prompt   : " . ($prompt ? substr($prompt, 0, 80) . '...' : '(tidak ada)'));
        $this->newLine();

        if (empty($prompt)) {
            $this->warn("Item ini tidak memiliki 'ai_validation_prompt'. Isi dulu prompt-nya di tabel checklist_template_items.");
            return self::FAILURE;
        }

        if (empty($filePath)) {
            $this->warn("Item ini belum memiliki attachment. Pastikan file sudah di-upload.");
            $this->line("Untuk test, kamu bisa menaruh file contoh di storage/app/public/checklists/attachments/");
            $this->line("Lalu update kolom attachment_path di database untuk item ini.");
            return self::FAILURE;
        }

        if (!Storage::disk('public')->exists($filePath)) {
            $this->warn("File '{$filePath}' tidak ditemukan di storage/app/public/.");
            return self::FAILURE;
        }

        if ($this->option('sync')) {
            $this->info("Menjalankan verifikasi secara SINKRON (langsung, tanpa queue)...");
            dispatch_sync(new VerifyChecklistDocumentJob($item));
            $this->success("Selesai! Cek status item di database atau halaman web.");
        } else {
            $this->info("Memasukkan Job ke dalam Queue...");
            VerifyChecklistDocumentJob::dispatch($item);
            $this->info("Job berhasil di-dispatch! Jalankan 'php artisan queue:work' di terminal lain untuk memprosesnya.");
        }

        return self::SUCCESS;
    }

    private function success(string $message): void
    {
        $this->line("<fg=green>✔ {$message}</>");
    }
}
