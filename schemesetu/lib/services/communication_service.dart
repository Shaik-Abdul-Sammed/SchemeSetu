import 'dart:io' show Platform, Process;
import 'package:flutter/foundation.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:collection/collection.dart';
import '../data/local/app_database.dart';
import '../data/local/app_dao.dart';

class CommunicationService {
  static final CommunicationService _instance =
      CommunicationService._internal();
  factory CommunicationService() => _instance;
  CommunicationService._internal();

  Future<bool> _launchWhatsAppHelper(
      String formattedPhone, String message) async {
    final encodedMessage = Uri.encodeComponent(message);
    final nativeUri =
        Uri.parse('whatsapp://send?phone=$formattedPhone&text=$encodedMessage');
    final webUrl = 'https://wa.me/$formattedPhone?text=$encodedMessage';
    final webUri = Uri.parse(webUrl);
    final fallbackUrl =
        'https://api.whatsapp.com/send?phone=$formattedPhone&text=$encodedMessage';
    final fallbackWebUri = Uri.parse(fallbackUrl);

    debugPrint(
        '[WhatsApp] Launching for phone=$formattedPhone, platform=${defaultTargetPlatform.name}');

    // On mobile platforms, attempt launching the native app directly first.
    if (defaultTargetPlatform == TargetPlatform.android ||
        defaultTargetPlatform == TargetPlatform.iOS) {
      try {
        if (await canLaunchUrl(nativeUri)) {
          final success = await launchUrl(nativeUri,
              mode: LaunchMode.externalNonBrowserApplication);
          debugPrint('[WhatsApp] Native launch result: $success');
          if (success) return true;
        }
      } catch (e) {
        debugPrint('[WhatsApp] Native WhatsApp failed: $e');
      }
    }

    // On Linux, url_launcher's externalApplication mode can silently fail
    // (especially in Snap sandboxes). Use Process.run('xdg-open') directly.
    if (!kIsWeb && Platform.isLinux) {
      debugPrint('[WhatsApp] Linux detected, using xdg-open directly');
      try {
        final result = await Process.run('xdg-open', [webUrl]);
        debugPrint('[WhatsApp] xdg-open exit code: ${result.exitCode}');
        if (result.exitCode == 0) return true;
        debugPrint('[WhatsApp] xdg-open stderr: ${result.stderr}');
      } catch (e) {
        debugPrint('[WhatsApp] xdg-open failed: $e');
      }
      // Fallback: try api.whatsapp.com via xdg-open
      try {
        final result = await Process.run('xdg-open', [fallbackUrl]);
        debugPrint(
            '[WhatsApp] xdg-open fallback exit code: ${result.exitCode}');
        if (result.exitCode == 0) return true;
      } catch (e) {
        debugPrint('[WhatsApp] xdg-open fallback failed: $e');
      }
    }

    // Try wa.me web link via external application browser.
    try {
      final success =
          await launchUrl(webUri, mode: LaunchMode.externalApplication);
      debugPrint('[WhatsApp] launchUrl externalApplication result: $success');
      if (success) return true;
    } catch (e) {
      debugPrint('[WhatsApp] wa.me externalApplication failed: $e');
    }

    // Try with platformDefault mode (can work better on some systems).
    try {
      final success = await launchUrl(webUri, mode: LaunchMode.platformDefault);
      debugPrint('[WhatsApp] launchUrl platformDefault result: $success');
      if (success) return true;
    } catch (e) {
      debugPrint('[WhatsApp] wa.me platformDefault failed: $e');
    }

    // Try api.whatsapp.com web link via external application browser.
    try {
      final success =
          await launchUrl(fallbackWebUri, mode: LaunchMode.externalApplication);
      debugPrint('[WhatsApp] api.whatsapp.com result: $success');
      return success;
    } catch (e) {
      debugPrint('[WhatsApp] api.whatsapp.com fallback failed: $e');
      return false;
    }
  }

