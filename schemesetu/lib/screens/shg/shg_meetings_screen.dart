import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:drift/drift.dart' as drift;
import 'package:chit_fund_app/utils/theme.dart';
import 'package:chit_fund_app/widgets/glass_card.dart';
import 'package:chit_fund_app/data/local/app_database.dart';
import 'package:chit_fund_app/providers/shg_providers.dart';

class ShgMeetingsScreen extends ConsumerStatefulWidget {
  final int groupId;
  const ShgMeetingsScreen({super.key, required this.groupId});

  @override
  ConsumerState<ShgMeetingsScreen> createState() => _ShgMeetingsScreenState();
}

class _ShgMeetingsScreenState extends ConsumerState<ShgMeetingsScreen> {
  Future<void> _refresh() async {
    ref.invalidate(shgMeetingsProvider(widget.groupId));
    ref.invalidate(shgGroupAttendeeCountsProvider(widget.groupId));
  }

  void _showRecordMeetingSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _RecordMeetingSheet(
        groupId: widget.groupId,
        onSaved: () {
          _refresh();
        },
      ),
    );
  }

  void _showMeetingDetailsSheet(SHGMeeting meeting, int attendeeCount) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _MeetingDetailsSheet(
        groupId: widget.groupId,
        meeting: meeting,
        attendeeCount: attendeeCount,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final meetingsAsync = ref.watch(shgMeetingsProvider(widget.groupId));
    final attendeeCountsAsync =
        ref.watch(shgGroupAttendeeCountsProvider(widget.groupId));
    final groupAsync = ref.watch(shgGroupDetailProvider(widget.groupId));
    final dateFormat = DateFormat('dd MMM yyyy');

    return Scaffold(
      appBar: AppBar(
        title: groupAsync.when(
          data: (group) => Text('${group.name} - Meetings',
              style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
          loading: () => Text('Meetings',
              style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
          error: (_, __) => Text('Meetings',
              style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
        ),
      ),
      body: RefreshIndicator(
        onRefresh: _refresh,
        child: meetingsAsync.when(
          data: (meetings) {
            if (meetings.isEmpty) {
              return ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                children: [
                  SizedBox(height: MediaQuery.of(context).size.height * 0.25),
                  Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            color: Colors.blue.withValues(alpha: 0.1),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.event_note_rounded,
                              size: 48, color: Colors.blue),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'No Meetings Recorded',
                          style: GoogleFonts.outfit(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Tap the button below to schedule and log your first meeting.',
                          textAlign: TextAlign.center,
                          style: GoogleFonts.outfit(
                              fontSize: 14, color: Colors.grey),
                        ),
                      ],
                    ),
                  ),
                ],
              );
            }

            final attendeeCounts = attendeeCountsAsync.value ?? {};

            return ListView.separated(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(16),
              itemCount: meetings.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final meeting = meetings[index];
                final attendeeCount = attendeeCounts[meeting.id] ?? 0;

                return GlassCard(
                  padding: const EdgeInsets.all(16),
                  child: InkWell(
                    borderRadius: BorderRadius.circular(16),
                    onTap: () =>
                        _showMeetingDetailsSheet(meeting, attendeeCount),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: Colors.blue.withValues(alpha: 0.1),
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: const Icon(
                                    Icons.calendar_month_rounded,
                                    color: Colors.blue,
                                    size: 20,
                                  ),
                                ),
                                const SizedBox(width: 10),
                                Text(
                                  dateFormat.format(meeting.meetingDate),
                                  style: GoogleFonts.outfit(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.green.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                    color: Colors.green.withValues(alpha: 0.3)),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(Icons.people_alt_rounded,
                                      size: 14, color: Colors.green),
                                  const SizedBox(width: 4),
                                  Text(
                                    '$attendeeCount Present',
                                    style: GoogleFonts.outfit(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                      color: Colors.green[800],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        if (meeting.conductedBy != null &&
                            meeting.conductedBy!.isNotEmpty) ...[
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              const Icon(Icons.person_pin_rounded,
                                  size: 14, color: Colors.grey),
                              const SizedBox(width: 4),
                              Text(
                                'Conducted by: ${meeting.conductedBy}',
                                style: GoogleFonts.outfit(
                                    fontSize: 13, color: Colors.grey[700]),
                              ),
                            ],
                          ),
                        ],
                        const SizedBox(height: 8),
                        Text(
                          meeting.resolutionNote ?? 'No resolution notes.',
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.outfit(
                            fontSize: 13,
                            color: Colors.grey[600],
                          ),
                        ),
                        const SizedBox(height: 8),
                        Align(
                          alignment: Alignment.centerRight,
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                'View Details & Roster',
                                style: GoogleFonts.outfit(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: AppTheme.primaryTeal,
                                ),
                              ),
                              const Icon(Icons.chevron_right_rounded,
                                  size: 16, color: AppTheme.primaryTeal),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            );
          },
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (err, _) => Center(
            child: Text('Error loading meetings: $err',
                style: GoogleFonts.outfit(color: Colors.red)),
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showRecordMeetingSheet,
        backgroundColor: AppTheme.primaryTeal,
        icon: const Icon(Icons.add_rounded, color: Colors.white),
        label: Text(
          'Record Meeting',
          style: GoogleFonts.outfit(
              fontWeight: FontWeight.bold, color: Colors.white),
        ),
      ),
    );
  }
}

class _RecordMeetingSheet extends ConsumerStatefulWidget {
  final int groupId;
  final VoidCallback onSaved;

  const _RecordMeetingSheet({
    required this.groupId,
    required this.onSaved,
  });

  @override
  ConsumerState<_RecordMeetingSheet> createState() =>
      _RecordMeetingSheetState();
}

class _RecordMeetingSheetState extends ConsumerState<_RecordMeetingSheet> {
  final _formKey = GlobalKey<FormState>();
  DateTime _meetingDate = DateTime.now();
  final _conductedByController = TextEditingController(text: 'President');
  final _resolutionNotesController = TextEditingController();

  final Map<int, bool> _attendanceMap = {};
  final Map<int, TextEditingController> _fineControllers = {};
  bool _isSaving = false;

  @override
  void dispose() {
    _conductedByController.dispose();
    _resolutionNotesController.dispose();
    for (final c in _fineControllers.values) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _meetingDate,
      firstDate: DateTime(2020),
      lastDate: DateTime.now().add(const Duration(days: 30)),
    );
    if (picked != null) {
      setState(() => _meetingDate = picked);
    }
  }

  Future<void> _saveMeeting(List<MemberWithRole> members) async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSaving = true);

    try {
      final dao = ref.read(shgDaoProvider);

      final meetingCompanion = SHGMeetingsCompanion(
        groupId: drift.Value(widget.groupId),
        meetingDate: drift.Value(_meetingDate),
        resolutionNote: drift.Value(_resolutionNotesController.text.trim()),
        conductedBy: drift.Value(_conductedByController.text.trim()),
      );

      final meetingId = await dao.insertMeeting(meetingCompanion);

      final attendanceCompanions = <SHGAttendancesCompanion>[];
      for (final m in members) {
        final isPresent = _attendanceMap[m.id] ?? true;
        final fineStr = _fineControllers[m.id]?.text.trim() ?? '0.0';
        final fine = double.tryParse(fineStr) ?? 0.0;

        attendanceCompanions.add(
          SHGAttendancesCompanion(
            meetingId: drift.Value(meetingId),
            membershipId: drift.Value(m.id),
            isPresent: drift.Value(isPresent),
            fineAmount: drift.Value(fine),
          ),
        );
      }

      if (attendanceCompanions.isNotEmpty) {
        await dao.insertAttendances(attendanceCompanions);
      }

      if (!mounted) return;
      widget.onSaved();
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Meeting and attendance recorded successfully!'),
          backgroundColor: Colors.green,
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to save meeting: $e'),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final membersAsync = ref.watch(shgMembersProvider(widget.groupId));
    final dateFormat = DateFormat('dd MMM yyyy');

    return Container(
      height: MediaQuery.of(context).size.height * 0.88,
      decoration: BoxDecoration(
        color: Theme.of(context).scaffoldBackgroundColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        children: [
          Container(
            margin: const EdgeInsets.only(top: 12),
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.grey.withValues(alpha: 0.3),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Record New Meeting',
                  style: GoogleFonts.outfit(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),
          const Divider(height: 1),
          Expanded(
            child: Form(
              key: _formKey,
              child: ListView(
                padding: const EdgeInsets.all(20),
                children: [
                  Text(
                    'Meeting Date',
                    style: GoogleFonts.outfit(
                        fontSize: 14, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 8),
                  InkWell(
                    onTap: _pickDate,
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        border: Border.all(
                            color: Colors.grey.withValues(alpha: 0.3)),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.calendar_today_rounded,
                              size: 18, color: AppTheme.primaryTeal),
                          const SizedBox(width: 12),
                          Text(
                            dateFormat.format(_meetingDate),
                            style: GoogleFonts.outfit(
                                fontSize: 16, fontWeight: FontWeight.bold),
                          ),
                          const Spacer(),
                          Text(
                            'Change',
                            style: GoogleFonts.outfit(
                              fontSize: 13,
                              color: AppTheme.primaryTeal,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Conducted By',
                    style: GoogleFonts.outfit(
                        fontSize: 14, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: _conductedByController,
                    decoration: InputDecoration(
                      hintText: 'e.g., President, Secretary, Animator',
                      prefixIcon: const Icon(Icons.person_outline_rounded),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    validator: (val) {
                      if (val == null || val.trim().isEmpty) {
                        return 'Please enter who conducted the meeting';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Resolution / Discussion Notes',
                    style: GoogleFonts.outfit(
                        fontSize: 14, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: _resolutionNotesController,
                    maxLines: 3,
                    decoration: InputDecoration(
                      hintText:
                          'Key decisions, loan approvals, agenda points...',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Member Attendance',
                        style: GoogleFonts.outfit(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        'Default: All Present',
                        style: GoogleFonts.outfit(
                            fontSize: 12, color: Colors.grey),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  membersAsync.when(
                    data: (members) {
                      if (members.isEmpty) {
                        return const Padding(
                          padding: EdgeInsets.symmetric(vertical: 16),
                          child: Text(
                              'No members enrolled in this group yet. Attendance will be empty.'),
                        );
                      }

                      // Initialize map defaults if needed
                      for (final m in members) {
                        _attendanceMap.putIfAbsent(m.id, () => true);
                        _fineControllers.putIfAbsent(
                            m.id, () => TextEditingController(text: '0.0'));
                      }

                      return Column(
                        children: members.map((m) {
                          final isPresent = _attendanceMap[m.id] ?? true;

                          return Container(
                            margin: const EdgeInsets.only(bottom: 8),
                            padding: const EdgeInsets.symmetric(
                                horizontal: 12, vertical: 8),
                            decoration: BoxDecoration(
                              color: isPresent
                                  ? Colors.green.withValues(alpha: 0.05)
                                  : Colors.red.withValues(alpha: 0.05),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: isPresent
                                    ? Colors.green.withValues(alpha: 0.2)
                                    : Colors.red.withValues(alpha: 0.2),
                              ),
                            ),
                            child: Column(
                              children: [
                                Row(
                                  children: [
                                    CircleAvatar(
                                      radius: 16,
                                      backgroundColor: AppTheme.primaryTeal
                                          .withValues(alpha: 0.1),
                                      child: Text(
                                        m.name.isNotEmpty
                                            ? m.name[0].toUpperCase()
                                            : '?',
                                        style: const TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.bold,
                                          color: AppTheme.primaryTeal,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            m.name,
                                            style: GoogleFonts.outfit(
                                                fontWeight: FontWeight.bold),
                                          ),
                                          Text(
                                            m.role,
                                            style: GoogleFonts.outfit(
                                                fontSize: 12,
                                                color: Colors.grey),
                                          ),
                                        ],
                                      ),
                                    ),
                                    ChoiceChip(
                                      label: Text(
                                        isPresent ? 'Present' : 'Absent',
                                        style: TextStyle(
                                          color: isPresent
                                              ? Colors.white
                                              : Colors.white,
                                          fontSize: 12,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      selected: true,
                                      selectedColor: isPresent
                                          ? Colors.green
                                          : Colors.red,
                                      onSelected: (_) {
                                        setState(() {
                                          _attendanceMap[m.id] = !isPresent;
                                        });
                                      },
                                    ),
                                  ],
                                ),
                                if (!isPresent) ...[
                                  const SizedBox(height: 8),
                                  Row(
                                    children: [
                                      const Icon(Icons.gavel_rounded,
                                          size: 16, color: Colors.orange),
                                      const SizedBox(width: 8),
                                      Text(
                                        'Absence Fine (₹):',
                                        style: GoogleFonts.outfit(
                                            fontSize: 12,
                                            fontWeight: FontWeight.w500),
                                      ),
                                      const SizedBox(width: 12),
                                      SizedBox(
                                        width: 80,
                                        height: 36,
                                        child: TextField(
                                          controller: _fineControllers[m.id],
                                          keyboardType: TextInputType.number,
                                          decoration: InputDecoration(
                                            contentPadding:
                                                const EdgeInsets.symmetric(
                                                    horizontal: 8, vertical: 4),
                                            isDense: true,
                                            border: OutlineInputBorder(
                                              borderRadius:
                                                  BorderRadius.circular(8),
                                            ),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ],
                            ),
                          );
                        }).toList(),
                      );
                    },
                    loading: () =>
                        const Center(child: CircularProgressIndicator()),
                    error: (err, _) => Text('Error loading members: $err',
                        style: const TextStyle(color: Colors.red)),
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primaryTeal,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      onPressed: _isSaving
                          ? null
                          : () {
                              final members = membersAsync.value ?? [];
                              _saveMeeting(members);
                            },
                      child: _isSaving
                          ? const SizedBox(
                              width: 24,
                              height: 24,
                              child: CircularProgressIndicator(
                                  color: Colors.white, strokeWidth: 2),
                            )
                          : Text(
                              'Save Meeting & Attendance',
                              style: GoogleFonts.outfit(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _MeetingDetailsSheet extends ConsumerWidget {
  final int groupId;
  final SHGMeeting meeting;
  final int attendeeCount;

  const _MeetingDetailsSheet({
    required this.groupId,
    required this.meeting,
    required this.attendeeCount,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final attendancesAsync =
        ref.watch(shgMeetingAttendancesProvider(meeting.id));
    final membersAsync = ref.watch(shgMembersProvider(groupId));
    final dateFormat = DateFormat('EEEE, dd MMMM yyyy');

    return Container(
      height: MediaQuery.of(context).size.height * 0.75,
      decoration: BoxDecoration(
        color: Theme.of(context).scaffoldBackgroundColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        children: [
          Container(
            margin: const EdgeInsets.only(top: 12),
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.grey.withValues(alpha: 0.3),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Meeting Details',
                  style: GoogleFonts.outfit(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),
          const Divider(height: 1),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(20),
              children: [
                Row(
                  children: [
                    const Icon(Icons.calendar_month_rounded,
                        color: AppTheme.primaryTeal),
                    const SizedBox(width: 8),
                    Text(
                      dateFormat.format(meeting.meetingDate),
                      style: GoogleFonts.outfit(
                          fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                if (meeting.conductedBy != null &&
                    meeting.conductedBy!.isNotEmpty)
                  Text(
                    'Conducted by: ${meeting.conductedBy}',
                    style:
                        GoogleFonts.outfit(fontSize: 14, color: Colors.grey[700]),
                  ),
                const SizedBox(height: 16),
                Text(
                  'Resolution Notes:',
                  style: GoogleFonts.outfit(
                      fontSize: 14, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.grey.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    meeting.resolutionNote ?? 'No resolution notes recorded.',
                    style: GoogleFonts.outfit(fontSize: 14),
                  ),
                ),
                const SizedBox(height: 20),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Attendance Roster',
                      style: GoogleFonts.outfit(
                          fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                    Text(
                      '$attendeeCount Present',
                      style: GoogleFonts.outfit(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: Colors.green),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                attendancesAsync.when(
                  data: (attendances) {
                    if (attendances.isEmpty) {
                      return const Text('No attendance records logged.');
                    }

                    final members = membersAsync.value ?? [];
                    final memberNameMap = {
                      for (final m in members) m.id: m.name
                    };

                    return Column(
                      children: attendances.map((att) {
                        final name =
                            memberNameMap[att.membershipId] ?? 'Member #${att.membershipId}';
                        return ListTile(
                          contentPadding: EdgeInsets.zero,
                          leading: Icon(
                            att.isPresent
                                ? Icons.check_circle_rounded
                                : Icons.cancel_rounded,
                            color: att.isPresent ? Colors.green : Colors.red,
                          ),
                          title: Text(name,
                              style: GoogleFonts.outfit(
                                  fontWeight: FontWeight.w600)),
                          subtitle: !att.isPresent && att.fineAmount > 0
                              ? Text('Fine: ₹${att.fineAmount.toStringAsFixed(0)}',
                                  style: GoogleFonts.outfit(
                                      color: Colors.orange, fontSize: 12))
                              : null,
                          trailing: Text(
                            att.isPresent ? 'Present' : 'Absent',
                            style: GoogleFonts.outfit(
                              fontWeight: FontWeight.bold,
                              color: att.isPresent ? Colors.green : Colors.red,
                            ),
                          ),
                        );
                      }).toList(),
                    );
                  },
                  loading: () =>
                      const Center(child: CircularProgressIndicator()),
                  error: (err, _) => Text('Error loading attendances: $err',
                      style: const TextStyle(color: Colors.red)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
