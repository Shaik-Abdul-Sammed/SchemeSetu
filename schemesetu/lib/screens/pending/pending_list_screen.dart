import 'package:chit_fund_app/utils/theme.dart';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:table_calendar/table_calendar.dart';
import '../../data/local/app_database.dart';
import '../../localization/app_localizations.dart';
import '../../widgets/month_year_picker.dart';
import '../../widgets/index.dart';
import '../../services/communication_service.dart';
import '../group/groups_list_view_model.dart';
import 'pending_list_view_model.dart';
import '../../data/providers/db_provider.dart';
import 'package:chit_fund_app/widgets/translated_text.dart';
import 'package:chit_fund_app/screens/member/advanced_member_profile_screen.dart';
import '../../widgets/language_selection_dialog.dart';

class PendingListScreen extends ConsumerStatefulWidget {
  const PendingListScreen({super.key});
  @override
  ConsumerState<PendingListScreen> createState() => _PendingListScreenState();
}

class _PendingListScreenState extends ConsumerState<PendingListScreen> {
  final CommunicationService _communicationService = CommunicationService();

  // Calendar state — focusedDay is what navigates the calendar header
  late DateTime _focusedDay;
  // _selectedMonth is the chosen month (year+month only)
  late DateTime _selectedMonth;

  // Show/hide the calendar picker
  bool _calendarExpanded = false;

  int? _selectedGroupId; // null = all groups
  String _searchQuery = '';
  String _sortBy = 'amount'; // 'amount', 'name'
  bool _isSelectionMode = false;
  final Set<int> _selectedMemberIds = {};

  String get _selectedMonthLabel {
    const months = [
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
      'December'
    ];
    return '${months[_selectedMonth.month - 1]} ${_selectedMonth.year}';
  }

