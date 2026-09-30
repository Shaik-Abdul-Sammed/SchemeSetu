import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:collection/collection.dart';
import '../../data/local/app_database.dart';
import '../../data/providers/db_provider.dart';

part 'payment_history_view_model.g.dart';

enum PaymentHistoryType {
  regular,
  late,
  winnerPaid,
}

class PaymentHistoryItem {
  final PaymentHistoryType type;
  final double amount;
  final DateTime date;
  final Member member;
  final Group group;
  final String note;
  final Member? exchangedToMember;

  PaymentHistoryItem({
    required this.type,
    required this.amount,
    required this.date,
    required this.member,
    required this.group,
    this.note = '',
    this.exchangedToMember,
  });
}

@riverpod
class PaymentHistoryNotifier extends _$PaymentHistoryNotifier {
  @override
  Future<List<PaymentHistoryItem>> build() async {
    ref.watch(dbUpdatesProvider);
    final dao = ref.watch(appDaoProvider);

    final payments = await dao.getAllPayments();
    final rounds = await dao.getAllRounds();
    final allMemberships = await dao.getAllMemberships();
    final allMembers = await dao.getAllMembers();
    final allGroups = await dao.getAllGroups();

    List<PaymentHistoryItem> history = [];

    // Process Collections
    for (var p in payments) {
      if (p.status != 'Completed') continue;

      final ms = allMemberships.firstWhereOrNull((m) => m.id == p.membershipId);
      if (ms == null) continue;

      final member = allMembers.firstWhereOrNull((m) => m.id == ms.memberId);
      if (member == null) continue;

      final group = allGroups.firstWhereOrNull((g) => g.id == ms.groupId);
      if (group == null) continue;

      // Determine if Late
      final round = rounds.firstWhereOrNull((r) => r.id == p.roundId);
      bool isLate = false;
      if (round != null) {
        final dueDate = DateTime(round.year, round.month, group.paymentDueDate);
        isLate = p.paymentDate.isAfter(
            DateTime(dueDate.year, dueDate.month, dueDate.day, 23, 59, 59));
      }

      history.add(PaymentHistoryItem(
        type: isLate ? PaymentHistoryType.late : PaymentHistoryType.regular,
        amount: p.amount,
        date: p.paymentDate,
        member: member,
        group: group,
        note: p.remarks ?? '',
      ));
    }

    // Process Pending Late Payments
    final now = DateTime.now();
    for (var r in rounds) {
      final group = allGroups.firstWhereOrNull((g) => g.id == r.groupId);
      if (group == null || group.status != 'Active') continue;

      final dueDate =
          DateTime(r.year, r.month, group.paymentDueDate, 23, 59, 59);
      if (now.isAfter(dueDate)) {
        final roundMemberships =
            allMemberships.where((ms) => ms.groupId == group.id).toList();
        for (final ms in roundMemberships) {
          final member =
              allMembers.firstWhereOrNull((m) => m.id == ms.memberId);
          if (member == null) continue;

          final expectedAmount =
              group.monthlyContribution * ms.installmentsCount;
          final roundPayments = payments.where((p) =>
              p.roundId == r.id &&
              p.membershipId == ms.id &&
              p.status == 'Completed');
          final collectedAmount =
              roundPayments.fold<double>(0, (sum, p) => sum + p.amount);

          if (collectedAmount < expectedAmount) {
            final pendingAmount = expectedAmount - collectedAmount;
            history.add(PaymentHistoryItem(
              type: PaymentHistoryType.late,
              amount: pendingAmount,
              date: dueDate, // Show due date for sorting
              member: member,
              group: group,
              note: 'Late Payer (Pending)',
            ));
          }
        }
      }
    }

    // Process Winner Payouts
    for (var r in rounds) {
      if (r.winnerMemberId != null && (r.winnerPaid ?? 0) > 0) {
        final member =
            allMembers.firstWhereOrNull((m) => m.id == r.winnerMemberId);
        if (member == null) continue;

        final group = allGroups.firstWhereOrNull((g) => g.id == r.groupId);
        if (group == null) continue;

        Member? exchangedTo;
        if (r.exchangedToMemberId != null) {
          exchangedTo =
              allMembers.firstWhereOrNull((m) => m.id == r.exchangedToMemberId);
        }

        // We use payoutDate if it exists, otherwise fallback to start of the round month
        final pDate = r.payoutDate ?? DateTime(r.year, r.month, 1);

        String winnerNote = r.winnerRemarks ?? '';
        if (exchangedTo != null) {
          winnerNote += '\\nExchanged to: ${exchangedTo.name}';
          if (r.exchangeNote != null && r.exchangeNote!.isNotEmpty) {
            winnerNote += ' (${r.exchangeNote})';
          }
        }

        history.add(PaymentHistoryItem(
          type: PaymentHistoryType.winnerPaid,
          amount: r.winnerPaid!,
          date: pDate,
          member: member,
          group: group,
          note: winnerNote.trim(),
          exchangedToMember: exchangedTo,
        ));
      }
    }

    // Sort by most recent
    history.sort((a, b) => b.date.compareTo(a.date));

    return history;
  }
}
