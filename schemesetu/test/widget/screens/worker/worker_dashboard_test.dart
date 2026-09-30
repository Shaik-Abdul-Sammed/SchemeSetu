import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:drift/drift.dart' as drift;
import 'package:chit_fund_app/providers/shg_providers.dart';
import 'package:chit_fund_app/data/providers/db_provider.dart';
import 'package:chit_fund_app/data/local/app_database.dart';
import 'package:shimmer/shimmer.dart';
import 'package:chit_fund_app/screens/worker/worker_dashboard.dart';

void main() {
  group('WorkerDashboardScreen Widget Tests', () {
    late AppDatabase db;
    late int testMemberId;
    late int testGroupId;

    setUp(() async {
      // Set up in-memory SQLite database
      db = AppDatabase.inMemory();

      // Seed test group
      testGroupId = await db.sHGDao.insertGroup(
        const SHGGroupsCompanion(
          name: drift.Value('Pragati SHG'),
        ),
      );

      // Seed test member
      testMemberId = await db.sHGDao.db.into(db.sHGDao.db.members).insert(
            const MembersCompanion(
              name: drift.Value('Lakshmi Devi'),
              phone: drift.Value('9876543210'),
              pin: drift.Value('1234'),
            ),
          );

      // Link member to group
      await db.sHGDao.addMemberToGroup(
        SHGMembershipsCompanion(
          memberId: drift.Value(testMemberId),
          groupId: drift.Value(testGroupId),
        ),
      );

      // Set SharedPreferences login session parameters
      SharedPreferences.setMockInitialValues({
        'member_is_logged_in': true,
        'member_logged_in_phone': '9876543210',
        'member_logged_in_id': testMemberId,
        'member_logged_in_group_id': testGroupId,
      });
    });

    tearDown(() async {
      await db.close();
    });

    testWidgets('renders screen structure correctly after loading',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            appDatabaseProvider.overrideWithValue(db),
            shgDaoProvider.overrideWithValue(db.sHGDao),
          ],
          child: const MaterialApp(
            home: WorkerDashboardScreen(),
          ),
        ),
      );

      // Verify shimmer state initially
      expect(find.byType(Shimmer), findsOneWidget);

      // Let state transition beyond simulated future delay
      await tester.pump(const Duration(seconds: 2));

      // Verify member details and group details render correctly
      expect(find.text('Lakshmi Devi'), findsOneWidget);
      expect(find.text('Pragati SHG'), findsOneWidget);

      // Verify key widgets are on screen
      expect(find.text('Savings Goal Tracker'), findsOneWidget);
      expect(find.text('Active Loan Repayments'), findsOneWidget);
      expect(
          find.text(
              'Need Help? Contact leader (సహాయం కోసం లీడర్ సంప్రదించండి)'),
          findsOneWidget);

      // Settle any remaining animation/microtask timers
      await tester.pumpAndSettle();
    });

    testWidgets(
        'tapping savings goal tracker navigates to payment history screen',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            appDatabaseProvider.overrideWithValue(db),
            shgDaoProvider.overrideWithValue(db.sHGDao),
          ],
          child: const MaterialApp(
            home: WorkerDashboardScreen(),
          ),
        ),
      );

      // Wait for loading to finish
      await tester.pump(const Duration(seconds: 2));

      // Tap on the Savings Goal Card
      final goalCard = find.text('Goal: ₹20,000');
      expect(goalCard, findsOneWidget);
      await tester.tap(goalCard);
      await tester.pumpAndSettle();

      // Verify we navigated to Payment History (Ledger) screen
      expect(find.text('Payment Ledger'), findsOneWidget);
    });
  });
}
