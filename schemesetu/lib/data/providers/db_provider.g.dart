// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'db_provider.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(appDatabase)
final appDatabaseProvider = AppDatabaseProvider._();

final class AppDatabaseProvider
    extends $FunctionalProvider<AppDatabase, AppDatabase, AppDatabase>
    with $Provider<AppDatabase> {
  AppDatabaseProvider._()
      : super(
          from: null,
          argument: null,
          retry: null,
          name: r'appDatabaseProvider',
          isAutoDispose: false,
          dependencies: null,
          $allTransitiveDependencies: null,
        );

  @override
  String debugGetCreateSourceHash() => _$appDatabaseHash();

  @$internal
  @override
  $ProviderElement<AppDatabase> $createElement($ProviderPointer pointer) =>
      $ProviderElement(pointer);

  @override
  AppDatabase create(Ref ref) {
    return appDatabase(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(AppDatabase value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<AppDatabase>(value),
    );
  }
}

String _$appDatabaseHash() => r'f1777771eeacc761a5702b30c9cd223e3ddb17f9';

@ProviderFor(appDao)
final appDaoProvider = AppDaoProvider._();

final class AppDaoProvider extends $FunctionalProvider<AppDao, AppDao, AppDao>
    with $Provider<AppDao> {
  AppDaoProvider._()
      : super(
          from: null,
          argument: null,
          retry: null,
          name: r'appDaoProvider',
          isAutoDispose: false,
          dependencies: null,
          $allTransitiveDependencies: null,
        );

  @override
  String debugGetCreateSourceHash() => _$appDaoHash();

  @$internal
  @override
  $ProviderElement<AppDao> $createElement($ProviderPointer pointer) =>
      $ProviderElement(pointer);

  @override
  AppDao create(Ref ref) {
    return appDao(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(AppDao value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<AppDao>(value),
    );
  }
}

String _$appDaoHash() => r'ca9c7b87708101a92b3a9663e6e390186a664b5b';
