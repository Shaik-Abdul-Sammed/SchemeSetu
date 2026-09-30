import 'package:chit_fund_app/utils/theme.dart';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:collection/collection.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:image_picker/image_picker.dart';
import 'package:flutter/services.dart';

import '../../services/communication_service.dart';
import '../../providers/settings_provider.dart';

import '../../widgets/dialog_helper.dart';
import '../../data/providers/db_provider.dart';
import '../../widgets/glass_card.dart';
import '../../widgets/month_year_picker.dart';
import '../../widgets/language_selection_dialog.dart';
import 'payment_view_model.dart';
import '../member/advanced_member_profile_screen.dart';
import '../group/group_screen.dart';
import '../../widgets/translated_text.dart';
import '../../widgets/skeleton_loader.dart';
import '../../widgets/scroll_arrows_overlay.dart';

class PaymentScreen extends ConsumerStatefulWidget {
  final bool isNested;
  const PaymentScreen({super.key, this.isNested = false});

  @override
  ConsumerState<PaymentScreen> createState() => _PaymentScreenState();
}

class _PendingPaymentFormSheet extends ConsumerStatefulWidget {
  final MemberPaymentInfo info;
  final String groupName;
  final Function(double amount, String mode, String? remarks, DateTime date,
      String? receiptPath, String? collectorName) onRecord;
  final Function(int id) onDeletePayment;

  const _PendingPaymentFormSheet({
    required this.info,
    required this.groupName,
    required this.onRecord,
    required this.onDeletePayment,
  });

  @override
  ConsumerState<_PendingPaymentFormSheet> createState() =>
      _PendingPaymentFormSheetState();
}

