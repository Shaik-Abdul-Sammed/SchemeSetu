import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:collection/collection.dart';
import '../../data/local/app_database.dart';
import '../../data/providers/db_provider.dart';
import 'package:drift/drift.dart' as drift;
import '../dashboard/admin_dashboard_view_model.dart';
import '../../services/notification_service.dart';

part 'payment_view_model.g.dart';

class PaymentState {
  final List<Group> groups;
  final int? selectedGroupId;
  final DateTime selectedMonth;
  final List<MemberPaymentInfo> memberPayments;
  final double totalExpected;
  final double totalCollected;
  final double totalPending;

  PaymentState({
    required this.groups,
    this.selectedGroupId,
    required this.selectedMonth,
    required this.memberPayments,
    this.totalExpected = 0.0,
    this.totalCollected = 0.0,
    this.totalPending = 0.0,
  });
}

class MembershipPaymentDetail {
  final Membership membership;
  final double expectedAmount;
  final double collectedAmount;
  final List<Payment> payments;

  MembershipPaymentDetail({
    required this.membership,
    required this.expectedAmount,
    required this.collectedAmount,
    required this.payments,
  });
}

class MemberPaymentInfo {
  final Member member;
  final List<MembershipPaymentDetail> details;
  final double collectedAmount;
  final bool isLate;
  final double expectedAmount;
  final bool isWinner;
  final bool hasWinnerBeenPaid;
  final List<int> wonRoundIds; // To keep track of which round they won

  MemberPaymentInfo({
    required this.member,
    required this.details,
    required this.collectedAmount,
    this.isLate = false,
    required this.expectedAmount,
    this.isWinner = false,
    this.hasWinnerBeenPaid = false,
    this.wonRoundIds = const [],
  });

  List<Payment> get allPayments => details.expand((d) => d.payments).toList();
}

@riverpod
class PaymentNotifier extends _$PaymentNotifier {
  @override
  Future<PaymentState> build() async {
    ref.watch(dbUpdatesProvider);
    final dao = ref.watch(appDaoProvider);
    final groups = await dao.getAllGroups();

    if (groups.isEmpty) {
      return PaymentState(
          groups: [], selectedMonth: DateTime.now(), memberPayments: []);
    }

    final selectedGroup = groups.first;
    return _loadDataForGroupAndMonth(selectedGroup.id, DateTime.now(), groups);
  }

