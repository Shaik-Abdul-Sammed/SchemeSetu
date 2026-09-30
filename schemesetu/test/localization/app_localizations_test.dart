import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:chit_fund_app/localization/app_localizations.dart';

void main() {
  group('AppLocalizations Translation Tests', () {
    test('Translates standard key correctly for English', () {
      final loc = AppLocalizations(const Locale('en'));
      expect(loc.translate('settings'), 'Settings');
      expect(loc.translate('app_title'), 'Halal ka paigam');
      expect(loc.translate('backup_restore'), 'Backup & Restore');
    });

    test('Translates standard key correctly for Urdu', () {
      final loc = AppLocalizations(const Locale('ur'));
      expect(loc.translate('settings'), 'ترتیبات');
      expect(loc.translate('backup_restore'), 'بیک اپ اور بحالی');
    });

    test('Translates standard key correctly for Telugu', () {
      final loc = AppLocalizations(const Locale('te'));
      expect(loc.translate('settings'), 'సెట్టింగులు');
      expect(loc.translate('backup_restore'), 'బ్యాకప్ & పునరుద్ధరణ');
    });

    test('Translates standard key correctly for Hindi', () {
      final loc = AppLocalizations(const Locale('hi'));
      expect(loc.translate('settings'), 'सेटिंग्स');
      expect(loc.translate('backup_restore'), 'बैकअप और पुनर्स्थापना');
    });

    test('Returns key as fallback for missing key', () {
      final loc = AppLocalizations(const Locale('en'));
      expect(loc.translate('non_existent_key_123'), 'non_existent_key_123');
    });

    test('All translation keys exist in all supported languages', () {
      const keys = [
        'app_title',
        'login_title',
        'enter_phone',
        'send_otp',
        'verify_otp',
        'enter_otp',
        'enter_pin',
        'setup_pin',
        'confirm_pin',
        'pin_error',
        'biometric_login',
        'forgot_pin',
        'reset_pin',
        'login_btn',
        'save_btn',
        'cancel_btn',
        'dashboard',
        'total_groups',
        'total_members',
        'monthly_collection',
        'pending_amount',
        'pending_members',
        'quick_actions',
        'add_group',
        'add_member',
        'pending_list',
        'monthly_report',
        'settings',
        'recent_activity',
        'view_all',
        'no_activity_yet',
        'pending_dues',
        'all_dues_collected',
        'overdue',
        'group_name',
        'installment_amt',
        'duration_months',
        'start_date',
        'create_group_btn',
        'group_list',
        'member_name',
        'father_name',
        'mobile_number',
        'address',
        'aadhaar_optional',
        'profile_photo',
        'select_group',
        'register_member_btn',
        'members_list',
        'member_profile',
        'total_paid',
        'pending_bal',
        'enrolled_groups',
        'not_enrolled',
        'months_unit',
        'month_unit',
        'payments_tracker',
        'paid_status',
        'pending_status',
        'toggle_payment',
        'installment_history',
        'winner_module',
        'declare_winner',
        'win_amount',
        'select_winner',
        'winner_date',
        'winner_history',
        'bid_amount',
        'due_amount',
        'call_reminder',
        'whatsapp_reminder',
        'dark_theme',
        'light_theme',
        'language',
        'backup_restore',
        'manual_backup',
        'google_drive_backup',
        'auto_local_backup',
        'restore_backup',
        'backup_copied_clipboard',
        'import_backup_title',
        'import_backup_hint',
        'unable_to_open',
        'theme_description',
        'biometric_description',
        'privacy_policy',
        'about_app',
        'google_translate',
        'restore',
        'backup_success',
        'restore_success',
        'restore_fail',
        'target',
        'collected_label',
        'groups_cash_overview',
        'expected',
        'collected',
        'pending',
        'chit_groups',
        'member_names',
        'member_names_hint',
        'choose_date',
        'no_groups_configured',
        'create_first_group',
        'started',
        'members',
        'monthly',
        'duration',
        'months',
        'sync',
        'edit',
        'delete'
      ];

      for (final code in ['en', 'ur', 'te', 'hi']) {
        final loc = AppLocalizations(Locale(code));
        for (final key in keys) {
          final translated = loc.translate(key);
          expect(translated, isNot(equals(key)),
              reason: 'Key "$key" is missing translation for locale "$code"');
        }
      }
    });
  });

  group('AppLocalizations Directionality (RTL/LTR) Tests', () {
    test('Urdu is identified as RTL', () {
      final loc = AppLocalizations(const Locale('ur'));
      expect(loc.isRtl, isTrue);
      expect(loc.textDirection, TextDirection.rtl);
    });

    test('English is identified as LTR', () {
      final loc = AppLocalizations(const Locale('en'));
      expect(loc.isRtl, isFalse);
      expect(loc.textDirection, TextDirection.ltr);
    });

    test('Telugu is identified as LTR', () {
      final loc = AppLocalizations(const Locale('te'));
      expect(loc.isRtl, isFalse);
      expect(loc.textDirection, TextDirection.ltr);
    });

    test('Hindi is identified as LTR', () {
      final loc = AppLocalizations(const Locale('hi'));
      expect(loc.isRtl, isFalse);
      expect(loc.textDirection, TextDirection.ltr);
    });
  });

  group('AppLocalizations Delegate Tests', () {
    const delegate = AppLocalizations.delegate;

    test('Supports correct locales', () {
      expect(delegate.isSupported(const Locale('en')), isTrue);
      expect(delegate.isSupported(const Locale('ur')), isTrue);
      expect(delegate.isSupported(const Locale('te')), isTrue);
      expect(delegate.isSupported(const Locale('hi')), isTrue);
      expect(delegate.isSupported(const Locale('fr')), isFalse);
    });

    test('Loads AppLocalizations instance successfully', () async {
      final loc = await delegate.load(const Locale('te'));
      expect(loc, isA<AppLocalizations>());
      expect(loc.locale.languageCode, 'te');
    });

    test('ShouldReload returns false', () {
      expect(delegate.shouldReload(delegate), isFalse);
    });
  });
}
