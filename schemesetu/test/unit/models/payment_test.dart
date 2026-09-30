import 'package:flutter_test/flutter_test.dart';
import 'package:chit_fund_app/models/payment_model.dart';

void main() {
  group('PaymentModel Unit Tests', () {
    final testDate = DateTime(2026, 8, 6);

    test('constructor sets all fields correctly', () {
      final payment = PaymentModel(
        id: 'P-999',
        memberId: 'M-111',
        groupId: 'G-222',
        month: '2026-08',
        amount: 500.0,
        isPaid: true,
        paymentDate: testDate,
        method: 'upi',
        reference: 'UPI1234567890',
        receiptPath: '/receipts/p999.pdf',
        isLate: false,
      );

      expect(payment.id, 'P-999');
      expect(payment.memberId, 'M-111');
      expect(payment.groupId, 'G-222');
      expect(payment.month, '2026-08');
      expect(payment.amount, 500.0);
      expect(payment.isPaid, true);
      expect(payment.paymentDate, testDate);
      expect(payment.method, 'upi');
      expect(payment.reference, 'UPI1234567890');
      expect(payment.receiptPath, '/receipts/p999.pdf');
      expect(payment.isLate, false);
    });

    test('toMap serializes properties correctly', () {
      final payment = PaymentModel(
        id: 'P-999',
        memberId: 'M-111',
        groupId: 'G-222',
        month: '2026-08',
        amount: 500.0,
        isPaid: true,
        paymentDate: testDate,
        method: 'upi',
        reference: 'UPI-REF',
        receiptPath: '/receipts/p999.pdf',
        isLate: true,
      );

      final map = payment.toMap();
      expect(map['id'], 'P-999');
      expect(map['memberId'], 'M-111');
      expect(map['groupId'], 'G-222');
      expect(map['month'], '2026-08');
      expect(map['amount'], 500.0);
      expect(map['isPaid'], true);
      expect(map['paymentDate'], testDate.toIso8601String());
      expect(map['method'], 'upi');
      expect(map['reference'], 'UPI-REF');
      expect(map['receiptPath'], '/receipts/p999.pdf');
      expect(map['isLate'], true);
    });

    test('fromMap parses dynamic maps correctly', () {
      final map = {
        'memberId': 'M-111',
        'groupId': 'G-222',
        'month': '2026-08',
        'amount': 500.0,
        'isPaid': true,
        'paymentDate': testDate.toIso8601String(),
        'method': 'upi',
        'reference': 'UPI-REF',
        'receiptPath': '/receipts/p999.pdf',
        'isLate': true,
      };

      final payment = PaymentModel.fromMap(map, 'P-999');
      expect(payment.id, 'P-999');
      expect(payment.memberId, 'M-111');
      expect(payment.groupId, 'G-222');
      expect(payment.month, '2026-08');
      expect(payment.amount, 500.0);
      expect(payment.isPaid, true);
      expect(payment.paymentDate, testDate);
      expect(payment.method, 'upi');
      expect(payment.reference, 'UPI-REF');
      expect(payment.receiptPath, '/receipts/p999.pdf');
      expect(payment.isLate, true);
    });

    test('copyWith creates modified clone', () {
      final original = PaymentModel(
        id: 'P-999',
        memberId: 'M-111',
        groupId: 'G-222',
        month: '2026-08',
        amount: 500.0,
        isPaid: false,
      );

      final modified = original.copyWith(
        isPaid: true,
        paymentDate: testDate,
        method: 'cash',
      );

      expect(modified.id, 'P-999');
      expect(modified.isPaid, true);
      expect(modified.paymentDate, testDate);
      expect(modified.method, 'cash');
      expect(modified.amount, 500.0);
    });
  });
}
