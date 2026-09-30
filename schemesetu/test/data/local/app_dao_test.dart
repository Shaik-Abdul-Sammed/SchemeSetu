import 'package:flutter_test/flutter_test.dart';
import 'package:drift/drift.dart';
import 'package:chit_fund_app/data/local/app_database.dart';
import 'package:chit_fund_app/data/local/app_dao.dart';

void main() {
  late AppDatabase database;
  late AppDao dao;

  setUp(() {
    database = AppDatabase.inMemory();
    dao = AppDao(database);
  });

  tearDown(() async {
    await database.close();
  });

  test('insert and fetch member', () async {
    final member = MembersCompanion.insert(
      name: 'Test Member',
      phone: '1234567890',
      address: const Value('Test Address'),
      joiningDate: Value(DateTime(2023, 1, 1)),
      status: const Value('Active'),
    );

    final id = await dao.insertMember(member);
    expect(id, isPositive);

    final fetched = await dao.getAllMembers();
    expect(fetched.length, 1);
    expect(fetched.first.name, 'Test Member');
  });

  test('insert and fetch group', () async {
    final group = GroupsCompanion.insert(
      name: 'Test Group',
      chitValue: 100000,
      totalMonths: 10,
      monthlyContribution: 10000,
      startDate: DateTime(2023, 1, 1),
      status: const Value('Active'),
      isDeleted: const Value(false),
    );

    final id = await dao.insertGroup(group);
    expect(id, isPositive);

    final fetched = await dao.getAllGroups();
    expect(fetched.length, 1);
    expect(fetched.first.name, 'Test Group');
  });
}
