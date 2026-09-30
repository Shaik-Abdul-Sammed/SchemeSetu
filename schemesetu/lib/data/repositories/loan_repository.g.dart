// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'loan_repository.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(loanRepository)
final loanRepositoryProvider = LoanRepositoryProvider._();

final class LoanRepositoryProvider extends $FunctionalProvider<ILoanRepository,
    ILoanRepository, ILoanRepository> with $Provider<ILoanRepository> {
  LoanRepositoryProvider._()
      : super(
          from: null,
          argument: null,
          retry: null,
          name: r'loanRepositoryProvider',
          isAutoDispose: true,
          dependencies: null,
          $allTransitiveDependencies: null,
        );

  @override
  String debugGetCreateSourceHash() => _$loanRepositoryHash();

  @$internal
  @override
  $ProviderElement<ILoanRepository> $createElement($ProviderPointer pointer) =>
      $ProviderElement(pointer);

  @override
  ILoanRepository create(Ref ref) {
    return loanRepository(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(ILoanRepository value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<ILoanRepository>(value),
    );
  }
}

String _$loanRepositoryHash() => r'167d41de6e18b45b48c489d22eed5d12b023c265';
