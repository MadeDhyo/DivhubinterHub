<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Crypt;
use App\Models\User;

class EncryptedDocumentService
{
    protected string $disk = 'secure_docs';

    public function __construct()
    {
        // Ensure storage directory exists
        if (!Storage::disk('local')->exists('secure_docs')) {
            Storage::disk('local')->makeDirectory('secure_docs');
        }
    }

    /**
     * Calculate SHA-256 checksum of an uploaded file
     */
    public function calculateSha256(UploadedFile $file): string
    {
        return hash_file('sha256', $file->getRealPath());
    }

    /**
     * Store and encrypt file to secure disk storage
     */
    public function storeEncryptedFile(UploadedFile $file, string $targetPath): array
    {
        $sha256 = $this->calculateSha256($file);
        $rawContent = file_get_contents($file->getRealPath());
        $encryptedContent = Crypt::encrypt($rawContent);

        Storage::disk('local')->put('secure_docs/' . $targetPath, $encryptedContent);

        return [
            'file_path' => $targetPath,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getClientMimeType(),
            'checksum_sha256' => $sha256,
        ];
    }

    /**
     * Decrypt and retrieve file content with integrity check
     */
    public function retrieveAndVerify(string $targetPath, string $expectedSha256): string
    {
        $fullPath = 'secure_docs/' . $targetPath;
        if (!Storage::disk('local')->exists($fullPath)) {
            throw new \Exception("File not found on storage: " . $targetPath);
        }

        $encryptedContent = Storage::disk('local')->get($fullPath);
        $decryptedContent = Crypt::decrypt($encryptedContent);

        // Verify SHA-256 integrity
        $calculatedHash = hash('sha256', $decryptedContent);
        if (!hash_equals($expectedSha256, $calculatedHash)) {
            throw new \Exception("INTEGRITY ERROR: File checksum SHA-256 does not match! Potential tampering detected.");
        }

        return $decryptedContent;
    }

    /**
     * Append Dynamic Watermark metadata header to text/document streams
     */
    public function generateWatermarkedContent(string $rawContent, string $mimeType, User $user): string
    {
        $watermarkText = sprintf(
            "RAHASIA - NCB INTERPOL OCMS | USER: %s (NIP: %s) | IP: %s | DATE: %s",
            $user->name,
            $user->nip ?? 'N/A',
            request()->ip(),
            now()->toDateTimeString()
        );

        // For plain text, add header banner
        if (str_contains($mimeType, 'text') || str_contains($mimeType, 'json')) {
            return "/* " . $watermarkText . " */\n\n" . $rawContent;
        }

        return $rawContent;
    }

    /**
     * Hapus file fisik dari disk secure_docs
     */
    public function deleteFile(string $targetPath): void
    {
        $fullPath = 'secure_docs/' . $targetPath;
        if (Storage::disk('local')->exists($fullPath)) {
            Storage::disk('local')->delete($fullPath);
        }
    }
}
