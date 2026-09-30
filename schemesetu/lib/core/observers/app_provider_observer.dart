import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final class AppProviderObserver extends ProviderObserver {
  @override
  void didUpdateProvider(
    ProviderObserverContext context,
    Object? previousValue,
    Object? newValue,
  ) {
    if (newValue is AsyncError) {
      debugPrint(
          'ProviderError: ${context.provider.name ?? context.provider.runtimeType}');
      debugPrint('Error: ${newValue.error}');
      debugPrint('StackTrace: ${newValue.stackTrace}');

      // In production, this is where you'd send errors to Crashlytics/Sentry
      // FirebaseCrashlytics.instance.recordError(newValue.error, newValue.stackTrace);
    }
  }
}
