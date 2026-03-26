import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

// =============================================================================
// APP COLORS
// Token warna statis yang mereplikasi Design System dari web RuangTenang (React)
// =============================================================================

class AppColors {
  AppColors._(); // Private constructor — kelas ini tidak di-instantiate

  // --- Background ---
  static const Color background = Color(0xFFFAFAFA);
  static const Color cardBackground = Color(0xFFFFFFFF);
  static const Color cardBorder = Color(0xFFF4F4F5);

  // --- Teks ---
  static const Color textPrimary = Color(0xFF18181B);   // Heading, angka
  static const Color textSecondary = Color(0xFF52525B); // Body text
  static const Color textMuted = Color(0xFFA1A1AA);     // Subtitle, label, tanggal

  // --- Primary (Ungu) ---
  static const Color primaryLight = Color(0xFF8B5CF6);  // Gradient ujung terang
  static const Color primary = Color(0xFF7C3AED);       // Warna utama / gradient gelap
  static const Color primarySurface = Color(0xFFEDE9FE); // Background tag aktif nav
  static const Color primaryBorder = Color(0xFFDDD6FE); // Border elemen ungu
  static const Color primaryFocus = Color(0xFFA78BFA);  // Focus ring input

  // --- Aksen Hijau ---
  static const Color accentGreen = Color(0xFF10B981);

  // --- Blob / Dekoratif ---
  static const Color blobPurple = Color(0xFFC4B5FD);
  static const Color blobGreen = Color(0xFF34D399);

  // --- Status / Alert ---
  static const Color errorBackground = Color(0xFFFFF1F2);
  static const Color errorText = Color(0xFFBE123C);
  static const Color successBackground = Color(0xFFF0FDF4);
  static const Color successText = Color(0xFF166534);

  // --- Input ---
  static const Color inputBorder = Color(0xFFE4E4E7);
  static const Color inputFill = Color(0xFFF3F4F6);
}

// =============================================================================
// MOOD COLORS
// Warna pastel per kategori mood — konsisten di semua halaman
// =============================================================================

class MoodStyle {
  final Color background;
  final Color textColor;
  final String emoji;
  const MoodStyle({
    required this.background,
    required this.textColor,
    required this.emoji,
  });
}

class AppMoodColors {
  AppMoodColors._();

  static const Map<String, MoodStyle> styles = {
    'Burnout': MoodStyle(
      background: Color(0xFFFEF3C7),
      textColor: Color(0xFF92400E),
      emoji: '😤',
    ),
    'Cemas': MoodStyle(
      background: Color(0xFFEDE9FE),
      textColor: Color(0xFF5B21B6),
      emoji: '😰',
    ),
    'Sedih': MoodStyle(
      background: Color(0xFFDBEAFE),
      textColor: Color(0xFF1E40AF),
      emoji: '😢',
    ),
    'Netral': MoodStyle(
      background: Color(0xFFF0FDF4),
      textColor: Color(0xFF166634),
      emoji: '😌',
    ),
    'Krisis': MoodStyle(
      background: Color(0xFFFFE4E6),
      textColor: Color(0xFF9F1239),
      emoji: '🆘',
    ),
  };

  /// Fallback jika mood tidak dikenali
  static const MoodStyle fallback = MoodStyle(
    background: Color(0xFFF4F4F5),
    textColor: Color(0xFF52525B),
    emoji: '😐',
  );

  /// Helper: ambil style berdasarkan nama mood string
  static MoodStyle of(String? mood) => styles[mood] ?? fallback;
}

// =============================================================================
// APP TEXT STYLES
// Tipografi yang mereplikasi DM Sans (body) + Georgia/serif (heading brand)
// =============================================================================

class AppTextStyles {
  AppTextStyles._();

  // --- Heading besar (Georgia / serif) ---
  // Digunakan pada judul halaman, greeting, brand name
  static TextStyle get headingXL => const TextStyle(
    fontFamily: 'Georgia',
    fontSize: 36,
    fontWeight: FontWeight.w500,
    color: AppColors.textPrimary,
    height: 1.2,
  );