class _PendingPaymentFormSheetState
    extends ConsumerState<_PendingPaymentFormSheet> {
  final _formKey = GlobalKey<FormState>();
  late double _amountToPay;
  String _paymentMode = 'Cash';
  String _remarks = '';
  DateTime _paymentDate = DateTime.now();

  final ImagePicker _picker = ImagePicker();
  String? _receiptPhotoPath;
  final _collectorNameCtrl = TextEditingController();

  bool _isSplitMode = false;
  String _mode2 = 'UPI';
  final _amount1Ctrl = TextEditingController();
  final _amount2Ctrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    final remaining = widget.info.expectedAmount - widget.info.collectedAmount;
    _amountToPay = remaining > 0 ? remaining : 0.0;
    _amount1Ctrl.text = _amountToPay.toStringAsFixed(0);
    _amount2Ctrl.text = '0';
    _amount1Ctrl.addListener(_updateSplitAmounts);
  }

  void _updateSplitAmounts() {
    if (!_isSplitMode) return;
    final a1 = double.tryParse(_amount1Ctrl.text) ?? 0.0;
    final total = widget.info.expectedAmount - widget.info.collectedAmount;
    final a2 = total - a1;
    if (a2 >= 0) {
      if (_amount2Ctrl.text != a2.toStringAsFixed(0)) {
        _amount2Ctrl.text = a2.toStringAsFixed(0);
      }
    }
  }

  @override
  void dispose() {
    _amount1Ctrl.removeListener(_updateSplitAmounts);
    _amount1Ctrl.dispose();
    _amount2Ctrl.dispose();
    _collectorNameCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickReceiptPhoto() async {
    try {
      final XFile? image = await _picker.pickImage(source: ImageSource.gallery);
      if (image != null) {
        setState(() {
          _receiptPhotoPath = image.path;
        });
      }
    } catch (e) {
      debugPrint('Error picking receipt photo: $e');
    }
  }

  void _showUpiQrCodeDialog(String upiId, String name, double amount) {
    final upiString =
        'upi://pay?pa=$upiId&pn=${Uri.encodeComponent(name)}&am=$amount&cu=INR';
    final qrUrl =
        'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${Uri.encodeComponent(upiString)}';

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: TranslatedText('Scan & Pay via UPI',
            style: GoogleFonts.outfit(fontWeight: FontWeight.bold),
            textAlign: TextAlign.center),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TranslatedText('Amount: ₹${amount.toStringAsFixed(0)}',
                style: GoogleFonts.outfit(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.primaryTeal)),
            const SizedBox(height: 12),
            ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: Image.network(
                qrUrl,
                width: 200,
                height: 200,
                loadingBuilder: (context, child, loadingProgress) {
                  if (loadingProgress == null) return child;
                  return const SizedBox(
                    width: 200,
                    height: 200,
                    child: Center(
                        child: CircularProgressIndicator(
                            color: AppTheme.primaryTeal)),
                  );
                },
                errorBuilder: (context, error, stackTrace) => Container(
                  width: 200,
                  height: 200,
                  color: Colors.grey.withValues(alpha: 0.1),
                  child: const Center(
                      child: Icon(Icons.error_outline_rounded,
                          color: Colors.red, size: 40)),
                ),
              ),
            ),
            const SizedBox(height: 12),
            TranslatedText('UPI ID: $upiId',
                style: GoogleFonts.outfit(fontSize: 12, color: Colors.grey),
                textAlign: TextAlign.center),
            TranslatedText('Payee: [#1]',
                style: GoogleFonts.outfit(fontSize: 12, color: Colors.grey),
                replacements: {'[#1]': name},
                textAlign: TextAlign.center),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: TranslatedText('Close',
                style: GoogleFonts.outfit(
                    fontWeight: FontWeight.bold, color: AppTheme.primaryTeal)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final remaining = widget.info.expectedAmount - widget.info.collectedAmount;
    final settings = ref.watch(settingsProvider);

    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
        left: 20,
        right: 20,
        top: 20,
      ),
      child: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  TranslatedText(
                    'Record Payment',
                    style: GoogleFonts.outfit(
                        fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              TranslatedText(
                'Member: ${widget.info.member.name}',
                style: GoogleFonts.outfit(
                    fontWeight: FontWeight.w600, color: AppTheme.primaryTeal),
              ),
              TranslatedText(
                'Monthly Contribution: ${settings.currencySymbol}${widget.info.expectedAmount.toStringAsFixed(0)} (Paid: ${settings.currencySymbol}${widget.info.collectedAmount.toStringAsFixed(0)})',
                style: GoogleFonts.outfit(fontSize: 12, color: Colors.grey),
              ),
              const SizedBox(height: 16),

              // Existing Payments List
              if (widget.info.allPayments.isNotEmpty) ...[
                TranslatedText(
                  'Recorded Installments',
                  style: GoogleFonts.outfit(
                      fontSize: 13, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 6),
                Container(
                  decoration: BoxDecoration(
                    color: Colors.grey.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: widget.info.allPayments.length,
                    separatorBuilder: (_, __) => const Divider(height: 1),
                    itemBuilder: (context, idx) {
                      final p = widget.info.allPayments[idx];
                      return ListTile(
                        dense: true,
                        title: TranslatedText(
                          '${settings.currencySymbol}${p.amount.toStringAsFixed(0)} via ${p.paymentMode}',
                          style:
                              GoogleFonts.outfit(fontWeight: FontWeight.bold),
                        ),
                        subtitle: TranslatedText(
                          'Date: ${p.paymentDate.day}/${p.paymentDate.month}/${p.paymentDate.year} ${p.remarks != null ? "• ${p.remarks!}" : ""} ${p.collectorName != null && p.collectorName!.isNotEmpty ? "• By: ${p.collectorName!}" : ""}',
                          style: GoogleFonts.outfit(fontSize: 11),
                        ),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            if (p.receiptPhotoPath != null &&
                                p.receiptPhotoPath!.isNotEmpty)
                              IconButton(
                                icon: const Icon(Icons.receipt_long_rounded,
                                    color: Colors.blue, size: 20),
                                onPressed: () {
                                  showDialog(
                                    context: context,
                                    builder: (context) => AlertDialog(
                                      shape: RoundedRectangleBorder(
                                          borderRadius:
                                              BorderRadius.circular(20)),
                                      title: TranslatedText('Receipt Image',
                                          style: GoogleFonts.outfit(
                                              fontWeight: FontWeight.bold)),
                                      content: ClipRRect(
                                        borderRadius: BorderRadius.circular(12),
                                        child: Image.file(
                                          File(p.receiptPhotoPath!),
                                          errorBuilder:
                                              (context, error, stackTrace) =>
                                                  const SizedBox(
                                            height: 100,
                                            child: Center(
                                                child: TranslatedText(
                                                    'Receipt file not found or inaccessible')),
                                          ),
                                        ),
                                      ),
                                      actions: [
                                        TextButton(
                                          onPressed: () =>
                                              Navigator.pop(context),
                                          child: TranslatedText('Close',
                                              style: GoogleFonts.outfit(
                                                  fontWeight: FontWeight.bold)),
                                        ),
                                      ],
                                    ),
                                  );
                                },
                              ),
                            IconButton(
                              icon: const Icon(Icons.delete_outline_rounded,
                                  color: Colors.red, size: 20),
                              onPressed: () {
                                widget.onDeletePayment(p.id);
                                Navigator.pop(context);
                              },
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
                const SizedBox(height: 16),
              ],

              if (remaining > 0) ...[
                // Split Payment Toggle
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    TranslatedText('Split Payment (2 Modes)',
                        style: GoogleFonts.outfit(
                            fontWeight: FontWeight.w600, fontSize: 13)),
                    Switch(
                      value: _isSplitMode,
                      activeThumbColor: AppTheme.primaryTeal,
                      onChanged: (v) => setState(() {
                        _isSplitMode = v;
                        if (!v) {
                          _amountToPay = remaining;
                        }
                      }),
                    ),
                  ],
                ),
                const SizedBox(height: 8),

                if (!_isSplitMode) ...[
                  // Single Mode
                  TextFormField(
                    initialValue: _amountToPay.toStringAsFixed(0),
                    keyboardType:
                        const TextInputType.numberWithOptions(decimal: true),
                    inputFormatters: [
                      FilteringTextInputFormatter.allow(
                          RegExp(r'^\d+\.?\d{0,2}'))
                    ],
                    decoration: InputDecoration(
                      labelText: 'Amount (${settings.currencySymbol})',
                      labelStyle: GoogleFonts.outfit(),
                      hintText: 'Enter payment amount',
                    ),
                    validator: (v) {
                      if (v == null ||
                          double.tryParse(v) == null ||
                          double.parse(v) <= 0) {
                        return 'Enter a valid amount';
                      }
                      return null;
                    },
                    onSaved: (val) {
                      if (val != null) _amountToPay = double.parse(val);
                    },
                  ),
                  const SizedBox(height: 14),
                  DropdownButtonFormField<String>(
                    initialValue: _paymentMode,
                    decoration: InputDecoration(
                      labelText: 'Payment Mode',
                      labelStyle: GoogleFonts.outfit(),
                    ),
                    items: ['Cash', 'UPI', 'Bank Transfer']
                        .map((m) => DropdownMenuItem(
                            value: m,
                            child:
                                TranslatedText(m, style: GoogleFonts.outfit())))
                        .toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => _paymentMode = val);
                    },
                  ),
                ] else ...[
                  // Split Mode
                  Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: _amount1Ctrl,
                          keyboardType: const TextInputType.numberWithOptions(
                              decimal: true),
                          inputFormatters: [
                            FilteringTextInputFormatter.allow(
                                RegExp(r'^\d+\.?\d{0,2}'))
                          ],
                          decoration: InputDecoration(
                              labelText: 'Amount 1',
                              labelStyle: GoogleFonts.outfit()),
                          validator: (v) {
                            if (v == null ||
                                double.tryParse(v) == null ||
                                double.parse(v) <= 0) return 'Invalid';
                            return null;
                          },
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          initialValue: _paymentMode,
                          decoration: InputDecoration(
                              labelText: 'Mode 1',
                              labelStyle: GoogleFonts.outfit()),
                          items: ['Cash', 'UPI', 'Bank Transfer']
                              .map((m) => DropdownMenuItem(
                                  value: m,
                                  child: TranslatedText(m,
                                      style: GoogleFonts.outfit())))
                              .toList(),
                          onChanged: (val) {
                            if (val != null) setState(() => _paymentMode = val);
                          },
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: _amount2Ctrl,
                          keyboardType: const TextInputType.numberWithOptions(
                              decimal: true),
                          inputFormatters: [
                            FilteringTextInputFormatter.allow(
                                RegExp(r'^\d+\.?\d{0,2}'))
                          ],
                          decoration: InputDecoration(
                              labelText: 'Amount 2',
                              labelStyle: GoogleFonts.outfit()),
                          validator: (v) {
                            if (v == null ||
                                double.tryParse(v) == null ||
                                double.parse(v) <= 0) return 'Invalid';
                            return null;
                          },
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          initialValue: _mode2,
                          decoration: InputDecoration(
                              labelText: 'Mode 2',
                              labelStyle: GoogleFonts.outfit()),
                          items: ['Cash', 'UPI', 'Bank Transfer']
                              .map((m) => DropdownMenuItem(
                                  value: m,
                                  child: TranslatedText(m,
                                      style: GoogleFonts.outfit())))
                              .toList(),
                          onChanged: (val) {
                            if (val != null) setState(() => _mode2 = val);
                          },
                        ),
                      ),
                    ],
                  ),
                ],
                const SizedBox(height: 14),

                if (_paymentMode == 'UPI' ||
                    _paymentMode == 'Bank Transfer') ...[
                  if (settings.upiId.isNotEmpty) ...[
                    OutlinedButton.icon(
                      onPressed: () {
                        _showUpiQrCodeDialog(settings.upiId,
                            settings.organizerName, _amountToPay);
                      },
                      icon: const Icon(Icons.qr_code_2_rounded,
                          color: AppTheme.primaryTeal),
                      label: TranslatedText('Generate Payee UPI QR',
                          style: GoogleFonts.outfit(
                              fontWeight: FontWeight.bold,
                              color: AppTheme.primaryTeal)),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: AppTheme.primaryTeal),
                        minimumSize: const Size.fromHeight(44),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ] else ...[
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.amber.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                            color: Colors.amber.withValues(alpha: 0.3)),
                      ),
                      child: TranslatedText(
                        'Set up your merchant UPI ID in Settings to auto-generate QR codes for payments.',
                        style: GoogleFonts.outfit(
                            fontSize: 12, color: Colors.amber[800]),
                      ),
                    ),
                  ],
                  const SizedBox(height: 14),
                ],

                // Collector Name Field
                TextFormField(
                  controller: _collectorNameCtrl,
                  decoration: InputDecoration(
                    labelText: 'Collector Name',
                    labelStyle: GoogleFonts.outfit(),
                    hintText: 'Enter name of payment collector',
                  ),
                ),
                const SizedBox(height: 14),

                // Remarks Field
                TextFormField(
                  decoration: InputDecoration(
                    labelText: 'Remarks / Transaction ID',
                    labelStyle: GoogleFonts.outfit(),
                    hintText: 'Optional notes',
                  ),
                  onChanged: (val) => _remarks = val,
                ),
                const SizedBox(height: 14),

                // Attach Receipt Photo picker
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: _pickReceiptPhoto,
                        icon: const Icon(Icons.photo_library_rounded,
                            color: AppTheme.primaryTeal),
                        label: TranslatedText(
                            _receiptPhotoPath == null
                                ? 'Attach Receipt Photo'
                                : 'Change Receipt Photo',
                            style: GoogleFonts.outfit(
                                color: AppTheme.primaryTeal)),
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: AppTheme.primaryTeal),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12)),
                          minimumSize: const Size.fromHeight(44),
                        ),
                      ),
                    ),
                    if (_receiptPhotoPath != null) ...[
                      const SizedBox(width: 12),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: Image.file(
                          File(_receiptPhotoPath!),
                          width: 44,
                          height: 44,
                          fit: BoxFit.cover,
                        ),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 14),

                // Date Picker Input
                InkWell(
                  onTap: () async {
                    final picked = await showDatePicker(
                      context: context,
                      initialDate: _paymentDate,
                      firstDate: DateTime(2020),
                      lastDate: DateTime(2030),
                    );
                    if (picked != null) {
                      setState(() {
                        _paymentDate = picked;
                      });
                    }
                  },
                  child: InputDecorator(
                    decoration: InputDecoration(
                      labelText: 'Payment Date',
                      labelStyle: GoogleFonts.outfit(),
                    ),
                    child: TranslatedText(
                      '${_paymentDate.day}/${_paymentDate.month}/${_paymentDate.year}',
                      style: GoogleFonts.outfit(),
                    ),
                  ),
                ),
                const SizedBox(height: 20),

                // Save button
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primaryTeal,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: () {
                      if (_formKey.currentState!.validate()) {
                        _formKey.currentState!.save();
                        final double totalEntered = _isSplitMode
                            ? double.parse(_amount1Ctrl.text) +
                                double.parse(_amount2Ctrl.text)
                            : _amountToPay;
                        final remaining = widget.info.expectedAmount -
                            widget.info.collectedAmount;

                        void submitPayment() {
                          if (!_isSplitMode) {
                            widget.onRecord(
                                _amountToPay,
                                _paymentMode,
                                _remarks,
                                _paymentDate,
                                _receiptPhotoPath,
                                _collectorNameCtrl.text.trim());
                          } else {
                            final a1 = double.parse(_amount1Ctrl.text);
                            final a2 = double.parse(_amount2Ctrl.text);
                            // Pass split data: first amount goes through onRecord normally,
                            // second amount is encoded in remarks for the screen handler to pick up.
                            widget.onRecord(
                                a1,
                                _paymentMode,
                                '__SPLIT__${a2}__${_mode2}__$_remarks',
                                _paymentDate,
                                _receiptPhotoPath,
                                _collectorNameCtrl.text.trim());
                          }
                          // Navigator.pop is now handled inside onRecord itself.
                        }

                        if (totalEntered > remaining && remaining > 0) {
                          showDialog(
                            context: context,
                            builder: (ctx) => AlertDialog(
                              title: TranslatedText('Extra Payment Detected',
                                  style: GoogleFonts.outfit(
                                      fontWeight: FontWeight.bold)),
                              content: TranslatedText(
                                  'The entered amount (${totalEntered.toStringAsFixed(0)}) is greater than the remaining expected amount (${remaining.toStringAsFixed(0)}).\n\nDo you want to save this extra amount as an advance for the next month, or re-enter the amount?'),
                              actions: [
                                TextButton(
                                  onPressed: () => Navigator.pop(ctx),
                                  child: TranslatedText('Re-enter',
                                      style: GoogleFonts.outfit(
                                          color: Colors.grey[700])),
                                ),
                                ElevatedButton(
                                  style: ElevatedButton.styleFrom(
                                      backgroundColor: AppTheme.primaryTeal),
                                  onPressed: () {
                                    Navigator.pop(ctx);
                                    submitPayment();
                                  },
                                  child: TranslatedText('Save for Next Month',
                                      style: GoogleFonts.outfit(
                                          color: Colors.white)),
                                ),
                              ],
                            ),
                          );
                        } else {
                          submitPayment();
                        }
                      }
                    },
                    child: TranslatedText(
                      'Save Payment',
                      style: GoogleFonts.outfit(
                          fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
              ] else ...[
                Center(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 24.0),
                    child: TranslatedText(
                      'Monthly dues are fully settled! ✓',
                      style: GoogleFonts.outfit(
                          fontWeight: FontWeight.bold, color: Colors.green),
                    ),
                  ),
                ),
              ]
            ],
          ),
        ),
      ),
    );
  }
}

