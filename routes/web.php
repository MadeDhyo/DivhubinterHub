<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BusinessProcessController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/business-processes', [BusinessProcessController::class, 'index']);