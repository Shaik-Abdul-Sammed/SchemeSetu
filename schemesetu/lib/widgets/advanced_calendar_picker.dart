import 'package:chit_fund_app/utils/theme.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:chit_fund_app/widgets/translated_text.dart';

/// Advanced calendar widget for selecting winner month with visual indicators
class AdvancedCalendarPicker extends StatefulWidget {
  final String selectedMonth;
  final Function(String) onMonthSelected;
  final int monthsToShow;

  const AdvancedCalendarPicker({
    super.key,
    required this.selectedMonth,
    required this.onMonthSelected,
    this.monthsToShow = 12,
  });

  @override
  State<AdvancedCalendarPicker> createState() => _AdvancedCalendarPickerState();
}

class _AdvancedCalendarPickerState extends State<AdvancedCalendarPicker> {
  late ScrollController _scrollController;

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();

    // Scroll to current selection
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _scrollToSelectedMonth();
    });
  }

  void _scrollToSelectedMonth() {
    final selectedIndex = _getMonthIndex(widget.selectedMonth);
    if (selectedIndex >= 0) {
      _scrollController.animateTo(
        selectedIndex * 100.0,
        duration: const Duration(milliseconds: 500),
        curve: Curves.easeInOut,
      );
    }
  }

  int _getMonthIndex(String monthString) {
    final now = DateTime.now();
    final selectedParts = monthString.split('-');
    final selectedYear = int.parse(selectedParts[0]);
    final selectedMonthNum = int.parse(selectedParts[1]);

    for (int i = 0; i < widget.monthsToShow; i++) {
      final m = DateTime(now.year, now.month - i);
      if (m.year == selectedYear && m.month == selectedMonthNum) {
        return i;
      }
    }
    return -1;
  }

  String _getMonthName(DateTime date) {
    final months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ];
    return months[date.month - 1];
  }

  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16),
      decoration: BoxDecoration(
        color: isDark ? Colors.grey[900] : Colors.grey[50],
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: TranslatedText(
              'Select Bidding Month',
              style: GoogleFonts.outfit(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: Colors.grey[700],
              ),
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 100,
            child: ListView.builder(
              controller: _scrollController,
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              itemCount: widget.monthsToShow,
              itemBuilder: (context, index) {
                final month = DateTime(now.year, now.month - index);
                final monthStr =
                    '${month.year}-${month.month.toString().padLeft(2, '0')}';
                final isSelected = monthStr == widget.selectedMonth;

                return GestureDetector(
                  onTap: () => widget.onMonthSelected(monthStr),
                  child: Container(
                    width: 80,
                    margin: const EdgeInsets.symmetric(horizontal: 4),
                    decoration: BoxDecoration(
                      gradient: isSelected
                          ? LinearGradient(
                              colors: [
                                AppTheme.primaryTeal.withValues(alpha: 0.8),
                                AppTheme.primaryTeal,
                              ],
                            )
                          : null,
                      color: isSelected
                          ? null
                          : (isDark ? Colors.grey[800] : Colors.white),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isSelected
                            ? AppTheme.primaryTeal
                            : (isDark ? Colors.grey[700]! : Colors.grey[300]!),
                      ),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        TranslatedText(
                          _getMonthName(month),
                          style: GoogleFonts.outfit(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: isSelected
                                ? Colors.white
                                : (isDark ? Colors.white70 : Colors.grey[700]),
                          ),
                        ),
                        TranslatedText(
                          month.year.toString(),
                          style: GoogleFonts.outfit(
                            fontSize: 12,
                            color: isSelected
                                ? Colors.white70
                                : (isDark
                                    ? Colors.grey[400]
                                    : Colors.grey[500]),
                          ),
                        ),
                        if (isSelected)
                          const Padding(
                            padding: EdgeInsets.only(top: 4),
                            child: Icon(
                              Icons.check_circle,
                              color: Colors.white,
                              size: 16,
                            ),
                          ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }
}
