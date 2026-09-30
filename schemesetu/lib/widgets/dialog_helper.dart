import 'package:chit_fund_app/utils/theme.dart';
import 'package:flutter/material.dart';
import 'package:chit_fund_app/widgets/translated_text.dart';

/// Helper class for showing various dialogs and notifications
class DialogHelper {
  static Future<bool> showConfirmation(
    BuildContext context, {
    required String title,
    required String message,
    String confirmText = 'Confirm',
    String cancelText = 'Cancel',
    VoidCallback? onCancel,
  }) async {
    final result = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: TranslatedText(title),
        content: TranslatedText(message),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context, false);
              onCancel?.call();
            },
            child: TranslatedText(cancelText),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primaryTeal,
              foregroundColor: Colors.white,
            ),
            child: TranslatedText(confirmText),
          ),
        ],
      ),
    );
    return result ?? false;
  }

  static Future<void> showSuccess(
    BuildContext context, {
    required String title,
    required String message,
    VoidCallback? onDismiss,
  }) async {
    return showDialog(
      context: context,
      builder: (context) => AlertDialog(
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
              backgroundColor: Colors.green[600],
              foregroundColor: Colors.white,
            ),
            child: const TranslatedText('OK'),
          ),
        ],
      ),
    );
  }

  static Future<void> showError(
    BuildContext context, {
    required String title,
    required String message,
    VoidCallback? onDismiss,
  }) async {
    return showDialog(
      context: context,
      builder: (context) => AlertDialog(
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
            child: const TranslatedText('OK'),
          ),
        ],
      ),
    );
  }

  static Future<void> showWarning(
    BuildContext context, {
    required String title,
    required String message,
    String confirmText = 'Proceed',
    String cancelText = 'Cancel',
    required VoidCallback onConfirm,
    VoidCallback? onCancel,
  }) async {
    return showDialog(
      context: context,
      builder: (context) => AlertDialog(
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
      ),
    );
  }

  static Future<void> showInfo(
    BuildContext context, {
    required String title,
    required String message,
    VoidCallback? onDismiss,
  }) async {
    return showDialog(
      context: context,
      builder: (context) => AlertDialog(
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
      ),
    );
  }

  static void showLoading(BuildContext context,
      {String message = 'Loading...'}) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation(AppTheme.primaryTeal),
            ),
            const SizedBox(height: 16),
            TranslatedText(message),
          ],
        ),
      ),
    );
  }

  static ScaffoldFeatureController<SnackBar, SnackBarClosedReason> showSnackBar(
    BuildContext context, {
    required String message,
    SnackBarType type = SnackBarType.info,
    Duration duration = const Duration(seconds: 3),
    SnackBarAction? action,
  }) {
    final color = _getSnackBarColor(type);
    final icon = _getSnackBarIcon(type);

    final messenger = ScaffoldMessenger.of(context);
    messenger.hideCurrentSnackBar();

    final controller = messenger.showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(icon, color: Colors.white),
            const SizedBox(width: 12),
            Expanded(child: TranslatedText(message)),
          ],
        ),
        backgroundColor: color,
        duration: duration,
        action: action,
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.all(16),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
    );

    // Force close after duration in case accessibility settings keep action-bearing snackbars open forever
    if (action != null) {
      Future.delayed(duration, () {
        try {
          controller.close();
        } catch (_) {}
      });
    }

    return controller;
  }

  static Color _getSnackBarColor(SnackBarType type) {
    switch (type) {
      case SnackBarType.success:
        return Colors.green[600]!;
      case SnackBarType.error:
        return Colors.red[600]!;
      case SnackBarType.warning:
        return Colors.orange[600]!;
      default:
        return Colors.blue[600]!;
    }
  }

  static IconData _getSnackBarIcon(SnackBarType type) {
    switch (type) {
      case SnackBarType.success:
        return Icons.check_circle_rounded;
      case SnackBarType.error:
        return Icons.error_rounded;
      case SnackBarType.warning:
        return Icons.warning_rounded;
      default:
        return Icons.info_rounded;
    }
  }
}

enum SnackBarType { success, error, warning, info }
