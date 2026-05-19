<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use MongoDB\BSON\ObjectId;

class AuthController extends Controller
{
    // =========================
    // HELPER: Konversi ObjectId / berbagai tipe ke string
    // =========================
    private function toStringId($id): string
    {
        if ($id instanceof ObjectId) {
            return (string) $id;
        }
        if (is_object($id) && method_exists($id, '__toString')) {
            return (string) $id;
        }
        if (is_array($id) && isset($id['$oid'])) {
            return (string) $id['$oid'];
        }
        if (is_string($id) && !empty($id)) {
            return $id;
        }
        throw new \Exception('ID tidak valid: ' . gettype($id));
    }

    // =========================
    // HELPER: Buat token baru untuk user
    // Pakai DB langsung agar tidak OOM
    // =========================
    private function makeToken(string $userId): string
    {
        $plainToken = bin2hex(random_bytes(32));
        $hashed     = hash('sha256', $plainToken);

        // Hapus token lama pakai DB langsung (bukan Eloquent)
        DB::connection('mongodb')
            ->collection('tokens')
            ->where('user_id', $userId)
            ->delete();

        // Insert token baru pakai DB langsung
        DB::connection('mongodb')->collection('tokens')->insert([
            'user_id'      => $userId,
            'token'        => $hashed,
            'name'         => 'auth_token',
            'last_used_at' => now()->toDateTimeString(),
            'created_at'   => now()->toDateTimeString(),
            'updated_at'   => now()->toDateTimeString(),
        ]);

        return $plainToken;
    }

    // =========================
    // REGISTER
    // =========================
    public function register(Request $request)
    {
        try {
            $request->validate([
                'nama_lengkap' => 'required|string',
                'email'        => 'required|email',
                'password'     => 'required|string|min:6',
            ]);

            $email = strtolower(trim($request->email));

            // count() aman di MongoDB, exists() tidak
            if (DB::connection('mongodb')->collection('users')->where('email', $email)->count() > 0) {
                return response()->json([
                    'status' => 'error',
                    'pesan'  => 'Email sudah terdaftar.',
                ], 422);
            }

            // Generate ObjectId manual agar kita punya ID sebelum insert
            $newId = new ObjectId();
            $now   = now()->toDateTimeString();

            DB::connection('mongodb')->collection('users')->insert([
                '_id'          => $newId,
                'nama_lengkap' => trim($request->nama_lengkap),
                'email'        => $email,
                'password'     => Hash::make($request->password),
                'role'         => 'mahasiswa',
                'gender'       => 'Male',
                'occupation'   => 'Student',
                'bio'          => '',
                'created_at'   => $now,
                'updated_at'   => $now,
            ]);

            $userId = (string) $newId;
            $token  = $this->makeToken($userId);

            return response()->json([
                'status' => 'success',
                'pesan'  => 'Registrasi berhasil',
                'token'  => $token,
                'data'   => [
                    '_id'          => $userId,
                    'nama_lengkap' => trim($request->nama_lengkap),
                    'email'        => $email,
                    'role'         => 'mahasiswa',
                    'gender'       => 'Male',
                    'occupation'   => 'Student',
                    'bio'          => '',
                ],
            ], 201);

        } catch (\Exception $e) {
            Log::error('REGISTER ERROR: ' . $e->getMessage());
            Log::error('REGISTER TRACE: ' . $e->getTraceAsString());

            return response()->json([
                'status' => 'error',
                'pesan'  => 'Registrasi gagal: ' . $e->getMessage(),
            ], 500);
        }
    }

