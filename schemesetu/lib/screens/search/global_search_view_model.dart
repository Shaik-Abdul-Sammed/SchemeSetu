import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../data/local/app_database.dart';
import '../../data/providers/db_provider.dart';

part 'global_search_view_model.g.dart';

class SearchResult {
  final List<Member> members;
  final List<Group> groups;
  final String query;

  SearchResult({
    this.members = const [],
    this.groups = const [],
    this.query = '',
  });
}

@riverpod
class GlobalSearchNotifier extends _$GlobalSearchNotifier {
  @override
  Future<SearchResult> build() async {
    return SearchResult();
  }

  Future<void> search(String query) async {
    if (query.isEmpty) {
      state = AsyncValue.data(SearchResult());
      return;
    }

    state = const AsyncValue.loading();

    try {
      final dao = ref.read(appDaoProvider);
      final allMembers = await dao.getAllMembers();
      final allGroups = await dao.getAllGroups();

      final q = query.toLowerCase();

      final filteredMembers = allMembers.where((m) {
        return m.name.toLowerCase().contains(q) || m.phone.contains(q);
      }).toList();

      final filteredGroups = allGroups.where((g) {
        return g.name.toLowerCase().contains(q);
      }).toList();

      state = AsyncValue.data(SearchResult(
        members: filteredMembers,
        groups: filteredGroups,
        query: query,
      ));
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}