  int _daysOverdue() {
    final now = DateTime.now();
    final dueDate = DateTime(_selectedMonth.year, _selectedMonth.month, 10);
    final diff = now.difference(dueDate).inDays;
    return diff > 0 ? diff : 0;
  }

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    _focusedDay = now;
    _selectedMonth = DateTime(now.year, now.month);
  }

  /// Opens the shared month-year picker bottom sheet
  Future<void> _showMonthYearPicker() async {
    final result = await showMonthYearPicker(
      context: context,
      initialDate: _selectedMonth,
    );
    if (result != null && mounted) {
      setState(() {
        _selectedMonth = DateTime(result.year, result.month);
        _focusedDay = DateTime(result.year, result.month);
        _calendarExpanded = false;
      });
    }
  }

  void _callMember(String mobile) async {
    final success = await _communicationService.launchCall(mobile);
    if (!mounted) return;
    if (!success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: TranslatedText('Could not initiate phone call.')),
      );
    }
  }

  void _sendWhatsAppReminder(Member member) async {
    if (member.phone.isEmpty ||
        member.phone.replaceAll(RegExp(r'[^\d]'), '').isEmpty) {
      DialogHelper.showSnackBar(
        context,
        message: 'Cannot send WhatsApp reminder: member has no phone number.',
        type: SnackBarType.warning,
      );
      return;
    }
    final chosenLang = await LanguageSelectionDialog.show(context);
    if (chosenLang != null) {
      final dao = ref.read(appDaoProvider);
      final success =
          await _communicationService.launchConsolidatedWhatsAppReminder(
        dao: dao,
        member: member,
        languageCode: chosenLang,
      );
      if (!mounted) return;
      if (!success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content: TranslatedText(
                  'Could not open WhatsApp. Ensure application is installed.')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final localizations = AppLocalizations.of(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final groupsAsync = ref.watch(groupsListProvider);
    final pendingItemsAsync = ref.watch(pendingListProvider(_selectedMonth));

    return Scaffold(
      appBar: AppBar(
        title: TranslatedText(localizations.translate('pending_list'),
            style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
      ),
      body: Column(children: [
        // ── Calendar Picker Card ──────────────────────────────────
        GlassCard(
          margin: const EdgeInsets.fromLTRB(16, 12, 16, 0),
          padding: const EdgeInsets.all(0),
          child: Column(children: [
            // Header — tapping toggles the calendar
            InkWell(
              borderRadius: BorderRadius.circular(16),
              onTap: () =>
                  setState(() => _calendarExpanded = !_calendarExpanded),
              child: Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                child: Row(children: [
                  Container(
                    padding: const EdgeInsets.all(9),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [AppTheme.primaryTeal, Color(0xFF10B981)],
                      ),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.calendar_month_rounded,
                        color: Colors.white, size: 20),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          TranslatedText('Selected Period',
                              style: GoogleFonts.outfit(
                                  fontSize: 11, color: Colors.grey)),
                          TranslatedText(_selectedMonthLabel,
                              style: GoogleFonts.outfit(
                                fontSize: 17,
                                fontWeight: FontWeight.bold,
                                color: isDark
                                    ? Colors.white
                                    : const Color(0xFF0F172A),
                              )),
                        ]),
                  ),
                  AnimatedRotation(
                    turns: _calendarExpanded ? 0.5 : 0,
                    duration: const Duration(milliseconds: 250),
                    child: const Icon(Icons.expand_more_rounded,
                        color: AppTheme.primaryTeal, size: 26),
                  ),
                ]),
              ),
            ),

            // Animated calendar expand/collapse
            AnimatedCrossFade(
              firstChild: const SizedBox(width: double.infinity, height: 0),
              secondChild: Column(children: [
                Divider(height: 1, color: Colors.grey.withValues(alpha: 0.15)),
                Padding(
                  padding: const EdgeInsets.fromLTRB(8, 4, 8, 8),
                  child: TableCalendar(
                    firstDay: DateTime(2020, 1, 1),
                    lastDay: DateTime(2030, 12, 31),
                    focusedDay: _focusedDay,
                    calendarFormat: CalendarFormat.month,
                    availableCalendarFormats: const {
                      CalendarFormat.month: 'Month',
                    },
                    selectedDayPredicate: (day) =>
                        day.year == _selectedMonth.year &&
                        day.month == _selectedMonth.month,
                    onDaySelected: (selectedDay, focusedDay) {
                      setState(() {
                        _selectedMonth =
                            DateTime(selectedDay.year, selectedDay.month);
                        _focusedDay = focusedDay;
                        _calendarExpanded = false; // auto-collapse on pick
                      });
                    },
                    onHeaderTapped: (_) => _showMonthYearPicker(),
                    onPageChanged: (focusedDay) {
                      setState(() => _focusedDay = focusedDay);
                    },
                    headerStyle: HeaderStyle(
                      formatButtonVisible: false,
                      titleCentered: true,
                      titleTextStyle: GoogleFonts.outfit(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: isDark ? Colors.white : const Color(0xFF0F172A),
                      ),
                      leftChevronIcon: const Icon(Icons.chevron_left_rounded,
                          color: AppTheme.primaryTeal),
                      rightChevronIcon: const Icon(Icons.chevron_right_rounded,
                          color: AppTheme.primaryTeal),
                    ),
                    calendarStyle: CalendarStyle(
                      todayDecoration: BoxDecoration(
                        border:
                            Border.all(color: AppTheme.primaryTeal, width: 1.5),
                        shape: BoxShape.circle,
                      ),
                      todayTextStyle: GoogleFonts.outfit(
                        color: AppTheme.primaryTeal,
                        fontWeight: FontWeight.bold,
                      ),
                      selectedDecoration: const BoxDecoration(
                        color: AppTheme.primaryTeal,
                        shape: BoxShape.circle,
                      ),
                      selectedTextStyle: GoogleFonts.outfit(
                          color: Colors.white, fontWeight: FontWeight.bold),
                      defaultTextStyle: GoogleFonts.outfit(
                        color: isDark ? Colors.white70 : Colors.black87,
                      ),
                      weekendTextStyle: GoogleFonts.outfit(
                        color: Colors.redAccent.withValues(alpha: 0.8),
                      ),
                      outsideTextStyle:
                          GoogleFonts.outfit(color: Colors.grey.shade400),
                      rangeHighlightColor:
                          AppTheme.primaryTeal.withValues(alpha: 0.08),
                    ),
                    daysOfWeekStyle: DaysOfWeekStyle(
                      weekdayStyle: GoogleFonts.outfit(
                          fontSize: 12,
                          color: isDark ? Colors.white54 : Colors.grey,
                          fontWeight: FontWeight.w600),
                      weekendStyle: GoogleFonts.outfit(
                          fontSize: 12,
                          color: Colors.redAccent.withValues(alpha: 0.7),
                          fontWeight: FontWeight.w600),
                    ),
                  ),
                ),
              ]),
              crossFadeState: _calendarExpanded
                  ? CrossFadeState.showSecond
                  : CrossFadeState.showFirst,
              duration: const Duration(milliseconds: 280),
            ),
          ]),
        ),

        // ── Group Filter Chips ────────────────────────────────────
        groupsAsync.when(
          loading: () => const SizedBox.shrink(),
          error: (_, __) => const SizedBox.shrink(),
          data: (groupState) {
            if (groupState.groups.length <= 1) return const SizedBox.shrink();
            return Column(
              children: [
                const SizedBox(height: 10),
                SizedBox(
                  height: 36,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    children: [
                      _GroupFilterChip(
                        label: 'All Groups',
                        selected: _selectedGroupId == null,
                        onTap: () => setState(() => _selectedGroupId = null),
                      ),
                      const SizedBox(width: 8),
                      ...groupState.groups.map((g) => Padding(
                            padding: const EdgeInsets.only(right: 8),
                            child: _GroupFilterChip(
                              label: g.name,
                              selected: _selectedGroupId == g.id,
                              onTap: () =>
                                  setState(() => _selectedGroupId = g.id),
                            ),
                          )),
                    ],
                  ),
                ),
              ],
            );
          },
        ),

        // ── Search & Sort ────────────────────────────────────
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  decoration: InputDecoration(
                    hintText: 'Search members...',
                    hintStyle: GoogleFonts.outfit(color: Colors.grey),
                    prefixIcon:
                        const Icon(Icons.search_rounded, color: Colors.grey),
                    filled: true,
                    fillColor: isDark
                        ? Colors.white.withValues(alpha: 0.05)
                        : Colors.black.withValues(alpha: 0.03),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide.none,
                    ),
                    contentPadding: const EdgeInsets.symmetric(vertical: 0),
                  ),
                  onChanged: (val) => setState(() => _searchQuery = val),
                ),
              ),
              const SizedBox(width: 8),
              PopupMenuButton<String>(
                icon: const Icon(Icons.sort_rounded),
                tooltip: 'Sort by',
                onSelected: (val) => setState(() => _sortBy = val),
                itemBuilder: (context) => [
                  PopupMenuItem(
                      value: 'amount',
                      child: TranslatedText('Sort by Amount',
                          style: GoogleFonts.outfit(
                              color: _sortBy == 'amount'
                                  ? AppTheme.primaryTeal
                                  : null))),
                  PopupMenuItem(
                      value: 'name',
                      child: TranslatedText('Sort by Name',
                          style: GoogleFonts.outfit(
                              color: _sortBy == 'name'
                                  ? AppTheme.primaryTeal
                                  : null))),
                ],
              ),
            ],
          ),
        ),

        // ── Pending Members List ──────────────────────────────────
        Expanded(
          child: pendingItemsAsync.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (err, st) => Center(child: TranslatedText('Error: $err')),
            data: (pendingList) {
              var filteredList = pendingList;
              if (_selectedGroupId != null) {
                filteredList = filteredList
                    .where((item) => item.group.id == _selectedGroupId)
                    .toList();
              }

              final totalDue = filteredList.fold<double>(
                  0, (sum, item) => sum + item.dueAmount);
              final overdueDays = _daysOverdue();

              if (filteredList.isEmpty) {
                return EmptyStateWidget(
                  icon: Icons.check_circle_outline_rounded,
                  title: 'No pending dues for $_selectedMonthLabel! 🎉',
                  description: 'All members have paid for this period.',
                );
              }

              // Group items by member
              List<GroupedPendingItem> groupedList = [];
              if (_selectedGroupId == null) {
                final Map<int, List<PendingItem>> memberGroups = {};
                for (final item in filteredList) {
                  memberGroups.putIfAbsent(item.member.id, () => []).add(item);
                }
                for (final entry in memberGroups.entries) {
                  groupedList.add(GroupedPendingItem(
                    member: entry.value.first.member,
                    items: entry.value,
                  ));
                }
              } else {
                for (final item in filteredList) {
                  groupedList.add(GroupedPendingItem(
                    member: item.member,
                    items: [item],
                  ));
                }
              }

              // Search filtering
              if (_searchQuery.isNotEmpty) {
                groupedList = groupedList
                    .where((item) =>
                        item.member.name
                            .toLowerCase()
                            .contains(_searchQuery.toLowerCase()) ||
                        item.member.phone.contains(_searchQuery))
                    .toList();
              }

              // Sorting
              if (_sortBy == 'amount') {
                groupedList.sort((a, b) => b.totalDue.compareTo(a.totalDue));
              } else {
                groupedList
                    .sort((a, b) => a.member.name.compareTo(b.member.name));
              }

              return Column(
                children: [
                  Container(
                    margin: const EdgeInsets.fromLTRB(16, 12, 16, 12),
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 12),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: overdueDays > 0
                            ? [Colors.red.shade700, Colors.red.shade500]
                            : [AppTheme.primaryTeal, const Color(0xFF10B981)],
                      ),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Row(children: [
                      Icon(
                          overdueDays > 0
                              ? Icons.warning_amber_rounded
                              : Icons.pending_actions_rounded,
                          color: Colors.white,
                          size: 28),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              TranslatedText(
                                '${filteredList.length} member${filteredList.length > 1 ? 's' : ''} pending • $_selectedMonthLabel',
                                style: GoogleFonts.outfit(
                                    color: Colors.white70, fontSize: 12),
                              ),
                              TranslatedText(
                                'Total Due: ₹${totalDue.toStringAsFixed(0)}',
                                style: GoogleFonts.outfit(
                                    color: Colors.white,
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold),
                              ),
                            ]),
                      ),
                      if (overdueDays > 0)
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: TranslatedText('$overdueDays days\noverdue',
                              textAlign: TextAlign.center,
                              style: GoogleFonts.outfit(
                                  color: Colors.white,
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold)),
                        ),
                      const SizedBox(width: 8),
                      IconButton(
                        icon: const Icon(Icons.copy_all_rounded,
                            color: Colors.white),
                        tooltip: 'Copy Summary',
                        onPressed: () {
                          final buffer = StringBuffer();
                          buffer.writeln(
                              'Pending Dues Summary - $_selectedMonthLabel\n');
                          for (final item in groupedList) {
                            buffer.writeln(
                                '${item.member.name} (${item.member.phone}): ₹${item.totalDue.toStringAsFixed(0)}');
                            buffer.writeln('Groups: ${item.groupNamesLabel}\n');
                          }
                          buffer.writeln(
                              'Total Due: ₹${totalDue.toStringAsFixed(0)}');
                          Clipboard.setData(
                              ClipboardData(text: buffer.toString()));
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                                content: TranslatedText(
                                    'Pending summary copied to clipboard!')),
                          );
                        },
                      ),
                    ]),
                  ),
                  if (groupedList.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 4),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          TextButton.icon(
                            onPressed: () {
                              setState(() {
                                _isSelectionMode = !_isSelectionMode;
                                if (!_isSelectionMode)
                                  _selectedMemberIds.clear();
                              });
                            },
                            icon: Icon(
                                _isSelectionMode
                                    ? Icons.close_rounded
                                    : Icons.checklist_rounded,
                                size: 18),
                            label: TranslatedText(_isSelectionMode
                                ? 'Cancel Selection'
                                : 'Select Multiple'),
                          ),
                          if (_isSelectionMode && _selectedMemberIds.isNotEmpty)
                            ElevatedButton.icon(
                              onPressed: () {
                                final selectedGroups = groupedList
                                    .where((g) => _selectedMemberIds
                                        .contains(g.member.id))
                                    .toList();
                                final names = selectedGroups
                                    .map((g) => g.member.name)
                                    .join(', ');
                                ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                                    content: Text(
                                        'Bulk action for $names (Simulation)')));
                                setState(() {
                                  _isSelectionMode = false;
                                  _selectedMemberIds.clear();
                                });
                              },
                              icon: const Icon(Icons.send_rounded, size: 16),
                              label: TranslatedText(
                                  'Remind (${_selectedMemberIds.length})'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppTheme.primaryTeal,
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 12, vertical: 0),
                              ),
                            )
                        ],
                      ),
                    ),
                  Expanded(
                    child: ListView.builder(
                      padding: const EdgeInsets.fromLTRB(16, 0, 16, 20),
                      itemCount: groupedList.length,
                      itemBuilder: (context, index) {
                        final groupedItem = groupedList[index];
                        final Member member = groupedItem.member;
                        final String groupName = groupedItem.groupNamesLabel;
                        final double dueAmount = groupedItem.totalDue;
                        final bool isOverdue = overdueDays > 0;
                        final initial = member.name.trim().isNotEmpty
                            ? member.name.trim()[0].toUpperCase()
                            : '?';

                        return Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          child: GestureDetector(
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => AdvancedMemberProfileScreen(
                                      memberId: member.id),
                                ),
                              );
                            },
                            child: GlassCard(
                              padding: const EdgeInsets.all(14),
                              child: Row(children: [
                                // Selection Checkbox
                                if (_isSelectionMode) ...[
                                  Checkbox(
                                    value:
                                        _selectedMemberIds.contains(member.id),
                                    activeColor: AppTheme.primaryTeal,
                                    onChanged: (val) {
                                      setState(() {
                                        if (val == true) {
                                          _selectedMemberIds.add(member.id);
                                        } else {
                                          _selectedMemberIds.remove(member.id);
                                        }
                                      });
                                    },
                                  ),
                                  const SizedBox(width: 8),
                                ],
                                // Avatar with overdue dot
                                Stack(children: [
                                  CircleAvatar(
                                    radius: 26,
                                    backgroundColor: isOverdue
                                        ? Colors.red.withValues(alpha: 0.12)
                                        : AppTheme.primaryTeal
                                            .withValues(alpha: 0.12),
                                    backgroundImage: member.photoPath != null
                                        ? FileImage(File(member.photoPath!))
                                        : null,
                                    child: member.photoPath == null
                                        ? TranslatedText(initial,
                                            style: TextStyle(
                                                color: isOverdue
                                                    ? Colors.red
                                                    : AppTheme.primaryTeal,
                                                fontWeight: FontWeight.bold,
                                                fontSize: 18))
                                        : null,
                                  ),
                                  if (isOverdue)
                                    Positioned(
                                      bottom: 0,
                                      right: 0,
                                      child: Container(
                                        width: 14,
                                        height: 14,
                                        decoration: const BoxDecoration(
                                            color: Colors.red,
                                            shape: BoxShape.circle),
                                        child: const Icon(
                                            Icons.priority_high_rounded,
                                            size: 10,
                                            color: Colors.white),
                                      ),
                                    ),
                                ]),
                                const SizedBox(width: 12),

                                // Member info
                                Expanded(
                                  child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Row(children: [
                                          Expanded(
                                            child: Text(member.name,
                                                style: const TextStyle(
                                                    fontSize: 15,
                                                    fontWeight:
                                                        FontWeight.bold),
                                                maxLines: 1,
                                                overflow:
                                                    TextOverflow.ellipsis),
                                          ),
                                          if (isOverdue)
                                            Container(
                                              padding:
                                                  const EdgeInsets.symmetric(
                                                      horizontal: 6,
                                                      vertical: 2),
                                              decoration: BoxDecoration(
                                                color: Colors.red
                                                    .withValues(alpha: 0.1),
                                                borderRadius:
                                                    BorderRadius.circular(6),
                                              ),
                                              child: TranslatedText(
                                                  '$overdueDays d late',
                                                  style: GoogleFonts.outfit(
                                                      fontSize: 10,
                                                      color: Colors.red,
                                                      fontWeight:
                                                          FontWeight.bold)),
                                            ),
                                        ]),
                                        const SizedBox(height: 4),
                                        Text(groupName,
                                            maxLines: 2,
                                            overflow: TextOverflow.ellipsis,
                                            style: GoogleFonts.outfit(
                                              fontSize: 12,
                                              color: isDark
                                                  ? Colors.white60
                                                  : Colors.black54,
                                            )),
                                        const SizedBox(height: 6),
                                        TranslatedText(
                                            (groupedItem.items.isNotEmpty &&
                                                    groupedItem.items.first
                                                            .collectedAmount >
                                                        0)
                                                ? 'Left: ₹${dueAmount.toStringAsFixed(0)}'
                                                : '₹${dueAmount.toStringAsFixed(0)} due',
                                            style: GoogleFonts.outfit(
                                              fontSize: 16,
                                              fontWeight: FontWeight.bold,
                                              color: isOverdue
                                                  ? Colors.red
                                                  : AppTheme.primaryTeal,
                                            )),
                                        const SizedBox(height: 6),
                                        if (groupedItem.items.isNotEmpty &&
                                            groupedItem.items.first
                                                    .collectedAmount >
                                                0)
                                          TranslatedText(
                                              '(Paid: ₹${groupedItem.items.first.collectedAmount.toStringAsFixed(0)})',
                                              style: GoogleFonts.outfit(
                                                  fontSize: 11,
                                                  color: Colors.grey)),
                                        const SizedBox(height: 6),
                                        // Sparkline
                                        Row(
                                          children: groupedItem
                                              .items.first.recentHistory
                                              .map((paid) {
                                            return Container(
                                              width: 8,
                                              height: 8,
                                              margin: const EdgeInsets.only(
                                                  right: 3),
                                              decoration: BoxDecoration(
                                                shape: BoxShape.circle,
                                                color: paid
                                                    ? Colors.green
                                                    : Colors.red,
                                              ),
                                            );
                                          }).toList(),
                                        ),
                                      ]),
                                ),

                                // Action buttons
                                Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      _ActionIconBtn(
                                        icon: Icons.phone_rounded,
                                        color: Colors.green,
                                        tooltip: 'Call Member',
                                        onTap: () => _callMember(member.phone),
                                      ),
                                      const SizedBox(height: 6),
                                      _ActionIconBtn(
                                        icon: Icons.message_rounded,
                                        color: AppTheme.primaryTeal,
                                        tooltip: 'WhatsApp Reminder',
                                        onTap: () =>
                                            _sendWhatsAppReminder(member),
                                      ),
                                    ]),
                              ]),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              );
            },
          ),
        ),
      ]),
    );
  }
}

// ── Helper Widgets ────────────────────────────────────────────────────────────

class _GroupFilterChip extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;
  const _GroupFilterChip(
      {required this.label, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          color: selected
              ? AppTheme.primaryTeal
              : AppTheme.primaryTeal.withValues(alpha: 0.07),
          borderRadius: BorderRadius.circular(18),
          border: Border.all(
              color: selected ? AppTheme.primaryTeal : Colors.transparent),
        ),
        child: TranslatedText(label,
            style: GoogleFonts.outfit(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: selected ? Colors.white : AppTheme.primaryTeal,
            )),
      ),
    );
  }
}

class _ActionIconBtn extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String tooltip;
  final VoidCallback onTap;
  const _ActionIconBtn(
      {required this.icon,
      required this.color,
      required this.tooltip,
      required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: tooltip,
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: color, size: 18),
        ),
      ),
    );
  }
}
