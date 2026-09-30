import 'history_tab.dart';
import 'package:chit_fund_app/utils/theme.dart';
import 'package:intl/intl.dart';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_contacts/flutter_contacts.dart' hide Group;
import 'package:drift/drift.dart' as drift;
import 'package:speech_to_text/speech_to_text.dart' as stt;

import '../../data/local/app_database.dart';
import '../../services/communication_service.dart';
import '../../services/export_service.dart';
import '../../widgets/month_year_picker.dart';
import '../../widgets/index.dart';
import 'group_detail_view_model.dart';
import 'edit_group_sheet.dart';
import '../member/advanced_member_profile_screen.dart';
import '../../providers/settings_provider.dart';
import '../../widgets/translated_text.dart';
import '../../data/providers/db_provider.dart';
import '../../localization/app_localizations.dart';
import '../../services/translation_service.dart';
import '../../services/notification_service.dart';
import '../../widgets/language_selection_dialog.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/scroll_arrows_overlay.dart';

class GroupDetailScreen extends ConsumerStatefulWidget {
  final Group group;
  const GroupDetailScreen({super.key, required this.group});

  @override
  ConsumerState<GroupDetailScreen> createState() => _GroupDetailScreenState();
}

class _GroupDetailScreenState extends ConsumerState<GroupDetailScreen>
    with SingleTickerProviderStateMixin {
  late DateTime _selectedMonth;
  late TabController _tabController;

  String get _monthLabel {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];
    return '${months[_selectedMonth.month - 1]} ${_selectedMonth.year}';
  }

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    _selectedMonth = DateTime(now.year, now.month);
    _tabController = TabController(length: 5, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _pickMonth() async {
    final result = await showMonthYearPicker(
      context: context,
      initialDate: _selectedMonth,
    );
    if (result != null && mounted) {
      final group = widget.group;
      final start = DateTime(group.startDate.year, group.startDate.month);
      // End month calculation
      int endYear = group.startDate.year;
      int endMonth = group.startDate.month + group.totalMonths - 1;
      while (endMonth > 12) {
        endMonth -= 12;
        endYear += 1;
      }
      final end = DateTime(endYear, endMonth);
      final pickedDate = DateTime(result.year, result.month);

      if (pickedDate.isBefore(start) || pickedDate.isAfter(end)) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
                content: TranslatedText('This month is not in the duration'),
                backgroundColor: Colors.red),
          );
        }
        return;
      }

      setState(() => _selectedMonth = DateTime(result.year, result.month));
    }
  }

  Future<String?> _selectReminderLanguage(BuildContext ctx) async {
    return await LanguageSelectionDialog.show(ctx);
  }

  Future<void> _togglePayment(
      BuildContext ctx, int memberId, bool isPaid, GroupMemberDetail md) async {
    if (isPaid) {
      await ref
          .read(groupDetailActionsProvider)
          .togglePayment(memberId, widget.group.id, _selectedMonth);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(children: [
            const Icon(Icons.undo_rounded, color: Colors.white, size: 18),
            const SizedBox(width: 8),
            TranslatedText('Marked as Pending',
                style: GoogleFonts.outfit(fontWeight: FontWeight.w600)),
          ]),
          backgroundColor: Colors.orange,
          behavior: SnackBarBehavior.floating,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          duration: const Duration(seconds: 2),
        ),
      );
    } else {
      // Open full payment entry form
      final expectedAmount = (md.monthExpected - md.monthPaid) > 0
          ? (md.monthExpected - md.monthPaid)
          : 0.0;

      final result = await showModalBottomSheet<Map<String, dynamic>>(
        context: context,
        isScrollControlled: true,
        backgroundColor: Colors.transparent,
        builder: (sheetCtx) => _PaymentEntrySheet(
          memberName: md.member.name,
          groupName: widget.group.name,
          expectedAmount: expectedAmount,
          selectedMonth: _selectedMonth,
          isWinner: md.hasWonAnyRound,
        ),
      );

      if (result == null) return;

      final paymentMode = result['mode'] as String;
      final amount = result['amount'] as double;
      final paymentDate = result['date'] as DateTime;
      final remarks = result['remarks'] as String?;
      final collectorName = result['collector'] as String?;
      final splitExcess = result['splitExcess'] as bool? ?? false;
      final isPrizePayout = result['isPrizePayout'] as bool? ?? false;

      if (isPrizePayout) {
        final state = ref
            .read(groupDetailProvider(
                (groupId: widget.group.id, month: _selectedMonth)))
            .value;
        if (state != null) {
          final win = state.winners
              .where((w) =>
                  (w.round.exchangedToMemberId ?? w.winner.id) == memberId)
              .lastOrNull;
          if (win != null) {
            await ref.read(groupDetailActionsProvider).payWinner(
                  win.round.id,
                  amount,
                  paymentMode: paymentMode,
                  recipientMemberId: memberId,
                  exchangeNote: win.round.exchangeNote,
                );
            if (!mounted) return;
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                  content: TranslatedText('Paid Prize to [#1]',
                      replacements: {'[#1]': md.member.name})),
            );
          }
        }
        return;
      }

      await ref.read(groupDetailActionsProvider).recordFullPayment(
            memberId: memberId,
            groupId: widget.group.id,
            month: _selectedMonth,
            amount: amount,
            paymentMode: paymentMode,
            paymentDate: paymentDate,
            remarks: remarks,
            collectorName: collectorName,
            splitExcess: splitExcess,
            expectedAmount: expectedAmount,
          );

      if (!mounted) return;

      final lang = ref.read(settingsProvider).locale.languageCode;
      final confirm = await DialogHelper.showConfirmation(
        context,
        title: AppLocalizations.of(context).translate('send_receipt'),
        message: 'Send WhatsApp receipt to ${md.member.name}?',
        confirmText: AppLocalizations.of(context).translate('send_receipt'),
        cancelText: AppLocalizations.of(context).translate('skip'),
      );

      if (confirm && md.member.phone.isNotEmpty) {
        if (!mounted) return;
        // Wait for confirmation dialog pop transition to complete before showing language picker
        await Future.delayed(const Duration(milliseconds: 200));
        if (!mounted) return;
        final chosenLang = await _selectReminderLanguage(context) ?? lang;
        final translator = ref.read(translationServiceProvider);
        final localizedMonth =
            await translator.translate(_monthLabel, chosenLang);
        final success =
            await CommunicationService().launchWhatsAppPaymentReceipt(
          dao: ref.read(appDaoProvider),
          groupId: widget.group.id,
          memberId: md.member.id,
          monthYear: localizedMonth,
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

      await NotificationService().showNotification(
        id: md.member.id,
        title: 'Payment Received',
        body: '₹${amount.toStringAsFixed(0)} received from ${md.member.name}',
      );

      if (!ctx.mounted) return;
      ScaffoldMessenger.of(ctx).showSnackBar(
        SnackBar(
          content: Row(children: [
            const Icon(Icons.check_circle_rounded,
                color: Colors.white, size: 18),
            const SizedBox(width: 8),
            TranslatedText('Marked as Paid ✓',
                style: GoogleFonts.outfit(fontWeight: FontWeight.w600)),
          ]),
          backgroundColor: Colors.green,
          behavior: SnackBarBehavior.floating,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          duration: const Duration(seconds: 2),
        ),
      );
    }
  }

  void _showRemindAllSheet(List<GroupMemberDetail> pending) {
    // Fetch live state for actual contribution
    final stateAsync = ref.read(groupDetailProvider(
      (groupId: widget.group.id, month: _selectedMonth),
    ));
    final actualContribution = stateAsync.value?.actualMonthlyContribution ??
        widget.group.monthlyContribution;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return Container(
          padding: const EdgeInsets.symmetric(vertical: 20),
          decoration: BoxDecoration(
            color: Theme.of(context).scaffoldBackgroundColor,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
          ),
          constraints: BoxConstraints(
              maxHeight: MediaQuery.of(context).size.height * 0.7),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TranslatedText('Remind Pending Members',
                  style: GoogleFonts.outfit(
                      fontSize: 20, fontWeight: FontWeight.bold),
                  textAlign: TextAlign.center),
              const SizedBox(height: 16),
              Expanded(
                child: ListView.builder(
                  physics: const ClampingScrollPhysics(),
                  itemCount: pending.length,
                  itemBuilder: (ctx, i) {
                    final md = pending[i];
                    // Per-member amount = contribution × their installment count
                    final memberAmount =
                        actualContribution * md.installmentsCount;
                    return ListTile(
                      leading: CircleAvatar(
                        backgroundColor: Colors.orange.withValues(alpha: 0.2),
                        child: Text(
                            md.member.name.isNotEmpty
                                ? md.member.name[0].toUpperCase()
                                : '?',
                            style: const TextStyle(color: Colors.orange)),
                      ),
                      title: Text(md.member.name,
                          style:
                              GoogleFonts.outfit(fontWeight: FontWeight.w600)),
                      subtitle: Text(
                        '${md.member.phone} • ₹${memberAmount.toStringAsFixed(0)} due',
                        style: GoogleFonts.outfit(
                            fontSize: 12, color: Colors.grey),
                      ),
                      trailing: IconButton(
                        icon: const Icon(Icons.chat, color: Colors.green),
                        tooltip: 'Send WhatsApp',
                        onPressed: () async {
                          if (md.member.phone.isNotEmpty) {
                            final messenger = ScaffoldMessenger.of(context);
                            final chosenLang =
                                await _selectReminderLanguage(context);
                            if (chosenLang != null) {
                              final dao = ref.read(appDaoProvider);
                              final success = await CommunicationService()
                                  .launchConsolidatedWhatsAppReminder(
                                dao: dao,
                                member: md.member,
                                languageCode: chosenLang,
                              );
                              if (!success) {
                                messenger.showSnackBar(
                                  const SnackBar(
                                    content: Text(
                                        'Failed to launch WhatsApp. Please check if WhatsApp is installed.'),
                                    backgroundColor: Colors.red,
                                  ),
                                );
                              }
                            }
                          }
                        },
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  String _getHijriDate(DateTime date) {
    final refDate = DateTime(2026, 1, 1);
    final diffDays = date.difference(refDate).inDays;
    final hijriYear = 1447 + (diffDays / 354.367).floor();
    final dayOfYear = diffDays % 354.367;
    final hijriMonthIdx = (dayOfYear / 29.53059).floor();
    final hijriDay = (dayOfYear % 29.53059).floor() + 12;

    final hijriMonths = [
      'Muharram',
      'Safar',
      'Rabi al-Awwal',
      'Rabi al-Thani',
      'Jumada al-Awwal',
      'Jumada al-Thani',
      'Rajab',
      'Sha\'ban',
      'Ramadan',
      'Shawwal',
      'Dhu al-Qa\'dah',
      'Dhu al-Hijjah'
    ];

    final finalMonthIdx = (hijriMonthIdx + 6) % 12;
    final finalYear = hijriYear + ((hijriMonthIdx + 6) >= 12 ? 1 : 0);
    final finalDay = (hijriDay % 30) == 0 ? 30 : (hijriDay % 30);

    return '$finalDay ${hijriMonths[finalMonthIdx]} $finalYear AH';
  }

  void _showDeclareWinnerSheet(GroupDetailState state) {
    final eligibleMembers =
        state.members.where((m) => !m.hasWonAnyRound).toList();
    if (eligibleMembers.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content:
                TranslatedText('All members have already won an auction!')),
      );
      return;
    }

    final roundController =
        TextEditingController(text: '${state.winners.length + 1}');
    final prizeController =
        TextEditingController(text: state.monthExpected.toStringAsFixed(0));
    final paidController = TextEditingController(text: '0');
    final remarksController = TextEditingController();
    final stt.SpeechToText speech = stt.SpeechToText();
    Member? selectedMember = eligibleMembers.first.member;
    String selectedPaymentMode = 'Cash';
    bool isListening = false;

    // Move state variables outside StatefulBuilder so they don't reset
    bool isExchanged = false;
    bool isSplitPayment = false;
    int? exchangedToMemberId;
    final exchangeNoteController = TextEditingController();
    final splitAmt1Controller = TextEditingController();
    final splitAmt2Controller = TextEditingController();
    String mode1 = 'Cash';
    String mode2 = 'UPI';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            final double total1MonthCollection = state.monthExpected;
            final double prizeAmount =
                double.tryParse(prizeController.text.trim()) ??
                    total1MonthCollection;
            // We calculate the logical bid (discount) so we can save it accurately, though the UI hides it.
            final double bid = (total1MonthCollection - prizeAmount) > 0
                ? (total1MonthCollection - prizeAmount)
                : 0.0;
            final double paid =
                double.tryParse(paidController.text.trim()) ?? 0.0;
            final double left =
                (prizeAmount - paid) > 0 ? (prizeAmount - paid) : 0.0;

            void listenVoiceRemarks() async {
              if (!isListening) {
                bool available = false;
                try {
                  available = await speech.initialize(
                    onStatus: (status) {
                      if (status == 'done' || status == 'notListening') {
                        setModalState(() => isListening = false);
                      }
                    },
                    onError: (e) => setModalState(() => isListening = false),
                  );
                } catch (e) {
                  debugPrint('Speech init failed: $e');
                }

                if (available) {
                  setModalState(() => isListening = true);
                  speech.listen(
                    onResult: (val) {
                      setModalState(() {
                        remarksController.text = val.recognizedWords;
                      });
                    },
                  );
                } else {
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                          content: TranslatedText(
                              'Speech recognition not available on this device.')),
                    );
                  }
                }
              } else {
                setModalState(() => isListening = false);
                speech.stop();
              }
            }

            return Container(
              padding: EdgeInsets.only(
                top: 20,
                left: 20,
                right: 20,
                bottom: MediaQuery.of(context).viewInsets.bottom + 20,
              ),
              decoration: BoxDecoration(
                color: Theme.of(context).scaffoldBackgroundColor,
                borderRadius:
                    const BorderRadius.vertical(top: Radius.circular(28)),
              ),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    TranslatedText(
                      'Declare Auction Winner',
                      style: GoogleFonts.outfit(
                          fontSize: 20, fontWeight: FontWeight.bold),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppTheme.primaryTeal.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        'Declared Month: $_monthLabel',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.outfit(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.primaryTeal),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // 1-Month Total Collection Banner
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            AppTheme.primaryTeal.withValues(alpha: 0.15),
                            Colors.blue.withValues(alpha: 0.10),
                          ],
                        ),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                            color: AppTheme.primaryTeal.withValues(alpha: 0.4)),
                      ),
                      child: Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  const Icon(
                                      Icons.account_balance_wallet_rounded,
                                      color: AppTheme.primaryTeal,
                                      size: 20),
                                  const SizedBox(width: 8),
                                  TranslatedText(
                                    '1 Month Total Collection',
                                    style: GoogleFonts.outfit(
                                        fontWeight: FontWeight.w600,
                                        fontSize: 13,
                                        color: AppTheme.primaryTeal),
                                  ),
                                ],
                              ),
                              TranslatedText(
                                '₹${total1MonthCollection.toStringAsFixed(0)}',
                                style: GoogleFonts.outfit(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                    color: AppTheme.primaryTeal),
                              ),
                            ],
                          ),
                          const Divider(height: 16),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              TranslatedText(
                                'Winner Amount (Prize)',
                                style: GoogleFonts.outfit(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 13,
                                    color: Colors.blue),
                              ),
                              TranslatedText(
                                '₹${prizeAmount.toStringAsFixed(0)}',
                                style: GoogleFonts.outfit(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                    color: Colors.blue),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 14),

                    TextFormField(
                      controller: roundController,
                      decoration:
                          const InputDecoration(labelText: 'Round Number'),
                      keyboardType: TextInputType.number,
                    ),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<Member>(
                      initialValue: eligibleMembers
                              .any((em) => em.member.id == selectedMember?.id)
                          ? eligibleMembers
                              .firstWhere(
                                  (em) => em.member.id == selectedMember?.id)
                              .member
                          : null,
                      decoration: const InputDecoration(
                          labelText: 'Select Winner Member'),
                      items: eligibleMembers
                          .fold<Map<int, GroupMemberDetail>>({}, (map, em) {
                            map.putIfAbsent(em.member.id, () => em);
                            return map;
                          })
                          .values
                          .map((em) {
                            return DropdownMenuItem<Member>(
                              value: em.member,
                              child: Text(em.member.name),
                            );
                          })
                          .toList(),
                      onChanged: (val) {
                        if (val != null) {
                          setModalState(() {
                            selectedMember = val;
                          });
                        }
                      },
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: prizeController,
                      decoration: const InputDecoration(
                        labelText: 'Prize Amount (₹)',
                        prefixText: '₹',
                      ),
                      keyboardType: TextInputType.number,
                      onChanged: (v) => setModalState(() {}),
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: paidController,
                      decoration: const InputDecoration(
                        labelText: 'Amount Paid to Winner (₹)',
                        prefixText: '₹',
                      ),
                      keyboardType: TextInputType.number,
                      onChanged: (v) => setModalState(() {}),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        TranslatedText(
                          'Paid: ₹${paid.toStringAsFixed(0)}',
                          style: GoogleFonts.outfit(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: Colors.green),
                        ),
                        TranslatedText(
                          'Left (Pending): ₹${left.toStringAsFixed(0)}',
                          style: GoogleFonts.outfit(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: Colors.orange[800] ?? Colors.orange),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),

                    // ── Dual / Split Payment Mode Switch & Controls ────────────────
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Theme.of(context).brightness == Brightness.dark
                            ? Colors.grey[850]
                            : Colors.grey[100],
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Material(
                        color: Colors.transparent,
                        child: Column(
                          children: [
                            SwitchListTile(
                              contentPadding: EdgeInsets.zero,
                              title: TranslatedText('Split Payment (2 Modes)',
                                  style: GoogleFonts.outfit(
                                      fontSize: 13,
                                      fontWeight: FontWeight.bold)),
                              value: isSplitPayment,
                              activeThumbColor: AppTheme.primaryTeal,
                              onChanged: (val) =>
                                  setModalState(() => isSplitPayment = val),
                            ),
                            if (!isSplitPayment) ...[
                              DropdownButtonFormField<String>(
                                decoration: const InputDecoration(
                                  labelText: 'Payment Mode',
                                  prefixIcon: Icon(Icons.payment_rounded,
                                      color: AppTheme.primaryTeal),
                                ),
                                initialValue: selectedPaymentMode,
                                items: const [
                                  DropdownMenuItem(
                                      value: 'Cash', child: Text('Cash')),
                                  DropdownMenuItem(
                                      value: 'UPI', child: Text('UPI')),
                                  DropdownMenuItem(
                                      value: 'Bank Transfer',
                                      child: Text('Bank Transfer')),
                                  DropdownMenuItem(
                                      value: 'Cheque', child: Text('Cheque')),
                                  DropdownMenuItem(
                                      value: 'Other', child: Text('Other')),
                                ],
                                onChanged: (val) {
                                  if (val != null) {
                                    setModalState(
                                        () => selectedPaymentMode = val);
                                  }
                                },
                              ),
                            ] else ...[
                              Row(
                                children: [
                                  Expanded(
                                    child: DropdownButtonFormField<String>(
                                      decoration: const InputDecoration(
                                          labelText: 'Mode 1'),
                                      initialValue: mode1,
                                      items: const [
                                        DropdownMenuItem(
                                            value: 'Cash', child: Text('Cash')),
                                        DropdownMenuItem(
                                            value: 'UPI', child: Text('UPI')),
                                        DropdownMenuItem(
                                            value: 'Bank Transfer',
                                            child: Text('Bank')),
                                        DropdownMenuItem(
                                            value: 'Cheque',
                                            child: Text('Cheque')),
                                      ],
                                      onChanged: (v) =>
                                          setModalState(() => mode1 = v!),
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: TextFormField(
                                      controller: splitAmt1Controller,
                                      keyboardType: TextInputType.number,
                                      decoration: const InputDecoration(
                                          labelText: 'Amt 1 (₹)',
                                          prefixText: '₹'),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  Expanded(
                                    child: DropdownButtonFormField<String>(
                                      decoration: const InputDecoration(
                                          labelText: 'Mode 2'),
                                      initialValue: mode2,
                                      items: const [
                                        DropdownMenuItem(
                                            value: 'UPI', child: Text('UPI')),
                                        DropdownMenuItem(
                                            value: 'Cash', child: Text('Cash')),
                                        DropdownMenuItem(
                                            value: 'Bank Transfer',
                                            child: Text('Bank')),
                                        DropdownMenuItem(
                                            value: 'Cheque',
                                            child: Text('Cheque')),
                                      ],
                                      onChanged: (v) =>
                                          setModalState(() => mode2 = v!),
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: TextFormField(
                                      controller: splitAmt2Controller,
                                      keyboardType: TextInputType.number,
                                      decoration: const InputDecoration(
                                          labelText: 'Amt 2 (₹)',
                                          prefixText: '₹'),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // ── Option & Note to Exchange Winner Amount ────────────────
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Theme.of(context).brightness == Brightness.dark
                            ? Colors.grey[850]
                            : Colors.grey[100],
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Material(
                        color: Colors.transparent,
                        child: Column(
                          children: [
                            SwitchListTile(
                              contentPadding: EdgeInsets.zero,
                              title: TranslatedText(
                                  'Exchange Prize to Another Group Member',
                                  style: GoogleFonts.outfit(
                                      fontSize: 13,
                                      fontWeight: FontWeight.bold)),
                              subtitle: TranslatedText(
                                  'Assign/transfer winner payout to another member',
                                  style: GoogleFonts.outfit(
                                      fontSize: 11, color: Colors.grey)),
                              value: isExchanged,
                              activeThumbColor: AppTheme.primaryTeal,
                              onChanged: (val) =>
                                  setModalState(() => isExchanged = val),
                            ),
                            if (isExchanged) ...[
                              DropdownButtonFormField<int>(
                                decoration: InputDecoration(
                                  labelText: 'Exchanged To Member',
                                  labelStyle: GoogleFonts.outfit(),
                                  prefixIcon: const Icon(
                                      Icons.swap_horiz_rounded,
                                      color: AppTheme.primaryTeal),
                                ),
                                initialValue: state.members.any((m) =>
                                        m.member.id == exchangedToMemberId)
                                    ? exchangedToMemberId
                                    : null,
                                items: state.members
                                    .fold<Map<int, GroupMemberDetail>>({},
                                        (map, m) {
                                      map.putIfAbsent(m.member.id, () => m);
                                      return map;
                                    })
                                    .values
                                    .map((m) {
                                      return DropdownMenuItem<int>(
                                        value: m.member.id,
                                        child: Text(m.member.name,
                                            overflow: TextOverflow.ellipsis,
                                            style: GoogleFonts.outfit()),
                                      );
                                    })
                                    .toList(),
                                onChanged: (val) => setModalState(
                                    () => exchangedToMemberId = val),
                              ),
                              const SizedBox(height: 8),
                              TextFormField(
                                controller: exchangeNoteController,
                                maxLines: 2,
                                decoration: InputDecoration(
                                  labelText: 'Exchange Note / Reason',
                                  labelStyle: GoogleFonts.outfit(),
                                  hintText:
                                      'e.g. Exchanged prize to Rahul per mutual agreement...',
                                  prefixIcon: const Icon(
                                      Icons.edit_note_rounded,
                                      color: AppTheme.primaryTeal),
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),

                    TextFormField(
                      controller: remarksController,
                      maxLines: 2,
                      decoration: InputDecoration(
                        labelText: 'Winner Remarks (Voice & Text)',
                        hintText: 'Type remarks or tap microphone...',
                        prefixIcon: const Icon(Icons.comment_rounded,
                            color: AppTheme.primaryTeal),
                        suffixIcon: IconButton(
                          icon: Icon(
                            isListening ? Icons.mic : Icons.mic_none_rounded,
                            color:
                                isListening ? Colors.red : AppTheme.primaryTeal,
                          ),
                          onPressed: listenVoiceRemarks,
                        ),
                      ),
                    ),
                    if (isListening) ...[
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          const SizedBox(
                              width: 12,
                              height: 12,
                              child: CircularProgressIndicator(
                                  strokeWidth: 2, color: Colors.red)),
                          const SizedBox(width: 8),
                          TranslatedText('Listening...',
                              style: GoogleFonts.outfit(
                                  fontSize: 12,
                                  color: Colors.red,
                                  fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ],
                    const SizedBox(height: 24),
                    ElevatedButton(
                      onPressed: () async {
                        final rNum = int.tryParse(roundController.text.trim());
                        final prize =
                            double.tryParse(prizeController.text.trim()) ?? 0.0;
                        if (rNum == null || selectedMember == null) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                                content: TranslatedText(
                                    'Please enter valid round and select member')),
                          );
                          return;
                        }

                        final paidVal =
                            double.tryParse(paidController.text.trim()) ?? 0.0;
                        final leftVal =
                            (prize - paidVal) > 0 ? (prize - paidVal) : 0.0;
                        final remarks = remarksController.text.trim();

                        String finalMode = selectedPaymentMode;
                        if (isSplitPayment) {
                          final a1 = splitAmt1Controller.text.trim();
                          final a2 = splitAmt2Controller.text.trim();
                          finalMode = '$mode1 (₹$a1) + $mode2 (₹$a2)';
                        }

                        await ref
                            .read(groupDetailActionsProvider)
                            .declareWinner(
                              groupId: widget.group.id,
                              roundNumber: rNum,
                              month: _selectedMonth,
                              bidAmount: bid,
                              winnerMemberId: selectedMember!.id,
                              foremanCommission: 0.0,
                              winnerPaid: paidVal,
                              winnerBalance: prize,
                              winnerLeft: leftVal,
                              hijriDate: _getHijriDate(DateTime.now()),
                              winnerPaymentMode: finalMode,
                              winnerRemarks: remarks.isEmpty ? null : remarks,
                              exchangedToMemberId:
                                  isExchanged ? exchangedToMemberId : null,
                              exchangeNote: isExchanged
                                  ? exchangeNoteController.text.trim()
                                  : null,
                            );

                        if (!context.mounted) return;
                        Navigator.pop(context);
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                              content: TranslatedText(
                                  'Winner declared successfully!')),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primaryTeal,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16)),
                      ),
                      child: TranslatedText(
                        'Confirm Winner',
                        style: GoogleFonts.outfit(
                            fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    // We pass the argument as a record.
    final stateAsync = ref.watch(
        groupDetailProvider((groupId: widget.group.id, month: _selectedMonth)));

    return Scaffold(
      appBar: AppBar(
        title: TranslatedText('Group Details',
            style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit, color: AppTheme.primaryTeal),
            tooltip: 'Edit Group',
            onPressed: () {
              showModalBottomSheet(
                context: context,
                isScrollControlled: true,
                shape: const RoundedRectangleBorder(
                    borderRadius:
                        BorderRadius.vertical(top: Radius.circular(28))),
                builder: (ctx) => EditGroupSheet(
                  groupId: widget.group.id,
                  initialName: widget.group.name,
                  initialInstallment: widget.group.monthlyContribution,
                  initialTotalMembers: widget.group
                      .totalMonths, // Actually total members isn't stored separately, usually same as totalMonths or dynamically calculated. Wait, I will just pass widget.group.totalMonths
                  initialDuration: widget.group.totalMonths,
                  initialStartDate: widget.group.startDate,
                ),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.download_rounded, color: Colors.blueAccent),
            tooltip: 'Export Ledger (CSV)',
            onPressed: () {
              ref
                  .read(exportServiceProvider)
                  .exportGroupLedgerToCSV(widget.group);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: TranslatedText('Exporting ledger...')),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.notifications_active_rounded,
                color: Colors.orange),
            tooltip: 'Remind All Pending',
            onPressed: () {
              final pending = stateAsync.value?.pendingMembers ?? [];
              if (pending.isNotEmpty) {
                _showRemindAllSheet(pending);
              } else {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                      content: TranslatedText('No pending members to remind!')),
                );
              }
            },
          ),
        ],
      ),
      body: stateAsync.when(
        skipLoadingOnReload: true,
        skipLoadingOnRefresh: true,
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, st) => Center(child: TranslatedText('Error: $err')),
        data: (state) {
          // Dynamic slot calculations
          final totalSlots = state.members
              .fold<double>(0, (sum, m) => sum + m.installmentsCount);
          final currentChitValue = widget.group.monthlyContribution *
              totalSlots *
              widget.group.totalMonths;

          return ScrollArrowsOverlay(
            child: NestedScrollView(
              headerSliverBuilder: (_, __) => [
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // ── Group title card ─────────────────────────────
                          GlassCard(
                            padding: const EdgeInsets.all(20),
                            child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.spaceBetween,
                                      children: [
                                        Expanded(
                                          child: Text(widget.group.name,
                                              style: GoogleFonts.outfit(
                                                  fontSize: 22,
                                                  fontWeight: FontWeight.bold),
                                              overflow: TextOverflow.ellipsis),
                                        ),
                                        Container(
                                          padding: const EdgeInsets.symmetric(
                                              horizontal: 10, vertical: 4),
                                          decoration: BoxDecoration(
                                            color: AppTheme.primaryTeal
                                                .withValues(alpha: 0.12),
                                            borderRadius:
                                                BorderRadius.circular(20),
                                          ),
                                          child: TranslatedText(
                                              '${widget.group.totalMonths} mo',
                                              style: GoogleFonts.outfit(
                                                  color: AppTheme.primaryTeal,
                                                  fontWeight: FontWeight.bold,
                                                  fontSize: 12)),
                                        ),
                                      ]),
                                  const SizedBox(height: 14),
                                  Wrap(
                                    spacing: 16,
                                    runSpacing: 12,
                                    children: [
                                      _StatMini(
                                          label: 'Chit Value',
                                          value:
                                              '₹${currentChitValue.toStringAsFixed(0)}'),
                                      _StatMini(
                                          label: 'Installment',
                                          value:
                                              '₹${widget.group.monthlyContribution.toStringAsFixed(0)}'),
                                      _StatMini(
                                          label: 'Total Months',
                                          value:
                                              '${widget.group.totalMonths} Mos'),
                                      _StatMini(
                                          label: 'Months Left',
                                          value:
                                              '${(widget.group.totalMonths - state.winners.length) > 0 ? (widget.group.totalMonths - state.winners.length) : 0} Left'),
                                      _StatMini(
                                          label: 'Total Members',
                                          value: '${state.members.length}'),
                                    ],
                                  ),
                                  const SizedBox(height: 14),
                                  // Overall progress
                                  Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.spaceBetween,
                                      children: [
                                        TranslatedText('Overall Progress',
                                            style: GoogleFonts.outfit(
                                                fontSize: 12,
                                                color: Colors.grey)),
                                        TranslatedText(
                                            '${(state.overallProgress * 100).toStringAsFixed(1)}%',
                                            style: GoogleFonts.outfit(
                                                fontWeight: FontWeight.bold,
                                                color: AppTheme.primaryTeal)),
                                      ]),
                                  const SizedBox(height: 6),
                                  ClipRRect(
                                    borderRadius: BorderRadius.circular(8),
                                    child: LinearProgressIndicator(
                                      value: state.overallProgress,
                                      backgroundColor: isDark
                                          ? Colors.white12
                                          : Colors.grey[200],
                                      color: AppTheme.primaryTeal,
                                      minHeight: 7,
                                    ),
                                  ),
                                  const SizedBox(height: 6),
                                  Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.spaceBetween,
                                      children: [
                                        TranslatedText(
                                            '₹${state.overallCollected.toStringAsFixed(0)} collected',
                                            style: GoogleFonts.outfit(
                                                fontSize: 11,
                                                color: Colors.grey)),
                                        TranslatedText(
                                            'of ₹${state.overallExpected.toStringAsFixed(0)}',
                                            style: GoogleFonts.outfit(
                                                fontSize: 11,
                                                color: Colors.grey)),
                                      ]),
                                ]),
                          ),
                          const SizedBox(height: 16),

                          // ── Month selector ───────────────────────────────
                          GestureDetector(
                            onTap: _pickMonth,
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 16, vertical: 12),
                              decoration: BoxDecoration(
                                color: AppTheme.primaryTeal
                                    .withValues(alpha: 0.07),
                                borderRadius: BorderRadius.circular(14),
                                border: Border.all(
                                    color: AppTheme.primaryTeal
                                        .withValues(alpha: 0.3)),
                              ),
                              child: Row(children: [
                                Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: AppTheme.primaryTeal,
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: const Icon(
                                      Icons.calendar_month_rounded,
                                      color: Colors.white,
                                      size: 18),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                    child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                      TranslatedText('Viewing month',
                                          style: GoogleFonts.outfit(
                                              fontSize: 11,
                                              color: Colors.grey)),
                                      TranslatedText(_monthLabel,
                                          style: GoogleFonts.outfit(
                                              fontSize: 16,
                                              fontWeight: FontWeight.bold,
                                              color: isDark
                                                  ? Colors.white
                                                  : const Color(0xFF0F172A))),
                                    ])),
                                const Icon(Icons.edit_calendar_rounded,
                                    color: AppTheme.primaryTeal, size: 20),
                              ]),
                            ),
                          ),
                          const SizedBox(height: 16),

                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: isDark ? Colors.black12 : Colors.white,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                  color: AppTheme.primaryTeal
                                      .withValues(alpha: 0.2)),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.03),
                                  blurRadius: 10,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                            ),
                            child: Column(
                              children: [
                                Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    TranslatedText('Total Month Collection',
                                        style: GoogleFonts.outfit(
                                            fontSize: 14,
                                            color: Colors.grey[600],
                                            fontWeight: FontWeight.w500)),
                                    TranslatedText(
                                        '₹${state.monthExpected.toStringAsFixed(0)}',
                                        style: GoogleFonts.outfit(
                                            fontSize: 18,
                                            fontWeight: FontWeight.bold,
                                            color: AppTheme.primaryTeal)),
                                  ],
                                ),
                                Padding(
                                  padding:
                                      const EdgeInsets.symmetric(vertical: 12),
                                  child: Divider(
                                      height: 1,
                                      thickness: 1,
                                      color:
                                          Colors.grey.withValues(alpha: 0.2)),
                                ),
                                Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    TranslatedText('Received',
                                        style: GoogleFonts.outfit(
                                            fontSize: 13,
                                            color: Colors.grey[600])),
                                    TranslatedText(
                                        '₹${state.monthCollected.toStringAsFixed(0)}',
                                        style: GoogleFonts.outfit(
                                            fontSize: 15,
                                            fontWeight: FontWeight.bold,
                                            color: Colors.green)),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    TranslatedText('Balance',
                                        style: GoogleFonts.outfit(
                                            fontSize: 13,
                                            color: Colors.grey[600])),
                                    TranslatedText(
                                        '₹${state.monthPending.toStringAsFixed(0)}',
                                        style: GoogleFonts.outfit(
                                            fontSize: 15,
                                            fontWeight: FontWeight.bold,
                                            color: Colors.redAccent)),
                                  ],
                                ),
                              ],
                            ),
                          ),

                          const SizedBox(height: 16),

                          // ── Month summary stats row ───────────────────────
                          Row(children: [
                            Expanded(
                              child: _SummaryChip(
                                label: 'Paid',
                                count: state.paidMembers.length,
                                total: state.members.length,
                                amount: state.monthCollected,
                                color: Colors.green,
                                icon: Icons.check_circle_rounded,
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: _SummaryChip(
                                label: 'Pending',
                                count: state.pendingMembers.length,
                                total: state.members.length,
                                amount: state.monthPending,
                                color: Colors.redAccent,
                                icon: Icons.pending_actions_rounded,
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: _SummaryChip(
                                label: 'Progress',
                                count: (state.monthProgress * 100).round(),
                                total: 100,
                                amount: null,
                                color: AppTheme.primaryTeal,
                                icon: Icons.pie_chart_rounded,
                                isSuffix: true,
                              ),
                            ),
                          ]),
                        ]),
                  ),
                ),

                // ── Tab bar ──────────────────────────────────────────
                SliverPersistentHeader(
                  pinned: true,
                  delegate: _StickyTabBarDelegate(
                    TabBar(
                      controller: _tabController,
                      isScrollable: true,
                      tabAlignment: TabAlignment.start,
                      labelColor: AppTheme.primaryTeal,
                      unselectedLabelColor: Colors.grey,
                      indicatorColor: AppTheme.primaryTeal,
                      indicatorWeight: 3,
                      labelPadding: const EdgeInsets.symmetric(horizontal: 12),
                      labelStyle: GoogleFonts.outfit(
                          fontWeight: FontWeight.bold, fontSize: 13),
                      unselectedLabelStyle: GoogleFonts.outfit(fontSize: 13),
                      tabs: [
                        Tab(text: 'Members (${state.members.length})'),
                        Tab(text: 'Paid (${state.paidMembers.length})'),
                        Tab(text: 'Pending (${state.pendingMembers.length})'),
                        Tab(text: 'Winners (${state.winners.length})'),
                        Tab(
                            text:
                                'History (${state.paymentHistory.length + state.winners.length})'),
                      ],
                    ),
                    isDark: isDark,
                  ),
                ),
              ],
              body: TabBarView(
                controller: _tabController,
                children: [
                  // ── Tab 1: All members ──────────────────────────────
                  _MemberList(
                    members: state.members,
                    isPaidList: null,
                    monthLabel: _monthLabel,
                    selectedMonth: _selectedMonth,
                    groupId: widget.group.id,
                    groupName: widget.group.name,
                    installment: state.actualMonthlyContribution,
                    onToggle: _togglePayment,
                    emptyIcon: Icons.groups_outlined,
                    emptyMessage: 'No members in this group yet.',
                  ),

                  // ── Tab 2: Paid members ──────────────────────────────
                  _MemberList(
                    members: state.paidMembers,
                    isPaidList: true,
                    monthLabel: _monthLabel,
                    selectedMonth: _selectedMonth,
                    groupId: widget.group.id,
                    groupName: widget.group.name,
                    installment: state.actualMonthlyContribution,
                    onToggle: _togglePayment,
                    emptyIcon: Icons.check_circle_outline_rounded,
                    emptyMessage: 'No paid members yet for $_monthLabel',
                  ),

                  // ── Tab 3: Pending members ───────────────────────────
                  Column(
                    children: [
                      if (state.pendingMembers.isNotEmpty)
                        Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Row(
                            children: [
                              Expanded(
                                child: ElevatedButton.icon(
                                  onPressed: () async {
                                    final confirm =
                                        await DialogHelper.showConfirmation(
                                      context,
                                      title: 'Mark All Paid?',
                                      message:
                                          'This will mark all ${state.pendingMembers.length} pending members as paid for $_monthLabel.',
                                      confirmText: 'Confirm',
                                      cancelText: 'Cancel',
                                    );
                                    if (confirm) {
                                      await ref
                                          .read(groupDetailActionsProvider)
                                          .markAllPaid(
                                              widget.group.id, _selectedMonth);
                                      if (context.mounted) {
                                        ScaffoldMessenger.of(context)
                                            .showSnackBar(const SnackBar(
                                                content: TranslatedText(
                                                    'All members marked as paid!')));
                                      }
                                    }
                                  },
                                  icon: const Icon(Icons.done_all,
                                      color: Colors.white, size: 20),
                                  label: TranslatedText('Mark All Paid',
                                      style: GoogleFonts.outfit(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 13)),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AppTheme.primaryTeal,
                                    foregroundColor: Colors.white,
                                    minimumSize: const Size.fromHeight(48),
                                    shape: RoundedRectangleBorder(
                                        borderRadius:
                                            BorderRadius.circular(12)),
                                    padding: EdgeInsets.zero,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: ElevatedButton.icon(
                                  onPressed: () =>
                                      _showRemindAllSheet(state.pendingMembers),
                                  icon: const Icon(Icons.notifications_active,
                                      color: Colors.white, size: 20),
                                  label: TranslatedText('Remind All',
                                      style: GoogleFonts.outfit(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 13)),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.orange,
                                    foregroundColor: Colors.white,
                                    minimumSize: const Size.fromHeight(48),
                                    shape: RoundedRectangleBorder(
                                        borderRadius:
                                            BorderRadius.circular(12)),
                                    padding: EdgeInsets.zero,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      Expanded(
                        child: _MemberList(
                          members: state.pendingMembers,
                          isPaidList: false,
                          monthLabel: _monthLabel,
                          selectedMonth: _selectedMonth,
                          groupId: widget.group.id,
                          groupName: widget.group.name,
                          installment: state.actualMonthlyContribution,
                          onToggle: _togglePayment,
                          emptyIcon: Icons.sentiment_very_satisfied_rounded,
                          emptyMessage: 'All members paid for $_monthLabel! 🎉',
                        ),
                      ),
                    ],
                  ),

                  // ── Tab 4: Winners ───────────────────────────────────
                  Column(
                    children: [
                      Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: ElevatedButton.icon(
                          onPressed: () => _showDeclareWinnerSheet(state),
                          icon: const Icon(Icons.add, color: Colors.white),
                          label: TranslatedText(
                            'Declare Winner',
                            style:
                                GoogleFonts.outfit(fontWeight: FontWeight.bold),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.primaryTeal,
                            foregroundColor: Colors.white,
                            minimumSize: const Size.fromHeight(50),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                        ),
                      ),
                      Expanded(
                        child: state.winners.isEmpty
                            ? Center(
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(Icons.emoji_events_outlined,
                                        size: 56,
                                        color: Colors.amber
                                            .withValues(alpha: 0.5)),
                                    const SizedBox(height: 12),
                                    TranslatedText('No winners declared yet.',
                                        style: GoogleFonts.outfit(
                                            color: Colors.grey)),
                                  ],
                                ),
                              )
                            : ListView.builder(
                                physics: const ClampingScrollPhysics(),
                                padding:
                                    const EdgeInsets.fromLTRB(16, 12, 16, 24),
                                itemCount: state.winners.length,
                                itemBuilder: (ctx, i) {
                                  final win = state.winners[i];
                                  return Container(
                                    margin: const EdgeInsets.only(bottom: 10),
                                    child: GlassCard(
                                      padding: const EdgeInsets.all(16),
                                      child: Row(
                                        children: [
                                          Container(
                                            padding: const EdgeInsets.all(12),
                                            decoration: BoxDecoration(
                                              color: Colors.amber
                                                  .withValues(alpha: 0.1),
                                              shape: BoxShape.circle,
                                            ),
                                            child: const Icon(
                                                Icons.emoji_events,
                                                color: Colors.amber,
                                                size: 24),
                                          ),
                                          const SizedBox(width: 14),
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.start,
                                              children: [
                                                Row(
                                                  mainAxisAlignment:
                                                      MainAxisAlignment
                                                          .spaceBetween,
                                                  crossAxisAlignment:
                                                      CrossAxisAlignment.start,
                                                  children: [
                                                    Column(
                                                      crossAxisAlignment:
                                                          CrossAxisAlignment
                                                              .start,
                                                      children: [
                                                        TranslatedText(
                                                          'Round ${win.round.roundNumber}',
                                                          style: GoogleFonts
                                                              .outfit(
                                                            fontWeight:
                                                                FontWeight.bold,
                                                            fontSize: 16,
                                                          ),
                                                        ),
                                                        TranslatedText(
                                                          'Month: ${[
                                                            'January',
                                                            'February',
                                                            'March',
                                                            'April',
                                                            'May',
                                                            'June',
                                                            'July',
                                                            'August',
                                                            'September',
                                                            'October',
                                                            'November',
                                                            'December'
                                                          ][win.round.month - 1]} ${win.round.year}',
                                                          style: GoogleFonts
                                                              .outfit(
                                                            fontSize: 12,
                                                            color: Colors
                                                                .grey[600],
                                                            fontWeight:
                                                                FontWeight.w500,
                                                          ),
                                                        ),
                                                      ],
                                                    ),
                                                    Expanded(
                                                      child: Row(
                                                        mainAxisAlignment:
                                                            MainAxisAlignment
                                                                .end,
                                                        children: [
                                                          Flexible(
                                                            child: Row(
                                                              mainAxisSize:
                                                                  MainAxisSize
                                                                      .min,
                                                              children: [
                                                                TranslatedText(
                                                                  'Winner: ',
                                                                  style:
                                                                      GoogleFonts
                                                                          .outfit(
                                                                    fontWeight:
                                                                        FontWeight
                                                                            .bold,
                                                                    color: isDark
                                                                        ? Colors.grey[
                                                                            300]
                                                                        : Colors
                                                                            .grey[800],
                                                                  ),
                                                                ),
                                                                Flexible(
                                                                  child: Text(
                                                                    win.winner
                                                                        .name,
                                                                    style: GoogleFonts
                                                                        .outfit(
                                                                      fontWeight:
                                                                          FontWeight
                                                                              .bold,
                                                                      color: isDark
                                                                          ? Colors.grey[
                                                                              300]
                                                                          : Colors
                                                                              .grey[800],
                                                                    ),
                                                                    overflow:
                                                                        TextOverflow
                                                                            .ellipsis,
                                                                  ),
                                                                ),
                                                              ],
                                                            ),
                                                          ),
                                                          const SizedBox(
                                                              width: 4),
                                                          IconButton(
                                                            padding:
                                                                EdgeInsets.zero,
                                                            constraints:
                                                                const BoxConstraints(),
                                                            icon: const Icon(
                                                                Icons
                                                                    .delete_outline,
                                                                color: Colors
                                                                    .redAccent,
                                                                size: 20),
                                                            onPressed:
                                                                () async {
                                                              final confirm =
                                                                  await DialogHelper
                                                                      .showConfirmation(
                                                                context,
                                                                title:
                                                                    'Delete Winner?',
                                                                message:
                                                                    'Are you sure you want to remove the winner declaration for Round ${win.round.roundNumber}?',
                                                                confirmText:
                                                                    'Delete',
                                                                cancelText:
                                                                    'Cancel',
                                                              );
                                                              if (confirm) {
                                                                await ref
                                                                    .read(
                                                                        groupDetailActionsProvider)
                                                                    .deleteWinner(
                                                                        win.round
                                                                            .id);
                                                              }
                                                            },
                                                          ),
                                                        ],
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                                if (win.round.winnerRemarks !=
                                                        null &&
                                                    win.round.winnerRemarks!
                                                        .isNotEmpty) ...[
                                                  const SizedBox(height: 4),
                                                  TranslatedText(
                                                    'Remarks: ${win.round.winnerRemarks}',
                                                    style: GoogleFonts.outfit(
                                                      fontSize: 12,
                                                      color: Colors.grey[600],
                                                      fontStyle:
                                                          FontStyle.italic,
                                                    ),
                                                  ),
                                                ],
                                                const SizedBox(height: 8),
                                                Row(
                                                  mainAxisAlignment:
                                                      MainAxisAlignment
                                                          .spaceBetween,
                                                  crossAxisAlignment:
                                                      CrossAxisAlignment.end,
                                                  children: [
                                                    Column(
                                                      crossAxisAlignment:
                                                          CrossAxisAlignment
                                                              .start,
                                                      children: [
                                                        TranslatedText(
                                                          'Prize: ₹${win.round.winnerBalance?.toStringAsFixed(0) ?? '0'}',
                                                          style: GoogleFonts
                                                              .outfit(
                                                            fontSize: 12,
                                                            color: Colors.blue,
                                                            fontWeight:
                                                                FontWeight.w500,
                                                          ),
                                                        ),
                                                        if (win.round
                                                                .exchangedToMemberId !=
                                                            null) ...[
                                                          const SizedBox(
                                                              height: 2),
                                                          Builder(builder:
                                                              (context) {
                                                            String exName =
                                                                'Unknown';
                                                            for (var m in state
                                                                .members) {
                                                              if (m.member.id ==
                                                                  win.round
                                                                      .exchangedToMemberId) {
                                                                exName = m
                                                                    .member
                                                                    .name;
                                                                break;
                                                              }
                                                            }
                                                            return Row(
                                                              children: [
                                                                TranslatedText(
                                                                  '🏆 Prize paid to: ',
                                                                  style:
                                                                      GoogleFonts
                                                                          .outfit(
                                                                    fontSize:
                                                                        10,
                                                                    color: Colors
                                                                        .orange,
                                                                    fontWeight:
                                                                        FontWeight
                                                                            .w600,
                                                                  ),
                                                                ),
                                                                Flexible(
                                                                  child: Text(
                                                                    exName,
                                                                    style: GoogleFonts
                                                                        .outfit(
                                                                      fontSize:
                                                                          10,
                                                                      color: Colors
                                                                          .orange,
                                                                      fontWeight:
                                                                          FontWeight
                                                                              .w600,
                                                                    ),
                                                                    overflow:
                                                                        TextOverflow
                                                                            .ellipsis,
                                                                  ),
                                                                ),
                                                              ],
                                                            );
                                                          }),
                                                        ],
                                                        const SizedBox(
                                                            height: 4),
                                                        TranslatedText(
                                                          'Left (Pending): ₹${win.round.winnerLeft?.toStringAsFixed(0) ?? '0'}',
                                                          style: GoogleFonts
                                                              .outfit(
                                                            fontSize: 12,
                                                            color: Colors.red,
                                                            fontWeight:
                                                                FontWeight.w500,
                                                          ),
                                                        ),
                                                      ],
                                                    ),
                                                    Column(
                                                      crossAxisAlignment:
                                                          CrossAxisAlignment
                                                              .end,
                                                      children: [
                                                        TranslatedText(
                                                          'Paid: ₹${win.round.winnerPaid?.toStringAsFixed(0) ?? '0'}',
                                                          style: GoogleFonts
                                                              .outfit(
                                                            fontSize: 12,
                                                            color: Colors.green,
                                                            fontWeight:
                                                                FontWeight.w500,
                                                          ),
                                                        ),
                                                        if ((win.round
                                                                    .winnerPaid ??
                                                                0) >
                                                            0)
                                                          TranslatedText(
                                                            'Mode: ${win.round.winnerPaymentMode ?? 'Cash'}',
                                                            style: GoogleFonts
                                                                .outfit(
                                                              fontSize: 10,
                                                              color:
                                                                  Colors.grey,
                                                            ),
                                                          ),
                                                        if ((win.round
                                                                    .winnerLeft ??
                                                                0) >
                                                            0) ...[
                                                          const SizedBox(
                                                              height: 4),
                                                          TextButton.icon(
                                                            onPressed:
                                                                () async {
                                                              final amountController =
                                                                  TextEditingController(
                                                                      text: win
                                                                              .round
                                                                              .winnerLeft
                                                                              ?.toStringAsFixed(0) ??
                                                                          '0');
                                                              String
                                                                  selectedMode =
                                                                  'Cash';
                                                              DateTime
                                                                  selectedDate =
                                                                  DateTime
                                                                      .now();
                                                              final confirm =
                                                                  await showDialog<
                                                                      bool>(
                                                                context:
                                                                    context,
                                                                builder: (ctx) =>
                                                                    StatefulBuilder(
                                                                  builder: (ctx,
                                                                          setStateDialog) =>
                                                                      AlertDialog(
                                                                    title: TranslatedText(
                                                                        'Pay Winner',
                                                                        style: GoogleFonts.outfit(
                                                                            fontWeight:
                                                                                FontWeight.bold)),
                                                                    content: Builder(
                                                                        builder:
                                                                            (ctx2) {
                                                                      String payRecipientName = win
                                                                          .winner
                                                                          .name;
                                                                      if (win.round
                                                                              .exchangedToMemberId !=
                                                                          null) {
                                                                        for (final mem
                                                                            in state.members) {
                                                                          if (mem.member.id ==
                                                                              win.round.exchangedToMemberId) {
                                                                            payRecipientName =
                                                                                mem.member.name;
                                                                            break;
                                                                          }
                                                                        }
                                                                      }
                                                                      return SingleChildScrollView(
                                                                        child:
                                                                            Column(
                                                                          mainAxisSize:
                                                                              MainAxisSize.min,
                                                                          children: [
                                                                            TranslatedText('Enter amount to pay [#1]:', replacements: {
                                                                              '[#1]': payRecipientName
                                                                            }),
                                                                            const SizedBox(height: 12),
                                                                            TextField(
                                                                              controller: amountController,
                                                                              keyboardType: TextInputType.number,
                                                                              decoration: const InputDecoration(
                                                                                labelText: 'Amount (₹)',
                                                                                prefixText: '₹',
                                                                              ),
                                                                            ),
                                                                            const SizedBox(height: 12),
                                                                            DropdownButtonFormField<String>(
                                                                              initialValue: selectedMode,
                                                                              items: [
                                                                                'Cash',
                                                                                'UPI',
                                                                                'Bank Transfer'
                                                                              ].map((m) => DropdownMenuItem(value: m, child: Text(m))).toList(),
                                                                              onChanged: (val) {
                                                                                if (val != null) {
                                                                                  setStateDialog(() => selectedMode = val);
                                                                                }
                                                                              },
                                                                              decoration: const InputDecoration(
                                                                                labelText: 'Payment Mode',
                                                                              ),
                                                                            ),
                                                                            const SizedBox(height: 12),
                                                                            ListTile(
                                                                              contentPadding: EdgeInsets.zero,
                                                                              title: TranslatedText('Payout Date', style: GoogleFonts.outfit(fontSize: 14)),
                                                                              subtitle: Text('${selectedDate.day}/${selectedDate.month}/${selectedDate.year}', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
                                                                              trailing: const Icon(Icons.calendar_month, color: AppTheme.primaryTeal),
                                                                              onTap: () async {
                                                                                final picked = await showDatePicker(
                                                                                  context: ctx,
                                                                                  initialDate: selectedDate,
                                                                                  firstDate: DateTime(2000),
                                                                                  lastDate: DateTime(2100),
                                                                                );
                                                                                if (picked != null) {
                                                                                  setStateDialog(() => selectedDate = picked);
                                                                                }
                                                                              },
                                                                            ),
                                                                          ],
                                                                        ),
                                                                      );
                                                                    }),
                                                                    actions: [
                                                                      TextButton(
                                                                        onPressed: () => Navigator.pop(
                                                                            ctx,
                                                                            false),
                                                                        child: const TranslatedText(
                                                                            'Cancel'),
                                                                      ),
                                                                      ElevatedButton(
                                                                        style: ElevatedButton.styleFrom(
                                                                            backgroundColor:
                                                                                AppTheme.primaryTeal),
                                                                        onPressed: () => Navigator.pop(
                                                                            ctx,
                                                                            true),
                                                                        child: const TranslatedText(
                                                                            'Pay',
                                                                            style:
                                                                                TextStyle(color: Colors.white)),
                                                                      ),
                                                                    ],
                                                                  ),
                                                                ),
                                                              );

                                                              if (confirm ==
                                                                  true) {
                                                                final amount =
                                                                    double.tryParse(
                                                                            amountController.text) ??
                                                                        0.0;
                                                                if (amount >
                                                                    0) {
                                                                  final recipientId = win
                                                                          .round
                                                                          .exchangedToMemberId ??
                                                                      win.winner
                                                                          .id;
                                                                  String
                                                                      recipientName =
                                                                      win.winner
                                                                          .name;
                                                                  if (win.round
                                                                          .exchangedToMemberId !=
                                                                      null) {
                                                                    for (final m
                                                                        in state
                                                                            .members) {
                                                                      if (m.member
                                                                              .id ==
                                                                          win.round
                                                                              .exchangedToMemberId) {
                                                                        recipientName = m
                                                                            .member
                                                                            .name;
                                                                        break;
                                                                      }
                                                                    }
                                                                  }
                                                                  await ref
                                                                      .read(
                                                                          groupDetailActionsProvider)
                                                                      .payWinner(
                                                                        win.round
                                                                            .id,
                                                                        amount,
                                                                        paymentMode:
                                                                            selectedMode,
                                                                        recipientMemberId:
                                                                            recipientId,
                                                                        exchangeNote: win
                                                                            .round
                                                                            .exchangeNote,
                                                                        payoutDate:
                                                                            selectedDate,
                                                                      );
                                                                  if (context
                                                                      .mounted) {
                                                                    ScaffoldMessenger.of(
                                                                            context)
                                                                        .showSnackBar(
                                                                      SnackBar(
                                                                          content: TranslatedText(
                                                                              'Paid ₹${amount.toStringAsFixed(0)} to [#1]',
                                                                              replacements: {
                                                                            '[#1]':
                                                                                recipientName
                                                                          })),
                                                                    );
                                                                  }
                                                                }
                                                              }
                                                            },
                                                            icon: const Icon(
                                                                Icons.payment,
                                                                size: 16),
                                                            label:
                                                                const TranslatedText(
                                                                    'Pay'),
                                                            style: TextButton
                                                                .styleFrom(
                                                              padding:
                                                                  const EdgeInsets
                                                                      .symmetric(
                                                                      horizontal:
                                                                          8,
                                                                      vertical:
                                                                          0),
                                                              minimumSize:
                                                                  const Size(
                                                                      0, 32),
                                                              tapTargetSize:
                                                                  MaterialTapTargetSize
                                                                      .shrinkWrap,
                                                            ),
                                                          ),
                                                        ],
                                                      ],
                                                    ),
                                                  ],
                                                ),
                                              ],
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  );
                                },
                              ),
                      ),
                    ],
                  ),

                  // ── Tab 5: History ───────────────────────────────────
                  HistoryTab(state: state, groupId: widget.group.id),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

// ── Member list used for Members, Paid and Pending tabs ───────────────────────────

class _MemberList extends ConsumerWidget {
  final List<GroupMemberDetail> members;
  final bool? isPaidList;
  final String monthLabel;
  final DateTime selectedMonth;
  final int groupId;
  final String groupName;
  final double installment;
  final Future<void> Function(BuildContext, int, bool, GroupMemberDetail)
      onToggle;
  final IconData emptyIcon;
  final String emptyMessage;

  const _MemberList({
    required this.members,
    required this.isPaidList,
    required this.monthLabel,
    required this.selectedMonth,
    required this.groupId,
    required this.groupName,
    required this.installment,
    required this.onToggle,
    required this.emptyIcon,
    required this.emptyMessage,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    //final lang = ref.watch(settingsProvider).locale.languageCode;
    if (members.isEmpty) {
      return Center(
        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          Icon(emptyIcon,
              size: 56,
              color: (isPaidList ?? false)
                  ? Colors.green.withValues(alpha: 0.4)
                  : AppTheme.primaryTeal.withValues(alpha: 0.4)),
          const SizedBox(height: 12),
          TranslatedText(emptyMessage,
              textAlign: TextAlign.center,
              style: GoogleFonts.outfit(
                  color: Colors.grey, fontSize: 14, height: 1.5)),
        ]),
      );
    }

    int singleCount = members.where((m) => m.installmentsCount == 1.0).length;
    int multiCount = members.where((m) => m.installmentsCount != 1.0).length;

    return LayoutBuilder(builder: (ctx, constraints) {
      if (constraints.maxHeight < 50) return const SizedBox.shrink();
      return Column(
        children: [
          if (constraints.maxHeight >= 150)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              color: isDark ? Colors.black26 : Colors.grey[200],
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  TranslatedText('Total: ${members.length}',
                      style: GoogleFonts.outfit(
                          fontSize: 13, fontWeight: FontWeight.bold)),
                  TranslatedText('Single: $singleCount',
                      style: GoogleFonts.outfit(fontSize: 13)),
                  TranslatedText('Multiple (*): $multiCount',
                      style: GoogleFonts.outfit(fontSize: 13)),
                ],
              ),
            ),
          Expanded(
            child: ListView.builder(
              physics: const ClampingScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
              itemCount: members.length,
              itemBuilder: (ctx, i) {
                final md = members[i];
                final m = md.member;
                final isPaid = isPaidList ?? md.isPaidThisMonth;
                final initial = m.name.trim().isNotEmpty
                    ? m.name.trim()[0].toUpperCase()
                    : '?';

                final contentCard = GestureDetector(
                  onTap: () {
                    Navigator.push(
                      ctx,
                      MaterialPageRoute(
                        builder: (_) =>
                            AdvancedMemberProfileScreen(memberId: m.id),
                      ),
                    );
                  },
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    child: GlassCard(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 12),
                      child: Row(children: [
                        // Avatar
                        CircleAvatar(
                          radius: 22,
                          backgroundColor: isPaid
                              ? Colors.green.withValues(alpha: 0.12)
                              : Colors.redAccent.withValues(alpha: 0.10),
                          backgroundImage: m.photoPath != null
                              ? FileImage(File(m.photoPath!))
                              : null,
                          child: m.photoPath == null
                              ? TranslatedText(initial,
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                    color: isPaid
                                        ? Colors.green
                                        : Colors.redAccent,
                                  ))
                              : null,
                        ),
                        const SizedBox(width: 12),

                        // Info
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Name row — truncates cleanly on its own line
                              Row(
                                children: [
                                  Flexible(
                                    child: Text(
                                      m.name,
                                      style: GoogleFonts.outfit(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 15),
                                      overflow: TextOverflow.ellipsis,
                                      maxLines: 1,
                                    ),
                                  ),
                                  if (md.installmentsCount != 1.0) ...[
                                    const SizedBox(width: 4),
                                    const Icon(Icons.star,
                                        size: 14, color: Colors.amber),
                                  ],
                                  // Contact-picker edit button for placeholder members
                                  if (_isPlaceholderMember(m)) ...[
                                    const SizedBox(width: 4),
                                    GestureDetector(
                                      onTap: () =>
                                          _pickContactForMember(ctx, ref, m),
                                      child: Container(
                                        padding: const EdgeInsets.all(4),
                                        decoration: BoxDecoration(
                                          color: AppTheme.primaryTeal
                                              .withValues(alpha: 0.12),
                                          borderRadius:
                                              BorderRadius.circular(6),
                                          border: Border.all(
                                            color: AppTheme.primaryTeal
                                                .withValues(alpha: 0.35),
                                          ),
                                        ),
                                        child: const Icon(
                                          Icons.person_add_alt_1_rounded,
                                          size: 13,
                                          color: AppTheme.primaryTeal,
                                        ),
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                              // Badges row — separate line so they never squeeze the name
                              if (md.isPaidAndLeft ||
                                  md.isWinner ||
                                  md.isLateThisMonth) ...[
                                const SizedBox(height: 3),
                                Wrap(
                                  spacing: 4,
                                  runSpacing: 2,
                                  children: [
                                    if (md.isPaidAndLeft)
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                            horizontal: 6, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: Colors.amber
                                              .withValues(alpha: 0.15),
                                          borderRadius:
                                              BorderRadius.circular(6),
                                          border:
                                              Border.all(color: Colors.amber),
                                        ),
                                        child: TranslatedText(
                                          'Winner (Paid & Left)',
                                          style: GoogleFonts.outfit(
                                            fontSize: 9,
                                            fontWeight: FontWeight.bold,
                                            color: isDark
                                                ? Colors.amber[300]
                                                : Colors.amber[800],
                                          ),
                                        ),
                                      )
                                    else if (md.isWinner)
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                            horizontal: 6, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: Colors.amber
                                              .withValues(alpha: 0.1),
                                          borderRadius:
                                              BorderRadius.circular(6),
                                        ),
                                        child: TranslatedText(
                                          '🏆 Winner',
                                          style: GoogleFonts.outfit(
                                            fontSize: 9,
                                            fontWeight: FontWeight.bold,
                                            color: isDark
                                                ? Colors.amber[300]
                                                : Colors.amber[800],
                                          ),
                                        ),
                                      ),
                                    if (md.isLateThisMonth)
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                            horizontal: 6, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: Colors.redAccent
                                              .withValues(alpha: 0.1),
                                          borderRadius:
                                              BorderRadius.circular(6),
                                          border: Border.all(
                                              color: Colors.redAccent
                                                  .withValues(alpha: 0.5)),
                                        ),
                                        child: TranslatedText(
                                          'Late Payer',
                                          style: GoogleFonts.outfit(
                                            fontSize: 9,
                                            fontWeight: FontWeight.bold,
                                            color: Colors.redAccent,
                                          ),
                                        ),
                                      ),
                                  ],
                                ),
                              ],
                              TranslatedText(
                                _isPlaceholderMember(m)
                                    ? 'Tap 👤 to assign from contacts'
                                    : (m.phone.isEmpty ? 'No Phone' : m.phone),
                                style: GoogleFonts.outfit(
                                    fontSize: 12, color: Colors.grey),
                              ),
                              const SizedBox(height: 8),
                              // Lifetime Progress Bar
                              LayoutBuilder(builder: (ctx, constraints) {
                                final progress = md.lifetimeExpected > 0
                                    ? (md.totalPaid / md.lifetimeExpected)
                                        .clamp(0.0, 1.0)
                                    : 0.0;
                                return Row(
                                  children: [
                                    Expanded(
                                      child: ClipRRect(
                                        borderRadius: BorderRadius.circular(4),
                                        child: LinearProgressIndicator(
                                          value: progress,
                                          backgroundColor: Colors.grey
                                              .withValues(alpha: 0.2),
                                          valueColor:
                                              AlwaysStoppedAnimation<Color>(
                                            progress >= 1.0
                                                ? Colors.green
                                                : AppTheme.primaryTeal,
                                          ),
                                          minHeight: 4,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 6),
                                    Text(
                                        '${(progress * 100).toStringAsFixed(0)}%',
                                        style: GoogleFonts.outfit(
                                            fontSize: 10, color: Colors.grey)),
                                  ],
                                );
                              }),
                            ],
                          ),
                        ),

                        // Amount + installment counter + toggle
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            // Amount label (installmentsCount × base installment)
                            RichText(
                              text: TextSpan(
                                children: [
                                  if (md.installmentsCount != 1.0)
                                    TextSpan(
                                      text:
                                          '${md.installmentsCount == md.installmentsCount.toInt() ? md.installmentsCount.toInt() : md.installmentsCount} Slots - ',
                                      style: GoogleFonts.outfit(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 13,
                                        color: isDark
                                            ? Colors.grey[400]
                                            : Colors.grey[600],
                                      ),
                                    ),
                                  TextSpan(
                                    text:
                                        '₹${(installment * md.installmentsCount).toStringAsFixed(0)}',
                                    style: GoogleFonts.outfit(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 16,
                                      color: isPaid
                                          ? Colors.green
                                          : Colors.redAccent,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 4),
                            // +/- stepper and Delete icon
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                if (isPaidList == null)
                                  GestureDetector(
                                    onTap: () async {
                                      final confirm = await showDialog<bool>(
                                        context: ctx,
                                        builder: (context) => AlertDialog(
                                          title: TranslatedText('Remove Member',
                                              style: GoogleFonts.outfit(
                                                  fontWeight: FontWeight.bold)),
                                          content: TranslatedText(
                                              'Are you sure you want to delete ${m.name} from the app? Their payment records will be preserved in the history.'),
                                          actions: [
                                            TextButton(
                                              onPressed: () =>
                                                  Navigator.pop(context, false),
                                              child: TranslatedText('Cancel',
                                                  style: TextStyle(
                                                      color: isDark
                                                          ? Colors.grey[400]
                                                          : Colors.grey[700])),
                                            ),
                                            ElevatedButton(
                                              style: ElevatedButton.styleFrom(
                                                  backgroundColor:
                                                      Colors.redAccent),
                                              onPressed: () =>
                                                  Navigator.pop(context, true),
                                              child: const TranslatedText(
                                                  'Remove',
                                                  style: TextStyle(
                                                      color: Colors.white)),
                                            ),
                                          ],
                                        ),
                                      );
                                      if (confirm == true) {
                                        if (!ctx.mounted) return;
                                        final authCheck = await ref
                                            .read(authProvider.notifier)
                                            .authenticateForCriticalAction(ctx,
                                                'Authenticate to remove member');
                                        if (!ctx.mounted) return;
                                        if (!authCheck) {
                                          DialogHelper.showSnackBar(
                                            ctx,
                                            message:
                                                'Authentication failed. Action cancelled.',
                                            type: SnackBarType.warning,
                                          );
                                          return;
                                        }
                                        await ref.read(appDaoProvider).logAction(
                                            'Remove Member',
                                            '${m.name} from Group $groupId');
                                        await ref
                                            .read(groupDetailActionsProvider)
                                            .removeMember(m.id, groupId);
                                        if (ctx.mounted) {
                                          DialogHelper.showSnackBar(
                                            ctx,
                                            message:
                                                '${m.name} removed from group',
                                            type: SnackBarType.success,
                                            duration:
                                                const Duration(seconds: 4),
                                            action: SnackBarAction(
                                              label: 'Undo',
                                              textColor: Colors.white,
                                              onPressed: () {
                                                ref
                                                    .read(
                                                        groupDetailActionsProvider)
                                                    .undoRemoveMember();
                                              },
                                            ),
                                          );
                                        }
                                      }
                                    },
                                    child: Container(
                                      margin: const EdgeInsets.only(right: 6),
                                      padding: const EdgeInsets.all(5),
                                      decoration: BoxDecoration(
                                        color:
                                            Colors.red.withValues(alpha: 0.1),
                                        borderRadius: BorderRadius.circular(8),
                                        border: Border.all(
                                            color: Colors.red
                                                .withValues(alpha: 0.3)),
                                      ),
                                      child: const Icon(Icons.delete_outline,
                                          size: 14, color: Colors.red),
                                    ),
                                  ),
                                GestureDetector(
                                  onTap: () async {
                                    if (md.installmentsCount > 0.5) {
                                      final confirm = await showDialog<bool>(
                                        context: ctx,
                                        builder: (c) => AlertDialog(
                                          title: TranslatedText(
                                              'Surrender 0.5 Slot?',
                                              style: GoogleFonts.outfit(
                                                  fontWeight: FontWeight.bold)),
                                          content: TranslatedText(
                                              'Are you sure you want to surrender 0.5 slot for [#1]?\nTheir total slots will reduce from ${md.installmentsCount == md.installmentsCount.toInt() ? md.installmentsCount.toInt() : md.installmentsCount} to ${md.installmentsCount - 0.5}, and the group\'s total Chit Value will decrease accordingly.',
                                              replacements: {'[#1]': m.name}),
                                          actions: [
                                            TextButton(
                                              onPressed: () =>
                                                  Navigator.pop(c, false),
                                              child: const TranslatedText(
                                                  'Cancel'),
                                            ),
                                            ElevatedButton(
                                              style: ElevatedButton.styleFrom(
                                                  backgroundColor:
                                                      Colors.orange),
                                              onPressed: () =>
                                                  Navigator.pop(c, true),
                                              child: const TranslatedText(
                                                  'Surrender',
                                                  style: TextStyle(
                                                      color: Colors.white)),
                                            ),
                                          ],
                                        ),
                                      );
                                      if (confirm == true) {
                                        try {
                                          await ref
                                              .read(groupDetailActionsProvider)
                                              .updateInstallmentsCount(
                                                m.id,
                                                groupId,
                                                md.installmentsCount - 0.5,
                                                selectedMonth: selectedMonth,
                                              );
                                        } catch (e) {
                                          if (ctx.mounted) {
                                            DialogHelper.showSnackBar(
                                              ctx,
                                              message: e.toString().replaceAll(
                                                  'Exception: ', ''),
                                              type: SnackBarType.warning,
                                            );
                                          }
                                        }
                                      }
                                    }
                                  },
                                  child: Container(
                                    width: 30,
                                    height: 30,
                                    margin: const EdgeInsets.only(right: 6),
                                    decoration: BoxDecoration(
                                      color:
                                          Colors.grey.withValues(alpha: 0.15),
                                      borderRadius: BorderRadius.circular(8),
                                      border: Border.all(
                                          color: Colors.grey
                                              .withValues(alpha: 0.3)),
                                    ),
                                    child: const Icon(Icons.remove,
                                        size: 18, color: Colors.grey),
                                  ),
                                ),
                                Text(
                                    '${md.installmentsCount == md.installmentsCount.toInt() ? md.installmentsCount.toInt() : md.installmentsCount}',
                                    style: GoogleFonts.outfit(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 14)),
                                GestureDetector(
                                  onTap: () async {
                                    try {
                                      await ref
                                          .read(groupDetailActionsProvider)
                                          .updateInstallmentsCount(
                                            m.id,
                                            groupId,
                                            md.installmentsCount + 0.5,
                                            selectedMonth: selectedMonth,
                                          );
                                    } catch (e) {
                                      if (ctx.mounted) {
                                        DialogHelper.showSnackBar(
                                          ctx,
                                          message: e
                                              .toString()
                                              .replaceAll('Exception: ', ''),
                                          type: SnackBarType.warning,
                                        );
                                      }
                                    }
                                  },
                                  child: Container(
                                    width: 30,
                                    height: 30,
                                    margin: const EdgeInsets.only(left: 6),
                                    decoration: BoxDecoration(
                                      color:
                                          Colors.teal.withValues(alpha: 0.12),
                                      borderRadius: BorderRadius.circular(8),
                                      border: Border.all(
                                          color: Colors.teal
                                              .withValues(alpha: 0.4)),
                                    ),
                                    child: const Icon(Icons.add,
                                        size: 18, color: Colors.teal),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            // Reminder + Paid/Unpaid toggle row
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                if (!isPaid) ...[
                                  GestureDetector(
                                    onTap: () async {
                                      if (m.phone.isEmpty ||
                                          m.phone
                                              .replaceAll(RegExp(r'[^\d]'), '')
                                              .isEmpty) {
                                        DialogHelper.showSnackBar(
                                          context,
                                          message:
                                              'Cannot send WhatsApp: member has no phone number.',
                                          type: SnackBarType.warning,
                                        );
                                        return;
                                      }
                                      final chosenLang =
                                          await _selectReminderLanguage(
                                              context);
                                      if (chosenLang != null) {
                                        final dao = ref.read(appDaoProvider);
                                        final success = await CommunicationService()
                                            .launchConsolidatedWhatsAppReminder(
                                          dao: dao,
                                          member: m,
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
                                    },
                                    child: Container(
                                      margin: const EdgeInsets.only(right: 6),
                                      padding: const EdgeInsets.all(5),
                                      decoration: BoxDecoration(
                                        color: Colors.orange
                                            .withValues(alpha: 0.1),
                                        borderRadius: BorderRadius.circular(8),
                                        border: Border.all(
                                            color: Colors.orange
                                                .withValues(alpha: 0.3)),
                                      ),
                                      child: const Icon(
                                          Icons.notifications_active_rounded,
                                          size: 14,
                                          color: Colors.orange),
                                    ),
                                  ),
                                ],
                                GestureDetector(
                                  onTap: () => onToggle(ctx, m.id, isPaid, md),
                                  child: AnimatedContainer(
                                    duration: const Duration(milliseconds: 200),
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 10, vertical: 5),
                                    decoration: BoxDecoration(
                                      color: isPaid
                                          ? Colors.green.withValues(alpha: 0.1)
                                          : (md.monthPaid > 0
                                              ? Colors.orange
                                                  .withValues(alpha: 0.1)
                                              : Colors.redAccent
                                                  .withValues(alpha: 0.1)),
                                      borderRadius: BorderRadius.circular(10),
                                      border: Border.all(
                                        color: isPaid
                                            ? Colors.green
                                                .withValues(alpha: 0.4)
                                            : (md.monthPaid > 0
                                                ? Colors.orange
                                                    .withValues(alpha: 0.4)
                                                : Colors.redAccent
                                                    .withValues(alpha: 0.4)),
                                      ),
                                    ),
                                    child: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          if (md.monthPaid > 0 && !isPaid)
                                            SizedBox(
                                              width: 13,
                                              height: 13,
                                              child: CircularProgressIndicator(
                                                value: md.monthExpected > 0
                                                    ? md.monthPaid /
                                                        md.monthExpected
                                                    : 0.0,
                                                strokeWidth: 2,
                                                color: Colors.orange,
                                                backgroundColor: Colors.orange
                                                    .withValues(alpha: 0.3),
                                              ),
                                            )
                                          else
                                            Icon(
                                              isPaid
                                                  ? Icons.check_circle_rounded
                                                  : Icons
                                                      .radio_button_unchecked_rounded,
                                              size: 13,
                                              color: isPaid
                                                  ? Colors.green
                                                  : Colors.redAccent,
                                            ),
                                          const SizedBox(width: 4),
                                          TranslatedText(
                                            isPaid
                                                ? 'Paid'
                                                : (md.monthPaid > 0
                                                    ? 'Left: ₹${(md.monthExpected - md.monthPaid).toStringAsFixed(0)} (Paid: ₹${md.monthPaid.toStringAsFixed(0)})'
                                                    : 'Unpaid'),
                                            style: GoogleFonts.outfit(
                                              fontSize: 12,
                                              fontWeight: FontWeight.bold,
                                              color: isPaid
                                                  ? Colors.green
                                                  : (md.monthPaid > 0
                                                      ? Colors.orange
                                                      : Colors.redAccent),
                                            ),
                                          ),
                                        ]),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ]),
                    ),
                  ),
                );

                return Dismissible(
                  key: ValueKey('dismiss_${m.id}_$isPaid'),
                  direction: DismissDirection.horizontal,
                  background: Container(
                    alignment: Alignment.centerLeft,
                    padding: const EdgeInsets.only(left: 20),
                    color: Colors.redAccent,
                    child:
                        const Icon(Icons.delete_outline, color: Colors.white),
                  ),
                  secondaryBackground: Container(
                    alignment: Alignment.centerRight,
                    padding: const EdgeInsets.only(right: 20),
                    color: isPaid ? AppTheme.primaryTeal : Colors.green,
                    child: Icon(isPaid ? Icons.receipt_long : Icons.message,
                        color: Colors.white),
                  ),
                  confirmDismiss: (direction) async {
                    if (direction == DismissDirection.startToEnd) {
                      // Delete Member
                      final confirm = await showDialog<bool>(
                        context: context,
                        builder: (dialogCtx) => AlertDialog(
                          title: TranslatedText('Remove Member',
                              style: GoogleFonts.outfit(
                                  fontWeight: FontWeight.bold)),
                          content: TranslatedText(
                              'Are you sure you want to delete ${m.name} from the app? Their payment records will be preserved in the history.'),
                          actions: [
                            TextButton(
                              onPressed: () => Navigator.pop(dialogCtx, false),
                              child: TranslatedText('Cancel',
                                  style: TextStyle(
                                      color: isDark
                                          ? Colors.grey[400]
                                          : Colors.grey[700])),
                            ),
                            ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.redAccent),
                              onPressed: () => Navigator.pop(dialogCtx, true),
                              child: const TranslatedText('Remove',
                                  style: TextStyle(color: Colors.white)),
                            ),
                          ],
                        ),
                      );

                      if (confirm == true) {
                        if (!context.mounted) return false;
                        final authCheck = await ref
                            .read(authProvider.notifier)
                            .authenticateForCriticalAction(
                                context, 'Authenticate to remove member');
                        if (!context.mounted) return false;
                        if (!authCheck) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                                content: Text(
                                    'Authentication failed. Action cancelled.')),
                          );
                          return false;
                        }

                        try {
                          await ref.read(appDaoProvider).logAction(
                              'Remove Member', '${m.name} from Group $groupId');
                          await ref
                              .read(groupDetailActionsProvider)
                              .removeMember(m.id, groupId);
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                  content: TranslatedText(
                                      '[#1] removed from group',
                                      replacements: {'[#1]': m.name})),
                            );
                          }
                        } catch (e) {
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                  content: Text('Failed to remove member: $e')),
                            );
                          }
                        }
                      }
                      return false; // Always return false so we don't dismiss out of tree (rebuilding handles removal)
                    } else {
                      // WhatsApp functionality (endToStart)
                      // Check if phone number is empty before showing dialog
                      if (m.phone.isEmpty ||
                          m.phone.replaceAll(RegExp(r'[^\d]'), '').isEmpty) {
                        DialogHelper.showSnackBar(
                          context,
                          message:
                              'Cannot send WhatsApp: member has no phone number.',
                          type: SnackBarType.warning,
                        );
                        return false;
                      }

                      // De-block the gesture callback by calling dialog/launch asynchronously after the slide-back completes.
                      Future.delayed(const Duration(milliseconds: 300),
                          () async {
                        if (!context.mounted) return;
                        final chosenLang =
                            await LanguageSelectionDialog.show(context);
                        if (chosenLang != null) {
                          if (isPaid) {
                            final success = await CommunicationService()
                                .launchWhatsAppPaymentReceipt(
                              dao: ref.read(appDaoProvider),
                              groupId: groupId,
                              memberId: m.id,
                              monthYear: monthLabel,
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
                          } else {
                            final dao = ref.read(appDaoProvider);
                            final success = await CommunicationService()
                                .launchConsolidatedWhatsAppReminder(
                              dao: dao,
                              member: m,
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
                        }
                      });
                      return false; // Don't actually dismiss the item
                    }
                  },
                  child: contentCard,
                );
              },
            ),
          ),
        ],
      );
    });
  }

  /// Returns true if the member is an auto-generated placeholder
  /// (e.g. "Member 1", "Member 2") or has the default filler phone.
  static bool _isPlaceholderMember(Member m) {
    final isDefaultName =
        RegExp(r'^Member\s+\d+$', caseSensitive: false).hasMatch(m.name.trim());
    final isDefaultPhone =
        m.phone == '0000000000' || m.phone.replaceAll('0', '').isEmpty;
    return isDefaultName || isDefaultPhone;
  }

  /// Opens a searchable contact picker and replaces the placeholder member's
  /// name and phone with the selected contact's details.
  static Future<void> _pickContactForMember(
    BuildContext ctx,
    WidgetRef ref,
    Member m,
  ) async {
    // Request contacts permission
    final status =
        await FlutterContacts.permissions.request(PermissionType.read);
    if (status != PermissionStatus.granted) {
      if (ctx.mounted) {
        ScaffoldMessenger.of(ctx).showSnackBar(
          const SnackBar(
              content: Text('Contacts permission required to pick a member.')),
        );
      }
      return;
    }

    final contacts = await FlutterContacts.getAll(
      properties: ContactProperties.allProperties,
    );
    if (!ctx.mounted || contacts.isEmpty) return;

    // Show the same searchable picker used in AddGroupSheet
    final selected = await showDialog<Contact>(
      context: ctx,
      builder: (_) => _SingleContactPickerDialog(contacts: contacts),
    );

    if (selected == null) return;

    final name = (selected.displayName ?? '').trim();
    var phone = selected.phones.isNotEmpty
        ? selected.phones.first.number.replaceAll(RegExp(r'[^0-9+]'), '')
        : '';
    if (phone.length < 10) phone = phone.padRight(10, '0');
    if (phone.length > 15) phone = phone.substring(0, 15);
    if (name.isEmpty) return;

    final dao = ref.read(appDaoProvider);
    await dao.updateMember(MembersCompanion(
      id: drift.Value(m.id),
      name: drift.Value(name),
      phone: drift.Value(phone),
      whatsapp: drift.Value(phone),
    ));
    ref.invalidate(groupDetailProvider);

    if (ctx.mounted) {
      ScaffoldMessenger.of(ctx).showSnackBar(
        SnackBar(
          content: Text('Member updated to $name'),
          backgroundColor: AppTheme.primaryTeal,
        ),
      );
    }
  }
}

// ── Small stat widgets ────────────────────────────────────────────────────────

class _StatMini extends StatelessWidget {
  final String label;
  final String value;
  const _StatMini({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      TranslatedText(label,
          style: GoogleFonts.outfit(fontSize: 11, color: Colors.grey)),
      TranslatedText(value,
          style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.bold)),
    ]);
  }
}

