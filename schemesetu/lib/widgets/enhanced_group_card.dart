import 'package:chit_fund_app/utils/theme.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../localization/app_localizations.dart';
import 'package:chit_fund_app/widgets/translated_text.dart';

/// Enhanced group card with icons and advanced features
class EnhancedGroupCard extends StatelessWidget {
  final String groupName;
  final int memberCount;
  final double installmentAmount;
  final int duration;
  final int? monthsCompleted;
  final DateTime startDate;
  final String status; // 'active', 'completed', 'pending'
  final String? whatsappGroupLink;
  final double radialProgress;
  final VoidCallback onEdit;
  final VoidCallback onDelete;
  final VoidCallback onViewMembers;
  final VoidCallback onSync;

  const EnhancedGroupCard({
    super.key,
    required this.groupName,
    required this.memberCount,
    required this.installmentAmount,
    required this.duration,
    this.monthsCompleted,
    required this.startDate,
    required this.status,
    this.whatsappGroupLink,
    this.radialProgress = 0.0,
    required this.onEdit,
    required this.onDelete,
    required this.onViewMembers,
    required this.onSync,
  });

  Color _getStatusColor(bool isDark) {
    switch (status) {
      case 'active':
        return AppTheme.primaryTeal;
      case 'completed':
        return isDark ? Colors.green[400]! : Colors.green[600]!;
      case 'pending':
        return isDark ? Colors.amber[400]! : Colors.amber[600]!;
      default:
        return isDark ? Colors.grey[400]! : Colors.grey[600]!;
    }
  }

  IconData _getStatusIcon() {
    switch (status) {
      case 'active':
        return Icons.play_circle_filled;
      case 'completed':
        return Icons.check_circle;
      case 'pending':
        return Icons.schedule;
      default:
        return Icons.info;
    }
  }

