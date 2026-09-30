import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class LanguageSelectionDialog extends StatelessWidget {
  final Function(String) onSelected;

  const LanguageSelectionDialog({super.key, required this.onSelected});

  static Future<String?> show(BuildContext context) {
    return showDialog<String>(
      context: context,
      builder: (BuildContext context) {
        return LanguageSelectionDialog(
          onSelected: (code) {
            Navigator.of(context).pop(code);
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(
        'Select Language',
        style: GoogleFonts.outfit(fontWeight: FontWeight.bold),
      ),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildLanguageOption(context, 'English', 'en'),
          _buildLanguageOption(context, 'اردو (Urdu)', 'ur'),
          _buildLanguageOption(context, 'తెలుగు (Telugu)', 'te'),
          _buildLanguageOption(context, 'हिन्दी (Hindi)', 'hi'),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: Text('Cancel', style: GoogleFonts.outfit()),
        ),
      ],
    );
  }

  Widget _buildLanguageOption(BuildContext context, String name, String code) {
    return ListTile(
      title: Text(name, style: GoogleFonts.outfit()),
      onTap: () => onSelected(code),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      hoverColor: Colors.grey.withValues(alpha: 0.1),
    );
  }
}
