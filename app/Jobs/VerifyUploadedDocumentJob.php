<?php

namespace App\Jobs;

use App\Models\Document;
use App\Services\GeminiVerificationService;
use App\Services\EncryptedDocumentService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class VerifyUploadedDocumentJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Jumlah percobaan ulang jika Job gagal.
     */
    public int $tries = 2;

    /**
     * Timeout maksimal per percobaan (detik).
     */
    public int $timeout = 90;

    /**
     * Prompt AI per jenis dokumen.
     */
    private const PROMPTS = [
        'IDENTIFIKASI_PROFIL' => 'Verifikasi apakah dokumen ini adalah dokumen identifikasi profil resmi (seperti KTP, paspor, kartu identitas, atau profil tersangka). Pastikan dokumen memuat informasi identitas yang lengkap dan jelas (nama, foto atau deskripsi fisik, nomor identitas). Dokumen harus berasal dari instansi resmi.',
        'CEK_STATUS_RED_NOTICE' => 'Verifikasi apakah dokumen ini berisi informasi terkait status Red Notice Interpol atau diffusion notice. Dokumen harus memuat nomor referensi Red Notice, identitas subjek, dan alasan penerbitan. Periksa apakah format sesuai dengan dokumen resmi NCB Interpol.',
        'SURAT_TUGAS' => 'Verifikasi apakah dokumen ini adalah Surat Tugas resmi dari instansi kepolisian atau NCB Interpol. Dokumen harus memuat: kop surat resmi, nomor surat, dasar hukum, nama petugas yang ditugaskan, tujuan penugasan, tanda tangan pejabat berwenang, dan stempel resmi.',
    ];

    public function __construct(public Document $document)
    {
    }

    /**
     * Jalankan verifikasi AI di latar belakang.
     */
    public function handle(GeminiVerificationService $gemini, EncryptedDocumentService $docService): void
    {
        // Beri waktu lebih untuk proses AI (dekripsi + kirim ke Gemini API)
        set_time_limit(300);

        $document = $this->document->fresh(['versions']);

        $basePrompt = self::PROMPTS[$document->document_type] ?? null;

        // Jika tidak ada prompt (misal LAINNYA atau tipe tidak dikenal), lewati
        if (empty($basePrompt)) {
            Log::info("[GeminiAI-Doc] Dokumen '{$document->title}' tipe '{$document->document_type}' tidak memerlukan verifikasi AI.");
            $document->update(['ai_verification_status' => 'SKIPPED']);
            return;
        }

        // Ambil data subjek DPO terkait dari operasi ini untuk difasilitasi ke AI
        $dpoInfoText = "";
        $operation = $document->operation;

        if ($operation) {
            $dpoPersons = $operation->dpoPersons()->get();
            $targets    = $operation->targets()->get();

            $allTargetsList = [];
            foreach ($dpoPersons as $dpo) {
                $info = "Nama: {$dpo->name}";
                if ($dpo->alias) $info .= ", Alias: {$dpo->alias}";
                if ($dpo->passport_number) $info .= ", No. Paspor: {$dpo->passport_number}";
                if ($dpo->red_notice_ref) $info .= ", Ref Red Notice: {$dpo->red_notice_ref}";
                if ($dpo->nationality) $info .= ", Kewarganegaraan: {$dpo->nationality}";
                if ($dpo->case_info) $info .= ", Informasi Kasus: {$dpo->case_info}";
                $allTargetsList[] = "- {$info}";
            }
            foreach ($targets as $target) {
                $info = "Nama: {$target->name}";
                if ($target->alias) $info .= ", Alias: {$target->alias}";
                if ($target->red_notice_ref) $info .= ", Ref Red Notice: {$target->red_notice_ref}";
                $allTargetsList[] = "- {$info}";
            }

            if (!empty($allTargetsList)) {
                $dpoInfoText = "INFORMASI SUBJEK DPO YANG DICARI PADA OPERASI INI:\n" . implode("\n", $allTargetsList) . "\n\n";
            }
        }

        $prompt = <<<EOT
{$dpoInfoText}DOKUMEN YANG DIUNGGAH:
Jenis Dokumen: {$document->document_type}
Judul Dokumen: {$document->title}
Instansi Asal: {$document->source_agency}

INSTRUKSI VERIFIKASI KETAT:
1. KELAYAKAN DOKUMEN: {$basePrompt}
2. PENCOCOKAN IDENTITAS DPO (SANGAT KRUSIAL): Periksa teks/isi dari dokumen yang diunggah secara teliti. Cocokkan apakah Nama, Alias, Nomor Paspor, atau Referensi Red Notice pada dokumen sesuai dengan INFORMASI SUBJEK DPO DICARI di atas.
3. ATURAN KEPUTUSAN VALIDASI:
   - Jika isi dokumen TIDAK cocok dengan DPO yang dicari pada operasi ini (misalnya nama atau referensi di dokumen berbeda), Anda WAJIB menandai "is_valid": false dan berikan penjelasan tegas di "reason" (contoh: "Dokumen atas nama [Nama di Dokumen] tidak cocok dengan subjek DPO [Nama Target DPO] yang dicari pada operasi ini.").
   - Jika dokumen resmi dan identitas/referensi cocok dengan subjek DPO yang dicari, tandai "is_valid": true dan jelaskan hasil kecocokan tersebut di "reason".
EOT;

        // Ambil versi terbaru
        $version = $document->versions()->latest('version_number')->first();
        if (!$version || empty($version->file_path)) {
            Log::warning("[GeminiAI-Doc] Dokumen ID {$document->id} tidak memiliki file version.");
            $document->update([
                'ai_verification_status' => 'REJECTED',
                'ai_verification_result' => 'File dokumen tidak ditemukan di server.',
                'ai_verified_at'         => now(),
            ]);
            return;
        }

        Log::info("[GeminiAI-Doc] Memulai verifikasi ketat untuk dokumen: {$document->title} (ID: {$document->id})");

        try {
            // Dekripsi file langsung dari secure_docs disk — tanpa tulis ke temp file
            $rawContent = $docService->retrieveAndVerify($version->file_path, $version->checksum_sha256);
            $mimeType   = $version->mime_type;

            // Kirim konten langsung ke Gemini (tidak perlu temp file di public disk)
            $result = $gemini->verifyRawContent($rawContent, $mimeType, $prompt);

            $newStatus = $result['is_valid'] ? 'VERIFIED' : 'REJECTED';
            $aiReason  = $result['reason'];

            $document->update([
                'ai_verification_status' => $newStatus,
                'ai_verification_result' => $aiReason,
                'ai_verified_at'         => now(),
            ]);

            // Sync status ke OperationChecklistItem
            if ($document->operation) {
                $mapping = [
                    'IDENTIFIKASI_PROFIL'   => 'Identifikasi Profil',
                    'CEK_STATUS_RED_NOTICE' => 'Cek Status Red Notice',
                    'SURAT_TUGAS'           => 'Surat Perintah',
                ];

                $targetItemName = $mapping[$document->document_type] ?? null;
                if ($targetItemName) {
                    $checklists = $document->operation->checklists()->with('items.templateItem')->get();
                    foreach ($checklists as $checklist) {
                        foreach ($checklist->items as $item) {
                            if ($item->templateItem && strtolower(trim($item->templateItem->name)) === strtolower(trim($targetItemName))) {
                                $item->update([
                                    'status' => $newStatus === 'VERIFIED' ? 'Verified' : 'Rejected',
                                    'ai_validation_result' => json_encode(['is_valid' => $result['is_valid'], 'reason' => $aiReason]),
                                ]);
                            }
                        }
                    }
                }
            }

            Log::info("[GeminiAI-Doc] Selesai. Dokumen '{$document->title}' => {$newStatus}. Alasan: {$aiReason}");

        } catch (\Throwable $e) {
            Log::error("[GeminiAI-Doc] Exception untuk dokumen ID {$document->id}: " . $e->getMessage());

            $document->update([
                'ai_verification_status' => 'REJECTED',
                'ai_verification_result' => 'Verifikasi otomatis gagal: ' . $e->getMessage() . '. Mohon verifikasi manual.',
                'ai_verified_at'         => now(),
            ]);
        }
    }

    /**
     * Tangani kegagalan Job setelah semua percobaan habis.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("[GeminiAI-Doc] Job gagal untuk dokumen ID {$this->document->id}: " . $exception->getMessage());

        $this->document->update([
            'ai_verification_status' => 'REJECTED',
            'ai_verification_result' => 'Verifikasi otomatis gagal setelah beberapa percobaan. Mohon verifikasi manual.',
            'ai_verified_at'         => now(),
        ]);
    }
}