    // =========================
    // LOGIN
    // =========================
    public function login(Request $request)
    {
        try {
            $request->validate([
                'email'    => 'required|email',
                'password' => 'required|string',
            ]);

            $email = strtolower(trim($request->email));
            $user  = User::where('email', $email)->first();

            if (!$user || !Hash::check($request->password, $user->password)) {
                return response()->json([
                    'status' => 'error',
                    'pesan'  => 'Email atau Password salah!',
                ], 401);
            }

            // Ambil ID dari raw attributes agar tidak kena bug Builder
            $attrs  = $user->getAttributes();
            $rawId  = $attrs['_id'] ?? $user->getKey();
            $userId = $this->toStringId($rawId);
            $token  = $this->makeToken($userId);

            return response()->json([
                'status' => 'success',
                'pesan'  => 'Login berhasil',
                'token'  => $token,
                'data'   => [
                    '_id'          => $userId,
                    'nama_lengkap' => $user->nama_lengkap,
                    'email'        => $user->email,
                    'role'         => $user->role,
                    'gender'       => $user->gender     ?? 'Male',
                    'occupation'   => $user->occupation ?? 'Student',
                    'bio'          => $user->bio        ?? '',
                    'photo'        => $user->photo      ?? null,
                ],
            ], 200);

        } catch (\Exception $e) {
            Log::error('LOGIN ERROR: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'pesan'  => 'Login gagal: ' . $e->getMessage(),
            ], 500);
        }
    }

    // =========================
    // PROFILE
    // =========================
    public function profile(Request $request)
    {
        $user = $request->attributes->get('auth_user');

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'pesan'  => 'User tidak ditemukan',
            ], 401);
        }

        return response()->json([
            'status' => 'success',
            'user'   => $user,
        ]);
    }

    // =========================
    // LOGOUT
    // =========================
    public function logout(Request $request)
    {
        $bearerToken = $request->bearerToken();

        if (!$bearerToken) {
            return response()->json([
                'status' => 'error',
                'pesan'  => 'Token tidak ditemukan',
            ], 401);
        }

        DB::connection('mongodb')
            ->collection('tokens')
            ->where('token', hash('sha256', $bearerToken))
            ->delete();

        return response()->json([
            'status' => 'success',
            'pesan'  => 'Berhasil logout',
        ]);
    }

    // =========================
    // UPDATE PROFILE
    // =========================
    public function updateProfile(Request $request)
    {
        $user = $request->attributes->get('auth_user');

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'pesan'  => 'Sesi tidak valid. Silakan login kembali.',
            ], 401);
        }

        $request->validate([
            'nama_lengkap' => 'required|string',
            'email'        => 'required|email',
            'bio'          => 'nullable|string',
        ]);

        $user->nama_lengkap = $request->nama_lengkap;
        $user->email        = strtolower(trim($request->email));
        $user->bio          = $request->bio ?? '';

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
                'bio'          => $user->bio        ?? '',
                'gender'       => $user->gender     ?? 'Male',
                'occupation'   => $user->occupation ?? 'Student',
            ],
        ]);
    }

    // =========================
    // UPLOAD FOTO PROFIL
    // =========================
    public function uploadProfilePhoto(Request $request)
    {
        try {
            $user = $request->attributes->get('auth_user');

            if (!$user) {
                return response()->json(['status' => 'error', 'pesan' => 'User tidak ditemukan'], 401);
            }

            if (!$request->hasFile('photo')) {
                return response()->json(['status' => 'error', 'pesan' => 'No file'], 400);
            }

            $file = $request->file('photo');

            if (!$file || !$file->isValid()) {
                return response()->json(['status' => 'error', 'pesan' => 'Invalid file'], 400);
            }

            if ($file->getSize() > 5242880) {
                return response()->json(['status' => 'error', 'pesan' => 'File too large max 5MB'], 400);
            }

            if (!in_array($file->getMimeType(), ['image/jpeg', 'image/png', 'image/gif'])) {
                return response()->json(['status' => 'error', 'pesan' => 'Invalid format'], 400);
            }

            $attrs    = $user->getAttributes();
            $rawId    = $attrs['_id'] ?? $user->getKey();
            $userId   = $this->toStringId($rawId);
            $filename = 'profile_' . $userId . '_' . time() . '.' . $file->getClientOriginalExtension();
            $path     = $file->storeAs('profile-photos', $filename, 'public');

            $user->photo = str_replace('\\', '/', $path);
            $user->save();

            return response()->json([
                'status' => 'success',
                'pesan'  => 'Upload success',
                'data'   => [
                    'photo_url'  => url('/storage/' . str_replace('\\', '/', $path)),
                    'photo_path' => $path,
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Profile upload error: ' . $e->getMessage());
            return response()->json(['status' => 'error', 'pesan' => 'Upload failed: ' . $e->getMessage()], 500);
        }
    }

    // =========================
    // ADMIN: SEMUA USER
    // =========================
    public function users()
    {
        $users = DB::connection('mongodb')
            ->collection('users')
            ->orderBy('_id', 'desc')
            ->get(['_id', 'nama_lengkap', 'email', 'role']);

        $formatted = collect($users)->map(function ($u) {
            return [
                '_id'          => isset($u['_id']) ? (string) $u['_id'] : '',
                'nama_lengkap' => $u['nama_lengkap'] ?? '',
                'email'        => $u['email'] ?? '',
                'role'         => $u['role'] ?? 'mahasiswa',
            ];
        });

        return response()->json([
            'status' => 'success',
            'data'   => $formatted,
        ]);
    }

    // =========================
    // ADMIN: UPDATE ROLE USER
    // =========================
    public function updateUser(Request $request, $id)
    {
        $updated = DB::connection('mongodb')
            ->collection('users')
            ->where('_id', new ObjectId($id))
            ->update(['role' => $request->role]);

        if (!$updated) {
            return response()->json(['status' => 'error', 'pesan' => 'User tidak ditemukan'], 404);
        }

        return response()->json(['status' => 'success', 'pesan' => 'Role berhasil diupdate']);
    }

    // =========================
    // ADMIN: DELETE USER
    // =========================
    public function deleteUser($id)
    {
        $user = DB::connection('mongodb')
            ->collection('users')
            ->where('_id', new ObjectId($id))
            ->first();

        if (!$user) {
            return response()->json(['status' => 'error', 'pesan' => 'User tidak ditemukan'], 404);
        }

        $userId = (string) $user['_id'];

        DB::connection('mongodb')->collection('tokens')->where('user_id', $userId)->delete();
        DB::connection('mongodb')->collection('users')->where('_id', new ObjectId($id))->delete();

        return response()->json(['status' => 'success', 'pesan' => 'User berhasil dihapus']);
    }
}