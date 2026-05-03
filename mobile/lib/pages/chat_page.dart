import 'dart:ui';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../theme/app_theme.dart';
import 'journal_page.dart'; // Untuk navigasi ke halaman Jurnal AI

class ChatAiPage extends StatefulWidget {
  const ChatAiPage({super.key});

  @override
  State<ChatAiPage> createState() => _ChatAiPageState();
}

// ===========================================================================
// DATA ARTIKEL REKOMENDASI PER KATEGORI MOOD
// Digunakan untuk menampilkan artikel relevan setelah AI membalas
// ===========================================================================
const Map<String, List<Map<String, String>>> _articlesByMood = {
  'stres': [
    {'emoji': '🧘', 'title': 'Teknik Napas 4-7-8', 'sub': 'Redakan stres dalam 1 menit'},
    {'emoji': '🌿', 'title': 'Jalan Kaki & Stres', 'sub': 'Olahraga ringan yang ampuh'},
    {'emoji': '📓', 'title': 'Journaling untuk Stres', 'sub': 'Tulis, lepaskan, lega'},
  ],
  'cemas': [
    {'emoji': '💆', 'title': 'Mindfulness 5 Menit', 'sub': 'Hadirkan dirimu saat ini'},
    {'emoji': '🎵', 'title': 'Musik & Kecemasan', 'sub': 'Playlist yang menenangkan jiwa'},
    {'emoji': '🔋', 'title': 'Kelola Energi Mental', 'sub': 'Jaga batas agar tidak overwhelmed'},
  ],
  'sedih': [
    {'emoji': '💜', 'title': 'Validasi Perasaanmu', 'sub': 'Boleh sedih, itu manusiawi'},
    {'emoji': '🤝', 'title': 'Cerita ke Orang Terdekat', 'sub': 'Kamu tidak harus sendiri'},
    {'emoji': '🌅', 'title': 'Rutinitas Penyembuh', 'sub': 'Kebiasaan kecil yang membantu'},
  ],
  'lelah': [
    {'emoji': '😴', 'title': 'Pentingnya Tidur Cukup', 'sub': 'Otak butuh rehat yang berkualitas'},
    {'emoji': '🍵', 'title': 'Istirahat Aktif', 'sub': 'Bukan rebahan, tapi recharge'},
    {'emoji': '🚿', 'title': 'Self-Care Sederhana', 'sub': 'Me-time yang efektif'},
  ],
  'marah': [
    {'emoji': '🥊', 'title': 'Kelola Amarah dengan Sehat', 'sub': 'Emosi valid, ekspresi bisa dipilih'},
    {'emoji': '🌊', 'title': 'Teknik Grounding', 'sub': 'Kembali tenang dalam 5 langkah'},
    {'emoji': '✍️', 'title': 'Ekspresikan lewat Tulisan', 'sub': 'Tuangkan ke kertas, bukan orang'},
  ],
  'burnout': [
    {'emoji': '🛑', 'title': 'Kenali Tanda Burnout', 'sub': 'Sebelum terlambat, sadari sekarang'},
    {'emoji': '📵', 'title': 'Digital Detox', 'sub': 'Istirahat dari layar secara berkala'},
    {'emoji': '🧠', 'title': 'Cari Bantuan Profesional', 'sub': 'Psikolog bisa membantumu pulih'},
  ],
  'default': [
    {'emoji': '💙', 'title': 'Menjaga Kesehatan Mental', 'sub': 'Panduan dasar untuk setiap hari'},
    {'emoji': '🌱', 'title': 'Tumbuh dari Tantangan', 'sub': 'Resiliensi yang bisa dipelajari'},
    {'emoji': '☀️', 'title': 'Mulai Hari dengan Positif', 'sub': 'Rutinitas pagi yang menyehatkan'},
  ],
};

