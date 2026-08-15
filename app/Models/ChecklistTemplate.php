<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChecklistTemplate extends Model
{
    protected $guarded = [];

    public function items()
    {
        return $this->hasMany(ChecklistTemplateItem::class);
    }
}
