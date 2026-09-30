import 'package:chit_fund_app/utils/theme.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_contacts/flutter_contacts.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../localization/app_localizations.dart';
import '../../widgets/index.dart';
import 'groups_list_view_model.dart';
import 'package:intl/intl.dart';
import 'package:chit_fund_app/widgets/translated_text.dart';

class AddGroupSheet extends ConsumerStatefulWidget {
  const AddGroupSheet({super.key});

  @override
  ConsumerState<AddGroupSheet> createState() => _AddGroupSheetState();
}

class _AddGroupSheetState extends ConsumerState<AddGroupSheet> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _installmentController = TextEditingController();
  final _membersController = TextEditingController();
  final _durationController = TextEditingController();
  DateTime _selectedDate = DateTime.now();
  int _paymentDueDate = 15;

  // Dynamic members list instead of a multiline text field
  final List<MemberDraft> _memberDrafts = [];

  double get _totalMonthCollection {
    final inst = double.tryParse(_installmentController.text.trim()) ?? 0;
    final members = int.tryParse(_membersController.text.trim()) ?? 0;
    return inst * members;
  }

  double get _chitValuePreview {
    final duration = int.tryParse(_membersController.text.trim()) ?? 0;
    return _totalMonthCollection * duration;
  }

  @override
  void initState() {
    super.initState();
    _installmentController.addListener(_updatePreview);
    _membersController.addListener(_updatePreview);
  }

  void _updatePreview() {
    setState(() {}); // trigger rebuild for chit value preview
  }

  @override
  void dispose() {
    _nameController.dispose();
    _installmentController.dispose();
    _membersController.dispose();
    _durationController.dispose();
    super.dispose();
  }

  Future<void> _pickContacts() async {
    if (await FlutterContacts.permissions.request(PermissionType.read) !=
        PermissionStatus.granted) {
      if (mounted) {
        DialogHelper.showSnackBar(
          context,
          message: 'Contacts permission is required to pick members.',
          type: SnackBarType.warning,
        );
      }
      return;
    }

    final contacts = await FlutterContacts.getAll(
        properties: ContactProperties.allProperties);
    if (!mounted || contacts.isEmpty) return;

    final selected = await showDialog<List<Contact>>(
      context: context,
      builder: (ctx) => _SearchableContactPickerDialog(contacts: contacts),
    );

    if (selected != null && selected.isNotEmpty) {
      setState(() {
        for (final c in selected) {
          final name = (c.displayName ?? '').trim();
          final phone = c.phones.isNotEmpty
              ? c.phones.first.number.replaceAll(RegExp(r'[^0-9+]'), '')
              : '';
          if (name.isNotEmpty) {
            _memberDrafts.add(MemberDraft(name: name, mobile: phone));
          }
        }
      });
    }
  }

  void _presentDatePicker() async {
    final pickedDate = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime(1900),
      lastDate: DateTime(2200),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: AppTheme.primaryTeal,
            ),
          ),
          child: child!,
        );
      },
    );
    if (pickedDate != null) {
      setState(() {
        _selectedDate = pickedDate;
      });
    }
  }

  void _addManualMember() {
    showDialog(
      context: context,
      builder: (ctx) {
        final nameCtrl = TextEditingController();
        final phoneCtrl = TextEditingController();
        final slotsCtrl = TextEditingController(text: '1');
        return AlertDialog(
          title: TranslatedText('Add Member',
              style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameCtrl,
                decoration: const InputDecoration(labelText: 'Name'),
                textCapitalization: TextCapitalization.words,
              ),
              const SizedBox(height: 8),
              TextField(
                controller: phoneCtrl,
                decoration: const InputDecoration(labelText: 'Phone'),
                keyboardType: TextInputType.phone,
              ),
              const SizedBox(height: 8),
              TextField(
                controller: slotsCtrl,
                decoration:
                    const InputDecoration(labelText: 'Slots / Installments'),
                keyboardType:
                    const TextInputType.numberWithOptions(decimal: true),
                inputFormatters: [
                  FilteringTextInputFormatter.allow(RegExp(r'^\d+\.?\d*'))
                ],
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const TranslatedText('Cancel'),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryTeal,
                  foregroundColor: Colors.white),
              onPressed: () {
                if (nameCtrl.text.trim().isNotEmpty) {
                  final newSlots =
                      double.tryParse(slotsCtrl.text.trim()) ?? 1.0;
                  final expectedCount =
                      int.tryParse(_membersController.text.trim()) ?? 0;
                  final currentSlots = _memberDrafts.fold<double>(
                      0, (sum, m) => sum + m.installmentsCount);
                  if (currentSlots + newSlots > expectedCount) {
                    DialogHelper.showSnackBar(
                      context,
                      message:
                          'Total slots cannot exceed $expectedCount. Current total is $currentSlots.',
                      type: SnackBarType.warning,
                    );
                    return;
                  }
                  setState(() {
                    _memberDrafts.add(MemberDraft(
                      name: nameCtrl.text.trim(),
                      mobile: phoneCtrl.text.trim(),
                      installmentsCount: newSlots,
                    ));
                  });
                  Navigator.pop(ctx);
                }
              },
              child: const TranslatedText('Add'),
            ),
          ],
        );
      },
    );
  }

  Future<void> _submitData() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    final expectedCount = int.tryParse(_membersController.text.trim()) ?? 0;
    final currentSlots =
        _memberDrafts.fold<double>(0, (sum, m) => sum + m.installmentsCount);
    if (currentSlots > expectedCount) {
      DialogHelper.showSnackBar(
        context,
        message:
            'The number of added slots ($currentSlots) cannot exceed the Total Slots count ($expectedCount).',
        type: SnackBarType.warning,
      );
      return;
    }

    if (currentSlots < expectedCount) {
      final confirm = await DialogHelper.showConfirmation(
        context,
        title: 'Create Group?',
        message:
            'You added $currentSlots slots out of $expectedCount total slots. The remaining ${expectedCount - currentSlots} slots will be assigned to placeholders. Do you want to proceed?',
        confirmText: 'Yes, Create',
        cancelText: 'Cancel',
      );
      if (!confirm) return;
    }

    if (!mounted) return;
    DialogHelper.showLoading(context, message: 'Creating group...');

    try {
      await ref.read(groupsListProvider.notifier).createGroup(
            name: _nameController.text.trim(),
            installment: double.parse(_installmentController.text.trim()),
            totalMembers: int.parse(_membersController.text.trim()),
            duration: int.parse(_membersController.text.trim()),
            startDate: _selectedDate,
            members: _memberDrafts,
            paymentDueDate: _paymentDueDate,
          );

      if (!mounted) return;
      Navigator.pop(context); // Close loading
      Navigator.pop(context); // Close sheet

      HapticFeedback.mediumImpact();
      DialogHelper.showSnackBar(
        context,
        message: '✓ Group "${_nameController.text}" created successfully!',
        type: SnackBarType.success,
      );
    } catch (e) {
      if (!mounted) return;
      Navigator.pop(context); // Close loading
      DialogHelper.showSnackBar(
        context,
        message: 'Failed to create group: ${e.toString()}',
        type: SnackBarType.error,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final localizations = AppLocalizations.of(context);

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
      child: SingleChildScrollView(
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TranslatedText(
                localizations.translate('add_group'),
                style: GoogleFonts.outfit(
                    fontSize: 20, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 20),

              if (_totalMonthCollection > 0)
                Container(
                  padding: const EdgeInsets.all(12),
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: AppTheme.primaryTeal.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                        color: AppTheme.primaryTeal.withValues(alpha: 0.3)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.calculate,
                          color: AppTheme.primaryTeal, size: 32),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            TranslatedText('Total Month Collection',
                                style: GoogleFonts.outfit(
                                    fontSize: 12, color: Colors.grey[700])),
                            TranslatedText(
                                '₹${_totalMonthCollection.toStringAsFixed(0)}',
                                style: GoogleFonts.outfit(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    color: AppTheme.primaryTeal)),
                            const SizedBox(height: 4),
                            TranslatedText('Chit Value',
                                style: GoogleFonts.outfit(
                                    fontSize: 12, color: Colors.grey[700])),
                            TranslatedText(
                                '₹${_chitValuePreview.toStringAsFixed(0)}',
                                style: GoogleFonts.outfit(
                                    fontSize: 14,
                                    fontWeight: FontWeight.bold,
                                    color: AppTheme.primaryTeal)),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

              TextFormField(
                controller: _nameController,
                decoration: InputDecoration(
                    labelText: localizations.translate('group_name')),
                textInputAction: TextInputAction.next,
                validator: (value) => value == null || value.trim().isEmpty
                    ? 'Enter group name'
                    : null,
              ),
              const SizedBox(height: 12),

              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _installmentController,
                      decoration: InputDecoration(
                        labelText:
                            '${localizations.translate('installment_amt')} (₹)',
                        prefixText: '₹',
                      ),
                      keyboardType:
                          const TextInputType.numberWithOptions(decimal: true),
                      inputFormatters: [
                        FilteringTextInputFormatter.allow(
                            RegExp(r'^\d+\.?\d{0,2}'))
                      ],
                      textInputAction: TextInputAction.next,
                      validator: (value) =>
                          (double.tryParse(value ?? '') ?? 0) <= 0
                              ? 'Invalid amount'
                              : null,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextFormField(
                      controller: _membersController,
                      decoration: const InputDecoration(
                          labelText: 'Total Slots / Installments'),
                      keyboardType: TextInputType.number,
                      inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                      textInputAction: TextInputAction.next,
                      validator: (value) =>
                          (int.tryParse(value ?? '') ?? 0) <= 0
                              ? 'Invalid count'
                              : null,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              Row(
                children: [
                  Expanded(
                    child: Container(),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: InkWell(
                      onTap: _presentDatePicker,
                      child: InputDecorator(
                        decoration: InputDecoration(
                          labelText: localizations.translate('start_date'),
                          suffixIcon: const Icon(Icons.calendar_month,
                              color: AppTheme.primaryTeal),
                        ),
                        child: TranslatedText(
                          DateFormat.yMMMd().format(_selectedDate),
                          style: GoogleFonts.outfit(fontSize: 15),
                        ),
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 12),
              // Payment Due Date picker
              Row(
                children: [
                  const Icon(Icons.event_available,
                      color: AppTheme.primaryTeal, size: 20),
                  const SizedBox(width: 8),
                  Expanded(
                    child: DropdownButtonFormField<int>(
                      initialValue: _paymentDueDate,
                      decoration: const InputDecoration(
                        labelText: 'Payment Due Day of Month',
                        isDense: true,
                      ),
                      items: List.generate(31, (i) => i + 1).map((d) {
                        return DropdownMenuItem(
                            value: d,
                            child: TranslatedText(
                                'Day $d${d == 15 ? ' (default)' : ''}'));
                      }).toList(),
                      onChanged: (v) =>
                          setState(() => _paymentDueDate = v ?? 15),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  TranslatedText('Members (${_memberDrafts.length})',
                      style: GoogleFonts.outfit(
                          fontWeight: FontWeight.bold, fontSize: 16)),
                  Row(
                    children: [
                      IconButton(
                        tooltip: 'Add Manually',
                        onPressed: _addManualMember,
                        icon: const Icon(Icons.person_add_alt_1,
                            color: AppTheme.primaryTeal),
                      ),
                      IconButton(
                        tooltip: 'Import Contacts',
                        onPressed: _pickContacts,
                        icon: const Icon(Icons.contacts,
                            color: AppTheme.primaryTeal),
                      ),
                    ],
                  ),
                ],
              ),

              if (_memberDrafts.isEmpty)
                Container(
                  padding: const EdgeInsets.all(20),
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: Colors.grey.withValues(alpha: 0.05),
                    borderRadius: BorderRadius.circular(12),
                    border:
                        Border.all(color: Colors.grey.withValues(alpha: 0.2)),
                  ),
                  child: TranslatedText(
                    'No members added yet.\nTap the icons above to add members.',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.outfit(color: Colors.grey),
                  ),
                )
              else
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: _memberDrafts.length,
                  itemBuilder: (context, index) {
                    final md = _memberDrafts[index];
                    return Material(
                      type: MaterialType.transparency,
                      child: ListTile(
                        dense: true,
                        contentPadding: EdgeInsets.zero,
                        leading: CircleAvatar(
                          radius: 16,
                          backgroundColor:
                              AppTheme.primaryTeal.withValues(alpha: 0.1),
                          child: Text(
                              md.name.isNotEmpty
                                  ? md.name[0].toUpperCase()
                                  : '?',
                              style: const TextStyle(
                                  color: AppTheme.primaryTeal, fontSize: 12)),
                        ),
                        title: Text(md.name,
                            style: GoogleFonts.outfit(
                                fontWeight: FontWeight.w600)),
                        subtitle: Row(
                          children: [
                            TranslatedText(
                                md.mobile.isEmpty ? 'No phone' : md.mobile,
                                style: GoogleFonts.outfit(fontSize: 12)),
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color:
                                    AppTheme.primaryTeal.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                '${md.installmentsCount == md.installmentsCount.toInt() ? md.installmentsCount.toInt() : md.installmentsCount} Slots',
                                style: const TextStyle(
                                    fontSize: 10,
                                    color: AppTheme.primaryTeal,
                                    fontWeight: FontWeight.bold),
                              ),
                            ),
                          ],
                        ),
                        onTap: () {
                          // Allow editing the drafted member
                          showDialog(
                            context: context,
                            builder: (ctx) {
                              final nameCtrl =
                                  TextEditingController(text: md.name);
                              final phoneCtrl =
                                  TextEditingController(text: md.mobile);
                              final slotsCtrl = TextEditingController(
                                  text: md.installmentsCount ==
                                          md.installmentsCount.toInt()
                                      ? md.installmentsCount.toInt().toString()
                                      : md.installmentsCount.toString());
                              return AlertDialog(
                                title: TranslatedText('Edit Member',
                                    style: GoogleFonts.outfit(
                                        fontWeight: FontWeight.bold)),
                                content: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    TextField(
                                      controller: nameCtrl,
                                      decoration: const InputDecoration(
                                          labelText: 'Name'),
                                      textCapitalization:
                                          TextCapitalization.words,
                                    ),
                                    const SizedBox(height: 8),
                                    TextField(
                                      controller: phoneCtrl,
                                      decoration: const InputDecoration(
                                          labelText: 'Phone'),
                                      keyboardType: TextInputType.phone,
                                    ),
                                    const SizedBox(height: 8),
                                    TextField(
                                      controller: slotsCtrl,
                                      decoration: const InputDecoration(
                                          labelText: 'Slots / Installments'),
                                      keyboardType:
                                          const TextInputType.numberWithOptions(
                                              decimal: true),
                                      inputFormatters: [
                                        FilteringTextInputFormatter.allow(
                                            RegExp(r'^\d+\.?\d*'))
                                      ],
                                    ),
                                  ],
                                ),
                                actions: [
                                  TextButton(
                                    onPressed: () => Navigator.pop(ctx),
                                    child: const TranslatedText('Cancel'),
                                  ),
                                  ElevatedButton(
                                    style: ElevatedButton.styleFrom(
                                        backgroundColor: AppTheme.primaryTeal,
                                        foregroundColor: Colors.white),
                                    onPressed: () {
                                      if (nameCtrl.text.trim().isNotEmpty) {
                                        final newSlots = double.tryParse(
                                                slotsCtrl.text.trim()) ??
                                            1.0;
                                        final expectedCount = int.tryParse(
                                                _membersController.text
                                                    .trim()) ??
                                            0;
                                        final currentSlotsExcludingThis =
                                            _memberDrafts
                                                .asMap()
                                                .entries
                                                .where((e) => e.key != index)
                                                .fold<double>(
                                                    0,
                                                    (sum, e) =>
                                                        sum +
                                                        e.value
                                                            .installmentsCount);
                                        if (currentSlotsExcludingThis +
                                                newSlots >
                                            expectedCount) {
                                          DialogHelper.showSnackBar(
                                            context,
                                            message:
                                                'Total slots cannot exceed $expectedCount. Current total is ${currentSlotsExcludingThis + md.installmentsCount}.',
                                            type: SnackBarType.warning,
                                          );
                                          return;
                                        }
                                        setState(() {
                                          _memberDrafts[index] = MemberDraft(
                                            name: nameCtrl.text.trim(),
                                            mobile: phoneCtrl.text.trim(),
                                            installmentsCount: newSlots,
                                          );
                                        });
                                        Navigator.pop(ctx);
                                      }
                                    },
                                    child: const TranslatedText('Save'),
                                  ),
                                ],
                              );
                            },
                          );
                        },
                        trailing: IconButton(
                          icon: const Icon(Icons.remove_circle_outline,
                              color: Colors.redAccent, size: 20),
                          onPressed: () {
                            setState(() {
                              _memberDrafts.removeAt(index);
                            });
                          },
                        ),
                      ),
                    );
                  },
                ),

              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _submitData,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryTeal,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16)),
                ),
                child: TranslatedText(
                    localizations.translate('create_group_btn'),
                    style: GoogleFonts.outfit(
                        fontSize: 16, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SearchableContactPickerDialog extends StatefulWidget {
  final List<Contact> contacts;
  const _SearchableContactPickerDialog({required this.contacts});

  @override
  State<_SearchableContactPickerDialog> createState() =>
      _SearchableContactPickerDialogState();
}

class _SearchableContactPickerDialogState
    extends State<_SearchableContactPickerDialog> {
  final Set<Contact> _selected = {};
  late List<Contact> _filteredContacts;
  final _searchController = TextEditingController();

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
      title: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          TranslatedText('Select Contacts',
              style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          TextField(
            controller: _searchController,
            decoration: InputDecoration(
              hintText: 'Search by name or number...',
              prefixIcon: const Icon(Icons.search),
              contentPadding:
                  const EdgeInsets.symmetric(vertical: 0, horizontal: 16),
              border:
                  OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
            ),
          ),
        ],
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 0, vertical: 8),
      content: SizedBox(
        width: MediaQuery.of(context).size.width * 0.9,
        height: MediaQuery.of(context).size.height * 0.6,
        child: ListView.builder(
          itemCount: _filteredContacts.length,
          itemBuilder: (context, index) {
            final contact = _filteredContacts[index];
            final phone =
                contact.phones.isNotEmpty ? contact.phones.first.number : '';
            final isSelected = _selected.contains(contact);
            return CheckboxListTile(
              value: isSelected,
              title: Text((contact.displayName ?? '').isNotEmpty
                  ? contact.displayName!
                  : 'Unknown'),
              subtitle: Text(phone,
                  style: const TextStyle(fontSize: 12, color: Colors.grey)),
              activeColor: AppTheme.primaryTeal,
              onChanged: (val) {
                setState(() {
                  if (val == true) {
                    _selected.add(contact);
                  } else {
                    _selected.remove(contact);
                  }
                });
              },
            );
          },
        ),
      ),
      actions: [
        TextButton(
            onPressed: () => Navigator.pop(context),
            child: const TranslatedText('Cancel')),
        ElevatedButton(
          onPressed: () => Navigator.pop(context, _selected.toList()),
          style: ElevatedButton.styleFrom(
            backgroundColor: AppTheme.primaryTeal,
            foregroundColor: Colors.white,
          ),
          child: TranslatedText('Add ${_selected.length}',
              style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
        ),
      ],
    );
  }
}
