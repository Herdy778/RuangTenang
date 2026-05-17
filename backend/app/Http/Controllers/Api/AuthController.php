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
            'email' => 'required|email',
            'password' => 'required|string|min:6'
        ]);

        $user = User::create([
            'nama_lengkap' => $request->nama_lengkap,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'mahasiswa'
        ]);

        $token = bin2hex(random_bytes(32));

        Token::create([
            'user_id' => (string) $user->_id,
            'token' => hash('sha256', $token),
            'name' => 'auth_token'
        ]);

        return response()->json([
            'status' => 'success',
            'data' => $user,
            'token' => $token
        ]);
    }

    public function login(Request $request)
{
    $request->validate([
        'email' => 'required|email',
        'password' => 'required|string'
    ]);

    $user = User::where('email', $request->email)->first();

    if (!$user || !Hash::check($request->password, $user->password)) {
        return response()->json([
            'status' => 'error',
            'pesan' => 'Email atau Password salah!'
        ], 401);
    }

    // ❌ HAPUS VALIDASI ROLE DI SINI

    $token = bin2hex(random_bytes(32));

    Token::create([
        'user_id' => (string) $user->_id,
        'token' => hash('sha256', $token),
        'name' => 'auth_token'
    ]);

    return response()->json([
        'status' => 'success',
        'data' => $user,
        'token' => $token
    ]);
}

public function profile(Request $request)
{
    return response()->json([
        'user' => $request->user()
    ]);
}


    public function users()
    {
        $users = User::select('_id', 'nama_lengkap', 'email', 'role')
            ->orderBy('_id', 'desc')
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
            'pesan' => 'Berhasil logout'
        ]);
    }

    public function updateProfile(Request $request)
{
    $user = $request->user();

    $request->validate([
        'nama_lengkap' => 'required|string',
        'email'        => 'required|email',
        'bio'          => 'nullable|string',
    ]);

    $user->nama_lengkap = $request->nama_lengkap;
    $user->email = $request->email;
    $user->bio = $request->bio;

    if ($request->filled('password')) {
        $user->password = Hash::make($request->password);
    }

    if ($request->has('gender')) {
        $user->gender = $request->gender;
    }

    if ($request->has('occupation')) {
        $user->occupation = $request->occupation;
    }

    $user->save();

    return response()->json([
        'status' => 'success',
        'pesan'  => 'Profil berhasil diperbarui',
        'data'   => [
            'nama_lengkap' => $user->nama_lengkap,
            'email'        => $user->email,
            'bio'          => $user->bio,
            'gender'       => $user->gender ?? 'Male',
            'occupation'   => $user->occupation ?? 'Student',
        ]
    ]);
}

    public function uploadProfilePhoto(Request $request)
    {
        try {
            // Get user by token
            $bearerToken = $request->bearerToken();
            if (!$bearerToken) {
                return response()->json(['status' => 'error', 'pesan' => 'No token'], 401);
            }

            $hashedToken = hash('sha256', $bearerToken);
            $tokenRecord = Token::where('token', $hashedToken)->first();
            if (!$tokenRecord) {
                return response()->json(['status' => 'error', 'pesan' => 'Invalid token'], 401);
            }

            $user = User::where('_id', $tokenRecord->user_id)->first();
            if (!$user) {
                return response()->json(['status' => 'error', 'pesan' => 'User not found'], 401);
            }

            // Validate request has file
            if (!$request->hasFile('photo')) {
                return response()->json(['status' => 'error', 'pesan' => 'No file'], 400);
            }

            $file = $request->file('photo');
            
            // Validate file
            if (!$file || !$file->isValid()) {
                return response()->json(['status' => 'error', 'pesan' => 'Invalid file'], 400);
            }

            // Check size: max 5MB
            $size = $file->getSize();
            if ($size > 5242880) {
                return response()->json(['status' => 'error', 'pesan' => 'File too large'], 400);
            }

            // Check mime type
            $mime = $file->getMimeType();
            if (!in_array($mime, ['image/jpeg', 'image/png', 'image/gif'])) {
                return response()->json(['status' => 'error', 'pesan' => 'Invalid format'], 400);
            }

            // Ensure profile-photos directory exists
            $dir = storage_path('app/public/profile-photos');
            if (!is_dir($dir)) {
                mkdir($dir, 0777, true);
            }

            // Store file
            $filename = 'profile_' . $user->_id . '_' . time() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('profile-photos', $filename, 'public');
            
            if (!$path) {
                return response()->json(['status' => 'error', 'pesan' => 'Storage failed'], 500);
            }

            // Update user database
            $user->photo = str_replace('\\', '/', $path);
            $user->save();

            // Build full URL
            $url = url('/storage/' . str_replace('\\', '/', $path));

            return response()->json([
                'status' => 'success',
                'pesan' => 'Upload success',
                'data' => [
                    'photo_url' => $url,
                    'photo_path' => $path
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Profile upload error: ' . $e->getMessage() . ' | Trace: ' . $e->getTraceAsString());
            return response()->json([
                'status' => 'error',
                'pesan' => 'Upload failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Step 1: Verifikasi apakah email terdaftar di database
     * Route: POST /api/forgot-password/verify
     */
    public function resetPasswordVerify(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'pesan' => 'Email tidak terdaftar di sistem kami.'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'pesan' => 'Email ditemukan. Silakan buat password baru.',
            'email_verified' => true,
        ]);
    }

    /**
     * Step 2: Reset password setelah email terverifikasi
     * Route: POST /api/forgot-password/reset
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'pesan' => 'Email tidak ditemukan.'
            ], 404);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        return response()->json([
            'status' => 'success',
            'pesan' => 'Password berhasil direset. Silakan login dengan password baru.',
        ]);
    }
}