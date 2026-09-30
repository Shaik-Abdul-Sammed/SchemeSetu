import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:timezone/timezone.dart' as tz;
import 'package:timezone/data/latest.dart' as tzdata;
import '../../services/notification_service.dart';

class NotificationScheduler {
  final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin;

  NotificationScheduler(this.flutterLocalNotificationsPlugin) {
    _init();
  }

  Future<void> _init() async {
    tzdata.initializeTimeZones();
    const AndroidInitializationSettings initializationSettingsAndroid =
        AndroidInitializationSettings('@mipmap/ic_launcher');
    const DarwinInitializationSettings initializationSettingsIOS =
        DarwinInitializationSettings(
            requestAlertPermission: true,
            requestBadgePermission: true,
            requestSoundPermission: true);
    const InitializationSettings initializationSettings =
        InitializationSettings(
            android: initializationSettingsAndroid,
            iOS: initializationSettingsIOS);
    await flutterLocalNotificationsPlugin.initialize(
        settings: initializationSettings);
  }

  /// Schedule reminders based on business rules for a particular month/member/group
  /// 5th, 10th, 14th (Final Reminder), 15th (Due Notice), 20th (Due), 25th (Urgent), 30th (Final Due)
  Future<void> scheduleMonthlyReminders({
    required int memberId,
    required String memberName,
    required String groupName,
    required double amount,
  }) async {
    final now = DateTime.now();
    // Schedule for the current month
    final daysToSchedule = [5, 10, 14, 15, 20, 25, 30];

    for (int day in daysToSchedule) {
      if (day > now.day) {
        final scheduledDate =
            DateTime(now.year, now.month, day, 10, 0); // 10 AM
        await _scheduleNotification(
          id: memberId * 100 + day, // Unique ID per member and day
          title: _getTitleForDay(day),
          body: _getBodyForDay(day, memberName, groupName, amount),
          scheduledDate: scheduledDate,
        );
      }
    }
  }

  Future<void> _scheduleNotification({
    required int id,
    required String title,
    required String body,
    required DateTime scheduledDate,
  }) async {
    await flutterLocalNotificationsPlugin.zonedSchedule(
      id: id,
      title: title,
      body: body,
      scheduledDate: tz.TZDateTime.from(scheduledDate, tz.local),
      notificationDetails: const NotificationDetails(
        android: AndroidNotificationDetails(
          'payment_reminders',
          'Payment Reminders',
          channelDescription: 'Reminders for due payments',
          importance: Importance.high,
          priority: Priority.high,
        ),
        iOS: DarwinNotificationDetails(),
      ),
      androidScheduleMode: AndroidScheduleMode.inexactAllowWhileIdle,
    );
  }

  Future<void> cancelAllReminders(int memberId) async {
    final daysToSchedule = [5, 10, 14, 15, 20, 25, 30];
    for (int day in daysToSchedule) {
      await flutterLocalNotificationsPlugin.cancel(id: memberId * 100 + day);
    }
  }

  String _getTitleForDay(int day) {
    if (day <= 14) return 'Payment Reminder';
    if (day == 15) return 'Payment Due Today';
    if (day == 25) return 'Urgent: Payment Overdue';
    if (day == 30) return 'Final Overdue Notice';
    return 'Payment Overdue';
  }

  String _getBodyForDay(int day, String member, String group, double amount) {
    final amtStr = amount.toStringAsFixed(0);
    final now = DateTime.now();
    const monthNamesEn = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];
    final monthYear = '${monthNamesEn[now.month - 1]} ${now.year}';
    if (day <= 14) {
      return 'Hi $member, a reminder to pay ₹$amtStr for $group ($monthYear).';
    }
    if (day == 15) {
      return 'Hi $member, your payment of ₹$amtStr for $group is due today ($monthYear).';
    }
    return 'Hi $member, your payment of ₹$amtStr for $group is overdue. Please pay ASAP ($monthYear).';
  }
}

final notificationSchedulerProvider = Provider<NotificationScheduler>((ref) {
  return NotificationScheduler(NotificationService().plugin);
});
