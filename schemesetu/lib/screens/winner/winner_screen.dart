import 'package:chit_fund_app/utils/theme.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:table_calendar/table_calendar.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:chit_fund_app/widgets/translated_text.dart';
import '../../widgets/scroll_arrows_overlay.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import '../../data/local/app_database.dart';
import '../../localization/app_localizations.dart';
import '../../widgets/index.dart';
import 'winner_view_model.dart';
import '../../services/communication_service.dart';
import '../../widgets/language_selection_dialog.dart';

class WinnerScreen extends ConsumerStatefulWidget {
  const WinnerScreen({super.key});

  @override
  ConsumerState<WinnerScreen> createState() => _WinnerScreenState();
}

class _WinnerScreenState extends ConsumerState<WinnerScreen> {
  final _formKey = GlobalKey<FormState>();
  final _bidController = TextEditingController();
  final _remarksController = TextEditingController();
  final _paidController = TextEditingController();
  final _exchangeNoteController = TextEditingController();
  final _splitAmt1Controller = TextEditingController();
  final _splitAmt2Controller = TextEditingController();

  final stt.SpeechToText _speech = stt.SpeechToText();

  int? _selectedGroupId;
  int? _selectedMemberId;
  int? _exchangedToMemberId;
  late DateTime _selectedDate;
  CalendarFormat _calendarFormat = CalendarFormat.month;
  bool _isListening = false;
  bool _isExchanged = false;
  bool _isSplitPayment = false;

