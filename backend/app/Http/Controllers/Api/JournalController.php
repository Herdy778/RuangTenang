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

        $apiKey = env('GROQ_API_KEY');
        if (!$apiKey) {
            return response()->json([
                'status' => 'error',
                'pesan' => 'API Key Groq belum diisi di file .env!'
            ], 500);
        }

        $prompt = "Kamu adalah psikolog. Analisis teks berikut dan tentukan kategori emosi utamanya. " .
            "Balas HANYA dengan SALAH SATU kata ini tanpa tanda baca tambahan: " .
            "Burnout, Cemas, Sedih, Netral, atau Krisis. \n\n" .
            "Teks: \"" . $curhatan . "\"";

        try {
            $response = Http::timeout(30)->withHeaders([
                'Authorization' => 'Bearer ' . trim($apiKey),
                'Content-Type'  => 'application/json',
            ])->post('https://api.groq.com/openai/v1/chat/completions', [
                'model'    => 'llama-3.3-70b-versatile',
                'messages' => [
                    ['role' => 'user', 'content' => $prompt]
                ],
                'max_tokens'  => 10,
                'temperature' => 0,
            ]);

            if ($response->failed()) {
                $errorData = json_decode($response->body(), true);
                if (isset($errorData['error']['code']) && $errorData['error']['code'] == 503) {
                    $pesan = 'Gagal menghubungi Groq: Server AI sedang penuh (High Demand). Silakan coba lagi dalam beberapa saat.';
                } else {
                    $pesan = 'Gagal menghubungi Groq: ' . $response->body();
                }
                return response()->json([
                    'status' => 'error',
                    'pesan' => $pesan
                ], 500);
            }

            $aiResult  = $response->json();
            $hasilMood = trim($aiResult['choices'][0]['message']['content'] ?? 'Netral');
            $hasilMood = preg_replace('/[^a-zA-Z]/', '', $hasilMood);

            $userId = DB::connection('mongodb')
                ->collection('users')
                ->where('email', $request->auth_user->email)
                ->value('_id');

            $journal = Journal::create([
                'user_id'     => (string)$userId,
                'teks_curhat' => $curhatan,
                'hasil_mood'  => $hasilMood,
                'tanggal'     => now(),
                'status'      => 'normal' // ✅ DEFAULT
            ]);

            $semuaArtikel       = Article::where('kategori_tag', $hasilMood)->get();
            $jumlahAmbil        = min(3, $semuaArtikel->count());
            $rekomendasiArtikel = $jumlahAmbil > 0
                ? $semuaArtikel->random($jumlahAmbil)->values()
                : [];

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

        $journals = Journal::where('user_id', (string)$userId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data'   => $journals
        ]);
    }

    // =========================
    // ADMIN LIHAT SEMUA JURNAL
    // =========================
    public function adminJournals()
    {
        $journals = Journal::orderBy('created_at', 'desc')->get();

        return response()->json([
            'status' => 'success',
            'data' => $journals
        ]);
    }

    // =========================
    // ADMIN DELETE JURNAL
    // =========================
    public function deleteJournal($id)
    {
        $journal = Journal::where('_id', $id)->first();

        if (!$journal) {
            return response()->json([
                'status' => 'error',
                'pesan' => 'Jurnal tidak ditemukan'
            ], 404);
        }

        $journal->delete();

        return response()->json([
            'status' => 'success',
            'pesan' => 'Jurnal berhasil dihapus'
        ]);
    }

    // =========================
    // ✅ UPDATE STATUS (FITUR BARU)
    // =========================
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:normal,perhatian,darurat'
        ]);

        $journal = Journal::where('_id', $id)->first();

        if (!$journal) {
            return response()->json([
                'status' => 'error',
                'pesan' => 'Jurnal tidak ditemukan'
            ], 404);
        }

        $journal->status = $request->status;
        $journal->save();

        return response()->json([
            'status' => 'success',
            'pesan' => 'Status berhasil diupdate',
            'data'  => $journal
        ]);
    }

    public function tesAi(Request $request)
    {
        $userMessage = $request->input('message', '');

        $apiKey = env('GROQ_API_KEY');
        if (!$apiKey) {
            return response()->json([
                'reply' => 'Maaf, layanan AI sedang tidak tersedia. API Key belum dikonfigurasi.'
            ], 500);
        }

        try {
            $response = Http::timeout(30)->withHeaders([
                'Authorization' => 'Bearer ' . trim($apiKey),
                'Content-Type'  => 'application/json',
            ])->post('https://api.groq.com/openai/v1/chat/completions', [
                'model'    => 'llama-3.3-70b-versatile',
                'messages' => [
                    [
                        'role'    => 'system',
                        'content' => "Kamu adalah asisten psikologi bernama RuangTenang..."
                    ],
                    [
                        'role'    => 'user',
                        'content' => $userMessage
                    ]
                ],
                'max_tokens'  => 1024,
                'temperature' => 0.7,
            ]);

            if ($response->failed()) {
                return response()->json([
                    'reply' => 'Maaf, saya sedang mengalami gangguan koneksi.'
                ], 500);
            }

            $aiResult    = $response->json();
            $hasilTeksAI = trim(
                $aiResult['choices'][0]['message']['content']
                ?? 'Maaf, saya tidak dapat memproses pesanmu saat ini.'
            );

            return response()->json([
                'reply' => $hasilTeksAI
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'reply' => 'Maaf, terjadi kesalahan pada sistem AI.'
            ], 500);
        }
    }

    public function analyzeMentalHealth(Request $request)
    {
        // 1. Ambil semua data inputan dari user (Flutter)
        $dataUser = $request->all();

        try {
            // 2. Kirim ke Flask ML Service
            $response = Http::post('http://127.0.0.1:5000/predict', $dataUser);

            if ($response->successful()) {
                $hasilPrediksi = $response->json();

                // 3. Simpan jurnal ke MongoDB
                $userId = null;
                if ($request->auth_user) {
                    $userId = DB::connection('mongodb')
                        ->collection('users')
                        ->where('email', $request->auth_user->email)
                        ->value('_id');
                }

                $kategori  = $hasilPrediksi['prediction'] ?? 'Minimal'; // Minimal/Ringan/Sedang/Berat
                $skorTotal = $hasilPrediksi['skor_total'] ?? 0;

                // Mapping kategori ke hasil_mood (konsisten dengan jurnal teks)
                $moodMap = [
                    'Minimal' => 'Netral',
                    'Ringan'  => 'Cemas',
                    'Sedang'  => 'Cemas',
                    'Berat'   => 'Krisis',
                ];

                Journal::create([
                    'user_id'                 => (string) $userId,
                    'teks_curhat'             => $request->input('teks_curhat', ''),
                    'hasil_mood'              => $moodMap[$kategori] ?? 'Netral',
                    'kategori_phq'            => $kategori,
                    'skor_phq'                => $skorTotal,
                    'perasaan_sedih'          => (int) $request->input('perasaan_sedih', 0),
                    'minat_kegiatan'          => (int) $request->input('minat_kegiatan', 0),
                    'kualitas_tidur'          => (int) $request->input('kualitas_tidur', 0),
                    'tingkat_lelah'           => (int) $request->input('tingkat_lelah', 0),
                    'kesulitan_konsentrasi'   => (int) $request->input('kesulitan_konsentrasi', 0),
                    'tanggal'                 => now(),
                    'status'                  => 'normal',
                ]);

                return response()->json([
                    'status'  => 'success',
                    'message' => 'Analisis berhasil dilakukan via AI',
                    'data'    => $hasilPrediksi,
                ], 200);
            }

            return response()->json([
                'status'  => 'error',
                'message' => 'Gagal mendapatkan analisis dari AI'
            ], 500);

        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Koneksi ke server AI terputus. Pastikan Flask menyala. Error: ' . $e->getMessage()
            ], 500);
        }
    }
}