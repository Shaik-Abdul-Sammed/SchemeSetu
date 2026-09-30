class WinnerModel {
  final String id;
  final String groupId;
  final String month; // e.g. "2026-06"
  final String memberId;
  final double amount; // Prize amount (payout)
  final double bidAmount;
  final double winnerPaid;
  final double winnerBalance;
  final double winnerLeft;
  final DateTime date;
  final String paymentMode;
  final String? exchangedToMemberId;
  final String? exchangeNote;
  final String payoutStatus;
  final DateTime? payoutDate;

  WinnerModel({
    required this.id,
    required this.groupId,
    required this.month,
    required this.memberId,
    required this.amount,
    required this.bidAmount,
    required this.winnerPaid,
    required this.winnerBalance,
    required this.winnerLeft,
    required this.date,
    this.paymentMode = 'Cash',
    this.exchangedToMemberId,
    this.exchangeNote,
    this.payoutStatus = 'Pending',
    this.payoutDate,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'groupId': groupId,
      'month': month,
      'memberId': memberId,
      'amount': amount,
      'bidAmount': bidAmount,
      'winnerPaid': winnerPaid,
      'winnerBalance': winnerBalance,
      'winnerLeft': winnerLeft,
      'date': date.toIso8601String(),
      'paymentMode': paymentMode,
      'exchangedToMemberId': exchangedToMemberId,
      'exchangeNote': exchangeNote,
      'payoutStatus': payoutStatus,
      'payoutDate': payoutDate?.toIso8601String(),
    };
  }

  factory WinnerModel.fromMap(Map<String, dynamic> map, String docId) {
    final rawDate = map['date'];
    final rawPayoutDate = map['payoutDate'];
    return WinnerModel(
      id: docId,
      groupId: map['groupId'] ?? '',
      month: map['month'] ?? '',
      memberId: map['memberId'] ?? '',
      amount: (map['amount'] ?? 0).toDouble(),
      bidAmount: (map['bidAmount'] ?? 0).toDouble(),
      winnerPaid: (map['winnerPaid'] ?? 0).toDouble(),
      winnerBalance: (map['winnerBalance'] ?? 0).toDouble(),
      winnerLeft: (map['winnerLeft'] ?? 0).toDouble(),
      paymentMode: map['paymentMode'] ?? 'Cash',
      exchangedToMemberId: map['exchangedToMemberId'],
      exchangeNote: map['exchangeNote'],
      payoutStatus: map['payoutStatus'] ?? 'Pending',
      date: rawDate is DateTime
          ? rawDate
          : DateTime.tryParse(rawDate?.toString() ?? '') ?? DateTime.now(),
      payoutDate: rawPayoutDate is DateTime
          ? rawPayoutDate
          : (rawPayoutDate != null
              ? DateTime.tryParse(rawPayoutDate.toString())
              : null),
    );
  }

  WinnerModel copyWith({
    String? id,
    String? groupId,
    String? month,
    String? memberId,
    double? amount,
    double? bidAmount,
    double? winnerPaid,
    double? winnerBalance,
    double? winnerLeft,
    DateTime? date,
    String? paymentMode,
    String? exchangedToMemberId,
    String? exchangeNote,
    String? payoutStatus,
    DateTime? payoutDate,
  }) {
    return WinnerModel(
      id: id ?? this.id,
      groupId: groupId ?? this.groupId,
      month: month ?? this.month,
      memberId: memberId ?? this.memberId,
      amount: amount ?? this.amount,
      bidAmount: bidAmount ?? this.bidAmount,
      winnerPaid: winnerPaid ?? this.winnerPaid,
      winnerBalance: winnerBalance ?? this.winnerBalance,
      winnerLeft: winnerLeft ?? this.winnerLeft,
      date: date ?? this.date,
      paymentMode: paymentMode ?? this.paymentMode,
      exchangedToMemberId: exchangedToMemberId ?? this.exchangedToMemberId,
      exchangeNote: exchangeNote ?? this.exchangeNote,
      payoutStatus: payoutStatus ?? this.payoutStatus,
      payoutDate: payoutDate ?? this.payoutDate,
    );
  }
}
