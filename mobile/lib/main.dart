import 'package:flutter/material.dart';
import 'theme/app_theme.dart';
import 'pages/main_wrapper.dart'; // Target utama

void main() {
  runApp(const RuangTenangApp());
}

class RuangTenangApp extends StatelessWidget {
  const RuangTenangApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'RuangTenang Mobile',
      theme: AppTheme.lightTheme,
      home: const MainWrapper(),
    );
  }
}