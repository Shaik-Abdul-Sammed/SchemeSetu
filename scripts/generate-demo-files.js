const fs = require('fs');
const path = require('path');

const dirs = [
  path.resolve(__dirname, '../database/sample-data/demo-files'),
  path.resolve(__dirname, '../public/sample-data'),
  path.resolve(__dirname, '../database/sample-data/rag')
];

dirs.forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

const notice = "FICTIONAL DEMONSTRATION DATA — NOT AN OFFICIAL DOCUMENT\nSchemeSetu Prototype Demo Reference Dataset for Smart India Hackathon 2026\n";

// 1. Text & CSV Files
fs.writeFileSync(path.join(dirs[0], 'sample-notes.txt'), notice + "\nBeneficiary: Ramesh Kumar\nOccupation: Metal & Fabrication Enterprise\nAnnual Family Income: Rs. 2,40,000\nLoan Requirement: Rs. 2,50,000\nProject Cost: Rs. 3,50,000\nCaste: Scheduled Caste (SC)\nState: Telangana (Hyderabad)\n");
fs.writeFileSync(path.join(dirs[1], 'sample-notes.txt'), fs.readFileSync(path.join(dirs[0], 'sample-notes.txt')));

fs.writeFileSync(path.join(dirs[0], 'sample-vendors.csv'), "Vendor_ID,Vendor_Name,Category,Item_Supplied,Unit_Cost,Quotation_Amount\nVEN-001,Sri Balaji Industrial Works,Machinery,Lathe Machine & CNC,180000,180000\nVEN-002,Deccan Electricals,Electrical,3-Phase Motor & Panel,70000,70000\nVEN-003,Telangana Steel Traders,Raw Material,Sheet Metal & Angles,100000,100000\n");
fs.writeFileSync(path.join(dirs[1], 'sample-vendors.csv'), fs.readFileSync(path.join(dirs[0], 'sample-vendors.csv')));

// Minimal Valid PDF header for sample demonstration PDFs
function createSimplePdf(title, text) {
  const content = `%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj\n4 0 obj<</Length 180>>stream\nBT /F1 12 Tf 50 720 Td (${title} - FICTIONAL DEMONSTRATION DATA) Tj 0 -30 Td (${text}) Tj ET\nendstream\nendobj\n5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000244 00000 n \n0000000475 00000 n \ntrailer<</Size 6/Root 1 0 R>>\nstartxref\n555\n%%EOF\n`;
  return Buffer.from(content);
}

const pdfFiles = [
  { name: 'sample-sc-profile.pdf', title: 'Scheduled Caste Beneficiary Profile', text: 'Ramesh Kumar - SC Community Verified - Income Rs 240000 - Loan Rs 250000' },
  { name: 'sample-income-certificate.pdf', title: 'Annual Household Income Certificate', text: 'Issued by Tahsildar - Annual Income Rs 240000 - Verified for Subsidy' },
  { name: 'sample-community-certificate.pdf', title: 'SC Community & Caste Certificate', text: 'Verified Scheduled Caste Certificate - Subsidized Credit Eligible' },
  { name: 'sample-business-plan.pdf', title: 'Fabrication & Small Enterprise Business Plan', text: 'Total Project Cost Rs 350000 - Machinery Rs 250000 - Working Capital Rs 100000' },
  { name: 'sample-project-report.pdf', title: 'Detailed Project Report (DPR)', text: 'PMEGP and Mudra Eligible Fabrication Enterprise - Hyderabad Telangana' },
  { name: 'sample-engineering-report.pdf', title: 'Technical Feasibility & Machinery Valuation', text: 'Machinery Inspection Passed - Estimated Useful Life 10 Years' }
];

pdfFiles.forEach(f => {
  const buf = createSimplePdf(f.title, f.text);
  fs.writeFileSync(path.join(dirs[0], f.name), buf);
  fs.writeFileSync(path.join(dirs[1], f.name), buf);
});

// Binary placeholder simulation files (DOCX, PPTX, XLSX)
const docxContent = Buffer.from("PK\x03\x04" + notice + "SchemeSetu Demo Policy Document");
fs.writeFileSync(path.join(dirs[0], 'sample-policy.docx'), docxContent);
fs.writeFileSync(path.join(dirs[1], 'sample-policy.docx'), docxContent);

