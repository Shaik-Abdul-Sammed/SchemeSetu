import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:drift/drift.dart';
import '../local/app_database.dart';
import '../local/app_dao.dart';
import '../providers/db_provider.dart';
import '../../services/encryption_service.dart';

part 'member_repository.g.dart';

abstract class IMemberRepository {
  Future<List<Member>> getAllMembers({int? limit, int? offset});
  Stream<List<Member>> watchAllMembers();
  Future<int> insertMember(MembersCompanion member);
  Future<bool> updateMember(MembersCompanion member);
  Future<int> deleteMember(int id);
}

class MemberRepository implements IMemberRepository {
  final AppDao _dao;
  final EncryptionService _encryptionService = EncryptionService();

  MemberRepository(this._dao);

  @override
  Future<List<Member>> getAllMembers({int? limit, int? offset}) async {
    final list = await _dao.getAllMembers(limit: limit, offset: offset);
    return list.map((m) {
      if (m.pin != null) {
        return m.copyWith(pin: Value(_encryptionService.decrypt(m.pin!)));
      }
      return m;
    }).toList();
  }

  @override
  Stream<List<Member>> watchAllMembers() {
    return _dao.watchAllMembers().map((list) {
      return list.map((m) {
        if (m.pin != null) {
          return m.copyWith(pin: Value(_encryptionService.decrypt(m.pin!)));
        }
        return m;
      }).toList();
    });
  }

  @override
  Future<int> insertMember(MembersCompanion member) {
    var updated = member;
    if (member.pin.present && member.pin.value != null) {
      updated = member.copyWith(
        pin: Value(_encryptionService.encrypt(member.pin.value!)),
      );
    }
    return _dao.insertMember(updated);
  }

  @override
  Future<bool> updateMember(MembersCompanion member) {
    var updated = member;
    if (member.pin.present && member.pin.value != null) {
      updated = member.copyWith(
        pin: Value(_encryptionService.encrypt(member.pin.value!)),
      );
    }
    return _dao.updateMember(updated);
  }

  @override
  Future<int> deleteMember(int id) {
    return _dao.deleteMember(id);
  }
}

@riverpod
IMemberRepository memberRepository(Ref ref) {
  final dao = ref.watch(appDaoProvider);
  return MemberRepository(dao);
}
