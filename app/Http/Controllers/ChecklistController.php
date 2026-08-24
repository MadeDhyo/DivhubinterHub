<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\OperationChecklistItem;
use App\Models\ActivityLog;
use App\Services\ReadinessService;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;

class ChecklistController extends Controller
{
    public function updateStatus(Request $request, $id, ReadinessService $readinessService)
    {
        $request->validate(['status' => 'required|string']);
        $item = OperationChecklistItem::with(['templateItem', 'operationChecklist.operation'])->findOrFail($id);

        $newStatus = $request->status;
        $oldStatus = $item->status;

        if (in_array($newStatus, ['Verified', 'Rejected'])) {
            Gate::authorize('verify-checklist-item', $item);
        } else {
            Gate::authorize('update-checklist-item', $item);
        }

        $item->update(['status' => $newStatus]);

        $itemName = $item->templateItem?->name ?? "Item #{$item->id}";
        $operation = $item->operationChecklist?->operation;
        $opNumber = $operation?->operation_number ?? 'Unknown Operation';

        // Recalculate & record readiness snapshot
        if ($operation) {
            $readinessService->recordSnapshot($operation, auth()->id());
        }

        ActivityLog::record(
            'CHECKLIST_STATUS_UPDATED',
            "Mengubah status checklist '{$itemName}' pada operasi {$opNumber} dari '{$oldStatus}' menjadi '{$newStatus}'",
            ['status' => $oldStatus],
            ['status' => $newStatus],
            ['item_id' => $item->id, 'operation_number' => $opNumber]
        );

        return redirect()->back()->with('success', 'Status checklist berhasil diperbarui.');
    }

    public function uploadAttachment(Request $request, $id)
    {
        $request->validate([
            'attachment' => 'required|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240',
        ], [
            'attachment.required' => 'File dokumen wajib dipilih.',
            'attachment.mimes' => 'Format file harus berupa PDF, DOC, DOCX, JPG, atau PNG.',
            'attachment.max' => 'Ukuran file maksimal 10MB.',
        ]);

        $item = OperationChecklistItem::with(['templateItem', 'operationChecklist.operation'])->findOrFail($id);

        if ($request->hasFile('attachment')) {
            // Delete existing file if present
            if ($item->attachment_path && Storage::disk('public')->exists($item->attachment_path)) {
                Storage::disk('public')->delete($item->attachment_path);
            }

            $path = $request->file('attachment')->store('checklists/attachments', 'public');
            $item->update(['attachment_path' => $path]);

            $itemName = $item->templateItem?->name ?? "Item #{$item->id}";
            $opNumber = $item->operationChecklist?->operation?->operation_number ?? 'Unknown Operation';

            ActivityLog::record(
                'CHECKLIST_ATTACHMENT_UPLOADED',
                "Mengunggah berkas/dokumen pendukung untuk checklist '{$itemName}' pada operasi {$opNumber}",
                null,
                ['attachment_path' => $path],
                ['item_id' => $item->id]
            );
        }

        return redirect()->back()->with('success', 'Dokumen pendukung berhasil diunggah.');
    }
}
