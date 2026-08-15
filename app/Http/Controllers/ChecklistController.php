<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\OperationChecklistItem;
use Illuminate\Support\Facades\Gate;

class ChecklistController extends Controller
{
    public function updateStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|string']);
        $item = OperationChecklistItem::findOrFail($id);

        $newStatus = $request->status;

        if (in_array($newStatus, ['Verified', 'Rejected'])) {
            Gate::authorize('verify-checklist-item', $item);
        } else {
            Gate::authorize('update-checklist-item', $item);
        }

        $item->update(['status' => $newStatus]);
        return redirect()->back();
    }
}
