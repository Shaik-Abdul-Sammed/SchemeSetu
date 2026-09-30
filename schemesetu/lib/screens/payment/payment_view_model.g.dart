// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'payment_view_model.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(PaymentNotifier)
final paymentProvider = PaymentNotifierProvider._();

final class PaymentNotifierProvider
    extends $AsyncNotifierProvider<PaymentNotifier, PaymentState> {
  PaymentNotifierProvider._()
      : super(
          from: null,
          argument: null,
          retry: null,
          name: r'paymentProvider',
          isAutoDispose: true,
          dependencies: null,
          $allTransitiveDependencies: null,
        );

  @override
  String debugGetCreateSourceHash() => _$paymentNotifierHash();

  @$internal
  @override
  PaymentNotifier create() => PaymentNotifier();
}

String _$paymentNotifierHash() => r'deed68784881fdead1f566fbe9e074d051de33b5';

abstract class _$PaymentNotifier extends $AsyncNotifier<PaymentState> {
  FutureOr<PaymentState> build();
  @$mustCallSuper
  @override
  WhenComplete runBuild() {
    final ref = this.ref as $Ref<AsyncValue<PaymentState>, PaymentState>;
    final element = ref.element as $ClassProviderElement<
        AnyNotifier<AsyncValue<PaymentState>, PaymentState>,
        AsyncValue<PaymentState>,
        Object?,
        Object?>;
    return element.handleCreate(ref, build);
  }
}
