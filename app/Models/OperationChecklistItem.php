<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OperationChecklistItem extends Model
{
    protected $guarded = [];

    public function operationChecklist()
    {
        return $this->belongsTo(OperationChecklist::class);
    }

    public function templateItem()
    {
        return $this->belongsTo(ChecklistTemplateItem::class, 'checklist_template_item_id');
    }
}
