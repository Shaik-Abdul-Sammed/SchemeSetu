import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:drift/drift.dart' as drift;
import 'package:collection/collection.dart';
import '../../data/local/app_database.dart';
import '../../data/providers/db_provider.dart';
import '../dashboard/admin_dashboard_view_model.dart';
import '../payment/payment_view_model.dart';
import 'groups_list_view_model.dart';
import '../../services/notification_service.dart';

class GroupRoundWinnerInfo {
  final Round round;
  final Member winner;

  GroupRoundWinnerInfo({
    required this.round,
    required this.winner,
  });
}

class PaymentHistoryItem {
  final Payment payment;
  final Member member;
  final int roundMonth;
  final int roundYear;
  final bool isLate;

  PaymentHistoryItem({
    required this.payment,
    required this.member,
    required this.roundMonth,
    required this.roundYear,
    required this.isLate,
  });
}

class GroupMemberDetail {
  final Member member;
  final double installmentsCount;
  final bool isPaidThisMonth;
  final bool isWinner;
  final bool hasWonAnyRound;
  final bool isPaidAndLeft;
  final double totalPaid;
  final double monthPaid;
  final double monthExpected;
  final double lifetimeExpected;
  final int monthsPaid;
  final int monthsLeft;
  final DateTime?
      latestPaymentDate; // The date of the latest payment this month
  final bool isFrequentlyLate;
  final bool isLateThisMonth;

  GroupMemberDetail({
    required this.member,
    required this.installmentsCount,
    required this.isPaidThisMonth,
    required this.isWinner,
    required this.hasWonAnyRound,
    required this.isPaidAndLeft,
    required this.totalPaid,
    required this.monthPaid,
    required this.monthExpected,
    required this.lifetimeExpected,
    required this.monthsPaid,
    required this.monthsLeft,
    this.latestPaymentDate,
    required this.isFrequentlyLate,
    required this.isLateThisMonth,
  });
}

class GroupDetailState {
  final List<GroupMemberDetail> members;
  final List<GroupMemberDetail> paidMembers;
  final List<GroupMemberDetail> pendingMembers;
  final double monthCollected;
  final double monthPending;
  final int totalMonths;
  final int monthsLeft;
  final bool isLoading;
  final String? error;
  final double monthExpected;
  final double overallCollected;
  final double overallExpected;
  final double monthProgress;
  final double overallProgress;
  final List<GroupRoundWinnerInfo> winners;
  final Set<int> winnerMemberIds;

  /// The effective monthly contribution for the selected month
  /// (base installment minus any dividend distributed this round).
  final double actualMonthlyContribution;
  final List<PaymentHistoryItem> paymentHistory;

  GroupDetailState({
    required this.members,
    required this.paidMembers,
    required this.pendingMembers,
    required this.monthCollected,
    required this.monthPending,
    required this.totalMonths,
    required this.monthsLeft,
    this.isLoading = false,
    this.error,
    required this.monthExpected,
    required this.overallCollected,
    required this.overallExpected,
    required this.monthProgress,
    required this.overallProgress,
    required this.winners,
    required this.winnerMemberIds,
    required this.actualMonthlyContribution,
    required this.paymentHistory,
  });
}

