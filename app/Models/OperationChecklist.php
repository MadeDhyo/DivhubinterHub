<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OperationChecklist extends Model
{
    protected $guarded = [];

    public function operation()
    {
        return $this->belongsTo(Operation::class);
    }

    public function template()
    {
        return $this->belongsTo(ChecklistTemplate::class, 'checklist_template_id');
    }

    public function items()
    {
        return $this->hasMany(OperationChecklistItem::class);
    }
}
