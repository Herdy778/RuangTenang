import 'dart:ui';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import 'chat_page.dart';

class DashboardPage extends StatefulWidget {
  const DashboardPage({super.key});

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> with TickerProviderStateMixin {
  late AnimationController _blobAnimController;
  late AnimationController _staggeredController;

  @override
  void initState() {
    super.initState();
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

  @override
  Widget build(BuildContext context) {
    int animIndex = 0; // Digunakan secara inkremental untuk animasi staggered per elemen

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Stack(
        children: [
          // Latar belakang: Animasi Blobs melayang pelan secara diagonal
          _buildAnimatedBlobs(),

          // Konten Utama
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
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
                    child: const MoodBarChart(),
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
        ],
      ),
    );
  }

  Widget _buildAnimatedBlobs() {
    return AnimatedBuilder(
      animation: _blobAnimController,
      builder: (context, child) {
        final double moveYPurple = math.sin(_blobAnimController.value * math.pi) * 30;
        final double moveXPurple = math.cos(_blobAnimController.value * math.pi) * 30;

        final double moveYGreen = math.cos(_blobAnimController.value * math.pi) * 30;
        final double moveXGreen = math.sin(_blobAnimController.value * math.pi) * 30;

        final double pulsePurple = 0.15 + (math.sin(_blobAnimController.value * math.pi) * 0.05);
        final double pulseGreen = 0.10 + (math.cos(_blobAnimController.value * math.pi) * 0.05);

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
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                gradient: AppGradients.avatarGradient,
              ),
              child: const Icon(Icons.person_rounded, color: Colors.white, size: 28),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  RichText(
                    text: TextSpan(
                      style: AppTextStyles.headingMD,
                      children: [
                        const TextSpan(text: "Selamat datang kembali,\n"),
                        TextSpan(
                          text: "Herdy",
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
                    "Bagaimana perasaanmu hari ini?",
                    style: AppTextStyles.bodyMD.copyWith(color: AppColors.textMuted),
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
    return Row(
      children: [
        _buildStatCard("Total Jurnal", "24", false),
        const SizedBox(width: 12),
        _buildStatCard("Mood Dominan", "Netral", true),
        const SizedBox(width: 12),
        _buildStatCard("Sesi Relaksasi", "12", false),
      ],
    );
  }

  Widget _buildStatCard(String title, String value, bool isPrimary) {
    return Expanded(
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
                  )
                ],
              )
            : AppDecorations.card.copyWith(
                borderRadius: BorderRadius.circular(16),
              ),
        child: Column(
          children: [
            Text(
              value,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontFamily: 'Georgia',
                fontWeight: FontWeight.w600,
                fontSize: 22,
                color: isPrimary ? Colors.white : AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              title,
              textAlign: TextAlign.center,
              style: AppTextStyles.caption.copyWith(
                color: isPrimary ? Colors.white.withOpacity(0.9) : AppColors.textMuted,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCTACard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      decoration: AppDecorations.ctaCard,
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "Mulai Jurnal Baru",
                  style: AppTextStyles.titleLG.copyWith(color: AppColors.primary),
                ),
                const SizedBox(height: 6),
                Text(
                  "Curahkan isi hatimu hari ini agar pikiran lebih tenang.",
                  style: AppTextStyles.bodySM.copyWith(color: AppColors.textSecondary),
                ),
              ],
            ),
          ),
          const SizedBox(width: 16),
          ElevatedButton(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const ChatAiPage()),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            ),
            child: Text(
              "Curhat\nSekarang", 
              textAlign: TextAlign.center,
              style: AppTextStyles.titleSM.copyWith(color: Colors.white, fontSize: 13),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRecentEntriesTitle() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Text("Jurnal Terbaru", style: AppTextStyles.titleMD),
        Text("Lihat Semua", style: AppTextStyles.label.copyWith(color: AppColors.primary)),
      ],
    );
  }

  Widget _buildRecentList() {
    // Dummy Data
    final recentEntries = [
      {
        "mood": "Cemas",
        "date": "Hari ini, 09:41",
        "text": "Saya merasa sedikit gelisah mengenai presentasi besok pagi. Saya harap semuanya berjalan lancar tanpa kendala."
      },
      {
        "mood": "Netral",
        "date": "Kemarin, 20:15",
        "text": "Hari yang cukup biasa. Pekerjaan selesai tepat waktu dan cuaca cukup cerah."
      },
    ];

    return Column(
      children: recentEntries.map((entry) {
        final moodStyle = AppMoodColors.of(entry["mood"]!);
        
        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: AppDecorations.card,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Mood Badge (Pill-shaped)
                  Container(
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
                          entry["mood"]!,
                          style: AppTextStyles.label.copyWith(
                            color: moodStyle.textColor,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Text(
                    entry["date"]!,
                    style: AppTextStyles.caption,
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                entry["text"]!,
                style: AppTextStyles.bodyMD,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        );
      }).toList(),
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
  const MoodBarChart({super.key});

  @override
  State<MoodBarChart> createState() => _MoodBarChartState();
}

class _MoodBarChartState extends State<MoodBarChart> {
  int? _selectedIndex;

  // Level 1-5 untuk chart tinggi
  final List<Map<String, dynamic>> _data = [
    {"day": "S", "level": 3, "mood": "Netral"},
    {"day": "S", "level": 2, "mood": "Sedih"},
    {"day": "R", "level": 4, "mood": "Cemas"},
    {"day": "K", "level": 4, "mood": "Netral"},
    {"day": "J", "level": 3, "mood": "Cemas"},
    {"day": "S", "level": 5, "mood": "Netral"}, // Asumsi nilai puncak 5
    {"day": "M", "level": 4, "mood": "Cemas"},
  ];

  @override
  Widget build(BuildContext context) {
    const double maxBarHeight = 120.0;
    
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: AppDecorations.card,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text("Tren Mood Mingguan", style: AppTextStyles.titleMD),
          const SizedBox(height: 12),
          
          SizedBox(
            height: 180, 
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
                      return Container(
                        height: 1,
                        color: AppColors.cardBorder,
                      );
                    }),
                  ),
                ),
                
                // Grafik Batang Interaktif
                Positioned.fill(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: List.generate(_data.length, (index) {
                      final item = _data[index];
                      // Menyesuaikan rasio ketinggian maksimal (5 level)
                      final double heightRatio = (item["level"] as int) / 5.0;
                      final targetHeight = maxBarHeight * heightRatio;
                      final isSelected = _selectedIndex == index;
                      final moodStyle = AppMoodColors.of(item["mood"] as String);

                      return GestureDetector(
                        onTap: () {
                          // Tap memunculkan tooltip dan glow
                          setState(() {
                            _selectedIndex = isSelected ? null : index;
                          });
                        },
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            // Tooltip Interaktif
                            AnimatedOpacity(
                              duration: const Duration(milliseconds: 200),
                              opacity: isSelected ? 1.0 : 0.0,
                              child: Container(
                                margin: const EdgeInsets.only(bottom: 6),
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                                decoration: BoxDecoration(
                                  color: AppColors.textPrimary,
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  item["mood"] as String,
                                  style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                                  overflow: TextOverflow.visible,
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
                                  width: 32,
                                  height: targetHeight * value, // Tingginya membal (bounce up)
                                  decoration: BoxDecoration(
                                    color: moodStyle.background,
                                    borderRadius: const BorderRadius.only(
                                      topLeft: Radius.circular(12),
                                      topRight: Radius.circular(12),
                                      bottomLeft: Radius.circular(4),
                                      bottomRight: Radius.circular(4),
                                    ),
                                    border: Border.all(
                                      color: isSelected ? moodStyle.textColor : moodStyle.textColor.withOpacity(0.5),
                                      width: isSelected ? 2.0 : 1.5,
                                    ),
                                    boxShadow: isSelected
                                        ? [
                                            BoxShadow(
                                              color: moodStyle.textColor.withOpacity(0.4),
                                              blurRadius: 10,
                                              offset: const Offset(0, 4),
                                            )
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
                                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                                color: isSelected ? AppColors.textPrimary : AppColors.textMuted,
                              ),
                            ),
                          ],
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
