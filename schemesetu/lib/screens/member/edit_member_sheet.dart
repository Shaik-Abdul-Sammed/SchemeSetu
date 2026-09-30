import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:drift/drift.dart' as drift;
import '../../data/local/app_database.dart';
import '../../data/providers/db_provider.dart';
import '../../widgets/dialog_helper.dart';
import 'advanced_member_profile_view_model.dart';
import 'members_list_view_model.dart';
import 'package:chit_fund_app/widgets/translated_text.dart';
import '../../utils/image_utils.dart';
import 'package:mask_text_input_formatter/mask_text_input_formatter.dart';

class EditMemberSheet extends ConsumerStatefulWidget {
  final Member member;
  const EditMemberSheet({super.key, required this.member});

  @override
  ConsumerState<EditMemberSheet> createState() => _EditMemberSheetState();
}

class _EditMemberSheetState extends ConsumerState<EditMemberSheet> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameCtrl;
  late TextEditingController _phoneCtrl;
  late TextEditingController _addressCtrl;
  String? _photoPath;

  final _phoneFormatter = MaskTextInputFormatter(
    mask: '##### #####',
    filter: {'#': RegExp(r'[0-9]')},
    type: MaskAutoCompletionType.lazy,
  );

  @override
  void initState() {
    super.initState();
    _nameCtrl = TextEditingController(text: widget.member.name);
    _phoneCtrl = TextEditingController(text: widget.member.phone);
    _addressCtrl = TextEditingController(text: widget.member.address ?? '');
    _photoPath = widget.member.photoPath;
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _phoneCtrl.dispose();
    _addressCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickPhoto() async {
    final picker = ImagePicker();
    final image = await picker.pickImage(source: ImageSource.gallery);
    if (image != null) {
      final compressedPath = await ImageUtils.compressImage(image.path);
      setState(() {
        _photoPath = compressedPath ?? image.path;
      });
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    DialogHelper.showLoading(context, message: 'Updating member...');
    try {
      final dao = ref.read(appDaoProvider);
      await dao.updateMember(MembersCompanion(
        id: drift.Value(widget.member.id),
        name: drift.Value(_nameCtrl.text.trim()),
        phone: drift.Value(_phoneCtrl.text.trim()),
        address: drift.Value(_addressCtrl.text.trim()),
        photoPath: drift.Value(_photoPath),
      ));
      ref.invalidate(memberProfileProvider(widget.member.id));
      ref.invalidate(memberListProvider);
      if (!mounted) return;
      Navigator.pop(context); // close loading
      Navigator.pop(context); // close sheet
      HapticFeedback.mediumImpact();
      DialogHelper.showSnackBar(context,
          message: 'Member updated successfully!', type: SnackBarType.success);
    } catch (e) {
      if (!mounted) return;
      Navigator.pop(context);
      DialogHelper.showSnackBar(context,
          message: 'Failed to update: $e', type: SnackBarType.error);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
        left: 20,
        right: 20,
        top: 20,
      ),
      child: PopScope(
        canPop: false,
        onPopInvokedWithResult: (didPop, result) async {
          if (didPop) return;
          final hasChanges = _nameCtrl.text != widget.member.name ||
              _phoneCtrl.text != widget.member.phone ||
              _addressCtrl.text != (widget.member.address ?? '') ||
              _photoPath != widget.member.photoPath;
          if (hasChanges) {
            final confirm = await showDialog<bool>(
              context: context,
              builder: (ctx) => AlertDialog(
                title: const TranslatedText('Discard Changes?'),
                content: const TranslatedText(
                    'You have unsaved changes. Are you sure you want to discard them?'),
                actions: [
                  TextButton(
                      onPressed: () => Navigator.pop(ctx, false),
                      child: const TranslatedText('Cancel')),
                  TextButton(
                    onPressed: () => Navigator.pop(ctx, true),
                    style: TextButton.styleFrom(foregroundColor: Colors.red),
                    child: const TranslatedText('Discard'),
                  ),
                ],
              ),
            );
            if (confirm == true && context.mounted) {
              Navigator.pop(context);
            }
          } else {
            Navigator.pop(context);
          }
        },
        child: SingleChildScrollView(
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const TranslatedText('Edit Profile',
                    style:
                        TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                const SizedBox(height: 20),
                GestureDetector(
                  onTap: _pickPhoto,
                  child: CircleAvatar(
                    radius: 40,
                    backgroundImage: _photoPath != null
                        ? FileImage(File(_photoPath!))
                        : null,
                    child: _photoPath == null
                        ? const Icon(Icons.add_a_photo, size: 30)
                        : null,
                  ),
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _nameCtrl,
                  decoration: const InputDecoration(labelText: 'Name'),
                  validator: (v) {
                    if (v == null || v.trim().isEmpty) return 'Required';
                    return null;
                  },
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _phoneCtrl,
                  decoration: const InputDecoration(labelText: 'Phone'),
                  keyboardType: TextInputType.phone,
                  inputFormatters: [_phoneFormatter],
                  validator: (v) {
                    if (v == null || v.trim().isEmpty) return 'Required';
                    if (v.trim().length < 10) return 'Invalid phone number';
                    return null;
                  },
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _addressCtrl,
                  decoration: const InputDecoration(labelText: 'Address'),
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: _submit,
                  style: ElevatedButton.styleFrom(
                      minimumSize: const Size(double.infinity, 50)),
                  child: const TranslatedText('Save Changes'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
