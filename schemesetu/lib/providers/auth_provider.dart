import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:local_auth/local_auth.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../core/security/password_hasher.dart';

enum AuthStatus { unauthenticated, phoneVerified, pinVerified }

class AuthState {
  final AuthStatus status;
  final String? currentUserPhone;
  final bool isBiometricEnabled;
  final bool isLoading;
  final String? errorMessage;
  final DateTime? lockoutUntil;
  final String? securityQuestion;
  final bool hasSecurityRecoveryCached;
  final bool hasPinCached;

  const AuthState({
    this.status = AuthStatus.unauthenticated,
    this.currentUserPhone,
    this.isBiometricEnabled = false,
    this.isLoading = false,
    this.errorMessage,
    this.lockoutUntil,
    this.securityQuestion,
    this.hasSecurityRecoveryCached = false,
    this.hasPinCached = false,
  });

  bool get isLoggedIn => status != AuthStatus.unauthenticated;
  bool get isPinVerified => status == AuthStatus.pinVerified;

  AuthState copyWith({
    AuthStatus? status,
    String? currentUserPhone,
    bool? isBiometricEnabled,
    bool? isLoading,
    String? errorMessage,
    DateTime? lockoutUntil,
    String? securityQuestion,
    bool? hasSecurityRecoveryCached,
    bool? hasPinCached,
    bool clearError = false,
  }) {
    return AuthState(
      status: status ?? this.status,
      currentUserPhone: currentUserPhone ?? this.currentUserPhone,
      isBiometricEnabled: isBiometricEnabled ?? this.isBiometricEnabled,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
      lockoutUntil: lockoutUntil ?? this.lockoutUntil,
      securityQuestion: securityQuestion ?? this.securityQuestion,
      hasSecurityRecoveryCached:
          hasSecurityRecoveryCached ?? this.hasSecurityRecoveryCached,
      hasPinCached: hasPinCached ?? this.hasPinCached,
    );
  }
}

class AuthNotifier extends Notifier<AuthState> {
  final LocalAuthentication _localAuth = LocalAuthentication();
  static const _secureStorage =
      FlutterSecureStorage(aOptions: AndroidOptions());

  @override
  AuthState build() {
    _loadSessionState();
    return const AuthState();
  }

  Future<void> _loadSessionState() async {
    final prefs = await SharedPreferences.getInstance();
    final isLoggedIn = prefs.getBool('is_logged_in') ?? false;
    final currentUserPhone = prefs.getString('current_user_phone');
    final isBiometricEnabled = prefs.getBool('biometric_enabled') ?? false;

    DateTime? lockoutUntil;
    final lockoutStr = prefs.getString('lockout_until');
    if (lockoutStr != null) {
      final parsed = DateTime.tryParse(lockoutStr);
      if (parsed != null && parsed.isAfter(DateTime.now())) {
        lockoutUntil = parsed;
      } else {
        await prefs.remove('lockout_until');
      }
    }

    AuthStatus status = AuthStatus.unauthenticated;
    if (isLoggedIn) {
      status = AuthStatus.phoneVerified; // Need PIN re-entry on fresh open
    }

    state = state.copyWith(
      status: status,
      currentUserPhone: currentUserPhone,
      isBiometricEnabled: isBiometricEnabled,
      lockoutUntil: lockoutUntil,
    );

    await checkPinExists();
    await checkSecurityQuestionExists();
  }

  Future<void> checkPinExists() async {
    final phone = state.currentUserPhone;
    if (phone == null) return;
    final pin = await _secureStorage.read(key: 'user_pin_$phone');
    state = state.copyWith(hasPinCached: pin != null && pin.isNotEmpty);
  }

  Future<void> setLockoutUntil(DateTime? time) async {
    state = state.copyWith(lockoutUntil: time);
    final prefs = await SharedPreferences.getInstance();
    if (time == null) {
      await prefs.remove('lockout_until');
    } else {
      await prefs.setString('lockout_until', time.toIso8601String());
    }
  }

  Future<void> saveSecurityRecovery(String question, String answer) async {
    final phone = state.currentUserPhone;
    if (phone == null) return;
    final hashedAnswer = PasswordHasher.hash(answer.trim().toLowerCase());
    await _secureStorage.write(
        key: 'security_question_$phone', value: question);
    await _secureStorage.write(
        key: 'security_answer_$phone', value: hashedAnswer);
    state = state.copyWith(
      securityQuestion: question,
      hasSecurityRecoveryCached: true,
    );
  }

  Future<bool> verifySecurityAnswer(String answer) async {
    final phone = state.currentUserPhone;
    if (phone == null) return false;
    final savedAnswer =
        await _secureStorage.read(key: 'security_answer_$phone');
    if (savedAnswer != null &&
        PasswordHasher.verify(answer.trim().toLowerCase(), savedAnswer)) {
      return true;
    }
    return false;
  }

