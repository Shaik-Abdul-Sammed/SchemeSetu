import 'package:chit_fund_app/utils/theme.dart';
import 'package:flutter/material.dart';
import 'package:chit_fund_app/widgets/translated_text.dart';

/// Reusable confirmation dialog
class ConfirmationDialog extends StatelessWidget {
  final String title;
  final String message;
  final String confirmButtonText;
  final String cancelButtonText;
  final VoidCallback onConfirm;
  final VoidCallback? onCancel;
  final Color? confirmButtonColor;
  final IconData? icon;

  const ConfirmationDialog({
    super.key,
    required this.title,
    required this.message,
    this.confirmButtonText = 'Confirm',
    this.cancelButtonText = 'Cancel',
    required this.onConfirm,
    this.onCancel,
    this.confirmButtonColor,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Row(
        children: [
          if (icon != null) ...[
            Icon(icon, color: AppTheme.primaryTeal),
            const SizedBox(width: 12),
          ],
          Expanded(
            child: TranslatedText(title),
          ),
        ],
      ),
      content: TranslatedText(message),
      actions: [
        TextButton(
          onPressed: () {
            Navigator.pop(context);
            onCancel?.call();
          },
          child: TranslatedText(
            cancelButtonText,
            style: const TextStyle(color: Colors.grey),
          ),
        ),
        ElevatedButton(
          onPressed: () {
            Navigator.pop(context);
            onConfirm();
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: confirmButtonColor ?? AppTheme.primaryTeal,
            foregroundColor: Colors.white,
          ),
          child: TranslatedText(confirmButtonText),
        ),
      ],
    );
  }
}

/// Success dialog
class SuccessDialog extends StatelessWidget {
  final String title;
  final String message;
  final VoidCallback? onDismiss;
  final String actionButtonText;

  const SuccessDialog({
    super.key,
    required this.title,
    required this.message,
    this.onDismiss,
    this.actionButtonText = 'OK',
  });

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      icon: Container(
        decoration: BoxDecoration(
          color: Colors.green[50],
          borderRadius: BorderRadius.circular(50),
        ),
        padding: const EdgeInsets.all(16),
        child: Icon(
          Icons.check_circle_rounded,
          color: Colors.green[600],
          size: 48,
        ),
      ),
      title: TranslatedText(title),
      content: TranslatedText(message),
      actions: [
        ElevatedButton(
          onPressed: () {
            Navigator.pop(context);
            onDismiss?.call();
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: AppTheme.primaryTeal,
            foregroundColor: Colors.white,
          ),
          child: TranslatedText(actionButtonText),
        ),
      ],
    );
  }
}

/// Error dialog
class ErrorDialog extends StatelessWidget {
  final String title;
  final String message;
  final VoidCallback? onDismiss;
  final String actionButtonText;

  const ErrorDialog({
    super.key,
    required this.title,
    required this.message,
    this.onDismiss,
    this.actionButtonText = 'OK',
  });

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      icon: Container(
        decoration: BoxDecoration(
          color: Colors.red[50],
          borderRadius: BorderRadius.circular(50),
        ),
        padding: const EdgeInsets.all(16),
        child: Icon(
          Icons.error_rounded,
          color: Colors.red[600],
          size: 48,
        ),
      ),
      title: TranslatedText(title),
      content: TranslatedText(message),
      actions: [
        ElevatedButton(
          onPressed: () {
            Navigator.pop(context);
            onDismiss?.call();
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.red[600],
            foregroundColor: Colors.white,
          ),
          child: TranslatedText(actionButtonText),
        ),
      ],
    );
  }
}

/// Warning dialog
class WarningDialog extends StatelessWidget {
  final String title;
  final String message;
  final String confirmText;
  final String cancelText;
  final VoidCallback onConfirm;
  final VoidCallback? onCancel;

  const WarningDialog({
    super.key,
    required this.title,
    required this.message,
    this.confirmText = 'Proceed',
    this.cancelText = 'Cancel',
    required this.onConfirm,
    this.onCancel,
  });

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      icon: Container(
        decoration: BoxDecoration(
          color: Colors.orange[50],
          borderRadius: BorderRadius.circular(50),
        ),
        padding: const EdgeInsets.all(16),
        child: Icon(
          Icons.warning_rounded,
          color: Colors.orange[600],
          size: 48,
        ),
      ),
      title: TranslatedText(title),
      content: TranslatedText(message),
      actions: [
        TextButton(
          onPressed: () {
            Navigator.pop(context);
            onCancel?.call();
          },
          child: TranslatedText(cancelText),
        ),
        ElevatedButton(
          onPressed: () {
            Navigator.pop(context);
            onConfirm();
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.orange[600],
            foregroundColor: Colors.white,
          ),
          child: TranslatedText(confirmText),
        ),
      ],
    );
  }
}

/// Loading dialog
class LoadingDialog extends StatelessWidget {
  final String message;
  final bool showProgressIndicator;

  const LoadingDialog({
    super.key,
    this.message = 'Loading...',
    this.showProgressIndicator = true,
  });

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (showProgressIndicator) ...[
            const CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation(AppTheme.primaryTeal),
            ),
            const SizedBox(height: 16),
          ],
          TranslatedText(message),
        ],
      ),
    );
  }
}

/// Info dialog
class InfoDialog extends StatelessWidget {
  final String title;
  final String message;
  final VoidCallback? onDismiss;

  const InfoDialog({
    super.key,
    required this.title,
    required this.message,
    this.onDismiss,
  });

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      icon: Container(
        decoration: BoxDecoration(
          color: Colors.blue[50],
          borderRadius: BorderRadius.circular(50),
        ),
        padding: const EdgeInsets.all(16),
        child: Icon(
          Icons.info_rounded,
          color: Colors.blue[600],
          size: 48,
        ),
      ),
      title: TranslatedText(title),
      content: TranslatedText(message),
      actions: [
        ElevatedButton(
          onPressed: () {
            Navigator.pop(context);
            onDismiss?.call();
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.blue[600],
            foregroundColor: Colors.white,
          ),
          child: const TranslatedText('OK'),
        ),
      ],
    );
  }
}