  // Launch direct phone dialer
  Future<bool> launchCall(String mobileNumber) async {
    final cleanNumber = mobileNumber.replaceAll(RegExp(r'\s+'), '');
    final Uri callUri = Uri(scheme: 'tel', path: cleanNumber);
    try {
      return await launchUrl(callUri);
    } catch (e) {
      debugPrint('Error launching call dialer: $e');
      return false;
    }
  }

  // Islamic greeting in each supported language
  static String _islamicGreeting(String languageCode) {
    switch (languageCode) {
      case 'ur':
        return 'السلام علیکم ورحمۃ اللہ وبرکاتہ';
      case 'te':
        return 'అస్సలాము అలైకుమ్ వ రహ్మతుల్లాహి వ బరకాతుహు';
      case 'hi':
        return 'अस्सलामु अलैकुम व रहमतुल्लाहि व बरकातुहु';
      default: // 'en'
        return 'Assalamu Alaikum Wa Rehmatullahi Wabarakatuhu';
    }
  }

  // Launch WhatsApp with prefilled payment reminder message
  Future<bool> launchWhatsAppReminder({
    required String mobileNumber,
    required String memberName,
    required List<Map<String, dynamic>> groupDetails,
    required double grandTotalDue,
    required String languageCode, // 'en', 'ur', 'te', 'hi'
  }) async {
    var formattedPhone = mobileNumber.replaceAll(RegExp(r'[^\d]'), '');
    if (formattedPhone.startsWith('0') && formattedPhone.length == 11) {
      formattedPhone = formattedPhone.substring(1);
    }
    if (formattedPhone.length == 10) {
      formattedPhone = '91$formattedPhone';
    }

    String groupBreakdown = '';
    for (var detail in groupDetails) {
      if (languageCode == 'ur') {
        groupBreakdown += "گروپ: ${detail['groupName']}\n";
        groupBreakdown +=
            "باقی رقم: ₹${(detail['due'] as double).toStringAsFixed(0)}\n";
        final int monthsPaid = detail['monthsPaid'] as int? ?? 0;
        final int monthsLeft = detail['monthsLeft'] as int? ?? 0;
        groupBreakdown += 'ادا شدہ مہینے: $monthsPaid\n';
        groupBreakdown += 'باقی مہینے: $monthsLeft\n\n';
      } else if (languageCode == 'te') {
        groupBreakdown += "గ్రూప్: ${detail['groupName']}\n";
        groupBreakdown +=
            "బకాయి మొత్తం: ₹${(detail['due'] as double).toStringAsFixed(0)}\n";
        final int monthsPaid = detail['monthsPaid'] as int? ?? 0;
        final int monthsLeft = detail['monthsLeft'] as int? ?? 0;
        groupBreakdown += 'చెల్లించిన నెలలు: $monthsPaid\n';
        groupBreakdown += 'మిగిలిన నెలలు: $monthsLeft\n\n';
      } else if (languageCode == 'hi') {
        groupBreakdown += "समूह: ${detail['groupName']}\n";
        groupBreakdown +=
            "देय राशि: ₹${(detail['due'] as double).toStringAsFixed(0)}\n";
        final int monthsPaid = detail['monthsPaid'] as int? ?? 0;
        final int monthsLeft = detail['monthsLeft'] as int? ?? 0;
        groupBreakdown += 'भुगतान किए गए महीने: $monthsPaid\n';
        groupBreakdown += 'शेष महीने: $monthsLeft\n\n';
      } else {
        groupBreakdown += "Group: ${detail['groupName']}\n";
        groupBreakdown +=
            "Amount Due: ₹${(detail['due'] as double).toStringAsFixed(0)}\n";
        final int monthsPaid = detail['monthsPaid'] as int? ?? 0;
        final int monthsLeft = detail['monthsLeft'] as int? ?? 0;
        groupBreakdown += 'Months Paid: $monthsPaid\n';
        groupBreakdown += 'Months Left: $monthsLeft\n\n';
      }
    }

    String message = '';
    final greeting = _islamicGreeting(languageCode);

    if (languageCode == 'ur') {
      message = '$greeting\n\nمحترم $memberName صاحب،\n\n'
          'یہ آپ کی باقی ماندہ ادائیگیوں کی یاددہانی ہے۔\n\n'
          '$groupBreakdown'
          'کل باقی رقم: ₹${grandTotalDue.toStringAsFixed(0)}\n\n'
          'حلال کا پیغام کے معزز ممبر ہونے کا شکریہ۔ ہم آپ کی بروقت ادائیگیوں کی قدر کرتے ہیں۔\n\n'
          'جزاک اللہ خیر! آپ کے مسلسل تعاون کا شکریہ۔\n'
          'SanghaSetu';
    } else if (languageCode == 'te') {
      message = '$greeting\n\nగౌరవనీయులైన $memberName గారు,\n\n'
          'ఇది మీ బకాయి చెల్లింపుల గురించి ఒక రిమైండర్.\n\n'
          '$groupBreakdown'
          'మొత్తం బకాయి: ₹${grandTotalDue.toStringAsFixed(0)}\n\n'
          'హలాల్ కా పైగామ్ సభ్యులుగా ఉన్నందుకు ధన్యవాదాలు. మీరు సమయానికి చేసే చెల్లింపులను మేము అభినందిస్తున్నాము.\n\n'
          'జజాకల్లాహ్ ఖైర్! మీ నిరంతర మద్దతుకు ధన్యవాదాలు.\n'
          'SanghaSetu';
    } else if (languageCode == 'hi') {
      message = '$greeting\n\nमाननीय $memberName जी,\n\n'
          'यह आपके लंबित भुगतानों के संबंध में एक अनुस्मारक है।\n\n'
          '$groupBreakdown'
          'कुल लंबित राशि: ₹${grandTotalDue.toStringAsFixed(0)}\n\n'
          'हलाल का पैगाम के मूल्यवान सदस्य होने के लिए धन्यवाद। हम आपके समय पर भुगतान की सराहना करते हैं。\n\n'
          'जजाकल्लाह खैर! आपके निरंतर समर्थन के लिए धन्यवाद।\n'
          'SanghaSetu';
    } else {
      message = '$greeting\n\n'
          'Dear $memberName,\n\n'
          'This is a gentle reminder regarding your pending payments.\n\n'
          '$groupBreakdown'
          'Total Pending Amount: ₹${grandTotalDue.toStringAsFixed(0)}\n\n'
          'Thank you for being a valued member of SanghaSetu. We appreciate your timely payments.\n\n'
          'JazakAllah Khair! Thank you for your continued support.\n'
          'SanghaSetu';
    }

    return _launchWhatsAppHelper(formattedPhone, message);
  }

