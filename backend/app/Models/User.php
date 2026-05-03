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
        'role',
        'gender',
        'occupation',
        'photo',
        'photo_url'
    ];

    protected $hidden = [
        'password'
    ];
}