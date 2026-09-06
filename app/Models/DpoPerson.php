<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DpoPerson extends Model
{
    protected $table = 'dpo_persons';

    protected $guarded = [];

    protected $casts = [
        'date_of_birth' => 'date',
    ];

    public function operations()
    {
        return $this->belongsToMany(Operation::class, 'dpo_person_operation')
                    ->withTimestamps();
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
