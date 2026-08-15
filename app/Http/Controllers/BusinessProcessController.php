<?php

namespace App\Http\Controllers;

use App\Models\BusinessProcess;

class BusinessProcessController extends Controller
{
    public function index()
    {
        $businessProcesses = BusinessProcess::latest()->get();

        return view('business-processes.index', compact('businessProcesses'));
    }
}
