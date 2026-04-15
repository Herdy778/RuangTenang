import 'package:flutter/material.dart';
import 'theme/app_theme.dart';
import 'pages/login_page.dart';
import 'pages/main_wrapper.dart';
import 'pages/register_page.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  runApp(const RuangTenangApp());
}

class RuangTenangApp extends StatelessWidget {
  const RuangTenangApp({super.key});

  Future<bool> checkLogin() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool('isLogin') ?? false;
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'RuangTenang Mobile',
      theme: AppTheme.lightTheme,

      home: FutureBuilder(
        future: checkLogin(),
        builder: (context, snapshot) {
          if (!snapshot.hasData) {
            return const Scaffold(
              body: Center(child: CircularProgressIndicator()),
            );
          }

          if (snapshot.data == true) {
            return const MainWrapper(); // ✅ langsung dashboard
          } else {
            return const LoginPage(); // ✅ login dulu
          }
        },
      ),

      routes: {
        '/login': (context) => const LoginPage(),
        '/register': (context) => const RegisterPage(),
        '/dashboard': (context) => const MainWrapper(),
      },
    );
  }
}