final groupDetailProvider = FutureProvider.family
    .autoDispose<GroupDetailState, ({int groupId, DateTime month})>(
        (ref, arg) async {
  ref.watch(dbUpdatesProvider);
  final dao = ref.watch(appDaoProvider);
  final groupId = arg.groupId;
  final selectedMonth = arg.month;

  // Use getGroupById so past/deleted groups load correctly too
  final group = await dao.getGroupById(groupId);
  if (group == null) throw Exception('Group not found');
  final memberships = await dao.getActiveMembershipsForGroup(groupId);

  final allMembers = await dao.getAllMembers(includeDeleted: true);
  final members = allMembers
      .where((m) => memberships.any((ms) => ms.memberId == m.id))
      .toList();

  // Fetch payments
  final membershipIds = memberships.map((ms) => ms.id).toList();
  final List<Payment> groupPayments =
      await dao.getPaymentsForMembershipIds(membershipIds);

  // Winner prize-payout payments are money paid OUT to a winner, not collected
  // from a member — exclude them from collection and member-paid tallies.
  bool isWinnerPayout(Payment p) =>
      (p.remarks ?? '').startsWith('🏆 Winner Payout:');
  final List<Payment> collectedPayments =
      groupPayments.where((p) => !isWinnerPayout(p)).toList();

  // Fetch group rounds / winners
  final groupRounds = await dao.getRoundsForGroup(groupId);
  final List<GroupRoundWinnerInfo> winnersList = [];
  final Set<int> winnerMemberIds = {};

  for (final r in groupRounds) {
    if (r.winnerMemberId != null) {
      final winner =
          allMembers.firstWhereOrNull((m) => m.id == r.winnerMemberId);
      if (winner != null) {
        winnersList.add(GroupRoundWinnerInfo(round: r, winner: winner));
        // The effective winner is the exchanged member when a prize exchange happened.
        final effectiveWinnerId = r.exchangedToMemberId ?? r.winnerMemberId!;
        winnerMemberIds.add(effectiveWinnerId);
      }
    }
  }

  // Find round for selected month
  final currentRound = groupRounds.firstWhereOrNull(
      (r) => r.month == selectedMonth.month && r.year == selectedMonth.year);

  final monthPayments = currentRound != null
      ? groupPayments
          .where((p) => p.roundId == currentRound.id && !isWinnerPayout(p))
          .toList()
      : <Payment>[];

  double actualMonthlyContribution = group.monthlyContribution;
  // Per user request, the total collection of 1 month = amount for the winner.
  // We no longer subtract dividendPerSlot from actualMonthlyContribution
  // to ensure a pure fixed-prize format where actualMonthlyContribution is never 0.

  final List<GroupMemberDetail> memberDetails = [];
  final double lifetimeContribution =
      group.totalMonths * group.monthlyContribution;

  for (final m in members) {
    final ms = memberships.firstWhereOrNull((ms) => ms.memberId == m.id);
    if (ms == null) continue;

    final memberMonthPayments = monthPayments.where(
      (p) => p.membershipId == ms.id && p.status == 'Completed',
    );
    final monthPaid =
        memberMonthPayments.fold<double>(0, (sum, p) => sum + p.amount);
    final monthExpected = actualMonthlyContribution * ms.installmentsCount;

    // Check if paid this month — amount should be >= expected
    final isPaidThisMonth = monthPaid >= monthExpected;

    bool isLateThisMonth = false;
    if (!isPaidThisMonth && currentRound != null) {
      final dueDate = DateTime(currentRound.year, currentRound.month,
          group.paymentDueDate, 23, 59, 59);
      if (DateTime.now().isAfter(dueDate)) {
        isLateThisMonth = true;
      }
    }

    // Sum total collected (excluding winner prize payouts) for this member
    final memberPayments = collectedPayments.where(
      (p) => p.membershipId == ms.id && p.status == 'Completed',
    );
    final totalPaid =
        memberPayments.fold<double>(0, (sum, p) => sum + p.amount);

    final effectiveWinnerId =
        currentRound?.exchangedToMemberId ?? currentRound?.winnerMemberId;
    final isWinner = effectiveWinnerId != null && effectiveWinnerId == m.id;
    final hasWonAnyRound = winnerMemberIds.contains(m.id);
    final isPaidAndLeft = hasWonAnyRound && (totalPaid >= lifetimeContribution);

    final totalCompletedPayments = memberPayments.length;
    int latePaymentsCount = 0;
    for (final p in memberPayments) {
      final round = groupRounds.firstWhereOrNull((r) => r.id == p.roundId);
      if (round != null) {
        final dueDate =
            DateTime(round.year, round.month, group.paymentDueDate, 23, 59, 59);
        if (p.paymentDate.isAfter(dueDate)) {
          latePaymentsCount++;
        }
      }
    }
    final bool isFrequentlyLate = totalCompletedPayments >= 2 &&
        (latePaymentsCount / totalCompletedPayments) >= 0.5;

    memberDetails.add(GroupMemberDetail(
      member: m,
      installmentsCount: ms.installmentsCount,
      isPaidThisMonth: isPaidThisMonth,
      isWinner: isWinner,
      hasWonAnyRound: hasWonAnyRound,
      isPaidAndLeft: isPaidAndLeft,
      totalPaid: totalPaid,
      monthPaid: monthPaid,
      monthExpected: monthExpected,
      lifetimeExpected: lifetimeContribution * ms.installmentsCount,
      monthsPaid: (totalPaid / group.monthlyContribution).floor(),
      monthsLeft:
          group.totalMonths - (totalPaid / group.monthlyContribution).floor(),
      latestPaymentDate: memberMonthPayments.isNotEmpty
          ? memberMonthPayments
              .reduce((a, b) => a.paymentDate.isAfter(b.paymentDate) ? a : b)
              .paymentDate
          : null,
      isFrequentlyLate: isFrequentlyLate,
      isLateThisMonth: isLateThisMonth,
    ));
  }

  final paidMembers = memberDetails.where((md) => md.isPaidThisMonth).toList();
  final pendingMembers =
      memberDetails.where((md) => !md.isPaidThisMonth).toList();

  final totalInstallments =
      memberDetails.fold<double>(0, (sum, md) => sum + md.installmentsCount);
  final monthExpected = totalInstallments * actualMonthlyContribution;

  double monthCollected = 0.0;
  for (final p in monthPayments) {
    if (p.status == 'Completed') monthCollected += p.amount;
  }
  if (monthCollected > monthExpected) monthCollected = monthExpected;

  final monthPending = (monthExpected - monthCollected) > 0
      ? (monthExpected - monthCollected)
      : 0.0;
  final monthProgress =
      (monthExpected > 0 ? monthCollected / monthExpected : 0.0)
          .clamp(0.0, 1.0);

  double overallCollected = 0.0;
  for (final p in collectedPayments) {
    if (p.status == 'Completed') overallCollected += p.amount;
  }
  final overallExpected =
      totalInstallments * group.monthlyContribution * group.totalMonths;
  if (overallCollected > overallExpected) overallCollected = overallExpected;
  final overallProgress = overallExpected > 0
      ? (overallCollected / overallExpected).clamp(0.0, 1.0)
      : 0.0;

  // Build payment history (all completed payments with member + month info)
  final Map<int, Round> roundMap = {for (final r in groupRounds) r.id: r};
  final Map<int, Member> memberByMembershipId = {};
  for (final ms in memberships) {
    final m = members.firstWhereOrNull((m) => m.id == ms.memberId);
    if (m != null) memberByMembershipId[ms.id] = m;
  }
  final List<PaymentHistoryItem> paymentHistory = [];
  for (final p in groupPayments) {
    if (p.status == 'Completed') {
      final member = memberByMembershipId[p.membershipId];
      final round = roundMap[p.roundId];
      if (member != null && round != null) {
        final dueDate =
            DateTime(round.year, round.month, group.paymentDueDate, 23, 59, 59);
        final isLate = p.paymentDate.isAfter(dueDate);

        paymentHistory.add(PaymentHistoryItem(
          payment: p,
          member: member,
          roundMonth: round.month,
          roundYear: round.year,
          isLate: isLate,
        ));
      }
    }
  }

  // Add pending payments that are late
  final now = DateTime.now();
  for (final round in groupRounds) {
    final dueDate =
        DateTime(round.year, round.month, group.paymentDueDate, 23, 59, 59);
    if (now.isAfter(dueDate)) {
      for (final ms in memberships) {
        final member = memberByMembershipId[ms.id];
        if (member == null) continue;

        final expectedAmount = group.monthlyContribution * ms.installmentsCount;
        final roundPayments = groupPayments.where((p) =>
            p.roundId == round.id &&
            p.membershipId == ms.id &&
            p.status == 'Completed');
        final collectedAmount =
            roundPayments.fold<double>(0, (sum, p) => sum + p.amount);

        if (collectedAmount < expectedAmount) {
          final pendingAmount = expectedAmount - collectedAmount;

          paymentHistory.add(PaymentHistoryItem(
            payment: Payment(
              id: -1,
              membershipId: ms.id,
              roundId: round.id,
              amount: pendingAmount,
              paymentDate: dueDate, // Show due date as payment date for sorting
              paymentMode: 'None',
              status: 'Pending',
              remarks: 'Late Payer (Pending)',
            ),
            member: member,
            roundMonth: round.month,
            roundYear: round.year,
            isLate: true,
          ));
        }
      }
    }
  }

  paymentHistory
      .sort((a, b) => b.payment.paymentDate.compareTo(a.payment.paymentDate));

  return GroupDetailState(
    members: memberDetails,
    paidMembers: paidMembers,
    pendingMembers: pendingMembers,
    monthCollected: monthCollected,
    monthPending: monthPending,
    totalMonths: group.totalMonths,
    monthsLeft: group.totalMonths - groupRounds.length,
    monthExpected: monthExpected,
    overallCollected: overallCollected,
    overallExpected: overallExpected,
    monthProgress: monthProgress,
    overallProgress: overallProgress,
    winners: winnersList,
    winnerMemberIds: winnerMemberIds,
    actualMonthlyContribution: actualMonthlyContribution,
    paymentHistory: paymentHistory,
  );
});

