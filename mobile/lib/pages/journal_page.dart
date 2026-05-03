// ─────────────────────────────────────────────────────────────
//  journal_page.dart  —  RuangTenang  ·  PHQ-9 Journal
//  lib/pages/journal_page.dart
// ─────────────────────────────────────────────────────────────

import 'dart:convert';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../theme/app_theme.dart';

const _kBaseUrl = 'http://127.0.0.1:8000/api';

// ═════════════════════════════════════════════════════════════
//  PAGE
// ═════════════════════════════════════════════════════════════
class JournalPage extends StatefulWidget {
  final String? initialNote;
  const JournalPage({super.key, this.initialNote});

  @override
  State<JournalPage> createState() => _JournalPageState();
}

class _JournalPageState extends State<JournalPage>
    with TickerProviderStateMixin {
  // ── Controllers ─────────────────────────────────────────────
  final _textController   = TextEditingController();
  final _textFocus        = FocusNode();
  final _scrollController = ScrollController();

  // ── PHQ-9 State ─────────────────────────────────────────────
  int _perasaanSedih       = 0;
  int _minatKegiatan        = 0;
  int _kualitasTidur        = 0;
  int _tingkatLelah         = 0;
  int _kesulitanKonsentrasi = 0;

  bool _isLoading   = false;
  bool _textFocused = false;

  // ── Animations ──────────────────────────────────────────────
  late final AnimationController _blobController;
  late final AnimationController _staggerController;

  // ── Data ────────────────────────────────────────────────────
  static const _scaleLabels = [
    'Tidak pernah',
    'Beberapa hari',
    'Lebih dari seminggu',
    'Hampir setiap hari',
  ];

  static const _questions = [
    _Question('💧', 'Perasaan Sedih',
        'Merasa sedih, murung, atau tidak punya harapan'),
    _Question('🌱', 'Minat & Kegiatan',
        'Kurang tertarik atau tidak menikmati aktivitas seperti biasa'),
    _Question('🌙', 'Kualitas Tidur',
        'Sulit tidur, terlalu banyak tidur, atau tidur tidak nyenyak'),
    _Question('⚡', 'Tingkat Kelelahan',
        'Merasa lelah atau tidak punya energi untuk beraktivitas'),
    _Question('🧠', 'Konsentrasi',
        'Sulit fokus saat membaca, menonton, atau melakukan pekerjaan'),
  ];

  // ── Lifecycle ────────────────────────────────────────────────
  @override
  void initState() {
    super.initState();

    if (widget.initialNote != null) {
      _textController.text = widget.initialNote!;
    }

    _blobController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 10),
    )..repeat(reverse: true);

    _staggerController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );

    _textFocus.addListener(() {
      if (mounted) setState(() => _textFocused = _textFocus.hasFocus);
    });

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) _staggerController.forward();
    });
  }

  @override
  void dispose() {
    _textController.dispose();
    _textFocus.dispose();
    _scrollController.dispose();
    _blobController.dispose();
    _staggerController.dispose();
    super.dispose();
  }

  // ── Helpers ──────────────────────────────────────────────────
  int _getValue(int i) => [
        _perasaanSedih,
        _minatKegiatan,
        _kualitasTidur,
        _tingkatLelah,
        _kesulitanKonsentrasi,
      ][i];

  void _setValue(int i, int v) {
    HapticFeedback.selectionClick();
    setState(() {
      switch (i) {
        case 0: _perasaanSedih       = v; break;
        case 1: _minatKegiatan        = v; break;
        case 2: _kualitasTidur        = v; break;
        case 3: _tingkatLelah         = v; break;
        case 4: _kesulitanKonsentrasi = v; break;
      }
    });
  }

  int get _totalSkor =>
      _perasaanSedih + _minatKegiatan + _kualitasTidur +
      _tingkatLelah + _kesulitanKonsentrasi;

  // ── Stagger (mirrors _StaggeredFadeInUp from DashboardPage) ──
  Widget _stagger({required int index, required Widget child}) {
    final start   = (index * 0.08).clamp(0.0, 0.75);
    final end     = (start + 0.35).clamp(0.0, 1.0);
    final curved  = CurvedAnimation(
      parent: _staggerController,
      curve: Interval(start, end, curve: Curves.easeOutCubic),
    );
    final opacity    = Tween<double>(begin: 0, end: 1).animate(curved);
    final translateY = Tween<double>(begin: 20, end: 0).animate(curved);

    return AnimatedBuilder(
      animation: _staggerController,
      builder: (_, child) => Opacity(
        opacity: opacity.value,
        child: Transform.translate(
          offset: Offset(0, translateY.value),
          child: child,
        ),
      ),
      child: child,
    );
  }

  // ── API ──────────────────────────────────────────────────────
  Future<void> _analyzeJournal() async {
    _textFocus.unfocus();
    if (_textController.text.trim().isEmpty) {
      _showSnack('Yuk tuliskan dulu perasaanmu 💜');
      return;
    }
    HapticFeedback.mediumImpact();
    setState(() => _isLoading = true);

    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      final res = await http.post(
        Uri.parse('$_kBaseUrl/journal/analyze'),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'teks_curhat':           _textController.text.trim(),
          'perasaan_sedih':        _perasaanSedih,
          'minat_kegiatan':         _minatKegiatan,
          'kualitas_tidur':         _kualitasTidur,
          'tingkat_lelah':          _tingkatLelah,
          'kesulitan_konsentrasi':  _kesulitanKonsentrasi,
        }),
      );

      if (res.statusCode == 200) {
        final body = jsonDecode(res.body);
        final prediction =
            (body['data']?['prediction'] ?? 'Minimal') as String;
        final skor = (body['data']?['skor_total'] ?? _totalSkor) as int;
        if (mounted) _showResultSheet(prediction, skor);
      } else {
        try {
          final body = jsonDecode(res.body);
          _showSnack(body['message'] ?? body['pesan'] ?? 'Terjadi kesalahan (${res.statusCode}). Silakan coba lagi 🙏');
        } catch (_) {
          _showSnack('Terjadi kesalahan (${res.statusCode}). Silakan coba lagi 🙏');
        }
      }
    } catch (e) {
      _showSnack('Tidak dapat terhubung ke server: $e');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showSnack(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg,
            style: AppTextStyles.bodySM.copyWith(color: Colors.white)),
        backgroundColor: AppColors.textPrimary,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        margin: const EdgeInsets.fromLTRB(20, 0, 20, 16),
      ),
    );
  }

  // ─────────────────────────────────────────────────────────────
  //  BUILD
  // ─────────────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      extendBodyBehindAppBar: true,
      appBar: _buildAppBar(),
      body: Stack(
        children: [
          // Blobs animatif — identik dengan DashboardPage
          _buildAnimatedBlobs(),

          SafeArea(
            child: CustomScrollView(
              controller: _scrollController,
              physics: const AlwaysScrollableScrollPhysics(
                  parent: BouncingScrollPhysics()),
              slivers: [
                SliverToBoxAdapter(
                    child: _stagger(index: 0, child: _buildHeader())),
                SliverToBoxAdapter(
                    child: _stagger(index: 1, child: _buildCurhatCard())),
                SliverToBoxAdapter(
                    child: _stagger(index: 2, child: _buildSectionLabel())),
                SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (_, i) => _stagger(
                        index: 3 + i, child: _buildQuestionCard(i)),
                    childCount: 5,
                  ),
                ),
                SliverToBoxAdapter(
                    child: _stagger(index: 8, child: _buildScoreRow())),
                SliverToBoxAdapter(
                    child: _stagger(index: 9, child: _buildAnalyzeButton())),
                const SliverToBoxAdapter(child: SizedBox(height: 48)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ── AppBar ───────────────────────────────────────────────────
  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      backgroundColor: Colors.transparent,
      elevation: 0,
      surfaceTintColor: Colors.transparent,
      leading: Padding(
        padding: const EdgeInsets.only(left: 16),
        child: GestureDetector(
          onTap: () => Navigator.maybePop(context),
          child: Container(
            margin: const EdgeInsets.symmetric(vertical: 10),
            decoration: AppDecorations.card.copyWith(
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(
              Icons.arrow_back_ios_new_rounded,
              color: AppColors.textPrimary,
              size: 16,
            ),
          ),
        ),
      ),
      title: Text('Jurnal Harian', style: AppTextStyles.titleMD),
      centerTitle: true,
      actions: [
        Container(
          margin: const EdgeInsets.only(right: 20, top: 10, bottom: 10),
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: AppColors.primaryLight,
            borderRadius: BorderRadius.circular(12),
          ),
          child: const Icon(Icons.auto_awesome_rounded,
              color: AppColors.primary, size: 18),
        ),
      ],
    );
  }

  // ── Animated Blobs ───────────────────────────────────────────
  Widget _buildAnimatedBlobs() {
    return AnimatedBuilder(
      animation: _blobController,
      builder: (_, __) {
        final double moveYPurple =
            math.sin(_blobController.value * math.pi) * 30;
        final double moveXPurple =
            math.cos(_blobController.value * math.pi) * 30;
        final double moveYGreen =
            math.cos(_blobController.value * math.pi) * 30;
        final double moveXGreen =
            math.sin(_blobController.value * math.pi) * 30;
        final double pulsePurple =
            0.15 + math.sin(_blobController.value * math.pi) * 0.05;
        final double pulseGreen =
            0.10 + math.cos(_blobController.value * math.pi) * 0.05;

        return Stack(
          children: [
            Positioned(
              top: -50 + moveYPurple,
              right: -50 + moveXPurple,
              child: Container(
                width: 300, height: 300,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.blobPurple.withOpacity(pulsePurple),
                ),
              ),
            ),
            Positioned(
              bottom: 200 + moveYGreen,
              left: -50 + moveXGreen,
              child: Container(
                width: 250, height: 250,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.blobGreen.withOpacity(pulseGreen),
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  // ── Header ───────────────────────────────────────────────────
  Widget _buildHeader() {
    final now = DateTime.now();
    const weekdays = [
      '', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'
    ];
    const months = [
      '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    final dateLabel =
        '${weekdays[now.weekday]}, ${now.day} ${months[now.month]}';

    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Tanggal chip
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
            decoration: BoxDecoration(
              color: AppColors.primaryLight,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              dateLabel,
              style: AppTextStyles.caption.copyWith(
                color: AppColors.primary,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          const SizedBox(height: 14),

          // Greeting — Georgia heading seperti DashboardPage
          RichText(
            text: TextSpan(
              style: AppTextStyles.headingMD,
              children: const [
                TextSpan(text: 'Bagaimana\n'),
                TextSpan(text: 'perasaanmu hari ini?'),
              ],
            ),
          ),
          const SizedBox(height: 8),

          Text(
            'Tidak ada jawaban yang salah. Ceritakan dengan jujur.',
            style: AppTextStyles.bodyMD.copyWith(
              color: AppColors.textMuted,
              height: 1.55,
            ),
          ),
          const SizedBox(height: 28),
        ],
      ),
    );
  }

  // ── Curhat Card ──────────────────────────────────────────────
  Widget _buildCurhatCard() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        // Pakai AppDecorations.card; override border saat fokus
        decoration: _textFocused
            ? AppDecorations.card.copyWith(
                border: Border.all(
                  color: AppColors.primary.withOpacity(0.35),
                  width: 1.5,
                ),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary.withOpacity(0.07),
                    blurRadius: 20,
                    offset: const Offset(0, 4),
                  ),
                ],
              )
            : AppDecorations.card,
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Label row
            Row(
              children: [
                Container(
                  width: 36, height: 36,
                  decoration: BoxDecoration(
                    color: AppColors.primaryLight,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  alignment: Alignment.center,
                  child: const Text('✍️',
                      style: TextStyle(fontSize: 17)),
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Tulis Perasaanmu',
                        style: AppTextStyles.titleSM),
                    Text(
                      'Ceritakan apa saja yang ada di pikiranmu',
                      style: AppTextStyles.caption,
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 16),
            Divider(height: 1, color: AppColors.cardBorder),
            const SizedBox(height: 16),
            // TextField
            TextField(
              controller: _textController,
              focusNode: _textFocus,
              maxLines: 5,
              minLines: 3,
              style: AppTextStyles.bodyMD.copyWith(height: 1.65),
              decoration: InputDecoration(
                hintText: 'Hari ini aku merasa...',
                hintStyle: AppTextStyles.bodyMD.copyWith(
                  color: AppColors.textMuted.withOpacity(0.55),
                ),
                border: InputBorder.none,
                isDense: true,
                contentPadding: EdgeInsets.zero,
              ),
              cursorColor: AppColors.primary,
              cursorWidth: 1.5,
            ),
          ],
        ),
      ),
    );
  }

  // ── Section Label ────────────────────────────────────────────
  Widget _buildSectionLabel() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 32, 20, 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'EVALUASI KONDISI',
            style: AppTextStyles.caption.copyWith(
              color: AppColors.primary,
              fontWeight: FontWeight.w700,
              letterSpacing: 1.3,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Pilih seberapa sering kamu merasakan hal-hal\nberikut dalam 2 minggu terakhir.',
            style: AppTextStyles.bodySM,
          ),
        ],
      ),
    );
  }

  // ── Question Card ────────────────────────────────────────────
  Widget _buildQuestionCard(int index) {
    final q      = _questions[index];
    final value  = _getValue(index);
    final active = value > 0;

    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 0, 20, 12),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 280),
        curve: Curves.easeOutCubic,
        decoration: active
            ? AppDecorations.card.copyWith(
                border: Border.all(
                  color: AppColors.primary.withOpacity(0.28),
                  width: 1.5,
                ),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary.withOpacity(0.06),
                    blurRadius: 16,
                    offset: const Offset(0, 4),
                  ),
                ],
              )
            : AppDecorations.card,
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 40, height: 40,
                  decoration: BoxDecoration(
                    color: active
                        ? AppColors.primaryLight
                        : AppColors.cardBorder,
                    borderRadius: BorderRadius.circular(11),
                  ),
                  alignment: Alignment.center,
                  child: Text(q.emoji,
                      style: const TextStyle(fontSize: 19)),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(q.title, style: AppTextStyles.titleSM),
                      const SizedBox(height: 2),
                      Text(q.subtitle,
                          style: AppTextStyles.caption
                              .copyWith(height: 1.45)),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                _ScoreBadge(value: value),
              ],
            ),

            const SizedBox(height: 18),

            // Step chips 0–3
            Row(
              children: List.generate(4, (step) {
                final isSelected = step == value;
                return Expanded(
                  child: Padding(
                    padding: EdgeInsets.only(right: step < 3 ? 8 : 0),
                    child: _StepChip(
                      step: step,
                      isSelected: isSelected,
                      onTap: () => _setValue(index, step),
                    ),
                  ),
                );
              }),
            ),

            const SizedBox(height: 10),

            // Label terpilih
            AnimatedSwitcher(
              duration: const Duration(milliseconds: 180),
              child: Align(
                key: ValueKey(value),
                alignment: Alignment.centerRight,
                child: Text(
                  _scaleLabels[value],
                  style: AppTextStyles.caption.copyWith(
                    color: active
                        ? AppColors.primary
                        : AppColors.textMuted,
                    fontWeight:
                        active ? FontWeight.w600 : FontWeight.w400,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── Score Row ────────────────────────────────────────────────
  Widget _buildScoreRow() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 4, 20, 20),
      child: Container(
        decoration: AppDecorations.card,
        padding:
            const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        child: Row(
          children: [
            Container(
              width: 40, height: 40,
              decoration: BoxDecoration(
                color: AppColors.primaryLight,
                borderRadius: BorderRadius.circular(11),
              ),
              alignment: Alignment.center,
              child: const Icon(Icons.bar_chart_rounded,
                  color: AppColors.primary, size: 20),
            ),
            const SizedBox(width: 14),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Total Skor PHQ-9',
                    style: AppTextStyles.caption),
                RichText(
                  text: TextSpan(
                    children: [
                      TextSpan(
                        text: '$_totalSkor',
                        style: AppTextStyles.headingMD.copyWith(
                          color: AppColors.primary,
                          fontSize: 20,
                        ),
                      ),
                      TextSpan(
                        text: ' / 15',
                        style: AppTextStyles.bodyMD.copyWith(
                          color: AppColors.textMuted,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const Spacer(),
            // 15-dot live progress
            Wrap(
              spacing: 4,
              runSpacing: 4,
              children: List.generate(15, (i) {
                return AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  width: 7, height: 7,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: i < _totalSkor
                        ? AppColors.primary.withOpacity(0.7)
                        : AppColors.cardBorder,
                  ),
                );
              }),
            ),
          ],
        ),
      ),
    );
  }

  // ── Analyze Button ───────────────────────────────────────────
  Widget _buildAnalyzeButton() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: GestureDetector(
        onTap: _isLoading ? null : _analyzeJournal,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          height: 56,
          decoration: _isLoading
              ? BoxDecoration(
                  color: AppColors.primary.withOpacity(0.45),
                  borderRadius: BorderRadius.circular(16),
                )
              : BoxDecoration(
                  // AppGradients.primaryButton persis seperti stat card dashboard
                  gradient: AppGradients.primaryButton,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primary.withOpacity(0.3),
                      offset: const Offset(0, 4),
                      blurRadius: 10,
                    ),
                  ],
                ),
          alignment: Alignment.center,
          child: _isLoading
              ? const SizedBox(
                  width: 22, height: 22,
                  child: CircularProgressIndicator(
                      color: Colors.white, strokeWidth: 2),
                )
              : Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.psychology_alt_rounded,
                        color: Colors.white, size: 20),
                    const SizedBox(width: 10),
                    Text(
                      'Analisis Kondisiku',
                      style: AppTextStyles.titleSM
                          .copyWith(color: Colors.white),
                    ),
                  ],
                ),
        ),
      ),
    );
  }

  // ── Result Bottom Sheet ──────────────────────────────────────
  void _showResultSheet(String prediction, int skor) {
    HapticFeedback.heavyImpact();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      useSafeArea: true,
      builder: (_) => _ResultSheet(
        prediction: prediction,
        skorTotal: skor,
        onClose: () => Navigator.pop(context),
      ),
    );
  }
}

