import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

import '../../data/local/app_database.dart';
import '../../data/providers/db_provider.dart';
import '../../widgets/glass_card.dart';
import '../../widgets/translated_text.dart';
import '../../providers/settings_provider.dart';
import 'group_detail_screen.dart';
import '../../widgets/scroll_arrows_overlay.dart';

// ── Data class holding enriched past-group info ─────────────────────────────

class PastGroupInfo {
  final Group group;
  final int memberCount;
  final double totalCollected;
  final int winnersCount;
  final List<String> paymentModes;

  const PastGroupInfo({
    required this.group,
    required this.memberCount,
    required this.totalCollected,
    required this.winnersCount,
    required this.paymentModes,
  });
}

// ── Provider ─────────────────────────────────────────────────────────────────

final pastGroupsProvider =
    FutureProvider.autoDispose<List<PastGroupInfo>>((ref) async {
  final dao = ref.watch(appDaoProvider);
  final groups = await dao.getPastGroups();

  final List<PastGroupInfo> result = [];

  for (final g in groups) {
    final memberships = await dao.getActiveMembershipsForGroup(g.id);
    final membershipIds = memberships.map((m) => m.id).toList();
    final payments = await dao.getPaymentsForMembershipIds(membershipIds);

    final completed = payments.where((p) => p.status == 'Completed');
    final totalCollected = completed.fold<double>(0, (s, p) => s + p.amount);

    // Gather unique payment modes (non-null, non-empty)
    final modes = payments
        .map((p) => p.paymentMode)
        .whereType<String>()
        .where((m) => m.trim().isNotEmpty)
        .toSet()
        .toList();

    // Count winners from rounds
    final rounds = await dao.getRoundsForGroup(g.id);
    final winnersCount = rounds.where((r) => r.winnerMemberId != null).length;

    result.add(PastGroupInfo(
      group: g,
      memberCount: memberships.length,
      totalCollected: totalCollected,
      winnersCount: winnersCount,
      paymentModes: modes,
    ));
  }

  return result;
});

// ── Screen ───────────────────────────────────────────────────────────────────

class PastGroupsScreen extends ConsumerStatefulWidget {
  const PastGroupsScreen({super.key});

  @override
  ConsumerState<PastGroupsScreen> createState() => _PastGroupsScreenState();
}