class _SummaryChip extends StatelessWidget {
  final String label;
  final int count;
  final int total;
  final double? amount;
  final Color color;
  final IconData icon;
  final bool isSuffix;

  const _SummaryChip({
    required this.label,
    required this.count,
    required this.total,
    required this.amount,
    required this.color,
    required this.icon,
    this.isSuffix = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 10),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withValues(alpha: 0.2)),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 4),
          TranslatedText(label,
              style: GoogleFonts.outfit(
                  fontSize: 11, color: color, fontWeight: FontWeight.w600)),
        ]),
        const SizedBox(height: 4),
        TranslatedText(
          isSuffix ? '$count%' : '$count/$total',
          style: GoogleFonts.outfit(
              fontSize: 18, fontWeight: FontWeight.bold, color: color),
        ),
        if (amount != null)
          TranslatedText('₹${amount!.toStringAsFixed(0)}',
              style: GoogleFonts.outfit(fontSize: 11, color: Colors.grey)),
      ]),
    );
  }
}

// ── Sticky tab bar delegate ───────────────────────────────────────────────────

class _StickyTabBarDelegate extends SliverPersistentHeaderDelegate {
  final TabBar tabBar;
  final bool isDark;
  const _StickyTabBarDelegate(this.tabBar, {required this.isDark});