// ═════════════════════════════════════════════════════════════
//  STEP CHIP
// ═════════════════════════════════════════════════════════════
class _StepChip extends StatelessWidget {
  final int step;
  final bool isSelected;
  final VoidCallback onTap;
  const _StepChip(
      {required this.step, required this.isSelected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 220),
        curve: Curves.easeOutCubic,
        height: 44,
        decoration: isSelected
            ? BoxDecoration(
                gradient: AppGradients.primaryButton,
                borderRadius: BorderRadius.circular(11),
                // Shadow sesuai stat card dashboard
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary.withOpacity(0.3),
                    offset: const Offset(0, 4),
                    blurRadius: 10,
                  ),
                ],
              )
            : BoxDecoration(
                color: AppColors.background,
                borderRadius: BorderRadius.circular(11),
                border: Border.all(color: AppColors.cardBorder),
              ),
        alignment: Alignment.center,
        child: Text(
          '$step',
          style: TextStyle(
            fontFamily: 'Georgia',
            fontSize: 15,
            fontWeight: FontWeight.w700,
            color: isSelected ? Colors.white : AppColors.textMuted,
          ),
        ),
      ),
    );
  }
}

// ═════════════════════════════════════════════════════════════
//  SCORE BADGE
// ═════════════════════════════════════════════════════════════
class _ScoreBadge extends StatelessWidget {
  final int value;
  const _ScoreBadge({required this.value});