const pptxContent = Buffer.from("PK\x03\x04" + notice + "SchemeSetu Demo Presentation");
fs.writeFileSync(path.join(dirs[0], 'sample-presentation.pptx'), pptxContent);
fs.writeFileSync(path.join(dirs[1], 'sample-presentation.pptx'), pptxContent);

const xlsxContent = Buffer.from("PK\x03\x04" + notice + "Month,Revenue,Expenditure,EMI\n1,45000,28000,4200\n2,52000,31000,4200\n3,58000,33000,4200\n");
fs.writeFileSync(path.join(dirs[0], 'sample-financial-data.xlsx'), xlsxContent);
fs.writeFileSync(path.join(dirs[1], 'sample-financial-data.xlsx'), xlsxContent);

// 2. RAG Knowledge Documents in database/sample-data/rag/
const ragDocs = [
  {
    file: 'rag-mudra-guidelines.txt',
    content: "PRADHAN MANTRI MUDRA YOJANA (PMMY) OFFICIAL OPERATIONAL GUIDELINES\n\n1. Category Divisions:\n- Shishu: Loans up to Rs. 50,000 for micro startups.\n- Kishore: Loans from Rs. 50,001 up to Rs. 5,00,000 for established micro units.\n- Tarun: Loans from Rs. 5,00,001 up to Rs. 10,00,000 for enterprise expansion.\n- Tarun Plus: Loans up to Rs. 20,00,000 for past repaid borrowers.\n2. Collateral: Nil (100% collateral-free credit backed by Credit Guarantee Fund for Micro Units).\n3. Margin: No margin requirement for Shishu; 10% to 15% for Kishore and Tarun."
  },
  {
    file: 'rag-pmegp-subsidy.txt',
    content: "PRIME MINISTER'S EMPLOYMENT GENERATION PROGRAMME (PMEGP) SUBSIDY NORMS\n\n1. Margin Money Subsidy Rates:\n- General Category (Urban): 15% subsidy, 10% beneficiary contribution.\n- General Category (Rural): 25% subsidy, 10% beneficiary contribution.\n- Special Categories (SC / ST / OBC / Minorities / Women / Ex-Servicemen) (Urban): 25% subsidy, 5% beneficiary contribution.\n- Special Categories (SC / ST / OBC / Minorities / Women / Ex-Servicemen) (Rural): 35% subsidy, 5% beneficiary contribution.\n2. Maximum Project Cost: Rs. 50 Lakhs (Manufacturing) / Rs. 20 Lakhs (Service Sector)."
  },
  {
    file: 'rag-stand-up-india.txt',
    content: "STAND-UP INDIA SCHEME GUIDELINES FOR SC/ST AND WOMEN ENTREPRENEURS\n\n1. Target Group: Scheduled Caste (SC), Scheduled Tribe (ST), and Women borrowers.\n2. Loan Size: Bank composite loans from Rs. 10 Lakhs up to Rs. 1 Crore for greenfield enterprises.\n3. Repayment Period: Up to 7 years with a maximum moratorium period of 18 months.\n4. Convergence: Handholding support provided through SIDBI Stand-Up Connect portal."
  },
  {
    file: 'rag-dalit-bandhu.txt',
    content: "TELANGANA DALIT BANDHU SCHEME DIRECT GRANT GUIDELINES\n\n1. Financial Assistance: 100% direct government grant of Rs. 10,00,000 per SC beneficiary family.\n2. Loan & Repayment: Zero bank loan linkage. No interest and no monthly EMI repayment.\n3. Eligibility: Native SC residents of Telangana state with Tahsildar verified Community Certificate."
  },
  {
    file: 'rag-pm-vishwakarma.txt',
    content: "PM VISHWAKARMA SCHEME FOR TRADITIONAL ARTISANS AND CRAFTSPEOPLE\n\n1. Target Trades: 18 traditional family trades including Carpenters, Blacksmiths, Sculptors, Potters, Cobblers, Tailors, Weavers.\n2. Financial Support: Rs. 15,000 tool kit incentive voucher + collateral-free enterprise loans up to Rs. 1 Lakh (Tranche 1) and Rs. 2 Lakhs (Tranche 2) at subsidized 5% interest rate."
  }
];

ragDocs.forEach(d => {
  fs.writeFileSync(path.join(dirs[2], d.file), d.content);
});

console.log("✅ Successfully generated all sample demo files and RAG knowledge datasets!");
