import 'dart:io';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:googleapis/drive/v3.dart' as drive;
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

final driveServiceProvider = Provider<DriveService>((ref) {
  return DriveService();
});

class GoogleAuthClient extends http.BaseClient {
  final Map<String, String> _headers;
  final http.Client _client = http.Client();

  GoogleAuthClient(this._headers);

  @override
  Future<http.StreamedResponse> send(http.BaseRequest request) {
    return _client.send(request..headers.addAll(_headers));
  }
}

class DriveService {
  DriveService();

  final GoogleSignIn _googleSignIn = GoogleSignIn(
    scopes: [
      drive.DriveApi.driveFileScope,
    ],
  );

  Future<String> signIn() async {
    try {
      final account = await _googleSignIn.signIn();
      return account != null ? 'SUCCESS' : 'CANCELED';
    } catch (e) {
      debugPrint('Google SignIn error: $e');
      final errorStr = e.toString().toLowerCase();
      if (errorStr.contains('missingpluginexception')) {
        return 'UNSUPPORTED_PLATFORM: Google Drive Sync is currently only supported on Android and iOS devices.';
      }
      if (errorStr.contains('sign_in_failed') ||
          errorStr.contains('developer_error') ||
          errorStr.contains('api_not_connected') ||
          errorStr.contains('platformexception')) {
        return 'MISSING_KEYS: Google Sign-In failed. This usually means the app is missing OAuth Client IDs or Google Services JSON/Plist configuration. Please configure it in your Google Cloud Console.';
      }
      return 'ERROR: $e';
    }
  }

  Future<void> signOut() async {
    await _googleSignIn.signOut();
  }

  Future<String> backupToDrive(String filePath) async {
    try {
      if (_googleSignIn.currentUser == null) {
        String signResult = await signIn();
        if (signResult != 'SUCCESS') return signResult;
      }

      var account = _googleSignIn.currentUser;
      if (account == null) return 'CANCELED';

      final authHeaders = await account.authHeaders;
      final authenticateClient = GoogleAuthClient(authHeaders);
      final driveApi = drive.DriveApi(authenticateClient);

      final file = File(filePath);
      if (!await file.exists()) return 'ERROR: Backup file not found.';

      final driveFile = drive.File();
      driveFile.name = file.path.split('/').last;

      // Check if file already exists
      final fileList = await driveApi.files.list(
        q: "name = '${driveFile.name}' and trashed = false",
      );

      final media = drive.Media(file.openRead(), file.lengthSync());

      if (fileList.files != null && fileList.files!.isNotEmpty) {
        final existingFileId = fileList.files!.first.id;
        await driveApi.files
            .update(driveFile, existingFileId!, uploadMedia: media);
      } else {
        await driveApi.files.create(driveFile, uploadMedia: media);
      }
      return 'SUCCESS';
    } catch (e) {
      debugPrint('Drive Backup error: $e');
      final errorStr = e.toString().toLowerCase();
      if (errorStr.contains('missingpluginexception')) {
        return 'UNSUPPORTED_PLATFORM: Google Drive Sync is currently only supported on Android and iOS devices.';
      }
      return 'ERROR: $e';
    }
  }
}
