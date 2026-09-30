import 'package:chit_fund_app/utils/theme.dart';
import 'package:chit_fund_app/services/translation_service.dart';
import 'package:chit_fund_app/providers/settings_provider.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dashboard/admin_dashboard_screen.dart';
import 'payment/payment_screen.dart';
import 'member/member_screen.dart';
import 'group/group_screen.dart';
import 'more_screen.dart';
import 'dashboard/hub_screen.dart';
import 'shg/shg_dashboard_screen.dart';
import 'package:chit_fund_app/providers/module_provider.dart';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:chit_fund_app/screens/dashboard/admin_dashboard_view_model.dart';
import 'package:chit_fund_app/screens/group/groups_list_view_model.dart';
import 'package:chit_fund_app/screens/member/members_list_view_model.dart';
import 'package:chit_fund_app/screens/payment/payment_view_model.dart';

class MainScreen extends ConsumerStatefulWidget {
  const MainScreen({super.key});

  @override
  ConsumerState<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends ConsumerState<MainScreen> {
  int _currentIndex = 0;

  String _labelHome = 'Home';
  String _labelGroups = 'Groups';
  String _labelMembers = 'Members';
  String _labelPayments = 'Payments';
  String _labelMore = 'More';

  final List<Widget> _screens = [
    const AdminDashboardScreen(),
    const GroupScreen(isNested: true),
    const MemberScreen(isNested: true),
    const PaymentScreen(isNested: true),
    const MoreScreen(),
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadTranslations();
    });
  }

  Future<void> _loadTranslations() async {
    final lang = ref.read(settingsProvider).locale.languageCode;
    final t = ref.read(translationServiceProvider);

    final home = await t.translate('Home', lang);
    final groups = await t.translate('Groups', lang);
    final members = await t.translate('Members', lang);
    final payments = await t.translate('Payments', lang);
    final more = await t.translate('More', lang);

    if (mounted) {
      setState(() {
        _labelHome = home;
        _labelGroups = groups;
        _labelMembers = members;
        _labelPayments = payments;
        _labelMore = more;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    ref.listen(settingsProvider, (previous, next) {
      if (previous?.locale.languageCode != next.locale.languageCode) {
        _loadTranslations();
      }
    });

    final isDark = Theme.of(context).brightness == Brightness.dark;

    final activeModule = ref.watch(activeModuleProvider);

    if (activeModule == AppModule.hub) {
      return const HubScreen();
    }

    if (activeModule == AppModule.shg) {
      return const ShgDashboardScreen();
    }

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF0F172A) : Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.1),
              blurRadius: 10,
              offset: const Offset(0, -5),
            ),
          ],
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 8.0),
            child: BottomNavigationBar(
              elevation: 0,
              backgroundColor: Colors.transparent,
              type: BottomNavigationBarType.fixed,
              currentIndex: _currentIndex,
              selectedItemColor: AppTheme.primaryTeal,
              unselectedItemColor: Colors.grey,
              selectedLabelStyle:
                  GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 12),
              unselectedLabelStyle:
                  GoogleFonts.outfit(fontWeight: FontWeight.w500, fontSize: 12),
              onTap: (index) {
                if (_currentIndex != index) {
                  // Invalidate providers so they fetch fresh data when switching tabs
                  if (index == 0) ref.invalidate(adminDashboardMetricsProvider);
                  if (index == 1) ref.invalidate(groupsListProvider);
                  if (index == 2) ref.invalidate(memberListProvider);
                  if (index == 3) ref.invalidate(paymentProvider);
                }
                setState(() {
                  _currentIndex = index;
                });
              },
              items: [
                BottomNavigationBarItem(
                  icon: const Icon(Icons.dashboard_rounded),
                  label: _labelHome,
                ),
                BottomNavigationBarItem(
                  icon: const Icon(Icons.groups_rounded),
                  label: _labelGroups,
                ),
                BottomNavigationBarItem(
                  icon: const Icon(Icons.people_alt_rounded),
                  label: _labelMembers,
                ),
                BottomNavigationBarItem(
                  icon: const Icon(Icons.payments_rounded),
                  label: _labelPayments,
                ),
                BottomNavigationBarItem(
                  icon: const Icon(Icons.menu_rounded),
                  label: _labelMore,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
