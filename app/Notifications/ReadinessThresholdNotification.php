<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ReadinessThresholdNotification extends Notification
{
    use Queueable;

    public function __construct(
        public int $operationId,
        public string $operationNumber,
        public float $score,
        public string $status
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'READINESS_THRESHOLD',
            'title' => "Skor Kesiapan Operasi: {$this->score}%",
            'message' => "Operasi {$this->operationNumber} kini mencapai skor kesiapan {$this->score}% dengan status {$this->status}.",
            'operation_id' => $this->operationId,
            'operation_number' => $this->operationNumber,
            'score' => $this->score,
        ];
    }
}
