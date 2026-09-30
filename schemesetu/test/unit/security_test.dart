import 'package:flutter_test/flutter_test.dart';
import 'package:chit_fund_app/core/security/password_hasher.dart';
import 'package:chit_fund_app/core/security/exceptions.dart';

void main() {
  group('PasswordHasher Tests', () {
    test('hashes PIN with salt and verifies successfully', () {
      const pin = '1234';
      final hash = PasswordHasher.hash(pin);

      expect(hash, contains(':'));
      expect(hash.split(':').length, 2);
      expect(PasswordHasher.verify(pin, hash), isTrue);
      expect(PasswordHasher.verify('9999', hash), isFalse);
    });

    test('backward compatibility with plain legacy PINs', () {
      const legacyPin = '4321';
      expect(PasswordHasher.verify('4321', legacyPin), isTrue);
      expect(PasswordHasher.verify('1234', legacyPin), isFalse);
    });

    test('security answer hash and verification is case-insensitive', () {
      const answer = 'Hyderabad';
      final hash = PasswordHasher.hash(answer.trim().toLowerCase());

      expect(PasswordHasher.verify('hyderabad'.trim().toLowerCase(), hash), isTrue);
      expect(PasswordHasher.verify('HYDERABAD'.trim().toLowerCase(), hash), isTrue);
      expect(PasswordHasher.verify('Secunderabad'.trim().toLowerCase(), hash), isFalse);
    });
  });

  group('Security Exceptions Tests', () {
    test('DecryptionException includes message and cause', () {
      final exc = DecryptionException('Bad payload', 'FormatError');
      expect(exc.toString(), contains('DecryptionException: Bad payload'));
      expect(exc.toString(), contains('FormatError'));
    });

    test('EncryptionKeyException includes message', () {
      final exc = EncryptionKeyException('No entropy source');
      expect(exc.toString(), contains('EncryptionKeyException: No entropy source'));
    });
  });
}
