import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:chit_fund_app/providers/auth_provider.dart';
import 'package:chit_fund_app/providers/settings_provider.dart';
import 'package:chit_fund_app/screens/auth/login_screen.dart';

/// Mocked AuthNotifier to bypass secure storage during widget tests.
class MockAuthNotifier extends AuthNotifier {
  @override
  AuthState build() {
    return const AuthState();
  }

  @override
  Future<bool> startLocalSession(String phoneNumber) async => true;
}

class MockSettingsNotifier extends SettingsNotifier {
  @override
  SettingsState build() {
    return const SettingsState();
  }
}

Widget buildLoginScreen() {
  return ProviderScope(
    overrides: [
      authProvider.overrideWith(() => MockAuthNotifier()),
      settingsProvider.overrideWith(() => MockSettingsNotifier()),
    ],
    child: const MaterialApp(
      home: LoginScreen(),
    ),
  );
}

void main() {
  group('LoginScreen Widget Tests', () {
    testWidgets('renders phone input field and continue button',
        (tester) async {
      await tester.pumpWidget(buildLoginScreen());
      await tester.pump(const Duration(milliseconds: 100));

      // Verify phone input is present
      expect(find.byType(TextFormField), findsOneWidget);
      // Verify continue button
      expect(find.text('Continue'), findsOneWidget);
    });

    testWidgets('shows validation error when submitting empty form',
        (tester) async {
      await tester.pumpWidget(buildLoginScreen());
      await tester.pump(const Duration(milliseconds: 100));

      // Tap Continue without entering any phone
      await tester.tap(find.text('Continue'));
      await tester.pump();

      expect(find.text('Phone number is required'), findsOneWidget);
    });

    testWidgets('shows validation error for phone number less than 10 digits',
        (tester) async {
      await tester.pumpWidget(buildLoginScreen());
      await tester.pump(const Duration(milliseconds: 100));

      // Enter only 9 digits
      await tester.enterText(find.byType(TextFormField), '987654321');
      await tester.tap(find.text('Continue'));
      await tester.pump();

      expect(find.text('Enter a valid 10-digit mobile number'), findsOneWidget);
    });

    testWidgets('no validation error for valid 10-digit number',
        (tester) async {
      await tester.pumpWidget(buildLoginScreen());
      await tester.pump(const Duration(milliseconds: 100));

      // Enter exactly 10 digits
      await tester.enterText(find.byType(TextFormField), '9876543210');
      await tester.pump();

      // Don't tap — just verify no error yet
      expect(find.text('Phone number is required'), findsNothing);
      expect(find.text('Enter a valid 10-digit mobile number'), findsNothing);
    });

    testWidgets('displays app title text', (tester) async {
      await tester.pumpWidget(buildLoginScreen());
      await tester.pump(const Duration(milliseconds: 100));

      expect(find.text('Halal Ka Paigam'), findsOneWidget);
    });

    testWidgets('displays Enter your mobile number subtitle', (tester) async {
      await tester.pumpWidget(buildLoginScreen());
      await tester.pump(const Duration(milliseconds: 100));

      expect(find.text('Enter your mobile number to secure this app'),
          findsOneWidget);
    });

    testWidgets('displays terms of service text', (tester) async {
      await tester.pumpWidget(buildLoginScreen());
      await tester.pump(const Duration(milliseconds: 100));

      expect(find.textContaining('Terms of Service'), findsOneWidget);
    });

    testWidgets('Mobile Number label is visible inside card', (tester) async {
      await tester.pumpWidget(buildLoginScreen());
      await tester.pump(const Duration(milliseconds: 100));

      expect(find.text('Mobile Number'), findsOneWidget);
    });
  });
}