final groupDetailActionsProvider = Provider((ref) => GroupDetailActions(ref));

class GroupDetailActions {
  final Ref ref;
  GroupDetailActions(this.ref);

  Future<double?> togglePayment(int memberId, int groupId, DateTime month,
      [String paymentMode = 'Cash']) async {
    final dao = ref.read(appDaoProvider);
    final group =
        (await dao.getAllGroups()).firstWhereOrNull((g) => g.id == groupId);
    if (group == null) return null;
    final memberships = await dao.getMembershipsForMember(memberId);
    final ms = memberships.firstWhereOrNull((m) => m.groupId == groupId);
    if (ms == null) return null;

    // Find or create Round for the group and selected month
    final groupRounds = await dao.getRoundsForGroup(groupId);
    var round = groupRounds.firstWhereOrNull(
        (r) => r.month == month.month && r.year == month.year);
    int roundId;
    if (round == null) {
      final roundNumber = groupRounds.length + 1;
      roundId = await dao.insertRound(RoundsCompanion.insert(
        groupId: groupId,
        roundNumber: roundNumber,
        month: month.month,
        year: month.year,
      ));
    } else {
      roundId = round.id;
    }

    // Fetch payments for this membership
    final payments = await dao.getPaymentsForMembership(ms.id);
    final monthPayments = payments.where((p) => p.roundId == roundId).toList();

    double actualContribution = group.monthlyContribution;
    final expectedAmount = actualContribution * ms.installmentsCount;

    final completedPayments =
        monthPayments.where((p) => p.status == 'Completed').toList();
    final totalMonthPaid =
        completedPayments.fold<double>(0, (sum, p) => sum + p.amount);

    if (totalMonthPaid >= expectedAmount && completedPayments.isNotEmpty) {
      // Toggle off: delete all completed payments for this round
      for (final p in completedPayments) {
        await dao.deletePayment(p.id);
      }
      ref.invalidate(groupDetailProvider);
      ref.invalidate(adminDashboardMetricsProvider);
      ref.invalidate(paymentProvider);
      return totalMonthPaid;
    } else {
      // Toggle on: mark as fully paid
      // First, mark any pending as completed (or delete them and insert the remaining)
      // The simplest is to just insert the remaining amount.
      final remaining = expectedAmount - totalMonthPaid;
      if (remaining > 0) {
        await dao.insertPayment(PaymentsCompanion.insert(
          membershipId: ms.id,
          roundId: roundId,
          amount: remaining,
          paymentMode: paymentMode,
          status: const drift.Value('Completed'),
          paymentDate: drift.Value(DateTime.now()),
        ));
      }

      // Update any pending to completed if they existed, though insert is safer.
      for (final p in monthPayments.where((p) => p.status != 'Completed')) {
        await dao.deletePayment(p.id); // Remove unused pending
      }

      ref.invalidate(groupDetailProvider);
      ref.invalidate(adminDashboardMetricsProvider);
      ref.invalidate(paymentProvider);
      return remaining;
    }
  }

