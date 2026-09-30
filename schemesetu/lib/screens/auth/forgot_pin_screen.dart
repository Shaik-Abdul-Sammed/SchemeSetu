import 'package:chit_fund_app/utils/theme.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/glass_card.dart';
import 'login_screen.dart';
import 'package:chit_fund_app/widgets/translated_text.dart';

class ForgotPinScreen extends ConsumerStatefulWidget {
  const ForgotPinScreen({super.key});
  @override
  ConsumerState<ForgotPinScreen> createState() => _ForgotPinScreenState();
}

class _ForgotPinScreenState extends ConsumerState<ForgotPinScreen> {
  final _formKey = GlobalKey<FormState>();
  final _phoneCtrl = TextEditingController();
  final _newPinCtrl = TextEditingController();
  final _confirmPinCtrl = TextEditingController();
  final _answerCtrl = TextEditingController();

  @override
  void dispose() {
    _phoneCtrl.dispose();
    _newPinCtrl.dispose();
    _confirmPinCtrl.dispose();
    _answerCtrl.dispose();
    super.dispose();
  }

  void _resetPin() async {
    if (!_formKey.currentState!.validate()) return;

    final auth = ref.read(authProvider.notifier);

    // Format input phone
    final rawPhone = _phoneCtrl.text.trim();
    final digits = rawPhone.replaceAll(RegExp(r'\D'), '');
    final inputFormatted = '+91$digits';

    // Verify phone number ownership
    final registeredPhone = ref.read(authProvider).currentUserPhone;
    final prefs = await SharedPreferences.getInstance();
    final savedPhone = prefs.getString('current_user_phone');

    final expectedPhone = registeredPhone ?? savedPhone;

    if (expectedPhone != null && inputFormatted != expectedPhone) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: TranslatedText(
              'Incorrect registered mobile number. Verification failed.'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    // Verify security answer if recovery is configured
    if (ref.read(authProvider).hasSecurityRecoveryCached) {
      final isAnswerCorrect = await auth.verifySecurityAnswer(_answerCtrl.text);
      if (!isAnswerCorrect) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: TranslatedText('Incorrect security question answer.'),
            backgroundColor: Colors.red,
          ),
        );
        return;
      }
    }

    final success = await auth.setPin(_newPinCtrl.text);
    if (!mounted) return;
    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: TranslatedText('PIN updated successfully!'),
          backgroundColor: Colors.green,
        ),
      );
      Navigator.pop(context);
    }
  }

  void _logoutToVerify() async {
    final auth = ref.read(authProvider.notifier);
    await auth.logout();
    if (!mounted) return;
    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (_) => const LoginScreen()),
      (_) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final auth = ref.watch(authProvider);

    return Scaffold(
      appBar: AppBar(
        title: TranslatedText('Reset PIN',
            style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Icon(Icons.lock_reset_rounded,
                  size: 60, color: AppTheme.primaryTeal),
              const SizedBox(height: 16),
              TranslatedText('Verify & Reset PIN',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.outfit(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: isDark ? Colors.white : const Color(0xFF0F172A))),
              const SizedBox(height: 8),
              TranslatedText(
                'Please enter your registered mobile number and set a new 4-digit PIN.',
                textAlign: TextAlign.center,
                style: GoogleFonts.outfit(
                    fontSize: 13, color: Colors.grey, height: 1.5),
              ),
              const SizedBox(height: 24),
              GlassCard(
                child: Column(
                  children: [
                    TextFormField(
                      controller: _phoneCtrl,
                      keyboardType: TextInputType.phone,
                      maxLength: 10,
                      inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                      style: GoogleFonts.outfit(
                          fontSize: 16, fontWeight: FontWeight.w600),
                      decoration: InputDecoration(
                        counterText: '',
                        labelText: 'Registered Mobile Number',
                        labelStyle: GoogleFonts.outfit(),
                        prefixText: '+91 ',
                        prefixIcon: const Icon(Icons.phone_android_rounded),
                      ),
                      validator: (v) {
                        if (v == null || v.isEmpty)
                          return 'Registered mobile is required';
                        if (v.length != 10)
                          return 'Enter a valid 10-digit number';
                        return null;
                      },
                    ),
                    if (auth.hasSecurityRecoveryCached) ...[
                      const SizedBox(height: 16),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: isDark
                              ? Colors.white.withValues(alpha: 0.05)
                              : Colors.black.withValues(alpha: 0.04),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: isDark
                                ? Colors.white.withValues(alpha: 0.1)
                                : Colors.black.withValues(alpha: 0.06),
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            TranslatedText(
                              'Security Recovery Question:',
                              style: GoogleFonts.outfit(
                                fontSize: 12,
                                fontWeight: FontWeight.w500,
                                color: Colors.grey,
                              ),
                            ),
                            const SizedBox(height: 4),
                            TranslatedText(
                              auth.securityQuestion ?? '',
                              style: GoogleFonts.outfit(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: isDark ? Colors.white : Colors.black87,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _answerCtrl,
                        style: GoogleFonts.outfit(fontSize: 15),
                        decoration: InputDecoration(
                          labelText: 'Security Answer',
                          labelStyle: GoogleFonts.outfit(),
                          prefixIcon: const Icon(Icons.question_answer_rounded),
                        ),
                        validator: (v) {
                          if (v == null || v.trim().isEmpty)
                            return 'Answer is required';
                          return null;
                        },
                      ),
                    ] else ...[
                      const SizedBox(height: 16),
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.amber.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: Colors.amber.withValues(alpha: 0.3),
                          ),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.warning_amber_rounded,
                                color: Colors.amber),
                            const SizedBox(width: 10),
                            Expanded(
                              child: TranslatedText(
                                'No security recovery question is configured. Please set one up in Settings after logging in.',
                                style: GoogleFonts.outfit(
                                  fontSize: 12,
                                  color: Colors.amber[800],
                                  height: 1.4,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _newPinCtrl,
                      keyboardType: TextInputType.number,
                      maxLength: 4,
                      obscureText: true,
                      inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                      style: GoogleFonts.outfit(fontSize: 18, letterSpacing: 4),
                      decoration: InputDecoration(
                        counterText: '',
                        labelText: 'New 4-Digit PIN',
                        labelStyle: GoogleFonts.outfit(),
                        prefixIcon: const Icon(Icons.lock_outlined),
                      ),
                      validator: (v) {
                        if (v == null || v.length != 4)
                          return 'PIN must be exactly 4 digits';
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _confirmPinCtrl,
                      keyboardType: TextInputType.number,
                      maxLength: 4,
                      obscureText: true,
                      inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                      style: GoogleFonts.outfit(fontSize: 18, letterSpacing: 4),
                      decoration: InputDecoration(
                        counterText: '',
                        labelText: 'Confirm PIN',
                        labelStyle: GoogleFonts.outfit(),
                        prefixIcon: const Icon(Icons.lock_outlined),
                      ),
                      validator: (v) {
                        if (v != _newPinCtrl.text) return 'PINs do not match';
                        return null;
                      },
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      onPressed: _resetPin,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primaryTeal,
                        foregroundColor: Colors.white,
                        minimumSize: const Size.fromHeight(50),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14)),
                        elevation: 0,
                      ),
                      child: TranslatedText('Update PIN',
                          style: GoogleFonts.outfit(
                              fontSize: 15, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              const Divider(),
              const SizedBox(height: 12),
              TranslatedText('Or authenticate with a different account:',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.outfit(fontSize: 13, color: Colors.grey)),
              const SizedBox(height: 12),
              OutlinedButton.icon(
                onPressed: _logoutToVerify,
                icon: const Icon(Icons.logout_rounded),
                label: TranslatedText('Login with another phone',
                    style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppTheme.primaryTeal,
                  side: const BorderSide(color: AppTheme.primaryTeal),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
