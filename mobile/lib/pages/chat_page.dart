import 'dart:ui';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:provider/provider.dart';
import '../theme/app_theme.dart';
import '../theme/language_notifier.dart';
import 'journal_page.dart';
import 'package:ruangtenang_mobile/config/app_config.dart';


class ChatAiPage extends StatefulWidget {
  const ChatAiPage({super.key});

  @override
  State<ChatAiPage> createState() => _ChatAiPageState();
}

// ===========================================================================
// DATA ARTIKEL REKOMENDASI PER KATEGORI MOOD
// ===========================================================================
const Map<String, List<Map<String, String>>> _articlesByMood = {
  'stres': [
    {'emoji': '🧘', 'title': 'art_stres_1_t', 'sub': 'art_stres_1_s'},
    {'emoji': '🌿', 'title': 'art_stres_2_t', 'sub': 'art_stres_2_s'},
    {'emoji': '📓', 'title': 'art_stres_3_t', 'sub': 'art_stres_3_s'},
  ],
  'cemas': [
    {'emoji': '💆', 'title': 'art_cemas_1_t', 'sub': 'art_cemas_1_s'},
    {'emoji': '🎵', 'title': 'art_cemas_2_t', 'sub': 'art_cemas_2_s'},
    {'emoji': '🔋', 'title': 'art_cemas_3_t', 'sub': 'art_cemas_3_s'},
  ],
  'sedih': [
    {'emoji': '💜', 'title': 'art_sedih_1_t', 'sub': 'art_sedih_1_s'},
    {'emoji': '🤝', 'title': 'art_sedih_2_t', 'sub': 'art_sedih_2_s'},
    {'emoji': '🌅', 'title': 'art_sedih_3_t', 'sub': 'art_sedih_3_s'},
  ],
  'lelah': [
    {'emoji': '😴', 'title': 'art_lelah_1_t', 'sub': 'art_lelah_1_s'},
    {'emoji': '🍵', 'title': 'art_lelah_2_t', 'sub': 'art_lelah_2_s'},
    {'emoji': '🚿', 'title': 'art_lelah_3_t', 'sub': 'art_lelah_3_s'},
  ],
  'marah': [
    {'emoji': '🥊', 'title': 'art_marah_1_t', 'sub': 'art_marah_1_s'},
    {'emoji': '🌊', 'title': 'art_marah_2_t', 'sub': 'art_marah_2_s'},
    {'emoji': '✍️', 'title': 'art_marah_3_t', 'sub': 'art_marah_3_s'},
  ],
  'burnout': [
    {'emoji': '🛑', 'title': 'art_burnout_1_t', 'sub': 'art_burnout_1_s'},
    {'emoji': '📵', 'title': 'art_burnout_2_t', 'sub': 'art_burnout_2_s'},
    {'emoji': '🧠', 'title': 'art_burnout_3_t', 'sub': 'art_burnout_3_s'},
  ],
  'default': [
    {'emoji': '💙', 'title': 'art_default_1_t', 'sub': 'art_default_1_s'},
    {'emoji': '🌱', 'title': 'art_default_2_t', 'sub': 'art_default_2_s'},
    {'emoji': '☀️', 'title': 'art_default_3_t', 'sub': 'art_default_3_s'},
  ],
};

/// Deteksi kategori mood dari teks yang ditulis user
String _detectMoodCategory(String userText) {
  final lower = userText.toLowerCase();
  if (lower.contains('stres') ||
      lower.contains('tertekan') ||
      lower.contains('tekanan') ||
      lower.contains('beban'))
    return 'stres';
  if (lower.contains('cemas') ||
      lower.contains('khawatir') ||
      lower.contains('takut') ||
      lower.contains('galau') ||
      lower.contains('panik'))
    return 'cemas';
  if (lower.contains('sedih') ||
      lower.contains('menangis') ||
      lower.contains('nangis') ||
      lower.contains('kecewa') ||
      lower.contains('patah hati'))
    return 'sedih';
  if (lower.contains('lelah') ||
      lower.contains('capek') ||
      lower.contains('exhausted') ||
      lower.contains('ngantuk') ||
      lower.contains('bosan'))
    return 'lelah';
  if (lower.contains('marah') ||
      lower.contains('kesal') ||
      lower.contains('frustrasi') ||
      lower.contains('emosi') ||
      lower.contains('jengkel'))
    return 'marah';
  if (lower.contains('burnout') ||
      lower.contains('menyerah') ||
      lower.contains('tidak sanggup') ||
      lower.contains('ga kuat') ||
      lower.contains('gak kuat'))
    return 'burnout';
  return 'default';
}

