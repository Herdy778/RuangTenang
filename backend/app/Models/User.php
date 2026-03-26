<?php

namespace App\Models;

use MongoDB\Laravel\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
class User extends Authenticatable
{
    use Notifiable;

    protected $connection = 'mongodb';
    protected $collection = 'users';

    protected $fillable = [
        'nama_lengkap',
        'email',
        'password',
        'role'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [];

public function createToken(string $name)
{
    $plainText = Str::random(64);

    // Akses MongoDB connection langsung, bypass Eloquent sepenuhnya
    $userId = DB::connection('mongodb')
        ->collection('users')
        ->where('email', $this->email)
        ->value('_id');

    Token::create([
        'user_id'   => (string) $userId,
        'token'     => hash('sha256', $plainText),
        'name'      => $name,
        'abilities' => ['*'],
    ]);

    return $plainText;
}

    public function tokens()
    {
        return $this->hasMany(Token::class, 'user_id');
    }
}
