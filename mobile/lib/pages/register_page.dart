import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:ui';
import 'package:shared_preferences/shared_preferences.dart';

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> with TickerProviderStateMixin {
  final nameController = TextEditingController();
  final emailController = TextEditingController();
  final passwordController = TextEditingController();

  bool isLoading = false;
  bool isHidden = true;

  late AnimationController _fadeController;
  late AnimationController _slideController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _fadeController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _slideController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 700),
    );
    _fadeAnimation = CurvedAnimation(
      parent: _fadeController,
      curve: Curves.easeOut,
    );
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.3),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _slideController, curve: Curves.easeOutCubic));

    _fadeController.forward();
    _slideController.forward();
  }

  @override
  void dispose() {
    _fadeController.dispose();
    _slideController.dispose();
    nameController.dispose();
    emailController.dispose();
    passwordController.dispose();
    super.dispose();
  }

  Future<void> register() async {
    setState(() => isLoading = true);

    if (nameController.text.isEmpty ||
        emailController.text.isEmpty ||
        passwordController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Semua field wajib diisi")),
      );
      setState(() => isLoading = false);
      return;
    }

    try {
      var response = await http.post(
        Uri.parse("http://127.0.0.1:8000/api/register"),
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: jsonEncode({
          "nama_lengkap": nameController.text,
          "email": emailController.text,
          "password": passwordController.text,
        }),
      );

      var data;
      try {
        data = jsonDecode(response.body);
      } catch (e) {
        data = {};
      }

      if (response.statusCode == 200 || response.statusCode == 201) {
        final prefs = await SharedPreferences.getInstance();

        await prefs.setBool('isLogin', true);
        await prefs.setString('email', data['data']?['email'] ?? '');
        await prefs.setString(
          'nama_lengkap',
          data['data']?['nama_lengkap'] ?? nameController.text,
        );
        await prefs.setString('gender', data['data']?['gender'] ?? 'Female');
        await prefs.setString(
          'occupation',
          data['data']?['occupation'] ?? 'Student',
        );
        await prefs.setString('token', data['token'] ?? '');

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Akun berhasil dibuat!")),
        );

        Navigator.pushReplacementNamed(context, '/dashboard');
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(data['pesan'] ?? "Registrasi gagal")),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Tidak bisa connect ke server")),
      );
    }

    setState(() => isLoading = false);
  }

  InputDecoration _fieldDecoration(String hint, IconData icon, {Widget? suffix}) {
    return InputDecoration(
      hintText: hint,
      hintStyle: const TextStyle(color: Colors.white54, fontSize: 14),
      prefixIcon: Icon(icon, color: Colors.white60, size: 20),
      suffixIcon: suffix,
      filled: true,
      fillColor: Colors.white.withOpacity(0.08),
      contentPadding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: BorderSide(color: Colors.white.withOpacity(0.15), width: 1),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: Color(0xFFD8B4FE), width: 1.5),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topRight,
            end: Alignment.bottomLeft,
            colors: [
              Color(0xFF1A0533),
              Color(0xFF3B0764),
              Color(0xFF2D1065),
              Color(0xFF1E0A3C),
            ],
            stops: [0.0, 0.3, 0.7, 1.0],
          ),
        ),
        child: Stack(
          children: [
            // Dekorasi lingkaran blur
            Positioned(
              top: -80,
              right: -60,
              child: Container(
                width: 240,
                height: 240,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: const Color(0xFFA855F7).withOpacity(0.2),
                ),
              ),
            ),
            Positioned(
              bottom: 60,
              left: -80,
              child: Container(
                width: 260,
                height: 260,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: const Color(0xFF7C3AED).withOpacity(0.2),
                ),
              ),
            ),
            Positioned(
              top: 180,
              left: 20,
              child: Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: const Color(0xFFC084FC).withOpacity(0.18),
                ),
              ),
            ),

            // Konten utama
            SafeArea(
              child: Center(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                  child: FadeTransition(
                    opacity: _fadeAnimation,
                    child: SlideTransition(
                      position: _slideAnimation,
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          // Logo + nama app
                          Container(
                            width: 72,
                            height: 72,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              gradient: const LinearGradient(
                                colors: [Color(0xFFA855F7), Color(0xFF8B5CF6)],
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: const Color(0xFFA855F7).withOpacity(0.45),
                                  blurRadius: 24,
                                  spreadRadius: 4,
                                ),
                              ],
                            ),
                            child: const Icon(
                              Icons.favorite_rounded,
                              size: 34,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(height: 14),
                          const Text(
                            "Bergabung Bersama Kami",
                            style: TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                              letterSpacing: 0.3,
                            ),
                          ),
                          const SizedBox(height: 5),
                          Text(
                            "Mulai perjalanan sehatmu hari ini",
                            style: TextStyle(
                              fontSize: 13,
                              color: Colors.white.withOpacity(0.6),
                            ),
                          ),
                          const SizedBox(height: 28),

                          // Card glassmorphism
                          ClipRRect(
                            borderRadius: BorderRadius.circular(24),
                            child: BackdropFilter(
                              filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
                              child: Container(
                                padding: const EdgeInsets.all(28),
                                decoration: BoxDecoration(
                                  color: Colors.white.withOpacity(0.07),
                                  borderRadius: BorderRadius.circular(24),
                                  border: Border.all(
                                    color: Colors.white.withOpacity(0.12),
                                    width: 1,
                                  ),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text(
                                      "Buat Akun Baru",
                                      style: TextStyle(
                                        fontSize: 20,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.white,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      "Isi data dirimu untuk memulai",
                                      style: TextStyle(
                                        fontSize: 13,
                                        color: Colors.white.withOpacity(0.55),
                                      ),
                                    ),
                                    const SizedBox(height: 24),

                                    // Nama
                                    TextField(
                                      controller: nameController,
                                      style: const TextStyle(color: Colors.white),
                                      decoration: _fieldDecoration("Nama lengkap", Icons.person_outline_rounded),
                                    ),
                                    const SizedBox(height: 14),

                                    // Email
                                    TextField(
                                      controller: emailController,
                                      keyboardType: TextInputType.emailAddress,
                                      style: const TextStyle(color: Colors.white),
                                      decoration: _fieldDecoration("Email kamu", Icons.email_outlined),
                                    ),
                                    const SizedBox(height: 14),

                                    // Password
                                    TextField(
                                      controller: passwordController,
                                      obscureText: isHidden,
                                      style: const TextStyle(color: Colors.white),
                                      decoration: _fieldDecoration(
                                        "Password",
                                        Icons.lock_outline_rounded,
                                        suffix: IconButton(
                                          icon: Icon(
                                            isHidden
                                                ? Icons.visibility_off_outlined
                                                : Icons.visibility_outlined,
                                            color: Colors.white54,
                                            size: 20,
                                          ),
                                          onPressed: () {
                                            setState(() => isHidden = !isHidden);
                                          },
                                        ),
                                      ),
                                    ),
                                    const SizedBox(height: 28),

                                    // Tombol daftar
                                    SizedBox(
                                      width: double.infinity,
                                      height: 52,
                                      child: isLoading
                                          ? const Center(
                                              child: CircularProgressIndicator(
                                                color: Colors.white,
                                                strokeWidth: 2,
                                              ),
                                            )
                                          : DecoratedBox(
                                              decoration: BoxDecoration(
                                                gradient: const LinearGradient(
                                                  colors: [
                                                    Color(0xFFA855F7),
                                                    Color(0xFF8B5CF6),
                                                  ],
                                                ),
                                                borderRadius: BorderRadius.circular(14),
                                                boxShadow: [
                                                  BoxShadow(
                                                    color: const Color(0xFFA855F7).withOpacity(0.4),
                                                    blurRadius: 16,
                                                    offset: const Offset(0, 6),
                                                  ),
                                                ],
                                              ),
                                              child: ElevatedButton(
                                                onPressed: register,
                                                style: ElevatedButton.styleFrom(
                                                  backgroundColor: Colors.transparent,
                                                  shadowColor: Colors.transparent,
                                                  shape: RoundedRectangleBorder(
                                                    borderRadius: BorderRadius.circular(14),
                                                  ),
                                                ),
                                                child: const Text(
                                                  "Daftar Sekarang",
                                                  style: TextStyle(
                                                    color: Colors.white,
                                                    fontSize: 16,
                                                    fontWeight: FontWeight.w600,
                                                    letterSpacing: 0.5,
                                                  ),
                                                ),
                                              ),
                                            ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),

                          const SizedBox(height: 24),

                          // Link login
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                "Sudah punya akun? ",
                                style: TextStyle(
                                  color: Colors.white.withOpacity(0.6),
                                  fontSize: 14,
                                ),
                              ),
                              GestureDetector(
                                onTap: () => Navigator.pop(context),
                                child: const Text(
                                  "Masuk di sini",
                                  style: TextStyle(
                                    color: Color(0xFFD8B4FE),
                                    fontSize: 14,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
