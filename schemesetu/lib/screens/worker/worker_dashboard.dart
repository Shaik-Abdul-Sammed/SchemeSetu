import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:drift/drift.dart' as drift;
import '../../config/theme.dart';
import '../../providers/shg_providers.dart';
import '../../data/local/app_database.dart';
import 'loan_strategy.dart';
import 'payment_history.dart';

class WorkerDashboardScreen extends ConsumerStatefulWidget {
  const WorkerDashboardScreen({super.key});

  @override
  ConsumerState<WorkerDashboardScreen> createState() =>
      _WorkerDashboardScreenState();
}

class _WorkerDashboardScreenState extends ConsumerState<WorkerDashboardScreen> {
  bool _isLoading = true;
  Member? _currentMember;
  SHGGroup? _currentGroup;
  List<SHGLoan> _activeLoans = [];
  String _leaderName = 'Lakshmi Devi (President)';
  String _leaderPhone = '9876543210';
  int _memberId = 0;
  int _membershipId = 0;

  @override
  void initState() {
    super.initState();
    _loadMemberData();
  }

  Future<void> _loadMemberData() async {
    setState(() => _isLoading = true);
    try {
      final prefs = await SharedPreferences.getInstance();
      _memberId = prefs.getInt('member_logged_in_id') ?? 0;
      final groupId = prefs.getInt('member_logged_in_group_id') ?? 0;

      final dao = ref.read(shgDaoProvider);

      // Query member details
      final memberQuery = dao.db.select(dao.db.members)
        ..where((t) => t.id.equals(_memberId));
      final members = await memberQuery.get();
      if (members.isNotEmpty) {
        _currentMember = members.first;
      }

      // Query group details
      if (groupId > 0) {
        _currentGroup = await dao.getGroupById(groupId);

        // Fetch membership ID
        final memQuery = dao.db.select(dao.db.sHGMemberships)
          ..where(
              (t) => t.memberId.equals(_memberId) & t.groupId.equals(groupId));
        final memberships = await memQuery.get();
        if (memberships.isNotEmpty) {
          _membershipId = memberships.first.id;
        }

        // Query active loans for this member
        final loans = await dao.getLoansByMembershipId(_membershipId);
        _activeLoans = loans.where((l) => l.status == 'Active').toList();

        // Query group leader details (use first member of group if no designated President)
        final groupMemberships = await dao.getMembersByGroupId(groupId);
        if (groupMemberships.isNotEmpty) {
          final firstMemId = groupMemberships.first.memberId;
          final leaderQuery = dao.db.select(dao.db.members)
            ..where((t) => t.id.equals(firstMemId));
          final leaders = await leaderQuery.get();
          if (leaders.isNotEmpty && leaders.first.id != _memberId) {
            _leaderName = '${leaders.first.name} (Group Leader)';
            _leaderPhone = leaders.first.phone;
          }
        }
      }

      if (mounted) {
        setState(() => _isLoading = false);
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text('Failed to sync details: $e'),
              backgroundColor: Colors.red),
        );
      }
    }
  }

  Future<void> _makeCall(String phone) async {
    final Uri url = Uri(scheme: 'tel', path: phone);
    if (await canLaunchUrl(url)) {
      await launchUrl(url);
    } else {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('Could not place call (కాల్ చేయడం సాధ్యం కాలేదు)')),
      );
    }
  }

  Future<void> _openWhatsApp(String phone) async {
    final Uri url = Uri.parse(
        'https://wa.me/91$phone?text=Hello%20Leader%20(నమస్తే%20లీడర్%20గారు)');
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    } else {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content:
                Text('WhatsApp not installed (వాట్సాప్ ఇన్స్టాల్ కాలేదు)')),
      );
    }
  }

  Future<void> _logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('member_is_logged_in');
    await prefs.remove('member_logged_in_phone');
    await prefs.remove('member_logged_in_id');
    await prefs.remove('member_logged_in_group_id');

    if (mounted) {
      Navigator.pop(context);
    }
  }

  Future<void> _payEMI(SHGLoan loan) async {
    const emiAmount = 500.0;

    // Show Mock UPI Bottom Sheet (PhonePe/GPay style checkout)
    await showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (sheetCtx) {
        return Container(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'UPI Repayment Checkout',
                    style: GoogleFonts.poppins(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.primaryTeal),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded),
                    onPressed: () => Navigator.pop(sheetCtx),
                  ),
                ],
              ),
              const Divider(),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('EMI Repayment Amount',
                      style: GoogleFonts.poppins(color: AppTheme.textMuted)),
                  Text('₹$emiAmount',
                      style: GoogleFonts.poppins(
                          fontWeight: FontWeight.bold, fontSize: 18)),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Facilitation Fee (0.5%)',
                      style: GoogleFonts.poppins(color: AppTheme.textMuted)),
                  Text('₹${(emiAmount * 0.005).toStringAsFixed(2)}',
                      style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
                ],
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                    color: Colors.teal[50],
                    borderRadius: BorderRadius.circular(12)),
                child: Row(
                  children: [
                    const Icon(Icons.security_rounded,
                        color: AppTheme.primaryTeal),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Secure Bank to Bank Transaction via BHIM UPI API',
                        style: GoogleFonts.poppins(
                            fontSize: 11,
                            color: AppTheme.primaryTeal,
                            fontWeight: FontWeight.w500),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () async {
                  try {
                    final dao = ref.read(shgDaoProvider);

                    // Insert loan repayment
                    await dao.insertRepayment(
                      SHGLoanRepaymentsCompanion(
                        loanId: drift.Value(loan.id),
                        principalPaid: drift.Value(emiAmount.toString()),
                        interestPaid: const drift.Value('0.0'),
                      ),
                    );

                    // Insert double-entry CashBook log
                    await dao.insertCashBookEntry(
                      SHGCashBooksCompanion(
                        groupId: drift.Value(_currentGroup?.id ?? 1),
                        description: drift.Value(
                            'EMI Repayment from ${_currentMember?.name ?? 'Member'}'),
                        amount: drift.Value(emiAmount),
                        transactionType: drift.Value('Income'),
                        category: drift.Value('Loan Repayment'),
                      ),
                    );

                    // Log facilitation fee revenue log
                    await dao.insertCashBookEntry(
                      SHGCashBooksCompanion(
                        groupId: drift.Value(_currentGroup?.id ?? 1),
                        description:
                            drift.Value('0.5% Repayment facilitation fee'),
                        amount: drift.Value(emiAmount * 0.005),
                        transactionType: drift.Value('Income'),
                        category: drift.Value('Facilitation Fee'),
                      ),
                    );

                    if (sheetCtx.mounted) {
                      Navigator.pop(sheetCtx);
                      _showSuccessDialog();
                      _loadMemberData();
                    }
                  } catch (e) {
                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Repayment failed: $e')),
                      );
                    }
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryTeal,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
                child: Text('Pay Now with UPI',
                    style: GoogleFonts.poppins(fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        );
      },
    );
  }

  void _showSuccessDialog() {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.check_circle_rounded,
                      color: Colors.green, size: 70)
                  .animate()
                  .scale(duration: 400.ms, curve: Curves.bounceOut),
              const SizedBox(height: 16),
              Text(
                'Payment Successful!',
                style: GoogleFonts.poppins(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.primaryTeal),
              ),
              const SizedBox(height: 8),
              Text(
                'EMI Repayment received and ledger updated. (ఈఎంఐ చెల్లింపు విజయవంతమైంది)',
                textAlign: TextAlign.center,
                style: GoogleFonts.poppins(
                    fontSize: 12, color: AppTheme.textMuted),
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: () => Navigator.pop(context),
                style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryTeal),
                child: const Text('OK'),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Theme(
      data: AppTheme.lightTheme,
      child: Scaffold(
        appBar: AppBar(
          title: Text(
            'My Passbook & Dashboard',
            style: GoogleFonts.poppins(fontWeight: FontWeight.bold),
          ),
          actions: [
            IconButton(
              icon: const Icon(Icons.logout_rounded),
              onPressed: _logout,
              tooltip: 'Logout Session',
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
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: List.generate(
                          4,
                          (_) => Container(
                              height: 100,
                              margin: const EdgeInsets.only(bottom: 16),
                              color: Colors.white)),
                    ),
                  ),
                )
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildHeaderCard(),
                      const SizedBox(height: 20),
                      _buildLeaderContactCard(),
                      const SizedBox(height: 24),
                      _buildSectionHeader('Savings Goal Tracker'),
                      const SizedBox(height: 12),
                      _buildSavingsGoalCard(),
                      const SizedBox(height: 24),
                      _buildSectionHeader('Active Loan Repayments'),
                      const SizedBox(height: 12),
                      _buildLoansSection(),
                    ],
                  ),
                ),
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Text(
      title,
      style: GoogleFonts.poppins(
        fontSize: 16,
        fontWeight: FontWeight.bold,
        color: AppTheme.primaryTeal,
      ),
    );
  }

  Widget _buildHeaderCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppTheme.primaryTeal,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: AppTheme.primaryTeal.withValues(alpha: 0.3),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                _currentMember?.name ?? 'Member Name',
                style: GoogleFonts.poppins(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              Text(
                _currentGroup?.name ?? 'No Group Registered',
                style: GoogleFonts.poppins(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: AppTheme.accentGold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Savings Balance',
                    style: GoogleFonts.poppins(
                        fontSize: 12, color: Colors.white70),
                  ),
                  Text(
                    '₹15,400.00',
                    style: GoogleFonts.poppins(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
              Container(height: 30, width: 1, color: Colors.white30),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Active Loans Count',
                    style: GoogleFonts.poppins(
                        fontSize: 12, color: Colors.white70),
                  ),
                  Text(
                    '${_activeLoans.length}',
                    style: GoogleFonts.poppins(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    )
        .animate()
        .fadeIn(duration: 350.ms)
        .scale(begin: const Offset(0.95, 0.95), end: const Offset(1, 1));
  }

  Widget _buildLeaderContactCard() {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      color: Colors.teal[50],
      elevation: 0,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Row(
          children: [
            const CircleAvatar(
              backgroundColor: AppTheme.primaryTeal,
              child: Icon(Icons.person_pin_rounded, color: Colors.white),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _leaderName,
                    style: GoogleFonts.poppins(
                        fontWeight: FontWeight.bold, color: AppTheme.textDark),
                  ),
                  Text(
                    'Need Help? Contact leader (సహాయం కోసం లీడర్ సంప్రదించండి)',
                    style: GoogleFonts.poppins(
                        fontSize: 11, color: AppTheme.textMuted),
                  ),
                ],
              ),
            ),
            IconButton(
              icon: const Icon(Icons.phone_rounded, color: Colors.indigo),
              onPressed: () => _makeCall(_leaderPhone),
            ),
            IconButton(
              icon: const Icon(Icons.chat_bubble_rounded, color: Colors.green),
              onPressed: () => _openWhatsApp(_leaderPhone),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSavingsGoalCard() {
    const progress = 15400.0 / 20000.0;

    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const PaymentHistoryScreen()),
        );
      },
      child: Card(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Goal: ₹20,000',
                      style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
                  Text('${(progress * 100).toStringAsFixed(0)}% Done',
                      style: GoogleFonts.poppins(
                          color: AppTheme.primaryTeal,
                          fontWeight: FontWeight.bold)),
                ],
              ),
              const SizedBox(height: 12),
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: LinearProgressIndicator(
                  value: progress,
                  minHeight: 12,
                  backgroundColor: AppTheme.primaryTeal.withValues(alpha: 0.1),
                  valueColor:
                      const AlwaysStoppedAnimation<Color>(AppTheme.primaryTeal),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Tapping here will view all savings transactions ledgers.',
                style: GoogleFonts.poppins(
                    fontSize: 11, color: AppTheme.textMuted),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLoansSection() {
    if (_activeLoans.isEmpty) {
      return Card(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            children: [
              Text(
                'No Active Loans. Need dynamic funding?',
                textAlign: TextAlign.center,
                style: GoogleFonts.poppins(color: AppTheme.textMuted),
              ),
              const SizedBox(height: 12),
              ElevatedButton.icon(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (_) => const LoanStrategyScreen()),
                  );
                },
                icon: const Icon(Icons.calculate_rounded),
                label: const Text('Calculate & Request Loan'),
                style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryTeal),
              ),
            ],
          ),
        ),
      );
    }

    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: _activeLoans.length,
      itemBuilder: (context, index) {
        final loan = _activeLoans[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Loan Principal: ₹${loan.principalAmount}',
                        style: GoogleFonts.poppins(
                            fontWeight: FontWeight.bold,
                            color: AppTheme.textDark),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Rate: ${loan.interestRate}% p.m. • Duration: ${loan.durationMonths}m',
                        style: GoogleFonts.poppins(
                            fontSize: 12, color: AppTheme.textMuted),
                      ),
                    ],
                  ),
                ),
                ElevatedButton(
                  onPressed: () => _payEMI(loan),
                  style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primaryTeal),
                  child: const Text('Pay EMI'),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
