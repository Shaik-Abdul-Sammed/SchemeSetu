import 'package:flutter_test/flutter_test.dart';
import 'package:chit_fund_app/utils/currency_formatter.dart';

void main() {
  group('Currency Formatter Unit Tests', () {
    test('formatIndianCurrency returns formatted currency string without decimals', () {
      expect(formatIndianCurrency(0.0), '₹0');
      expect(formatIndianCurrency(500.0), '₹500');
      expect(formatIndianCurrency(10000.0), '₹10,000');
      expect(formatIndianCurrency(100000.0), '₹1,00,000'); // Indian numbering standard
      expect(formatIndianCurrency(1000000.0), '₹10,00,000');
    });
  });
}