/// Deteksi kategori mood dari teks yang ditulis user
String _detectMoodCategory(String userText) {
  final lower = userText.toLowerCase();
  if (lower.contains('stres') || lower.contains('tertekan') || lower.contains('tekanan') || lower.contains('beban')) return 'stres';
  if (lower.contains('cemas') || lower.contains('khawatir') || lower.contains('takut') || lower.contains('galau') || lower.contains('panik')) return 'cemas';
  if (lower.contains('sedih') || lower.contains('menangis') || lower.contains('nangis') || lower.contains('kecewa') || lower.contains('patah hati')) return 'sedih';
  if (lower.contains('lelah') || lower.contains('capek') || lower.contains('exhausted') || lower.contains('ngantuk') || lower.contains('bosan')) return 'lelah';
  if (lower.contains('marah') || lower.contains('kesal') || lower.contains('frustrasi') || lower.contains('emosi') || lower.contains('jengkel')) return 'marah';
  if (lower.contains('burnout') || lower.contains('menyerah') || lower.contains('tidak sanggup') || lower.contains('ga kuat') || lower.contains('gak kuat')) return 'burnout';
  return 'default';
}

class _ChatAiPageState extends State<ChatAiPage> with TickerProviderStateMixin {
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  // Setiap pesan: role (user/ai), text, dan opsional moodCategory untuk artikel
  final List<Map<String, String?>> _messages = [
    {
      "role": "ai",
      "text":
          "Halo, apa yang sedang mengganggu pikiranmu hari ini? Ceritakan saja, aku siap mendengarkan.",
      "moodCategory": null, // pesan sambutan tidak tampilkan artikel
    },
  ];
  bool _isLoading = false;
  double _sendButtonScale = 1.0;

  // --- TRIGGER JURNAL AI ---
  // Menghitung berapa kali user sudah mengirim pesan di sesi ini.
  // Akan muncul banner ajakan cek Jurnal AI setiap kelipatan 3 pesan.
  int _userMessageCount = 0;
  static const int _triggerEvery = 3; // Muncul setiap 3 pesan user

  late AnimationController _blobAnimController;

  // --- PERHATIAN UNTUK URL API BACKEND ---
  // Menggunakan 127.0.0.1 karena kita jalan di Chrome (Web)
  final String apiUrl = "http://127.0.0.1:8000/api/test-ai";

