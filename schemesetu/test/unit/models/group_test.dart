import 'package:flutter_test/flutter_test.dart';
import 'package:chit_fund_app/models/group_model.dart';

void main() {
  group('GroupModel Unit Tests', () {
    final testDate = DateTime(2026, 8, 6);

    test('constructor sets all properties correctly', () {
      final group = GroupModel(
        id: 'G-123',
        name: 'Sri Lakshmi SHG',
        installment: 1000.0,
        totalMembers: 15,
        startDate: testDate,
        durationMonths: 12,
        paymentDueDate: 15,
      );

      expect(group.id, 'G-123');
      expect(group.name, 'Sri Lakshmi SHG');
      expect(group.installment, 1000.0);
      expect(group.totalMembers, 15);
      expect(group.startDate, testDate);
      expect(group.durationMonths, 12);
      expect(group.paymentDueDate, 15);
    });

    test('toMap serializes correctly', () {
      final group = GroupModel(
        id: 'G-123',
        name: 'Sri Lakshmi SHG',
        installment: 1000.0,
        totalMembers: 15,
        startDate: testDate,
        durationMonths: 12,
      );

      final map = group.toMap();
      expect(map['id'], 'G-123');
      expect(map['name'], 'Sri Lakshmi SHG');
      expect(map['installment'], 1000.0);
      expect(map['totalMembers'], 15);
      expect(map['startDate'], testDate.toIso8601String());
      expect(map['durationMonths'], 12);
    });

    test('fromMap parses map correctly', () {
      final map = {
        'name': 'Sri Lakshmi SHG',
        'installment': 1000.0,
        'totalMembers': 15,
        'startDate': testDate.toIso8601String(),
        'durationMonths': 12,
      };

      final group = GroupModel.fromMap(map, 'G-123');
      expect(group.id, 'G-123');
      expect(group.name, 'Sri Lakshmi SHG');
      expect(group.installment, 1000.0);
      expect(group.totalMembers, 15);
      expect(group.startDate, testDate);
      expect(group.durationMonths, 12);
    });

    test('copyWith creates modified clone', () {
      final original = GroupModel(
        id: 'G-123',
        name: 'Sri Lakshmi SHG',
        installment: 1000.0,
        totalMembers: 15,
        startDate: testDate,
        durationMonths: 12,
      );

      final modified = original.copyWith(
        name: 'Sri Saraswathi SHG',
        installment: 2000.0,
      );

      expect(modified.id, 'G-123');
      expect(modified.name, 'Sri Saraswathi SHG');
      expect(modified.installment, 2000.0);
      expect(modified.totalMembers, 15);
    });
  });
}
