<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class ChatMessage extends Model
{
    protected $connection = 'mongodb';

    protected $collection = 'chat_messages';

    protected $fillable = [
        'user_id',
        'sender',
        'message',
    ];
}