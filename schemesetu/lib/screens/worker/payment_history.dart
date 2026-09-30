import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:table_calendar/table_calendar.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:shimmer/shimmer.dart';
import '../../config/theme.dart';
import '../../config/app_icons.dart';
import '../../providers/shg_providers.dart';
import '../../services/pdf_service.dart';
import '../../data/local/app_database.dart';
import 'package:drift/drift.dart' hide Column;

class PaymentHistoryScreen extends ConsumerStatefulWidget {
  const PaymentHistoryScreen({super.key});

  @override
  ConsumerState<PaymentHistoryScreen> createState() =>
      _PaymentHistoryScreenState();
}

class _PaymentHistoryScreenState extends ConsumerState<PaymentHistoryScreen> {
  CalendarFormat _calendarFormat = CalendarFormat.month;
  DateTime _focusedDay = DateTime.now();
  DateTime? _selectedDay;
  String _selectedFilter = 'All';
  bool _isLoading = true;

  Member? _member;
  SHGGroup? _group;
  List<SHGSaving> _savings = [];
  List<SHGLoan> _loans = [];
  List<SHGLoanRepayment> _repayments = [];
  List<Map<String, dynamic>> _allTransactions = [];

  @override
  void initState() {
    super.initState();
    _loadTransactions();
  }

