import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import 'package:intl/intl.dart';

class ReceiptData {
  final String receiptNumber;
  final DateTime paymentDate;
  final String collectorName;
  final String memberName;
  final double chitValue;
  final int roundNo;
  final String paymentMode;
  final double paidAmount;
  final double overallPaid;
  final double pendingAmount;
  final double overallInvestment;
  final String transactionId;
  final String remarks;

  ReceiptData({
    required this.receiptNumber,
    required this.paymentDate,
    required this.collectorName,
    required this.memberName,
    required this.chitValue,
    required this.roundNo,
    required this.paymentMode,
    required this.paidAmount,
    required this.overallPaid,
    required this.pendingAmount,
    required this.overallInvestment,
    this.transactionId = 'N/A',
    this.remarks = 'N/A',
  });
}

class ReceiptGenerator {
  Future<Uint8List> generatePdfReceipt(ReceiptData data) async {
    final pdf = pw.Document();

    final dateStr = DateFormat('dd-MM-yyyy').format(data.paymentDate);
    final timeStr = DateFormat('hh:mm a').format(data.paymentDate);

    final brandColor = PdfColor.fromHex('#0D9488');
    final darkGrey = PdfColor.fromHex('#334155');
    final lightGrey = PdfColor.fromHex('#F1F5F9');

    Uint8List? logoBytes;
    try {
      final logoData = await rootBundle.load('assets/images/logo.png');
      logoBytes = logoData.buffer.asUint8List();
    } catch (e) {
      debugPrint('Failed to load logo asset for receipt generator: $e');
    }

    pdf.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.a5,
        margin: const pw.EdgeInsets.all(24),
        build: (pw.Context context) {
          return pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.start,
            children: [
              // Header Banner
              pw.Container(
                width: double.infinity,
                padding:
                    const pw.EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                decoration: pw.BoxDecoration(
                  color: brandColor,
                  borderRadius:
                      const pw.BorderRadius.all(pw.Radius.circular(8)),
                ),
                child: pw.Row(
                  children: [
                    if (logoBytes != null)
                      pw.Container(
                        margin: const pw.EdgeInsets.only(right: 12),
                        child: pw.Image(pw.MemoryImage(logoBytes),
                            width: 40, height: 40),
                      ),
                    pw.Expanded(
                      child: pw.Column(
                        crossAxisAlignment: pw.CrossAxisAlignment.center,
                        children: [
                          pw.Text('SANGHA SETU',
                              style: pw.TextStyle(
                                  color: PdfColors.white,
                                  fontSize: 18,
                                  fontWeight: pw.FontWeight.bold,
                                  letterSpacing: 1.2)),
                          pw.SizedBox(height: 2),
                          pw.Text('Official Payment Receipt',
                              style: pw.TextStyle(
                                  color: PdfColor.fromHex('#E2E8F0'),
                                  fontSize: 9,
                                  fontWeight: pw.FontWeight.bold)),
                        ],
                      ),
                    ),
                    if (logoBytes != null)
                      pw.SizedBox(
                          width:
                              52), // To keep it centered if needed, or just let it align left
                  ],
                ),
              ),
              pw.SizedBox(height: 15),

              // Metadata section
              pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                crossAxisAlignment: pw.CrossAxisAlignment.start,
                children: [
                  pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.start,
                    children: [
                      pw.Text('RECEIVED FROM:',
                          style: pw.TextStyle(
                              fontSize: 8,
                              color: darkGrey,
                              fontWeight: pw.FontWeight.bold)),
                      pw.Text(data.memberName,
                          style: pw.TextStyle(
                              fontSize: 11, fontWeight: pw.FontWeight.bold)),
                      pw.SizedBox(height: 6),
                      pw.Text('COLLECTED BY:',
                          style: pw.TextStyle(
                              fontSize: 8,
                              color: darkGrey,
                              fontWeight: pw.FontWeight.bold)),
                      pw.Text(data.collectorName,
                          style: const pw.TextStyle(fontSize: 9)),
                    ],
                  ),
                  pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.end,
                    children: [
                      pw.Text('RECEIPT NO: ${data.receiptNumber}',
                          style: pw.TextStyle(
                              fontSize: 9,
                              fontWeight: pw.FontWeight.bold,
                              color: brandColor)),
                      pw.Text('Date: $dateStr',
                          style: const pw.TextStyle(fontSize: 8)),
                      pw.Text('Time: $timeStr',
                          style: const pw.TextStyle(fontSize: 8)),
                    ],
                  ),
                ],
              ),
              pw.SizedBox(height: 12),
              pw.Divider(color: brandColor, thickness: 1),
              pw.SizedBox(height: 8),

