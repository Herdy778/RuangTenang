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
  static const Color textPrimary = Color(0xFF18181B); // Heading, angka
  static const Color textSecondary = Color(0xFF52525B); // Body text
  static const Color textMuted = Color(0xFFA1A1AA); // Subtitle, label, tanggal

  // --- Primary (Ungu) ---
  static const Color primaryLight = Color(0xFF8B5CF6); // Gradient ujung terang
  static const Color primary = Color(
    0xFF7C3AED,
  ); // Warna utama / gradient gelap
  static const Color primarySurface = Color(
    0xFFEDE9FE,
  ); // Background tag aktif nav
  static const Color primaryBorder = Color(0xFFDDD6FE); // Border elemen ungu
  static const Color primaryFocus = Color(0xFFA78BFA); // Focus ring input

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

  // ===========================================================================
  // DARK MODE COLORS
  // ===========================================================================
  static const Color backgroundDark = Color(0xFF09090B);
  static const Color cardBackgroundDark = Color(0xFF18181B);
  static const Color cardBorderDark = Color(0xFF27272A);

  static const Color textPrimaryDark = Color(0xFFFAFAFA);
  static const Color textSecondaryDark = Color(0xFFD4D4D8);
  static const Color textMutedDark = Color(0xFFA1A1AA); // Diperterang agar mudah dibaca di dark mode

  static const Color inputBorderDark = Color(0xFF3F3F46);
  static const Color inputFillDark = Color(0xFF18181B);
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
// =============================================================================

class AppTextStyles {
  AppTextStyles._();

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

  static TextStyle get brand => const TextStyle(
    fontFamily: 'Georgia',
    fontSize: 20,
    fontWeight: FontWeight.w500,
    color: AppColors.textPrimary,
  );
}

// =============================================================================
// APP DECORATIONS
// =============================================================================

class AppDecorations {
  AppDecorations._();

  static BoxDecoration get card => BoxDecoration(
    color: AppColors.cardBackground,
    borderRadius: BorderRadius.circular(16),
    border: Border.all(color: AppColors.cardBorder, width: 1),
    boxShadow: const [
      BoxShadow(color: Color(0x0A000000), blurRadius: 8, offset: Offset(0, 2)),
    ],
  );

  static BoxDecoration get cardLarge => BoxDecoration(
    color: AppColors.cardBackground,
    borderRadius: BorderRadius.circular(20),
    border: Border.all(color: AppColors.cardBorder, width: 1),
    boxShadow: const [
      BoxShadow(color: Color(0x0A000000), blurRadius: 12, offset: Offset(0, 2)),
    ],
  );

  static BoxDecoration get glass => BoxDecoration(
    color: const Color(0xCCFFFFFF),
    borderRadius: BorderRadius.circular(28),
    border: Border.all(color: const Color(0xB3FFFFFF), width: 1),
  );

  static BoxDecoration ctaCard(bool isDark) => BoxDecoration(
    gradient: LinearGradient(
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
      colors: isDark 
          ? const [Color(0xFF2E1065), Color(0xFF1E1B4B)] // Gelap dengan aksen ungu
          : const [Color(0xFFEDE9FE), Color(0xFFF5F3FF)],
    ),
    borderRadius: BorderRadius.circular(20),
    border: Border.all(
        color: isDark ? AppColors.primaryBorder.withOpacity(0.2) : AppColors.primaryBorder, 
        width: 1),
  );
}

// =============================================================================
// GRADIENTS
// =============================================================================

class AppGradients {
  AppGradients._();

  static const LinearGradient primaryButton = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [AppColors.primaryLight, AppColors.primary],
  );

  static const LinearGradient avatarGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [AppColors.primaryLight, AppColors.accentGreen],
  );
}

// =============================================================================
// THEME DATA
// =============================================================================

class AppTheme {
  AppTheme._();

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      primaryColor: AppColors.primary,
      scaffoldBackgroundColor: AppColors.background,
      fontFamily: GoogleFonts.dmSans().fontFamily,
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        iconTheme: IconThemeData(color: AppColors.textPrimary),
      ),
      colorScheme: const ColorScheme.light(
        primary: AppColors.primary,
        secondary: AppColors.accentGreen,
        surface: AppColors.background,
      ),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      primaryColor: AppColors.primary,
      scaffoldBackgroundColor: AppColors.backgroundDark,
      fontFamily: GoogleFonts.dmSans().fontFamily,
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.cardBackgroundDark,
        elevation: 0,
        centerTitle: true,
        iconTheme: IconThemeData(color: AppColors.textPrimaryDark),
      ),
      colorScheme: const ColorScheme.dark(
        primary: AppColors.primary,
        secondary: AppColors.accentGreen,
        surface: AppColors.backgroundDark,
      ),
    );
  }
}
