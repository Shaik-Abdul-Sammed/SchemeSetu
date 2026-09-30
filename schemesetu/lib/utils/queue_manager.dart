import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

enum QueueAction { create, update, delete }

class QueueOperation {
  final String id;
  final String entityType; // e.g. 'member', 'loan'
  final QueueAction action;
  final Map<String, dynamic> data;
  final DateTime timestamp;
  int retryCount;
  String status; // 'pending', 'processing', 'completed', 'failed'

  QueueOperation({
    required this.id,
    required this.entityType,
    required this.action,
    required this.data,
    required this.timestamp,
    this.retryCount = 0,
    this.status = 'pending',
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'entityType': entityType,
      'action': action.name,
      'data': data,
      'timestamp': timestamp.toIso8601String(),
      'retryCount': retryCount,
      'status': status,
    };
  }

  factory QueueOperation.fromJson(Map<String, dynamic> json) {
    return QueueOperation(
      id: json['id'] as String,
      entityType: json['entityType'] as String,
      action: QueueAction.values.firstWhere((e) => e.name == json['action']),
      data: Map<String, dynamic>.from(json['data'] as Map),
      timestamp: DateTime.parse(json['timestamp'] as String),
      retryCount: json['retryCount'] as int? ?? 0,
      status: json['status'] as String? ?? 'pending',
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is QueueOperation &&
        other.id == id &&
        other.entityType == entityType &&
        other.action == action &&
        other.timestamp == timestamp;
  }

  @override
  int get hashCode => Object.hash(id, entityType, action, timestamp);
}

class QueueManager {
  final List<QueueOperation> _queue = [];
  final SharedPreferences? _prefs;

  QueueManager([this._prefs]);

  List<QueueOperation> get queue => List.unmodifiable(_queue);

  Future<void> loadQueue() async {
    final prefs = _prefs;
    if (prefs == null) return;
    final jsonStr = prefs.getString('offline_sync_queue');
    if (jsonStr != null) {
      final List<dynamic> decoded = jsonDecode(jsonStr);
      _queue.clear();
      _queue.addAll(decoded.map(
          (x) => QueueOperation.fromJson(Map<String, dynamic>.from(x as Map))));
    }
  }

  Future<void> saveQueue() async {
    final prefs = _prefs;
    if (prefs == null) return;
    final jsonStr = jsonEncode(_queue.map((x) => x.toJson()).toList());
    await prefs.setString('offline_sync_queue', jsonStr);
  }

  Future<void> addOperation(QueueOperation operation) async {
    // Conflict resolution: if the exact same operation id exists, update or ignore it.
    if (_queue.any((op) => op.id == operation.id)) {
      return;
    }
    _queue.add(operation);
    await saveQueue();
  }

  Future<void> processQueue(
      Future<bool> Function(QueueOperation) processor) async {
    final List<QueueOperation> toRemove = [];
    for (var operation in _queue) {
      operation.status = 'processing';

      bool success = false;
      try {
        success = await processor(operation);
      } catch (_) {
        success = false;
      }

      if (success) {
        operation.status = 'completed';
        toRemove.add(operation);
      } else {
        operation.retryCount++;
        if (operation.retryCount >= 3) {
          operation.status = 'failed';
        } else {
          operation.status = 'pending';
        }
      }
    }
    _queue.removeWhere((op) => toRemove.contains(op));
    await saveQueue();
  }

  Future<void> clearQueue() async {
    _queue.clear();
    await saveQueue();
  }
}
