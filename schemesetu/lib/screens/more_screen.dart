import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'winner/winner_screen.dart';
import 'reports/reports_screen.dart';
import 'settings/settings_screen.dart';
import 'pending/pending_list_screen.dart';
import 'payment/payment_history_screen.dart';
import '../widgets/glass_card.dart';
import 'group/past_groups_screen.dart';
import 'package:chit_fund_app/widgets/translated_text.dart';

class MoreScreen extends StatelessWidget {
  const MoreScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: TranslatedText('More',
            style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          _buildMenuTile(
            context,
            icon: Icons.emoji_events_rounded,
            title: 'Auction Winners',
            subtitle: 'Declare and manage winners',
            color: Colors.amber,
            destination: const WinnerScreen(),
          ),
          const SizedBox(height: 12),
          _buildMenuTile(
            context,
            icon: Icons.warning_amber_rounded,
            title: 'Pending Dues',
            subtitle: 'View and remind pending members',
            color: Colors.redAccent,
            destination: const PendingListScreen(),
          ),
          const SizedBox(height: 12),
          _buildMenuTile(
            context,
            icon: Icons.history_rounded,
            title: 'Payment History',
            subtitle: 'View all past transactions',
            color: Colors.teal,
            destination: const PaymentHistoryScreen(),
          ),
          const SizedBox(height: 12),
          _buildMenuTile(
            context,
            icon: Icons.pie_chart_rounded,
            title: 'Reports & Analytics',
            subtitle: 'View financial breakdown and export',
            color: Colors.purple,
            destination: const ReportsScreen(),
          ),
          const SizedBox(height: 12),
          _buildMenuTile(
            context,
            icon: Icons.history_rounded,
            title: 'Past Groups',
            subtitle: 'View completed and archived groups',
            color: Colors.indigo,
            destination: const PastGroupsScreen(),
          ),
          const SizedBox(height: 12),
          _buildMenuTile(
            context,
            icon: Icons.settings_rounded,
            title: 'Settings',
            subtitle: 'App preferences, security, backups',
            color: Colors.grey,
            destination: const SettingsScreen(),
          ),
        ],
      ),
    );
  }

  Widget _buildMenuTile(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
    required Widget destination,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return GlassCard(
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.15),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: color, size: 28),
        ),
        title: TranslatedText(
          title,
          style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        subtitle: TranslatedText(
          subtitle,
          style: GoogleFonts.outfit(
              fontSize: 13, color: isDark ? Colors.white70 : Colors.black54),
        ),
        trailing: const Icon(Icons.chevron_right_rounded, color: Colors.grey),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => destination),
          );
        },
      ),
    );
  }
}
