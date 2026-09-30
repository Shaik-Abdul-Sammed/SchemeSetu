import 'package:flutter_test/flutter_test.dart';

/// Auth business logic unit tests.
/// Tests pure logic extracted from AuthProvider:
/// - Phone number formatting rules
/// - PIN validation rules
/// - AuthState enum semantics
///
/// These tests intentionally avoid instantiating AuthProvider directly
/// because its constructor touches platform-backed secure storage.
/// Instead, the pure logic functions are tested in isolation.
///
/// For integration-level AuthProvider tests, use a widget test with
/// a mocked provider (see test/widgets/ for examples).

// ─── Phone Formatting ────────────────────────────────────────────────────────
// Mirrors the private _formatPhone logic in LoginScreen / AuthProvider

String _formatPhone(String raw) {
  final digits = raw.replaceAll(RegExp(r'\D'), '');
  if (digits.startsWith('91') && digits.length == 12) return '+$digits';
  if (digits.length == 10) return '+91$digits';
  return raw.startsWith('+') ? raw : '+$raw';
}

// ─── Phone Validation ────────────────────────────────────────────────────────
// Mirrors _validatePhone in LoginScreen

String? _validatePhone(String? value) {
  if (value == null || value.trim().isEmpty) return 'Phone number is required';
  final digits = value.replaceAll(RegExp(r'\D'), '');
  if (digits.length < 10) return 'Enter a valid 10-digit mobile number';
  return null;
}

// ─── PIN Validation ──────────────────────────────────────────────────────────
// Mirrors setPin length check in AuthProvider

bool _isValidPin(String pin) =>
    pin.length == 4 && RegExp(r'^\d{4}$').hasMatch(pin);

// ─── AuthState Enum ──────────────────────────────────────────────────────────

enum _AuthState { unauthenticated, phoneVerified, pinVerified }

void main() {
  group('Phone Formatting Logic', () {
    test('10-digit number gets +91 prefix', () {
      expect(_formatPhone('9876543210'), '+919876543210');
    });

    test('12-digit number starting with 91 gets + prefix', () {
      expect(_formatPhone('919876543210'), '+919876543210');
    });

    test('already-formatted E.164 number is unchanged', () {
      expect(_formatPhone('+919876543210'), '+919876543210');
    });

    test('number with dashes is normalized', () {
      expect(_formatPhone('98765-43210'), '+919876543210');
    });

    test('number with spaces is normalized', () {
      expect(_formatPhone('9876 543210'), '+919876543210');
    });

    test('number with parentheses is normalized', () {
      expect(_formatPhone('(98765)43210'), '+919876543210');
    });
  });

  group('Phone Validation Logic', () {
    test('empty string returns required error', () {
      expect(_validatePhone(''), 'Phone number is required');
      expect(_validatePhone(null), 'Phone number is required');
      expect(_validatePhone('   '), 'Phone number is required');
    });

    test('less than 10 digits returns format error', () {
      expect(_validatePhone('98765'), 'Enter a valid 10-digit mobile number');
      expect(
          _validatePhone('123456789'), 'Enter a valid 10-digit mobile number');
    });

    test('10-digit number passes validation', () {
      expect(_validatePhone('9876543210'), isNull);
    });

    test('number with country code passes validation', () {
      expect(_validatePhone('+919876543210'), isNull);
    });
  });

  group('PIN Validation Logic', () {
    test('valid 4-digit PINs', () {
      expect(_isValidPin('1234'), isTrue);
      expect(_isValidPin('0000'), isTrue);
      expect(_isValidPin('9999'), isTrue);
    });

    test('3-digit PIN is invalid', () {
      expect(_isValidPin('123'), isFalse);
    });

    test('5-digit PIN is invalid', () {
      expect(_isValidPin('12345'), isFalse);
    });

    test('empty PIN is invalid', () {
      expect(_isValidPin(''), isFalse);
    });

    test('alphabetic PIN is invalid', () {
      expect(_isValidPin('abcd'), isFalse);
      expect(_isValidPin('12ab'), isFalse);
    });

    test('PIN with spaces is invalid', () {
      expect(_isValidPin('12 4'), isFalse);
    });
  });

  group('AuthState Enum Semantics', () {
    test('unauthenticated means not logged in', () {
      final state = _AuthState.unauthenticated;
      expect(state != _AuthState.unauthenticated, isFalse);
    });

    test('phoneVerified is not pinVerified', () {
      expect(_AuthState.phoneVerified == _AuthState.pinVerified, isFalse);
    });

    test('isLoggedIn logic: any state except unauthenticated', () {
      bool isLoggedIn(_AuthState s) => s != _AuthState.unauthenticated;
      expect(isLoggedIn(_AuthState.unauthenticated), isFalse);
      expect(isLoggedIn(_AuthState.phoneVerified), isTrue);
      expect(isLoggedIn(_AuthState.pinVerified), isTrue);
    });

    test('isPinVerified logic: only pinVerified state', () {
      bool isPinVerified(_AuthState s) => s == _AuthState.pinVerified;
      expect(isPinVerified(_AuthState.unauthenticated), isFalse);
      expect(isPinVerified(_AuthState.phoneVerified), isFalse);
      expect(isPinVerified(_AuthState.pinVerified), isTrue);
    });
  });
}