  static TextStyle get headingLG => const TextStyle(
    fontFamily: 'Georgia',
    fontSize: 32,
    fontWeight: FontWeight.w500,
    color: AppColors.textPrimary,
    height: 1.3,
  );

  static TextStyle get headingMD => const TextStyle(
    fontFamily: 'Georgia',
    fontSize: 26,
    fontWeight: FontWeight.w500,
    color: AppColors.textPrimary,
    height: 1.3,
  );

  // --- Heading DM Sans ---
  static TextStyle get titleLG => GoogleFonts.dmSans(
    fontSize: 20,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
  );

  static TextStyle get titleMD => GoogleFonts.dmSans(
    fontSize: 18,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
  );

  static TextStyle get titleSM => GoogleFonts.dmSans(
    fontSize: 15,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
  );

  // --- Body ---
  static TextStyle get bodyLG => GoogleFonts.dmSans(
    fontSize: 16,
    fontWeight: FontWeight.w400,
    color: AppColors.textSecondary,
    height: 1.6,
  );

  static TextStyle get bodyMD => GoogleFonts.dmSans(
    fontSize: 15,
    fontWeight: FontWeight.w400,
    color: AppColors.textSecondary,
    height: 1.6,
  );

  static TextStyle get bodySM => GoogleFonts.dmSans(
    fontSize: 14,
    fontWeight: FontWeight.w400,
    color: AppColors.textSecondary,
    height: 1.5,
  );

  // --- Caption / Muted ---
  static TextStyle get caption => GoogleFonts.dmSans(
    fontSize: 13,
    fontWeight: FontWeight.w400,
    color: AppColors.textMuted,
  );

  static TextStyle get label => GoogleFonts.dmSans(
    fontSize: 13,
    fontWeight: FontWeight.w500,
    color: AppColors.textSecondary,
  );

  // --- Brand / Logo ---
  static TextStyle get brand => const TextStyle(
    fontFamily: 'Georgia',
    fontSize: 20,
    fontWeight: FontWeight.w500,
    color: AppColors.textPrimary,
  );
}

// =============================================================================
// CARD DECORATION HELPERS
// Box decoration yang sering dipakai ulang (agar tidak hardcode tiap widget)
// =============================================================================

class AppDecorations {
  AppDecorations._();

  /// Card standar: putih, sudut bulat 16, border tipis, shadow ringan
  static BoxDecoration get card => BoxDecoration(
    color: AppColors.cardBackground,
    borderRadius: BorderRadius.circular(16),
    border: Border.all(color: AppColors.cardBorder, width: 1),
    boxShadow: const [
      BoxShadow(
        color: Color(0x0A000000), // black opacity ~4%
        blurRadius: 8,
        offset: Offset(0, 2),
      ),
    ],
  );

  /// Card besar: sudut 20, shadow sedikit lebih dalam
  static BoxDecoration get cardLarge => BoxDecoration(
    color: AppColors.cardBackground,
    borderRadius: BorderRadius.circular(20),
    border: Border.all(color: AppColors.cardBorder, width: 1),
    boxShadow: const [
      BoxShadow(
        color: Color(0x0A000000),
        blurRadius: 12,
        offset: Offset(0, 2),
      ),
    ],
  );

  /// Card glassmorphism (halaman Breathing): blur + semi-transparan
  static BoxDecoration get glass => BoxDecoration(
    color: const Color(0xCCFFFFFF), // white 80%
    borderRadius: BorderRadius.circular(28),
    border: Border.all(color: const Color(0xB3FFFFFF), width: 1),
    boxShadow: const [
      BoxShadow(
        color: Color(0x1A6EE7B7), // green-ish glow
        blurRadius: 30,
        offset: Offset(0, 4),
      ),
    ],
  );