  Future<PaymentState> _loadDataForGroupAndMonth(
      int? groupId, DateTime month, List<Group> groups) async {
    final dao = ref.read(appDaoProvider);

    Map<int, MemberPaymentInfo> mergedPayments = {};

    final allMembers = await dao.getAllMembers();

    // Determine which groups to process
    final targetGroups = groupId == null
        ? groups
        : groups.where((g) => g.id == groupId).toList();

    for (final group in targetGroups) {
      final memberships = await dao.getActiveMembershipsForGroup(group.id);
      final groupRounds = await dao.getRoundsForGroup(group.id);

      final currentRound = groupRounds.firstWhereOrNull(
          (r) => r.month == month.month && r.year == month.year);

      final totalSlots =
          memberships.fold<double>(0, (sum, m) => sum + m.installmentsCount);

      double actualMonthlyContributionPerSlot = group.monthlyContribution;
      if (currentRound != null &&
          currentRound.dividendDistributed != null &&
          totalSlots > 0) {
        final dividendPerSlot = currentRound.dividendDistributed! / totalSlots;
        actualMonthlyContributionPerSlot =
            group.monthlyContribution - dividendPerSlot;
      }

      for (final ms in memberships) {
        final member = allMembers.firstWhereOrNull((m) => m.id == ms.memberId);
        if (member == null) continue;

        final payments = await dao.getPaymentsForMembership(ms.id);

        final List<Payment> monthPayments = [];
        double collectedForMember = 0.0;
        for (final p in payments) {
          if (currentRound != null &&
              p.roundId == currentRound.id &&
              p.status == 'Completed') {
            monthPayments.add(p);
            collectedForMember += p.amount;
          }
        }

        final memberExpected =
            actualMonthlyContributionPerSlot * ms.installmentsCount;
        final now = DateTime.now();
        final dueDate =
            DateTime(month.year, month.month, group.paymentDueDate, 23, 59, 59);
        bool isLate =
            (collectedForMember < memberExpected && now.isAfter(dueDate)) ||
                monthPayments.any((p) => p.paymentDate.isAfter(dueDate));
        bool isWinnerInCurrentRound = currentRound?.winnerMemberId == member.id;
        bool isWinnerPaidInCurrentRound =
            isWinnerInCurrentRound && currentRound?.winnerPaymentMode != null;

        final detail = MembershipPaymentDetail(
          membership: ms,
          expectedAmount: memberExpected,
          collectedAmount: collectedForMember,
          payments: monthPayments,
        );

        if (mergedPayments.containsKey(member.id)) {
          final existing = mergedPayments[member.id]!;
          mergedPayments[member.id] = MemberPaymentInfo(
            member: member,
            details: [...existing.details, detail],
            collectedAmount: existing.collectedAmount + collectedForMember,
            isLate: existing.isLate || isLate,
            expectedAmount: existing.expectedAmount + memberExpected,
            isWinner: existing.isWinner || isWinnerInCurrentRound,
            hasWinnerBeenPaid:
                existing.hasWinnerBeenPaid || isWinnerPaidInCurrentRound,
            wonRoundIds: isWinnerInCurrentRound
                ? [...existing.wonRoundIds, currentRound!.id]
                : existing.wonRoundIds,
          );
        } else {
          mergedPayments[member.id] = MemberPaymentInfo(
            member: member,
            details: [detail],
            collectedAmount: collectedForMember,
            isLate: isLate,
            expectedAmount: memberExpected,
            isWinner: isWinnerInCurrentRound,
            hasWinnerBeenPaid: isWinnerPaidInCurrentRound,
            wonRoundIds: isWinnerInCurrentRound ? [currentRound!.id] : [],
          );
        }
      }
    } // End of group loop

    // Derive totals from per-member data so they are always consistent:
    // totalExpected = sum of all members' expectedAmount
    // totalCollected = sum of all members' collectedAmount (capped at expected)
    // totalPending = sum of (expected - collected) where member hasn't fully paid
    double totalExpected = 0.0;
    double totalCollected = 0.0;
    double totalPending = 0.0;
    for (final info in mergedPayments.values) {
      totalExpected += info.expectedAmount;
      final capped = info.collectedAmount > info.expectedAmount
          ? info.expectedAmount
          : info.collectedAmount;
      totalCollected += capped;
      if (info.expectedAmount > info.collectedAmount) {
        totalPending += (info.expectedAmount - info.collectedAmount);
      }
    }

    return PaymentState(
      groups: groups,
      selectedGroupId: groupId,
      selectedMonth: month,
      memberPayments: mergedPayments.values.toList(),
      totalExpected: totalExpected,
      totalCollected: totalCollected,
      totalPending: totalPending,
    );
  }

