import 'dart:ui';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:provider/provider.dart';
import '../theme/app_theme.dart';
import '../theme/language_notifier.dart';
import 'relaxation_page.dart';
import '../services/api_service.dart';

class DashboardPage extends StatefulWidget {
  final Function(String?)? onNavigateToJournal;
  const DashboardPage({super.key, this.onNavigateToJournal});

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage>
    with TickerProviderStateMixin {
  late AnimationController _blobAnimController;
  late AnimationController _staggeredController;
  String userName = "Pengguna";
  String? _profileImageUrl;

  Future<void> _loadProfileData() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      userName = prefs.getString('nama_lengkap') ?? "Pengguna";
      _profileImageUrl = prefs.getString('profile_image_url');
    });
  }

  @override
  void initState() {
    super.initState();
    _loadProfileData();
    _blobAnimController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 10),
    )..repeat(reverse: true);

    _staggeredController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    );

    // Mulai animasi masuk (staggered) segera setelah frame pertama di-render
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

  Future<void> _refreshData() async {
    // Karena arsitektur menggunakan pemanggilan Future statis (inline) di FutureBuilder,
    // kita sekadar melakukan setState untuk memicu re-render dan menunda penyelesaian RefreshIndicator
    // agar animasi loading alamiah dari FutureBuilder berkesempatan tampil dan diproses tuntas.
    await _loadProfileData(); // Tarik ulang foto dan nama jika berubah
    setState(() {});
    await Future.delayed(const Duration(milliseconds: 800));
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final langNotifier = Provider.of<LanguageNotifier>(context);
    int animIndex =
        0; // Digunakan secara inkremental untuk animasi staggered per elemen

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: Stack(
        children: [
          // Latar belakang: Animasi Blobs melayang pelan secara diagonal
          RepaintBoundary(child: _buildAnimatedBlobs()),

          // Konten Utama
          SafeArea(
            child: RefreshIndicator(
              color: AppColors.primary,
              backgroundColor: AppColors.cardBackground,
              onRefresh: _refreshData,
              child: SingleChildScrollView(
                physics:
                    const AlwaysScrollableScrollPhysics(), // Supaya konten selalu bisa ditarik meskipun pendek
                padding: const EdgeInsets.symmetric(
                  horizontal: 20,
                  vertical: 24,
                ),
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
                      child: FutureBuilder<List<dynamic>>(
                        future: ApiService().fetchMoodStats(),
                        builder: (context, snapshot) {
                          if (snapshot.connectionState ==
                              ConnectionState.waiting) {
                            return const Center(
                              child: Padding(
                                padding: EdgeInsets.all(20.0),
                                child: CircularProgressIndicator(),
                              ),
                            );
                          }
                          if (snapshot.hasError) {
                            return Center(
                              child: Padding(
                                padding: const EdgeInsets.all(20.0),
                                child: Text(langNotifier.translate('dash_error')),
                              ),
                            );
                          }
                          if (snapshot.hasData) {
                            final data = snapshot.data!;
                            if (data.isEmpty) {
                              return Center(
                                child: Padding(
                                  padding: const EdgeInsets.all(20.0),
                                  child: Text(langNotifier.translate('dash_no_data')),
                                ),
                              );
                            }
                            return MoodBarChart(data: data);
                          }
                          return const SizedBox.shrink();
                        },
                      ),
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
          ), // Penutup SafeArea yang tadinya tertelan oleh RefreshIndicator
        ],
      ),
    );
  }

  void _showAddMoodBottomSheet(BuildContext context) {
    int selectedScore = 3; // Default Netral
    String selectedMoodLabelKey = "mood_neutral";
    String selectedMoodValue = "Netral";
    final TextEditingController noteController = TextEditingController();
    bool isLoading = false;

    final moodOptions = [
      {
        "moodKey": "mood_v_sad",
        "mood": "Sangat Sedih",
        "score": 1,
        "emoji": "😭",
        "color": Colors.grey[400]!,
      },
      {
        "moodKey": "mood_sad",
        "mood": "Sedih",
        "score": 2,
        "emoji": "😔",
        "color": Colors.blueGrey[300]!,
      },
      {
        "moodKey": "mood_neutral",
        "mood": "Netral",
        "score": 3,
        "emoji": "😐",
        "color": Colors.deepPurple[200]!,
      },
      {
        "moodKey": "mood_happy",
        "mood": "Senang",
        "score": 4,
        "emoji": "😊",
        "color": Colors.deepPurple[400]!,
      },
      {
        "moodKey": "mood_v_happy",
        "mood": "Sangat Senang",
        "score": 5,
        "emoji": "😁",
        "color": Colors.deepPurple,
      },
    ];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            final isDark = Theme.of(context).brightness == Brightness.dark;
            final langNotifier = Provider.of<LanguageNotifier>(context, listen: false);
            return Container(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).viewInsets.bottom + 24,
                top: 24,
                left: 24,
                right: 24,
              ),
              decoration: BoxDecoration(
                color: Theme.of(context).scaffoldBackgroundColor,
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(24),
                ),
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
                    langNotifier.translate('how_feel_now'),
                    style: AppTextStyles.titleMD.copyWith(
                      color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: moodOptions.map((option) {
                      final bool isSelected = selectedScore == option["score"];
                      return GestureDetector(
                        onTap: () {
                          setModalState(() {
                            selectedScore = option["score"] as int;
                            selectedMoodValue = option["mood"] as String;
                            selectedMoodLabelKey = option["moodKey"] as String;
                          });
                        },
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? (option["color"] as Color).withOpacity(0.2)
                                : Colors.transparent,
                            border: Border.all(
                              color: isSelected
                                  ? (option["color"] as Color)
                                  : Colors.grey[300]!,
                              width: isSelected ? 2 : 1,
                            ),
                            shape: BoxShape.circle,
                          ),
                          child: Text(
                            option["emoji"] as String,
                            style: TextStyle(fontSize: isSelected ? 32 : 24),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 12),
                  Center(
                    child: Text(
                      langNotifier.translate(selectedMoodLabelKey),
                      style: AppTextStyles.bodyMD.copyWith(
                        color:
                            moodOptions.firstWhere(
                                  (e) => e["score"] == selectedScore,
                                )["color"]
                                as Color,
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
                                        langNotifier.translate('mood_saved_snack'),
                                      ),
                                      backgroundColor: Colors.green,
                                      behavior: SnackBarBehavior.floating,
                                      duration: Duration(seconds: 2),
                                    ),
                                  );
                                  setState(() {});
                                  // Arahkan ke tab Jurnal setelah 2 detik, bawa teksnya
                                  await Future.delayed(
                                    const Duration(seconds: 2),
                                  );
                                  widget.onNavigateToJournal?.call(
                                    noteController.text,
                                  );
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
                          borderRadius: BorderRadius.circular(16),
                        ),
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
                              langNotifier.translate('save'),
                              style: AppTextStyles.titleSM.copyWith(
                                color: Colors.white,
                              ),
                            ),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
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
            // Blob Ungu
            Positioned(
              top: -50 + moveYPurple,
              right: -50 + moveXPurple,
              child: Container(
                width: 300,
                height: 300,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.blobPurple.withOpacity(pulsePurple),
                ),
              ),
            ),
            // Blob Hijau
            Positioned(
              bottom: 150 + moveYGreen,
              left: -50 + moveXGreen,
              child: Container(
                width: 250,
                height: 250,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.blobGreen.withOpacity(pulseGreen),
                ),
              ),
            ),
            // Kaca (Blur)
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

  Widget _buildHeader() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final langNotifier = Provider.of<LanguageNotifier>(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.primaryBorder,
                image: _profileImageUrl != null && _profileImageUrl!.isNotEmpty
                    ? DecorationImage(
                        image: NetworkImage(_profileImageUrl!),
                        fit: BoxFit.cover,
                      )
                    : null,
              ),
              child: _profileImageUrl == null || _profileImageUrl!.isEmpty
                  ? const Icon(Icons.person, color: AppColors.primary, size: 32)
                  : null,
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  RichText(
                    text: TextSpan(
                      style: AppTextStyles.headingMD.copyWith(
                        color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
                      ),
                      children: [
                        TextSpan(text: "${langNotifier.translate('welcome')},\n"),
                        TextSpan(
                          text: userName,
                          style: AppTextStyles.headingMD.copyWith(
                            fontStyle: FontStyle.italic,
                            color: AppColors.primary,
                          ),
                        ),
                        const TextSpan(text: " 👋"),
                      ],
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    langNotifier.translate('how_feel'),
                    style: AppTextStyles.bodyMD.copyWith(
                      color: isDark ? AppColors.textMutedDark : AppColors.textMuted,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildStatsGrid() {
    final langNotifier = Provider.of<LanguageNotifier>(context);
    return FutureBuilder<Map<String, dynamic>>(
      future: ApiService().fetchDashboardStats(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: SizedBox(
                width: 24,
                height: 24,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: AppColors.primary,
                ),
              ),
            ),
          );
        }

        String totalJurnal = "0";
        String moodDominan = "Netral";
        String sesiRelaksasi = "12";

        if (snapshot.hasData && !snapshot.hasError) {
          totalJurnal = snapshot.data!['total_jurnal'].toString();
          moodDominan = snapshot.data!['mood_dominan'].toString();
          sesiRelaksasi = snapshot.data!['sesi_relaksasi'].toString();
        }

        return IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _buildStatCard(langNotifier.translate('total_journal'), totalJurnal, false),
              const SizedBox(width: 12),
              _buildStatCard(langNotifier.translate('dominant_mood'), moodDominan, true),
              const SizedBox(width: 12),
              _buildStatCard(
                langNotifier.translate('relax_session'),
                sesiRelaksasi,
                false,
                onTap: () async {
                  final result = await Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const RelaxationPage(),
                    ),
                  );
                  // Bila kembalian true artinya data berhasil disimpan
                  if (result == true) {
                    _refreshData();
                  }
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
        child: Container(
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
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontFamily: 'Georgia',
                  fontWeight: FontWeight.w600,
                  fontSize: 22,
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
                      : (isDark ? AppColors.textMutedDark : AppColors.textMuted),
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

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
                    color: isDark ? AppColors.primaryLight : AppColors.primary,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  langNotifier.translate('journal_desc'),
                  style: AppTextStyles.bodySM.copyWith(
                    color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 16),
          ElevatedButton(
            onPressed: () {
              _showAddMoodBottomSheet(context);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            ),
            child: Text(
              langNotifier.translate('chat_now'),
              textAlign: TextAlign.center,
              style: AppTextStyles.titleSM.copyWith(
                color: Colors.white,
                fontSize: 13,
              ),
            ),
          ),
        ],
      ),
    );
  }

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
            color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
          ),
        ),
        GestureDetector(
          onTap: () {
            // Navigasi ke tab Jurnal (index 1)
            widget.onNavigateToJournal?.call(null);
          },
          child: Text(
            langNotifier.translate('see_all'),
            style: AppTextStyles.label.copyWith(color: AppColors.primary),
          ),
        ),
      ],
    );
  }

  Widget _buildRecentList() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final langNotifier = Provider.of<LanguageNotifier>(context);
    return FutureBuilder<List<dynamic>>(
      future: ApiService().fetchRecentJournals(limit: 3),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(
            child: Padding(
              padding: EdgeInsets.all(20),
              child: CircularProgressIndicator(),
            ),
          );
        }

        if (snapshot.hasError || !snapshot.hasData || snapshot.data!.isEmpty) {
          return Container(
            padding: const EdgeInsets.all(20),
            decoration: AppDecorations.card,
            child: Center(
              child: Text(
                langNotifier.translate('no_recent_journal'),
                style: AppTextStyles.bodyMD.copyWith(
                  color: isDark ? AppColors.textMutedDark : AppColors.textMuted,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          );
        }

        final entries = snapshot.data!;
        return Column(
          children: entries.map((entry) {
            final mood = entry['hasil_mood'] ?? 'Netral';
            final teks = entry['teks_curhat'] ?? '-';
            final tanggal = entry['tanggal'] ?? entry['created_at'] ?? '';
            String dateLabel = tanggal;
            try {
              final dt = DateTime.parse(tanggal.toString()).toLocal();
              final now = DateTime.now();
              final diff = now.difference(dt).inDays;
              if (diff == 0) {
                dateLabel =
                    'Hari ini, ${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
              } else if (diff == 1) {
                dateLabel =
                    'Kemarin, ${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
              } else {
                dateLabel = '${dt.day}/${dt.month}/${dt.year}';
              }
            } catch (_) {}

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
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: moodStyle.background,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              moodStyle.emoji,
                              style: const TextStyle(fontSize: 12),
                            ),
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
                      ),
                      Text(
                        dateLabel,
                        style: AppTextStyles.caption.copyWith(
                          color: isDark ? AppColors.textMutedDark : AppColors.textMuted,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    teks,
                    style: AppTextStyles.bodyMD.copyWith(
                      color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondary,
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
}

/// Widget utilitas untuk animasi berurutan (Staggered Fade-In Slide Up)
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
    // Semakin besar index, semakin lambat delay mulainya
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
      builder: (context, child) {
        return Opacity(
          opacity: opacity.value,
          child: Transform.translate(
            offset: Offset(0, translateY.value),
            child: child,
          ),
        );
      },
      child: child,
    );
  }
}

class MoodBarChart extends StatefulWidget {
  final List<dynamic> data;
  const MoodBarChart({super.key, required this.data});

  @override
  State<MoodBarChart> createState() => _MoodBarChartState();
}

class _MoodBarChartState extends State<MoodBarChart> {
  int? _selectedIndex;

  List<Map<String, dynamic>> get _parsedData {
    // Membalik data karena API mengembalikan data terbaru di awal list
    var reversedData = widget.data.reversed.toList();
    return reversedData.map((item) {
      String dayStr = "-";
      var dateRaw = item['tanggal'] ?? item['created_at'];
      if (dateRaw != null) {
        try {
          DateTime dt = DateTime.parse(dateRaw.toString());
          const indonesianDays = ["", "S", "S", "R", "K", "J", "S", "M"];
          if (dt.weekday >= 1 && dt.weekday <= 7) {
            dayStr = indonesianDays[dt.weekday];
          }
        } catch (e) {
          dayStr = "?";
        }
      }

      int level = 3;
      if (item['score'] != null) {
        level = int.tryParse(item['score'].toString()) ?? 3;
      } else if (item['hasil_mood'] != null) {
        // Fallback jika pakai model Journal
        level = 3;
      }

      String mood =
          item['mood']?.toString() ??
          item['hasil_mood']?.toString() ??
          "Netral";

      return {"day": dayStr, "level": level, "mood": mood};
    }).toList();
  }

  Color _getBarColor(int level) {
    switch (level) {
      case 5:
        return Colors.deepPurple;
      case 4:
        return Colors.deepPurple[400]!;
      case 3:
        return Colors.deepPurple[200]!;
      case 2:
        return Colors.blueGrey[300]!;
      case 1:
        return Colors.grey[400]!;
      default:
        return Colors.deepPurple[200]!;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    const double maxBarHeight = 120.0;

    return Container(
      // Lebar total layar dikurangi margin/padding horizontal Dashboard (20+20 = 40)
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
            "Tren Mood Mingguan",
            style: AppTextStyles.titleMD.copyWith(
              color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 12),

          SizedBox(
            height: 200,
            child: Stack(
              children: [
                // Grid horizontal belakang
                Positioned(
                  top: 30, // Ruang atas untuk tooltip
                  left: 0,
                  right: 0,
                  bottom: 30, // Ruang bawah untuk label teks
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: List.generate(5, (index) {
                      return Container(height: 1, color: AppColors.cardBorder);
                    }),
                  ),
                ),

                // Grafik Batang Interaktif
                Positioned.fill(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: List.generate(_parsedData.length, (index) {
                      final item = _parsedData[index];
                      // Menyesuaikan rasio ketinggian maksimal (5 level)
                      final int level = item["level"] as int;
                      final double heightRatio = level / 5.0;
                      final targetHeight = maxBarHeight * heightRatio;
                      final isSelected = _selectedIndex == index;
                      final dynamicBarColor = _getBarColor(level);
                      final moodStyle = AppMoodColors.of(
                        item["mood"] as String,
                      );

                      return Expanded(
                        child: GestureDetector(
                          onTap: () {
                            // Tap memunculkan tooltip dan glow
                            setState(() {
                              _selectedIndex = isSelected ? null : index;
                            });
                          },
                          child: Column(
                            // Menambahkan expanded atau membatasi ukuran bar jika lebih besar dari maxBarHeight
                            mainAxisSize: MainAxisSize.min,
                            mainAxisAlignment: MainAxisAlignment.end,
                            children: [
                              // Tooltip Interaktif
                              AnimatedOpacity(
                                duration: const Duration(milliseconds: 200),
                                opacity: isSelected ? 1.0 : 0.0,
                                child: Container(
                                  margin: const EdgeInsets.only(bottom: 6),
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 4,
                                    vertical: 4,
                                  ),
                                  decoration: BoxDecoration(
                                    color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    item["mood"] as String,
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

                              // Bar Animasi (Elastis / Bounce dari Tween)
                              TweenAnimationBuilder<double>(
                                tween: Tween(begin: 0.0, end: 1.0),
                                duration: const Duration(milliseconds: 1000),
                                curve: Curves.elasticOut,
                                builder: (context, value, child) {
                                  return AnimatedContainer(
                                    duration: const Duration(milliseconds: 300),
                                    width:
                                        20, // Lebar batang sedikit dirampingkan lagi
                                    height:
                                        targetHeight *
                                        value, // Tingginya membal
                                    decoration: BoxDecoration(
                                      color:
                                          dynamicBarColor, // Warna dinamis sesuai score level
                                      borderRadius: const BorderRadius.only(
                                        topLeft: Radius.circular(12),
                                        topRight: Radius.circular(12),
                                        bottomLeft: Radius.circular(4),
                                        bottomRight: Radius.circular(4),
                                      ),
                                      border: Border.all(
                                        color: isSelected
                                            ? Colors.white
                                            : dynamicBarColor.withOpacity(0.5),
                                        width: isSelected ? 2.0 : 1.0,
                                      ),
                                      boxShadow: isSelected
                                          ? [
                                              BoxShadow(
                                                color: dynamicBarColor
                                                    .withOpacity(0.6),
                                                blurRadius: 10,
                                                offset: const Offset(0, 4),
                                              ),
                                            ]
                                          : [],
                                    ),
                                  );
                                },
                              ),
                              const SizedBox(height: 12),
                              // Label Bawah (Hari)
                              Text(
                                item["day"] as String,
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
