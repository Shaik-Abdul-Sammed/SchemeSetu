import 'package:flutter_test/flutter_test.dart';
import 'package:chit_fund_app/data/local/app_database.dart';
import 'package:chit_fund_app/data/local/shg_dao.dart';
import 'package:chit_fund_app/services/encryption_service.dart';
import 'package:chit_fund_app/data/repositories/loan_repository.dart';
import 'package:chit_fund_app/blocs/loan_disbursement_cubit.dart';
import 'package:chit_fund_app/blocs/loan_disbursement_state.dart';
import 'package:drift/drift.dart' as drift;

void main() {
  late AppDatabase database;
  late SHGDao shgDao;
  late LoanRepository loanRepository;
  late LoanDisbursementCubit cubit;

  setUp(() async {
    database = AppDatabase.inMemory();
    shgDao = SHGDao(database);
    loanRepository = LoanRepository(shgDao);
    cubit =
        LoanDisbursementCubit(loanRepository: loanRepository, shgDao: shgDao);

    // Initialize EncryptionService
    await EncryptionService().init();
  });

  tearDown(() async {
    await database.close();
  });

  group('EncryptionService Tests', () {
    test('Encrypt and decrypt match', () {
      const original = '₹15,000.00';
      final encrypted = EncryptionService().encrypt(original);
      expect(encrypted, isNot(equals(original)));
      expect(encrypted.contains(':'), isTrue); // Packages IV and ciphertext

      final decrypted = EncryptionService().decrypt(encrypted);
      expect(decrypted, equals(original));
    });

    test('Decryption handles non-encrypted gracefully', () {
      const plainText = 'Plain text';
      final decrypted = EncryptionService().decrypt(plainText);
      expect(decrypted, equals(plainText));
    });
  });

  group('EMI Calculations Tests', () {
    test('Diminishing EMI Calculation', () {
      cubit.calculateEmi(
        principal: 10000.0,
        annualInterestRate: 12.0, // 1% monthly
        durationMonths: 12,
        isDiminishing: true,
      );

      expect(cubit.state, isA<LoanCalculated>());
      final state = cubit.state as LoanCalculated;
      expect(state.emi, closeTo(888.48, 0.1));
      expect(state.totalRepayable, closeTo(10661.85, 0.1));
      expect(state.totalInterest, closeTo(661.85, 0.1));
      expect(state.processingFee, equals(200.0)); // 2% processing fee
      expect(state.schedule.length, equals(12));
    });

    test('Simple Interest EMI Calculation', () {
      cubit.calculateEmi(
        principal: 10000.0,
        annualInterestRate: 12.0, // 1% monthly
        durationMonths: 12,
        isDiminishing: false,
      );

      expect(cubit.state, isA<LoanCalculated>());
      final state = cubit.state as LoanCalculated;
      expect(state.emi, closeTo(933.33, 0.1));
    });
  });

  group('Loan Disbursement & Repayment Integration Tests', () {
    test('Disburse Loan saves encrypted record and cashbook ledger', () async {
      // 1. Create a dummy group and membership
      final groupId = await shgDao.insertGroup(SHGGroupsCompanion.insert(
        name: 'Test Group',
        monthlySavingAmount: const drift.Value(200.0),
      ));

      // Create dummy member
      final memberId = await database.into(database.members).insert(
            MembersCompanion.insert(
              name: 'Jane Doe',
              phone: '9876543210',
              address: const drift.Value('Test Address'),
            ),
          );

      final membershipId =
          await shgDao.addMemberToGroup(SHGMembershipsCompanion.insert(
        memberId: memberId,
        groupId: groupId,
      ));

      // 2. Disburse Loan
      await cubit.disburseLoan(
        membershipId: membershipId,
        principalAmount: 5000.0,
        annualInterestRate: 12.0,
        durationMonths: 6,
        purpose: 'Agriculture',
      );

      expect(cubit.state, isA<LoanDisbursed>());
      final disbursedState = cubit.state as LoanDisbursed;
      expect(disbursedState.loan.principalAmount,
          equals('5000.00')); // Decrypted by repository
      expect(disbursedState.loan.interestRate, equals('12.00'));
      expect(disbursedState.loan.purpose, equals('Agriculture'));

      // Check DB values are encrypted
      final rawLoans = await (database.select(database.sHGLoans)).get();
      expect(rawLoans.length, equals(1));
      expect(rawLoans.first.principalAmount,
          isNot(equals('5000.00'))); // Encrypted in DB
      expect(rawLoans.first.interestRate, isNot(equals('12.00')));
      expect(rawLoans.first.purpose, isNot(equals('Agriculture')));

      // Check CashBook ledgers
      final cashBook = await shgDao.getCashBookEntries(groupId);
      expect(cashBook.length,
          equals(2)); // Disbursement expense + Processing fee income

      final disbursementEntry =
          cashBook.firstWhere((e) => e.category == 'Loan Disbursement');
      expect(disbursementEntry.amount, equals(5000.0));
      expect(disbursementEntry.transactionType, equals('Expense'));

      final feeEntry =
          cashBook.firstWhere((e) => e.category == 'Fintech Revenue');
      expect(feeEntry.amount, equals(100.0)); // 2% of 5000
      expect(feeEntry.transactionType, equals('Income'));

      // 3. Make Repayment
      final loanId = disbursedState.loan.id;
      await cubit.makeRepayment(
        loanId: loanId,
        principalPaid: 833.33,
        interestPaid: 50.0,
      );

      expect(cubit.state, isA<LoanRepaid>());
      final repaidState = cubit.state as LoanRepaid;
      expect(
          repaidState.repayment.principalPaid, equals('833.33')); // Decrypted
      expect(repaidState.repayment.interestPaid, equals('50.00'));

      // Verify db is encrypted
      final rawRepayments =
          await (database.select(database.sHGLoanRepayments)).get();
      expect(rawRepayments.length, equals(1));
      expect(rawRepayments.first.principalPaid, isNot(equals('833.33')));

      // Check CashBook for repayment income & facilitation fee
      final updatedCashBook = await shgDao.getCashBookEntries(groupId);
      expect(
          updatedCashBook.length, equals(4)); // 2 initial + 2 repayment entries

      final repaymentEntry =
          updatedCashBook.firstWhere((e) => e.category == 'Loan Repayment');
      expect(repaymentEntry.amount, equals(883.33));
      expect(repaymentEntry.transactionType, equals('Income'));

      final facilitationFeeEntry = updatedCashBook
          .firstWhere((e) => e.description!.contains('UPI Facilitation Fee'));
      expect(facilitationFeeEntry.amount,
          equals(883.33 * 0.005)); // 0.5% of 883.33
    });
  });
}
