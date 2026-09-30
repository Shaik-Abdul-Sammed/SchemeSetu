import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'advanced_member_profile_view_model.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/services/messaging_service.dart';
import '../group/group_detail_screen.dart';
import 'edit_member_sheet.dart';
import 'package:chit_fund_app/widgets/translated_text.dart';
import '../../services/pdf_service.dart';
import '../../widgets/scroll_arrows_overlay.dart';

class AdvancedMemberProfileScreen extends ConsumerWidget {
  final int memberId;
  const AdvancedMemberProfileScreen({super.key, required this.memberId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profileAsync = ref.watch(memberProfileProvider(memberId));
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const TranslatedText('Member Profile'),
        elevation: 0,
        actions: [
          profileAsync.maybeWhen(
            data: (data) => Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                IconButton(
                  icon: const Icon(Icons.picture_as_pdf_rounded,
                      color: Colors.redAccent),
                  tooltip: 'Export Member Ledger PDF',
                  onPressed: () => _exportMemberLedgerPdf(context, data),
                ),
                IconButton(
                  icon: const Icon(Icons.edit),
                  onPressed: () {
                    showModalBottomSheet(
                      context: context,
                      isScrollControlled: true,
                      shape: const RoundedRectangleBorder(
                          borderRadius:
                              BorderRadius.vertical(top: Radius.circular(28))),
                      builder: (ctx) => EditMemberSheet(member: data.member),
                    );
                  },
                ),
              ],
            ),
            orElse: () => const SizedBox.shrink(),
          ),
        ],
      ),
      body: profileAsync.when(
        data: (data) => ScrollArrowsOverlay(
          child: SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            child: Column(
              children: [
                _buildHeader(context, data, isDark),
                const SizedBox(height: 16),
                _buildQuickActions(context, data, ref),
                const SizedBox(height: 16),
                _buildFinancialSummary(context, data, isDark),
                const SizedBox(height: 16),
                _buildGroupDetails(context, data, isDark),
                _buildPaymentHistory(context, data, isDark),
                _buildUpcomingPayments(context, data, isDark),
                const SizedBox(height: 16),
              ],
            ),
          ),
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: TranslatedText('Error: $err')),
      ),
    );
  }

  Widget _buildHeader(
      BuildContext context, MemberProfileData data, bool isDark) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : Colors.white,
        borderRadius: const BorderRadius.only(
          bottomLeft: Radius.circular(30),
          bottomRight: Radius.circular(30),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 5),
          )
        ],
      ),
      child: Column(
        children: [
          Hero(
            tag: 'avatar_${data.member.id}',
            child: CircleAvatar(
              radius: 50,
              backgroundColor:
                  Theme.of(context).primaryColor.withValues(alpha: 0.2),
              backgroundImage: data.member.photoPath != null
                  ? FileImage(File(data.member.photoPath!))
                  : null,
              child: data.member.photoPath == null
                  ? Icon(Icons.person,
                      size: 50, color: Theme.of(context).primaryColor)
                  : null,
            ),
          ),
          const SizedBox(height: 16),
          Text(data.member.name,
              style: Theme.of(context)
                  .textTheme
                  .headlineSmall
                  ?.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
              color: data.member.status == 'Active'
                  ? Colors.green.withValues(alpha: 0.1)
                  : Colors.red.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(20),
            ),
            child: TranslatedText(
              data.member.status,
              style: TextStyle(
                  color: data.member.status == 'Active'
                      ? Colors.green
                      : Colors.red,
                  fontWeight: FontWeight.bold),
            ),
          ),
          const SizedBox(height: 8),
          TranslatedText(data.member.phone,
              style: Theme.of(context)
                  .textTheme
                  .bodyLarge
                  ?.copyWith(color: Colors.grey)),
        ],
      ),
    );
  }

  Widget _buildQuickActions(
      BuildContext context, MemberProfileData data, WidgetRef ref) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          _buildActionItem(context, Icons.call, 'Call', Colors.blue, () async {
            final uri = Uri.parse('tel:${data.member.phone}');
            if (await canLaunchUrl(uri)) {
              await launchUrl(uri);
            }
          }),
          _buildActionItem(context, Icons.message, 'WhatsApp', Colors.green,
              () {
            ref
                .read(messagingServiceProvider)
                .sendWhatsApp(data.member.phone, 'Hello ${data.member.name},');
          }),
          _buildActionItem(context, Icons.sms, 'SMS', Colors.orange, () async {
            final uri = Uri.parse('sms:${data.member.phone}');
            if (await canLaunchUrl(uri)) {
              await launchUrl(uri);
            }
          }),
          _buildActionItem(
              context, Icons.receipt_long, 'Receipt', Colors.purple, () {
            final summary = data.summary;
            final now = DateTime.now();
            final formattedDate = '${now.day}/${now.month}/${now.year}';

            String historyStr = '';
            if (data.paymentHistory.isNotEmpty) {
              historyStr = '\n📋 *Past Payments History:*\n';
              for (final item in data.paymentHistory.take(5)) {
                final days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                final dStr =
                    '${item.paymentDate.day}/${item.paymentDate.month}/${item.paymentDate.year} (${days[item.paymentDate.weekday - 1]})';
                historyStr +=
                    '- Rd ${item.roundNumber} (${item.groupName}): ₹${item.amount.toStringAsFixed(0)} on $dStr via ${item.paymentMode}\n';
              }
            }

            String upcomingStr = '\n📅 *Upcoming / Pending Dues:*\n\n';
            for (var item in data.upcomingPayments.take(5)) {
              upcomingStr +=
                  '- Rd ${item.roundNumber} (${item.groupName}): ₹${item.amount.toStringAsFixed(0)} for ${item.monthYear}\n\n';
            }
            if (data.upcomingPayments.isEmpty) upcomingStr += '- None\n\n';

            final msg = 'Assalamu Alaikum Wa Rehmatullahi Wabarakatuhu\n\n\n'
                '📜 *SanghaSetu PAYMENT RECEIPT & STATEMENT*\n\n'
                'Date: $formattedDate\n\n'
                'Member: ${data.member.name}\n\n\n'
                '💰 Total Paid: ₹${summary.totalPaid.toStringAsFixed(0)}\n\n'
                '⚠️ Total Pending: ₹${summary.totalPending.toStringAsFixed(0)}\n\n'
                '$historyStr\n'
                '$upcomingStr\n'
                'JazakAllah Khair! Thank you for your continued support.\nSanghaSetu Organization';

            ref
                .read(messagingServiceProvider)
                .sendWhatsApp(data.member.phone, msg);
          }),
        ],
      ),
    );
  }

  Widget _buildActionItem(BuildContext context, IconData icon, String label,
      Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1), shape: BoxShape.circle),
            child: Icon(icon, color: color),
          ),
          const SizedBox(height: 8),
          TranslatedText(label, style: const TextStyle(fontSize: 12)),
        ],
      ),
    );
  }

  Widget _buildFinancialSummary(
      BuildContext context, MemberProfileData data, bool isDark) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          TranslatedText('Financial Overview',
              style: Theme.of(context)
                  .textTheme
                  .titleLarge
                  ?.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1E293B) : Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                  color: Theme.of(context).primaryColor.withValues(alpha: 0.2)),
            ),
            child: Column(
              children: [
                _buildSummaryRow(
                    'Overall Investment',
                    '₹${data.summary.overallInvestment.toStringAsFixed(0)}',
                    isDark),
                const Divider(height: 24),
                _buildSummaryRow('Overall Paid',
                    '₹${data.summary.totalPaid.toStringAsFixed(0)}', isDark,
                    valueColor: Colors.green),
                const Divider(height: 24),
                _buildSummaryRow('Pending Amount',
                    '₹${data.summary.totalPending.toStringAsFixed(0)}', isDark,
                    valueColor: Colors.red),
                const Divider(height: 24),
                _buildTrustScoreRow(data.trustScore, isDark),
                const Divider(height: 24),
                _buildSummaryRow('Collection Progress',
                    '${data.collectionPercentage.toStringAsFixed(1)}%', isDark),
                const SizedBox(height: 8),
                LinearProgressIndicator(
                  value: data.summary.overallInvestment > 0
                      ? (data.summary.totalPaid /
                              data.summary.overallInvestment)
                          .clamp(0.0, 1.0)
                      : 0,
                  backgroundColor: Colors.grey.withValues(alpha: 0.2),
                  valueColor: const AlwaysStoppedAnimation<Color>(Colors.green),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value, bool isDark,
      {Color? valueColor}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        TranslatedText(label,
            style:
                TextStyle(color: isDark ? Colors.grey[400] : Colors.grey[700])),
        TranslatedText(
          value,
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: valueColor,
          ),
        ),
      ],
    );
  }

  Widget _buildTrustScoreRow(double trustScore, bool isDark) {
    Color badgeColor = Colors.green;
    String badgeText = 'Excellent';

    if (trustScore < 50) {
      badgeColor = Colors.red;
      badgeText = 'Poor';
    } else if (trustScore < 80) {
      badgeColor = Colors.orange;
      badgeText = 'Fair';
    }

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        TranslatedText('Trust Score',
            style:
                TextStyle(color: isDark ? Colors.grey[400] : Colors.grey[700])),
        Row(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: badgeColor.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: badgeColor.withValues(alpha: 0.3)),
              ),
              child: TranslatedText(
                badgeText,
                style: TextStyle(
                    color: badgeColor,
                    fontSize: 12,
                    fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(width: 8),
            TranslatedText(
              '${trustScore.toStringAsFixed(0)} / 100',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: badgeColor,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildGroupDetails(
      BuildContext context, MemberProfileData data, bool isDark) {
    if (data.groups.isEmpty) {
      return const SizedBox.shrink();
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          TranslatedText('Enrolled Groups',
              style: Theme.of(context)
                  .textTheme
                  .titleLarge
                  ?.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          ...data.groups.map((group) {
            final paid = data.summary.groupWisePaid[group.id] ?? 0.0;
            final pending = data.summary.groupWisePending[group.id] ?? 0.0;
            return GestureDetector(
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => GroupDetailScreen(group: group),
                  ),
                );
              },
              child: Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF1E293B) : Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                      color: Theme.of(context)
                          .primaryColor
                          .withValues(alpha: 0.15)),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Theme.of(context)
                            .primaryColor
                            .withValues(alpha: 0.1),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(Icons.group,
                          color: Theme.of(context).primaryColor),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(group.name,
                              style: const TextStyle(
                                  fontWeight: FontWeight.bold, fontSize: 16)),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              TranslatedText(
                                  'Paid: ₹${paid.toStringAsFixed(0)}',
                                  style: const TextStyle(
                                      color: Colors.green,
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold)),
                              const SizedBox(width: 8),
                              TranslatedText(
                                  'Due: ₹${pending.toStringAsFixed(0)}',
                                  style: const TextStyle(
                                      color: Colors.red,
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            );
          }),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildPaymentHistory(
      BuildContext context, MemberProfileData data, bool isDark) {
    if (data.paymentHistory.isEmpty) {
      return const SizedBox.shrink();
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          TranslatedText('Payment History',
              style: Theme.of(context)
                  .textTheme
                  .titleLarge
                  ?.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          ...data.paymentHistory.map((item) {
            final days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            final dateStr =
                '${item.paymentDate.day}/${item.paymentDate.month}/${item.paymentDate.year} (${days[item.paymentDate.weekday - 1]})';
            return Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1E293B) : Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.withValues(alpha: 0.15)),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.green.withValues(alpha: 0.1),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.check_circle, color: Colors.green),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        TranslatedText('[#1] - Round ${item.roundNumber}',
                            style: const TextStyle(
                                fontWeight: FontWeight.bold, fontSize: 15),
                            replacements: {'[#1]': item.groupName}),
                        const SizedBox(height: 4),
                        TranslatedText(
                            'Paid ₹${item.amount.toStringAsFixed(0)} on $dateStr via ${item.paymentMode}',
                            style: TextStyle(
                                color: Colors.grey[600], fontSize: 12)),
                      ],
                    ),
                  ),
                ],
              ),
            );
          }),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildUpcomingPayments(
      BuildContext context, MemberProfileData data, bool isDark) {
    if (data.upcomingPayments.isEmpty) {
      return const SizedBox.shrink();
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          TranslatedText('Upcoming / Pending Dues',
              style: Theme.of(context)
                  .textTheme
                  .titleLarge
                  ?.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          ...data.upcomingPayments.map((item) {
            return Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1E293B) : Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.orange.withValues(alpha: 0.2)),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.orange.withValues(alpha: 0.1),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.warning_amber_rounded,
                        color: Colors.orange),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        TranslatedText('[#1] - Round ${item.roundNumber}',
                            style: const TextStyle(
                                fontWeight: FontWeight.bold, fontSize: 15),
                            replacements: {'[#1]': item.groupName}),
                        const SizedBox(height: 4),
                        TranslatedText(
                            'Due ₹${item.amount.toStringAsFixed(0)} for ${item.monthYear}',
                            style: TextStyle(
                                color: Colors.grey[600], fontSize: 12)),
                      ],
                    ),
                  ),
                ],
              ),
            );
          }),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  void _exportMemberLedgerPdf(
      BuildContext context, MemberProfileData data) async {
    final pdfService = PdfService();
    try {
      final List<Map<String, dynamic>> historyMap =
          data.paymentHistory.map((h) {
        final days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        return {
          'round': 'Round ${h.roundNumber}',
          'group': h.groupName,
          'amount': h.amount.toStringAsFixed(0),
          'date':
              '${h.paymentDate.day}/${h.paymentDate.month}/${h.paymentDate.year} (${days[h.paymentDate.weekday - 1]})',
          'mode': h.paymentMode,
          'status': h.status,
        };
      }).toList();

      final pdfData = await pdfService.generateMemberLedgerReport(
        memberName: data.member.name,
        memberPhone: data.member.phone,
        memberStatus: data.member.status,
        paymentHistory: historyMap,
      );

      await pdfService.shareReport(pdfData,
          'ledger_${data.member.name.toLowerCase().replaceAll(' ', '_')}.pdf');
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: TranslatedText('Error exporting PDF: $e')),
        );
      }
    }
  }
}
