import 'package:flutter/foundation.dart';
import 'package:drift/drift.dart';
import 'app_database.dart';
import 'tables.dart';

part 'app_dao.g.dart';

@DriftAccessor(tables: [
  Members,
  Groups,
  Memberships,
  Rounds,
  Payments,
  AdminSettings,
  AuditLogs
])
class AppDao extends DatabaseAccessor<AppDatabase> with _$AppDaoMixin {
  AppDao(super.db);

  // Group Operations
  // NOTE: isDeleted column was added in schema v6. Schema v7 migration ensures
  // no NULL values remain (fixes 'Null check operator on null value' crash).
  Future<List<Group>> getAllGroups() =>
      (select(groups)..where((t) => t.isDeleted.equals(false))).get();
  Stream<List<Group>> watchAllGroups() =>
      (select(groups)..where((t) => t.isDeleted.equals(false))).watch();
  Future<List<Group>> getPastGroups() =>
      (select(groups)..where((t) => t.isDeleted.equals(true))).get();
  Stream<List<Group>> watchPastGroups() =>
      (select(groups)..where((t) => t.isDeleted.equals(true))).watch();
  Future<List<Group>> getAllGroupsWithDeleted() => select(groups).get();

  /// Fetches a single group by id regardless of isDeleted status.
  /// Use this when you need to load data for a past/deleted group.
  Future<Group?> getGroupById(int id) =>
      (select(groups)..where((t) => t.id.equals(id))).getSingleOrNull();
  Future<int> insertGroup(GroupsCompanion group) => into(groups).insert(group);
  Future<bool> updateGroup(GroupsCompanion group) async {
    final count = await (update(groups)
          ..where((tbl) => tbl.id.equals(group.id.value)))
        .write(group);
    return count > 0;
  }

  Future<void> deleteGroup(int id) async {
    await transaction(() async {
      // 1. Get memberships for the group
      final groupMemberships =
          await (select(memberships)..where((t) => t.groupId.equals(id))).get();
      final msIds = groupMemberships.map((m) => m.id).toList();

      if (msIds.isNotEmpty) {
        // 2. Delete all payments associated with these memberships
        await (delete(payments)..where((t) => t.membershipId.isIn(msIds))).go();

        // 3. Delete memberships
        await (delete(memberships)..where((t) => t.groupId.equals(id))).go();
      }

      // 4. Delete all rounds associated with the group
      await (delete(rounds)..where((t) => t.groupId.equals(id))).go();

      // 5. Delete the group itself
      await (delete(groups)..where((t) => t.id.equals(id))).go();
    });
  }

  // Member Operations
  Future<List<Member>> getAllMembers(
      {bool includeDeleted = false, int? limit, int? offset}) {
    final query = select(members);
    if (!includeDeleted) {
      query.where((t) => t.status.isNotValue('Deleted'));
    }
    if (limit != null) {
      query.limit(limit, offset: offset);
    }
    return query.get();
  }

  Stream<List<Member>> watchAllMembers({bool includeDeleted = false}) {
    final query = select(members);
    if (!includeDeleted) {
      query.where((t) => t.status.isNotValue('Deleted'));
    }
    return query.watch();
  }

  Future<int> insertMember(MembersCompanion member) =>
      into(members).insert(member);
  Future<Member?> getMemberById(int id) =>
      (select(members)..where((t) => t.id.equals(id))).getSingleOrNull();
  Future<bool> updateMember(MembersCompanion member) async {
    final count = await (update(members)
          ..where((tbl) => tbl.id.equals(member.id.value)))
        .write(member);
    return count > 0;
  }

  Future<int> deleteMember(int id) async {
    return await transaction(() async {
      // Annotate all payments for this member
      final mships = await getMembershipsForMember(id);
      for (final m in mships) {
        final payments = await getPaymentsForMembership(m.id);
        for (final p in payments) {
          final existingRemark = p.remarks ?? '';
          final newRemark = existingRemark.isEmpty
              ? 'Member Left Group'
              : '$existingRemark; Member Left Group';
          await updatePayment(PaymentsCompanion(
            id: Value(p.id),
            remarks: Value(newRemark),
          ));
        }
      }

      // Soft delete member
      return await (update(members)..where((tbl) => tbl.id.equals(id)))
          .write(const MembersCompanion(status: Value('Deleted')));
    });
  }