  Future<void> _loadTransactions() async {
    setState(() => _isLoading = true);
    try {
      final prefs = await SharedPreferences.getInstance();
      final memberId = prefs.getInt('member_logged_in_id') ?? 0;
      final groupId = prefs.getInt('member_logged_in_group_id') ?? 0;

      final dao = ref.read(shgDaoProvider);

      if (memberId > 0) {
        // Query Member Details
        final mQuery = dao.db.select(dao.db.members)
          ..where((t) => t.id.equals(memberId));
        final members = await mQuery.get();
        if (members.isNotEmpty) _member = members.first;

        // Query Group Details
        if (groupId > 0) {
          _group = await dao.getGroupById(groupId);

          // Get membership ID
          final memQuery = dao.db.select(dao.db.sHGMemberships)
            ..where(
                (t) => t.memberId.equals(memberId) & t.groupId.equals(groupId));
          final memberships = await memQuery.get();

          if (memberships.isNotEmpty) {
            final membershipId = memberships.first.id;

            // Fetch savings
            _savings = await dao.getSavingsByMembershipId(membershipId);

            // Fetch loans and their repayments
            _loans = await dao.getLoansByMembershipId(membershipId);
            _repayments.clear();
            for (var loan in _loans) {
              final reps = await dao.getRepaymentsByLoanId(loan.id);
              _repayments.addAll(reps);
            }
          }
        }
      }

      // Map combined history list
      _allTransactions.clear();
      for (var s in _savings) {
        _allTransactions.add({
          'id': 'SAV-${s.id}',
          'title': 'Savings Deposit',
          'date': s.date,
          'amount': '₹${s.amount.toStringAsFixed(0)}',
          'type': 'Savings',
          'method': 'UPI',
          'status': 'Success',
        });
      }
      for (var r in _repayments) {
        _allTransactions.add({
          'id': 'PAY-${r.id}',
          'title': 'EMI Repayment',
          'date': r.date,
          'amount':
              '₹${double.tryParse(r.principalPaid)?.toStringAsFixed(0) ?? '0'}',
          'type': 'Loan',
          'method': 'UPI (BHIM Gateway)',
          'status': 'Success',
        });
      }

      // Sort by date descending
      _allTransactions.sort(
          (a, b) => (b['date'] as DateTime).compareTo(a['date'] as DateTime));

      if (mounted) {
        setState(() => _isLoading = false);
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text('Failed to load history: $e'),
              backgroundColor: Colors.red),
        );
      }
    }
  }

  List<Map<String, dynamic>> get _filteredPayments {
    if (_selectedFilter == 'All') return _allTransactions;
    return _allTransactions.where((p) => p['type'] == _selectedFilter).toList();
  }

  List<Map<String, dynamic>> _getEventsForDay(DateTime day) {
    return _allTransactions.where((p) {
      final pDate = p['date'] as DateTime;
      return pDate.year == day.year &&
          pDate.month == day.month &&
          pDate.day == day.day;
    }).toList();
  }

  Future<void> _exportPdf() async {
    if (_member == null) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
          content: Text('Generating PDF Passbook...'),
          duration: Duration(seconds: 1)),
    );
    try {
      final pdfData = await PdfService().generateSHGMemberPassbook(
        memberName: _member!.name,
        groupName: _group?.name ?? 'SangaSetu SHG',
        savings: _savings
            .map((s) => {
                  'month': s.date.month,
                  'year': s.date.year,
                  'amount': s.amount,
                  'paidDate': s.date,
                })
            .toList(),
        loans: _loans
            .map((l) => {
                  'principalAmount': double.tryParse(l.principalAmount) ?? 0.0,
                  'interestRate': l.interestRate,
                  'status': l.status,
                  'issuedDate': l.loanDate,
                })
            .toList(),
      );

      await PdfService().shareReport(pdfData, 'dwcra_member_passbook.pdf');
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            content: Text('Failed to export PDF: $e'),
            backgroundColor: Colors.red),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Theme(
      data: AppTheme.lightTheme,
      child: Scaffold(
        appBar: AppBar(
          title: Text(
            'Payment Ledger',
            style: GoogleFonts.poppins(fontWeight: FontWeight.bold),
          ),
          actions: [
            IconButton(
              icon: const Icon(AppIcons.pdf),
              onPressed: _exportPdf,
              tooltip: 'Export PDF Passbook',
            ),
          ],
        ),
        body: SafeArea(
          child: _isLoading
              ? Shimmer.fromColors(
                  baseColor: Colors.grey[300]!,
                  highlightColor: Colors.grey[100]!,
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      children: List.generate(
                          4,
                          (_) => Container(
                              height: 100,
                              margin: const EdgeInsets.only(bottom: 16),
                              color: Colors.white)),
                    ),
                  ),
                )
              : Column(
                  children: [
                    _buildCalendarTracker(),
                    const Divider(height: 1),
                    _buildFilterBar(),
                    Expanded(
                      child: _buildPaymentsList(),
                    ),
                  ],
                ),
        ),
      ),
    );
  }

  Widget _buildCalendarTracker() {
    return Card(
      margin: const EdgeInsets.all(12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.only(bottom: 8.0),
        child: TableCalendar<Map<String, dynamic>>(
          firstDay: DateTime.now().subtract(const Duration(days: 365)),
          lastDay: DateTime.now().add(const Duration(days: 30)),
          focusedDay: _focusedDay,
          calendarFormat: _calendarFormat,
          selectedDayPredicate: (day) {
            return isSameDay(_selectedDay, day);
          },
          eventLoader: _getEventsForDay,
          onDaySelected: (selectedDay, focusedDay) {
            setState(() {
              _selectedDay = selectedDay;
              _focusedDay = focusedDay;
            });
          },
          onFormatChanged: (format) {
            setState(() {
              _calendarFormat = format;
            });
          },
          calendarStyle: CalendarStyle(
            todayDecoration: BoxDecoration(
              color: AppTheme.primaryTeal.withValues(alpha: 0.3),
              shape: BoxShape.circle,
            ),
            selectedDecoration: const BoxDecoration(
              color: AppTheme.primaryTeal,
              shape: BoxShape.circle,
            ),
            markerDecoration: const BoxDecoration(
              color: AppTheme.accentGold,
              shape: BoxShape.circle,
            ),
          ),
          headerStyle: HeaderStyle(
            formatButtonVisible: true,
            titleCentered: true,
            formatButtonDecoration: BoxDecoration(
              color: AppTheme.primaryTeal,
              borderRadius: BorderRadius.circular(12),
            ),
            formatButtonTextStyle:
                const TextStyle(color: Colors.white, fontSize: 12),
          ),
        ),
      ),
    );
  }

  Widget _buildFilterBar() {
    final filters = ['All', 'Savings', 'Loan'];
    return Container(
      height: 48,
      margin: const EdgeInsets.symmetric(vertical: 8),
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 12),
        itemCount: filters.length,
        itemBuilder: (context, index) {
          final filter = filters[index];
          final isSelected = _selectedFilter == filter;
          return Padding(
            padding: const EdgeInsets.only(right: 8.0),
            child: ChoiceChip(
              label: Text(
                filter,
                style: GoogleFonts.poppins(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: isSelected ? Colors.white : AppTheme.textDark,
                ),
              ),
              selected: isSelected,
              selectedColor: AppTheme.primaryTeal,
              backgroundColor: Colors.white,
              onSelected: (val) {
                if (val) {
                  setState(() => _selectedFilter = filter);
                }
              },
            ),
          );
        },
      ),
    );
  }

  Widget _buildPaymentsList() {
    final list = _filteredPayments;
    if (list.isEmpty) {
      return Center(
        child: Text(
          'No transactions found.',
          style: GoogleFonts.poppins(color: AppTheme.textMuted),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      itemCount: list.length,
      itemBuilder: (context, index) {
        final p = list[index];
        final pDate = p['date'] as DateTime;
        final isSavings = p['type'] == 'Savings';
        return Card(
          margin: const EdgeInsets.only(bottom: 8),
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          child: Padding(
            padding: const EdgeInsets.all(12.0),
            child: Row(
              children: [
                Icon(
                  isSavings ? AppIcons.savings : AppIcons.payments,
                  color: isSavings ? AppTheme.primaryTeal : AppTheme.accentGold,
                  size: 28,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        p['title'] as String,
                        style: GoogleFonts.poppins(
                            fontWeight: FontWeight.bold,
                            color: AppTheme.textDark,
                            fontSize: 13),
                      ),
                      Text(
                        'Method: ${p['method']} • ID: ${p['id']}',
                        style: GoogleFonts.poppins(
                            fontSize: 11, color: AppTheme.textMuted),
                      ),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      p['amount'] as String,
                      style: GoogleFonts.poppins(
                          fontWeight: FontWeight.bold,
                          color: AppTheme.textDark),
                    ),
                    Text(
                      '${pDate.day}/${pDate.month}/${pDate.year}',
                      style: GoogleFonts.poppins(
                          fontSize: 11, color: AppTheme.textMuted),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