  Future<bool> launchWhatsAppPaymentReceipt({
    required AppDao dao,
    required int groupId,
    required int memberId,
    required String monthYear,
    required String languageCode,
  }) async {
    final memberships = await dao.getMembershipsForMember(memberId);
    final ms = memberships.firstWhereOrNull((m) => m.groupId == groupId);
    if (ms == null) return false;

    final allGroups = await dao.getAllGroups();
    final group = allGroups.firstWhereOrNull((g) => g.id == groupId);
    if (group == null) return false;

    final members = await dao.getAllMembers();
    final member = members.firstWhereOrNull((m) => m.id == memberId);
    if (member == null) return false;

    final payments = await dao.getPaymentsForMembership(ms.id);

    // Calculate stats
    double overallPaid = 0.0;
    Payment? latestPayment;
    for (final p in payments) {
      if (p.status == 'Completed') {
        overallPaid += p.amount;
        // The one matching monthYear or the latest
        if (latestPayment == null ||
            p.paymentDate.isAfter(latestPayment.paymentDate)) {
          latestPayment = p;
        }
      }
    }

    final totalExpected =
        group.monthlyContribution * group.totalMonths * ms.installmentsCount;
    final pendingAmount = totalExpected - overallPaid;

    final receiptNumber =
        'REC-${DateTime.now().millisecondsSinceEpoch.toString().substring(5)}';

    var formattedPhone = member.phone.replaceAll(RegExp(r'[^\d]'), '');
    if (formattedPhone.startsWith('0') && formattedPhone.length == 11) {
      formattedPhone = formattedPhone.substring(1);
    }
    if (formattedPhone.length == 10) {
      formattedPhone = '91$formattedPhone';
    }

    final greeting = _islamicGreeting(languageCode);
    String message = '';

    final double paidAmt = latestPayment?.amount ?? group.monthlyContribution;
    final String payMode = latestPayment?.paymentMode ?? 'Cash';
    final String remarksNote = latestPayment?.remarks != null
        ? '\nNote: ${latestPayment!.remarks}'
        : '';

    if (languageCode == 'ur') {
      message =
          '$greeting\n\nمحترم ${member.name} صاحب،\nآپ کی ادائیگی موصول ہو گئی ہے۔ شکریہ!\n\n📋 رسید نمبر: $receiptNumber\nگروپ: ${group.name}\nمہینہ: $monthYear\nادا شدہ رقم: ₹${paidAmt.toStringAsFixed(0)}\nطریقہ کار: $payMode$remarksNote\nکل ادا شدہ: ₹${overallPaid.toStringAsFixed(0)}\nباقی رقم: ₹${pendingAmount.toStringAsFixed(0)}\n\nجزاک اللہ خیر! آپ کے مسلسل تعاون کا شکریہ۔\nSanghaSetu';
    } else if (languageCode == 'te') {
      message =
          '$greeting\n\nగౌరవనీయులైన ${member.name} గారు,\nమీ చెల్లింపు స్వీకరించబడింది. ధన్యవాదాలు!\n\n📋 రసీదు నంబర్: $receiptNumber\nగ్రూప్: ${group.name}\nనెల: $monthYear\nచెల్లించిన మొత్తం: ₹${paidAmt.toStringAsFixed(0)}\nచెల్లింపు విధానం: $payMode$remarksNote\nమొత్తం చెల్లించినది: ₹${overallPaid.toStringAsFixed(0)}\nబకాయి మొత్తం: ₹${pendingAmount.toStringAsFixed(0)}\n\nజజాకల్లాహ్ ఖైర్! మీ నిరంతర మద్దతుకు ధన్యవాదాలు.\nSanghaSetu';
    } else if (languageCode == 'hi') {
      message =
          '$greeting\n\nमाननीय ${member.name} जी,\nआपका भुगतान प्राप्त हो गया है। धन्यवाद!\n\n📋 रसीद संख्या: $receiptNumber\nसमूह: ${group.name}\nमहीना: $monthYear\nभुगतान राशि: ₹${paidAmt.toStringAsFixed(0)}\nभुगतान मोड: $payMode$remarksNote\nकुल भुगतान: ₹${overallPaid.toStringAsFixed(0)}\nशेष राशि: ₹${pendingAmount.toStringAsFixed(0)}\n\nजजाकल्लाह खैर! आपके निरंतर समर्थन के लिए धन्यवाद।\nSanghaSetu';
    } else {
      message =
          '$greeting\n\nDear ${member.name},\nYour payment has been received successfully. Thank you!\n\n📋 Receipt No: $receiptNumber\nGroup: ${group.name}\nMonth: $monthYear\nPaid Amount: ₹${paidAmt.toStringAsFixed(0)}\nPayment Mode: $payMode$remarksNote\nOverall Paid: ₹${overallPaid.toStringAsFixed(0)}\nPending Amount: ₹${pendingAmount.toStringAsFixed(0)}\n\nJazakAllah Khair! Thank you for your continued support.\nSanghaSetu';
    }

    return _launchWhatsAppHelper(formattedPhone, message);
  }

