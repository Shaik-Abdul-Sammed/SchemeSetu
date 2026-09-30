import 'package:chit_fund_app/utils/theme.dart';
import 'package:flutter/material.dart';
import 'package:chit_fund_app/widgets/translated_text.dart';

/// Offline indicator widget
class OfflineIndicator extends StatelessWidget {
  final bool isOnline;

  const OfflineIndicator({
    super.key,
    required this.isOnline,
  });

  @override
  Widget build(BuildContext context) {
    if (isOnline) return const SizedBox.shrink();

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      color: Colors.red[600],
      child: const Row(
        children: [
          Icon(Icons.wifi_off_rounded, color: Colors.white, size: 18),
          SizedBox(width: 8),
          Expanded(
            child: TranslatedText(
              'You are offline. Some features may not work.',
              style: TextStyle(color: Colors.white, fontSize: 12),
            ),
          ),
        ],
      ),
    );
  }
}

/// Sync status indicator widget
class SyncStatusIndicator extends StatelessWidget {
  final SyncStatus status;
  final VoidCallback? onRetry;

  const SyncStatusIndicator({
    super.key,
    required this.status,
    this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    switch (status) {
      case SyncStatus.syncing:
        return const Padding(
          padding: EdgeInsets.all(8),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              SizedBox(
                width: 16,
                height: 16,
                child: CircularProgressIndicator(strokeWidth: 2),
              ),
              SizedBox(width: 8),
              TranslatedText('Syncing...', style: TextStyle(fontSize: 12)),
            ],
          ),
        );
      case SyncStatus.synced:
        return Padding(
          padding: const EdgeInsets.all(8),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.check_circle_rounded,
                  size: 16, color: Colors.green[600]),
              const SizedBox(width: 8),
              const TranslatedText('Synced',
                  style: TextStyle(fontSize: 12, color: Colors.grey)),
            ],
          ),
        );
      case SyncStatus.failed:
        return Padding(
          padding: const EdgeInsets.all(8),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.error_rounded, size: 16, color: Colors.red[600]),
              const SizedBox(width: 8),
              const TranslatedText('Sync failed',
                  style: TextStyle(fontSize: 12, color: Colors.grey)),
              if (onRetry != null) ...[
                const SizedBox(width: 8),
                GestureDetector(
                  onTap: onRetry,
                  child: const TranslatedText('Retry',
                      style:
                          TextStyle(fontSize: 12, color: AppTheme.primaryTeal)),
                ),
              ],
            ],
          ),
        );
      default:
        return const SizedBox.shrink();
    }
  }
}

enum SyncStatus { idle, syncing, synced, failed }

/// Retry button with loading state
class RetryButton extends StatefulWidget {
  final VoidCallback onRetry;
  final bool isLoading;
  final String label;

  const RetryButton({
    super.key,
    required this.onRetry,
    this.isLoading = false,
    this.label = 'Try Again',
  });

  @override
  State<RetryButton> createState() => _RetryButtonState();
}

class _RetryButtonState extends State<RetryButton> {
  @override
  Widget build(BuildContext context) {
    return ElevatedButton.icon(
      onPressed: widget.isLoading ? null : widget.onRetry,
      icon: widget.isLoading
          ? SizedBox(
              width: 16,
              height: 16,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                valueColor: AlwaysStoppedAnimation(
                  Colors.white.withValues(alpha: 0.8),
                ),
              ),
            )
          : const Icon(Icons.refresh_rounded),
      label: TranslatedText(widget.label),
      style: ElevatedButton.styleFrom(
        backgroundColor: AppTheme.primaryTeal,
        foregroundColor: Colors.white,
        disabledBackgroundColor: Colors.grey[400],
      ),
    );
  }
}

/// Network error widget with retry
class NetworkErrorWidget extends StatelessWidget {
  final String? message;
  final VoidCallback onRetry;
  final bool isRetrying;

  const NetworkErrorWidget({
    super.key,
    this.message,
    required this.onRetry,
    this.isRetrying = false,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.cloud_off_rounded,
              size: 80,
              color: Colors.grey[400],
            ),
            const SizedBox(height: 24),
            TranslatedText(
              'Network Error',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            TranslatedText(
              message ??
                  'Unable to connect. Please check your internet connection.',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Colors.grey[500],
                  ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),
            RetryButton(
              onRetry: onRetry,
              isLoading: isRetrying,
            ),
          ],
        ),
      ),
    );
  }
}
