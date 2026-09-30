import 'package:chit_fund_app/utils/theme.dart';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';
import 'package:flutter_contacts/flutter_contacts.dart' hide Group;
import '../../utils/image_utils.dart';
import 'package:collection/collection.dart';
import 'package:mask_text_input_formatter/mask_text_input_formatter.dart';

import '../../data/local/app_database.dart';
import '../../localization/app_localizations.dart';
import '../../core/services/messaging_service.dart';
import 'members_list_view_model.dart';
import 'advanced_member_profile_screen.dart';
import '../../widgets/index.dart';
import '../../widgets/translated_text.dart';
import '../../services/communication_service.dart';
import '../../widgets/language_selection_dialog.dart';
import '../../data/providers/db_provider.dart';
import 'import_members_sheet.dart';
import '../../widgets/scroll_arrows_overlay.dart';

class MemberScreen extends ConsumerStatefulWidget {
  final int? initialGroupId;
  final bool isNested;
  const MemberScreen({super.key, this.initialGroupId, this.isNested = false});

  @override
  ConsumerState<MemberScreen> createState() => _MemberScreenState();
}

class _MemberScreenState extends ConsumerState<MemberScreen> {
  final _searchController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  @override
  void dispose() {
    _searchController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _showAddMemberSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => AddMemberSheet(initialGroupId: widget.initialGroupId),
    );
  }

  @override
  Widget build(BuildContext context) {
    final stateAsync = ref.watch(memberListProvider);
    final localizations = AppLocalizations.of(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: TranslatedText(localizations.translate('members_list')),
        actions: [
          IconButton(
            icon: const Icon(Icons.file_upload_outlined),
            tooltip: 'Import CSV',
            onPressed: () async {
              final result = await showModalBottomSheet(
                context: context,
                isScrollControlled: true,
                backgroundColor: Colors.transparent,
                builder: (ctx) => const ImportMembersSheet(),
              );
              if (result != null && result is int && result > 0) {
                ref.invalidate(memberListProvider);
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                        content: TranslatedText(
                            'Successfully imported $result members')),
                  );
                }
              }
            },
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        heroTag: 'member_fab',
        onPressed: _showAddMemberSheet,
        backgroundColor: AppTheme.primaryTeal,
        child: const Icon(Icons.add, color: Colors.white),
      ),
      body: stateAsync.when(
        loading: () => const ListSkeleton(itemCount: 8),
        error: (err, st) =>
            Center(child: TranslatedText('Error loading members: $err')),
        data: (state) {
          final filteredMembers = state.members;

          return Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              children: [
                TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    prefixIcon:
                        const Icon(Icons.search, color: AppTheme.primaryTeal),
                    hintText: 'Search by Name or Mobile...',
                    fillColor: isDark
                        ? Colors.white.withValues(alpha: 0.03)
                        : Colors.white,
                  ),
                  onChanged: (val) {
                    ref.read(memberListProvider.notifier).search(val);
                  },
                ),
                const SizedBox(height: 20),
                Expanded(
                  child: filteredMembers.isEmpty
                      ? EmptyStateWidget(
                          icon: Icons.person_search_rounded,
                          title: 'No Members Found',
                          description: _searchController.text.isEmpty
                              ? 'You haven\'t added any members yet.'
                              : 'No members match your search query.',
                          onActionPressed: _searchController.text.isEmpty
                              ? _showAddMemberSheet
                              : null,
                          actionButtonLabel: 'Add Member',
                        )
                      : Builder(
                          builder: (context) {
                            final maxTrustScore = filteredMembers.isEmpty
                                ? 0.0
                                : filteredMembers
                                    .map((m) => m.trustScore ?? 0.0)
                                    .reduce((a, b) => a > b ? a : b);

                            return RefreshIndicator(
                              color: AppTheme.primaryTeal,
                              onRefresh: () async {
                                ref.invalidate(memberListProvider);
                              },
                              child: ScrollArrowsOverlay(
                                bottomPadding: 90,
                                scrollController: _scrollController,
                                child: LayoutBuilder(
                                  builder: (context, constraints) {
                                    if (constraints.maxWidth > 600) {
                                      return GridView.builder(
                                        controller: _scrollController,
                                        gridDelegate:
                                            const SliverGridDelegateWithFixedCrossAxisCount(
                                          crossAxisCount: 2,
                                          childAspectRatio: 2.5,
                                          crossAxisSpacing: 12,
                                          mainAxisSpacing: 12,
                                        ),
                                        itemCount: filteredMembers.length,
                                        itemBuilder: (context, index) {
                                          final member = filteredMembers[index];
                                          final isHighestTrust =
                                              maxTrustScore > 0 &&
                                                  (member.trustScore ?? 0) ==
                                                      maxTrustScore;
                                          final memberMemberships = state
                                              .memberships
                                              .where((m) =>
                                                  m.memberId == member.id)
                                              .toList();
                                          final memberGroups = memberMemberships
                                              .map((m) => state.groups
                                                  .firstWhereOrNull(
                                                      (g) => g.id == m.groupId))
                                              .nonNulls
                                              .toList();
                                          return _MemberCard(
                                            member: member,
                                            memberGroups: memberGroups,
                                            isHighestTrust: isHighestTrust,
                                          );
                                        },
                                      );
                                    }
                                    return ListView.builder(
                                      controller: _scrollController,
                                      itemCount: filteredMembers.length,
                                      itemBuilder: (context, index) {
                                        final member = filteredMembers[index];
                                        final isHighestTrust =
                                            maxTrustScore > 0 &&
                                                (member.trustScore ?? 0) ==
                                                    maxTrustScore;

                                        final memberMemberships = state
                                            .memberships
                                            .where(
                                                (m) => m.memberId == member.id)
                                            .toList();
                                        final memberGroups = memberMemberships
                                            .map((m) => state.groups
                                                .firstWhereOrNull(
                                                    (g) => g.id == m.groupId))
                                            .nonNulls
                                            .toList();

                                        return _MemberCard(
                                          member: member,
                                          memberGroups: memberGroups,
                                          isHighestTrust: isHighestTrust,
                                        );
                                      },
                                    );
                                  },
                                ),
                              ),
                            );
                          },
                        ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _MemberCard extends ConsumerWidget {
  final Member member;
  final bool isHighestTrust;
  final List<Group> memberGroups;

  const _MemberCard({
    required this.member,
    required this.memberGroups,
    this.isHighestTrust = false,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => AdvancedMemberProfileScreen(memberId: member.id),
          ),
        );
      },
      child: GlassCard(
        padding: const EdgeInsets.all(20), // Increased from 16
        margin: const EdgeInsets.only(bottom: 16), // Increased from 12
        child: Row(
          children: [
            Hero(
              tag: 'avatar_${member.id}',
              child: CircleAvatar(
                radius: 30, // Increased from 24
                backgroundColor: AppTheme.primaryTeal.withValues(alpha: 0.1),
                backgroundImage: member.photoPath != null
                    ? FileImage(File(member.photoPath!))
                    : null,
                child: member.photoPath == null
                    ? Text(
                        member.name.trim().isNotEmpty
                            ? member.name.trim()[0].toUpperCase()
                            : '?',
                        style: const TextStyle(
                            color: AppTheme.primaryTeal,
                            fontWeight: FontWeight.bold,
                            fontSize: 22), // Increased from 18
                      )
                    : null,
              ),
            ),
            const SizedBox(width: 18),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          member.name,
                          style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold), // Increased from 16
                          maxLines: 3,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      if (isHighestTrust) ...[
                        const SizedBox(width: 4),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.amber.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: Colors.amber, width: 0.5),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.star_rounded,
                                  color: Colors.amber, size: 10),
                              const SizedBox(width: 2),
                              TranslatedText(
                                'Top Trust',
                                style: GoogleFonts.outfit(
                                  fontSize: 9,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.amber[800],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 4),
                  TranslatedText(
                    'Ph: ${member.phone}',
                    style: const TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                  if (memberGroups.isNotEmpty) ...[
                    const SizedBox(height: 6),
                    Wrap(
                      spacing: 4,
                      runSpacing: 4,
                      children: memberGroups.map((g) {
                        return Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: AppTheme.primaryTeal.withValues(alpha: 0.08),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(
                                color:
                                    AppTheme.primaryTeal.withValues(alpha: 0.2),
                                width: 0.5),
                          ),
                          child: Text(
                            g.name,
                            style: GoogleFonts.outfit(
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                              color: AppTheme.primaryTeal,
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ],
                ],
              ),
            ),
            PopupMenuButton<String>(
              icon: const Icon(Icons.more_vert_rounded, color: Colors.grey),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
              itemBuilder: (context) => [
                PopupMenuItem(
                  value: 'call',
                  child: Row(
                    children: [
                      const Icon(Icons.call_rounded,
                          color: AppTheme.primaryTeal, size: 20),
                      const SizedBox(width: 10),
                      TranslatedText('Call', style: GoogleFonts.outfit()),
                    ],
                  ),
                ),
                PopupMenuItem(
                  value: 'whatsapp',
                  child: Row(
                    children: [
                      const Icon(Icons.message, color: Colors.green, size: 20),
                      const SizedBox(width: 10),
                      TranslatedText('WhatsApp', style: GoogleFonts.outfit()),
                    ],
                  ),
                ),
                PopupMenuItem(
                  value: 'reminder',
                  child: Row(
                    children: [
                      const Icon(Icons.notification_important_rounded,
                          color: Colors.orange, size: 20),
                      const SizedBox(width: 10),
                      TranslatedText('Send Dues Reminder',
                          style: GoogleFonts.outfit()),
                    ],
                  ),
                ),
                PopupMenuItem(
                  value: 'delete',
                  child: Row(
                    children: [
                      const Icon(Icons.delete_outline,
                          color: Colors.red, size: 20),
                      const SizedBox(width: 10),
                      TranslatedText('Delete',
                          style: GoogleFonts.outfit(color: Colors.red)),
                    ],
                  ),
                ),
              ],
              onSelected: (value) async {
                if (value == 'call') {
                  CommunicationService().launchCall(member.phone);
                } else if (value == 'whatsapp') {
                  ref
                      .read(messagingServiceProvider)
                      .sendWhatsApp(member.phone, 'Hello ${member.name},');
                } else if (value == 'reminder') {
                  final chosenLang =
                      await LanguageSelectionDialog.show(context);
                  if (chosenLang != null) {
                    final dao = ref.read(appDaoProvider);
                    await CommunicationService()
                        .launchConsolidatedWhatsAppReminder(
                      dao: dao,
                      member: member,
                      languageCode: chosenLang,
                    );
                  }
                } else if (value == 'delete') {
                  final confirm = await showDialog<bool>(
                    context: context,
                    builder: (c) => AlertDialog(
                      title: const Text('Delete Member',
                          style: TextStyle(fontWeight: FontWeight.bold)),
                      content: Text(
                          'Are you sure you want to permanently delete ${member.name}? This will remove them from all groups and delete all payment history.'),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.pop(c, false),
                          child: const Text('Cancel'),
                        ),
                        ElevatedButton(
                          style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.redAccent),
                          onPressed: () => Navigator.pop(c, true),
                          child: const Text('Delete',
                              style: TextStyle(color: Colors.white)),
                        ),
                      ],
                    ),
                  );

                  if (confirm == true) {
                    if (!context.mounted) return;
                    try {
                      DialogHelper.showLoading(context,
                          message: 'Deleting member...');
                      await ref
                          .read(memberListProvider.notifier)
                          .deleteMember(member.id);
                      if (context.mounted) {
                        Navigator.pop(context); // Close loading
                        DialogHelper.showSnackBar(
                          context,
                          message: '${member.name} deleted successfully.',
                          type: SnackBarType.success,
                          duration: const Duration(seconds: 2),
                          action: SnackBarAction(
                            label: 'Undo',
                            textColor: Colors.white,
                            onPressed: () {
                              ref
                                  .read(memberListProvider.notifier)
                                  .undoDeleteMember(member.id);
                            },
                          ),
                        );
                      }
                    } catch (e) {
                      if (context.mounted) {
                        Navigator.pop(context); // Close loading
                        DialogHelper.showSnackBar(
                          context,
                          message: 'Failed to delete member: $e',
                          type: SnackBarType.error,
                        );
                      }
                    }
                  }
                }
              },
            ),
          ],
        ),
      ),
    );
  }
}

