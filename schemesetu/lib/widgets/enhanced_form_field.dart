import 'package:chit_fund_app/utils/theme.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:chit_fund_app/widgets/translated_text.dart';

/// Enhanced form field with real-time validation and better UX
class EnhancedFormField extends StatefulWidget {
  final String label;
  final String? initialValue;
  final TextEditingController? controller;
  final TextInputType keyboardType;
  final String? Function(String?)? validator;
  final void Function(String)? onChanged;
  final int minLines;
  final int maxLines;
  final String? hintText;
  final IconData? prefixIcon;
  final String? prefixText;
  final bool isRequired;

  const EnhancedFormField({
    super.key,
    required this.label,
    this.initialValue,
    this.controller,
    this.keyboardType = TextInputType.text,
    this.validator,
    this.onChanged,
    this.minLines = 1,
    this.maxLines = 1,
    this.hintText,
    this.prefixIcon,
    this.prefixText,
    this.isRequired = false,
  });

  @override
  State<EnhancedFormField> createState() => _EnhancedFormFieldState();
}

class _EnhancedFormFieldState extends State<EnhancedFormField> {
  String? _errorText;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            TranslatedText(
              widget.label,
              style: GoogleFonts.outfit(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: isDark ? Colors.white : Colors.grey[900],
              ),
            ),
            if (widget.isRequired)
              const TranslatedText(
                ' *',
                style:
                    TextStyle(color: Colors.red, fontWeight: FontWeight.bold),
              ),
          ],
        ),
        const SizedBox(height: 8),
        Focus(
          onFocusChange: (focused) {
            setState(() {
              if (focused && _errorText == null) {
                _errorText = null;
              }
            });
          },
          child: TextFormField(
            controller: widget.controller,
            initialValue: widget.initialValue,
            keyboardType: widget.keyboardType,
            minLines: widget.minLines,
            maxLines: widget.maxLines,
            onChanged: (value) {
              // Real-time validation
              if (widget.validator != null) {
                setState(() {
                  _errorText = widget.validator!(value);
                });
              }
              widget.onChanged?.call(value);
            },
            decoration: InputDecoration(
              hintText: widget.hintText,
              prefixIcon: widget.prefixIcon != null
                  ? Icon(widget.prefixIcon, color: AppTheme.primaryTeal)
                  : null,
              prefixText: widget.prefixText,
              prefixStyle: GoogleFonts.outfit(
                fontWeight: FontWeight.w600,
                color: Colors.grey[700],
              ),
              filled: true,
              fillColor: isDark
                  ? Colors.grey[800]
                  : (_errorText != null ? Colors.red[50] : Colors.grey[50]),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(
                  color: _errorText != null ? Colors.red : Colors.grey[300]!,
                ),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(
                  color: _errorText != null
                      ? Colors.red
                      : (isDark ? Colors.grey[700]! : Colors.grey[300]!),
                  width: _errorText != null ? 2 : 1,
                ),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(
                  color: _errorText != null ? Colors.red : AppTheme.primaryTeal,
                  width: 2,
                ),
              ),
              errorBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: Colors.red, width: 2),
              ),
              focusedErrorBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: Colors.red, width: 2),
              ),
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 16,
                vertical: 14,
              ),
            ),
            textInputAction: widget.maxLines == 1
                ? TextInputAction.next
                : TextInputAction.newline,
            style: GoogleFonts.outfit(
              color: isDark ? Colors.white : Colors.grey[900],
            ),
          ),
        ),
        if (_errorText != null && _errorText!.isNotEmpty) ...[
          const SizedBox(height: 6),
          Row(
            children: [
              const Icon(
                Icons.error_outline,
                size: 16,
                color: Colors.red,
              ),
              const SizedBox(width: 6),
              Expanded(
                child: TranslatedText(
                  _errorText!,
                  style: GoogleFonts.outfit(
                    fontSize: 12,
                    color: Colors.red,
                    fontWeight: FontWeight.w500,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ],
      ],
    );
  }
}
