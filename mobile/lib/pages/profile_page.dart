import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../theme/app_theme.dart';
import 'edit_profile_page.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  String _userName = "User";
  String _userEmail = "user@example.com";
  bool _notifPush = true;
  bool _notifEmail = false;
  String _selectedLanguage = "Indonesia";

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
      _notifPush = prefs.getBool('notif_push') ?? true;
      _notifEmail = prefs.getBool('notif_email') ?? false;
      _selectedLanguage = prefs.getString('language') ?? "Indonesia";
    });
  }

  void _showNotificationSettings() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return StatefulBuilder(
          builder: (BuildContext context, StateSetter setModalState) {
            return Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Pengaturan Notifikasi', style: AppTextStyles.titleMD),
                  const SizedBox(height: 16),
                  SwitchListTile(
                    title: const Text('Notifikasi Push'),
                    value: _notifPush,
                    onChanged: (val) async {
                      setModalState(() => _notifPush = val);
                      setState(() => _notifPush = val);
                      final prefs = await SharedPreferences.getInstance();
                      await prefs.setBool('notif_push', val);
                    },
                    activeColor: AppColors.primary,
                  ),
                  SwitchListTile(
                    title: const Text('Notifikasi Email'),
                    value: _notifEmail,
                    onChanged: (val) async {
                      setModalState(() => _notifEmail = val);
                      setState(() => _notifEmail = val);
                      final prefs = await SharedPreferences.getInstance();
                      await prefs.setBool('notif_email', val);
                    },
                    activeColor: AppColors.primary,
                  ),
                  const SizedBox(height: 16),
                ],
              ),
            );
          },
        );
      },
    );
  }

  void _showLanguageSettings() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return StatefulBuilder(
          builder: (BuildContext context, StateSetter setModalState) {
            return Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Pilih Bahasa', style: AppTextStyles.titleMD),
                  const SizedBox(height: 16),
                  RadioListTile<String>(
                    title: const Text('Indonesia'),
                    value: 'Indonesia',
                    groupValue: _selectedLanguage,
                    onChanged: (val) async {
                      if (val != null) {
                        setModalState(() => _selectedLanguage = val);
                        setState(() => _selectedLanguage = val);
                        final prefs = await SharedPreferences.getInstance();
                        await prefs.setString('language', val);
                        if (context.mounted) Navigator.pop(context);
                      }
                    },
                    activeColor: AppColors.primary,
                  ),
                  RadioListTile<String>(
                    title: const Text('English'),
                    value: 'English',
                    groupValue: _selectedLanguage,
                    onChanged: (val) async {
                      if (val != null) {
                        setModalState(() => _selectedLanguage = val);
                        setState(() => _selectedLanguage = val);
                        final prefs = await SharedPreferences.getInstance();
                        await prefs.setString('language', val);
                        if (context.mounted) Navigator.pop(context);
                      }
                    },
                    activeColor: AppColors.primary,
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  void _showPrivacySettings() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Privasi & Keamanan', style: AppTextStyles.titleMD),
        content: const Text(
          'Tidak ada pengaturan tambahan tingkat lanjut untuk saat ini.\nSemua data pribadi Anda tersimpan secara lokal dan aman.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _showHelpCenter() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Pusat Bantuan', style: AppTextStyles.titleMD),
        content: const Text(
          'Butuh bantuan? Silakan hubungi administrator di:\n\n📧 support@ruangtenang.com\n📞 0812-3456-7890',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Tutup'),
          ),
        ],
      ),
    );
  }

  void _showAbout() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Tentang Ruang Tenang', style: AppTextStyles.titleMD),
        content: const Text(
          'Versi 1.0.0\n\nAplikasi ini dikembangkan untuk membantu melacak mood harian Anda dan memberikan fasilitas relaksasi agar hari menjadi lebih baik.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Tutup'),
          ),
        ],
      ),
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
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Text('Profil & Pengaturan', style: AppTextStyles.headingMD),
        centerTitle: true,
        backgroundColor: Colors.white,
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
    return Column(
      children: [
        const CircleAvatar(
          radius: 50,
          backgroundColor: AppColors.primaryBorder,
          child: Icon(Icons.person, size: 50, color: AppColors.primary),
        ),
        const SizedBox(height: 16),
        Text(
          _userName,
          style: AppTextStyles.headingMD.copyWith(color: AppColors.textPrimary),
        ),
        const SizedBox(height: 4),
        Text(
          _userEmail,
          style: AppTextStyles.bodyMD.copyWith(color: AppColors.textMuted),
        ),
        const SizedBox(height: 16),
        OutlinedButton(
          onPressed: () async {
            final result = await Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const EditProfilePage()),
            );
            if (result == true) {
              _loadProfile(); // Reload if updated
            }
          },
          style: OutlinedButton.styleFrom(
            foregroundColor: AppColors.primary,
            side: const BorderSide(color: AppColors.primary),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
            ),
          ),
          child: const Text('Edit Profil'),
        ),
      ],
    );
  }

  Widget _buildSettingsSection() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Pengaturan Aplikasi', style: AppTextStyles.titleMD),
          const SizedBox(height: 16),
          _buildSettingsTile(
            icon: Icons.notifications_outlined,
            title: 'Notifikasi',
            onTap: _showNotificationSettings,
          ),
          _buildSettingsTile(
            icon: Icons.language_outlined,
            title: 'Bahasa',
            subtitle: _selectedLanguage,
            onTap: _showLanguageSettings,
          ),
          _buildSettingsTile(
            icon: Icons.security_outlined,
            title: 'Privasi & Keamanan',
            onTap: _showPrivacySettings,
          ),
          const SizedBox(height: 24),
          Text('Bantuan & Info', style: AppTextStyles.titleMD),
          const SizedBox(height: 16),
          _buildSettingsTile(
            icon: Icons.help_outline,
            title: 'Pusat Bantuan',
            onTap: _showHelpCenter,
          ),
          _buildSettingsTile(
            icon: Icons.info_outline,
            title: 'Tentang Aplikasi',
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
                    title: const Text("Logout"),
                    content: const Text("Yakin ingin keluar?"),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(context),
                        child: const Text(
                          "Batal",
                          style: TextStyle(color: Colors.grey),
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
                        child: const Text(
                          "Keluar",
                          style: TextStyle(color: Colors.white),
                        ),
                      ),
                    ],
                  ),
                );
              },
              icon: const Icon(Icons.logout),
              label: const Text('Keluar'),
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
    required VoidCallback onTap,
  }) {
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
      title: Text(title, style: AppTextStyles.titleSM),
      subtitle: subtitle != null
          ? Text(subtitle, style: AppTextStyles.caption)
          : null,
      trailing: const Icon(
        Icons.arrow_forward_ios,
        size: 16,
        color: AppColors.textMuted,
      ),
      onTap: onTap,
    );
  }
}