  @override
  double get minExtent => tabBar.preferredSize.height;
  @override
  double get maxExtent => tabBar.preferredSize.height;

  @override
  Widget build(
      BuildContext context, double shrinkOffset, bool overlapsContent) {
    return Container(
      color: isDark ? const Color(0xFF0F0F1A) : Colors.white,
      child: tabBar,
    );
  }

  @override
  bool shouldRebuild(_StickyTabBarDelegate old) =>
      old.tabBar != tabBar || old.isDark != isDark;
}

// ── Single contact picker dialog (for replacing placeholder members) ───────────

class _SingleContactPickerDialog extends StatefulWidget {
  final List<Contact> contacts;
  const _SingleContactPickerDialog({required this.contacts});

  @override
  State<_SingleContactPickerDialog> createState() =>
      _SingleContactPickerDialogState();
}

class _SingleContactPickerDialogState
    extends State<_SingleContactPickerDialog> {
  String _query = '';

  List<Contact> get _filtered => widget.contacts
      .where((c) =>
          (c.displayName ?? '').toLowerCase().contains(_query.toLowerCase()))
      .toList();

  @override
  Widget build(BuildContext context) {
    return Dialog(
      insetPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 40),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              autofocus: true,
              onChanged: (v) => setState(() => _query = v),
              decoration: InputDecoration(
                hintText: 'Search contacts...',
                prefixIcon: const Icon(Icons.search),
                border:
                    OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              ),
            ),
          ),
          Expanded(
            child: _filtered.isEmpty
                ? const Center(child: Text('No contacts found'))
                : ListView.builder(
                    physics: const ClampingScrollPhysics(),
                    itemCount: _filtered.length,
                    itemBuilder: (_, i) {
                      final c = _filtered[i];
                      final phone =
                          c.phones.isNotEmpty ? c.phones.first.number : '';
                      return ListTile(
                        leading: CircleAvatar(
                          backgroundColor:
                              AppTheme.primaryTeal.withValues(alpha: 0.15),
                          child: Text(
                            (c.displayName ?? '?')[0].toUpperCase(),
                            style: const TextStyle(
                                color: AppTheme.primaryTeal,
                                fontWeight: FontWeight.bold),
                          ),
                        ),
                        title: Text(c.displayName ?? 'Unknown'),
                        subtitle: phone.isNotEmpty ? Text(phone) : null,
                        onTap: () => Navigator.pop(context, c),
                      );
                    },
                  ),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          const SizedBox(height: 8),
        ],
      ),
    );
  }
}

