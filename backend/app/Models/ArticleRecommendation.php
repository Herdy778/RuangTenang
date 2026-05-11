<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class ArticleRecommendation extends Model
{
    protected $collection = 'article_recommendations';

    protected $fillable = [
        'user_id',
        'journal_id',
        'article_id',
        'admin_id',
        'is_read',
        'created_at'
    ];
}