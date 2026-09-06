<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

class AuditTrailService
{
    /**
     * Record a tamper-evident audit log entry
     */
    public static function log(
        string $module,
        string $actionType,
        string $entityName,
        string|int $entityId,
        ?array $beforeState = null,
        ?array $afterState = null
    ): AuditLog {
        $user = Auth::user();

        // Get last audit log's record_hash for chaining
        $lastLog = AuditLog::latest('id')->first();
        $previousHash = $lastLog ? $lastLog->record_hash : 'GENESIS';

        $data = [
            'event_time' => now()->toIso8601String(),
            'actor_id' => $user?->id,
            'actor_name' => $user?->name ?? 'SYSTEM',
            'actor_role' => $user?->role ?? 'SYSTEM',
            'ip_address' => request()->ip() ?? '127.0.0.1',
            'user_agent' => request()->userAgent() ?? 'N/A',
            'module' => strtoupper($module),
            'action_type' => strtoupper($actionType),
            'entity_name' => $entityName,
            'entity_id' => (string) $entityId,
            'before_state' => $beforeState,
            'after_state' => $afterState,
            'previous_hash' => $previousHash,
        ];

        $recordHash = AuditLog::generateHash($data, $previousHash);
        $data['record_hash'] = $recordHash;

        return AuditLog::create($data);
    }
}
