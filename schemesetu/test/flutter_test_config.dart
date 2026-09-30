import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';

Future<void> testExecutable(Future<void> Function() testMain) async {
  TestWidgetsFlutterBinding.ensureInitialized();
  GoogleFonts.config.allowRuntimeFetching = false;

  // Global Mock for FlutterSecureStorage MethodChannel
  const channel = MethodChannel('plugins.it_nomads.com/flutter_secure_storage');
  final Map<String, String> mockSecureStorage = {};

  TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
      .setMockMethodCallHandler(channel, (MethodCall methodCall) async {
    if (methodCall.method == 'read') {
      final key = methodCall.arguments['key'] as String;
      return mockSecureStorage[key];
    } else if (methodCall.method == 'write') {
      final key = methodCall.arguments['key'] as String;
      final value = methodCall.arguments['value'] as String;
      mockSecureStorage[key] = value;
      return true;
    } else if (methodCall.method == 'delete') {
      final key = methodCall.arguments['key'] as String;
      mockSecureStorage.remove(key);
      return true;
    } else if (methodCall.method == 'readAll') {
      return mockSecureStorage;
    } else if (methodCall.method == 'deleteAll') {
      mockSecureStorage.clear();
      return true;
    } else if (methodCall.method == 'containsKey') {
      final key = methodCall.arguments['key'] as String;
      return mockSecureStorage.containsKey(key);
    }
    return null;
  });

  setUp(() {
    mockSecureStorage.clear();
  });

  await testMain();
}
