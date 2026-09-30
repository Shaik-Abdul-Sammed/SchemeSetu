import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../local/app_database.dart';
import '../local/app_dao.dart';

import '../local/database_helper.dart';

part 'db_provider.g.dart';

@Riverpod(keepAlive: true)
AppDatabase appDatabase(Ref ref) {
  final db = AppDatabase();
  DatabaseHelper().init(db);
  ref.onDispose(db.close);
  return db;
}

@Riverpod(keepAlive: true)
AppDao appDao(Ref ref) {
  final db = ref.watch(appDatabaseProvider);
  return AppDao(db);
}

final dbUpdatesProvider = StreamProvider<int>((ref) {
  final db = ref.watch(appDatabaseProvider);
  return db
      .customSelect('SELECT 1', readsFrom: {
        db.groups,
        db.members,
        db.memberships,
        db.rounds,
        db.payments,
        db.auditLogs,
      })
      .watch()
      .map((_) => DateTime.now().millisecondsSinceEpoch);
});
