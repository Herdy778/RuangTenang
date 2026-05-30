import 'dart:ui';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:provider/provider.dart';
import '../theme/app_theme.dart';
import '../theme/language_notifier.dart';
import 'relaxation_page.dart';
import '../services/api_service.dart';

// ============================================================
// DASHBOARD PAGE
// ============================================================
class DashboardPage extends StatefulWidget {
  final Function(String?)? onNavigateToJournal;
  const DashboardPage({super.key, this.onNavigateToJournal});

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

// ─── Helpers (top-level, tidak perlu context) ────────────────
String _stripHtml(String htmlText) {
  return htmlText
      .replaceAll(RegExp(r'<[^>]*>'), '')
      .replaceAll(r'\n', ' ')
      .trim();
}

void _showArticleDetail(BuildContext context, String title, String content) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    useSafeArea: true,
    backgroundColor: Colors.transparent,
    builder: (_) {
      final isDark = Theme.of(context).brightness == Brightness.dark;
      return Container(
        height: MediaQuery.of(context).size.height * 0.85,
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: isDark ? AppColors.cardBackgroundDark : Colors.white,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: AppTextStyles.titleLG.copyWith(color: AppColors.primary),
              ),
              const SizedBox(height: 20),
              Text(
                _stripHtml(content),
                style: AppTextStyles.bodyMD.copyWith(
                  color: isDark
                      ? AppColors.textSecondaryDark
                      : AppColors.textSecondary,
                  height: 1.6,
                ),
              ),
            ],
          ),
        ),
      );
    },
  );
}

// ============================================================
// HALAMAN SEMUA ARTIKEL REKOMENDASI
// ============================================================
class AllRecommendedArticlesPage extends StatefulWidget {
  const AllRecommendedArticlesPage({super.key});

  @override
  State<AllRecommendedArticlesPage> createState() =>
      _AllRecommendedArticlesPageState();
}

class _AllRecommendedArticlesPageState
    extends State<AllRecommendedArticlesPage> {
  late Future<Map<String, dynamic>> _future;

  @override
  void initState() {
    super.initState();
    _future = ApiService().fetchRecommendedArticlesWithCount();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final langNotifier = Provider.of<LanguageNotifier>(context);

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          langNotifier.translate('recommended_articles'),
          style: AppTextStyles.titleMD.copyWith(
            color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
          ),
        ),
        iconTheme: IconThemeData(
          color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
        ),
      ),
      body: FutureBuilder<Map<String, dynamic>>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError ||
              !snapshot.hasData ||
              (snapshot.data!['data'] as List).isEmpty) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.article_outlined,
                      size: 64,
                      color: isDark
                          ? AppColors.textMutedDark
                          : AppColors.textMuted,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      langNotifier.translate('no_recommended_articles'),
                      textAlign: TextAlign.center,
                      style: AppTextStyles.bodyMD.copyWith(
                        color: isDark
                            ? AppColors.textMutedDark
                            : AppColors.textMuted,
                      ),
                    ),
                  ],
                ),
              ),
            );
          }

          final articles = snapshot.data!['data'] as List;
          return ListView.builder(
            padding: const EdgeInsets.all(20),
            itemCount: articles.length,
            itemBuilder: (context, index) {
              final article = articles[index];
              final bool isRead = article['is_read'] == true;
              return _ArticleCard(
                article: article,
                isRead: isRead,
                isDark: isDark,
                onTap: () {
                  ApiService().markArticleAsRead(article['_id'] ?? '');
                  _showArticleDetail(
                    context,
                    article['judul_artikel'] ?? '',
                    article['isi_konten'] ?? '',
                  );
                },
              );
            },
          );
        },
      ),
    );
  }
}

// ============================================================
// HALAMAN SEMUA JURNAL
// ============================================================
class AllJournalEntriesPage extends StatefulWidget {
  const AllJournalEntriesPage({super.key});

  @override
  State<AllJournalEntriesPage> createState() => _AllJournalEntriesPageState();
}

class _AllJournalEntriesPageState extends State<AllJournalEntriesPage> {
  late Future<List<dynamic>> _future;

