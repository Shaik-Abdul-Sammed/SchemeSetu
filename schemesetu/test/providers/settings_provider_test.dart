import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:chit_fund_app/providers/settings_provider.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('SettingsNotifier', () {
    test('loads default values when preferences are empty', () async {
      SharedPreferences.setMockInitialValues({});
      final prefs = await SharedPreferences.getInstance();
      final container = ProviderContainer(
        overrides: [
          sharedPreferencesProvider.overrideWithValue(prefs),
        ],
      );

      final state = container.read(settingsProvider);
      expect(state.themeMode, ThemeMode.dark);
      expect(state.locale.languageCode, 'en');
    });

    test('toggleTheme switches theme mode and persists preference', () async {
      SharedPreferences.setMockInitialValues({
        'is_dark_theme': true,
        'language_code': 'en',
      });
      final prefs = await SharedPreferences.getInstance();
      final container = ProviderContainer(
        overrides: [
          sharedPreferencesProvider.overrideWithValue(prefs),
        ],
      );

      final notifier = container.read(settingsProvider.notifier);
      await notifier.toggleTheme();

      final state = container.read(settingsProvider);
      expect(state.themeMode, ThemeMode.light);

      expect(prefs.getBool('is_dark_theme'), isFalse);
    });

    test('setLocale updates supported language and persists it', () async {
      SharedPreferences.setMockInitialValues({
        'is_dark_theme': true,
        'language_code': 'en',
      });
      final prefs = await SharedPreferences.getInstance();
      final container = ProviderContainer(
        overrides: [
          sharedPreferencesProvider.overrideWithValue(prefs),
        ],
      );

      final notifier = container.read(settingsProvider.notifier);
      await notifier.setLocale('ur');

      expect(container.read(settingsProvider).locale.languageCode, 'ur');

      await notifier.setLocale('hi');
      expect(container.read(settingsProvider).locale.languageCode, 'hi');

      expect(prefs.getString('language_code'), 'hi');
    });

    test('setLocale ignores unsupported locales', () async {
      SharedPreferences.setMockInitialValues({
        'is_dark_theme': true,
        'language_code': 'en',
      });
      final prefs = await SharedPreferences.getInstance();
      final container = ProviderContainer(
        overrides: [
          sharedPreferencesProvider.overrideWithValue(prefs),
        ],
      );

      final notifier = container.read(settingsProvider.notifier);
      await notifier.setLocale('fr'); // Unsupported

      expect(container.read(settingsProvider).locale.languageCode, 'en');
    });
  });
}
