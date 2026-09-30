import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import 'package:file_picker/file_picker.dart' as fp;
import 'package:drift/drift.dart' as drift;
import '../data/local/app_dao.dart';
import '../data/local/app_database.dart';
import '../data/providers/db_provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

class BackupService {
  static final BackupService _instance = BackupService._internal();
  factory BackupService() => _instance;
  BackupService._internal();

  static const _secureStorage = FlutterSecureStorage(
    aOptions: AndroidOptions(),
  );

  // Export all database collections to JSON
  Future<String> exportBackup(AppDatabase db) async {
    final dao = db.appDao;
    final shgDao = db.sHGDao;
    final groups = await dao.getAllGroupsWithDeleted();
    final members = await dao.getAllMembers(includeDeleted: true);
    final memberships = await dao.getAllMemberships();
    final payments = await dao.getAllPayments();
    final rounds = await dao.getAllRounds();

    final shgGroups = await shgDao.getAllGroups();
    final shgMemberships =
        await shgDao.db.select(shgDao.db.sHGMemberships).get();
    final shgMeetings = await shgDao.db.select(shgDao.db.sHGMeetings).get();
    final shgSavings = await shgDao.db.select(shgDao.db.sHGSavings).get();
    final shgLoans = await shgDao.db.select(shgDao.db.sHGLoans).get();
    final shgLoanRepayments =
        await shgDao.db.select(shgDao.db.sHGLoanRepayments).get();
    final shgAttendances =
        await shgDao.db.select(shgDao.db.sHGAttendances).get();
    final shgCashBooks = await shgDao.db.select(shgDao.db.sHGCashBooks).get();

    final Map<String, dynamic> backupData = {
      'timestamp': DateTime.now().toIso8601String(),
      'version': '2.0.0',
      'appName': 'SanghaSetu',
      'groups': groups
          .map((g) => {
                'id': g.id,
                'name': g.name,
                'chitValue': g.chitValue,
                'totalMonths': g.totalMonths,
                'monthlyContribution': g.monthlyContribution,
                'startDate': g.startDate.toIso8601String(),
                'status': g.status,
                'whatsappGroupLink': g.whatsappGroupLink,
                'isDeleted': g.isDeleted,
                'paymentDueDate': g.paymentDueDate,
              })
          .toList(),
      'members': members
          .map((m) => {
                'id': m.id,
                'name': m.name,
                'phone': m.phone,
                'whatsapp': m.whatsapp,
                'address': m.address,
                'status': m.status,
                'photoPath': m.photoPath,
                'occupation': m.occupation,
                'joiningDate': m.joiningDate.toIso8601String(),
                'trustScore': m.trustScore,
              })
          .toList(),
      'memberships': memberships
          .map((ms) => {
                'id': ms.id,
                'memberId': ms.memberId,
                'groupId': ms.groupId,
                'installmentsCount': ms.installmentsCount,
                'joinedAt': ms.joinedAt.toIso8601String(),
              })
          .toList(),
      'payments': payments
          .map((p) => {
                'id': p.id,
                'membershipId': p.membershipId,
                'roundId': p.roundId,
                'amount': p.amount,
                'paymentMode': p.paymentMode,
                'status': p.status,
                'paymentDate': p.paymentDate.toIso8601String(),
                'remarks': p.remarks,
                'collector': p.collector,
                'transactionId': p.transactionId,
                'receiptPhotoPath': p.receiptPhotoPath,
                'collectorName': p.collectorName,
              })
          .toList(),
      'rounds': rounds
          .map((r) => {
                'id': r.id,
                'groupId': r.groupId,
                'roundNumber': r.roundNumber,
                'month': r.month,
                'year': r.year,
                'bidAmount': r.bidAmount,
                'winnerMemberId': r.winnerMemberId,
                'payoutStatus': r.payoutStatus,
                'payoutDate': r.payoutDate?.toIso8601String(),
                'guarantor1Name': r.guarantor1Name,
                'guarantor1Phone': r.guarantor1Phone,
                'guarantor2Name': r.guarantor2Name,
                'guarantor2Phone': r.guarantor2Phone,
                'guarantorMemberId': r.guarantorMemberId,
                'foremanCommission': r.foremanCommission,
                'dividendDistributed': r.dividendDistributed,
                'winnerPaid': r.winnerPaid,
                'winnerBalance': r.winnerBalance,
                'winnerLeft': r.winnerLeft,
                'winnerPaymentMode': r.winnerPaymentMode,
                'winnerRemarks': r.winnerRemarks,
                'hijriDate': r.hijriDate,
                'exchangedToMemberId': r.exchangedToMemberId,
                'exchangeNote': r.exchangeNote,
              })
          .toList(),
      'stats': {
        'totalGroups': groups.length,
        'totalMembers': members.length,
        'totalMemberships': memberships.length,
        'totalPayments': payments.length,
        'totalRounds': rounds.length,
      },
      'shg': {
        'groups': shgGroups.map((g) => g.toJson()).toList(),
        'memberships': shgMemberships.map((m) => m.toJson()).toList(),
        'meetings': shgMeetings.map((m) => m.toJson()).toList(),
        'savings': shgSavings.map((s) => s.toJson()).toList(),
        'loans': shgLoans.map((l) => l.toJson()).toList(),
        'loanRepayments': shgLoanRepayments.map((r) => r.toJson()).toList(),
        'attendances': shgAttendances.map((a) => a.toJson()).toList(),
        'cashBooks': shgCashBooks.map((c) => c.toJson()).toList(),
      },
    };

    return const JsonEncoder.withIndent('  ').convert(backupData);
  }

