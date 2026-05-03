<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\Request;

class ArticleController extends Controller
{
    // =========================
    // GET ALL ARTICLES
    // =========================
    public function index()
    {
        $articles = Article::orderBy('created_at', 'desc')->get();

        return response()->json([
            'status'     => 'success',
            'total_data' => $articles->count(),
            'data'       => $articles
        ]);
    }

    // =========================
    // GET BY MOOD
    // =========================
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

    // =========================
    // CREATE ARTICLE
    // =========================
    public function store(Request $request)
    {
        $article = Article::create([
            'judul_artikel' => $request->judul_artikel,
            'isi_konten'    => $request->isi_konten,
            'penulis'       => $request->penulis,
            'thumbnail_url' => $request->thumbnail_url,
            'kategori_tag'  => $request->kategori_tag,
        ]);

        return response()->json([
            'status' => 'success',
            'data'   => $article
        ]);
    }

    // =========================
    // UPDATE ARTICLE
    // =========================
    public function update(Request $request, $id)
    {
        $article = Article::where('_id', $id)->first();

        if (!$article) {
            return response()->json([
                'status' => 'error',
                'pesan' => 'Artikel tidak ditemukan'
            ], 404);
        }

        $article->judul_artikel = $request->judul_artikel;
        $article->isi_konten    = $request->isi_konten;
        $article->penulis       = $request->penulis;
        $article->thumbnail_url = $request->thumbnail_url;
        $article->kategori_tag  = $request->kategori_tag;

        $article->save();

        return response()->json([
            'status' => 'success',
            'data' => $article
        ]);
    }

    // =========================
    // UPDATE KATEGORI SAJA
    // =========================
    public function updateKategori(Request $request, $id)
    {
        $article = Article::where('_id', $id)->first();

        if (!$article) {
            return response()->json([
                'status' => 'error'
            ], 404);
        }

        $article->kategori_tag = $request->kategori_tag;
        $article->save();

        return response()->json([
            'status'=>'success'
        ]);
    }

    // =========================
    // DELETE ARTICLE
    // =========================
    public function destroy($id)
    {
        $article = Article::where('_id', $id)->first();

        if (!$article) {
            return response()->json([
                'status' => 'error',
                'pesan' => 'Artikel tidak ditemukan'
            ], 404);
        }

        $article->delete();

        return response()->json([
            'status' => 'success'
        ]);
    }
}