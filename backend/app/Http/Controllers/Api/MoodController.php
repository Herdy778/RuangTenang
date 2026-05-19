<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Mood;
use App\Models\Journal;
use App\Models\RelaxationSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MoodController extends Controller
{
    // Helper ambil userId dari auth_user yang disimpan middleware
    private function getUserId(Request $request): string
    {
        $user = $request->attributes->get('auth_user');

        if (!$user) {
            throw new \Exception('User tidak ditemukan di request');
        }

        $attrs = $user->getAttributes();
        $id    = $attrs['_id'] ?? $user->getKey();

        if ($id instanceof \MongoDB\BSON\ObjectId) {
            return (string) $id;
        }
        if (is_object($id) && method_exists($id, '__toString')) {
            return (string) $id;
        }
        if (is_string($id) && !empty($id)) {
            return $id;
        }

        throw new \Exception('User ID tidak valid');
    }

    public function index()
    {
        try {
            $moods = Mood::latest()->take(7)->get();

            return response()->json([
                'success' => true,
                'message' => 'Data mood berhasil diambil.',
                'data'    => $moods,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data mood: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function dashboardStats(Request $request)
    {
        try {
            $userId = $this->getUserId($request);

            $totalJurnal = Journal::where('user_id', $userId)->count();

            $allMoods    = Mood::where('user_id', $userId)->get();
            $moodDominan = 'Netral';
            if ($allMoods->isNotEmpty()) {
                $moodDominan = $allMoods->countBy('mood')->sortDesc()->keys()->first();
            }

            $sesiRelaksasi = RelaxationSession::where('user_id', $userId)->count();

            return response()->json([
                'status' => 'success',
                'data'   => [
                    'total_jurnal'   => $totalJurnal,
                    'mood_dominan'   => $moodDominan,
                    'sesi_relaksasi' => $sesiRelaksasi,
                ],
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Gagal mengambil data dashboard: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'mood'    => 'required|string',
                'score'   => 'required|integer|min:1|max:5',
                'catatan' => 'nullable|string',
            ]);

            $userId = $this->getUserId($request);

            $mood          = new Mood();
            $mood->user_id = $userId;
            $mood->mood    = $validated['mood'];
            $mood->score   = $validated['score'];
            $mood->catatan = $validated['catatan'] ?? '';
            $mood->tanggal = now();
            $mood->save();

            return response()->json([
                'success' => true,
                'message' => 'Mood berhasil disimpan.',
                'data'    => $mood,
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan mood: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function storeRelaxation(Request $request)
    {
        try {
            $validated = $request->validate([
                'activity_name' => 'required|string',
                'duration'      => 'required|integer|min:1',
            ]);

            $userId = $this->getUserId($request);

            $session                  = new RelaxationSession();
            $session->user_id         = $userId;
            $session->jenis_relaksasi = $validated['activity_name'];
            $session->durasi_menit    = $validated['duration'];
            $session->tanggal         = now();
            $session->save();

            return response()->json([
                'success' => true,
                'message' => 'Sesi relaksasi berhasil dicatat!',
                'data'    => $session,
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Sistem gagal menyimpan durasi sesi: ' . $e->getMessage(),
            ], 500);
        }
    }
}