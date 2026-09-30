// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'groups_list_view_model.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(GroupsList)
final groupsListProvider = GroupsListProvider._();

final class GroupsListProvider
    extends $AsyncNotifierProvider<GroupsList, GroupListState> {
  GroupsListProvider._()
      : super(
          from: null,
          argument: null,
          retry: null,
          name: r'groupsListProvider',
          isAutoDispose: true,
          dependencies: null,
          $allTransitiveDependencies: null,
        );

  @override
  String debugGetCreateSourceHash() => _$groupsListHash();

  @$internal
  @override
  GroupsList create() => GroupsList();
}

String _$groupsListHash() => r'2708106c4732ce91f9ecd08c8261065c0f07c2ff';

abstract class _$GroupsList extends $AsyncNotifier<GroupListState> {
  FutureOr<GroupListState> build();
  @$mustCallSuper
  @override
  WhenComplete runBuild() {
    final ref = this.ref as $Ref<AsyncValue<GroupListState>, GroupListState>;
    final element = ref.element as $ClassProviderElement<
        AnyNotifier<AsyncValue<GroupListState>, GroupListState>,
        AsyncValue<GroupListState>,
        Object?,
        Object?>;
    return element.handleCreate(ref, build);
  }
}
