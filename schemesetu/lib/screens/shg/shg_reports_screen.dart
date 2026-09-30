import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:printing/printing.dart';
import 'package:intl/intl.dart';
import 'package:chit_fund_app/utils/theme.dart';
import 'package:chit_fund_app/widgets/glass_card.dart';
import 'package:chit_fund_app/providers/shg_providers.dart';
import 'package:chit_fund_app/services/pdf_service.dart';
import 'package:chit_fund_app/services/encryption_service.dart';

enum ShgReportType { groupSummary, memberPassbook }

class ShgReportsScreen extends ConsumerStatefulWidget {
  final int? initialGroupId;
  const ShgReportsScreen({super.key, this.initialGroupId});

  @override
  ConsumerState<ShgReportsScreen> createState() => _ShgReportsScreenState();
}

class _ShgReportsScreenState extends ConsumerState<ShgReportsScreen> {
  int? _selectedGroupId;
  int? _selectedMembershipId;
  ShgReportType _reportType = ShgReportType.groupSummary;

  DateTimeRange? _dateRange;
  bool _isGenerating = false;
  Uint8List? _generatedPdf;
  String _pdfFileName = 'shg_report.pdf';

  final PdfService _pdfService = PdfService();
  final EncryptionService _encryptionService = EncryptionService();

  @override
  void initState() {
    super.initState();
    _selectedGroupId = widget.initialGroupId;
    _encryptionService.init();
  }

  Future<void> _pickDateRange() async {
    final now = DateTime.now();
    final picked = await showDateRangePicker(
      context: context,
      firstDate: DateTime(2020),
      lastDate: now.add(const Duration(days: 365)),
      initialDateRange: _dateRange ??
          DateTimeRange(
            start: DateTime(now.year, now.month, 1),
            end: now,
          ),
    );
    if (picked != null) {
      setState(() => _dateRange = picked);
    }
  }

  Future<void> _generateReport() async {
    if (_selectedGroupId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please select an SHG Group first'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    setState(() {
      _isGenerating = true;
      _generatedPdf = null;
    });

