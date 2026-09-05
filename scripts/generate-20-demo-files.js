const fs = require('fs');
const path = require('path');

const dirs = [
  path.resolve(__dirname, '../database/sample-data/demo-files'),
  path.resolve(__dirname, '../public/sample-data')
];

dirs.forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

const notice = "FICTIONAL DEMONSTRATION DATA — NOT AN OFFICIAL DOCUMENT\nSchemeSetu Prototype Demo Reference Dataset for Smart India Hackathon 2026\n";

function createSimplePdf(title, text) {
  const content = `%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj\n4 0 obj<</Length 220>>stream\nBT /F1 12 Tf 50 720 Td (${title} - FICTIONAL DEMONSTRATION DATA) Tj 0 -30 Td (${text}) Tj 0 -30 Td (Verified for SchemeSetu Simulation - Not a Government Issued Document) Tj ET\nendstream\nendobj\n5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000244 00000 n \n0000000515 00000 n \ntrailer<</Size 6/Root 1 0 R>>\nstartxref\n595\n%%EOF\n`;
  return Buffer.from(content);
}

// 1. 10 PDF Documents
const pdfs = [
  { name: 'sample-sc-profile.pdf', title: 'Scheduled Caste Beneficiary Profile', text: 'Ramesh Kumar - SC Community Verified - Income Rs 240000 - Loan Rs 250000' },
  { name: 'sample-income-certificate.pdf', title: 'Annual Household Income Certificate', text: 'Issued by Tahsildar - Annual Income Rs 240000 - Verified for Subsidy' },
  { name: 'sample-community-certificate.pdf', title: 'SC Community & Caste Certificate', text: 'Verified Scheduled Caste Certificate - Subsidized Credit Eligible' },
  { name: 'sample-business-plan.pdf', title: 'Fabrication Enterprise Business Plan', text: 'Total Project Cost Rs 350000 - Machinery Rs 250000 - Working Capital Rs 100000' },
  { name: 'sample-project-report.pdf', title: 'Detailed Project Report (DPR)', text: 'PMEGP and Mudra Eligible Fabrication Enterprise - Hyderabad Telangana' },
  { name: 'sample-engineering-report.pdf', title: 'Technical Feasibility & Machinery Valuation', text: 'Machinery Inspection Passed - Estimated Useful Life 10 Years' },
  { name: 'sample-aadhaar-verified.pdf', title: 'Masked Aadhaar Verification Slip', text: 'UIDAI Masked e-KYC Verification - Ramesh Kumar - Telangana' },
  { name: 'sample-land-passbook.pdf', title: 'Pattadar Land Ownership Passbook', text: 'Revenue Department Land Record - Cultivable Land 2.5 Acres' },
  { name: 'sample-bank-statement.pdf', title: '6-Month Savings Bank Account Statement', text: 'State Bank of India - Average Monthly Balance Rs 35000 - No Default' },
  { name: 'sample-udyam-certificate.pdf', title: 'MSME Udyam Registration Certificate', text: 'Micro Enterprise Registration - Metal Fabrication - Hyderabad' }
];

pdfs.forEach(f => {
  const buf = createSimplePdf(f.title, f.text);
  dirs.forEach(d => fs.writeFileSync(path.join(d, f.name), buf));
});

// 2. 4 Text / CSV Data Files
const textFiles = [
  { name: 'sample-notes.txt', content: notice + "\nBeneficiary: Ramesh Kumar\nOccupation: Metal & Fabrication Enterprise\nAnnual Family Income: Rs. 2,40,000\nLoan Requirement: Rs. 2,50,000\nProject Cost: Rs. 3,50,000\nCaste: Scheduled Caste (SC)\nState: Telangana (Hyderabad)\n" },
  { name: 'sample-vendors.csv', content: "Vendor_ID,Vendor_Name,Category,Item_Supplied,Unit_Cost,Quotation_Amount\nVEN-001,Sri Balaji Industrial Works,Machinery,Lathe Machine & CNC,180000,180000\nVEN-002,Deccan Electricals,Electrical,3-Phase Motor & Panel,70000,70000\nVEN-003,Telangana Steel Traders,Raw Material,Sheet Metal & Angles,100000,100000\n" },
  { name: 'sample-machinery-quotation.txt', content: notice + "\nQUOTATION FOR FABRICATION MACHINERY\nSupplier: Deccan Machinery Pvt Ltd\n1. Heavy Duty Lathe Machine: Rs. 1,50,000\n2. MIG/TIG Welding Setup: Rs. 60,000\n3. Hydraulic Cutting Press: Rs. 40,000\nTotal Machinery Quotation: Rs. 2,50,000\n" },
  { name: 'sample-beneficiary-checklist.csv', content: "Document_Code,Document_Name,Mandatory,Verification_Authority\nDOC-01,Aadhaar Card,Yes,UIDAI\nDOC-02,Caste Certificate,Yes,Revenue Tahsildar\nDOC-03,Income Certificate,Yes,Revenue Tahsildar\nDOC-04,Detailed Project Report,Yes,Technical Consultant / Chartered Accountant\nDOC-05,Bank Passbook,Yes,Lead District Bank\n" }
];

textFiles.forEach(f => {
  dirs.forEach(d => fs.writeFileSync(path.join(d, f.name), f.content));
});

// 3. Binary Office & Sheet Files (DOCX, PPTX, XLSX)
const binaryFiles = [
  { name: 'sample-policy.docx', header: "PK\x03\x04", note: "SchemeSetu Demo Policy Document" },
  { name: 'sample-presentation.pptx', header: "PK\x03\x04", note: "SchemeSetu Demo Presentation" },
  { name: 'sample-financial-data.xlsx', header: "PK\x03\x04", note: "Month,Revenue,Expenditure,EMI\n1,45000,28000,4200\n2,52000,31000,4200\n3,58000,33000,4200\n" },
  { name: 'sample-project-budget.xlsx', header: "PK\x03\x04", note: "Head,Amount,Source\nPlant Machinery,250000,Bank Loan\nWorking Capital,100000,Own Contribution\n" }
];

binaryFiles.forEach(f => {
  const buf = Buffer.from(f.header + notice + f.note);
  dirs.forEach(d => fs.writeFileSync(path.join(d, f.name), buf));
});

// 4. Sample Image Simulation Files (JPG, PNG)
// 1x1 valid pixel GIF / PNG headers for local image parser tests
const pngPixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
const jpgPixel = Buffer.from('/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=', 'base64');

dirs.forEach(d => {
  fs.writeFileSync(path.join(d, 'sample-aadhaar-front.png'), pngPixel);
  fs.writeFileSync(path.join(d, 'sample-caste-certificate.jpg'), jpgPixel);
});

console.log(`✅ Successfully created 20 Demo Files across all required formats in ${dirs[0]}!`);
