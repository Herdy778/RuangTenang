<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\ArticleRecommendation;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use MongoDB\BSON\ObjectId;

class ArticleController extends Controller
{
    // =========================
    // HELPER: Ambil userId dari request->attributes (set oleh TokenAuth)
    // Throw exception jika tidak ada agar semua method bisa tangkap seragam
    // =========================
    private function getUserIdFromRequest(Request $request): string
    {
        // FIX: Pakai attributes->get() bukan ->auth_user langsung
        $authUser = $request->attributes->get('auth_user');

        if (!$authUser || empty($authUser->email)) {
            throw new \Exception('Sesi tidak valid. Silakan login kembali.', 401);
        }

        $userId = DB::connection('mongodb')
            ->collection('users')
            ->where('email', $authUser->email)
            ->value('_id');

        if (!$userId) {
            throw new \Exception('User tidak ditemukan di database.', 404);
        }

        return (string) $userId;
    }

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
    // MY RECOMMENDED ARTICLES (UNTUK USER MOBILE)
    // =========================
    public function myRecommendedArticles(Request $request)
    {
        try {
            $userId = $this->getUserIdFromRequest($request);

            $recommendations = ArticleRecommendation::where('user_id', $userId)
                ->orderBy('created_at', 'desc')
                ->get();

            if ($recommendations->isEmpty()) {
                return response()->json([
                    'status'      => 'success',
                    'total_count' => 0,
                    'data'        => []
                ]);
            }

            $orderedArticleIds = $recommendations
                ->pluck('article_id')
                ->filter()
                ->unique()
                ->values();

            $articleIdObjects = $orderedArticleIds
                ->map(function ($id) {
                    try {
                        return new ObjectId((string) $id);
                    } catch (\Exception $e) {
                        return null;
                    }
                })
                ->filter()
                ->values()
                ->toArray();

            if (empty($articleIdObjects)) {
                return response()->json([
                    'status'      => 'success',
                    'total_count' => 0,
                    'data'        => []
                ]);
            }

            $articlesRaw = DB::connection('mongodb')
                ->collection('articles')
                ->whereIn('_id', $articleIdObjects)
                ->get();

            $articlesById = collect($articlesRaw)->keyBy(function ($article) {
                return (string) ($article['_id'] ?? '');
            });

            $formatted = $orderedArticleIds->map(function ($articleId) use ($articlesById, $recommendations) {
                $article = $articlesById->get((string) $articleId);
                if (!$article) return null;

                $rec = $recommendations->firstWhere('article_id', (string) $articleId);

                $article['_id']            = (string) ($article['_id'] ?? '');
                $article['recommended_at'] = $rec ? $rec->created_at : null;
                $article['is_read']        = $rec ? (bool) ($rec->is_read ?? false) : false;

                return $article;
            })->filter()->values();

            return response()->json([
                'status'      => 'success',
                'total_count' => $formatted->count(),
                'data'        => $formatted
            ]);

        } catch (\Exception $e) {
            $code = $e->getCode();
            return response()->json([
                'status'  => 'error',
                'message' => $e->getMessage()
            ], in_array($code, [401, 404, 500]) ? $code : 500);
        }
    }

    // =========================
    // MARK ARTICLE AS READ
    // =========================
    public function markAsRead(Request $request, $articleId)
    {
        try {
            $userId = $this->getUserIdFromRequest($request);

            ArticleRecommendation::where('user_id', $userId)
                ->where('article_id', (string) $articleId)
                ->update(['is_read' => true]);

            return response()->json([
                'status'  => 'success',
                'message' => 'Artikel ditandai sudah dibaca'
            ]);

        } catch (\Exception $e) {
            $code = $e->getCode();
            return response()->json([
                'status'  => 'error',
                'message' => $e->getMessage()
            ], in_array($code, [401, 404, 500]) ? $code : 500);
        }
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
                'pesan'  => 'Artikel tidak ditemukan'
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
            'data'   => $article
        ]);
    }

    // =========================
    // UPDATE KATEGORI SAJA
    // =========================
    public function updateKategori(Request $request, $id)
    {
        $article = Article::where('_id', $id)->first();

        if (!$article) {
            return response()->json(['status' => 'error'], 404);
        }

        $article->kategori_tag = $request->kategori_tag;
        $article->save();

        return response()->json(['status' => 'success']);
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
                'pesan'  => 'Artikel tidak ditemukan'
            ], 404);
        }

        $article->delete();

        return response()->json(['status' => 'success']);
    }
}