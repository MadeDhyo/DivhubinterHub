<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\DocumentVersion;
use App\Models\DocumentAccessLog;
use App\Models\Operation;
use App\Services\EncryptedDocumentService;
use App\Services\AuditTrailService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class DocumentController extends Controller
{
    protected EncryptedDocumentService $docService;

    public function __construct(EncryptedDocumentService $docService)
    {
        $this->docService = $docService;
    }

    /**
     * Store new document with initial version (v1)
     */
    public function store(Request $request)
    {
        $request->validate([
            'operation_id' => 'required|exists:operations,id',
            'title' => 'required|string|max:255',
            'document_type' => 'required|string|max:100',
            'classification_level' => 'required|in:SANGAT_RAHASIA,RAHASIA,TERBATAS,BIASA',
            'source_agency' => 'required|string|max:150',
            'file' => 'required|file|max:51200', // 50MB max
            'retention_until' => 'nullable|date',
        ]);

        $user = Auth::user();
        $file = $request->file('file');

        // Generate storage path: operation_{id}/{year}/{month}/{uuid}_{filename}
        $uuid = Str::uuid();
        $relativePath = sprintf(
            'operation_%s/%s/%s/%s_%s',
            $request->operation_id,
            now()->format('Y'),
            now()->format('m'),
            $uuid,
            $file->getClientOriginalName()
        );

        $fileData = $this->docService->storeEncryptedFile($file, $relativePath);

        // Generate Unique Document Number: DOC-NCB-YYYYMMDD-XXXX
        $documentNumber = sprintf('DOC-NCB-%s-%s', now()->format('Ymd'), strtoupper(Str::random(4)));

        $document = Document::create([
            'operation_id' => $request->operation_id,
            'document_number' => $documentNumber,
            'title' => $request->title,
            'document_type' => $request->document_type,
            'classification_level' => $request->classification_level,
            'source_agency' => $request->source_agency,
            'current_version' => 1,
            'uploaded_by' => $user->id,
            'retention_until' => $request->retention_until,
        ]);

        $version = DocumentVersion::create([
            'document_id' => $document->id,
            'version_number' => 1,
            'original_filename' => $file->getClientOriginalName(),
            'storage_disk' => 'secure_docs',
            'file_path' => $fileData['file_path'],
            'file_size_bytes' => $fileData['file_size'],
            'mime_type' => $fileData['mime_type'],
            'checksum_sha256' => $fileData['checksum_sha256'],
            'change_description' => 'Initial document upload (v1)',
            'uploaded_by' => $user->id,
        ]);

        // Audit Trail & Access Log
        AuditTrailService::log(
            module: 'DOCUMENT',
            actionType: 'CREATE',
            entityName: 'Document',
            entityId: $document->id,
            afterState: $document->toArray()
        );

        DocumentAccessLog::create([
            'document_id' => $document->id,
            'version_id' => $version->id,
            'user_id' => $user->id,
            'action' => 'UPLOAD',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent() ?? 'N/A',
            'status' => 'SUCCESS',
        ]);

        return redirect()->back()->with('success', 'Dokumen berhasil diunggah dengan enkripsi dan verifikasi SHA-256.');
    }

    /**
     * Add new version to an existing document
     */
    public function uploadVersion(Request $request, $id)
    {
        $request->validate([
            'file' => 'required|file|max:51200', // 50MB
            'change_description' => 'required|string|max:500',
        ]);

        $document = Document::findOrFail($id);
        $user = Auth::user();
        $file = $request->file('file');

        $nextVersion = $document->current_version + 1;
        $uuid = Str::uuid();
        $relativePath = sprintf(
            'operation_%s/%s/%s/%s_v%d_%s',
            $document->operation_id,
            now()->format('Y'),
            now()->format('m'),
            $uuid,
            $nextVersion,
            $file->getClientOriginalName()
        );

        $fileData = $this->docService->storeEncryptedFile($file, $relativePath);

        $version = DocumentVersion::create([
            'document_id' => $document->id,
            'version_number' => $nextVersion,
            'original_filename' => $file->getClientOriginalName(),
            'storage_disk' => 'secure_docs',
            'file_path' => $fileData['file_path'],
            'file_size_bytes' => $fileData['file_size'],
            'mime_type' => $fileData['mime_type'],
            'checksum_sha256' => $fileData['checksum_sha256'],
            'change_description' => $request->change_description,
            'uploaded_by' => $user->id,
        ]);

        $beforeState = ['current_version' => $document->current_version];
        $document->update(['current_version' => $nextVersion]);

        // Audit & Log
        AuditTrailService::log(
            module: 'DOCUMENT',
            actionType: 'NEW_VERSION',
            entityName: 'Document',
            entityId: $document->id,
            beforeState: $beforeState,
            afterState: ['current_version' => $nextVersion, 'version_id' => $version->id]
        );

        DocumentAccessLog::create([
            'document_id' => $document->id,
            'version_id' => $version->id,
            'user_id' => $user->id,
            'action' => 'UPLOAD_NEW_VERSION',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent() ?? 'N/A',
            'status' => 'SUCCESS',
        ]);

        return redirect()->back()->with('success', 'Versi baru dokumen berhasil diunggah (v' . $nextVersion . ').');
    }

    /**
     * Download verified document file with dynamic watermark
     */
    public function download(Request $request, $id, $versionId = null)
    {
        $document = Document::findOrFail($id);
        $user = Auth::user();

        // Check classification clearance
        $clearanceHierarchy = ['BIASA' => 1, 'TERBATAS' => 2, 'RAHASIA' => 3, 'SANGAT_RAHASIA' => 4];
        $userClearance = $clearanceHierarchy[$user->classification_clearance ?? 'RAHASIA'] ?? 3;
        $docClearance = $clearanceHierarchy[$document->classification_level] ?? 3;

        if ($userClearance < $docClearance) {
            DocumentAccessLog::create([
                'document_id' => $document->id,
                'user_id' => $user->id,
                'action' => 'DOWNLOAD',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent() ?? 'N/A',
                'status' => 'DENIED',
                'reason' => 'Clearance level insufficient',
            ]);

            abort(403, 'Akses Ditolak: Tingkat kerahasiaan dokumen berada di atas hak akses (clearance) Anda.');
        }

        $version = $versionId 
            ? DocumentVersion::where('document_id', $document->id)->where('id', $versionId)->firstOrFail()
            : $document->latestVersion;

        try {
            $content = $this->docService->retrieveAndVerify($version->file_path, $version->checksum_sha256);
            $watermarkedContent = $this->docService->generateWatermarkedContent($content, $version->mime_type, $user);

            // Record Log
            AuditTrailService::log(
                module: 'DOCUMENT',
                actionType: 'DOWNLOAD',
                entityName: 'DocumentVersion',
                entityId: $version->id,
                afterState: ['document_id' => $document->id, 'version_number' => $version->version_number]
            );

            DocumentAccessLog::create([
                'document_id' => $document->id,
                'version_id' => $version->id,
                'user_id' => $user->id,
                'action' => 'DOWNLOAD',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent() ?? 'N/A',
                'status' => 'SUCCESS',
            ]);

            return response($watermarkedContent)
                ->header('Content-Type', $version->mime_type)
                ->header('Content-Disposition', 'attachment; filename="' . $version->original_filename . '"')
                ->header('X-Checksum-SHA256', $version->checksum_sha256);
        } catch (\Exception $e) {
            DocumentAccessLog::create([
                'document_id' => $document->id,
                'version_id' => $version->id,
                'user_id' => $user->id,
                'action' => 'DOWNLOAD',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent() ?? 'N/A',
                'status' => 'FAILED',
                'reason' => $e->getMessage(),
            ]);

            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    /**
     * Stream secure document preview
     */
    public function preview(Request $request, $id)
    {
        $document = Document::findOrFail($id);
        $user = Auth::user();
        $version = $document->latestVersion;

        try {
            $content = $this->docService->retrieveAndVerify($version->file_path, $version->checksum_sha256);

            DocumentAccessLog::create([
                'document_id' => $document->id,
                'version_id' => $version->id,
                'user_id' => $user->id,
                'action' => 'PREVIEW',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent() ?? 'N/A',
                'status' => 'SUCCESS',
            ]);

            return response($content)->header('Content-Type', $version->mime_type);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }
}
