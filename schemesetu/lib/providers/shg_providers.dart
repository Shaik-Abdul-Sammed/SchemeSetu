import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:chit_fund_app/data/providers/db_provider.dart';
import 'package:chit_fund_app/data/local/app_database.dart';
import 'package:chit_fund_app/data/local/shg_dao.dart';

final shgDaoProvider = Provider<SHGDao>((ref) {
  final db = ref.watch(appDatabaseProvider);
  return db.sHGDao;
});

// Provides the list of all SHG groups
final shgGroupsProvider = FutureProvider<List<SHGGroup>>((ref) async {
  final dao = ref.watch(shgDaoProvider);
  return await dao.getAllGroups();
});

// A family provider to fetch a specific group
final shgGroupDetailProvider =
    FutureProvider.family<SHGGroup, int>((ref, groupId) async {
  final dao = ref.watch(shgDaoProvider);
  return await dao.getGroupById(groupId);
});

class MemberWithRole {
  final Member member;
  final SHGMembership membership;

  MemberWithRole({required this.member, required this.membership});

  int get id => membership.id;
  int get memberId => member.id;
  String get name => member.name;
  String get phone => member.phone;
  String get role => membership.role;
}

// Provides members for a specific group
final shgMembersProvider =
    FutureProvider.family<List<MemberWithRole>, int>((ref, groupId) async {
  final dao = ref.watch(shgDaoProvider);
  final rows = await dao.getMembersWithRoleByGroupId(groupId);
  return rows.map((row) {
    return MemberWithRole(
      member: row.readTable(dao.members),
      membership: row.readTable(dao.sHGMemberships),
    );
  }).toList();
});

// Provides meetings for a specific group
final shgMeetingsProvider =
    FutureProvider.family<List<SHGMeeting>, int>((ref, groupId) async {
  final dao = ref.watch(shgDaoProvider);
  return await dao.getMeetingsByGroupId(groupId);
});

// Provides cashbook entries for a specific group
final shgCashBookProvider =
    FutureProvider.family<List<SHGCashBook>, int>((ref, groupId) async {
  final dao = ref.watch(shgDaoProvider);
  return await dao.getCashBookEntries(groupId);
});

// Provides savings for a specific member
final shgSavingsProvider =
    FutureProvider.family<List<SHGSaving>, int>((ref, membershipId) async {
  final dao = ref.watch(shgDaoProvider);
  return await dao.getSavingsByMembershipId(membershipId);
});

// Provides loans for a specific member
final shgLoansProvider =
    FutureProvider.family<List<SHGLoan>, int>((ref, membershipId) async {
  final dao = ref.watch(shgDaoProvider);
  return await dao.getLoansByMembershipId(membershipId);
});

// Provides attendances for a specific meeting
final shgMeetingAttendancesProvider =
    FutureProvider.family<List<SHGAttendance>, int>((ref, meetingId) async {
  final dao = ref.watch(shgDaoProvider);
  return await dao.getAttendancesByMeetingId(meetingId);
});

// Provides mapping of meetingId -> attendee count for a group
final shgGroupAttendeeCountsProvider =
    FutureProvider.family<Map<int, int>, int>((ref, groupId) async {
  final dao = ref.watch(shgDaoProvider);
  return await dao.getAttendeeCountsForGroup(groupId);
});

class ShgDashboardStats {
  final int activeLoans;
  final double totalSavings;
  ShgDashboardStats({required this.activeLoans, required this.totalSavings});
}

// Provides aggregate stats across all SHG groups for dashboard
final shgDashboardStatsProvider =
    FutureProvider<ShgDashboardStats>((ref) async {
  final dao = ref.watch(shgDaoProvider);
  final activeLoans = await dao.getActiveLoansCount();
  final totalSavings = await dao.getTotalSavings();
  return ShgDashboardStats(
    activeLoans: activeLoans,
    totalSavings: totalSavings,
  );
});