class AddMemberSheet extends ConsumerStatefulWidget {
  final int? initialGroupId;

  const AddMemberSheet({super.key, this.initialGroupId});

  @override
  ConsumerState<AddMemberSheet> createState() => AddMemberSheetState();
}

class AddMemberSheetState extends ConsumerState<AddMemberSheet> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _mobileController = TextEditingController();
  final _addressController = TextEditingController();
  final List<int> _selectedGroupIds = [];
  String? _photoPath;

  final _phoneFormatter = MaskTextInputFormatter(
    mask: '##### #####',
    filter: {'#': RegExp(r'[0-9]')},
    type: MaskAutoCompletionType.lazy,
  );

  @override
  void initState() {
    super.initState();
    if (widget.initialGroupId != null) {
      _selectedGroupIds.add(widget.initialGroupId!);
    }
  }

  Future<void> _pickContact() async {
    if (await FlutterContacts.permissions.request(PermissionType.read) !=
        PermissionStatus.granted) {
      if (mounted) {
        DialogHelper.showSnackBar(
          context,
          message: 'Contacts permission required to pick a contact.',
          type: SnackBarType.warning,
        );
      }
      return;
    }

    final contacts = await FlutterContacts.getAll(
        properties: ContactProperties.allProperties);
    if (!mounted || contacts.isEmpty) return;

    final selected = await showDialog<Contact>(
      context: context,
      builder: (ctx) => _SingleContactPickerDialog(contacts: contacts),
    );

    if (selected != null) {
      final name = (selected.displayName ?? '').trim();
      final phone = selected.phones.isNotEmpty
          ? selected.phones.first.number.replaceAll(RegExp(r'[^0-9+]'), '')
          : '';
      setState(() {
        _nameController.text = name;
        _mobileController.text = phone;
      });
    }
  }

  Future<void> _pickPhoto() async {
    final picker = ImagePicker();
    final image = await picker.pickImage(source: ImageSource.gallery);
    if (image != null) {
      final compressedPath = await ImageUtils.compressImage(image.path);
      setState(() {
        _photoPath = compressedPath ?? image.path;
      });
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate() || _selectedGroupIds.isEmpty) {
      DialogHelper.showSnackBar(
        context,
        message:
            'Please fill all required fields and select at least one group.',
        type: SnackBarType.warning,
      );
      return;
    }

    DialogHelper.showLoading(context, message: 'Adding member...');

    try {
      final dummyMember = Member(
        id: 0,
        name: _nameController.text.trim(),
        phone: _mobileController.text.trim(),
        whatsapp: _mobileController.text.trim(),
        address: _addressController.text.trim(),
        joiningDate: DateTime.now(),
        status: 'Active',
        photoPath: _photoPath,
      );

      await ref
          .read(memberListProvider.notifier)
          .addMember(dummyMember, _selectedGroupIds);

      if (!mounted) return;
      Navigator.pop(context); // Close loading
      Navigator.pop(context); // Close sheet

      HapticFeedback.mediumImpact();
      DialogHelper.showSnackBar(
        context,
        message: 'Member added successfully!',
        type: SnackBarType.success,
      );
    } catch (e) {
      if (!mounted) return;
      Navigator.pop(context); // Close loading

      if (e.toString().contains('GROUP_FULL:')) {
        final groupName = e.toString().split('GROUP_FULL:')[1].trim();
        final confirm = await showDialog<bool>(
          context: context,
          builder: (c) => AlertDialog(
            title: const Text('Group Slots Filled',
                style: TextStyle(fontWeight: FontWeight.bold)),
            content: Text(
                'The slots for group "$groupName" are already fixed/filled. Do you want to add this member with 0 slots as an extra member?'),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(c, false),
                child: const Text('Cancel'),
              ),
              ElevatedButton(
                onPressed: () => Navigator.pop(c, true),
                child: const Text('Yes, Add'),
              ),
            ],
          ),
        );
        if (confirm == true) {
          if (!mounted) return;
          DialogHelper.showLoading(context, message: 'Adding member...');
          try {
            final dummyMember = Member(
              id: 0,
              name: _nameController.text.trim(),
              phone: _mobileController.text.trim(),
              whatsapp: _mobileController.text.trim(),
              address: _addressController.text.trim(),
              joiningDate: DateTime.now(),
              status: 'Active',
              photoPath: _photoPath,
            );
            await ref.read(memberListProvider.notifier).addMember(
                dummyMember, _selectedGroupIds,
                allowZeroSlots: true);
            if (!mounted) return;
            Navigator.pop(context); // Close loading
            Navigator.pop(context); // Close sheet
            HapticFeedback.mediumImpact();
            DialogHelper.showSnackBar(
              context,
              message: 'Member added with 0 slots!',
              type: SnackBarType.success,
            );
          } catch (e2) {
            if (!mounted) return;
            Navigator.pop(context);
            DialogHelper.showSnackBar(
              context,
              message: 'Failed to add member: $e2',
              type: SnackBarType.error,
            );
          }
        }
        return;
      }

      DialogHelper.showSnackBar(
        context,
        message: 'Failed to add member: $e',
        type: SnackBarType.error,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final stateAsync = ref.watch(memberListProvider);

    return Container(
      padding: EdgeInsets.only(
        top: 20,
        left: 20,
        right: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
      ),
      decoration: BoxDecoration(
        color: Theme.of(context).scaffoldBackgroundColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: PopScope(
        canPop: false,
        onPopInvokedWithResult: (didPop, result) async {
          if (didPop) return;
          final hasChanges = _nameController.text.isNotEmpty ||
              _mobileController.text.isNotEmpty ||
              _addressController.text.isNotEmpty ||
              _photoPath != null ||
              _selectedGroupIds.isNotEmpty;
          if (hasChanges) {
            final confirm = await showDialog<bool>(
              context: context,
              builder: (ctx) => AlertDialog(
                title: const TranslatedText('Discard Changes?'),
                content: const TranslatedText(
                    'You have unsaved changes. Are you sure you want to discard them?'),
                actions: [
                  TextButton(
                      onPressed: () => Navigator.pop(ctx, false),
                      child: const TranslatedText('Cancel')),
                  TextButton(
                    onPressed: () => Navigator.pop(ctx, true),
                    style: TextButton.styleFrom(foregroundColor: Colors.red),
                    child: const TranslatedText('Discard'),
                  ),
                ],
              ),
            );
            if (confirm == true && context.mounted) {
              Navigator.pop(context);
            }
          } else {
            Navigator.pop(context);
          }
        },
        child: SingleChildScrollView(
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const TranslatedText(
                  'Register New Member',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 20),
                GestureDetector(
                  onTap: _pickPhoto,
                  child: CircleAvatar(
                    radius: 40,
                    backgroundImage: _photoPath != null
                        ? FileImage(File(_photoPath!))
                        : null,
                    child: _photoPath == null
                        ? const Icon(Icons.add_a_photo, size: 30)
                        : null,
                  ),
                ),
                const SizedBox(height: 20),
                TextFormField(
                  controller: _nameController,
                  decoration: InputDecoration(
                    labelText: 'Name',
                    suffixIcon: IconButton(
                      tooltip: 'Pick from Contacts',
                      onPressed: _pickContact,
                      icon: const Icon(Icons.contacts_rounded,
                          color: AppTheme.primaryTeal),
                    ),
                  ),
                  validator: (v) {
                    if (v == null || v.trim().isEmpty)
                      return 'Enter member name';
                    return null;
                  },
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _mobileController,
                  decoration: const InputDecoration(labelText: 'Mobile'),
                  keyboardType: TextInputType.phone,
                  inputFormatters: [_phoneFormatter],
                  validator: (v) {
                    if (v == null || v.trim().isEmpty)
                      return 'Enter phone number';
                    if (v.trim().length < 10) return 'Invalid phone number';
                    return null;
                  },
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _addressController,
                  decoration: const InputDecoration(labelText: 'Address'),
                ),
                const SizedBox(height: 16),
                const TranslatedText('Assign to Groups:',
                    style: TextStyle(
                        fontWeight: FontWeight.bold, color: Colors.grey)),
                const SizedBox(height: 8),
                stateAsync.maybeWhen(
                  data: (state) => Wrap(
                    spacing: 8.0,
                    children: state.groups.map((g) {
                      final isSelected = _selectedGroupIds.contains(g.id);
                      return FilterChip(
                        label: Text(g.name),
                        selected: isSelected,
                        onSelected: (selected) {
                          setState(() {
                            if (selected) {
                              _selectedGroupIds.add(g.id);
                            } else {
                              _selectedGroupIds.remove(g.id);
                            }
                          });
                        },
                        selectedColor:
                            AppTheme.primaryTeal.withValues(alpha: 0.2),
                        checkmarkColor: AppTheme.primaryTeal,
                      );
                    }).toList(),
                  ),
                  orElse: () => const CircularProgressIndicator(),
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: _submit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryTeal,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16)),
                  ),
                  child: const TranslatedText('Register Member',
                      style:
                          TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _SingleContactPickerDialog extends StatefulWidget {
  final List<Contact> contacts;
  const _SingleContactPickerDialog({required this.contacts});

  @override
  State<_SingleContactPickerDialog> createState() =>
      _SingleContactPickerDialogState();
}

class _SingleContactPickerDialogState
    extends State<_SingleContactPickerDialog> {
  final TextEditingController _searchController = TextEditingController();
  List<Contact> _filteredContacts = [];

  @override
  void initState() {
    super.initState();
    _filteredContacts = widget.contacts;
    _searchController.addListener(() {
      final query = _searchController.text.toLowerCase();
      setState(() {
        _filteredContacts = widget.contacts.where((c) {
          final name = c.displayName?.toLowerCase() ?? '';
          final phone = c.phones.isNotEmpty ? c.phones.first.number : '';
          return name.contains(query) || phone.contains(query);
        }).toList();
      });
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: TranslatedText('Select Contact',
          style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
      content: SizedBox(
        width: MediaQuery.of(context).size.width * 0.8,
        height: MediaQuery.of(context).size.height * 0.5,
        child: Column(
          children: [
            TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search contacts...',
                prefixIcon: const Icon(Icons.search),
                border:
                    OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              ),
            ),
            const SizedBox(height: 12),
            Expanded(
              child: ListView.builder(
                itemCount: _filteredContacts.length,
                itemBuilder: (context, index) {
                  final contact = _filteredContacts[index];
                  final phone = contact.phones.isNotEmpty
                      ? contact.phones.first.number
                      : '';
                  return ListTile(
                    title: Text((contact.displayName ?? '').isNotEmpty
                        ? contact.displayName!
                        : 'Unknown'),
                    subtitle: Text(phone,
                        style:
                            const TextStyle(fontSize: 12, color: Colors.grey)),
                    onTap: () => Navigator.pop(context, contact),
                  );
                },
              ),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
            onPressed: () => Navigator.pop(context),
            child: const TranslatedText('Cancel')),
      ],
    );
  }
}
