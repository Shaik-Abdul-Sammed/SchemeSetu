import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:drift/drift.dart' as drift;
import '../../data/local/app_database.dart';
import '../../data/providers/db_provider.dart';
import '../dashboard/admin_dashboard_view_model.dart';
import '../payment/payment_view_model.dart';

part 'groups_list_view_model.g.dart';

class MemberDraft {
  final String name;
  final String mobile;
  final String address;
  final double installmentsCount;

  const MemberDraft({
    required this.name,
    this.mobile = '',
    this.address = '',
    this.installmentsCount = 1.0,
  });
}

class GroupListState {
  final List<Group> groups;
  final Map<int, int> memberCounts;
  final Map<int, double> totalSlots;
  final Map<int, double> roundProgress;
  final bool isLoading;

  GroupListState({
    required this.groups,
    required this.memberCounts,
    required this.totalSlots,
    required this.roundProgress,
    this.isLoading = false,
  });
}

@riverpod
class GroupsList extends _$GroupsList {
  @override
  Future<GroupListState> build() async {
    ref.watch(dbUpdatesProvider);
    return _loadData();
  }

  Future<GroupListState> _loadData() async {
    final dao = ref.watch(appDaoProvider);
    final groups = await dao.getAllGroups();

    final Map<int, int> memberCounts = {};
    final Map<int, double> totalSlots = {};
    final Map<int, double> roundProgress = {};

    for (final g in groups) {
      final allMemberships = await dao.getActiveMembershipsForGroup(g.id);
      final memberships = allMemberships;
      memberCounts[g.id] = memberships.length;

      final allMembershipIds = memberships.map((ms) => ms.id).toList();
      final groupPayments =
          await dao.getPaymentsForMembershipIds(allMembershipIds);
      bool isWinnerPayout(p) =>
          (p.remarks ?? '').startsWith('🏆 Winner Payout:');

      final totalCollected = groupPayments
          .where((p) => p.status == 'Completed' && !isWinnerPayout(p))
          .fold<double>(0, (sum, p) => sum + p.amount);

      final totalInstallments =
          memberships.fold<double>(0, (sum, ms) => sum + ms.installmentsCount);
      totalSlots[g.id] = totalInstallments;
      final totalExpected =
          g.totalMonths * g.monthlyContribution * totalInstallments;

      roundProgress[g.id] = totalExpected > 0
          ? (totalCollected / totalExpected).clamp(0.0, 1.0)
          : 0.0;
    }
    return GroupListState(
      groups: groups,
      memberCounts: memberCounts,
      totalSlots: totalSlots,
      roundProgress: roundProgress,
    );
  }

  Future<void> createGroup({
    required String name,
    required double installment,
    required int totalMembers,
    required int duration,
    required DateTime startDate,
    required List<MemberDraft> members,
    int paymentDueDate = 15,
  }) async {
    final dao = ref.read(appDaoProvider);
    final groupId = await dao.insertGroup(GroupsCompanion.insert(
      name: name,
      chitValue: installment * totalMembers * duration,
      totalMonths: duration,
      monthlyContribution: installment,
      startDate: startDate,
      status: const drift.Value('Active'),
      paymentDueDate: drift.Value(paymentDueDate),
    ));

    final List<MemberDraft> finalMembers = List.from(members);

    for (final m in finalMembers) {
      if (m.name.trim().isEmpty) continue;

      String safePhone = m.mobile.replaceAll(RegExp(r'[^0-9+]'), '');
      if (safePhone.isEmpty) safePhone = '0000000000';
      if (safePhone.length < 10) safePhone = safePhone.padRight(10, '0');
      if (safePhone.length > 15) safePhone = safePhone.substring(0, 15);

      final memberId = await dao.insertMember(MembersCompanion.insert(
        name: m.name.trim(),
        phone: safePhone,
        whatsapp: drift.Value(safePhone),
        address: drift.Value(m.address.trim()),
        status: const drift.Value('Active'),
      ));

      await dao.insertMembership(MembershipsCompanion.insert(
        memberId: memberId,
        groupId: groupId,
        installmentsCount: drift.Value(m.installmentsCount),
      ));
    }
    ref.invalidateSelf();
    ref.invalidate(adminDashboardMetricsProvider);
    ref.invalidate(paymentProvider);
  }

  Future<void> editGroup(
    int id, {
    required String name,
    required double installment,
    required int totalMembers,
    required int duration,
    required DateTime startDate,
    int paymentDueDate = 15,
  }) async {
    final dao = ref.read(appDaoProvider);
    await dao.updateGroup(GroupsCompanion(
      id: drift.Value(id),
      name: drift.Value(name),
      chitValue: drift.Value(installment * totalMembers * duration),
      totalMonths: drift.Value(duration),
      monthlyContribution: drift.Value(installment),
      startDate: drift.Value(startDate),
      paymentDueDate: drift.Value(paymentDueDate),
    ));

    ref.invalidateSelf();
    ref.invalidate(adminDashboardMetricsProvider);
    ref.invalidate(paymentProvider);
  }

  Future<void> deleteGroup(int id) async {
    final dao = ref.read(appDaoProvider);
    await dao.deleteGroupWithDependencies(id);
    ref.invalidateSelf();
    ref.invalidate(adminDashboardMetricsProvider);
    ref.invalidate(paymentProvider);
  }

  Future<void> undoDeleteGroup(int id) async {
    final dao = ref.read(appDaoProvider);
    await dao.undoDeleteGroup(id);
    ref.invalidateSelf();
    ref.invalidate(adminDashboardMetricsProvider);
    ref.invalidate(paymentProvider);
  }
}
