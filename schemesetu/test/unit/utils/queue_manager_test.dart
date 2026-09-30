import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:chit_fund_app/utils/queue_manager.dart';

void main() {
  group('QueueManager Tests', () {
    late SharedPreferences prefs;

    setUp(() async {
      SharedPreferences.setMockInitialValues({});
      prefs = await SharedPreferences.getInstance();
    });

    test('addOperation appends pending operation to queue', () async {
      final manager = QueueManager(prefs);
      final operation = QueueOperation(
        id: 'OP-001',
        entityType: 'loan',
        action: QueueAction.create,
        data: {'loanId': 'L-1'},
        timestamp: DateTime.now(),
      );

      await manager.addOperation(operation);
      expect(manager.queue.length, 1);
      expect(manager.queue.first, operation);
    });

    test('conflict resolution - duplicate id is ignored', () async {
      final manager = QueueManager(prefs);
      final operation1 = QueueOperation(
        id: 'OP-001',
        entityType: 'loan',
        action: QueueAction.create,
        data: {'loanId': 'L-1'},
        timestamp: DateTime.now(),
      );
      final operation2 = QueueOperation(
        id: 'OP-001',
        entityType: 'loan',
        action: QueueAction.update,
        data: {'loanId': 'L-2'},
        timestamp: DateTime.now(),
      );

      await manager.addOperation(operation1);
      await manager.addOperation(operation2);

      // The duplicate operation id is ignored
      expect(manager.queue.length, 1);
      expect(manager.queue.first.data['loanId'], 'L-1');
    });

    test('processQueue completes successful operations and removes them',
        () async {
      final manager = QueueManager(prefs);
      final operation = QueueOperation(
        id: 'OP-002',
        entityType: 'loan',
        action: QueueAction.create,
        data: {'loanId': 'L-2'},
        timestamp: DateTime.now(),
      );

      await manager.addOperation(operation);

      int processedCount = 0;
      await manager.processQueue((op) async {
        processedCount++;
        return true; // Return true to mark success
      });

      expect(processedCount, 1);
      expect(manager.queue.isEmpty, true);
    });

    test('processQueue retries failing operations up to 3 times', () async {
      final manager = QueueManager(prefs);
      final operation = QueueOperation(
        id: 'OP-003',
        entityType: 'loan',
        action: QueueAction.create,
        data: {'loanId': 'L-3'},
        timestamp: DateTime.now(),
      );

      await manager.addOperation(operation);

      // Run 1: fails, retryCount -> 1, status -> pending
      await manager.processQueue((op) async => false);
      expect(manager.queue.length, 1);
      expect(manager.queue.first.retryCount, 1);
      expect(manager.queue.first.status, 'pending');

      // Run 2: fails, retryCount -> 2, status -> pending
      await manager.processQueue((op) async => false);
      expect(manager.queue.length, 1);
      expect(manager.queue.first.retryCount, 2);
      expect(manager.queue.first.status, 'pending');

      // Run 3: fails, retryCount -> 3, status -> failed
      await manager.processQueue((op) async => false);
      expect(manager.queue.length, 1);
      expect(manager.queue.first.retryCount, 3);
      expect(manager.queue.first.status, 'failed');
    });

    test('queue persists across restarts', () async {
      final manager1 = QueueManager(prefs);
      final operation = QueueOperation(
        id: 'OP-004',
        entityType: 'loan',
        action: QueueAction.create,
        data: {'loanId': 'L-4'},
        timestamp: DateTime.now(),
      );

      await manager1.addOperation(operation);

      // Create new QueueManager loading from the same mock SharedPreferences instance
      final manager2 = QueueManager(prefs);
      await manager2.loadQueue();

      expect(manager2.queue.length, 1);
      expect(manager2.queue.first.id, 'OP-004');
    });
  });
}
