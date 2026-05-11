import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';
import 'dart:convert';
import 'dart:typed_data'; // Added for Uint8List
import '../theme/app_theme.dart';

class EditProfilePage extends StatefulWidget {
  const EditProfilePage({super.key});

  @override
  State<EditProfilePage> createState() => _EditProfilePageState();
}

class _EditProfilePageState extends State<EditProfilePage> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  bool _isLoading = false;
  bool _isHidden = true;

  // Update to use XFile for universal web & mobile support
  XFile? _selectedImage;
  String? _profileImageUrl;

  String _gender = 'Female';
  String _occupation = 'Student';

  final List<String> _genderOptions = ['Female', 'Male'];
  final List<String> _occupationOptions = [
    'Student',
    'Corporate',
    'Business',
    'Housewife',
    'Others',
  ];

  @override
  void initState() {
    super.initState();
    _loadCurrentData();
  }

  Future<void> _loadCurrentData() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _nameController.text = prefs.getString('nama_lengkap') ?? '';
      _emailController.text = prefs.getString('email') ?? '';
      _gender = prefs.getString('gender') ?? 'Female';
      _occupation = prefs.getString('occupation') ?? 'Student';
      _profileImageUrl = prefs.getString('profile_image_url');
    });
  }

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(
      source: ImageSource.gallery,
      maxHeight: 800,
      maxWidth: 800,
    );

    if (pickedFile != null) {
      setState(() {
        _selectedImage = pickedFile;
      });
    }
  }

  Future<bool> _uploadProfileImage() async {
    if (_selectedImage == null) return false;

    setState(() => _isLoading = true);

    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token') ?? '';

      if (token.isEmpty) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Token tidak ditemukan. Silakan login kembali.'),
            ),
          );
        }
        return false;
      }

      final request = http.MultipartRequest(
        'POST',
        Uri.parse('http://127.0.0.1:8000/api/profile/upload-photo'),
      );

      request.headers['Authorization'] = 'Bearer $token';
      request.headers['Accept'] = 'application/json';

      // Use memory/bytes universally for Web and Mobile support
      final bytes = await _selectedImage!.readAsBytes();
      request.files.add(
        http.MultipartFile.fromBytes(
          'photo',
          bytes,
          filename: _selectedImage!.name.isNotEmpty
              ? _selectedImage!.name
              : 'profile_photo.jpg',
        ),
      );

      final response = await request.send().timeout(
        const Duration(seconds: 30),
        onTimeout: () => throw Exception('Request timeout'),
      );
      final responseBody = await response.stream.bytesToString();

      if (response.statusCode == 200) {
        try {
          if (responseBody.isEmpty) {
            throw Exception('Response body is empty');
          }

          final trimmed = responseBody.trim();
          if (!trimmed.startsWith('{')) {
            throw Exception('Backend returned HTML/error. Check server logs.');
          }

          final result = jsonDecode(responseBody) as Map<String, dynamic>;

          if (result['status'] != 'success') {
            throw Exception(result['pesan'] ?? 'Unknown error from server');
          }

          final photoPath = result['data']?['photo_path'];
          if (photoPath == null || photoPath.toString().trim().isEmpty) {
            throw Exception('No photo path in response');
          }

          // Extract filename from photoPath (e.g., "profile-photos/filename.jpg" -> "filename.jpg")
          final filename = photoPath
              .toString()
              .split('/')
              .last
              .split('\\')
              .last;

          // Use the API route that provides CORS headers
          final fullUrl = "http://127.0.0.1:8000/api/photo/$filename";

          await prefs.setString('profile_image_url', fullUrl);
          setState(() {
            _profileImageUrl = fullUrl;
            _selectedImage = null;
          });

          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Foto profil berhasil diupload!')),
            );
          }
          return true;
        } catch (parseError) {
          if (mounted) {
            ScaffoldMessenger.of(
              context,
            ).showSnackBar(SnackBar(content: Text('Error: $parseError')));
          }
          return false;
        }
      } else if (response.statusCode == 401) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Session expired. Please login again'),
            ),
          );
        }
      } else if (response.statusCode == 400) {
        try {
          final result = jsonDecode(responseBody) as Map<String, dynamic>;
          final errorMsg = result['pesan'] ?? 'Bad request';
          if (mounted) {
            ScaffoldMessenger.of(
              context,
            ).showSnackBar(SnackBar(content: Text(errorMsg)));
          }
        } catch (_) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Bad request - check file size and format'),
              ),
            );
          }
        }
      } else {
        try {
          final result = jsonDecode(responseBody) as Map<String, dynamic>;
          final errorMsg = result['pesan'] ?? 'Unknown error';
          if (mounted) {
            ScaffoldMessenger.of(
              context,
            ).showSnackBar(SnackBar(content: Text(errorMsg)));
          }
        } catch (_) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Upload failed: ${response.statusCode}')),
            );
          }
        }
      }
      return false; // return false for any non-200 or caught errors above
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
      return false; // return false if execution hits outer catch
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _saveProfile() async {
    if (_nameController.text.isEmpty || _emailController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Nama dan Email tidak boleh kosong!')),
      );
      return;
    }

    setState(() => _isLoading = true);

    // Upload image if one was selected
    if (_selectedImage != null) {
      bool uploadSuccess = await _uploadProfileImage() ?? false;
      if (mounted) setState(() => _isLoading = true);
      // If we tried to upload but it failed, we can optionally stop here or continue.
      // We will continue to save text changes.
    }

    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token') ?? '';

      final response = await http.put(
        Uri.parse('http://127.0.0.1:8000/api/profile'),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'nama_lengkap': _nameController.text,
          'email': _emailController.text,
          'gender': _gender,
          'occupation': _occupation,
          if (_passwordController.text.isNotEmpty)
            'password': _passwordController.text,
        }),
      );

      if (response.statusCode == 200) {
        final result = jsonDecode(response.body);
        final data = result['data'];

        // Update local memory
        await prefs.setString('nama_lengkap', data['nama_lengkap']);
        await prefs.setString('email', data['email']);
        await prefs.setString('gender', data['gender'] ?? 'Female');
        await prefs.setString('occupation', data['occupation'] ?? 'Student');

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Profil berhasil diupdate!')),
          );
          Navigator.pop(context, true); // true to signal it updated
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Gagal: ${response.statusCode}')),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Tidak dapat terhubung ke server')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        title: Text(
          'Edit Profil',
          style: AppTextStyles.titleMD.copyWith(
            color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
          ),
        ),
        centerTitle: true,
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        elevation: 0,
        iconTheme: IconThemeData(
          color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            Stack(
              children: [
                FutureBuilder<Uint8List>(
                  future: _selectedImage?.readAsBytes(),
                  builder: (context, snapshot) {
                    return CircleAvatar(
                      radius: 50,
                      backgroundColor: AppColors.primaryBorder,
                      backgroundImage:
                          _selectedImage != null && snapshot.hasData
                          ? MemoryImage(snapshot.data!)
                          : _profileImageUrl != null &&
                                _profileImageUrl!.isNotEmpty
                          ? NetworkImage(_profileImageUrl!) as ImageProvider
                          : null,
                      child:
                          _selectedImage == null &&
                              (_profileImageUrl == null ||
                                  _profileImageUrl!.isEmpty)
                          ? const Icon(
                              Icons.person,
                              size: 50,
                              color: AppColors.primary,
                            )
                          : null,
                    );
                  },
                ),
                Positioned(
                  bottom: 0,
                  right: 0,
                  child: GestureDetector(
                    onTap: _pickImage,
                    child: Container(
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 2),
                      ),
                      padding: const EdgeInsets.all(8),
                      child: const Icon(
                        Icons.camera_alt,
                        color: Colors.white,
                        size: 20,
                      ),
                    ),
                  ),
                ),
              ],
            ),
            if (_selectedImage != null)
              Padding(
                padding: const EdgeInsets.only(top: 16.0),
                child: ElevatedButton.icon(
                  onPressed: _uploadProfileImage,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                  ),
                  icon: const Icon(Icons.cloud_upload),
                  label: const Text('Upload Foto'),
                ),
              ),
            const SizedBox(height: 32),

            _buildTextField(
              controller: _nameController,
              label: 'Nama Lengkap',
              icon: Icons.person_outline,
            ),
            const SizedBox(height: 20),
            _buildTextField(
              controller: _emailController,
              label: 'Email',
              icon: Icons.email_outlined,
              keyboardType: TextInputType.emailAddress,
            ),
            const SizedBox(height: 20),
            _buildDropdown(
              value: _gender,
              options: _genderOptions,
              label: 'Jenis Kelamin',
              icon: Icons.person_pin_outlined,
              onChanged: (v) => setState(() => _gender = v!),
            ),
            const SizedBox(height: 20),
            _buildDropdown(
              value: _occupation,
              options: _occupationOptions,
              label: 'Aktivitas Utama',
              icon: Icons.work_outline,
              onChanged: (v) => setState(() => _occupation = v!),
            ),
            const SizedBox(height: 20),
            _buildTextField(
              controller: _passwordController,
              label: 'Password Baru (Opsional)',
              icon: Icons.lock_outline,
              obscureText: _isHidden,
              suffixIcon: IconButton(
                icon: Icon(
                  _isHidden ? Icons.visibility_off : Icons.visibility,
                  color: isDark ? AppColors.textMutedDark : AppColors.textMuted,
                ),
                onPressed: () => setState(() => _isHidden = !_isHidden),
              ),
            ),
            const SizedBox(height: 40),

            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _saveProfile,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: _isLoading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text(
                        'Simpan Perubahan',
                        style: TextStyle(fontSize: 16),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    bool obscureText = false,
    Widget? suffixIcon,
    TextInputType? keyboardType,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return TextField(
      controller: controller,
      obscureText: obscureText,
      keyboardType: keyboardType,
      style: AppTextStyles.bodyMD.copyWith(
        color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
      ),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: AppTextStyles.label.copyWith(
          color: isDark ? AppColors.textMutedDark : AppColors.textMuted,
        ),
        prefixIcon: Icon(
          icon,
          color: isDark ? AppColors.textMutedDark : AppColors.textMuted,
        ),
        suffixIcon: suffixIcon,
        filled: true,
        fillColor: isDark ? AppColors.inputFillDark : AppColors.inputFill,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
        ),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
      ),
    );
  }

  Widget _buildDropdown({
    required String value,
    required List<String> options,
    required String label,
    required IconData icon,
    required ValueChanged<String?> onChanged,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return DropdownButtonFormField<String>(
      value: value,
      dropdownColor: isDark ? AppColors.cardBackgroundDark : Colors.white,
      items: options
          .map((opt) => DropdownMenuItem(
                value: opt,
                child: Text(
                  opt,
                  style: AppTextStyles.bodyMD.copyWith(
                    color: isDark
                        ? AppColors.textPrimaryDark
                        : AppColors.textPrimary,
                  ),
                ),
              ))
          .toList(),
      onChanged: onChanged,
      style: AppTextStyles.bodyMD.copyWith(
        color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
      ),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: AppTextStyles.label.copyWith(
          color: isDark ? AppColors.textMutedDark : AppColors.textMuted,
        ),
        prefixIcon: Icon(
          icon,
          color: isDark ? AppColors.textMutedDark : AppColors.textMuted,
        ),
        filled: true,
        fillColor: isDark ? AppColors.inputFillDark : AppColors.inputFill,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
        ),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
      ),
    );
  }
}