  Future<bool> launchConsolidatedWhatsAppReminder({
    required AppDao dao,
    required Member member,
    required String languageCode,
  }) async {
    final memberships = await dao.getMembershipsForMember(member.id);
    final allGroups = await dao.getAllGroups();

    final List<Map<String, dynamic>> groupDetails = [];
    final now = DateTime.now();
    double grandTotalDue = 0.0;

    for (final ms in memberships) {
      final group = allGroups.firstWhereOrNull((g) => g.id == ms.groupId);
      if (group == null) continue;
      final rounds = await dao.getRoundsForGroup(group.id);
      final currentRound = rounds
          .firstWhereOrNull((r) => r.month == now.month && r.year == now.year);

      final groupMemberships = await dao.getActiveMembershipsForGroup(group.id);
      final totalSlots =
          groupMemberships.fold<double>(0, (s, m) => s + m.installmentsCount);
      double baseExpected = group.monthlyContribution;
      if (currentRound != null &&
          currentRound.dividendDistributed != null &&
          totalSlots > 0) {
        final dividendPerSlot = currentRound.dividendDistributed! / totalSlots;
        baseExpected = group.monthlyContribution - dividendPerSlot;
      }

      double expected = baseExpected * ms.installmentsCount;
      double collected = 0.0;

      if (currentRound != null) {
        final payments = await dao.getPaymentsForMembership(ms.id);
        final roundPayments =
            payments.where((p) => p.roundId == currentRound.id);
        collected = roundPayments.fold<double>(0.0, (sum, p) => sum + p.amount);
      }

      final msPayments = await dao.getPaymentsForMembership(ms.id);
      final totalPaid = msPayments
          .where((p) => p.status == 'Completed')
          .fold<double>(0.0, (sum, p) => sum + p.amount);
      final int monthsPaid = (totalPaid / group.monthlyContribution).floor();
      final int monthsLeft = group.totalMonths - monthsPaid;

      final start = group.startDate;
      final List<String> paidMonthsList = [];
      final List<String> leftMonthsList = [];

      List<String> monthNames;
      if (languageCode == 'ur') {
        monthNames = [
          'جنوری',
          'فروری',
          'مارچ',
          'اپریل',
          'مئی',
          'جون',
          'جولائی',
          'اگست',
          'ستمبر',
          'اکتوبر',
          'نومبر',
          'دسمبر'
        ];
      } else if (languageCode == 'te') {
        monthNames = [
          'జనవరి',
          'ఫిబ్రవరి',
          'మార్చి',
          'ఏప్రిల్',
          'మే',
          'జూన్',
          'జూలై',
          'ఆగస్టు',
          'సెప్టెంబర్',
          'అక్టోబర్',
          'నవంబర్',
          'డిసెంబర్'
        ];
      } else if (languageCode == 'hi') {
        monthNames = [
          'जनवरी',
          'फरवरी',
          'मार्च',
          'अप्रैल',
          'मई',
          'जून',
          'जुलाई',
          'अगस्त',
          'सितंबर',
          'अक्टूबर',
          'नवंबर',
          'दिसंबर'
        ];
      } else {
        monthNames = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec'
        ];
      }

      for (int i = 0; i < group.totalMonths; i++) {
        final date = DateTime(start.year, start.month + i);
        final label = monthNames[date.month - 1];
        if (i < monthsPaid) {
          paidMonthsList.add(label);
        } else {
          leftMonthsList.add(label);
        }
      }

      final paidDisplay =
          paidMonthsList.isNotEmpty ? paidMonthsList.join(', ') : 'None';
      final leftDisplay =
          leftMonthsList.isNotEmpty ? leftMonthsList.join(', ') : 'None';

      final due = expected - collected;
      if (due > 0) {
        groupDetails.add({
          'groupName': group.name,
          'expected': expected,
          'paid': collected,
          'due': due,
          'monthsPaid': monthsPaid,
          'monthsLeft': monthsLeft,
          'totalMonths': group.totalMonths,
          'paidDisplay': paidDisplay,
          'leftDisplay': leftDisplay,
        });
        grandTotalDue += due;
      }
    }

