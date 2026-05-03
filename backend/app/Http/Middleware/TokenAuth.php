<?php

namespace App\Http\Middleware;

use App\Models\Token;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Contracts\Auth\Authenticatable;

class TokenAuth
{
    public function handle(Request $request, Closure $next)
    {
        try {
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

            // Query user langsung dari token
            $user = User::where('_id', $token->user_id)->first();

            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'pesan'  => 'User tidak ditemukan'
                ], 401);
            }

            $token->update(['last_used_at' => now()]);

            // Properly set user untuk Laravel auth system
            if ($request instanceof Request) {
                $request->setUserResolver(function () use ($user) {
                    return $user;
                });
            }

            return $next($request);
        } catch (\Exception $e) {
            \Log::error('TokenAuth middleware error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'pesan'  => 'Authentication error: ' . $e->getMessage()
            ], 401);
        }
    }
}
