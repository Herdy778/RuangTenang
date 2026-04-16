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
        'email'        => 'required|email',
        'password'     => 'required|string|min:6'
    ]);

    $user = User::create([
        'nama_lengkap' => $request->nama_lengkap,
        'email'        => $request->email,
        'password'     => Hash::make($request->password),
        'role'         => 'mahasiswa'
    ]);

    $token = bin2hex(random_bytes(32));

    Token::create([
        'user_id' => $user->_id,
        'token'   => hash('sha256', $token),
        'name'    => 'auth_token'
    ]);

    return response()->json([
        'status' => 'success',
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

    $token = bin2hex(random_bytes(32));

    Token::create([
        'user_id' => $user->_id,
        'token'   => hash('sha256', $token),
        'name'    => 'auth_token'
    ]);

    return response()->json([
        'status' => 'success',
        'data'   => $user,
        'token'  => $token
    ]);
}

    public function users()
    {
        $users = User::select('_id','nama_lengkap','email','role')
            ->orderBy('_id','desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $users
        ]);
    }

    // UPDATE ROLE USER
    public function updateUser(Request $request, $id)
    {
        $user = User::where('_id', $id)->first();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'pesan' => 'User tidak ditemukan'
            ], 404);
        }

        $user->role = $request->role;
        $user->save();

        return response()->json([
            'status' => 'success',
            'pesan' => 'Role berhasil diupdate'
        ]);
    }

    // DELETE USER
    public function deleteUser($id)
    {
        $user = User::where('_id', $id)->first();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'pesan' => 'User tidak ditemukan'
            ], 404);
        }

        $user->delete();

        return response()->json([
            'status' => 'success',
            'pesan' => 'User berhasil dihapus'
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

    public function updateProfile(Request $request)
    {
        $user = $request->user(); // from TokenAuth middleware

        $request->validate([
            'nama_lengkap' => 'required|string',
            'email'        => 'required|email',
        ]);

        $user->nama_lengkap = $request->nama_lengkap;
        $user->email = $request->email;

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return response()->json([
            'status' => 'success',
            'pesan'  => 'Profil berhasil diperbarui',
            'data'   => [
                'nama_lengkap' => $user->nama_lengkap,
                'email'        => $user->email,
            ]
        ]);
    }
}