import 'package:drift/drift.dart';
import 'app_database.dart';
import 'tables.dart';

part 'shg_dao.g.dart';

@DriftAccessor(tables: [
  SHGGroups,
  SHGMemberships,
  SHGMeetings,
  SHGSavings,
  SHGLoans,
  SHGLoanRepayments,
  SHGAttendances,
  SHGCashBooks,
  Members, // We might need Members to join member details
])
class SHGDao extends DatabaseAccessor<AppDatabase> with _$SHGDaoMixin {
  final AppDatabase db;
  SHGDao(this.db) : super(db);

  // --- Groups ---
  Future<List<SHGGroup>> getAllGroups() => select(sHGGroups).get();
  Future<SHGGroup> getGroupById(int id) =>
      (select(sHGGroups)..where((t) => t.id.equals(id))).getSingle();
  Future<int> insertGroup(SHGGroupsCompanion group) =>
      into(sHGGroups).insert(group);
  Future<bool> updateGroup(SHGGroupsCompanion group) =>
      update(sHGGroups).replace(group);
  Future<int> deleteGroup(int id) =>
      (delete(sHGGroups)..where((t) => t.id.equals(id))).go();

  // --- Memberships ---
  Future<List<SHGMembership>> getMembersByGroupId(int groupId) =>
      (select(sHGMemberships)..where((t) => t.groupId.equals(groupId))).get();

  Future<List<TypedResult>> getMembersWithRoleByGroupId(int groupId) {
    return (select(sHGMemberships).join([
      innerJoin(members, members.id.equalsExp(sHGMemberships.memberId)),
    ])..where(sHGMemberships.groupId.equals(groupId)))
        .get();
  }

  Future<int> addMemberToGroup(SHGMembershipsCompanion membership) =>
      into(sHGMemberships).insert(membership);

  Future<int> removeMemberFromGroup(int membershipId) =>
      (delete(sHGMemberships)..where((t) => t.id.equals(membershipId))).go();

  // --- Meetings & Attendances ---
  Future<List<SHGMeeting>> getMeetingsByGroupId(int groupId) =>
      (select(sHGMeetings)..where((t) => t.groupId.equals(groupId))).get();
  Future<int> insertMeeting(SHGMeetingsCompanion meeting) =>
      into(sHGMeetings).insert(meeting);
  Future<int> insertAttendance(SHGAttendancesCompanion att) =>
      into(sHGAttendances).insert(att);
  Future<void> insertAttendances(List<SHGAttendancesCompanion> atts) =>
      batch((b) => b.insertAll(sHGAttendances, atts));
  Future<List<SHGAttendance>> getAttendancesByMeetingId(int meetingId) =>
      (select(sHGAttendances)..where((t) => t.meetingId.equals(meetingId))).get();
  Future<Map<int, int>> getAttendeeCountsForGroup(int groupId) async {
    final meetings = await getMeetingsByGroupId(groupId);
    if (meetings.isEmpty) return {};
    final meetingIds = meetings.map((m) => m.id).toList();
    final attendances = await (select(sHGAttendances)
          ..where((t) => t.meetingId.isIn(meetingIds) & t.isPresent.equals(true)))
        .get();
    final counts = <int, int>{};
    for (final att in attendances) {
      counts[att.meetingId] = (counts[att.meetingId] ?? 0) + 1;
    }
    return counts;
  }

  // --- Savings ---
  Future<List<SHGSaving>> getSavingsByMembershipId(int membershipId) =>
      (select(sHGSavings)..where((t) => t.membershipId.equals(membershipId)))
          .get();
  Future<int> insertSaving(SHGSavingsCompanion saving) =>
      into(sHGSavings).insert(saving);

  // --- Loans ---
  Future<List<SHGLoan>> getLoansByMembershipId(int membershipId) =>
      (select(sHGLoans)..where((t) => t.membershipId.equals(membershipId)))
          .get();
  Future<int> insertLoan(SHGLoansCompanion loan) => into(sHGLoans).insert(loan);

  // --- Repayments ---
  Future<List<SHGLoanRepayment>> getRepaymentsByLoanId(int loanId) =>
      (select(sHGLoanRepayments)..where((t) => t.loanId.equals(loanId))).get();
  Future<int> insertRepayment(SHGLoanRepaymentsCompanion repayment) =>
      into(sHGLoanRepayments).insert(repayment);

  // --- CashBook ---
  Future<List<SHGCashBook>> getCashBookEntries(int groupId) =>
      (select(sHGCashBooks)..where((t) => t.groupId.equals(groupId))).get();
  Future<int> insertCashBookEntry(SHGCashBooksCompanion entry) =>
      into(sHGCashBooks).insert(entry);

  // --- Pending/Approval Queries ---
  Future<List<TypedResult>> getPendingLoansWithMemberDetails() {
    final query = select(sHGLoans).join([
      leftOuterJoin(
          sHGMemberships, sHGMemberships.id.equalsExp(sHGLoans.membershipId)),
      leftOuterJoin(members, members.id.equalsExp(sHGMemberships.memberId)),
    ])
      ..where(sHGLoans.status.equals('Pending'));
    return query.get();
  }

  Future<int> updateLoanStatus(int loanId, String status) {
    return (update(sHGLoans)..where((t) => t.id.equals(loanId)))
        .write(SHGLoansCompanion(status: Value(status)));
  }

  // --- Aggregate Stats ---
  Future<int> getActiveLoansCount() async {
    final rows = await (select(sHGLoans)
          ..where((t) => t.status.equals('Active')))
        .get();
    return rows.length;
  }

  Future<double> getTotalSavings() async {
    final rows = await select(sHGSavings).get();
    return rows.fold<double>(0.0, (sum, s) => sum + s.amount);
  }
}
