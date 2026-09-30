import 'dart:io';
import 'package:path/path.dart' as path;
import 'package:path_provider_platform_interface/path_provider_platform_interface.dart';
import 'package:xdg_directories/xdg_directories.dart' as xdg;

class SafePathProviderLinux extends PathProviderPlatform {
  final PathProviderPlatform delegate;
  SafePathProviderLinux(this.delegate);

  @override
  Future<String?> getTemporaryPath() => delegate.getTemporaryPath();

  @override
  Future<String?> getApplicationSupportPath() async {
    try {
      return await delegate.getApplicationSupportPath();
    } catch (e) {
      final directory = Directory(path.join(xdg.dataHome.path, 'sanghasetu'));
      if (!await directory.exists()) {
        await directory.create(recursive: true);
      }
      return directory.path;
    }
  }

  @override
  Future<String?> getApplicationDocumentsPath() =>
      delegate.getApplicationDocumentsPath();

  @override
  Future<String?> getApplicationCachePath() async {
    try {
      return await delegate.getApplicationCachePath();
    } catch (e) {
      final directory = Directory(path.join(xdg.cacheHome.path, 'sanghasetu'));
      if (!await directory.exists()) {
        await directory.create(recursive: true);
      }
      return directory.path;
    }
  }

  @override
  Future<String?> getDownloadsPath() => delegate.getDownloadsPath();
}

void setupSafePathProvider() {
  if (Platform.isLinux) {
    try {
      PathProviderPlatform.instance =
          SafePathProviderLinux(PathProviderPlatform.instance);
    } catch (_) {}
  }
}