              // Transaction Details Table
              pw.TableHelper.fromTextArray(
                context: context,
                border: null,
                headerStyle: pw.TextStyle(
                    fontWeight: pw.FontWeight.bold,
                    fontSize: 9,
                    color: PdfColors.white),
                headerDecoration: pw.BoxDecoration(color: brandColor),
                rowDecoration: const pw.BoxDecoration(color: PdfColors.grey100),
                cellStyle: const pw.TextStyle(fontSize: 8),
                headers: ['Item / Description', 'Details'],
                data: [
                  ['Group Value', 'Rs. ${data.chitValue.toStringAsFixed(2)}'],
                  ['Round Number', data.roundNo.toString()],
                  ['Payment Mode', data.paymentMode],
                  ['Transaction ID', data.transactionId],
                ],
              ),
              pw.SizedBox(height: 12),

              // Financial breakdown summary card
              pw.Container(
                padding: const pw.EdgeInsets.all(10),
                decoration: pw.BoxDecoration(
                  color: lightGrey,
                  borderRadius:
                      const pw.BorderRadius.all(pw.Radius.circular(8)),
                  border: pw.Border.all(color: PdfColors.grey300),
                ),
                child: pw.Column(
                  children: [
                    _buildRow('Amount Paid',
                        'Rs. ${data.paidAmount.toStringAsFixed(2)}',
                        isBold: true, color: brandColor, size: 12),
                    pw.Divider(color: PdfColors.grey300, thickness: 0.5),
                    _buildRow('Total Paid to Date',
                        'Rs. ${data.overallPaid.toStringAsFixed(2)}',
                        size: 9),
                    _buildRow('Outstanding Balance',
                        'Rs. ${data.pendingAmount.toStringAsFixed(2)}',
                        size: 9),
                    _buildRow('Overall Investment',
                        'Rs. ${data.overallInvestment.toStringAsFixed(2)}',
                        size: 9),
                  ],
                ),
              ),

              if (data.remarks != 'N/A' && data.remarks.isNotEmpty) ...[
                pw.SizedBox(height: 8),
                pw.Text('Remarks: ${data.remarks}',
                    style: const pw.TextStyle(fontSize: 8)),
              ],

              pw.Spacer(),
              pw.Divider(color: PdfColors.grey300, thickness: 0.5),
              pw.SizedBox(height: 4),
              pw.Center(
                child: pw.Text(
                    'JazakAllah Khair! Thank you for your continued support.',
                    style: pw.TextStyle(fontSize: 9, color: darkGrey)),
              ),
              pw.SizedBox(height: 2),
              pw.Center(
                child: pw.Text('— SANGHA SETU',
                    style: pw.TextStyle(
                        fontSize: 9,
                        fontWeight: pw.FontWeight.bold,
                        color: brandColor)),
              ),
            ],
          );
        },
      ),
    );

    return pdf.save();
  }

  pw.Widget _buildRow(String label, String value,
      {bool isBold = false, PdfColor? color, double size = 9}) {
    return pw.Padding(
      padding: const pw.EdgeInsets.symmetric(vertical: 2),
      child: pw.Row(
        mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
        children: [
          pw.Text(label,
              style: pw.TextStyle(
                  fontSize: size,
                  color: color,
                  fontWeight:
                      isBold ? pw.FontWeight.bold : pw.FontWeight.normal)),
          pw.Text(
            value,
            style: pw.TextStyle(
                fontSize: size,
                color: color,
                fontWeight: isBold ? pw.FontWeight.bold : pw.FontWeight.normal),
          ),
        ],
      ),
    );
  }

  Future<void> printReceipt(ReceiptData data) async {
    final pdfBytes = await generatePdfReceipt(data);
    await Printing.layoutPdf(
        onLayout: (PdfPageFormat format) async => pdfBytes);
  }

  String generateMiniWhatsAppReceipt(ReceiptData data) {
    return '''
Assalamu Alaikum Wa Rehmatullahi Wabarakatuhu

✅ Payment Received

Dear ${data.memberName},

Payment Received: ₹${data.paidAmount.toStringAsFixed(0)}
Group: ₹${data.chitValue.toStringAsFixed(0)}
Round: ${data.roundNo}
Payment Type: ${data.paymentMode}

Total Paid: ₹${data.overallPaid.toStringAsFixed(0)}
Balance Left: ₹${data.pendingAmount.toStringAsFixed(0)}
Overall Investment: ₹${data.overallInvestment.toStringAsFixed(0)}

Receipt No: ${data.receiptNumber}

JazakAllah Khair! Thank you for your continued support.
— SANGHA SETU
'''
        .trim();
  }
}

final receiptGeneratorProvider = Provider<ReceiptGenerator>((ref) {
  return ReceiptGenerator();
});
