class GroupModel {
  final String id;
  final String name;
  final double installment;
  final int totalMembers;
  final DateTime startDate;
  final int durationMonths;
  final int paymentDueDate;

  GroupModel({
    required this.id,
    required this.name,
    required this.installment,
    required this.totalMembers,
    required this.startDate,
    required this.durationMonths,
    this.paymentDueDate = 15,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'installment': installment,
      'totalMembers': totalMembers,
      'startDate': startDate.toIso8601String(),
      'durationMonths': durationMonths,
    };
  }

  factory GroupModel.fromMap(Map<String, dynamic> map, String docId) {
    final rawStartDate = map['startDate'];
    return GroupModel(
      id: docId,
      name: map['name'] ?? '',
      installment: (map['installment'] ?? 0).toDouble(),
      totalMembers: map['totalMembers'] ?? 0,
      startDate: rawStartDate is DateTime
          ? rawStartDate
          : DateTime.tryParse(rawStartDate?.toString() ?? '') ?? DateTime.now(),
      durationMonths: map['durationMonths'] ?? 12,
    );
  }

  GroupModel copyWith({
    String? id,
    String? name,
    double? installment,
    int? totalMembers,
    DateTime? startDate,
    int? durationMonths,
  }) {
    return GroupModel(
      id: id ?? this.id,
      name: name ?? this.name,
      installment: installment ?? this.installment,
      totalMembers: totalMembers ?? this.totalMembers,
      startDate: startDate ?? this.startDate,
      durationMonths: durationMonths ?? this.durationMonths,
    );
  }
}