  Future<void> undoDeleteMember(int id) async {
    await transaction(() async {
      // Remove annotation from payments
      final mships = await getMembershipsForMember(id);
      for (final m in mships) {
        final payments = await getPaymentsForMembership(m.id);
        for (final p in payments) {
          final existingRemark = p.remarks ?? '';
          if (existingRemark.contains('Member Left Group')) {
            String newRemark = existingRemark
                .replaceAll('; Member Left Group', '')
                .replaceAll('Member Left Group', '')
                .trim();
            await updatePayment(PaymentsCompanion(
              id: Value(p.id),
              remarks: Value(newRemark),
            ));
          }
        }
      }

      // Restore member
      await (update(members)..where((tbl) => tbl.id.equals(id)))
          .write(const MembersCompanion(status: Value('Active')));
    });
  }

  // Membership Operations
  Future<List<Membership>> getAllMemberships() => select(memberships).get();
  Future<List<Membership>> getMembershipsForGroup(int groupId) =>
      (select(memberships)..where((tbl) => tbl.groupId.equals(groupId))).get();
  Future<List<Membership>> getActiveMembershipsForGroup(int groupId) async {
    final activeMembers = await getAllMembers();
    final activeIds = activeMembers.map((m) => m.id).toSet();
    final allMships = await getMembershipsForGroup(groupId);
    return allMships.where((m) => activeIds.contains(m.memberId)).toList();
  }

  Future<List<Membership>> getMembershipsForMember(int memberId) =>
      (select(memberships)..where((tbl) => tbl.memberId.equals(memberId)))
          .get();
  Future<int> insertMembership(MembershipsCompanion membership) =>
      into(memberships).insert(membership);
  Future<bool> updateMembership(MembershipsCompanion membership) async {
    final count = await (update(memberships)
          ..where((tbl) => tbl.id.equals(membership.id.value)))
        .write(membership);
    return count > 0;
  }

  Future<int> deleteMembership(int memberId, int groupId) =>
      (delete(memberships)
            ..where((tbl) =>
                tbl.memberId.equals(memberId) & tbl.groupId.equals(groupId)))
          .go();

  Future<void> removeMembershipAndUpdateGroup(int memberId, int groupId) async {
    await transaction(() async {
      // Get the membership ID to manually delete payments (in case cascade is missing)
      final membership = await (select(memberships)
            ..where((tbl) =>
                tbl.memberId.equals(memberId) & tbl.groupId.equals(groupId)))
          .getSingleOrNull();

      if (membership != null) {
        // Explicitly delete payments
        await (delete(payments)
              ..where((tbl) => tbl.membershipId.equals(membership.id)))
            .go();

        // Hard delete the membership
        await deleteMembership(memberId, groupId);
      }

      // Recalculate group chit value
      final allMemberships = await getActiveMembershipsForGroup(groupId);
      final totalSlots =
          allMemberships.fold<double>(0, (sum, m) => sum + m.installmentsCount);

      final group = await (select(groups)
            ..where((tbl) => tbl.id.equals(groupId)))
          .getSingleOrNull();
      if (group != null) {
        final newChitValue =
            group.monthlyContribution * totalSlots * group.totalMonths;
        await updateGroup(GroupsCompanion(
          id: Value(group.id),
          chitValue: Value(newChitValue),
        ));
      }
    });
  }

  Future<void> undoRemoveMembership(
      Membership membership, List<Payment> paymentList) async {
    await transaction(() async {
      // Re-insert membership
      final newMembershipId =
          await into(memberships).insert(MembershipsCompanion.insert(
        memberId: membership.memberId,
        groupId: membership.groupId,
        installmentsCount: Value(membership.installmentsCount),
        joinedAt: Value(membership.joinedAt),
      ));

      // Re-insert payments
      for (final p in paymentList) {
        await into(payments).insert(PaymentsCompanion.insert(
          membershipId: newMembershipId,
          roundId: p.roundId,
          amount: p.amount,
          paymentDate: Value(p.paymentDate),
          paymentMode: p.paymentMode,
          status: Value(p.status),
          remarks: Value(p.remarks),
        ));
      }

      // Recalculate group chit value
      final allMemberships =
          await getActiveMembershipsForGroup(membership.groupId);
      final totalSlots =
          allMemberships.fold<double>(0, (sum, m) => sum + m.installmentsCount);

      final group = await (select(groups)
            ..where((tbl) => tbl.id.equals(membership.groupId)))
          .getSingleOrNull();
      if (group != null) {
        final newChitValue =
            group.monthlyContribution * totalSlots * group.totalMonths;
        await updateGroup(GroupsCompanion(
          id: Value(group.id),
          chitValue: Value(newChitValue),
        ));
      }
    });
  }