class _PaymentScreenState extends ConsumerState<PaymentScreen> {
  final ScrollController _scrollController = ScrollController();

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  String _formatMonth(DateTime d) {
    return '${d.year}-${d.month.toString().padLeft(2, '0')}';
  }

  void _showRecordPaymentBottomSheet(
      MemberPaymentInfo info, String groupName) async {
    // Show the bottom sheet and AWAIT the result.
    // The form will pop with the payment data map when submitted.
    final result = await showModalBottomSheet<Map<String, dynamic>>(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (sheetContext) => _PendingPaymentFormSheet(
        info: info,
        groupName: groupName,
        // onRecord now only pops the sheet with the data — no async work here.
        onRecord:
            (amount, mode, remarks, date, receiptPath, collectorName) async {
          Navigator.of(sheetContext).pop({
            'amount': amount,
            'mode': mode,
            'remarks': remarks,
            'date': date,
            'receiptPath': receiptPath,
            'collectorName': collectorName,
          });
        },
        onDeletePayment: (paymentId) async {
          final messenger = ScaffoldMessenger.of(sheetContext);
          try {
            await ref.read(paymentProvider.notifier).deletePayment(paymentId);
            messenger.showSnackBar(
              const SnackBar(
                content: TranslatedText('Installment removed ✓'),
                backgroundColor: Colors.orange,
              ),
            );
          } catch (e) {
            messenger.showSnackBar(
              SnackBar(
                  content: TranslatedText('Failed: $e'),
                  backgroundColor: Colors.red),
            );
          }
        },
      ),
    );

    // Sheet is now fully closed. Use screen-level context for everything below.
    if (result == null) return;
    if (!mounted) return;

    final screenMessenger = ScaffoldMessenger.of(context);
    try {
      final rawRemarks = result['remarks'] as String?;
      final isSplit = rawRemarks?.startsWith('__SPLIT__') ?? false;

      if (isSplit) {
        // Parse encoded split data: __SPLIT__{a2}__{mode2}__{actualRemarks}
        final encoded = rawRemarks!.substring('__SPLIT__'.length);
        final firstSep = encoded.indexOf('__');
        final secondSep =
            firstSep >= 0 ? encoded.indexOf('__', firstSep + 2) : -1;
        final a2 = double.tryParse(
                firstSep >= 0 ? encoded.substring(0, firstSep) : encoded) ??
            0;
        final mode2 = (firstSep >= 0 && secondSep >= 0)
            ? encoded.substring(firstSep + 2, secondSep)
            : result['mode'] as String;
        final actualRemarks =
            secondSep >= 0 ? encoded.substring(secondSep + 2) : null;
        final cleanRemarks =
            (actualRemarks?.isNotEmpty == true) ? actualRemarks : null;
        // Record first installment
        await ref.read(paymentProvider.notifier).recordCustomPayment(
              memberId: info.member.id,
              amount: result['amount'] as double,
              paymentMode: result['mode'] as String,
              remarks: cleanRemarks,
              paymentDate: result['date'] as DateTime,
              receiptPhotoPath: result['receiptPath'] as String?,
              collectorName: result['collectorName'] as String?,
            );
        // Record second installment
        await ref.read(paymentProvider.notifier).recordCustomPayment(
              memberId: info.member.id,
              amount: a2,
              paymentMode: mode2,
              remarks: cleanRemarks,
              paymentDate: result['date'] as DateTime,
              receiptPhotoPath: result['receiptPath'] as String?,
              collectorName: result['collectorName'] as String?,
            );
      } else {
        await ref.read(paymentProvider.notifier).recordCustomPayment(
              memberId: info.member.id,
              amount: result['amount'] as double,
              paymentMode: result['mode'] as String,
              remarks: rawRemarks,
              paymentDate: result['date'] as DateTime,
              receiptPhotoPath: result['receiptPath'] as String?,
              collectorName: result['collectorName'] as String?,
            );
      }

      HapticFeedback.mediumImpact();
      screenMessenger.showSnackBar(
        const SnackBar(
          content: TranslatedText('Payment recorded successfully! ✓'),
          backgroundColor: Colors.green,
        ),
      );

      if (!mounted) return;

      // Ask to send receipt via WhatsApp — using screen context, always mounted.
      final sendReceipt = await DialogHelper.showConfirmation(
        context,
        title: 'Send Receipt?',
        message:
            'Would you like to send the payment receipt to ${info.member.name} via WhatsApp?',
        confirmText: 'Send via WhatsApp',
        cancelText: 'Skip',
      );

      if (sendReceipt == true) {
        if (!mounted) return;
        if (info.member.phone.isEmpty ||
            info.member.phone.replaceAll(RegExp(r'[^\d]'), '').isEmpty) {
          DialogHelper.showSnackBar(
            context,
            message: 'Cannot send WhatsApp: member has no phone number.',
            type: SnackBarType.warning,
          );
          return;
        }
        // Small delay to let the confirmation dialog fully close.
        await Future.delayed(const Duration(milliseconds: 200));
        if (!mounted) return;
        final chosenLang = await LanguageSelectionDialog.show(context);
        if (chosenLang != null) {
          final selectedMonth =
              ref.read(paymentProvider).value?.selectedMonth ?? DateTime.now();
          final monthLabel = '${selectedMonth.month}/${selectedMonth.year}';
          final success =
              await CommunicationService().launchWhatsAppPaymentReceipt(
            dao: ref.read(appDaoProvider),
            groupId: info.details.first.membership.groupId,
            memberId: info.member.id,
            monthYear: monthLabel,
            languageCode: chosenLang,
          );
          if (!success && mounted) {
            DialogHelper.showSnackBar(
              context,
              message:
                  'Failed to launch WhatsApp. Please check if WhatsApp is installed.',
              type: SnackBarType.error,
            );
          }
        }
      }
    } catch (e) {
      screenMessenger.showSnackBar(
        SnackBar(
            content: TranslatedText('Failed: $e'), backgroundColor: Colors.red),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final stateAsync = ref.watch(paymentProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: TranslatedText('Payments',
            style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            tooltip: 'Remind Pending Members',
            icon: const Icon(Icons.campaign_rounded),
            onPressed: () async {
              if (stateAsync.value == null) return;
              final state = stateAsync.value!;
              final pending = state.memberPayments
                  .where((info) => info.expectedAmount > info.collectedAmount)
                  .toList();
              if (pending.isEmpty) {
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                    content: TranslatedText('No pending members to remind!')));
                return;
              }
              final phones = pending.map((info) => info.member.phone).join(',');
              final uri = Uri.parse(
                  'sms:$phones?body=Reminder: Your chit fund payment is due.');
              try {
                await launchUrl(uri);
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                      content: TranslatedText(
                          'Could not open SMS app for bulk reminder.')));
                }
              }
            },
          ),
        ],
      ),
      floatingActionButton: stateAsync.maybeWhen(
        data: (state) => state.groups.isEmpty
            ? FloatingActionButton.extended(
                heroTag: 'payment_fab',
                onPressed: () => Navigator.push(context,
                    MaterialPageRoute(builder: (_) => const GroupScreen())),
                backgroundColor: AppTheme.primaryTeal,
                foregroundColor: Colors.white,
                icon: const Icon(Icons.group_add_rounded),
                label: const TranslatedText('Add Group'),
              )
            : null,
        orElse: () => null,
      ),
      body: stateAsync.when(
        loading: () => const ListSkeleton(itemCount: 8),
        error: (err, st) => Center(child: TranslatedText('Error: $err')),
        data: (state) {
          if (state.groups.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.account_tree_outlined,
                      size: 64, color: Colors.grey.withValues(alpha: 0.4)),
                  const SizedBox(height: 12),
                  TranslatedText('Create a group to start tracking payments',
                      style: GoogleFonts.outfit(color: Colors.grey)),
                ],
              ),
            );
          }

          final selectedGroup = state.groups
                  .firstWhereOrNull((g) => g.id == state.selectedGroupId) ??
              state.groups.first;

          return Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                // ── Filter controls ─────────────────────────────────
                Row(
                  children: [
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 4),
                        decoration: BoxDecoration(
                          color: isDark ? Colors.grey[900] : Colors.grey[100],
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                              color: Colors.grey.withValues(alpha: 0.2)),
                        ),
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<int?>(
                            key: ValueKey(state.selectedGroupId),
                            value: state.groups
                                    .any((g) => g.id == state.selectedGroupId)
                                ? state.selectedGroupId
                                : null,
                            isExpanded: true,
                            icon: const Icon(Icons.keyboard_arrow_down_rounded,
                                color: AppTheme.primaryTeal),
                            style: GoogleFonts.outfit(
                                fontSize: 14,
                                color: isDark ? Colors.white : Colors.black87,
                                fontWeight: FontWeight.w600),
                            items: [
                              const DropdownMenuItem<int?>(
                                value: null,
                                child: TranslatedText('All Groups',
                                    overflow: TextOverflow.ellipsis),
                              ),
                              ...state.groups.map((g) => DropdownMenuItem<int?>(
                                    value: g.id,
                                    child: Text(g.name,
                                        overflow: TextOverflow.ellipsis),
                                  )),
                            ],
                            onChanged: (v) {
                              // v can be null for 'All Groups'
                              ref.read(paymentProvider.notifier).changeGroup(v);
                            },
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: GestureDetector(
                        onTap: () async {
                          final picked = await showMonthYearPicker(
                            context: context,
                            initialDate: state.selectedMonth,
                          );
                          if (picked != null) {
                            if (state.selectedGroupId != null) {
                              final group = state.groups.firstWhereOrNull(
                                  (g) => g.id == state.selectedGroupId);
                              if (group != null) {
                                final start = DateTime(group.startDate.year,
                                    group.startDate.month);
                                // End month calculation
                                int endYear = group.startDate.year;
                                int endMonth = group.startDate.month +
                                    group.totalMonths -
                                    1;
                                while (endMonth > 12) {
                                  endMonth -= 12;
                                  endYear += 1;
                                }
                                final end = DateTime(endYear, endMonth);
                                final pickedDate =
                                    DateTime(picked.year, picked.month);

                                if (pickedDate.isBefore(start) ||
                                    pickedDate.isAfter(end)) {
                                  if (context.mounted) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(
                                          content: TranslatedText(
                                              'This month is not in the duration'),
                                          backgroundColor: Colors.red),
                                    );
                                  }
                                  return;
                                }
                              }
                            }
                            ref.read(paymentProvider.notifier).changeMonth(
                                DateTime(picked.year, picked.month));
                          }
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 16, vertical: 15),
                          decoration: BoxDecoration(
                            color: isDark ? Colors.grey[900] : Colors.grey[100],
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                                color: Colors.grey.withValues(alpha: 0.2)),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              TranslatedText(
                                _formatMonth(state.selectedMonth),
                                style: GoogleFonts.outfit(
                                    fontSize: 14,
                                    color:
                                        isDark ? Colors.white : Colors.black87,
                                    fontWeight: FontWeight.w600),
                              ),
                              const Icon(Icons.calendar_month_rounded,
                                  color: AppTheme.primaryTeal, size: 20),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // ── Summary card ────────────────────────────────────
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [AppTheme.primaryTeal, Color(0xFF14B8A6)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: [
                      BoxShadow(
                        color: AppTheme.primaryTeal.withValues(alpha: 0.3),
                        blurRadius: 20,
                        offset: const Offset(0, 10),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [
                          Expanded(
                            child: _SummaryMetric(
                              icon: Icons.track_changes_rounded,
                              label: 'Expected',
                              value:
                                  '₹${state.totalExpected.toStringAsFixed(0)}',
                              color: Colors.white,
                            ),
                          ),
                          Expanded(
                            child: _SummaryMetric(
                              icon: Icons.account_balance_wallet_rounded,
                              label: 'Received',
                              value:
                                  '₹${state.totalCollected.toStringAsFixed(0)}',
                              color: const Color(
                                  0xFF81C784), // A light green color
                            ),
                          ),
                          Expanded(
                            child: _SummaryMetric(
                              icon: Icons.pending_actions_rounded,
                              label: 'Pending',
                              value:
                                  '₹${state.totalPending.toStringAsFixed(0)}',
                              color: const Color(0xFFFFE0B2),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // ── Members list ─────────────────────────────────────
                Expanded(
                  child: state.memberPayments.isEmpty
                      ? Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.people_outline_rounded,
                                  size: 60,
                                  color: Colors.grey.withValues(alpha: 0.4)),
                              const SizedBox(height: 12),
                              TranslatedText('No members in this group',
                                  style:
                                      GoogleFonts.outfit(color: Colors.grey)),
                            ],
                          ),
                        )
                      : RefreshIndicator(
                          color: AppTheme.primaryTeal,
                          onRefresh: () async {
                            ref.invalidate(paymentProvider);
                          },
                          child: ScrollArrowsOverlay(
                            bottomPadding: 90,
                            scrollController: _scrollController,
                            child: ListView.separated(
                              controller: _scrollController,
                              itemCount: state.memberPayments.length,
                              separatorBuilder: (_, __) =>
                                  const SizedBox(height: 10),
                              itemBuilder: (context, i) {
                                final info = state.memberPayments[i];
                                final member = info.member;
                                final isPaid =
                                    info.collectedAmount >= info.expectedAmount;
                                final isPartial = info.collectedAmount > 0 &&
                                    info.collectedAmount < info.expectedAmount;
                                final isLate = info.isLate;

                                return Dismissible(
                                  key: Key(
                                      '${member.id}_${state.selectedMonth}_${info.collectedAmount}_$isPaid'),
                                  direction: DismissDirection.horizontal,
                                  background: Container(
                                    alignment: Alignment.centerLeft,
                                    padding: const EdgeInsets.only(left: 20),
                                    color: Colors.green,
                                    child: const Icon(
                                        Icons.check_circle_rounded,
                                        color: Colors.white,
                                        size: 30),
                                  ),
                                  secondaryBackground: Container(
                                    alignment: Alignment.centerRight,
                                    padding: const EdgeInsets.only(right: 20),
                                    color: Colors.blueAccent,
                                    child: const Icon(Icons.message_rounded,
                                        color: Colors.white, size: 30),
                                  ),
                                  confirmDismiss: (direction) async {
                                    if (direction ==
                                        DismissDirection.endToStart) {
                                      if (member.phone.isEmpty ||
                                          member.phone
                                              .replaceAll(RegExp(r'[^\d]'), '')
                                              .isEmpty) {
                                        DialogHelper.showSnackBar(
                                          context,
                                          message:
                                              'Cannot send WhatsApp: member has no phone number.',
                                          type: SnackBarType.warning,
                                        );
                                        return false;
                                      }
                                      Future.delayed(
                                          const Duration(milliseconds: 300),
                                          () async {
                                        if (!context.mounted) return;
                                        final chosenLang =
                                            await LanguageSelectionDialog.show(
                                                context);
                                        if (chosenLang != null) {
                                          final dao = ref.read(appDaoProvider);
                                          final success =
                                              await CommunicationService()
                                                  .launchConsolidatedWhatsAppReminder(
                                            dao: dao,
                                            member: member,
                                            languageCode: chosenLang,
                                          );
                                          if (!success && context.mounted) {
                                            DialogHelper.showSnackBar(
                                              context,
                                              message:
                                                  'Failed to launch WhatsApp. Please check if WhatsApp is installed.',
                                              type: SnackBarType.error,
                                            );
                                          }
                                        }
                                      });
                                      return false;
                                    } else if (direction ==
                                        DismissDirection.startToEnd) {
                                      Future.delayed(
                                          const Duration(milliseconds: 300),
                                          () {
                                        if (!context.mounted) return;
                                        _showRecordPaymentBottomSheet(
                                            info, selectedGroup.name);
                                      });
                                      return false;
                                    }
                                    return false;
                                  },
                                  child: GestureDetector(
                                    onTap: () => Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                            builder: (_) =>
                                                AdvancedMemberProfileScreen(
                                                    memberId: member.id))),
                                    child: GlassCard(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 16, vertical: 16),
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            children: [
                                              // Avatar
                                              Stack(
                                                children: [
                                                  Container(
                                                    decoration: BoxDecoration(
                                                      shape: BoxShape.circle,
                                                      gradient: LinearGradient(
                                                        colors: isLate
                                                            ? [
                                                                Colors
                                                                    .redAccent,
                                                                Colors.red
                                                              ]
                                                            : [
                                                                AppTheme
                                                                    .primaryTeal,
                                                                const Color(
                                                                    0xFF14B8A6)
                                                              ],
                                                        begin:
                                                            Alignment.topLeft,
                                                        end: Alignment
                                                            .bottomRight,
                                                      ),
                                                    ),
                                                    child: Padding(
                                                      padding:
                                                          const EdgeInsets.all(
                                                              2.0),
                                                      child: CircleAvatar(
                                                        radius: 22,
                                                        backgroundColor: isDark
                                                            ? Colors.grey[900]
                                                            : Colors.white,
                                                        backgroundImage: member
                                                                    .photoPath !=
                                                                null
                                                            ? FileImage(File(
                                                                member
                                                                    .photoPath!))
                                                            : null,
                                                        child:
                                                            member.photoPath ==
                                                                    null
                                                                ? Text(
                                                                    member.name
                                                                            .trim()
                                                                            .isNotEmpty
                                                                        ? member
                                                                            .name
                                                                            .trim()[0]
                                                                            .toUpperCase()
                                                                        : '?',
                                                                    style: GoogleFonts.outfit(
                                                                        color: isLate
                                                                            ? Colors
                                                                                .red
                                                                            : AppTheme
                                                                                .primaryTeal,
                                                                        fontWeight:
                                                                            FontWeight
                                                                                .bold,
                                                                        fontSize:
                                                                            18),
                                                                  )
                                                                : null,
                                                      ),
                                                    ),
                                                  ),
                                                  if (isLate)
                                                    Positioned(
                                                      bottom: 0,
                                                      right: 0,
                                                      child: Container(
                                                        width: 14,
                                                        height: 14,
                                                        decoration:
                                                            BoxDecoration(
                                                          color: Colors.red,
                                                          shape:
                                                              BoxShape.circle,
                                                          border: Border.all(
                                                              color: Theme.of(
                                                                      context)
                                                                  .scaffoldBackgroundColor,
                                                              width: 2),
                                                        ),
                                                      ),
                                                    ),
                                                ],
                                              ),
                                              const SizedBox(width: 16),
                                              Expanded(
                                                child: Column(
                                                  crossAxisAlignment:
                                                      CrossAxisAlignment.start,
                                                  children: [
                                                    Text(member.name,
                                                        style:
                                                            GoogleFonts.outfit(
                                                                fontWeight:
                                                                    FontWeight
                                                                        .bold,
                                                                fontSize: 16)),
                                                    const SizedBox(height: 4),
                                                    Wrap(
                                                      spacing: 12,
                                                      runSpacing: 4,
                                                      children: [
                                                        TranslatedText(
                                                          'Paid: ₹${(info.collectedAmount > info.expectedAmount ? info.expectedAmount : info.collectedAmount).toStringAsFixed(0)}',
                                                          style: GoogleFonts.outfit(
                                                              fontSize: 13,
                                                              color: AppTheme
                                                                  .primaryTeal,
                                                              fontWeight:
                                                                  FontWeight
                                                                      .w600),
                                                        ),
                                                        TranslatedText(
                                                          'Expected: ₹${info.expectedAmount.toStringAsFixed(0)}',
                                                          style: GoogleFonts
                                                              .outfit(
                                                                  fontSize: 13,
                                                                  color: Colors
                                                                      .grey),
                                                        ),
                                                        if (info.expectedAmount >
                                                            info.collectedAmount)
                                                          TranslatedText(
                                                            'Pending: ₹${(info.expectedAmount - info.collectedAmount).toStringAsFixed(0)}',
                                                            style: GoogleFonts.outfit(
                                                                fontSize: 13,
                                                                color: Colors
                                                                    .redAccent,
                                                                fontWeight:
                                                                    FontWeight
                                                                        .w500),
                                                          )
                                                      ],
                                                    ),
                                                    if (isLate ||
                                                        info.isWinner) ...[
                                                      const SizedBox(height: 6),
                                                      Wrap(
                                                        spacing: 8,
                                                        runSpacing: 4,
                                                        children: [
                                                          if (isLate)
                                                            Container(
                                                              padding:
                                                                  const EdgeInsets
                                                                      .symmetric(
                                                                      horizontal:
                                                                          6,
                                                                      vertical:
                                                                          2),
                                                              decoration:
                                                                  BoxDecoration(
                                                                color: Colors
                                                                    .red
                                                                    .withValues(
                                                                        alpha:
                                                                            0.1),
                                                                borderRadius:
                                                                    BorderRadius
                                                                        .circular(
                                                                            4),
                                                              ),
                                                              child: const TranslatedText(
                                                                  'Late Payer',
                                                                  style: TextStyle(
                                                                      color: Colors
                                                                          .red,
                                                                      fontSize:
                                                                          10,
                                                                      fontWeight:
                                                                          FontWeight
                                                                              .bold)),
                                                            ),
                                                          if (info.isWinner)
                                                            Container(
                                                              padding:
                                                                  const EdgeInsets
                                                                      .symmetric(
                                                                      horizontal:
                                                                          6,
                                                                      vertical:
                                                                          2),
                                                              decoration:
                                                                  BoxDecoration(
                                                                color: Colors
                                                                    .amber
                                                                    .withValues(
                                                                        alpha:
                                                                            0.1),
                                                                borderRadius:
                                                                    BorderRadius
                                                                        .circular(
                                                                            6),
                                                              ),
                                                              child: Row(
                                                                mainAxisSize:
                                                                    MainAxisSize
                                                                        .min,
                                                                children: [
                                                                  const Icon(
                                                                      Icons
                                                                          .emoji_events_rounded,
                                                                      color: Colors
                                                                          .amber,
                                                                      size: 12),
                                                                  const SizedBox(
                                                                      width: 4),
                                                                  TranslatedText(
                                                                      'WINNER',
                                                                      style: GoogleFonts.outfit(
                                                                          fontSize:
                                                                              10,
                                                                          color: Colors
                                                                              .amber,
                                                                          fontWeight:
                                                                              FontWeight.bold)),
                                                                ],
                                                              ),
                                                            ),
                                                        ],
                                                      ),
                                                    ],
                                                    if (isPartial)
                                                      Padding(
                                                        padding:
                                                            const EdgeInsets
                                                                .only(top: 6),
                                                        child:
                                                            LinearProgressIndicator(
                                                          value: info
                                                                  .collectedAmount /
                                                              info.expectedAmount,
                                                          backgroundColor:
                                                              Colors.orange
                                                                  .withValues(
                                                                      alpha:
                                                                          0.2),
                                                          valueColor:
                                                              const AlwaysStoppedAnimation<
                                                                      Color>(
                                                                  Colors
                                                                      .orange),
                                                          borderRadius:
                                                              BorderRadius
                                                                  .circular(4),
                                                          minHeight: 4,
                                                        ),
                                                      ),
                                                  ],
                                                ),
                                              ),
                                            ],
                                          ),
                                          const SizedBox(height: 16),
                                          Row(
                                            mainAxisAlignment:
                                                MainAxisAlignment.end,
                                            children: [
                                              if (info.isWinner &&
                                                  !info.hasWinnerBeenPaid &&
                                                  info.wonRoundIds.isNotEmpty)
                                                TextButton.icon(
                                                  onPressed: () async {
                                                    String selectedMode =
                                                        'Cash';
                                                    final confirm =
                                                        await showDialog<bool>(
                                                      context: context,
                                                      builder: (ctx) =>
                                                          StatefulBuilder(
                                                        builder: (ctx,
                                                                setStateDialog) =>
                                                            AlertDialog(
                                                          title: TranslatedText(
                                                              'Pay Winner',
                                                              style: GoogleFonts.outfit(
                                                                  fontWeight:
                                                                      FontWeight
                                                                          .bold)),
                                                          content: Column(
                                                            mainAxisSize:
                                                                MainAxisSize
                                                                    .min,
                                                            crossAxisAlignment:
                                                                CrossAxisAlignment
                                                                    .start,
                                                            children: [
                                                              TranslatedText(
                                                                  'Select payment mode to mark the prize as paid.',
                                                                  style: GoogleFonts
                                                                      .outfit(
                                                                          fontSize:
                                                                              14)),
                                                              const SizedBox(
                                                                  height: 16),
                                                              DropdownButtonFormField<
                                                                  String>(
                                                                initialValue:
                                                                    selectedMode,
                                                                decoration: const InputDecoration(
                                                                    labelText:
                                                                        'Payment Mode',
                                                                    border:
                                                                        OutlineInputBorder()),
                                                                items: [
                                                                  'Cash',
                                                                  'Bank Transfer',
                                                                  'UPI'
                                                                ]
                                                                    .map((m) => DropdownMenuItem(
                                                                        value:
                                                                            m,
                                                                        child: Text(
                                                                            m)))
                                                                    .toList(),
                                                                onChanged: (v) =>
                                                                    setStateDialog(() =>
                                                                        selectedMode =
                                                                            v ??
                                                                                'Cash'),
                                                              ),
                                                            ],
                                                          ),
                                                          actions: [
                                                            TextButton(
                                                              onPressed: () =>
                                                                  Navigator.pop(
                                                                      ctx,
                                                                      false),
                                                              child:
                                                                  const TranslatedText(
                                                                      'Cancel'),
                                                            ),
                                                            ElevatedButton(
                                                              style: ElevatedButton.styleFrom(
                                                                  backgroundColor:
                                                                      AppTheme
                                                                          .primaryTeal,
                                                                  foregroundColor:
                                                                      Colors
                                                                          .white),
                                                              onPressed: () =>
                                                                  Navigator.pop(
                                                                      ctx,
                                                                      true),
                                                              child: const TranslatedText(
                                                                  'Mark Paid'),
                                                            ),
                                                          ],
                                                        ),
                                                      ),
                                                    );

                                                    if (confirm == true) {
                                                      if (!context.mounted)
                                                        return;
                                                      final messenger =
                                                          ScaffoldMessenger.of(
                                                              context);
                                                      try {
                                                        await ref
                                                            .read(
                                                                paymentProvider
                                                                    .notifier)
                                                            .payWinner(
                                                              info.wonRoundIds
                                                                  .first,
                                                              0.0, // Since we don't have the exact remaining amount here, we assume full payment if not tracked via group details properly?
                                                              // Actually wait, amount parameter in payWinner is for adding to currentPaid.
                                                              // The user just wants to mark the winner paid here.
                                                            );
                                                        messenger.showSnackBar(
                                                          const SnackBar(
                                                              content:
                                                                  TranslatedText(
                                                                      'Winner marked as paid successfully!'),
                                                              backgroundColor:
                                                                  Colors.green),
                                                        );
                                                      } catch (e) {
                                                        messenger.showSnackBar(
                                                          SnackBar(
                                                              content:
                                                                  TranslatedText(
                                                                      'Error: $e'),
                                                              backgroundColor:
                                                                  Colors.red),
                                                        );
                                                      }
                                                    }
                                                  },
                                                  icon: const Icon(
                                                      Icons.payments_outlined,
                                                      size: 18),
                                                  label: TranslatedText(
                                                      'Winner Pay',
                                                      style: GoogleFonts.outfit(
                                                          fontWeight:
                                                              FontWeight.w600)),
                                                  style: TextButton.styleFrom(
                                                    foregroundColor:
                                                        Colors.amber,
                                                    padding: const EdgeInsets
                                                        .symmetric(
                                                        horizontal: 12),
                                                  ),
                                                ),
                                              if (!isPaid)
                                                TextButton.icon(
                                                  onPressed: () async {
                                                    if (member.phone.isEmpty ||
                                                        member.phone
                                                            .replaceAll(
                                                                RegExp(
                                                                    r'[^\d]'),
                                                                '')
                                                            .isEmpty) {
                                                      DialogHelper.showSnackBar(
                                                        context,
                                                        message:
                                                            'Cannot send WhatsApp: member has no phone number.',
                                                        type: SnackBarType
                                                            .warning,
                                                      );
                                                      return;
                                                    }
                                                    final chosenLang =
                                                        await LanguageSelectionDialog
                                                            .show(context);
                                                    if (chosenLang != null) {
                                                      final dao = ref
                                                          .read(appDaoProvider);
                                                      final success =
                                                          await CommunicationService()
                                                              .launchConsolidatedWhatsAppReminder(
                                                        dao: dao,
                                                        member: member,
                                                        languageCode:
                                                            chosenLang,
                                                      );
                                                      if (!success &&
                                                          context.mounted) {
                                                        DialogHelper
                                                            .showSnackBar(
                                                          context,
                                                          message:
                                                              'Failed to launch WhatsApp. Please check if WhatsApp is installed.',
                                                          type: SnackBarType
                                                              .error,
                                                        );
                                                      }
                                                    }
                                                  },
                                                  icon: const Icon(
                                                      Icons
                                                          .chat_bubble_outline_rounded,
                                                      size: 18),
                                                  label: TranslatedText(
                                                      'Remind',
                                                      style: GoogleFonts.outfit(
                                                          fontWeight:
                                                              FontWeight.w600)),
                                                  style: TextButton.styleFrom(
                                                    foregroundColor:
                                                        Colors.green,
                                                    padding: const EdgeInsets
                                                        .symmetric(
                                                        horizontal: 12),
                                                  ),
                                                ),
                                              const Spacer(),
                                              GestureDetector(
                                                onTap: () =>
                                                    _showRecordPaymentBottomSheet(
                                                        info,
                                                        selectedGroup.name),
                                                child: AnimatedContainer(
                                                  duration: const Duration(
                                                      milliseconds: 250),
                                                  padding: const EdgeInsets
                                                      .symmetric(
                                                      horizontal: 16,
                                                      vertical: 8),
                                                  decoration: BoxDecoration(
                                                    color: isPaid
                                                        ? Colors.green
                                                            .withValues(
                                                                alpha: 0.12)
                                                        : (isPartial
                                                            ? Colors.orange
                                                                .withValues(
                                                                    alpha: 0.12)
                                                            : AppTheme
                                                                .primaryTeal),
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                            20),
                                                    border: Border.all(
                                                      color: isPaid
                                                          ? Colors.green
                                                          : (isPartial
                                                              ? Colors.orange
                                                              : AppTheme
                                                                  .primaryTeal),
                                                    ),
                                                    boxShadow:
                                                        (!isPaid && !isPartial)
                                                            ? [
                                                                BoxShadow(
                                                                  color: AppTheme
                                                                      .primaryTeal
                                                                      .withValues(
                                                                          alpha:
                                                                              0.3),
                                                                  blurRadius: 8,
                                                                  offset:
                                                                      const Offset(
                                                                          0, 4),
                                                                )
                                                              ]
                                                            : null,
                                                  ),
                                                  child: Row(
                                                    mainAxisSize:
                                                        MainAxisSize.min,
                                                    children: [
                                                      if (isPaid)
                                                        const Icon(
                                                            Icons
                                                                .check_circle_rounded,
                                                            color: Colors.green,
                                                            size: 16),
                                                      if (isPartial)
                                                        const Icon(
                                                            Icons.bolt_rounded,
                                                            color:
                                                                Colors.orange,
                                                            size: 16),
                                                      if (!isPaid && !isPartial)
                                                        const Icon(
                                                            Icons.add_rounded,
                                                            color: Colors.white,
                                                            size: 16),
                                                      const SizedBox(width: 4),
                                                      TranslatedText(
                                                        isPaid
                                                            ? 'Paid'
                                                            : (isPartial
                                                                ? 'Partial'
                                                                : 'Record Pay'),
                                                        style:
                                                            GoogleFonts.outfit(
                                                          fontSize: 13,
                                                          fontWeight:
                                                              FontWeight.bold,
                                                          color: isPaid
                                                              ? Colors.green
                                                              : (isPartial
                                                                  ? Colors
                                                                      .orange
                                                                  : Colors
                                                                      .white),
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                ),
                                              ),
                                            ],
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                );
                              },
                            ),
                          ),
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

class _SummaryMetric extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _SummaryMetric(
      {required this.icon,
      required this.label,
      required this.value,
      required this.color});

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, color: color, size: 24),
        const SizedBox(height: 4),
        FittedBox(
          fit: BoxFit.scaleDown,
          child: TranslatedText(label,
              style: GoogleFonts.outfit(fontSize: 12, color: Colors.white70)),
        ),
        FittedBox(
          fit: BoxFit.scaleDown,
          child: TranslatedText(value,
              style: GoogleFonts.outfit(
                  fontSize: 16, fontWeight: FontWeight.bold, color: color)),
        ),
      ],
    );
  }
}
