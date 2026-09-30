import 'package:flutter_test/flutter_test.dart';
import 'package:chit_fund_app/models/member_model.dart';

void main() {
  group('MemberModel Tests', () {
    test('Should create MemberModel from valid Map with groupIds', () {
      final map = {
        'id': '123',
        'name': 'John Doe',
        'mobile': '1234567890',
        'address': 'Test Address',
        'groupIds': ['group1', 'group2'],
      };

      final member = MemberModel.fromMap(map, '123');

      expect(member.id, '123');
      expect(member.name, 'John Doe');
      expect(member.mobile, '1234567890');
      expect(member.address, 'Test Address');
      expect(member.groupIds, ['group1', 'group2']);
      expect(member.aadhaarNumber, isNull);
    });

    test('Should migrate groupId string to groupIds List if present', () {
      final map = {
        'id': '124',
        'name': 'Jane Doe',
        'mobile': '0987654321',
        'address': 'Another Address',
        'groupId': 'legacyGroup',
      };

      final member = MemberModel.fromMap(map, '124');

      expect(member.groupIds, ['legacyGroup']);
    });

    test('toMap should correctly serialize the member', () {
      final member = MemberModel(
        id: '125',
        name: 'Test Name',
        mobile: '1111',
        address: 'Addr',
        groupIds: ['g1'],
      );

      final map = member.toMap();

      expect(map['id'], '125');
      expect(map['name'], 'Test Name');
      expect(map['mobile'], '1111');
      expect(map['address'], 'Addr');
      expect(map['groupIds'], ['g1']);
    });

    test('copyWith should clone object correctly', () {
      final member = MemberModel(
        id: '126',
        name: 'Before',
        mobile: '222',
        address: 'Addr1',
        groupIds: ['g2'],
      );

      final newMember = member.copyWith(name: 'After', groupIds: ['g2', 'g3']);

      expect(newMember.id, '126');
      expect(newMember.name, 'After');
      expect(newMember.groupIds, ['g2', 'g3']);
      expect(newMember.address, 'Addr1');
    });
  });
}
