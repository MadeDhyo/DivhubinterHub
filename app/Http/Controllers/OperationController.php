<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Operation;
use App\Models\AuditLog;
use App\Models\ActivityLog;
use App\Models\DpoPerson;
use App\Models\User;
use App\Services\ReadinessService;
use Illuminate\Support\Facades\Gate;

class OperationController extends Controller
{
    public function show($id, ReadinessService $readinessService)
    {
        $operation = Operation::findOrFail($id);

        Gate::authorize('view-operation', $operation);

        // Pastikan setiap operasi memiliki struktur checklist standar (Standard Fugitive Check)
        $this->ensureOperationChecklist($operation);
        $this->syncChecklistWithDocuments($operation);

        $operation->load([
            'targets',
            'checklists.template',
            'checklists.items.templateItem',
            'documents' => function ($q) {
                $q->with(['uploader', 'versions' => function ($v) {
                    $v->orderByDesc('version_number');
                }])->orderByDesc('created_at');
            },
            'dpoPersons',
        ]);

        $canViewReadiness = Gate::allows('view-readiness', $operation);
        $readiness = $canViewReadiness ? $readinessService->calculate($operation) : null;

        // Audit logs terbaru untuk operasi ini
        $auditLogs = AuditLog::with('actor')
            ->where('entity_name', 'Operation')
            ->where('entity_id', $id)
            ->orWhere('module', 'DOCUMENT')
            ->orderByDesc('created_at')
            ->take(50)
            ->get();

        return Inertia::render('OperationDetail', [
            'operation'  => $operation,
            'readiness'  => $readiness,
            'auditLogs'  => $auditLogs,
            'can' => [
                'view_readiness'          => $canViewReadiness,
                'approve_readiness'       => Gate::allows('approve-readiness'),
                'change_operation_status' => Gate::allows('change-operation-status'),
            ]
        ]);
    }

    /**
     * Simpan operasi baru (admin only).
     */
    public function store(Request $request)
    {
        Gate::authorize('admin-access');

        $validated = $request->validate([
            'operation_number' => 'required|string|max:50|unique:operations,operation_number',
            'name'             => 'required|string|max:255',
            'description'      => 'nullable|string|max:2000',
            'priority'         => 'required|in:Low,Medium,High,Critical',
            'status'           => 'nullable|in:Planning,Preparation,Verification,Active,Completed,Closed',
            'start_date'       => 'nullable|date',
            'end_date'         => 'nullable|date|after_or_equal:start_date',
            'pic_id'           => 'required|exists:users,id',
            'dpo_person_ids'   => 'nullable|array',
            'dpo_person_ids.*' => 'exists:dpo_persons,id',
        ]);

        $operation = Operation::create([
            'operation_number' => $validated['operation_number'],
            'name'             => $validated['name'],
            'description'      => $validated['description'] ?? null,
            'priority'         => $validated['priority'],
            'status'           => $validated['status'] ?? 'Planning',
            'start_date'       => $validated['start_date'] ?? null,
            'end_date'         => $validated['end_date'] ?? null,
            'pic_id'           => $validated['pic_id'] ?? null,
        ]);

        // Attach DPO persons jika ada
        if (!empty($validated['dpo_person_ids'])) {
            $operation->dpoPersons()->attach($validated['dpo_person_ids']);
        }

        // Inisialisasi checklist standar & verifikasi AI untuk operasi baru
        $this->ensureOperationChecklist($operation);

        ActivityLog::record(
            'OPERATION_CREATED',
            "Membuat operasi baru: {$operation->name} ({$operation->operation_number})",
            null,
            [
                'id'               => $operation->id,
                'operation_number' => $operation->operation_number,
                'name'             => $operation->name,
                'dpo_count'        => count($validated['dpo_person_ids'] ?? []),
            ]
        );

        return redirect()->route('dashboard')->with('success', 'Operasi baru berhasil dibuat.');
    }

