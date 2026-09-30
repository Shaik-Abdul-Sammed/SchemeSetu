import 'dart:convert';
import 'dart:math';
import 'dart:typed_data';
import 'package:crypto/crypto.dart';
import 'package:encrypt/encrypt.dart' as enc;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/foundation.dart';
import '../core/security/exceptions.dart';

class EncryptionService {
  static final EncryptionService _instance = EncryptionService._internal();
  factory EncryptionService() => _instance;
  EncryptionService._internal();

  final _secureStorage = const FlutterSecureStorage(aOptions: AndroidOptions());
  enc.Key? _key;

  Future<void> init() async {
    if (_key != null) return;
    try {
      String? keyBase64 =
          await _secureStorage.read(key: 'database_encryption_key');
      if (keyBase64 == null) {
        // Generate a new 256-bit AES key
        final random = Random.secure();
        final values = List<int>.generate(32, (i) => random.nextInt(256));
        keyBase64 = base64Url.encode(values);
        await _secureStorage.write(
            key: 'database_encryption_key', value: keyBase64);
      }
      _key = enc.Key.fromBase64(keyBase64);
    } catch (e) {
      debugPrint(
          'EncryptionService secure storage error: $e. Falling back to PBKDF2 device entropy.');
      try {
        final prefs = await SharedPreferences.getInstance();
        String? salt = prefs.getString('device_entropy_salt');
        if (salt == null) {
          final rnd = Random.secure();
          final saltBytes = List<int>.generate(16, (_) => rnd.nextInt(256));
          salt = base64Url.encode(saltBytes);
          await prefs.setString('device_entropy_salt', salt);
        }
        // Device entropy combining app identifier and persistent salt
        final entropySeed = 'SchemeSetuOfflineEntropy_$salt';
        final derivedKeyBytes = _pbkdf2Sha256(
          utf8.encode(entropySeed),
          base64Url.decode(salt),
          10000,
          32,
        );
        _key = enc.Key(derivedKeyBytes);
      } catch (fallbackErr) {
        throw EncryptionKeyException(
          'Failed to initialize encryption key from both secure storage and device entropy: $fallbackErr',
          fallbackErr,
        );
      }
    }
  }

  static Uint8List _pbkdf2Sha256(
      List<int> password, List<int> salt, int iterations, int keyLength) {
    final hmac = Hmac(sha256, password);
    final numBlocks = (keyLength + 31) ~/ 32;
    final out = BytesBuilder();

    for (int block = 1; block <= numBlocks; block++) {
      final blockBytes = [
        (block >> 24) & 0xff,
        (block >> 16) & 0xff,
        (block >> 8) & 0xff,
        block & 0xff,
      ];
      List<int> u = hmac.convert([...salt, ...blockBytes]).bytes;
      List<int> xorSum = List<int>.from(u);

      for (int iter = 1; iter < iterations; iter++) {
        u = hmac.convert(u).bytes;
        for (int k = 0; k < xorSum.length; k++) {
          xorSum[k] ^= u[k];
        }
      }
      out.add(xorSum);
    }
    return Uint8List.fromList(out.toBytes().sublist(0, keyLength));
  }

  String encrypt(String plainText) {
    if (_key == null) {
      throw StateError(
          'EncryptionService has not been initialized. Call init() first.');
    }
    final iv = enc.IV.fromSecureRandom(16);
    final encrypter = enc.Encrypter(enc.AES(_key!,
        mode: enc.AESMode.sic)); // CTR mode is streaming and robust
    final encrypted = encrypter.encrypt(plainText, iv: iv);
    return '${iv.base64}:${encrypted.base64}';
  }

  String decrypt(String cipherTextWithIv) {
    if (_key == null) {
      throw StateError(
          'EncryptionService has not been initialized. Call init() first.');
    }
    final parts = cipherTextWithIv.split(':');
    if (parts.length != 2) {
      return cipherTextWithIv; // Plaintext or unencrypted legacy data
    }

    try {
      final iv = enc.IV.fromBase64(parts[0]);
      final cipherText = parts[1];

      final encrypter = enc.Encrypter(enc.AES(_key!, mode: enc.AESMode.sic));
      return encrypter.decrypt64(cipherText, iv: iv);
    } catch (e) {
      debugPrint('Decryption failed: $e');
      throw DecryptionException('Failed to decrypt data payload: $e', e);
    }
  }

  String? tryDecrypt(String cipherTextWithIv) {
    try {
      return decrypt(cipherTextWithIv);
    } catch (_) {
      return null;
    }
  }
}