  Future<List<Payment>> getAllPayments({int? limit, int? offset}) {
    final query = select(payments);
    if (limit != null) {
      query.limit(limit, offset: offset);
    }
    return query.get();
  }

  Future<int> deletePayment(int id) =>
      (delete(payments)..where((tbl) => tbl.id.equals(id))).go();
  Future<List<Payment>> getPaymentsForMembership(int membershipId) =>
      (select(payments)..where((tbl) => tbl.membershipId.equals(membershipId)))
          .get();

  /// Batch-load payments for many membership IDs in a single SQL query.
  Future<List<Payment>> getPaymentsForMembershipIds(List<int> membershipIds) {
    if (membershipIds.isEmpty) return Future.value([]);
    return (select(payments)
          ..where((tbl) => tbl.membershipId.isIn(membershipIds)))
        .get();
  }

  Future<int> insertPayment(PaymentsCompanion payment) =>
      into(payments).insert(payment);
  Future<bool> updatePayment(PaymentsCompanion payment) async {
    final count = await (update(payments)
          ..where((tbl) => tbl.id.equals(payment.id.value)))
        .write(payment);
    return count > 0;
  }

  Future<int> deletePaymentsForMembership(int membershipId) =>
      (delete(payments)..where((tbl) => tbl.membershipId.equals(membershipId)))
          .go();

  // Round Operations
  Future<List<Round>> getAllRounds() => select(rounds).get();
  Future<List<Round>> getRoundsForGroup(int groupId) =>
      (select(rounds)..where((t) => t.groupId.equals(groupId))).get();

  Future<Round?> getRoundById(int roundId) =>
      (select(rounds)..where((t) => t.id.equals(roundId))).getSingleOrNull();
  Future<int> insertRound(RoundsCompanion round) => into(rounds).insert(round);
  Future<bool> updateRound(RoundsCompanion round) async {
    final count = await (update(rounds)
          ..where((tbl) => tbl.id.equals(round.id.value)))
        .write(round);
    return count > 0;
  }

  Future<int> deleteRound(int id) =>
      (delete(rounds)..where((tbl) => tbl.id.equals(id))).go();
  Future<int> deleteRoundsForGroup(int groupId) =>
      (delete(rounds)..where((tbl) => tbl.groupId.equals(groupId))).go();

  Future<void> deleteGroupWithDependencies(int groupId) async {
    await (update(groups)..where((tbl) => tbl.id.equals(groupId)))
        .write(const GroupsCompanion(isDeleted: Value(true)));
  }

  Future<void> undoDeleteGroup(int groupId) async {
    await (update(groups)..where((tbl) => tbl.id.equals(groupId)))
        .write(const GroupsCompanion(isDeleted: Value(false)));
  }

  // Admin Settings
  Future<String?> getSetting(String key) async {
    final query = select(adminSettings)..where((tbl) => tbl.key.equals(key));
    final result = await query.getSingleOrNull();
    return result?.value;
  }

  Future<void> setSetting(String key, String value) async {
    await into(adminSettings).insert(
      AdminSettingsCompanion(key: Value(key), value: Value(value)),
      mode: InsertMode.insertOrReplace,
    );
  }

  Future<void> clearAllData() async {
    await transaction(() async {
      await delete(payments).go();
      await delete(rounds).go();
      await delete(memberships).go();
      await delete(groups).go();
      await delete(members).go();
      await delete(adminSettings).go();
      await delete(auditLogs).go();
    });
  }

  // Audit Logs
  Future<void> logAction(String action, String targetName,
      {String? details}) async {
    try {
      await into(auditLogs).insert(AuditLogsCompanion.insert(
        action: action,
        targetName: targetName,
        details: Value(details),
      ));
    } catch (e) {
      debugPrint('Failed to log action: $e');
    }
  }

  Future<List<AuditLog>> getRecentAuditLogs({int limit = 5}) {
    return (select(auditLogs)
          ..orderBy([
            (t) =>
                OrderingTerm(expression: t.timestamp, mode: OrderingMode.desc)
          ])
          ..limit(limit))
        .get();
  }
}
