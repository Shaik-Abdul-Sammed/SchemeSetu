// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'shg_dao.dart';

// ignore_for_file: type=lint
mixin _$SHGDaoMixin on DatabaseAccessor<AppDatabase> {
  $SHGGroupsTable get sHGGroups => attachedDatabase.sHGGroups;
  $MembersTable get members => attachedDatabase.members;
  $SHGMembershipsTable get sHGMemberships => attachedDatabase.sHGMemberships;
  $SHGMeetingsTable get sHGMeetings => attachedDatabase.sHGMeetings;
  $SHGSavingsTable get sHGSavings => attachedDatabase.sHGSavings;
  $SHGLoansTable get sHGLoans => attachedDatabase.sHGLoans;
  $SHGLoanRepaymentsTable get sHGLoanRepayments =>
      attachedDatabase.sHGLoanRepayments;
  $SHGAttendancesTable get sHGAttendances => attachedDatabase.sHGAttendances;
  $SHGCashBooksTable get sHGCashBooks => attachedDatabase.sHGCashBooks;
  SHGDaoManager get managers => SHGDaoManager(this);
}

class SHGDaoManager {
  final _$SHGDaoMixin _db;
  SHGDaoManager(this._db);
  $$SHGGroupsTableTableManager get sHGGroups =>
      $$SHGGroupsTableTableManager(_db.attachedDatabase, _db.sHGGroups);
  $$MembersTableTableManager get members =>
      $$MembersTableTableManager(_db.attachedDatabase, _db.members);
  $$SHGMembershipsTableTableManager get sHGMemberships =>
      $$SHGMembershipsTableTableManager(
          _db.attachedDatabase, _db.sHGMemberships);
  $$SHGMeetingsTableTableManager get sHGMeetings =>
      $$SHGMeetingsTableTableManager(_db.attachedDatabase, _db.sHGMeetings);
  $$SHGSavingsTableTableManager get sHGSavings =>
      $$SHGSavingsTableTableManager(_db.attachedDatabase, _db.sHGSavings);
  $$SHGLoansTableTableManager get sHGLoans =>
      $$SHGLoansTableTableManager(_db.attachedDatabase, _db.sHGLoans);
  $$SHGLoanRepaymentsTableTableManager get sHGLoanRepayments =>
      $$SHGLoanRepaymentsTableTableManager(
          _db.attachedDatabase, _db.sHGLoanRepayments);
  $$SHGAttendancesTableTableManager get sHGAttendances =>
      $$SHGAttendancesTableTableManager(
          _db.attachedDatabase, _db.sHGAttendances);
  $$SHGCashBooksTableTableManager get sHGCashBooks =>
      $$SHGCashBooksTableTableManager(_db.attachedDatabase, _db.sHGCashBooks);
}
