import 'package:flutter_test/flutter_test.dart';
import 'package:drift/drift.dart' as drift;
import 'package:chit_fund_app/data/local/app_database.dart';
import 'package:chit_fund_app/data/repositories/member_repository.dart';
import 'package:chit_fund_app/services/encryption_service.dart';

void main() {
  group('MemberRepository PIN Encryption/Decryption Tests', () {
    late AppDatabase db;
    late MemberRepository repository;
    final encryptionService = EncryptionService();

    setUp(() async {
      await EncryptionService().init();
      db = AppDatabase.inMemory();
      repository = MemberRepository(db.appDao);
    });

    tearDown(() async {
      await db.close();
    });

    test('insertMember encrypts PIN and getAllMembers decrypts it', () async {
      final companion = MembersCompanion(
        name: const drift.Value('John Doe'),
        phone: const drift.Value('9876543210'),
        pin: const drift.Value('4321'),
      );

      final memberId = await repository.insertMember(companion);
      expect(memberId, greaterThan(0));

      // 1. Verify direct DB lookup contains encrypted PIN
      final rawMembers = await db.appDao.db.select(db.appDao.db.members).get();
      expect(rawMembers.length, 1);
      expect(rawMembers.first.pin, isNot('4321'));
      expect(encryptionService.decrypt(rawMembers.first.pin!), '4321');

      // 2. Verify repository read decrypts automatically
      final decryptedMembers = await repository.getAllMembers();
      expect(decryptedMembers.length, 1);
      expect(decryptedMembers.first.pin, '4321');
    });

    test('updateMember encrypts PIN and persists change', () async {
      final companion = MembersCompanion(
        name: const drift.Value('Jane Smith'),
        phone: const drift.Value('9000000000'),
        pin: const drift.Value('1111'),
      );

      final id = await repository.insertMember(companion);

      final updateCompanion = MembersCompanion(
        id: drift.Value(id),
        name: const drift.Value('Jane Smith'),
        phone: const drift.Value('9000000000'),
        pin: const drift.Value('9999'),
      );

      final success = await repository.updateMember(updateCompanion);
      expect(success, isTrue);

      // Verify DB contains newly encrypted PIN
      final rawMembers = await db.appDao.db.select(db.appDao.db.members).get();
      expect(encryptionService.decrypt(rawMembers.first.pin!), '9999');

      // Verify repository read contains decrypted PIN
      final decrypted = await repository.getAllMembers();
      expect(decrypted.first.pin, '9999');
    });

    test('deleteMember removes record from database', () async {
      final companion = MembersCompanion(
        name: const drift.Value('To Delete'),
        phone: const drift.Value('0000000000'),
      );

      final id = await repository.insertMember(companion);
      expect((await repository.getAllMembers()).length, 1);

      final deletedCount = await repository.deleteMember(id);
      expect(deletedCount, 1);
      expect((await repository.getAllMembers()).length, 0);
    });
  });
}
