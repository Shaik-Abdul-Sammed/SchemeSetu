import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:drift/drift.dart' as drift;
import 'package:chit_fund_app/data/local/app_database.dart';

void main() {
  group('SangaSetu End-to-End Loan Integration Tests', () {
    late AppDatabase db;
    late int testMemberId;
    late int testGroupId;
    late int testMembershipId;

    setUp(() async {
      SharedPreferences.setMockInitialValues({});
      db = AppDatabase.inMemory();

      // Step 1: Leader creates/registers the group
      testGroupId = await db.sHGDao.insertGroup(
        const SHGGroupsCompanion(
          name: drift.Value('Pragati DWCRA Group'),
        ),
      );

      // Step 2: Leader registers a member with a PIN
      testMemberId = await db.sHGDao.db.into(db.sHGDao.db.members).insert(
            const MembersCompanion(
              name: drift.Value('Rajamma'),
              phone: drift.Value('9010203040'),
              pin: drift.Value('1122'),
            ),
          );

      // Link member to group
      testMembershipId = await db.sHGDao.addMemberToGroup(
        SHGMembershipsCompanion(
          memberId: drift.Value(testMemberId),
          groupId: drift.Value(testGroupId),
        ),
      );
    });

    tearDown(() async {
      await db.close();
    });

    test('E2E Loan Application -> Approval -> Repayment Lifecycle', () async {
      final dao = db.sHGDao;

      // 1. Worker Submits a Loan Request from calculator
      final loanId = await dao.insertLoan(
        SHGLoansCompanion(
          membershipId: drift.Value(testMembershipId),
          principalAmount: const drift.Value('10000.0'),
          interestRate: const drift.Value('1.0'), // 1% per month
          durationMonths: const drift.Value(12),
          purpose: const drift.Value('Sewing Machine Purchase'),
          status: const drift.Value('Pending'),
          loanDate: drift.Value(DateTime(2026, 8, 5)),
        ),
      );

      // Verify pending status in DB
      var loan = await dao.db.select(dao.db.sHGLoans).getSingle();
      expect(loan.id, loanId);
      expect(loan.status, 'Pending');

      // 2. Leader opens Manager Dashboard, reviews and Approves the loan request
      await dao.updateLoanStatus(loan.id, 'Active');

      // Log disbursement expense and processing fee
      const principal = 10000.0;
      const processingFee = principal * 0.02; // 2% fee = 200

      // Log Expense
      await dao.insertCashBookEntry(
        SHGCashBooksCompanion(
          groupId: drift.Value(testGroupId),
          description: const drift.Value('Loan Disbursement to Rajamma'),
          amount: const drift.Value(-principal),
          transactionType: const drift.Value('Expense'),
          category: const drift.Value('Loan Disbursement'),
        ),
      );

      // Log Income (Processing Fee collected)
      await dao.insertCashBookEntry(
        SHGCashBooksCompanion(
          groupId: drift.Value(testGroupId),
          description: const drift.Value('2% Loan processing fee'),
          amount: const drift.Value(processingFee),
          transactionType: const drift.Value('Income'),
          category: const drift.Value('Processing Fee'),
        ),
      );

      // Verify CashBook double-entry values
      final cashbook = await dao.getCashBookEntries(testGroupId);
      expect(cashbook.length, 2);
      expect(cashbook[0].amount, -10000.0);
      expect(cashbook[0].transactionType, 'Expense');
      expect(cashbook[1].amount, 200.0);
      expect(cashbook[1].transactionType, 'Income');

      // Verify active status of the loan
      loan = await dao.db.select(dao.db.sHGLoans).getSingle();
      expect(loan.status, 'Active');

      // 3. Worker repays 1st EMI instalment (₹500) from Worker Dashboard via mock UPI
      const emiAmount = 500.0;
      const facilitationFee = emiAmount * 0.005; // 0.5% fee = 2.50

      // Insert Repayment
      await dao.insertRepayment(
        SHGLoanRepaymentsCompanion(
          loanId: drift.Value(loan.id),
          principalPaid: const drift.Value('500.0'),
          interestPaid: const drift.Value('0.0'),
        ),
      );

      // Log EMI Income
      await dao.insertCashBookEntry(
        SHGCashBooksCompanion(
          groupId: drift.Value(testGroupId),
          description: const drift.Value('EMI Repayment from Rajamma'),
          amount: const drift.Value(emiAmount),
          transactionType: const drift.Value('Income'),
          category: const drift.Value('Loan Repayment'),
        ),
      );

      // Log Facilitation Fee Income
      await dao.insertCashBookEntry(
        SHGCashBooksCompanion(
          groupId: drift.Value(testGroupId),
          description: const drift.Value('0.5% Repayment facilitation fee'),
          amount: const drift.Value(facilitationFee),
          transactionType: const drift.Value('Income'),
          category: const drift.Value('Facilitation Fee'),
        ),
      );

      // Verify Repayments in DB
      final repayments = await dao.getRepaymentsByLoanId(loan.id);
      expect(repayments.length, 1);
      expect(repayments.first.principalPaid, '500.0');

      // Verify final CashBook counts
      final finalCashbook = await dao.getCashBookEntries(testGroupId);
      expect(finalCashbook.length,
          4); // Disbursement, Fee, EMI Repayment, Facilitation Fee
      expect(finalCashbook[2].amount, 500.0);
      expect(finalCashbook[3].amount, 2.50);
    });
  });
}
