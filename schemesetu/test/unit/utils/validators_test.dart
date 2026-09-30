import 'package:flutter_test/flutter_test.dart';
import 'package:chit_fund_app/utils/validation_rules.dart';

void main() {
  group('ValidationRules Unit Tests', () {
    test('validateGroupName', () {
      expect(ValidationRules.validateGroupName(null), 'Group name is required');
      expect(ValidationRules.validateGroupName(''), 'Group name is required');
      expect(ValidationRules.validateGroupName('  '), 'Group name is required');
      expect(ValidationRules.validateGroupName('Ab'),
          'Group name must be at least 3 characters');
      expect(ValidationRules.validateGroupName('A' * 51),
          'Group name cannot exceed 50 characters');
      expect(ValidationRules.validateGroupName('Pragati SHG'), null);
    });

    test('validateInstallment', () {
      expect(ValidationRules.validateInstallment(null),
          'Installment amount is required');
      expect(ValidationRules.validateInstallment(''),
          'Installment amount is required');
      expect(ValidationRules.validateInstallment('abc'),
          'Please enter a valid amount');
      expect(ValidationRules.validateInstallment('-500'),
          'Amount must be greater than zero');
      expect(ValidationRules.validateInstallment('0'),
          'Amount must be greater than zero');
      expect(ValidationRules.validateInstallment('1000000'),
          'Amount is too large');
      expect(ValidationRules.validateInstallment('5000'), null);
    });

    test('validateMembersCount', () {
      expect(ValidationRules.validateMembersCount(null),
          'Total members count is required');
      expect(ValidationRules.validateMembersCount(''),
          'Total members count is required');
      expect(ValidationRules.validateMembersCount('abc'),
          'Please enter a valid number');
      expect(ValidationRules.validateMembersCount('1'),
          'Group must have at least 2 members');
      expect(ValidationRules.validateMembersCount('101'),
          'Group cannot exceed 100 members');
      expect(ValidationRules.validateMembersCount('15'), null);
    });

    test('validateDuration', () {
      expect(ValidationRules.validateDuration(null), 'Duration is required');
      expect(ValidationRules.validateDuration(''), 'Duration is required');
      expect(ValidationRules.validateDuration('abc'),
          'Please enter a valid number');
      expect(ValidationRules.validateDuration('0'),
          'Duration must be at least 1 month');
      expect(ValidationRules.validateDuration('61'),
          'Duration cannot exceed 60 months');
      expect(ValidationRules.validateDuration('12'), null);
    });

    test('validateMemberName', () {
      expect(
          ValidationRules.validateMemberName(null), 'Member name is required');
      expect(ValidationRules.validateMemberName(''), 'Member name is required');
      expect(ValidationRules.validateMemberName('A'),
          'Name must be at least 2 characters');
      expect(ValidationRules.validateMemberName('A' * 51),
          'Name cannot exceed 50 characters');
      expect(ValidationRules.validateMemberName('Sita Devi'), null);
    });

    test('validateMobileNumber', () {
      expect(ValidationRules.validateMobileNumber(null),
          'Mobile number is required');
      expect(ValidationRules.validateMobileNumber(''),
          'Mobile number is required');
      expect(ValidationRules.validateMobileNumber('12345'),
          'Mobile number must be 10 digits');
      expect(ValidationRules.validateMobileNumber('9876543210'), null);
      expect(ValidationRules.validateMobileNumber('987-654-3210'),
          null); // Should normalize and validate
    });

    test('validateBidAmount', () {
      expect(ValidationRules.validateBidAmount(null), 'Bid amount is required');
      expect(ValidationRules.validateBidAmount(''), 'Bid amount is required');
      expect(ValidationRules.validateBidAmount('abc'),
          'Please enter a valid amount');
      expect(ValidationRules.validateBidAmount('-100'),
          'Bid amount must be greater than zero');
      expect(ValidationRules.validateBidAmount('0'),
          'Bid amount must be greater than zero');
      expect(ValidationRules.validateBidAmount('1200'), null);
    });
  });
}
