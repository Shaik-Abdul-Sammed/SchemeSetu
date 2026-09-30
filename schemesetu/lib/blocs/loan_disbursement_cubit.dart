import 'dart:math';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:drift/drift.dart';
import '../data/local/app_database.dart';
import '../data/local/shg_dao.dart';
import '../data/repositories/loan_repository.dart';
import 'loan_disbursement_state.dart';

class LoanDisbursementCubit extends Cubit<LoanDisbursementState> {
  final ILoanRepository _loanRepository;
  final SHGDao _shgDao;

  LoanDisbursementCubit({
    required ILoanRepository loanRepository,
    required SHGDao shgDao,
  })  : _loanRepository = loanRepository,
        _shgDao = shgDao,
        super(const LoanInitial());

  // Generate and calculate the EMI Schedule
  void calculateEmi({
    required double principal,
    required double annualInterestRate,
    required int durationMonths,
    required bool isDiminishing,
  }) {
    emit(const LoanCalculating());
    try {
      final monthlyRate = annualInterestRate / 12 / 100;
      double emi = 0.0;
      double totalInterest = 0.0;
      double totalRepayable = 0.0;
      final schedule = <Map<String, dynamic>>[];

      if (isDiminishing) {
        if (monthlyRate == 0) {
          emi = principal / durationMonths;
          totalRepayable = principal;
        } else {
          emi = principal *
              (monthlyRate * pow(1 + monthlyRate, durationMonths)) /
              (pow(1 + monthlyRate, durationMonths) - 1);
          totalRepayable = emi * durationMonths;
          totalInterest = totalRepayable - principal;
        }

        double balance = principal;
        DateTime nextDueDate = DateTime.now().add(const Duration(days: 30));
        for (int i = 1; i <= durationMonths; i++) {
          final interestComponent = balance * monthlyRate;
          final principalComponent = emi - interestComponent;
          balance -= principalComponent;
          schedule.add({
            'installmentNo': i,
            'dueDate': nextDueDate.toIso8601String(),
            'emi': emi,
            'principalComponent': principalComponent,
            'interestComponent': interestComponent,
            'outstandingBalance': max(0.0, balance),
          });
          nextDueDate = nextDueDate.add(const Duration(days: 30));
        }
      } else {
        // Simple Interest EMI Calculation
        totalInterest = principal * monthlyRate * durationMonths;
        totalRepayable = principal + totalInterest;
        emi = totalRepayable / durationMonths;

        double balance = principal;
        DateTime nextDueDate = DateTime.now().add(const Duration(days: 30));
        final interestComponent = totalInterest / durationMonths;
        final principalComponent = principal / durationMonths;
        for (int i = 1; i <= durationMonths; i++) {
          balance -= principalComponent;
          schedule.add({
            'installmentNo': i,
            'dueDate': nextDueDate.toIso8601String(),
            'emi': emi,
            'principalComponent': principalComponent,
            'interestComponent': interestComponent,
            'outstandingBalance': max(0.0, balance),
          });
          nextDueDate = nextDueDate.add(const Duration(days: 30));
        }
      }

      // Processing Fee (Fintech Revenue: 2% of principal amount)
      final processingFee = principal * 0.02;

      emit(LoanCalculated(
        emi: emi,
        totalInterest: totalInterest,
        totalRepayable: totalRepayable,
        schedule: schedule,
        processingFee: processingFee,
      ));
    } catch (e) {
      emit(LoanError('Failed to calculate EMI: $e'));
    }
  }