  Future<void> _launchWhatsAppLink(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.platformDefault);
    }
  }

  @override
  Widget build(BuildContext context) {
    final loc = AppLocalizations.of(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final statusColor = _getStatusColor(isDark);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: isDark ? Colors.grey[850] : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark ? Colors.grey[700]! : Colors.grey[200]!,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: Column(
          children: [
            // Header with gradient and status
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    statusColor.withValues(alpha: 0.1),
                    statusColor.withValues(alpha: 0.05),
                  ],
                ),
              ),
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  // Group icon with radial progress indicator overlay
                  Stack(
                    alignment: Alignment.center,
                    children: [
                      SizedBox(
                        width: 46,
                        height: 46,
                        child: CircularProgressIndicator(
                          value: radialProgress,
                          strokeWidth: 4,
                          backgroundColor: statusColor.withValues(alpha: 0.15),
                          valueColor:
                              AlwaysStoppedAnimation<Color>(statusColor),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: statusColor.withValues(alpha: 0.1),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          Icons.groups_outlined,
                          color: statusColor,
                          size: 20,
                        ),
                      ),
                      if (status == 'completed' || radialProgress >= 1.0)
                        Positioned(
                          bottom: 0,
                          right: 0,
                          child: Container(
                            padding: const EdgeInsets.all(2),
                            decoration: const BoxDecoration(
                              color: Colors.green,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.check,
                              color: Colors.white,
                              size: 10,
                            ),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(width: 12),

                  // Group info
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        TranslatedText(
                          groupName,
                          style: GoogleFonts.outfit(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: isDark ? Colors.white : Colors.grey[900],
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Icon(
                              Icons.calendar_today,
                              size: 12,
                              color: Colors.grey[500],
                            ),
                            const SizedBox(width: 4),
                            TranslatedText(
                              '${loc.translate('started')} ${startDate.year}-${startDate.month.toString().padLeft(2, '0')}-${startDate.day.toString().padLeft(2, '0')}',
                              style: GoogleFonts.outfit(
                                fontSize: 11,
                                color: isDark
                                    ? Colors.grey[400]
                                    : Colors.grey[500],
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  // WhatsApp Group link button
                  if (whatsappGroupLink != null &&
                      whatsappGroupLink!.isNotEmpty) ...[
                    IconButton(
                      icon: const Icon(Icons.chat_bubble_outline_rounded,
                          color: AppTheme.primaryTeal, size: 20),
                      tooltip: 'WhatsApp Group',
                      onPressed: () => _launchWhatsAppLink(whatsappGroupLink!),
                    ),
                    const SizedBox(width: 8),
                  ],

                  // Status badge
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: statusColor.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          _getStatusIcon(),
                          size: 14,
                          color: statusColor,
                        ),
                        const SizedBox(width: 4),
                        TranslatedText(
                          status.toUpperCase(),
                          style: GoogleFonts.outfit(
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                            color: statusColor,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Stats row
            Container(
              padding: const EdgeInsets.symmetric(
                horizontal: 16,
                vertical: 12,
              ),
              decoration: BoxDecoration(
                color: isDark ? Colors.grey[800] : Colors.grey[50],
                border: Border(
                  bottom: BorderSide(
                    color: isDark ? Colors.grey[700]! : Colors.grey[200]!,
                  ),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _StatItem(
                    icon: Icons.person,
                    label: 'Mem/Slots',
                    value: '$memberCount/$duration',
                    isDark: isDark,
                  ),
                  _StatItem(
                    icon: Icons.currency_rupee,
                    label: loc.translate('monthly'),
                    value: '₹${installmentAmount.toStringAsFixed(0)}',
                    isDark: isDark,
                  ),
                  _StatItem(
                    icon: Icons.calendar_month,
                    label: 'Total Months',
                    value: '$duration Mos',
                    isDark: isDark,
                  ),
                  _StatItem(
                    icon: Icons.event_available_rounded,
                    label: 'Months Left',
                    value:
                        '${(duration - (monthsCompleted ?? 0)) > 0 ? (duration - (monthsCompleted ?? 0)) : 0} Left',
                    isDark: isDark,
                  ),
                ],
              ),
            ),

            // Action buttons
            Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                children: [
                  _ActionButton(
                    icon: Icons.person_add,
                    label: loc.translate('members'),
                    onPressed: onViewMembers,
                    isDark: isDark,
                  ),
                  const SizedBox(width: 8),
                  _ActionButton(
                    icon: Icons.sync,
                    label: loc.translate('sync'),
                    onPressed: onSync,
                    isDark: isDark,
                  ),
                  const SizedBox(width: 8),
                  _ActionButton(
                    icon: Icons.edit,
                    label: loc.translate('edit'),
                    onPressed: onEdit,
                    isDark: isDark,
                  ),
                  const SizedBox(width: 8),
                  _ActionButton(
                    icon: Icons.delete_outline,
                    label: loc.translate('delete'),
                    onPressed: onDelete,
                    isDark: isDark,
                    isDelete: true,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final bool isDark;

  const _StatItem({
    required this.icon,
    required this.label,
    required this.value,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(
          icon,
          size: 18,
          color: AppTheme.primaryTeal,
        ),
        const SizedBox(height: 4),
        TranslatedText(
          label,
          style: GoogleFonts.outfit(
            fontSize: 10,
            color: isDark ? Colors.grey[400] : Colors.grey[600],
          ),
        ),
        TranslatedText(
          value,
          style: GoogleFonts.outfit(
            fontSize: 12,
            fontWeight: FontWeight.bold,
            color: isDark ? Colors.white : Colors.grey[900],
          ),
        ),
      ],
    );
  }
}

class _ActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onPressed;
  final bool isDark;
  final bool isDelete;

  const _ActionButton({
    required this.icon,
    required this.label,
    required this.onPressed,
    required this.isDark,
    this.isDelete = false,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onPressed,
          borderRadius: BorderRadius.circular(12),
          child: Container(
            padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 2),
            decoration: BoxDecoration(
              color: isDelete
                  ? (isDark
                      ? Colors.red.withValues(alpha: 0.15)
                      : Colors.red[50])
                  : (isDark ? Colors.grey[800] : Colors.grey[100]),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  icon,
                  size: 16,
                  color: isDelete
                      ? (isDark ? Colors.red[400] : Colors.red[600])
                      : AppTheme.primaryTeal,
                ),
                const SizedBox(height: 2),
                FittedBox(
                  fit: BoxFit.scaleDown,
                  child: TranslatedText(
                    label,
                    style: GoogleFonts.outfit(
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                      color: isDelete
                          ? (isDark ? Colors.red[400] : Colors.red[600])
                          : AppTheme.primaryTeal,
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
