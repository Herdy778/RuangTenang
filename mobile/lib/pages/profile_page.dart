import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:provider/provider.dart';
import '../theme/app_theme.dart';
import '../theme/theme_notifier.dart';
import 'edit_profile_page.dart';
import 'privacy_security_page.dart';
import 'help_center_page.dart';
import 'about_page.dart';

import '../theme/language_notifier.dart';
import '../services/notification_service.dart';
import 'dart:math';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  String _userName = "User";
  String _userEmail = "user@example.com";
  String? _profileImageUrl;
  bool _notifPush = true;
  bool _notifEmail = false;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _userName = prefs.getString('nama_lengkap') ?? "User";
      _userEmail = prefs.getString('email') ?? "user@example.com";
      _profileImageUrl = prefs.getString('profile_image_url');
      _notifPush = prefs.getBool('notif_push') ?? true;
      _notifEmail = prefs.getBool('notif_email') ?? false;
    });
  }

  void _showNotificationSettings() {
    final langNotifier = Provider.of<LanguageNotifier>(context, listen: false);
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) {
        return StatefulBuilder(
          builder: (BuildContext context, StateSetter setModalState) {
            final isDark = Theme.of(context).brightness == Brightness.dark;
            return Container(
              padding: const EdgeInsets.all(24.0),
              decoration: BoxDecoration(
                color: isDark ? AppColors.cardBackgroundDark : Colors.white,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(langNotifier.translate('notif'), style: AppTextStyles.titleMD.copyWith(
                        color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
                      )),
                      IconButton(
                        icon: const Icon(Icons.close_rounded),
                        onPressed: () => Navigator.pop(context),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  _buildSwitchTile(
                    title: langNotifier.translate('notif'), // Or specific key if added
                    subtitle: 'Terima pengingat harian untuk menulis jurnal.',
                    value: _notifPush,
                    onChanged: (val) async {
                      setModalState(() => _notifPush = val);
                      setState(() => _notifPush = val);
                      final prefs = await SharedPreferences.getInstance();
                      await prefs.setBool('notif_push', val);

                      if (val) {
                        await NotificationService().requestPermissions();
                        
                        // Pick a random message
                        final rand = Random().nextInt(5) + 1;
                        final title = langNotifier.translate('notif_title_$rand');
                        final body = langNotifier.translate('notif_body_$rand');

                        // Schedule daily reminder at 20:00 (8 PM)
                        await NotificationService().scheduleDailyReminder(1, 20, 0, title, body);
                        
                        // Send instant confirmation notification
                        await NotificationService().showInstantNotification(
                          langNotifier.translate('notif') + ' Aktif! 🔔',
                          'Terima kasih! Kamu akan menerima pengingat harian setiap jam 20:00.'
                        );
                        
                        if (mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text(langNotifier.translate('notif') + ' aktif (20:00)')),
                          );
                        }
                      } else {
                        await NotificationService().cancelAllNotifications();
                      }
                    },
                    isDark: isDark,
                  ),
                  const SizedBox(height: 16),
                  Center(
                    child: OutlinedButton.icon(
                      onPressed: () async {
                        final rand = Random().nextInt(5) + 1;
                        final title = langNotifier.translate('notif_title_$rand');
                        final body = langNotifier.translate('notif_body_$rand');
                        
                        await NotificationService().showInstantNotification(title, body);
                      },
                      icon: const Icon(Icons.notifications_active_outlined),
                      label: Text(langNotifier.translate('send_test_notif')),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.primary,
                        side: const BorderSide(color: AppColors.primary),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            );
          },
        );
      },
    );
  }

  // Helper for switch tiles
  Widget _buildSwitchTile({
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
    required bool isDark,
  }) {
    return SwitchListTile(
      contentPadding: EdgeInsets.zero,
      title: Text(title, style: AppTextStyles.bodyMD.copyWith(
        fontWeight: FontWeight.bold,
        color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
      )),
      subtitle: Text(subtitle, style: AppTextStyles.caption),
      value: value,
      onChanged: onChanged,
      activeColor: AppColors.primary,
      activeTrackColor: AppColors.primary.withOpacity(0.3),
    );
  }

  void _showLanguageSettings() {
    final langNotifier = Provider.of<LanguageNotifier>(context, listen: false);
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return StatefulBuilder(
          builder: (BuildContext context, StateSetter setModalState) {
            final isDark = Theme.of(context).brightness == Brightness.dark;
            return Container(
              padding: const EdgeInsets.all(24.0),
              decoration: BoxDecoration(
                color: isDark ? AppColors.cardBackgroundDark : Colors.white,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(langNotifier.translate('lang'), style: AppTextStyles.titleMD.copyWith(
                    color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
                  )),
                  const SizedBox(height: 16),
                  _buildLanguageOption('Indonesia', 'id', '🇮🇩', setModalState, isDark),
                  _buildLanguageOption('English', 'en', '🇺🇸', setModalState, isDark),
                  const SizedBox(height: 16),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildLanguageOption(String langName, String langCode, String flag, StateSetter setModalState, bool isDark) {
    final langNotifier = Provider.of<LanguageNotifier>(context);
    final bool isSelected = langNotifier.currentLanguage == langCode;
    
    return GestureDetector(
      onTap: () {
        langNotifier.changeLanguage(langCode);
        Navigator.pop(context);
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary.withOpacity(0.1) : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppColors.primary : (isDark ? AppColors.cardBorderDark : AppColors.cardBorder),
          ),
        ),
        child: Row(
          children: [
            Text(flag, style: const TextStyle(fontSize: 20)),
            const SizedBox(width: 12),
            Text(langName, style: AppTextStyles.bodyMD.copyWith(
              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
            )),
            const Spacer(),
            if (isSelected) const Icon(Icons.check_circle_rounded, color: AppColors.primary),
          ],
        ),
      ),
    );
  }

  void _showPrivacySettings() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const PrivacySecurityPage()),
    );
  }

  void _showHelpCenter() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const HelpCenterPage()),
    );
  }

  void _showAbout() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const AboutPage()),
    );
  }

  Future<void> _logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    if (mounted) {
      Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final themeNotifier = Provider.of<ThemeNotifier>(context);
    final langNotifier = Provider.of<LanguageNotifier>(context);
    final isDark = themeNotifier.isDarkMode;

    return Scaffold(
      backgroundColor: isDark ? AppColors.backgroundDark : Colors.white,
      appBar: AppBar(
        title: Text(langNotifier.translate('profile_title'), style: AppTextStyles.headingMD),
        centerTitle: true,
        backgroundColor: isDark ? AppColors.cardBackgroundDark : Colors.white,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            const SizedBox(height: 20),
            _buildProfileHeader(),
            const SizedBox(height: 30),
            _buildSettingsSection(),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileHeader() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Column(
      children: [
        CircleAvatar(
          radius: 50,
          backgroundColor: AppColors.primaryBorder,
          backgroundImage:
              _profileImageUrl != null && _profileImageUrl!.isNotEmpty
              ? NetworkImage(_profileImageUrl!) as ImageProvider
              : null,
          child: _profileImageUrl == null || _profileImageUrl!.isEmpty
              ? const Icon(Icons.person, size: 50, color: AppColors.primary)
              : null,
        ),
        const SizedBox(height: 16),
        Text(
          _userName,
          style: AppTextStyles.headingMD.copyWith(
              color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary),
        ),
        const SizedBox(height: 4),
        Text(
          _userEmail,
          style: AppTextStyles.bodyMD.copyWith(color: AppColors.textMuted),
        ),
        const SizedBox(height: 16),
        OutlinedButton(
          onPressed: () async {
            await Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const EditProfilePage()),
            );
            // Always reload data when returning from EditProfilePage
            // Because user might upload a photo and press the hardware back button
            if (mounted) {
              _loadProfile();
            }
          },
          style: OutlinedButton.styleFrom(
            foregroundColor: AppColors.primary,
            side: const BorderSide(color: AppColors.primary),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
            ),
          ),
          child: Text(Provider.of<LanguageNotifier>(context).translate('edit_profile')),
        ),
      ],
    );
  }

  Widget _buildSettingsSection() {
    final themeNotifier = Provider.of<ThemeNotifier>(context);
    final langNotifier = Provider.of<LanguageNotifier>(context);
    final isDark = themeNotifier.isDarkMode;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            langNotifier.translate('app_settings'),
            style: AppTextStyles.titleMD.copyWith(
              color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 16),
          _buildSettingsTile(
            icon: isDark ? Icons.dark_mode : Icons.light_mode,
            title: langNotifier.translate('dark_mode'),
            trailing: Switch(
              value: isDark,
              onChanged: (val) {
                themeNotifier.toggleTheme(val);
              },
              activeThumbColor: AppColors.primary,
            ),
            onTap: () {
              themeNotifier.toggleTheme(!isDark);
            },
          ),
          _buildSettingsTile(
            icon: Icons.notifications_outlined,
            title: langNotifier.translate('notif'),
            onTap: _showNotificationSettings,
          ),
          _buildSettingsTile(
            icon: Icons.language_outlined,
            title: langNotifier.translate('lang'),
            subtitle: langNotifier.currentLanguage == 'id' ? 'Indonesia' : 'English',
            onTap: _showLanguageSettings,
          ),
          _buildSettingsTile(
            icon: Icons.security_outlined,
            title: langNotifier.translate('privacy'),
            onTap: _showPrivacySettings,
          ),
          const SizedBox(height: 24),
          Text(
            langNotifier.translate('help_info'),
            style: AppTextStyles.titleMD.copyWith(
              color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 16),
          _buildSettingsTile(
            icon: Icons.help_outline,
            title: langNotifier.translate('help_center'),
            onTap: _showHelpCenter,
          ),
          _buildSettingsTile(
            icon: Icons.info_outline,
            title: langNotifier.translate('about_app'),
            onTap: _showAbout,
          ),
          const SizedBox(height: 32),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: () {
                showDialog(
                  context: context,
                  builder: (context) => AlertDialog(
                    title: Text(langNotifier.translate('logout')),
                    content: Text(langNotifier.translate('logout_confirm')),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(context),
                        child: Text(
                          langNotifier.translate('cancel'),
                          style: const TextStyle(color: Colors.grey),
                        ),
                      ),
                      ElevatedButton(
                        onPressed: () {
                          Navigator.pop(context);
                          _logout();
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.redAccent,
                        ),
                        child: Text(
                          langNotifier.translate('logout'),
                          style: const TextStyle(color: Colors.white),
                        ),
                      ),
                    ],
                  ),
                );
              },
              icon: const Icon(Icons.logout),
              label: Text(langNotifier.translate('logout')),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red.shade100,
                foregroundColor: Colors.red.shade700,
                elevation: 0,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ),
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Widget _buildSettingsTile({
    required IconData icon,
    required String title,
    String? subtitle,
    Widget? trailing,
    required VoidCallback onTap,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: AppColors.primary.withOpacity(0.1),
          shape: BoxShape.circle,
        ),
        child: Icon(icon, color: AppColors.primary, size: 20),
      ),
      title: Text(
        title,
        style: AppTextStyles.titleSM.copyWith(
          color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
        ),
      ),
      subtitle: subtitle != null
          ? Text(
              subtitle,
              style: AppTextStyles.caption.copyWith(
                color: isDark ? AppColors.textMutedDark : AppColors.textMuted,
              ),
            )
          : null,
      trailing: trailing ??
          Icon(
            Icons.arrow_forward_ios,
            size: 16,
            color: isDark ? AppColors.textMutedDark : AppColors.textMuted,
          ),
      onTap: onTap,
    );
  }
}