    /**
     * Memastikan operasi memiliki checklist template standar (Standard Fugitive Check).
     */
    protected function ensureOperationChecklist(Operation $operation)
    {
        if ($operation->checklists()->count() === 0) {
            $template = \App\Models\ChecklistTemplate::firstOrCreate(
                ['name' => 'Standard Fugitive Check'],
                ['category' => 'Verification']
            );

            $itemsData = [
                ['name' => 'Identifikasi Profil', 'is_mandatory' => true, 'is_critical' => true],
                ['name' => 'Cek Status Red Notice', 'is_mandatory' => true, 'is_critical' => true],
                ['name' => 'Surat Perintah', 'is_mandatory' => true, 'is_critical' => false],
            ];

            $templateItems = [];
            foreach ($itemsData as $data) {
                $templateItems[] = \App\Models\ChecklistTemplateItem::firstOrCreate(
                    ['checklist_template_id' => $template->id, 'name' => $data['name']],
                    ['is_mandatory' => $data['is_mandatory'], 'is_critical' => $data['is_critical']]
                );
            }

            $opChecklist = \App\Models\OperationChecklist::create([
                'operation_id' => $operation->id,
                'checklist_template_id' => $template->id,
            ]);

            foreach ($templateItems as $item) {
                \App\Models\OperationChecklistItem::create([
                    'operation_checklist_id' => $opChecklist->id,
                    'checklist_template_item_id' => $item->id,
                    'status' => 'Not Started',
                    'pic_id' => $operation->pic_id,
                ]);
            }
        }
    }

    /**
     * Menyinkronkan status checklist item dengan dokumen yang ada / terverifikasi AI.
     * Jika dokumen dihapus / tidak ada, status item checklist di-reset ke 'Not Started'.
     */
    public function syncChecklistWithDocuments(Operation $operation)
    {
        $itemToDocType = [
            'identifikasi profil'   => 'IDENTIFIKASI_PROFIL',
            'cek status red notice' => 'CEK_STATUS_RED_NOTICE',
            'surat perintah'        => 'SURAT_TUGAS',
            'surat tugas'           => 'SURAT_TUGAS',
        ];

        $documents = $operation->documents()->latest('created_at')->get();
        $checklists = $operation->checklists()->with('items.templateItem')->get();

        foreach ($checklists as $checklist) {
            foreach ($checklist->items as $item) {
                if (!$item->templateItem) continue;

                $itemNameClean = strtolower(trim($item->templateItem->name));
                $docTypeNeeded = $itemToDocType[$itemNameClean] ?? null;

                if (!$docTypeNeeded) continue;

                // Cari dokumen terbaru untuk tipe ini
                $latestDoc = $documents->firstWhere('document_type', $docTypeNeeded);

                if (!$latestDoc) {
                    // Dokumen tidak ada (misal tidak pernah diunggah atau telah dihapus) -> Reset status ke 'Not Started'
                    $item->update([
                        'status' => 'Not Started',
                        'ai_validation_result' => null,
                    ]);
                } else {
                    // Dokumen ada, perbarui status sesuai hasil verifikasi AI dokumen terbaru
                    if ($latestDoc->ai_verification_status === 'VERIFIED') {
                        $item->update([
                            'status' => 'Verified',
                            'ai_validation_result' => json_encode(['is_valid' => true, 'reason' => $latestDoc->ai_verification_result]),
                        ]);
                    } elseif ($latestDoc->ai_verification_status === 'REJECTED') {
                        $item->update([
                            'status' => 'Rejected',
                            'ai_validation_result' => json_encode(['is_valid' => false, 'reason' => $latestDoc->ai_verification_result]),
                        ]);
                    } elseif ($latestDoc->ai_verification_status === 'PENDING') {
                        $item->update([
                            'status' => 'In Progress',
                            'ai_validation_result' => null,
                        ]);
                    }
                }
            }
        }
    }
}

