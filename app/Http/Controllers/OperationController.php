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
            'checklists.items.templateItem'
        ])->findOrFail($id);

        return Inertia::render('OperationDetail', [
            'operation' => $operation
        ]);
    }
}