  @override
  Widget build(BuildContext context) {
    final active = value > 0;
    return AnimatedContainer(
      duration: const Duration(milliseconds: 250),
      width: 32, height: 32,
      decoration: BoxDecoration(
        color: active ? AppColors.primaryLight : AppColors.cardBorder,
        borderRadius: BorderRadius.circular(9),
      ),
      alignment: Alignment.center,
      child: AnimatedSwitcher(
        duration: const Duration(milliseconds: 160),
        child: Text(
          '$value',
          key: ValueKey(value),
          style: TextStyle(
            fontFamily: 'Georgia',
            fontSize: 14,
            fontWeight: FontWeight.w700,
            color: active ? AppColors.primary : AppColors.textMuted,
          ),
        ),
      ),
    );
  }
}

// ═════════════════════════════════════════════════════════════
//  RESULT BOTTOM SHEET
// ═════════════════════════════════════════════════════════════
class _ResultSheet extends StatefulWidget {
  final String prediction;
  final int skorTotal;
  final VoidCallback onClose;
  const _ResultSheet(
      {required this.prediction,
      required this.skorTotal,
      required this.onClose});

  @override
  State<_ResultSheet> createState() => _ResultSheetState();
}

class _ResultSheetState extends State<_ResultSheet>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ac;
  late final Animation<double> _scaleAnim;
  late final Animation<double> _fadeAnim;

  @override
  void initState() {
    super.initState();
    _ac = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 600));
    _scaleAnim = CurvedAnimation(
        parent: _ac,
        curve: const Interval(0, 0.7, curve: Curves.elasticOut));
    _fadeAnim = CurvedAnimation(
        parent: _ac,
        curve: const Interval(0.2, 0.9, curve: Curves.easeOut));
    _ac.forward();
  }

  @override
  void dispose() {
    _ac.dispose();
    super.dispose();
  }

  ({Color color, Color bgLight, String emoji, String title, String desc, String cta})
      get _meta {
    switch (widget.prediction.toLowerCase()) {
      case 'minimal':
        return (
          color:   const Color(0xFF059669),
          bgLight: const Color(0xFFD1FAE5),
          emoji:   '🌿',
          title:   'Kondisi Minimal',
          desc:    'Kondisi mentalmu cukup baik saat ini. Teruslah menjaga keseimbangan dan luangkan waktu untuk merawat diri.',
          cta:     'Bagus sekali! Tetap jaga ya 💚',
        );
      case 'ringan':
        return (
          color:   const Color(0xFFD97706),
          bgLight: const Color(0xFFFEF3C7),
          emoji:   '🌤️',
          title:   'Gejala Ringan',
          desc:    'Ada sedikit tekanan yang kamu rasakan. Istirahat yang cukup dan olahraga ringan dapat sangat membantu.',
          cta:     'Kamu tidak sendiri 💛',
        );
      case 'sedang':
        return (
          color:   const Color(0xFFEA580C),
          bgLight: const Color(0xFFFFEDD5),
          emoji:   '🌧️',
          title:   'Gejala Sedang',
          desc:    'Kamu mungkin membutuhkan dukungan lebih. Pertimbangkan untuk berbicara dengan konselor atau psikolog.',
          cta:     'Minta bantuan adalah kekuatan 🧡',
        );
      case 'berat':
      default:
        return (
          color:   const Color(0xFFDC2626),
          bgLight: const Color(0xFFFEE2E2),
          emoji:   '🆘',
          title:   'Gejala Berat',
          desc:    'Kondisimu membutuhkan perhatian serius. Jangan ragu untuk segera menghubungi psikolog atau psikiater terdekat.',
          cta:     'Segera cari bantuan profesional ❤️',
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    final m = _meta;

    return Container(
      decoration: BoxDecoration(
        // Background putih/light sama persis dengan AppColors.background
        color: AppColors.background,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x16000000),
            blurRadius: 40,
            offset: Offset(0, -8),
          ),
        ],
      ),
      padding: const EdgeInsets.fromLTRB(28, 12, 28, 40),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Handle
          Container(
            width: 36, height: 4,
            decoration: BoxDecoration(
              color: AppColors.cardBorder,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 32),

          // Emoji ring
          ScaleTransition(
            scale: _scaleAnim,
            child: Container(
              width: 80, height: 80,
              decoration: BoxDecoration(
                color: m.bgLight,
                shape: BoxShape.circle,
                border: Border.all(
                    color: m.color.withOpacity(0.3), width: 2),
              ),
              alignment: Alignment.center,
              child:
                  Text(m.emoji, style: const TextStyle(fontSize: 36)),
            ),
          ),
          const SizedBox(height: 16),

          // Kategori badge
          FadeTransition(
            opacity: _fadeAnim,
            child: Container(
              padding: const EdgeInsets.symmetric(
                  horizontal: 16, vertical: 7),
              decoration: BoxDecoration(
                color: m.bgLight,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(
                    color: m.color.withOpacity(0.25), width: 1),
              ),
              child: Text(m.title,
                  style:
                      AppTextStyles.titleSM.copyWith(color: m.color)),
            ),
          ),
          const SizedBox(height: 6),
          Text('Skor ${widget.skorTotal} / 15',
              style: AppTextStyles.caption),
          const SizedBox(height: 20),

          // Deskripsi — pakai AppDecorations.card
          FadeTransition(
            opacity: _fadeAnim,
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.all(18),
              decoration: AppDecorations.card,
              child: Text(
                m.desc,
                textAlign: TextAlign.center,
                style: AppTextStyles.bodyMD.copyWith(
                  color: AppColors.textSecondary,
                  height: 1.65,
                ),
              ),
            ),
          ),
          const SizedBox(height: 24),

          // CTA — warna per-severity
          GestureDetector(
            onTap: widget.onClose,
            child: Container(
              width: double.infinity, height: 52,
              decoration: BoxDecoration(
                color: m.bgLight,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                    color: m.color.withOpacity(0.2), width: 1),
              ),
              alignment: Alignment.center,
              child: Text(m.cta,
                  style: AppTextStyles.titleSM
                      .copyWith(color: m.color)),
            ),
          ),
          const SizedBox(height: 12),

          // Tutup link
          GestureDetector(
            onTap: widget.onClose,
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 6),
              child: Text('Tutup',
                  style: AppTextStyles.caption.copyWith(
                    decoration: TextDecoration.underline,
                  )),
            ),
          ),
        ],
      ),
    );
  }
}

// ═════════════════════════════════════════════════════════════
//  DATA MODEL
// ═════════════════════════════════════════════════════════════
class _Question {
  final String emoji, title, subtitle;
  const _Question(this.emoji, this.title, this.subtitle);
}