  /// Export backup as a .json file and share it
  Future<String?> exportBackupToFile(AppDatabase db,
      {bool share = true}) async {
    try {
      final json = await exportBackup(db);
      final dir = await getApplicationDocumentsDirectory();
      final timestamp = DateTime.now()
          .toIso8601String()
          .replaceAll(':', '-')
          .split('.')
          .first;
      final fileName = 'sanghasetu_backup_$timestamp.json';
      final file = File('${dir.path}/$fileName');
      await file.writeAsString(json);

      // Share the file
      if (share) {
        await SharePlus.instance.share(ShareParams(
          files: [XFile(file.path)],
          subject: 'SanghaSetu Backup - $timestamp',
        ));
      }

      return file.path;
    } catch (e) {
      debugPrint('Export to file error: $e');
      return null;
    }
  }

  /// Perform automatic background backup (checks if 24 hours have passed)
  Future<void> performAutoBackup(AppDatabase db) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final lastBackup = prefs.getString('last_auto_backup_date');
      final now = DateTime.now();

      if (lastBackup != null) {
        final lastBackupDate = DateTime.parse(lastBackup);
        if (now.difference(lastBackupDate).inHours < 24) {
          return;
        }
      }

      final json = await exportBackup(db);
      final dir = await getApplicationDocumentsDirectory();
      final backupDir = Directory('${dir.path}/auto_backups');
      if (!await backupDir.exists()) {
        await backupDir.create(recursive: true);
      }

      final timestamp =
          now.toIso8601String().replaceAll(':', '-').split('.').first;
      final file = File('${backupDir.path}/auto_backup_$timestamp.json');
      await file.writeAsString(json);

      // Cleanup old auto backups (keep last 5)
      final files = backupDir.listSync().whereType<File>().toList();
      if (files.length > 5) {
        files.sort(
            (a, b) => a.lastModifiedSync().compareTo(b.lastModifiedSync()));
        for (var i = 0; i < files.length - 5; i++) {
          await files[i].delete();
        }
      }

