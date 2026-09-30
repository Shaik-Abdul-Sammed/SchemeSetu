import 'package:chit_fund_app/utils/theme.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import 'global_search_view_model.dart';
import '../member/advanced_member_profile_screen.dart';
import '../group/group_detail_screen.dart';
import 'package:chit_fund_app/widgets/translated_text.dart';

class GlobalSearchScreen extends ConsumerStatefulWidget {
  const GlobalSearchScreen({super.key});

  @override
  ConsumerState<GlobalSearchScreen> createState() => _GlobalSearchScreenState();
}

class _GlobalSearchScreenState extends ConsumerState<GlobalSearchScreen> {
  final _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final stateAsync = ref.watch(globalSearchProvider);

    return Scaffold(
      appBar: AppBar(
        title: TextField(
          controller: _searchController,
          autofocus: true,
          decoration: InputDecoration(
            hintText: 'Search members, groups...',
            border: InputBorder.none,
            hintStyle: GoogleFonts.outfit(color: Colors.grey),
          ),
          onChanged: (val) {
            ref.read(globalSearchProvider.notifier).search(val);
          },
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.clear),
            onPressed: () {
              _searchController.clear();
              ref.read(globalSearchProvider.notifier).search('');
            },
          ),
        ],
      ),
      body: stateAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, st) => Center(child: TranslatedText('Error: $err')),
        data: (result) {
          if (result.query.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.search,
                      size: 64, color: Colors.grey.withValues(alpha: 0.3)),
                  const SizedBox(height: 16),
                  TranslatedText('Start typing to search',
                      style:
                          GoogleFonts.outfit(color: Colors.grey, fontSize: 16)),
                ],
              ),
            );
          }

          if (result.members.isEmpty && result.groups.isEmpty) {
            return Center(
              child: TranslatedText('No results found for "${result.query}"',
                  style: GoogleFonts.outfit(color: Colors.grey)),
            );
          }

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              if (result.groups.isNotEmpty) ...[
                TranslatedText('Groups',
                    style: GoogleFonts.outfit(
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                        color: AppTheme.primaryTeal)),
                const SizedBox(height: 8),
                ...result.groups.map((g) => ListTile(
                      leading: const CircleAvatar(
                        backgroundColor: AppTheme.primaryTeal,
                        child: Icon(Icons.groups, color: Colors.white),
                      ),
                      title: Text(g.name,
                          style:
                              GoogleFonts.outfit(fontWeight: FontWeight.bold)),
                      subtitle: TranslatedText(
                          'Chit Value: ₹${g.chitValue.toStringAsFixed(0)}'),
                      onTap: () {
                        Navigator.push(
                            context,
                            MaterialPageRoute(
                                builder: (_) => GroupDetailScreen(group: g)));
                      },
                    )),
                const Divider(),
              ],
              if (result.members.isNotEmpty) ...[
                TranslatedText('Members',
                    style: GoogleFonts.outfit(
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                        color: AppTheme.primaryTeal)),
                const SizedBox(height: 8),
                ...result.members.map((m) => ListTile(
                      leading: CircleAvatar(
                        backgroundColor: Colors.blue.withValues(alpha: 0.2),
                        child: Text(m.name[0].toUpperCase(),
                            style: const TextStyle(color: Colors.blue)),
                      ),
                      title: Text(m.name,
                          style:
                              GoogleFonts.outfit(fontWeight: FontWeight.bold)),
                      subtitle: TranslatedText(m.phone),
                      onTap: () {
                        Navigator.push(
                            context,
                            MaterialPageRoute(
                                builder: (_) => AdvancedMemberProfileScreen(
                                    memberId: m.id)));
                      },
                    )),
              ],
            ],
          );
        },
      ),
    );
  }
}