  @override
  void initState() {
    super.initState();
    _future = ApiService().fetchRecentJournals(limit: 100);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final langNotifier = Provider.of<LanguageNotifier>(context);

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          langNotifier.translate('recent_journal'),
          style: AppTextStyles.titleMD.copyWith(
            color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
          ),
        ),
        iconTheme: IconThemeData(
          color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
        ),
      ),
      body: FutureBuilder<List<dynamic>>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError ||
              !snapshot.hasData ||
              snapshot.data!.isEmpty) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.book_outlined,
                      size: 64,
                      color: isDark
                          ? AppColors.textMutedDark
                          : AppColors.textMuted,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      langNotifier.translate('no_recent_journal'),
                      textAlign: TextAlign.center,
                      style: AppTextStyles.bodyMD.copyWith(
                        color: isDark
                            ? AppColors.textMutedDark
                            : AppColors.textMuted,
                      ),
                    ),
                  ],
                ),
              ),
            );
          }

          final entries = snapshot.data!;
          return ListView.builder(
            padding: const EdgeInsets.all(20),
            itemCount: entries.length,
            itemBuilder: (context, index) {
              final entry = entries[index];
              final mood = entry['hasil_mood'] ?? 'Netral';
              final teks = entry['teks_curhat'] ?? '-';
              final tanggal = entry['tanggal'] ?? entry['created_at'] ?? '';
              final dateLabel = _formatDate(tanggal, langNotifier);
              final moodStyle = AppMoodColors.of(mood);

              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(16),
                decoration: AppDecorations.card.copyWith(
                  color: isDark
                      ? AppColors.cardBackgroundDark
                      : AppColors.cardBackground,
                  border: Border.all(
                    color: isDark
                        ? AppColors.cardBorderDark
                        : AppColors.cardBorder,
                    width: 1,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        _MoodBadge(mood: mood, moodStyle: moodStyle),
                        Text(
                          dateLabel,
                          style: AppTextStyles.caption.copyWith(
                            color: isDark
                                ? AppColors.textMutedDark
                                : AppColors.textMuted,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(
                      teks,
                      style: AppTextStyles.bodyMD.copyWith(
                        color: isDark
                            ? AppColors.textSecondaryDark
                            : AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              );
            },
          );
        },
      ),
    );
  }
}

// ─── Shared helper: format tanggal ───────────────────────────
String _formatDate(dynamic tanggal, LanguageNotifier lang) {
  try {
    final dt = DateTime.parse(tanggal.toString()).toLocal();
    final now = DateTime.now();
    final diff = now.difference(dt).inDays;
    final timeStr =
        '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
    if (diff == 0) return '${lang.translate('today')}, $timeStr';
    if (diff == 1) return '${lang.translate('yesterday')}, $timeStr';
    return '${dt.day}/${dt.month}/${dt.year}';
  } catch (_) {
    return tanggal?.toString() ?? '-';
  }
}

// ─── Shared widget: mood badge ────────────────────────────────
class _MoodBadge extends StatelessWidget {
  final String mood;
  final dynamic moodStyle;
  const _MoodBadge({required this.mood, required this.moodStyle});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: moodStyle.background,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(moodStyle.emoji, style: const TextStyle(fontSize: 12)),
          const SizedBox(width: 6),
          Text(
            mood,
            style: AppTextStyles.label.copyWith(
              color: moodStyle.textColor,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }
}

// ============================================================
// CARD ARTIKEL
// ============================================================
class _ArticleCard extends StatelessWidget {
  final dynamic article;
  final bool isRead;
  final bool isDark;
  final VoidCallback onTap;

