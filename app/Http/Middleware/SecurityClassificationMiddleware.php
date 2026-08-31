<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class SecurityClassificationMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string $minClearance = 'RAHASIA'): Response
    {
        $user = Auth::user();
        if (!$user) {
            abort(401, 'Unauthenticated');
        }

        $hierarchy = [
            'BIASA' => 1,
            'TERBATAS' => 2,
            'RAHASIA' => 3,
            'SANGAT_RAHASIA' => 4,
        ];

        $userLevel = $hierarchy[$user->classification_clearance ?? 'RAHASIA'] ?? 3;
        $requiredLevel = $hierarchy[$minClearance] ?? 3;

        if ($userLevel < $requiredLevel) {
            abort(403, 'Akses Ditolak: Hak clearance Anda (' . $user->classification_clearance . ') tidak mencukupi untuk akses bertingkat ' . $minClearance . '.');
        }

        return $next($request);
    }
}
