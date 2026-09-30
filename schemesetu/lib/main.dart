import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:io';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:collection/collection.dart';

import 'providers/settings_provider.dart';
import 'providers/auth_provider.dart';
import 'localization/app_localizations.dart';
import 'utils/theme.dart';
import 'services/notification_service.dart';
import 'core/services/notification_scheduler.dart';

import 'screens/splash/splash_screen.dart';
import 'screens/auth/pin_screen.dart';
import 'core/services/migration_service.dart';
import 'services/backup_service.dart';
import 'data/providers/db_provider.dart';
import 'core/observers/app_provider_observer.dart';
import 'utils/safe_path_provider.dart';

import 'services/encryption_service.dart';

final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

Future<void> main() async {
  setupSafePathProvider();
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize EncryptionService
  await EncryptionService().init();

  final sharedPrefs = await SharedPreferences.getInstance();

  // Create provider container for early initialization
  final container = ProviderContainer(
    observers: [AppProviderObserver()],
    overrides: [
      sharedPreferencesProvider.overrideWithValue(sharedPrefs),
    ],
  );
  final migrationService = container.read(migrationServiceProvider);
  await migrationService.migrateFromLegacy();

  // Perform background auto backup
  final db = container.read(appDatabaseProvider);
  await BackupService().performAutoBackup(db);

  // Initialize notifications gracefully
  try {
    await NotificationService().init();
    // Schedule payment reminders for all pending members
    _scheduleAllPendingReminders(container);
  } catch (e) {
    debugPrint('⚠️ Notification init error: $e');
  }

  try {
    // Force portrait orientation
    await SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
    ]);

    // Enable edge-to-edge
    SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
    ));
  } catch (e) {
    debugPrint('⚠️ SystemChrome init error: $e');
  }

  runApp(
    UncontrolledProviderScope(
      container: container,
      child: const SanghaSetuApp(),
    ),
  );
}

/// Schedule payment due notifications for all pending members at app startup.
/// Runs asynchronously so it doesn't block the UI.
void _scheduleAllPendingReminders(ProviderContainer container) async {
  if (!Platform.isAndroid && !Platform.isIOS) {
    debugPrint('ℹ️ Notification reminders skipped on non-mobile platform');
    return;
  }
  try {
    final scheduler = container.read(notificationSchedulerProvider);
    final dao = container.read(appDaoProvider);
    final now = DateTime.now();

    final allGroups = await dao.getAllGroups();
    final allMembers = await dao.getAllMembers();

    for (final group in allGroups) {
      if (group.status != 'Active') continue;

      final memberships = await dao.getActiveMembershipsForGroup(group.id);
      final rounds = await dao.getRoundsForGroup(group.id);
      final currentRound = rounds.firstWhereOrNull(
        (r) => r.month == now.month && r.year == now.year,
      );

      for (final ms in memberships) {
        final member = allMembers.firstWhereOrNull(
          (m) => m.id == ms.memberId,
        );
        if (member == null) continue;

        // Check if member has pending payment for this month
        double collected = 0.0;
        if (currentRound != null) {
          final payments = await dao.getPaymentsForMembership(ms.id);
          for (final p in payments) {
            if (p.roundId == currentRound.id && p.status == 'Completed') {
              collected += p.amount;
            }
          }
        }

        final expected = group.monthlyContribution * ms.installmentsCount;
        if (collected < expected) {
          await scheduler.scheduleMonthlyReminders(
            memberId: member.id,
            memberName: member.name,
            groupName: group.name,
            amount: expected - collected,
          );
        }
      }
    }
    debugPrint('✅ Payment reminders scheduled successfully');
  } catch (e) {
    debugPrint('⚠️ Failed to schedule reminders: $e');
  }
}

class SanghaSetuApp extends ConsumerWidget {
  const SanghaSetuApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final settings = ref.watch(settingsProvider);

    return MaterialApp(
      navigatorKey: navigatorKey,
      title: 'SanghaSetu',
      debugShowCheckedModeBanner: false,

      // Theme
      theme: AppTheme.lightTheme(settings.customThemeColor),
      darkTheme: AppTheme.darkTheme(settings.customThemeColor),
      themeMode: settings.themeMode,

      // Localization
      locale: settings.locale,
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [
        Locale('en'),
        Locale('ur'),
        Locale('te'),
        Locale('hi'),
      ],

      // Always start at Splash — it handles routing
      home: const SplashScreen(),
      builder: (context, child) {
        return InactivityLockWrapper(child: child ?? const SizedBox.shrink());
      },
    );
  }
}

class InactivityLockWrapper extends ConsumerStatefulWidget {
  final Widget child;
  const InactivityLockWrapper({super.key, required this.child});

  @override
  ConsumerState<InactivityLockWrapper> createState() =>
      _InactivityLockWrapperState();
}

class _InactivityLockWrapperState extends ConsumerState<InactivityLockWrapper>
    with WidgetsBindingObserver {
  DateTime? _pausedTime;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    final settings = ref.read(settingsProvider);
    final prefs = ref.read(sharedPreferencesProvider);
    final isLoggedIn = prefs.getBool('is_logged_in') ?? false;
    final isPinVerified = ref.read(authProvider).isPinVerified;

    if (state == AppLifecycleState.paused ||
        state == AppLifecycleState.inactive) {
      _pausedTime = DateTime.now();
    } else if (state == AppLifecycleState.resumed) {
      if (_pausedTime != null && isLoggedIn && isPinVerified) {
        final secondsPaused = DateTime.now().difference(_pausedTime!).inSeconds;
        if (secondsPaused >= settings.inactivityLockTimeout) {
          ref.read(authProvider.notifier).lockSession();
          navigatorKey.currentState?.pushAndRemoveUntil(
            MaterialPageRoute(builder: (_) => const PinScreen()),
            (route) => false,
          );
        }
      }
      _pausedTime = null;
    }
  }

  @override
  Widget build(BuildContext context) {
    return widget.child;
  }
}
