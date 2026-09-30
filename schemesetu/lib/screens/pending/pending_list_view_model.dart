import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:collection/collection.dart';
import '../../data/local/app_database.dart';
import '../../data/providers/db_provider.dart';

class PendingItem {
  final Member member;
  final Group group;
  final double dueAmount;
  final double expectedAmount;
  final double collectedAmount;
  final List<bool> recentHistory;

  PendingItem({
    required this.member,
    required this.group,
    required this.dueAmount,
    required this.expectedAmount,
    required this.collectedAmount,
    required this.recentHistory,
  });
}

class GroupedPendingItem {
  final Member member;
  final List<PendingItem> items;

  GroupedPendingItem({required this.member, required this.items});

  double get totalDue =>
      items.fold<double>(0, (sum, item) => sum + item.dueAmount);
  String get groupNamesLabel => items.map((item) => item.group.name).join(', ');
}

final pendingListProvider = FutureProvider.family
    .autoDispose<List<PendingItem>, DateTime>((ref, selectedMonth) async {
  final dao = ref.watch(appDaoProvider);
  final memberships = await dao.getAllMemberships();
  final allMembers = await dao.getAllMembers();
  final allGroups = await dao.getAllGroups();

  final List<PendingItem> pendingItems = [];

  for (final group in allGroups) {
    if (group.status != 'Active') continue;

    final groupRounds = await dao.getRoundsForGroup(group.id);
    final currentRound = groupRounds.firstWhereOrNull(
        (r) => r.month == selectedMonth.month && r.year == selectedMonth.year);

    final activeMemberIds =
        allMembers.where((m) => m.status == 'Active').map((m) => m.id).toSet();
    final groupMemberships = memberships
        .where((m) =>
            m.groupId == group.id && activeMemberIds.contains(m.memberId))
        .toList();

    double baseMonthlyContribution = group.monthlyContribution;

    for (final ms in groupMemberships) {
      final member = allMembers.firstWhereOrNull((m) => m.id == ms.memberId);
      if (member == null || member.status != 'Active') continue;

      double expectedContribution = baseMonthlyContribution;
      if (currentRound != null && currentRound.dividendDistributed != null) {
        final totalGroupSlots =
            groupMemberships.fold<double>(0, (s, m) => s + m.installmentsCount);
        if (totalGroupSlots > 0) {
          expectedContribution -=
              (currentRound.dividendDistributed! / totalGroupSlots);
        }
      }
      double actualExpectedForMember =
          expectedContribution * ms.installmentsCount;

      final payments = await dao.getPaymentsForMembership(ms.id);
      double collectedForMember = 0.0;
      for (final p in payments) {
        if (currentRound != null &&
            p.roundId == currentRound.id &&
            p.status == 'Completed') {
          collectedForMember += p.amount;
        }
      }

      if (collectedForMember < actualExpectedForMember) {
        // Compute recent history (last 5 rounds)
        final historyRounds =
            groupRounds.where((r) => r.id != currentRound?.id).take(5).toList();
        List<bool> history = [];
        for (var hr in historyRounds) {
          final hrPayments = payments
              .where((p) => p.roundId == hr.id && p.status == 'Completed')
              .fold(0.0, (s, p) => s + p.amount);
          final hrExpected = group.monthlyContribution * ms.installmentsCount;
          history.add(hrPayments >= hrExpected);
        }

        pendingItems.add(PendingItem(
          member: member,
          group: group,
          dueAmount: actualExpectedForMember - collectedForMember,
          expectedAmount: actualExpectedForMember,
          collectedAmount: collectedForMember,
          recentHistory: history,
        ));
      }
    }
  }

  return pendingItems;
});
