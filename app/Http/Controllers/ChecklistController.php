<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\OperationChecklistItem;

class ChecklistController extends Controller
{
    public function updateStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|string']);
        $item = OperationChecklistItem::findOrFail($id);
        $item->update(['status' => $request->status]);
        return redirect()->back();
    }
}
