import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:chit_fund_app/data/local/app_database.dart';
import 'package:chit_fund_app/data/providers/db_provider.dart';
import 'package:chit_fund_app/providers/settings_provider.dart';
import 'package:chit_fund_app/screens/group/group_screen.dart';
import 'package:chit_fund_app/localization/app_localizations.dart';
import 'package:shared_preferences/shared_preferences.dart';

class MockSettingsNotifier extends SettingsNotifier {
  @override
  SettingsState build() {
    return const SettingsState();
  }
}

Widget createGroupScreen(AppDatabase db) {
  return ProviderScope(
    overrides: [
      appDatabaseProvider.overrideWithValue(db),
      settingsProvider.overrideWith(() => MockSettingsNotifier()),
      dbUpdatesProvider.overrideWith((ref) => Stream.value(0)),
    ],
    child: const MaterialApp(
      localizationsDelegates: [
        AppLocalizations.delegate,
      ],
      supportedLocales: [
        Locale('en', ''),
      ],
      home: GroupScreen(),
    ),
  );
}

void main() {
  late AppDatabase db;

  setUp(() async {
    SharedPreferences.setMockInitialValues({});
    db = AppDatabase.inMemory();
  });

  tearDown(() async {
    await db.close();
  });

  testWidgets('GroupScreen renders empty state initially',
      (WidgetTester tester) async {
    await tester.pumpWidget(createGroupScreen(db));
    await tester.pumpAndSettle();

    expect(find.text('No groups configured yet.'), findsOneWidget);
    expect(find.text('Create Your First Group'), findsOneWidget);
    await tester.pumpWidget(Container());
    await tester.pump(Duration.zero);
  });

  testWidgets('GroupScreen can open bottom sheet', (WidgetTester tester) async {
    await tester.pumpWidget(createGroupScreen(db));
    await tester.pumpAndSettle();

    await tester.tap(find.byType(FloatingActionButton));
    await tester.pumpAndSettle();

    expect(find.text('Add Group'), findsOneWidget);
    expect(find.text('Group Name'), findsOneWidget);
    await tester.pumpWidget(Container());
    await tester.pump(Duration.zero);
  });

  testWidgets('GroupScreen can create a new group',
      (WidgetTester tester) async {
    await tester.pumpWidget(createGroupScreen(db));
    await tester.pumpAndSettle();

    await tester.tap(find.byType(FloatingActionButton));
    await tester.pumpAndSettle();

    await tester.enterText(
        find.widgetWithText(TextFormField, 'Group Name'), 'Test Group');
    await tester.enterText(
        find.widgetWithText(TextFormField, 'Monthly Installment (₹)'), '5000');
    await tester.enterText(
        find.widgetWithText(TextFormField, 'Total Slots / Installments'), '10');

    final createButton = find.widgetWithText(ElevatedButton, 'Create Group');
    await tester.ensureVisible(createButton);
    await tester.pumpAndSettle();
    await tester.tap(createButton, warnIfMissed: false);
    await tester.pumpAndSettle();

    // Verify it appears in the list
    expect(find.text('Test Group'), findsOneWidget);
    await tester.pumpWidget(Container());
    await tester.pump(Duration.zero);
  });
}
