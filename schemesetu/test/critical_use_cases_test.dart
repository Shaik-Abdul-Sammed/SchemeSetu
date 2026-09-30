import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:drift/drift.dart' as drift;
import 'package:chit_fund_app/data/local/app_database.dart';
import 'package:chit_fund_app/data/providers/db_provider.dart';
import 'package:chit_fund_app/screens/group/group_detail_view_model.dart';
import 'package:chit_fund_app/screens/winner/winner_view_model.dart';
import 'package:chit_fund_app/providers/settings_provider.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  late AppDatabase db;

  setUp(() async {
    SharedPreferences.setMockInitialValues({});
    db = AppDatabase.inMemory();
  });

  tearDown(() async {
    await db.close();
  });

  group('Critical Use Cases Tests', () {
    test('membership slot transfer notes installments in past payment remarks',
        () async {
      final container = ProviderContainer(
        overrides: [
          appDatabaseProvider.overrideWithValue(db),
        ],
      );

      final dao = container.read(appDaoProvider);

      // 1. Create a group
      final groupId = await dao.insertGroup(GroupsCompanion.insert(
        name: 'Transfer Test Group',
        chitValue: 50000.0,
        totalMonths: 10,
        monthlyContribution: 5000.0,
        startDate: DateTime.now(),
      ));

      // 2. Add two members
      final oldMemberId = await dao.insertMember(MembersCompanion.insert(
        name: 'Old Member',
        phone: '1234567890',
      ));

      final newMemberId = await dao.insertMember(MembersCompanion.insert(
        name: 'New Member',
        phone: '0987654321',
      ));

      // 3. Create membership for old member
      final membershipId =
          await dao.insertMembership(MembershipsCompanion.insert(
        memberId: oldMemberId,
        groupId: groupId,
      ));

      // 4. Record a round and payment for old member
      final roundId = await dao.insertRound(RoundsCompanion.insert(
        groupId: groupId,
        roundNumber: 1,
        month: DateTime.now().month,
        year: DateTime.now().year,
      ));

      await dao.insertPayment(PaymentsCompanion.insert(
        membershipId: membershipId,
        roundId: roundId,
        amount: 5000.0,
        paymentMode: 'Cash',
        status: const drift.Value('Completed'),
      ));

      // 5. Perform the transfer of membership to new member
      await container.read(groupDetailActionsProvider).transferMembership(
            groupId: groupId,
            oldMemberId: oldMemberId,
            newMemberId: newMemberId,
          );

      // 6. Verify that the membership now belongs to the new member
      final updatedMemberships = await dao.getMembershipsForGroup(groupId);
      expect(updatedMemberships.first.memberId, newMemberId);

      // 7. Verify that the payment record's remarks note the slot transfer details
      final payments = await dao.getPaymentsForMembership(membershipId);
      expect(payments.first.remarks, contains('Paid by Old Member'));
      expect(
          payments.first.remarks, contains('Slot Transferred to New Member'));
    });

    test(
        'winner payout status updates and calculates remaining balance left correctly',
        () async {
      final container = ProviderContainer(
        overrides: [
          appDatabaseProvider.overrideWithValue(db),
        ],
      );

      final dao = container.read(appDaoProvider);

      // 1. Create a group
      final groupId = await dao.insertGroup(GroupsCompanion.insert(
        name: 'Winner Payout Group',
        chitValue: 100000.0,
        totalMonths: 10,
        monthlyContribution: 10000.0,
        startDate: DateTime.now(),
      ));

      // 2. Add a member
      final memberId = await dao.insertMember(MembersCompanion.insert(
        name: 'Winner Member',
        phone: '1122334455',
      ));

      // 3. Declare winner with bid
      final roundId = await dao.insertRound(RoundsCompanion.insert(
        groupId: groupId,
        roundNumber: 1,
        month: DateTime.now().month,
        year: DateTime.now().year,
        winnerMemberId: drift.Value(memberId),
        bidAmount: const drift.Value(20000.0), // Prize money = 100k - 20k = 80k
      ));

      // 4. Release payout (e.g. pay 50k out of 80k)
      final prizeAmount = 80000.0;
      final winnerPaid = 50000.0;
      final winnerBalance = prizeAmount - winnerPaid; // 30k

      await container.read(winnerActionsProvider).updatePayoutAndGuarantor(
            roundId: roundId,
            payoutStatus: 'Released',
            payoutDate: DateTime.now(),
            guarantor1Name: null,
            guarantor1Phone: null,
            guarantor2Name: null,
            guarantor2Phone: null,
            guarantorMemberId: null,
            winnerPaid: winnerPaid,
            winnerBalance: winnerBalance,
            winnerLeft: winnerBalance,
          );

      // 5. Verify the remaining balance and status in database
      final groupRounds = await dao.getRoundsForGroup(groupId);
      final updatedRound = groupRounds.first;

      expect(updatedRound.payoutStatus, 'Released');
      expect(updatedRound.winnerPaid, winnerPaid);
      expect(updatedRound.winnerBalance, winnerBalance);
      expect(updatedRound.winnerLeft, winnerBalance);
    });

    test('inactivity lock timeout loads from settings provider', () async {
      SharedPreferences.setMockInitialValues({
        'inactivity_lock_timeout': 600,
      });

      final prefs = await SharedPreferences.getInstance();
      final container = ProviderContainer(
        overrides: [
          sharedPreferencesProvider.overrideWithValue(prefs),
        ],
      );

      final settings = container.read(settingsProvider);
      expect(settings.inactivityLockTimeout, 600);
    });
  });
}
