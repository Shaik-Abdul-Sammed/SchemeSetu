import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:drift/drift.dart' as drift;
import 'package:chit_fund_app/utils/theme.dart';
import 'package:chit_fund_app/data/local/app_database.dart';
import 'package:chit_fund_app/providers/shg_providers.dart';

class AddShgSavingsSheet extends ConsumerStatefulWidget {
  final int? initialGroupId;

  const AddShgSavingsSheet({super.key, this.initialGroupId});

  static Future<void> show(BuildContext context, {int? groupId}) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => AddShgSavingsSheet(initialGroupId: groupId),
    );
  }

  @override
  ConsumerState<AddShgSavingsSheet> createState() => _AddShgSavingsSheetState();
}

class _AddShgSavingsSheetState extends ConsumerState<AddShgSavingsSheet> {
  final _formKey = GlobalKey<FormState>();
  int? _selectedGroupId;
  int? _selectedMembershipId;
  String _selectedMemberName = '';
  final _amountController = TextEditingController();
  final _noteController = TextEditingController();
  DateTime _selectedDate = DateTime.now();
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _selectedGroupId = widget.initialGroupId;
  }

  @override
  void dispose() {
    _amountController.dispose();
    _noteController.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime(2020),
      lastDate: DateTime.now().add(const Duration(days: 30)),
    );
    if (picked != null) {
      setState(() => _selectedDate = picked);
    }
  }

  Future<void> _submitSavings() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedGroupId == null || _selectedMembershipId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please select both a group and a member.'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    setState(() => _isSaving = true);

    try {
      final amount = double.tryParse(_amountController.text.trim()) ?? 0.0;
      final dao = ref.read(shgDaoProvider);

      // 1. Insert Saving Record
      await dao.insertSaving(
        SHGSavingsCompanion(
          membershipId: drift.Value(_selectedMembershipId!),
          amount: drift.Value(amount),
          date: drift.Value(_selectedDate),
        ),
      );

      // 2. Insert Double-Entry in Group CashBook (Income)
      final note = _noteController.text.trim();
      final desc = note.isNotEmpty
          ? 'Savings deposit - $_selectedMemberName ($note)'
          : 'Savings deposit - $_selectedMemberName';

      await dao.insertCashBookEntry(
        SHGCashBooksCompanion(
          groupId: drift.Value(_selectedGroupId!),
          date: drift.Value(_selectedDate),
          transactionType: const drift.Value('Income'),
          category: const drift.Value('Savings'),
          amount: drift.Value(amount),
          description: drift.Value(desc),
        ),
      );

      // 3. Refresh Providers
      ref.invalidate(shgSavingsProvider(_selectedMembershipId!));
      ref.invalidate(shgCashBookProvider(_selectedGroupId!));
      ref.invalidate(shgGroupsProvider);

      if (!mounted) return;
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
              '₹${amount.toStringAsFixed(0)} savings deposited for $_selectedMemberName!'),
          backgroundColor: Colors.green,
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to deposit savings: $e'),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final groupsAsync = ref.watch(shgGroupsProvider);
    final dateFormat = DateFormat('dd MMM yyyy');

    return Container(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      decoration: BoxDecoration(
        color: Theme.of(context).scaffoldBackgroundColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: Colors.grey.withValues(alpha: 0.3),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: Colors.green.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.payments_rounded,
                          color: Colors.green, size: 24),
                    ),
                    const SizedBox(width: 12),
                    Text(
                      'Record Member Savings',
                      style: GoogleFonts.outfit(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                Text(
                  'SHG Group',
                  style: GoogleFonts.outfit(
                      fontSize: 14, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 8),
                groupsAsync.when(
                  data: (groups) {
                    if (groups.isEmpty) {
                      return const Text(
                          'No groups available. Please create a group first.');
                    }

                    if (_selectedGroupId == null && groups.isNotEmpty) {
                      _selectedGroupId = groups.first.id;
                      if (_amountController.text.isEmpty) {
                        _amountController.text =
                            groups.first.monthlySavingAmount.toStringAsFixed(0);
                      }
                    }

                    return DropdownButtonFormField<int>(
                      initialValue: _selectedGroupId,
                      decoration: InputDecoration(
                        prefixIcon: const Icon(Icons.group_work_rounded),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      items: groups
                          .map((g) => DropdownMenuItem(
                                value: g.id,
                                child: Text(g.name),
                              ))
                          .toList(),
                      onChanged: (val) {
                        setState(() {
                          _selectedGroupId = val;
                          _selectedMembershipId = null;
                          final g = groups.firstWhere((x) => x.id == val);
                          _amountController.text =
                              g.monthlySavingAmount.toStringAsFixed(0);
                        });
                      },
                    );
                  },
                  loading: () =>
                      const Center(child: CircularProgressIndicator()),
                  error: (e, _) => Text('Error: $e',
                      style: const TextStyle(color: Colors.red)),
                ),
                if (_selectedGroupId != null) ...[
                  const SizedBox(height: 16),
                  Text(
                    'Select Member',
                    style: GoogleFonts.outfit(
                        fontSize: 14, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 8),
                  Consumer(
                    builder: (context, ref, _) {
                      final membersAsync =
                          ref.watch(shgMembersProvider(_selectedGroupId!));
                      return membersAsync.when(
                        data: (members) {
                          if (members.isEmpty) {
                            return const Text('No members in this group.');
                          }

                          if (_selectedMembershipId == null &&
                              members.isNotEmpty) {
                            _selectedMembershipId = members.first.id;
                            _selectedMemberName = members.first.name;
                          }

                          return DropdownButtonFormField<int>(
                            initialValue: _selectedMembershipId,
                            decoration: InputDecoration(
                              prefixIcon: const Icon(Icons.person_outline_rounded),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            items: members
                                .map((m) => DropdownMenuItem(
                                      value: m.id,
                                      child: Text('${m.name} (${m.role})'),
                                    ))
                                .toList(),
                            onChanged: (val) {
                              setState(() {
                                _selectedMembershipId = val;
                                final m =
                                    members.firstWhere((x) => x.id == val);
                                _selectedMemberName = m.name;
                              });
                            },
                          );
                        },
                        loading: () => const Center(
                            child: CircularProgressIndicator()),
                        error: (e, _) => Text('Error: $e',
                            style: const TextStyle(color: Colors.red)),
                      );
                    },
                  ),
                ],
                const SizedBox(height: 16),
                Text(
                  'Savings Amount (₹)',
                  style: GoogleFonts.outfit(
                      fontSize: 14, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _amountController,
                  keyboardType: TextInputType.number,
                  decoration: InputDecoration(
                    prefixIcon: const Icon(Icons.currency_rupee_rounded),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  validator: (val) {
                    if (val == null || val.trim().isEmpty) {
                      return 'Please enter savings amount';
                    }
                    final num = double.tryParse(val.trim());
                    if (num == null || num <= 0) {
                      return 'Please enter a valid amount greater than 0';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                Text(
                  'Deposit Date',
                  style: GoogleFonts.outfit(
                      fontSize: 14, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 8),
                InkWell(
                  onTap: _pickDate,
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      border: Border.all(
                          color: Colors.grey.withValues(alpha: 0.3)),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.calendar_today_rounded,
                            size: 18, color: AppTheme.primaryTeal),
                        const SizedBox(width: 12),
                        Text(
                          dateFormat.format(_selectedDate),
                          style: GoogleFonts.outfit(
                              fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                        const Spacer(),
                        Text(
                          'Change',
                          style: GoogleFonts.outfit(
                            fontSize: 13,
                            color: AppTheme.primaryTeal,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  'Note / Remarks (Optional)',
                  style: GoogleFonts.outfit(
                      fontSize: 14, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _noteController,
                  decoration: InputDecoration(
                    hintText: 'e.g., Monthly contribution for October',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    onPressed: _isSaving ? null : _submitSavings,
                    child: _isSaving
                        ? const SizedBox(
                            width: 24,
                            height: 24,
                            child: CircularProgressIndicator(
                                color: Colors.white, strokeWidth: 2),
                          )
                        : Text(
                            'Deposit Savings',
                            style: GoogleFonts.outfit(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                  ),
                ),
                const SizedBox(height: 12),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
