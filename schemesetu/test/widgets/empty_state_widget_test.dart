import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:chit_fund_app/widgets/empty_state_widgets.dart';
import 'package:chit_fund_app/providers/settings_provider.dart';

class MockSettingsNotifier extends SettingsNotifier {
  @override
  SettingsState build() {
    return const SettingsState();
  }
}

void main() {
  testWidgets('EmptyStateWidget renders title, description and button',
      (WidgetTester tester) async {
    bool buttonPressed = false;

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          settingsProvider.overrideWith(() => MockSettingsNotifier()),
        ],
        child: MaterialApp(
          home: Scaffold(
            body: EmptyStateWidget(
              icon: Icons.person_search,
              title: 'No Members',
              description: 'You have no members yet.',
              actionButtonLabel: 'Add Now',
              onActionPressed: () {
                buttonPressed = true;
              },
            ),
          ),
        ),
      ),
    );

    expect(find.byIcon(Icons.person_search), findsOneWidget);
    expect(find.text('No Members'), findsOneWidget);
    expect(find.text('You have no members yet.'), findsOneWidget);
    expect(find.text('Add Now'), findsOneWidget);

    await tester.tap(find.text('Add Now'));
    await tester.pump();

    expect(buttonPressed, isTrue);
  });

  testWidgets(
      'EmptyStateWidget renders without button if onActionPressed is null',
      (WidgetTester tester) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          settingsProvider.overrideWith(() => MockSettingsNotifier()),
        ],
        child: const MaterialApp(
          home: Scaffold(
            body: EmptyStateWidget(
              icon: Icons.group,
              title: 'No Groups',
              description: 'Nothing to see here.',
              onActionPressed: null,
            ),
          ),
        ),
      ),
    );

    expect(find.byIcon(Icons.group), findsOneWidget);
    expect(find.text('No Groups'), findsOneWidget);
    expect(find.text('Nothing to see here.'), findsOneWidget);
    expect(find.byType(ElevatedButton), findsNothing);
  });
}
