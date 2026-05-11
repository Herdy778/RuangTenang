<?php

namespace App\Http\Middleware;

use App\Models\Token;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;

class TokenAuth
{
    public function handle(Request $request, Closure $next)
    {
        try {
            // Ambil bearer token dari header Authorization
            $bearerToken = $request->bearerToken();

            if (!$bearerToken) {
                return response()->json([
                    'status' => 'error',
                    'pesan'  => 'Token tidak ditemukan'
                ], 401);
            }

            // Hash token karena token disimpan hashed di database
            $hashedToken = hash('sha256', $bearerToken);

            // Cari token
            $token = Token::where('token', $hashedToken)->first();

            if (!$token) {
                return response()->json([
                    'status' => 'error',
                    'pesan'  => 'Token tidak valid'
                ], 401);
            }

            // Cari user berdasarkan token
            $user = User::where('_id', $token->user_id)->first();

            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'pesan'  => 'User tidak ditemukan'
                ], 401);
            }

            // Update last_used_at
            $token->update([
                'last_used_at' => now()
            ]);

            /*
             |-----------------------------------------
             | PENTING:
             | Simpan user ke request
             |-----------------------------------------
             */

            // supaya bisa dipanggil: $request->auth_user
            $request->merge([
                'auth_user' => $user
            ]);

            // supaya bisa dipanggil: auth()->user()
            $request->setUserResolver(function () use ($user) {
                return $user;
            });

            return $next($request);

        } catch (\Exception $e) {

            \Log::error('TokenAuth middleware error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => 'error',
                'pesan'  => 'Authentication error: ' . $e->getMessage()
            ], 401);
        }
    }
}