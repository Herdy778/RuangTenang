<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TokenAuth
{
    public function handle(Request $request, Closure $next)
    {
        try {
            $bearerToken = $request->bearerToken();

            if (!$bearerToken) {
                return response()->json([
                    'status' => 'error',
                    'pesan'  => 'Token tidak ditemukan',
                ], 401);
            }

            $hashedToken = hash('sha256', $bearerToken);

            // Pakai DB langsung — Token::where()->first() bisa OOM jika collection besar
            $token = DB::connection('mongodb')
                ->collection('tokens')
                ->where('token', $hashedToken)
                ->first();

            if (!$token) {
                return response()->json([
                    'status' => 'error',
                    'pesan'  => 'Token tidak valid',
                ], 401);
            }

            // user_id sudah pasti string karena AuthController insert pakai DB langsung
            $userId = $token['user_id'] ?? null;

            if (empty($userId)) {
                \Log::error('TokenAuth: user_id kosong di token', ['token_doc' => $token]);
                return response()->json([
                    'status' => 'error',
                    'pesan'  => 'Token rusak: user_id tidak valid',
                ], 401);
            }

            // Pastikan string (fallback jika ada token lama dengan ObjectId)
            if (is_object($userId) && method_exists($userId, '__toString')) {
                $userId = (string) $userId;
            } elseif (is_array($userId) && isset($userId['$oid'])) {
                $userId = (string) $userId['$oid'];
            }

            $user = User::where('_id', $userId)->first();

            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'pesan'  => 'User tidak ditemukan',
                ], 401);
            }

            // Update last_used_at pakai DB langsung
            DB::connection('mongodb')
                ->collection('tokens')
                ->where('token', $hashedToken)
                ->update(['last_used_at' => now()->toDateTimeString()]);

            $request->attributes->set('auth_user', $user);
            $request->setUserResolver(fn() => $user);

            return $next($request);

        } catch (\Exception $e) {
            \Log::error('TokenAuth middleware error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'status' => 'error',
                'pesan'  => 'Authentication error: ' . $e->getMessage(),
            ], 401);
        }
    }
}