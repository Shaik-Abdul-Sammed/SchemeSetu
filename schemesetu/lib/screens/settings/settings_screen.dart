import 'package:chit_fund_app/utils/theme.dart';
import 'dart:io';
import 'package:path_provider/path_provider.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:translator/translator.dart';
import 'privacy_policy_screen.dart';
import 'about_screen.dart';
import 'change_pin_screen.dart';
import '../auth/login_screen.dart' as chit_login;
import '../../providers/auth_provider.dart';
import '../../providers/settings_provider.dart';
import '../../localization/app_localizations.dart';
import '../../services/backup_service.dart';
import '../../widgets/index.dart';
import 'package:flutter/services.dart';
import '../../services/export_service.dart';
import '../../services/drive_service.dart';
import '../../data/providers/db_provider.dart';
import 'audit_logs_screen.dart';

import 'package:chit_fund_app/widgets/translated_text.dart';
import '../../widgets/scroll_arrows_overlay.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});
  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  final BackupService _backupService = BackupService();
  bool _isBackupRunning = false;
  String? _lastBackupTime;
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _loadBackupInfo();
  }

  Future<void> _loadBackupInfo() async {
    final info = await _backupService.getLastAutoBackupInfo();
    if (mounted) {
      setState(() {
        _lastBackupTime = info['time'];
      });
    }
  }

  // ── Export to clipboard ──────────────────────────────────────
  // ── Sync to Google Drive ─────────────────────────────────────
  void _syncToDrive() async {
    setState(() => _isBackupRunning = true);
    DialogHelper.showLoading(context, message: 'Syncing to Drive...');

    final db = ref.read(appDatabaseProvider);
    final filePath = await ref
        .read(backupServiceProvider)
        .exportBackupToFile(db, share: false);

    if (filePath != null) {
      final result =
          await ref.read(driveServiceProvider).backupToDrive(filePath);
      if (!mounted) return;
      Navigator.pop(context); // Close loading

      if (result == 'SUCCESS') {
        DialogHelper.showSnackBar(
          context,
          message: 'Successfully backed up to Google Drive!',
          type: SnackBarType.success,
        );
      } else if (result.startsWith('MISSING_KEYS:')) {
        DialogHelper.showInfo(
          context,
          title: 'Google Drive Sync Setup Required',
          message:
              'It looks like you do not have Google API keys configured for this app yet. You need to configure OAuth Client IDs and Google Services (google-services.json for Android or GoogleService-Info.plist for iOS) to use Drive Sync.\n\nUse the local "Export Backup" option for now.',
        );
      } else if (result.startsWith('UNSUPPORTED_PLATFORM:')) {
        DialogHelper.showInfo(
          context,
          title: 'Not Supported',
          message:
              'Google Drive Sync is currently only supported on Android and iOS devices.\n\nPlease use the "Export Backup" option to save your data locally.',
        );
      } else if (result != 'CANCELED') {
        DialogHelper.showSnackBar(
          context,
          message: 'Failed to upload: ${result.replaceAll('ERROR: ', '')}',
          type: SnackBarType.error,
        );
      }
    } else {
      if (!mounted) return;
      Navigator.pop(context); // Close loading
      DialogHelper.showSnackBar(
        context,
        message: 'Failed to prepare backup file.',
        type: SnackBarType.error,
      );
    }

    if (mounted) {
      setState(() => _isBackupRunning = false);
    }
  }

  void _showInAppTranslateSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => const _InAppTranslatorSheet(),
    );
  }

  void _showSecurityQuestionSetupBottomSheet(BuildContext context) {
    final auth = ref.read(authProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    String selectedQuestion =
        auth.securityQuestion ?? 'What was the name of your first school?';
    final answerController = TextEditingController();
    final formKey = GlobalKey<FormState>();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        bool obscureAnswer = true;
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Container(
              padding: EdgeInsets.only(
                top: 24,
                left: 24,
                right: 24,
                bottom: MediaQuery.of(context).viewInsets.bottom + 24,
              ),
              decoration: BoxDecoration(
                color: Theme.of(context).scaffoldBackgroundColor,
                borderRadius:
                    const BorderRadius.vertical(top: Radius.circular(28)),
              ),
              child: Form(
                key: formKey,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    TranslatedText(
                      ref.read(authProvider).hasSecurityRecoveryCached
                          ? 'Update Recovery Question'
                          : 'Setup Recovery Question',
                      style: GoogleFonts.outfit(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: isDark ? Colors.white : const Color(0xFF0F172A),
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 12),
                    TranslatedText(
                      'This question will be used to verify your identity if you forget your PIN.',
                      style: GoogleFonts.outfit(
                        fontSize: 13,
                        color: Colors.grey,
                        height: 1.5,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 20),
                    DropdownButtonFormField<String>(
                      initialValue: selectedQuestion,
                      dropdownColor: isDark ? Colors.grey[900] : Colors.white,
                      style: GoogleFonts.outfit(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                        color: isDark ? Colors.white : Colors.black87,
                      ),
                      decoration: InputDecoration(
                        labelText: 'Select Security Question',
                        labelStyle: GoogleFonts.outfit(),
                      ),
                      items: const [
                        DropdownMenuItem(
                          value: 'What was the name of your first school?',
                          child: TranslatedText('First School Name'),
                        ),
                        DropdownMenuItem(
                          value: "What is your mother's maiden name?",
                          child: TranslatedText("Mother's Maiden Name"),
                        ),
                        DropdownMenuItem(
                          value: 'In what city were you born?',
                          child: TranslatedText('Birthplace City'),
                        ),
                        DropdownMenuItem(
                          value: 'What is the name of your favorite pet?',
                          child: TranslatedText('Favorite Pet Name'),
                        ),
                      ],
                      onChanged: (val) {
                        if (val != null) {
                          setModalState(() {
                            selectedQuestion = val;
                          });
                        }
                      },
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: answerController,
                      obscureText: obscureAnswer,
                      style: GoogleFonts.outfit(fontSize: 15),
                      decoration: InputDecoration(
                        labelText: 'Your Answer',
                        labelStyle: GoogleFonts.outfit(),
                        prefixIcon: const Icon(Icons.security_rounded),
                        suffixIcon: IconButton(
                          icon: Icon(
                            obscureAnswer
                                ? Icons.visibility_off_rounded
                                : Icons.visibility_rounded,
                          ),
                          onPressed: () {
                            setModalState(() {
                              obscureAnswer = !obscureAnswer;
                            });
                          },
                        ),
                      ),
                      validator: (v) {
                        if (v == null || v.trim().isEmpty) {
                          return 'Answer is required';
                        }
                        if (v.trim().length < 2) {
                          return 'Answer must be at least 2 characters';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      onPressed: () async {
                        if (!formKey.currentState!.validate()) return;

                        await ref
                            .read(authProvider.notifier)
                            .saveSecurityRecovery(
                              selectedQuestion,
                              answerController.text.trim(),
                            );

                        if (!context.mounted) return;
                        Navigator.pop(context);

                        DialogHelper.showSnackBar(
                          context,
                          message:
                              'Security recovery question saved successfully!',
                          type: SnackBarType.success,
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primaryTeal,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                      child: TranslatedText(
                        'Save recovery details',
                        style: GoogleFonts.outfit(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final settings = ref.watch(settingsProvider);
    final auth = ref.watch(authProvider);
    final loc = AppLocalizations.of(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: TranslatedText(loc.translate('settings'),
            style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
      ),
      body: ScrollArrowsOverlay(
        scrollController: _scrollController,
        child: ListView(
          controller: _scrollController,
          padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
          children: [
            // Theme toggle
            GlassCard(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        TranslatedText(
                          loc.translate('theme'),
                          style: GoogleFonts.outfit(
                              fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                        const SizedBox(height: 4),
                        TranslatedText(
                          loc.translate('theme_description'),
                          style: GoogleFonts.outfit(
                              fontSize: 13, color: Colors.grey),
                        ),
                      ],
                    ),
                  ),
                  DropdownButton<ThemeMode>(
                    value: settings.themeMode,
                    dropdownColor: isDark ? Colors.grey[900] : Colors.white,
                    style: GoogleFonts.outfit(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: isDark ? Colors.white : Colors.black87,
                    ),
                    underline: const SizedBox(),
                    icon: const Icon(Icons.arrow_drop_down,
                        color: AppTheme.primaryTeal),
                    items: const [
                      DropdownMenuItem(
                        value: ThemeMode.system,
                        child: TranslatedText('System'),
                      ),
                      DropdownMenuItem(
                        value: ThemeMode.light,
                        child: TranslatedText('Light'),
                      ),
                      DropdownMenuItem(
                        value: ThemeMode.dark,
                        child: TranslatedText('Dark'),
                      ),
                    ],
                    onChanged: (mode) {
                      if (mode != null) {
                        ref.read(settingsProvider.notifier).setThemeMode(mode);
                      }
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // Language
            GlassCard(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  TranslatedText(loc.translate('language'),
                      style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 10,
                    runSpacing: 8,
                    crossAxisAlignment: WrapCrossAlignment.center,
                    children: [
                      const _LangBtn('en', 'English'),
                      const _LangBtn('ur', 'اردو'),
                      const _LangBtn('te', 'తెలుగు'),
                      const _LangBtn('hi', 'हिन्दी'),
                      Tooltip(
                        message: loc.translate('google_translate'),
                        child: IconButton(
                          onPressed: _showInAppTranslateSheet,
                          icon: const Icon(Icons.translate,
                              color: AppTheme.primaryTeal),
                          splashRadius: 24,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  TextButton.icon(
                    onPressed: () async {
                      showDialog(
                        context: context,
                        barrierDismissible: false,
                        builder: (ctx) => const Center(
                          child: CircularProgressIndicator(
                            valueColor: AlwaysStoppedAnimation<Color>(
                                AppTheme.primaryTeal),
                          ),
                        ),
                      );

                      final detectedLang = await ref
                          .read(settingsProvider.notifier)
                          .detectLanguageFromLocation();

                      if (!context.mounted) return;
                      Navigator.pop(context); // Close loading dialog
                      await ref
                          .read(settingsProvider.notifier)
                          .setLocale(detectedLang);

                      if (!context.mounted) return;
                      String langName = 'English';
                      if (detectedLang == 'hi') langName = 'हिन्दी';
                      if (detectedLang == 'te') langName = 'తెలుగు';
                      if (detectedLang == 'ur') langName = 'اردو';

                      DialogHelper.showSnackBar(
                        context,
                        message: 'Language auto-detected and set to $langName.',
                        type: SnackBarType.success,
                      );
                    },
                    icon: const Icon(Icons.my_location,
                        size: 16, color: AppTheme.primaryTeal),
                    label: TranslatedText(
                      'Detect Language by Location',
                      style: GoogleFonts.outfit(
                        color: AppTheme.primaryTeal,
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // Biometrics & Security
            GlassCard(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              child: Column(
                children: [
                  SwitchListTile(
                    title: TranslatedText(loc.translate('biometric_login'),
                        style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
                    subtitle: TranslatedText(
                        loc.translate('biometric_description'),
                        style: GoogleFonts.outfit(
                            fontSize: 13, color: Colors.grey)),
                    value: auth.isBiometricEnabled,
                    activeThumbColor: AppTheme.primaryTeal,
                    onChanged: (val) => ref
                        .read(authProvider.notifier)
                        .setBiometricsEnabled(val),
                  ),
                  const Divider(height: 1, indent: 16, endIndent: 16),
                  ListTile(
                    title: TranslatedText('Change PIN',
                        style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
                    subtitle: TranslatedText('Update your 4-digit security PIN',
                        style: GoogleFonts.outfit(
                            fontSize: 13, color: Colors.grey)),
                    trailing: const Icon(Icons.chevron_right_rounded,
                        color: Colors.grey),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                            builder: (_) => const ChangePinScreen()),
                      );
                    },
                  ),
                  const Divider(height: 1, indent: 16, endIndent: 16),
                  ListTile(
                    title: TranslatedText('PIN Recovery Question',
                        style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
                    subtitle: TranslatedText(
                        auth.hasSecurityRecoveryCached
                            ? 'Update your security recovery question'
                            : 'Setup security question for PIN recovery',
                        style: GoogleFonts.outfit(
                            fontSize: 13, color: Colors.grey)),
                    trailing: const Icon(Icons.chevron_right_rounded,
                        color: Colors.grey),
                    onTap: () => _showSecurityQuestionSetupBottomSheet(context),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // Data & Notifications
            GlassCard(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              child: Column(
                children: [
                  SwitchListTile(
                    title: TranslatedText('Payment Reminders',
                        style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
                    subtitle: TranslatedText('Enable payment due notifications',
                        style: GoogleFonts.outfit(
                            fontSize: 13, color: Colors.grey)),
                    value: settings.notificationsEnabled,
                    activeThumbColor: AppTheme.primaryTeal,
                    onChanged: (val) => ref
                        .read(settingsProvider.notifier)
                        .toggleNotifications(),
                  ),
                  const Divider(height: 1, indent: 16, endIndent: 16),
                  SwitchListTile(
                    title: TranslatedText('Auto Backup',
                        style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
                    subtitle: TranslatedText(
                        'Automatically backup data periodically',
                        style: GoogleFonts.outfit(
                            fontSize: 13, color: Colors.grey)),
                    value: settings.autoBackup,
                    activeThumbColor: AppTheme.primaryTeal,
                    onChanged: (val) =>
                        ref.read(settingsProvider.notifier).toggleAutoBackup(),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // Organizer Info
            GlassCard(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  TranslatedText('Organizer Info',
                      style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  TextFormField(
                    initialValue: settings.organizerName,
                    decoration: const InputDecoration(
                      labelText: 'Organizer Name',
                      prefixIcon: Icon(Icons.person_rounded,
                          color: AppTheme.primaryTeal),
                    ),
                    onChanged: (val) => ref
                        .read(settingsProvider.notifier)
                        .saveOrganizerInfo(name: val),
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    initialValue: settings.upiId,
                    decoration: const InputDecoration(
                      labelText: 'UPI ID',
                      prefixIcon: Icon(Icons.payments_rounded,
                          color: AppTheme.primaryTeal),
                    ),
                    onChanged: (val) => ref
                        .read(settingsProvider.notifier)
                        .saveOrganizerInfo(upiId: val),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // Storage & Cache
            GlassCard(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  TranslatedText('Storage',
                      style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () async {
                            final confirmed =
                                await DialogHelper.showConfirmation(
                              context,
                              title: 'Clear Cache?',
                              message:
                                  'This will remove temporary cache files. Your data will not be affected.',
                              confirmText: 'Clear',
                              cancelText: 'Cancel',
                            );
                            if (confirmed == true && context.mounted) {
                              try {
                                final Directory tempDir =
                                    await getTemporaryDirectory();
                                if (tempDir.existsSync()) {
                                  final contents = tempDir.listSync();
                                  for (final file in contents) {
                                    try {
                                      file.deleteSync(recursive: true);
                                    } catch (e) {
                                      debugPrint(
                                          'Failed to delete cache file: ${file.path}, $e');
                                    }
                                  }
                                }
                              } catch (e) {
                                debugPrint(
                                    'Error clearing cache directory: $e');
                              }
                              if (!context.mounted) return;
                              DialogHelper.showSnackBar(
                                context,
                                message: 'Cache cleared successfully',
                                type: SnackBarType.success,
                              );
                            }
                          },
                          style: OutlinedButton.styleFrom(
                            foregroundColor: AppTheme.primaryTeal,
                            side: const BorderSide(color: AppTheme.primaryTeal),
                            minimumSize: const Size.fromHeight(46),
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(14)),
                          ),
                          icon: const Icon(Icons.cleaning_services_rounded),
                          label: TranslatedText('Clear Cache',
                              style: GoogleFonts.outfit(
                                  fontWeight: FontWeight.bold)),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // ── Audit Logs ───────────────────────────────────────
            GlassCard(
              padding: const EdgeInsets.all(16),
              child: ListTile(
                contentPadding: EdgeInsets.zero,
                leading: const Icon(Icons.history_rounded,
                    color: AppTheme.primaryTeal),
                title: TranslatedText('Audit Logs',
                    style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
                subtitle: const TranslatedText('View recent critical actions'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const AuditLogsScreen()),
                  );
                },
              ),
            ),
            const SizedBox(height: 14),

            // ── Backup & Restore (Enhanced) ──────────────────────
            GlassCard(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      TranslatedText(loc.translate('backup_restore'),
                          style:
                              GoogleFonts.outfit(fontWeight: FontWeight.bold)),
                      const Spacer(),
                      if (_lastBackupTime != null)
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: Colors.green.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: TranslatedText(
                            'Auto: ${_formatBackupTime(_lastBackupTime!)}',
                            style: GoogleFonts.outfit(
                                fontSize: 10,
                                color: Colors.green,
                                fontWeight: FontWeight.w500),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 14),

                  // Google Drive Sync
                  ElevatedButton.icon(
                    onPressed: _isBackupRunning ? null : _syncToDrive,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF4285F4),
                      foregroundColor: Colors.white,
                      minimumSize: const Size.fromHeight(46),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14)),
                    ),
                    icon: const Icon(Icons.cloud_sync_rounded),
                    label: TranslatedText('Sync to Google Drive',
                        style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
                  ),
                  const SizedBox(height: 10),
                  const Divider(),
                  const SizedBox(height: 10),

                  // SQLite Export
                  ElevatedButton.icon(
                    onPressed: () =>
                        ref.read(backupServiceProvider).exportDatabase(context),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blueAccent,
                      foregroundColor: Colors.white,
                      minimumSize: const Size.fromHeight(46),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14)),
                    ),
                    icon: const Icon(Icons.save_alt_rounded),
                    label: TranslatedText('Export Database (.sqlite)',
                        style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
                  ),
                  const SizedBox(height: 10),

                  // SQLite Import
                  OutlinedButton.icon(
                    onPressed: () => ref
                        .read(backupServiceProvider)
                        .importDatabase(context, ref.read(appDaoProvider), ref),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.blueAccent,
                      side: const BorderSide(color: Colors.blueAccent),
                      minimumSize: const Size.fromHeight(46),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14)),
                    ),
                    icon: const Icon(Icons.restore_page_rounded),
                    label: TranslatedText('Import Database (.sqlite)',
                        style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
                  ),
                  const SizedBox(height: 10),

                  // Members CSV Export
                  ElevatedButton.icon(
                    onPressed: () =>
                        ref.read(exportServiceProvider).exportMembersToCSV(),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.teal,
                      foregroundColor: Colors.white,
                      minimumSize: const Size.fromHeight(46),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14)),
                    ),
                    icon: const Icon(Icons.table_chart_rounded),
                    label: TranslatedText('Export Members List (.csv)',
                        style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // Legal
            GlassCard(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: Column(
                children: [
                  ListTile(
                    leading: const Icon(Icons.privacy_tip_rounded,
                        color: AppTheme.primaryTeal),
                    title: TranslatedText(loc.translate('privacy_policy'),
                        style: GoogleFonts.outfit(fontWeight: FontWeight.w500)),
                    trailing: const Icon(Icons.chevron_right_rounded,
                        color: Colors.grey),
                    onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(
                            builder: (_) => const PrivacyPolicyScreen())),
                  ),
                  const Divider(height: 1, indent: 56),
                  ListTile(
                    leading: const Icon(Icons.info_rounded,
                        color: AppTheme.primaryTeal),
                    title: TranslatedText(loc.translate('about_app'),
                        style: GoogleFonts.outfit(fontWeight: FontWeight.w500)),
                    trailing: const Icon(Icons.chevron_right_rounded,
                        color: Colors.grey),
                    onTap: () => Navigator.push(context,
                        MaterialPageRoute(builder: (_) => const AboutScreen())),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // Logout
            GlassCard(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: ListTile(
                leading:
                    const Icon(Icons.logout_rounded, color: Colors.redAccent),
                title: TranslatedText('Logout',
                    style: GoogleFonts.outfit(
                        fontWeight: FontWeight.w600, color: Colors.redAccent)),
                trailing:
                    const Icon(Icons.chevron_right_rounded, color: Colors.grey),
                onTap: () async {
                  final confirm = await showDialog<bool>(
                    context: context,
                    builder: (ctx) => AlertDialog(
                      title: const TranslatedText('Logout'),
                      content: const TranslatedText(
                          'Are you sure you want to log out? You will need to verify your phone number and PIN again.'),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.pop(ctx, false),
                          child: const TranslatedText('Cancel'),
                        ),
                        TextButton(
                          onPressed: () => Navigator.pop(ctx, true),
                          child: const TranslatedText('Logout',
                              style: TextStyle(color: Colors.redAccent)),
                        ),
                      ],
                    ),
                  );
                  if (confirm == true) {
                    await ref.read(appDaoProvider).clearAllData();
                    await ref.read(authProvider.notifier).logout();
                    if (!context.mounted) return;
                    Navigator.pushAndRemoveUntil(
                      context,
                      MaterialPageRoute(
                          builder: (_) => const chit_login.LoginScreen()),
                      (route) => false,
                    );
                  }
                },
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  String _formatBackupTime(String isoTime) {
    try {
      final dt = DateTime.parse(isoTime);
      final diff = DateTime.now().difference(dt);
      if (diff.inMinutes < 1) return 'just now';
      if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
      if (diff.inHours < 24) return '${diff.inHours}h ago';
      return '${diff.inDays}d ago';
    } catch (_) {
      return isoTime;
    }
  }
}

class _LangBtn extends ConsumerWidget {
  final String code;
  final String label;

  const _LangBtn(this.code, this.label);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final active = ref.watch(settingsProvider).locale.languageCode == code;
    return ElevatedButton(
      onPressed: () => ref.read(settingsProvider.notifier).setLocale(code),
      style: ElevatedButton.styleFrom(
        backgroundColor: active ? AppTheme.primaryTeal : Colors.transparent,
        foregroundColor: active ? Colors.white : AppTheme.primaryTeal,
        elevation: 0,
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: const BorderSide(color: AppTheme.primaryTeal),
        ),
      ),
      child: TranslatedText(label,
          style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.bold)),
    );
  }
}

class _InAppTranslatorSheet extends ConsumerStatefulWidget {
  const _InAppTranslatorSheet();

  @override
  ConsumerState<_InAppTranslatorSheet> createState() =>
      _InAppTranslatorSheetState();
}

class _InAppTranslatorSheetState extends ConsumerState<_InAppTranslatorSheet> {
  final TextEditingController _inputController = TextEditingController();
  final GoogleTranslator _translator = GoogleTranslator();
  String _translatedText = '';
  bool _isLoading = false;
  String _fromLang = 'auto';
  String _toLang = 'te'; // Default to Telugu or current locale language

  final Map<String, String> _languages = {
    'auto': 'Auto-detect',
    'en': 'English',
    'ur': 'اردو (Urdu)',
    'te': 'తెలుగు (Telugu)',
    'hi': 'हिन्दी (Hindi)',
  };

  final Map<String, String> _targetLanguages = {
    'en': 'English',
    'ur': 'اردو (Urdu)',
    'te': 'తెలుగు (Telugu)',
    'hi': 'हिन्दी (Hindi)',
  };

  @override
  void initState() {
    super.initState();
    // Default target language to settings/current locale
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final settings = ref.read(settingsProvider);
      if (_targetLanguages.containsKey(settings.locale.languageCode)) {
        setState(() {
          _toLang = settings.locale.languageCode;
        });
      }
    });
  }

  Future<void> _translate() async {
    if (_inputController.text.trim().isEmpty) return;
    setState(() {
      _isLoading = true;
      _translatedText = '';
    });

    try {
      final translation = await _translator.translate(
        _inputController.text,
        from: _fromLang,
        to: _toLang,
      );
      setState(() {
        _translatedText = translation.text;
      });
    } catch (e) {
      setState(() {
        _translatedText = 'Translation error: ${e.toString()}';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  void dispose() {
    _inputController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).scaffoldBackgroundColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
      ),
      padding: EdgeInsets.only(
        top: 20,
        left: 20,
        right: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Handle bar
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey.withValues(alpha: 0.3),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                const Icon(Icons.g_translate_rounded,
                    color: AppTheme.primaryTeal),
                const SizedBox(width: 8),
                TranslatedText(
                  'Google Translate Tool',
                  style: GoogleFonts.outfit(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Source and Target Selection
            Row(
              children: [
                Expanded(
                  child: DropdownButtonFormField<String>(
                    initialValue: _fromLang,
                    decoration: InputDecoration(
                      labelText: 'From',
                      labelStyle: GoogleFonts.outfit(fontSize: 12),
                      contentPadding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 8),
                    ),
                    items: _languages.entries.map((e) {
                      return DropdownMenuItem(
                        value: e.key,
                        child: TranslatedText(e.value,
                            style: GoogleFonts.outfit(fontSize: 14)),
                      );
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => _fromLang = val);
                    },
                  ),
                ),
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 8.0),
                  child: Icon(Icons.arrow_forward_rounded,
                      color: AppTheme.primaryTeal),
                ),
                Expanded(
                  child: DropdownButtonFormField<String>(
                    initialValue: _toLang,
                    decoration: InputDecoration(
                      labelText: 'To',
                      labelStyle: GoogleFonts.outfit(fontSize: 12),
                      contentPadding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 8),
                    ),
                    items: _targetLanguages.entries.map((e) {
                      return DropdownMenuItem(
                        value: e.key,
                        child: TranslatedText(e.value,
                            style: GoogleFonts.outfit(fontSize: 14)),
                      );
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => _toLang = val);
                    },
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Input field
            TextField(
              controller: _inputController,
              maxLines: 4,
              decoration: InputDecoration(
                hintText: 'Enter text to translate...',
                hintStyle: GoogleFonts.outfit(color: Colors.grey),
                border:
                    OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
              style: GoogleFonts.outfit(),
            ),
            const SizedBox(height: 16),

            // Translate button
            ElevatedButton(
              onPressed: _isLoading ? null : _translate,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryTeal,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
              ),
              child: _isLoading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                          color: Colors.white, strokeWidth: 2),
                    )
                  : TranslatedText('Translate',
                      style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
            ),
            const SizedBox(height: 20),

            // Translation output card
            if (_translatedText.isNotEmpty) ...[
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: isDark ? Colors.grey[900] : Colors.grey[100],
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey.withValues(alpha: 0.2)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        TranslatedText(
                          'Translation',
                          style: GoogleFonts.outfit(
                            fontSize: 12,
                            color: Colors.grey,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.copy_rounded, size: 18),
                          onPressed: () {
                            Clipboard.setData(
                                ClipboardData(text: _translatedText));
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                  content:
                                      TranslatedText('Copied to clipboard!')),
                            );
                          },
                        ),
                      ],
                    ),
                    TranslatedText(
                      _translatedText,
                      style: GoogleFonts.outfit(fontSize: 16),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
            ],

            // Open Web option
            TextButton.icon(
              onPressed: () async {
                final settings = ref.read(settingsProvider);
                final lang = settings.locale.languageCode;
                final uri =
                    Uri.parse('https://translate.google.com/?sl=auto&tl=$lang');
                try {
                  await launchUrl(uri, mode: LaunchMode.externalApplication);
                } catch (_) {}
              },
              icon: const Icon(Icons.open_in_new_rounded,
                  size: 16, color: AppTheme.primaryTeal),
              label: TranslatedText('Open Web Google Translate',
                  style: GoogleFonts.outfit(
                      color: AppTheme.primaryTeal, fontSize: 13)),
            ),
          ],
        ),
      ),
    );
  }
}
