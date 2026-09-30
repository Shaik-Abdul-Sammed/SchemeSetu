import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;

class SettingsState {
  final ThemeMode themeMode;
  final Locale locale;
  final bool autoBackup;
  final bool notificationsEnabled;
  final String organizerName;
  final String upiId;
  final String currencySymbol;
  final String customThemeColor;
  final int inactivityLockTimeout;
  final int autoBackupReminderDays;

  const SettingsState({
    this.themeMode = ThemeMode.dark,
    this.locale = const Locale('en'),
    this.autoBackup = false,
    this.notificationsEnabled = true,
    this.organizerName = '',
    this.upiId = '',
    this.currencySymbol = '₹',
    this.customThemeColor = 'teal',
    this.inactivityLockTimeout = 300,
    this.autoBackupReminderDays = 30,
  });

  SettingsState copyWith({
    ThemeMode? themeMode,
    Locale? locale,
    bool? autoBackup,
    bool? notificationsEnabled,
    String? organizerName,
    String? upiId,
    String? currencySymbol,
    String? customThemeColor,
    int? inactivityLockTimeout,
    int? autoBackupReminderDays,
  }) {
    return SettingsState(
      themeMode: themeMode ?? this.themeMode,
      locale: locale ?? this.locale,
      autoBackup: autoBackup ?? this.autoBackup,
      notificationsEnabled: notificationsEnabled ?? this.notificationsEnabled,
      organizerName: organizerName ?? this.organizerName,
      upiId: upiId ?? this.upiId,
      currencySymbol: currencySymbol ?? this.currencySymbol,
      customThemeColor: customThemeColor ?? this.customThemeColor,
      inactivityLockTimeout:
          inactivityLockTimeout ?? this.inactivityLockTimeout,
      autoBackupReminderDays:
          autoBackupReminderDays ?? this.autoBackupReminderDays,
    );
  }
}

final sharedPreferencesProvider = Provider<SharedPreferences>((ref) {
  throw UnimplementedError();
});

class SettingsNotifier extends Notifier<SettingsState> {
  @override
  SettingsState build() {
    final prefs = ref.watch(sharedPreferencesProvider);

    final themeModeStr = prefs.getString('theme_mode');
    ThemeMode initialThemeMode;
    if (themeModeStr != null) {
      if (themeModeStr == 'light') {
        initialThemeMode = ThemeMode.light;
      } else if (themeModeStr == 'dark') {
        initialThemeMode = ThemeMode.dark;
      } else {
        initialThemeMode = ThemeMode.system;
      }
    } else {
      final isDark = prefs.getBool('is_dark_theme') ?? true;
      initialThemeMode = isDark ? ThemeMode.dark : ThemeMode.light;
    }

    final langCode = prefs.getString('language_code') ?? 'en';
    final autoBackup = prefs.getBool('auto_backup') ?? false;
    final notificationsEnabled = prefs.getBool('notifications_enabled') ?? true;
    final organizerName = prefs.getString('organizer_name') ?? '';
    final upiId = prefs.getString('upi_id') ?? '';
    final currencySymbol = prefs.getString('currency_symbol') ?? '₹';
    final customThemeColor = prefs.getString('custom_theme_color') ?? 'teal';
    final inactivityLockTimeout =
        prefs.getInt('inactivity_lock_timeout') ?? 300;
    final autoBackupReminderDays =
        prefs.getInt('auto_backup_reminder_days') ?? 30;

    return SettingsState(
      themeMode: initialThemeMode,
      locale: Locale(langCode),
      autoBackup: autoBackup,
      notificationsEnabled: notificationsEnabled,
      organizerName: organizerName,
      upiId: upiId,
      currencySymbol: currencySymbol,
      customThemeColor: customThemeColor,
      inactivityLockTimeout: inactivityLockTimeout,
      autoBackupReminderDays: autoBackupReminderDays,
    );
  }

  Future<void> setThemeMode(ThemeMode mode) async {
    final prefs = ref.read(sharedPreferencesProvider);
    state = state.copyWith(themeMode: mode);
    String modeStr = 'system';
    if (mode == ThemeMode.light) modeStr = 'light';
    if (mode == ThemeMode.dark) modeStr = 'dark';
    await prefs.setString('theme_mode', modeStr);
  }

