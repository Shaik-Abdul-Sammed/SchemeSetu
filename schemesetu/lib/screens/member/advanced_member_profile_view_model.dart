import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:collection/collection.dart';
import '../../core/services/outstanding_calculator.dart';
import '../../data/local/app_database.dart';
import '../../data/providers/db_provider.dart';

class MemberPaymentHistoryItem {
  final String groupName;
  final int roundNumber;
  final double amount;
  final DateTime paymentDate;
  final String paymentMode;
  final String status;

  MemberPaymentHistoryItem({
    required this.groupName,
    required this.roundNumber,
    required this.amount,
    required this.paymentDate,
    required this.paymentMode,
    required this.status,
  });
}

class MemberUpcomingPaymentItem {
  final String groupName;
  final int roundNumber;
  final double amount;
  final String monthYear;

  MemberUpcomingPaymentItem({
    required this.groupName,
    required this.roundNumber,
    required this.amount,
    required this.monthYear,
  });
}

class MemberProfileData {
  final Member member;
  final OutstandingSummary summary;
  final int totalGroups;
  final double collectionPercentage;
  final String nextDue;
  final int currentRound;
  final List<Group> groups;
  final List<MemberPaymentHistoryItem> paymentHistory;
  final List<MemberUpcomingPaymentItem> upcomingPayments;
  final double trustScore;

  MemberProfileData({
    required this.member,
    required this.summary,
    required this.totalGroups,
    required this.collectionPercentage,
    required this.nextDue,
    required this.currentRound,
    required this.groups,
    required this.paymentHistory,
    required this.upcomingPayments,
    required this.trustScore,
  });
}

final memberProfileProvider = FutureProvider.family
    .autoDispose<MemberProfileData, int>((ref, memberId) async {
  final dao = ref.watch(appDaoProvider);
  final calculator = ref.watch(outstandingCalculatorProvider);

  final members = await dao.getAllMembers();
  final member = members.firstWhere((m) => m.id == memberId,
      orElse: () => throw Exception('Member not found'));

  final summary = await calculator.calculateForMember(member.id);
  final memberships = await dao.getMembershipsForMember(member.id);

  // Derive collection percentage
  double collPercent = 0.0;
  if (summary.overallInvestment > 0) {
    collPercent = (summary.totalPaid / summary.overallInvestment) * 100;
  }

  final groups = await dao.getAllGroups();
  final memberGroups = memberships
      .map((m) => groups.firstWhereOrNull((g) => g.id == m.groupId))
      .nonNulls
      .toList();

  final List<MemberPaymentHistoryItem> paymentHistory = [];
  final List<MemberUpcomingPaymentItem> upcomingPayments = [];

  final now = DateTime.now();
  for (final ms in memberships) {
    final group = groups.firstWhereOrNull((g) => g.id == ms.groupId);
    if (group == null) continue;
    final groupPayments = await dao.getPaymentsForMembership(ms.id);
    final groupRounds = await dao.getRoundsForGroup(group.id);

    // Past payments
    for (final p in groupPayments) {
      final round = groupRounds.firstWhereOrNull((r) => r.id == p.roundId);
      paymentHistory.add(MemberPaymentHistoryItem(
        groupName: group.name,
        roundNumber: round?.roundNumber ?? 1,
        amount: p.amount,
        paymentDate: p.paymentDate,
        paymentMode: p.paymentMode,
        status: p.status,
      ));
    }

    // Calculate current round
    int currentRoundNumber = ((now.year - group.startDate.year) * 12 +
            (now.month - group.startDate.month)) +
        1;
    if (currentRoundNumber < 1) currentRoundNumber = 1;

    // Upcoming payments (from current round to total months)
    for (int r = currentRoundNumber; r <= group.totalMonths; r++) {
      final roundMonth = (group.startDate.month + r - 2) % 12 + 1;
      final roundYear =
          group.startDate.year + ((group.startDate.month + r - 2) ~/ 12);

      // check if paid for this round already
      final roundObj =
          groupRounds.firstWhereOrNull((gr) => gr.roundNumber == r);
      final hasCompletedPayment = roundObj != null &&
          groupPayments
              .any((p) => p.roundId == roundObj.id && p.status == 'Completed');

      if (!hasCompletedPayment) {
        const monthsEn = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec'
        ];
        final monthYearStr = '${monthsEn[roundMonth - 1]} $roundYear';
        upcomingPayments.add(MemberUpcomingPaymentItem(
          groupName: group.name,
          roundNumber: r,
          amount: group.monthlyContribution,
          monthYear: monthYearStr,
        ));
      }
    }
  }

  // Sort payment history by date descending
  paymentHistory.sort((a, b) => b.paymentDate.compareTo(a.paymentDate));

  // Calculate Trust Score
  double trustScore = 100.0;
  if (summary.overallInvestment > 0) {
    double pendingRatio = summary.totalPending / summary.overallInvestment;
    trustScore -= (pendingRatio * 50);
  }
  trustScore = trustScore.clamp(0.0, 100.0);

  return MemberProfileData(
    member: member,
    summary: summary,
    totalGroups: memberships.length,
    collectionPercentage: collPercent,
    nextDue: '15th',
    currentRound: 1,
    groups: memberGroups,
    paymentHistory: paymentHistory,
    upcomingPayments: upcomingPayments,
    trustScore: trustScore,
  );
});