  /// Records a fully-specified payment (from the payment-entry form).
  Future<void> recordFullPayment({
    required int memberId,
    required int groupId,
    required DateTime month,
    required double amount,
    required String paymentMode,
    required DateTime paymentDate,
    String? remarks,
    String? collectorName,
    bool splitExcess = false,
    double expectedAmount = 0.0,
  }) async {
    final dao = ref.read(appDaoProvider);
    final memberships = await dao.getMembershipsForMember(memberId);
    final ms = memberships.firstWhereOrNull((m) => m.groupId == groupId);
    if (ms == null) return;

    final groupRounds = await dao.getRoundsForGroup(groupId);
    var round = groupRounds.firstWhereOrNull(
      (r) => r.month == month.month && r.year == month.year,
    );
    int roundId;
    if (round == null) {
      roundId = await dao.insertRound(RoundsCompanion.insert(
        groupId: groupId,
        roundNumber: groupRounds.length + 1,
        month: month.month,
        year: month.year,
      ));
    } else {
      roundId = round.id;
    }

    // Remove any existing pending payment for this round before inserting
    final existing = await dao.getPaymentsForMembership(ms.id);
    for (final p in existing) {
      if (p.roundId == roundId && p.status != 'Completed') {
        await dao.deletePayment(p.id);
      }
    }

    if (splitExcess && amount > expectedAmount) {
      if (expectedAmount > 0) {
        // Payment for current round
        await dao.insertPayment(PaymentsCompanion.insert(
          membershipId: ms.id,
          roundId: roundId,
          amount: expectedAmount,
          paymentMode: paymentMode,
          status: const drift.Value('Completed'),
          paymentDate: drift.Value(paymentDate),
          remarks: drift.Value(remarks),
          collectorName: drift.Value(collectorName),
        ));
      }

      // Payment for next round (the excess)
      final nextMonth = DateTime(month.year, month.month + 1, 10);
      var nextRound = groupRounds.firstWhereOrNull(
        (r) => r.month == nextMonth.month && r.year == nextMonth.year,
      );
      int nextRoundId;
      if (nextRound == null) {
        nextRoundId = await dao.insertRound(RoundsCompanion.insert(
          groupId: groupId,
          roundNumber: groupRounds.length + 2, // approximate, relies on length
          month: nextMonth.month,
          year: nextMonth.year,
        ));
      } else {
        nextRoundId = nextRound.id;
      }

      final extraAmount = amount - expectedAmount;
      await dao.insertPayment(PaymentsCompanion.insert(
        membershipId: ms.id,
        roundId: nextRoundId,
        amount: extraAmount,
        paymentMode: paymentMode,
        status: const drift.Value('Completed'),
        paymentDate: drift.Value(paymentDate),
        remarks: drift.Value(
            remarks == null ? 'Advance Payment' : '$remarks (Advance)'),
        collectorName: drift.Value(collectorName),
      ));
    } else {
      await dao.insertPayment(PaymentsCompanion.insert(
        membershipId: ms.id,
        roundId: roundId,
        amount: amount,
        paymentMode: paymentMode,
        status: const drift.Value('Completed'),
        paymentDate: drift.Value(paymentDate),
        remarks: drift.Value(remarks),
        collectorName: drift.Value(collectorName),
      ));
    }

    ref.invalidate(groupDetailProvider);
    ref.invalidate(adminDashboardMetricsProvider);
    ref.invalidate(paymentProvider);
  }

