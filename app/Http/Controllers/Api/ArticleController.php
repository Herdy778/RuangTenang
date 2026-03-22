<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\Request;

class ArticleController extends Controller
{
    public function index()
    {
        $articles = Article::all();

        return response()->json([
            'status'     => 'success',
            'total_data' => $articles->count(),
            'data'       => $articles
        ]);
    }

    public function byMood($mood)
    {
        $articles = Article::where('kategori_tag', $mood)->get();

        return response()->json([
            'status'     => 'success',
            'mood'       => $mood,
            'total_data' => $articles->count(),
            'data'       => $articles
        ]);
    }
}
