<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OperationController;
use App\Http\Controllers\BusinessProcessController;
use App\Http\Controllers\ChecklistController;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/operations/{id}', [OperationController::class, 'show'])->name('operations.show');
    Route::post('/checklists/{id}/status', [ChecklistController::class, 'updateStatus'])->name('checklists.updateStatus');
    Route::post('/checklists/{id}/attachment', [ChecklistController::class, 'uploadAttachment'])->name('checklists.uploadAttachment');

    // Notifications
    Route::get('/notifications', [\App\Http\Controllers\NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('notifications.readAll');

    // Khusus Admin
    Route::middleware('can:admin-access')->group(function () {
        Route::get('/user-management', [\App\Http\Controllers\UserController::class, 'index'])->name('user-management.index');
        Route::post('/user-management', [\App\Http\Controllers\UserController::class, 'store'])->name('user-management.store');
        Route::put('/user-management/{id}', [\App\Http\Controllers\UserController::class, 'update'])->name('user-management.update');
        Route::post('/user-management/{id}/reset-password', [\App\Http\Controllers\UserController::class, 'resetPassword'])->name('user-management.reset-password');
        Route::delete('/user-management/{id}', [\App\Http\Controllers\UserController::class, 'destroy'])->name('user-management.destroy');

        Route::get('/activity-logs', [\App\Http\Controllers\ActivityLogController::class, 'index'])->name('activity-logs.index');
    });
    // Documents
    Route::post('/documents', [\App\Http\Controllers\DocumentController::class, 'store'])->name('documents.store');
    Route::get('/documents/{id}/download', [\App\Http\Controllers\DocumentController::class, 'download'])->name('documents.download');
    Route::delete('/documents/{id}', [\App\Http\Controllers\DocumentController::class, 'destroy'])->name('documents.destroy');
    Route::post('/documents/{id}/versions', [\App\Http\Controllers\DocumentController::class, 'uploadVersion'])->name('documents.versions.store');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';

Route::get('/business-processes', [BusinessProcessController::class, 'index']);