    return launchWhatsAppReminder(
      mobileNumber: member.phone,
      memberName: member.name,
      groupDetails: groupDetails,
      grandTotalDue: grandTotalDue,
      languageCode: languageCode,
    );
  }

  Future<bool> launchWhatsAppWinnerPayoutReceipt({
    required String mobileNumber,
    required String memberName,
    required String groupName,
    required int roundNumber,
    required double bidAmount,
    required double prizeAmount,
    required double paidAmount,
    required double balance,
    required String languageCode,
    String? paymentMode,
    String? remarks,
  }) async {
    var formattedPhone = mobileNumber.replaceAll(RegExp(r'[^\d]'), '');
    if (formattedPhone.startsWith('0') && formattedPhone.length == 11) {
      formattedPhone = formattedPhone.substring(1);
    }
    if (formattedPhone.length == 10) {
      formattedPhone = '91$formattedPhone';
    }

    final modeText = paymentMode != null ? '\nPayment Mode: $paymentMode' : '';
    final remarksText =
        (remarks != null && remarks.isNotEmpty) ? '\nRemarks: $remarks' : '';

    final greeting = _islamicGreeting(languageCode);
    String message = '';

    if (languageCode == 'ur') {
      message =
          '$greeting\n\nمحترم $memberName صاحب،\nآپ کے جیتنے والے راؤنڈ کی رقم کا ادائیگی جاری کر دیا گیا ہے۔\n\n📋 گروپ: $groupName\nراؤنڈ: $roundNumber\nبولی کی رقم: ₹${bidAmount.toStringAsFixed(0)}\nانعامی رقم: ₹${prizeAmount.toStringAsFixed(0)}\nادا شدہ رقم: ₹${paidAmount.toStringAsFixed(0)}\nباقی رقم: ₹${balance.toStringAsFixed(0)}$modeText$remarksText\n\nجزاک اللہ خیر! آپ کے مسلسل تعاون کا شکریہ۔\nSanghaSetu';
    } else if (languageCode == 'te') {
      message =
          '$greeting\n\nగౌరవనీయులైన $memberName గారు,\nమీ గెలిచిన రౌండ్ యొక్క బహుమతి చెల్లింపు విడుదల చేయబడింది.\n\n📋 గ్రూప్: $groupName\nరౌండ్: $roundNumber\nబిడ్ మొత్తం: ₹${bidAmount.toStringAsFixed(0)}\nబహుమతి మొత్తం: ₹${prizeAmount.toStringAsFixed(0)}\nచెల్లించిన మొత్తం: ₹${paidAmount.toStringAsFixed(0)}\nబకాయి మొత్తం: ₹${balance.toStringAsFixed(0)}$modeText$remarksText\n\nజజాకల్లాహ్ ఖైర్! మీ నిరంతర మద్దతుకు ధన్యవాదాలు.\nSanghaSetu';
    } else if (languageCode == 'hi') {
      message =
          '$greeting\n\nमाननीय $memberName जी,\nआपके विजयी दौर के पुरस्कार भुगतान की राशि जारी कर दी गई है।\n\n📋 समूह: $groupName\nदौर: $roundNumber\nबोली राशि: ₹${bidAmount.toStringAsFixed(0)}\nपुरस्कार राशि: ₹${prizeAmount.toStringAsFixed(0)}\nभुगतान राशि: ₹${paidAmount.toStringAsFixed(0)}\nशेष राशि: ₹${balance.toStringAsFixed(0)}$modeText$remarksText\n\nजजाकल्लाह खैर! आपके निरंतर समर्थन के लिए धन्यवाद।\nSanghaSetu';
    } else {
      message =
          '$greeting\n\nDear $memberName,\nYour prize payout details for the winning round have been processed.\n\n📋 Group: $groupName\nRound: $roundNumber\nBid Amount: ₹${bidAmount.toStringAsFixed(0)}\nPrize Amount: ₹${prizeAmount.toStringAsFixed(0)}\nPaid Amount: ₹${paidAmount.toStringAsFixed(0)}\nRemaining Balance: ₹${balance.toStringAsFixed(0)}$modeText$remarksText\n\nJazakAllah Khair! Thank you for your continued support.\nSanghaSetu';
    }

    return _launchWhatsAppHelper(formattedPhone, message);
  }
}
