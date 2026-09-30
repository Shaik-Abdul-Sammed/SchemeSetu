import 'package:chit_fund_app/utils/theme.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:chit_fund_app/widgets/translated_text.dart';

/// Enhanced payment confirmation dialog with better UX
class EnhancedPaymentConfirmDialog extends StatelessWidget {
  final String memberName;
  final bool currentlyPaid;
  final VoidCallback onConfirm;
  final VoidCallback onCancel;

  const EnhancedPaymentConfirmDialog({
    super.key,
    required this.memberName,
    required this.currentlyPaid,
    required this.onConfirm,
    required this.onCancel,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      backgroundColor: isDark ? Colors.grey[900] : Colors.white,
      child: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Status icon with gradient background
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  gradient: currentlyPaid
                      ? LinearGradient(
                          colors: [Colors.red[300]!, Colors.red[600]!],
                        )
                      : LinearGradient(
                          colors: [Colors.green[300]!, Colors.green[600]!],
                        ),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  currentlyPaid
                      ? Icons.undo_rounded
                      : Icons.check_circle_rounded,
                  color: Colors.white,
                  size: 40,
                ),
              ),
              const SizedBox(height: 20),

              // Title
              TranslatedText(
                'Confirm Payment Status',
                style: GoogleFonts.outfit(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: isDark ? Colors.white : Colors.grey[900],
                ),
              ),
              const SizedBox(height: 12),

              // Member name highlight
              Container(
                padding:
                    const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
                decoration: BoxDecoration(
                  color: isDark ? Colors.grey[800] : Colors.grey[100],
                  borderRadius: BorderRadius.circular(8),
                ),
                child: TranslatedText(
                  memberName,
                  style: GoogleFonts.outfit(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                    color: AppTheme.primaryTeal,
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Message with status
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: currentlyPaid ? Colors.red[50] : Colors.green[50],
                  border: Border.all(
                    color:
                        currentlyPaid ? Colors.red[200]! : Colors.green[200]!,
                  ),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: TranslatedText(
                  currentlyPaid
                      ? 'Mark this payment as PENDING?\n\nStatus will change from:\n\n✓ PAID → ⏳ PENDING'
                      : 'Mark this payment as PAID?\n\nStatus will change from:\n\n⏳ PENDING → ✓ PAID',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.outfit(
                    fontSize: 14,
                    height: 1.6,
                    color: isDark ? Colors.grey[800] : Colors.grey[700],
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Action buttons
              Row(
                children: [
                  // Cancel button
                  Expanded(
                    child: TextButton(
                      onPressed: onCancel,
                      style: TextButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                          side: BorderSide(
                            color:
                                isDark ? Colors.grey[700]! : Colors.grey[300]!,
                          ),
                        ),
                      ),
                      child: TranslatedText(
                        'Cancel',
                        style: GoogleFonts.outfit(
                          fontWeight: FontWeight.w600,
                          color: isDark ? Colors.grey[400] : Colors.grey[700],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),

                  // Confirm button
                  Expanded(
                    child: ElevatedButton(
                      onPressed: onConfirm,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: currentlyPaid
                            ? Colors.red[600]
                            : AppTheme.primaryTeal,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: TranslatedText(
                        currentlyPaid ? 'Mark Pending' : 'Confirm Paid',
                        style: GoogleFonts.outfit(
                          fontWeight: FontWeight.w600,
                        ),
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
  }
}
