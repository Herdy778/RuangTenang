<?php

namespace App\Models;

use Jenssegers\Mongodb\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    protected $connection = 'mongodb';
    protected $collection = 'users';

    protected $fillable = [
    'name',
    'email',
    'password',
];

    protected $hidden = [
        'password'
    ];
}