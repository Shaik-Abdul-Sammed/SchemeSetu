import 'package:chit_fund_app/utils/theme.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:chit_fund_app/widgets/translated_text.dart';

/// Shows a polished bottom-sheet month-year picker.
///
/// - Drum-roll **year wheel** (2000–2050, auto-scrolls to selection)
/// - Animated **4-column month grid**
/// - No hard restriction on future months/years
///
/// Returns the selected [DateTime] (day always 1) or null if dismissed.
Future<DateTime?> showMonthYearPicker({
  required BuildContext context,
  required DateTime initialDate,
}) {
  return showModalBottomSheet<DateTime>(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (_) => _MonthYearPickerSheet(initialDate: initialDate),
  );
}

// ─── Bottom sheet ─────────────────────────────────────────────────────────────

class _MonthYearPickerSheet extends StatefulWidget {
  final DateTime initialDate;
  const _MonthYearPickerSheet({required this.initialDate});

  @override
  State<_MonthYearPickerSheet> createState() => _MonthYearPickerSheetState();
}

class _MonthYearPickerSheetState extends State<_MonthYearPickerSheet> {
  static const int _firstYear = 2000;
  static const int _lastYear = 2050;
  static const int _yearCount = _lastYear - _firstYear + 1; // 51 years

  late int _selectedYear;
  late int _selectedMonth;

  late FixedExtentScrollController _yearCtrl;

  static const _shortMonths = [
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
    'Dec',
  ];

  static const _fullMonths = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  @override
  void initState() {
    super.initState();
    _selectedYear = widget.initialDate.year.clamp(_firstYear, _lastYear);
    _selectedMonth = widget.initialDate.month;
    _yearCtrl = FixedExtentScrollController(
      initialItem: _selectedYear - _firstYear,
    );
  }

