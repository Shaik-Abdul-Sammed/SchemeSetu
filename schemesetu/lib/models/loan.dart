import 'dart:math';

class Loan {
  final String id;
  final String memberId;
  final String groupId;
  final double principalAmount;
  final double
      interestRate; // Annual percentage rate (e.g. 12.0 for 1% per month)
  final int durationMonths;
  final String purpose;
  final String status; // 'Pending', 'Active', 'Closed', 'Rejected'
  final DateTime loanDate;

  const Loan({
    required this.id,
    required this.memberId,
    required this.groupId,
    required this.principalAmount,
    required this.interestRate,
    required this.durationMonths,
    required this.purpose,
    required this.status,
    required this.loanDate,
  });

  // Calculate Monthly Installment (EMI)
  double calculateEMI({bool isDiminishing = true}) {
    if (principalAmount <= 0 || durationMonths <= 0 || interestRate < 0) {
      return 0.0;
    }

    final double monthlyRate = interestRate / 12 / 100;

    if (monthlyRate == 0) {
      return principalAmount / durationMonths;
    }

    if (isDiminishing) {
      // Diminishing Balance Method (Standard amortization formula)
      return principalAmount *
          (monthlyRate * pow(1 + monthlyRate, durationMonths)) /
          (pow(1 + monthlyRate, durationMonths) - 1);
    } else {
      // Flat (Simple) Interest Method
      final totalInterest = principalAmount * monthlyRate * durationMonths;
      return (principalAmount + totalInterest) / durationMonths;
    }
  }

  // Calculate Total Interest Payable over the term of the loan
  double totalInterestPayable({bool isDiminishing = true}) {
    if (principalAmount <= 0 || durationMonths <= 0 || interestRate < 0) {
      return 0.0;
    }
    final emi = calculateEMI(isDiminishing: isDiminishing);
    return (emi * durationMonths) - principalAmount;
  }

  // Generate Repayment Schedule
  List<Map<String, double>> generateRepaymentSchedule(
      {bool isDiminishing = true}) {
    final List<Map<String, double>> schedule = [];
    double remainingPrincipal = principalAmount;
    final emi = calculateEMI(isDiminishing: isDiminishing);
    final double monthlyRate = interestRate / 12 / 100;

    for (int month = 1; month <= durationMonths; month++) {
      double interestPayment = 0.0;
      double principalPayment = 0.0;

      if (isDiminishing) {
        interestPayment = remainingPrincipal * monthlyRate;
        principalPayment = emi - interestPayment;
        remainingPrincipal -= principalPayment;
      } else {
        // Flat (Simple) Interest: Fixed interest and principal payment every month
        interestPayment =
            (principalAmount * (interestRate / 100) * (durationMonths / 12)) /
                durationMonths;
        principalPayment = principalAmount / durationMonths;
        remainingPrincipal -= principalPayment;
      }

      if (remainingPrincipal < 0.01) remainingPrincipal = 0.0;

      schedule.add({
        'month': month.toDouble(),
        'emi': emi,
        'interest': interestPayment,
        'principal': principalPayment,
        'remainingBalance': remainingPrincipal,
      });
    }

    return schedule;
  }

  // copyWith
  Loan copyWith({
    String? id,
    String? memberId,
    String? groupId,
    double? principalAmount,
    double? interestRate,
    int? durationMonths,
    String? purpose,
    String? status,
    DateTime? loanDate,
  }) {
    return Loan(
      id: id ?? this.id,
      memberId: memberId ?? this.memberId,
      groupId: groupId ?? this.groupId,
      principalAmount: principalAmount ?? this.principalAmount,
      interestRate: interestRate ?? this.interestRate,
      durationMonths: durationMonths ?? this.durationMonths,
      purpose: purpose ?? this.purpose,
      status: status ?? this.status,
      loanDate: loanDate ?? this.loanDate,
    );
  }

  // fromJson
  factory Loan.fromJson(Map<String, dynamic> json) {
    return Loan(
      id: json['id'] as String,
      memberId: json['memberId'] as String,
      groupId: json['groupId'] as String,
      principalAmount: (json['principalAmount'] as num).toDouble(),
      interestRate: (json['interestRate'] as num).toDouble(),
      durationMonths: json['durationMonths'] as int,
      purpose: json['purpose'] as String,
      status: json['status'] as String,
      loanDate: DateTime.parse(json['loanDate'] as String),
    );
  }

  // toJson
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'memberId': memberId,
      'groupId': groupId,
      'principalAmount': principalAmount,
      'interestRate': interestRate,
      'durationMonths': durationMonths,
      'purpose': purpose,
      'status': status,
      'loanDate': loanDate.toIso8601String(),
    };
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Loan &&
        other.id == id &&
        other.memberId == memberId &&
        other.groupId == groupId &&
        other.principalAmount == principalAmount &&
        other.interestRate == interestRate &&
        other.durationMonths == durationMonths &&
        other.purpose == purpose &&
        other.status == status &&
        other.loanDate == loanDate;
  }

  @override
  int get hashCode {
    return Object.hash(
      id,
      memberId,
      groupId,
      principalAmount,
      interestRate,
      durationMonths,
      purpose,
      status,
      loanDate,
    );
  }
}
