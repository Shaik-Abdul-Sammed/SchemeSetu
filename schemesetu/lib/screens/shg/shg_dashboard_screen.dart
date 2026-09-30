import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:chit_fund_app/utils/theme.dart';
import 'package:chit_fund_app/widgets/glass_card.dart';
import 'package:chit_fund_app/providers/shg_providers.dart';
import 'package:chit_fund_app/providers/module_provider.dart';
import 'shg_group_list_screen.dart';
import 'shg_group_detail_screen.dart';
import 'shg_meetings_screen.dart';
import 'shg_reports_screen.dart';
import 'add_shg_group_sheet.dart';
import 'add_shg_savings_sheet.dart';
import '../worker/loan_strategy.dart';

class ShgDashboardScreen extends ConsumerStatefulWidget {
  const ShgDashboardScreen({super.key});

  @override
  ConsumerState<ShgDashboardScreen> createState() => _ShgDashboardScreenState();
}

class _ShgDashboardScreenState extends ConsumerState<ShgDashboardScreen> {
  void _openMeetingsFlow(BuildContext context, AsyncValue groupsAsync) {
    groupsAsync.when(
      data: (groups) {
        if (groups.isEmpty) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Please create an SHG group first before managing meetings.'),
              backgroundColor: Colors.orange,
            ),
          );
          return;
        }

