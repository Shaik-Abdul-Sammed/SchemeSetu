import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../data/local/app_database.dart';
import '../../data/providers/db_provider.dart';

class GroupDueInfo {
  final Group group;
  final double expected;
  final double collected;
  final double pending;
  final int totalMembers;
  final int paidMembersCount;
  final double totalSlots;

  GroupDueInfo({
    required this.group,
    required this.expected,
    required this.collected,
    required this.pending,
    required this.totalMembers,
    required this.paidMembersCount,
    required this.totalSlots,
  });
}

class RecentActivity {
  final String title;
  final String subtitle;
  final DateTime timestamp;
  final String type; // 'payment' or 'round'

  RecentActivity({
    required this.title,
    required this.subtitle,
    required this.timestamp,
    required this.type,
  });
}

class DashboardMetrics {
  final double todaysCollection;
  final double todaysPending;
  final double monthlyCollection;
  final double monthlyPending;
  final int totalMembers;
  final int totalGroups;
  final double totalForemanEarnings;
  final double totalDividendsDistributed;
  final int auctionWinnersPaidCount; // Auction Paid
  final int auctionWinnersPendingCount; // Auction Left
  final List<GroupDueInfo> groupDues;
  final List<RecentActivity> recentActivities;
  final List<FlSpot> weeklySpots;
  final List<FlSpot> monthlySpots;
  final Map<String, double> paymentModeBreakdown;
  final Map<String, int> occupationSummary;
  final Map<String, double> foremanCommissionsByGroup;

  DashboardMetrics({
    this.todaysCollection = 0,
    this.todaysPending = 0,
    this.monthlyCollection = 0,
    this.monthlyPending = 0,
    this.totalMembers = 0,
    this.totalGroups = 0,
    this.totalForemanEarnings = 0,
    this.totalDividendsDistributed = 0,
    this.auctionWinnersPaidCount = 0,
    this.auctionWinnersPendingCount = 0,
    required this.groupDues,
    required this.recentActivities,
    required this.weeklySpots,
    required this.monthlySpots,
    this.paymentModeBreakdown = const {},
    this.occupationSummary = const {},
    this.foremanCommissionsByGroup = const {},
  });
}

