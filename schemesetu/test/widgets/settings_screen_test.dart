import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:chit_fund_app/providers/auth_provider.dart';
import 'package:chit_fund_app/providers/settings_provider.dart';
import 'package:chit_fund_app/screens/settings/settings_screen.dart';
import 'package:chit_fund_app/localization/app_localizations.dart';

class MockAuthNotifier extends AuthNotifier {
  @override
  AuthState build() {
    return const AuthState();
  }
}

class MockSettingsNotifier extends SettingsNotifier {
  @override
  SettingsState build() {
    return const SettingsState();
  }
}

Widget buildSettingsScreen() {
  return ProviderScope(
    overrides: [
      settingsProvider.overrideWith(() => MockSettingsNotifier()),
      authProvider.overrideWith(() => MockAuthNotifier()),
    ],
    child: const MaterialApp(
      localizationsDelegates: [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: [
        Locale('en'),
        Locale('ur'),
        Locale('te'),
        Locale('hi'),
      ],
      home: SettingsScreen(),
    ),
  );
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('renders Google Translate icon and language buttons',
      (tester) async {
    await tester.pumpWidget(buildSettingsScreen());
    await tester.pumpAndSettle();

    expect(find.byIcon(Icons.translate), findsOneWidget);
    expect(find.text('English'), findsOneWidget);
    expect(find.text('اردو'), findsOneWidget);
    expect(find.text('తెలుగు'), findsOneWidget);
    expect(find.text('हिन्दी'), findsOneWidget);
  });

  testWidgets('displays backup and restore buttons', (tester) async {
    await tester.pumpWidget(buildSettingsScreen());
    await tester.pumpAndSettle();

    // Scroll down to ensure backup buttons are built in the lazy ListView
    final listFinder = find.byType(ListView);
    await tester.drag(listFinder, const Offset(0, -2000));
    await tester.pumpAndSettle();

    expect(find.text('Export Database (.sqlite)', skipOffstage: false),
        findsOneWidget);
    expect(find.text('Import Database (.sqlite)', skipOffstage: false),
        findsOneWidget);
  });
}
