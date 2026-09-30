// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'members_list_view_model.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(MemberList)
final memberListProvider = MemberListProvider._();

final class MemberListProvider
    extends $AsyncNotifierProvider<MemberList, MemberListState> {
  MemberListProvider._()
      : super(
          from: null,
          argument: null,
          retry: null,
          name: r'memberListProvider',
          isAutoDispose: true,
          dependencies: null,
          $allTransitiveDependencies: null,
        );

  @override
  String debugGetCreateSourceHash() => _$memberListHash();

  @$internal
  @override
  MemberList create() => MemberList();
}

String _$memberListHash() => r'f0868b39c01fd980b7e7d70e6b3bbb75305cf525';

abstract class _$MemberList extends $AsyncNotifier<MemberListState> {
  FutureOr<MemberListState> build();
  @$mustCallSuper
  @override
  WhenComplete runBuild() {
    final ref = this.ref as $Ref<AsyncValue<MemberListState>, MemberListState>;
    final element = ref.element as $ClassProviderElement<
        AnyNotifier<AsyncValue<MemberListState>, MemberListState>,
        AsyncValue<MemberListState>,
        Object?,
        Object?>;
    return element.handleCreate(ref, build);
  }
}
