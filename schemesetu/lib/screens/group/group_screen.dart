import 'package:chit_fund_app/utils/theme.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../localization/app_localizations.dart';
import '../../widgets/index.dart';
import '../../widgets/enhanced_group_card.dart';
import '../member/member_screen.dart';
import 'group_detail_screen.dart';
import 'groups_list_view_model.dart';
import 'add_group_sheet.dart';
import 'edit_group_sheet.dart';
import '../../data/local/app_database.dart';
import 'package:chit_fund_app/widgets/translated_text.dart'; // for Group type
import '../../providers/auth_provider.dart';
import '../../data/providers/db_provider.dart';
import '../../widgets/scroll_arrows_overlay.dart';

enum GroupSortOption { recentlyAdded, highestValue, nearestEndDate }

class GroupScreen extends ConsumerStatefulWidget {
  final bool isNested;
  const GroupScreen({super.key, this.isNested = false});

  @override
  ConsumerState<GroupScreen> createState() => _GroupScreenState();
}

class _GroupScreenState extends ConsumerState<GroupScreen> {
  String _searchQuery = '';
  GroupSortOption _sortOption = GroupSortOption.recentlyAdded;
  final ScrollController _scrollController = ScrollController();

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _showAddGroupSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => const AddGroupSheet(),
    );
  }

  void _showEditGroupSheet(Group group) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => EditGroupSheet(
        groupId: group.id,
        initialName: group.name,
        initialInstallment: group.monthlyContribution,
        initialTotalMembers: group.totalMonths,
        initialDuration: group.totalMonths,
        initialStartDate: group.startDate,
        initialPaymentDueDate: group.paymentDueDate,
      ),
    );
  }

  List<Group> _getFilteredAndSortedGroups(List<Group> allGroups) {
    var filtered = allGroups
        .where((g) => g.name.toLowerCase().contains(_searchQuery.toLowerCase()))
        .toList();

    filtered.sort((a, b) {
      switch (_sortOption) {
        case GroupSortOption.recentlyAdded:
          return b.id
              .compareTo(a.id); // Assuming ID correlates with creation time
        case GroupSortOption.highestValue:
          return b.chitValue.compareTo(a.chitValue);
        case GroupSortOption.nearestEndDate:
          final aEndDate = DateTime(a.startDate.year,
              a.startDate.month + a.totalMonths, a.startDate.day);
          final bEndDate = DateTime(b.startDate.year,
              b.startDate.month + b.totalMonths, b.startDate.day);
          return aEndDate.compareTo(bEndDate);
      }
    });

    return filtered;
  }

  @override
  Widget build(BuildContext context) {
    final stateAsync = ref.watch(groupsListProvider);
    final localizations = AppLocalizations.of(context);

    return Scaffold(
      appBar: AppBar(
        title: TranslatedText(localizations.translate('chit_groups')),
      ),
      floatingActionButton: FloatingActionButton(
        heroTag: 'group_fab',
        onPressed: _showAddGroupSheet,
        backgroundColor: AppTheme.primaryTeal,
        child: const Icon(Icons.add, color: Colors.white),
      ),
      body: stateAsync.when(
        loading: () => const ListSkeleton(itemCount: 8),
        error: (err, st) =>
            Center(child: TranslatedText('Error loading groups: $err')),
        data: (state) {
          if (state.groups.isEmpty) {
            return EmptyStateWidget(
              icon: Icons.groups_outlined,
              title: localizations.translate('no_groups_configured'),
              description: 'Create your first group to start managing chits.',
              onActionPressed: _showAddGroupSheet,
              actionButtonLabel: localizations.translate('create_first_group'),
            );
          }

          final displayGroups = _getFilteredAndSortedGroups(state.groups);

          return Column(
            children: [
              // Search & Filter Bar
              Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Row(
                  children: [
                    Expanded(
                      child: TextField(
                        decoration: InputDecoration(
                          hintText: 'Search groups...',
                          prefixIcon: const Icon(Icons.search),
                          contentPadding: const EdgeInsets.symmetric(
                              vertical: 0, horizontal: 16),
                          border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12)),
                        ),
                        onChanged: (val) {
                          setState(() {
                            _searchQuery = val;
                          });
                        },
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      decoration: BoxDecoration(
                        border: Border.all(color: Colors.grey.shade400),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<GroupSortOption>(
                          value: _sortOption,
                          icon: const Icon(Icons.sort),
                          onChanged: (val) {
                            if (val != null) setState(() => _sortOption = val);
                          },
                          items: const [
                            DropdownMenuItem(
                                value: GroupSortOption.recentlyAdded,
                                child: TranslatedText('Newest')),
                            DropdownMenuItem(
                                value: GroupSortOption.highestValue,
                                child: TranslatedText('Highest Value')),
                            DropdownMenuItem(
                                value: GroupSortOption.nearestEndDate,
                                child: TranslatedText('Nearest End')),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: displayGroups.isEmpty
                    ? const Center(
                        child: TranslatedText('No matching groups found.'))
                    : RefreshIndicator(
                        color: AppTheme.primaryTeal,
                        onRefresh: () async {
                          ref.invalidate(groupsListProvider);
                        },
                        child: ScrollArrowsOverlay(
                          bottomPadding: 90,
                          scrollController: _scrollController,
                          child: LayoutBuilder(
                            builder: (context, constraints) {
                              if (constraints.maxWidth > 600) {
                                return GridView.builder(
                                  controller: _scrollController,
                                  padding: const EdgeInsets.all(16),
                                  gridDelegate:
                                      const SliverGridDelegateWithFixedCrossAxisCount(
                                    crossAxisCount: 2,
                                    childAspectRatio: 2.0,
                                    crossAxisSpacing: 16,
                                    mainAxisSpacing: 16,
                                  ),
                                  itemCount: displayGroups.length,
                                  itemBuilder: (context, index) {
                                    final group = displayGroups[index];
                                    final totalSlots =
                                        state.totalSlots[group.id] ?? 0.0;
                                    final memberCount =
                                        state.memberCounts[group.id] ?? 0;
                                    final now = DateTime.now();
                                    final monthsElapsed =
                                        ((now.year - group.startDate.year) *
                                                12) +
                                            (now.month - group.startDate.month);
                                    final status =
                                        monthsElapsed >= group.totalMonths
                                            ? 'completed'
                                            : (totalSlots >=
                                                    (group.totalMonths - 0.01)
                                                ? 'active'
                                                : 'pending');

                                    return GestureDetector(
                                      onTap: () {
                                        Navigator.push(
                                          context,
                                          MaterialPageRoute(
                                            builder: (_) =>
                                                GroupDetailScreen(group: group),
                                          ),
                                        );
                                      },
                                      child: EnhancedGroupCard(
                                        groupName: group.name,
                                        memberCount: memberCount,
                                        installmentAmount:
                                            group.monthlyContribution,
                                        duration: group.totalMonths,
                                        monthsCompleted:
                                            ((state.roundProgress[group.id] ??
                                                        0.0) *
                                                    group.totalMonths)
                                                .round(),
                                        startDate: group.startDate,
                                        status: status,
                                        whatsappGroupLink:
                                            group.whatsappGroupLink,
                                        radialProgress:
                                            state.roundProgress[group.id] ??
                                                0.0,
                                        onViewMembers: () {
                                          Navigator.push(
                                            context,
                                            MaterialPageRoute(
                                              builder: (context) =>
                                                  MemberScreen(
                                                      initialGroupId: group.id),
                                            ),
                                          );
                                        },
                                        onSync: () async {
                                          DialogHelper.showSnackBar(
                                            context,
                                            message:
                                                'Group is already up-to-date locally.',
                                            type: SnackBarType.success,
                                          );
                                        },
                                        onEdit: () =>
                                            _showEditGroupSheet(group),
                                        onDelete: () async {
                                          final confirmed = await DialogHelper
                                              .showConfirmation(
                                            context,
                                            title: 'Delete Group?',
                                            message:
                                                'This will remove "${group.name}" and all its associated members and payments.\n\nThis action cannot be undone.',
                                            confirmText: 'Delete',
                                            cancelText: 'Cancel',
                                          );
                                          if (confirmed) {
                                            if (!context.mounted) return;
                                            final isAuthenticated = await ref
                                                .read(authProvider.notifier)
                                                .authenticateForCriticalAction(
                                                  context,
                                                  'Authenticate to delete this group.',
                                                );
                                            if (!context.mounted) return;
                                            if (!isAuthenticated) {
                                              DialogHelper.showSnackBar(context,
                                                  message:
                                                      'Authentication failed. Action cancelled.',
                                                  type: SnackBarType.error);
                                              return;
                                            }
                                            if (!context.mounted) return;
                                            DialogHelper.showLoading(context,
                                                message: 'Deleting group...');
                                            try {
                                              await ref
                                                  .read(appDaoProvider)
                                                  .logAction('Delete Group',
                                                      group.name);
                                              await ref
                                                  .read(groupsListProvider
                                                      .notifier)
                                                  .deleteGroup(group.id);
                                              if (!context.mounted) return;
                                              Navigator.pop(context);
                                              if (!context.mounted) return;
                                              HapticFeedback.mediumImpact();
                                              DialogHelper.showSnackBar(
                                                context,
                                                message:
                                                    'Group deleted successfully',
                                                type: SnackBarType.success,
                                                duration:
                                                    const Duration(seconds: 4),
                                                action: SnackBarAction(
                                                  label: 'Undo',
                                                  textColor: Colors.white,
                                                  onPressed: () {
                                                    ref
                                                        .read(groupsListProvider
                                                            .notifier)
                                                        .undoDeleteGroup(
                                                            group.id);
                                                  },
                                                ),
                                              );
                                            } catch (e) {
                                              if (!context.mounted) return;
                                              Navigator.pop(context);
                                              if (!context.mounted) return;
                                              DialogHelper.showSnackBar(
                                                context,
                                                message:
                                                    'Failed to delete group: ${e.toString()}',
                                                type: SnackBarType.error,
                                              );
                                            }
                                          }
                                        },
                                      ),
                                    );
                                  },
                                );
                              }
                              return ListView.builder(
                                controller: _scrollController,
                                padding: const EdgeInsets.all(16),
                                itemCount: displayGroups.length,
                                itemBuilder: (context, index) {
                                  final group = displayGroups[index];
                                  final totalSlots =
                                      state.totalSlots[group.id] ?? 0.0;
                                  final memberCount =
                                      state.memberCounts[group.id] ?? 0;
                                  final now = DateTime.now();
                                  final monthsElapsed =
                                      ((now.year - group.startDate.year) * 12) +
                                          (now.month - group.startDate.month);
                                  final status =
                                      monthsElapsed >= group.totalMonths
                                          ? 'completed'
                                          : (totalSlots >=
                                                  (group.totalMonths - 0.01)
                                              ? 'active'
                                              : 'pending');

                                  return GestureDetector(
                                    onTap: () {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (_) =>
                                              GroupDetailScreen(group: group),
                                        ),
                                      );
                                    },
                                    child: EnhancedGroupCard(
                                      groupName: group.name,
                                      memberCount: memberCount,
                                      installmentAmount:
                                          group.monthlyContribution,
                                      duration: group.totalMonths,
                                      monthsCompleted:
                                          ((state.roundProgress[group.id] ??
                                                      0.0) *
                                                  group.totalMonths)
                                              .round(),
                                      startDate: group.startDate,
                                      status: status,
                                      whatsappGroupLink:
                                          group.whatsappGroupLink,
                                      radialProgress:
                                          state.roundProgress[group.id] ?? 0.0,
                                      onViewMembers: () {
                                        Navigator.push(
                                          context,
                                          MaterialPageRoute(
                                            builder: (context) => MemberScreen(
                                                initialGroupId: group.id),
                                          ),
                                        );
                                      },
                                      onSync: () async {
                                        DialogHelper.showSnackBar(
                                          context,
                                          message:
                                              'Group is already up-to-date locally.',
                                          type: SnackBarType.success,
                                        );
                                      },
                                      onEdit: () => _showEditGroupSheet(group),
                                      onDelete: () async {
                                        final confirmed =
                                            await DialogHelper.showConfirmation(
                                          context,
                                          title: 'Delete Group?',
                                          message:
                                              'This will remove "${group.name}" and all its associated members and payments.\n\nThis action cannot be undone.',
                                          confirmText: 'Delete',
                                          cancelText: 'Cancel',
                                        );
                                        if (confirmed) {
                                          if (!context.mounted) return;
                                          final isAuthenticated = await ref
                                              .read(authProvider.notifier)
                                              .authenticateForCriticalAction(
                                                context,
                                                'Authenticate to delete this group.',
                                              );
                                          if (!context.mounted) return;
                                          if (!isAuthenticated) {
                                            DialogHelper.showSnackBar(context,
                                                message:
                                                    'Authentication failed. Action cancelled.',
                                                type: SnackBarType.error);
                                            return;
                                          }
                                          if (!context.mounted) return;
                                          DialogHelper.showLoading(context,
                                              message: 'Deleting group...');
                                          try {
                                            await ref
                                                .read(appDaoProvider)
                                                .logAction(
                                                    'Delete Group', group.name);
                                            await ref
                                                .read(
                                                    groupsListProvider.notifier)
                                                .deleteGroup(group.id);
                                            if (!context.mounted) return;
                                            Navigator.pop(context);
                                            if (!context.mounted) return;
                                            HapticFeedback.mediumImpact();
                                            DialogHelper.showSnackBar(
                                              context,
                                              message:
                                                  'Group deleted successfully',
                                              type: SnackBarType.success,
                                              duration:
                                                  const Duration(seconds: 4),
                                              action: SnackBarAction(
                                                label: 'Undo',
                                                textColor: Colors.white,
                                                onPressed: () {
                                                  ref
                                                      .read(groupsListProvider
                                                          .notifier)
                                                      .undoDeleteGroup(
                                                          group.id);
                                                },
                                              ),
                                            );
                                          } catch (e) {
                                            if (!context.mounted) return;
                                            Navigator.pop(context);
                                            if (!context.mounted) return;
                                            DialogHelper.showSnackBar(
                                              context,
                                              message:
                                                  'Failed to delete group: ${e.toString()}',
                                              type: SnackBarType.error,
                                            );
                                          }
                                        }
                                      },
                                    ),
                                  );
                                },
                              );
                            },
                          ),
                        ),
                      ),
              ),
            ],
          );
        },
      ),
    );
  }
}