  Future<void> declareWinner({
    required int groupId,
    required int roundNumber,
    required DateTime month,
    required double bidAmount,
    required int winnerMemberId,
    required double foremanCommission,
    required double winnerPaid,
    required double winnerBalance,
    required double winnerLeft,
    required String hijriDate,
    String? winnerPaymentMode,
    String? winnerRemarks,
    int? exchangedToMemberId,
    String? exchangeNote,
  }) async {
    final dao = ref.read(appDaoProvider);
    final dividend = bidAmount > 0 ? bidAmount : 0.0;

    final groupRounds = await dao.getRoundsForGroup(groupId);
    final existingRound = groupRounds.firstWhereOrNull(
        (r) => r.month == month.month && r.year == month.year);

    if (existingRound != null) {
      await dao.updateRound(RoundsCompanion(
        id: drift.Value(existingRound.id),
        roundNumber: drift.Value(roundNumber),
        bidAmount: drift.Value(bidAmount),
        winnerMemberId: drift.Value(winnerMemberId),
        foremanCommission: drift.Value(foremanCommission),
        dividendDistributed: drift.Value(dividend),
        winnerPaid: drift.Value(winnerPaid),
        winnerBalance: drift.Value(winnerBalance),
        winnerLeft: drift.Value(winnerLeft),
        hijriDate: drift.Value(hijriDate),
        winnerPaymentMode: drift.Value(winnerPaymentMode),
        winnerRemarks: drift.Value(winnerRemarks),
        exchangedToMemberId: drift.Value(exchangedToMemberId),
        exchangeNote: drift.Value(exchangeNote),
      ));
    } else {
      await dao.insertRound(RoundsCompanion.insert(
        groupId: groupId,
        roundNumber: roundNumber,
        month: month.month,
        year: month.year,
        bidAmount: drift.Value(bidAmount),
        winnerMemberId: drift.Value(winnerMemberId),
        foremanCommission: drift.Value(foremanCommission),
        dividendDistributed: drift.Value(dividend),
        winnerPaid: drift.Value(winnerPaid),
        winnerBalance: drift.Value(winnerBalance),
        winnerLeft: drift.Value(winnerLeft),
        hijriDate: drift.Value(hijriDate),
        winnerPaymentMode: drift.Value(winnerPaymentMode),
        winnerRemarks: drift.Value(winnerRemarks),
        exchangedToMemberId: drift.Value(exchangedToMemberId),
        exchangeNote: drift.Value(exchangeNote),
      ));
    }
    ref.invalidate(groupDetailProvider);
    ref.invalidate(adminDashboardMetricsProvider);
    ref.invalidate(paymentProvider);

    try {
      final member = await dao.getMemberById(winnerMemberId);
      final group = await dao.getGroupById(groupId);
      if (member != null && group != null) {
        await NotificationService().showNotification(
          id: member.id + roundNumber + 500,
          title: '🏆 Winner Selected — ${group.name}',
          body:
              '${member.name} has been selected as the winner for Round $roundNumber with a bid of ₹${bidAmount.toStringAsFixed(0)}',
        );
      }
    } catch (_) {}
  }

