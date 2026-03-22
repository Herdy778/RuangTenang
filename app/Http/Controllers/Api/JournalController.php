<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Journal;
use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;

class JournalController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'teks_curhat' => 'required|string'
        ]);

        $curhatan = $request->teks_curhat;

        $apiKey = env('GEMINI_API_KEY');
        if (!$apiKey || $apiKey === 'masukkan_api_key_kamu_disini') {
            return response()->json([
                'status' => 'error',
                'pesan' => 'API Key Gemini belum diisi di file .env!'
            ], 500);
        }

        $prompt = "Kamu adalah psikolog. Analisis teks berikut dan tentukan kategori emosi utamanya. " .
                  "Balas HANYA dengan SALAH SATU kata ini tanpa tanda baca tambahan: " .
                  "Burnout, Cemas, Sedih, Netral, atau Krisis. \n\n" .
                  "Teks: \"" . $curhatan . "\"";

        $geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' . trim($apiKey);

        try {
            $response = Http::post($geminiUrl, [
                'contents' => [['parts' => [['text' => $prompt]]]]
            ]);

            if ($response->failed()) {
                return response()->json([
                    'status' => 'error',
                    'pesan' => 'Gagal menghubungi Gemini: ' . $response->body()
                ], 500);
            }

            $aiResult = $response->json();
            $hasilMood = trim($aiResult['candidates'][0]['content']['parts'][0]['text'] ?? 'Netral');
            $hasilMood = preg_replace('/[^a-zA-Z]/', '', $hasilMood);

            $userId = DB::connection('mongodb')
                ->collection('users')
                ->where('email', $request->auth_user->email)
                ->value('_id');

            $journal = Journal::create([
                'user_id'     => (string) $userId,
                'teks_curhat' => $curhatan,
                'hasil_mood'  => $hasilMood,
                'tanggal'     => now()
            ]);

            $semuaArtikel = Article::where('kategori_tag', $hasilMood)->get();
            $jumlahAmbil = min(3, $semuaArtikel->count());
            $rekomendasiArtikel = $jumlahAmbil > 0 ? $semuaArtikel->random($jumlahAmbil)->values() : [];

            return response()->json([
                'status'              => 'success',
                'pesan'               => 'Jurnal berhasil dianalisis!',
                'mood_terdeteksi'     => $hasilMood,
                'data_jurnal'         => $journal,
                'rekomendasi_artikel' => $rekomendasiArtikel
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'pesan'  => 'Terjadi kesalahan sistem: ' . $e->getMessage()
            ], 500);
        }
    }

    public function index(Request $request)
    {
        $userId = DB::connection('mongodb')
            ->collection('users')
            ->where('email', $request->auth_user->email)
            ->value('_id');

        $journals = Journal::where('user_id', (string) $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data'   => $journals
        ]);
    }
}