class _PastGroupsScreenState extends ConsumerState<PastGroupsScreen> {
  final ScrollController _scrollController = ScrollController();

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _confirmDeleteGroup(Group group) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: TranslatedText(
          'Permanently Delete Group',
          style: GoogleFonts.outfit(fontWeight: FontWeight.bold),
        ),
        content: TranslatedText(
          'Are you sure you want to permanently delete "${group.name}"? All associated data (payments, rounds, memberships) will be permanently deleted. This action cannot be undone.',
          style: GoogleFonts.outfit(),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: TranslatedText('Cancel',
                style: GoogleFonts.outfit(color: Colors.grey[600])),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: () => Navigator.pop(ctx, true),
            child: TranslatedText('Delete Permanently',
                style: GoogleFonts.outfit(
                    color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      final dao = ref.read(appDaoProvider);
      await dao.deleteGroup(group.id);
      ref.invalidate(pastGroupsProvider);

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: TranslatedText('"${group.name}" permanently deleted',
              style: GoogleFonts.outfit(color: Colors.white)),
          backgroundColor: Colors.red,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final asyncData = ref.watch(pastGroupsProvider);
    final currency = ref.watch(settingsProvider).currencySymbol;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: TranslatedText(
          'Past Groups',
          style: GoogleFonts.outfit(fontWeight: FontWeight.bold),
        ),
      ),
      body: asyncData.when(
        data: (items) {
          if (items.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.history_rounded,
                      size: 64, color: Colors.grey.withValues(alpha: 0.4)),
                  const SizedBox(height: 16),
                  TranslatedText(
                    'No past groups found.',
                    style: GoogleFonts.outfit(color: Colors.grey, fontSize: 16),
                  ),
                  const SizedBox(height: 8),
                  TranslatedText(
                    'Completed or archived groups will appear here.',
                    style: GoogleFonts.outfit(color: Colors.grey, fontSize: 13),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            );
          }
          return ScrollArrowsOverlay(
            scrollController: _scrollController,
            child: ListView.separated(
              controller: _scrollController,
              padding: const EdgeInsets.all(16),
              itemCount: items.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final info = items[index];
                final group = info.group;
                final endDate =
                    group.startDate.add(Duration(days: 30 * group.totalMonths));

                return InkWell(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => GroupDetailScreen(group: group),
                      ),
                    );
                  },
                  borderRadius: BorderRadius.circular(16),
                  child: GlassCard(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // ── Header row ──────────────────────────────────────
                        Row(
                          children: [
                            Container(
                              width: 44,
                              height: 44,
                              decoration: BoxDecoration(
                                color: Colors.indigo.withValues(alpha: 0.12),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Icon(
                                Icons.inventory_2_rounded,
                                color: Colors.indigo,
                                size: 22,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  TranslatedText(
                                    group.name,
                                    style: GoogleFonts.outfit(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                      color: isDark
                                          ? Colors.white70
                                          : Colors.black87,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    '${DateFormat('MMM yyyy').format(group.startDate)} – '
                                    '${DateFormat('MMM yyyy').format(endDate)}',
                                    style: GoogleFonts.outfit(
                                        fontSize: 12, color: Colors.grey),
                                  ),
                                ],
                              ),
                            ),
                            // Delete button
                            IconButton(
                              icon: const Icon(Icons.delete_outline_rounded,
                                  color: Colors.red, size: 22),
                              tooltip: 'Delete Group',
                              onPressed: () => _confirmDeleteGroup(group),
                            ),
                            const SizedBox(width: 4),
                            // Status badge
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.blueGrey.withValues(alpha: 0.12),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                    color:
                                        Colors.blueGrey.withValues(alpha: 0.3)),
                              ),
                              child: TranslatedText(
                                group.status == 'Completed'
                                    ? 'Completed'
                                    : 'Archived',
                                style: GoogleFonts.outfit(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.blueGrey,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),
                        Divider(
                            height: 1,
                            color: Colors.grey.withValues(alpha: 0.15)),
                        const SizedBox(height: 12),

                        // ── Stats row ───────────────────────────────────────
                        Row(
                          children: [
                            _buildInfoTile(
                              Icons.group_outlined,
                              'Members',
                              '${info.memberCount}',
                              Colors.teal,
                            ),
                            _buildInfoTile(
                              Icons.account_balance_wallet_outlined,
                              'Collected',
                              '$currency${info.totalCollected.toStringAsFixed(0)}',
                              Colors.green,
                            ),
                            _buildInfoTile(
                              Icons.emoji_events_outlined,
                              'Winners',
                              '${info.winnersCount}',
                              Colors.amber,
                            ),
                            _buildInfoTile(
                              Icons.timer_outlined,
                              'Duration',
                              '${group.totalMonths}m',
                              Colors.blue,
                            ),
                          ],
                        ),

                        // ── Payment modes ────────────────────────────────────
                        if (info.paymentModes.isNotEmpty) ...[
                          const SizedBox(height: 10),
                          Wrap(
                            spacing: 6,
                            runSpacing: 4,
                            children: info.paymentModes
                                .map((mode) => Container(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 8, vertical: 3),
                                      decoration: BoxDecoration(
                                        color:
                                            Colors.teal.withValues(alpha: 0.1),
                                        borderRadius: BorderRadius.circular(6),
                                        border: Border.all(
                                            color: Colors.teal
                                                .withValues(alpha: 0.3)),
                                      ),
                                      child: Text(
                                        mode,
                                        style: GoogleFonts.outfit(
                                            fontSize: 11,
                                            color: Colors.teal[700]),
                                      ),
                                    ))
                                .toList(),
                          ),
                        ],

                        // ── View full history hint ───────────────────────────
                        const SizedBox(height: 10),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            Icon(Icons.arrow_forward_ios_rounded,
                                size: 12,
                                color: Colors.grey.withValues(alpha: 0.6)),
                            const SizedBox(width: 4),
                            Text(
                              'Tap to view full history',
                              style: GoogleFonts.outfit(
                                  fontSize: 11,
                                  color: Colors.grey.withValues(alpha: 0.7)),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, st) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline_rounded,
                  size: 48, color: Colors.red.withValues(alpha: 0.7)),
              const SizedBox(height: 12),
              TranslatedText(
                'Could not load past groups.',
                style: GoogleFonts.outfit(color: Colors.red),
              ),
              const SizedBox(height: 8),
              TextButton(
                onPressed: () => ref.refresh(pastGroupsProvider),
                child: const TranslatedText('Retry'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoTile(
      IconData icon, String label, String value, Color color) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            Icon(icon, size: 13, color: color),
            const SizedBox(width: 4),
            Flexible(
              child: TranslatedText(
                label,
                style: GoogleFonts.outfit(fontSize: 11, color: Colors.grey),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ]),
          const SizedBox(height: 2),
          TranslatedText(
            value,
            style:
                GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.bold),
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}
