import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:chit_fund_app/utils/theme.dart';
import 'package:chit_fund_app/providers/module_provider.dart';
import 'package:chit_fund_app/widgets/glass_card.dart';
import 'package:chit_fund_app/localization/app_localizations.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../widgets/member_login_dialog.dart';
import '../manager/manager_dashboard.dart';
import '../worker/worker_dashboard.dart';

class HubScreen extends ConsumerWidget {
  const HubScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final localizations = AppLocalizations.of(context);

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: isDark
                ? [const Color(0xFF0F172A), const Color(0xFF1E293B)]
                : [const Color(0xFFF1F5F9), Colors.white],
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding:
                const EdgeInsets.symmetric(horizontal: 24.0, vertical: 20.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 20),
                Row(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: Image.asset('assets/images/logo.jpg',
                          width: 40, height: 40),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        localizations.translate('app_title'),
                        style: GoogleFonts.outfit(
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  'Select a module to continue',
                  style: GoogleFonts.outfit(
                    fontSize: 16,
                    color: Colors.grey[600],
                  ),
                ),
                const SizedBox(height: 40),
                Expanded(
                  child: ListView(
                    children: [
                      _buildModuleCard(
                        context: context,
                        ref: ref,
                        title: 'Chit Funds',
                        description:
                            'Manage chit groups, payments, and auctions',
                        icon: Icons.account_balance_wallet_rounded,
                        color: AppTheme.primaryTeal,
                        targetModule: AppModule.chitFund,
                      ),
                      const SizedBox(height: 24),
                      _buildModuleCard(
                        context: context,
                        ref: ref,
                        title: 'DWCRA Manager Portal',
                        description:
                            'Multi-group health tracking, savings audits, loan portfolio',
                        icon: Icons.admin_panel_settings_rounded,
                        color: AppTheme.primaryTeal,
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                                builder: (_) => const ManagerDashboardScreen()),
                          );
                        },
                      ),
                      const SizedBox(height: 24),
                      _buildModuleCard(
                        context: context,
                        ref: ref,
                        title: 'DWCRA Member Passbook',
                        description:
                            'Personal savings tracker, EMIs, What-If loan strategist',
                        icon: Icons.person_rounded,
                        color: Colors.deepPurple,
                        onTap: () async {
                          final prefs = await SharedPreferences.getInstance();
                          final isLoggedIn =
                              prefs.getBool('member_is_logged_in') ?? false;

                          if (context.mounted) {
                            if (isLoggedIn) {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                    builder: (_) =>
                                        const WorkerDashboardScreen()),
                              );
                            } else {
                              final success =
                                  await MemberLoginDialog.show(context);
                              if (success && context.mounted) {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                      builder: (_) =>
                                          const WorkerDashboardScreen()),
                                );
                              }
                            }
                          }
                        },
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildModuleCard({
    required BuildContext context,
    required WidgetRef ref,
    required String title,
    required String description,
    required IconData icon,
    required Color color,
    AppModule? targetModule,
    VoidCallback? onTap,
  }) {
    return GestureDetector(
      onTap: onTap ??
          () {
            if (targetModule != null) {
              ref.read(activeModuleProvider.notifier).set(targetModule);
            }
          },
      child: GlassCard(
        padding: const EdgeInsets.all(24),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 40, color: color),
            ),
            const SizedBox(width: 20),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: GoogleFonts.outfit(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    description,
                    style: GoogleFonts.outfit(
                      fontSize: 14,
                      color: Colors.grey,
                    ),
                  ),
                ],
              ),
            ),
            Icon(Icons.chevron_right_rounded, color: Colors.grey[400]),
          ],
        ),
      ),
    );
  }
}