      await prefs.setString('last_auto_backup_date', now.toIso8601String());
      debugPrint('Auto backup completed successfully.');
    } catch (e) {
      debugPrint('Auto backup failed: $e');
    }
  }

  /// Validate backup JSON structure before restoring
  BackupValidationResult validateBackup(String jsonString) {
    try {
      final data = jsonDecode(jsonString);
      if (data is! Map<String, dynamic>) {
        return BackupValidationResult(
          isValid: false,
          error: 'Invalid format: expected JSON object',
        );
      }

      // Check format
      final isLegacy = !data.containsKey('memberships');

      final requiredKeys = isLegacy
          ? ['groups', 'members', 'payments', 'winners']
          : ['groups', 'members', 'memberships', 'payments', 'rounds'];

      final missingKeys =
          requiredKeys.where((k) => !data.containsKey(k)).toList();
      if (missingKeys.isNotEmpty) {
        return BackupValidationResult(
          isValid: false,
          error: 'Missing required data: ${missingKeys.join(", ")}',
        );
      }

      // Validate arrays
      for (final key in requiredKeys) {
        if (data[key] is! List) {
          return BackupValidationResult(
            isValid: false,
            error: '"$key" must be a list',
          );
        }
      }

      // Validate groups have required fields
      for (final g in (data['groups'] as List)) {
        if (g is! Map<String, dynamic>) {
          return BackupValidationResult(
            isValid: false,
            error: 'Invalid group entry found',
          );
        }
        if (g['id'] == null || g['name'] == null) {
          return BackupValidationResult(
            isValid: false,
            error: 'Group missing required fields (id, name)',
          );
        }
      }

      // Validate members have required fields
      for (final m in (data['members'] as List)) {
        if (m is! Map<String, dynamic>) {
          return BackupValidationResult(
            isValid: false,
            error: 'Invalid member entry found',
          );
        }
        if (m['id'] == null || m['name'] == null) {
          return BackupValidationResult(
            isValid: false,
            error: 'Member missing required fields (id, name)',
          );
        }
      }

      final groups = (data['groups'] as List).length;
      final members = (data['members'] as List).length;
      final payments = (data['payments'] as List).length;
      final winners = isLegacy
          ? (data['winners'] as List).length
          : (data['rounds'] as List).length;
      final version =
          data['version']?.toString() ?? (isLegacy ? '1.1.0' : '2.0.0');
      final timestamp = data['timestamp']?.toString() ?? 'unknown';

      return BackupValidationResult(
        isValid: true,
        groupCount: groups,
        memberCount: members,
        paymentCount: payments,
        winnerCount: winners,
        version: version,
        timestamp: timestamp,
      );
    } catch (e) {
      return BackupValidationResult(
        isValid: false,
        error: 'Failed to parse JSON: ${e.toString()}',
      );
    }
  }

  // Restore database collections from JSON string
  Future<bool> restoreBackup(AppDatabase db, String jsonString) async {
    // Validate first
    final validation = validateBackup(jsonString);
    if (!validation.isValid) {
      debugPrint('Backup validation failed: ${validation.error}');
      return false;
    }

    try {
      final Map<String, dynamic> backupData = jsonDecode(jsonString);
      final dao = db.appDao;
      final shgDao = db.sHGDao;

      // Perform inside a transaction to ensure all-or-nothing consistency
      await dao.transaction(() async {
        // Clear current local database collections
        await dao.customStatement('DELETE FROM payments;');
        await dao.customStatement('DELETE FROM memberships;');
        await dao.customStatement('DELETE FROM rounds;');
        await dao.customStatement('DELETE FROM groups;');
        await dao.customStatement('DELETE FROM members;');

        final isLegacy = !backupData.containsKey('memberships');

        if (isLegacy) {
          // --- LEGACY RESTORE ---
          final List<dynamic> groupsData = backupData['groups'];
          final List<dynamic> membersData = backupData['members'];
          final List<dynamic> paymentsData = backupData['payments'];
          final List<dynamic> winnersData = backupData['winners'];

          final Map<String, int> groupIds = {};
          final Map<String, int> memberIds = {};

          // 1. Migrate Groups
          for (var g in groupsData) {
            final oldId = g['id'].toString();
            final newId = await dao.insertGroup(GroupsCompanion.insert(
              name: g['name'] ?? 'Unnamed Group',
              totalMonths: g['durationMonths'] ?? 12,
              chitValue: (g['installment'] ?? 0.0) *
                  (g['totalMembers'] ?? 10) *
                  (g['durationMonths'] ?? 12),
              monthlyContribution: g['installment'] ?? 0.0,
              startDate: DateTime.parse(
                  g['startDate'] ?? DateTime.now().toIso8601String()),
              status: const drift.Value('Active'),
            ));
            groupIds[oldId] = newId;
          }

          // 2. Migrate Members and Memberships
          for (var m in membersData) {
            final oldId = m['id'].toString();
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
            final oldGroupId = p['groupId'].toString();
            final oldMemberId = p['memberId'].toString();

            final newGroupId = groupIds[oldGroupId];
            final newMemberId = memberIds[oldMemberId];

            if (newGroupId != null && newMemberId != null) {
              try {
                final ms = memberships.firstWhere((m) =>
                    m.groupId == newGroupId && m.memberId == newMemberId);

                await dao.insertPayment(PaymentsCompanion.insert(
                  membershipId: ms.id,
                  roundId: 1, // Default round
                  amount: p['amount'] ?? 0.0,
                  paymentMode: p['method'] ?? 'Cash',
                  status: drift.Value(
                      p['isPaid'] == true ? 'Completed' : 'Pending'),
                  paymentDate: drift.Value(p['paymentDate'] != null
                      ? DateTime.parse(p['paymentDate'])
                      : DateTime.now()),
                ));
              } catch (e) {
                debugPrint('Failed to migrate individual payment record: $e');
              }
            }
          }

          // 4. Migrate Winners to Rounds
          for (var w in winnersData) {
            final oldGroupId = w['groupId'].toString();
            final oldMemberId = w['memberId'].toString();
            final newGroupId = groupIds[oldGroupId];
            final newMemberId = memberIds[oldMemberId];

            if (newGroupId != null && newMemberId != null) {
              final date =
                  DateTime.parse(w['date'] ?? DateTime.now().toIso8601String());
              await dao.insertRound(RoundsCompanion.insert(
                groupId: newGroupId,
                roundNumber: 1, // Default round
                month: date.month,
                year: date.year,
                bidAmount: drift.Value(w['amount'] ?? 0.0),
                winnerMemberId: drift.Value(newMemberId),
                payoutStatus: const drift.Value('Released'),
                payoutDate: drift.Value(date),
              ));
            }
          }
        } else {
          // --- NEW FORMAT RESTORE ---
          final List<dynamic> groupsData = backupData['groups'];
          final List<dynamic> membersData = backupData['members'];
          final List<dynamic> membershipsData = backupData['memberships'];
          final List<dynamic> paymentsData = backupData['payments'];
          final List<dynamic> roundsData = backupData['rounds'];

          final Map<int, int> groupIds = {};
          final Map<int, int> memberIds = {};
          final Map<int, int> membershipIds = {};
          final Map<int, int> roundIds = {};

          // 1. Groups
          for (var g in groupsData) {
            final oldId = g['id'] as int;
            final newId = await dao.insertGroup(GroupsCompanion.insert(
              name: g['name'],
              chitValue: g['chitValue'],
              totalMonths: g['totalMonths'],
              monthlyContribution: g['monthlyContribution'],
              startDate: DateTime.parse(g['startDate']),
              status: drift.Value(g['status']),
              whatsappGroupLink: drift.Value(g['whatsappGroupLink']),
              isDeleted: drift.Value(g['isDeleted'] ?? false),
              paymentDueDate: drift.Value(g['paymentDueDate'] ?? 15),
            ));
            groupIds[oldId] = newId;
          }

          // 2. Members
          for (var m in membersData) {
            final oldId = m['id'] as int;
            final newId = await dao.insertMember(MembersCompanion.insert(
              name: m['name'],
              phone: m['phone'],
              whatsapp: drift.Value(m['whatsapp']),
              address: drift.Value(m['address']),
              status: drift.Value(m['status'] ?? 'Active'),
              photoPath: drift.Value(m['photoPath']),
              occupation: drift.Value(m['occupation']),
              joiningDate: drift.Value(m['joiningDate'] != null
                  ? DateTime.parse(m['joiningDate'])
                  : DateTime.now()),
              trustScore: drift.Value(m['trustScore']),
            ));
            memberIds[oldId] = newId;
          }

          // 3. Memberships
          for (var ms in membershipsData) {
            final oldId = ms['id'] as int;
            final oldMemberId = ms['memberId'] as int;
            final oldGroupId = ms['groupId'] as int;

            final newMemberId = memberIds[oldMemberId];
            final newGroupId = groupIds[oldGroupId];

            if (newMemberId != null && newGroupId != null) {
              final newId =
                  await dao.insertMembership(MembershipsCompanion.insert(
                memberId: newMemberId,
                groupId: newGroupId,
                installmentsCount: drift.Value(ms['installmentsCount'] ?? 1.0),
                joinedAt: drift.Value(ms['joinedAt'] != null
                    ? DateTime.parse(ms['joinedAt'])
                    : DateTime.now()),
              ));
              membershipIds[oldId] = newId;
            }
          }

          // 4. Rounds
          for (var r in roundsData) {
            final oldId = r['id'] as int;
            final oldGroupId = r['groupId'] as int;
            final oldWinnerId = r['winnerMemberId'] as int?;
            final oldExchangedId = r['exchangedToMemberId'] as int?;

            final newGroupId = groupIds[oldGroupId];
            final newWinnerId =
                oldWinnerId != null ? memberIds[oldWinnerId] : null;
            final newExchangedId =
                oldExchangedId != null ? memberIds[oldExchangedId] : null;

            if (newGroupId != null) {
              final newId = await dao.insertRound(RoundsCompanion.insert(
                groupId: newGroupId,
                roundNumber: r['roundNumber'],
                month: r['month'],
                year: r['year'],
                bidAmount: drift.Value(r['bidAmount']),
                winnerMemberId: drift.Value(newWinnerId),
                payoutStatus: drift.Value(r['payoutStatus'] ?? 'Pending'),
                payoutDate: drift.Value(r['payoutDate'] != null
                    ? DateTime.parse(r['payoutDate'])
                    : null),
                guarantor1Name: drift.Value(r['guarantor1Name']),
                guarantor1Phone: drift.Value(r['guarantor1Phone']),
                guarantor2Name: drift.Value(r['guarantor2Name']),
                guarantor2Phone: drift.Value(r['guarantor2Phone']),
                guarantorMemberId: drift.Value(r['guarantorMemberId'] != null
                    ? memberIds[r['guarantorMemberId']]
                    : null),
                foremanCommission: drift.Value(r['foremanCommission']),
                dividendDistributed: drift.Value(r['dividendDistributed']),
                winnerPaid: drift.Value(r['winnerPaid']),
                winnerBalance: drift.Value(r['winnerBalance']),
                winnerLeft: drift.Value(r['winnerLeft']),
                winnerPaymentMode: drift.Value(r['winnerPaymentMode']),
                winnerRemarks: drift.Value(r['winnerRemarks']),
                hijriDate: drift.Value(r['hijriDate']),
                exchangedToMemberId: drift.Value(newExchangedId),
                exchangeNote: drift.Value(r['exchangeNote']),
              ));
              roundIds[oldId] = newId;
            }
          }

          // 5. Payments
          for (var p in paymentsData) {
            final oldMembershipId = p['membershipId'] as int;
            final oldRoundId = p['roundId'] as int;

            final newMembershipId = membershipIds[oldMembershipId];
            final newRoundId = roundIds[oldRoundId] ?? 1;

            if (newMembershipId != null) {
              await dao.insertPayment(PaymentsCompanion.insert(
                membershipId: newMembershipId,
                roundId: newRoundId,
                amount: p['amount'],
                paymentMode: p['paymentMode'] ?? 'Cash',
                status: drift.Value(p['status']),
                paymentDate: drift.Value(p['paymentDate'] != null
                    ? DateTime.parse(p['paymentDate'])
                    : DateTime.now()),
                remarks: drift.Value(p['remarks']),
                collector: drift.Value(p['collector']),
                transactionId: drift.Value(p['transactionId']),
                receiptPhotoPath: drift.Value(p['receiptPhotoPath']),
                collectorName: drift.Value(p['collectorName']),
              ));
            }
          }
        }

        // --- Restore SHG Data (if present) ---
        if (backupData.containsKey('shg')) {
          final shgData = backupData['shg'];

          await shgDao.db.customStatement('DELETE FROM s_h_g_cash_books;');
          await shgDao.db.customStatement('DELETE FROM s_h_g_attendances;');
          await shgDao.db.customStatement('DELETE FROM s_h_g_loan_repayments;');
          await shgDao.db.customStatement('DELETE FROM s_h_g_loans;');
          await shgDao.db.customStatement('DELETE FROM s_h_g_savings;');
          await shgDao.db.customStatement('DELETE FROM s_h_g_meetings;');
          await shgDao.db.customStatement('DELETE FROM s_h_g_memberships;');
          await shgDao.db.customStatement('DELETE FROM s_h_g_groups;');

          final List<dynamic> sGroups = shgData['groups'] ?? [];
          final List<dynamic> sMemberships = shgData['memberships'] ?? [];
          final List<dynamic> sMeetings = shgData['meetings'] ?? [];
          final List<dynamic> sSavings = shgData['savings'] ?? [];
          final List<dynamic> sLoans = shgData['loans'] ?? [];
          final List<dynamic> sRepayments = shgData['loanRepayments'] ?? [];
          final List<dynamic> sAttendances = shgData['attendances'] ?? [];
          final List<dynamic> sCashBooks = shgData['cashBooks'] ?? [];

          for (var g in sGroups) {
            await shgDao.db.into(shgDao.db.sHGGroups).insert(
                SHGGroup.fromJson(g),
                mode: drift.InsertMode.insertOrReplace);
          }
          for (var m in sMemberships) {
            await shgDao.db.into(shgDao.db.sHGMemberships).insert(
                SHGMembership.fromJson(m),
                mode: drift.InsertMode.insertOrReplace);
          }
          for (var mtg in sMeetings) {
            await shgDao.db.into(shgDao.db.sHGMeetings).insert(
                SHGMeeting.fromJson(mtg),
                mode: drift.InsertMode.insertOrReplace);
          }
          for (var s in sSavings) {
            await shgDao.db.into(shgDao.db.sHGSavings).insert(
                SHGSaving.fromJson(s),
                mode: drift.InsertMode.insertOrReplace);
          }
          for (var l in sLoans) {
            await shgDao.db.into(shgDao.db.sHGLoans).insert(SHGLoan.fromJson(l),
                mode: drift.InsertMode.insertOrReplace);
          }
          for (var r in sRepayments) {
            await shgDao.db.into(shgDao.db.sHGLoanRepayments).insert(
                SHGLoanRepayment.fromJson(r),
                mode: drift.InsertMode.insertOrReplace);
          }
          for (var a in sAttendances) {
            await shgDao.db.into(shgDao.db.sHGAttendances).insert(
                SHGAttendance.fromJson(a),
                mode: drift.InsertMode.insertOrReplace);
          }
          for (var c in sCashBooks) {
            await shgDao.db.into(shgDao.db.sHGCashBooks).insert(
                SHGCashBook.fromJson(c),
                mode: drift.InsertMode.insertOrReplace);
          }
        }
      });

      return true;
    } catch (e, stack) {
      debugPrint('Restore backup error: $e');
      debugPrint('Stack: $stack');
      return false;
    }
  }

  /// Get auto-backup info
  Future<Map<String, String?>> getLastAutoBackupInfo() async {
    try {
      final time = await _secureStorage.read(key: 'last_auto_backup_time');
      final hasBackup = await _secureStorage.read(key: 'last_auto_backup');
      return {
        'time': time,
        'hasBackup':
            (hasBackup != null && hasBackup.isNotEmpty) ? 'true' : 'false',
      };
    } catch (e) {
      debugPrint('Failed to read last auto backup info: $e');
      return {
        'time': null,
        'hasBackup': 'false',
      };
    }
  }

  /// Restore from auto-backup
  Future<bool> restoreFromAutoBackup(AppDatabase db) async {
    try {
      final backupJson = await _secureStorage.read(key: 'last_auto_backup');
      if (backupJson == null || backupJson.isEmpty) return false;
      return await restoreBackup(db, backupJson);
    } catch (e) {
      debugPrint('Restore from auto-backup error: $e');
      return false;
    }
  }
}

