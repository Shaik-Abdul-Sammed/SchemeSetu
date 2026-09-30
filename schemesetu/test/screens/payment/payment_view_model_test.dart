import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:drift/drift.dart' as drift;
import 'package:chit_fund_app/data/local/app_database.dart';
import 'package:chit_fund_app/data/providers/db_provider.dart';
import 'package:chit_fund_app/screens/payment/payment_view_model.dart';

void main() {
  late AppDatabase db;

  setUp(() async {
    db = AppDatabase.inMemory();
  });

  tearDown(() async {
    await db.close();
  });

  group('PaymentViewModel Calculations', () {
    test(
        'Calculates expected amount correctly based on multiple slots (installmentsCount)',
        () async {
      final container = ProviderContainer(
        overrides: [
          appDatabaseProvider.overrideWithValue(db),
          dbUpdatesProvider.overrideWith((ref) => Stream.value(0)),
        ],
      );

      final dao = container.read(appDaoProvider);

      // 1. Create a group with ₹10000 monthly contribution
      final groupId = await dao.insertGroup(GroupsCompanion.insert(
        name: 'Test Group',
        chitValue: 100000.0,
        totalMonths: 10,
        monthlyContribution: 10000.0,
        startDate: DateTime.now(),
      ));

      // 2. Add two members
      final member1Id = await dao.insertMember(MembersCompanion.insert(
        name: 'Member 1',
        phone: '1111111111',
      ));

      final member2Id = await dao.insertMember(MembersCompanion.insert(
        name: 'Member 2',
        phone: '2222222222',
      ));

      // 3. Create memberships (Member 1 gets 3 slots, Member 2 gets 1 slot)
      await dao.insertMembership(MembershipsCompanion.insert(
        memberId: member1Id,
        groupId: groupId,
        installmentsCount: const drift.Value(3),
      ));

      await dao.insertMembership(MembershipsCompanion.insert(
        memberId: member2Id,
        groupId: groupId,
        installmentsCount: const drift.Value(1),
      ));

      // Keep provider alive
      final sub = container.listen(paymentProvider, (_, __) {});
      final notifier = container.read(paymentProvider.notifier);
      await Future.delayed(
          const Duration(milliseconds: 100)); // allow async build
      final state = await notifier.future;

      // Group has 4 slots total (3 + 1)
      // Member 1 (3 slots): expected = 30000
      // Member 2 (1 slot): expected = 10000
      // Total expected = 40000

      expect(state.totalExpected, 40000.0);

      final member1PaymentInfo =
          state.memberPayments.firstWhere((m) => m.member.id == member1Id);
      expect(member1PaymentInfo.expectedAmount, 30000.0);

      final member2PaymentInfo =
          state.memberPayments.firstWhere((m) => m.member.id == member2Id);
      expect(member2PaymentInfo.expectedAmount, 10000.0);

      sub.close();
      container.dispose();
    });

    test('Calculates dividend correctly per slot, not per member', () async {
      final container = ProviderContainer(
        overrides: [
          appDatabaseProvider.overrideWithValue(db),
          dbUpdatesProvider.overrideWith((ref) => Stream.value(0)),
        ],
      );

      final dao = container.read(appDaoProvider);

      // 1. Create a group with ₹10000 monthly contribution
      final month = DateTime.now();
      final groupId = await dao.insertGroup(GroupsCompanion.insert(
        name: 'Test Group 2',
        chitValue: 100000.0,
        totalMonths: 10,
        monthlyContribution: 10000.0,
        startDate: month,
      ));

      // 2. Add two members
      final member1Id = await dao.insertMember(MembersCompanion.insert(
        name: 'Member 1',
        phone: '1111111111',
      ));

      final member2Id = await dao.insertMember(MembersCompanion.insert(
        name: 'Member 2',
        phone: '2222222222',
      ));

      // 3. Create memberships (Member 1 gets 3 slots, Member 2 gets 1 slot)
      await dao.insertMembership(MembershipsCompanion.insert(
        memberId: member1Id,
        groupId: groupId,
        installmentsCount: const drift.Value(3),
      ));

      await dao.insertMembership(MembershipsCompanion.insert(
        memberId: member2Id,
        groupId: groupId,
        installmentsCount: const drift.Value(1),
      ));

      // 4. Create a round with a dividend (e.g. ₹4000 total dividend)
      await dao.insertRound(RoundsCompanion.insert(
        groupId: groupId,
        roundNumber: 1,
        month: month.month,
        year: month.year,
        dividendDistributed:
            const drift.Value(4000.0), // 4000 / 4 slots = 1000 per slot
      ));

      // Monthly per slot is 10000 - 1000 = 9000

      // Read state and keep alive
      final sub = container.listen(paymentProvider, (_, __) {});
      final notifier = container.read(paymentProvider.notifier);
      await Future.delayed(
          const Duration(milliseconds: 100)); // allow async build

      // We want to force it to load for this month and group
      await notifier.changeGroup(groupId);
      await notifier.changeMonth(month);

      final state = await notifier.future;

      // Member 1 (3 slots): expected = 3 * 9000 = 27000
      // Member 2 (1 slot): expected = 1 * 9000 = 9000
      // Total expected = 36000

      expect(state.totalExpected, 36000.0);

      final member1PaymentInfo =
          state.memberPayments.firstWhere((m) => m.member.id == member1Id);
      expect(member1PaymentInfo.expectedAmount, 27000.0);

      final member2PaymentInfo =
          state.memberPayments.firstWhere((m) => m.member.id == member2Id);
      expect(member2PaymentInfo.expectedAmount, 9000.0);

      sub.close();
      container.dispose();
    });
  });
}
