import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:chit_fund_app/providers/shg_providers.dart';
import '../member/advanced_member_profile_screen.dart';
import '../../utils/theme.dart';

class ShgGroupDetailScreen extends ConsumerStatefulWidget {
  final int groupId;
  const ShgGroupDetailScreen({super.key, required this.groupId});

  @override
  ConsumerState<ShgGroupDetailScreen> createState() =>
      _ShgGroupDetailScreenState();
}

class _ShgGroupDetailScreenState extends ConsumerState<ShgGroupDetailScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final groupAsync = ref.watch(shgGroupDetailProvider(widget.groupId));

    return Scaffold(
      appBar: AppBar(
        title: groupAsync.when(
          data: (group) => Text(group.name,
              style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
          loading: () => const Text('Loading...'),
          error: (_, __) => const Text('Error'),
        ),
        bottom: TabBar(
          controller: _tabController,
          labelColor: Colors.deepPurple,
          unselectedLabelColor: Colors.grey,
          indicatorColor: Colors.deepPurple,
          labelStyle: GoogleFonts.outfit(fontWeight: FontWeight.bold),
          tabs: const [
            Tab(text: 'Members'),
            Tab(text: 'Meetings'),
            Tab(text: 'Cashbook'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildMembersTab(),
          _buildMeetingsTab(),
          _buildCashbookTab(),
        ],
      ),
    );
  }

  Widget _buildMembersTab() {
    final membersAsync = ref.watch(shgMembersProvider(widget.groupId));
    return membersAsync.when(
      data: (members) {
        if (members.isEmpty) {
          return const Center(child: Text('No members found.'));
        }
        return ListView.builder(
          itemCount: members.length,
          itemBuilder: (context, index) {
            final m = members[index];
            return ListTile(
              leading: CircleAvatar(
                backgroundColor: AppTheme.primaryTeal.withValues(alpha: 0.1),
                child: Text(
                  m.name.isNotEmpty ? m.name[0].toUpperCase() : '?',
                  style: const TextStyle(
                      color: AppTheme.primaryTeal, fontWeight: FontWeight.bold),
                ),
              ),
              title: Text(m.name,
                  style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
              subtitle: Text('${m.phone} • Role: ${m.role}',
                  style: GoogleFonts.outfit(fontSize: 13, color: Colors.grey)),
              trailing: const Icon(Icons.chevron_right_rounded),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) =>
                        AdvancedMemberProfileScreen(memberId: m.memberId),
                  ),
                );
              },
            );
          },
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(child: Text('Error: $e')),
    );
  }

  Widget _buildMeetingsTab() {
    final meetingsAsync = ref.watch(shgMeetingsProvider(widget.groupId));
    return meetingsAsync.when(
      data: (meetings) {
        if (meetings.isEmpty)
          return const Center(child: Text('No meetings found.'));
        return ListView.builder(
          itemCount: meetings.length,
          itemBuilder: (context, index) {
            final m = meetings[index];
            return ListTile(
              title: Text(
                  'Meeting Date: ${m.meetingDate.toLocal().toString().split(' ')[0]}'),
              subtitle: Text(m.resolutionNote ?? 'No notes'),
            );
          },
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(child: Text('Error: $e')),
    );
  }

  Widget _buildCashbookTab() {
    final cashbookAsync = ref.watch(shgCashBookProvider(widget.groupId));
    return cashbookAsync.when(
      data: (entries) {
        if (entries.isEmpty)
          return const Center(child: Text('No cashbook entries.'));
        return ListView.builder(
          itemCount: entries.length,
          itemBuilder: (context, index) {
            final e = entries[index];
            return ListTile(
              title: Text(e.description ?? 'Transaction'),
              subtitle: Text('Type: ${e.transactionType}'),
              trailing: Text('₹${e.amount}',
                  style: TextStyle(
                    color: e.transactionType.toUpperCase() == 'INCOME'
                        ? Colors.green
                        : Colors.red,
                    fontWeight: FontWeight.bold,
                  )),
            );
          },
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(child: Text('Error: $e')),
    );
  }
}
