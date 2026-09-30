import 'package:chit_fund_app/utils/theme.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:printing/printing.dart';
import '../../localization/app_localizations.dart';
import '../../services/pdf_service.dart';
import '../../models/group_model.dart';
import '../../widgets/glass_card.dart';

import 'reports_view_model.dart';
import 'package:chit_fund_app/widgets/translated_text.dart';
import '../../widgets/scroll_arrows_overlay.dart';
import 'dart:io';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:collection/collection.dart';
import 'package:path/path.dart' as p;
import 'package:flutter/foundation.dart'; // for compute
import '../../utils/currency_formatter.dart';

class ReportsScreen extends ConsumerStatefulWidget {
  const ReportsScreen({super.key});
  @override
  ConsumerState<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends ConsumerState<ReportsScreen> {
  final PdfService _pdfService = PdfService();
  String? _selectedGroupId;
  int _reportType = 1;
  Uint8List? _pdfData;
  bool _isGenerating = false;

  DateTimeRange _dateRange = DateTimeRange(
    start: DateTime(DateTime.now().year, DateTime.now().month, 1),
    end: DateTime(DateTime.now().year, DateTime.now().month + 1, 0),
  );

  final ScrollController _scrollController = ScrollController();

  String get _dateRangeLabel {
    return '${_dateRange.start.day}/${_dateRange.start.month}/${_dateRange.start.year} - ${_dateRange.end.day}/${_dateRange.end.month}/${_dateRange.end.year}';
  }

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _loadSettings() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _reportType = prefs.getInt('last_report_type') ?? 1;
      _selectedGroupId = prefs.getString('last_report_group_id');
      if (_selectedGroupId == 'ALL')
        _selectedGroupId =
            null; // ALL is represented by null or 'ALL' depending on usage, we handle it in build
    });
  }

  Future<void> _saveSettings() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt('last_report_type', _reportType);
    if (_selectedGroupId != null) {
      await prefs.setString('last_report_group_id', _selectedGroupId!);
    }
  }

  Future<void> _pickDateRange() async {
    final result = await showDateRangePicker(
      context: context,
      firstDate: DateTime(2020),
      lastDate: DateTime(2030),
      initialDateRange: _dateRange,
    );
    if (result != null && mounted) {
      setState(() {
        _dateRange = result;
        _pdfData = null;
      });
    }
  }

  void _generateReportPdf(ReportsState stateData) async {
    if (_reportType == 1 && stateData.groups.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: TranslatedText(
                'Create a group before generating a collection report.')),
      );
      return;
    }
    setState(() {
      _isGenerating = true;
      _pdfData = null;
    });
    try {
      Uint8List generatedData;
      if (_reportType == 1) {
        if (_selectedGroupId == 'ALL') {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                content: TranslatedText(
                    'Collection report requires a specific group.')));
            setState(() => _isGenerating = false);
          }
          return;
        }
        final group = stateData.groups.firstWhere(
          (g) => g.id == _selectedGroupId,
          orElse: () => stateData.groups.isNotEmpty
              ? stateData.groups[0]
              : GroupModel(
                  id: '',
                  name: 'N/A',
                  installment: 0,
                  totalMembers: 0,
                  startDate: DateTime.now(),
                  durationMonths: 12),
        );
        final filteredPayments = stateData.payments
            .where((p) =>
                p.paymentDate != null &&
                p.paymentDate!.isAfter(
                    _dateRange.start.subtract(const Duration(days: 1))) &&
                p.paymentDate!
                    .isBefore(_dateRange.end.add(const Duration(days: 1))))
            .toList();

        generatedData = await _pdfService.generateCollectionReport(
          group: group,
          members: stateData.members,
          payments: filteredPayments,
          winners: stateData.winners,
          month: _dateRangeLabel,
          startDate: _dateRange.start,
          endDate: _dateRange.end,
        );
      } else if (_reportType == 2) {
        final group = _selectedGroupId == 'ALL'
            ? null
            : stateData.groups
                .firstWhereOrNull((g) => g.id == _selectedGroupId);
        final filteredPayments = stateData.payments
            .where((p) =>
                p.paymentDate != null &&
                p.paymentDate!.isAfter(
                    _dateRange.start.subtract(const Duration(days: 1))) &&
                p.paymentDate!
                    .isBefore(_dateRange.end.add(const Duration(days: 1))))
            .toList();
        generatedData = await _pdfService.generatePendingReport(
          group: group,
          groups: stateData.groups,
          members: stateData.members,
          payments: filteredPayments,
        );
      } else if (_reportType == 3) {
        final group = _selectedGroupId == 'ALL'
            ? null
            : stateData.groups
                .firstWhereOrNull((g) => g.id == _selectedGroupId);
        final doc = await _pdfService.generateWinnerReportDoc(
          group: group,
          groups: stateData.groups,
          members: stateData.members,
          winners: stateData.winners,
          payments: stateData.payments,
        );
        generatedData = await doc.save();
      } else {
        if (_selectedGroupId == 'ALL') {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                content: TranslatedText(
                    'Overall Data report requires a specific group.')));
            setState(() => _isGenerating = false);
          }
          return;
        }
        final group = stateData.groups.firstWhere(
          (g) => g.id == _selectedGroupId,
          orElse: () => stateData.groups.isNotEmpty
              ? stateData.groups[0]
              : GroupModel(
                  id: '',
                  name: 'N/A',
                  installment: 0,
                  totalMembers: 0,
                  startDate: DateTime.now(),
                  durationMonths: 12),
        );
        generatedData = await _pdfService.generateOverallDataReport(
          group: group,
          members: stateData.members,
          payments: stateData.payments,
          winners: stateData.winners,
          startDate: _dateRange.start,
          endDate: _dateRange.end,
        );
      }
      setState(() {
        _pdfData = generatedData;
        _isGenerating = false;
      });
    } catch (e) {
      debugPrint('Error generating PDF: $e');
      if (mounted)
        ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: TranslatedText('Could not generate report: $e')));
      setState(() => _isGenerating = false);
    }
  }

  Future<void> _exportCSV(ReportsState stateData) async {
    if (_reportType != 1) return; // Only implement for Collections for now
    if (_selectedGroupId == 'ALL') {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: TranslatedText('Please select a specific group.')));
      return;
    }

    final group =
        stateData.groups.firstWhereOrNull((g) => g.id == _selectedGroupId);
    if (group == null) return;

    try {
      final payments = stateData.payments
          .where((p) =>
              p.groupId == group.id &&
              p.paymentDate != null &&
              p.paymentDate!.isAfter(
                  _dateRange.start.subtract(const Duration(days: 1))) &&
              p.paymentDate!
                  .isBefore(_dateRange.end.add(const Duration(days: 1))))
          .toList();

      final timestamp =
          DateTime.now().toIso8601String().replaceAll(':', '-').split('.')[0];
      final tempDir = await getTemporaryDirectory();
      final file =
          File(p.join(tempDir.path, 'collection_report_$timestamp.csv'));

      final sink = file.openWrite();
      sink.writeln(
          'Member Name,Phone,Total Amount Paid,Payment Modes,Payment Dates,Notes,Late Payment');

      final membersInGroup = stateData.members
          .where((m) => m.groupIds.contains(group.id))
          .toList();

      for (final member in membersInGroup) {
        final memberPayments =
            payments.where((p) => p.memberId == member.id).toList();

        final name = member.name;
        final phone = member.mobile;

        if (memberPayments.isEmpty) {
          sink.writeln('$name,$phone,0,-,-,-,-');
          continue;
        }

        final totalAmount =
            memberPayments.fold(0.0, (sum, p) => sum + p.amount);
        final modes = memberPayments
            .map((p) =>
                (p.method != null && p.method!.isNotEmpty) ? p.method! : 'Cash')
            .toSet()
            .join('; ');

        final dates = memberPayments
            .map((p) {
              final d = p.paymentDate;
              return d != null ? '${d.day}/${d.month}/${d.year}' : 'N/A';
            })
            .toSet()
            .join('; ');

        final notes = memberPayments
            .map((p) => p.reference?.replaceAll(',', ' ') ?? '')
            .where((s) => s.isNotEmpty)
            .join('; ');

        final lateText = memberPayments.any((p) => p.isLate) ? 'YES' : 'NO';

        sink.writeln(
            '$name,$phone,$totalAmount,$modes,$dates,$notes,$lateText');
      }

      await sink.flush();
      await sink.close();

      if (mounted) {
        final box = context.findRenderObject() as RenderBox?;
        await SharePlus.instance.share(ShareParams(
          files: [XFile(file.path, mimeType: 'text/csv')],
          text: 'Collection Report CSV',
          subject: 'Collection Report',
          sharePositionOrigin:
              box != null ? box.localToGlobal(Offset.zero) & box.size : null,
        ));
      }
    } catch (e) {
      if (mounted)
        ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: TranslatedText('Could not export CSV: $e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    final stateAsync = ref.watch(reportsProvider);
    final localizations = AppLocalizations.of(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: TranslatedText(localizations.translate('monthly_report'),
            style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
      ),
      body: stateAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, st) => Center(child: TranslatedText('Error: $err')),
        data: (stateData) {
          if (_selectedGroupId == null && stateData.groups.isNotEmpty) {
            _selectedGroupId = stateData.groups[0].id;
          }

          // Analytics
          final analyticsPayments = stateData.payments.where((p) =>
              p.paymentDate != null &&
              p.paymentDate!.isAfter(
                  _dateRange.start.subtract(const Duration(days: 1))) &&
              p.paymentDate!
                  .isBefore(_dateRange.end.add(const Duration(days: 1))));
          final totalCollected = analyticsPayments
              .where((p) => p.isPaid)
              .fold<double>(0, (sum, p) => sum + p.amount);
          final totalPending = stateData.payments
              .where((p) =>
                  !p.isPaid &&
                  p.paymentDate != null &&
                  p.paymentDate!
                      .isBefore(_dateRange.end.add(const Duration(days: 1))))
              .fold<double>(0, (sum, p) => sum + p.amount);

          return ScrollArrowsOverlay(
            scrollController: _scrollController,
            child: SingleChildScrollView(
              controller: _scrollController,
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 80),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Analytics Dashboard
                  Row(
                    children: [
                      Expanded(
                          child: GlassCard(
                        padding: const EdgeInsets.all(8),
                        child: Column(
                          children: [
                            TranslatedText('Collected',
                                style: GoogleFonts.outfit(
                                    fontSize: 10, color: Colors.grey)),
                            const SizedBox(height: 4),
                            Text(formatIndianCurrency(totalCollected),
                                style: GoogleFonts.outfit(
                                    fontSize: 13,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.green),
                                overflow: TextOverflow.ellipsis),
                          ],
                        ),
                      )),
                      const SizedBox(width: 6),
                      Expanded(
                          child: GlassCard(
                        padding: const EdgeInsets.all(8),
                        child: Column(
                          children: [
                            TranslatedText('Pending',
                                style: GoogleFonts.outfit(
                                    fontSize: 10, color: Colors.grey)),
                            const SizedBox(height: 4),
                            Text(formatIndianCurrency(totalPending),
                                style: GoogleFonts.outfit(
                                    fontSize: 13,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.red),
                                overflow: TextOverflow.ellipsis),
                          ],
                        ),
                      )),
                      const SizedBox(width: 6),
                      Expanded(
                          child: GlassCard(
                        padding: const EdgeInsets.all(8),
                        child: Column(
                          children: [
                            TranslatedText('Members',
                                style: GoogleFonts.outfit(
                                    fontSize: 10, color: Colors.grey)),
                            const SizedBox(height: 4),
                            Text('${stateData.members.length}',
                                style: GoogleFonts.outfit(
                                    fontSize: 13,
                                    fontWeight: FontWeight.bold,
                                    color: AppTheme.primaryTeal)),
                          ],
                        ),
                      )),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Settings Card
                  GlassCard(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        TranslatedText('Report Type',
                            style: GoogleFonts.outfit(
                                fontSize: 12,
                                color: Colors.grey,
                                fontWeight: FontWeight.w600)),
                        const SizedBox(height: 8),
                        Wrap(spacing: 8, runSpacing: 8, children: [
                          _ReportTypeChip(
                            label: 'Collection',
                            icon: Icons.payments_rounded,
                            selected: _reportType == 1,
                            onTap: () {
                              setState(() {
                                _reportType = 1;
                                if (_selectedGroupId == 'ALL') {
                                  _selectedGroupId = stateData.groups.isNotEmpty
                                      ? stateData.groups[0].id
                                      : null;
                                }
                                _pdfData = null;
                              });
                              _saveSettings();
                            },
                          ),
                          _ReportTypeChip(
                            label: 'Pending',
                            icon: Icons.warning_amber_rounded,
                            selected: _reportType == 2,
                            onTap: () {
                              setState(() {
                                _reportType = 2;
                                _pdfData = null;
                              });
                              _saveSettings();
                            },
                          ),
                          _ReportTypeChip(
                            label: 'Winners',
                            icon: Icons.emoji_events_rounded,
                            selected: _reportType == 3,
                            onTap: () {
                              setState(() {
                                _reportType = 3;
                                _pdfData = null;
                              });
                              _saveSettings();
                            },
                          ),
                          _ReportTypeChip(
                            label: 'Overall Data',
                            icon: Icons.analytics_rounded,
                            selected: _reportType == 4,
                            onTap: () {
                              setState(() {
                                _reportType = 4;
                                if (_selectedGroupId == 'ALL') {
                                  _selectedGroupId = stateData.groups.isNotEmpty
                                      ? stateData.groups[0].id
                                      : null;
                                }
                                _pdfData = null;
                              });
                              _saveSettings();
                            },
                          ),
                        ]),
                        const SizedBox(height: 16),
                        TranslatedText('Report Period',
                            style: GoogleFonts.outfit(
                                fontSize: 12,
                                color: Colors.grey,
                                fontWeight: FontWeight.w600)),
                        const SizedBox(height: 8),
                        GestureDetector(
                          onTap: _pickDateRange,
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 16, vertical: 14),
                            decoration: BoxDecoration(
                              color:
                                  AppTheme.primaryTeal.withValues(alpha: 0.08),
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
                                    borderRadius: BorderRadius.circular(10)),
                                child: const Icon(Icons.date_range_rounded,
                                    color: Colors.white, size: 18),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                  child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                    TranslatedText('Date Range',
                                        style: GoogleFonts.outfit(
                                            fontSize: 11, color: Colors.grey)),
                                    TranslatedText(_dateRangeLabel,
                                        style: GoogleFonts.outfit(
                                            fontSize: 14,
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
                        const SizedBox(height: 12),
                        if (stateData.groups.isNotEmpty) ...[
                          TranslatedText('Select Group',
                              style: GoogleFonts.outfit(
                                  fontSize: 12,
                                  color: Colors.grey,
                                  fontWeight: FontWeight.w600)),
                          const SizedBox(height: 8),
                          DropdownButtonFormField<String>(
                            decoration: InputDecoration(
                              contentPadding: const EdgeInsets.symmetric(
                                  horizontal: 14, vertical: 12),
                              border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(12)),
                              enabledBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: BorderSide(
                                    color: Colors.grey.withValues(alpha: 0.3)),
                              ),
                            ),
                            initialValue: _selectedGroupId == 'ALL' ||
                                    stateData.groups.any((g) =>
                                        g.id.toString() == _selectedGroupId)
                                ? _selectedGroupId
                                : (stateData.groups.isNotEmpty
                                    ? stateData.groups.first.id.toString()
                                    : null),
                            items: [
                              if (_reportType != 1)
                                DropdownMenuItem<String>(
                                  value: 'ALL',
                                  child: TranslatedText('All Groups',
                                      overflow: TextOverflow.ellipsis,
                                      style: GoogleFonts.outfit()),
                                ),
                              ...stateData.groups
                                  .map((g) => DropdownMenuItem<String>(
                                        value: g.id,
                                        child: Text(g.name,
                                            overflow: TextOverflow.ellipsis,
                                            style: GoogleFonts.outfit()),
                                      )),
                            ],
                            onChanged: (val) {
                              setState(() {
                                _selectedGroupId = val;
                                _pdfData = null;
                              });
                              _saveSettings();
                            },
                          ),
                          const SizedBox(height: 12),
                        ] else ...[
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: Colors.orange.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                  color: Colors.orange.withValues(alpha: 0.3)),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.info_outline,
                                    color: Colors.orange),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: TranslatedText(
                                    'Please create a group first to generate reports.',
                                    style: GoogleFonts.outfit(
                                        color: Colors.orange.shade800),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 12),
                        ],
                        if (_reportType == 1)
                          Row(
                            children: [
                              Expanded(
                                child: ElevatedButton.icon(
                                  onPressed: _isGenerating
                                      ? null
                                      : () => _generateReportPdf(stateData),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AppTheme.primaryTeal,
                                    foregroundColor: Colors.white,
                                    padding: const EdgeInsets.symmetric(
                                        vertical: 16),
                                    shape: RoundedRectangleBorder(
                                        borderRadius:
                                            BorderRadius.circular(16)),
                                    elevation: 0,
                                  ),
                                  icon: const Icon(Icons.picture_as_pdf_rounded,
                                      size: 20),
                                  label: TranslatedText('PDF Preview',
                                      style: GoogleFonts.outfit(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 13)),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: ElevatedButton.icon(
                                  onPressed: _isGenerating
                                      ? null
                                      : () => _exportCSV(stateData),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.amber.shade700,
                                    foregroundColor: Colors.white,
                                    padding: const EdgeInsets.symmetric(
                                        vertical: 16),
                                    shape: RoundedRectangleBorder(
                                        borderRadius:
                                            BorderRadius.circular(16)),
                                    elevation: 0,
                                  ),
                                  icon: const Icon(Icons.table_chart_rounded,
                                      size: 20),
                                  label: TranslatedText('Export CSV',
                                      style: GoogleFonts.outfit(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 13)),
                                ),
                              ),
                            ],
                          )
                        else
                          ElevatedButton.icon(
                            onPressed: _isGenerating
                                ? null
                                : () => _generateReportPdf(stateData),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppTheme.primaryTeal,
                              foregroundColor: Colors.white,
                              minimumSize: const Size.fromHeight(52),
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(16)),
                              elevation: 0,
                            ),
                            icon: const Icon(Icons.picture_as_pdf_rounded),
                            label: TranslatedText('Generate PDF Preview',
                                style: GoogleFonts.outfit(
                                    fontWeight: FontWeight.bold, fontSize: 15)),
                          ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Display PDF data, Loading state, or Empty state + Late payers
                  if (_isGenerating)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 32),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const CircularProgressIndicator(
                              color: AppTheme.primaryTeal),
                          const SizedBox(height: 16),
                          TranslatedText('Generating report...',
                              style: GoogleFonts.outfit(color: Colors.grey)),
                        ],
                      ),
                    )
                  else if (_pdfData != null)
                    Column(
                      children: [
                        SizedBox(
                          height: 480,
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(24),
                            child: PdfPreview(
                              build: (format) => _pdfData!,
                              useActions: true,
                              allowPrinting: true,
                              allowSharing: true,
                              canChangePageFormat: false,
                              canChangeOrientation: false,
                            ),
                          ),
                        ),
                        const SizedBox(height: 12),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            ElevatedButton.icon(
                              onPressed: () => _pdfService.shareReport(
                                  _pdfData!, 'report.pdf'),
                              icon: const Icon(Icons.share_rounded, size: 16),
                              label: const TranslatedText('Share PDF'),
                            ),
                            const SizedBox(width: 12),
                            ElevatedButton.icon(
                              onPressed: () {
                                ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                        content: TranslatedText(
                                            'Sharing directly to WhatsApp...')));
                                SharePlus.instance.share(ShareParams(files: [
                                  XFile.fromData(_pdfData!,
                                      mimeType: 'application/pdf',
                                      name: 'report.pdf')
                                ], text: 'Here is the generated report.'));
                              },
                              style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.green,
                                  foregroundColor: Colors.white),
                              icon: const Icon(Icons.message_rounded, size: 16),
                              label: const TranslatedText('WhatsApp'),
                            ),
                          ],
                        ),
                      ],
                    )
                  else
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Center(
                          child: Column(
                            children: [
                              const SizedBox(height: 8),
                              Icon(Icons.picture_as_pdf_outlined,
                                  size: 56, color: Colors.grey.shade400),
                              const SizedBox(height: 12),
                              TranslatedText(
                                  'Configure report settings\nand tap Generate to preview.',
                                  textAlign: TextAlign.center,
                                  style: GoogleFonts.outfit(
                                      color: Colors.grey, height: 1.5)),
                              const SizedBox(height: 24),
                            ],
                          ),
                        ),
                      ],
                    ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

class _ReportTypeChip extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool selected;
  final VoidCallback onTap;
  const _ReportTypeChip(
      {required this.label,
      required this.icon,
      required this.selected,
      required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
        decoration: BoxDecoration(
          color: selected
              ? AppTheme.primaryTeal
              : AppTheme.primaryTeal.withValues(alpha: 0.07),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
              color: selected ? AppTheme.primaryTeal : Colors.transparent),
        ),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Icon(icon,
              size: 20, color: selected ? Colors.white : AppTheme.primaryTeal),
          const SizedBox(height: 4),
          TranslatedText(label,
              style: GoogleFonts.outfit(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: selected ? Colors.white : AppTheme.primaryTeal,
              )),
        ]),
      ),
    );
  }
}
