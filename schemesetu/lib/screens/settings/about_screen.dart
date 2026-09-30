import 'package:chit_fund_app/utils/theme.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../widgets/glass_card.dart';
import 'package:chit_fund_app/widgets/translated_text.dart';

class AboutScreen extends StatelessWidget {
  const AboutScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: TranslatedText('About',
            style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
      ),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          // Logo and name
          Center(
            child: Column(
              children: [
                Container(
                  width: 96,
                  height: 96,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: const LinearGradient(
                      colors: [Color(0xFF0D4F47), AppTheme.primaryTeal],
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: AppTheme.primaryTeal.withValues(alpha: 0.35),
                        blurRadius: 24,
                        offset: const Offset(0, 12),
                      ),
                    ],
                  ),
                  child: const Icon(Icons.account_balance_wallet_rounded,
                      size: 48, color: Colors.white),
                ),
                const SizedBox(height: 16),
                TranslatedText('SanghaSetu',
                    style: GoogleFonts.outfit(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color:
                            isDark ? Colors.white : const Color(0xFF0F172A))),
                const SizedBox(height: 4),
                TranslatedText('Version 1.1.0 (Build 2)',
                    style:
                        GoogleFonts.outfit(fontSize: 13, color: Colors.grey)),
                const SizedBox(height: 6),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppTheme.primaryTeal.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: TranslatedText('Chit Fund Management System',
                      style: GoogleFonts.outfit(
                          fontSize: 12,
                          color: AppTheme.primaryTeal,
                          fontWeight: FontWeight.w600)),
                ),
              ],
            ),
          ),
          const SizedBox(height: 32),

          // Features
          GlassCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                TranslatedText('Features',
                    style: GoogleFonts.outfit(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color:
                            isDark ? Colors.white : const Color(0xFF0F172A))),
                const SizedBox(height: 16),
                for (final f in [
                  (Icons.groups_rounded, 'Multi-group Chit Fund Management'),
                  (Icons.payment_rounded, 'Real-time Payment Tracking'),
                  (Icons.picture_as_pdf_rounded, 'Professional PDF Reports'),
                  (Icons.emoji_events_rounded, 'Winner Draw Management'),
                  (Icons.notifications_rounded, 'Payment Due Alerts'),
                  (Icons.fingerprint_rounded, 'Biometric Security'),
                  (Icons.storage_rounded, 'Local Backup & Restore'),
                  (Icons.language_rounded, 'English / اردو / తెలుగు'),
                ]) ...[
                  Row(
                    children: [
                      Icon(f.$1, color: AppTheme.primaryTeal, size: 20),
                      const SizedBox(width: 12),
                      TranslatedText(f.$2,
                          style: GoogleFonts.outfit(fontSize: 14)),
                    ],
                  ),
                  const SizedBox(height: 10),
                ],
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Tech stack
          GlassCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                TranslatedText('Built With',
                    style: GoogleFonts.outfit(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color:
                            isDark ? Colors.white : const Color(0xFF0F172A))),
                const SizedBox(height: 14),
                for (final t in [
                  ('Flutter', '3.44.2'),
                  ('Local Auth', 'PIN & Biometrics'),
                  ('Shared Preferences', 'Local Storage'),
                  ('Material 3', 'Design System'),
                ])
                  Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        TranslatedText(t.$1,
                            style: GoogleFonts.outfit(fontSize: 14)),
                        TranslatedText(t.$2,
                            style: GoogleFonts.outfit(
                                fontSize: 13,
                                color: AppTheme.primaryTeal,
                                fontWeight: FontWeight.w600)),
                      ],
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          Center(
            child: TranslatedText(
              '© 2026 SanghaSetu. All rights reserved.',
              textAlign: TextAlign.center,
              style: GoogleFonts.outfit(fontSize: 12, color: Colors.grey),
            ),
          ),
        ],
      ),
    );
  }
}
