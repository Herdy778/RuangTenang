<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\JournalController;
use App\Http\Controllers\Api\ArticleController;
use App\Http\Controllers\Api\MoodController;

Route::get('/mood-stats', [MoodController::class, 'index']);
Route::get('/dashboard-stats', [MoodController::class, 'dashboardStats']);
Route::post('/relaxation-sessions', [MoodController::class, 'storeRelaxation']);
Route::post('/moods', [MoodController::class, 'store']);

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);


// Route artikel bisa diakses tanpa login
Route::get('/articles', [ArticleController::class, 'index']);
Route::get('/articles/mood/{mood}', [ArticleController::class, 'byMood']);


Route::middleware('auth.token')->group(function () {
    Route::post('/logout',   [AuthController::class, 'logout']);
    Route::post('/journals', [JournalController::class, 'store']);
    Route::get('/journals',  [JournalController::class, 'index']);
    Route::put('/journals/{id}/status', [JournalController::class, 'updateStatus']);

// =========================
// ADMIN API
// =========================
Route::get('/admin/users', [AuthController::class, 'users']);
Route::put('/admin/users/{id}', [AuthController::class, 'updateUser']);
Route::delete('/admin/users/{id}', [AuthController::class, 'deleteUser']);

Route::get('/admin/journals', [JournalController::class, 'adminJournals']);
Route::delete('/admin/journals/{id}', [JournalController::class, 'deleteJournal']);

Route::get('/admin/articles', [ArticleController::class, 'index']);
Route::post('/admin/articles', [ArticleController::class, 'store']);
Route::put('/admin/articles/{id}', [ArticleController::class, 'update']);
Route::put('/admin/articles/{id}/kategori', [ArticleController::class, 'updateKategori']);
Route::delete('/admin/articles/{id}', [ArticleController::class, 'destroy']);
});


Route::post('/test-ai', [\App\Http\Controllers\Api\JournalController::class, 'tesAi']);