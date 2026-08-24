<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        $unreadCount = $user ? $user->unreadNotifications()->count() : 0;
        $notifications = $user ? $user->notifications()->take(10)->get()->map(function ($n) {
            return [
                'id' => $n->id,
                'type' => $n->data['type'] ?? 'GENERAL',
                'title' => $n->data['title'] ?? 'Notifikasi Sistem',
                'message' => $n->data['message'] ?? '',
                'read_at' => $n->read_at ? $n->read_at->format('d M H:i') : null,
                'created_at' => $n->created_at->diffForHumans(),
            ];
        }) : [];

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
            ],
            'unread_notifications_count' => $unreadCount,
            'notifications' => $notifications,
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
