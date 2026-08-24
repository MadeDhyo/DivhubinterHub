<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class GeminiVerificationService
{
    /**
     * Memverifikasi sebuah file dokumen menggunakan Gemini AI
     * berdasarkan prompt/instruksi yang sudah ditentukan.
     *
     * @param  string  $filePath  Path file di storage disk 'public'
     * @param  string  $prompt    Instruksi validasi dari ai_validation_prompt
     * @return array{is_valid: bool, reason: string}
     */
    public function verify(string $filePath, string $prompt): array
    {
        $apiKey = config('services.gemini.api_key');
        $model  = config('services.gemini.model', 'gemini-2.0-flash');

        // Pastikan API Key sudah dikonfigurasi
        if (empty($apiKey)) {
            Log::warning('[GeminiAI] GEMINI_API_KEY belum diisi di .env');
            return [
                'is_valid' => false,
                'reason'   => 'Konfigurasi GEMINI_API_KEY belum diatur di server.',
            ];
        }

        // Baca file dari storage
        if (!Storage::disk('public')->exists($filePath)) {
            return [
                'is_valid' => false,
                'reason'   => 'File dokumen tidak ditemukan di server.',
            ];
        }

        $fileContents = Storage::disk('public')->get($filePath);
        $mimeType     = Storage::disk('public')->mimeType($filePath);
        $base64Data   = base64_encode($fileContents);

        // Susun pesan yang dikirim ke Gemini
        $systemInstruction = <<<EOT
Kamu adalah sistem verifikasi dokumen otomatis untuk NCB Interpol Indonesia.
Tugasmu adalah menganalisis dokumen yang diberikan dan menentukan apakah dokumen tersebut
memenuhi kriteria validasi yang diberikan.

PENTING: Kamu HARUS membalas HANYA dengan format JSON valid berikut, tanpa teks tambahan apapun:
{"is_valid": true, "reason": "Penjelasan singkat kenapa dokumen valid"}
atau
{"is_valid": false, "reason": "Penjelasan singkat kenapa dokumen tidak valid atau tidak sesuai"}
EOT;

        $userPrompt = "Analisis dokumen berikut berdasarkan kriteria ini:\n\n{$prompt}";

        $payload = [
            'system_instruction' => [
                'parts' => [['text' => $systemInstruction]]
            ],
            'contents' => [
                [
                    'parts' => [
                        ['text' => $userPrompt],
                        [
                            'inline_data' => [
                                'mime_type' => $mimeType,
                                'data'      => $base64Data,
                            ]
                        ]
                    ]
                ]
            ],
            'generationConfig' => [
                'response_mime_type' => 'application/json',
                'temperature'        => 0.1,
            ],
        ];

        try {
            $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent";

            $response = Http::timeout(30)
                ->withHeaders([
                    'Content-Type'   => 'application/json',
                    'x-goog-api-key' => trim($apiKey),
                ])
                ->post($url, $payload);

            if (!$response->successful()) {
                Log::error('[GeminiAI] API Error', [
                    'status' => $response->status(),
                    'body'   => $response->body(),
                ]);
                return [
                    'is_valid' => false,
                    'reason'   => 'Gagal menghubungi Gemini API (HTTP ' . $response->status() . ': ' . substr($response->body(), 0, 150) . '). Mohon verifikasi manual.',
                ];
            }

            // Ekstrak teks respons dari payload Gemini
            $raw  = $response->json('candidates.0.content.parts.0.text', '{}');
            $data = json_decode($raw, true);

            if (json_last_error() !== JSON_ERROR_NONE || !isset($data['is_valid'])) {
                Log::warning('[GeminiAI] Respons tidak dapat diparsing', ['raw' => $raw]);
                return [
                    'is_valid' => false,
                    'reason'   => 'AI tidak dapat menganalisa dokumen dengan tepat. Mohon verifikasi manual.',
                ];
            }

            return [
                'is_valid' => (bool) $data['is_valid'],
                'reason'   => $data['reason'] ?? '-',
            ];

        } catch (\Throwable $e) {
            Log::error('[GeminiAI] Exception: ' . $e->getMessage());
            return [
                'is_valid' => false,
                'reason'   => 'Terjadi kesalahan koneksi ke Gemini API. Mohon verifikasi manual.',
            ];
        }
    }
}
