import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:translator/translator.dart';

final translationServiceProvider = Provider<TranslationService>((ref) {
  return TranslationService();
});

class TranslationService {
  final GoogleTranslator _translator = GoogleTranslator();
  Map<String, String> _cache = {};
  SharedPreferences? _prefs;
  bool _isInitialized = false;

  Future<void> init() async {
    if (_isInitialized) return;
    _prefs = await SharedPreferences.getInstance();
    final cachedData = _prefs?.getString('translation_cache');
    if (cachedData != null) {
      try {
        final Map<String, dynamic> decoded = json.decode(cachedData);
        _cache = decoded.map((key, value) => MapEntry(key, value.toString()));
      } catch (e) {
        _cache = {};
      }
    }
    _isInitialized = true;
  }

  Future<void> _saveCache() async {
    if (_prefs == null) return;
    await _prefs?.setString('translation_cache', json.encode(_cache));
  }

  String _getCacheKey(String text, String targetLang) {
    return '${text.trim().toLowerCase()}_$targetLang';
  }

  /// Translates the text if needed. Returns from cache if available.
  Future<String> translate(String text, String targetLang) async {
    if (text.trim().isEmpty) return text;
    if (targetLang == 'en') return text; // Default assumes English base

    if (!_isInitialized) {
      await init();
    }

    final cacheKey = _getCacheKey(text, targetLang);
    if (_cache.containsKey(cacheKey)) {
      return _cache[cacheKey]!;
    }

    try {
      final translation = await _translator.translate(text, to: targetLang);
      final translatedText = translation.text;

      _cache[cacheKey] = translatedText;
      await _saveCache();

      return translatedText;
    } catch (e) {
      debugPrint('Translation error: $e');
      // If translation fails (e.g. no internet), return the original text
      return text;
    }
  }

  /// Synchronous cache check for immediate rendering (prevents flicker).
  String? getCachedTranslation(String text, String targetLang) {
    if (text.trim().isEmpty) return text;
    if (targetLang == 'en') return text;
    final cacheKey = _getCacheKey(text, targetLang);
    return _cache[cacheKey];
  }
}
