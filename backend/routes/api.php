<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\JournalController;
use App\Http\Controllers\Api\ArticleController;
use App\Http\Controllers\Api\MoodController;


/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES (Tanpa Login)
|--------------------------------------------------------------------------
*/
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password/verify', [AuthController::class, 'resetPasswordVerify']);
Route::post('/forgot-password/reset', [AuthController::class, 'resetPassword']);

// Artikel bisa diakses tanpa login
Route::get('/articles', [ArticleController::class, 'index']);
Route::get('/articles/mood/{mood}', [ArticleController::class, 'byMood']);

// Photo access with CORS for Flutter Web
Route::get('/photo/{path}', function ($path) {
    $fullPath = storage_path('app/public/profile-photos/' . str_replace('..', '', $path));

    if (!file_exists($fullPath)) {
        abort(404);
    }

    $mime = mime_content_type($fullPath);

    return response()->file($fullPath, [
        'Access-Control-Allow-Origin' => '*',
        'Content-Type' => $mime,
    ]);
})->where('path', '.*');


/*
|--------------------------------------------------------------------------
| USER ROUTES (Harus Login)
|--------------------------------------------------------------------------
*/
Route::middleware('auth.token')->group(function () {

    // Mood & Dashboard
    Route::get('/mood-stats', [MoodController::class, 'index']);
    Route::get('/dashboard-stats', [MoodController::class, 'dashboardStats']);
    Route::post('/relaxation-sessions', [MoodController::class, 'storeRelaxation']);
    Route::post('/moods', [MoodController::class, 'store']);

    // Auth & Profile
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/profile/upload-photo', [AuthController::class, 'uploadProfilePhoto']);

    // Journals
    Route::post('/journals', [JournalController::class, 'store']);
    Route::get('/journals', [JournalController::class, 'index']);
    Route::put('/journals/{id}/status', [JournalController::class, 'updateStatus']);
    Route::get('/articles/rekomendasi', [ArticleController::class, 'rekomendasi']);
    Route::get('/my-recommended-articles', [ArticleController::class, 'myRecommendedArticles']);

    // ✅ PENTING: route statis (/read) HARUS di atas route dinamis ({articleId})
    // supaya Laravel tidak salah cocokkan "read" sebagai nilai {articleId}
    Route::post('/articles/{articleId}/read', [ArticleController::class, 'markAsRead']);

    // Chatbot (WAJIB LOGIN)
    Route::post('/test-ai', [JournalController::class, 'tesAi']);
    Route::get('/chat-history', [JournalController::class, 'getChatHistory']);

    // AI Analyze
    Route::post('/journal/analyze', [JournalController::class, 'analyzeMentalHealth']);
});


/*
|--------------------------------------------------------------------------
| ADMIN ROUTES (Login + Role Admin)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth.token', 'isAdmin'])->group(function () {

    // User Management
    Route::get('/admin/users', [AuthController::class, 'users']);
    Route::put('/admin/users/{id}', [AuthController::class, 'updateUser']);
    Route::delete('/admin/users/{id}', [AuthController::class, 'deleteUser']);

    // Journal Management
    Route::get('/admin/journals', [JournalController::class, 'adminJournals']);
    Route::delete('/admin/journals/{id}', [JournalController::class, 'deleteJournal']);

    // ===== FITUR REKOMENDASI ARTIKEL =====
    // ✅ PENTING: route statis (send-article) HARUS di atas route dinamis ({id})
    // supaya Laravel tidak salah cocokkan "send-article" sebagai nilai {id}
    Route::post(
        '/admin/journals/send-article',
        [JournalController::class, 'sendRecommendedArticle']
    );
    Route::get(
        '/admin/journals/{id}/recommended-articles',
        [JournalController::class, 'recommendedArticles']
    );

    // Article Management
    Route::get('/admin/articles', [ArticleController::class, 'index']);
    Route::post('/admin/articles', [ArticleController::class, 'store']);
    Route::put('/admin/articles/{id}', [ArticleController::class, 'update']);
    Route::put('/admin/articles/{id}/kategori', [ArticleController::class, 'updateKategori']);
    Route::delete('/admin/articles/{id}', [ArticleController::class, 'destroy']);
});