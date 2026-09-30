// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'app_dao.dart';

// ignore_for_file: type=lint
mixin _$AppDaoMixin on DatabaseAccessor<AppDatabase> {
  $MembersTable get members => attachedDatabase.members;
  $GroupsTable get groups => attachedDatabase.groups;
  $MembershipsTable get memberships => attachedDatabase.memberships;
  $RoundsTable get rounds => attachedDatabase.rounds;
  $PaymentsTable get payments => attachedDatabase.payments;
  $AdminSettingsTable get adminSettings => attachedDatabase.adminSettings;
  $AuditLogsTable get auditLogs => attachedDatabase.auditLogs;
  AppDaoManager get managers => AppDaoManager(this);
}

class AppDaoManager {
  final _$AppDaoMixin _db;
  AppDaoManager(this._db);
  $$MembersTableTableManager get members =>
      $$MembersTableTableManager(_db.attachedDatabase, _db.members);
  $$GroupsTableTableManager get groups =>
      $$GroupsTableTableManager(_db.attachedDatabase, _db.groups);
  $$MembershipsTableTableManager get memberships =>
      $$MembershipsTableTableManager(_db.attachedDatabase, _db.memberships);
  $$RoundsTableTableManager get rounds =>
      $$RoundsTableTableManager(_db.attachedDatabase, _db.rounds);
  $$PaymentsTableTableManager get payments =>
      $$PaymentsTableTableManager(_db.attachedDatabase, _db.payments);
  $$AdminSettingsTableTableManager get adminSettings =>
      $$AdminSettingsTableTableManager(_db.attachedDatabase, _db.adminSettings);
  $$AuditLogsTableTableManager get auditLogs =>
      $$AuditLogsTableTableManager(_db.attachedDatabase, _db.auditLogs);
}
