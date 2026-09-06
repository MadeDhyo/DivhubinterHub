<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class OperationStatusChangedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public int $operationId,
        public string $operationNumber,
        public string $oldStatus,
        public string $newStatus
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'OPERATION_STATUS_CHANGED',
            'title' => 'Status Operasi Diperbarui',
            'message' => "Status operasi {$this->operationNumber} berubah dari '{$this->oldStatus}' menjadi '{$this->newStatus}'.",
            'operation_id' => $this->operationId,
            'operation_number' => $this->operationNumber,
        ];
    }
}
