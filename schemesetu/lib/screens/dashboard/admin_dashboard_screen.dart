import 'package:chit_fund_app/utils/theme.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import 'dart:convert';
import 'checklists_screen.dart';
import 'admin_dashboard_view_model.dart';
import '../group/group_detail_screen.dart';
import '../group/group_screen.dart';
import '../member/member_screen.dart';
import '../payment/payment_screen.dart';
import '../pending/pending_list_screen.dart';
import '../settings/settings_screen.dart';
import '../../widgets/glass_card.dart';
import '../../providers/settings_provider.dart';
import '../../localization/app_localizations.dart';
import '../group/add_group_sheet.dart';
import '../onboarding/onboarding_screen.dart';
import '../../widgets/translated_text.dart';
import '../../services/notification_service.dart';
import '../../widgets/scroll_arrows_overlay.dart';
import '../../providers/module_provider.dart';

class AdminDashboardScreen extends ConsumerStatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  ConsumerState<AdminDashboardScreen> createState() =>
      _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends ConsumerState<AdminDashboardScreen> {
  bool _isDetailedView = true;
  String _chartType = 'Monthly'; // 'Weekly' or 'Monthly'

  late TextEditingController _notesCtrl;
  final ScrollController _scrollController = ScrollController();
  final stt.SpeechToText _speech = stt.SpeechToText();
  bool _isListening = false;

  @override
  void initState() {
    super.initState();
    _notesCtrl = TextEditingController();
    _loadNotes();
    _initSpeech();
  }

  @override
  void dispose() {
    _notesCtrl.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _loadNotes() async {
    final prefs = await SharedPreferences.getInstance();
    if (mounted) {
      setState(() {
        _notesCtrl.text = prefs.getString('dashboard_notes') ?? '';
      });
    }
  }

  Future<void> _saveNotes(String val) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('dashboard_notes', val);
  }

  void _initSpeech() async {
    try {
      await _speech.initialize(
        onStatus: (status) => debugPrint('onStatus: $status'),
        onError: (errorNotification) =>
            debugPrint('onError: $errorNotification'),
      );
    } catch (e) {
      debugPrint('Speech initialization failed: $e');
    }
  }

  void _listen() async {
    if (!_isListening) {
      bool available = false;
      try {
        available = await _speech.initialize();
      } catch (e) {
        debugPrint('Speech initialization failed: $e');
      }

      if (available) {
        setState(() => _isListening = true);
        _speech.listen(
          onResult: (val) => setState(() {
            _notesCtrl.text = val.recognizedWords;
            _saveNotes(_notesCtrl.text);
          }),
        );
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
              content:
                  Text('Speech recognition is not available on this device.')));
        }
      }
    } else {
      setState(() => _isListening = false);
      _speech.stop();
    }
  }

  String _maskAmount(double val) {
    return '₹${val.toStringAsFixed(0)}';
  }

  void _showLanguageDialog(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text(
          'Select Language',
          style: GoogleFonts.outfit(fontWeight: FontWeight.bold),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Text('🇺🇸', style: TextStyle(fontSize: 20)),
              title: Text('English', style: GoogleFonts.outfit()),
              trailing: ref.read(settingsProvider).locale.languageCode == 'en'
                  ? const Icon(Icons.check_circle, color: Colors.teal)
                  : null,
              onTap: () {
                ref.read(settingsProvider.notifier).setLocale('en');
                Navigator.pop(context);
              },
            ),
            ListTile(
              leading: const Text('🇮🇳', style: TextStyle(fontSize: 20)),
              title: Text('हिंदी (Hindi)', style: GoogleFonts.outfit()),
              trailing: ref.read(settingsProvider).locale.languageCode == 'hi'
                  ? const Icon(Icons.check_circle, color: Colors.teal)
                  : null,
              onTap: () {
                ref.read(settingsProvider.notifier).setLocale('hi');
                Navigator.pop(context);
              },
            ),
            ListTile(
              leading: const Text('🇮🇳', style: TextStyle(fontSize: 20)),
              title: Text('తెలుగు (Telugu)', style: GoogleFonts.outfit()),
              trailing: ref.read(settingsProvider).locale.languageCode == 'te'
                  ? const Icon(Icons.check_circle, color: Colors.teal)
                  : null,
              onTap: () {
                ref.read(settingsProvider.notifier).setLocale('te');
                Navigator.pop(context);
              },
            ),
            ListTile(
              leading: const Text('🇵🇰', style: TextStyle(fontSize: 20)),
              title: Text('اردو (Urdu)', style: GoogleFonts.outfit()),
              trailing: ref.read(settingsProvider).locale.languageCode == 'ur'
                  ? const Icon(Icons.check_circle, color: Colors.teal)
                  : null,
              onTap: () {
                ref.read(settingsProvider.notifier).setLocale('ur');
                Navigator.pop(context);
              },
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final metricsAsync = ref.watch(adminDashboardMetricsProvider);
    final localizations = AppLocalizations.of(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      // ── Sidebar Drawer ──────────────────────────────────────────────────
      drawer: Drawer(
        child: SafeArea(
          child: Column(
            children: [
              Container(
                width: double.infinity,
                padding:
                    const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [AppTheme.primaryTeal, Color(0xFF0F766E)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.2),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.account_balance_wallet_rounded,
                          color: Colors.white, size: 28),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      localizations.translate('app_title'),
                      style: GoogleFonts.outfit(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 20),
                    ),
                    Text(
                      'Admin Dashboard',
                      style: GoogleFonts.outfit(
                          color: Colors.white70, fontSize: 13),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              _drawerItem(context, Icons.apps_rounded, 'Switch Module', () {
                Navigator.pop(context); // Close drawer
                ref.read(activeModuleProvider.notifier).set(AppModule.hub);
              }),
              _drawerItem(context, Icons.dashboard_rounded, 'Dashboard',
                  () => Navigator.pop(context)),
              _drawerItem(context, Icons.groups_rounded, 'Groups', () {
                Navigator.pop(context);
                Navigator.push(context,
                    MaterialPageRoute(builder: (_) => const GroupScreen()));
              }),
              _drawerItem(context, Icons.people_alt_rounded, 'Members', () {
                Navigator.pop(context);
                Navigator.push(context,
                    MaterialPageRoute(builder: (_) => const MemberScreen()));
              }),
              _drawerItem(context, Icons.payments_rounded, 'Payments', () {
                Navigator.pop(context);
                Navigator.push(context,
                    MaterialPageRoute(builder: (_) => const PaymentScreen()));
              }),
              _drawerItem(
                  context, Icons.pending_actions_rounded, 'Pending Dues', () {
                Navigator.pop(context);
                Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (_) => const PendingListScreen()));
              }),
              _drawerItem(context, Icons.checklist_rounded, 'Checklists', () {
                Navigator.pop(context);
                Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (_) => const ChecklistsScreen()));
              }),
              _drawerItem(context, Icons.settings_rounded, 'Settings', () {
                Navigator.pop(context);
                Navigator.push(context,
                    MaterialPageRoute(builder: (_) => const SettingsScreen()));
              }),
              const Spacer(),
              const Divider(),
              Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Text(
                  'SanghaSetu v1.0',
                  style: GoogleFonts.outfit(fontSize: 12, color: Colors.grey),
                ),
              ),
            ],
          ),
        ),
      ),
      appBar: AppBar(
        title: Row(
          children: [
            GestureDetector(
              onTap: () {
                showDialog(
                  context: context,
                  builder: (ctx) => Dialog(
                    backgroundColor: Colors.transparent,
                    insetPadding: EdgeInsets.zero,
                    child: GestureDetector(
                      onTap: () => Navigator.pop(ctx),
                      child: InteractiveViewer(
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(16),
                          child: Image.asset('assets/images/logo.jpg',
                              fit: BoxFit.contain),
                        ),
                      ),
                    ),
                  ),
                );
              },
              child: ClipRRect(
                borderRadius: BorderRadius.circular(6),
                child: Image.asset('assets/images/logo.jpg',
                    width: 28, height: 28),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                localizations.translate('app_title'),
                style: GoogleFonts.outfit(
                    fontWeight: FontWeight.bold, fontSize: 20),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
        elevation: 0,
        actions: [
          PopupMenuButton<String>(
            icon: const Icon(Icons.more_vert_rounded),
            tooltip: 'Dashboard Tools',
            onSelected: (value) async {
              switch (value) {
                case 'theme':
                  ref.read(settingsProvider.notifier).toggleTheme();
                  break;
                case 'language':
                  _showLanguageDialog(context, ref);
                  break;
                case 'help':
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const OnboardingScreen()),
                  );
                  break;
                case 'notifications':
                  await NotificationService().requestPermission();
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Notification settings updated'),
                        backgroundColor: AppTheme.primaryTeal,
                      ),
                    );
                  }
                  break;
              }
            },
            itemBuilder: (BuildContext context) => <PopupMenuEntry<String>>[
              PopupMenuItem<String>(
                value: 'theme',
                child: Row(
                  children: [
                    Icon(Theme.of(context).brightness == Brightness.dark
                        ? Icons.light_mode_rounded
                        : Icons.dark_mode_rounded),
                    const SizedBox(width: 8),
                    const Text('Toggle Theme'),
                  ],
                ),
              ),
              const PopupMenuItem<String>(
                value: 'language',
                child: Row(
                  children: [
                    Icon(Icons.translate_rounded),
                    SizedBox(width: 8),
                    Text('Language'),
                  ],
                ),
              ),
              const PopupMenuItem<String>(
                value: 'help',
                child: Row(
                  children: [
                    Icon(Icons.help_outline_rounded),
                    SizedBox(width: 8),
                    Text('App Tour'),
                  ],
                ),
              ),
              const PopupMenuItem<String>(
                value: 'notifications',
                child: Row(
                  children: [
                    Icon(Icons.notifications_active_rounded),
                    SizedBox(width: 8),
                    Text('Notifications'),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
      body: metricsAsync.when(
        data: (metrics) {
          // Calculate efficiency index
          final double totalMonthlyExpected =
              metrics.monthlyCollection + metrics.monthlyPending;
          final double collectionEfficiency = totalMonthlyExpected > 0
              ? (metrics.monthlyCollection / totalMonthlyExpected) * 100
              : 0.0;

          final filteredDues = metrics.groupDues;

          return RefreshIndicator(
            onRefresh: () async => ref.refresh(adminDashboardMetricsProvider),
            child: ScrollArrowsOverlay(
              scrollController: _scrollController,
              child: SingleChildScrollView(
                controller: _scrollController,
                physics: const AlwaysScrollableScrollPhysics(),
                padding:
                    const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // ── Collection Efficiency gauge overlay ─────────────
                    _buildEfficiencyBanner(
                        context, collectionEfficiency, isDark),
                    const SizedBox(height: 20),

                    // ── Top 4 Columns (Summary Stats) ────────────────────
                    _buildSummaryCards(context, metrics, isDark, localizations),
                    const SizedBox(height: 24),

                    // ── Quick Actions (Centered) ──────────────────────────
                    Center(
                      child: Text(
                        localizations.translate('quick_actions'),
                        style: GoogleFonts.outfit(
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    _buildQuickActions(context, localizations),
                    const SizedBox(height: 24),
                    _buildNotesSection(context, isDark),
                    const SizedBox(height: 24),

                    // ── Foreman Earnings & Dividends secondary row ─────
                    _buildEarningsSummary(
                        context, metrics, isDark, localizations),
                    const SizedBox(height: 24),

                    // ── Group Pendings Section (Clickable) ───────────────
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          '${localizations.translate('pending_dues')} (${filteredDues.length})',
                          style: GoogleFonts.outfit(
                            fontWeight: FontWeight.bold,
                            fontSize: 18,
                          ),
                        ),
                        Row(
                          children: [
                            IconButton(
                              icon: Icon(
                                _isDetailedView
                                    ? Icons.view_headline_rounded
                                    : Icons.view_stream_rounded,
                                color: AppTheme.primaryTeal,
                                size: 20,
                              ),
                              onPressed: () {
                                setState(() {
                                  _isDetailedView = !_isDetailedView;
                                });
                              },
                              tooltip: _isDetailedView
                                  ? 'Compact View'
                                  : 'Detailed View',
                            )
                          ],
                        )
                      ],
                    ),
                    const SizedBox(height: 8),
                    _buildGroupPendingsList(context, filteredDues, isDark),
                    const SizedBox(height: 24),

                    // ── Recent Activity Feed ────────────────────────────
                    Text(
                      localizations.translate('recent_activity'),
                      style: GoogleFonts.outfit(
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                      ),
                    ),
                    const SizedBox(height: 12),
                    _buildRecentActivityFeed(
                        context, metrics.recentActivities, isDark),
                    const SizedBox(height: 24),

                    // ── Collection Trends Chart ──────────────────────────
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Collection Trends',
                          style: GoogleFonts.outfit(
                            fontWeight: FontWeight.bold,
                            fontSize: 18,
                          ),
                        ),
                        _buildChartTypeSelector(localizations),
                      ],
                    ),
                    const SizedBox(height: 12),
                    _buildChart(context, metrics, isDark),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(
          child: Text('Error loading dashboard: $err',
              style: GoogleFonts.outfit(color: Colors.red)),
        ),
      ),
    );
  }

  Widget _buildEfficiencyBanner(
      BuildContext context, double efficiency, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: isDark
              ? [const Color(0xFF0F172A), const Color(0xFF1E293B)]
              : [const Color(0xFFF1F5F9), Colors.white],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.primaryTeal.withValues(alpha: 0.15)),
      ),
      child: Row(
        children: [
          Stack(
            alignment: Alignment.center,
            children: [
              SizedBox(
                width: 55,
                height: 55,
                child: CircularProgressIndicator(
                  value: efficiency / 100,
                  strokeWidth: 6,
                  backgroundColor: Colors.grey.withValues(alpha: 0.15),
                  valueColor:
                      const AlwaysStoppedAnimation<Color>(AppTheme.primaryTeal),
                ),
              ),
              Text(
                '${efficiency.toStringAsFixed(0)}%',
                style: GoogleFonts.outfit(
                    fontWeight: FontWeight.bold, fontSize: 13),
              ),
            ],
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                TranslatedText(
                  'Collection Efficiency Index',
                  style: GoogleFonts.outfit(
                      fontWeight: FontWeight.bold, fontSize: 15),
                ),
                const SizedBox(height: 2),
                TranslatedText(
                  'Recovered dues ratio for the active month.',
                  style: GoogleFonts.outfit(fontSize: 12, color: Colors.grey),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryCards(BuildContext context, DashboardMetrics metrics,
      bool isDark, AppLocalizations localizations) {
    return GridView.count(
      crossAxisCount: MediaQuery.of(context).size.width > 600 ? 4 : 2,
      crossAxisSpacing: 16,
      mainAxisSpacing: 16,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      childAspectRatio: 1.15,
      children: [
        _buildStatCard(
            context,
            localizations.translate('monthly_collection'),
            metrics.monthlyCollection,
            true,
            Icons.payments_rounded,
            Colors.green,
            isDark),
        _buildStatCard(
            context,
            localizations.translate('pending_amount'),
            metrics.monthlyPending,
            true,
            Icons.receipt_long_rounded,
            Colors.orange,
            isDark),
        _buildStatCard(
            context,
            localizations.translate('auction_paid'),
            metrics.auctionWinnersPaidCount.toDouble(),
            false,
            Icons.emoji_events_rounded,
            Colors.blue,
            isDark),
        _buildStatCard(
            context,
            localizations.translate('auction_left'),
            metrics.auctionWinnersPendingCount.toDouble(),
            false,
            Icons.pending_rounded,
            Colors.red,
            isDark),
      ],
    );
  }

  Widget _buildEarningsSummary(BuildContext context, DashboardMetrics metrics,
      bool isDark, AppLocalizations localizations) {
    return GlassCard(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildTextStat(localizations.translate('foreman_commission'),
              _maskAmount(metrics.totalForemanEarnings), Colors.teal),
          Container(
              height: 30, width: 1, color: Colors.grey.withValues(alpha: 0.2)),
          _buildTextStat(
              localizations.translate('dividends_distributed'),
              _maskAmount(metrics.totalDividendsDistributed),
              Colors.deepOrange),
        ],
      ),
    );
  }

  Widget _buildTextStat(String label, String value, Color color) {
    return Column(
      children: [
        Text(label,
            style: GoogleFonts.outfit(fontSize: 12, color: Colors.grey)),
        const SizedBox(height: 4),
        Text(value,
            style: GoogleFonts.outfit(
                fontSize: 16, fontWeight: FontWeight.bold, color: color)),
      ],
    );
  }

  Widget _buildStatCard(BuildContext context, String title, double targetValue,
      bool isCurrency, IconData icon, Color color, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark
            ? color.withValues(alpha: 0.08)
            : color.withValues(alpha: 0.04),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withValues(alpha: 0.15)),
        boxShadow: [
          BoxShadow(
            color: color.withValues(alpha: 0.02),
            blurRadius: 10,
            offset: const Offset(0, 4),
          )
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: color, size: 28),
          const Spacer(),
          TweenAnimationBuilder<double>(
            tween: Tween<double>(begin: 0, end: targetValue),
            duration: const Duration(milliseconds: 1200),
            curve: Curves.easeOutCubic,
            builder: (context, value, child) {
              final displayValue = isCurrency
                  ? '₹${value.toStringAsFixed(0)}'
                  : value.toInt().toString();
              return Text(
                displayValue,
                style: GoogleFonts.outfit(
                    fontSize: 18, fontWeight: FontWeight.bold),
              );
            },
          ),
          const SizedBox(height: 4),
          Text(
            title,
            style: GoogleFonts.outfit(fontSize: 12, color: Colors.grey[600]),
          ),
        ],
      ),
    );
  }

  Widget _buildGroupPendingsList(
      BuildContext context, List<GroupDueInfo> dues, bool isDark) {
    if (dues.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Text(
            'No matching group dues found',
            style: GoogleFonts.outfit(color: Colors.grey),
          ),
        ),
      );
    }

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: dues.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final info = dues[index];
        final progress =
            (info.expected > 0 ? info.collected / info.expected : 0.0)
                .clamp(0.0, 1.0);
        final hasPending = info.pending > 0;

        // Calculate Defaulter Risk Rating
        String riskText = 'Low Risk';
        Color riskColor = Colors.green;
        if (hasPending) {
          if (progress < 0.5) {
            riskText = 'High Risk';
            riskColor = Colors.red;
          } else if (progress < 0.9) {
            riskText = 'Medium Risk';
            riskColor = Colors.orange;
          }
        }

        return GestureDetector(
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => GroupDetailScreen(group: info.group),
              ),
            );
          },
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Theme.of(context).cardColor,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: hasPending
                    ? Colors.orange.withValues(alpha: 0.2)
                    : Colors.grey.withValues(alpha: 0.15),
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.03),
                  blurRadius: 8,
                  offset: const Offset(0, 4),
                )
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Row(
                        children: [
                          Expanded(
                            child: TranslatedText(
                              info.group.name,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: GoogleFonts.outfit(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: riskColor.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              riskText,
                              style: GoogleFonts.outfit(
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                                color: riskColor,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: info.totalMembers == 0
                            ? Colors.grey.withValues(alpha: 0.08)
                            : hasPending
                                ? Colors.red.withValues(alpha: 0.08)
                                : Colors.green.withValues(alpha: 0.08),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        info.totalMembers == 0
                            ? 'No Members'
                            : hasPending
                                ? '${_maskAmount(info.pending)} Pending'
                                : 'All Paid ✓',
                        style: GoogleFonts.outfit(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: info.totalMembers == 0
                              ? Colors.grey
                              : hasPending
                                  ? Colors.red
                                  : Colors.green,
                        ),
                      ),
                    ),
                  ],
                ),
                if (_isDetailedView) ...[
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Paid Members: ${info.paidMembersCount} of ${info.totalMembers} | Slots: ${info.totalSlots.toStringAsFixed(0)}',
                        style: GoogleFonts.outfit(
                            fontSize: 11, color: Colors.grey),
                      ),
                      Text(
                        '${_maskAmount(info.collected)} / ${_maskAmount(info.expected)}',
                        style: GoogleFonts.outfit(
                            fontSize: 12, color: Colors.grey),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: progress,
                      backgroundColor: Colors.grey[200],
                      valueColor: AlwaysStoppedAnimation<Color>(
                        progress >= 1.0 ? Colors.green : Colors.teal,
                      ),
                      minHeight: 6,
                    ),
                  ),
                ],
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildRecentActivityFeed(
      BuildContext context, List<RecentActivity> activities, bool isDark) {
    if (activities.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.grey.withValues(alpha: 0.1)),
        ),
        child: Center(
          child: Text(
            'No recent payments or events logged.',
            style: GoogleFonts.outfit(color: Colors.grey),
          ),
        ),
      );
    }

    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.grey.withValues(alpha: 0.1)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.03),
            blurRadius: 8,
            offset: const Offset(0, 4),
          )
        ],
      ),
      child: ListView.separated(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: activities.length,
        separatorBuilder: (_, __) =>
            Divider(color: Colors.grey.withValues(alpha: 0.15), height: 1),
        itemBuilder: (context, index) {
          final act = activities[index];
          final isPayment = act.type == 'payment';
          final isAudit = act.type == 'audit';
          String displayTitle = act.title;

          return ListTile(
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            leading: CircleAvatar(
              backgroundColor: isAudit
                  ? Colors.blue.withValues(alpha: 0.1)
                  : (isPayment
                      ? Colors.green.withValues(alpha: 0.1)
                      : Colors.amber.withValues(alpha: 0.1)),
              child: Icon(
                isAudit
                    ? Icons.info_outline_rounded
                    : (isPayment
                        ? Icons.payments_rounded
                        : Icons.emoji_events_rounded),
                color: isAudit
                    ? Colors.blue
                    : (isPayment ? Colors.green : Colors.amber),
              ),
            ),
            title: TranslatedText(
              displayTitle,
              style:
                  GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w600),
            ),
            subtitle: TranslatedText(
              act.subtitle,
              style: GoogleFonts.outfit(fontSize: 12, color: Colors.grey),
            ),
            trailing: Text(
              '${act.timestamp.day.toString().padLeft(2, '0')}/${act.timestamp.month.toString().padLeft(2, '0')}\n${act.timestamp.hour.toString().padLeft(2, '0')}:${act.timestamp.minute.toString().padLeft(2, '0')}',
              style: GoogleFonts.outfit(fontSize: 11, color: Colors.grey[500]),
              textAlign: TextAlign.center,
            ),
          );
        },
      ),
    );
  }

  Widget _buildChartTypeSelector(AppLocalizations localizations) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.teal.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(12),
      ),
      padding: const EdgeInsets.all(4),
      child: Row(
        children: [
          _buildChartTypeBtn('Weekly'),
          _buildChartTypeBtn('Monthly'),
        ],
      ),
    );
  }

  Widget _buildChartTypeBtn(String type) {
    final isSelected = _chartType == type;
    return GestureDetector(
      onTap: () {
        setState(() {
          _chartType = type;
        });
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? Colors.teal : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(
          type,
          style: GoogleFonts.outfit(
            fontSize: 12,
            fontWeight: FontWeight.bold,
            color: isSelected ? Colors.white : Colors.teal,
          ),
        ),
      ),
    );
  }

  Widget _buildChart(
      BuildContext context, DashboardMetrics metrics, bool isDark) {
    final spots =
        _chartType == 'Weekly' ? metrics.weeklySpots : metrics.monthlySpots;

    return Container(
      height: 220,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.grey.withValues(alpha: 0.1)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.3 : 0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          )
        ],
      ),
      child: LineChart(
        LineChartData(
          gridData: const FlGridData(show: false),
          titlesData: const FlTitlesData(
            leftTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
            topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
            rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
          ),
          borderData: FlBorderData(show: false),
          lineBarsData: [
            LineChartBarData(
              spots: spots,
              isCurved: true,
              color: Theme.of(context).primaryColor,
              barWidth: 4,
              isStrokeCapRound: true,
              belowBarData: BarAreaData(
                show: true,
                color: Theme.of(context).primaryColor.withValues(alpha: 0.15),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNotesSection(BuildContext context, bool isDark) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 20,
            offset: const Offset(0, 8),
          )
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.amber.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.note_alt_rounded,
                    color: Colors.amber, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  'Notes & Reminders',
                  style: GoogleFonts.outfit(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    color: isDark ? Colors.white : const Color(0xFF0F172A),
                  ),
                ),
              ),
              // Add to Checklist button
              Tooltip(
                message: 'Add each line as a checklist task',
                child: TextButton.icon(
                  onPressed: () => _addNoteToChecklist(context),
                  icon: const Icon(Icons.checklist_rounded, size: 16),
                  label: Text('To Checklist',
                      style: GoogleFonts.outfit(
                          fontSize: 12, fontWeight: FontWeight.w600)),
                  style: TextButton.styleFrom(
                    foregroundColor: Colors.amber.shade700,
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _notesCtrl,
            maxLines: 4,
            style: GoogleFonts.outfit(fontSize: 14, height: 1.4),
            decoration: InputDecoration(
              hintText:
                  'Jot down quick updates, payment collection notes, or reminders...',
              hintStyle: GoogleFonts.outfit(color: Colors.grey, fontSize: 13),
              filled: true,
              fillColor: isDark
                  ? Colors.black.withValues(alpha: 0.2)
                  : Colors.amber.withValues(alpha: 0.03),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide:
                    BorderSide(color: Colors.amber.withValues(alpha: 0.15)),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide:
                    BorderSide(color: Colors.amber.withValues(alpha: 0.15)),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: Colors.amber, width: 1.5),
              ),
              suffixIcon: IconButton(
                icon: Icon(_isListening ? Icons.mic : Icons.mic_none,
                    color: _isListening ? Colors.red : Colors.grey),
                onPressed: _listen,
              ),
            ),
            onChanged: _saveNotes,
          ),
        ],
      ),
    );
  }

  Future<void> _addNoteToChecklist(BuildContext context) async {
    HapticFeedback.lightImpact();
    final text = _notesCtrl.text.trim();
    if (text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Notes are empty — nothing to add',
              style: GoogleFonts.outfit()),
          behavior: SnackBarBehavior.floating,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
      return;
    }
    final lines = text
        .split('\n')
        .map((l) => l.trim())
        .where((l) => l.isNotEmpty)
        .toList();
    final prefs = await SharedPreferences.getInstance();
    final existing = prefs.getString('admin_checklists');
    final List<Map<String, dynamic>> items = existing != null
        ? List<Map<String, dynamic>>.from(jsonDecode(existing))
        : [];
    final now = DateTime.now().millisecondsSinceEpoch;
    for (int i = 0; i < lines.length; i++) {
      items.insert(0, {
        'id': '${now}_$i',
        'text': lines[i],
        'isCompleted': false,
        'createdAt': DateTime.now().toIso8601String(),
      });
    }
    await prefs.setString('admin_checklists', jsonEncode(items));
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(children: [
            const Icon(Icons.check_circle_rounded,
                color: Colors.white, size: 18),
            const SizedBox(width: 8),
            Text(
                '${lines.length} item${lines.length > 1 ? 's' : ''} added to Checklist!',
                style: GoogleFonts.outfit(fontWeight: FontWeight.w600)),
          ]),
          backgroundColor: Colors.amber.shade700,
          behavior: SnackBarBehavior.floating,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
    }
  }

  Widget _buildQuickActions(
      BuildContext context, AppLocalizations localizations) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 20),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 15,
            offset: const Offset(0, 5),
          )
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          _buildActionButton(context, Icons.add_business_rounded,
              localizations.translate('add_group'), () {
            showModalBottomSheet(
              context: context,
              isScrollControlled: true,
              backgroundColor: Colors.transparent,
              builder: (context) => const AddGroupSheet(),
            );
          }),
          _buildActionButton(context, Icons.person_add_alt_1_rounded,
              localizations.translate('add_member'), () {
            showModalBottomSheet(
              context: context,
              isScrollControlled: true,
              backgroundColor: Colors.transparent,
              builder: (context) => const AddMemberSheet(),
            );
          }),
          _buildActionButton(context, Icons.pending_actions_rounded,
              localizations.translate('pending_list'), () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const PendingListScreen()),
            );
          }),
          _buildActionButton(context, Icons.checklist_rounded, 'Checklists',
              () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const ChecklistsScreen()),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildActionButton(
      BuildContext context, IconData icon, String label, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppTheme.primaryTeal, Color(0xFF0F766E)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: AppTheme.primaryTeal.withValues(alpha: 0.3),
                  blurRadius: 8,
                  offset: const Offset(0, 4),
                )
              ],
            ),
            child: Icon(icon, color: Colors.white, size: 28),
          ),
          const SizedBox(height: 8),
          TranslatedText(
            label,
            style: GoogleFonts.outfit(
              fontWeight: FontWeight.w600,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }

  Widget _drawerItem(
      BuildContext context, IconData icon, String title, VoidCallback onTap) {
    return ListTile(
      leading: Icon(icon, color: AppTheme.primaryTeal, size: 22),
      title: TranslatedText(
        title,
        style: GoogleFonts.outfit(fontWeight: FontWeight.w600, fontSize: 15),
      ),
      onTap: onTap,
    );
  }
}
