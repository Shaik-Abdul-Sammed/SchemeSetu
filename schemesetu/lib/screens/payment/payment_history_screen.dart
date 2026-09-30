import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import 'payment_history_view_model.dart';
import '../../widgets/glass_card.dart';
import '../../widgets/enhanced_empty_state.dart';
import '../../utils/theme.dart';
import 'package:chit_fund_app/widgets/translated_text.dart';
import '../../widgets/scroll_arrows_overlay.dart';

class PaymentHistoryScreen extends ConsumerStatefulWidget {
  const PaymentHistoryScreen({super.key});

  @override
  ConsumerState<PaymentHistoryScreen> createState() =>
      _PaymentHistoryScreenState();
}

class _PaymentHistoryScreenState extends ConsumerState<PaymentHistoryScreen> {
  DateTime? _startDate;
  DateTime? _endDate;
  PaymentHistoryType? _selectedType;
  final ScrollController _scrollController = ScrollController();

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _pickDateRange() async {
    final range = await showDateRangePicker(
      context: context,
      firstDate: DateTime(2000),
      lastDate: DateTime.now().add(const Duration(days: 365)),
      initialDateRange: _startDate != null && _endDate != null
          ? DateTimeRange(start: _startDate!, end: _endDate!)
          : null,
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: AppTheme.primaryTeal,
              onPrimary: Colors.white,
              surface: Colors.white,
              onSurface: Colors.black,
            ),
          ),
          child: child!,
        );
      },
    );

    if (range != null) {
      setState(() {
        _startDate = range.start;
        _endDate = range.end;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final stateAsync = ref.watch(paymentHistoryProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: TranslatedText('Payment History',
            style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
      ),
      body: Column(
        children: [
          // Filter Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: isDark ? Colors.black26 : Colors.white,
              border: Border(
                  bottom:
                      BorderSide(color: Colors.grey.withValues(alpha: 0.2))),
            ),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  FilterChip(
                    label: TranslatedText(_startDate != null && _endDate != null
                        ? '${_startDate!.toString().split(' ')[0]} - ${_endDate!.toString().split(' ')[0]}'
                        : 'Filter by Date'),
                    selected: _startDate != null,
                    onSelected: (val) {
                      if (!val) {
                        setState(() {
                          _startDate = null;
                          _endDate = null;
                        });
                      } else {
                        _pickDateRange();
                      }
                    },
                    selectedColor: AppTheme.primaryTeal.withValues(alpha: 0.2),
                    checkmarkColor: AppTheme.primaryTeal,
                  ),
                  const SizedBox(width: 8),
                  DropdownButtonHideUnderline(
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      decoration: BoxDecoration(
                        border: Border.all(
                            color: Colors.grey.withValues(alpha: 0.4)),
                        borderRadius: BorderRadius.circular(20),
                        color: _selectedType != null
                            ? AppTheme.primaryTeal.withValues(alpha: 0.1)
                            : null,
                      ),
                      child: DropdownButton<PaymentHistoryType?>(
                        value: _selectedType,
                        hint: TranslatedText('All Types',
                            style: GoogleFonts.outfit(fontSize: 13)),
                        icon: const Icon(Icons.keyboard_arrow_down, size: 18),
                        items: const [
                          DropdownMenuItem(
                              value: null, child: TranslatedText('All Types')),
                          DropdownMenuItem(
                              value: PaymentHistoryType.regular,
                              child: TranslatedText('Regular Collections')),
                          DropdownMenuItem(
                              value: PaymentHistoryType.late,
                              child: TranslatedText('Late Payments')),
                          DropdownMenuItem(
                              value: PaymentHistoryType.winnerPaid,
                              child: TranslatedText('Winner Paid')),
                        ],
                        onChanged: (val) {
                          setState(() {
                            _selectedType = val;
                          });
                        },
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          Expanded(
            child: stateAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (err, st) => Center(child: TranslatedText('Error: $err')),
              data: (history) {
                // Apply filters
                var filtered = history.where((item) {
                  if (_selectedType != null && item.type != _selectedType)
                    return false;
                  if (_startDate != null && _endDate != null) {
                    final d = DateTime(
                        item.date.year, item.date.month, item.date.day);
                    final start = DateTime(
                        _startDate!.year, _startDate!.month, _startDate!.day);
                    final end = DateTime(
                        _endDate!.year, _endDate!.month, _endDate!.day);
                    if (d.isBefore(start) || d.isAfter(end)) return false;
                  }
                  return true;
                }).toList();

                if (filtered.isEmpty) {
                  return EnhancedEmptyState(
                    icon: '🕒',
                    title: 'No Payments Found',
                    description:
                        'No payments match the selected filters or date range.',
                    buttonLabel: 'Clear Filters',
                    onButtonPressed: () {
                      setState(() {
                        _selectedType = null;
                        _startDate = null;
                        _endDate = null;
                      });
                    },
                  );
                }

                return ScrollArrowsOverlay(
                  scrollController: _scrollController,
                  child: ListView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.all(16),
                    itemCount: filtered.length,
                    itemBuilder: (context, i) {
                      final item = filtered[i];

                      Color iconColor = Colors.green;
                      IconData iconData = Icons.check_circle_rounded;
                      String prefix = '+₹';

                      if (item.type == PaymentHistoryType.late) {
                        iconColor = Colors.orange;
                        iconData = Icons.warning_rounded;
                      } else if (item.type == PaymentHistoryType.winnerPaid) {
                        iconColor = Colors.purple;
                        iconData = Icons.emoji_events_rounded;
                        prefix = '-₹';
                      }

                      return Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: GlassCard(
                          padding: const EdgeInsets.all(16),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: iconColor.withValues(alpha: 0.1),
                                  shape: BoxShape.circle,
                                ),
                                child: Icon(iconData, color: iconColor),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(item.member.name,
                                        style: GoogleFonts.outfit(
                                            fontWeight: FontWeight.bold,
                                            fontSize: 16)),
                                    const SizedBox(height: 4),
                                    TranslatedText('Group: [#1]',
                                        style: GoogleFonts.outfit(
                                            color: Colors.grey, fontSize: 12),
                                        replacements: {
                                          '[#1]': item.group.name
                                        }),
                                    TranslatedText(
                                      'Date: ${item.date.day.toString().padLeft(2, '0')}/${item.date.month.toString().padLeft(2, '0')}/${item.date.year} ${item.date.hour > 12 ? (item.date.hour - 12).toString().padLeft(2, '0') : (item.date.hour == 0 ? '12' : item.date.hour.toString().padLeft(2, '0'))}:${item.date.minute.toString().padLeft(2, '0')} ${item.date.hour >= 12 ? 'PM' : 'AM'}',
                                      style: GoogleFonts.outfit(
                                          color: Colors.grey, fontSize: 12),
                                    ),
                                    if (item.note.isNotEmpty) ...[
                                      const SizedBox(height: 4),
                                      TranslatedText('Note: ${item.note}',
                                          style: GoogleFonts.outfit(
                                              color: Colors.blueGrey,
                                              fontSize: 12,
                                              fontStyle: FontStyle.italic)),
                                    ]
                                  ],
                                ),
                              ),
                              TranslatedText(
                                '$prefix${item.amount.toStringAsFixed(0)}',
                                style: GoogleFonts.outfit(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 18,
                                    color: iconColor),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
