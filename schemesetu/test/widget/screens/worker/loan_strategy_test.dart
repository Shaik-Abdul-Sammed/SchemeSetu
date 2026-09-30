import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:drift/drift.dart' as drift;
import 'package:chit_fund_app/providers/shg_providers.dart';
import 'package:chit_fund_app/data/providers/db_provider.dart';
import 'package:chit_fund_app/data/local/app_database.dart';
import 'package:chit_fund_app/screens/worker/loan_strategy.dart';

void main() {
  group('LoanStrategyScreen Widget Tests', () {
    late AppDatabase db;
    late int testMemberId;
    late int testGroupId;

    setUp(() async {
      db = AppDatabase.inMemory();

      // Seed group
      testGroupId = await db.sHGDao.insertGroup(
        const SHGGroupsCompanion(
          name: drift.Value('Sri Lakshmi SHG'),
        ),
      );

      // Seed member
      testMemberId = await db.sHGDao.db.into(db.sHGDao.db.members).insert(
            const MembersCompanion(
              name: drift.Value('Rajamma'),
              phone: drift.Value('9010203040'),
              pin: drift.Value('1122'),
            ),
          );

      // Link member to group
      await db.sHGDao.addMemberToGroup(
        SHGMembershipsCompanion(
          memberId: drift.Value(testMemberId),
          groupId: drift.Value(testGroupId),
        ),
      );

      SharedPreferences.setMockInitialValues({
        'member_is_logged_in': true,
        'member_logged_in_phone': '9010203040',
        'member_logged_in_id': testMemberId,
        'member_logged_in_group_id': testGroupId,
      });
    });

    tearDown(() async {
      await db.close();
    });

    testWidgets('renders calculator and recalculates on interaction',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            appDatabaseProvider.overrideWithValue(db),
            shgDaoProvider.overrideWithValue(db.sHGDao),
          ],
          child: const MaterialApp(
            home: LoanStrategyScreen(),
          ),
        ),
      );

      // Verify rendering of title and initial parameters
      expect(find.text('Loan Strategy & Calculator'), findsOneWidget);
      expect(find.text('Desired Loan Amount: ₹10000'), findsOneWidget);

      // Settle initial load animations
      await tester.pumpAndSettle();

      // Tap on Flat/Simple interest toggle switch
      final simpleToggle = find.byType(Switch);
      expect(simpleToggle, findsOneWidget);
      await tester.ensureVisible(simpleToggle);
      await tester.tap(simpleToggle);
      await tester.pumpAndSettle();

      // Verify calculation updates (Flat rate Simple interest EMI for 10000 at 12% for 12 months is ₹933.33)
      expect(find.text('₹933.33'), findsOneWidget);
    });

    testWidgets('submitting loan request saves pending loan to database',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            appDatabaseProvider.overrideWithValue(db),
            shgDaoProvider.overrideWithValue(db.sHGDao),
          ],
          child: const MaterialApp(
            home: LoanStrategyScreen(),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Find and tap the submit button
      final submitButton = find.text('Submit Loan Request (రుణ దరఖాస్తు)');
      expect(submitButton, findsOneWidget);
      await tester.ensureVisible(submitButton);
      await tester.tap(submitButton);
      await tester.pumpAndSettle();

      // Verify pending request is written to the database
      final loans = await db.sHGDao.db.select(db.sHGDao.db.sHGLoans).get();
      expect(loans.length, 1);
      expect(loans.first.status, 'Pending');
      expect(double.parse(loans.first.principalAmount), 10000.0);
    });
  });
}