        if (groups.length == 1) {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => ShgMeetingsScreen(groupId: groups.first.id),
            ),
          );
          return;
        }

        // Multiple groups: let user pick which group's meetings to open
        showModalBottomSheet(
          context: context,
          backgroundColor: Theme.of(context).scaffoldBackgroundColor,
          shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          builder: (ctx) => SafeArea(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.all(20),
                  child: Text(
                    'Select SHG Group for Meetings',
                    style: GoogleFonts.outfit(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const Divider(height: 1),
                Flexible(
                  child: ListView.builder(
                    shrinkWrap: true,
                    itemCount: groups.length,
                    itemBuilder: (context, index) {
                      final g = groups[index];
                      return ListTile(
                        leading: CircleAvatar(
                          backgroundColor: Colors.blue.withValues(alpha: 0.1),
                          child: const Icon(Icons.event_note_rounded,
                              color: Colors.blue),
                        ),
                        title: Text(g.name,
                            style: GoogleFonts.outfit(
                                fontWeight: FontWeight.bold)),
                        subtitle: Text(
                            'Monthly Saving: ₹${g.monthlySavingAmount.toStringAsFixed(0)}'),
                        trailing: const Icon(Icons.chevron_right_rounded),
                        onTap: () {
                          Navigator.pop(ctx);
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) =>
                                  ShgMeetingsScreen(groupId: g.id),
                            ),
                          );
                        },
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        );
      },
      loading: () {},
      error: (_, __) {},
    );
  }

  @override
  Widget build(BuildContext context) {
    final groupsAsync = ref.watch(shgGroupsProvider);
    final statsAsync = ref.watch(shgDashboardStatsProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Text('DWAKRA / SHG',
            style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () {
            ref.read(activeModuleProvider.notifier).set(AppModule.hub);
          },
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.picture_as_pdf_rounded),
            tooltip: 'Reports & Passbooks',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => const ShgReportsScreen(),
                ),
              );
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(shgGroupsProvider);
          ref.invalidate(shgDashboardStatsProvider);
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildSummaryHeader(isDark, groupsAsync, statsAsync),
              const SizedBox(height: 24),
              Text(
                'Quick Actions',
                style: GoogleFonts.outfit(
                    fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              _buildQuickActions(context, groupsAsync),
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Your Groups',
                    style: GoogleFonts.outfit(
                        fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  TextButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                            builder: (_) => const ShgGroupListScreen()),
                      );
                    },
                    child: Text('View All',
                        style: GoogleFonts.outfit(color: AppTheme.primaryTeal)),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              _buildGroupsList(groupsAsync),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSummaryHeader(
      bool isDark, AsyncValue groupsAsync, AsyncValue<ShgDashboardStats> statsAsync) {
    return GlassCard(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.deepPurple.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.account_balance_rounded,
                    color: Colors.deepPurple),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Total SHG Groups',
                        style: GoogleFonts.outfit(
                            color: Colors.grey, fontSize: 14)),
                    groupsAsync.when(
                      data: (groups) => Text('${groups.length}',
                          style: GoogleFonts.outfit(
                              fontSize: 24, fontWeight: FontWeight.bold)),
                      loading: () => const SizedBox(
                          height: 24,
                          width: 24,
                          child: CircularProgressIndicator(strokeWidth: 2)),
                      error: (err, stack) => Text('Error',
                          style: GoogleFonts.outfit(color: Colors.red)),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          statsAsync.when(
            data: (stats) => Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildStatMetric(
                    'Active Loans', '${stats.activeLoans}', Colors.orange),
                Container(
                    width: 1,
                    height: 40,
                    color: Colors.grey.withValues(alpha: 0.2)),
                _buildStatMetric(
                    'Total Savings',
                    '₹${stats.totalSavings.toStringAsFixed(0)}',
                    Colors.green),
              ],
            ),
            loading: () => Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildStatMetric('Active Loans', '...', Colors.orange),
                Container(
                    width: 1,
                    height: 40,
                    color: Colors.grey.withValues(alpha: 0.2)),
                _buildStatMetric('Total Savings', '...', Colors.green),
              ],
            ),
            error: (_, __) => Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildStatMetric('Active Loans', '0', Colors.orange),
                Container(
                    width: 1,
                    height: 40,
                    color: Colors.grey.withValues(alpha: 0.2)),
                _buildStatMetric('Total Savings', '₹0', Colors.green),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatMetric(String label, String value, Color color) {
    return Column(
      children: [
        Text(value,
            style: GoogleFonts.outfit(
                fontSize: 20, fontWeight: FontWeight.bold, color: color)),
        const SizedBox(height: 4),
        Text(label,
            style: GoogleFonts.outfit(fontSize: 12, color: Colors.grey)),
      ],
    );
  }

  Widget _buildQuickActions(BuildContext context, AsyncValue groupsAsync) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceAround,
      children: [
        _buildActionBtn(
            context, Icons.group_add_rounded, 'New Group', Colors.teal, () {
          AddShgGroupSheet.show(context);
        }),
        _buildActionBtn(
            context, Icons.payments_rounded, 'Add Savings', Colors.green, () {
          AddShgSavingsSheet.show(context);
        }),
        _buildActionBtn(
            context, Icons.handshake_rounded, 'Issue Loan', Colors.orange, () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const LoanStrategyScreen()),
          );
        }),
        _buildActionBtn(
            context, Icons.event_note_rounded, 'Meeting', Colors.blue, () {
          _openMeetingsFlow(context, groupsAsync);
        }),
      ],
    );
  }

  Widget _buildActionBtn(BuildContext context, IconData icon, String label,
      Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: color.withValues(alpha: 0.3)),
            ),
            child: Icon(icon, color: color, size: 28),
          ),
          const SizedBox(height: 8),
          Text(label,
              style: GoogleFonts.outfit(
                  fontSize: 12, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }

  Widget _buildGroupsList(AsyncValue groupsAsync) {
    return groupsAsync.when(
      data: (groups) {
        if (groups.isEmpty) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 40),
              child: Text('No SHG groups created yet.',
                  style: GoogleFonts.outfit(color: Colors.grey)),
            ),
          );
        }
        return ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: groups.length > 3 ? 3 : groups.length,
          separatorBuilder: (context, index) => const SizedBox(height: 12),
          itemBuilder: (context, index) {
            final group = groups[index];
            return GlassCard(
              padding: EdgeInsets.zero,
              child: InkWell(
                borderRadius: BorderRadius.circular(16),
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) =>
                          ShgGroupDetailScreen(groupId: group.id),
                    ),
                  );
                },
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      CircleAvatar(
                        backgroundColor:
                            Colors.deepPurple.withValues(alpha: 0.1),
                        child: Text(
                          group.name.substring(0, 1).toUpperCase(),
                          style: const TextStyle(
                              color: Colors.deepPurple,
                              fontWeight: FontWeight.bold),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(group.name,
                                style: GoogleFonts.outfit(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold)),
                            Text(
                                'Monthly Saving: ₹${group.monthlySavingAmount.toStringAsFixed(0)}',
                                style: GoogleFonts.outfit(
                                    fontSize: 12, color: Colors.grey)),
                          ],
                        ),
                      ),
                      Icon(Icons.chevron_right_rounded,
                          color: Colors.grey[400]),
                    ],
                  ),
                ),
              ),
            );
          },
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (err, stack) => Center(
          child: Text('Error loading groups: $err',
              style: GoogleFonts.outfit(color: Colors.red))),
    );
  }
}
