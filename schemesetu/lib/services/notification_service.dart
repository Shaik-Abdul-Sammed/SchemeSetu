import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter/foundation.dart';

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final FlutterLocalNotificationsPlugin _plugin =
      FlutterLocalNotificationsPlugin();

  FlutterLocalNotificationsPlugin get plugin => _plugin;

  static const String _channelId = 'hkp_main_channel';
  static const String _channelName = 'SanghaSetu';
  static const String _channelDescription =
      'Payment reminders and announcements';

  Future<void> init() async {
    const androidSettings =
        AndroidInitializationSettings('@mipmap/ic_launcher');
    final linuxSettings = LinuxInitializationSettings(
      defaultActionName: 'Open notification',
      defaultIcon: ThemeLinuxIcon('dialog-information'),
    );
    final initSettings = InitializationSettings(
      android: androidSettings,
      linux: linuxSettings,
    );

    await _plugin.initialize(
      settings: initSettings,
      onDidReceiveNotificationResponse: (NotificationResponse response) {
        debugPrint('Notification tapped: ${response.payload}');
      },
    );

    try {
      final androidImpl = _plugin.resolvePlatformSpecificImplementation<
          AndroidFlutterLocalNotificationsPlugin>();
      await androidImpl
          ?.createNotificationChannel(const AndroidNotificationChannel(
        _channelId,
        _channelName,
        description: _channelDescription,
        importance: Importance.high,
      ));
      await requestPermission();
    } catch (e) {
      debugPrint('Failed to initialize Android notification channel: $e');
    }
  }

  Future<void> requestPermission() async {
    try {
      await _plugin
          .resolvePlatformSpecificImplementation<
              AndroidFlutterLocalNotificationsPlugin>()
          ?.requestNotificationsPermission();
    } catch (e) {
      debugPrint('Could not request notification permission: $e');
    }
  }

  Future<void> showNotification({
    required int id,
    required String title,
    required String body,
    String? payload,
  }) async {
    try {
      final androidDetails = const AndroidNotificationDetails(
        _channelId,
        _channelName,
        channelDescription: _channelDescription,
        importance: Importance.max,
        priority: Priority.high,
        showWhen: true,
      );
      final linuxDetails = LinuxNotificationDetails(
        defaultActionName: 'Open notification',
        icon: ThemeLinuxIcon('dialog-information'),
      );
      final details = NotificationDetails(
        android: androidDetails,
        linux: linuxDetails,
      );
      // flutter_local_notifications v22: show() uses named params
      await _plugin.show(
        id: id,
        title: title,
        body: body,
        notificationDetails: details,
        payload: payload,
      );
    } catch (e) {
      debugPrint('Could not show notification: $e');
    }
  }

  Future<void> showPaymentDueNotification({
    required String memberName,
    required String groupName,
    required double amount,
  }) async {
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
    await showNotification(
      id: memberName.hashCode,
      title: '💰 Payment Due — $groupName',
      body:
          '$memberName has an outstanding payment of ₹${amount.toStringAsFixed(0)} for $monthYear',
      payload: 'payment_due',
    );
  }

  Future<void> showSHGMeetingReminder({
    required String groupName,
    required DateTime meetingDate,
  }) async {
    await showNotification(
      id: groupName.hashCode + 1,
      title: '🗓️ Upcoming Meeting — $groupName',
      body:
          'A meeting is scheduled for ${meetingDate.day}/${meetingDate.month}/${meetingDate.year}.',
      payload: 'shg_meeting',
    );
  }

  Future<void> showSHGLoanRepaymentReminder({
    required String memberName,
    required String groupName,
    required double amount,
  }) async {
    await showNotification(
      id: memberName.hashCode + 2,
      title: '💸 Loan Repayment Due — $groupName',
      body:
          '$memberName has a loan repayment of ₹${amount.toStringAsFixed(0)} due.',
      payload: 'shg_loan',
    );
  }

  Future<void> cancelAll() async {
    await _plugin.cancelAll();
  }
}
