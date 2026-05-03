import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';
import 'dart:convert';
import 'dart:typed_data'; // Added for Uint8List
import 'dart:developer' as developer;
import 'dart:math' show min;
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
    showModalBottomSheet(
      context: context,
      builder: (BuildContext context) {
        return SafeArea(
          child: Wrap(
            children: [
              ListTile(
                leading: const Icon(Icons.photo_library),
                title: const Text('Pilih dari Galeri'),
                onTap: () async {
                  Navigator.pop(context);
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
                },
              ),
              ListTile(
                leading: const Icon(Icons.camera_alt),
                title: const Text('Ambil Foto'),
                onTap: () async {
                  Navigator.pop(context);
                  final picker = ImagePicker();
                  final pickedFile = await picker.pickImage(
                    source: ImageSource.camera,
                    maxHeight: 800,
                    maxWidth: 800,
                  );
                  if (pickedFile != null) {
                    setState(() {
                      _selectedImage = pickedFile;
                    });
                  }
                },
              ),
            ],
          ),
        );
      },
    );
  }

  Future<void> _uploadProfileImage() async {
    if (_selectedImage == null) return;

    setState(() => _isLoading = true);

    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token') ?? '';

      developer.log(
        'Starting photo upload. Token: ${token.isNotEmpty ? 'present' : 'missing'}',
      );

      if (token.isEmpty) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Token tidak ditemukan. Silakan login kembali.'),
            ),
          );
        }
        return;
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

      developer.log('Sending multipart request to server...');
      final response = await request.send().timeout(
        const Duration(seconds: 30),
        onTimeout: () => throw Exception('Request timeout'),
      );
      final responseBody = await response.stream.bytesToString();

      developer.log('Response status: ${response.statusCode}');
      developer.log('Response body: $responseBody');

      if (response.statusCode == 200) {
        try {
          // Check if response is valid JSON
          if (responseBody.isEmpty) {
            throw Exception('Response body is empty');
          }

          // Verify response starts with { to ensure it's JSON not HTML
          final trimmed = responseBody.trim();
          if (!trimmed.startsWith('{')) {
            final preview = trimmed.substring(0, min(300, trimmed.length));
            developer.log('Response is not JSON. First 300 chars: $preview');
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

          // Build reliable URL to prevent network / localhost errors
          // We route via /api/storage/ to allow Laravel CORS middleware to apply headers
          final fullUrl =
              "http://127.0.0.1:8000/api/storage/${photoPath.toString().replaceAll('\\', '/')}";

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
        } catch (parseError) {
          developer.log('JSON parse error: $parseError');
          if (mounted) {
            ScaffoldMessenger.of(
              context,
            ).showSnackBar(SnackBar(content: Text('Error: $parseError')));
          }
        }
      } else if (response.statusCode == 401) {
        developer.log('Unauthorized - token may be invalid');
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
        developer.log('Upload failed with status: ${response.statusCode}');
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
    } catch (e, stackTrace) {
      developer.log('Upload error: $e');
      developer.log('Stack trace: $stackTrace');

      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
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
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text(
          'Edit Profil',
          style: TextStyle(color: Colors.black87),
        ),
        centerTitle: true,
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black87),
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

            TextField(
              controller: _nameController,
              decoration: InputDecoration(
                labelText: 'Nama Lengkap',
                prefixIcon: const Icon(Icons.person_outline),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
            const SizedBox(height: 20),

            TextField(
              controller: _emailController,
              decoration: InputDecoration(
                labelText: 'Email',
                prefixIcon: const Icon(Icons.email_outlined),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
            const SizedBox(height: 20),

            DropdownButtonFormField<String>(
              initialValue: _gender,
              items: _genderOptions
                  .map((opt) => DropdownMenuItem(value: opt, child: Text(opt)))
                  .toList(),
              onChanged: (v) => setState(() => _gender = v!),
              decoration: InputDecoration(
                labelText: 'Jenis Kelamin',
                prefixIcon: const Icon(Icons.person_pin_outlined),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
            const SizedBox(height: 20),

            DropdownButtonFormField<String>(
              initialValue: _occupation,
              items: _occupationOptions
                  .map((opt) => DropdownMenuItem(value: opt, child: Text(opt)))
                  .toList(),
              onChanged: (v) => setState(() => _occupation = v!),
              decoration: InputDecoration(
                labelText: 'Aktivitas Utama',
                prefixIcon: const Icon(Icons.work_outline),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
            const SizedBox(height: 20),

            TextField(
              controller: _passwordController,
              obscureText: _isHidden,
              decoration: InputDecoration(
                labelText: 'Password Baru (Opsional)',
                prefixIcon: const Icon(Icons.lock_outline),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                suffixIcon: IconButton(
                  icon: Icon(
                    _isHidden ? Icons.visibility_off : Icons.visibility,
                  ),
                  onPressed: () {
                    setState(() => _isHidden = !_isHidden);
                  },
                ),
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
}
