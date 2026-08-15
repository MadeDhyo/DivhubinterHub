<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Target extends Model
{
    protected $guarded = [];

    public function operation()
    {
        return $this->belongsTo(Operation::class);
    }
}
