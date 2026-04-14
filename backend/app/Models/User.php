<?php

namespace App\Models;

use MongoDB\Laravel\Auth\User as Authenticatable;

class User extends Authenticatable
{
    protected $connection = 'mongodb';
    protected $collection = 'users';

    protected $fillable = [
        'nama_lengkap',
        'email',
        'password',
        'role'
    ];

    protected $hidden = [
        'password'
    ];
}