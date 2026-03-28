<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class RelaxationSession extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'relaxation_sessions';

    protected $fillable = [
        'user_id',
        'jenis_relaksasi',
        'durasi_menit',
        'tanggal',
    ];
}
