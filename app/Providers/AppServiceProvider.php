<?php

namespace App\Providers;

use App\Models\Operation;
use App\Models\OperationChecklistItem;
use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        $this->registerAuthorizationGates();
    }

    /**
     * Registrasi Gates Otorisasi untuk Readiness & Operation Management.
     */
    private function registerAuthorizationGates(): void
    {
        // 1. View Operation
        Gate::define('view-operation', function (User $user, Operation $operation) {
            if ($this->isAdminOrPimpinan($user) || $user->id === $operation->pic_id) {
                return true;
            }

            return $operation->checklists()
                ->whereHas('items', function ($query) use ($user) {
                    $query->where('pic_id', $user->id)
                          ->orWhere('reviewer_id', $user->id);
                })->exists();
        });

        // 2. Update Checklist Item
        Gate::define('update-checklist-item', function (User $user, OperationChecklistItem $item) {
            return $this->isAdminOrPimpinan($user) || $user->id === $item->pic_id;
        });

        // 3. Verify Checklist Item (Reviewer memverifikasi pengerjaan PIC)
        Gate::define('verify-checklist-item', function (User $user, OperationChecklistItem $item) {
            // PIC dilarang memverifikasi pekerjaannya sendiri
            if ($user->id === $item->pic_id && !$this->isAdminOrPimpinan($user)) {
                return false;
            }
            return $this->isAdminOrPimpinan($user) || $user->id === $item->reviewer_id;
        });

        // 4. View Readiness
        Gate::define('view-readiness', function (User $user, Operation $operation) {
            if ($this->isAdminOrPimpinan($user) || $user->id === $operation->pic_id) {
                return true;
            }

            return $operation->checklists()
                ->whereHas('items', function ($query) use ($user) {
                    $query->where('pic_id', $user->id)
                          ->orWhere('reviewer_id', $user->id);
                })->exists();
        });

        // 5. Approve Readiness (Hanya Admin/Pimpinan)
        Gate::define('approve-readiness', function (User $user) {
            return $this->isAdminOrPimpinan($user);
        });

        // 6. Change Operation Status (Hanya Admin/Pimpinan)
        Gate::define('change-operation-status', function (User $user) {
            return $this->isAdminOrPimpinan($user);
        });

        // 7. Admin Access & User Management (Hanya Admin)
        Gate::define('admin-access', function (User $user) {
            return $user->isAdmin();
        });

        Gate::define('manage-users', function (User $user) {
            return $user->isAdmin();
        });
    }

    /**
     * Helper internal untuk mengidentifikasi Pimpinan/Admin.
     */
    private function isAdminOrPimpinan(User $user): bool
    {
        return $user->isAdmin() || $user->isPimpinan();
    }
}
