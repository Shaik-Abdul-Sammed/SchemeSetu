import 'package:chit_fund_app/utils/theme.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/index.dart';
import 'package:chit_fund_app/widgets/translated_text.dart';

class ChangePinScreen extends ConsumerStatefulWidget {
  const ChangePinScreen({super.key});
  @override
  ConsumerState<ChangePinScreen> createState() => _ChangePinScreenState();
}

enum _PinStep { verifyOld, enterNew, confirmNew }

class _ChangePinScreenState extends ConsumerState<ChangePinScreen>
    with SingleTickerProviderStateMixin {
  _PinStep _currentStep = _PinStep.verifyOld;
  String _pinBuffer = '';
  String? _newPin;
  bool _pinError = false;

  late AnimationController _shakeCtrl;
  late Animation<double> _shakeAnim;

  @override
  void initState() {
    super.initState();
    _shakeCtrl = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 500));
    _shakeAnim = Tween<double>(begin: 0, end: 1)
        .animate(CurvedAnimation(parent: _shakeCtrl, curve: Curves.elasticOut));
  }

  void _handleKeyPress(String digit) {
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

  void _processPin() async {
    final auth = ref.read(authProvider.notifier);

    switch (_currentStep) {
      case _PinStep.verifyOld:
        final success = await auth.verifyPin(_pinBuffer);
        if (success) {
          setState(() {
            _currentStep = _PinStep.enterNew;
            _pinBuffer = '';
          });
        } else {
          _triggerError('Incorrect current PIN');
        }
        break;
      case _PinStep.enterNew:
        setState(() {
          _newPin = _pinBuffer;
          _currentStep = _PinStep.confirmNew;
          _pinBuffer = '';
        });
        break;
      case _PinStep.confirmNew:
        if (_pinBuffer == _newPin) {
          await auth.setPin(_pinBuffer);
          if (!mounted) return;
          Navigator.pop(context);
          DialogHelper.showSnackBar(
            context,
            message: 'PIN changed successfully!',
            type: SnackBarType.success,
          );
        } else {
          _triggerError('PINs do not match. Try again.');
          setState(() {
            _currentStep = _PinStep.enterNew;
            _newPin = null;
          });
        }
        break;
    }
  }

  void _triggerError(String message) {
    _shakeCtrl.forward(from: 0);
    setState(() {
      _pinBuffer = '';
      _pinError = true;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: TranslatedText(message),
        backgroundColor: Colors.red,
      ),
    );
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
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(40),
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
    );
  }

  @override
  void dispose() {
    _shakeCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    String prompt;
    switch (_currentStep) {
      case _PinStep.verifyOld:
        prompt = 'Enter Current PIN';
        break;
      case _PinStep.enterNew:
        prompt = 'Enter New 4-digit PIN';
        break;
      case _PinStep.confirmNew:
        prompt = 'Confirm New PIN';
        break;
    }

    return Scaffold(
      appBar: AppBar(
        title: TranslatedText('Change PIN',
            style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      extendBodyBehindAppBar: true,
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
                  const Icon(
                    Icons.lock_reset_rounded,
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
                            const SizedBox(width: 88),
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
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
