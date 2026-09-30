import '../../data/local/app_dao.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/providers/db_provider.dart';
import 'calendar_engine.dart';

class OutstandingSummary {
  final double totalPending;
  final double totalPaid;
  final double overallInvestment;
  final Map<int, double> groupWisePending;
  final Map<int, double> groupWisePaid;

  OutstandingSummary({
    required this.totalPending,
    required this.totalPaid,
    required this.overallInvestment,
    required this.groupWisePending,
    required this.groupWisePaid,
  });
}

class OutstandingCalculator {
  final AppDao dao;
  final CalendarEngine calendar;

  OutstandingCalculator(this.dao, this.calendar);

  Future<OutstandingSummary> calculateForMember(int memberId) async {
    final memberships = await dao.getMembershipsForMember(memberId);

    double totalPending = 0;
    double totalPaid = 0;
    double overallInvestment = 0;
    final Map<int, double> groupWisePending = {};
    final Map<int, double> groupWisePaid = {};

    final groups = await dao.getAllGroups();
    final groupMap = {for (var g in groups) g.id: g};

    for (final membership in memberships) {
      final group = groupMap[membership.groupId];
      if (group == null) continue;

      final payments = await dao.getPaymentsForMembership(membership.id);

      double gPending = 0;
      double gPaid = 0;

      // Overall Investment expected for the member for this group so far
      // Based on current round

      for (final payment in payments) {
        if (payment.status == 'Completed') {
          gPaid += payment.amount;
        }
      }

      final currentRound = calendar.determineCurrentRound(group.startDate);
      final expectedSoFar =
          currentRound.clamp(0, group.totalMonths) * group.monthlyContribution;
      gPending = expectedSoFar - gPaid;
      if (gPending < 0) gPending = 0;

      groupWisePaid[group.id] = gPaid;
      groupWisePending[group.id] = gPending;

      totalPaid += gPaid;
      totalPending += gPending;
      // The total expected investment over the group's lifetime:
      overallInvestment += group.totalMonths * group.monthlyContribution;
    }

    return OutstandingSummary(
      totalPending: totalPending,
      totalPaid: totalPaid,
      overallInvestment: overallInvestment,
      groupWisePending: groupWisePending,
      groupWisePaid: groupWisePaid,
    );
  }
}

final outstandingCalculatorProvider = Provider<OutstandingCalculator>((ref) {
  final dao = ref.watch(appDaoProvider);
  final calendar = ref.watch(calendarEngineProvider);
  return OutstandingCalculator(dao, calendar);
});
