<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Operation;

class OperationController extends Controller
{
    public function show($id)
    {
        $operation = Operation::with([
            'targets',
            'checklists.template',
            'checklists.items.templateItem',
            'documents.versions.uploader',
            'documents.uploader'
        ])->findOrFail($id);

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
            'auditLogs' => $auditLogs
        ]);
    }
}
