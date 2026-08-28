const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const documentsDir = path.join(__dirname, '../../documents');
if (!fs.existsSync(documentsDir)) {
  fs.mkdirSync(documentsDir, { recursive: true });
}

function generateApplicationPDF({ documentId, schemeName, citizenName, email, phone, age, occupation, annualIncome, state }) {
  return new Promise((resolve, reject) => {
    try {
      const filePath = path.join(documentsDir, `${documentId}.pdf`);
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // Header Banner
      doc.rect(0, 0, 612, 100).fill('#0A2540');
      doc.fillColor('#FFFFFF').fontSize(22).font('Helvetica-Bold').text('SCHEMESETU CITIZEN APPLICATION FORM', 50, 30);
      doc.fontSize(10).font('Helvetica').text('Official Pre-filled Government Assistance Facilitation Slip', 50, 60);

      // Metadata Box
      doc.fillColor('#334155').fontSize(10).font('Helvetica-Bold').text(`Application Reference ID: ${documentId}`, 50, 120);
      doc.font('Helvetica').text(`Generated Date: ${new Date().toLocaleDateString('en-IN')}`, 50, 135);
      doc.text(`Portal Verification Code: SCHEME-${Math.random().toString(36).substr(2, 6).toUpperCase()}`, 50, 150);

      doc.moveTo(50, 170).lineTo(562, 170).strokeColor('#E2E8F0').stroke();

      // Section 1: Scheme Details
      doc.fillColor('#0A2540').fontSize(14).font('Helvetica-Bold').text('1. Target Welfare Scheme', 50, 190);
      doc.fillColor('#1E293B').fontSize(11).font('Helvetica-Bold').text(`Scheme Name: ${schemeName || 'Government Welfare Scheme'}`, 50, 210);

      // Section 2: Citizen Profile
      doc.fillColor('#0A2540').fontSize(14).font('Helvetica-Bold').text('2. Citizen Beneficiary Profile', 50, 250);
      doc.fillColor('#334155').fontSize(10).font('Helvetica');
      doc.text(`Full Name: ${citizenName || 'Applicant'}`, 50, 270);
      doc.text(`Email Address: ${email || 'N/A'}`, 50, 285);
      doc.text(`Phone / Mobile: ${phone || '+91-XXXXXXXXXX'}`, 50, 300);
      doc.text(`Age: ${age || 'N/A'} Years`, 300, 270);
      doc.text(`Occupation: ${occupation || 'Farmer'}`, 300, 285);
      doc.text(`Annual Income: ₹${annualIncome ? Number(annualIncome).toLocaleString('en-IN') : 'N/A'}`, 300, 300);
      doc.text(`State / UT: ${state || 'India'}`, 50, 315);

      doc.moveTo(50, 340).lineTo(562, 340).strokeColor('#E2E8F0').stroke();

      // Section 3: Document Verification Checklist
      doc.fillColor('#0A2540').fontSize(14).font('Helvetica-Bold').text('3. Required Verification Checklist', 50, 360);
      doc.fontSize(10).font('Helvetica').fillColor('#334155');
      const docs = [
        '[ ] Original Aadhaar Card & Self-Attested Photocopy',
        '[ ] Aadhaar-Seeded Savings Bank Passbook',
        '[ ] Proof of Landholding / Residence Certificate',
        '[ ] Recent Passport Size Photograph (2 copies)'
      ];
      docs.forEach((item, index) => {
        doc.text(item, 60, 385 + (index * 20));
      });

      // Verification Box Footer
      doc.rect(50, 480, 512, 100).fillAndStroke('#F8FAFC', '#CBD5E1');
      doc.fillColor('#0F172A').fontSize(10).font('Helvetica-Bold').text('Jan Seva Kendra / Agent Verification Stamp', 65, 495);
      doc.fontSize(9).font('Helvetica').fillColor('#64748B').text('Agent ID: ______________________    Signature: ______________________', 65, 520);
      doc.text('Date of Submission: ____ / ____ / 2026   CSC Center Seal: _______________', 65, 540);

      // Footer
      doc.fillColor('#94A3B8').fontSize(8).font('Helvetica').text('SchemeSetu Citizen Portal • Smart India Hackathon 2026 • Verified Document Slip', 50, 720, { align: 'center' });

      doc.end();

      stream.on('finish', () => {
        resolve({ documentId, filePath });
      });
      stream.on('error', (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = {
  generateApplicationPDF
};