  Future<void> toggleTheme() async {
    final prefs = ref.read(sharedPreferencesProvider);
    final newMode =
        state.themeMode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark;
    state = state.copyWith(themeMode: newMode);
    await prefs.setString(
        'theme_mode', newMode == ThemeMode.dark ? 'dark' : 'light');
    await prefs.setBool('is_dark_theme', newMode == ThemeMode.dark);
  }

  Future<void> setLocale(String languageCode) async {
    if (languageCode == 'ur' ||
        languageCode == 'te' ||
        languageCode == 'en' ||
        languageCode == 'hi') {
      final prefs = ref.read(sharedPreferencesProvider);
      state = state.copyWith(locale: Locale(languageCode));
      await prefs.setString('language_code', languageCode);
    }
  }

  Future<void> toggleAutoBackup() async {
    final prefs = ref.read(sharedPreferencesProvider);
    final newValue = !state.autoBackup;
    state = state.copyWith(autoBackup: newValue);
    await prefs.setBool('auto_backup', newValue);
  }

  Future<void> toggleNotifications() async {
    final prefs = ref.read(sharedPreferencesProvider);
    final newValue = !state.notificationsEnabled;
    state = state.copyWith(notificationsEnabled: newValue);
    await prefs.setBool('notifications_enabled', newValue);
  }

  Future<void> setCurrencySymbol(String symbol) async {
    final prefs = ref.read(sharedPreferencesProvider);
    state = state.copyWith(currencySymbol: symbol);
    await prefs.setString('currency_symbol', symbol);
  }

  Future<void> setCustomThemeColor(String color) async {
    final prefs = ref.read(sharedPreferencesProvider);
    state = state.copyWith(customThemeColor: color);
    await prefs.setString('custom_theme_color', color);
  }

  Future<void> setInactivityLockTimeout(int timeout) async {
    final prefs = ref.read(sharedPreferencesProvider);
    state = state.copyWith(inactivityLockTimeout: timeout);
    await prefs.setInt('inactivity_lock_timeout', timeout);
  }

  Future<void> setAutoBackupReminderDays(int days) async {
    final prefs = ref.read(sharedPreferencesProvider);
    state = state.copyWith(autoBackupReminderDays: days);
    await prefs.setInt('auto_backup_reminder_days', days);
  }

  Future<void> saveOrganizerInfo({String? name, String? upiId}) async {
    final prefs = ref.read(sharedPreferencesProvider);
    var newState = state;
    if (name != null) {
      newState = newState.copyWith(organizerName: name);
      await prefs.setString('organizer_name', name);
    }
    if (upiId != null) {
      newState = newState.copyWith(upiId: upiId);
      await prefs.setString('upi_id', upiId);
    }
    state = newState;
  }

  Future<Map<String, String>?> _fetchLocationData() async {
    try {
      final response = await http
          .get(Uri.parse('https://ipapi.co/json/'))
          .timeout(const Duration(seconds: 4));
      if (response.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(response.body);
        return {
          'country': (data['country_code'] ?? '').toString().toUpperCase(),
          'region': (data['region'] ?? '').toString(),
        };
      }
    } catch (_) {
      try {
        final response = await http
            .get(Uri.parse('http://ip-api.com/json'))
            .timeout(const Duration(seconds: 4));
        if (response.statusCode == 200) {
          final Map<String, dynamic> data = jsonDecode(response.body);
          return {
            'country': (data['countryCode'] ?? '').toString().toUpperCase(),
            'region': (data['regionName'] ?? '').toString(),
          };
        }
      } catch (_) {}
    }
    return null;
  }

  Future<String> detectLanguageFromLocation() async {
    String country = '';
    String region = '';

    final locData = await _fetchLocationData();
    if (locData != null) {
      country = locData['country'] ?? '';
      region = locData['region'] ?? '';
    } else {
      final systemLocale = WidgetsBinding.instance.platformDispatcher.locale;
      country = systemLocale.countryCode?.toUpperCase() ?? '';
      final systemLang = systemLocale.languageCode.toLowerCase();
      if (systemLang == 'ur' || systemLang == 'te' || systemLang == 'hi') {
        return systemLang;
      }
    }

    if (country == 'IN') {
      final regLower = region.toLowerCase();
      if (regLower.contains('telangana') ||
          regLower.contains('andhra') ||
          regLower.contains('ap')) {
        return 'te';
      }
      return 'hi';
    } else if (country == 'PK') {
      return 'ur';
    }
    return 'en';
  }
}

final settingsProvider = NotifierProvider<SettingsNotifier, SettingsState>(() {
  return SettingsNotifier();
});
