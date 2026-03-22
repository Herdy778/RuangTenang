<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Token;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'nama_lengkap' => 'required|string',
            'email'        => 'required|email|unique:users,email',
            'password'     => 'required|string|min:6'
        ]);

        $user = User::create([
            'nama_lengkap' => $request->nama_lengkap,
            'email'        => $request->email,
            'password'     => Hash::make($request->password),
            'role'         => 'mahasiswa'
        ]);

        $token = $user->createToken('auth_token');

        return response()->json([
            'status' => 'success',
            'pesan'  => 'Registrasi berhasil!',
            'data'   => $user,
            'token'  => $token
        ]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'status' => 'error',
                'pesan'  => 'Email atau Password salah!'
            ], 401);
        }

        $token = $user->createToken('auth_token');

        return response()->json([
            'status' => 'success',
            'pesan'  => 'Login berhasil!',
            'data'   => $user,
            'token'  => $token
        ]);
    }

    public function logout(Request $request)
    {
        $bearerToken = $request->bearerToken();
        $hashedToken = hash('sha256', $bearerToken);

        Token::where('token', $hashedToken)->delete();

        return response()->json([
            'status' => 'success',
            'pesan'  => 'Berhasil logout'
        ]);
    }
}
