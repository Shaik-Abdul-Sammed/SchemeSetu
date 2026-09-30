import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:drift/drift.dart' as drift;
import '../../config/theme.dart';
import '../../config/app_icons.dart';
import '../../providers/shg_providers.dart';
import '../../data/local/app_database.dart';

class LoanStrategyScreen extends ConsumerStatefulWidget {
  const LoanStrategyScreen({super.key});

  @override
  ConsumerState<LoanStrategyScreen> createState() => _LoanStrategyScreenState();
}

class _LoanStrategyScreenState extends ConsumerState<LoanStrategyScreen> {
  // Inputs
  double _loanAmount = 10000.0;
  double _interestRate = 12.0; // annual percentage rate (1% monthly)
  int _durationMonths = 12;
  bool _isDiminishing = true;

  // Outputs
  double _emi = 0.0;
  double _totalInterest = 0.0;
  double _totalRepayable = 0.0;
  String _affordability = 'Good';
  Color _affordabilityColor = Colors.green;

  @override
  void initState() {
    super.initState();
    _calculateLoan();
  }

  void _calculateLoan() {
    final double monthlyRate = _interestRate / 12 / 100;

    if (_isDiminishing) {
      if (monthlyRate == 0) {
        _emi = _loanAmount / _durationMonths;
        _totalRepayable = _loanAmount;
        _totalInterest = 0;
      } else {
        _emi = _loanAmount *
            (monthlyRate * pow(1 + monthlyRate, _durationMonths)) /
            (pow(1 + monthlyRate, _durationMonths) - 1);
        _totalRepayable = _emi * _durationMonths;
        _totalInterest = _totalRepayable - _loanAmount;
      }
    } else {
      // Simple Interest
      _totalInterest = _loanAmount * monthlyRate * _durationMonths;
      _totalRepayable = _loanAmount + _totalInterest;
      _emi = _totalRepayable / _durationMonths;
    }

    // Determine Affordability Score based on EMI vs assumed monthly savings rate
    if (_emi < 1000) {
      _affordability = 'Safe (అందుబాటులో ఉంది)';
      _affordabilityColor = Colors.green;
    } else if (_emi >= 1000 && _emi <= 2500) {
      _affordability = 'Moderate (మధ్యస్థంగా ఉంది)';
      _affordabilityColor = AppTheme.accentGold;
    } else {
      _affordability = 'High Risk (భారం ఎక్కువ)';
      _affordabilityColor = Colors.red;
    }

    setState(() {});
  }

  Future<void> _submitLoanRequest() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final memberId = prefs.getInt('member_logged_in_id') ?? 0;
      final groupId = prefs.getInt('member_logged_in_group_id') ?? 0;

