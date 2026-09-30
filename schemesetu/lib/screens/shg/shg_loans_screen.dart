import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:drift/drift.dart' as drift;
import '../../data/local/app_database.dart';
import '../../providers/shg_providers.dart';
import '../../services/encryption_service.dart';
import '../../utils/theme.dart';
import '../../widgets/translated_text.dart';

class ShgLoansScreen extends ConsumerStatefulWidget {
  final int membershipId;
  const ShgLoansScreen({super.key, required this.membershipId});

  @override
  ConsumerState<ShgLoansScreen> createState() => _ShgLoansScreenState();
}

class _ShgLoansScreenState extends ConsumerState<ShgLoansScreen> {
  final _encryption = EncryptionService();

  double _parseDecrypted(String value) {
    try {
      final decrypted = _encryption.decrypt(value);
      return double.tryParse(decrypted) ?? 0.0;
    } catch (_) {
      return double.tryParse(value) ?? 0.0;
    }
  }

  void _showRepaymentSheet(SHGLoan loan, double emiAmount) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (sheetCtx) => Container(
        padding: EdgeInsets.only(
          top: 24,
          left: 20,
          right: 20,
          bottom: MediaQuery.of(sheetCtx).viewInsets.bottom + 24,
        ),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1E293B) : Colors.white,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey.withValues(alpha: 0.3),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'Pay Loan EMI',
              style: GoogleFonts.outfit(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: isDark ? Colors.white : AppTheme.textDark,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Loan #${loan.id} • ${loan.purpose ?? 'Micro Loan'}',
              style: GoogleFonts.outfit(color: Colors.grey, fontSize: 13),
            ),
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.primaryTeal.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                    color: AppTheme.primaryTeal.withValues(alpha: 0.2)),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Monthly EMI Amount',
                          style: GoogleFonts.outfit(color: Colors.grey[700])),
                      Text('₹${emiAmount.toStringAsFixed(2)}',
                          style: GoogleFonts.outfit(
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                              color: AppTheme.primaryTeal)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Facilitation Fee (0.5%)',
                          style: GoogleFonts.outfit(color: Colors.grey[700])),
                      Text('₹${(emiAmount * 0.005).toStringAsFixed(2)}',
                          style: GoogleFonts.outfit(
                              fontWeight: FontWeight.w600, fontSize: 14)),
                    ],
                  ),
                  const Divider(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Total Payable',
                          style: GoogleFonts.outfit(
                              fontWeight: FontWeight.bold, fontSize: 15)),
                      Text('₹${(emiAmount * 1.005).toStringAsFixed(2)}',
                          style: GoogleFonts.outfit(
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                              color: Colors.green[700])),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () async {
                try {
                  final dao = ref.read(shgDaoProvider);

                  // 1. Insert repayment with NOT NULL interestPaid
                  await dao.insertRepayment(
                    SHGLoanRepaymentsCompanion(
                      loanId: drift.Value(loan.id),
                      principalPaid: drift.Value(emiAmount.toStringAsFixed(2)),
                      interestPaid: const drift.Value('0.0'),
                    ),
                  );

                  // 2. Fetch membership to locate group id for cashbook
                  final membership = await (dao.db.select(dao.db.sHGMemberships)
                        ..where((t) => t.id.equals(loan.membershipId)))
                      .getSingleOrNull();
                  final groupId = membership?.groupId ?? 1;

                  // 3. Double-entry CashBook log
                  await dao.insertCashBookEntry(
                    SHGCashBooksCompanion(
                      groupId: drift.Value(groupId),
                      description:
                          drift.Value('EMI Repayment for Loan #${loan.id}'),
                      amount: drift.Value(emiAmount),
                      transactionType: const drift.Value('Income'),
                      category: const drift.Value('Loan Repayment'),
                    ),
                  );

                  // 4. Facilitation fee entry
                  await dao.insertCashBookEntry(
                    SHGCashBooksCompanion(
                      groupId: drift.Value(groupId),
                      description: drift.Value(
                          '0.5% Facilitation fee for Loan #${loan.id}'),
                      amount: drift.Value(emiAmount * 0.005),
                      transactionType: const drift.Value('Income'),
                      category: const drift.Value('Facilitation Fee'),
                    ),
                  );

                  ref.invalidate(shgLoansProvider(widget.membershipId));

                  if (sheetCtx.mounted) {
                    Navigator.pop(sheetCtx);
                  }
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content:
                            TranslatedText('EMI Payment recorded successfully!'),
                        backgroundColor: Colors.green,
                      ),
                    );
                  }
                } catch (e) {
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Payment failed: $e'),
                        backgroundColor: Colors.red,
                      ),
                    );
                  }
                }
              },
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                backgroundColor: AppTheme.primaryTeal,
              ),
              child: Text(
                'Confirm Payment',
                style: GoogleFonts.outfit(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final loansAsync = ref.watch(shgLoansProvider(widget.membershipId));
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Loans',
          style: GoogleFonts.outfit(fontWeight: FontWeight.bold),
        ),
        elevation: 0,
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(shgLoansProvider(widget.membershipId));
        },
        child: loansAsync.when(
          data: (loans) {
            if (loans.isEmpty) {
              return ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                children: [
                  SizedBox(
                    height: MediaQuery.of(context).size.height * 0.65,
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(20),
                            decoration: BoxDecoration(
                              color: AppTheme.primaryTeal.withValues(alpha: 0.1),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.account_balance_wallet_outlined,
                              size: 48,
                              color: AppTheme.primaryTeal,
                            ),
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'No active loans',
                            style: GoogleFonts.outfit(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: isDark ? Colors.white : AppTheme.textDark,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'No loan accounts found for this member.',
                            style: GoogleFonts.outfit(
                              fontSize: 14,
                              color: Colors.grey,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              );
            }

            return ListView.builder(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(16),
              itemCount: loans.length,
              itemBuilder: (context, index) {
                final loan = loans[index];
                final principal = _parseDecrypted(loan.principalAmount);
                final rate = _parseDecrypted(loan.interestRate);
                final duration = loan.durationMonths > 0 ? loan.durationMonths : 1;
                final totalInterest = principal * (rate / 100) * duration;
                final emi = (principal + totalInterest) / duration;
                final isActive = loan.status.toLowerCase() == 'active';

                return Card(
                  margin: const EdgeInsets.only(bottom: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                    side: BorderSide(
                      color: Colors.grey.withValues(alpha: 0.2),
                    ),
                  ),
                  elevation: 0,
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              loan.purpose ?? 'Micro Business Loan',
                              style: GoogleFonts.outfit(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: isActive
                                    ? Colors.green.withValues(alpha: 0.1)
                                    : Colors.grey.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: isActive
                                      ? Colors.green
                                      : Colors.grey,
                                ),
                              ),
                              child: Text(
                                loan.status.toUpperCase(),
                                style: GoogleFonts.outfit(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color:
                                      isActive ? Colors.green : Colors.grey,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Expanded(
                              child: _infoTile(
                                'Principal',
                                '₹${principal.toStringAsFixed(0)}',
                              ),
                            ),
                            Expanded(
                              child: _infoTile(
                                'Interest Rate',
                                '${rate.toStringAsFixed(1)}% / mo',
                              ),
                            ),
                            Expanded(
                              child: _infoTile(
                                'Duration',
                                '$duration Mo',
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Expanded(
                              child: _infoTile(
                                'Monthly EMI',
                                '₹${emi.toStringAsFixed(0)}',
                                isHighlight: true,
                              ),
                            ),
                            Expanded(
                              child: _infoTile(
                                'Disbursed',
                                DateFormat('dd MMM yyyy').format(loan.loanDate),
                              ),
                            ),
                          ],
                        ),
                        if (isActive) ...[
                          const SizedBox(height: 16),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton.icon(
                              onPressed: () =>
                                  _showRepaymentSheet(loan, emi),
                              icon: const Icon(Icons.payment_rounded, size: 18),
                              label: const Text('Pay EMI'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppTheme.primaryTeal,
                                foregroundColor: Colors.white,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                );
              },
            );
          },
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, _) => Center(
            child: Text('Error loading loans: $e'),
          ),
        ),
      ),
    );
  }

  Widget _infoTile(String label, String value, {bool isHighlight = false}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: GoogleFonts.outfit(
            fontSize: 11,
            color: Colors.grey,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: GoogleFonts.outfit(
            fontSize: 13,
            fontWeight: isHighlight ? FontWeight.bold : FontWeight.w600,
            color: isHighlight ? AppTheme.primaryTeal : null,
          ),
        ),
      ],
    );
  }
}
