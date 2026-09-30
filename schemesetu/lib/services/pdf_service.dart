import 'package:collection/collection.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import '../models/group_model.dart';
import '../models/member_model.dart';
import '../models/payment_model.dart';
import '../models/winner_model.dart';

class PdfService {
  static final PdfService _instance = PdfService._internal();
  factory PdfService() => _instance;
  PdfService._internal();

  final PdfColor _brandColor = PdfColor.fromHex('#0D9488');
  final PdfColor _darkSlate = PdfColor.fromHex('#1E293B');
  final PdfColor _lightGrey = PdfColor.fromHex('#F8FAFC');
  final PdfColor _borderGrey = PdfColor.fromHex('#E2E8F0');

  pw.Font? _regularFont;
  pw.Font? _boldFont;
  pw.Font? _arabicFont;
  pw.Font? _teluguFont;
  pw.Font? _devanagariFont;
  Uint8List? _logoBytes;

  Future<void> _initFonts() async {
    if (_regularFont == null || _boldFont == null) {
      try {
        final regularData =
            await rootBundle.load('assets/fonts/NotoSans-Regular.ttf');
        _regularFont = pw.Font.ttf(regularData);
        final boldData =
            await rootBundle.load('assets/fonts/NotoSans-Bold.ttf');
        _boldFont = pw.Font.ttf(boldData);
      } catch (e) {
        _regularFont = pw.Font.helvetica();
        _boldFont = pw.Font.helveticaBold();
      }
    }
    if (_arabicFont == null || _teluguFont == null || _devanagariFont == null) {
      try {
        _arabicFont = await PdfGoogleFonts.notoSansArabicRegular();
        _teluguFont = await PdfGoogleFonts.notoSansTeluguRegular();
        _devanagariFont = await PdfGoogleFonts.notoSansDevanagariRegular();
      } catch (e) {
        debugPrint(
            'Dynamic Unicode fonts download failed, using standard fallbacks: $e');
      }
    }
    if (_logoBytes == null) {
      try {
        final logoData = await rootBundle.load('assets/images/logo.png');
        _logoBytes = logoData.buffer.asUint8List();
      } catch (e) {
        debugPrint('Failed to load logo asset for PDF service: $e');
      }
    }
  }

  pw.TextStyle _getTextStyleFor(String text,
      {required bool isBold, double fontSize = 10, PdfColor? color}) {
    pw.Font fontToUse = isBold
        ? (_boldFont ?? pw.Font.helveticaBold())
        : (_regularFont ?? pw.Font.helvetica());

    final urduRegex = RegExp(r'[\u0600-\u06FF]');
    final teluguRegex = RegExp(r'[\u0C00-\u0C7F]');
    final hindiRegex = RegExp(r'[\u0900-\u097F]');

    if (urduRegex.hasMatch(text) && _arabicFont != null) {
      fontToUse = _arabicFont!;
    } else if (teluguRegex.hasMatch(text) && _teluguFont != null) {
      fontToUse = _teluguFont!;
    } else if (hindiRegex.hasMatch(text) && _devanagariFont != null) {
      fontToUse = _devanagariFont!;
    }

    return pw.TextStyle(
      font: fontToUse,
      fontSize: fontSize,
      color: color,
    );
  }

  pw.Widget _buildUnicodeText(String text,
      {bool isBold = false, double fontSize = 10, PdfColor? color}) {
    return pw.Text(
      text,
      style: _getTextStyleFor(text,
          isBold: isBold, fontSize: fontSize, color: color),
    );
  }

  pw.Widget _buildUnicodeTable({
    required List<String> headers,
    required List<List<String>> data,
    Map<int, pw.TableColumnWidth>? columnWidths,
    pw.BoxDecoration? headerDecoration,
    pw.BoxDecoration? rowDecoration,
  }) {
    return pw.Table(
      border: pw.TableBorder.all(color: _borderGrey, width: 0.5),
      columnWidths: columnWidths,
      children: [
        // Header
        pw.TableRow(
          decoration: headerDecoration ?? pw.BoxDecoration(color: _brandColor),
          children: headers
              .map((h) => pw.Container(
                    padding: const pw.EdgeInsets.all(5),
                    child: _buildUnicodeText(h,
                        isBold: true, fontSize: 8, color: PdfColors.white),
                  ))
              .toList(),
        ),
        // Data Rows
        ...data.map((row) => pw.TableRow(
              decoration: rowDecoration,
              children: row
                  .map((cell) => pw.Container(
                        padding: const pw.EdgeInsets.all(5),
                        child: _buildUnicodeText(cell,
                            isBold: false, fontSize: 7.5),
                      ))
                  .toList(),
            )),
      ],
    );
  }

  pw.ThemeData _buildTheme() {
    if (_regularFont != null && _boldFont != null) {
      return pw.ThemeData.withFont(
        base: _regularFont,
        bold: _boldFont,
      );
    }
    return pw.ThemeData();
  }