  String _paymentMode1 = 'Cash';
  String _paymentMode2 = 'UPI';

  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _selectedDate = DateTime.now();
  }

  @override
  void dispose() {
    _bidController.dispose();
    _remarksController.dispose();
    _paidController.dispose();
    _exchangeNoteController.dispose();
    _splitAmt1Controller.dispose();
    _splitAmt2Controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _listenVoiceRemarks(StateSetter setSheetState) async {
    if (!_isListening) {
      bool available = false;
      try {
        available = await _speech.initialize(
          onStatus: (status) {
            if (status == 'done' || status == 'notListening') {
              if (mounted) {
                setSheetState(() => _isListening = false);
              }
            }
          },
          onError: (errorNotification) {
            if (mounted) {
              setSheetState(() => _isListening = false);
            }
          },
        );
      } catch (e) {
        debugPrint('Speech initialization failed: $e');
      }

      if (available) {
        setSheetState(() => _isListening = true);
        _speech.listen(
          onResult: (val) {
            setSheetState(() {
              _remarksController.text = val.recognizedWords;
            });
          },
        );
      } else {
        if (mounted) {
          DialogHelper.showSnackBar(
            context,
            message: 'Speech recognition is not available on this device.',
            type: SnackBarType.warning,
          );
        }
      }
    } else {
      setSheetState(() => _isListening = false);
      _speech.stop();
    }
  }

  void _submitWinner({
    required WinnerState stateData,
    required String paymentMode,
    required String remarks,
    required double winnerPaid,
    required double winnerBalance,
    required double winnerLeft,
    int? exchangedToMemberId,
    String? exchangeNote,
  }) async {
    if (!_formKey.currentState!.validate() ||
        _selectedGroupId == null ||
        _selectedMemberId == null) {
      DialogHelper.showSnackBar(
        context,
        message: 'Please fill all required fields to declare a winner.',
        type: SnackBarType.warning,
      );
      return;
    }

    final months = [
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
    final declaredMonthText =
        '${months[_selectedDate.month - 1]} ${_selectedDate.year}';

    String exchangeDetailsText = '';
    if (exchangedToMemberId != null) {
      // Safe lookup: search across winners list and also group members list
      final allWinnerMembers = stateData.winners
          .expand((w) =>
              [w.winner, if (w.exchangedMember != null) w.exchangedMember!])
          .toList();
      final exchangedName = allWinnerMembers
              .where((m) => m.id == exchangedToMemberId)
              .map((m) => m.name)
              .firstOrNull ??
          'Member #$exchangedToMemberId';
      exchangeDetailsText =
          '\n\n🔄 PRIZE EXCHANGED:\n- New Winner (Money Recipient): $exchangedName\n- Exchange Note: ${exchangeNote ?? "N/A"}';
    }

    final confirmed = await DialogHelper.showConfirmation(
      context,
      title: 'Declare Winner for $declaredMonthText',
      message:
          'Winner is decided per month.\n\nWinning Month: $declaredMonthText\n\nPrize Amount: ₹${winnerBalance.toStringAsFixed(0)}${_bidController.text.trim().isNotEmpty && (_bidController.text.trim() != "0") ? "\n\nBid/Dividend Deduction: ₹${_bidController.text.trim()}" : ""}\n\nAmount Paid Now: ₹${winnerPaid.toStringAsFixed(0)}\n\nBalance Left to Pay: ₹${winnerLeft.toStringAsFixed(0)}\n\nPayment Mode: $paymentMode$exchangeDetailsText\n\nConfirm declaration?',
      confirmText: 'Declare Winner',
      cancelText: 'Cancel',
    );

    if (!confirmed) return;
    if (!mounted) return;

    try {
      DialogHelper.showLoading(context, message: 'Declaring winner...');

      await ref.read(winnerActionsProvider).declareWinner(
            groupId: _selectedGroupId!,
            roundNumber: stateData.winners
                    .where((w) => w.round.groupId == _selectedGroupId)
                    .length +
                1,
            date: _selectedDate,
            winnerMemberId: _selectedMemberId!,
            bidAmount: double.tryParse(_bidController.text.trim()) ?? 0.0,
            paymentMode: paymentMode,
            remarks: remarks.isEmpty ? null : remarks,
            winnerPaid: winnerPaid,
            winnerBalance: winnerBalance,
            winnerLeft: winnerLeft,
            exchangedToMemberId: exchangedToMemberId,
            exchangeNote: exchangeNote,
          );

      if (!mounted) return;
      Navigator.pop(context); // Close loading
      Navigator.pop(context); // Close sheet

      DialogHelper.showSnackBar(
        context,
        message: 'Winner declared successfully for $declaredMonthText!',
        type: SnackBarType.success,
      );

      _bidController.clear();
      _remarksController.clear();
      _paidController.clear();
      _exchangeNoteController.clear();
      _splitAmt1Controller.clear();
      _splitAmt2Controller.clear();
      _selectedMemberId = null;
      _exchangedToMemberId = null;
      _selectedGroupId = null;
      _isExchanged = false;
      _isSplitPayment = false;
    } catch (e) {
      if (!mounted) return;
      Navigator.pop(context); // Close loading

      DialogHelper.showSnackBar(
        context,
        message: 'Failed to declare winner: ${e.toString()}',
        type: SnackBarType.error,
      );
    }
  }

  void _showDeclareWinnerSheet(WinnerState stateData) {
    if (stateData.groups.isEmpty) {
      DialogHelper.showInfo(
        context,
        title: 'Cannot Declare Winner',
        message:
            'Please create a group and add members before declaring a winner.',
      );
      return;
    }

    List<Member> groupMembers = [];
    List<Member> allGroupMembers = [];
    bool isLoadingMembers = false;
    String selectedSinglePaymentMode = 'Cash';

    _remarksController.clear();
    _exchangeNoteController.clear();
    _bidController.text = '0';
    _paidController.text = '0';
    _isExchanged = false;
    _isSplitPayment = false;
    _exchangedToMemberId = null;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setSheetState) {
            final selectedGroup = stateData.groups
                .where((g) => g.id == _selectedGroupId)
                .firstOrNull;
            final double total1MonthCollection =
                selectedGroup?.chitValue ?? 0.0;
            final double bid =
                double.tryParse(_bidController.text.trim()) ?? 0.0;
            // Prize = Collection Pool (when no bid/dividend) OR Pool - Bid (when auction bid is entered)
            final double prizeAmount = bid > 0
                ? (total1MonthCollection - bid).clamp(0.0, double.infinity)
                : total1MonthCollection;
            final double paidAmount =
                double.tryParse(_paidController.text.trim()) ?? 0.0;
            // Left = Prize still owed to the winner
            final double leftAmount =
                (prizeAmount - paidAmount).clamp(0.0, double.infinity);

            final months = [
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
            final declaredMonthText =
                '${months[_selectedDate.month - 1]} ${_selectedDate.year}';

            return Container(
              constraints: BoxConstraints(
                maxHeight: MediaQuery.of(context).size.height * 0.94,
              ),
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
                child: Form(
                  key: _formKey,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Center(
                        child: Container(
                          width: 40,
                          height: 4,
                          margin: const EdgeInsets.only(bottom: 16),
                          decoration: BoxDecoration(
                            color: Colors.grey[400],
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ),
                      ),
                      TranslatedText(
                        'Declare Monthly Winner',
                        style: GoogleFonts.outfit(
                            fontSize: 20, fontWeight: FontWeight.bold),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 4),
                      TranslatedText(
                        'Winner is decided per month (1 Round = 1 Month)',
                        style: GoogleFonts.outfit(
                            fontSize: 12, color: Colors.grey),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 12),

                      // ── SECTION: MONTH DECLARATION ────────────────
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryTeal.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                              color:
                                  AppTheme.primaryTeal.withValues(alpha: 0.3)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                const Icon(Icons.calendar_month_rounded,
                                    color: AppTheme.primaryTeal, size: 20),
                                const SizedBox(width: 8),
                                TranslatedText(
                                  'Winning Month Section',
                                  style: GoogleFonts.outfit(
                                      fontSize: 13,
                                      fontWeight: FontWeight.bold,
                                      color: AppTheme.primaryTeal),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Text(
                              'Winner Declared for: $declaredMonthText',
                              style: GoogleFonts.outfit(
                                  fontSize: 14, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Group dropdown
                      DropdownButtonFormField<int>(
                        decoration: InputDecoration(
                          labelText: 'Select Group',
                          labelStyle: GoogleFonts.outfit(),
                          prefixIcon: const Icon(Icons.group_rounded,
                              color: AppTheme.primaryTeal),
                        ),
                        initialValue: _selectedGroupId,
                        items: stateData.groups.map((g) {
                          return DropdownMenuItem<int>(
                            value: g.id,
                            child: TranslatedText(
                              g.name,
                              overflow: TextOverflow.ellipsis,
                              style: GoogleFonts.outfit(),
                            ),
                          );
                        }).toList(),
                        onChanged: (val) async {
                          if (val != null) {
                            final group =
                                stateData.groups.firstWhere((g) => g.id == val);
                            setSheetState(() {
                              _selectedGroupId = val;
                              _selectedMemberId = null;
                              _selectedMemberId = null;
                              _exchangedToMemberId = null;
                              isLoadingMembers = true;
                              groupMembers = [];
                              allGroupMembers = [];
                              _bidController.text =
                                  group.chitValue.toStringAsFixed(0);
                              _paidController.text = '0';
                            });

                            final members = await ref
                                .read(winnerActionsProvider)
                                .getEligibleMembers(val);
                            final allMem = await ref
                                .read(winnerActionsProvider)
                                .getGroupMembers(val);

                            setSheetState(() {
                              groupMembers = members;
                              allGroupMembers = allMem;
                              isLoadingMembers = false;
                            });
                          }
                        },
                      ),
                      const SizedBox(height: 12),

                      // 1-Month Collection & Net Winner Amount Banner
                      if (selectedGroup != null) ...[
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
                                color: AppTheme.primaryTeal
                                    .withValues(alpha: 0.4)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Row(
                                    children: [
                                      const Icon(
                                          Icons.account_balance_wallet_rounded,
                                          color: AppTheme.primaryTeal,
                                          size: 20),
                                      const SizedBox(width: 8),
                                      TranslatedText(
                                        '1 Month Collection Pool',
                                        style: GoogleFonts.outfit(
                                          fontWeight: FontWeight.w600,
                                          fontSize: 13,
                                          color: AppTheme.primaryTeal,
                                        ),
                                      ),
                                    ],
                                  ),
                                  TranslatedText(
                                    '₹${total1MonthCollection.toStringAsFixed(0)}',
                                    style: GoogleFonts.outfit(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 16,
                                      color: AppTheme.primaryTeal,
                                    ),
                                  ),
                                ],
                              ),
                              const Divider(height: 16),
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  TranslatedText(
                                    'Winner Amount (Prize)',
                                    style: GoogleFonts.outfit(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 13,
                                      color: Colors.blue[800] ?? Colors.blue,
                                    ),
                                  ),
                                  TranslatedText(
                                    '₹${prizeAmount.toStringAsFixed(0)}',
                                    style: GoogleFonts.outfit(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 16,
                                      color: Colors.blue[800] ?? Colors.blue,
                                    ),
                                  ),
                                ],
                              ),
                              const Divider(height: 12),
                              Text(
                                bid > 0
                                    ? '* Prize (₹${prizeAmount.toStringAsFixed(0)}) = Pool (₹${total1MonthCollection.toStringAsFixed(0)}) − Bid/Dividend (₹${bid.toStringAsFixed(0)})'
                                    : '* Prize = Full Collection Pool (₹${total1MonthCollection.toStringAsFixed(0)}) — No bid/dividend deducted',
                                style: GoogleFonts.outfit(
                                    fontSize: 10,
                                    color: Colors.blue[900],
                                    fontStyle: FontStyle.italic),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 12),
                      ],

                      // Member dropdown
                      if (_selectedGroupId != null && isLoadingMembers)
                        const Center(
                          child: Padding(
                            padding: EdgeInsets.all(16.0),
                            child: CircularProgressIndicator(),
                          ),
                        )
                      else if (_selectedGroupId != null && groupMembers.isEmpty)
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.green.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: Colors.green),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.check_circle,
                                  color: Colors.green),
                              const SizedBox(width: 8),
                              Expanded(
                                child: TranslatedText(
                                  'All members in this group have already won!',
                                  style: GoogleFonts.outfit(
                                      color: Colors.green,
                                      fontWeight: FontWeight.bold),
                                ),
                              ),
                            ],
                          ),
                        )
                      else if (_selectedGroupId != null)
                        DropdownButtonFormField<int>(
                          decoration: InputDecoration(
                            labelText: 'Select Auction Winner Member',
                            labelStyle: GoogleFonts.outfit(),
                            prefixIcon: const Icon(Icons.person_rounded,
                                color: AppTheme.primaryTeal),
                          ),
                          initialValue: _selectedMemberId,
                          items: groupMembers.map((m) {
                            return DropdownMenuItem<int>(
                              value: m.id,
                              child: TranslatedText(
                                m.name,
                                overflow: TextOverflow.ellipsis,
                                style: GoogleFonts.outfit(),
                              ),
                            );
                          }).toList(),
                          onChanged: (val) {
                            setSheetState(() {
                              _selectedMemberId = val;
                            });
                          },
                        ),
                      const SizedBox(height: 16),

                      // Calendar Bidding Month Picker
                      Container(
                        decoration: BoxDecoration(
                          color: Theme.of(context).brightness == Brightness.dark
                              ? Colors.grey[900]
                              : Colors.grey[50],
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color:
                                Theme.of(context).brightness == Brightness.dark
                                    ? Colors.grey[700]!
                                    : Colors.grey[300]!,
                          ),
                        ),
                        child: Column(
                          children: [
                            Padding(
                              padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
                              child: Row(
                                children: [
                                  const Icon(Icons.calendar_month_rounded,
                                      color: AppTheme.primaryTeal, size: 20),
                                  const SizedBox(width: 8),
                                  TranslatedText(
                                    'Auction Month Selector',
                                    style: GoogleFonts.outfit(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w600,
                                      color: AppTheme.primaryTeal,
                                    ),
                                  ),
                                  const Spacer(),
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: AppTheme.primaryTeal
                                          .withValues(alpha: 0.12),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Text(
                                      _selectedDate.toString().substring(0, 10),
                                      style: GoogleFonts.outfit(
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold,
                                        color: AppTheme.primaryTeal,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 16, vertical: 8),
                              child: Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  IconButton(
                                    icon: const Icon(Icons.chevron_left_rounded,
                                        color: AppTheme.primaryTeal),
                                    onPressed: () {
                                      setSheetState(() {
                                        var prevMonth = _selectedDate.month - 1;
                                        var year = _selectedDate.year;
                                        if (prevMonth < 1) {
                                          prevMonth = 12;
                                          year -= 1;
                                        }
                                        if (year >= 1900) {
                                          _selectedDate = DateTime(year,
                                              prevMonth, _selectedDate.day);
                                        }
                                      });
                                    },
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 8),
                                    decoration: BoxDecoration(
                                      color: Theme.of(context).brightness ==
                                              Brightness.dark
                                          ? Colors.grey[800]
                                          : Colors.grey[200],
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                    child: DropdownButtonHideUnderline(
                                      child: DropdownButton<int>(
                                        value: _selectedDate.month,
                                        dropdownColor:
                                            Theme.of(context).brightness ==
                                                    Brightness.dark
                                                ? Colors.grey[900]
                                                : Colors.white,
                                        style: GoogleFonts.outfit(
                                          fontWeight: FontWeight.bold,
                                          color: Theme.of(context).brightness ==
                                                  Brightness.dark
                                              ? Colors.white
                                              : Colors.black87,
                                        ),
                                        items: List.generate(12, (index) {
                                          final m = index + 1;
                                          final monthsShort = [
                                            'Jan',
                                            'Feb',
                                            'Mar',
                                            'Apr',
                                            'May',
                                            'Jun',
                                            'Jul',
                                            'Aug',
                                            'Sep',
                                            'Oct',
                                            'Nov',
                                            'Dec'
                                          ];
                                          return DropdownMenuItem(
                                            value: m,
                                            child: TranslatedText(
                                                monthsShort[index]),
                                          );
                                        }),
                                        onChanged: (val) {
                                          if (val != null) {
                                            setSheetState(() {
                                              _selectedDate = DateTime(
                                                  _selectedDate.year,
                                                  val,
                                                  _selectedDate.day);
                                            });
                                          }
                                        },
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 8),
                                    decoration: BoxDecoration(
                                      color: Theme.of(context).brightness ==
                                              Brightness.dark
                                          ? Colors.grey[800]
                                          : Colors.grey[200],
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                    child: DropdownButtonHideUnderline(
                                      child: DropdownButton<int>(
                                        value: _selectedDate.year,
                                        dropdownColor:
                                            Theme.of(context).brightness ==
                                                    Brightness.dark
                                                ? Colors.grey[900]
                                                : Colors.white,
                                        style: GoogleFonts.outfit(
                                          fontWeight: FontWeight.bold,
                                          color: Theme.of(context).brightness ==
                                                  Brightness.dark
                                              ? Colors.white
                                              : Colors.black87,
                                        ),
                                        items: List.generate(301, (index) {
                                          final y = 1900 + index;
                                          return DropdownMenuItem(
                                            value: y,
                                            child: Text(y.toString()),
                                          );
                                        }),
                                        onChanged: (val) {
                                          if (val != null) {
                                            setSheetState(() {
                                              _selectedDate = DateTime(
                                                  val,
                                                  _selectedDate.month,
                                                  _selectedDate.day);
                                            });
                                          }
                                        },
                                      ),
                                    ),
                                  ),
                                  IconButton(
                                    icon: const Icon(
                                        Icons.chevron_right_rounded,
                                        color: AppTheme.primaryTeal),
                                    onPressed: () {
                                      setSheetState(() {
                                        var nextMonth = _selectedDate.month + 1;
                                        var year = _selectedDate.year;
                                        if (nextMonth > 12) {
                                          nextMonth = 1;
                                          year += 1;
                                        }
                                        if (year <= 2200) {
                                          _selectedDate = DateTime(year,
                                              nextMonth, _selectedDate.day);
                                        }
                                      });
                                    },
                                  ),
                                ],
                              ),
                            ),
                            TableCalendar(
                              headerVisible: false,
                              firstDay: DateTime.utc(1900, 1, 1),
                              lastDay: DateTime.utc(2200, 12, 31),
                              focusedDay: _selectedDate,
                              selectedDayPredicate: (day) =>
                                  isSameDay(_selectedDate, day),
                              calendarFormat: _calendarFormat,
                              onFormatChanged: (format) {
                                setSheetState(() {
                                  _calendarFormat = format;
                                });
                              },
                              onDaySelected: (selectedDay, focusedDay) {
                                setSheetState(() {
                                  _selectedDate = selectedDay;
                                });
                              },
                              calendarStyle: CalendarStyle(
                                selectedDecoration: const BoxDecoration(
                                  gradient: LinearGradient(
                                    colors: [
                                      AppTheme.primaryTeal,
                                      Color(0xFF10B981),
                                    ],
                                  ),
                                  shape: BoxShape.circle,
                                ),
                                todayDecoration: BoxDecoration(
                                  color: AppTheme.primaryTeal
                                      .withValues(alpha: 0.3),
                                  shape: BoxShape.circle,
                                ),
                                todayTextStyle: GoogleFonts.outfit(
                                  fontWeight: FontWeight.bold,
                                  color: Theme.of(context).brightness ==
                                          Brightness.dark
                                      ? Colors.white
                                      : AppTheme.primaryTeal,
                                ),
                                defaultTextStyle: GoogleFonts.outfit(
                                  color: Theme.of(context).brightness ==
                                          Brightness.dark
                                      ? Colors.white70
                                      : Colors.black87,
                                ),
                                weekendTextStyle: GoogleFonts.outfit(
                                  color: Colors.redAccent,
                                ),
                                outsideTextStyle: GoogleFonts.outfit(
                                  color: Colors.grey[400],
                                ),
                              ),
                              daysOfWeekStyle: DaysOfWeekStyle(
                                weekdayStyle: GoogleFonts.outfit(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: Colors.grey[600],
                                ),
                                weekendStyle: GoogleFonts.outfit(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: Colors.redAccent[100],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Bid / Dividend (Optional — leave blank if no auction bid)
                      TextFormField(
                        controller: _bidController,
                        decoration: InputDecoration(
                          labelText: 'Bid / Dividend Deduction (₹) — Optional',
                          hintText:
                              'Leave blank if Prize = Full Collection Pool',
                          labelStyle: GoogleFonts.outfit(),
                          prefixText: '₹ ',
                          prefixIcon: const Icon(Icons.monetization_on_rounded,
                              color: AppTheme.primaryTeal),
                          helperText:
                              'If entered: Prize = Pool − Bid. If blank: Prize = Full Pool',
                          helperStyle: GoogleFonts.outfit(
                              fontSize: 11, color: Colors.grey),
                        ),
                        keyboardType: TextInputType.number,
                        onChanged: (v) => setSheetState(() {}),
                        validator: (value) {
                          // Bid is optional — only validate if something is typed
                          if (value != null && value.trim().isNotEmpty) {
                            final amount = double.tryParse(value.trim());
                            if (amount == null || amount < 0) {
                              return 'Enter a valid bid amount or leave blank';
                            }
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),

                      // Amount Paid to Winner
                      TextFormField(
                        controller: _paidController,
                        decoration: InputDecoration(
                          labelText: 'Amount Paid to Winner (₹)',
                          labelStyle: GoogleFonts.outfit(),
                          prefixText: '₹ ',
                          prefixIcon: const Icon(Icons.payments_rounded,
                              color: AppTheme.primaryTeal),
                        ),
                        keyboardType: TextInputType.number,
                        onChanged: (v) => setSheetState(() {}),
                        validator: (value) {
                          final amount = double.tryParse(value?.trim() ?? '');
                          if (amount == null || amount < 0) {
                            return 'Enter a valid amount';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 8),

                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 4),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            TranslatedText(
                              'Paid: ₹${paidAmount.toStringAsFixed(0)}',
                              style: GoogleFonts.outfit(
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.green),
                            ),
                            TranslatedText(
                              leftAmount <= 0
                                  ? 'Fully Paid: ₹0'
                                  : 'Left (Pending): ₹${leftAmount.toStringAsFixed(0)}',
                              style: GoogleFonts.outfit(
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  color: leftAmount <= 0
                                      ? Colors.green
                                      : (Colors.orange[800] ?? Colors.orange)),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),

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
                                title: TranslatedText(
                                  'Split Payment (2 Modes at a time)',
                                  style: GoogleFonts.outfit(
                                      fontSize: 13,
                                      fontWeight: FontWeight.bold),
                                ),
                                value: _isSplitPayment,
                                activeThumbColor: AppTheme.primaryTeal,
                                onChanged: (val) {
                                  setSheetState(() => _isSplitPayment = val);
                                },
                              ),
                              if (!_isSplitPayment) ...[
                                DropdownButtonFormField<String>(
                                  decoration: InputDecoration(
                                    labelText: 'Payment Mode',
                                    labelStyle: GoogleFonts.outfit(),
                                    prefixIcon: const Icon(
                                        Icons.payment_rounded,
                                        color: AppTheme.primaryTeal),
                                  ),
                                  initialValue: selectedSinglePaymentMode,
                                  items: const [
                                    DropdownMenuItem(
                                        value: 'Cash',
                                        child: TranslatedText('Cash')),
                                    DropdownMenuItem(
                                        value: 'UPI',
                                        child: TranslatedText('UPI')),
                                    DropdownMenuItem(
                                        value: 'Bank Transfer',
                                        child: TranslatedText('Bank Transfer')),
                                    DropdownMenuItem(
                                        value: 'Cheque',
                                        child: TranslatedText('Cheque')),
                                    DropdownMenuItem(
                                        value: 'Other',
                                        child: TranslatedText('Other')),
                                  ],
                                  onChanged: (val) {
                                    if (val != null) {
                                      setSheetState(() {
                                        selectedSinglePaymentMode = val;
                                      });
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
                                        initialValue: _paymentMode1,
                                        items: const [
                                          DropdownMenuItem(
                                              value: 'Cash',
                                              child: TranslatedText('Cash')),
                                          DropdownMenuItem(
                                              value: 'UPI',
                                              child: TranslatedText('UPI')),
                                          DropdownMenuItem(
                                              value: 'Bank Transfer',
                                              child: TranslatedText('Bank')),
                                          DropdownMenuItem(
                                              value: 'Cheque',
                                              child: TranslatedText('Cheque')),
                                        ],
                                        onChanged: (v) => setSheetState(
                                            () => _paymentMode1 = v!),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: TextFormField(
                                        controller: _splitAmt1Controller,
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
                                        initialValue: _paymentMode2,
                                        items: const [
                                          DropdownMenuItem(
                                              value: 'UPI',
                                              child: TranslatedText('UPI')),
                                          DropdownMenuItem(
                                              value: 'Cash',
                                              child: TranslatedText('Cash')),
                                          DropdownMenuItem(
                                              value: 'Bank Transfer',
                                              child: TranslatedText('Bank')),
                                          DropdownMenuItem(
                                              value: 'Cheque',
                                              child: TranslatedText('Cheque')),
                                        ],
                                        onChanged: (v) => setSheetState(
                                            () => _paymentMode2 = v!),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: TextFormField(
                                        controller: _splitAmt2Controller,
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
                      const SizedBox(height: 16),

                      // ── SECTION: MONEY EXCHANGE & NEW WINNER SELECTION ────────────────
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.amber.withValues(alpha: 0.08),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                              color: Colors.amber.withValues(alpha: 0.3)),
                        ),
                        child: Material(
                          color: Colors.transparent,
                          child: Column(
                            children: [
                              SwitchListTile(
                                contentPadding: EdgeInsets.zero,
                                title: TranslatedText(
                                  'Exchange Money / Transfer to New Winner',
                                  style: GoogleFonts.outfit(
                                      fontSize: 13,
                                      fontWeight: FontWeight.bold),
                                ),
                                subtitle: TranslatedText(
                                  'Pay prize amount to a new winner (exchanged member)',
                                  style: GoogleFonts.outfit(
                                      fontSize: 11, color: Colors.grey[700]),
                                ),
                                value: _isExchanged,
                                activeThumbColor: AppTheme.primaryTeal,
                                onChanged: (val) {
                                  setSheetState(() => _isExchanged = val);
                                },
                              ),
                              if (_isExchanged) ...[
                                DropdownButtonFormField<int>(
                                  decoration: InputDecoration(
                                    labelText:
                                        'Select New Winner (Receives Money)',
                                    labelStyle: GoogleFonts.outfit(),
                                    prefixIcon: const Icon(
                                        Icons.swap_horiz_rounded,
                                        color: Colors.amber),
                                  ),
                                  initialValue: _exchangedToMemberId,
                                  items: allGroupMembers.map((m) {
                                    return DropdownMenuItem<int>(
                                      value: m.id,
                                      child: TranslatedText(
                                        '👑 ${m.name}',
                                        overflow: TextOverflow.ellipsis,
                                        style: GoogleFonts.outfit(
                                            fontWeight: FontWeight.bold),
                                      ),
                                    );
                                  }).toList(),
                                  onChanged: (val) {
                                    setSheetState(() {
                                      _exchangedToMemberId = val;
                                    });
                                  },
                                ),
                                const SizedBox(height: 8),
                                TextFormField(
                                  controller: _exchangeNoteController,
                                  maxLines: 2,
                                  decoration: InputDecoration(
                                    labelText: 'Money Exchange Audit Note',
                                    labelStyle: GoogleFonts.outfit(),
                                    hintText:
                                        'Note: Prize exchanged to Rahul per mutual agreement...',
                                    prefixIcon: const Icon(
                                        Icons.edit_note_rounded,
                                        color: Colors.amber),
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Remarks with Voice (Mic) & Text Feature
                      TextFormField(
                        controller: _remarksController,
                        maxLines: 2,
                        decoration: InputDecoration(
                          labelText: 'Winner Remarks (Voice & Text)',
                          labelStyle: GoogleFonts.outfit(),
                          hintText:
                              'Type remarks or tap microphone to speak...',
                          prefixIcon: const Icon(Icons.comment_rounded,
                              color: AppTheme.primaryTeal),
                          suffixIcon: Tooltip(
                            message: _isListening
                                ? 'Listening... Tap to stop'
                                : 'Tap to speak remarks',
                            child: IconButton(
                              icon: AnimatedContainer(
                                duration: const Duration(milliseconds: 300),
                                padding: const EdgeInsets.all(6),
                                decoration: BoxDecoration(
                                  color: _isListening
                                      ? Colors.red.withValues(alpha: 0.2)
                                      : Colors.transparent,
                                  shape: BoxShape.circle,
                                ),
                                child: Icon(
                                  _isListening
                                      ? Icons.mic
                                      : Icons.mic_none_rounded,
                                  color: _isListening
                                      ? Colors.red
                                      : AppTheme.primaryTeal,
                                ),
                              ),
                              onPressed: () =>
                                  _listenVoiceRemarks(setSheetState),
                            ),
                          ),
                        ),
                      ),
                      if (_isListening) ...[
                        const SizedBox(height: 6),
                        Row(
                          children: [
                            const SizedBox(
                              width: 12,
                              height: 12,
                              child: CircularProgressIndicator(
                                  strokeWidth: 2, color: Colors.red),
                            ),
                            const SizedBox(width: 8),
                            TranslatedText(
                              'Listening for voice remarks...',
                              style: GoogleFonts.outfit(
                                  fontSize: 12,
                                  color: Colors.red,
                                  fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ],
                      const SizedBox(height: 24),

                      ElevatedButton.icon(
                        onPressed: () {
                          String finalPaymentMode = selectedSinglePaymentMode;
                          if (_isSplitPayment) {
                            final a1 = _splitAmt1Controller.text.trim();
                            final a2 = _splitAmt2Controller.text.trim();
                            finalPaymentMode =
                                '$_paymentMode1 (₹$a1) + $_paymentMode2 (₹$a2)';
                          }

                          _submitWinner(
                            stateData: stateData,
                            paymentMode: finalPaymentMode,
                            remarks: _remarksController.text.trim(),
                            winnerPaid: paidAmount,
                            winnerBalance: prizeAmount,
                            winnerLeft: leftAmount,
                            exchangedToMemberId:
                                _isExchanged ? _exchangedToMemberId : null,
                            exchangeNote: _isExchanged
                                ? _exchangeNoteController.text.trim()
                                : null,
                          );
                        },
                        icon: const Icon(Icons.emoji_events_rounded),
                        label: TranslatedText(
                            'Declare Winner for $declaredMonthText',
                            style: GoogleFonts.outfit(
                                fontSize: 15, fontWeight: FontWeight.bold)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.primaryTeal,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16)),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        );
      },
    );
  }

  Future<void> _deleteWinner(int roundId, String memberName) async {
    final confirmed = await DialogHelper.showConfirmation(
      context,
      title: 'Delete Winner?',
      message:
          'This will remove the winner declaration for "$memberName".\n\nThis action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    );
    if (!confirmed) return;
    if (!mounted) return;

    DialogHelper.showLoading(context, message: 'Deleting winner...');
    try {
      await ref.read(winnerActionsProvider).deleteWinner(roundId);
      if (!mounted) return;
      Navigator.pop(context);
      DialogHelper.showSnackBar(
        context,
        message: 'Winner removed successfully.',
        type: SnackBarType.success,
      );
    } catch (e) {
      if (!mounted) return;
      Navigator.pop(context);
      DialogHelper.showSnackBar(
        context,
        message: 'Failed to delete: ${e.toString()}',
        type: SnackBarType.error,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final stateAsync = ref.watch(winnerProvider);
    final localizations = AppLocalizations.of(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: TranslatedText(localizations.translate('winner_module')),
      ),
      floatingActionButton: stateAsync.when(
        data: (stateData) => FloatingActionButton(
          heroTag: 'winner_fab',
          onPressed: () => _showDeclareWinnerSheet(stateData),
          backgroundColor: AppTheme.primaryTeal,
          child: const Icon(Icons.emoji_events, color: Colors.white),
        ),
        loading: () => null,
        error: (_, __) => null,
      ),
      body: stateAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, st) => Center(child: TranslatedText('Error: $err')),
        data: (stateData) {
          if (stateData.winners.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.emoji_events_outlined,
                      size: 64, color: Colors.grey.withValues(alpha: 0.4)),
                  const SizedBox(height: 16),
                  const TranslatedText('No winners declared yet.',
                      style: TextStyle(fontSize: 16, color: Colors.grey)),
                  const SizedBox(height: 8),
                  TranslatedText('Tap + to declare an auction winner.',
                      style: TextStyle(
                          fontSize: 13,
                          color: Colors.grey.withValues(alpha: 0.6))),
                ],
              ),
            );
          }

          return ScrollArrowsOverlay(
            bottomPadding: 90,
            scrollController: _scrollController,
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(20),
              itemCount: stateData.winners.length,
              itemBuilder: (context, index) {
                final item = stateData.winners[index];
                final round = item.round;
                final group = item.group;
                final member = item.winner;
                final exchanged = item.exchangedMember;

                final months = [
                  'Jan',
                  'Feb',
                  'Mar',
                  'Apr',
                  'May',
                  'Jun',
                  'Jul',
                  'Aug',
                  'Sep',
                  'Oct',
                  'Nov',
                  'Dec'
                ];
                final monthLabel = '${months[round.month - 1]} ${round.year}';
                final double total1MonthColl = group.chitValue;
                final double bidAmt = round.bidAmount ?? 0.0;
                // Prize = Full Pool when no bid; Prize = Pool - Bid when bid > 0
                final double prize = bidAmt > 0
                    ? (group.chitValue - bidAmt).clamp(0.0, double.infinity)
                    : group.chitValue;
                final double paid = round.winnerPaid ?? 0.0;
                // Left = amount still owed to the winner
                final double left = (prize - paid).clamp(0.0, double.infinity);

                return GestureDetector(
                  onTap: () {
                    showModalBottomSheet(
                      context: context,
                      isScrollControlled: true,
                      backgroundColor: Colors.transparent,
                      builder: (context) => _PayoutDetailsModal(item: item),
                    );
                  },
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 16),
                    child: GlassCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: Colors.amber.withValues(alpha: 0.15),
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(Icons.emoji_events,
                                    color: Colors.amber, size: 28),
                              ),
                              const SizedBox(width: 14),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        TranslatedText(
                                          member.name,
                                          style: const TextStyle(
                                              fontSize: 16,
                                              fontWeight: FontWeight.bold),
                                        ),
                                        if (exchanged != null) ...[
                                          const SizedBox(width: 6),
                                          Container(
                                            padding: const EdgeInsets.symmetric(
                                                horizontal: 6, vertical: 2),
                                            decoration: BoxDecoration(
                                              color: Colors.amber
                                                  .withValues(alpha: 0.2),
                                              borderRadius:
                                                  BorderRadius.circular(6),
                                            ),
                                            child: const Text(
                                              'Auction Winner',
                                              style: TextStyle(
                                                  fontSize: 10,
                                                  fontWeight: FontWeight.bold,
                                                  color: Colors.amber),
                                            ),
                                          ),
                                        ],
                                      ],
                                    ),
                                    const SizedBox(height: 2),
                                    TranslatedText(
                                      'Group: ${group.name}',
                                      style: TextStyle(
                                          fontSize: 13,
                                          color: isDark
                                              ? Colors.white70
                                              : Colors.black87),
                                    ),
                                    Container(
                                      margin: const EdgeInsets.only(top: 4),
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 8, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: AppTheme.primaryTeal
                                            .withValues(alpha: 0.12),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Text(
                                        '🗓️ Decided Month: $monthLabel',
                                        style: GoogleFonts.outfit(
                                            fontSize: 11,
                                            fontWeight: FontWeight.bold,
                                            color: AppTheme.primaryTeal),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  TranslatedText(
                                    'Round ${round.roundNumber}',
                                    style: const TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold,
                                        color: AppTheme.primaryTeal),
                                  ),
                                  const SizedBox(height: 4),
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: round.payoutStatus == 'Released'
                                          ? Colors.teal.withValues(alpha: 0.15)
                                          : Colors.orange
                                              .withValues(alpha: 0.15),
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Icon(
                                          round.payoutStatus == 'Released'
                                              ? Icons
                                                  .check_circle_outline_rounded
                                              : Icons.hourglass_empty_rounded,
                                          size: 11,
                                          color:
                                              round.payoutStatus == 'Released'
                                                  ? Colors.teal
                                                  : Colors.orange,
                                        ),
                                        const SizedBox(width: 3),
                                        TranslatedText(
                                          round.payoutStatus == 'Released'
                                              ? 'Released'
                                              : 'Pending',
                                          style: TextStyle(
                                            fontSize: 10,
                                            fontWeight: FontWeight.bold,
                                            color:
                                                round.payoutStatus == 'Released'
                                                    ? Colors.teal
                                                    : Colors.orange,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                              IconButton(
                                icon: const Icon(Icons.delete_outline_rounded,
                                    color: Colors.redAccent, size: 20),
                                tooltip: 'Delete winner',
                                onPressed: () =>
                                    _deleteWinner(round.id, member.name),
                              ),
                            ],
                          ),

                          // Exchanged New Winner Banner
                          if (exchanged != null) ...[
                            const SizedBox(height: 10),
                            Container(
                              width: double.infinity,
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  colors: [
                                    Colors.green.withValues(alpha: 0.15),
                                    Colors.teal.withValues(alpha: 0.08),
                                  ],
                                ),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                    color: Colors.green.withValues(alpha: 0.4)),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      const Icon(Icons.swap_horiz_rounded,
                                          size: 18, color: Colors.green),
                                      const SizedBox(width: 6),
                                      Text(
                                        '👑 New Winner (Receives Money): ${exchanged.name}',
                                        style: GoogleFonts.outfit(
                                          fontSize: 13,
                                          fontWeight: FontWeight.bold,
                                          color:
                                              Colors.green[800] ?? Colors.green,
                                        ),
                                      ),
                                    ],
                                  ),
                                  if (round.exchangeNote != null &&
                                      round.exchangeNote!.isNotEmpty) ...[
                                    const SizedBox(height: 4),
                                    Text(
                                      '📝 Note: ${round.exchangeNote}',
                                      style: GoogleFonts.outfit(
                                          fontSize: 11,
                                          fontStyle: FontStyle.italic,
                                          color: Colors.grey[800]),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                          ],

                          const Divider(height: 16),
                          // Overall collection & prize details
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  TranslatedText(
                                    '1 Month Collection Pool',
                                    style: TextStyle(
                                        fontSize: 10, color: Colors.grey[600]),
                                  ),
                                  TranslatedText(
                                    '₹${total1MonthColl.toStringAsFixed(0)}',
                                    style: const TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w600),
                                  ),
                                ],
                              ),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.center,
                                children: [
                                  const TranslatedText(
                                    'Winning Bid',
                                    style: TextStyle(
                                        fontSize: 10, color: Colors.grey),
                                  ),
                                  TranslatedText(
                                    '₹${(round.bidAmount ?? 0).toStringAsFixed(0)}',
                                    style: const TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w600,
                                        color: Colors.orange),
                                  ),
                                ],
                              ),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  const TranslatedText(
                                    'Winner Prize',
                                    style: TextStyle(
                                        fontSize: 10, color: Colors.grey),
                                  ),
                                  TranslatedText(
                                    '₹${prize.toStringAsFixed(0)}',
                                    style: const TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.blue),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color:
                                          Colors.purple.withValues(alpha: 0.12),
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Row(
                                      children: [
                                        const Icon(Icons.payment_rounded,
                                            size: 12, color: Colors.purple),
                                        const SizedBox(width: 4),
                                        TranslatedText(
                                          round.winnerPaymentMode ?? 'Cash',
                                          style: const TextStyle(
                                              fontSize: 11,
                                              fontWeight: FontWeight.bold,
                                              color: Colors.purple),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                              Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.end,
                                    children: [
                                      TranslatedText(
                                        'Paid: ₹${paid.toStringAsFixed(0)}',
                                        style: GoogleFonts.outfit(
                                            fontSize: 12,
                                            fontWeight: FontWeight.bold,
                                            color: Colors.green),
                                      ),
                                      TranslatedText(
                                        left <= 0
                                            ? 'Fully Paid ✓'
                                            : 'Left: ₹${left.toStringAsFixed(0)}',
                                        style: GoogleFonts.outfit(
                                            fontSize: 12,
                                            fontWeight: FontWeight.bold,
                                            color: left <= 0
                                                ? Colors.green
                                                : (Colors.orange[800] ??
                                                    Colors.orange)),
                                      ),
                                    ],
                                  ),
                                  if (paid > 0 &&
                                      (exchanged?.phone ?? member.phone)
                                          .isNotEmpty) ...[
                                    const SizedBox(width: 8),
                                    InkWell(
                                      onTap: () async {
                                        final recipientPhone =
                                            exchanged?.phone ?? member.phone;
                                        final recipientName =
                                            exchanged?.name ?? member.name;

                                        final chosenLang =
                                            await LanguageSelectionDialog.show(
                                                context);
                                        if (chosenLang != null) {
                                          final success =
                                              await CommunicationService()
                                                  .launchWhatsAppWinnerPayoutReceipt(
                                            mobileNumber: recipientPhone,
                                            memberName: recipientName,
                                            groupName: group.name,
                                            roundNumber: round.roundNumber,
                                            bidAmount: round.bidAmount ?? 0.0,
                                            prizeAmount: group.chitValue -
                                                (round.bidAmount ?? 0.0),
                                            paidAmount: paid,
                                            balance: left,
                                            languageCode: chosenLang,
                                            paymentMode:
                                                round.winnerPaymentMode ??
                                                    'Cash',
                                            remarks: round.winnerRemarks ?? '',
                                          );
                                          if (!success && context.mounted) {
                                            DialogHelper.showSnackBar(
                                              context,
                                              message:
                                                  'Failed to launch WhatsApp.',
                                              type: SnackBarType.error,
                                            );
                                          }
                                        }
                                      },
                                      borderRadius: BorderRadius.circular(20),
                                      child: Container(
                                        padding: const EdgeInsets.all(6),
                                        decoration: BoxDecoration(
                                          color: Colors.green
                                              .withValues(alpha: 0.1),
                                          shape: BoxShape.circle,
                                        ),
                                        child: const Icon(
                                            Icons.chat_bubble_outline_rounded,
                                            size: 16,
                                            color: Colors.green),
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            ],
                          ),

                          // Voice/Text Remarks badge
                          if (round.winnerRemarks != null &&
                              round.winnerRemarks!.isNotEmpty) ...[
                            const SizedBox(height: 8),
                            Container(
                              width: double.infinity,
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 10, vertical: 6),
                              decoration: BoxDecoration(
                                color: Theme.of(context).brightness ==
                                        Brightness.dark
                                    ? Colors.grey[800]
                                    : Colors.grey[100],
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                    color: Theme.of(context).brightness ==
                                            Brightness.dark
                                        ? Colors.grey[700]!
                                        : Colors.grey[300]!),
                              ),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Icon(Icons.chat_bubble_outline_rounded,
                                      size: 14, color: AppTheme.primaryTeal),
                                  const SizedBox(width: 6),
                                  Expanded(
                                    child: TranslatedText(
                                      'Remark: ${round.winnerRemarks}',
                                      style: GoogleFonts.outfit(
                                          fontSize: 11,
                                          fontStyle: FontStyle.italic),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}

class _PayoutDetailsModal extends ConsumerStatefulWidget {
  final WinnerHistoryItem item;
  const _PayoutDetailsModal({required this.item});

  @override
  ConsumerState<_PayoutDetailsModal> createState() =>
      __PayoutDetailsModalState();
}

class __PayoutDetailsModalState extends ConsumerState<_PayoutDetailsModal> {
  final _formKey = GlobalKey<FormState>();
  late String _payoutStatus;
  late String _paymentMode;
  late DateTime? _payoutDate;
  late TextEditingController _g1NameCtrl;
  late TextEditingController _g1PhoneCtrl;
  late TextEditingController _g2NameCtrl;
  late TextEditingController _g2PhoneCtrl;
  late TextEditingController _winnerPaidCtrl;
  late TextEditingController _winnerUpiCtrl;
  late TextEditingController _remarksCtrl;
  late TextEditingController _exchangeNoteCtrl;
  final stt.SpeechToText _speechModal = stt.SpeechToText();
  int? _selectedGuarantorMemberId;
  int? _exchangedToMemberId;
  bool _isSaving = false;
  bool _isListeningModal = false;

  @override
  void initState() {
    super.initState();
    final round = widget.item.round;
    _payoutStatus = round.payoutStatus;
    _paymentMode = round.winnerPaymentMode ?? 'Cash';
    _payoutDate = round.payoutDate ?? DateTime.now();
    _g1NameCtrl = TextEditingController(text: round.guarantor1Name);
    _g1PhoneCtrl = TextEditingController(text: round.guarantor1Phone);
    _g2NameCtrl = TextEditingController(text: round.guarantor2Name);
    _g2PhoneCtrl = TextEditingController(text: round.guarantor2Phone);

    final recipientPhone =
        widget.item.exchangedMember?.phone ?? widget.item.winner.phone;
    _winnerUpiCtrl = TextEditingController(text: '$recipientPhone@upi');
    _remarksCtrl = TextEditingController(text: round.winnerRemarks);
    _exchangeNoteCtrl = TextEditingController(text: round.exchangeNote);
    _exchangedToMemberId = round.exchangedToMemberId;

    final prizeAmount = widget.item.group.chitValue - (round.bidAmount ?? 0.0);
    final initialPaid = (round.winnerPaid != null && round.winnerPaid! > 0.0)
        ? round.winnerPaid!
        : prizeAmount;
    _winnerPaidCtrl =
        TextEditingController(text: initialPaid.toStringAsFixed(0));
    _winnerPaidCtrl.addListener(() {
      setState(() {});
    });

    _selectedGuarantorMemberId = round.guarantorMemberId;
  }

  @override
  void dispose() {
    _g1NameCtrl.dispose();
    _g1PhoneCtrl.dispose();
    _g2NameCtrl.dispose();
    _g2PhoneCtrl.dispose();
    _winnerPaidCtrl.dispose();
    _winnerUpiCtrl.dispose();
    _remarksCtrl.dispose();
    _exchangeNoteCtrl.dispose();
    super.dispose();
  }

  void _listenModalRemarks() async {
    if (!_isListeningModal) {
      bool available = false;
      try {
        available = await _speechModal.initialize(
          onStatus: (status) {
            if (status == 'done' || status == 'notListening') {
              if (mounted) setState(() => _isListeningModal = false);
            }
          },
          onError: (e) {
            if (mounted) setState(() => _isListeningModal = false);
          },
        );
      } catch (e) {
        debugPrint('Speech init failed: $e');
      }

      if (available) {
        setState(() => _isListeningModal = true);
        _speechModal.listen(
          onResult: (val) {
            setState(() {
              _remarksCtrl.text = val.recognizedWords;
            });
          },
        );
      } else {
        if (mounted) {
          DialogHelper.showSnackBar(
            context,
            message: 'Speech recognition is not available on this device.',
            type: SnackBarType.warning,
          );
        }
      }
    } else {
      setState(() => _isListeningModal = false);
      _speechModal.stop();
    }
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSaving = true);
    try {
      final prizeAmount =
          widget.item.group.chitValue - (widget.item.round.bidAmount ?? 0.0);
      final winnerPaid = _payoutStatus == 'Released'
          ? (double.tryParse(_winnerPaidCtrl.text.trim()) ?? prizeAmount)
          : 0.0;
      final winnerBalance = prizeAmount - winnerPaid;
      final winnerLeft =
          (prizeAmount - winnerPaid) > 0 ? (prizeAmount - winnerPaid) : 0.0;

      await ref.read(winnerActionsProvider).updatePayoutAndGuarantor(
            roundId: widget.item.round.id,
            payoutStatus: _payoutStatus,
            payoutDate: _payoutStatus == 'Released' ? _payoutDate : null,
            guarantor1Name: _g1NameCtrl.text.trim().isEmpty
                ? null
                : _g1NameCtrl.text.trim(),
            guarantor1Phone: _g1PhoneCtrl.text.trim().isEmpty
                ? null
                : _g1PhoneCtrl.text.trim(),
            guarantor2Name: _g2NameCtrl.text.trim().isEmpty
                ? null
                : _g2NameCtrl.text.trim(),
            guarantor2Phone: _g2PhoneCtrl.text.trim().isEmpty
                ? null
                : _g2PhoneCtrl.text.trim(),
            guarantorMemberId: _selectedGuarantorMemberId,
            winnerPaid: winnerPaid,
            winnerBalance: winnerBalance,
            winnerLeft: winnerLeft,
            winnerPaymentMode: _paymentMode,
            winnerRemarks: _remarksCtrl.text.trim().isEmpty
                ? null
                : _remarksCtrl.text.trim(),
            exchangedToMemberId: _exchangedToMemberId,
            exchangeNote: _exchangeNoteCtrl.text.trim().isEmpty
                ? null
                : _exchangeNoteCtrl.text.trim(),
          );
      if (mounted) {
        Navigator.pop(context);
        DialogHelper.showSnackBar(
          context,
          message: 'Payout and guarantor details updated successfully.',
          type: SnackBarType.success,
        );

        final recipientPhone =
            widget.item.exchangedMember?.phone ?? widget.item.winner.phone;
        final recipientName =
            widget.item.exchangedMember?.name ?? widget.item.winner.name;

        if (_payoutStatus == 'Released' && recipientPhone.isNotEmpty) {
          final confirm = await DialogHelper.showConfirmation(
            context,
            title: 'Send Payout Receipt?',
            message:
                'Do you want to send a WhatsApp release receipt to $recipientName?',
            confirmText: 'Send WhatsApp',
            cancelText: 'Skip',
          );
          if (confirm) {
            if (!mounted) return;
            // Wait for confirmation dialog pop transition to complete before showing language picker
            await Future.delayed(const Duration(milliseconds: 200));
            if (!mounted) return;
            final chosenLang = await LanguageSelectionDialog.show(context);
            if (chosenLang != null) {
              final success = await CommunicationService()
                  .launchWhatsAppWinnerPayoutReceipt(
                mobileNumber: recipientPhone,
                memberName: recipientName,
                groupName: widget.item.group.name,
                roundNumber: widget.item.round.roundNumber,
                bidAmount: widget.item.round.bidAmount ?? 0.0,
                prizeAmount: prizeAmount,
                paidAmount: winnerPaid,
                balance: winnerLeft,
                languageCode: chosenLang,
                paymentMode: _paymentMode,
                remarks: _remarksCtrl.text.trim(),
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
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSaving = false);
        DialogHelper.showSnackBar(
          context,
          message: 'Error updating details: $e',
          type: SnackBarType.error,
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final prizeAmount =
        widget.item.group.chitValue - (widget.item.round.bidAmount ?? 0.0);
    final months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ];
    final monthLabel =
        '${months[widget.item.round.month - 1]} ${widget.item.round.year}';
    final hasExchange = widget.item.exchangedMember != null;
    final recipientName =
        widget.item.exchangedMember?.name ?? widget.item.winner.name;

    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.88,
      ),
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
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: Colors.grey[400],
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              TranslatedText(
                'Payout & Winner Audit Registry',
                style: GoogleFonts.outfit(
                    fontSize: 20, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 4),
              TranslatedText(
                'Month: $monthLabel • Group: ${widget.item.group.name}',
                style: GoogleFonts.outfit(
                    fontSize: 13,
                    color: AppTheme.primaryTeal,
                    fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),

              // Winner & Recipient Information Box
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: hasExchange
                      ? Colors.amber.withValues(alpha: 0.12)
                      : AppTheme.primaryTeal.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                      color: hasExchange
                          ? Colors.amber.withValues(alpha: 0.4)
                          : AppTheme.primaryTeal.withValues(alpha: 0.2)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.emoji_events,
                            color: Colors.amber, size: 20),
                        const SizedBox(width: 8),
                        Text(
                          'Auction Winner: ${widget.item.winner.name}',
                          style: GoogleFonts.outfit(
                              fontWeight: FontWeight.bold, fontSize: 14),
                        ),
                      ],
                    ),
                    if (hasExchange) ...[
                      const Divider(height: 12),
                      Row(
                        children: [
                          const Icon(Icons.swap_horiz_rounded,
                              color: Colors.green, size: 20),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              '👑 Money Paid To (New Winner): $recipientName',
                              style: GoogleFonts.outfit(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 14,
                                  color: Colors.green[800] ?? Colors.green),
                            ),
                          ),
                        ],
                      ),
                      if (widget.item.round.exchangeNote != null &&
                          widget.item.round.exchangeNote!.isNotEmpty) ...[
                        const SizedBox(height: 4),
                        Text(
                          '📝 Exchange Note: ${widget.item.round.exchangeNote}',
                          style: GoogleFonts.outfit(
                              fontSize: 12,
                              fontStyle: FontStyle.italic,
                              color: Colors.grey[800]),
                        ),
                      ],
                    ],
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Total Collection & Prize summary box
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Theme.of(context).brightness == Brightness.dark
                      ? Colors.grey[850]
                      : Colors.grey[100],
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        TranslatedText('1 Month Collection Pool',
                            style: GoogleFonts.outfit(
                                fontSize: 11, color: Colors.grey[700])),
                        TranslatedText(
                            '₹${widget.item.group.chitValue.toStringAsFixed(0)}',
                            style: GoogleFonts.outfit(
                                fontSize: 14, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        TranslatedText('Winner Prize Amount',
                            style: GoogleFonts.outfit(
                                fontSize: 11, color: Colors.grey[700])),
                        TranslatedText('₹${prizeAmount.toStringAsFixed(0)}',
                            style: GoogleFonts.outfit(
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                                color: Colors.blue)),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Payout Status Selection
              TranslatedText(
                'Auction Winner Release Status',
                style: GoogleFonts.outfit(
                    fontSize: 14, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: ChoiceChip(
                      label: Center(
                        child: TranslatedText(
                          'Pending Release',
                          style: GoogleFonts.outfit(
                            fontWeight: FontWeight.bold,
                            color: _payoutStatus == 'Pending'
                                ? Colors.orange
                                : Colors.grey,
                          ),
                        ),
                      ),
                      selected: _payoutStatus == 'Pending',
                      selectedColor: Colors.orange.withValues(alpha: 0.15),
                      onSelected: (selected) {
                        if (selected) {
                          setState(() => _payoutStatus = 'Pending');
                        }
                      },
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ChoiceChip(
                      label: Center(
                        child: TranslatedText(
                          'Released',
                          style: GoogleFonts.outfit(
                            fontWeight: FontWeight.bold,
                            color: _payoutStatus == 'Released'
                                ? Colors.teal
                                : Colors.grey,
                          ),
                        ),
                      ),
                      selected: _payoutStatus == 'Released',
                      selectedColor: Colors.teal.withValues(alpha: 0.15),
                      onSelected: (selected) {
                        if (selected) {
                          setState(() => _payoutStatus = 'Released');
                        }
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Payment Mode Selection
              DropdownButtonFormField<String>(
                decoration: InputDecoration(
                  labelText: 'Payment Mode',
                  labelStyle: GoogleFonts.outfit(),
                  prefixIcon: const Icon(Icons.payment_rounded,
                      color: AppTheme.primaryTeal),
                ),
                initialValue:
                    _paymentMode.contains('(') ? 'Cash' : _paymentMode,
                items: const [
                  DropdownMenuItem(
                      value: 'Cash', child: TranslatedText('Cash')),
                  DropdownMenuItem(value: 'UPI', child: TranslatedText('UPI')),
                  DropdownMenuItem(
                      value: 'Bank Transfer',
                      child: TranslatedText('Bank Transfer')),
                  DropdownMenuItem(
                      value: 'Cheque', child: TranslatedText('Cheque')),
                  DropdownMenuItem(
                      value: 'Other', child: TranslatedText('Other')),
                ],
                onChanged: (val) {
                  if (val != null) {
                    setState(() => _paymentMode = val);
                  }
                },
              ),
              const SizedBox(height: 16),

              // Voice & Text Remarks
              TextFormField(
                controller: _remarksCtrl,
                maxLines: 2,
                decoration: InputDecoration(
                  labelText: 'Winner Remarks (Voice & Text)',
                  labelStyle: GoogleFonts.outfit(),
                  prefixIcon: const Icon(Icons.comment_rounded,
                      color: AppTheme.primaryTeal),
                  suffixIcon: IconButton(
                    icon: Icon(
                      _isListeningModal ? Icons.mic : Icons.mic_none_rounded,
                      color:
                          _isListeningModal ? Colors.red : AppTheme.primaryTeal,
                    ),
                    onPressed: _listenModalRemarks,
                  ),
                ),
              ),
              if (_isListeningModal) ...[
                const SizedBox(height: 6),
                Row(
                  children: [
                    const SizedBox(
                      width: 12,
                      height: 12,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.red),
                    ),
                    const SizedBox(width: 8),
                    TranslatedText(
                      'Listening...',
                      style: GoogleFonts.outfit(
                          fontSize: 12,
                          color: Colors.red,
                          fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ],
              const SizedBox(height: 16),

              if (_payoutStatus == 'Released') ...[
                Text(
                  'Money Paid to: $recipientName',
                  style: GoogleFonts.outfit(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: Colors.green),
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _winnerPaidCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Paid Amount (₹)',
                    prefixText: '₹',
                  ),
                  keyboardType: TextInputType.number,
                  validator: (value) => (double.tryParse(value ?? '') ?? -1) < 0
                      ? 'Invalid amount'
                      : null,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _winnerUpiCtrl,
                  decoration: InputDecoration(
                    labelText: 'Recipient ($recipientName) UPI ID',
                    prefixIcon: const Icon(Icons.payment_rounded,
                        color: AppTheme.primaryTeal),
                  ),
                  keyboardType: TextInputType.emailAddress,
                ),
                const SizedBox(height: 12),
                ElevatedButton.icon(
                  onPressed: () async {
                    final upiId = _winnerUpiCtrl.text.trim();
                    if (upiId.isEmpty) return;
                    final amount =
                        double.tryParse(_winnerPaidCtrl.text.trim()) ??
                            prizeAmount;
                    final upiUri = Uri.parse(
                        'upi://pay?pa=$upiId&pn=${Uri.encodeComponent(recipientName)}&am=${amount.toStringAsFixed(2)}&cu=INR&tn=${Uri.encodeComponent("SanghaSetu Winner Payout $monthLabel (${widget.item.group.name})")}');
                    final messenger = ScaffoldMessenger.of(context);
                    try {
                      if (await canLaunchUrl(upiUri)) {
                        await launchUrl(upiUri,
                            mode: LaunchMode.externalApplication);
                      } else {
                        messenger.showSnackBar(
                          const SnackBar(
                              content: TranslatedText(
                                  'No UPI application found on this device.')),
                        );
                      }
                    } catch (e) {
                      messenger.showSnackBar(
                        SnackBar(
                            content:
                                TranslatedText('Could not launch UPI: $e')),
                      );
                    }
                  },
                  icon: const Icon(Icons.launch_rounded),
                  label: TranslatedText('Open UPI Apps to Pay [#1]',
                      replacements: {'[#1]': recipientName}),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryTeal,
                    foregroundColor: Colors.white,
                    minimumSize: const Size.fromHeight(48),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    TranslatedText(
                      'Amount Paid: ₹${(double.tryParse(_winnerPaidCtrl.text) ?? 0.0).toStringAsFixed(0)}',
                      style: GoogleFonts.outfit(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: Colors.green),
                    ),
                    TranslatedText(
                      'Balance Left: ₹${(prizeAmount - (double.tryParse(_winnerPaidCtrl.text) ?? 0.0) > 0 ? prizeAmount - (double.tryParse(_winnerPaidCtrl.text) ?? 0.0) : 0.0).toStringAsFixed(0)}',
                      style: GoogleFonts.outfit(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: Colors.orange),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Material(
                  color: Colors.transparent,
                  child: ListTile(
                    contentPadding: EdgeInsets.zero,
                    title: TranslatedText(
                      'Payout Release Date',
                      style: GoogleFonts.outfit(
                          fontSize: 14, fontWeight: FontWeight.bold),
                    ),
                    subtitle: TranslatedText(
                      _payoutDate == null
                          ? 'Select Date'
                          : _payoutDate.toString().substring(0, 10),
                      style: GoogleFonts.outfit(),
                    ),
                    trailing: const Icon(Icons.calendar_today_rounded,
                        color: AppTheme.primaryTeal),
                    onTap: () async {
                      final picked = await showDatePicker(
                        context: context,
                        initialDate: _payoutDate ?? DateTime.now(),
                        firstDate: DateTime(2020),
                        lastDate: DateTime(2100),
                      );
                      if (picked != null) {
                        setState(() => _payoutDate = picked);
                      }
                    },
                  ),
                ),
                const SizedBox(height: 16),
              ],

              const SizedBox(height: 24),

              // Action Buttons
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed:
                          _isSaving ? null : () => Navigator.pop(context),
                      child:
                          TranslatedText('Cancel', style: GoogleFonts.outfit()),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: _isSaving ? null : _save,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primaryTeal,
                        foregroundColor: Colors.white,
                      ),
                      child: _isSaving
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                color: Colors.white,
                                strokeWidth: 2,
                              ),
                            )
                          : TranslatedText('Save Audit Log',
                              style: GoogleFonts.outfit()),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
