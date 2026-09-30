// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'module_provider.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(ActiveModule)
final activeModuleProvider = ActiveModuleProvider._();

final class ActiveModuleProvider
    extends $NotifierProvider<ActiveModule, AppModule> {
  ActiveModuleProvider._()
      : super(
          from: null,
          argument: null,
          retry: null,
          name: r'activeModuleProvider',
          isAutoDispose: false,
          dependencies: null,
          $allTransitiveDependencies: null,
        );

  @override
  String debugGetCreateSourceHash() => _$activeModuleHash();

  @$internal
  @override
  ActiveModule create() => ActiveModule();

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(AppModule value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<AppModule>(value),
    );
  }
}

String _$activeModuleHash() => r'00c4da220ae030718a7cbe8f48b828eb9043260c';

abstract class _$ActiveModule extends $Notifier<AppModule> {
  AppModule build();
  @$mustCallSuper
  @override
  WhenComplete runBuild() {
    final ref = this.ref as $Ref<AppModule, AppModule>;
    final element = ref.element as $ClassProviderElement<
        AnyNotifier<AppModule, AppModule>, AppModule, Object?, Object?>;
    return element.handleCreate(ref, build);
  }
}