class _ChatAiPageState extends State<ChatAiPage> with TickerProviderStateMixin {
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  // ===========================================================================
  // FIX: Token helpers — satu sumber kebenaran untuk semua HTTP calls
  // ===========================================================================
  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  Future<Map<String, String>> _authHeaders() async {
    final token = await _getToken();
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
    };
  }

  // ===========================================================================
  // FIX: Load history — tidak lagi overwrite oleh build()
  // Semua state awal diset di sini, bukan di build()
  // ===========================================================================
  Future<void> loadChatHistory() async {
    try {
      // FIX: Cek token sebelum request — jika null/kosong, langsung tampilkan welcome
      final token = await _getToken();
      if (token == null || token.isEmpty) {
        _setWelcomeMessage();
        return;
      }

      final headers = await _authHeaders();
      final response = await http.get(
        Uri.parse(historyUrl),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final List messages = data['data'] ?? [];

        setState(() {
          _messages.clear();
          if (messages.isEmpty) {
            _setWelcomeMessageInline();
          } else {
            for (var msg in messages) {
              _messages.add({
                'role': msg['sender'],
                'text': msg['message'],
                'moodCategory': null,
              });
            }
          }
        });

        _scrollToBottom();

      } else if (response.statusCode == 401) {
        // Token expired — tampilkan pesan sesi berakhir, jangan crash
        if (mounted) {
          setState(() {
            _messages = [
              {
                'role': 'ai',
                'text': 'Sesi kamu telah berakhir. Silakan logout lalu login kembali untuk melanjutkan percakapan. 🙏',
                'moodCategory': null,
              }
            ];
          });
        }
      } else {
        // Error lain — fallback ke welcome
        _setWelcomeMessage();
      }
    } catch (e) {
      debugPrint('Load history gagal: $e');
      _setWelcomeMessage();
    }
  }

  /// Set welcome message tanpa setState (dipanggil sebelum widget mount penuh)
  void _setWelcomeMessageInline() {
    _messages = [
      {
        'role': 'ai',
        'text': 'Halo, apa yang sedang mengganggu pikiranmu hari ini? Ceritakan saja, aku siap mendengarkan.',
        'moodCategory': null,
      }
    ];
  }

  /// Set welcome message dengan setState (dipanggil async)
  void _setWelcomeMessage() {
    if (mounted) {
      setState(() {
        _messages = [
          {
            'role': 'ai',
            'text': 'Halo, apa yang sedang mengganggu pikiranmu hari ini? Ceritakan saja, aku siap mendengarkan.',
            'moodCategory': null,
          }
        ];
      });
    }
  }

  List<Map<String, String?>> _messages = [];
  bool _isLoading = false;
  double _sendButtonScale = 1.0;

  int _userMessageCount = 0;
  static const int _triggerEvery = 3;

  late AnimationController _blobAnimController;

  final String apiUrl     = '${AppConfig.baseUrl}/test-ai';
  final String historyUrl = '${AppConfig.baseUrl}/chat-history';

  @override
  void initState() {
    super.initState();

    _blobAnimController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 10),
    )..repeat(reverse: true);

    // FIX: Set welcome message default dulu sebelum loadChatHistory selesai
    // Ini mencegah layar kosong saat history masih loading
    _setWelcomeMessageInline();

    // Lalu load history dari server (akan overwrite welcome jika ada history)
    loadChatHistory();
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

  // ===========================================================================
  // FIX: kirimCurhat — guard token sebelum hit API, handle 401 dengan pesan jelas
  // ===========================================================================
  Future<void> kirimCurhat() async {
  final langNotifier =
      Provider.of<LanguageNotifier>(context, listen: false);

  final text = _controller.text.trim();

  if (text.isEmpty) return;

  final token = await _getToken();

  print("TOKEN LOGIN: $token");

  if (token == null || token.isEmpty) {
    setState(() {
      _messages.add({
        'role': 'ai',
        'text':
            'Sesi login hilang. Silakan login ulang terlebih dahulu.',
        'moodCategory': null,
      });
    });

    _scrollToBottom();
    return;
  }

  final String detectedMood = _detectMoodCategory(text);

  setState(() {
    _messages.add({
      'role': 'user',
      'text': text,
      'moodCategory': null,
    });

    _isLoading = true;
    _sendButtonScale = 1.0;
    _userMessageCount++;
  });

  _controller.clear();
  _scrollToBottom();

  try {
    final response = await http.post(
      Uri.parse(apiUrl),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'message': text,
        'lang': langNotifier.currentLanguage,
      }),
    );

    print("CHAT STATUS: ${response.statusCode}");
    print("CHAT BODY: ${response.body}");

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);

      setState(() {
        _messages.add({
          'role': 'ai',
          'text': data['reply'] ??
              'Maaf, AI tidak memberikan balasan.',
          'moodCategory': detectedMood,
        });

        if (_userMessageCount % _triggerEvery == 0) {
          _messages.add({
            'role': 'journal_trigger',
            'text': '',
            'moodCategory': null,
          });
        }
      });

    } else if (response.statusCode == 401) {

      setState(() {
        _messages.add({
          'role': 'ai',
          'text':
              'Token login tidak valid atau sesi berakhir. Silakan login ulang.',
          'moodCategory': null,
        });
      });

    } else {

      setState(() {
        _messages.add({
          'role': 'ai',
          'text':
              'Server error (${response.statusCode})\n${response.body}',
          'moodCategory': null,
        });
      });
    }

  } catch (e) {

    print("CHAT ERROR: $e");

    setState(() {
      _messages.add({
        'role': 'ai',
        'text': 'Terjadi error:\n$e',
        'moodCategory': null,
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
    // FIX: HAPUS blok _initialized dari sini.
    // Welcome message sudah diset di initState() → _setWelcomeMessageInline()
    // loadChatHistory() akan overwrite dengan data server jika ada
    // Tidak ada lagi race condition antara build() dan loadChatHistory()

    final langNotifier = Provider.of<LanguageNotifier>(context);

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: Stack(
        children: [
          RepaintBoundary(child: _buildAnimatedBlobs()),
          SafeArea(
            child: Column(
              children: [
                _buildAppBar(langNotifier),
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
                        return _buildTypingIndicator(langNotifier);
                      }
                      final msg          = _messages[index];
                      final isUser       = msg['role'] == 'user';
                      final moodCategory = msg['moodCategory'];

                      if (msg['role'] == 'journal_trigger') {
                        return _buildJournalTriggerCard(index, langNotifier);
                      }

                      return Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          _buildChatBubble(msg['text']!, isUser, index),
                          if (!isUser && moodCategory != null)
                            _buildArticleRecommendations(moodCategory, index, langNotifier),
                        ],
                      );
                    },
                  ),
                ),
                _buildInputArea(langNotifier),
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

  Widget _buildAppBar(LanguageNotifier langNotifier) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      child: Row(
        children: [
          if (Navigator.canPop(context))
            IconButton(
              icon: Icon(
                Icons.arrow_back_rounded,
                color: Theme.of(context).brightness == Brightness.dark
                    ? AppColors.textPrimaryDark
                    : AppColors.textPrimary,
              ),
              onPressed: () => Navigator.pop(context),
            )
          else
            const SizedBox(width: 48),
          Expanded(
            child: Center(
              child: Text(
                langNotifier.translate('chat_title'),
                style: AppTextStyles.titleLG.copyWith(
                  color: AppColors.primary,
                  letterSpacing: 0.5,
                ),
              ),
            ),
          ),
          const SizedBox(width: 48),
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
          mainAxisAlignment:
              isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
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
                          : (Theme.of(context).brightness == Brightness.dark
                              ? AppColors.cardBackgroundDark
                              : AppColors.cardBackground),
                      borderRadius: BorderRadius.only(
                        topLeft: const Radius.circular(16),
                        topRight: const Radius.circular(16),
                        bottomLeft: Radius.circular(isUser ? 16 : 4),
                        bottomRight: Radius.circular(isUser ? 4 : 16),
                      ),
                      border: isUser
                          ? null
                          : Border.all(
                              color: Theme.of(context).brightness ==
                                      Brightness.dark
                                  ? AppColors.cardBorderDark
                                  : AppColors.cardBorder,
                              width: 1,
                            ),
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
                            : (Theme.of(context).brightness == Brightness.dark
                                ? AppColors.textPrimaryDark
                                : AppColors.textPrimary),
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

  Widget _buildTypingIndicator(LanguageNotifier langNotifier) {
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
                color: Theme.of(context).brightness == Brightness.dark
                    ? AppColors.cardBackgroundDark
                    : AppColors.cardBackground,
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(16),
                  topRight: Radius.circular(16),
                  bottomLeft: Radius.circular(4),
                  bottomRight: Radius.circular(16),
                ),
                border: Border.all(
                  color: Theme.of(context).brightness == Brightness.dark
                      ? AppColors.cardBorderDark
                      : AppColors.cardBorder,
                  width: 1,
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    langNotifier.translate('chat_typing'),
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

  Widget _buildInputArea(LanguageNotifier langNotifier) {
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
            color: (Theme.of(context).brightness == Brightness.dark
                    ? AppColors.cardBackgroundDark
                    : Colors.white)
                .withOpacity(0.8),
            border: Border(
              top: BorderSide(
                color: Theme.of(context).brightness == Brightness.dark
                    ? AppColors.cardBorderDark
                    : Colors.white,
                width: 1.5,
              ),
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
                    hintText: langNotifier.translate('chat_hint'),
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
  // WIDGET: Banner Trigger Jurnal AI
  // ===========================================================================
  Widget _buildJournalTriggerCard(int index, LanguageNotifier langNotifier) {
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
                              langNotifier.translate('chat_trigger_title'),
                              style: AppTextStyles.titleSM.copyWith(
                                color: Colors.white,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              langNotifier.translate('chat_trigger_sub'),
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
                  Text(
                    langNotifier.translate('chat_trigger_desc'),
                    style: AppTextStyles.bodySM.copyWith(
                      color: Colors.white.withOpacity(0.9),
                      height: 1.5,
                    ),
                  ),
                  const SizedBox(height: 16),
                  GestureDetector(
                    onTap: () {
                      Navigator.push(
                        context,
                        PageRouteBuilder(
                          pageBuilder: (_, animation, __) => const JournalPage(),
                          transitionsBuilder: (_, animation, __, child) {
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
                          transitionDuration: const Duration(milliseconds: 400),
                        ),
                      );
                    },
                    child: Container(
                      width: double.infinity,
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
                            langNotifier.translate('chat_trigger_cta'),
                            style: AppTextStyles.label.copyWith(
                              color: const Color(0xFF7C3AED),
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                    ),
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
  Widget _buildArticleRecommendations(
      String moodCategory, int msgIndex, LanguageNotifier langNotifier) {
    final articles =
        _articlesByMood[moodCategory] ?? _articlesByMood['default']!;

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
                    langNotifier.translate('chat_articles_label'),
                    style: AppTextStyles.caption.copyWith(
                      color: AppColors.primary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
            SizedBox(
              height: 110,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: articles.length,
                itemBuilder: (context, i) {
                  final article = articles[i];
                  return _buildArticleCard(
                    emoji: article['emoji']!,
                    title: langNotifier.translate(article['title']!),
                    subtitle: langNotifier.translate(article['sub']!),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

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

// ===========================================================================
// BOUNCING DOTS INDICATOR
// ===========================================================================
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
                math.sin((_controller.value * 2 * math.pi) - (index * 1.5)) *
                    4;
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