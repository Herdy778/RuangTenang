<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Journal;
use App\Models\Article;
use App\Models\ChatMessage;
use App\Models\ArticleRecommendation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;

class JournalController extends Controller
{
    private function getAuthenticatedUserId(Request $request)
{
    if (!isset($request->auth_user) || !$request->auth_user) {
        throw new \Exception('Unauthorized: auth_user tidak ditemukan');
    }

    $userId = DB::connection('mongodb')
        ->collection('users')
        ->where('email', $request->auth_user->email)
        ->value('_id');

    if (!$userId) {
        throw new \Exception('User tidak ditemukan di database');
    }

    return (string) $userId;
}
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
                'Content-Type' => 'application/json',
            ])->post('https://api.groq.com/openai/v1/chat/completions', [
                        'model' => 'llama-3.3-70b-versatile',
                        'messages' => [
                            ['role' => 'user', 'content' => $prompt]
                        ],
                        'max_tokens' => 10,
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

            $aiResult = $response->json();
            $hasilMood = trim($aiResult['choices'][0]['message']['content'] ?? 'Netral');
            $hasilMood = preg_replace('/[^a-zA-Z]/', '', $hasilMood);

$userId = $this->getAuthenticatedUserId($request);

            $journal = Journal::create([
                'user_id' => $userId,
                'teks_curhat' => $curhatan,
                'hasil_mood' => $hasilMood,
                'tanggal' => now(),
                'status' => 'normal' // ✅ DEFAULT
            ]);

            $semuaArtikel = Article::where('kategori_tag', $hasilMood)->get();
            $jumlahAmbil = min(3, $semuaArtikel->count());
            $rekomendasiArtikel = $jumlahAmbil > 0
                ? $semuaArtikel->random($jumlahAmbil)->values()
                : [];

            return response()->json([
                'status' => 'success',
                'pesan' => 'Jurnal berhasil dianalisis!',
                'mood_terdeteksi' => $hasilMood,
                'data_jurnal' => $journal,
                'rekomendasi_artikel' => $rekomendasiArtikel
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'pesan' => 'Terjadi kesalahan sistem: ' . $e->getMessage()
            ], 500);
        }
    }

    public function index(Request $request)
    {
 $userId = $this->getAuthenticatedUserId($request);

        $journals = Journal::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $journals
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
// ADMIN AMBIL ARTIKEL REKOMENDASI
// =========================
public function recommendedArticles($id)
{
    $journal = Journal::where('_id', $id)->first();

    if (!$journal) {
        return response()->json([
            'status' => 'error',
            'message' => 'Jurnal tidak ditemukan'
        ], 404);
    }

    $mood = $journal->hasil_mood;

    $articles = Article::where(
        'kategori_tag',
        $mood
    )->limit(5)->get();

    return response()->json([
        'status' => 'success',
        'data' => $articles
    ]);
}


// =========================
// ADMIN KIRIM ARTIKEL KE USER
// =========================
public function sendRecommendedArticle(Request $request)
{
    $request->validate([
        'journal_id' => 'required',
        'article_id' => 'required'
    ]);

    $journal = Journal::where(
        '_id',
        $request->journal_id
    )->first();

    if (!$journal) {
        return response()->json([
            'status' => 'error',
            'message' => 'Jurnal tidak ditemukan'
        ], 404);
    }

    ArticleRecommendation::create([
        'user_id' => $journal->user_id,
        'journal_id' => $journal->_id,
        'article_id' => $request->article_id,
        'admin_id' => $request->auth_user->_id ?? null,
        'is_read' => false,
        'created_at' => now()
    ]);

    return response()->json([
        'status' => 'success',
        'message' => 'Artikel berhasil dikirim'
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
            'data' => $journal
        ]);
    }

    public function tesAi(Request $request)
{
    $userMessage = $request->input('message', '');

    if (empty(trim($userMessage))) {
        return response()->json([
            'reply' => 'Silakan tuliskan pesan terlebih dahulu 😊'
        ]);
    }

    // =========================
    // 🔍 AMBIL USER ID
    // =========================
$userId = $this->getAuthenticatedUserId($request);

    // =========================
    // 🔥 FILTER TOPIK
    // =========================
    $allowedKeywords = [
        'stres',
        'cemas',
        'depresi',
        'sedih',
        'overthinking',
        'mental',
        'emosi',
        'burnout',
        'trauma',
        'hubungan',
        'capek',
        'lelah',
        'bingung',
        'takut',
        'khawatir',
        'gelisah',
        'kesepian'
    ];

    $isValid = false;

    foreach ($allowedKeywords as $keyword) {
        if (str_contains(strtolower($userMessage), $keyword)) {
            $isValid = true;
            break;
        }
    }

    // =========================
    // ❌ TOPIK DI LUAR MENTAL HEALTH
    // =========================
    if (!$isValid) {

        $reply =
            'Sepertinya itu di luar topik kesehatan mental. '
            . 'Tapi kalau kamu ingin cerita tentang perasaanmu, aku siap mendengarkan 😊';

        // Simpan pesan user
        ChatMessage::create([
         'user_id' => $userId,
            'sender' => 'user',
            'message' => $userMessage,
        ]);

        // Simpan balasan AI
        ChatMessage::create([
'user_id' => $userId,
            'sender' => 'ai',
            'message' => $reply,
        ]);

        return response()->json([
            'reply' => $reply
        ]);
    }

    // =========================
    // 🔑 API KEY CHECK
    // =========================
    $apiKey = env('GROQ_API_KEY');

    if (!$apiKey) {
        return response()->json([
            'reply' => 'Maaf, layanan AI sedang tidak tersedia.'
        ], 500);
    }

    try {

        // =========================
        // 💾 SIMPAN CHAT USER
        // =========================
        ChatMessage::create([
          'user_id' => $userId,
            'sender' => 'user',
            'message' => $userMessage,
        ]);

        // =========================
        // 🧠 SYSTEM PROMPT
        // =========================
        $systemPrompt = "
Kamu adalah asisten psikologi bernama RuangTenang.

Tugasmu:
- Mendengarkan curhatan pengguna
- Memberikan dukungan emosional
- Membantu pengguna memahami perasaannya

Aturan:
- Hanya jawab topik kesehatan mental
- Jangan jawab topik di luar psikologi
- Jangan menghakimi pengguna
- Jangan memberikan diagnosis medis
- Gunakan bahasa hangat dan empatik
";

        // =========================
        // 🚀 HIT GROQ API
        // =========================
        $response = Http::timeout(30)->withHeaders([
            'Authorization' => 'Bearer ' . trim($apiKey),
            'Content-Type' => 'application/json',
        ])->post('https://api.groq.com/openai/v1/chat/completions', [
            'model' => 'llama-3.3-70b-versatile',
            'messages' => [
                [
                    'role' => 'system',
                    'content' => $systemPrompt
                ],
                [
                    'role' => 'user',
                    'content' => $userMessage
                ]
            ],
            'max_tokens' => 1024,
            'temperature' => 0.7,
        ]);

        // =========================
        // ❌ HANDLE ERROR
        // =========================
        if ($response->failed()) {

            $reply =
                'Maaf, saya sedang mengalami gangguan koneksi. '
                . 'Coba lagi ya 🙏';

            // Simpan error response
            ChatMessage::create([
              'user_id' => $userId,
                'sender' => 'ai',
                'message' => $reply,
            ]);

            return response()->json([
                'reply' => $reply
            ], 500);
        }

        // =========================
        // ✅ HASIL AI
        // =========================
        $aiResult = $response->json();

        $hasilTeksAI = trim(
            $aiResult['choices'][0]['message']['content']
            ?? 'Maaf, saya tidak dapat memproses pesanmu saat ini.'
        );

        // =========================
        // 💾 SIMPAN BALASAN AI
        // =========================
        ChatMessage::create([
          'user_id' => $userId,
            'sender' => 'ai',
            'message' => $hasilTeksAI,
        ]);

        return response()->json([
            'reply' => $hasilTeksAI
        ]);

    } catch (\Exception $e) {

        $reply = 'Maaf, terjadi kesalahan pada sistem AI.';

        ChatMessage::create([
           'user_id' => $userId,
            'sender' => 'ai',
            'message' => $reply,
        ]);

        return response()->json([
            'reply' => $reply
        ], 500);
    }
}

public function getChatHistory(Request $request)
{
    $userId = $this->getAuthenticatedUserId($request);

    $messages = ChatMessage::where('user_id', $userId)
    ->orderBy('created_at', 'asc')
    ->get();

    return response()->json([
        'status' => 'success',
        'data' => $messages
    ]);
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
                $userId = $this->getAuthenticatedUserId($request);

                $kategoriML = $hasilPrediksi['prediction'] ?? 'Minimal';
                $skorTotal = $hasilPrediksi['skor_total'] ?? 0;
                $teksCurhat = $request->input('teks_curhat', '');

                // ==========================================
                // 🔥 DUAL-CHECK (MAX SEVERITY) LOGIC
                // ==========================================
                $kategoriGroq = 'Netral';
                $apiKey = env('GROQ_API_KEY');

                if (!empty(trim($teksCurhat)) && $apiKey) {
                    $prompt = "Kamu adalah psikolog. Analisis teks berikut dan tentukan kategori emosi utamanya. " .
                        "Balas HANYA dengan SALAH SATU kata ini tanpa tanda baca tambahan: " .
                        "Burnout, Cemas, Sedih, Netral, atau Krisis. \n\n" .
                        "Teks: \"" . $teksCurhat . "\"";

                    try {
                        // Timeout lebih cepat (10 detik) agar tidak memblokir user terlalu lama
                        $groqResponse = Http::timeout(10)->withHeaders([
                            'Authorization' => 'Bearer ' . trim($apiKey),
                            'Content-Type' => 'application/json',
                        ])->post('https://api.groq.com/openai/v1/chat/completions', [
                                    'model' => 'llama-3.3-70b-versatile',
                                    'messages' => [['role' => 'user', 'content' => $prompt]],
                                    'max_tokens' => 10,
                                    'temperature' => 0,
                                ]);

                        if ($groqResponse->successful()) {
                            $aiResult = $groqResponse->json();
                            $kategoriGroq = trim($aiResult['choices'][0]['message']['content'] ?? 'Netral');
                            $kategoriGroq = preg_replace('/[^a-zA-Z]/', '', $kategoriGroq);
                        }
                    } catch (\Exception $e) {
                        \Log::warning('Groq API fail in Dual-Check: ' . $e->getMessage());
                    }
                }

                // 1. Skala Keparahan ML (Angka)
                $mlSeverityMap = ['Minimal' => 1, 'Ringan' => 2, 'Sedang' => 3, 'Berat' => 4];
                $mlSeverity = $mlSeverityMap[$kategoriML] ?? 1;

                // 2. Skala Keparahan Groq (Teks)
                $groqSeverityMap = ['Netral' => 1, 'Sedih' => 2, 'Cemas' => 3, 'Burnout' => 3, 'Krisis' => 4];
                $groqSeverity = $groqSeverityMap[$kategoriGroq] ?? 1;

                // 3. Ambil nilai yang Paling Parah (Max Severity)
                $maxSeverity = max($mlSeverity, $groqSeverity);

                // 4. Ubah kembali ke Kategori PHQ Final
                $severityToCategory = [1 => 'Minimal', 2 => 'Ringan', 3 => 'Sedang', 4 => 'Berat'];
                $kategoriFinal = $severityToCategory[$maxSeverity] ?? 'Minimal';

                // 5. Tandai jika terjadi override oleh AI Teks
                $isOverridden = ($maxSeverity > $mlSeverity);
                $hasilPrediksi['prediction'] = $kategoriFinal;
                $hasilPrediksi['override_by_text'] = $isOverridden;
                $hasilPrediksi['groq_sentiment'] = $kategoriGroq;

                if ($isOverridden) {
                    $hasilPrediksi['message'] = 'Kondisimu memerlukan perhatian khusus. Berdasarkan ceritamu, kamu tidak harus menghadapi ini sendirian.';
                }

                // Mapping kategori ke hasil_mood (konsisten dengan jurnal teks)
                $moodMap = [
                    'Minimal' => 'Netral',
                    'Ringan' => 'Cemas',
                    'Sedang' => 'Cemas',
                    'Berat' => 'Krisis',
                ];
                // ==========================================

                Journal::create([
                  'user_id' => $userId,
                    'teks_curhat' => $teksCurhat,
                    'hasil_mood' => $moodMap[$kategoriFinal] ?? 'Netral',
                    'kategori_phq' => $kategoriFinal,
                    'skor_phq' => $skorTotal,
                    'perasaan_sedih' => (int) $request->input('perasaan_sedih', 0),
                    'minat_kegiatan' => (int) $request->input('minat_kegiatan', 0),
                    'kualitas_tidur' => (int) $request->input('kualitas_tidur', 0),
                    'tingkat_lelah' => (int) $request->input('tingkat_lelah', 0),
                    'kesulitan_konsentrasi' => (int) $request->input('kesulitan_konsentrasi', 0),
                    'tanggal' => now(),
                    'status' => 'normal',
                ]);

                return response()->json([
                    'status' => 'success',
                    'message' => 'Analisis berhasil dilakukan via AI',
                    'data' => $hasilPrediksi,
                ], 200);
            }

            \Log::error('Flask error response: ' . $response->body());
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mendapatkan analisis dari AI'
            ], 500);

        } catch (\Exception $e) {
            \Log::error('Error in analyzeMentalHealth: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json([
                'status' => 'error',
                'message' => 'Koneksi ke server AI terputus. Pastikan Flask menyala. Error: ' . $e->getMessage()
            ], 500);
        }
    }
}