  Future<void> deleteWinner(int roundId) async {
    final dao = ref.read(appDaoProvider);
    await dao.updateRound(RoundsCompanion(
      id: drift.Value(roundId),
      winnerMemberId: const drift.Value<int?>(null),
      bidAmount: const drift.Value<double?>(null),
      foremanCommission: const drift.Value<double?>(null),
      dividendDistributed: const drift.Value<double?>(null),
      winnerPaid: const drift.Value<double?>(null),
      winnerBalance: const drift.Value<double?>(null),
      winnerLeft: const drift.Value<double?>(null),
      hijriDate: const drift.Value<String?>(null),
      winnerPaymentMode: const drift.Value<String?>(null),
      winnerRemarks: const drift.Value<String?>(null),
      exchangedToMemberId: const drift.Value<int?>(null),
      exchangeNote: const drift.Value<String?>(null),
      payoutStatus: const drift.Value<String>('Pending'),
      payoutDate: const drift.Value<DateTime?>(null),
    ));
    ref.invalidate(groupDetailProvider);
    ref.invalidate(adminDashboardMetricsProvider);
    ref.invalidate(paymentProvider);
  }

  Future<void> payWinner(
    int roundId,
    double amount, {
    String paymentMode = 'Cash',
    int? recipientMemberId,
    String? exchangeNote,
    DateTime? payoutDate,
  }) async {
    final dao = ref.read(appDaoProvider);
    final round = await dao.getRoundById(roundId);
    if (round == null) return;

    final currentPaid = round.winnerPaid ?? 0.0;
    final newPaid = currentPaid + amount;
    final currentBalance = round.winnerBalance ?? 0.0;
    final newLeft =
        (currentBalance - newPaid) > 0 ? (currentBalance - newPaid) : 0.0;

    await dao.updateRound(RoundsCompanion(
      id: drift.Value(round.id),
      winnerPaid: drift.Value(newPaid),
      winnerLeft: drift.Value(newLeft),
      winnerPaymentMode: drift.Value(paymentMode),
      payoutDate: payoutDate != null
          ? drift.Value(payoutDate)
          : const drift.Value.absent(),
    ));

    // Record a payment against the recipient (exchanged member or original winner)
    // so the payout shows up in the History tab with an audit note.
    final recipientId = recipientMemberId ?? round.winnerMemberId;
    if (recipientId != null) {
      final recipientMemberships =
          await dao.getMembershipsForMember(recipientId);
      final membership = recipientMemberships.firstWhereOrNull(
        (ms) => ms.groupId == round.groupId,
      );
      if (membership != null) {
        final baseNote = round.exchangedToMemberId != null
            ? 'Winner prize payout (exchanged). ${exchangeNote ?? ''}'.trim()
            : 'Winner prize payout. ${exchangeNote ?? ''}'.trim();
        final remarks =
            '🏆 Winner Payout: ${baseNote.isEmpty ? 'Prize released' : baseNote}';
        await dao.insertPayment(PaymentsCompanion.insert(
          membershipId: membership.id,
          roundId: round.id,
          amount: amount,
          paymentDate: drift.Value(payoutDate ?? DateTime.now()),
          status: const drift.Value('Completed'),
          paymentMode: paymentMode,
          remarks: drift.Value(remarks),
        ));
      }
    }

    ref.invalidate(groupDetailProvider);
    ref.invalidate(adminDashboardMetricsProvider);
    ref.invalidate(paymentProvider);
  }

