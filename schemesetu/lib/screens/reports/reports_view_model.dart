import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:collection/collection.dart';
import '../../data/local/app_database.dart';
import '../../data/providers/db_provider.dart';
import '../../models/group_model.dart';
import '../../models/member_model.dart';
import '../../models/payment_model.dart';
import '../../models/winner_model.dart';

class ReportsState {
  final List<GroupModel> groups;
  final List<MemberModel> members;
  final List<PaymentModel> payments;
  final List<WinnerModel> winners;

  ReportsState({
    required this.groups,
    required this.members,
    required this.payments,
    required this.winners,
  });
}

final reportsProvider = FutureProvider.autoDispose<ReportsState>((ref) async {
  final dao = ref.watch(appDaoProvider);

  final allGroups = await dao.getAllGroups();
  final allMembers = await dao.getAllMembers();
  final allMemberships = await dao.getAllMemberships();
  final allPayments = await dao.getAllPayments();
  final allRounds = await dao.getAllRounds();

  // Map groups
  final List<GroupModel> groups = [];
  for (final Group g in allGroups) {
    final mCount = allMemberships.where((ms) => ms.groupId == g.id).length;
    groups.add(GroupModel(
      id: g.id.toString(),
      name: g.name,
      installment: g.monthlyContribution,
      totalMembers: mCount > 0 ? mCount : g.totalMonths,
      startDate: g.startDate,
      durationMonths: g.totalMonths,
      paymentDueDate: g.paymentDueDate,
    ));
  }

  // Map members
  final List<MemberModel> members = [];
  for (final Member m in allMembers) {
    final memberGroupIds = allMemberships
        .where((ms) => ms.memberId == m.id)
        .map((ms) => ms.groupId.toString())
        .toList();

    members.add(MemberModel(
      id: m.id.toString(),
      name: m.name,
      mobile: m.phone,
      address: m.address ?? '',
      photoUrl: m.photoPath,
      groupIds: memberGroupIds,
    ));
  }

  // Map payments
  final List<PaymentModel> payments = [];

  // 1. Add all completed payments
  for (final Payment p in allPayments) {
    if (p.status != 'Completed') continue;
    final ms = allMemberships.firstWhereOrNull((ms) => ms.id == p.membershipId);
    if (ms == null) continue;

    final group = allGroups.firstWhereOrNull((g) => g.id == ms.groupId);
    final round = allRounds.firstWhereOrNull((r) => r.id == p.roundId);

    bool isLate = false;
    if (group != null && round != null) {
      final dueDate = DateTime(round.year, round.month, group.paymentDueDate);
      // It's late if paymentDate is strictly after the due date (ignoring time for due date)
      if (p.paymentDate.isAfter(
          DateTime(dueDate.year, dueDate.month, dueDate.day, 23, 59, 59))) {
        isLate = true;
      }
    }

    final monthKey = round != null
        ? '${round.year}-${round.month.toString().padLeft(2, '0')}'
        : '${p.paymentDate.year}-${p.paymentDate.month.toString().padLeft(2, '0')}';

    payments.add(PaymentModel(
      id: p.id.toString(),
      memberId: ms.memberId.toString(),
      groupId: ms.groupId.toString(),
      month: monthKey,
      amount: p.amount,
      isPaid: true,
      paymentDate: p.paymentDate,
      method: p.paymentMode,
      isLate: isLate,
    ));
  }

  // 2. Dynamically calculate pending dues
  for (final round in allRounds) {
    final group = allGroups.firstWhereOrNull((g) => g.id == round.groupId);
    if (group == null || group.status != 'Active') continue;

    final roundMemberships =
        allMemberships.where((ms) => ms.groupId == group.id).toList();
    for (final ms in roundMemberships) {
      double expectedContribution = group.monthlyContribution;
      if (round.dividendDistributed != null) {
        final totalGroupSlots =
            roundMemberships.fold<double>(0, (s, m) => s + m.installmentsCount);
        if (totalGroupSlots > 0) {
          expectedContribution -=
              (round.dividendDistributed! / totalGroupSlots);
        }
      }
      final expectedAmount = expectedContribution * ms.installmentsCount;
      final roundPayments = allPayments.where((p) =>
          p.roundId == round.id &&
          p.membershipId == ms.id &&
          p.status == 'Completed');
      final collectedAmount =
          roundPayments.fold<double>(0, (sum, p) => sum + p.amount);

      if (collectedAmount < expectedAmount) {
        final pendingAmount = expectedAmount - collectedAmount;
        final dueDate = DateTime(round.year, round.month, group.paymentDueDate);
        final monthKey =
            '${round.year}-${round.month.toString().padLeft(2, '0')}';
        final now = DateTime.now();
        final isLate = now.isAfter(
            DateTime(dueDate.year, dueDate.month, dueDate.day, 23, 59, 59));

        payments.add(PaymentModel(
          id: 'pending_${round.id}_${ms.id}',
          memberId: ms.memberId.toString(),
          groupId: group.id.toString(),
          month: monthKey,
          amount: pendingAmount,
          isPaid: false,
          paymentDate: dueDate,
          method: 'None',
          isLate: isLate,
        ));
      }
    }
  }

  // Map winners
  final List<WinnerModel> winners = [];
  for (final Round r in allRounds) {
    if (r.winnerMemberId != null) {
      final monthKey = '${r.year}-${r.month.toString().padLeft(2, '0')}';
      winners.add(WinnerModel(
        id: r.id.toString(),
        groupId: r.groupId.toString(),
        month: monthKey,
        memberId: r.winnerMemberId.toString(),
        amount: r.winnerBalance ?? 0.0,
        bidAmount: r.bidAmount ?? 0.0,
        winnerPaid: r.winnerPaid ?? 0.0,
        winnerBalance: r.winnerBalance ?? 0.0,
        winnerLeft: r.winnerLeft ?? 0.0,
        paymentMode: r.winnerPaymentMode ?? 'Cash',
        date: DateTime(r.year, r.month, 15),
        exchangedToMemberId: r.exchangedToMemberId?.toString(),
        exchangeNote: r.exchangeNote,
        payoutStatus: r.payoutStatus,
        payoutDate: r.payoutDate,
      ));
    }
  }

  return ReportsState(
    groups: groups,
    members: members,
    payments: payments,
    winners: winners,
  );
});
