import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../theme/app_theme.dart';
import '../theme/language_notifier.dart';

class HelpCenterPage extends StatelessWidget {
  const HelpCenterPage({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final langNotifier = Provider.of<LanguageNotifier>(context);

    return Scaffold(
      backgroundColor: isDark ? AppColors.backgroundDark : Colors.white,
      appBar: AppBar(
        title: Text(langNotifier.translate('help_center'), style: AppTextStyles.headingMD),
        centerTitle: true,
        backgroundColor: isDark ? AppColors.cardBackgroundDark : Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new_rounded, 
            color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 32),
            Text(
              langNotifier.translate('faq_popular'),
              style: AppTextStyles.titleMD.copyWith(
                color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 16),
            _buildFAQItem(
              langNotifier.translate('faq_1_q'),
              langNotifier.translate('faq_1_a'),
              isDark,
            ),
            _buildFAQItem(
              langNotifier.translate('faq_2_q'),
              langNotifier.translate('faq_2_a'),
              isDark,
            ),
            _buildFAQItem(
              langNotifier.translate('faq_3_q'),
              langNotifier.translate('faq_3_a'),
              isDark,
            ),
            _buildFAQItem(
              langNotifier.translate('faq_4_q'),
              langNotifier.translate('faq_4_a'),
              isDark,
            ),
            const SizedBox(height: 40),
            _buildContactSection(context, isDark),
          ],
        ),
      ),
    );
  }

  Widget _buildFAQItem(String question, String answer, bool isDark) {
    return Theme(
      data: ThemeData(dividerColor: Colors.transparent),
      child: ExpansionTile(
        tilePadding: EdgeInsets.zero,
        title: Text(
          question,
          style: AppTextStyles.bodyMD.copyWith(
            fontWeight: FontWeight.w600,
            color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
          ),
        ),
        children: [
          Padding(
            padding: const EdgeInsets.only(bottom: 16.0),
            child: Text(
              answer,
              style: AppTextStyles.bodySM.copyWith(
                color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondary,
                height: 1.5,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContactSection(BuildContext context, bool isDark) {
    final langNotifier = Provider.of<LanguageNotifier>(context);
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: AppGradients.primaryButton,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        children: [
          Text(
            langNotifier.translate('still_need_help'),
            style: const TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            langNotifier.translate('team_ready'),
            style: const TextStyle(color: Colors.white70, fontSize: 14),
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              Expanded(
                child: _buildContactButton(
                  icon: Icons.email_outlined,
                  label: 'Email',
                  onTap: () {
                    // This will be more effective on a real device
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Membuka aplikasi Email... (support@ruangtenang.com)')),
                    );
                  },
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildContactButton(
                  icon: Icons.chat_bubble_outline_rounded,
                  label: 'Chat',
                  onTap: () {
                    // Navigate to ChatPage (index 2 in the main scaffold stack)
                    Navigator.popUntil(context, (route) => route.isFirst);
                    // This assumes the user is using the main scaffold's navigation
                    // For now, let's just show a snackbar or go to a specific page if available
                     ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Beralih ke Ruang Curhat AI...')),
                    );
                  },
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildContactButton({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.2),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: Colors.white, size: 20),
            const SizedBox(width: 8),
            Text(
              label,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