  Future<void> markAllPaid(int groupId, DateTime month) async {
    final dao = ref.read(appDaoProvider);
    final group =
        (await dao.getAllGroups()).firstWhereOrNull((g) => g.id == groupId);
    if (group == null) return;
    // 4. Load memberships
    final memberships = await dao.getActiveMembershipsForGroup(groupId);

    // Remove unused monthStart and monthEnd

    // Find or create Round for the group and selected month
    final groupRounds = await dao.getRoundsForGroup(groupId);
    var round = groupRounds.firstWhereOrNull(
        (r) => r.month == month.month && r.year == month.year);
    int roundId;
    if (round == null) {
      final roundNumber = groupRounds.length + 1;
      roundId = await dao.insertRound(RoundsCompanion.insert(
        groupId: groupId,
        roundNumber: roundNumber,
        month: month.month,
        year: month.year,
      ));
    } else {
      roundId = round.id;
    }

    double actualContribution = group.monthlyContribution;
    for (final ms in memberships) {
      final payments = await dao.getPaymentsForMembership(ms.id);
      final monthPayment =
          payments.firstWhereOrNull((p) => p.roundId == roundId);
      final totalAmount = actualContribution * ms.installmentsCount;

      if (monthPayment == null) {
        await dao.insertPayment(PaymentsCompanion.insert(
          membershipId: ms.id,
          roundId: roundId,
          amount: totalAmount,
          paymentMode: 'Cash',
          status: const drift.Value('Completed'),
          paymentDate: drift.Value(DateTime(month.year, month.month, 15)),
        ));
      } else if (monthPayment.status != 'Completed') {
        await dao.updatePayment(PaymentsCompanion(
          id: drift.Value(monthPayment.id),
          status: const drift.Value('Completed'),
          paymentMode: const drift.Value('Cash'),
        ));
      }
    }

    ref.invalidate(groupDetailProvider);
    ref.invalidate(adminDashboardMetricsProvider);
    ref.invalidate(paymentProvider);

    try {
      await NotificationService().showNotification(
        id: groupId + month.hashCode,
        title: '✅ Group Marked Paid',
        body: 'All members marked paid for ${group.name}',
      );
    } catch (_) {}
  }

  Future<void> updateInstallmentsCount(
      int memberId, int groupId, double newCount,
      {DateTime? selectedMonth}) async {
    if (newCount <= 0) return;
    final dao = ref.read(appDaoProvider);
    final memberships = await dao.getMembershipsForMember(memberId);
    final ms = memberships.firstWhereOrNull((m) => m.groupId == groupId);

    if (ms != null) {
      final group = await dao.getGroupById(groupId);
      if (group != null) {
        final allMemberships = await dao.getActiveMembershipsForGroup(groupId);
        final currentTotalSlotsExcludingThis = allMemberships
            .where((x) => x.id != ms.id)
            .fold<double>(0, (sum, m) => sum + m.installmentsCount);
        if (currentTotalSlotsExcludingThis + newCount >
            group.totalMonths + 0.01) {
          throw Exception('Total slots cannot exceed ${group.totalMonths}.');
        }
      }

      // Update the installments count on the membership
      await dao.updateMembership(MembershipsCompanion(
        id: drift.Value(ms.id),
        installmentsCount: drift.Value(newCount),
      ));

      // Update group's total chitValue
      if (group != null) {
        final allMemberships = await dao.getActiveMembershipsForGroup(groupId);
        final totalSlots = allMemberships.fold<double>(
            0, (sum, m) => sum + m.installmentsCount);
        final newChitValue =
            group.monthlyContribution * totalSlots * group.totalMonths;
        await dao.updateGroup(GroupsCompanion(
          id: drift.Value(groupId),
          chitValue: drift.Value(newChitValue),
        ));
      }

      // Update the amount for all pending (non-Completed) payments for this membership
      // so the remainder reflects the new count immediately across all rounds.
      if (group != null) {
        final groupRounds = await dao.getRoundsForGroup(groupId);
        final payments = await dao.getPaymentsForMembership(ms.id);

        for (final round in groupRounds) {
          final payment =
              payments.firstWhereOrNull((p) => p.roundId == round.id);
          if (payment != null && payment.status != 'Completed') {
            double actualContribution = group.monthlyContribution;
            await dao.updatePayment(PaymentsCompanion(
              id: drift.Value(payment.id),
              amount: drift.Value(actualContribution * newCount),
            ));
          }
        }
      }

      ref.invalidate(groupDetailProvider);
      ref.invalidate(adminDashboardMetricsProvider);
      ref.invalidate(paymentProvider);
      ref.invalidate(groupsListProvider);
    }
  }

