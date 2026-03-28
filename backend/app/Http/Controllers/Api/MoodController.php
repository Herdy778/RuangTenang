<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Mood;
use App\Models\Journal;
use App\Models\RelaxationSession;
use Illuminate\Http\Request;

class MoodController extends Controller
{
    /**
     * Mengambil data mood terbaru.
     * Mengambil 7 data terakhir.
     */
    public function index()
    {
        try {
            // Mengambil 7 data mood terbaru berdasarkan tanggal pembuatan
            $moods = Mood::latest()->take(7)->get();

            return response()->json([
                'success' => true,
                'message' => 'Data mood berhasil diambil.',
                'data'    => $moods
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data mood: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mengambil statistik untuk ditampilkan di Dashboard.
     */
    public function dashboardStats()
    {
        try {
            // Menghitung jumlah total jurnal
            $totalJurnal = Journal::count();
            
            // Mencari mood dominan menggunakan metode Collection untuk kompatibilitas MongoDB
            $allMoods = Mood::all();
            $moodDominan = 'Netral';

            if ($allMoods->isNotEmpty()) {
                $moodDominan = $allMoods->countBy('mood')->sortDesc()->keys()->first();
            }

            return response()->json([
                'status' => 'success',
                'data' => [
                    'total_jurnal' => $totalJurnal,
                    'mood_dominan' => $moodDominan,
                    'sesi_relaksasi' => RelaxationSession::count()
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil data dashboard: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Menyimpan data mood ke database.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'mood' => 'required|string',
                'score' => 'required|integer|min:1|max:5',
                'catatan' => 'nullable|string'
            ]);

            $mood = new Mood();
            $mood->user_id = 'user_dummy_123'; // Menggunakan user dummy / logic auth
            $mood->mood = $validated['mood'];
            $mood->score = $validated['score'];
            $mood->catatan = $validated['catatan'] ?? '';
            $mood->tanggal = now();
            $mood->save();

            return response()->json([
                'success' => true,
                'message' => 'Mood berhasil disimpan.',
                'data' => $mood
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan mood: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Menyimpan data log sesi relaksasi.
     */
    public function storeRelaxation(Request $request)
    {
        try {
            $validated = $request->validate([
                'activity_name' => 'required|string',
                'duration' => 'required|integer|min:1'
            ]);

            $session = new RelaxationSession();
            $session->user_id = 'user_dummy_123';
            $session->jenis_relaksasi = $validated['activity_name'];
            $session->durasi_menit = $validated['duration'];
            $session->tanggal = now();
            $session->save();

            return response()->json([
                'success' => true,
                'message' => 'Sesi relaksasi berhasil dicatat!',
                'data' => $session
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Sistem gagal menyimpan durasi sesi: ' . $e->getMessage()
            ], 500);
        }
    }
}
