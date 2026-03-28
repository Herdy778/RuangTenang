<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Mood extends Model
{
    protected $collection = 'moods';

    protected $fillable = [
        'user_id',
        'mood',
        'score',
        'tanggal',
        'catatan'
    ];

    protected $casts = [
        'tanggal' => 'datetime',
    ];
}
