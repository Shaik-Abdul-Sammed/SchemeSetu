import 'package:flutter_test/flutter_test.dart';
import 'package:drift/drift.dart' as drift;
import 'package:chit_fund_app/data/local/app_database.dart';
import 'package:chit_fund_app/data/repositories/loan_repository.dart';
import 'package:chit_fund_app/services/encryption_service.dart';

void main() {
  group('LoanRepository Encryption/Decryption Tests', () {
    late AppDatabase db;
    late LoanRepository repository;
    final encryptionService = EncryptionService();

    late int testMemberId;
    late int testGroupId;
    late int testMembershipId;

    setUp(() async {
      await EncryptionService().init();
      db = AppDatabase.inMemory();
      repository = LoanRepository(db.sHGDao);

      // Seed group
      testGroupId = await db.sHGDao.insertGroup(
        const SHGGroupsCompanion(
          name: drift.Value('Sri Lakshmi SHG'),
        ),
      );

      // Seed member
      testMemberId = await db.sHGDao.db.into(db.sHGDao.db.members).insert(
            const MembersCompanion(
              name: drift.Value('Rajamma'),
              phone: drift.Value('9010203040'),
              pin: drift.Value('1122'),
            ),
          );

      // Link member to group (membership)
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

    test('insertLoan encrypts fields and getLoansByMembershipId decrypts them',
        () async {
      final loanCompanion = SHGLoansCompanion(
        membershipId: drift.Value(testMembershipId),
        principalAmount: const drift.Value('15000.0'),
        interestRate: const drift.Value('1.5'),
        durationMonths: const drift.Value(12),
        purpose: const drift.Value('Business Capital'),
        status: const drift.Value('Active'),
        loanDate: drift.Value(DateTime(2026, 8, 6)),
      );

      final loanId = await repository.insertLoan(loanCompanion);
      expect(loanId, greaterThan(0));

      // 1. Verify direct DB lookup contains encrypted data
      final rawLoans = await db.sHGDao.db.select(db.sHGDao.db.sHGLoans).get();
      expect(rawLoans.length, 1);

      // Decrypting raw DB value should equal original
      expect(
          encryptionService.decrypt(rawLoans.first.principalAmount), '15000.0');
      expect(encryptionService.decrypt(rawLoans.first.interestRate), '1.5');
      expect(encryptionService.decrypt(rawLoans.first.purpose!),
          'Business Capital');

      // 2. Verify repository read decrypts automatically
      final decryptedLoans =
          await repository.getLoansByMembershipId(testMembershipId);
      expect(decryptedLoans.length, 1);
      expect(decryptedLoans.first.principalAmount, '15000.0');
      expect(decryptedLoans.first.interestRate, '1.5');
      expect(decryptedLoans.first.purpose, 'Business Capital');
    });

    test(
        'insertRepayment encrypts fields and getRepaymentsByLoanId decrypts them',
        () async {
      // Must first insert a valid loan to satisfy the foreign key constraint
      final loanCompanion = SHGLoansCompanion(
        membershipId: drift.Value(testMembershipId),
        principalAmount: const drift.Value('10000.0'),
        interestRate: const drift.Value('1.0'),
        durationMonths: const drift.Value(12),
        purpose: const drift.Value('Repayment test loan'),
        status: const drift.Value('Active'),
        loanDate: drift.Value(DateTime(2026, 8, 6)),
      );
      final loanId = await repository.insertLoan(loanCompanion);

      final repaymentCompanion = SHGLoanRepaymentsCompanion(
        loanId: drift.Value(loanId),
        principalPaid: const drift.Value('1250.0'),
        interestPaid: const drift.Value('150.0'),
      );

      final repId = await repository.insertRepayment(repaymentCompanion);
      expect(repId, greaterThan(0));

      // 1. Verify direct DB lookup contains encrypted data
      final rawRepayments =
          await db.sHGDao.db.select(db.sHGDao.db.sHGLoanRepayments).get();
      expect(rawRepayments.length, 1);

      expect(encryptionService.decrypt(rawRepayments.first.principalPaid),
          '1250.0');
      expect(
          encryptionService.decrypt(rawRepayments.first.interestPaid), '150.0');

      // 2. Verify repository read decrypts automatically
      final decryptedReps = await repository.getRepaymentsByLoanId(loanId);
      expect(decryptedReps.length, 1);
      expect(decryptedReps.first.principalPaid, '1250.0');
      expect(decryptedReps.first.interestPaid, '150.0');
    });
  });
}