  /// CTA Card: gradient ungu muda
  static BoxDecoration get ctaCard => BoxDecoration(
    gradient: const LinearGradient(
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
      colors: [Color(0xFFEDE9FE), Color(0xFFF5F3FF)],
    ),
    borderRadius: BorderRadius.circular(20),
    border: Border.all(color: AppColors.primaryBorder, width: 1),
  );

  /// Result card (hasil analisis AI): ungu muda
  static BoxDecoration get resultCard => BoxDecoration(
    color: AppColors.cardBackground,
    borderRadius: BorderRadius.circular(20),
    border: Border.all(color: AppColors.primaryBorder, width: 1),
    boxShadow: const [
      BoxShadow(
        color: Color(0x148B5CF6), // purple opacity ~8%
        blurRadius: 12,
        offset: Offset(0, 2),
      ),
    ],
  );
}

// =============================================================================
// GRADIENT HELPERS
// =============================================================================

class AppGradients {
  AppGradients._();

  /// Gradient tombol utama (ungu)
  static const LinearGradient primaryButton = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [AppColors.primaryLight, AppColors.primary],
  );

  /// Gradient avatar / logo icon
  static const LinearGradient avatarGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [AppColors.primaryLight, AppColors.accentGreen],
  );
}

// =============================================================================
// THEME DATA
// ThemeData global yang di-apply ke MaterialApp
// =============================================================================

class AppTheme {
  AppTheme._();

