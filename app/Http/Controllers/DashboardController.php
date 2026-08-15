<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Operation;

class DashboardController extends Controller
{
    public function index()
    {
        $operations = Operation::with(['targets', 'checklists.items'])->get();
        return Inertia::render('Dashboard', [
            'operations' => $operations
        ]);
    }
}