  // Disburse Loan & deduct processing fee
  Future<void> disburseLoan({
    required int membershipId,
    required double principalAmount,
    required double annualInterestRate,
    required int durationMonths,
    required String purpose,
  }) async {
    emit(const LoanDisbursing());
    try {
      // 1. Get Group ID from Membership to log in group CashBook
      final membership = await (_shgDao.db.select(_shgDao.db.sHGMemberships)
            ..where((t) => t.id.equals(membershipId)))
          .getSingle();
      final groupId = membership.groupId;

      // 2. Encrypt & Insert Loan into Repository
      final loanCompanion = SHGLoansCompanion.insert(
        membershipId: membershipId,
        principalAmount: principalAmount.toStringAsFixed(2),
        interestRate: annualInterestRate.toStringAsFixed(2),
        loanDate: DateTime.now(),
        durationMonths: durationMonths,
        purpose: Value(purpose),
        status: const Value('Active'),
      );

      final loanId = await _loanRepository.insertLoan(loanCompanion);

      // Fetch the disbursed loan
      final dbLoans =
          await _loanRepository.getLoansByMembershipId(membershipId);
      final shgLoan = dbLoans.firstWhere((l) => l.id == loanId);

      // 3. Log Disbursement Expense and Fintech Processing Fee in CashBook
      final processingFee = principalAmount * 0.02;

      // Loan Disbursement Expense (Drift CashBook entry)
      await _shgDao.insertCashBookEntry(SHGCashBooksCompanion.insert(
        groupId: groupId,
        transactionType: 'Expense',
        category: 'Loan Disbursement',
        amount: principalAmount,
        description:
            Value('Disbursed Loan ID: $loanId to Membership ID: $membershipId'),
      ));

      // Processing Fee Revenue (Fintech Engine)
      await _shgDao.insertCashBookEntry(SHGCashBooksCompanion.insert(
        groupId: groupId,
        transactionType: 'Income',
        category: 'Fintech Revenue',
        amount: processingFee,
        description: Value('Processing Fee (2%) for Loan ID: $loanId'),
      ));

      emit(LoanDisbursed(shgLoan));
    } catch (e) {
      emit(LoanError('Failed to disburse loan: $e'));
    }
  }

  // Process Repayment using Mock UPI Gateway & charge Facilitation Fee
  Future<void> makeRepayment({
    required int loanId,
    required double principalPaid,
    required double interestPaid,
    int? meetingId,
  }) async {
    emit(const LoanRepaying());
    try {
      final totalAmount = principalPaid + interestPaid;
      // Facilitation Fee: 0.5% of total payment amount (Fintech Engine)
      final facilitationFee = max(1.0, totalAmount * 0.005);

      // 1. Simulate Mock UPI Gateway payment processing
      await Future.delayed(const Duration(seconds: 1));

      // 2. Fetch loan to find membership & group ID
      final rawLoan = await (_shgDao.db.select(_shgDao.db.sHGLoans)
            ..where((t) => t.id.equals(loanId)))
          .getSingle();

      final membership = await (_shgDao.db.select(_shgDao.db.sHGMemberships)
            ..where((t) => t.id.equals(rawLoan.membershipId)))
          .getSingle();
      final groupId = membership.groupId;

      // 3. Encrypt & Insert Repayment
      final repaymentCompanion = SHGLoanRepaymentsCompanion.insert(
        loanId: loanId,
        meetingId: Value(meetingId),
        principalPaid: principalPaid.toStringAsFixed(2),
        interestPaid: interestPaid.toStringAsFixed(2),
        date: const Value.absent(),
      );

      final repaymentId =
          await _loanRepository.insertRepayment(repaymentCompanion);

      final rawRepayments = await _loanRepository.getRepaymentsByLoanId(loanId);
      final repayment = rawRepayments.firstWhere((r) => r.id == repaymentId);

      // 4. Log Repayment Income & Facilitation Fee in CashBook
      // Loan Repayment (Principal + Interest)
      await _shgDao.insertCashBookEntry(SHGCashBooksCompanion.insert(
        groupId: groupId,
        transactionType: 'Income',
        category: 'Loan Repayment',
        amount: totalAmount,
        description: Value(
            'Repayment for Loan ID: $loanId. Principal: $principalPaid, Interest: $interestPaid'),
      ));

      // Facilitation Fee Revenue (Fintech Engine)
      await _shgDao.insertCashBookEntry(SHGCashBooksCompanion.insert(
        groupId: groupId,
        transactionType: 'Income',
        category: 'Fintech Revenue',
        amount: facilitationFee,
        description:
            Value('UPI Facilitation Fee (0.5%) for Loan ID: $loanId repayment'),
      ));

      emit(LoanRepaid(repayment));
    } catch (e) {
      emit(LoanError('Repayment failed: $e'));
    }
  }
}