  Membership? _lastDeletedMembership;
  List<Payment>? _lastDeletedPayments;

  Future<void> removeMember(int memberId, int groupId) async {
    final dao = ref.read(appDaoProvider);
    // Store membership and payments for potential Undo action
    final memberships = await dao.getMembershipsForMember(memberId);
    _lastDeletedMembership =
        memberships.firstWhereOrNull((m) => m.groupId == groupId);
    if (_lastDeletedMembership != null) {
      _lastDeletedPayments =
          await dao.getPaymentsForMembership(_lastDeletedMembership!.id);
    }

    await dao.removeMembershipAndUpdateGroup(memberId, groupId);
    ref.invalidate(groupDetailProvider);
    ref.invalidate(adminDashboardMetricsProvider);
    ref.invalidate(paymentProvider);
    ref.invalidate(groupsListProvider);
  }

  Future<void> undoRemoveMember() async {
    if (_lastDeletedMembership != null && _lastDeletedPayments != null) {
      final dao = ref.read(appDaoProvider);
      await dao.undoRemoveMembership(
          _lastDeletedMembership!, _lastDeletedPayments!);

      // Clear after successful restore
      _lastDeletedMembership = null;
      _lastDeletedPayments = null;

      ref.invalidate(groupDetailProvider);
      ref.invalidate(adminDashboardMetricsProvider);
      ref.invalidate(paymentProvider);
      ref.invalidate(groupsListProvider);
    }
  }

  /// Transfers a membership slot from [oldMemberId] to [newMemberId] within a group.
  /// The membership record is updated so the new member owns the slot.
  /// Existing payment remarks are annotated to record the transfer for auditability.
  Future<void> transferMembership({
    required int groupId,
    required int oldMemberId,
    required int newMemberId,
  }) async {
    final dao = ref.read(appDaoProvider);

    // Find the membership belonging to the old member in this group
    final oldMemberships = await dao.getMembershipsForMember(oldMemberId);
    final ms = oldMemberships.firstWhereOrNull((m) => m.groupId == groupId);
    if (ms == null) return;

    // Fetch old and new member names for remark annotation
    final allMembers = await dao.getAllMembers(includeDeleted: true);
    final oldMember = allMembers.firstWhereOrNull((m) => m.id == oldMemberId);
    final newMember = allMembers.firstWhereOrNull((m) => m.id == newMemberId);

    final oldName = oldMember?.name ?? 'Old Member';
    final newName = newMember?.name ?? 'New Member';

    // Annotate all existing payment remarks to record the transfer
    final payments = await dao.getPaymentsForMembership(ms.id);
    for (final p in payments) {
      final existingRemark = p.remarks ?? '';
      final transferNote = 'Paid by $oldName | Slot Transferred to $newName';
      final newRemark = existingRemark.isEmpty
          ? transferNote
          : '$existingRemark; $transferNote';
      await dao.updatePayment(PaymentsCompanion(
        id: drift.Value(p.id),
        remarks: drift.Value(newRemark),
      ));
    }

    // Update the membership to point to the new member
    await dao.updateMembership(MembershipsCompanion(
      id: drift.Value(ms.id),
      memberId: drift.Value(newMemberId),
    ));

    ref.invalidate(groupDetailProvider);
    ref.invalidate(adminDashboardMetricsProvider);
    ref.invalidate(paymentProvider);
    ref.invalidate(groupsListProvider);
  }
}