  const _ArticleCard({
    required this.article,
    required this.isRead,
    required this.isDark,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final langNotifier = Provider.of<LanguageNotifier>(context, listen: false);

    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        decoration: AppDecorations.card.copyWith(
          color: isDark
              ? AppColors.cardBackgroundDark
              : AppColors.cardBackground,
          border: Border.all(
            color: isRead
                ? (isDark ? AppColors.cardBorderDark : AppColors.cardBorder)
                : AppColors.primary.withOpacity(0.4),
            width: isRead ? 1 : 1.5,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Stack(
              children: [
                if (article['thumbnail_url'] != null &&
                    article['thumbnail_url'].toString().isNotEmpty)
                  ClipRRect(
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(16),
                      topRight: Radius.circular(16),
                    ),
                    child: Image.network(
                      article['thumbnail_url'],
                      height: 140,
                      width: double.infinity,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => const SizedBox.shrink(),
                    ),
                  ),
                if (!isRead)
                  Positioned(
                    top: 10,
                    left: 10,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        langNotifier.translate('article_new_badge'),
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (!isRead)
                        Container(
                          margin: const EdgeInsets.only(top: 5, right: 8),
                          width: 8,
                          height: 8,
                          decoration: const BoxDecoration(
                            color: AppColors.primary,
                            shape: BoxShape.circle,
                          ),
                        ),
                      Expanded(
                        child: Text(
                          article['judul_artikel'] ?? '-',
                          style: AppTextStyles.titleSM.copyWith(
                            color: AppColors.primary,
                            fontWeight:
                                isRead ? FontWeight.w600 : FontWeight.w700,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _stripHtml(article['isi_konten'] ?? ''),
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                    style: AppTextStyles.bodyMD.copyWith(
                      color: isDark
                          ? AppColors.textSecondaryDark
                          : AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        langNotifier.translate('read_more'),
                        style: const TextStyle(
                          color: AppColors.primary,
                          fontWeight: FontWeight.w600,
                          fontSize: 13,
                        ),
                      ),
                      if (isRead)
                        Row(
                          children: [
                            Icon(
                              Icons.check_circle_outline,
                              size: 14,
                              color: isDark
                                  ? AppColors.textMutedDark
                                  : AppColors.textMuted,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              langNotifier.translate('article_read_label'),
                              style: AppTextStyles.caption.copyWith(
                                color: isDark
                                    ? AppColors.textMutedDark
                                    : AppColors.textMuted,
                              ),
                            ),
                          ],
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ============================================================
// _DashboardPageState
// ============================================================
class _DashboardPageState extends State<DashboardPage>
    with TickerProviderStateMixin {
  late AnimationController _blobAnimController;
  late AnimationController _staggeredController;

  String userName = "Pengguna";
  String? _profileImageUrl;

  // ── Futures disimpan di state agar tidak re-fetch tiap rebuild ──
  late Future<Map<String, dynamic>> _statsFuture;
  late Future<List<dynamic>> _moodFuture;
  late Future<Map<String, dynamic>> _articlesFuture;
  late Future<List<dynamic>> _recentJournalFuture;

  void _initFutures() {
    _statsFuture = ApiService().fetchDashboardStats();
    _moodFuture = ApiService().fetchMoodStats();
    _articlesFuture = ApiService().fetchRecommendedArticlesWithCount();
    _recentJournalFuture = ApiService().fetchRecentJournals(limit: 3);
  }

  Future<void> _loadProfileData() async {
    final prefs = await SharedPreferences.getInstance();
    // Guard mounted agar tidak setState setelah dispose
    if (!mounted) return;
    setState(() {
      userName = prefs.getString('nama_lengkap') ?? "Pengguna";
      _profileImageUrl = prefs.getString('profile_image_url');
    });
  }

  @override
  void initState() {
    super.initState();
    _initFutures();
    _loadProfileData();

    _blobAnimController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 10),
    )..repeat(reverse: true);

    _staggeredController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    );

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) _staggeredController.forward();
    });
  }

  @override
  void dispose() {
    _blobAnimController.dispose();
    _staggeredController.dispose();
    super.dispose();
  }

  /// Refresh semua data dashboard
  Future<void> _refreshData() async {
    if (!mounted) return;
    await _loadProfileData();
    if (!mounted) return;
    setState(() {
      _initFutures(); // reset semua future → FutureBuilder fetch ulang
    });
    await Future.delayed(const Duration(milliseconds: 800));
  }

  // ──────────────────────────────────────────────────────────
  // BUILD
  // ──────────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    final langNotifier = Provider.of<LanguageNotifier>(context);
    int animIndex = 0;

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: Stack(
        children: [
          RepaintBoundary(child: _buildAnimatedBlobs()),
          SafeArea(
            child: RefreshIndicator(
              color: AppColors.primary,
              backgroundColor: AppColors.cardBackground,
              onRefresh: _refreshData,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding:
                    const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _StaggeredFadeInUp(
                      index: animIndex++,
                      controller: _staggeredController,
                      child: _buildHeader(),
                    ),
                    const SizedBox(height: 36),
                    _StaggeredFadeInUp(
                      index: animIndex++,
                      controller: _staggeredController,
                      child: _buildStatsGrid(),
                    ),
                    const SizedBox(height: 36),
                    _StaggeredFadeInUp(
                      index: animIndex++,
                      controller: _staggeredController,
                      child: _buildCTACard(),
                    ),
                    const SizedBox(height: 36),
                    _StaggeredFadeInUp(
                      index: animIndex++,
                      controller: _staggeredController,
                      child: _buildMoodChart(langNotifier),
                    ),
                    const SizedBox(height: 36),
                    _StaggeredFadeInUp(
                      index: animIndex++,
                      controller: _staggeredController,
                      child: _buildRecommendedArticles(),
                    ),
                    const SizedBox(height: 36),
                    _StaggeredFadeInUp(
                      index: animIndex++,
                      controller: _staggeredController,
                      child: _buildRecentEntriesTitle(),
                    ),
                    const SizedBox(height: 16),
                    _StaggeredFadeInUp(
                      index: animIndex++,
                      controller: _staggeredController,
                      child: _buildRecentList(),
                    ),
                    const SizedBox(height: 40),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ──────────────────────────────────────────────────────────
  // ANIMATED BLOBS
  // ──────────────────────────────────────────────────────────
  Widget _buildAnimatedBlobs() {
    return AnimatedBuilder(
      animation: _blobAnimController,
      builder: (context, child) {
        final t = _blobAnimController.value;
        final moveYP = math.sin(t * math.pi) * 30;
        final moveXP = math.cos(t * math.pi) * 30;
        final moveYG = math.cos(t * math.pi) * 30;
        final moveXG = math.sin(t * math.pi) * 30;
        final opP = 0.15 + math.sin(t * math.pi) * 0.05;
        final opG = 0.10 + math.cos(t * math.pi) * 0.05;

        return Stack(
          children: [
            Positioned(
              top: -50 + moveYP,
              right: -50 + moveXP,
              child: Container(
                width: 300,
                height: 300,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.blobPurple.withOpacity(opP),
                ),
              ),
            ),
            Positioned(
              bottom: 150 + moveYG,
              left: -50 + moveXG,
              child: Container(
                width: 250,
                height: 250,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.blobGreen.withOpacity(opG),
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

  // ──────────────────────────────────────────────────────────
  // HEADER
  // ──────────────────────────────────────────────────────────
  Widget _buildHeader() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final langNotifier = Provider.of<LanguageNotifier>(context);

    final hour = DateTime.now().hour;
    final greetingKey = hour >= 5 && hour < 12
        ? 'good_morning'
        : hour < 15
            ? 'good_afternoon'
            : hour < 19
                ? 'good_evening'
                : 'good_night';

    final now = DateTime.now();
    final months = [
      'Jan','Feb','Mar','Apr','Mei','Jun',
      'Jul','Agu','Sep','Okt','Nov','Des'
    ];
    final dateStr = '${now.day} ${months[now.month - 1]} ${now.year}';

    return Row(
      children: [
        Container(
          width: 56,
          height: 56,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: AppColors.primaryBorder,
            image: (_profileImageUrl != null && _profileImageUrl!.isNotEmpty)
                ? DecorationImage(
                    image: NetworkImage(_profileImageUrl!),
                    fit: BoxFit.cover,
                  )
                : null,
          ),
          child: (_profileImageUrl == null || _profileImageUrl!.isEmpty)
              ? const Icon(Icons.person, color: AppColors.primary, size: 32)
              : null,
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                dateStr,
                style: AppTextStyles.caption.copyWith(
                  color: isDark
                      ? AppColors.textMutedDark
                      : AppColors.textMuted,
                ),
              ),
              const SizedBox(height: 2),
              RichText(
                text: TextSpan(
                  style: AppTextStyles.headingMD.copyWith(
                    color: isDark
                        ? AppColors.textPrimaryDark
                        : AppColors.textPrimary,
                  ),
                  children: [
                    TextSpan(
                        text: '${langNotifier.translate(greetingKey)},\n'),
                    TextSpan(
                      text: userName,
                      style: AppTextStyles.headingMD.copyWith(
                        fontStyle: FontStyle.italic,
                        color: AppColors.primary,
                      ),
                    ),
                    const TextSpan(text: ' 👋'),
                  ],
                ),
              ),
              const SizedBox(height: 4),
              Text(
                langNotifier.translate('how_feel'),
                style: AppTextStyles.bodyMD.copyWith(
                  color: isDark
                      ? AppColors.textMutedDark
                      : AppColors.textMuted,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // ──────────────────────────────────────────────────────────
  // STATS GRID
  // ──────────────────────────────────────────────────────────
  Widget _buildStatsGrid() {
    final langNotifier = Provider.of<LanguageNotifier>(context);

    return FutureBuilder<Map<String, dynamic>>(
      future: _statsFuture, // pakai cached future
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(
            child: Padding(
              padding: EdgeInsets.all(20),
              child: SizedBox(
                width: 24,
                height: 24,
                child: CircularProgressIndicator(
                    strokeWidth: 2, color: AppColors.primary),
              ),
            ),
          );
        }

        String totalJurnal = '0';
        String moodDominan = 'Netral';
        String sesiRelaksasi = '0';

        if (snapshot.hasData && !snapshot.hasError) {
          totalJurnal = snapshot.data!['total_jurnal'].toString();
          moodDominan = snapshot.data!['mood_dominan'].toString();
          sesiRelaksasi = snapshot.data!['sesi_relaksasi'].toString();
        }

        return IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _buildStatCard(
                  langNotifier.translate('total_journal'), totalJurnal, false),
              const SizedBox(width: 12),
              _buildStatCard(
                  langNotifier.translate('dominant_mood'), moodDominan, true),
              const SizedBox(width: 12),
              _buildStatCard(
                langNotifier.translate('relax_session'),
                sesiRelaksasi,
                false,
                onTap: () async {
                  await Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (_) => const RelaxationPage()),
                  );
                  _refreshData();
                },
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildStatCard(
    String title,
    String value,
    bool isPrimary, {
    VoidCallback? onTap,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 500),
          curve: Curves.easeInOut,
          padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 8),
          decoration: isPrimary
              ? BoxDecoration(
                  gradient: AppGradients.primaryButton,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primary.withOpacity(0.3),
                      offset: const Offset(0, 4),
                      blurRadius: 10,
                    ),
                  ],
                )
              : AppDecorations.card.copyWith(
                  color: isDark
                      ? AppColors.cardBackgroundDark
                      : AppColors.cardBackground,
                  border: Border.all(
                    color: isDark
                        ? AppColors.cardBorderDark
                        : AppColors.cardBorder,
                    width: 1,
                  ),
                  borderRadius: BorderRadius.circular(16),
                ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                value,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontFamily: 'Georgia',
                  fontWeight: FontWeight.w600,
                  fontSize: value.length > 7 ? 14 : 22,
                  color: isPrimary
                      ? Colors.white
                      : (isDark
                          ? AppColors.textPrimaryDark
                          : AppColors.textPrimary),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                title,
                textAlign: TextAlign.center,
                style: AppTextStyles.caption.copyWith(
                  color: isPrimary
                      ? Colors.white.withOpacity(0.9)
                      : (isDark
                          ? AppColors.textMutedDark
                          : AppColors.textMuted),
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ──────────────────────────────────────────────────────────
  // CTA CARD
  // ──────────────────────────────────────────────────────────
  Widget _buildCTACard() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final langNotifier = Provider.of<LanguageNotifier>(context);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      decoration: AppDecorations.ctaCard(isDark),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  langNotifier.translate('start_journal'),
                  style: AppTextStyles.titleLG.copyWith(
                    color: isDark
                        ? AppColors.primaryLight
                        : AppColors.primary,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  langNotifier.translate('journal_desc'),
                  style: AppTextStyles.bodySM.copyWith(
                    color: isDark
                        ? AppColors.textSecondaryDark
                        : AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 16),
          ElevatedButton(
            onPressed: () => _showAddMoodBottomSheet(context),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              elevation: 0,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
              padding:
                  const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            ),
            child: Text(
              langNotifier.translate('chat_now'),
              textAlign: TextAlign.center,
              style:
                  AppTextStyles.titleSM.copyWith(color: Colors.white, fontSize: 13),
            ),
          ),
        ],
      ),
    );
  }

  // ──────────────────────────────────────────────────────────
  // MOOD CHART
  // ──────────────────────────────────────────────────────────
  Widget _buildMoodChart(LanguageNotifier langNotifier) {
    return FutureBuilder<List<dynamic>>(
      future: _moodFuture, // pakai cached future
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(
            child: Padding(
              padding: EdgeInsets.all(20),
              child: CircularProgressIndicator(),
            ),
          );
        }
        if (snapshot.hasError) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Text(langNotifier.translate('dash_error')),
            ),
          );
        }
        final data = snapshot.data ?? [];
        if (data.isEmpty) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Text(langNotifier.translate('dash_no_data')),
            ),
          );
        }
        return MoodBarChart(data: data);
      },
    );
  }

  // ──────────────────────────────────────────────────────────
  // RECOMMENDED ARTICLES
  // ──────────────────────────────────────────────────────────
  Widget _buildRecommendedArticles() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final langNotifier = Provider.of<LanguageNotifier>(context, listen: false);

    return FutureBuilder<Map<String, dynamic>>(
      future: _articlesFuture, // pakai cached future
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }

        if (snapshot.hasError ||
            !snapshot.hasData ||
            (snapshot.data!['data'] as List).isEmpty) {
          return const SizedBox.shrink();
        }

        final allArticles = snapshot.data!['data'] as List;
        final int totalCount =
            snapshot.data!['total_count'] as int? ?? allArticles.length;
        final int unreadCount =
            allArticles.where((a) => a['is_read'] != true).length;
        final previewArticles = allArticles.take(3).toList();

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  langNotifier.translate('recommended_articles'),
                  style: AppTextStyles.titleMD.copyWith(
                    color: isDark
                        ? AppColors.textPrimaryDark
                        : AppColors.textPrimary,
                  ),
                ),
                if (totalCount > 3)
                  GestureDetector(
                    onTap: () => Navigator.push(
                      context,
                      MaterialPageRoute(
                          builder: (_) =>
                              const AllRecommendedArticlesPage()),
                    ).then((_) => _refreshData()),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          langNotifier.translate('see_all'),
                          style: AppTextStyles.label
                              .copyWith(color: AppColors.primary),
                        ),
                        if (unreadCount > 0) ...[
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 7, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.primary,
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              unreadCount > 99 ? '99+' : '$unreadCount',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 16),

            // Preview 3 artikel
            ...previewArticles.map((article) {
              final bool isRead = article['is_read'] == true;
              return GestureDetector(
                onTap: () {
                  ApiService().markArticleAsRead(article['_id'] ?? '');
                  _showArticleDetail(
                    context,
                    article['judul_artikel'] ?? '',
                    article['isi_konten'] ?? '',
                  );
                  Future.delayed(
                      const Duration(milliseconds: 500), _refreshData);
                },
                child: Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  decoration: AppDecorations.card.copyWith(
                    color: isDark
                        ? AppColors.cardBackgroundDark
                        : AppColors.cardBackground,
                    border: Border.all(
                      color: isRead
                          ? (isDark
                              ? AppColors.cardBorderDark
                              : AppColors.cardBorder)
                          : AppColors.primary.withOpacity(0.4),
                      width: isRead ? 1 : 1.5,
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (article['thumbnail_url'] != null &&
                          article['thumbnail_url'].toString().isNotEmpty)
                        Stack(
                          children: [
                            ClipRRect(
                              borderRadius: const BorderRadius.only(
                                topLeft: Radius.circular(16),
                                topRight: Radius.circular(16),
                              ),
                              child: Image.network(
                                article['thumbnail_url'],
                                height: 140,
                                width: double.infinity,
                                fit: BoxFit.cover,
                                errorBuilder: (_, __, ___) =>
                                    const SizedBox.shrink(),
                              ),
                            ),
                            if (!isRead)
                              Positioned(
                                top: 10,
                                left: 10,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: AppColors.primary,
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: Text(
                                    langNotifier
                                        .translate('article_new_badge'),
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ),
                          ],
                        ),
                      Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                if (!isRead)
                                  Container(
                                    margin: const EdgeInsets.only(
                                        top: 5, right: 8),
                                    width: 8,
                                    height: 8,
                                    decoration: const BoxDecoration(
                                      color: AppColors.primary,
                                      shape: BoxShape.circle,
                                    ),
                                  ),
                                Expanded(
                                  child: Text(
                                    article['judul_artikel'] ?? '-',
                                    style: AppTextStyles.titleSM.copyWith(
                                      color: AppColors.primary,
                                      fontWeight: isRead
                                          ? FontWeight.w600
                                          : FontWeight.w700,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Text(
                              _stripHtml(article['isi_konten'] ?? ''),
                              maxLines: 3,
                              overflow: TextOverflow.ellipsis,
                              style: AppTextStyles.bodyMD.copyWith(
                                color: isDark
                                    ? AppColors.textSecondaryDark
                                    : AppColors.textSecondary,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              langNotifier.translate('read_more'),
                              style: const TextStyle(
                                color: AppColors.primary,
                                fontWeight: FontWeight.w600,
                                fontSize: 13,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }),

            // Tombol "+ N more articles"
            if (totalCount > 3)
              Padding(
                padding: const EdgeInsets.only(top: 4),
                child: GestureDetector(
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (_) => const AllRecommendedArticlesPage()),
                  ).then((_) => _refreshData()),
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    decoration: BoxDecoration(
                      border: Border.all(
                          color: AppColors.primary.withOpacity(0.3)),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          '+ ${totalCount - 3} ${langNotifier.translate('more_articles')}',
                          style: AppTextStyles.label
                              .copyWith(color: AppColors.primary),
                        ),
                        if (unreadCount > 3) ...[
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.primary.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              '${unreadCount - 3} ${langNotifier.translate('unread_label')}',
                              style: const TextStyle(
                                color: AppColors.primary,
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
              ),
          ],
        );
      },
    );
  }

  // ──────────────────────────────────────────────────────────
  // RECENT JOURNAL TITLE
  // ──────────────────────────────────────────────────────────
  Widget _buildRecentEntriesTitle() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final langNotifier = Provider.of<LanguageNotifier>(context);

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Text(
          langNotifier.translate('recent_journal'),
          style: AppTextStyles.titleMD.copyWith(
            color: isDark
                ? AppColors.textPrimaryDark
                : AppColors.textPrimary,
          ),
        ),
        GestureDetector(
          onTap: () => Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const AllJournalEntriesPage()),
          ).then((_) => _refreshData()),
          child: Text(
            langNotifier.translate('see_all'),
            style: AppTextStyles.label.copyWith(color: AppColors.primary),
          ),
        ),
      ],
    );
  }

  // ──────────────────────────────────────────────────────────
  // RECENT JOURNAL LIST
  // ──────────────────────────────────────────────────────────
  Widget _buildRecentList() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final langNotifier = Provider.of<LanguageNotifier>(context);

    return FutureBuilder<List<dynamic>>(
      future: _recentJournalFuture, // pakai cached future
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(
            child: Padding(
              padding: EdgeInsets.all(20),
              child: CircularProgressIndicator(),
            ),
          );
        }

        if (snapshot.hasError ||
            !snapshot.hasData ||
            snapshot.data!.isEmpty) {
          return Container(
            padding: const EdgeInsets.all(20),
            decoration: AppDecorations.card,
            child: Center(
              child: Text(
                langNotifier.translate('no_recent_journal'),
                style: AppTextStyles.bodyMD.copyWith(
                  color: isDark
                      ? AppColors.textMutedDark
                      : AppColors.textMuted,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          );
        }

        return Column(
          children: snapshot.data!.map((entry) {
            final mood = entry['hasil_mood'] ?? 'Netral';
            final teks = entry['teks_curhat'] ?? '-';
            final tanggal = entry['tanggal'] ?? entry['created_at'] ?? '';
            final dateLabel = _formatDate(tanggal, langNotifier);
            final moodStyle = AppMoodColors.of(mood);

            return Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(16),
              decoration: AppDecorations.card.copyWith(
                color: isDark
                    ? AppColors.cardBackgroundDark
                    : AppColors.cardBackground,
                border: Border.all(
                  color: isDark
                      ? AppColors.cardBorderDark
                      : AppColors.cardBorder,
                  width: 1,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _MoodBadge(mood: mood, moodStyle: moodStyle),
                      Text(
                        dateLabel,
                        style: AppTextStyles.caption.copyWith(
                          color: isDark
                              ? AppColors.textMutedDark
                              : AppColors.textMuted,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    teks,
                    style: AppTextStyles.bodyMD.copyWith(
                      color: isDark
                          ? AppColors.textSecondaryDark
                          : AppColors.textSecondary,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            );
          }).toList(),
        );
      },
    );
  }

  // ──────────────────────────────────────────────────────────
  // ADD MOOD BOTTOM SHEET
  // ──────────────────────────────────────────────────────────
  void _showAddMoodBottomSheet(BuildContext context) {
    int selectedScore = 3;
    String selectedMoodLabelKey = 'mood_neutral';
    String selectedMoodValue = 'Netral';
    final noteController = TextEditingController();
    bool isLoading = false;

    final moodOptions = [
      {'moodKey': 'mood_v_sad',  'mood': 'Sangat Sedih', 'score': 1, 'emoji': '😭', 'color': Colors.grey[400]!},
      {'moodKey': 'mood_sad',    'mood': 'Sedih',        'score': 2, 'emoji': '😔', 'color': Colors.blueGrey[300]!},
      {'moodKey': 'mood_neutral','mood': 'Netral',        'score': 3, 'emoji': '😐', 'color': Colors.deepPurple[200]!},
      {'moodKey': 'mood_happy',  'mood': 'Senang',       'score': 4, 'emoji': '😊', 'color': Colors.deepPurple[400]!},
      {'moodKey': 'mood_v_happy','mood': 'Sangat Senang','score': 5, 'emoji': '😁', 'color': Colors.deepPurple},
    ];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) {
          final isDark = Theme.of(context).brightness == Brightness.dark;
          final lang = Provider.of<LanguageNotifier>(context, listen: false);

          return Container(
            padding: EdgeInsets.only(
              bottom: MediaQuery.of(context).viewInsets.bottom + 24,
              top: 24,
              left: 24,
              right: 24,
            ),
            decoration: BoxDecoration(
              color: Theme.of(context).scaffoldBackgroundColor,
              borderRadius:
                  const BorderRadius.vertical(top: Radius.circular(24)),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 5,
                    decoration: BoxDecoration(
                      color: Colors.grey[300],
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                Text(
                  lang.translate('how_feel_now'),
                  style: AppTextStyles.titleMD.copyWith(
                    color: isDark
                        ? AppColors.textPrimaryDark
                        : AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: moodOptions.map((option) {
                    final bool isSelected =
                        selectedScore == option['score'];
                    return GestureDetector(
                      onTap: () => setModalState(() {
                        selectedScore = option['score'] as int;
                        selectedMoodValue = option['mood'] as String;
                        selectedMoodLabelKey = option['moodKey'] as String;
                      }),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? (option['color'] as Color).withOpacity(0.2)
                              : Colors.transparent,
                          border: Border.all(
                            color: isSelected
                                ? (option['color'] as Color)
                                : Colors.grey[300]!,
                            width: isSelected ? 2 : 1,
                          ),
                          shape: BoxShape.circle,
                        ),
                        child: Text(
                          option['emoji'] as String,
                          style:
                              TextStyle(fontSize: isSelected ? 32 : 24),
                        ),
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 12),
                Center(
                  child: Text(
                    lang.translate(selectedMoodLabelKey),
                    style: AppTextStyles.bodyMD.copyWith(
                      color: moodOptions.firstWhere(
                            (e) => e['score'] == selectedScore,
                          )['color'] as Color,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                TextField(
                  controller: noteController,
                  maxLines: 3,
                  decoration: InputDecoration(
                    hintStyle: TextStyle(
                      color: isDark
                          ? AppColors.textMutedDark
                          : AppColors.textMuted,
                    ),
                    filled: true,
                    fillColor: isDark
                        ? AppColors.inputFillDark
                        : Colors.grey[100],
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: BorderSide.none,
                    ),
                    contentPadding: const EdgeInsets.all(16),
                  ),
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: isLoading
                        ? null
                        : () async {
                            setModalState(() => isLoading = true);
                            try {
                              await ApiService().saveMood(
                                selectedMoodValue,
                                selectedScore,
                                noteController.text,
                              );
                              if (context.mounted) {
                                Navigator.pop(context);
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text(
                                        lang.translate('mood_saved_snack')),
                                    backgroundColor: Colors.green,
                                    behavior: SnackBarBehavior.floating,
                                    duration: const Duration(seconds: 2),
                                  ),
                                );
                                // Refresh dashboard setelah simpan mood
                                _refreshData();
                                await Future.delayed(
                                    const Duration(seconds: 2));
                                widget.onNavigateToJournal
                                    ?.call(noteController.text);
                              }
                            } catch (e) {
                              setModalState(() => isLoading = false);
                              if (context.mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text(e.toString()),
                                    backgroundColor: Colors.red,
                                  ),
                                );
                              }
                            }
                          },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16)),
                      elevation: 0,
                    ),
                    child: isLoading
                        ? const SizedBox(
                            width: 24,
                            height: 24,
                            child: CircularProgressIndicator(
                              color: Colors.white,
                              strokeWidth: 2,
                            ),
                          )
                        : Text(
                            lang.translate('save'),
                            style: AppTextStyles.titleSM
                                .copyWith(color: Colors.white),
                          ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

// ============================================================
// STAGGERED FADE IN UP
// ============================================================
class _StaggeredFadeInUp extends StatelessWidget {
  final Widget child;
  final int index;
  final AnimationController controller;

  const _StaggeredFadeInUp({
    required this.child,
    required this.index,
    required this.controller,
  });

  @override
  Widget build(BuildContext context) {
    final start = (index * 0.1).clamp(0.0, 1.0);
    final end = (start + 0.4).clamp(0.0, 1.0);

    final curved = CurvedAnimation(
      parent: controller,
      curve: Interval(start, end, curve: Curves.easeOutCubic),
    );

    final opacity = Tween<double>(begin: 0.0, end: 1.0).animate(curved);
    final translateY = Tween<double>(begin: 20.0, end: 0.0).animate(curved);

    return AnimatedBuilder(
      animation: controller,
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
}

// ============================================================
// MOOD BAR CHART
// ============================================================
class MoodBarChart extends StatefulWidget {
  final List<dynamic> data;
  const MoodBarChart({super.key, required this.data});

  @override
  State<MoodBarChart> createState() => _MoodBarChartState();
}

class _MoodBarChartState extends State<MoodBarChart> {
  int? _selectedIndex;

  List<Map<String, dynamic>> get _parsedData {
    return widget.data.reversed.map((item) {
      String dayStr = '-';
      final dateRaw = item['tanggal'] ?? item['created_at'];
      if (dateRaw != null) {
        try {
          dayStr = '${DateTime.parse(dateRaw.toString()).day}';
        } catch (_) {
          dayStr = '?';
        }
      }

      int level = 3;
      if (item['score'] != null) {
        level = int.tryParse(item['score'].toString()) ?? 3;
      }

      final mood = item['mood']?.toString() ??
          item['hasil_mood']?.toString() ??
          'Netral';

      return {'day': dayStr, 'level': level, 'mood': mood};
    }).toList();
  }

  Color _barColor(int level) {
    switch (level) {
      case 5: return Colors.deepPurple;
      case 4: return Colors.deepPurple[400]!;
      case 3: return Colors.deepPurple[200]!;
      case 2: return Colors.blueGrey[300]!;
      case 1: return Colors.grey[400]!;
      default: return Colors.deepPurple[200]!;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final langNotifier = Provider.of<LanguageNotifier>(context);
    const double maxBarHeight = 120.0;

    return Container(
      width: MediaQuery.of(context).size.width - 40,
      padding: const EdgeInsets.all(20),
      decoration: AppDecorations.card.copyWith(
        color: isDark ? AppColors.cardBackgroundDark : AppColors.cardBackground,
        border: Border.all(
          color: isDark ? AppColors.cardBorderDark : AppColors.cardBorder,
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            langNotifier.translate('weekly_mood_trend'),
            style: AppTextStyles.titleMD.copyWith(
              color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 200,
            child: Stack(
              children: [
                // Grid lines
                Positioned(
                  top: 30, left: 0, right: 0, bottom: 30,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: List.generate(
                      5,
                      (_) => Container(height: 1, color: AppColors.cardBorder),
                    ),
                  ),
                ),
                // Bars
                Positioned.fill(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: List.generate(_parsedData.length, (index) {
                      final item = _parsedData[index];
                      final int level = item['level'] as int;
                      final targetHeight = maxBarHeight * (level / 5.0);
                      final isSelected = _selectedIndex == index;
                      final color = _barColor(level);

                      return Expanded(
                        child: GestureDetector(
                          onTap: () => setState(() {
                            _selectedIndex = isSelected ? null : index;
                          }),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            mainAxisAlignment: MainAxisAlignment.end,
                            children: [
                              // Tooltip
                              AnimatedOpacity(
                                duration: const Duration(milliseconds: 200),
                                opacity: isSelected ? 1.0 : 0.0,
                                child: Container(
                                  margin: const EdgeInsets.only(bottom: 6),
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 4, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: isDark
                                        ? AppColors.textPrimaryDark
                                        : AppColors.textPrimary,
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    item['mood'] as String,
                                    textAlign: TextAlign.center,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 9,
                                      fontWeight: FontWeight.bold,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ),
                              // Bar
                              TweenAnimationBuilder<double>(
                                tween: Tween(begin: 0.0, end: 1.0),
                                duration: const Duration(milliseconds: 1000),
                                curve: Curves.elasticOut,
                                builder: (_, value, __) => AnimatedContainer(
                                  duration: const Duration(milliseconds: 300),
                                  width: 20,
                                  height: targetHeight * value,
                                  decoration: BoxDecoration(
                                    color: color,
                                    borderRadius: const BorderRadius.only(
                                      topLeft: Radius.circular(12),
                                      topRight: Radius.circular(12),
                                      bottomLeft: Radius.circular(4),
                                      bottomRight: Radius.circular(4),
                                    ),
                                    border: Border.all(
                                      color: isSelected
                                          ? Colors.white
                                          : color.withOpacity(0.5),
                                      width: isSelected ? 2.0 : 1.0,
                                    ),
                                    boxShadow: isSelected
                                        ? [
                                            BoxShadow(
                                              color: color.withOpacity(0.6),
                                              blurRadius: 10,
                                              offset: const Offset(0, 4),
                                            ),
                                          ]
                                        : [],
                                  ),
                                ),
                              ),
                              const SizedBox(height: 12),
                              // Date label
                              Text(
                                item['day'] as String,
                                style: AppTextStyles.caption.copyWith(
                                  fontWeight: isSelected
                                      ? FontWeight.w700
                                      : FontWeight.w500,
                                  color: isSelected
                                      ? AppColors.primary
                                      : (isDark
                                          ? AppColors.textMutedDark
                                          : AppColors.textMuted),
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    }),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}