class PaymentModel {
  final String id;
  final String memberId;
  final String groupId;
  final String month; // e.g. "2026-06" or "June 2026"
  final double amount;
  final bool isPaid;
  final DateTime? paymentDate;
  final String? method; // cash, upi, bank, cheque
  final String? reference;
  final String? receiptPath;
  final bool isLate;

  PaymentModel({
    required this.id,
    required this.memberId,
    required this.groupId,
    required this.month,
    required this.amount,
    required this.isPaid,
    this.paymentDate,
    this.method,
    this.reference,
    this.receiptPath,
    this.isLate = false,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'memberId': memberId,
      'groupId': groupId,
      'month': month,
      'amount': amount,
      'isPaid': isPaid,
      'paymentDate': paymentDate?.toIso8601String(),
      'method': method,
      'reference': reference,
      'receiptPath': receiptPath,
      'isLate': isLate,
    };
  }

  factory PaymentModel.fromMap(Map<String, dynamic> map, String docId) {
    final rawPaymentDate = map['paymentDate'];
    return PaymentModel(
      id: docId,
      memberId: map['memberId'] ?? '',
      groupId: map['groupId'] ?? '',
      month: map['month'] ?? '',
      amount: (map['amount'] ?? 0).toDouble(),
      isPaid: map['isPaid'] ?? false,
      paymentDate: rawPaymentDate is DateTime
          ? rawPaymentDate
          : DateTime.tryParse(rawPaymentDate?.toString() ?? ''),
      method: map['method'],
      reference: map['reference'],
      receiptPath: map['receiptPath'],
      isLate: map['isLate'] ?? false,
    );
  }

  PaymentModel copyWith({
    String? id,
    String? memberId,
    String? groupId,
    String? month,
    double? amount,
    bool? isPaid,
    DateTime? paymentDate,
    String? method,
    String? reference,
    String? receiptPath,
    bool? isLate,
  }) {
    return PaymentModel(
      id: id ?? this.id,
      memberId: memberId ?? this.memberId,
      groupId: groupId ?? this.groupId,
      month: month ?? this.month,
      amount: amount ?? this.amount,
      isPaid: isPaid ?? this.isPaid,
      paymentDate: paymentDate,
      method: method ?? this.method,
      reference: reference ?? this.reference,
      receiptPath: receiptPath ?? this.receiptPath,
      isLate: isLate ?? this.isLate,
    );
  }
}
