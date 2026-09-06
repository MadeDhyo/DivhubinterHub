<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Operation extends Model
{
    protected $guarded = [];

    public function targets()
    {
        return $this->hasMany(Target::class);
    }

    public function checklists()
    {
        return $this->hasMany(OperationChecklist::class);
    }

    public function documents()
    {
        return $this->hasMany(Document::class);
    }

    public function dpoPersons()
    {
        return $this->belongsToMany(DpoPerson::class, 'dpo_person_operation')
                    ->withTimestamps();
    }
}
