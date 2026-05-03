<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\JournalController;
use App\Http\Controllers\Api\ArticleController;
use App\Http\Controllers\Api\MoodController;

// Route yang tidak memerlukan token
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// Route artikel bisa diakses tanpa login
Route::get('/articles', [ArticleController::class, 'index']);
Route::get('/articles/mood/{mood}', [ArticleController::class, 'byMood']);


// Route foto upload - handle auth in controller
Route::post('/profile/upload-photo', [AuthController::class, 'uploadProfilePhoto']);

// Route to serve images via API to bypass CORS issue in Flutter Web
Route::get('/storage/profile-photos/{filename}', function ($filename) {
    $path = storage_path('app/public/profile-photos/' . $filename);
    if (!file_exists($path)) {
        abort(404);
    }
    return response()->file($path);
});

Route::middleware('auth.token')->group(function () {
    Route::get('/mood-stats', [MoodController::class, 'index']);
    Route::get('/dashboard-stats', [MoodController::class, 'dashboardStats']);
    Route::post('/relaxation-sessions', [MoodController::class, 'storeRelaxation']);
    Route::post('/moods', [MoodController::class, 'store']);

    Route::post('/logout',   [AuthController::class, 'logout']);
    Route::put('/profile',   [AuthController::class, 'updateProfile']);

    Route::post('/journals', [JournalController::class, 'store']);
    Route::get('/journals',  [JournalController::class, 'index']);
    Route::put('/journals/{id}/status', [JournalController::class, 'updateStatus']);

    // Analyze mental health via ML — butuh auth agar bisa simpan jurnal per user
    Route::post('/journal/analyze', [JournalController::class, 'analyzeMentalHealth']);

// =========================
// ADMIN API
// =========================
Route::get('/admin/users', [AuthController::class, 'users']);
Route::put('/admin/users/{id}', [AuthController::class, 'updateUser']);
Route::delete('/admin/users/{id}', [AuthController::class, 'deleteUser']);

Route::get('/admin/journals', [JournalController::class, 'adminJournals']);
Route::delete('/admin/journals/{id}', [JournalController::class, 'deleteJournal']);

});


Route::post('/test-ai', [\App\Http\Controllers\Api\JournalController::class, 'tesAi']);