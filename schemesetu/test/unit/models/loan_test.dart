import 'package:flutter_test/flutter_test.dart';
import 'package:chit_fund_app/models/loan.dart';

void main() {
  group('Loan Model Tests', () {
    final testDate = DateTime(2026, 8, 5);
    final baseLoan = Loan(
      id: 'LOAN-001',
      memberId: 'MEM-101',
      groupId: 'GRP-202',
      principalAmount: 10000.0,
      interestRate: 12.0, // 1% per month
      durationMonths: 12,
      purpose: 'Dairy Business Expansion',
      status: 'Active',
      loanDate: testDate,
    );

    test('constructor sets all fields correctly', () {
      expect(baseLoan.id, 'LOAN-001');
      expect(baseLoan.memberId, 'MEM-101');
      expect(baseLoan.groupId, 'GRP-202');
      expect(baseLoan.principalAmount, 10000.0);
      expect(baseLoan.interestRate, 12.0);
      expect(baseLoan.durationMonths, 12);
      expect(baseLoan.purpose, 'Dairy Business Expansion');
      expect(baseLoan.status, 'Active');
      expect(baseLoan.loanDate, testDate);
    });

    test('calculateEMI - Diminishing Balance (Standard Amortization)', () {
      // 12% APR = 1% monthly rate.
      // EMI = 10000 * (0.01 * (1.01)^12) / ((1.01)^12 - 1)
      // EMI ≈ 888.48788
      final emi = baseLoan.calculateEMI(isDiminishing: true);
      expect(emi, closeTo(888.49, 0.02));
    });

    test('calculateEMI - Flat/Simple Interest Method', () {
      // Simple Interest = 10000 * 12% * 1 year = 1200
      // Total Repayable = 11200
      // EMI = 11200 / 12 months = 933.33
      final emi = baseLoan.calculateEMI(isDiminishing: false);
      expect(emi, closeTo(933.33, 0.02));
    });

    test('totalInterestPayable - Diminishing Balance', () {
      // Total repayment ≈ 888.49 * 12 = 10661.85
      // Total interest ≈ 661.85
      final totalInterest = baseLoan.totalInterestPayable(isDiminishing: true);
      expect(totalInterest, closeTo(661.85, 0.2));
    });

    test('totalInterestPayable - Flat/Simple Interest', () {
      final totalInterest = baseLoan.totalInterestPayable(isDiminishing: false);
      expect(totalInterest, closeTo(1200.0, 0.02));
    });

    test('calculateEMI with zero duration returns 0', () {
      final badLoan = baseLoan.copyWith(durationMonths: 0);
      expect(badLoan.calculateEMI(), 0.0);
    });

    test('calculateEMI with zero principal returns 0', () {
      final badLoan = baseLoan.copyWith(principalAmount: 0.0);
      expect(badLoan.calculateEMI(), 0.0);
    });

    test('generateRepaymentSchedule generates correct number of instalments',
        () {
      final schedule = baseLoan.generateRepaymentSchedule(isDiminishing: true);
      expect(schedule.length, 12);
      expect(schedule.first['month'], 1.0);
      expect(schedule.last['remainingBalance'], 0.0);
    });

    test('copyWith creates modified clone', () {
      final updated =
          baseLoan.copyWith(status: 'Closed', principalAmount: 15000.0);
      expect(updated.status, 'Closed');
      expect(updated.principalAmount, 15000.0);
      expect(updated.id, baseLoan.id);
    });

    test('toJson and fromJson serializes correctly', () {
      final json = baseLoan.toJson();
      final fromJson = Loan.fromJson(json);
      expect(fromJson, baseLoan);
    });

    test('equality and hashCode match identical parameters', () {
      final clone = Loan(
        id: 'LOAN-001',
        memberId: 'MEM-101',
        groupId: 'GRP-202',
        principalAmount: 10000.0,
        interestRate: 12.0,
        durationMonths: 12,
        purpose: 'Dairy Business Expansion',
        status: 'Active',
        loanDate: testDate,
      );
      expect(baseLoan, clone);
      expect(baseLoan.hashCode, clone.hashCode);
    });
  });
}
