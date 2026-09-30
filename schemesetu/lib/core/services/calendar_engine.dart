import 'package:flutter_riverpod/flutter_riverpod.dart';

enum PaymentStatus {
  reminder,
  due,
  overdue, // Overdue is essentially "Due" but after a certain grace period if needed
}

class CalendarEngine {
  final DateTime now;

  CalendarEngine({DateTime? fixedDate}) : now = fixedDate ?? DateTime.now();

  int get currentYear => now.year;
  int get currentMonth => now.month;
  int get currentDay => now.day;

  String get formattedCurrentMonthYear =>
      "$currentYear-${currentMonth.toString().padLeft(2, '0')}";

  /// Determine the current round based on the group start date.
  /// If start date is e.g. Jan 2024 and we are in March 2024, it's round 3.
  int determineCurrentRound(DateTime groupStartDate) {
    int monthDiff = (now.year - groupStartDate.year) * 12 +
        (now.month - groupStartDate.month);
    return monthDiff + 1; // Round 1 is the start month
  }

  /// Rules:
  /// Days 1-14: Status = Reminder
  /// Days 15 onwards: Status = Due
  PaymentStatus get currentPaymentStatus {
    if (now.day <= 14) {
      return PaymentStatus.reminder;
    } else {
      return PaymentStatus.due;
    }
  }
}

final calendarEngineProvider = Provider<CalendarEngine>((ref) {
  return CalendarEngine();
});