/// Result of backup validation
class BackupValidationResult {
  final bool isValid;
  final String? error;
  final int groupCount;
  final int memberCount;
  final int paymentCount;
  final int winnerCount;
  final String version;
  final String timestamp;

  BackupValidationResult({
    required this.isValid,
    this.error,
    this.groupCount = 0,
    this.memberCount = 0,
    this.paymentCount = 0,
    this.winnerCount = 0,
    this.version = '',
    this.timestamp = '',
  });
}

final backupServiceProvider = Provider<BackupService>((ref) {
  return BackupService();
});

extension SqliteBackup on BackupService {
  Future<void> exportDatabase(BuildContext context) async {
    try {
      final dbFolder = await getApplicationDocumentsDirectory();
      final file = File(p.join(dbFolder.path, 'db.sqlite'));

      if (!await file.exists()) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Database file not found!')),
          );
        }
        return;
      }

      final timestamp =
          DateTime.now().toIso8601String().replaceAll(':', '-').split('.')[0];
      final backupPath = p.join((await getTemporaryDirectory()).path,
          'Halal_ka_paigam_backup_$timestamp.sqlite');

      await file.copy(backupPath);

      final xFile = XFile(backupPath, mimeType: 'application/x-sqlite3');

      if (context.mounted) {
        final box = context.findRenderObject() as RenderBox?;
        await SharePlus.instance.share(ShareParams(
          files: [xFile],
          text: 'SanghaSetu Database Backup',
          subject: 'Database Backup',
          sharePositionOrigin:
              box != null ? box.localToGlobal(Offset.zero) & box.size : null,
        ));
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error exporting database: $e')),
        );
      }
    }
  }

  Future<void> importDatabase(
      BuildContext context, AppDao dao, WidgetRef ref) async {
    try {
      final result = await fp.FilePicker.pickFiles(
        type: fp.FileType.any,
      );

      if (!context.mounted) return;

      if (result != null && result.files.single.path != null) {
        final backupFile = File(result.files.single.path!);
        if (backupFile.path.endsWith('.db') ||
            backupFile.path.endsWith('.sqlite')) {
          final confirm = await showDialog<bool>(
            context: context,
            builder: (context) => AlertDialog(
              title: const Text('Restore Database'),
              content:
                  const Text('This will overwrite all current data. Proceed?'),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context, false),
                  child: const Text('Cancel'),
                ),
                TextButton(
                  onPressed: () => Navigator.pop(context, true),
                  child: const Text('Restore',
                      style: TextStyle(color: Colors.red)),
                ),
              ],
            ),
          );

          if (confirm != true) return;

          // Close the database to release locks and commit WAL
          await dao.db.close();

          final dbFolder = await getApplicationDocumentsDirectory();
          final file = File(p.join(dbFolder.path, 'db.sqlite'));

          // Delete WAL and SHM files to prevent corruption when overwriting main db
          final walFile = File('${file.path}-wal');
          final shmFile = File('${file.path}-shm');
          if (walFile.existsSync()) walFile.deleteSync();
          if (shmFile.existsSync()) shmFile.deleteSync();

          await backupFile.copy(file.path);

          if (context.mounted) {
            ref.invalidate(appDatabaseProvider);
            ref.invalidate(appDaoProvider);
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                  content: Text('Database restored successfully!'),
                  backgroundColor: Colors.green),
            );
          }
        } else {
          throw Exception(
              'Invalid backup file. Must be a .db or .sqlite file.');
        }
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text('Error importing database: $e'),
              backgroundColor: Colors.red),
        );
      }
    }
  }
}