final adminDashboardMetricsProvider =
    FutureProvider.autoDispose<DashboardMetrics>((ref) async {
  ref.watch(dbUpdatesProvider);
  final dao = ref.watch(appDaoProvider);

  final members = await dao.getAllMembers();
  final groups = await dao.getAllGroups();
  final rounds = await dao.getAllRounds();
  final allMemberships = await dao.getAllMemberships();

  // --- Batch-load ALL payments in ONE query (prevents N+1 DB round-trips) ---
  final allPayments = await dao.getAllPayments();
  // Index by membershipId for O(1) lookup
  final Map<int, List<Payment>> paymentsByMsId = {};
  for (final p in allPayments) {
    paymentsByMsId.putIfAbsent(p.membershipId, () => []).add(p);
  }

  final now = DateTime.now();

  double todaysCollection = 0.0;
  for (final p in allPayments) {
    if (p.status == 'Completed' &&
        p.paymentDate.year == now.year &&
        p.paymentDate.month == now.month &&
        p.paymentDate.day == now.day) {
      todaysCollection += p.amount;
    }
  }

  double monthlyCollection = 0.0;
  double monthlyPending = 0.0;

  final List<GroupDueInfo> groupDues = [];

  final activeMemberIds = members.map((m) => m.id).toSet();
  final activeMemberships = allMemberships
      .where((m) => activeMemberIds.contains(m.memberId))
      .toList();

  // Calculate monthly metrics & group-wise dues — zero DB calls in this loop
  for (var group in groups) {
    final memberships =
        activeMemberships.where((m) => m.groupId == group.id).toList();
    final groupRounds = rounds.where((r) => r.groupId == group.id).toList();

    final currentRound = groupRounds.firstWhereOrNull(
      (r) => r.month == now.month && r.year == now.year,
    );

    // ── Current-month expected (slot-aware with dividend) ────────────
    final totalSlots =
        memberships.fold<double>(0, (s, m) => s + m.installmentsCount);
    final double monthContribution = group.monthlyContribution;
    final double monthExpected = monthContribution * totalSlots;

    // ── Current-month collected & paid count ─────────────────────────
    double monthCollected = 0.0;
    double monthPending = 0.0;
    int paidMembersCount = 0;

    for (var ms in memberships) {
      final mPayments = paymentsByMsId[ms.id] ?? [];

      // Current-month payment for this membership (via currentRound)
      double memberMonthCollected = 0.0;
      if (currentRound != null) {
        for (var p in mPayments) {
          final isWinnerPayout =
              (p.remarks ?? '').startsWith('🏆 Winner Payout:');
          if (p.roundId == currentRound.id &&
              p.status == 'Completed' &&
              !isWinnerPayout) {
            memberMonthCollected += p.amount;
          }
        }
      }

      final memberMonthExpected = monthContribution * ms.installmentsCount;

      if (memberMonthCollected >= memberMonthExpected) {
        paidMembersCount++;
      }

      // Cap the collected amount to not exceed expected amount for the UI display
      // This ensures if someone pays in advance, it doesn't inflate the current month's collection
      if (memberMonthCollected > memberMonthExpected) {
        memberMonthCollected = memberMonthExpected;
      }

      if (memberMonthCollected < memberMonthExpected) {
        monthPending += (memberMonthExpected - memberMonthCollected);
      }

      monthCollected += memberMonthCollected;
    }

    monthlyCollection += monthCollected;
    monthlyPending += monthPending;

    groupDues.add(GroupDueInfo(
      group: group,
      expected: monthExpected,
      collected: monthCollected,
      pending: monthPending,
      totalMembers: memberships.length,
      paidMembersCount: paidMembersCount,
      totalSlots: totalSlots,
    ));
  }

  // Calculate foreman earnings and dividends from rounds
  double totalForemanEarnings = 0.0;
  double totalDividendsDistributed = 0.0;
  int auctionWinnersPaidCount = 0;
  int auctionWinnersPendingCount = 0;

  for (var r in rounds) {
    if (r.foremanCommission != null) {
      totalForemanEarnings += r.foremanCommission!;
    }
    if (r.dividendDistributed != null) {
      totalDividendsDistributed += r.dividendDistributed!;
    }
    if (r.winnerMemberId != null) {
      if (r.payoutStatus == 'Released') {
        auctionWinnersPaidCount++;
      } else {
        auctionWinnersPendingCount++;
      }
    }
  }

  // ── Recent Activities Build ─────────────────────────────────────────
  final List<RecentActivity> recentActivities = [];

  // Reuse already-loaded allPayments — sort descending by date
  final sortedPayments = List<Payment>.from(allPayments)
    ..sort((a, b) => b.paymentDate.compareTo(a.paymentDate));
  final recentPayments =
      sortedPayments.where((p) => p.status == 'Completed').take(5);

  for (var p in recentPayments) {
    final ms = allMemberships.firstWhereOrNull((m) => m.id == p.membershipId);
    final memberName = ms != null
        ? (members.firstWhereOrNull((m) => m.id == ms.memberId)?.name ??
            'Member')
        : 'Member';
    final groupName = ms != null
        ? (groups.firstWhereOrNull((g) => g.id == ms.groupId)?.name ?? 'Group')
        : 'Group';
    final h = p.paymentDate.hour.toString().padLeft(2, '0');
    final min = p.paymentDate.minute.toString().padLeft(2, '0');

    recentActivities.add(RecentActivity(
      title: '$memberName paid ₹${p.amount.toStringAsFixed(0)}',
      subtitle: 'Group: $groupName • ${p.paymentMode} • $h:$min',
      timestamp: p.paymentDate,
      type: 'payment',
    ));
  }

  // Fetch all rounds, convert winner declarations
  final winnersRounds = rounds.where((r) => r.winnerMemberId != null).toList();
  winnersRounds.sort((a, b) => b.id.compareTo(a.id));
  final recentWinners = winnersRounds.take(3);

  for (var r in recentWinners) {
    final memberName =
        members.firstWhereOrNull((m) => m.id == r.winnerMemberId)?.name ??
            'Member';
    final groupName =
        groups.firstWhereOrNull((g) => g.id == r.groupId)?.name ?? 'Group';

    recentActivities.add(RecentActivity(
      title: '$memberName won the auction!',
      subtitle:
          'Group: $groupName • Bid discount: ₹${(r.bidAmount ?? 0).toStringAsFixed(0)}',
      timestamp: r.payoutDate ?? DateTime(r.year, r.month, 15),
      type: 'round',
    ));
  }

  // Fetch recent audit logs
  final recentAuditLogs = await dao.getRecentAuditLogs(limit: 5);
  for (var log in recentAuditLogs) {
    recentActivities.add(RecentActivity(
      title: log.action,
      subtitle: log.targetName,
      timestamp: log.timestamp,
      type: 'audit',
    ));
  }

  // Sort activities by timestamp descending
  recentActivities.sort((a, b) => b.timestamp.compareTo(a.timestamp));

  // ── Real Collection Trend Spot Calculations ───────────────────────
  final List<FlSpot> weeklySpots = [];
  for (int i = 6; i >= 0; i--) {
    final date = now.subtract(Duration(days: i));
    double dayTotal = 0.0;
    for (var p in allPayments) {
      if (p.status == 'Completed' &&
          p.paymentDate.year == date.year &&
          p.paymentDate.month == date.month &&
          p.paymentDate.day == date.day) {
        dayTotal += p.amount;
      }
    }
    // We use real data only
    weeklySpots.add(FlSpot((6 - i).toDouble(), dayTotal));
  }

  final List<FlSpot> monthlySpots = [];
  for (int i = 4; i >= 0; i--) {
    final year = now.month - i <= 0 ? now.year - 1 : now.year;
    final month = now.month - i <= 0 ? now.month - i + 12 : now.month - i;
    double monthTotal = 0.0;
    for (var p in allPayments) {
      if (p.status == 'Completed' &&
          p.paymentDate.year == year &&
          p.paymentDate.month == month) {
        monthTotal += p.amount;
      }
    }
    monthlySpots.add(FlSpot((4 - i).toDouble(), monthTotal));
  }

  final Map<String, double> paymentModeBreakdown = {
    'Cash': 0.0,
    'UPI': 0.0,
    'Bank': 0.0,
    'Transfer': 0.0
  };
  for (var p in allPayments) {
    if (p.status == 'Completed') {
      String mode = p.paymentMode.trim();
      // Normalize common cases
      if (mode.toLowerCase().contains('bank')) {
        mode = 'Bank';
      } else if (mode.toLowerCase().contains('upi')) {
        mode = 'UPI';
      } else if (mode.toLowerCase().contains('cash')) {
        mode = 'Cash';
      } else if (mode.toLowerCase().contains('transfer')) {
        mode = 'Transfer';
      } else {
        // Capitalize first letter
        if (mode.isNotEmpty) {
          mode = mode[0].toUpperCase() + mode.substring(1).toLowerCase();
        } else {
          mode = 'Other';
        }
      }
      paymentModeBreakdown[mode] =
          (paymentModeBreakdown[mode] ?? 0.0) + p.amount;
    }
  }

  final Map<String, int> occupationSummary = {};
  for (var m in members) {
    final occ = m.occupation ?? 'Other';
    final occLabel = occ.trim().isEmpty ? 'Other' : occ.trim();
    occupationSummary[occLabel] = (occupationSummary[occLabel] ?? 0) + 1;
  }

  final Map<String, double> foremanCommissionsByGroup = {};
  for (var r in rounds) {
    if (r.foremanCommission != null && r.foremanCommission! > 0) {
      final groupName =
          groups.firstWhereOrNull((g) => g.id == r.groupId)?.name ?? 'Group';
      foremanCommissionsByGroup[groupName] =
          (foremanCommissionsByGroup[groupName] ?? 0.0) + r.foremanCommission!;
    }
  }

  return DashboardMetrics(
    totalMembers: members.length,
    totalGroups: groups.length,
    monthlyCollection: monthlyCollection,
    monthlyPending: monthlyPending,
    todaysCollection: todaysCollection,
    todaysPending: 0.0,
    totalForemanEarnings: totalForemanEarnings,
    totalDividendsDistributed: totalDividendsDistributed,
    auctionWinnersPaidCount: auctionWinnersPaidCount,
    auctionWinnersPendingCount: auctionWinnersPendingCount,
    groupDues: groupDues,
    recentActivities: recentActivities.take(5).toList(),
    weeklySpots: weeklySpots,
    monthlySpots: monthlySpots,
    paymentModeBreakdown: paymentModeBreakdown,
    occupationSummary: occupationSummary,
    foremanCommissionsByGroup: foremanCommissionsByGroup,
  );
});

extension on List {
  dynamic firstWhereOrNull(bool Function(dynamic) test) {
    for (var element in this) {
      if (test(element)) return element;
    }
    return null;
  }
}
