<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Operation;
use App\Services\ReadinessService;

class OperationController extends Controller
{
    public function show($id, ReadinessService $readinessService)
    {
        $operation = Operation::with([
            'targets',
            'checklists.template',
            'checklists.items.templateItem'
        ])->findOrFail($id);

        $readiness = $readinessService->calculate($operation);

        return Inertia::render('OperationDetail', [
            'operation' => $operation,
            'readiness' => $readiness,
        ]);
    }
}
