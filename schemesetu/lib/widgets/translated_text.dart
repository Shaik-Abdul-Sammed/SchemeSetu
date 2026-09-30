import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../services/translation_service.dart';
import '../providers/settings_provider.dart';

class TranslatedText extends ConsumerStatefulWidget {
  final String text;
  final TextStyle? style;
  final TextAlign? textAlign;
  final int? maxLines;
  final TextOverflow? overflow;
  final bool? softWrap;
  final TextDirection? textDirection;
  final StrutStyle? strutStyle;
  // Use textScaler instead of textScaleFactor for Flutter 3.16+
  final TextScaler? textScaler;
  final TextWidthBasis? textWidthBasis;
  final TextHeightBehavior? textHeightBehavior;
  final Map<String, String>? replacements;

  const TranslatedText(
    this.text, {
    super.key,
    this.style,
    this.textAlign,
    this.maxLines,
    this.overflow,
    this.softWrap,
    this.textDirection,
    this.strutStyle,
    this.textScaler,
    this.textWidthBasis,
    this.textHeightBehavior,
    this.replacements,
  });

  @override
  ConsumerState<TranslatedText> createState() => _TranslatedTextState();
}

class _TranslatedTextState extends ConsumerState<TranslatedText> {
  String? _translatedText;

  @override
  void initState() {
    super.initState();
    _loadTranslation();
  }

  @override
  void didUpdateWidget(covariant TranslatedText oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.text != widget.text) {
      _loadTranslation();
    }
  }

  Future<void> _loadTranslation() async {
    final lang = ref.read(settingsProvider).locale.languageCode;

    if (lang == 'en' || widget.text.trim().isEmpty) {
      if (mounted) {
        setState(() {
          _translatedText = widget.text;
        });
      }
      return;
    }

    final translationService = ref.read(translationServiceProvider);

    // First try synchronous cache to prevent flicker
    final cached = translationService.getCachedTranslation(widget.text, lang);
    if (cached != null) {
      if (mounted) {
        setState(() {
          _translatedText = cached;
        });
      }
      return;
    }

    // Fallback: show original text while translating, then update
    if (mounted) {
      setState(() {
        _translatedText = widget.text; // show original while waiting
      });
    }

    final translated = await translationService.translate(widget.text, lang);

    if (mounted) {
      // Check if language hasn't changed during the async wait
      if (ref.read(settingsProvider).locale.languageCode == lang) {
        setState(() {
          _translatedText = translated;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    // Listen to language changes
    ref.listen(settingsProvider, (previous, next) {
      if (previous?.locale.languageCode != next.locale.languageCode) {
        _loadTranslation();
      }
    });

    String displayStr = _translatedText ?? widget.text;

    // Fix literal '\n' and '\\n' issue from translation API where newlines might be escaped
    displayStr = displayStr.replaceAll('\\n', '\n');

    if (widget.replacements != null) {
      widget.replacements!.forEach((k, v) {
        displayStr = displayStr.replaceAll(k, v);
      });
    }

    return Text(
      displayStr,
      style: widget.style,
      textAlign: widget.textAlign,
      maxLines: widget.maxLines,
      overflow: widget.overflow,
      softWrap: widget.softWrap,
      textDirection: widget.textDirection,
      strutStyle: widget.strutStyle,
      textScaler: widget.textScaler,
      textWidthBasis: widget.textWidthBasis,
      textHeightBehavior: widget.textHeightBehavior,
    );
  }
}
