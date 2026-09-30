import '../data/local/app_database.dart';

abstract class LoanDisbursementState {
  const LoanDisbursementState();
}

class LoanInitial extends LoanDisbursementState {
  const LoanInitial();
}

class LoanCalculating extends LoanDisbursementState {
  const LoanCalculating();
}

class LoanCalculated extends LoanDisbursementState {
  final double emi;
  final double totalInterest;
  final double totalRepayable;
  final List<Map<String, dynamic>>
      schedule; // List of EMIs with date, principal, interest, balance
  final double processingFee;

  const LoanCalculated({
    required this.emi,
    required this.totalInterest,
    required this.totalRepayable,
    required this.schedule,
    required this.processingFee,
  });
}

class LoanDisbursing extends LoanDisbursementState {
  const LoanDisbursing();
}

class LoanDisbursed extends LoanDisbursementState {
  final SHGLoan loan;
  const LoanDisbursed(this.loan);
}

class LoanRepaying extends LoanDisbursementState {
  const LoanRepaying();
}

class LoanRepaid extends LoanDisbursementState {
  final SHGLoanRepayment repayment;
  const LoanRepaid(this.repayment);
}

class LoanError extends LoanDisbursementState {
  final String message;
  const LoanError(this.message);
}
