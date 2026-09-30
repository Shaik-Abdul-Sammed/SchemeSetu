// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'global_search_view_model.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(GlobalSearchNotifier)
final globalSearchProvider = GlobalSearchNotifierProvider._();

final class GlobalSearchNotifierProvider
    extends $AsyncNotifierProvider<GlobalSearchNotifier, SearchResult> {
  GlobalSearchNotifierProvider._()
      : super(
          from: null,
          argument: null,
          retry: null,
          name: r'globalSearchProvider',
          isAutoDispose: true,
          dependencies: null,
          $allTransitiveDependencies: null,
        );

  @override
  String debugGetCreateSourceHash() => _$globalSearchNotifierHash();

  @$internal
  @override
  GlobalSearchNotifier create() => GlobalSearchNotifier();
}

String _$globalSearchNotifierHash() =>
    r'bf4f400619791d25a55c546dbb48b61d2e1438fd';

abstract class _$GlobalSearchNotifier extends $AsyncNotifier<SearchResult> {
  FutureOr<SearchResult> build();
  @$mustCallSuper
  @override
  WhenComplete runBuild() {
    final ref = this.ref as $Ref<AsyncValue<SearchResult>, SearchResult>;
    final element = ref.element as $ClassProviderElement<
        AnyNotifier<AsyncValue<SearchResult>, SearchResult>,
        AsyncValue<SearchResult>,
        Object?,
        Object?>;
    return element.handleCreate(ref, build);
  }
}
