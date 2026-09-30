import 'package:chit_fund_app/utils/theme.dart';
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/glass_card.dart';
import '../main_screen.dart';
import 'forgot_pin_screen.dart';
import 'package:chit_fund_app/widgets/translated_text.dart';
import 'registration_screen.dart';
import '../../data/providers/db_provider.dart';
import '../../services/backup_service.dart';

class PinScreen extends ConsumerStatefulWidget {
  const PinScreen({super.key});
  @override
  ConsumerState<PinScreen> createState() => _PinScreenState();
}

class _PinScreenState extends ConsumerState<PinScreen>
    with SingleTickerProviderStateMixin {
  String _pinBuffer = '';
  String? _setupFirstPin;
  bool _isSetupMode = false;
  bool _isBiometricsAvailable = false;
  bool _pinError = false;

  int _pinAttemptsCount = 0;
  DateTime? _lockoutUntil;
  int _lockoutSecondsLeft = 0;
  Timer? _lockoutTimer;

  late AnimationController _shakeCtrl;
  late Animation<double> _shakeAnim;

  @override
  void initState() {
    super.initState();
    _shakeCtrl = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 500));
    _shakeAnim = Tween<double>(begin: 0, end: 1)
        .animate(CurvedAnimation(parent: _shakeCtrl, curve: Curves.elasticOut));
    _checkBiometrics();
  }

  Future<void> _checkBiometrics() async {
    final auth = ref.read(authProvider.notifier);
    await auth.checkPinExists();
    await auth.checkSecurityQuestionExists();
    setState(() {
      _isSetupMode = !ref.read(authProvider).hasPinCached;
    });

    final lockoutUntil = ref.read(authProvider).lockoutUntil;
    if (lockoutUntil != null && lockoutUntil.isAfter(DateTime.now())) {
      setState(() {
        _lockoutUntil = lockoutUntil;
        _pinAttemptsCount = 5;
      });
      _startLockoutTimer();
    }

    final available = await auth.checkBiometricAvailability();
    if (!mounted) return;
    setState(() => _isBiometricsAvailable = available);

    final authState = ref.read(authProvider);
    if (authState.hasPinCached &&
        authState.isBiometricEnabled &&
        available &&
        !_isLockedOut) {
      _triggerBiometrics();
    }
  }

  void _triggerBiometrics() async {
    final auth = ref.read(authProvider.notifier);
    final success = await auth.authenticateWithBiometrics();
    if (success && mounted) _navigateToDashboard();
  }

  void _navigateToDashboard() async {
    try {
      final dao = ref.read(appDaoProvider);
      final groups = await dao.getAllGroups();
      if (groups.isEmpty) {
        final backupService = ref.read(backupServiceProvider);
        final autoBackupInfo = await backupService.getLastAutoBackupInfo();
        if (autoBackupInfo['hasBackup'] == 'true') {
          final db = ref.read(appDatabaseProvider);
          final success = await backupService.restoreFromAutoBackup(db);
          if (success && mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                  content: TranslatedText('Auto-backup restored successfully!'),
                  backgroundColor: Colors.green),
            );
          }
        }
      }
    } catch (_) {}

    if (!mounted) return;
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => const MainScreen()),
    );
  }

  bool get _isLockedOut {
    if (_lockoutUntil == null) return false;
    final now = DateTime.now();
    if (now.isAfter(_lockoutUntil ?? now)) {
      return false;
    }
    return true;
  }

  void _startLockoutTimer() {
    _lockoutTimer?.cancel();
    _lockoutSecondsLeft =
        (_lockoutUntil ?? DateTime.now()).difference(DateTime.now()).inSeconds;
    _lockoutTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }
      final now = DateTime.now();
      if (_lockoutUntil == null || now.isAfter(_lockoutUntil!)) {
        timer.cancel();
        ref.read(authProvider.notifier).setLockoutUntil(null);
        setState(() {
          _lockoutUntil = null;
          _lockoutSecondsLeft = 0;
          _pinAttemptsCount = 0;
        });
      } else {
        setState(() {
          _lockoutSecondsLeft = _lockoutUntil!.difference(now).inSeconds;
        });
      }
    });
  }

  void _handleKeyPress(String digit) {
    if (_isLockedOut) return;
    if (_pinBuffer.length >= 4) return;
    setState(() {
      _pinBuffer += digit;
      _pinError = false;
    });
    if (_pinBuffer.length == 4) _processPin();
  }

  void _handleBackspace() {
    if (_pinBuffer.isEmpty) return;
    setState(() {
      _pinBuffer = _pinBuffer.substring(0, _pinBuffer.length - 1);
      _pinError = false;
    });
  }

  void _showSecurityQuestionSetup(String pin) {
    final auth = ref.read(authProvider.notifier);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    String selectedQuestion = 'What was the name of your first school?';
    final answerController = TextEditingController();
    final formKey = GlobalKey<FormState>();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      isDismissible: false,
      enableDrag: false,
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
                      'PIN Recovery Setup',
                      style: GoogleFonts.outfit(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: isDark ? Colors.white : const Color(0xFF0F172A),
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 12),
                    TranslatedText(
                      'Configure a security question to help recover your account in case you forget your PIN.',
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

                        await auth.setPin(pin);
                        await auth.saveSecurityRecovery(
                          selectedQuestion,
                          answerController.text.trim(),
                        );

                        if (!context.mounted) return;
                        Navigator.pop(context);

                        _navigateToDashboard();
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
                        'Save & Continue',
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

  void _processPin() async {
    final auth = ref.read(authProvider.notifier);

    if (_isSetupMode) {
      if (_setupFirstPin == null) {
        setState(() {
          _setupFirstPin = _pinBuffer;
          _pinBuffer = '';
        });
      } else {
        if (_pinBuffer == _setupFirstPin) {
          _showSecurityQuestionSetup(_pinBuffer);
        } else {
          _shakeCtrl.forward(from: 0);
          setState(() {
            _pinBuffer = '';
            _setupFirstPin = null;
            _pinError = true;
          });
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: TranslatedText('PINs do not match. Please try again.'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } else {
      final success = await auth.verifyPin(_pinBuffer);
      if (!mounted) return;
      if (success) {
        _navigateToDashboard();
      } else {
        _shakeCtrl.forward(from: 0);
        setState(() {
          _pinBuffer = '';
          _pinError = true;
          _pinAttemptsCount++;
          if (_pinAttemptsCount >= 5) {
            final targetTime = DateTime.now().add(const Duration(seconds: 30));
            _lockoutUntil = targetTime;
            auth.setLockoutUntil(targetTime);
            _startLockoutTimer();
          }
        });

        if (_pinAttemptsCount >= 5) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: TranslatedText(
                  'Too many incorrect PIN attempts. Locked out for 30 seconds.'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    }
  }

  Widget _buildDot(int index) {
    final active = index < _pinBuffer.length;
    return AnimatedContainer(
      duration: const Duration(milliseconds: 150),
      margin: const EdgeInsets.symmetric(horizontal: 10),
      width: active ? 18 : 16,
      height: active ? 18 : 16,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: _pinError
            ? Colors.red
            : (active
                ? AppTheme.primaryTeal
                : Colors.grey.withValues(alpha: 0.3)),
        boxShadow: active && !_pinError
            ? [
                BoxShadow(
                  color: AppTheme.primaryTeal.withValues(alpha: 0.4),
                  blurRadius: 8,
                  spreadRadius: 1,
                )
              ]
            : null,
      ),
    );
  }

  Widget _buildKey(String label, {VoidCallback? onTap, Widget? icon}) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final locked = _isLockedOut;
    return InkWell(
      onTap: locked ? null : onTap,
      borderRadius: BorderRadius.circular(40),
      child: Opacity(
        opacity: locked ? 0.35 : 1.0,
        child: Container(
          width: 72,
          height: 72,
          margin: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: isDark
                ? Colors.white.withValues(alpha: 0.05)
                : Colors.black.withValues(alpha: 0.04),
            border: Border.all(
              color: isDark
                  ? Colors.white.withValues(alpha: 0.1)
                  : Colors.black.withValues(alpha: 0.06),
            ),
          ),
          alignment: Alignment.center,
          child: icon ??
              TranslatedText(
                label,
                style: GoogleFonts.outfit(
                  fontSize: 24,
                  fontWeight: FontWeight.w600,
                  color: isDark ? Colors.white : const Color(0xFF0F172A),
                ),
              ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _shakeCtrl.dispose();
    _lockoutTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    String prompt;
    if (_isLockedOut) {
      prompt = 'Too many attempts. Try again in $_lockoutSecondsLeft seconds';
    } else if (_isSetupMode) {
      prompt = _setupFirstPin == null
          ? 'Welcome! Create your 4-digit PIN'
          : 'Confirm your PIN';
    } else {
      prompt = 'Welcome back! Enter your PIN';
    }

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: isDark
                ? [const Color(0xFF0F172A), const Color(0xFF020617)]
                : [const Color(0xFFF0FDF4), const Color(0xFFE2E8F0)],
          ),
        ),
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    _isSetupMode
                        ? Icons.lock_open_rounded
                        : Icons.lock_person_rounded,
                    size: 60,
                    color: AppTheme.primaryTeal,
                  ),
                  const SizedBox(height: 20),
                  TranslatedText(
                    prompt,
                    style: GoogleFonts.outfit(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: isDark ? Colors.white : const Color(0xFF0F172A),
                    ),
                  ),
                  const SizedBox(height: 32),

                  // PIN dots with shake animation
                  AnimatedBuilder(
                    animation: _shakeAnim,
                    builder: (_, child) => Transform.translate(
                      offset: Offset(
                          _shakeCtrl.isAnimating
                              ? 10 * (0.5 - _shakeAnim.value).abs() * 4
                              : 0,
                          0),
                      child: child,
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(4, _buildDot),
                    ),
                  ),
                  const SizedBox(height: 40),

                  // Keypad
                  GlassCard(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      children: [
                        for (final row in [
                          ['1', '2', '3'],
                          ['4', '5', '6'],
                          ['7', '8', '9'],
                        ])
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                            children: row
                                .map((d) => _buildKey(d,
                                    onTap: () => _handleKeyPress(d)))
                                .toList(),
                          ),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                          children: [
                            (_isBiometricsAvailable &&
                                    auth.isBiometricEnabled &&
                                    !_isSetupMode)
                                ? _buildKey('',
                                    onTap: _triggerBiometrics,
                                    icon: const Icon(Icons.fingerprint_rounded,
                                        size: 30, color: AppTheme.primaryTeal))
                                : const SizedBox(width: 88),
                            _buildKey('0', onTap: () => _handleKeyPress('0')),
                            _buildKey('',
                                onTap: _handleBackspace,
                                icon: Icon(Icons.backspace_outlined,
                                    size: 24,
                                    color: isDark
                                        ? Colors.white70
                                        : Colors.black54)),
                          ],
                        ),
                      ],
                    ),
                  ),

                  if (!_isSetupMode) ...[
                    const SizedBox(height: 20),
                    TextButton(
                      onPressed: () => Navigator.push(
                          context,
                          MaterialPageRoute(
                              builder: (_) => const ForgotPinScreen())),
                      child: TranslatedText(
                        'Forgot PIN?',
                        style: GoogleFonts.outfit(
                          color: AppTheme.primaryTeal,
                          fontSize: 15,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    TextButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                              builder: (_) => const RegistrationScreen()),
                        );
                      },
                      child: TranslatedText(
                        'New User? Register Online',
                        style: GoogleFonts.outfit(
                          color: AppTheme.primaryTeal,
                          fontSize: 15,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
