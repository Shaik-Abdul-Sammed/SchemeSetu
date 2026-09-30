import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../data/local/app_database.dart';
import '../../data/providers/db_provider.dart';
import '../../widgets/translated_text.dart';
import '../../widgets/glass_card.dart';
import '../../widgets/scroll_arrows_overlay.dart';

import 'package:drift/drift.dart' show OrderingTerm;

final auditLogsProvider =
    FutureProvider.autoDispose<List<AuditLog>>((ref) async {
  final db = ref.watch(appDatabaseProvider);
  return (db.select(db.auditLogs)
        ..orderBy([(t) => OrderingTerm.desc(t.timestamp)]))
      .get();
});

class AuditLogsScreen extends ConsumerWidget {
  const AuditLogsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final logsAsync = ref.watch(auditLogsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const TranslatedText('Audit Logs'),
      ),
      body: logsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, st) => Center(child: Text('Error: $err')),
        data: (logs) {
          if (logs.isEmpty) {
            return const Center(
                child: TranslatedText('No audit logs available.'));
          }
          return ScrollArrowsOverlay(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: logs.length,
              itemBuilder: (context, index) {
                final log = logs[index];
                return GlassCard(
                  padding: const EdgeInsets.all(16),
                  margin: const EdgeInsets.only(bottom: 12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              log.action,
                              style: const TextStyle(
                                  fontWeight: FontWeight.bold, fontSize: 16),
                            ),
                          ),
                          Text(
                            DateFormat('dd MMM yyyy, hh:mm a')
                                .format(log.timestamp),
                            style: const TextStyle(
                                fontSize: 12, color: Colors.grey),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Target: ${log.targetName}',
                        style: const TextStyle(fontSize: 14),
                      ),
                      if (log.details != null && log.details!.isNotEmpty) ...[
                        const SizedBox(height: 4),
                        Text(
                          log.details!,
                          style:
                              const TextStyle(fontSize: 13, color: Colors.grey),
                        ),
                      ]
                    ],
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