  static ThemeData get lightTheme {
    final base = ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.primary,
        brightness: Brightness.light,
        surface: AppColors.background,
        primary: AppColors.primary,
        secondary: AppColors.accentGreen,
        onPrimary: Colors.white,
        onSurface: AppColors.textPrimary,
      ),
      scaffoldBackgroundColor: AppColors.background,
      fontFamily: GoogleFonts.dmSans().fontFamily,
    );

    return base.copyWith(
      // -----------------------------------------------------------------------
      // AppBar
      // -----------------------------------------------------------------------
      appBarTheme: AppBarTheme(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        elevation: 1,
        shadowColor: const Color(0x0F000000),
        centerTitle: true,
        iconTheme: const IconThemeData(color: AppColors.textPrimary),
        titleTextStyle: GoogleFonts.dmSans(
          fontSize: 18,
          fontWeight: FontWeight.w700,
          color: AppColors.primary,
          letterSpacing: 0.3,
        ),
      ),

      // -----------------------------------------------------------------------
      // Card
      // -----------------------------------------------------------------------
      cardTheme: CardThemeData(
        color: AppColors.cardBackground,
        elevation: 0, // shadow di-handle manual via BoxDecoration
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: AppColors.cardBorder, width: 1),
        ),
        shadowColor: const Color(0x0A000000),
      ),

      // -----------------------------------------------------------------------
      // ElevatedButton
      // -----------------------------------------------------------------------
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          textStyle: GoogleFonts.dmSans(
            fontSize: 15,
            fontWeight: FontWeight.w600,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),

      // -----------------------------------------------------------------------
      // TextButton
      // -----------------------------------------------------------------------
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AppColors.primary,
          textStyle: GoogleFonts.dmSans(
            fontSize: 14,
            fontWeight: FontWeight.w500,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      ),

      // -----------------------------------------------------------------------
      // OutlinedButton
      // -----------------------------------------------------------------------
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.textSecondary,
          side: const BorderSide(color: AppColors.inputBorder, width: 1.5),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          textStyle: GoogleFonts.dmSans(fontSize: 14, fontWeight: FontWeight.w500),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
        ),
      ),

      // -----------------------------------------------------------------------
      // Input Decoration (TextField / Form)
      // -----------------------------------------------------------------------
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        labelStyle: GoogleFonts.dmSans(fontSize: 13, color: AppColors.textMuted),
        hintStyle: GoogleFonts.dmSans(fontSize: 15, color: AppColors.textMuted),
        errorStyle: GoogleFonts.dmSans(fontSize: 12, color: AppColors.errorText),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.inputBorder, width: 1.5),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.inputBorder, width: 1.5),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.primaryFocus, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.errorText, width: 1.5),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.errorText, width: 1.5),
        ),
      ),

      // -----------------------------------------------------------------------
      // Bottom Navigation Bar
      // -----------------------------------------------------------------------
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: Colors.white,
        selectedItemColor: AppColors.primary,
        unselectedItemColor: AppColors.textSecondary,
        showSelectedLabels: true,
        showUnselectedLabels: true,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
        selectedLabelStyle: GoogleFonts.dmSans(
          fontSize: 11,
          fontWeight: FontWeight.w600,
        ),
        unselectedLabelStyle: GoogleFonts.dmSans(
          fontSize: 11,
          fontWeight: FontWeight.w400,
        ),
      ),

      // -----------------------------------------------------------------------
      // Tab Bar (digunakan pada Auth Login/Register)
      // -----------------------------------------------------------------------
      tabBarTheme: TabBarThemeData(
        indicator: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(10),
          boxShadow: const [
            BoxShadow(color: Color(0x14000000), blurRadius: 8, offset: Offset(0, 2)),
          ],
        ),
        labelColor: AppColors.primary,
        unselectedLabelColor: AppColors.textMuted,
        labelStyle: GoogleFonts.dmSans(fontSize: 14, fontWeight: FontWeight.w600),
        unselectedLabelStyle: GoogleFonts.dmSans(fontSize: 14, fontWeight: FontWeight.w400),
        dividerColor: Colors.transparent,
      ),

      // -----------------------------------------------------------------------
      // Chip (Mood Badge / Tag)
      // -----------------------------------------------------------------------
      chipTheme: ChipThemeData(
        backgroundColor: AppColors.cardBorder,
        selectedColor: AppColors.primarySurface,
        labelStyle: GoogleFonts.dmSans(fontSize: 12, fontWeight: FontWeight.w500),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
        shape: const StadiumBorder(),
        side: BorderSide.none,
      ),

      // -----------------------------------------------------------------------
      // Divider
      // -----------------------------------------------------------------------
      dividerTheme: const DividerThemeData(
        color: AppColors.cardBorder,
        thickness: 1,
        space: 0,
      ),

      // -----------------------------------------------------------------------
      // SnackBar
      // -----------------------------------------------------------------------
      snackBarTheme: SnackBarThemeData(
        backgroundColor: AppColors.textPrimary,
        contentTextStyle: GoogleFonts.dmSans(fontSize: 14, color: Colors.white),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        behavior: SnackBarBehavior.floating,
      ),

      // -----------------------------------------------------------------------
      // Text Theme global (agar semua Text widget default ke DM Sans)
      // -----------------------------------------------------------------------
      textTheme: GoogleFonts.dmSansTextTheme(base.textTheme).copyWith(
        displayLarge: const TextStyle(
          fontFamily: 'Georgia',
          fontSize: 36,
          fontWeight: FontWeight.w500,
          color: AppColors.textPrimary,
        ),
        displayMedium: const TextStyle(
          fontFamily: 'Georgia',
          fontSize: 32,
          fontWeight: FontWeight.w500,
          color: AppColors.textPrimary,
        ),
        displaySmall: const TextStyle(
          fontFamily: 'Georgia',
          fontSize: 26,
          fontWeight: FontWeight.w500,
          color: AppColors.textPrimary,
        ),
        headlineMedium: GoogleFonts.dmSans(
          fontSize: 20,
          fontWeight: FontWeight.w600,
          color: AppColors.textPrimary,
        ),
        titleLarge: GoogleFonts.dmSans(
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: AppColors.textPrimary,
        ),
        bodyLarge: GoogleFonts.dmSans(
          fontSize: 16,
          color: AppColors.textSecondary,
          height: 1.6,
        ),
        bodyMedium: GoogleFonts.dmSans(
          fontSize: 14,
          color: AppColors.textSecondary,
          height: 1.5,
        ),
        bodySmall: GoogleFonts.dmSans(
          fontSize: 13,
          color: AppColors.textMuted,
        ),
      ),
    );
  }
}