  @override
  void dispose() {
    _yearCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final now = DateTime.now();
    final bgColor = isDark ? const Color(0xFF1A1A2E) : Colors.white;

    return Container(
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.22),
            blurRadius: 32,
            offset: const Offset(0, -6),
          ),
        ],
      ),
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 36),
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        // ── Drag handle ──────────────────────────────────────────
        Center(
          child: Container(
            width: 44,
            height: 4,
            margin: const EdgeInsets.only(bottom: 18),
            decoration: BoxDecoration(
              color: Colors.grey.withValues(alpha: 0.35),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
        ),

        // ── Header: title + live badge ───────────────────────────
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            TranslatedText(
              'Select Month & Year',
              style: GoogleFonts.outfit(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: isDark ? Colors.white : const Color(0xFF0F172A),
              ),
            ),
            _LiveBadge(
              month: _shortMonths[_selectedMonth - 1],
              year: _selectedYear,
            ),
          ],
        ),
        const SizedBox(height: 22),

        // ── Year wheel + Month grid (side by side on wide, stacked on narrow) ──
        Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          // ── Year drum-roller ──────────────────────────────────
          Column(children: [
            TranslatedText(
              'YEAR',
              style: GoogleFonts.outfit(
                fontSize: 10,
                fontWeight: FontWeight.w700,
                letterSpacing: 1.2,
                color: Colors.grey,
              ),
            ),
            const SizedBox(height: 6),
            SizedBox(
              width: 88,
              height: 220,
              child: Stack(children: [
                // Highlight stripe for selected row
                Positioned.fill(
                  child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          height: 44,
                          margin: const EdgeInsets.symmetric(horizontal: 4),
                          decoration: BoxDecoration(
                            color: AppTheme.primaryTeal.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color:
                                  AppTheme.primaryTeal.withValues(alpha: 0.35),
                              width: 1.5,
                            ),
                          ),
                        ),
                      ]),
                ),
                // Fade top
                Positioned(
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 60,
                  child: IgnorePointer(
                    child: Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [bgColor, bgColor.withValues(alpha: 0)],
                        ),
                      ),
                    ),
                  ),
                ),
                // Fade bottom
                Positioned(
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 60,
                  child: IgnorePointer(
                    child: Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.bottomCenter,
                          end: Alignment.topCenter,
                          colors: [bgColor, bgColor.withValues(alpha: 0)],
                        ),
                      ),
                    ),
                  ),
                ),
                // Wheel
                ListWheelScrollView.useDelegate(
                  controller: _yearCtrl,
                  itemExtent: 44,
                  perspective: 0.003,
                  diameterRatio: 2.0,
                  physics: const FixedExtentScrollPhysics(),
                  onSelectedItemChanged: (i) {
                    setState(() => _selectedYear = _firstYear + i);
                  },
                  childDelegate: ListWheelChildBuilderDelegate(
                    childCount: _yearCount,
                    builder: (_, i) {
                      final year = _firstYear + i;
                      final isSelected = year == _selectedYear;
                      final isCurrentYear = year == now.year;
                      return Center(
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            if (isCurrentYear && !isSelected)
                              Container(
                                width: 5,
                                height: 5,
                                margin: const EdgeInsets.only(right: 4),
                                decoration: const BoxDecoration(
                                  color: AppTheme.primaryTeal,
                                  shape: BoxShape.circle,
                                ),
                              ),
                            TranslatedText(
                              '$year',
                              style: GoogleFonts.outfit(
                                fontSize: isSelected ? 20 : 15,
                                fontWeight: isSelected
                                    ? FontWeight.bold
                                    : FontWeight.w400,
                                color: isSelected
                                    ? AppTheme.primaryTeal
                                    : isDark
                                        ? Colors.white54
                                        : Colors.grey.shade500,
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
              ]),
            ),
          ]),

          const SizedBox(width: 16),

          // ── Month grid ────────────────────────────────────────
          Expanded(
            child:
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              TranslatedText(
                'MONTH',
                style: GoogleFonts.outfit(
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 1.2,
                  color: Colors.grey,
                ),
              ),
              const SizedBox(height: 6),
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 3,
                  crossAxisSpacing: 8,
                  mainAxisSpacing: 8,
                  childAspectRatio: 1.7,
                ),
                itemCount: 12,
                itemBuilder: (_, i) {
                  final month = i + 1;
                  final isSelected = month == _selectedMonth;
                  final isCurrentMonth =
                      _selectedYear == now.year && month == now.month;

                  return GestureDetector(
                    onTap: () => setState(() => _selectedMonth = month),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 180),
                      curve: Curves.easeOut,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: isSelected
                            ? AppTheme.primaryTeal
                            : AppTheme.primaryTeal.withValues(alpha: 0.07),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: isSelected
                              ? AppTheme.primaryTeal
                              : isCurrentMonth
                                  ? AppTheme.primaryTeal.withValues(alpha: 0.5)
                                  : Colors.transparent,
                          width: isCurrentMonth && !isSelected ? 1.5 : 1,
                        ),
                        boxShadow: isSelected
                            ? [
                                BoxShadow(
                                  color: AppTheme.primaryTeal
                                      .withValues(alpha: 0.35),
                                  blurRadius: 8,
                                  offset: const Offset(0, 3),
                                )
                              ]
                            : null,
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          TranslatedText(
                            _shortMonths[i],
                            style: GoogleFonts.outfit(
                              fontSize: 13,
                              fontWeight: isSelected
                                  ? FontWeight.bold
                                  : FontWeight.w600,
                              color: isSelected
                                  ? Colors.white
                                  : (isDark
                                      ? Colors.white70
                                      : const Color(0xFF0F172A)),
                            ),
                          ),
                          if (isCurrentMonth && !isSelected)
                            Container(
                              width: 4,
                              height: 4,
                              margin: const EdgeInsets.only(top: 2),
                              decoration: const BoxDecoration(
                                color: AppTheme.primaryTeal,
                                shape: BoxShape.circle,
                              ),
                            ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ]),
          ),
        ]),

        const SizedBox(height: 20),

        // ── Full selected label preview ───────────────────────────
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(vertical: 11),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [AppTheme.primaryTeal, Color(0xFF10B981)],
            ),
            borderRadius: BorderRadius.circular(14),
          ),
          child: TranslatedText(
            '${_fullMonths[_selectedMonth - 1]} $_selectedYear',
            textAlign: TextAlign.center,
            style: GoogleFonts.outfit(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
        ),
        const SizedBox(height: 14),

        // ── Buttons ───────────────────────────────────────────────
        Row(children: [
          Expanded(
            child: OutlinedButton(
              onPressed: () => Navigator.pop(context),
              style: OutlinedButton.styleFrom(
                side: BorderSide(color: Colors.grey.withValues(alpha: 0.4)),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14)),
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
              child: TranslatedText(
                'Cancel',
                style: GoogleFonts.outfit(
                    fontWeight: FontWeight.w600, color: Colors.grey),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            flex: 2,
            child: ElevatedButton(
              onPressed: () => Navigator.pop(
                  context, DateTime(_selectedYear, _selectedMonth)),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryTeal,
                foregroundColor: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14)),
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
              child: TranslatedText(
                'Confirm Selection',
                style: GoogleFonts.outfit(
                    fontWeight: FontWeight.bold, fontSize: 15),
              ),
            ),
          ),
        ]),
      ]),
    );
  }
}

// ─── Live badge ───────────────────────────────────────────────────────────────

class _LiveBadge extends StatelessWidget {
  final String month;
  final int year;
  const _LiveBadge({required this.month, required this.year});

  @override
  Widget build(BuildContext context) {
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 200),
      transitionBuilder: (child, anim) =>
          FadeTransition(opacity: anim, child: child),
      child: Container(
        key: ValueKey('$month$year'),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
        decoration: BoxDecoration(
          color: AppTheme.primaryTeal.withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(20),
          border:
              Border.all(color: AppTheme.primaryTeal.withValues(alpha: 0.3)),
        ),
        child: TranslatedText(
          '$month $year',
          style: GoogleFonts.outfit(
            fontSize: 13,
            fontWeight: FontWeight.bold,
            color: AppTheme.primaryTeal,
          ),
        ),
      ),
    );
  }
}
