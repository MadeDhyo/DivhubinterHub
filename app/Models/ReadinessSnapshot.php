<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReadinessSnapshot extends Model
{
    protected $fillable = [
        'operation_id',
        'score',
        'status',
        'snapshot_data',
        'evaluated_by',
    ];

    protected $casts = [
        'score' => 'float',
        'snapshot_data' => 'array',
    ];

    public function operation()
    {
        return $this->belongsTo(Operation::class);
    }

    public function evaluator()
    {
        return $this->belongsTo(User::class, 'evaluated_by');
    }
}
