import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../widgets/translated_text.dart';
import '../../widgets/scroll_arrows_overlay.dart';

class ChecklistItem {
  String id;
  String text;
  bool isCompleted;
  String createdAt;
  String priority;

  ChecklistItem({
    required this.id,
    required this.text,
    this.isCompleted = false,
    required this.createdAt,
    this.priority = 'Medium',
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'text': text,
        'isCompleted': isCompleted,
        'createdAt': createdAt,
        'priority': priority,
      };

  factory ChecklistItem.fromJson(Map<String, dynamic> json) => ChecklistItem(
        id: json['id'],
        text: json['text'],
        isCompleted: json['isCompleted'],
        createdAt: json['createdAt'] ?? DateTime.now().toIso8601String(),
        priority: json['priority'] ?? 'Medium',
      );
}

class ChecklistsScreen extends StatefulWidget {
  const ChecklistsScreen({super.key});

  @override
  State<ChecklistsScreen> createState() => _ChecklistsScreenState();
}

class _ChecklistsScreenState extends State<ChecklistsScreen> {
  List<ChecklistItem> _items = [];
  final TextEditingController _textCtrl = TextEditingController();
  String _selectedPriority = 'Medium';
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _loadChecklists();
  }

  Future<void> _loadChecklists() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final data = prefs.getString('admin_checklists');
      if (data != null && mounted) {
        final decoded = jsonDecode(data);
        if (decoded is List) {
          final loaded = <ChecklistItem>[];
          for (final item in decoded) {
            if (item is Map<String, dynamic>) {
              try {
                loaded.add(ChecklistItem.fromJson(item));
              } catch (_) {}
            }
          }
          if (mounted) {
            setState(() {
              _items = loaded;
            });
          }
        }
      }
    } catch (e) {
      debugPrint('Failed to load checklists: $e');
    }
  }

  Future<void> _saveChecklists() async {
    final prefs = await SharedPreferences.getInstance();
    final jsonList = _items.map((i) => i.toJson()).toList();
    await prefs.setString('admin_checklists', jsonEncode(jsonList));
  }

  void _addItem() {
    if (_textCtrl.text.trim().isEmpty) return;
    setState(() {
      _items.insert(
        0,
        ChecklistItem(
          id: DateTime.now().millisecondsSinceEpoch.toString(),
          text: _textCtrl.text.trim(),
          createdAt: DateTime.now().toIso8601String(),
          priority: _selectedPriority,
        ),
      );
      _textCtrl.clear();
      _selectedPriority = 'Medium';
    });
    _saveChecklists();
  }

  void _toggleItem(int index) {
    setState(() {
      _items[index].isCompleted = !_items[index].isCompleted;
    });
    _saveChecklists();
  }

  void _deleteItem(String id) {
    setState(() {
      _items.removeWhere((item) => item.id == id);
    });
    _saveChecklists();
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _textCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? Colors.black : const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: TranslatedText('Checklists',
            style: GoogleFonts.outfit(fontWeight: FontWeight.w600)),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              children: [
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _textCtrl,
                        decoration: InputDecoration(
                          hintText: 'Add a new checklist item...',
                          hintStyle: GoogleFonts.outfit(color: Colors.grey),
                          filled: true,
                          fillColor:
                              isDark ? Colors.grey.shade900 : Colors.white,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide.none,
                          ),
                          contentPadding: const EdgeInsets.symmetric(
                              horizontal: 16, vertical: 14),
                        ),
                        onSubmitted: (_) => _addItem(),
                      ),
                    ),
                    const SizedBox(width: 12),
                    InkWell(
                      onTap: _addItem,
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: Colors.amber,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(Icons.add, color: Colors.black),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    TranslatedText('Priority:',
                        style: GoogleFonts.outfit(
                            fontSize: 13, color: Colors.grey)),
                    const SizedBox(width: 8),
                    DropdownButton<String>(
                      value: _selectedPriority,
                      underline: const SizedBox(),
                      icon: const Icon(Icons.arrow_drop_down, size: 16),
                      style: GoogleFonts.outfit(
                          fontSize: 13,
                          color: isDark ? Colors.white : Colors.black),
                      items: ['High', 'Medium', 'Low'].map((p) {
                        final icon = p == 'High'
                            ? '🔴'
                            : p == 'Medium'
                                ? '🟡'
                                : '🟢';
                        return DropdownMenuItem(
                            value: p, child: Text('$icon $p'));
                      }).toList(),
                      onChanged: (v) {
                        if (v != null) setState(() => _selectedPriority = v);
                      },
                    ),
                  ],
                ),
              ],
            ),
          ),
          Expanded(
            child: _items.isEmpty
                ? Center(
                    child: TranslatedText(
                      'No checklist items yet.',
                      style: GoogleFonts.outfit(color: Colors.grey),
                    ),
                  )
                : ScrollArrowsOverlay(
                    scrollController: _scrollController,
                    child: ListView.builder(
                      controller: _scrollController,
                      itemCount: _items.length,
                      itemBuilder: (context, index) {
                        final item = _items[index];
                        DateTime dt;
                        try {
                          dt = DateTime.parse(item.createdAt);
                        } catch (_) {
                          dt = DateTime.now();
                        }
                        final fmt =
                            '${dt.day.toString().padLeft(2, '0')}/${dt.month.toString().padLeft(2, '0')} ${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
                        final pIcon = item.priority == 'High'
                            ? '🔴'
                            : item.priority == 'Medium'
                                ? '🟡'
                                : '🟢';

                        return Dismissible(
                          key: Key(item.id),
                          direction: DismissDirection.horizontal,
                          confirmDismiss: (direction) async {
                            if (direction == DismissDirection.startToEnd) {
                              Future.delayed(const Duration(milliseconds: 300),
                                  () => _toggleItem(index));
                              return false; // Don't actually dismiss the widget
                            }
                            return true; // Allow dismiss for delete
                          },
                          onDismissed: (direction) {
                            if (direction == DismissDirection.endToStart) {
                              _deleteItem(item.id);
                            }
                          },
                          background: Container(
                            alignment: Alignment.centerLeft,
                            padding: const EdgeInsets.only(left: 20),
                            color: Colors.green,
                            child: const Icon(Icons.check, color: Colors.white),
                          ),
                          secondaryBackground: Container(
                            alignment: Alignment.centerRight,
                            padding: const EdgeInsets.only(right: 20),
                            color: Colors.red,
                            child:
                                const Icon(Icons.delete, color: Colors.white),
                          ),
                          child: CheckboxListTile(
                            value: item.isCompleted,
                            onChanged: (_) => _toggleItem(index),
                            title: Text(
                              '$pIcon  ${item.text}',
                              style: GoogleFonts.outfit(
                                decoration: item.isCompleted
                                    ? TextDecoration.lineThrough
                                    : null,
                                color: item.isCompleted
                                    ? Colors.grey
                                    : (isDark ? Colors.white : Colors.black),
                              ),
                            ),
                            subtitle: Text(
                              fmt,
                              style: GoogleFonts.outfit(
                                  fontSize: 11, color: Colors.grey),
                            ),
                            activeColor: Colors.amber,
                            checkColor: Colors.black,
                          ),
                        );
                      },
                    ),
                  ),
          ),
        ],
      ),
    );
  }
}