  Future<void> changeGroup(int? groupId) async {
    final currentState = state.value;
    if (currentState == null) return;
    state = const AsyncValue.loading();

    try {
      final newState = await _loadDataForGroupAndMonth(
          groupId, currentState.selectedMonth, currentState.groups);
      state = AsyncValue.data(newState);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> changeMonth(DateTime month) async {
    final currentState = state.value;
    if (currentState == null) return;
    state = const AsyncValue.loading();

    try {
      final newState = await _loadDataForGroupAndMonth(
          currentState.selectedGroupId, month, currentState.groups);
      state = AsyncValue.data(newState);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> recordCustomPayment({
    required int memberId,
    required double amount,
    required String paymentMode,
    String? remarks,
    DateTime? paymentDate,
    String? receiptPhotoPath,
    String? collectorName,
  }) async {
    final currentState = state.value;
    if (currentState == null) return;

    final dao = ref.read(appDaoProvider);
    final memberInfo = currentState.memberPayments
        .firstWhereOrNull((m) => m.member.id == memberId);
    if (memberInfo == null) return;

    final group = currentState.groups
        .firstWhereOrNull((g) => g.id == currentState.selectedGroupId);
    if (group == null) return;

    double remainingToDistribute = amount;
    int monthOffset = 0;

    final groupRounds = await dao.getRoundsForGroup(group.id);
    int currentRoundNumber = groupRounds.length;

    while (remainingToDistribute > 0) {
      final targetMonthDate = DateTime(currentState.selectedMonth.year,
          currentState.selectedMonth.month + monthOffset);

      var round = groupRounds.firstWhereOrNull((r) =>
          r.month == targetMonthDate.month && r.year == targetMonthDate.year);
      int roundId;
      if (round == null) {
        currentRoundNumber++;
        roundId = await dao.insertRound(RoundsCompanion.insert(
          groupId: group.id,
          roundNumber: currentRoundNumber,
          month: targetMonthDate.month,
          year: targetMonthDate.year,
        ));
      } else {
        roundId = round.id;
      }

      double expectedPerSlot = group.monthlyContribution;
      if (round != null &&
          round.winnerPaymentMode != null &&
          round.winnerPaymentMode!.contains('Dividend') &&
          round.dividendDistributed != null) {
        final memberships = await dao.getActiveMembershipsForGroup(group.id);
        final totalSlots =
            memberships.fold<double>(0, (sum, m) => sum + m.installmentsCount);
        if (totalSlots > 0) {
          expectedPerSlot = group.monthlyContribution -
              (round.dividendDistributed! / totalSlots);
        }
      }

      for (final detail in memberInfo.details) {
        if (remainingToDistribute <= 0) break;

        final membershipExpected =
            expectedPerSlot * detail.membership.installmentsCount;

        // Find how much has already been paid for THIS specific round and membership
        final existingPayments =
            await dao.getPaymentsForMembership(detail.membership.id);
        double alreadyPaidForRound = 0.0;
        for (final p in existingPayments) {
          if (p.roundId == roundId && p.status == 'Completed') {
            alreadyPaidForRound += p.amount;
          }
        }

        final stillNeededForThisMembership =
            membershipExpected - alreadyPaidForRound;
        if (stillNeededForThisMembership <= 0)
          continue; // Already fully paid for this round

        final paymentAmount =
            remainingToDistribute >= stillNeededForThisMembership
                ? stillNeededForThisMembership
                : remainingToDistribute;

        remainingToDistribute -= paymentAmount;

        await dao.insertPayment(PaymentsCompanion.insert(
          membershipId: detail.membership.id,
          roundId: roundId,
          amount: paymentAmount,
          paymentMode: paymentMode,
          status: const drift.Value('Completed'),
          paymentDate: drift.Value(paymentDate ?? DateTime.now()),
          remarks: drift.Value(monthOffset > 0
              ? (remarks == null ? 'Advance Payment' : '$remarks (Advance)')
              : remarks),
          receiptPhotoPath: drift.Value(receiptPhotoPath),
          collectorName: drift.Value(collectorName),
        ));
      }

      monthOffset++;

      // Safety break to prevent infinite loop just in case
      if (monthOffset > 100) {
        // dump remainder in last round
        if (remainingToDistribute > 0 && memberInfo.details.isNotEmpty) {
          await dao.insertPayment(PaymentsCompanion.insert(
            membershipId: memberInfo.details.first.membership.id,
            roundId: roundId,
            amount: remainingToDistribute,
            paymentMode: paymentMode,
            status: const drift.Value('Completed'),
            paymentDate: drift.Value(paymentDate ?? DateTime.now()),
            remarks: const drift.Value('Excess Advance'),
          ));
          remainingToDistribute = 0;
        }
        break;
      }
    }

    // Reload
    state = AsyncValue.data(await _loadDataForGroupAndMonth(
        currentState.selectedGroupId,
        currentState.selectedMonth,
        currentState.groups));
    ref.invalidate(adminDashboardMetricsProvider);

    try {
      await NotificationService().showNotification(
        id: memberId,
        title: 'Payment Received',
        body:
            '₹${amount.toStringAsFixed(0)} received from ${memberInfo.member.name}',
      );
    } catch (_) {}
  }

  Future<void> deletePayment(int paymentId) async {
    final currentState = state.value;
    if (currentState == null) return;
    final dao = ref.read(appDaoProvider);
    await dao.deletePayment(paymentId);
    state = AsyncValue.data(await _loadDataForGroupAndMonth(
        currentState.selectedGroupId,
        currentState.selectedMonth,
        currentState.groups));
    ref.invalidate(adminDashboardMetricsProvider);
  }

  Future<void> payWinner(
    int roundId,
    double amount, {
    String paymentMode = 'Cash',
  }) async {
    final dao = ref.read(appDaoProvider);
    final round = await dao.getRoundById(roundId);
    if (round == null) return;

    final currentPaid = round.winnerPaid ?? 0.0;
    final currentBalance = round.winnerBalance ?? 0.0;

    // If amount is 0, we assume it's a full payment
    final actualAmount = amount == 0.0 ? currentBalance : amount;

    final newPaid = currentPaid + actualAmount;
    final newLeft = (currentBalance - actualAmount) > 0
        ? (currentBalance - actualAmount)
        : 0.0;

    await dao.updateRound(RoundsCompanion(
      id: drift.Value(round.id),
      winnerPaid: drift.Value(newPaid),
      winnerLeft: drift.Value(newLeft),
      winnerPaymentMode: drift.Value(paymentMode),
    ));

    final currentState = state.value;
    if (currentState != null) {
      state = AsyncValue.data(await _loadDataForGroupAndMonth(
          currentState.selectedGroupId,
          currentState.selectedMonth,
          currentState.groups));
      ref.invalidate(adminDashboardMetricsProvider);
    }
  }

  Future<void> togglePayment(int memberId, double amount) async {
    final currentState = state.value;
    if (currentState == null) return;

    final dao = ref.read(appDaoProvider);

    final memberInfo = currentState.memberPayments
        .firstWhereOrNull((m) => m.member.id == memberId);
    if (memberInfo == null) return;

    if (memberInfo.allPayments.isNotEmpty) {
      // If payments exist, delete all payments for this month across all memberships
      for (final p in memberInfo.allPayments) {
        await dao.deletePayment(p.id);
      }
    } else {
      for (final detail in memberInfo.details) {
        final groupId = detail.membership.groupId;
        final groupRounds = await dao.getRoundsForGroup(groupId);

        var round = groupRounds.firstWhereOrNull((r) =>
            r.month == currentState.selectedMonth.month &&
            r.year == currentState.selectedMonth.year);
        int roundId;
        if (round == null) {
          final roundNumber = groupRounds.length + 1;
          roundId = await dao.insertRound(RoundsCompanion.insert(
            groupId: groupId,
            roundNumber: roundNumber,
            month: currentState.selectedMonth.month,
            year: currentState.selectedMonth.year,
          ));
        } else {
          roundId = round.id;
        }

        await dao.insertPayment(PaymentsCompanion.insert(
          membershipId: detail.membership.id,
          roundId: roundId,
          amount: detail.expectedAmount,
          paymentMode: 'Cash',
          status: const drift.Value('Completed'),
          paymentDate: drift.Value(currentState.selectedMonth),
        ));
      }
    }

    // Reload
    state = AsyncValue.data(await _loadDataForGroupAndMonth(
        currentState.selectedGroupId,
        currentState.selectedMonth,
        currentState.groups));
    ref.invalidate(adminDashboardMetricsProvider);
  }
}
