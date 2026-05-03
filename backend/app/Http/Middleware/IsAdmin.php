<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class IsAdmin
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user(); // dari TokenAuth

        if (!$user || $user->role !== 'admin') {
            return response()->json([
                'status' => 'error',
                'pesan' => 'Akses ditolak. Hanya admin'
            ], 403);
        }

        return $next($request);
    }
}