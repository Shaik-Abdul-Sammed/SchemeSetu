import 'package:flutter/material.dart';
import 'package:chit_fund_app/widgets/translated_text.dart';

/// Global error handler for the app
class AppErrorHandler {
  static Future<void> handleError(
    BuildContext context, {
    required String title,
    required String message,
    VoidCallback? onRetry,
  }) async {
    await showDialog(
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
          if (onRetry != null)
            TextButton(
              onPressed: () {
                Navigator.pop(context);
              },
              child: const TranslatedText('Dismiss'),
            ),
          if (onRetry != null)
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                onRetry();
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red[600],
                foregroundColor: Colors.white,
              ),
              child: const TranslatedText('Retry'),
            )
          else
            ElevatedButton(
              onPressed: () => Navigator.pop(context),
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

  static String getErrorMessage(dynamic error) {
    if (error is Exception) {
      return error.toString().replaceAll('Exception: ', '');
    }
    return 'An unexpected error occurred. Please try again.';
  }

  static String getNetworkErrorMessage(dynamic error) {
    final message = getErrorMessage(error);
    if (message.contains('Connection refused') ||
        message.contains('Failed host lookup')) {
      return 'Network connection failed. Please check your internet connection.';
    }
    if (message.contains('Timeout')) {
      return 'Request timeout. Please check your connection and try again.';
    }
    return 'Network error: $message';
  }
}

/// Try-Catch wrapper with error handling
class AsyncErrorHandler {
  static Future<T?> execute<T>(
    Future<T> Function() fn, {
    String errorTitle = 'Error',
    String? errorMessage,
    bool showErrorDialog = true,
    BuildContext? context,
    VoidCallback? onError,
  }) async {
    try {
      return await fn();
    } catch (e) {
      onError?.call();
      if (showErrorDialog && context != null) {
        await AppErrorHandler.handleError(
          context,
          title: errorTitle,
          message: errorMessage ?? AppErrorHandler.getErrorMessage(e),
        );
      }
      return null;
    }
  }
}

/// Error boundary widget for Flutter
class ErrorBoundary extends StatefulWidget {
  final Widget child;
  final VoidCallback? onError;

  const ErrorBoundary({
    super.key,
    required this.child,
    this.onError,
  });

  @override
  State<ErrorBoundary> createState() => _ErrorBoundaryState();
}

class _ErrorBoundaryState extends State<ErrorBoundary> {
  @override
  Widget build(BuildContext context) {
    return widget.child;
  }
}