  pw.Widget _buildHeaderBlock(String title, String subtitle) {
    return pw.Container(
      width: double.infinity,
      padding: const pw.EdgeInsets.all(16),
      decoration: pw.BoxDecoration(
        color: _brandColor,
        borderRadius: const pw.BorderRadius.all(pw.Radius.circular(8)),
      ),
      child: pw.Row(
        children: [
          if (_logoBytes != null)
            pw.Container(
              margin: const pw.EdgeInsets.only(right: 16),
              child:
                  pw.Image(pw.MemoryImage(_logoBytes!), width: 50, height: 50),
            ),
          pw.Expanded(
            child: pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                pw.Text('SANGHA SETU',
                    style: pw.TextStyle(
                        color: PdfColors.white,
                        fontSize: 22,
                        fontWeight: pw.FontWeight.bold,
                        letterSpacing: 1.5)),
                pw.SizedBox(height: 4),
                pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Text(title.toUpperCase(),
                        style: pw.TextStyle(
                            color: PdfColor.fromHex('#E2E8F0'),
                            fontSize: 11,
                            fontWeight: pw.FontWeight.bold)),
                    if (subtitle.isNotEmpty)
                      pw.Text(subtitle,
                          style: pw.TextStyle(
                              color: PdfColors.white,
                              fontSize: 11,
                              fontWeight: pw.FontWeight.bold)),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  pw.Widget _buildFooter() {
    return pw.Column(
      children: [
        pw.Divider(color: _borderGrey, thickness: 0.5),
        pw.SizedBox(height: 6),
        pw.Row(
          mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
          children: [
            pw.Text('Generated by SANGHA SETU',
                style:
                    const pw.TextStyle(fontSize: 8, color: PdfColors.grey600)),
            pw.Text('Official System Report',
                style:
                    const pw.TextStyle(fontSize: 8, color: PdfColors.grey600)),
          ],
        ),
      ],
    );
  }

  pw.PageTheme _buildPageTheme(pw.ThemeData theme) {
    return pw.PageTheme(
      theme: theme,
      pageFormat: PdfPageFormat.a4,
      margin: const pw.EdgeInsets.all(32),
      buildBackground: (pw.Context context) {
        return pw.FullPage(
          ignoreMargins: true,
          child: pw.Center(
            child: pw.Transform.rotateBox(
              angle: 0.5,
              child: pw.Text(
                'SANGHA SETU',
                style: pw.TextStyle(
                  fontSize: 60,
                  color: PdfColor.fromHex('#F1F5F9'),
                  fontWeight: pw.FontWeight.bold,
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  // Generate a generic Collection Report PDF
  Future<Uint8List> generateCollectionReport({
    required GroupModel group,
    required List<MemberModel> members,
    required List<PaymentModel> payments,
    required List<WinnerModel> winners,
    required String month,
    required DateTime startDate,
    required DateTime endDate,
  }) async {
    await _initFonts();
    final pdf = pw.Document(theme: _buildTheme());

    // Payments that belong to this group and were paid in the date range
    final groupPayments = payments
        .where((p) =>
            p.groupId == group.id &&
            p.paymentDate != null &&
            p.paymentDate!
                .isAfter(startDate.subtract(const Duration(days: 1))) &&
            p.paymentDate!.isBefore(endDate.add(const Duration(days: 1))))
        .toList();
    final totalMembers =
        members.where((m) => m.groupIds.contains(group.id)).toList();

    // Winners in this date range for this group
    final periodWinners = winners
        .where((w) =>
            w.groupId == group.id &&
            w.date.isAfter(startDate.subtract(const Duration(days: 1))) &&
            w.date.isBefore(endDate.add(const Duration(days: 1))))
        .toList();

    double totalExpected = group.installment * group.totalMembers;
    double totalCollected = groupPayments
        .where((p) => p.isPaid)
        .fold(0.0, (sum, p) => sum + p.amount);
    double totalPending = totalExpected - totalCollected;

    pdf.addPage(
      pw.MultiPage(
        pageTheme: _buildPageTheme(_buildTheme()),
        build: (pw.Context context) {
          return [
            _buildHeaderBlock('Collection Report', 'Month: $month'),
            pw.SizedBox(height: 20),
            pw.Row(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                pw.Expanded(
                  child: pw.Container(
                    padding: const pw.EdgeInsets.all(12),
                    decoration: pw.BoxDecoration(
                      color: _lightGrey,
                      borderRadius:
                          const pw.BorderRadius.all(pw.Radius.circular(8)),
                      border: pw.Border.all(color: _borderGrey),
                    ),
                    child: pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.start,
                      children: [
                        pw.Text('Group Details',
                            style: pw.TextStyle(
                                fontSize: 12,
                                fontWeight: pw.FontWeight.bold,
                                color: _brandColor)),
                        pw.SizedBox(height: 6),
                        pw.Text('Group Name: ${group.name}',
                            style: const pw.TextStyle(fontSize: 10)),
                        pw.Text(
                            'Installment: INR ${group.installment.toStringAsFixed(0)}',
                            style: const pw.TextStyle(fontSize: 10)),
                        pw.Text('Total Members: ${group.totalMembers}',
                            style: const pw.TextStyle(fontSize: 10)),
                      ],
                    ),
                  ),
                ),
                pw.SizedBox(width: 16),
                pw.Expanded(
                  child: pw.Container(
                    padding: const pw.EdgeInsets.all(12),
                    decoration: pw.BoxDecoration(
                      color: _lightGrey,
                      borderRadius:
                          const pw.BorderRadius.all(pw.Radius.circular(8)),
                      border: pw.Border.all(color: _borderGrey),
                    ),
                    child: pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.start,
                      children: [
                        pw.Text('Financial Summary',
                            style: pw.TextStyle(
                                fontSize: 12,
                                fontWeight: pw.FontWeight.bold,
                                color: _brandColor)),
                        pw.SizedBox(height: 6),
                        pw.Text(
                            'Expected: INR ${totalExpected.toStringAsFixed(0)}',
                            style: const pw.TextStyle(fontSize: 10)),
                        pw.Text(
                            'Collected: INR ${totalCollected.toStringAsFixed(0)}',
                            style: const pw.TextStyle(
                                fontSize: 10, color: PdfColors.green)),
                        pw.Text(
                            'Pending: INR ${totalPending.toStringAsFixed(0)}',
                            style: const pw.TextStyle(
                                fontSize: 10, color: PdfColors.red)),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            if (periodWinners.isNotEmpty) ...[
              pw.SizedBox(height: 16),
              pw.Container(
                padding: const pw.EdgeInsets.all(12),
                decoration: pw.BoxDecoration(
                  color: PdfColor.fromHex('#FFFBEB'),
                  borderRadius:
                      const pw.BorderRadius.all(pw.Radius.circular(8)),
                  border: pw.Border.all(color: PdfColor.fromHex('#FDE68A')),
                ),
                child: pw.Column(
                  crossAxisAlignment: pw.CrossAxisAlignment.start,
                  children: [
                    pw.Text('Winners this Period',
                        style: pw.TextStyle(
                            fontSize: 12,
                            fontWeight: pw.FontWeight.bold,
                            color: PdfColor.fromHex('#D97706'))),
                    pw.SizedBox(height: 6),
                    ...periodWinners.map((w) {
                      final winnerMember = members.firstWhere(
                          (m) => m.id == w.memberId,
                          orElse: () => MemberModel(
                              id: '',
                              name: 'Unknown',
                              mobile: '',
                              address: '',
                              groupIds: []));
                      String winnerName = winnerMember.name;
                      if (w.exchangedToMemberId != null) {
                        final exMember = members.firstWhereOrNull(
                            (mem) => mem.id == w.exchangedToMemberId);
                        if (exMember != null) {
                          winnerName += ' (Prize paid to: ${exMember.name})';
                        }
                      }
                      return pw.Padding(
                        padding: const pw.EdgeInsets.only(bottom: 4),
                        child: _buildUnicodeText(
                            '$winnerName - Prize: INR ${w.winnerBalance.toStringAsFixed(0)} | Paid: INR ${w.winnerPaid.toStringAsFixed(0)} | Mode: ${w.paymentMode} on ${w.date.toString().substring(0, 10)}',
                            fontSize: 9),
                      );
                    }),
                  ],
                ),
              ),
            ],
            pw.SizedBox(height: 24),
            pw.Text('Member Installment Breakdown',
                style: pw.TextStyle(
                    fontSize: 12,
                    fontWeight: pw.FontWeight.bold,
                    color: _darkSlate)),
            pw.SizedBox(height: 8),
            _buildUnicodeTable(
              headers: [
                'Member Name',
                'Overall Amount',
                'Mode',
                'Time',
                'Summary',
                'Due Date',
                'Late'
              ],
              data: totalMembers.map((m) {
                final memberPayments =
                    groupPayments.where((p) => p.memberId == m.id).toList();

                if (memberPayments.isEmpty) {
                  return [
                    m.name,
                    'PENDING',
                    '-',
                    '-',
                    '-',
                    'Day ${group.paymentDueDate}',
                    '-',
                  ];
                }

                double totalPaid =
                    memberPayments.fold(0.0, (sum, p) => sum + p.amount);
                bool isFullyPaid = memberPayments.any((p) => p.isPaid) ||
                    totalPaid >= group.installment;
                bool isLate = memberPayments.any((p) => p.isLate);

                String amountStr;
                String modeStr;
                String timeStr;
                String summaryStr;
                final days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

                if (memberPayments.length == 1) {
                  final p = memberPayments.first;
                  amountStr = p.isPaid
                      ? 'INR ${p.amount.toStringAsFixed(0)}'
                      : 'PENDING';
                  modeStr = (p.method != null && p.method!.isNotEmpty)
                      ? p.method!
                      : (p.isPaid ? 'Cash' : '-');
                  timeStr = p.paymentDate != null
                      ? '${p.paymentDate!.day}/${p.paymentDate!.month}/${p.paymentDate!.year} (${days[p.paymentDate!.weekday - 1]}) ${p.paymentDate!.hour.toString().padLeft(2, '0')}:${p.paymentDate!.minute.toString().padLeft(2, '0')}'
                      : '-';
                  summaryStr = (p.reference != null && p.reference!.isNotEmpty)
                      ? p.reference!
                      : '-';
                } else {
                  amountStr =
                      '${memberPayments.map((p) => p.amount.toStringAsFixed(0)).join(' + ')}\n= INR ${totalPaid.toStringAsFixed(0)}';
                  modeStr = memberPayments
                      .map((p) => (p.method != null && p.method!.isNotEmpty)
                          ? p.method!
                          : 'Cash')
                      .join('\n');
                  timeStr = memberPayments
                      .map((p) => p.paymentDate != null
                          ? '${p.paymentDate!.day}/${p.paymentDate!.month} (${days[p.paymentDate!.weekday - 1]})'
                          : '-')
                      .join('\n');
                  summaryStr = memberPayments
                      .map((p) =>
                          (p.reference != null && p.reference!.isNotEmpty)
                              ? p.reference!
                              : '-')
                      .join('\n');
                }

                final dueDateStr = 'Day ${group.paymentDueDate}';

                return [
                  m.name,
                  amountStr,
                  modeStr,
                  timeStr,
                  summaryStr,
                  dueDateStr,
                  isLate ? 'YES' : (isFullyPaid ? 'NO' : '-'),
                ];
              }).toList(),
            ),
            pw.SizedBox(height: 20),
            _buildFooter(),
          ];
        },
      ),
    );

    return pdf.save();
  }

  // Generate Pending Dues Report PDF
  Future<Uint8List> generatePendingReport({
    GroupModel? group,
    required List<GroupModel> groups,
    required List<MemberModel> members,
    required List<PaymentModel> payments,
  }) async {
    await _initFonts();
    final pdf = pw.Document(theme: _buildTheme());

    var pendingPayments = payments.where((p) => !p.isPaid).toList();
    if (group != null) {
      pendingPayments =
          pendingPayments.where((p) => p.groupId == group.id).toList();
    }

    pdf.addPage(
      pw.MultiPage(
        pageTheme: _buildPageTheme(_buildTheme()),
        build: (pw.Context context) {
          return [
            _buildHeaderBlock('Pending Dues Report',
                group != null ? group.name : 'All Groups'),
            pw.SizedBox(height: 20),
            _buildUnicodeTable(
              headers: [
                'Member Name',
                'Mobile',
                'Group Name',
                'Pending Months',
                'Total Due Amount'
              ],
              data: () {
                final pendingMap = <String, List<PaymentModel>>{};
                for (var p in pendingPayments) {
                  final key = '${p.memberId}_${p.groupId}';
                  pendingMap.putIfAbsent(key, () => []).add(p);
                }
                return pendingMap.values.map((memberPendingList) {
                  final firstP = memberPendingList.first;
                  final m = members.firstWhere((m) => m.id == firstP.memberId,
                      orElse: () => MemberModel(
                          id: '',
                          name: 'Unknown',
                          mobile: '',
                          address: '',
                          groupIds: []));
                  final g = groups.firstWhere((g) => g.id == firstP.groupId,
                      orElse: () => GroupModel(
                          id: '',
                          name: 'Unknown',
                          installment: 0,
                          totalMembers: 0,
                          startDate: DateTime.now(),
                          durationMonths: 12));
                  final totalDue = memberPendingList.fold<double>(
                      0, (sum, p) => sum + p.amount);
                  final monthsStr =
                      memberPendingList.map((p) => p.month).join(', ');
                  return [
                    m.name,
                    m.mobile,
                    g.name,
                    monthsStr,
                    'INR ${totalDue.toStringAsFixed(0)}',
                  ];
                }).toList();
              }(),
            ),
            ..._buildPdfLatePayersSection(pendingPayments, members, groups),
            pw.SizedBox(height: 20),
            _buildFooter(),
          ];
        },
      ),
    );

    return pdf.save();
  }

  // Generate Winner Report PDF
  Future<pw.Document> generateWinnerReportDoc({
    GroupModel? group,
    required List<GroupModel> groups,
    required List<MemberModel> members,
    required List<WinnerModel> winners,
    required List<PaymentModel> payments,
  }) async {
    await _initFonts();
    final pdf = pw.Document(theme: _buildTheme());

    var filteredWinners = winners;
    if (group != null) {
      filteredWinners =
          filteredWinners.where((w) => w.groupId == group.id).toList();
    }

    pdf.addPage(
      pw.MultiPage(
        pageTheme: _buildPageTheme(_buildTheme()),
        build: (pw.Context context) {
          return [
            _buildHeaderBlock('Winners History Report',
                group != null ? group.name : 'All Groups'),
            pw.SizedBox(height: 20),
            _buildUnicodeTable(
              headers: [
                'Month',
                'Group Name',
                'Winner Name',
                'Prize Value',
                'Paid to Winner',
                'Payout Balance',
                'Payout Mode & Date',
                'Status / Remarks'
              ],
              data: filteredWinners.map((w) {
                final m = members.firstWhere((m) => m.id == w.memberId,
                    orElse: () => MemberModel(
                        id: '',
                        name: 'Unknown',
                        mobile: '',
                        address: '',
                        groupIds: []));
                final g = groups.firstWhere((g) => g.id == w.groupId,
                    orElse: () => GroupModel(
                        id: '',
                        name: 'Unknown',
                        installment: 0,
                        totalMembers: 0,
                        startDate: DateTime.now(),
                        durationMonths: 12));

                String winnerName = m.name;
                if (w.exchangedToMemberId != null) {
                  final exMember = members.firstWhereOrNull(
                      (mem) => mem.id == w.exchangedToMemberId);
                  if (exMember != null) {
                    winnerName += '\n(Prize paid to: ${exMember.name})';
                  }
                }

                final payoutDateStr = w.payoutDate != null
                    ? w.payoutDate.toString().substring(0, 10)
                    : '-';
                final drawDateStr = w.date.toString().substring(0, 10);

                return [
                  w.month,
                  g.name,
                  winnerName,
                  'INR ${w.winnerBalance.toStringAsFixed(0)}',
                  'INR ${w.winnerPaid.toStringAsFixed(0)}',
                  'INR ${w.winnerLeft.toStringAsFixed(0)}',
                  '${w.paymentMode}\n(Paid: $payoutDateStr)\n(Draw: $drawDateStr)',
                  '${w.payoutStatus}${w.exchangeNote != null && w.exchangeNote!.isNotEmpty ? '\nNote: ${w.exchangeNote}' : ''}',
                ];
              }).toList(),
            ),
            pw.SizedBox(height: 20),
            _buildFooter(),
          ];
        },
      ),
    );

    return pdf;
  }

  // Generate Overall Data Report PDF
  Future<Uint8List> generateOverallDataReport({
    required GroupModel group,
    required List<MemberModel> members,
    required List<PaymentModel> payments,
    required List<WinnerModel> winners,
    DateTime? startDate,
    DateTime? endDate,
  }) async {
    await _initFonts();
    final pdf = pw.Document(theme: _buildTheme());

    // Calculations
    final groupPayments = payments.where((p) => p.groupId == group.id).toList();
    final groupWinners = winners.where((w) => w.groupId == group.id).toList();

    final totalCollections = groupPayments
        .where((p) => p.isPaid)
        .fold<double>(0, (sum, p) => sum + p.amount);
    final totalPending = groupPayments
        .where((p) => !p.isPaid)
        .fold<double>(0, (sum, p) => sum + p.amount);

    // Sum winnerPaid for total prizes paid
    final totalPrizePaid =
        groupWinners.fold<double>(0, (sum, w) => sum + w.winnerPaid);

    final totalMonths = group.durationMonths;
    final int monthsPassed = groupWinners.length;
    final int monthsLeft = (totalMonths - monthsPassed).clamp(0, totalMonths);

    final String monthName;
    if (startDate != null) {
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
      monthName = '${months[startDate.month - 1]} ${startDate.year}';
    } else {
      monthName = DateTime.now().month.toString();
    }

    pdf.addPage(
      pw.MultiPage(
        pageTheme: _buildPageTheme(_buildTheme()),
        build: (pw.Context context) {
          return [
            _buildHeaderBlock('Overall Data Report', monthName),
            pw.SizedBox(height: 20),
            pw.Text('Group Details',
                style: pw.TextStyle(
                    fontSize: 14,
                    fontWeight: pw.FontWeight.bold,
                    color: _brandColor)),
            pw.SizedBox(height: 10),
            pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                children: [
                  pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.start,
                      children: [
                        pw.Text('Group Name: ${group.name}',
                            style: const pw.TextStyle(fontSize: 10)),
                        pw.Text('Total Months: $totalMonths',
                            style: const pw.TextStyle(fontSize: 10)),
                        pw.Text('Months Left: $monthsLeft',
                            style: const pw.TextStyle(fontSize: 10)),
                      ]),
                  pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.start,
                      children: [
                        pw.Text(
                            'Installment: INR ${group.installment.toStringAsFixed(0)}',
                            style: const pw.TextStyle(fontSize: 10)),
                        pw.Text(
                            'Overall Amount: INR ${(group.installment * group.totalMembers).toStringAsFixed(0)}',
                            style: const pw.TextStyle(fontSize: 10)),
                        pw.Text('Report Month: $monthName',
                            style: const pw.TextStyle(fontSize: 10)),
                      ]),
                ]),
            pw.SizedBox(height: 20),
            pw.Text('Financial Summary',
                style: pw.TextStyle(
                    fontSize: 14,
                    fontWeight: pw.FontWeight.bold,
                    color: _brandColor)),
            pw.SizedBox(height: 10),
            pw.Container(
              padding: const pw.EdgeInsets.all(12),
              decoration: pw.BoxDecoration(
                color: _lightGrey,
                borderRadius: const pw.BorderRadius.all(pw.Radius.circular(8)),
                border: pw.Border.all(color: _borderGrey),
              ),
              child: pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                children: [
                  pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.start,
                    children: [
                      pw.Text('Collections',
                          style: const pw.TextStyle(
                              fontSize: 10, color: PdfColors.grey700)),
                      pw.Text('INR ${totalCollections.toStringAsFixed(0)}',
                          style: pw.TextStyle(
                              fontSize: 12,
                              fontWeight: pw.FontWeight.bold,
                              color: PdfColors.green700)),
                    ],
                  ),
                  pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.start,
                    children: [
                      pw.Text('Pending',
                          style: const pw.TextStyle(
                              fontSize: 10, color: PdfColors.grey700)),
                      pw.Text('INR ${totalPending.toStringAsFixed(0)}',
                          style: pw.TextStyle(
                              fontSize: 12,
                              fontWeight: pw.FontWeight.bold,
                              color: PdfColors.red700)),
                    ],
                  ),
                  pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.start,
                    children: [
                      pw.Text('Winners Paid',
                          style: const pw.TextStyle(
                              fontSize: 10, color: PdfColors.grey700)),
                      pw.Text('INR ${totalPrizePaid.toStringAsFixed(0)}',
                          style: pw.TextStyle(
                              fontSize: 12,
                              fontWeight: pw.FontWeight.bold,
                              color: PdfColors.blue700)),
                    ],
                  ),
                ],
              ),
            ),
            pw.SizedBox(height: 20),
            pw.Text('Recent Payment History',
                style: pw.TextStyle(
                    fontSize: 14,
                    fontWeight: pw.FontWeight.bold,
                    color: _brandColor)),
            pw.SizedBox(height: 10),
            pw.Table(
              border: pw.TableBorder.all(color: _borderGrey, width: 0.5),
              columnWidths: {
                0: const pw.FlexColumnWidth(2),
                1: const pw.FlexColumnWidth(1.2),
                2: const pw.FlexColumnWidth(1.2),
                3: const pw.FlexColumnWidth(1),
                4: const pw.FlexColumnWidth(2.2),
                5: const pw.FlexColumnWidth(0.8),
              },
              children: [
                pw.TableRow(
                  decoration: pw.BoxDecoration(color: _brandColor),
                  children:
                      ['Member Name', 'Month', 'Amount', 'Mode', 'Date', 'Late']
                          .map((h) => pw.Container(
                                padding: const pw.EdgeInsets.all(5),
                                alignment: h == 'Late'
                                    ? pw.Alignment.center
                                    : pw.Alignment.centerLeft,
                                child: _buildUnicodeText(h,
                                    isBold: true,
                                    fontSize: 8.5,
                                    color: PdfColors.white),
                              ))
                          .toList(),
                ),
                ...groupPayments.take(30).map((p) {
                  final m = members.firstWhere((m) => m.id == p.memberId,
                      orElse: () => MemberModel(
                          id: '',
                          name: 'Unknown',
                          mobile: '',
                          address: '',
                          groupIds: []));
                  final isLate = p.isLate;
                  final days = [
                    'Mon',
                    'Tue',
                    'Wed',
                    'Thu',
                    'Fri',
                    'Sat',
                    'Sun'
                  ];
                  final dateStr = p.paymentDate != null
                      ? '${p.paymentDate!.day}/${p.paymentDate!.month}/${p.paymentDate!.year} (${days[p.paymentDate!.weekday - 1]})'
                      : '-';
                  final mode = (p.method != null && p.method!.isNotEmpty)
                      ? p.method!
                      : (p.isPaid ? 'Cash' : '-');

                  final rowBgColor =
                      isLate ? PdfColor.fromHex('#FEE2E2') : PdfColors.white;
                  final textColor =
                      isLate ? PdfColor.fromHex('#991B1B') : PdfColors.black;

                  return pw.TableRow(
                    decoration: pw.BoxDecoration(color: rowBgColor),
                    children: [
                      pw.Container(
                          padding: const pw.EdgeInsets.all(5),
                          child: _buildUnicodeText(m.name,
                              color: textColor, fontSize: 8)),
                      pw.Container(
                          padding: const pw.EdgeInsets.all(5),
                          child: _buildUnicodeText(p.month,
                              color: textColor, fontSize: 8)),
                      pw.Container(
                          padding: const pw.EdgeInsets.all(5),
                          child: _buildUnicodeText(
                              'INR ${p.amount.toStringAsFixed(0)}',
                              color: textColor,
                              fontSize: 8)),
                      pw.Container(
                          padding: const pw.EdgeInsets.all(5),
                          child: _buildUnicodeText(mode,
                              color: textColor, fontSize: 8)),
                      pw.Container(
                          padding: const pw.EdgeInsets.all(5),
                          child: _buildUnicodeText(dateStr,
                              color: textColor, fontSize: 8)),
                      pw.Container(
                        padding: const pw.EdgeInsets.all(5),
                        alignment: pw.Alignment.center,
                        child: _buildUnicodeText(isLate ? 'YES' : 'NO',
                            isBold: isLate, color: textColor, fontSize: 8),
                      ),
                    ],
                  );
                }),
              ],
            ),
            pw.SizedBox(height: 20),
            pw.Text('Member Contributions Summary',
                style: pw.TextStyle(
                    fontSize: 14,
                    fontWeight: pw.FontWeight.bold,
                    color: _brandColor)),
            pw.SizedBox(height: 10),
            pw.Table(
              border: pw.TableBorder.all(color: _borderGrey, width: 0.5),
              columnWidths: {
                0: const pw.FlexColumnWidth(2),
                1: const pw.FlexColumnWidth(1.2),
                2: const pw.FlexColumnWidth(1.5),
                3: const pw.FlexColumnWidth(1.2),
                4: const pw.FlexColumnWidth(0.8),
              },
              children: [
                pw.TableRow(
                  decoration: pw.BoxDecoration(color: _brandColor),
                  children: [
                    'Member Name',
                    'Total Paid',
                    'Modes',
                    'Last Payment',
                    'Late Status'
                  ]
                      .map((h) => pw.Container(
                            padding: const pw.EdgeInsets.all(4),
                            alignment: h == 'Late Status'
                                ? pw.Alignment.center
                                : pw.Alignment.centerLeft,
                            child: _buildUnicodeText(h,
                                isBold: true,
                                fontSize: 9,
                                color: PdfColors.white),
                          ))
                      .toList(),
                ),
                ...members.where((m) => m.groupIds.contains(group.id)).map((m) {
                  final isWinner = groupWinners.any((w) => w.memberId == m.id);
                  final rowColor =
                      isWinner ? PdfColor.fromHex('#FFF9C4') : PdfColors.white;

                  final mPayments = groupPayments
                      .where((p) => p.memberId == m.id && p.isPaid)
                      .toList();
                  String totalAmountStr = 'INR 0';
                  String modesStr = '-';
                  String lastDateStr = '-';
                  String lateStr = '-';

                  if (mPayments.isNotEmpty) {
                    final totalAmount =
                        mPayments.fold<double>(0, (sum, p) => sum + p.amount);
                    totalAmountStr = 'INR ${totalAmount.toStringAsFixed(0)}';
                    modesStr = mPayments
                        .map((p) => (p.method != null && p.method!.isNotEmpty)
                            ? p.method!
                            : 'Cash')
                        .toSet()
                        .join(', ');
                    mPayments.sort((a, b) => (b.paymentDate ?? DateTime(2000))
                        .compareTo(a.paymentDate ?? DateTime(2000)));
                    lastDateStr = mPayments.first.paymentDate != null
                        ? mPayments.first.paymentDate
                            .toString()
                            .substring(0, 10)
                        : '-';
                    lateStr = mPayments.any((p) => p.isLate) ? 'YES' : 'NO';
                  }

                  return pw.TableRow(
                    decoration: pw.BoxDecoration(color: rowColor),
                    children: [
                      m.name,
                      totalAmountStr,
                      modesStr.isEmpty ? '-' : modesStr,
                      lastDateStr,
                      lateStr,
                    ]
                        .asMap()
                        .entries
                        .map((e) => pw.Container(
                              padding: const pw.EdgeInsets.all(4),
                              alignment: e.key == 4
                                  ? pw.Alignment.center
                                  : pw.Alignment.centerLeft,
                              child: _buildUnicodeText(e.value, fontSize: 8),
                            ))
                        .toList(),
                  );
                }),
              ],
            ),
            if (groupWinners.isNotEmpty) ...[
              pw.SizedBox(height: 20),
              pw.Text('Winners Overall Details',
                  style: pw.TextStyle(
                      fontSize: 14,
                      fontWeight: pw.FontWeight.bold,
                      color: _brandColor)),
              pw.SizedBox(height: 10),
              _buildUnicodeTable(
                headers: [
                  'Month',
                  'Winner Name',
                  'Location',
                  'Prize Value',
                  'Paid to Winner',
                  'Payout Balance',
                  'Payout Mode & Date',
                  'Status / Remarks'
                ],
                data: groupWinners.map((w) {
                  final m = members.firstWhere((m) => m.id == w.memberId,
                      orElse: () => MemberModel(
                          id: '',
                          name: 'Unknown',
                          mobile: '',
                          address: '',
                          groupIds: []));
                  final location = m.address.isNotEmpty ? m.address : '-';

                  String winnerName = m.name;
                  if (w.exchangedToMemberId != null) {
                    final exMember = members.firstWhereOrNull(
                        (mem) => mem.id == w.exchangedToMemberId);
                    if (exMember != null) {
                      winnerName += '\n(Prize paid to: ${exMember.name})';
                    }
                  }

                  final payoutDateStr = w.payoutDate != null
                      ? w.payoutDate.toString().substring(0, 10)
                      : '-';
                  final drawDateStr = w.date.toString().substring(0, 10);

                  return [
                    w.month,
                    winnerName,
                    location,
                    'INR ${w.winnerBalance.toStringAsFixed(0)}',
                    'INR ${w.winnerPaid.toStringAsFixed(0)}',
                    'INR ${w.winnerLeft.toStringAsFixed(0)}',
                    '${w.paymentMode}\n(Paid: $payoutDateStr)\n(Draw: $drawDateStr)',
                    '${w.payoutStatus}${w.exchangeNote != null && w.exchangeNote!.isNotEmpty ? '\nNote: ${w.exchangeNote}' : ''}',
                  ];
                }).toList(),
              ),
            ],
            ..._buildPdfLatePayersSection(groupPayments, members, [group],
                startDate: startDate, endDate: endDate),
            pw.SizedBox(height: 20),
            _buildFooter(),
          ];
        },
      ),
    );

    return pdf.save();
  }

  Future<void> printReport(Uint8List pdfData) async {
    await Printing.layoutPdf(
      onLayout: (PdfPageFormat format) async => pdfData,
    );
  }

  Future<void> shareReport(Uint8List pdfData, String filename) async {
    await Printing.sharePdf(bytes: pdfData, filename: filename);
  }

  Future<Uint8List> generateMemberLedgerReport({
    required String memberName,
    required String memberPhone,
    required String memberStatus,
    required List<Map<String, dynamic>> paymentHistory,
  }) async {
    await _initFonts();
    final pdf = pw.Document(theme: _buildTheme());
    final pageTheme = _buildPageTheme(_buildTheme());

    pdf.addPage(
      pw.MultiPage(
        pageTheme: pageTheme,
        build: (pw.Context context) {
          return [
            _buildHeaderBlock('MEMBER PAYMENT LEDGER', memberName),
            pw.SizedBox(height: 16),
            pw.Text('Personal Details',
                style:
                    pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 14)),
            pw.SizedBox(height: 8),
            pw.Row(
              mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
              children: [
                pw.Text('Phone: ${memberPhone.isEmpty ? "N/A" : memberPhone}'),
                pw.Text('Status: $memberStatus'),
              ],
            ),
            pw.SizedBox(height: 16),
            pw.Text('Payment History',
                style:
                    pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 14)),
            pw.SizedBox(height: 8),
            _buildUnicodeTable(
              headers: ['Round', 'Group', 'Amount', 'Date', 'Mode', 'Status'],
              data: paymentHistory.map((p) {
                return [
                  p['round']?.toString() ?? '',
                  p['group']?.toString() ?? '',
                  'Rs. ${p['amount']?.toString() ?? '0'}',
                  p['date']?.toString() ?? '-',
                  p['mode']?.toString() ?? 'Cash',
                  p['status']?.toString() ?? 'Pending',
                ];
              }).toList(),
            ),
            pw.SizedBox(height: 20),
            _buildFooter(),
          ];
        },
      ),
    );

    return pdf.save();
  }

  List<pw.Widget> _buildPdfLatePayersSection(
    List<PaymentModel> payments,
    List<MemberModel> members,
    List<GroupModel> groups, {
    DateTime? startDate,
    DateTime? endDate,
  }) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    var latePayments =
        payments.where((p) => p.isLate && p.paymentDate != null).toList();
    if (startDate != null && endDate != null) {
      latePayments = latePayments.where((p) {
        final parts = p.month.split('-');
        if (parts.length < 2) return false;
        final year = int.parse(parts[0]);
        final month = int.parse(parts[1]);
        final g = groups.firstWhereOrNull((group) => group.id == p.groupId);
        final dueDate = DateTime(year, month, g?.paymentDueDate ?? 10);
        return dueDate.isAfter(startDate.subtract(const Duration(days: 1))) &&
            dueDate.isBefore(endDate.add(const Duration(days: 1)));
      }).toList();
    }
    if (latePayments.isEmpty) return [];

    final Map<String, List<PaymentModel>> lateByMember = {};
    for (final p in latePayments) {
      lateByMember.putIfAbsent(p.memberId, () => []).add(p);
    }

    final totalLateAmt = latePayments.fold<double>(0, (s, p) => s + p.amount);

    return [
      pw.SizedBox(height: 20),
      pw.Container(
        padding: const pw.EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: pw.BoxDecoration(
          color: PdfColor.fromHex('#FEE2E2'),
          borderRadius: const pw.BorderRadius.all(pw.Radius.circular(6)),
          border: pw.Border.all(color: PdfColor.fromHex('#FCA5A5'), width: 1),
        ),
        child: pw.Row(
          mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
          children: [
            pw.Text(
              'LATE PAYERS SUMMARY',
              style: pw.TextStyle(
                fontSize: 10,
                fontWeight: pw.FontWeight.bold,
                color: PdfColor.fromHex('#991B1B'),
              ),
            ),
            pw.Text(
              'TOTAL OVERDUE/LATE: INR ${totalLateAmt.toStringAsFixed(0)}',
              style: pw.TextStyle(
                fontSize: 10,
                fontWeight: pw.FontWeight.bold,
                color: PdfColor.fromHex('#991B1B'),
              ),
            ),
          ],
        ),
      ),
      pw.SizedBox(height: 8),
      _buildUnicodeTable(
        headers: [
          'Member Name',
          'Group Name',
          'Month',
          'Amount',
          'Status / Days Late'
        ],
        headerDecoration: pw.BoxDecoration(color: PdfColor.fromHex('#DC2626')),
        data: () {
          final List<List<String>> tableData = [];
          for (final entry in lateByMember.entries) {
            final memberId = entry.key;
            final memberPayments = entry.value;
            final member = members.firstWhereOrNull((m) => m.id == memberId);
            final memberName = member?.name ?? 'Member';

            // Key: groupId_month_statusText
            final Map<String, double> aggregatedAmounts = {};
            final Map<String, String> keyToGroupName = {};
            final Map<String, String> keyToMonth = {};
            final Map<String, String> keyToStatus = {};

            for (final p in memberPayments) {
              final g =
                  groups.firstWhereOrNull((group) => group.id == p.groupId);
              final groupName = g?.name ?? '-';

              final parts = p.month.split('-');
              if (parts.length < 2) continue;
              final year = int.parse(parts[0]);
              final month = int.parse(parts[1]);
              final dueDate = DateTime(year, month, g?.paymentDueDate ?? 10);

              final int daysLate;
              if (p.isPaid) {
                final payDay = DateTime(p.paymentDate!.year,
                    p.paymentDate!.month, p.paymentDate!.day);
                final dueDay =
                    DateTime(dueDate.year, dueDate.month, dueDate.day);
                daysLate = payDay.difference(dueDay).inDays.clamp(0, 9999);
              } else {
                final dueDay =
                    DateTime(dueDate.year, dueDate.month, dueDate.day);
                daysLate = today.difference(dueDay).inDays.clamp(0, 9999);
              }

              final statusText = p.isPaid
                  ? 'Paid late ($daysLate days)'
                  : 'Pending ($daysLate days late)';

              final key = '${g?.id}_${p.month}_$statusText';
              aggregatedAmounts[key] = (aggregatedAmounts[key] ?? 0) + p.amount;
              keyToGroupName[key] = groupName;
              keyToMonth[key] = p.month;
              keyToStatus[key] = statusText;
            }

            for (final key in aggregatedAmounts.keys) {
              tableData.add([
                memberName,
                keyToGroupName[key]!,
                keyToMonth[key]!,
                'INR ${aggregatedAmounts[key]!.toStringAsFixed(0)}',
                keyToStatus[key]!,
              ]);
            }
          }
          return tableData;
        }(),
      ),
    ];
  }
}

// SHG PDF extension
extension SHGPdfReports on PdfService {
  /// Generate a summary report for an SHG group
  Future<Uint8List> generateSHGGroupReport({
    required String groupName,
    required List<Map<String, dynamic>> members,
    required double totalSavings,
    required int activeLoans,
    required List<Map<String, dynamic>> meetings,
  }) async {
    await _initFonts();
    final pdf = pw.Document(theme: _buildTheme());

    pdf.addPage(
      pw.MultiPage(
        pageTheme: _buildPageTheme(_buildTheme()),
        build: (context) => [
          _buildHeaderBlock('SHG GROUP REPORT', groupName),
          pw.SizedBox(height: 16),

          // Summary metrics
          pw.Row(
            mainAxisAlignment: pw.MainAxisAlignment.spaceAround,
            children: [
              _buildMetricBox(
                  'Total Members', '${members.length}', PdfColors.blue700),
              _buildMetricBox('Total Savings',
                  '₹${totalSavings.toStringAsFixed(0)}', PdfColors.green700),
              _buildMetricBox('Active Loans', '$activeLoans', PdfColors.orange),
            ],
          ),
          pw.SizedBox(height: 20),

          // Members table
          pw.Text('Members',
              style: pw.TextStyle(
                  fontSize: 13,
                  fontWeight: pw.FontWeight.bold,
                  color: _brandColor)),
          pw.SizedBox(height: 8),
          _buildUnicodeTable(
            headers: ['Member ID', 'Role', 'Joined Date'],
            data: members
                .map((m) => [
                      m['memberId']?.toString() ?? '-',
                      m['role']?.toString() ?? '-',
                      m['joinedAt']?.toString().split('T').first ?? '-',
                    ])
                .toList(),
          ),
          pw.SizedBox(height: 20),

          // Recent meetings
          if (meetings.isNotEmpty) ...[
            pw.Text('Recent Meetings',
                style: pw.TextStyle(
                    fontSize: 13,
                    fontWeight: pw.FontWeight.bold,
                    color: _brandColor)),
            pw.SizedBox(height: 8),
            _buildUnicodeTable(
              headers: ['Date', 'Notes'],
              data: meetings
                  .take(10)
                  .map((m) => [
                        m['meetingDate']?.toString().split('T').first ?? '-',
                        m['notes']?.toString() ?? '-',
                      ])
                  .toList(),
            ),
          ],

          pw.SizedBox(height: 20),
          _buildFooter(),
        ],
      ),
    );

    return pdf.save();
  }

  /// Generate a printable savings passbook for an SHG member
  Future<Uint8List> generateSHGMemberPassbook({
    required String memberName,
    required String groupName,
    required List<Map<String, dynamic>> savings,
    required List<Map<String, dynamic>> loans,
  }) async {
    await _initFonts();
    final pdf = pw.Document(theme: _buildTheme());
    final totalSavings = savings.fold<double>(
        0, (s, e) => s + ((e['amount'] as num?)?.toDouble() ?? 0.0));
    final totalLoans = loans.fold<double>(
        0, (s, e) => s + ((e['principalAmount'] as num?)?.toDouble() ?? 0.0));

    pdf.addPage(
      pw.MultiPage(
        pageTheme: _buildPageTheme(_buildTheme()),
        build: (context) => [
          _buildHeaderBlock('MEMBER PASSBOOK', memberName),
          pw.SizedBox(height: 8),
          pw.Text('Group: $groupName', style: const pw.TextStyle(fontSize: 11)),
          pw.SizedBox(height: 16),
          pw.Row(
            mainAxisAlignment: pw.MainAxisAlignment.spaceAround,
            children: [
              _buildMetricBox('Total Savings',
                  '₹${totalSavings.toStringAsFixed(0)}', PdfColors.green700),
              _buildMetricBox('Total Loans',
                  '₹${totalLoans.toStringAsFixed(0)}', PdfColors.red700),
            ],
          ),
          pw.SizedBox(height: 20),
          pw.Text('Savings History',
              style: pw.TextStyle(
                  fontSize: 13,
                  fontWeight: pw.FontWeight.bold,
                  color: _brandColor)),
          pw.SizedBox(height: 8),
          if (savings.isEmpty)
            pw.Text('No savings recorded.',
                style: const pw.TextStyle(fontSize: 10))
          else
            _buildUnicodeTable(
              headers: ['Month', 'Year', 'Amount', 'Date'],
              data: savings
                  .map((s) => [
                        s['month']?.toString() ?? '-',
                        s['year']?.toString() ?? '-',
                        '₹${(s['amount'] as num?)?.toStringAsFixed(0) ?? '0'}',
                        s['paidDate']?.toString().split('T').first ?? '-',
                      ])
                  .toList(),
            ),
          pw.SizedBox(height: 20),
          pw.Text('Loan History',
              style: pw.TextStyle(
                  fontSize: 13,
                  fontWeight: pw.FontWeight.bold,
                  color: _brandColor)),
          pw.SizedBox(height: 8),
          if (loans.isEmpty)
            pw.Text('No loans recorded.',
                style: const pw.TextStyle(fontSize: 10))
          else
            _buildUnicodeTable(
              headers: ['Principal', 'Interest %', 'Status', 'Issued Date'],
              data: loans
                  .map((l) => [
                        '₹${(l['principalAmount'] as num?)?.toStringAsFixed(0) ?? '0'}',
                        '${l['interestRate']?.toString() ?? '0'}%',
                        l['status']?.toString() ?? '-',
                        l['issuedDate']?.toString().split('T').first ?? '-',
                      ])
                  .toList(),
            ),
          pw.SizedBox(height: 20),
          _buildFooter(),
        ],
      ),
    );

    return pdf.save();
  }

  pw.Widget _buildMetricBox(String label, String value, PdfColor color) {
    return pw.Container(
      padding: const pw.EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: pw.BoxDecoration(
        borderRadius: const pw.BorderRadius.all(pw.Radius.circular(8)),
        border: pw.Border.all(color: _borderGrey),
        color: _lightGrey,
      ),
      child: pw.Column(
        children: [
          pw.Text(value,
              style: pw.TextStyle(
                  fontSize: 16, fontWeight: pw.FontWeight.bold, color: color)),
          pw.SizedBox(height: 4),
          pw.Text(label,
              style: const pw.TextStyle(fontSize: 9, color: PdfColors.grey700)),
        ],
      ),
    );
  }
}