  @override
  void initState() {
    super.initState();
    _blobAnimController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 10),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _blobAnimController.dispose();
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOutCubic,
        );
      }
    });
  }

  Future<void> kirimCurhat() async {
    final text = _controller.text.trim();
    if (text.isEmpty) return;

    // Deteksi mood dari pesan user SEBELUM dikirim, untuk artikel rekomendasi
    final String detectedMood = _detectMoodCategory(text);

    setState(() {
      _messages.add({"role": "user", "text": text, "moodCategory": null});
      _isLoading = true;
      _sendButtonScale = 1.0;
      _userMessageCount++; // Tambah counter setiap user mengirim pesan
    });
    _controller.clear();
    _scrollToBottom();

    try {
      final response = await http.post(
        Uri.parse(apiUrl),
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: jsonEncode({"message": text}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          // Simpan moodCategory di pesan AI agar artikel bisa ditampilkan di bawahnya
          _messages.add({
            "role": "ai",
            "text": data['reply'] ?? "Maaf, tidak ada balasan dari AI.",
            "moodCategory": detectedMood,
          });

          // --- CEK TRIGGER JURNAL AI ---
          // Jika jumlah pesan user sudah mencapai kelipatan _triggerEvery,
          // sisipkan banner undangan Cek Kondisi Mental setelah balasan AI
          if (_userMessageCount % _triggerEvery == 0) {
            _messages.add({
              "role": "journal_trigger", // Tipe khusus untuk banner
              "text": "",
              "moodCategory": null,
            });
          }
        });
      } else {
        setState(() {
          _messages.add({
            "role": "ai",
            "text":
                "Gagal terhubung ke server. Pastikan backend jalan. (Status: ${response.statusCode})",
            "moodCategory": null,
          });
        });
      }
    } catch (e) {
      setState(() {
        _messages.add({
          "role": "ai",
          "text":
              "Error koneksi: Pastikan Backend Laravel sudah di-serve dan URL API sudah benar.\n\nDetail: $e",
          "moodCategory": null,
        });
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
      _scrollToBottom();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Stack(
        children: [
          // Background Blobs Dekoratif dengan animasi diagonal dan pulse
          _buildAnimatedBlobs(),

          SafeArea(
            child: Column(
              children: [
                // Modern AppBar (Sekarang memiliki tombol Back)
                _buildAppBar(),

                // Chat Area
                Expanded(
                  child: ListView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 20,
                      vertical: 24,
                    ),
                    itemCount: _messages.length + (_isLoading ? 1 : 0),
                    itemBuilder: (context, index) {
                      if (index == _messages.length) {
                        return _buildTypingIndicator();
                      }
                      final msg = _messages[index];
                      final isUser = msg["role"] == "user";
                      final moodCategory = msg["moodCategory"];

                      // Jika tipe pesan adalah journal_trigger, tampilkan banner khusus
                      if (msg["role"] == "journal_trigger") {
                        return _buildJournalTriggerCard(index);
                      }

                      // Tampilkan bubble + artikel rekomendasi (jika ada mood terdeteksi)
                      return Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          _buildChatBubble(msg["text"]!, isUser, index),
                          // Hanya tampilkan artikel di bawah balasan AI (bukan pesan user)
                          if (!isUser && moodCategory != null)
                            _buildArticleRecommendations(moodCategory, index),
                        ],
                      );
                    },
                  ),
                ),

                // Input Area (Glassmorphism)
                _buildInputArea(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAnimatedBlobs() {
    return AnimatedBuilder(
      animation: _blobAnimController,
      builder: (context, child) {
        final double moveYPurple =
            math.sin(_blobAnimController.value * math.pi) * 30;
        final double moveXPurple =
            math.cos(_blobAnimController.value * math.pi) * 30;

        final double moveYGreen =
            math.cos(_blobAnimController.value * math.pi) * 30;
        final double moveXGreen =
            math.sin(_blobAnimController.value * math.pi) * 30;

        final double pulsePurple =
            0.15 + (math.sin(_blobAnimController.value * math.pi) * 0.05);
        final double pulseGreen =
            0.10 + (math.cos(_blobAnimController.value * math.pi) * 0.05);

        return Stack(
          children: [
            Positioned(
              top: -50 + moveYPurple,
              right: -50 + moveXPurple,
              child: Container(
                width: 250,
                height: 250,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.blobPurple.withOpacity(pulsePurple),
                ),
              ),
            ),
            Positioned(
              bottom: 50 + moveYGreen,
              left: -50 + moveXGreen,
              child: Container(
                width: 200,
                height: 200,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.blobGreen.withOpacity(pulseGreen),
                ),
              ),
            ),
            Positioned.fill(
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 80, sigmaY: 80),
                child: const SizedBox(),
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildAppBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      child: Row(
        children: [
          if (Navigator.canPop(context))
            IconButton(
              icon: const Icon(
                Icons.arrow_back_rounded,
                color: AppColors.textPrimary,
              ),
              onPressed: () => Navigator.pop(context),
            )
          else
            const SizedBox(width: 48),
          Expanded(
            child: Center(
              child: Text(
                'RuangTenang AI',
                style: AppTextStyles.titleLG.copyWith(
                  color: AppColors.primary,
                  letterSpacing: 0.5,
                ),
              ),
            ),
          ),
          const SizedBox(width: 48), // Spacer to balance the back button
        ],
      ),
    );
  }

  Widget _buildChatBubble(String text, bool isUser, int index) {
    return TweenAnimationBuilder<double>(
      key: ValueKey('msg_$index'),
      tween: Tween(begin: 0.0, end: 1.0),
      duration: const Duration(milliseconds: 500),
      curve: Curves.easeOutCubic,
      builder: (context, value, child) {
        return Opacity(
          opacity: value,
          child: Transform.translate(
            offset: Offset(0, 20 * (1 - value)),
            child: child,
          ),
        );
      },
      child: Padding(
        padding: const EdgeInsets.only(bottom: 16),
        child: Row(
          mainAxisAlignment: isUser
              ? MainAxisAlignment.end
              : MainAxisAlignment.start,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            if (!isUser) ...[
              Container(
                margin: const EdgeInsets.only(right: 8, bottom: 4),
                width: 32,
                height: 32,
                decoration: const BoxDecoration(
                  gradient: AppGradients.avatarGradient,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.psychology,
                  size: 18,
                  color: Colors.white,
                ),
              ),
            ],

            Flexible(
              child: Stack(
                clipBehavior: Clip.none,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 12,
                    ),
                    decoration: BoxDecoration(
                      color: isUser
                          ? AppColors.primarySurface
                          : AppColors.cardBackground,
                      borderRadius: BorderRadius.only(
                        topLeft: const Radius.circular(16),
                        topRight: const Radius.circular(16),
                        bottomLeft: Radius.circular(isUser ? 16 : 4),
                        bottomRight: Radius.circular(isUser ? 4 : 16),
                      ),
                      border: isUser
                          ? null
                          : Border.all(color: AppColors.cardBorder, width: 1),
                      boxShadow: isUser
                          ? [
                              BoxShadow(
                                color: AppColors.primary.withOpacity(0.05),
                                blurRadius: 4,
                                offset: const Offset(0, 2),
                              ),
                            ]
                          : [
                              const BoxShadow(
                                color: Color(0x05000000),
                                blurRadius: 4,
                                offset: Offset(0, 2),
                              ),
                            ],
                    ),
                    child: Text(
                      text,
                      style: AppTextStyles.bodyMD.copyWith(
                        color: isUser
                            ? AppColors.primary
                            : AppColors.textPrimary,
                      ),
                    ),
                  ),

                  if (!isUser)
                    Positioned(
                      top: -12,
                      right: -8,
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color: AppColors.background,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.05),
                              blurRadius: 4,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: const Text('🌿', style: TextStyle(fontSize: 12)),
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTypingIndicator() {
    return TweenAnimationBuilder<double>(
      key: const ValueKey('typing_indicator'),
      tween: Tween(begin: 0.0, end: 1.0),
      duration: const Duration(milliseconds: 500),
      curve: Curves.easeOutCubic,
      builder: (context, value, child) {
        return Opacity(
          opacity: value,
          child: Transform.translate(
            offset: Offset(0, 20 * (1 - value)),
            child: child,
          ),
        );
      },
      child: Padding(
        padding: const EdgeInsets.only(bottom: 16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Container(
              margin: const EdgeInsets.only(right: 8, bottom: 4),
              width: 32,
              height: 32,
              decoration: const BoxDecoration(
                gradient: AppGradients.avatarGradient,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.psychology,
                size: 18,
                color: Colors.white,
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              decoration: BoxDecoration(
                color: AppColors.cardBackground,
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(16),
                  topRight: Radius.circular(16),
                  bottomLeft: Radius.circular(4),
                  bottomRight: Radius.circular(16),
                ),
                border: Border.all(color: AppColors.cardBorder, width: 1),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    "RuangTenang sedang mengetik",
                    style: AppTextStyles.bodySM.copyWith(
                      color: AppColors.textMuted,
                      fontStyle: FontStyle.italic,
                    ),
                  ),
                  const SizedBox(width: 8),
                  const BouncingDotsIndicator(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInputArea() {
    return ClipRRect(
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
        child: Container(
          padding: const EdgeInsets.only(
            left: 16,
            right: 16,
            top: 12,
            bottom: 20,
          ),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.6),
            border: const Border(
              top: BorderSide(color: Colors.white, width: 1.5),
            ),
          ),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _controller,
                  enabled: !_isLoading,
                  style: AppTextStyles.bodyMD,
                  decoration: InputDecoration(
                    hintText: "Ketik pesan...",
                    hintStyle: AppTextStyles.bodyMD.copyWith(
                      color: AppColors.textMuted,
                    ),
                    filled: true,
                    fillColor: AppColors.inputFill,
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 20,
                      vertical: 12,
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(24),
                      borderSide: const BorderSide(
                        color: AppColors.inputBorder,
                        width: 1,
                      ),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(24),
                      borderSide: const BorderSide(
                        color: AppColors.inputBorder,
                        width: 1,
                      ),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(24),
                      borderSide: const BorderSide(
                        color: AppColors.primaryFocus,
                        width: 1.5,
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              GestureDetector(
                onTapDown: (_) {
                  if (_isLoading || _controller.text.isEmpty) return;
                  setState(() => _sendButtonScale = 0.9);
                },
                onTapUp: (_) {
                  if (_isLoading) return;
                  setState(() => _sendButtonScale = 1.0);
                  kirimCurhat();
                },
                onTapCancel: () {
                  if (_isLoading) return;
                  setState(() => _sendButtonScale = 1.0);
                },
                child: AnimatedScale(
                  scale: _sendButtonScale,
                  duration: const Duration(milliseconds: 150),
                  curve: Curves.easeOutCubic,
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: AppGradients.primaryButton,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primary.withOpacity(0.3),
                          blurRadius: 8,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: _isLoading
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                color: Colors.white,
                                strokeWidth: 2,
                              ),
                            )
                          : const Icon(
                              Icons.send_rounded,
                              color: Colors.white,
                              size: 20,
                            ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ===========================================================================
  // WIDGET: Trigger Banner → Ajakan Cek Kondisi Mental (Jurnal AI)
  // Muncul setiap kelipatan _triggerEvery pesan di dalam alur chat
  // ===========================================================================

  Widget _buildJournalTriggerCard(int index) {
    return TweenAnimationBuilder<double>(
      key: ValueKey('trigger_$index'),
      tween: Tween(begin: 0.0, end: 1.0),
      duration: const Duration(milliseconds: 700),
      curve: Curves.easeOutBack,
      builder: (context, value, child) {
        return Opacity(
          opacity: value.clamp(0.0, 1.0),
          child: Transform.translate(
            offset: Offset(0, 24 * (1 - value)),
            child: child,
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 16, horizontal: 4),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF7C3AED), Color(0xFF4F46E5)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF7C3AED).withOpacity(0.35),
              blurRadius: 20,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(20),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
            child: Padding(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Text('🧠', style: TextStyle(fontSize: 18)),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Cek Kondisi Mentalmu',
                              style: AppTextStyles.titleSM.copyWith(
                                color: Colors.white,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Sudah beberapa saat kita ngobrol',
                              style: AppTextStyles.caption.copyWith(
                                color: Colors.white.withOpacity(0.75),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 12),

                  // Deskripsi
                  Text(
                    'Yuk, lakukan pengecekan kondisi mental lebih mendalam dengan Jurnal AI. Hanya 2 menit, dan kamu akan mendapatkan analisis serta rekomendasi yang lebih personal. 💜',
                    style: AppTextStyles.bodySM.copyWith(
                      color: Colors.white.withOpacity(0.9),
                      height: 1.5,
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Tombol CTA
                  Row(
                    children: [
                      Expanded(
                        child: GestureDetector(
                          onTap: () {
                            // Navigasi ke JournalPage
                            Navigator.push(
                              context,
                              PageRouteBuilder(
                                pageBuilder: (_, animation, __) =>
                                    const JournalPage(),
                                transitionsBuilder:
                                    (_, animation, __, child) {
                                  return SlideTransition(
                                    position: Tween<Offset>(
                                      begin: const Offset(1.0, 0.0),
                                      end: Offset.zero,
                                    ).animate(CurvedAnimation(
                                      parent: animation,
                                      curve: Curves.easeOutCubic,
                                    )),
                                    child: child,
                                  );
                                },
                                transitionDuration:
                                    const Duration(milliseconds: 400),
                              ),
                            );
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(12),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.1),
                                  blurRadius: 8,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(
                                  Icons.book_rounded,
                                  size: 16,
                                  color: Color(0xFF7C3AED),
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  'Mulai Cek Kondisi Mental',
                                  style: AppTextStyles.label.copyWith(
                                    color: const Color(0xFF7C3AED),
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  // ===========================================================================
  // WIDGET: Artikel Rekomendasi di Bawah Balasan AI
  // ===========================================================================

  Widget _buildArticleRecommendations(String moodCategory, int msgIndex) {
    final articles = _articlesByMood[moodCategory] ?? _articlesByMood['default']!;

    return TweenAnimationBuilder<double>(
      key: ValueKey('articles_$msgIndex'),
      tween: Tween(begin: 0.0, end: 1.0),
      duration: const Duration(milliseconds: 600),
      curve: Curves.easeOutCubic,
      builder: (context, value, child) {
        return Opacity(
          opacity: value,
          child: Transform.translate(
            offset: Offset(0, 16 * (1 - value)),
            child: child,
          ),
        );
      },
      child: Padding(
        padding: const EdgeInsets.only(left: 40, bottom: 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Label header artikel
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Row(
                children: [
                  const Icon(
                    Icons.auto_awesome_rounded,
                    size: 13,
                    color: AppColors.primary,
                  ),
                  const SizedBox(width: 5),
                  Text(
                    'Artikel untukmu',
                    style: AppTextStyles.caption.copyWith(
                      color: AppColors.primary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),

            // Daftar card artikel horizontal
            SizedBox(
              height: 110, // <-- Diperbesar dari 100 menjadi 110 agar tidak overlap
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: articles.length,
                itemBuilder: (context, i) {
                  final article = articles[i];
                  return _buildArticleCard(
                    emoji: article['emoji']!,
                    title: article['title']!,
                    subtitle: article['sub']!,
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Card artikel kecil dengan desain glassmorphism
  Widget _buildArticleCard({
    required String emoji,
    required String title,
    required String subtitle,
  }) {
    return Container(
      width: 150,
      margin: const EdgeInsets.only(right: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.85),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.primaryBorder),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withOpacity(0.06),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(emoji, style: const TextStyle(fontSize: 20)),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: AppTextStyles.label.copyWith(
                  color: AppColors.textPrimary,
                  fontWeight: FontWeight.w700,
                  fontSize: 12,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 2),
              Text(
                subtitle,
                style: AppTextStyles.caption.copyWith(fontSize: 10),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class BouncingDotsIndicator extends StatefulWidget {
  const BouncingDotsIndicator({super.key});

  @override
  State<BouncingDotsIndicator> createState() => _BouncingDotsIndicatorState();
}

class _BouncingDotsIndicatorState extends State<BouncingDotsIndicator>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(3, (index) {
        return AnimatedBuilder(
          animation: _controller,
          builder: (context, child) {
            final double offset =
                math.sin((_controller.value * 2 * math.pi) - (index * 1.5)) * 4;
            return Transform.translate(
              offset: Offset(0, offset),
              child: Container(
                margin: const EdgeInsets.symmetric(horizontal: 2),
                width: 6,
                height: 6,
                decoration: const BoxDecoration(
                  color: AppColors.primary,
                  shape: BoxShape.circle,
                ),
              ),
            );
          },
        );
      }),
    );
  }
}
