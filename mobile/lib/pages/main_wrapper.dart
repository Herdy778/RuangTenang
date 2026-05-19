import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../theme/language_notifier.dart';
import '../theme/app_theme.dart';
import 'dashboard_page.dart';
import 'journal_page.dart';
import 'chat_page.dart';
import 'profile_page.dart';

class MainWrapper extends StatefulWidget {
  const MainWrapper({super.key});

  @override
  State<MainWrapper> createState() => _MainWrapperState();
}

class _MainWrapperState extends State<MainWrapper> {
  int _currentIndex = 0;
  String? _journalInitialNote;

  void _navigateToJournal([String? note]) {
    setState(() {
      _currentIndex = 1;
      _journalInitialNote = note;
    });
    // Bersihkan setelah dipakai agar tidak tersisa saat buka Jurnal berikutnya
    Future.delayed(const Duration(milliseconds: 500), () {
      if (mounted) setState(() => _journalInitialNote = null);
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      extendBody: true,
      // Kita buat body menjadi Stack agar background bisa diletakkan di layer paling bawah
      body: Stack(
        children: [
          // LAYER 1: Background tunggal yang bertransisi smooth
          Positioned.fill(
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 600),
              curve: Curves.easeInOut,
              color: isDark ? AppColors.backgroundDark : AppColors.background,
            ),
          ),
          
          // LAYER 2: Halaman utama (Dashboard, Jurnal, dll)
          IndexedStack(
            index: _currentIndex,
            children: [
              DashboardPage(
                key: const ValueKey('dashboard'),
                onNavigateToJournal: _navigateToJournal,
              ),
              JournalPage(
                key: const ValueKey('journal'),
                initialNote: _journalInitialNote,
              ),
              const ChatAiPage(key: ValueKey('chat')),
              const ProfilePage(key: ValueKey('profile')),
            ],
          ),
        ],
      ),
      bottomNavigationBar: _buildBottomNav(),
    );
  }

  Widget _buildBottomNav() {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return AnimatedContainer(
      duration: const Duration(milliseconds: 500),
      curve: Curves.easeInOut,
      decoration: BoxDecoration(
        boxShadow: [
          BoxShadow(
            color: isDark ? Colors.black45 : const Color(0x0A000000),
            blurRadius: 20,
            offset: const Offset(0, -5),
          ),
        ],
      ),
      child: ClipRRect(
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 500),
            curve: Curves.easeInOut,
            color: (isDark ? AppColors.cardBackgroundDark : Colors.white)
                .withOpacity(0.85),
            child: BottomNavigationBar(
              currentIndex: _currentIndex,
              onTap: (index) {
                setState(() {
                  _currentIndex = index;
                });
              },
              backgroundColor: Colors.transparent,
              elevation: 0,
              type: BottomNavigationBarType.fixed,
              selectedItemColor: isDark ? AppColors.primaryLight : AppColors.primary,
              unselectedItemColor: isDark ? AppColors.textMutedDark : AppColors.textMuted,
              selectedLabelStyle: AppTextStyles.label.copyWith(
                fontSize: 12,
                fontWeight: FontWeight.w600,
              ),
              unselectedLabelStyle: AppTextStyles.caption.copyWith(
                fontSize: 12,
              ),
              items: [
                BottomNavigationBarItem(
                  icon: const Icon(Icons.grid_view_rounded),
                  label: Provider.of<LanguageNotifier>(context).translate('tab_home'),
                ),
                BottomNavigationBarItem(
                  icon: const Icon(Icons.book_rounded),
                  label: Provider.of<LanguageNotifier>(context).translate('tab_journal'),
                ),
                BottomNavigationBarItem(
                  icon: const Icon(Icons.chat_bubble_rounded),
                  label: Provider.of<LanguageNotifier>(context).translate('tab_chat'),
                ),
                BottomNavigationBarItem(
                  icon: const Icon(Icons.person_rounded),
                  label: Provider.of<LanguageNotifier>(context).translate('tab_profile'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
