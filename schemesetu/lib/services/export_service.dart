import 'dart:io';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import '../data/local/app_database.dart';
import '../data/local/app_dao.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:collection/collection.dart';
import '../data/providers/db_provider.dart';

class ExportService {
  final AppDao db;

  ExportService(this.db);

  Future<void> exportMembersToCSV() async {
    final members = await db.getAllMembers();
    List<List<dynamic>> rows = [
      ['ID', 'Name', 'Phone', 'Join Date', 'Is Active']
    ];

    for (final m in members) {
      rows.add([
        m.id,
        m.name,
        m.phone,
        m.joiningDate.toIso8601String(),
        m.status == 'Active' ? 'Yes' : 'No',
      ]);
    }

    final directory = await getApplicationDocumentsDirectory();
    final path =
        '${directory.path}/members_export_${DateTime.now().millisecondsSinceEpoch}.csv';
    final file = File(path);
    final sink = file.openWrite();

    for (var row in rows) {
      sink.writeln(row.map((e) => '"$e"').join(','));
    }

    await sink.flush();
    await sink.close();

    await SharePlus.instance
        .share(ShareParams(files: [XFile(path)], text: 'Members Export CSV'));
  }

  Future<void> exportGroupLedgerToCSV(Group group) async {
    final rounds = await db.getRoundsForGroup(group.id);
    final memberships = await db.getActiveMembershipsForGroup(group.id);
    final members = await db.getAllMembers();

    List<List<dynamic>> rows = [
      [
        'Member ID',
        'Member Name',
        'Round',
        'Amount Paid',
        'Status',
        'Date',
        'Payment Mode'
      ]
    ];

    for (final ms in memberships) {
      final member = members.firstWhereOrNull((m) => m.id == ms.memberId);
      if (member == null) continue;
      final memberPayments = await db.getPaymentsForMembership(ms.id);

      for (final p in memberPayments) {
        final round = rounds.firstWhereOrNull((r) => r.id == p.roundId);
        if (round == null) continue;
        rows.add([
          member.id,
          member.name,
          round.roundNumber,
          p.amount,
          p.status,
          p.paymentDate.toIso8601String(),
          p.paymentMode,
        ]);
      }
    }

    final directory = await getApplicationDocumentsDirectory();
    final path =
        '${directory.path}/group_${group.id}_ledger_${DateTime.now().millisecondsSinceEpoch}.csv';
    final file = File(path);
    final sink = file.openWrite();

    for (var i = 0; i < rows.length; i += 100) {
      final chunk = rows.skip(i).take(100);
      for (var row in chunk) {
        sink.writeln(row.map((e) => '"$e"').join(','));
      }
    }

    await sink.flush();
    await sink.close();

    await SharePlus.instance.share(ShareParams(
        files: [XFile(path)], text: '${group.name} Ledger Export CSV'));
  }
}

final exportServiceProvider = Provider<ExportService>((ref) {
  return ExportService(ref.watch(appDaoProvider));
});
