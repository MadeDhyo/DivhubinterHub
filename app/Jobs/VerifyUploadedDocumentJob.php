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

        $prompt = self::PROMPTS[$document->document_type] ?? null;

        // Jika tidak ada prompt (misal LAINNYA atau tipe tidak dikenal), lewati
        if (empty($prompt)) {
            Log::info("[GeminiAI-Doc] Dokumen '{$document->title}' tipe '{$document->document_type}' tidak memerlukan verifikasi AI.");
            $document->update(['ai_verification_status' => 'SKIPPED']);
            return;
        }

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

        Log::info("[GeminiAI-Doc] Memulai verifikasi untuk dokumen: {$document->title} (ID: {$document->id})");

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
