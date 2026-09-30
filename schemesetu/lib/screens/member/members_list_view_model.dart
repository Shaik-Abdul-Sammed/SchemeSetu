import 'dart:async';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:drift/drift.dart' as drift;
import 'package:collection/collection.dart';
import '../../data/local/app_database.dart';
import '../../data/local/app_dao.dart';
import '../../data/providers/db_provider.dart';
import '../dashboard/admin_dashboard_view_model.dart';
import '../group/groups_list_view_model.dart';
import '../group/group_detail_view_model.dart';
import '../payment/payment_view_model.dart';

part 'members_list_view_model.g.dart';

class MemberListState {
  final List<Member> members;
  final List<Group> groups;
  final List<Membership> memberships;
  final bool isLoading;

  MemberListState({
    required this.members,
    required this.groups,
    required this.memberships,
    this.isLoading = false,
  });
}

@riverpod
class MemberList extends _$MemberList {
  @override
  Future<MemberListState> build() async {
    ref.watch(dbUpdatesProvider);
    return _loadData();
  }

  Future<void> consolidateDuplicateMembers(AppDao dao) async {
    final members = await dao.getAllMembers();
    final phoneToMembers = <String, List<Member>>{};
    for (final m in members) {
      final key = m.phone.replaceAll(RegExp(r'\D'), '');
      if (key.length >= 10) {
        phoneToMembers.putIfAbsent(key, () => []).add(m);
      }
    }

    await dao.transaction(() async {
      for (final entry in phoneToMembers.entries) {
        final dupList = entry.value;
        if (dupList.length > 1) {
          final primary = dupList.first;
          for (int i = 1; i < dupList.length; i++) {
            final duplicate = dupList[i];

            final memberships = await dao.getMembershipsForMember(duplicate.id);
            for (final ms in memberships) {
              final primaryMemberships =
                  await dao.getMembershipsForMember(primary.id);
              final primaryMs = primaryMemberships
                  .firstWhereOrNull((pm) => pm.groupId == ms.groupId);
              if (primaryMs != null) {
                final duplicatePayments =
                    await dao.getPaymentsForMembership(ms.id);
                for (final payment in duplicatePayments) {
                  await dao.updatePayment(PaymentsCompanion(
                    id: drift.Value(payment.id),
                    membershipId: drift.Value(primaryMs.id),
                  ));
                }
                await dao.deleteMembership(duplicate.id, ms.groupId);
              } else {
                await dao.updateMembership(MembershipsCompanion(
                  id: drift.Value(ms.id),
                  memberId: drift.Value(primary.id),
                ));
              }
            }

            final allRounds = await dao.getAllRounds();
            for (final r in allRounds) {
              if (r.winnerMemberId == duplicate.id) {
                await dao.updateRound(RoundsCompanion(
                  id: drift.Value(r.id),
                  winnerMemberId: drift.Value(primary.id),
                ));
              }
              if (r.guarantorMemberId == duplicate.id) {
                await dao.updateRound(RoundsCompanion(
                  id: drift.Value(r.id),
                  guarantorMemberId: drift.Value(primary.id),
                ));
              }
              if (r.exchangedToMemberId == duplicate.id) {
                await dao.updateRound(RoundsCompanion(
                  id: drift.Value(r.id),
                  exchangedToMemberId: drift.Value(primary.id),
                ));
              }
            }

            await dao.deleteMember(duplicate.id);
          }
        }
      }
    });
  }

  Future<MemberListState> _loadData() async {
    final dao = ref.watch(appDaoProvider);
    await consolidateDuplicateMembers(dao);
    return _loadDataFast(dao);
  }

  Future<MemberListState> _loadDataFast(AppDao dao) async {
    final members = await dao.getAllMembers();
    final groups = await dao.getAllGroups();
    final memberships = await dao.getAllMemberships();
    return MemberListState(
        members: members, groups: groups, memberships: memberships);
  }

  Timer? _debounce;

