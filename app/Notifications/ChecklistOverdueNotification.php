<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ChecklistOverdueNotification extends Notification
{
    use Queueable;

    public function __construct(
        public int $checklistItemId,
        public string $itemName,
        public string $operationNumber,
        public ?string $deadline
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'CHECKLIST_OVERDUE',
            'title' => 'Tenggat Waktu Checklist Terlewati!',
            'message' => "Item '{$this->itemName}' pada operasi {$this->operationNumber} telah melewati deadline ({$this->deadline}).",
            'checklist_item_id' => $this->checklistItemId,
            'operation_number' => $this->operationNumber,
        ];
    }
}