    try {
      final dao = ref.read(shgDaoProvider);
      final group = await dao.getGroupById(_selectedGroupId!);
      final membersWithRole =
          await ref.read(shgMembersProvider(_selectedGroupId!).future);

      if (_reportType == ShgReportType.groupSummary) {
        // Compute group summary data
        double totalSavings = 0.0;
        int activeLoansCount = 0;

        for (final m in membersWithRole) {
          final savings = await dao.getSavingsByMembershipId(m.id);
          for (final s in savings) {
            if (_dateRange == null ||
                (s.date.isAfter(_dateRange!.start) &&
                    s.date.isBefore(_dateRange!.end.add(const Duration(days: 1))))) {
              totalSavings += s.amount;
            }
          }

          final loans = await dao.getLoansByMembershipId(m.id);
          for (final l in loans) {
            if (l.status.toLowerCase() == 'active') {
              activeLoansCount++;
            }
          }
        }

        final allMeetings = await dao.getMeetingsByGroupId(_selectedGroupId!);
        final filteredMeetings = allMeetings.where((m) {
          if (_dateRange == null) return true;
          return m.meetingDate.isAfter(_dateRange!.start) &&
              m.meetingDate.isBefore(_dateRange!.end.add(const Duration(days: 1)));
        }).toList();

        final memberData = membersWithRole
            .map((m) => {
                  'memberId': m.name,
                  'role': m.role,
                  'joinedAt': m.membership.joinedAt.toIso8601String(),
                })
            .toList();

        final meetingData = filteredMeetings
            .map((m) => {
                  'meetingDate': m.meetingDate.toIso8601String(),
                  'notes': m.resolutionNote ?? 'Regular monthly meeting',
                })
            .toList();

        final pdf = await _pdfService.generateSHGGroupReport(
          groupName: group.name,
          members: memberData,
          totalSavings: totalSavings,
          activeLoans: activeLoansCount,
          meetings: meetingData,
        );

        if (!mounted) return;
        setState(() {
          _generatedPdf = pdf;
          _pdfFileName = '${group.name.replaceAll(' ', '_')}_Summary_Report.pdf';
        });
      } else {
        // Member passbook report
        if (_selectedMembershipId == null) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Please select a member to generate passbook'),
                backgroundColor: Colors.orange,
              ),
            );
          }
          setState(() => _isGenerating = false);
          return;
        }

        final selectedMember = membersWithRole.firstWhere(
          (m) => m.id == _selectedMembershipId,
          orElse: () => membersWithRole.first,
        );

        final rawSavings =
            await dao.getSavingsByMembershipId(_selectedMembershipId!);
        final filteredSavings = rawSavings.where((s) {
          if (_dateRange == null) return true;
          return s.date.isAfter(_dateRange!.start) &&
              s.date.isBefore(_dateRange!.end.add(const Duration(days: 1)));
        }).toList();

        final savingsData = filteredSavings
            .map((s) => {
                  'date': s.date.toIso8601String(),
                  'amount': s.amount,
                })
            .toList();

        final rawLoans = await dao.getLoansByMembershipId(_selectedMembershipId!);
        final loansData = <Map<String, dynamic>>[];

        for (final l in rawLoans) {
          String decryptedPrincipal = l.principalAmount;
          try {
            decryptedPrincipal = _encryptionService.decrypt(l.principalAmount);
          } catch (_) {}
          final amount = double.tryParse(decryptedPrincipal) ?? 0.0;

          loansData.add({
            'loanDate': l.loanDate.toIso8601String(),
            'principalAmount': amount,
            'status': l.status,
          });
        }

        final pdf = await _pdfService.generateSHGMemberPassbook(
          memberName: selectedMember.name,
          groupName: group.name,
          savings: savingsData,
          loans: loansData,
        );

        if (!mounted) return;
        setState(() {
          _generatedPdf = pdf;
          _pdfFileName =
              '${selectedMember.name.replaceAll(' ', '_')}_Passbook.pdf';
        });
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error generating report: $e'),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      if (mounted) setState(() => _isGenerating = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final groupsAsync = ref.watch(shgGroupsProvider);
    final dateFormat = DateFormat('dd MMM yyyy');

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'SHG Reports & Passbooks',
          style: GoogleFonts.outfit(fontWeight: FontWeight.bold),
        ),
        actions: [
          if (_generatedPdf != null)
            IconButton(
              icon: const Icon(Icons.refresh_rounded),
              tooltip: 'New Report',
              onPressed: () {
                setState(() => _generatedPdf = null);
              },
            ),
        ],
      ),
      body: _generatedPdf != null
          ? Column(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 16, vertical: 10),
                  color: AppTheme.primaryTeal.withValues(alpha: 0.1),
                  child: Row(
                    children: [
                      const Icon(Icons.picture_as_pdf_rounded,
                          color: AppTheme.primaryTeal, size: 20),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          _pdfFileName,
                          style: GoogleFonts.outfit(
                            fontWeight: FontWeight.w600,
                            color: AppTheme.primaryTeal,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      TextButton.icon(
                        icon: const Icon(Icons.tune_rounded, size: 16),
                        label: const Text('Change Filters'),
                        onPressed: () => setState(() => _generatedPdf = null),
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: PdfPreview(
                    build: (format) => _generatedPdf!,
                    useActions: true,
                    allowPrinting: true,
                    allowSharing: true,
                    canChangePageFormat: false,
                    canChangeOrientation: false,
                    pdfFileName: _pdfFileName,
                  ),
                ),
              ],
            )
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Generate Official Reports',
                    style: GoogleFonts.outfit(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Export printable PDFs for group audits, bank verification, or member passbooks.',
                    style:
                        GoogleFonts.outfit(fontSize: 14, color: Colors.grey),
                  ),
                  const SizedBox(height: 20),
                  GlassCard(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Select SHG Group',
                          style: GoogleFonts.outfit(
                              fontSize: 14, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 8),
                        groupsAsync.when(
                          data: (groups) {
                            if (groups.isEmpty) {
                              return const Text(
                                  'No SHG Groups available. Create a group first.');
                            }

                            if (_selectedGroupId == null &&
                                groups.isNotEmpty) {
                              _selectedGroupId = groups.first.id;
                            }

                            return DropdownButtonFormField<int>(
                              initialValue: _selectedGroupId,
                              isExpanded: true,
                              decoration: InputDecoration(
                                prefixIcon: const Icon(
                                    Icons.group_work_rounded,
                                    color: AppTheme.primaryTeal),
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
                                });
                              },
                            );
                          },
                          loading: () =>
                              const Center(child: CircularProgressIndicator()),
                          error: (err, _) => Text('Error: $err',
                              style: const TextStyle(color: Colors.red)),
                        ),
                        const SizedBox(height: 20),
                        Text(
                          'Report Type',
                          style: GoogleFonts.outfit(
                              fontSize: 14, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Expanded(
                              child: ChoiceChip(
                                label: const Center(
                                    child: Text('Group Summary')),
                                selected: _reportType ==
                                    ShgReportType.groupSummary,
                                selectedColor: AppTheme.primaryTeal
                                    .withValues(alpha: 0.2),
                                labelStyle: GoogleFonts.outfit(
                                  fontWeight: FontWeight.w600,
                                  color: _reportType ==
                                          ShgReportType.groupSummary
                                      ? AppTheme.primaryTeal
                                      : null,
                                ),
                                onSelected: (sel) {
                                  if (sel) {
                                    setState(() => _reportType =
                                        ShgReportType.groupSummary);
                                  }
                                },
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: ChoiceChip(
                                label: const Center(
                                    child: Text('Member Passbook')),
                                selected: _reportType ==
                                    ShgReportType.memberPassbook,
                                selectedColor: AppTheme.primaryTeal
                                    .withValues(alpha: 0.2),
                                labelStyle: GoogleFonts.outfit(
                                  fontWeight: FontWeight.w600,
                                  color: _reportType ==
                                          ShgReportType.memberPassbook
                                      ? AppTheme.primaryTeal
                                      : null,
                                ),
                                onSelected: (sel) {
                                  if (sel) {
                                    setState(() => _reportType =
                                        ShgReportType.memberPassbook);
                                  }
                                },
                              ),
                            ),
                          ],
                        ),
                        if (_reportType == ShgReportType.memberPassbook &&
                            _selectedGroupId != null) ...[
                          const SizedBox(height: 20),
                          Text(
                            'Select Member',
                            style: GoogleFonts.outfit(
                                fontSize: 14, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 8),
                          Consumer(
                            builder: (context, ref, _) {
                              final membersAsync = ref.watch(
                                  shgMembersProvider(_selectedGroupId!));
                              return membersAsync.when(
                                data: (members) {
                                  if (members.isEmpty) {
                                    return const Text(
                                        'No members in this group.');
                                  }

                                  if (_selectedMembershipId == null &&
                                      members.isNotEmpty) {
                                    _selectedMembershipId = members.first.id;
                                  }

                                  return DropdownButtonFormField<int>(
                                    initialValue: _selectedMembershipId,
                                    isExpanded: true,
                                    decoration: InputDecoration(
                                      prefixIcon: const Icon(
                                          Icons.person_rounded,
                                          color: AppTheme.primaryTeal),
                                      border: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                    ),
                                    items: members
                                        .map((m) => DropdownMenuItem(
                                              value: m.id,
                                              child: Text(
                                                  '${m.name} (${m.role})'),
                                            ))
                                        .toList(),
                                    onChanged: (val) {
                                      setState(
                                          () => _selectedMembershipId = val);
                                    },
                                  );
                                },
                                loading: () => const Center(
                                    child: CircularProgressIndicator()),
                                error: (e, _) => Text('Error: $e',
                                    style:
                                        const TextStyle(color: Colors.red)),
                              );
                            },
                          ),
                        ],
                        const SizedBox(height: 20),
                        Text(
                          'Date Range (Optional)',
                          style: GoogleFonts.outfit(
                              fontSize: 14, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 8),
                        InkWell(
                          onTap: _pickDateRange,
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
                                const Icon(Icons.date_range_rounded,
                                    color: AppTheme.primaryTeal, size: 20),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Text(
                                    _dateRange != null
                                        ? '${dateFormat.format(_dateRange!.start)}  →  ${dateFormat.format(_dateRange!.end)}'
                                        : 'All Time (No date filter)',
                                    style: GoogleFonts.outfit(
                                      fontWeight: _dateRange != null
                                          ? FontWeight.bold
                                          : FontWeight.normal,
                                    ),
                                  ),
                                ),
                                if (_dateRange != null)
                                  IconButton(
                                    icon: const Icon(Icons.clear_rounded,
                                        size: 18),
                                    onPressed: () =>
                                        setState(() => _dateRange = null),
                                  )
                                else
                                  Text(
                                    'Filter',
                                    style: GoogleFonts.outfit(
                                      color: AppTheme.primaryTeal,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primaryTeal,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                      ),
                      onPressed: _isGenerating ? null : _generateReport,
                      icon: _isGenerating
                          ? const SizedBox.shrink()
                          : const Icon(Icons.print_rounded,
                              color: Colors.white),
                      label: _isGenerating
                          ? const Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(
                                      color: Colors.white, strokeWidth: 2),
                                ),
                                SizedBox(width: 12),
                                Text('Compiling Report...',
                                    style: TextStyle(color: Colors.white)),
                              ],
                            )
                          : Text(
                              'Generate & Preview PDF',
                              style: GoogleFonts.outfit(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}
