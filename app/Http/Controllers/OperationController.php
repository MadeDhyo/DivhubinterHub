<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Operation;
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
            'documents.versions.uploader',
            'documents.uploader'
        ])->findOrFail($id);

        Gate::authorize('view-operation', $operation);

        $canViewReadiness = Gate::allows('view-readiness', $operation);
        $readiness = $canViewReadiness ? $readinessService->calculate($operation) : null;

        $auditLogs = \App\Models\AuditLog::where('module', 'DOCUMENT')
            ->orWhere(function($query) use ($id) {
                $query->where('entity_name', 'Operation')->where('entity_id', (string)$id);
            })
            ->with('actor')
            ->latest()
            ->take(15)
            ->get();

        return Inertia::render('OperationDetail', [
            'operation' => $operation,
            'readiness' => $readiness,
            'auditLogs' => $auditLogs,
            'can' => [
                'view_readiness' => $canViewReadiness,
                'approve_readiness' => Gate::allows('approve-readiness'),
                'change_operation_status' => Gate::allows('change-operation-status'),
            ]
        ]);
    }
}
