import '../../data/local/app_dao.dart';
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/local/app_database.dart';
import '../../data/providers/db_provider.dart';
import 'package:drift/drift.dart' as drift;

final migrationServiceProvider = Provider((ref) {
  return MigrationService(ref.watch(appDaoProvider));
});

class MigrationService {
  final AppDao dao;

  MigrationService(this.dao);

  Future<void> migrateFromLegacy() async {
    final prefs = await SharedPreferences.getInstance();
    final hasMigrated = prefs.getBool('has_migrated_to_drift') ?? false;

    if (hasMigrated) return;

    // Legacy keys
    final String groupsJson = prefs.getString('groups') ?? '[]';
    final String membersJson = prefs.getString('members') ?? '[]';
    final String paymentsJson = prefs.getString('payments') ?? '[]';

    final List<dynamic> groupsData = json.decode(groupsJson);
    final List<dynamic> membersData = json.decode(membersJson);
    final List<dynamic> paymentsData = json.decode(paymentsJson);

    // Maps to keep track of old IDs to new auto-increment IDs
    final Map<String, int> groupIds = {};
    final Map<String, int> memberIds = {};

    // 1. Migrate Groups
    for (var g in groupsData) {
      final oldId = g['id'] as String;
      final newId = await dao.insertGroup(GroupsCompanion.insert(
        name: g['name'] ?? 'Unnamed Group',
        totalMonths: g['durationMonths'] ?? 12,
        chitValue: (g['installment'] ?? 0.0) *
            (g['totalMembers'] ?? 10) *
            (g['durationMonths'] ?? 12),
        monthlyContribution: g['installment'] ?? 0.0,
        startDate:
            DateTime.parse(g['startDate'] ?? DateTime.now().toIso8601String()),
        status: const drift.Value('Active'),
      ));
      groupIds[oldId] = newId;
    }

    // 2. Migrate Members and Memberships
    for (var m in membersData) {
      final oldId = m['id'] as String;
      final newId = await dao.insertMember(MembersCompanion.insert(
        name: m['name'] ?? 'Unknown',
        phone: m['mobile'] ?? '',
        whatsapp: drift.Value(m['mobile'] ?? ''),
        address: drift.Value(m['address'] ?? ''),
        status: const drift.Value('Active'),
        photoPath: drift.Value(m['photoUrl']),
      ));
      memberIds[oldId] = newId;

      final mGroupIds = List<String>.from(m['groupIds'] ?? []);
      for (var oldGroupId in mGroupIds) {
        if (groupIds.containsKey(oldGroupId)) {
          await dao.insertMembership(MembershipsCompanion.insert(
            memberId: newId,
            groupId: groupIds[oldGroupId]!,
          ));
        }
      }
    }

    // 3. Migrate Payments
    final memberships = await dao.getAllMemberships();

    for (var p in paymentsData) {
      final oldGroupId = p['groupId'] as String;
      final oldMemberId = p['memberId'] as String;

      final newGroupId = groupIds[oldGroupId];
      final newMemberId = memberIds[oldMemberId];

      if (newGroupId != null && newMemberId != null) {
        // Find membership
        try {
          final ms = memberships.firstWhere(
              (m) => m.groupId == newGroupId && m.memberId == newMemberId);

          await dao.insertPayment(PaymentsCompanion.insert(
            membershipId: ms.id,
            roundId: 1, // Default round
            amount: p['amount'] ?? 0.0,
            paymentMode: 'Cash', // Default
            status: drift.Value(p['isPaid'] == true ? 'Completed' : 'Pending'),
            paymentDate: drift.Value(p['paymentDate'] != null
                ? DateTime.parse(p['paymentDate'])
                : DateTime.now()),
          ));
        } catch (e) {
          // Membership might not exist
        }
      }
    }

    // Mark as migrated
    await prefs.setBool('has_migrated_to_drift', true);
  }
}
