import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'calendar_engine.dart';

class ReminderEngine {
  final CalendarEngine calendarEngine;

  ReminderEngine(this.calendarEngine);

  String generateReminderMessage({
    required String memberName,
    required double amount,
    required double chitValue,
    required int roundNo,
    required double totalPending,
    DateTime? currentDate,
  }) {
    final status = calendarEngine.currentPaymentStatus;
    final now = currentDate ?? calendarEngine.now;
    final monthYear = DateFormat('MMMM yyyy').format(now);

    if (status == PaymentStatus.reminder) {
      return _getReminderTemplate(
        memberName: memberName,
        amount: amount,
        chitValue: chitValue,
        roundNo: roundNo,
        monthYear: monthYear,
      );
    } else {
      return _getDueTemplate(
        memberName: memberName,
        amount: amount,
        chitValue: chitValue,
        roundNo: roundNo,
        monthYear: monthYear,
        totalPending: totalPending,
      );
    }
  }

  String _getReminderTemplate({
    required String memberName,
    required double amount,
    required double chitValue,
    required int roundNo,
    required String monthYear,
  }) {
    return '''
Assalamu Alaikum Wa Rehmatullahi Wabarakatuhu

Dear $memberName,

This is a friendly reminder that your payment of ₹${amount.toStringAsFixed(0)} for the ₹${chitValue.toStringAsFixed(0)} SanghaSetu (Round $roundNo – $monthYear) is due this month.

Kindly pay before the 15th.

JazakAllah Khair! Thank you for your continued support.
- SanghaSetu'''
        .trim();
  }

  String _getDueTemplate({
    required String memberName,
    required double amount,
    required double chitValue,
    required int roundNo,
    required String monthYear,
    required double totalPending,
  }) {
    return '''
Assalamu Alaikum Wa Rehmatullahi Wabarakatuhu

Dear $memberName,

Your payment of ₹${amount.toStringAsFixed(0)} for the ₹${chitValue.toStringAsFixed(0)} SanghaSetu (Round $roundNo – $monthYear) is overdue.

Pending Amount:
₹${totalPending.toStringAsFixed(0)}

Please make the payment as soon as possible.

JazakAllah Khair! Thank you for your continued support.
- SanghaSetu'''
        .trim();
  }
}

final reminderEngineProvider = Provider<ReminderEngine>((ref) {
  final calendarEngine = ref.watch(calendarEngineProvider);
  return ReminderEngine(calendarEngine);
});
