import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../theme/app_theme.dart';
import '../theme/language_notifier.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'package:ruangtenang_mobile/config/app_config.dart'; // FIX 1: Tambah import AppConfig

class PrivacySecurityPage extends StatelessWidget {
  const PrivacySecurityPage({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final langNotifier = Provider.of<LanguageNotifier>(context);

    return Scaffold(
      backgroundColor: isDark ? AppColors.backgroundDark : Colors.white,
      appBar: AppBar(
        title: Text(
          langNotifier.translate('privacy_title'),
          style: AppTextStyles.headingMD,
        ),
        centerTitle: true,
        backgroundColor:
            isDark ? AppColors.cardBackgroundDark : Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: Icon(
            Icons.arrow_back_ios_new_rounded,
            color: isDark
                ? AppColors.textPrimaryDark
                : AppColors.textPrimary,
          ),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildSectionHeader(
                langNotifier.translate('data_privacy'), isDark),
            _buildInfoCard(
              icon: Icons.delete_forever_outlined,
              title: langNotifier.translate('delete_data'),
              description: langNotifier.translate('delete_data_desc'),
              isDark: isDark,
              textColor: Colors.redAccent,
              onTap: () => _showDeleteConfirmation(context, langNotifier),
            ),
            const SizedBox(height: 32),
            _buildSectionHeader(langNotifier.translate('legal'), isDark),
            ListTile(
              contentPadding: EdgeInsets.zero,
              title: Text(
                langNotifier.translate('tos'),
                style: AppTextStyles.bodyMD.copyWith(
                  color: isDark
                      ? AppColors.textPrimaryDark
                      : AppColors.textPrimary,
                ),
              ),
              trailing: const Icon(Icons.chevron_right_rounded),
              onTap: () {
                showDialog(
                  context: context,
                  builder: (context) => AlertDialog(
                    title: Text(langNotifier.translate('tos')),
                    content: SingleChildScrollView(
                      child: Text(
                        langNotifier.translate('tos_content'),
                        style:
                            const TextStyle(fontSize: 14, height: 1.5),
                      ),
                    ),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(context),
                        child: const Text('OK'),
                      ),
                    ],
                  ),
                );
              },
            ),
            const Divider(),
            ListTile(
              contentPadding: EdgeInsets.zero,
              title: Text(
                langNotifier.translate('privacy_policy'),
                style: AppTextStyles.bodyMD.copyWith(
                  color: isDark
                      ? AppColors.textPrimaryDark
                      : AppColors.textPrimary,
                ),
              ),
              trailing: const Icon(Icons.chevron_right_rounded),
              onTap: () {
                showDialog(
                  context: context,
                  builder: (context) => AlertDialog(
                    title: Text(langNotifier.translate('privacy_policy')),
                    content: SingleChildScrollView(
                      child: Text(
                        langNotifier.translate('privacy_content'),
                        style:
                            const TextStyle(fontSize: 14, height: 1.5),
                      ),
                    ),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(context),
                        child: const Text('OK'),
                      ),
                    ],
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title, bool isDark) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Text(
        title,
        style: AppTextStyles.titleSM.copyWith(
          color: AppColors.primary,
          fontWeight: FontWeight.bold,
          letterSpacing: 1.2,
        ),
      ),
    );
  }

  Widget _buildInfoCard({
    required IconData icon,
    required String title,
    required String description,
    required bool isDark,
    Color? textColor,
    VoidCallback? onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isDark
              ? AppColors.cardBackgroundDark
              : AppColors.cardBackground,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color:
                isDark ? AppColors.cardBorderDark : AppColors.cardBorder,
          ),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: AppColors.primary, size: 20),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: AppTextStyles.titleSM.copyWith(
                      color: textColor ??
                          (isDark
                              ? AppColors.textPrimaryDark
                              : AppColors.textPrimary),
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    description,
                    style: AppTextStyles.caption.copyWith(
                      color: isDark
                          ? AppColors.textMutedDark
                          : AppColors.textMuted,
                      height: 1.4,
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

  void _showDeleteConfirmation(
      BuildContext context, LanguageNotifier lang) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(lang.translate('delete_data')),
        // FIX 2: Pakai langNotifier untuk teks konfirmasi
        content: Text(lang.translate('delete_data_confirm')),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(lang.translate('cancel')),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              _deleteAllData(context, lang);
            },
            child: Text(
              lang.translate('delete'),
              style: const TextStyle(color: Colors.redAccent),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _deleteAllData(
      BuildContext context, LanguageNotifier lang) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token') ?? '';

      final response = await http.delete(
        // FIX 1: Pakai AppConfig.baseUrl bukan hardcoded IP
        Uri.parse('${AppConfig.baseUrl}/journals/all'),
        headers: {
          'Authorization': 'Bearer $token',
          'Accept': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            // FIX 2: Pakai langNotifier untuk snackbar
            SnackBar(
              content: Text(lang.translate('delete_data_success')),
              backgroundColor: Colors.green,
            ),
          );
        }
      } else {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              // FIX 2: Pakai langNotifier untuk pesan gagal
              content: Text(
                '${lang.translate('delete_data_failed')}: ${response.statusCode}',
              ),
              backgroundColor: Colors.redAccent,
            ),
          );
        }
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          // FIX 2: Pakai langNotifier untuk pesan error koneksi
          SnackBar(
            content: Text(lang.translate('connection_error')),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    }
  }
}