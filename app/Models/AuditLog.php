<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'before_state' => 'array',
        'after_state' => 'array',
        'event_time' => 'datetime',
    ];

    public function actor()
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    /**
     * Calculate HMAC-SHA256 record hash for tamper resistance
     */
    public static function generateHash(array $data, ?string $previousHash = null): string
    {
        $secret = config('app.key', 'ocms_audit_secret_key');
        $payload = implode('|', [
            $data['event_time'] ?? now()->toIso8601String(),
            $data['actor_id'] ?? 'SYSTEM',
            $data['action_type'] ?? '',
            $data['module'] ?? '',
            $data['entity_name'] ?? '',
            $data['entity_id'] ?? '',
            json_encode($data['before_state'] ?? []),
            json_encode($data['after_state'] ?? []),
            $previousHash ?? 'GENESIS',
        ]);

        return hash_hmac('sha256', $payload, $secret);
    }
}
