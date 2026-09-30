import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/theme.dart';
import '../data/local/database_helper.dart';
import '../services/encryption_service.dart';
import '../core/security/password_hasher.dart';

class MemberLoginDialog extends StatefulWidget {
  const MemberLoginDialog({super.key});

  static Future<bool> show(BuildContext context) async {
    final result = await showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (_) => const MemberLoginDialog(),
    );
    return result ?? false;
  }

  @override
  State<MemberLoginDialog> createState() => _MemberLoginDialogState();
}

class _MemberLoginDialogState extends State<MemberLoginDialog> {
  final _phoneController = TextEditingController();
  final _pinController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  String? _errorMessage;
  bool _isLoading = false;

  Future<void> _verifyLogin() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final phone = _phoneController.text.trim();
      final pin = _pinController.text.trim();

      // Query database for member by phone
      final db = DatabaseHelper().database;
      final query = db.select(db.members)..where((t) => t.phone.equals(phone));
      final members = await query.get();

      if (members.isEmpty) {
        setState(() {
          _errorMessage = 'Member not registered (సభ్యురాలు నమోదు కాలేదు)';
          _isLoading = false;
        });
        return;
      }

      final member = members.first;
      if (member.pin == null) {
        setState(() {
          _errorMessage = 'PIN not set by Leader (లీడర్ పిన్ సెట్ చేయలేదు)';
          _isLoading = false;
        });
        return;
      }

      // Decrypt or match hashed PIN
      bool pinMatches = false;
      try {
        final decryptedPin = EncryptionService().decrypt(member.pin!);
        pinMatches = (decryptedPin == pin);
      } catch (_) {}
      if (!pinMatches) {
        pinMatches = PasswordHasher.verify(pin, member.pin!);
      }

      if (!pinMatches) {
        setState(() {
          _errorMessage = 'Incorrect PIN (తప్పు పిన్ సంఖ్య)';
          _isLoading = false;
        });
        return;
      }

      // Fetch group association details
      final membershipQuery = db.select(db.sHGMemberships)
        ..where((t) => t.memberId.equals(member.id));
      final memberships = await membershipQuery.get();

      final groupId = memberships.isNotEmpty ? memberships.first.groupId : 0;

      // Save Session
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('member_is_logged_in', true);
      await prefs.setString('member_logged_in_phone', phone);
      await prefs.setInt('member_logged_in_id', member.id);
      await prefs.setInt('member_logged_in_group_id', groupId);

      if (mounted) {
        Navigator.pop(context, true);
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Login error (లాగిన్ లోపం): $e';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  'Member Login (సభ్యురాలి లాగిన్)',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.poppins(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.primaryTeal,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Please enter your phone number and 4-digit PIN provided by your group leader.',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.poppins(
                    fontSize: 12,
                    color: AppTheme.textMuted,
                  ),
                ),
                const SizedBox(height: 20),
                if (_errorMessage != null)
                  Container(
                    padding: const EdgeInsets.all(10),
                    margin: const EdgeInsets.only(bottom: 16),
                    decoration: BoxDecoration(
                      color: Colors.red[50],
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.red[200]!),
                    ),
                    child: Text(
                      _errorMessage!,
                      textAlign: TextAlign.center,
                      style: GoogleFonts.poppins(
                          color: Colors.red,
                          fontSize: 12,
                          fontWeight: FontWeight.w500),
                    ),
                  ),
                TextFormField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  maxLength: 10,
                  decoration: const InputDecoration(
                    labelText: 'Phone Number (ఫోన్ నెంబర్)',
                    prefixIcon:
                        Icon(Icons.phone_rounded, color: AppTheme.primaryTeal),
                    counterText: '',
                  ),
                  validator: (val) {
                    if (val == null || val.length < 10) {
                      return 'Enter 10-digit number';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _pinController,
                  obscureText: true,
                  keyboardType: TextInputType.number,
                  maxLength: 4,
                  decoration: const InputDecoration(
                    labelText: '4-Digit PIN (పిన్ సంఖ్య)',
                    prefixIcon:
                        Icon(Icons.lock_rounded, color: AppTheme.primaryTeal),
                    counterText: '',
                  ),
                  validator: (val) {
                    if (val == null || val.length != 4) {
                      return 'Enter 4-digit PIN';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: _isLoading ? null : _verifyLogin,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryTeal,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                              color: Colors.white, strokeWidth: 2),
                        )
                      : Text(
                          'Verify & Login',
                          style: GoogleFonts.poppins(
                              fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                ),
                const SizedBox(height: 12),
                TextButton(
                  onPressed:
                      _isLoading ? null : () => Navigator.pop(context, false),
                  child: Text(
                    'Cancel',
                    style: GoogleFonts.poppins(color: AppTheme.textMuted),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _phoneController.dispose();
    _pinController.dispose();
    super.dispose();
  }
}
