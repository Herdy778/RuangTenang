<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Journal extends Model
{
    protected $collection = 'journals';

    protected $fillable = [
        'user_id',
        'teks_curhat',
        'hasil_mood',
        'tanggal',
        'status' // ✅ TAMBAHAN
    ];

    protected $casts = [
        'tanggal' => 'datetime',
    ];
}