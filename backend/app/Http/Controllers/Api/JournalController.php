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
    // =========================
    // HELPER: Ambil userId dari request->attributes (set oleh TokenAuth)
    // FIX: Pakai $request->attributes->get('auth_user') bukan $request->auth_user
    // karena middleware menyimpan Eloquent object via attributes->set(), bukan merge()
    // =========================
    private function getAuthenticatedUserId(Request $request)
    {
        $authUser = $request->attributes->get('auth_user');

        if (empty($authUser) || empty($authUser->email)) {
            throw new \Exception('Unauthorized: sesi tidak valid atau token expired.', 401);
        }

        $userId = DB::connection('mongodb')
            ->collection('users')
            ->where('email', $authUser->email)
            ->value('_id');

        if (!$userId) {
            throw new \Exception('User tidak ditemukan di database.', 404);
        }

        return (string) $userId;
    }

    // =========================
    // HELPER: Return JSON 401 yang konsisten
    // Field 'reply' disertakan agar ChatPage Flutter bisa langsung tampilkan pesan
    // =========================
    private function unauthorizedResponse(string $pesan = 'Sesi tidak valid. Silakan login kembali.')
    {
        return response()->json([
            'status' => 'error',
            'reply'  => $pesan,
            'pesan'  => $pesan,
        ], 401);
    }

    // =========================
    // STORE JURNAL (User)
    // =========================
    public function store(Request $request)
    {
        $request->validate([
            'teks_curhat' => 'required|string'
        ]);

        try {
            $userId = $this->getAuthenticatedUserId($request);
        } catch (\Exception $e) {
            return $this->unauthorizedResponse($e->getMessage());
        }

        $curhatan = $request->teks_curhat;

        $apiKey = env('GROQ_API_KEY');
        if (!$apiKey) {
            return response()->json([
                'status' => 'error',
                'pesan'  => 'API Key Groq belum diisi di file .env!'
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
                $pesan = isset($errorData['error']['code']) && $errorData['error']['code'] == 503
                    ? 'Gagal menghubungi Groq: Server AI sedang penuh. Coba lagi sebentar.'
                    : 'Gagal menghubungi Groq: ' . $response->body();

                return response()->json(['status' => 'error', 'pesan' => $pesan], 500);
            }

            $aiResult  = $response->json();
            $hasilMood = trim($aiResult['choices'][0]['message']['content'] ?? 'Netral');
            $hasilMood = preg_replace('/[^a-zA-Z]/', '', $hasilMood);

            $journal = Journal::create([
                'user_id'    => $userId,
                'teks_curhat' => $curhatan,
                'hasil_mood' => $hasilMood,
                'tanggal'    => now(),
                'status'     => 'normal'
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

    // =========================
    // INDEX JURNAL (User)
    // =========================
    public function index(Request $request)
    {
        try {
            $userId = $this->getAuthenticatedUserId($request);
        } catch (\Exception $e) {
            return $this->unauthorizedResponse($e->getMessage());
        }

        $journals = Journal::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data'   => $journals
        ]);
    }

    // =========================
    // ADMIN LIHAT SEMUA JURNAL (DENGAN NAMA USER)
    // =========================
    public function adminJournals()
    {
        try {
            $journals          = Journal::orderBy('created_at', 'desc')->get();
            $formattedJournals = [];

            foreach ($journals as $journal) {
                $user = DB::connection('mongodb')
                    ->collection('users')
                    ->where('_id', $journal->user_id)
                    ->first();

                $userName = $user['nama_lengkap'] ?? 'User Tidak Diketahui';

                $formattedJournals[] = [
                    '_id'         => (string) $journal->_id,
                    'teks_curhat' => $journal->teks_curhat,
                    'hasil_mood'  => $journal->hasil_mood,
                    'status'      => $journal->status,
                    'created_at'  => $journal->created_at,
                    'tanggal'     => $journal->tanggal,
                    'user_nama'   => $userName,
                ];
            }

            return response()->json([
                'status' => 'success',
                'data'   => $formattedJournals
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Gagal memuat data jurnal: ' . $e->getMessage()
            ], 500);
        }
    }

    // =========================
    // ADMIN AMBIL ARTIKEL REKOMENDASI BERDASARKAN MOOD JURNAL
    // =========================
    public function recommendedArticles($id)
    {
        try {
            $journal = Journal::where('_id', $id)->first();

            if (!$journal) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Jurnal tidak ditemukan'
                ], 404);
            }

            $mood            = $journal->hasil_mood;
            $sudahDikirimIds = ArticleRecommendation::where('journal_id', (string) $journal->_id)
                ->pluck('article_id')
                ->map(fn($id) => (string) $id)
                ->toArray();

            $articles           = Article::where('kategori_tag', $mood)->limit(5)->get();
            $articlesWithStatus = $articles->map(function ($article) use ($sudahDikirimIds) {
                $articleArr                  = $article->toArray();
                $articleArr['sudah_dikirim'] = in_array((string) $article->_id, $sudahDikirimIds);
                return $articleArr;
            });

            return response()->json([
                'status' => 'success',
                'data'   => $articlesWithStatus
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Gagal memuat artikel: ' . $e->getMessage()
            ], 500);
        }
    }

    // =========================
    // ADMIN KIRIM ARTIKEL KE USER
    // =========================
    public function sendRecommendedArticle(Request $request)
    {
        try {
            $request->validate([
                'journal_id' => 'required',
                'article_id' => 'required'
            ]);

            $journal = Journal::where('_id', $request->journal_id)->first();
            if (!$journal) {
                return response()->json(['status' => 'error', 'message' => 'Jurnal tidak ditemukan'], 404);
            }

            $article = Article::where('_id', $request->article_id)->first();
            if (!$article) {
                return response()->json(['status' => 'error', 'message' => 'Artikel tidak ditemukan'], 404);
            }

            $sudahDikirim = ArticleRecommendation::where('journal_id', (string) $journal->_id)
                ->where('article_id', (string) $request->article_id)
                ->exists();

            if ($sudahDikirim) {
                return response()->json([
                    'status'        => 'duplicate',
                    'message'       => 'Artikel "' . $article->judul_artikel . '" sudah pernah dikirim ke user ini untuk jurnal tersebut.',
                    'artikel_judul' => $article->judul_artikel,
                    'sudah_dikirim' => true,
                ], 409);
            }

            // FIX: Pakai attributes->get() untuk ambil auth_user admin
            $adminId  = null;
            $authUser = $request->attributes->get('auth_user');
            if ($authUser && !empty($authUser->email)) {
                $adminId = DB::connection('mongodb')
                    ->collection('users')
                    ->where('email', $authUser->email)
                    ->value('_id');
                $adminId = $adminId ? (string) $adminId : null;
            }

            ArticleRecommendation::create([
                'user_id'    => (string) $journal->user_id,
                'journal_id' => (string) $journal->_id,
                'article_id' => (string) $request->article_id,
                'admin_id'   => $adminId,
                'is_read'    => false,
                'created_at' => now(),
            ]);

            return response()->json([
                'status'        => 'success',
                'message'       => 'Artikel "' . $article->judul_artikel . '" berhasil dikirim ke user.',
                'artikel_judul' => $article->judul_artikel,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Gagal mengirim artikel: ' . $e->getMessage(),
                'line'    => $e->getLine(),
                'file'    => $e->getFile(),
            ], 500);
        }
    }

    // =========================
    // ADMIN DELETE JURNAL
    // =========================
    public function deleteJournal($id)
    {
        try {
            $journal = Journal::where('_id', $id)->first();

            if (!$journal) {
                return response()->json(['status' => 'error', 'pesan' => 'Jurnal tidak ditemukan'], 404);
            }

            $journal->delete();

            return response()->json(['status' => 'success', 'pesan' => 'Jurnal berhasil dihapus']);

        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Gagal menghapus jurnal: ' . $e->getMessage()
            ], 500);
        }
    }

    // =========================
    // UPDATE STATUS JURNAL
    // =========================
    public function updateStatus(Request $request, $id)
    {
        try {
            $request->validate([
                'status' => 'required|in:normal,perhatian,darurat'
            ]);

            $journal = Journal::where('_id', $id)->first();

            if (!$journal) {
                return response()->json(['status' => 'error', 'pesan' => 'Jurnal tidak ditemukan'], 404);
            }

            $journal->status = $request->status;
            $journal->save();

            return response()->json([
                'status' => 'success',
                'pesan'  => 'Status berhasil diupdate',
                'data'   => $journal
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Gagal update status: ' . $e->getMessage()
            ], 500);
        }
    }

    // =========================
    // CHAT AI (RuangTenang)
    // FIX: Pakai attributes->get('auth_user') konsisten dengan middleware
    // =========================
    public function tesAi(Request $request)
    {
        $userMessage = $request->input('message', '');

        if (empty(trim($userMessage))) {
            return response()->json([
                'reply' => 'Silakan tuliskan pesan terlebih dahulu 😊'
            ]);
        }

        try {
            $userId = $this->getAuthenticatedUserId($request);
        } catch (\Exception $e) {
            return $this->unauthorizedResponse('Sesi kamu telah berakhir. Silakan logout lalu login kembali. 🙏');
        }

        $allowedKeywords = [
            'stres', 'cemas', 'depresi', 'sedih', 'overthinking',
            'mental', 'emosi', 'burnout', 'trauma', 'hubungan',
            'capek', 'lelah', 'bingung', 'takut', 'khawatir', 'gelisah', 'kesepian'
        ];

        $isValid = false;
        foreach ($allowedKeywords as $keyword) {
            if (str_contains(strtolower($userMessage), $keyword)) {
                $isValid = true;
                break;
            }
        }

        if (!$isValid) {
            $reply = 'Sepertinya itu di luar topik kesehatan mental. '
                . 'Tapi kalau kamu ingin cerita tentang perasaanmu, aku siap mendengarkan 😊';

            ChatMessage::create(['user_id' => $userId, 'sender' => 'user', 'message' => $userMessage]);
            ChatMessage::create(['user_id' => $userId, 'sender' => 'ai',   'message' => $reply]);

            return response()->json(['reply' => $reply]);
        }

        $apiKey = env('GROQ_API_KEY');

        if (!$apiKey) {
            return response()->json(['reply' => 'Maaf, layanan AI sedang tidak tersedia.'], 500);
        }

        try {
            ChatMessage::create(['user_id' => $userId, 'sender' => 'user', 'message' => $userMessage]);

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

            $response = Http::timeout(30)->withHeaders([
                'Authorization' => 'Bearer ' . trim($apiKey),
                'Content-Type'  => 'application/json',
            ])->post('https://api.groq.com/openai/v1/chat/completions', [
                'model'    => 'llama-3.3-70b-versatile',
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user',   'content' => $userMessage]
                ],
                'max_tokens'  => 1024,
                'temperature' => 0.7,
            ]);

            if ($response->failed()) {
                $reply = 'Maaf, saya sedang mengalami gangguan koneksi. Coba lagi ya 🙏';
                ChatMessage::create(['user_id' => $userId, 'sender' => 'ai', 'message' => $reply]);
                return response()->json(['reply' => $reply], 500);
            }

            $aiResult    = $response->json();
            $hasilTeksAI = trim($aiResult['choices'][0]['message']['content'] ?? 'Maaf, saya tidak dapat memproses pesanmu saat ini.');

            ChatMessage::create(['user_id' => $userId, 'sender' => 'ai', 'message' => $hasilTeksAI]);

            return response()->json(['reply' => $hasilTeksAI]);

        } catch (\Exception $e) {
            $reply = 'Maaf, terjadi kesalahan pada sistem AI.';
            ChatMessage::create(['user_id' => $userId, 'sender' => 'ai', 'message' => $reply]);
            return response()->json(['reply' => $reply], 500);
        }
    }

    // =========================
    // RIWAYAT CHAT
    // =========================
    public function getChatHistory(Request $request)
    {
        try {
            $userId = $this->getAuthenticatedUserId($request);
        } catch (\Exception $e) {
            return $this->unauthorizedResponse($e->getMessage());
        }

        try {
            $messages = ChatMessage::where('user_id', $userId)
                ->orderBy('created_at', 'asc')
                ->get();

            return response()->json([
                'status' => 'success',
                'data'   => $messages
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Gagal memuat chat history: ' . $e->getMessage()
            ], 500);
        }
    }

    // =========================
    // ANALISIS KESEHATAN MENTAL (ML + GROQ DUAL-CHECK)
    // =========================
    public function analyzeMentalHealth(Request $request)
    {
        try {
            $userId = $this->getAuthenticatedUserId($request);
        } catch (\Exception $e) {
            return $this->unauthorizedResponse($e->getMessage());
        }

        $dataUser = $request->all();

        try {
            $response = Http::post('http://192.168.1.17:5000/predict', $dataUser);

            if ($response->successful()) {
                $hasilPrediksi = $response->json();

                $kategoriML = $hasilPrediksi['prediction'] ?? 'Minimal';
                $skorTotal  = $hasilPrediksi['skor_total'] ?? 0;
                $teksCurhat = $request->input('teks_curhat', '');

                $kategoriGroq = 'Netral';
                $apiKey       = env('GROQ_API_KEY');

                if (!empty(trim($teksCurhat)) && $apiKey) {
                    $prompt = "Kamu adalah psikolog. Analisis teks berikut dan tentukan kategori emosi utamanya. " .
                        "Balas HANYA dengan SALAH SATU kata ini tanpa tanda baca tambahan: " .
                        "Burnout, Cemas, Sedih, Netral, atau Krisis. \n\n" .
                        "Teks: \"" . $teksCurhat . "\"";

                    try {
                        $groqResponse = Http::timeout(10)->withHeaders([
                            'Authorization' => 'Bearer ' . trim($apiKey),
                            'Content-Type'  => 'application/json',
                        ])->post('https://api.groq.com/openai/v1/chat/completions', [
                            'model'    => 'llama-3.3-70b-versatile',
                            'messages' => [['role' => 'user', 'content' => $prompt]],
                            'max_tokens'  => 10,
                            'temperature' => 0,
                        ]);

                        if ($groqResponse->successful()) {
                            $aiResult     = $groqResponse->json();
                            $kategoriGroq = trim($aiResult['choices'][0]['message']['content'] ?? 'Netral');
                            $kategoriGroq = preg_replace('/[^a-zA-Z]/', '', $kategoriGroq);
                        }
                    } catch (\Exception $e) {
                        \Log::warning('Groq API fail in Dual-Check: ' . $e->getMessage());
                    }
                }

                $mlSeverityMap   = ['Minimal' => 1, 'Ringan' => 2, 'Sedang' => 3, 'Berat' => 4];
                $mlSeverity      = $mlSeverityMap[$kategoriML] ?? 1;

                $groqSeverityMap = ['Netral' => 1, 'Sedih' => 2, 'Cemas' => 3, 'Burnout' => 3, 'Krisis' => 4];
                $groqSeverity    = $groqSeverityMap[$kategoriGroq] ?? 1;

                $maxSeverity        = max($mlSeverity, $groqSeverity);
                $severityToCategory = [1 => 'Minimal', 2 => 'Ringan', 3 => 'Sedang', 4 => 'Berat'];
                $kategoriFinal      = $severityToCategory[$maxSeverity] ?? 'Minimal';

                $isOverridden                      = ($maxSeverity > $mlSeverity);
                $hasilPrediksi['prediction']       = $kategoriFinal;
                $hasilPrediksi['override_by_text'] = $isOverridden;
                $hasilPrediksi['groq_sentiment']   = $kategoriGroq;

                if ($isOverridden) {
                    $hasilPrediksi['message'] = 'Kondisimu memerlukan perhatian khusus. Berdasarkan ceritamu, kamu tidak harus menghadapi ini sendirian.';
                }

                $moodMap = [
                    'Minimal' => 'Netral',
                    'Ringan'  => 'Cemas',
                    'Sedang'  => 'Cemas',
                    'Berat'   => 'Krisis',
                ];

                Journal::create([
                    'user_id'               => $userId,
                    'teks_curhat'           => $teksCurhat,
                    'hasil_mood'            => $moodMap[$kategoriFinal] ?? 'Netral',
                    'kategori_phq'          => $kategoriFinal,
                    'skor_phq'              => $skorTotal,
                    'perasaan_sedih'        => (int) $request->input('perasaan_sedih', 0),
                    'minat_kegiatan'        => (int) $request->input('minat_kegiatan', 0),
                    'kualitas_tidur'        => (int) $request->input('kualitas_tidur', 0),
                    'tingkat_lelah'         => (int) $request->input('tingkat_lelah', 0),
                    'kesulitan_konsentrasi' => (int) $request->input('kesulitan_konsentrasi', 0),
                    'tanggal'               => now(),
                    'status'                => 'normal',
                ]);

                return response()->json([
                    'status'  => 'success',
                    'message' => 'Analisis berhasil dilakukan via AI',
                    'data'    => $hasilPrediksi,
                ], 200);
            }

            \Log::error('Flask error response: ' . $response->body());
            return response()->json([
                'status'  => 'error',
                'message' => 'Gagal mendapatkan analisis dari AI'
            ], 500);

        } catch (\Exception $e) {
            \Log::error('Error in analyzeMentalHealth: ' . $e->getMessage());
            return response()->json([
                'status'  => 'error',
                'message' => 'Koneksi ke server AI terputus. Pastikan Flask menyala. Error: ' . $e->getMessage()
            ], 500);
        }
    }
}