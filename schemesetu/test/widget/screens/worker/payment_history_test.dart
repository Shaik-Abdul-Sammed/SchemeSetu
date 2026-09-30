import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:drift/drift.dart' as drift;
import 'package:table_calendar/table_calendar.dart';
import 'package:shimmer/shimmer.dart';
import 'package:chit_fund_app/providers/shg_providers.dart';
import 'package:chit_fund_app/data/providers/db_provider.dart';
import 'package:chit_fund_app/data/local/app_database.dart';
import 'package:chit_fund_app/screens/worker/payment_history.dart';

void main() {
  group('PaymentHistoryScreen Widget Tests', () {
    late AppDatabase db;
    late int testMemberId;
    late int testGroupId;
    late int testMembershipId;

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
      testMembershipId = await db.sHGDao.addMemberToGroup(
        SHGMembershipsCompanion(
          memberId: drift.Value(testMemberId),
          groupId: drift.Value(testGroupId),
        ),
      );

      // Seed some savings deposits
      await db.sHGDao.db.into(db.sHGDao.db.sHGSavings).insert(
        SHGSavingsCompanion(
          membershipId: drift.Value(testMembershipId),
          amount: const drift.Value(500.0),
          date: drift.Value(DateTime(2026, 8, 5)),
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

    testWidgets('renders payment ledger transactions and calendar correctly', (WidgetTester tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            appDatabaseProvider.overrideWithValue(db),
            shgDaoProvider.overrideWithValue(db.sHGDao),
          ],
          child: const MaterialApp(
            home: PaymentHistoryScreen(),
          ),
        ),
      );

      // Verify shimmer state initially
      expect(find.byType(Shimmer), findsOneWidget);

      // Wait for loading to finish and data to render
      await tester.pump(const Duration(seconds: 2));

      // Verify page headers
      expect(find.text('Payment Ledger'), findsOneWidget);

      // Verify table calendar is visible
      expect(find.byType(TableCalendar), findsOneWidget);

      // Verify seeded savings transaction details are on screen
      expect(find.text('Savings Deposit'), findsOneWidget);
      expect(find.text('₹500'), findsOneWidget);

      // Settle any remaining animation/microtask timers
      await tester.pumpAndSettle();
    });

    testWidgets('filtering and passbook print button trigger correctly', (WidgetTester tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            appDatabaseProvider.overrideWithValue(db),
            shgDaoProvider.overrideWithValue(db.sHGDao),
          ],
          child: const MaterialApp(
            home: PaymentHistoryScreen(),
          ),
        ),
      );

      // Wait for loading to finish
      await tester.pump(const Duration(seconds: 2));

      // Verify filter chips exist
      expect(find.text('All'), findsOneWidget);
      expect(find.text('Savings'), findsOneWidget);

      // Tap on PDF passbook button
      final pdfButton = find.byTooltip('Export PDF Passbook');
      expect(pdfButton, findsOneWidget);
      await tester.tap(pdfButton);
      await tester.pumpAndSettle();
    });
  });
}
