import 'dart:convert';
import 'dart:math';
import 'package:crypto/crypto.dart';

class PasswordHasher {
  /// Generates a salted SHA-256 hash formatted as `<salt_hex>:<hash_hex>`.
  static String hash(String input, {String? salt}) {
    final saltStr = salt ?? _generateSalt(16);
    final keyBytes = utf8.encode(saltStr);
    final inputBytes = utf8.encode(input);
    final hmac = Hmac(sha256, keyBytes);
    final digest = hmac.convert(inputBytes);
    return '$saltStr:${digest.toString()}';
  }

  /// Verifies an input against a stored hash string.
  /// Supports backward compatibility with plaintext legacy values.
  static bool verify(String input, String storedHash) {
    if (!storedHash.contains(':')) {
      // Legacy plaintext fallback
      return input == storedHash;
    }
    final parts = storedHash.split(':');
    if (parts.length != 2) return false;
    final salt = parts[0];
    final expectedHash = parts[1];
    final computed = hash(input, salt: salt);
    final computedHash = computed.split(':')[1];
    return _constantTimeEquals(computedHash, expectedHash);
  }

  static String _generateSalt([int length = 16]) {
    final rnd = Random.secure();
    final values = List<int>.generate(length, (_) => rnd.nextInt(256));
    return values.map((b) => b.toRadixString(16).padLeft(2, '0')).join();
  }

  static bool _constantTimeEquals(String a, String b) {
    if (a.length != b.length) return false;
    int result = 0;
    for (int i = 0; i < a.length; i++) {
      result |= a.codeUnitAt(i) ^ b.codeUnitAt(i);
    }
    return result == 0;
  }
}