// ── Full Payment Entry Sheet ───────────────────────────────────────────────────

class _PaymentEntrySheet extends StatefulWidget {
  final String memberName;
  final String groupName;
  final double expectedAmount;
  final DateTime selectedMonth;
  final bool isWinner;

  const _PaymentEntrySheet({
    required this.memberName,
    required this.groupName,
    required this.expectedAmount,
    required this.selectedMonth,
    this.isWinner = false,
  });

  @override
  State<_PaymentEntrySheet> createState() => _PaymentEntrySheetState();
}

class _PaymentEntrySheetState extends State<_PaymentEntrySheet> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _amountCtrl;
  late TextEditingController _remarksCtrl;
  late TextEditingController _collectorCtrl;
  late TextEditingController _splitAmt1Ctrl;
  late TextEditingController _splitAmt2Ctrl;
  String _mode = 'Cash';
  bool _isSplitMode = false;
  String _mode1 = 'Cash';
  String _mode2 = 'UPI';
  DateTime _paymentDate = DateTime.now();
  bool _isPrizePayout = false;

  static const _modes = ['Cash', 'UPI', 'Bank Transfer', 'Cheque'];
  static const _modeIcons = <String, IconData>{
    'Cash': Icons.money_rounded,
    'UPI': Icons.qr_code_scanner_rounded,
    'Bank Transfer': Icons.account_balance_rounded,
    'Cheque': Icons.receipt_long_rounded,
  };

  @override
  void initState() {
    super.initState();
    _amountCtrl = TextEditingController(
      text: widget.expectedAmount.toStringAsFixed(0),
    );
    _remarksCtrl = TextEditingController();
    _collectorCtrl = TextEditingController();
    _splitAmt1Ctrl = TextEditingController();
    _splitAmt2Ctrl = TextEditingController();
  }

  @override
  void dispose() {
    _amountCtrl.dispose();
    _remarksCtrl.dispose();
    _collectorCtrl.dispose();
    _splitAmt1Ctrl.dispose();
    _splitAmt2Ctrl.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _paymentDate,
      firstDate:
          DateTime(widget.selectedMonth.year, widget.selectedMonth.month, 1),
      lastDate: DateTime.now(),
    );
    if (picked != null) {
      setState(() => _paymentDate = DateTime(
            picked.year,
            picked.month,
            picked.day,
            _paymentDate.hour,
            _paymentDate.minute,
          ));
    }
  }

  void _submit() async {
    if (!_formKey.currentState!.validate()) return;
    HapticFeedback.lightImpact();
    final amount =
        double.tryParse(_amountCtrl.text.trim()) ?? widget.expectedAmount;

    String finalMode = _mode;
    if (_isSplitMode) {
      final a1 = _splitAmt1Ctrl.text.trim();
      final a2 = _splitAmt2Ctrl.text.trim();
      finalMode = '$_mode1 (₹$a1) + $_mode2 (₹$a2)';
    }

    bool splitExcess = false;
    if (amount > widget.expectedAmount) {
      final extra = amount - widget.expectedAmount;
      final choice = await showDialog<String>(
        context: context,
        builder: (c) => AlertDialog(
          title: const TranslatedText('Extra Amount Entered'),
          content: TranslatedText(
              'You entered ₹${amount.toStringAsFixed(0)}, which is ₹${extra.toStringAsFixed(0)} more than the expected ₹${widget.expectedAmount.toStringAsFixed(0)}.\n\nWould you like to add this extra amount to the next month\'s payment, or re-enter the amount?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(c, 'reenter'),
              child: const TranslatedText('Re-enter Amount'),
            ),
            ElevatedButton(
              onPressed: () => Navigator.pop(c, 'next_month'),
              child: const TranslatedText('Add to Next Month'),
            ),
          ],
        ),
      );

      if (choice == null || choice == 'reenter') {
        return; // Stay on the form
      }
      if (choice == 'next_month') {
        splitExcess = true;
      }
    }

    if (mounted) {
      Navigator.pop(context, {
        'amount': amount,
        'mode': finalMode,
        'date': _paymentDate,
        'remarks':
            _remarksCtrl.text.trim().isEmpty ? null : _remarksCtrl.text.trim(),
        'collector': _collectorCtrl.text.trim().isEmpty
            ? null
            : _collectorCtrl.text.trim(),
        'splitExcess': splitExcess,
        'isPrizePayout': _isPrizePayout,
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final fmt = '${_paymentDate.day.toString().padLeft(2, '0')}/'
        '${_paymentDate.month.toString().padLeft(2, '0')}/'
        '${_paymentDate.year}  '
        '${_paymentDate.hour.toString().padLeft(2, '0')}:'
        '${_paymentDate.minute.toString().padLeft(2, '0')}';

    return Padding(
      padding:
          EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: Container(
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1E293B) : Colors.white,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
        ),
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 28),
        child: Form(
          key: _formKey,
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                // Handle bar
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

                // Title
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppTheme.primaryTeal.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.payments_rounded,
                          color: AppTheme.primaryTeal, size: 20),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Record Payment',
                            style: GoogleFonts.outfit(
                                fontWeight: FontWeight.bold, fontSize: 17),
                          ),
                          Text(
                            '${widget.memberName} • ${widget.groupName}',
                            style: GoogleFonts.outfit(
                                fontSize: 12, color: Colors.grey),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                if (widget.isWinner) ...[
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.purple.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                          color: Colors.purple.withValues(alpha: 0.2)),
                    ),
                    margin: const EdgeInsets.only(bottom: 16),
                    child: Material(
                      color: Colors.transparent,
                      child: SwitchListTile(
                        title: Text(
                          'Pay Prize to Winner?',
                          style: GoogleFonts.outfit(
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                              color: Colors.purple.shade700),
                        ),
                        subtitle: Text(
                          'Toggle if this is a prize payout rather than a monthly due',
                          style: GoogleFonts.outfit(
                              fontSize: 12, color: Colors.purple.shade600),
                        ),
                        value: _isPrizePayout,
                        activeTrackColor: Colors.purple.withValues(alpha: 0.5),
                        activeThumbColor: Colors.purple,
                        onChanged: (val) {
                          setState(() => _isPrizePayout = val);
                        },
                      ),
                    ),
                  ),
                ],
                const SizedBox(height: 20),

                // Amount
                TextFormField(
                  controller: _amountCtrl,
                  keyboardType:
                      const TextInputType.numberWithOptions(decimal: true),
                  decoration: InputDecoration(
                    labelText: 'Amount (₹)',
                    prefixIcon: const Icon(Icons.currency_rupee_rounded,
                        color: AppTheme.primaryTeal),
                    helperText:
                        'Expected: ₹${widget.expectedAmount.toStringAsFixed(0)}',
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14)),
                  ),
                  validator: (v) {
                    if (v == null || v.trim().isEmpty) return 'Enter amount';
                    if ((double.tryParse(v) ?? 0) <= 0)
                      return 'Enter a valid amount';
                    return null;
                  },
                ),
                const SizedBox(height: 16),

                // Payment Mode chips & Split Mode Toggle
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Payment Mode',
                        style: GoogleFonts.outfit(
                            fontWeight: FontWeight.w600, fontSize: 13)),
                    Row(
                      children: [
                        Text('Split 2 Modes',
                            style: GoogleFonts.outfit(
                                fontSize: 11, color: Colors.grey[600])),
                        Switch(
                          value: _isSplitMode,
                          activeThumbColor: AppTheme.primaryTeal,
                          onChanged: (v) => setState(() => _isSplitMode = v),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                if (!_isSplitMode) ...[
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: _modes.map((m) {
                      final selected = _mode == m;
                      return GestureDetector(
                        onTap: () => setState(() => _mode = m),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 180),
                          padding: const EdgeInsets.symmetric(
                              horizontal: 12, vertical: 8),
                          decoration: BoxDecoration(
                            color: selected
                                ? AppTheme.primaryTeal
                                : AppTheme.primaryTeal.withValues(alpha: 0.08),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: selected
                                  ? AppTheme.primaryTeal
                                  : Colors.transparent,
                            ),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                _modeIcons[m] ?? Icons.payment_rounded,
                                size: 16,
                                color: selected
                                    ? Colors.white
                                    : AppTheme.primaryTeal,
                              ),
                              const SizedBox(width: 6),
                              Text(
                                m,
                                style: GoogleFonts.outfit(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: selected
                                      ? Colors.white
                                      : AppTheme.primaryTeal,
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ] else ...[
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppTheme.primaryTeal.withValues(alpha: 0.06),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                          color: AppTheme.primaryTeal.withValues(alpha: 0.2)),
                    ),
                    child: Column(
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: DropdownButtonFormField<String>(
                                decoration:
                                    const InputDecoration(labelText: 'Mode 1'),
                                initialValue: _mode1,
                                items: _modes
                                    .map((m) => DropdownMenuItem(
                                        value: m, child: Text(m)))
                                    .toList(),
                                onChanged: (v) => setState(() => _mode1 = v!),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: TextFormField(
                                controller: _splitAmt1Ctrl,
                                keyboardType: TextInputType.number,
                                decoration: const InputDecoration(
                                    labelText: 'Amount 1 (₹)', prefixText: '₹'),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Expanded(
                              child: DropdownButtonFormField<String>(
                                decoration:
                                    const InputDecoration(labelText: 'Mode 2'),
                                initialValue: _mode2,
                                items: _modes
                                    .map((m) => DropdownMenuItem(
                                        value: m, child: Text(m)))
                                    .toList(),
                                onChanged: (v) => setState(() => _mode2 = v!),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: TextFormField(
                                controller: _splitAmt2Ctrl,
                                keyboardType: TextInputType.number,
                                decoration: const InputDecoration(
                                    labelText: 'Amount 2 (₹)', prefixText: '₹'),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
                const SizedBox(height: 16),

                // Date & time
                GestureDetector(
                  onTap: _pickDate,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 14),
                    decoration: BoxDecoration(
                      border:
                          Border.all(color: Colors.grey.withValues(alpha: 0.4)),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.calendar_today_rounded,
                            color: AppTheme.primaryTeal, size: 18),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            'Payment Date: $fmt',
                            style: GoogleFonts.outfit(fontSize: 13),
                          ),
                        ),
                        const Icon(Icons.edit_calendar_rounded,
                            size: 16, color: Colors.grey),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Remarks (optional)
                TextFormField(
                  controller: _remarksCtrl,
                  decoration: InputDecoration(
                    labelText: 'Remarks (optional)',
                    prefixIcon:
                        const Icon(Icons.note_alt_rounded, color: Colors.grey),
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14)),
                  ),
                ),
                const SizedBox(height: 12),

                // Collector name (optional)
                TextFormField(
                  controller: _collectorCtrl,
                  decoration: InputDecoration(
                    labelText: 'Collected By (optional)',
                    prefixIcon: const Icon(Icons.person_outline_rounded,
                        color: Colors.grey),
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14)),
                  ),
                ),
                const SizedBox(height: 24),

                // Submit
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: _submit,
                    icon: const Icon(Icons.check_circle_rounded,
                        color: Colors.white),
                    label: Text(
                      'Mark as Paid',
                      style: GoogleFonts.outfit(
                          fontWeight: FontWeight.bold,
                          fontSize: 15,
                          color: Colors.white),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primaryTeal,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16)),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

Future<String?> _selectReminderLanguage(BuildContext context) async {
  return showDialog<String>(
    context: context,
    builder: (ctx) => AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      title: TranslatedText('Select Language for Reminder',
          style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          ListTile(
            leading: const Text('🇬🇧', style: TextStyle(fontSize: 22)),
            title: const Text('English'),
            onTap: () => Navigator.pop(ctx, 'en'),
          ),
          ListTile(
            leading: const Text('🇵🇰', style: TextStyle(fontSize: 22)),
            title: const Text('اردو (Urdu)'),
            onTap: () => Navigator.pop(ctx, 'ur'),
          ),
          ListTile(
            leading: const Text('🇮🇳', style: TextStyle(fontSize: 22)),
            title: const Text('हिंदी (Hindi)'),
            onTap: () => Navigator.pop(ctx, 'hi'),
          ),
          ListTile(
            leading: const Text('🇮🇳', style: TextStyle(fontSize: 22)),
            title: const Text('తెలుగు (Telugu)'),
            onTap: () => Navigator.pop(ctx, 'te'),
          ),
        ],
      ),
    ),
  );
}
