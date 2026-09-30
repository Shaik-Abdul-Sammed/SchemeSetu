import 'package:chit_fund_app/utils/theme.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:chit_fund_app/widgets/translated_text.dart';

class PrivacyPolicyScreen extends StatelessWidget {
  const PrivacyPolicyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: TranslatedText('Privacy Policy',
            style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
      ),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          _Section(
            icon: Icons.shield_rounded,
            title: 'Your Privacy Matters',
            body: 'SanghaSetu ("the App") is designed to help you manage chit '
                'fund groups securely. This Privacy Policy explains what data we '
                'collect, how we use it, and your rights.',
            isDark: isDark,
          ),
          _Section(
            icon: Icons.storage_rounded,
            title: 'Data We Collect',
            body: '• Mobile phone number (for local account access)\n'
                '• Group, member, and payment data you enter\n'
                '• Aadhar numbers (stored encrypted)\n'
                '• Device biometric data (never leaves your device — processed locally)',
            isDark: isDark,
          ),
          _Section(
            icon: Icons.cloud_rounded,
            title: 'How We Store Data',
            body: 'App data is stored locally on your device. '
                'Sensitive data like PINs are stored in Android\'s encrypted keystore, '
                'never in plain text. Backup files are created only when you export '
                'or restore them yourself.',
            isDark: isDark,
          ),
          _Section(
            icon: Icons.share_rounded,
            title: 'Data Sharing',
            body:
                'We do not sell, trade, or share your personal information with any '
                'third party. Data is only used to provide the features of this app. '
                'PDF reports you generate are shared only when you explicitly choose '
                'to share them via the share button.',
            isDark: isDark,
          ),
          _Section(
            icon: Icons.delete_forever_rounded,
            title: 'Your Rights',
            body: 'You can delete all your data at any time by logging out and '
                'contacting us. You have the right to access, correct, or delete '
                'any information stored about you.',
            isDark: isDark,
          ),
          _Section(
            icon: Icons.lock_rounded,
            title: 'Security',
            body: '• Local phone and PIN based access\n'
                '• PIN stored in encrypted keystore (Android Keystore)\n'
                '• Biometrics processed on-device only\n'
                '• Backup and restore files remain under your control',
            isDark: isDark,
          ),
          _Section(
            icon: Icons.contact_support_rounded,
            title: 'Contact',
            body:
                'If you have questions about this Privacy Policy or your data, '
                'please reach out through the app store listing or our support channel.',
            isDark: isDark,
          ),
          const SizedBox(height: 8),
          TranslatedText(
            'Last Updated: June 2026',
            textAlign: TextAlign.center,
            style: GoogleFonts.outfit(fontSize: 12, color: Colors.grey),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }
}

class _Section extends StatelessWidget {
  final IconData icon;
  final String title;
  final String body;
  final bool isDark;

  const _Section(
      {required this.icon,
      required this.title,
      required this.body,
      required this.isDark});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: AppTheme.primaryTeal, size: 22),
              const SizedBox(width: 10),
              TranslatedText(title,
                  style: GoogleFonts.outfit(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: isDark ? Colors.white : const Color(0xFF0F172A))),
            ],
          ),
          const SizedBox(height: 10),
          TranslatedText(body,
              style: GoogleFonts.outfit(
                  fontSize: 14,
                  color: isDark ? Colors.white70 : Colors.black87,
                  height: 1.6)),
        ],
      ),
    );
  }
}
