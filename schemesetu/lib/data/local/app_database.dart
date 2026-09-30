import 'dart:io';

import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;
import 'package:sqlite3/sqlite3.dart';
import 'package:flutter/foundation.dart';

import 'tables.dart';
import 'shg_dao.dart';
import 'app_dao.dart';

part 'app_database.g.dart';

@DriftDatabase(tables: [
  Members,
  Groups,
  Memberships,
  Rounds,
  Payments,
  AdminSettings,
  AuditLogs,
  SHGGroups,
  SHGMemberships,
  SHGMeetings,
  SHGSavings,
  SHGLoans,
  SHGLoanRepayments,
  SHGAttendances,
  SHGCashBooks,
], daos: [
  AppDao,
  SHGDao,
])
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(_openConnection());
  AppDatabase.inMemory() : super(NativeDatabase.memory());

  @override
  int get schemaVersion => 17;

  @override
  MigrationStrategy get migration {
    return MigrationStrategy(
      onCreate: (Migrator m) async {
        await m.createAll();
        // Insert default admin settings
        await into(adminSettings).insert(
          AdminSettingsCompanion.insert(
            key: 'currency',
            value: '₹',
          ),
          mode: InsertMode.insertOrIgnore,
        );
      },
      onUpgrade: (Migrator m, int from, int to) async {
        if (from < 2) {
          await m.addColumn(rounds, rounds.payoutStatus);
          await m.addColumn(rounds, rounds.payoutDate);
          await m.addColumn(rounds, rounds.guarantor1Name);
          await m.addColumn(rounds, rounds.guarantor1Phone);
          await m.addColumn(rounds, rounds.guarantor2Name);
          await m.addColumn(rounds, rounds.guarantor2Phone);
          await m.addColumn(rounds, rounds.guarantorMemberId);
          // Backfill non-nullable payout_status for pre-migration rows
          await customStatement(
              "UPDATE rounds SET payout_status = 'Pending' WHERE payout_status IS NULL");
        }
        if (from < 3) {
          await m.addColumn(rounds, rounds.foremanCommission);
          await m.addColumn(rounds, rounds.dividendDistributed);
        }
        if (from < 4) {
          await m.addColumn(rounds, rounds.winnerPaid);
          await m.addColumn(rounds, rounds.winnerBalance);
          await m.addColumn(rounds, rounds.winnerLeft);
        }
        if (from < 5) {
          await m.addColumn(members, members.trustScore);
          await m.addColumn(groups, groups.whatsappGroupLink);
          await m.addColumn(rounds, rounds.hijriDate);
          await m.addColumn(payments, payments.receiptPhotoPath);
          await m.addColumn(payments, payments.collectorName);
        }
        if (from < 6) {
          await m.addColumn(groups, groups.isDeleted);
          await customStatement(
              'UPDATE groups SET is_deleted = 0 WHERE is_deleted IS NULL');
        }
        if (from < 7) {
          await customStatement(
              'UPDATE groups SET is_deleted = 0 WHERE is_deleted IS NULL');
        }
        if (from < 8) {
          // Fix for users whose v2 migration left payout_status as NULL
          // (non-nullable Drift column, will crash on .read()!)
          await customStatement(
              "UPDATE rounds SET payout_status = 'Pending' WHERE payout_status IS NULL");
        }
        if (from < 9) {
          try {
            await m.addColumn(memberships, memberships.installmentsCount);
          } catch (e) {
            debugPrint('Column installments_count might already exist: $e');
          }
          try {
            await m.addColumn(rounds, rounds.winnerPaymentMode);
          } catch (e) {
            debugPrint('Column winner_payment_mode might already exist: $e');
          }
        }
        if (from < 10) {
          try {
            await m.addColumn(rounds, rounds.winnerRemarks);
          } catch (e) {
            debugPrint('Column winner_remarks might already exist: $e');
          }
        }
        if (from < 11) {
          try {
            await m.addColumn(groups, groups.paymentDueDate);
            await customStatement(
                'UPDATE groups SET payment_due_date = 15 WHERE payment_due_date IS NULL');
          } catch (e) {
            debugPrint('Column payment_due_date might already exist: $e');
          }
        }
        if (from < 12) {
          try {
            await m.addColumn(rounds, rounds.exchangedToMemberId);
          } catch (e) {
            debugPrint('Column exchanged_to_member_id might already exist: $e');
          }
          try {
            await m.addColumn(rounds, rounds.exchangeNote);
          } catch (e) {
            debugPrint('Column exchange_note might already exist: $e');
          }
        }
        if (from < 13) {
          try {
            await m.alterTable(TableMigration(memberships));
          } catch (e) {
            debugPrint('Migration to alter table memberships failed: $e');
          }
        }
        if (from < 14) {
          try {
            await m.createTable(auditLogs);
          } catch (e) {
            debugPrint('Migration to create table auditLogs failed: $e');
          }
        }
        if (from < 15) {
          try {
            await m.createTable(sHGGroups);
            await m.createTable(sHGMemberships);
            await m.createTable(sHGMeetings);
            await m.createTable(sHGSavings);
            await m.createTable(sHGLoans);
            await m.createTable(sHGLoanRepayments);
            await m.createTable(sHGAttendances);
            await m.createTable(sHGCashBooks);
          } catch (e) {
            debugPrint('Migration to create SHG tables failed: $e');
          }
        }
        if (from < 16) {
          try {
            await m.drop(sHGLoanRepayments);
            await m.drop(sHGLoans);
            await m.createTable(sHGLoans);
            await m.createTable(sHGLoanRepayments);
          } catch (e) {
            debugPrint(
                'Migration to upgrade SHG Loans to v16 (encrypted TextColumns) failed: $e');
          }
        }
        if (from < 17) {
          try {
            await m.addColumn(members, members.pin);
          } catch (e) {
            debugPrint(
                'Migration to add pin column to Members table failed: $e');
          }
        }
      },
      beforeOpen: (details) async {
        await customStatement('PRAGMA foreign_keys = ON');
        // Safety net: backfill any NULL values in non-nullable columns
        // on every app start. This catches rows that slipped through
        // migrations (e.g. schema already at target version, partial
        // migrations, or restored backups).
        await customStatement(
            "UPDATE rounds SET payout_status = 'Pending' WHERE payout_status IS NULL");
        await customStatement(
            'UPDATE groups SET is_deleted = 0 WHERE is_deleted IS NULL');
        await customStatement(
            "UPDATE groups SET status = 'Active' WHERE status IS NULL");
        await customStatement(
            "UPDATE members SET status = 'Active' WHERE status IS NULL");
        await customStatement(
            'UPDATE memberships SET installments_count = 1 WHERE installments_count IS NULL');
        await customStatement(
            "UPDATE payments SET status = 'Completed' WHERE status IS NULL");
      },
    );
  }
}

LazyDatabase _openConnection() {
  return LazyDatabase(() async {
    final dbFolder = await getApplicationDocumentsDirectory();
    final file = File(p.join(dbFolder.path, 'db.sqlite'));

    final cachebase = (await getTemporaryDirectory()).path;
    sqlite3.tempDirectory = cachebase;

    return NativeDatabase.createInBackground(file);
  });
}
