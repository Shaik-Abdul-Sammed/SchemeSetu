// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'payment_history_view_model.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(PaymentHistoryNotifier)
final paymentHistoryProvider = PaymentHistoryNotifierProvider._();

final class PaymentHistoryNotifierProvider extends $AsyncNotifierProvider<
    PaymentHistoryNotifier, List<PaymentHistoryItem>> {
  PaymentHistoryNotifierProvider._()
      : super(
          from: null,
          argument: null,
          retry: null,
          name: r'paymentHistoryProvider',
          isAutoDispose: true,
          dependencies: null,
          $allTransitiveDependencies: null,
        );

  @override
  String debugGetCreateSourceHash() => _$paymentHistoryNotifierHash();

  @$internal
  @override
  PaymentHistoryNotifier create() => PaymentHistoryNotifier();
}

String _$paymentHistoryNotifierHash() =>
    r'05c59971c09459ff8ae8c0c5075613668d90ea11';

abstract class _$PaymentHistoryNotifier
    extends $AsyncNotifier<List<PaymentHistoryItem>> {
  FutureOr<List<PaymentHistoryItem>> build();
  @$mustCallSuper
  @override
  WhenComplete runBuild() {
    final ref = this.ref
        as $Ref<AsyncValue<List<PaymentHistoryItem>>, List<PaymentHistoryItem>>;
    final element = ref.element as $ClassProviderElement<
        AnyNotifier<AsyncValue<List<PaymentHistoryItem>>,
            List<PaymentHistoryItem>>,
        AsyncValue<List<PaymentHistoryItem>>,
        Object?,
        Object?>;
    return element.handleCreate(ref, build);
  }
}
