import 'package:flutter_image_compress/flutter_image_compress.dart';
import 'package:path_provider/path_provider.dart';

class ImageUtils {
  static Future<String?> compressImage(String path) async {
    try {
      final tempDir = await getTemporaryDirectory();
      final fileName = path.split('/').last;

      // If the file ends with a known image extension
      final targetPath =
          '${tempDir.path}/compressed_${DateTime.now().millisecondsSinceEpoch}_$fileName';

      final result = await FlutterImageCompress.compressAndGetFile(
        path,
        targetPath,
        quality:
            70, // 70% quality usually drops size massively with no visible loss
      );

      return result?.path;
    } catch (e) {
      return path; // Fallback to original if compression fails
    }
  }
}
