<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Operation;
use App\Models\DpoPerson;
use App\Models\User;
use App\Services\ReadinessService;

class DashboardController extends Controller
{
    public function index(ReadinessService $readinessService)
    {
        $operations = Operation::with(['targets', 'checklists.items.templateItem'])->get();

        $scores = [];
        foreach ($operations as $operation) {
            $readiness = $readinessService->calculate($operation);
            $scores[] = $readiness['score'];
        }

        $averageScore = count($scores) > 0 ? round(array_sum($scores) / count($scores), 1) : 0;

        return Inertia::render('Dashboard', [
            'operations' => $operations,
            'averageReadinessScore' => $averageScore,
            'dpoPersons' => DpoPerson::select('id', 'name', 'alias', 'status')->orderBy('name')->get(),
            'users' => User::select('id', 'name', 'role')->orderBy('name')->get(),
        ]);
    }
}

