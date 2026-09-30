import 'package:flutter/services.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class MessagingService {
  Future<void> sendWhatsApp(String phone, String message) async {
    final formattedPhone = _formatPhone(phone);
    final url = Uri.parse(
        'https://wa.me/$formattedPhone?text=${Uri.encodeComponent(message)}');
    try {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    } catch (e) {
      throw Exception('Could not launch WhatsApp');
    }
  }

  Future<void> sendSMS(String phone, String message) async {
    final formattedPhone = _formatPhone(phone);
    final url =
        Uri.parse('sms:$formattedPhone?body=${Uri.encodeComponent(message)}');
    try {
      await launchUrl(url);
    } catch (e) {
      throw Exception('Could not launch SMS');
    }
  }

  Future<void> copyToClipboard(String message) async {
    await Clipboard.setData(ClipboardData(text: message));
  }

  Future<void> shareContent(String message) async {
    await SharePlus.instance.share(ShareParams(text: message));
  }

  String _formatPhone(String phone) {
    // Remove non-numeric characters
    String cleanPhone = phone.replaceAll(RegExp(r'[^\d+]'), '');
    if (!cleanPhone.startsWith('+') && cleanPhone.length == 10) {
      // Default to India country code if length is 10
      cleanPhone = '+91$cleanPhone';
    }
    return cleanPhone;
  }
}

final messagingServiceProvider = Provider<MessagingService>((ref) {
  return MessagingService();
});
