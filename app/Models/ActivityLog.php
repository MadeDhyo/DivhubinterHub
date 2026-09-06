<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    protected $fillable = [
        'user_id',
        'action',
        'description',
        'properties',
        'ip_address',
    ];

    protected $casts = [
        'properties' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Helper untuk mencatat log aktivitas sistem lengkap dengan diff (old vs new)
     */
    public static function record($action, $description = null, array $old = null, array $new = null, array $extra = null)
    {
        $payload = [];
        if ($old !== null) $payload['old'] = $old;
        if ($new !== null) $payload['new'] = $new;
        if ($extra !== null) $payload['extra'] = $extra;

        return static::create([
            'user_id' => auth()->id(),
            'action' => $action,
            'description' => $description,
            'properties' => empty($payload) ? null : $payload,
            'ip_address' => request()->ip(),
        ]);
    }
}
