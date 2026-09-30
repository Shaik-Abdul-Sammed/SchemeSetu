import 'package:flutter_test/flutter_test.dart';
import 'package:chit_fund_app/models/group_model.dart';
import 'package:chit_fund_app/models/member_model.dart';
import 'package:chit_fund_app/models/payment_model.dart';
import 'package:chit_fund_app/models/winner_model.dart';

void main() {
  group('GroupModel Tests', () {
    late DateTime startDate;
    late GroupModel group;

    setUp(() {
      startDate = DateTime(2026, 6, 15);
      group = GroupModel(
        id: 'group_test',
        name: 'Group Test (₹10000)',
        installment: 10000.0,
        totalMembers: 10,
        startDate: startDate,
        durationMonths: 10,
      );
    });

    test('toMap contains correct keys and values', () {
      final map = group.toMap();
      expect(map['id'], 'group_test');
      expect(map['name'], 'Group Test (₹10000)');
      expect(map['installment'], 10000.0);
      expect(map['totalMembers'], 10);
      expect(map['durationMonths'], 10);
    });

    test('fromMap with ISO string date parses correctly', () {
      final decoded = GroupModel.fromMap({
        'name': 'Group Test (₹10000)',
        'installment': 10000.0,
        'totalMembers': 10,
        'startDate': startDate.toIso8601String(),
        'durationMonths': 10,
      }, 'group_test');

      expect(decoded.id, 'group_test');
      expect(decoded.installment, 10000.0);
      expect(decoded.totalMembers, 10);
      expect(decoded.durationMonths, 10);
    });

    test('fromMap uses defaults on missing fields', () {
      final decoded = GroupModel.fromMap({'name': 'Test'}, 'g1');
      expect(decoded.installment, 0.0);
      expect(decoded.totalMembers, 0);
      expect(decoded.durationMonths, 12); // default
    });

    test('copyWith replaces only specified fields', () {
      final copy = group.copyWith(installment: 20000.0, totalMembers: 20);
      expect(copy.installment, 20000.0);
      expect(copy.totalMembers, 20);
      expect(copy.name, group.name); // unchanged
      expect(copy.id, group.id); // unchanged
    });

    test('duration in months is stored correctly', () {
      // 10-month chit started June 2026 ends on month index 10-1=9 from start
      // startDate.month (6) + 9 = 15 → overflow → month 3 (March) year 2027
      final end =
          DateTime(startDate.year, startDate.month + group.durationMonths - 1);
      // Dart normalizes: month 15 = March of next year
      expect(end.month, 3); // March 2027
      expect(end.year, 2027);
    });
  });

  group('MemberModel Tests', () {
    late MemberModel member;

    setUp(() {
      member = MemberModel(
        id: 'm_test',
        name: 'Mohammed Ali',
        mobile: '9876543210',
        address: 'Charminar, Hyderabad',
        groupIds: ['group_a', 'group_b'],
        aadhaarNumber: '1234-5678-9012',
      );
    });

    test('toMap contains all fields', () {
      final map = member.toMap();
      expect(map['id'], 'm_test');
      expect(map['name'], 'Mohammed Ali');
      expect(map['groupIds'], ['group_a', 'group_b']);
      expect(map['aadhaarNumber'], '1234-5678-9012');
      expect(map['photoUrl'], isNull);
    });

    test('fromMap round-trip preserves all fields', () {
      final decoded = MemberModel.fromMap(member.toMap(), 'm_test');
      expect(decoded.name, member.name);
      expect(decoded.groupIds, member.groupIds);
      expect(decoded.aadhaarNumber, member.aadhaarNumber);
    });

    test('fromMap uses empty defaults on missing fields', () {
      final decoded = MemberModel.fromMap({}, 'empty');
      expect(decoded.name, '');
      expect(decoded.mobile, '');
      expect(decoded.groupIds, isEmpty);
      expect(decoded.photoUrl, isNull);
      expect(decoded.aadhaarNumber, isNull);
    });

    test('copyWith replaces only specified fields', () {
      final copy = member.copyWith(name: 'Abdul Samad', groupIds: ['group_c']);
      expect(copy.name, 'Abdul Samad');
      expect(copy.groupIds, ['group_c']);
      expect(copy.mobile, member.mobile); // unchanged
    });
  });

  group('PaymentModel Tests', () {
    late DateTime payDate;
    late PaymentModel payment;

    setUp(() {
      payDate = DateTime(2026, 6, 15);
      payment = PaymentModel(
        id: 'p_test',
        memberId: 'm_test',
        groupId: 'group_a',
        month: '2026-06',
        amount: 7700.0,
        isPaid: true,
        paymentDate: payDate,
      );
    });

    test('basic field values are correct', () {
      expect(payment.isPaid, true);
      expect(payment.amount, 7700.0);
      expect(payment.month, '2026-06');
      expect(payment.paymentDate, payDate);
    });

    test('copyWith toggles isPaid and clears paymentDate', () {
      final unpaid = payment.copyWith(isPaid: false, paymentDate: null);
      expect(unpaid.isPaid, false);
      expect(unpaid.paymentDate, isNull);
      expect(unpaid.amount, 7700.0); // unchanged
    });

    test('copyWith preserves existing paymentDate when explicitly passed', () {
      // PaymentModel.copyWith always takes the paymentDate param directly;
      // to preserve, pass it explicitly.
      final copy = payment.copyWith(paymentDate: payment.paymentDate);
      expect(copy.id, payment.id);
      expect(copy.isPaid, payment.isPaid);
      expect(copy.paymentDate, payment.paymentDate);
    });

    test('fromMap with ISO date string parses correctly', () {
      final map = {
        'memberId': 'm1',
        'groupId': 'g1',
        'month': '2026-06',
        'amount': 5000.0,
        'isPaid': false,
        'paymentDate': payDate.toIso8601String(),
      };
      final decoded = PaymentModel.fromMap(map, 'p1');
      expect(decoded.memberId, 'm1');
      expect(decoded.isPaid, false);
      expect(decoded.paymentDate?.year, 2026);
    });

    test('fromMap with null paymentDate leaves it null', () {
      final map = {
        'memberId': 'm1',
        'groupId': 'g1',
        'month': '2026-06',
        'amount': 5000.0,
        'isPaid': false,
        'paymentDate': null,
      };
      final decoded = PaymentModel.fromMap(map, 'p1');
      expect(decoded.paymentDate, isNull);
    });
  });

  group('WinnerModel Tests', () {
    late DateTime winDate;
    late WinnerModel winner;

    setUp(() {
      winDate = DateTime(2026, 5, 10);
      winner = WinnerModel(
        id: 'win1',
        groupId: 'group_a',
        month: '2026-05',
        memberId: 'm2',
        amount: 75000.0,
        bidAmount: 25000.0,
        winnerPaid: 70000.0,
        winnerBalance: 75000.0,
        winnerLeft: 5000.0,
        date: winDate,
      );
    });

    test('all fields are stored correctly', () {
      expect(winner.id, 'win1');
      expect(winner.groupId, 'group_a');
      expect(winner.month, '2026-05');
      expect(winner.memberId, 'm2');
      expect(winner.amount, 75000.0);
      expect(winner.date, winDate);
    });

    test('toMap has correct keys', () {
      final map = winner.toMap();
      expect(map['groupId'], 'group_a');
      expect(map['month'], '2026-05');
      expect(map['memberId'], 'm2');
      expect(map['amount'], 75000.0);
    });

    test('fromMap with ISO date string round-trip', () {
      final map = {
        'groupId': 'group_a',
        'month': '2026-05',
        'memberId': 'm2',
        'amount': 75000.0,
        'bidAmount': 25000.0,
        'winnerPaid': 70000.0,
        'winnerBalance': 75000.0,
        'winnerLeft': 5000.0,
        'date': winDate.toIso8601String(),
      };
      final decoded = WinnerModel.fromMap(map, 'win1');
      expect(decoded.id, 'win1');
      expect(decoded.amount, 75000.0);
      expect(decoded.date.year, 2026);
    });

    test('copyWith replaces specified fields', () {
      final updated = winner.copyWith(amount: 80000.0, memberId: 'm5');
      expect(updated.amount, 80000.0);
      expect(updated.memberId, 'm5');
      expect(updated.groupId, winner.groupId); // unchanged
    });
  });
}
