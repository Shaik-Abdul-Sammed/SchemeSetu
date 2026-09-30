import 'package:chit_fund_app/utils/theme.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../localization/app_localizations.dart';
import 'groups_list_view_model.dart';
import 'package:intl/intl.dart';
import 'package:chit_fund_app/widgets/translated_text.dart';

class EditGroupSheet extends ConsumerStatefulWidget {
  final int groupId;
  final String initialName;
  final double initialInstallment;
  final int initialTotalMembers;
  final int initialDuration;
  final DateTime initialStartDate;
  final int initialPaymentDueDate;

  const EditGroupSheet({
    super.key,
    required this.groupId,
    required this.initialName,
    required this.initialInstallment,
    required this.initialTotalMembers,
    required this.initialDuration,
    required this.initialStartDate,
    this.initialPaymentDueDate = 15,
  });

  @override
  ConsumerState<EditGroupSheet> createState() => _EditGroupSheetState();
}

class _EditGroupSheetState extends ConsumerState<EditGroupSheet> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _installmentController;
  late TextEditingController _membersController;
  late TextEditingController _durationController;
  late DateTime _selectedDate;
  int _paymentDueDate = 15;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.initialName);
    _installmentController = TextEditingController(
        text: widget.initialInstallment.toStringAsFixed(0));
    _membersController =
        TextEditingController(text: widget.initialTotalMembers.toString());
    _durationController =
        TextEditingController(text: widget.initialDuration.toString());
    _selectedDate = widget.initialStartDate;
    _paymentDueDate = widget.initialPaymentDueDate;

    _membersController.addListener(() {
      if (_membersController.text != _durationController.text) {
        _durationController.text = _membersController.text;
      }
    });
    _durationController.addListener(() {
      if (_durationController.text != _membersController.text) {
        _membersController.text = _durationController.text;
      }
      _updatePreview();
    });
    _installmentController.addListener(_updatePreview);
  }

  void _updatePreview() {
    setState(() {}); // trigger rebuild for chit value preview
  }

  double get _totalMonthCollection {
    final inst = double.tryParse(_installmentController.text.trim()) ?? 0;
    final members = int.tryParse(_membersController.text.trim()) ?? 0;
    return inst * members;
  }

  double get _chitValuePreview {
    final duration = int.tryParse(_durationController.text.trim()) ?? 0;
    return _totalMonthCollection * duration;
  }

  @override
  void dispose() {
    _nameController.dispose();
    _installmentController.dispose();
    _membersController.dispose();
    _durationController.dispose();
    super.dispose();
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
                localizations.translate('edit'),
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
                    child: TextFormField(
                      controller: _durationController,
                      decoration: InputDecoration(
                          labelText:
                              localizations.translate('duration_months')),
                      keyboardType: TextInputType.number,
                      inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                      textInputAction: TextInputAction.done,
                      validator: (value) =>
                          (int.tryParse(value ?? '') ?? 0) <= 0
                              ? 'Invalid duration'
                              : null,
                    ),
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
              ElevatedButton(
                onPressed: () async {
                  if (!_formKey.currentState!.validate()) return;
                  await ref.read(groupsListProvider.notifier).editGroup(
                        widget.groupId,
                        name: _nameController.text.trim(),
                        installment:
                            double.parse(_installmentController.text.trim()),
                        totalMembers: int.parse(_membersController.text.trim()),
                        duration: int.parse(_durationController.text.trim()),
                        startDate: _selectedDate,
                        paymentDueDate: _paymentDueDate,
                      );
                  if (!context.mounted) return;
                  Navigator.pop(context);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryTeal,
                  foregroundColor: Colors.white,
                  padding:
                      const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16)),
                ),
                child: TranslatedText(localizations.translate('save_btn'),
                    style: GoogleFonts.outfit(
                        fontSize: 16, fontWeight: FontWeight.bold)),
              )
            ],
          ),
        ),
      ),
    );
  }
}
