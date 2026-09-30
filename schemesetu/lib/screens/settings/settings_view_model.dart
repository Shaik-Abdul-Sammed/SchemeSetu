import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../data/providers/db_provider.dart';

part 'settings_view_model.g.dart';

class AppSettings {
  final int reminderDaysBefore;
  final int reminderDaysAfter;
  final String whatsappTemplate;

  AppSettings({
    this.reminderDaysBefore = 3,
    this.reminderDaysAfter = 2,
    this.whatsappTemplate =
        'Hello {name}, your chit payment of {amount} is due for {group}.',
  });
}

@riverpod
class SettingsNotifier extends _$SettingsNotifier {
  @override
  Future<AppSettings> build() async {
    final dao = ref.watch(appDaoProvider);
    final daysBefore = await dao.getSetting('reminder_days_before');
    final daysAfter = await dao.getSetting('reminder_days_after');
    final template = await dao.getSetting('whatsapp_template');

    return AppSettings(
      reminderDaysBefore: int.tryParse(daysBefore ?? '') ?? 3,
      reminderDaysAfter: int.tryParse(daysAfter ?? '') ?? 2,
      whatsappTemplate: template ??
          'Hello {name}, your chit payment of {amount} is due for {group}.',
    );
  }

  Future<void> saveSettings(AppSettings newSettings) async {
    final dao = ref.read(appDaoProvider);
    await dao.setSetting(
        'reminder_days_before', newSettings.reminderDaysBefore.toString());
    await dao.setSetting(
        'reminder_days_after', newSettings.reminderDaysAfter.toString());
    await dao.setSetting('whatsapp_template', newSettings.whatsappTemplate);
    state = AsyncValue.data(newSettings);
  }
}
