import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../data/providers/db_provider.dart';
import '../../services/communication_service.dart';
import '../../widgets/index.dart';
import '../../utils/theme.dart';
import '../../widgets/language_selection_dialog.dart';
import '../../widgets/translated_text.dart';
import 'group_detail_view_model.dart';

class HistoryTab extends ConsumerStatefulWidget {
  final GroupDetailState state;
  final int groupId;
  const HistoryTab({super.key, required this.state, required this.groupId});

  @override
  ConsumerState<HistoryTab> createState() => _HistoryTabState();
}

class _HistoryTabState extends ConsumerState<HistoryTab> {
  String _filterType =
      'All'; // All, Regular, Late, Winner Payout, Winner Declared
  DateTimeRange? _dateRange;

  @override
  Widget build(BuildContext context) {
    List<dynamic> timeline = [
      ...widget.state.paymentHistory,
      ...widget.state.winners,
    ];

    // Filter by type
    if (_filterType != 'All') {
      timeline = timeline.where((item) {
        if (item is PaymentHistoryItem) {
          final isWinnerPayout =
              (item.payment.remarks ?? '').startsWith('🏆 Winner Payout:');
          if (_filterType == 'Regular') return !isWinnerPayout && !item.isLate;
          if (_filterType == 'Late') return !isWinnerPayout && item.isLate;

          if (_filterType == 'Winner Payout') return isWinnerPayout;
          return false;
        } else if (item is GroupRoundWinnerInfo) {
          return _filterType == 'Winner Declared';
        }
        return false;
      }).toList();
    }

    // Filter by date range
    if (_dateRange != null) {
      timeline = timeline.where((item) {
        DateTime date;
        if (item is PaymentHistoryItem) {
          date = item.payment.paymentDate;
        } else {
          final win = item as GroupRoundWinnerInfo;
          date =
              win.round.payoutDate ?? DateTime(win.round.year, win.round.month);
        }
        // Inclusive check
        return date
                .isAfter(_dateRange!.start.subtract(const Duration(days: 1))) &&
            date.isBefore(_dateRange!.end.add(const Duration(days: 1)));
      }).toList();
    }

    timeline.sort((a, b) {
      DateTime dateA = a is PaymentHistoryItem
          ? a.payment.paymentDate
          : (a as GroupRoundWinnerInfo).round.payoutDate ??
              DateTime((a).round.year, (a).round.month);
      DateTime dateB = b is PaymentHistoryItem
          ? b.payment.paymentDate
          : (b as GroupRoundWinnerInfo).round.payoutDate ??
              DateTime((b).round.year, (b).round.month);
      return dateB.compareTo(dateA); // Descending
    });

    return Column(
      children: [
        // Filters
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Row(
            children: [
              ActionChip(
                backgroundColor: Theme.of(context).brightness == Brightness.dark
                    ? Colors.grey[800]
                    : Colors.grey[200],
                avatar: const Icon(Icons.date_range_rounded, size: 16),
                label: Text(
                  _dateRange == null
                      ? 'Dates'
                      : '${DateFormat('MMM d').format(_dateRange!.start)} - ${DateFormat('MMM d').format(_dateRange!.end)}',
                ),
                onPressed: () async {
                  final range = await showDateRangePicker(
                    context: context,
                    firstDate: DateTime(2020),
                    lastDate: DateTime.now().add(const Duration(days: 365)),
                    initialDateRange: _dateRange,
                  );
                  if (range != null) {
                    setState(() => _dateRange = range);
                  }
                },
              ),
              if (_dateRange != null) ...[
                const SizedBox(width: 8),
                ActionChip(
                  backgroundColor: Colors.redAccent.withValues(alpha: 0.1),
                  label: const Text('Clear Dates',
                      style: TextStyle(color: Colors.redAccent)),
                  onPressed: () => setState(() => _dateRange = null),
                ),
              ],
              const SizedBox(width: 12),
              ...['All', 'Regular', 'Late', 'Winner Payout', 'Winner Declared']
                  .map((type) {
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ChoiceChip(
                    label: Text(type),
                    selected: _filterType == type,
                    selectedColor: AppTheme.primaryTeal.withValues(alpha: 0.2),
                    onSelected: (selected) {
                      if (selected) setState(() => _filterType = type);
                    },
                  ),
                );
              }),
            ],
          ),
        ),
        // List
        Expanded(
          child: timeline.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.history_rounded,
                          size: 56, color: Colors.grey.withValues(alpha: 0.5)),
                      const SizedBox(height: 12),
                      TranslatedText('No history matching filters.',
                          style: GoogleFonts.outfit(color: Colors.grey)),
                    ],
                  ),
                )
              : ListView.builder(
                  physics: const ClampingScrollPhysics(),
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                  itemCount: timeline.length,
                  itemBuilder: (ctx, i) {
                    final item = timeline[i];

                    if (item is PaymentHistoryItem) {
                      final p = item.payment;
                      final m = item.member;
                      final isWinnerPayout =
                          (p.remarks ?? '').startsWith('🏆 Winner Payout:');
                      final noteText = (p.remarks ?? '')
                          .replaceFirst('🏆 Winner Payout:', '')
                          .trim();

                      if (isWinnerPayout) {
                        return Card(
                          elevation: 0,
                          color: Theme.of(context).brightness == Brightness.dark
                              ? Colors.purple.withValues(alpha: 0.15)
                              : Colors.purple.shade50,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                            side: BorderSide(
                                color: Colors.purple.withValues(alpha: 0.4)),
                          ),
                          margin: const EdgeInsets.only(bottom: 10),
                          child: Material(
                            color: Colors.transparent,
                            child: ListTile(
                              leading: const CircleAvatar(
                                backgroundColor: Colors.purple,
                                child: Icon(Icons.arrow_upward_rounded,
                                    color: Colors.white, size: 20),
                              ),
                              title: Text(
                                'Paid (Prize) ₹${p.amount.toStringAsFixed(0)} — ${m.name}',
                                style: GoogleFonts.outfit(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 14,
                                    color: Colors.purple.shade800),
                              ),
                              subtitle: Text(
                                'Mode: ${p.paymentMode}${noteText.isNotEmpty ? ' • $noteText' : ''}',
                                style: GoogleFonts.outfit(
                                    fontSize: 12,
                                    color: Colors.purple.shade700),
                              ),
                              trailing: Text(
                                DateFormat('dd MMM yy, hh:mm a')
                                    .format(p.paymentDate),
                                style: GoogleFonts.outfit(
                                    fontSize: 10,
                                    color: Colors.purple.shade700),
                              ),
                            ),
                          ),
                        );
                      }

                      final hasWon = widget.state.winners.any((w) =>
                          (w.round.exchangedToMemberId ?? w.winner.id) == m.id);
                      final titleName = hasWon ? '${m.name} ⭐ Winner' : m.name;

                      return Card(
                        elevation: 0,
                        color: Theme.of(context).brightness == Brightness.dark
                            ? Colors.black26
                            : Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                          side: BorderSide(
                              color: Colors.grey.withValues(alpha: 0.2)),
                        ),
                        margin: const EdgeInsets.only(bottom: 10),
                        child: ListTile(
                          leading: const CircleAvatar(
                            backgroundColor: Colors.green,
                            child: Icon(Icons.arrow_downward_rounded,
                                color: Colors.white, size: 20),
                          ),
                          title: Row(
                            children: [
                              Expanded(
                                child: Text(
                                  'Received ₹${p.amount.toStringAsFixed(0)} — $titleName',
                                  style: GoogleFonts.outfit(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 14),
                                ),
                              ),
                              if (item.isLate)
                                Container(
                                  margin: const EdgeInsets.only(left: 8),
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color:
                                        Colors.redAccent.withValues(alpha: 0.1),
                                    borderRadius: BorderRadius.circular(6),
                                    border: Border.all(color: Colors.redAccent),
                                  ),
                                  child: Text(
                                    'Late',
                                    style: GoogleFonts.outfit(
                                        fontSize: 9,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.redAccent),
                                  ),
                                ),
                            ],
                          ),
                          subtitle: Text(
                            'Mode: ${p.paymentMode}${p.remarks != null && p.remarks!.isNotEmpty ? ' • ${p.remarks}' : ''}',
                            style: GoogleFonts.outfit(
                                fontSize: 12, color: Colors.grey),
                          ),
                          trailing: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.end,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                DateFormat('dd MMM yy').format(p.paymentDate),
                                style: GoogleFonts.outfit(
                                    fontSize: 10, color: Colors.grey),
                              ),
                              if (p.id != -1 && p.status == 'Completed') ...[
                                const SizedBox(height: 4),
                                Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    // Resend WhatsApp Receipt button
                                    if (m.phone.isNotEmpty)
                                      GestureDetector(
                                        onTap: () async {
                                          final chosenLang =
                                              await LanguageSelectionDialog
                                                  .show(context);
                                          if (chosenLang == null) return;
                                          if (!context.mounted) return;
                                          final monthLabel =
                                              '${item.roundMonth}/${item.roundYear}';
                                          final success =
                                              await CommunicationService()
                                                  .launchWhatsAppPaymentReceipt(
                                            dao: ref.read(appDaoProvider),
                                            groupId: widget.groupId,
                                            memberId: m.id,
                                            monthYear: monthLabel,
                                            languageCode: chosenLang,
                                          );
                                          if (!success && context.mounted) {
                                            DialogHelper.showSnackBar(
                                              context,
                                              message:
                                                  'Failed to open WhatsApp.',
                                              type: SnackBarType.error,
                                            );
                                          }
                                        },
                                        child: Container(
                                          padding: const EdgeInsets.symmetric(
                                              horizontal: 6, vertical: 3),
                                          decoration: BoxDecoration(
                                            color: Colors.green
                                                .withValues(alpha: 0.1),
                                            borderRadius:
                                                BorderRadius.circular(6),
                                            border: Border.all(
                                                color: Colors.green
                                                    .withValues(alpha: 0.4)),
                                          ),
                                          child: Row(
                                            mainAxisSize: MainAxisSize.min,
                                            children: [
                                              const Icon(Icons.send_rounded,
                                                  size: 10,
                                                  color: Colors.green),
                                              const SizedBox(width: 3),
                                              Text('Receipt',
                                                  style: GoogleFonts.outfit(
                                                      fontSize: 9,
                                                      color: Colors.green,
                                                      fontWeight:
                                                          FontWeight.bold)),
                                            ],
                                          ),
                                        ),
                                      ),
                                    const SizedBox(width: 6),
                                    GestureDetector(
                                      onTap: () async {
                                        final confirm = await showDialog<bool>(
                                          context: context,
                                          builder: (ctx) => AlertDialog(
                                            title: const Text('Undo Payment'),
                                            content: const Text(
                                                'Are you sure you want to undo this payment?'),
                                            actions: [
                                              TextButton(
                                                  onPressed: () =>
                                                      Navigator.pop(ctx, false),
                                                  child: const Text('Cancel')),
                                              ElevatedButton(
                                                style: ElevatedButton.styleFrom(
                                                    backgroundColor:
                                                        Colors.red),
                                                onPressed: () =>
                                                    Navigator.pop(ctx, true),
                                                child: const Text('Undo',
                                                    style: TextStyle(
                                                        color: Colors.white)),
                                              ),
                                            ],
                                          ),
                                        );
                                        if (confirm == true) {
                                          final dao = ref.read(appDaoProvider);
                                          await dao.deletePayment(p.id);
                                          ref.invalidate(groupDetailProvider);
                                          if (context.mounted) {
                                            ScaffoldMessenger.of(context)
                                                .showSnackBar(const SnackBar(
                                                    content: Text(
                                                        'Payment undone successfully')));
                                          }
                                        }
                                      },
                                      child: Text('Undo',
                                          style: GoogleFonts.outfit(
                                              fontSize: 11,
                                              color: Colors.redAccent,
                                              fontWeight: FontWeight.bold)),
                                    ),
                                  ],
                                ),
                              ],
                            ],
                          ),
                        ),
                      );
                    } else if (item is GroupRoundWinnerInfo) {
                      final w = item.winner;
                      final r = item.round;
                      final date = r.payoutDate ?? DateTime(r.year, r.month);

                      return Card(
                        elevation: 0,
                        color: Theme.of(context).brightness == Brightness.dark
                            ? Colors.amber.withValues(alpha: 0.1)
                            : Colors.amber.shade50,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                          side: BorderSide(
                              color: Colors.amber.withValues(alpha: 0.4)),
                        ),
                        margin: const EdgeInsets.only(bottom: 10),
                        child: ListTile(
                          leading: const CircleAvatar(
                            backgroundColor: Colors.amber,
                            child: Icon(Icons.emoji_events_rounded,
                                color: Colors.white, size: 20),
                          ),
                          title: TranslatedText('Winner Declared: [#1]',
                              style: GoogleFonts.outfit(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 14,
                                  color: Colors.amber.shade800),
                              replacements: {'[#1]': w.name}),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                  'Round ${r.roundNumber} • Bid: ₹${r.bidAmount?.toStringAsFixed(0) ?? '0'}',
                                  style: GoogleFonts.outfit(
                                      fontSize: 12,
                                      color: Colors.amber.shade900)),
                              Text(
                                  'Prize: ₹${(r.winnerBalance ?? 0).toStringAsFixed(0)}',
                                  style: GoogleFonts.outfit(
                                      fontSize: 12,
                                      color: Colors.amber.shade900)),
                              if (r.winnerPaid != null && r.winnerPaid! > 0)
                                TranslatedText(
                                    'Paid to [#1]: ₹${r.winnerPaid!.toStringAsFixed(0)}',
                                    style: GoogleFonts.outfit(fontSize: 12, color: Colors.green.shade700),
                                    replacements: {'[#1]': w.name}),
                              if (r.exchangedToMemberId != null)
                                Builder(builder: (context) {
                                  String exName = 'Unknown';
                                  for (var m in widget.state.members) {
                                    if (m.member.id == r.exchangedToMemberId) {
                                      exName = m.member.name;
                                      break;
                                    }
                                  }
                                  final exchangedAmount =
                                      (r.winnerBalance ?? 0) -
                                          (r.winnerPaid ?? 0);
                                  return TranslatedText(
                                      'Transferred to [#1]: ₹${exchangedAmount.toStringAsFixed(0)}',
                                      style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.orange.shade700),
                                      replacements: {'[#1]': exName});
                                }),
                            ],
                          ),
                          trailing: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text(
                                DateFormat('dd MMM yy, hh:mm a').format(date),
                                style: GoogleFonts.outfit(
                                    fontSize: 10, color: Colors.amber.shade900),
                              ),
                              const SizedBox(height: 4),
                              GestureDetector(
                                onTap: () async {
                                  final confirm = await showDialog<bool>(
                                    context: context,
                                    builder: (ctx) => AlertDialog(
                                      title: const Text('Undo Winner'),
                                      content: const Text(
                                          'Are you sure you want to undo this winner declaration?'),
                                      actions: [
                                        TextButton(
                                            onPressed: () =>
                                                Navigator.pop(ctx, false),
                                            child: const Text('Cancel')),
                                        ElevatedButton(
                                            style: ElevatedButton.styleFrom(
                                                backgroundColor: Colors.red),
                                            onPressed: () =>
                                                Navigator.pop(ctx, true),
                                            child: const Text('Undo',
                                                style: TextStyle(
                                                    color: Colors.white))),
                                      ],
                                    ),
                                  );
                                  if (confirm == true) {
                                    await ref
                                        .read(groupDetailActionsProvider)
                                        .deleteWinner(r.id);
                                    if (context.mounted) {
                                      ScaffoldMessenger.of(context)
                                          .showSnackBar(const SnackBar(
                                              content: Text(
                                                  'Winner undone successfully')));
                                    }
                                  }
                                },
                                child: Text('Undo',
                                    style: GoogleFonts.outfit(
                                        fontSize: 11,
                                        color: Colors.redAccent,
                                        fontWeight: FontWeight.bold)),
                              ),
                            ],
                          ),
                        ),
                      );
                    }
                    return const SizedBox.shrink();
                  },
                ),
        ),
      ],
    );
  }
}
