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
Route::post('/login',    [AuthController::class, 'login']);

// Artikel bisa diakses tanpa login
Route::get('/articles', [ArticleController::class, 'index']);
Route::get('/articles/mood/{mood}', [ArticleController::class, 'byMood']);


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
    Route::post('/logout',   [AuthController::class, 'logout']);
    Route::put('/profile',   [AuthController::class, 'updateProfile']);

    // Journals
    Route::post('/journals', [JournalController::class, 'store']);
    Route::get('/journals',  [JournalController::class, 'index']);
    Route::put('/journals/{id}/status', [JournalController::class, 'updateStatus']);
    Route::get('/articles/rekomendasi', [ArticleController::class, 'rekomendasi']);

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

    // Article Management
    Route::get('/admin/articles', [ArticleController::class, 'index']);
    Route::post('/admin/articles', [ArticleController::class, 'store']);
    Route::put('/admin/articles/{id}', [ArticleController::class, 'update']);
    Route::put('/admin/articles/{id}/kategori', [ArticleController::class, 'updateKategori']);
    Route::delete('/admin/articles/{id}', [ArticleController::class, 'destroy']);
});


/*
|--------------------------------------------------------------------------
| TESTING (Optional)
|--------------------------------------------------------------------------
*/
Route::post('/test-ai', [JournalController::class, 'tesAi']);