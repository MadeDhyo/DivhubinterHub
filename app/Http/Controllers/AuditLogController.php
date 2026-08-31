<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $query = AuditLog::with('actor')->latest();

        if ($request->has('module') && $request->module) {
            $query->where('module', strtoupper($request->module));
        }

        if ($request->has('action') && $request->action) {
            $query->where('action_type', strtoupper($request->action));
        }

        $logs = $query->paginate(20);

        return Inertia::render('AuditLogViewer', [
            'logs' => $logs,
            'filters' => $request->only(['module', 'action']),
        ]);
    }
}