      if (!mounted) return;
      if (memberId == 0) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content: Text(
                  'Please log in as a member first (సభ్యురాలు మొదట లాగిన్ అవ్వాలి)'),
              backgroundColor: Colors.red),
        );
        return;
      }

      final dao = ref.read(shgDaoProvider);

      // Get membership ID
      final memQuery = dao.db.select(dao.db.sHGMemberships)
        ..where((t) => t.memberId.equals(memberId) & t.groupId.equals(groupId));
      final memberships = await memQuery.get();

      if (!mounted) return;
      if (memberships.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content: Text('Membership record not found!'),
              backgroundColor: Colors.red),
        );
        return;
      }

      final membershipId = memberships.first.id;

      // Submit pending loan request
      await dao.insertLoan(
        SHGLoansCompanion(
          membershipId: drift.Value(membershipId),
          principalAmount: drift.Value(_loanAmount.toStringAsFixed(0)),
          interestRate: drift.Value((_interestRate / 12)
              .toStringAsFixed(1)), // monthly interest percentage
          durationMonths: drift.Value(_durationMonths),
          purpose: drift.Value('Micro Business Funding'),
          status: drift.Value('Pending'),
          loanDate: drift.Value(DateTime.now()),
        ),
      );

      if (mounted) {
        showDialog(
          context: context,
          builder: (dialogCtx) => AlertDialog(
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.check_circle_rounded,
                    color: Colors.green, size: 60),
                const SizedBox(height: 16),
                Text(
                  'Application Submitted!',
                  style: GoogleFonts.poppins(
                      fontWeight: FontWeight.bold, fontSize: 16),
                ),
                const SizedBox(height: 8),
                Text(
                  'Your loan application of ₹${_loanAmount.toStringAsFixed(0)} was submitted to your Group Leader for review.',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.poppins(
                      fontSize: 12, color: AppTheme.textMuted),
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: () {
                    Navigator.pop(dialogCtx);
                    Navigator.pop(context); // return to dashboard
                  },
                  style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primaryTeal),
                  child: const Text('OK'),
                ),
              ],
            ),
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            content: Text('Failed to submit request: $e'),
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
            'Loan Strategy & Calculator',
            style: GoogleFonts.poppins(fontWeight: FontWeight.bold),
          ),
        ),
        body: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildCalculatorCard(),
                const SizedBox(height: 20),
                _buildResultsCard(),
                const SizedBox(height: 16),
                _buildSubmitRequestButton(),
                const SizedBox(height: 24),
                _buildTipsAndGuides(),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCalculatorCard() {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      elevation: 3,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'What-If Calculator',
              style: GoogleFonts.poppins(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.primaryTeal),
            ),
            const SizedBox(height: 16),

            // Amount Slider
            Text(
              'Desired Loan Amount: ₹${_loanAmount.toStringAsFixed(0)}',
              style: GoogleFonts.poppins(
                  fontWeight: FontWeight.w500, color: AppTheme.textDark),
            ),
            Slider(
              value: _loanAmount,
              min: 2000.0,
              max: 50000.0,
              divisions: 24,
              activeColor: AppTheme.primaryTeal,
              inactiveColor: AppTheme.primaryTeal.withValues(alpha: 0.1),
              onChanged: (val) {
                setState(() => _loanAmount = val);
                _calculateLoan();
              },
            ),

            // Interest Slider
            Text(
              'Interest Rate (Annual): ${_interestRate.toStringAsFixed(1)}% (${(_interestRate / 12).toStringAsFixed(1)}% per month)',
              style: GoogleFonts.poppins(
                  fontWeight: FontWeight.w500, color: AppTheme.textDark),
            ),
            Slider(
              value: _interestRate,
              min: 6.0,
              max: 24.0,
              divisions: 18,
              activeColor: AppTheme.primaryTeal,
              inactiveColor: AppTheme.primaryTeal.withValues(alpha: 0.1),
              onChanged: (val) {
                setState(() => _interestRate = val);
                _calculateLoan();
              },
            ),

            // Duration Slider
            Text(
              'Repayment Duration: $_durationMonths Months',
              style: GoogleFonts.poppins(
                  fontWeight: FontWeight.w500, color: AppTheme.textDark),
            ),
            Slider(
              value: _durationMonths.toDouble(),
              min: 3.0,
              max: 36.0,
              divisions: 11,
              activeColor: AppTheme.primaryTeal,
              inactiveColor: AppTheme.primaryTeal.withValues(alpha: 0.1),
              onChanged: (val) {
                setState(() => _durationMonths = val.round());
                _calculateLoan();
              },
            ),
            const SizedBox(height: 16),

            // Interest Type Switch
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Reducing Balance EMI',
                  style: GoogleFonts.poppins(
                      fontWeight: FontWeight.w500, color: AppTheme.textDark),
                ),
                Switch(
                  value: _isDiminishing,
                  activeThumbColor: AppTheme.primaryTeal,
                  onChanged: (val) {
                    setState(() => _isDiminishing = val);
                    _calculateLoan();
                  },
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildResultsCard() {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Estimated Monthly EMI',
                  style: GoogleFonts.poppins(
                      fontWeight: FontWeight.w500, color: AppTheme.textDark),
                ),
                Text(
                  '₹${_emi.toStringAsFixed(2)}',
                  style: GoogleFonts.poppins(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.primaryTeal),
                ),
              ],
            ),
            const Divider(color: Colors.black12, height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Total Interest Payable',
                  style: GoogleFonts.poppins(color: AppTheme.textMuted),
                ),
                Text(
                  '₹${_totalInterest.toStringAsFixed(2)}',
                  style: GoogleFonts.poppins(
                      fontWeight: FontWeight.w600, color: AppTheme.textDark),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Total Repayable',
                  style: GoogleFonts.poppins(color: AppTheme.textMuted),
                ),
                Text(
                  '₹${_totalRepayable.toStringAsFixed(2)}',
                  style: GoogleFonts.poppins(
                      fontWeight: FontWeight.bold, color: AppTheme.textDark),
                ),
              ],
            ),
            const Divider(color: Colors.black12, height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Affordability Score',
                  style: GoogleFonts.poppins(
                      fontWeight: FontWeight.w500, color: AppTheme.textDark),
                ),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: _affordabilityColor.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    _affordability,
                    style: GoogleFonts.poppins(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: _affordabilityColor),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSubmitRequestButton() {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton.icon(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppTheme.primaryTeal,
          padding: const EdgeInsets.symmetric(vertical: 14),
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
        onPressed: _submitLoanRequest,
        icon: const Icon(Icons.send_rounded),
        label: Text(
          'Submit Loan Request (రుణ దరఖాస్తు)',
          style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 15),
        ),
      ),
    );
  }

  Widget _buildTipsAndGuides() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Loan Tips & Guides (సలహాలు & సూచనలు)',
          style: GoogleFonts.poppins(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: AppTheme.primaryTeal),
        ),
        const SizedBox(height: 12),
        _buildGuideTile(
          icon: AppIcons.info,
          color: Colors.blue,
          title: 'Reducing vs Simple Interest (వడ్డీ లెక్కించే విధానం)',
          subtitle:
              'Reducing balance interest is calculated on the remaining loan amount, making it cheaper over time than simple flat interest.',
        ),
        const SizedBox(height: 8),
        _buildGuideTile(
          icon: AppIcons.check,
          color: Colors.green,
          title: 'Early Repayment Benefits (ముందస్తు చెల్లింపు ప్రయోజనం)',
          subtitle:
              'Repaying your loan early reduces the overall interest burden on you and helps improve your credit standing.',
        ),
        const SizedBox(height: 8),
        _buildGuideTile(
          icon: AppIcons.alert,
          color: Colors.amber,
          title: 'On-Time Credit Scores (క్రెడిట్ రేటింగ్ విలువ)',
          subtitle:
              'Each on-time payment ensures high trust scores within the DWCRA network, opening avenues for larger state-subsidised loans.',
        ),
      ],
    );
  }

  Widget _buildGuideTile({
    required IconData icon,
    required Color color,
    required String title,
    required String subtitle,
  }) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      elevation: 0,
      color: Colors.grey[50],
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: color, size: 24),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: GoogleFonts.poppins(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.textDark),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: GoogleFonts.poppins(
                        fontSize: 11, color: AppTheme.textMuted),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
