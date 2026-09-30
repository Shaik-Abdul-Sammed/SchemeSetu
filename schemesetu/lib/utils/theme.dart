import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Theme Colors
  static const Color darkBackground = Color(0xFF0F172A); // Slate 900
  static const Color darkSurface = Color(0xFF1E293B); // Slate 800
  static const Color textLight = Color(0xFFF8FAFC); // Slate 50
  static const Color textMuted = Color(0xFF94A3B8); // Slate 400
  static const Color primaryTeal = Color(0xFF0D9488); // Primary App Color

  static const Color lightBackground = Color(0xFFF8FAFC); // Slate 50
  static const Color lightSurface = Colors.white;
  static const Color textDark = Color(0xFF0F172A); // Slate 900
  static const Color textDarkMuted = Color(0xFF64748B); // Slate 500

  static Color getThemePrimary(String colorName) {
    switch (colorName) {
      case 'emerald':
        return const Color(0xFF059669);
      case 'blue':
        return const Color(0xFF2563EB);
      case 'plum':
        return const Color(0xFF8B5CF6);
      case 'slate':
        return const Color(0xFF475569);
      case 'teal':
      default:
        return const Color(0xFF0D9488);
    }
  }

  static Color getThemeSecondary(String colorName) {
    switch (colorName) {
      case 'emerald':
        return const Color(0xFF34D399);
      case 'blue':
        return const Color(0xFF60A5FA);
      case 'plum':
        return const Color(0xFFC084FC);
      case 'slate':
        return const Color(0xFF94A3B8);
      case 'teal':
      default:
        return const Color(0xFF10B981);
    }
  }

  // Dark Theme configuration
  static ThemeData darkTheme(String colorName) {
    final primary = getThemePrimary(colorName);
    final secondary = getThemeSecondary(colorName);
    return ThemeData(
      brightness: Brightness.dark,
      primaryColor: primary,
      scaffoldBackgroundColor: darkBackground,
      cardColor: darkSurface,
      colorScheme: ColorScheme.dark(
        primary: primary,
        secondary: secondary,
        surface: darkSurface,
        error: const Color(0xFFEF4444),
      ),
      textTheme:
          GoogleFonts.outfitTextTheme(ThemeData.dark().textTheme).copyWith(
        displayLarge: GoogleFonts.outfit(
            fontSize: 32, fontWeight: FontWeight.bold, color: textLight),
        titleLarge: GoogleFonts.outfit(
            fontSize: 20, fontWeight: FontWeight.w600, color: textLight),
        bodyLarge: GoogleFonts.outfit(fontSize: 16, color: textLight),
        bodyMedium: GoogleFonts.outfit(fontSize: 14, color: textMuted),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: darkSurface.withValues(alpha: 0.5),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.1)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.08)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: primary, width: 1.5),
        ),
        labelStyle: const TextStyle(color: textMuted),
      ),
    );
  }

  // Light Theme configuration
  static ThemeData lightTheme(String colorName) {
    final primary = getThemePrimary(colorName);
    final secondary = getThemeSecondary(colorName);
    return ThemeData(
      brightness: Brightness.light,
      primaryColor: primary,
      scaffoldBackgroundColor: lightBackground,
      cardColor: lightSurface,
      colorScheme: ColorScheme.light(
        primary: primary,
        secondary: secondary,
        surface: lightSurface,
        error: const Color(0xFFEF4444),
      ),
      textTheme:
          GoogleFonts.outfitTextTheme(ThemeData.light().textTheme).copyWith(
        displayLarge: GoogleFonts.outfit(
            fontSize: 32, fontWeight: FontWeight.bold, color: textDark),
        titleLarge: GoogleFonts.outfit(
            fontSize: 20, fontWeight: FontWeight.w600, color: textDark),
        bodyLarge: GoogleFonts.outfit(fontSize: 16, color: textDark),
        bodyMedium: GoogleFonts.outfit(fontSize: 14, color: textDarkMuted),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        iconTheme: IconThemeData(color: textDark),
        titleTextStyle: TextStyle(
            color: textDark, fontSize: 20, fontWeight: FontWeight.bold),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: Colors.black.withValues(alpha: 0.1)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: Colors.black.withValues(alpha: 0.08)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: primary, width: 1.5),
        ),
        labelStyle: const TextStyle(color: textDarkMuted),
      ),
    );
  }

  // Linear Gradient decoration for glass widgets
  static BoxDecoration getGlassDecoration({required bool isDark}) {
    return BoxDecoration(
      borderRadius: BorderRadius.circular(24),
      border: Border.all(
        color: isDark
            ? Colors.white.withValues(alpha: 0.08)
            : Colors.black.withValues(alpha: 0.05),
        width: 1.5,
      ),
      gradient: LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: isDark
            ? [
                Colors.white.withValues(alpha: 0.07),
                Colors.white.withValues(alpha: 0.02),
              ]
            : [
                Colors.white.withValues(alpha: 0.8),
                Colors.white.withValues(alpha: 0.4),
              ],
      ),
    );
  }
}
