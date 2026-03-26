<?php

namespace App\Http\Middleware;

use App\Models\Token;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TokenAuth
{
    public function handle(Request $request, Closure $next)
    {
        $bearerToken = $request->bearerToken();

        if (!$bearerToken) {
            return response()->json([
                'status' => 'error',
                'pesan'  => 'Token tidak ditemukan'
            ], 401);
        }

        $hashedToken = hash('sha256', $bearerToken);
        $token = Token::where('token', $hashedToken)->first();

        if (!$token) {
            return response()->json([
                'status' => 'error',
                'pesan'  => 'Token tidak valid'
            ], 401);
        }

       $userData = DB::connection('mongodb')
    ->collection('users')
    ->where('_id', $token->user_id)
    ->first();

if (!$userData) {
    return response()->json([
        'status' => 'error',
        'pesan'  => 'User tidak ditemukan'
    ], 401);
}

$user = User::where('email', $userData['email'])->first();

        $token->update(['last_used_at' => now()]);

        // Simpan user ke request untuk diakses controller
        $request->merge(['auth_user' => $user]);
        $request->setUserResolver(fn() => $user);

        return $next($request);
    }
}