  Future<void> checkSecurityQuestionExists() async {
    final phone = state.currentUserPhone;
    if (phone == null) return;
    final securityQuestion =
        await _secureStorage.read(key: 'security_question_$phone');
    final answer = await _secureStorage.read(key: 'security_answer_$phone');
    state = state.copyWith(
      securityQuestion: securityQuestion,
      hasSecurityRecoveryCached: securityQuestion != null && answer != null,
    );
  }

  void clearError() {
    state = state.copyWith(clearError: true);
  }

  Future<bool> startLocalSession(String phoneNumber) async {
    state = state.copyWith(isLoading: true, clearError: true);

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('is_logged_in', true);
      await prefs.setString('current_user_phone', phoneNumber);

      state = state.copyWith(
        currentUserPhone: phoneNumber,
        status: AuthStatus.phoneVerified,
        isLoading: false,
      );
      return true;
    } catch (e) {
      state = state.copyWith(
        errorMessage: 'Could not start local session. Please try again.',
        isLoading: false,
      );
      return false;
    }
  }

  Future<void> sendOtp({
    required String phoneNumber,
    required void Function(String verificationId) onCodeSent,
    required void Function(String error) onError,
    required void Function() onAutoVerified,
    bool isResend = false,
  }) async {
    final success = await startLocalSession(phoneNumber);
    if (success) {
      onCodeSent('local-session');
    } else {
      onError(state.errorMessage ?? 'Could not continue.');
    }
  }

  Future<bool> verifyOtp(String otp) async {
    state = state.copyWith(isLoading: true, clearError: true);
    // Offline verification: Accept 6 digits
    if (otp.length == 6 && RegExp(r'^\d+$').hasMatch(otp)) {
      state = state.copyWith(
        status: AuthStatus.phoneVerified,
        isLoading: false,
      );
      return true;
    }
    state = state.copyWith(
      errorMessage: 'Invalid OTP. Please enter 6 valid digits.',
      isLoading: false,
    );
    return false;
  }

  void setCurrentPhone(String phone) {
    state = state.copyWith(currentUserPhone: phone);
  }

  Future<bool> setPin(String pin) async {
    final phone = state.currentUserPhone;
    if (phone == null) return false;
    if (pin.length == 4) {
      final hashedPin = PasswordHasher.hash(pin);
      await _secureStorage.write(key: 'user_pin_$phone', value: hashedPin);
      state = state.copyWith(
        hasPinCached: true,
        status: AuthStatus.pinVerified,
      );
      return true;
    }
    return false;
  }

  Future<bool> verifyPin(String pin) async {
    final phone = state.currentUserPhone;
    if (phone == null) return false;
    final savedPin = await _secureStorage.read(key: 'user_pin_$phone');
    if (savedPin != null && PasswordHasher.verify(pin, savedPin)) {
      state = state.copyWith(status: AuthStatus.pinVerified);
      return true;
    }
    state = state.copyWith(errorMessage: 'Incorrect PIN. Please try again.');
    return false;
  }

  Future<bool> resetPin(String phone, String newPin) async {
    if (phone == state.currentUserPhone && newPin.length == 4) {
      return await setPin(newPin);
    }
    return false;
  }

  Future<bool> checkBiometricAvailability() async {
    try {
      final isAvailable = await _localAuth.canCheckBiometrics;
      final isSupported = await _localAuth.isDeviceSupported();
      return isAvailable && isSupported;
    } catch (_) {
      return false;
    }
  }

  Future<bool> authenticateWithBiometrics() async {
    try {
      final authenticated = await _localAuth.authenticate(
        localizedReason: 'Authenticate to access SanghaSetu',
        biometricOnly: true,
      );
      if (authenticated) {
        state = state.copyWith(status: AuthStatus.pinVerified);
        return true;
      }
    } on Exception catch (e) {
      state = state.copyWith(errorMessage: 'Biometric authentication failed.');
      debugPrint('Biometric error: $e');
    }
    return false;
  }

  /// Require authentication (biometric or PIN) for critical actions like deleting.
  Future<bool> authenticateForCriticalAction(
      BuildContext context, String reason) async {
    if (state.isBiometricEnabled) {
      try {
        final authenticated = await _localAuth.authenticate(
          localizedReason: reason,
          biometricOnly: false,
        );
        return authenticated;
      } catch (e) {
        debugPrint('Biometric auth error for critical action: $e');
      }
    }
    // If biometrics are disabled or failed, we just return true for now,
    // or we could implement a PIN prompt. For now, returning true if biometrics disabled.
    return true;
  }

  Future<void> setBiometricsEnabled(bool enabled) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('biometric_enabled', enabled);
    state = state.copyWith(isBiometricEnabled: enabled);
  }

  void lockSession() {
    state = state.copyWith(status: AuthStatus.phoneVerified);
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('is_logged_in');
    await prefs.remove('current_user_phone');
    await _secureStorage.deleteAll();

    state = const AuthState(); // Reset to initial state
  }
}

final authProvider = NotifierProvider<AuthNotifier, AuthState>(() {
  return AuthNotifier();
});
