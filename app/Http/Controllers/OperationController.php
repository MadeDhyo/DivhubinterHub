<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Operation;
use App\Models\AuditLog;
use App\Services\ReadinessService;
use Illuminate\Support\Facades\Gate;

class OperationController extends Controller
{
    public function show($id, ReadinessService $readinessService)
    {
        $operation = Operation::with([
            'targets',
            'checklists.template',
            'checklists.items.templateItem',
            'documents' => function ($q) {
                $q->with(['uploader', 'versions' => function ($v) {
                    $v->orderByDesc('version_number');
                }])->orderByDesc('created_at');
            },
        ])->findOrFail($id);

        Gate::authorize('view-operation', $operation);

        $canViewReadiness = Gate::allows('view-readiness', $operation);
        $readiness = $canViewReadiness ? $readinessService->calculate($operation) : null;

        // Audit logs terbaru untuk operasi ini
        $auditLogs = AuditLog::with('actor')
            ->where('entity_name', 'Operation')
            ->where('entity_id', $id)
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
}
