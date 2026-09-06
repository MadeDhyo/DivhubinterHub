<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\OperationChecklistItem;
use App\Models\User;
use App\Notifications\ChecklistOverdueNotification;

class CheckOverdueItems extends Command
{
    protected $signature = 'ocms:check-overdue';

    protected $description = 'Pindai item checklist yang melewati batas waktu dan kirimkan notifikasi ke PIC';

    public function handle()
    {
        $now = now();

        $overdueItems = OperationChecklistItem::with(['pic', 'templateItem', 'operationChecklist.operation'])
            ->whereNotIn('status', ['Completed', 'Verified'])
            ->whereNotNull('deadline')
            ->where('deadline', '<', $now)
            ->get();

        $count = 0;

        foreach ($overdueItems as $item) {
            $itemName = $item->templateItem?->name ?? 'Checklist Item';
            $opNumber = $item->operationChecklist?->operation?->operation_number ?? 'Unknown';
            $deadlineStr = $item->deadline ? $item->deadline->format('d M Y H:i') : null;

            // Notify PIC user if assigned
            if ($item->pic) {
                $item->pic->notify(new ChecklistOverdueNotification($item->id, $itemName, $opNumber, $deadlineStr));
                $count++;
            }

            // Also notify Admin users
            $admins = User::where('role', 'admin')->get();
            foreach ($admins as $admin) {
                $admin->notify(new ChecklistOverdueNotification($item->id, $itemName, $opNumber, $deadlineStr));
            }
        }

        $this->info("Pemeriksaan selesai. Sent notifications for {$count} overdue items.");
        return Command::SUCCESS;
    }
}
