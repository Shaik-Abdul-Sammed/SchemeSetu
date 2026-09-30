import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import 'package:drift/drift.dart' as drift;
import '../../config/theme.dart';
import '../../config/app_icons.dart';
import '../../providers/shg_providers.dart';
import '../../data/repositories/member_repository.dart';
import '../../data/local/app_database.dart';
import '../../services/pdf_service.dart';
import '../../core/security/password_hasher.dart';

class ManagerDashboardScreen extends ConsumerStatefulWidget {
  const ManagerDashboardScreen({super.key});

  @override
  ConsumerState<ManagerDashboardScreen> createState() =>
      _ManagerDashboardScreenState();
}

class _ManagerDashboardScreenState
    extends ConsumerState<ManagerDashboardScreen> {
  bool _isLoading = true;
  List<SHGGroup> _groups = [];
  List<Map<String, dynamic>> _pendingLoans = [];

  @override
  void initState() {
    super.initState();
    _refreshData();
  }

  Future<void> _refreshData() async {
    setState(() => _isLoading = true);
    try {
      final dao = ref.read(shgDaoProvider);
      final groups = await dao.getAllGroups();

      // Load pending loans with member details
      final pendingRaw = await dao.getPendingLoansWithMemberDetails();
      final pendingMapped = pendingRaw.map((row) {
        final loan = row.readTable(dao.sHGLoans);
        final member = row.readTable(dao.members);
        final membership = row.readTable(dao.sHGMemberships);
        return {
          'loan': loan,
          'member': member,
          'membership': membership,
        };
      }).toList();

      if (mounted) {
        setState(() {
          _groups = groups;
          _pendingLoans = pendingMapped;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text('Failed to load data: $e'),
              backgroundColor: Colors.red),
        );
      }
    }
  }

  Future<void> _registerMember() async {
    if (_groups.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text(
                'Please create an SHG Group first before adding members.')),
      );
      return;
    }

    final nameController = TextEditingController();
    final phoneController = TextEditingController();
    final addressController = TextEditingController();
    final pinController = TextEditingController();
    SHGGroup selectedGroup = _groups.first;
    final formKey = GlobalKey<FormState>();

    await showDialog(
      context: context,
      builder: (dialogCtx) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return Dialog(
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20)),
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24.0),
                child: Form(
                  key: formKey,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Text(
                        'Register Member & PIN',
                        style: GoogleFonts.poppins(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.primaryTeal,
                        ),
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: nameController,
                        decoration:
                            const InputDecoration(labelText: 'Name (పేరు)'),
                        validator: (val) =>
                            val == null || val.isEmpty ? 'Enter name' : null,
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: phoneController,
                        keyboardType: TextInputType.phone,
                        maxLength: 10,
                        decoration: const InputDecoration(
                            labelText: 'Phone (ఫోన్ నెంబర్)', counterText: ''),
                        validator: (val) => val == null || val.length < 10
                            ? 'Enter 10-digit phone'
                            : null,
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: addressController,
                        decoration: const InputDecoration(
                            labelText: 'Address (చిరునామా)'),
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: pinController,
                        obscureText: true,
                        keyboardType: TextInputType.number,
                        maxLength: 4,
                        decoration: const InputDecoration(
                            labelText: '4-Digit Login PIN (పిన్ సంఖ్య)',
                            counterText: ''),
                        validator: (val) => val == null || val.length != 4
                            ? 'Enter 4-digit PIN'
                            : null,
                      ),
                      const SizedBox(height: 16),
                      DropdownButtonFormField<SHGGroup>(
                        initialValue: selectedGroup,
                        decoration: const InputDecoration(
                            labelText: 'Select Group (గ్రూపును ఎంచుకోండి)'),
                        items: _groups.map((g) {
                          return DropdownMenuItem(
                            value: g,
                            child: Text(g.name),
                          );
                        }).toList(),
                        onChanged: (val) {
                          if (val != null) {
                            setDialogState(() => selectedGroup = val);
                          }
                        },
                      ),
                      const SizedBox(height: 24),
                      ElevatedButton(
                        onPressed: () async {
                          if (!formKey.currentState!.validate()) return;

                          try {
                            final memberRepo =
                                ref.read(memberRepositoryProvider);
                            final shgDao = ref.read(shgDaoProvider);

                            // Insert Member
                            final memberId = await memberRepo.insertMember(
                              MembersCompanion(
                                name: drift.Value(nameController.text.trim()),
                                phone: drift.Value(phoneController.text.trim()),
                                address:
                                    drift.Value(addressController.text.trim()),
                                pin: drift.Value(PasswordHasher.hash(pinController.text.trim())),
                              ),
                            );

                            // Link to Group Membership
                            await shgDao.addMemberToGroup(
                              SHGMembershipsCompanion(
                                memberId: drift.Value(memberId),
                                groupId: drift.Value(selectedGroup.id),
                              ),
                            );

                            if (dialogCtx.mounted) {
                              Navigator.pop(dialogCtx);
                              if (mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                      content: Text(
                                          'Member Registered Successfully!'),
                                      backgroundColor: Colors.green),
                                );
                              }
                              _refreshData();
                            }
                          } catch (e) {
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                    content: Text('Error registering member: $e'),
                                    backgroundColor: Colors.red),
                              );
                            }
                          }
                        },
                        style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.primaryTeal),
                        child: const Text('Save & Register'),
                      ),
                      TextButton(
                        onPressed: () => Navigator.pop(dialogCtx),
                        child: const Text('Cancel'),
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        );
      },
    );
  }

  Future<void> _processLoanApproval(
      Map<String, dynamic> item, bool isApproved) async {
    final loan = item['loan'] as SHGLoan;
    final member = item['member'] as Member;
    final membership = item['membership'] as SHGMembership;

    try {
      final shgDao = ref.read(shgDaoProvider);

      if (isApproved) {
        // Change status to Active
        await shgDao.updateLoanStatus(loan.id, 'Active');

        // Log double-entry cashbook entries
        final principal = double.tryParse(loan.principalAmount) ?? 0.0;
        final fee = principal * 0.02; // 2% processing fee

        // Cash flow disbursement Expense
        await shgDao.insertCashBookEntry(
          SHGCashBooksCompanion(
            groupId: drift.Value(membership.groupId),
            description: drift.Value('Loan Disbursement to ${member.name}'),
            amount: drift.Value(-principal),
            transactionType: drift.Value('Expense'),
            category: drift.Value('Loan Disbursement'),
          ),
        );

        // Processing fee Income
        await shgDao.insertCashBookEntry(
          SHGCashBooksCompanion(
            groupId: drift.Value(membership.groupId),
            description:
                drift.Value('2% Loan processing fee from ${member.name}'),
            amount: drift.Value(fee),
            transactionType: drift.Value('Income'),
            category: drift.Value('Processing Fee'),
          ),
        );

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
                content: Text(
                    'Loan Approved for ${member.name}! processing fee collected: ₹$fee'),
                backgroundColor: Colors.green),
          );
        }
      } else {
        // Reject loan
        await shgDao.updateLoanStatus(loan.id, 'Rejected');
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
                content: Text('Loan Request Rejected for ${member.name}'),
                backgroundColor: Colors.orange),
          );
        }
      }

      _refreshData();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text('Transaction failed: $e'),
              backgroundColor: Colors.red),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Theme(
      data: AppTheme.lightTheme,
      child: Scaffold(
        appBar: AppBar(
          title: Text(
            'Manager Dashboard',
            style: GoogleFonts.poppins(fontWeight: FontWeight.bold),
          ),
          actions: [
            IconButton(
              icon: const Icon(Icons.refresh_rounded),
              onPressed: _refreshData,
            ),
          ],
        ),
        body: SafeArea(
          child: LayoutBuilder(
            builder: (context, constraints) {
              final isTablet = constraints.maxWidth > 600;
              return SingleChildScrollView(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildWelcomeHeader(),
                    const SizedBox(height: 20),
                    _buildStatsGrid(isTablet),
                    const SizedBox(height: 24),
                    _buildSectionHeader('Pending Loan Applications'),
                    const SizedBox(height: 12),
                    _buildPendingLoansList(),
                    const SizedBox(height: 24),
                    _buildSectionHeader('Self-Help Groups (SHGs)'),
                    const SizedBox(height: 12),
                    _buildGroupsList(isTablet),
                  ],
                ),
              );
            },
          ),
        ),
        floatingActionButton: FloatingActionButton.extended(
          onPressed: _registerMember,
          backgroundColor: AppTheme.primaryTeal,
          icon: const Icon(Icons.person_add_alt_1_rounded),
          label: Text('Register Member',
              style: GoogleFonts.poppins(fontWeight: FontWeight.bold)),
        ),
      ),
    );
  }

  Widget _buildWelcomeHeader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Welcome back, Admin',
          style: GoogleFonts.poppins(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: AppTheme.textDark,
          ),
        ),
        Text(
          'Here is the status of DWCRA groups under your jurisdiction.',
          style: GoogleFonts.poppins(
            fontSize: 14,
            color: AppTheme.textMuted,
          ),
        ),
      ],
    ).animate().fadeIn(duration: 300.ms).slideX(begin: -0.1, end: 0);
  }

  Widget _buildStatsGrid(bool isTablet) {
    if (_isLoading) {
      return Shimmer.fromColors(
        baseColor: Colors.grey[300]!,
        highlightColor: Colors.grey[100]!,
        child: GridView.count(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: isTablet ? 4 : 2,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          childAspectRatio: 1.3,
          children: List.generate(4, (_) => Container(color: Colors.white)),
        ),
      );
    }

    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: isTablet ? 4 : 2,
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      childAspectRatio: 1.3,
      children: [
        _buildStatCard('Total Groups', '${_groups.length}',
            AppTheme.primaryTeal, AppIcons.groups),
        _buildStatCard(
            'Total Savings', '₹1.5 Lakhs', Colors.indigo, AppIcons.savings),
        _buildStatCard(
            'Active Loans', '₹85,000', Colors.deepOrange, AppIcons.loans),
        _buildStatCard(
            'Group Health', '94% Normal', Colors.green, Icons.favorite_rounded),
      ],
    );
  }

  Widget _buildStatCard(
      String label, String value, Color color, IconData icon) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Icon(icon, color: color, size: 24),
                Container(
                  width: 8,
                  height: 8,
                  decoration:
                      BoxDecoration(color: color, shape: BoxShape.circle),
                ),
              ],
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  value,
                  style: GoogleFonts.poppins(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.textDark),
                ),
                Text(
                  label,
                  style: GoogleFonts.poppins(
                      fontSize: 10, color: AppTheme.textMuted),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Text(
      title,
      style: GoogleFonts.poppins(
        fontSize: 18,
        fontWeight: FontWeight.bold,
        color: AppTheme.primaryTeal,
      ),
    );
  }

  Widget _buildPendingLoansList() {
    if (_isLoading) {
      return Container(height: 60, color: Colors.grey[200]);
    }

    if (_pendingLoans.isEmpty) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.grey[100]!),
        ),
        child: Text(
          'No pending loan applications.',
          textAlign: TextAlign.center,
          style: GoogleFonts.poppins(color: AppTheme.textMuted),
        ),
      );
    }

    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: _pendingLoans.length,
      itemBuilder: (context, index) {
        final item = _pendingLoans[index];
        final loan = item['loan'] as SHGLoan;
        final member = item['member'] as Member;

        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                      color: Colors.amber[50], shape: BoxShape.circle),
                  child: const Icon(AppIcons.loans,
                      color: AppTheme.accentGold, size: 24),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        member.name,
                        style: GoogleFonts.poppins(
                            fontWeight: FontWeight.bold,
                            color: AppTheme.textDark),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Amount: ₹${loan.principalAmount} • Term: ${loan.durationMonths}m • Interest: ${loan.interestRate}%',
                        style: GoogleFonts.poppins(
                            fontSize: 12, color: AppTheme.textMuted),
                      ),
                      if (loan.purpose != null && loan.purpose!.isNotEmpty)
                        Text(
                          'Purpose: ${loan.purpose}',
                          style: GoogleFonts.poppins(
                              fontSize: 11, color: AppTheme.primaryTeal),
                        ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.check_circle_rounded,
                      color: Colors.green, size: 28),
                  onPressed: () => _processLoanApproval(item, true),
                ),
                IconButton(
                  icon: const Icon(Icons.cancel_rounded,
                      color: Colors.red, size: 28),
                  onPressed: () => _processLoanApproval(item, false),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Future<void> _exportGroupPdf(SHGGroup group) async {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
          content: Text('Generating Group Summary PDF...'),
          duration: Duration(seconds: 1)),
    );

    try {
      final shgDao = ref.read(shgDaoProvider);

      // Query memberships
      final memberships = await shgDao.getMembersByGroupId(group.id);

      // Query meetings
      final meetings = await shgDao.getMeetingsByGroupId(group.id);

      // Fetch active loans and aggregate savings
      double totalSavings = 0.0;
      int activeLoansCount = 0;
      for (var m in memberships) {
        final savingsList = await shgDao.getSavingsByMembershipId(m.id);
        totalSavings += savingsList.fold(0.0, (sum, item) => sum + item.amount);

        final loansList = await shgDao.getLoansByMembershipId(m.id);
        activeLoansCount += loansList.where((l) => l.status == 'Active').length;
      }

      final pdfData = await PdfService().generateSHGGroupReport(
        groupName: group.name,
        members: memberships
            .map((m) => {
                  'memberId': m.memberId,
                  'role': 'Member',
                  'joinedAt': m.joinedAt,
                })
            .toList(),
        totalSavings: totalSavings,
        activeLoans: activeLoansCount,
        meetings: meetings
            .map((me) => {
                  'meetingDate': me.meetingDate,
                  'notes': me.resolutionNote ?? 'Regular monthly meeting',
                })
            .toList(),
      );

      await PdfService()
          .shareReport(pdfData, '${group.name}_summary_report.pdf');
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            content: Text('Failed to export Group PDF: $e'),
            backgroundColor: Colors.red),
      );
    }
  }

  Widget _buildGroupsList(bool isTablet) {
    if (_isLoading) {
      return Container(height: 100, color: Colors.grey[200]);
    }

    if (_groups.isEmpty) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.grey[100]!),
        ),
        child: Text(
          'No Self Help Groups added yet.',
          textAlign: TextAlign.center,
          style: GoogleFonts.poppins(color: AppTheme.textMuted),
        ),
      );
    }

    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: _groups.length,
      itemBuilder: (context, index) {
        final group = _groups[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          child: ListTile(
            leading: const CircleAvatar(
              backgroundColor: AppTheme.primaryTeal,
              child: Icon(Icons.group_work_rounded, color: Colors.white),
            ),
            title: Text(
              group.name,
              style: GoogleFonts.poppins(
                  fontWeight: FontWeight.bold, color: AppTheme.textDark),
            ),
            subtitle: Text(
              'Savings Due: 15th monthly',
              style:
                  GoogleFonts.poppins(fontSize: 12, color: AppTheme.textMuted),
            ),
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                IconButton(
                  icon: const Icon(AppIcons.pdf, color: Colors.redAccent),
                  onPressed: () => _exportGroupPdf(group),
                  tooltip: 'Export Group Report PDF',
                ),
                const Icon(Icons.chevron_right_rounded,
                    color: AppTheme.primaryTeal),
              ],
            ),
          ),
        );
      },
    );
  }
}