  Future<void> search(String query) async {
    if (_debounce?.isActive ?? false) _debounce!.cancel();

    _debounce = Timer(const Duration(milliseconds: 300), () async {
      state = const AsyncValue.loading();
      try {
        final dao = ref.read(appDaoProvider);
        final members = await dao.getAllMembers();
        final groups = await dao.getAllGroups();
        final memberships = await dao.getAllMemberships();

        if (query.isEmpty) {
          state = AsyncValue.data(MemberListState(
              members: members, groups: groups, memberships: memberships));
          return;
        }

        final lowerQuery = query.toLowerCase();
        final filteredMembers = members.where((m) {
          return m.name.toLowerCase().contains(lowerQuery) ||
              m.phone.contains(lowerQuery);
        }).toList();

        state = AsyncValue.data(MemberListState(
            members: filteredMembers,
            groups: groups,
            memberships: memberships));
      } catch (e, st) {
        state = AsyncValue.error(e, st);
      }
    });
  }

  Future<void> addMember(Member member, List<int> groupIds,
      {bool allowZeroSlots = false}) async {
    try {
      final dao = ref.read(appDaoProvider);
      final normalizedPhone = member.phone.replaceAll(RegExp(r'\D'), '');

      final existingMembers = await dao.getAllMembers();
      final existing = existingMembers.firstWhereOrNull(
          (m) => m.phone.replaceAll(RegExp(r'\D'), '') == normalizedPhone);

      int memberId;
      if (existing != null) {
        memberId = existing.id;
      } else {
        memberId = await dao.insertMember(MembersCompanion.insert(
          name: member.name,
          phone: member.phone,
          whatsapp: drift.Value(member.whatsapp),
          address: drift.Value(member.address),
          status: const drift.Value('Active'),
          photoPath: drift.Value(member.photoPath),
        ));
      }

      for (final gId in groupIds) {
        final group = await dao.getGroupById(gId);
        double slotsToAssign = 1.0;
        if (group != null) {
          final allMemberships = await dao.getActiveMembershipsForGroup(gId);
          final currentSlots = allMemberships.fold<double>(
              0, (sum, m) => sum + m.installmentsCount);
          if (currentSlots + 1.0 > group.totalMonths) {
            if (!allowZeroSlots) {
              throw Exception('GROUP_FULL:${group.name}');
            } else {
              slotsToAssign = 0.0;
            }
          }
        }

        final existingMemberships = await dao.getMembershipsForMember(memberId);
        final alreadyEnrolled =
            existingMemberships.any((m) => m.groupId == gId);
        if (!alreadyEnrolled) {
          await dao.insertMembership(MembershipsCompanion.insert(
            memberId: memberId,
            groupId: gId,
            installmentsCount: drift.Value(slotsToAssign),
          ));
        }
      }

      state = AsyncValue.data(await _loadDataFast(dao));
      ref.invalidate(groupsListProvider);
      ref.invalidate(groupDetailProvider);
      ref.invalidate(paymentProvider);
      ref.invalidate(adminDashboardMetricsProvider);
    } catch (e) {
      rethrow;
    }
  }

  Future<void> deleteMember(int memberId) async {
    final dao = ref.read(appDaoProvider);
    try {
      await dao.deleteMember(memberId);
      ref.invalidateSelf();
      ref.invalidate(groupsListProvider);
      ref.invalidate(groupDetailProvider);
      ref.invalidate(paymentProvider);
      ref.invalidate(adminDashboardMetricsProvider);
    } catch (e) {
      // Handle error or surface it to UI
      rethrow;
    }
  }

  Future<void> undoDeleteMember(int memberId) async {
    final dao = ref.read(appDaoProvider);
    try {
      await dao.undoDeleteMember(memberId);
      ref.invalidateSelf();
      ref.invalidate(groupsListProvider);
      ref.invalidate(groupDetailProvider);
      ref.invalidate(paymentProvider);
      ref.invalidate(adminDashboardMetricsProvider);
    } catch (e) {
      rethrow;
    }
  }
}
