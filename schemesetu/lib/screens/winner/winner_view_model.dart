import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:collection/collection.dart';
import 'package:drift/drift.dart' as drift;
import '../../data/local/app_database.dart';
import '../../data/providers/db_provider.dart';
import '../../services/notification_service.dart';

class WinnerHistoryItem {
  final Round round;
  final Group group;
  final Member winner;
  final Member? exchangedMember;

  WinnerHistoryItem({
    required this.round,
    required this.group,
    required this.winner,
    this.exchangedMember,
  });
}

class WinnerState {
  final List<WinnerHistoryItem> winners;
  final List<Group> groups;

  WinnerState({
    required this.winners,
    required this.groups,
  });
}

final winnerProvider = FutureProvider.autoDispose<WinnerState>((ref) async {
  final dao = ref.watch(appDaoProvider);
  final allRounds = await dao.getAllRounds();
  final allGroups = await dao.getAllGroups();
  final allMembers = await dao.getAllMembers();

  final List<WinnerHistoryItem> winnersList = [];

  for (final r in allRounds) {
    if (r.winnerMemberId != null) {
      final group = allGroups.firstWhereOrNull((g) => g.id == r.groupId);
      final winner =
          allMembers.firstWhereOrNull((m) => m.id == r.winnerMemberId);
      final exchanged = r.exchangedToMemberId != null
          ? allMembers.firstWhereOrNull((m) => m.id == r.exchangedToMemberId)
          : null;
      if (group != null && winner != null) {
        winnersList.add(WinnerHistoryItem(
          round: r,
          group: group,
          winner: winner,
          exchangedMember: exchanged,
        ));
      }
    }
  }

  // Sort by most recent round/date
  winnersList.sort((a, b) {
    final yearComp = b.round.year.compareTo(a.round.year);
    if (yearComp != 0) return yearComp;
    return b.round.month.compareTo(a.round.month);
  });

  return WinnerState(winners: winnersList, groups: allGroups);
});

final winnerActionsProvider = Provider((ref) => WinnerActions(ref));

class WinnerActions {
  final Ref ref;
  WinnerActions(this.ref);

  Future<List<Member>> getEligibleMembers(int groupId) async {
    final dao = ref.read(appDaoProvider);
    final memberships = await dao.getMembershipsForGroup(groupId);
    final allMembers = await dao.getAllMembers();
    final groupRounds = await dao.getRoundsForGroup(groupId);
    final winnerIds = groupRounds
        .where((r) => r.winnerMemberId != null)
        .map((r) => r.winnerMemberId!)
        .toSet();

    return allMembers
        .where((m) =>
            memberships.any((ms) => ms.memberId == m.id) &&
            !winnerIds.contains(m.id))
        .toList();
  }

  Future<void> declareWinner({
    required int groupId,
    required int roundNumber,
    required DateTime date,
    required double bidAmount,
    required int winnerMemberId,
    required String paymentMode,
    String? remarks,
    double? winnerPaid,
    double? winnerBalance,
    double? winnerLeft,
    int? exchangedToMemberId,
    String? exchangeNote,
  }) async {
    final dao = ref.read(appDaoProvider);
    const foremanComm = 0.0;
    final dividend = bidAmount > 0 ? bidAmount : 0.0;

    final groupRounds = await dao.getRoundsForGroup(groupId);
    final existingRound = groupRounds
        .firstWhereOrNull((r) => r.month == date.month && r.year == date.year);

    if (existingRound != null) {
      await dao.updateRound(RoundsCompanion(
        id: drift.Value(existingRound.id),
        roundNumber: drift.Value(roundNumber),
        bidAmount: drift.Value(bidAmount),
        winnerMemberId: drift.Value(winnerMemberId),
        foremanCommission: const drift.Value(foremanComm),
        dividendDistributed: drift.Value(dividend),
        winnerPaymentMode: drift.Value(paymentMode),
        winnerRemarks: drift.Value(remarks),
        winnerPaid: drift.Value(winnerPaid),
        winnerBalance: drift.Value(winnerBalance),
        winnerLeft: drift.Value(winnerLeft),
        exchangedToMemberId: drift.Value(exchangedToMemberId),
        exchangeNote: drift.Value(exchangeNote),
      ));
    } else {
      await dao.insertRound(RoundsCompanion.insert(
        groupId: groupId,
        roundNumber: roundNumber,
        month: date.month,
        year: date.year,
        bidAmount: drift.Value(bidAmount),
        winnerMemberId: drift.Value(winnerMemberId),
        foremanCommission: const drift.Value(foremanComm),
        dividendDistributed: drift.Value(dividend),
        winnerPaymentMode: drift.Value(paymentMode),
        winnerRemarks: drift.Value(remarks),
        winnerPaid: drift.Value(winnerPaid),
        winnerBalance: drift.Value(winnerBalance),
        winnerLeft: drift.Value(winnerLeft),
        exchangedToMemberId: drift.Value(exchangedToMemberId),
        exchangeNote: drift.Value(exchangeNote),
      ));
    }
    ref.invalidate(winnerProvider);

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

  Future<void> updatePayoutAndGuarantor({
    required int roundId,
    required String payoutStatus,
    required DateTime? payoutDate,
    required String? guarantor1Name,
    required String? guarantor1Phone,
    required String? guarantor2Name,
    required String? guarantor2Phone,
    required int? guarantorMemberId,
    double? winnerPaid,
    double? winnerBalance,
    double? winnerLeft,
    String? winnerPaymentMode,
    String? winnerRemarks,
    int? exchangedToMemberId,
    String? exchangeNote,
  }) async {
    final dao = ref.read(appDaoProvider);
    await dao.updateRound(RoundsCompanion(
      id: drift.Value(roundId),
      payoutStatus: drift.Value(payoutStatus),
      payoutDate: drift.Value(payoutDate),
      guarantor1Name: drift.Value(guarantor1Name),
      guarantor1Phone: drift.Value(guarantor1Phone),
      guarantor2Name: drift.Value(guarantor2Name),
      guarantor2Phone: drift.Value(guarantor2Phone),
      guarantorMemberId: drift.Value(guarantorMemberId),
      winnerPaid: drift.Value(winnerPaid),
      winnerBalance: drift.Value(winnerBalance),
      winnerLeft: drift.Value(winnerLeft),
      winnerPaymentMode: drift.Value(winnerPaymentMode),
      winnerRemarks: drift.Value(winnerRemarks),
      exchangedToMemberId: drift.Value(exchangedToMemberId),
      exchangeNote: drift.Value(exchangeNote),
    ));
    ref.invalidate(winnerProvider);
  }

  Future<List<Member>> getGroupMembers(int groupId) async {
    final dao = ref.read(appDaoProvider);
    final memberships = await dao.getMembershipsForGroup(groupId);
    final allMembers = await dao.getAllMembers();
    return allMembers
        .where((m) => memberships.any((ms) => ms.memberId == m.id))
        .toList();
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
    ref.invalidate(winnerProvider);
  }
}
