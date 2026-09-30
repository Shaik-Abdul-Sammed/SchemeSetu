import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:file_picker/file_picker.dart';
import 'package:csv/csv.dart';
import 'package:drift/drift.dart' as drift;

import '../../data/local/app_database.dart';
import '../../data/providers/db_provider.dart';
import '../../widgets/translated_text.dart';
import '../../widgets/glass_card.dart';
import '../../utils/theme.dart';
import '../../widgets/dialog_helper.dart';

class ImportMembersSheet extends ConsumerStatefulWidget {
  const ImportMembersSheet({super.key});

  @override
  ConsumerState<ImportMembersSheet> createState() => _ImportMembersSheetState();
}

class _ImportMembersSheetState extends ConsumerState<ImportMembersSheet> {
  bool _isLoading = false;
  List<List<dynamic>> _csvData = [];
  final int _nameColIdx = 0;
  final int _mobileColIdx = 1;
  int _addressColIdx = -1;
  bool _hasHeader = true;

  Future<void> _pickFile() async {
    try {
      final result = await FilePicker.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['csv'],
      );

      if (result != null && result.files.single.path != null) {
        final file = File(result.files.single.path!);
        final input = await file.readAsString();
        final fields = csv.decode(input);

        if (fields.isNotEmpty) {
          setState(() {
            _csvData = fields;
            if (fields[0].length > 2) {
              _addressColIdx = 2;
            }
          });
        }
      }
    } catch (e) {
      if (mounted) {
        DialogHelper.showSnackBar(context,
            message: 'Failed to pick file: $e', type: SnackBarType.error);
      }
    }
  }

  Future<void> _importData() async {
    if (_csvData.isEmpty) return;

    setState(() => _isLoading = true);

    int importedCount = 0;
    final dao = ref.read(appDaoProvider);

    final startIndex = _hasHeader ? 1 : 0;
    for (int i = startIndex; i < _csvData.length; i++) {
      final row = _csvData[i];
      if (row.length > _nameColIdx && row.length > _mobileColIdx) {
        final name = row[_nameColIdx].toString().trim();
        final mobile = row[_mobileColIdx].toString().trim();
        final address = _addressColIdx >= 0 && row.length > _addressColIdx
            ? row[_addressColIdx].toString().trim()
            : null;

        if (name.isNotEmpty && mobile.isNotEmpty) {
          try {
            await dao.insertMember(MembersCompanion.insert(
              name: name,
              phone: mobile,
              address: address == null || address.isEmpty
                  ? const drift.Value.absent()
                  : drift.Value(address),
              trustScore: const drift.Value(0.0),
              joiningDate: drift.Value(DateTime.now()),
            ));
            importedCount++;
          } catch (e) {
            debugPrint('Failed to import member: $e');
          }
        }
      }
    }

    if (mounted) {
      setState(() => _isLoading = false);
      Navigator.pop(context, importedCount);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
        top: 20,
        left: 20,
        right: 20,
      ),
      decoration: BoxDecoration(
        color: Theme.of(context).scaffoldBackgroundColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              TranslatedText('Import Members (CSV)',
                  style: GoogleFonts.outfit(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  )),
              IconButton(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.close),
              ),
            ],
          ),
          const SizedBox(height: 16),
          if (_csvData.isEmpty) ...[
            TranslatedText(
              'Select a CSV file containing member details (Name, Mobile, Address).',
              style: GoogleFonts.outfit(color: Colors.grey),
            ),
            const SizedBox(height: 20),
            ElevatedButton.icon(
              onPressed: _pickFile,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryTeal,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16)),
              ),
              icon: const Icon(Icons.file_upload),
              label: TranslatedText('Select CSV File',
                  style: GoogleFonts.outfit(
                      fontWeight: FontWeight.bold, fontSize: 16)),
            ),
          ] else ...[
            GlassCard(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  TranslatedText(
                      'Found ${_hasHeader ? _csvData.length - 1 : _csvData.length} rows.',
                      style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  SwitchListTile(
                    title: const TranslatedText('First row is header'),
                    value: _hasHeader,
                    onChanged: (val) => setState(() => _hasHeader = val),
                    contentPadding: EdgeInsets.zero,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _isLoading ? null : _importData,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryTeal,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16)),
              ),
              child: _isLoading
                  ? const CircularProgressIndicator(color: Colors.white)
                  : TranslatedText('Import Members',
                      style: GoogleFonts.outfit(
                          fontWeight: FontWeight.bold, fontSize: 16)),
            ),
          ],
        ],
      ),
    );
  }
}
