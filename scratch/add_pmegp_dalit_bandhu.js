const fs = require('fs');

const backendPath = '/home/user/Github/SchemeSetu/backend/src/data/schemesData.js';
const frontendPath = '/home/user/Github/SchemeSetu/frontend/src/data/mock/schemes.js';

const schemesData = require(backendPath);

const extraSchemes = [
  {
    id: "pmegp",
    name: "Prime Minister's Employment Generation Programme (PMEGP)",
    shortName: "PMEGP",
    department: "Ministry of Micro, Small and Medium Enterprises (MSME)",
    level: "Central",
    state: "Pan-India",
    category: "Micro Enterprise Loan",
    beneficiary: "Unemployed Youth, SC/ST, Women Entrepreneurs",
    minAge: 18,
    maxAge: 65,
    maxIncome: 1000000,
    gender: "All",
    occupation: "Business",
    sector: "MSME",
    summary: "Credit-linked subsidy programme offering up to 35% special margin subsidy for SC/ST and rural micro-enterprises with bank loans up to ₹50 Lakhs.",
    benefits: "Bank-financed project loans up to ₹50 Lakh (Manufacturing) / ₹20 Lakh (Services) with 25% to 35% non-repayable government margin money subsidy.",
    detailedBenefits: [
      "Government subsidy of 35% for Special Category beneficiaries (SC / ST / OBC / Minorities / Women / Ex-servicemen / PwD) in rural areas.",
      "Maximum project cost admissible: ₹50 Lakhs for manufacturing units and ₹20 Lakhs for service sector enterprises.",
      "Beneficiary contribution only 5% for SC/ST/Special categories (10% for General)."
    ],
    eligibilityCriteria: [
      "Any individual above 18 years of age with at least 8th pass qualification for manufacturing projects above ₹10 Lakhs.",
      "Self Help Groups (SHGs) and institutions registered under Societies Registration Act.",
      "Only new projects are eligible under PMEGP (no existing unit refinancing)."
    ],
    documentsRequired: [
      "Aadhaar Card & PAN Card",
      "Caste / Community Certificate (for SC/ST/OBC category subsidy)",
      "Detailed Project Report (DPR) / Machinery Quotation",
      "Educational Qualification Certificate (8th / 10th pass)",
      "Rural Area Certificate / Address Proof"
    ],
    applicationProcess: [
      "Apply online on KVIC PMEGP e-Portal (www.kviconline.gov.in).",
      "Submit personal details, category proof, and upload DPR.",
      "Application is forwarded by District Task Force Committee (DTFC) to financing bank.",
      "Bank sanctions and disburses loan; subsidy credited after 10-day EDP training."
    ],
    officialUrl: "https://www.kviconline.gov.in/pmegpeportal",
    faqs: [
      {
        question: "What is the subsidy rate for SC candidates in rural areas?",
        answer: "Special category beneficiaries including SC/ST in rural areas receive 35% margin money subsidy."
      }
    ],
    tags: ["pmegp", "subsidy", "sc st", "business loan", "manufacturing", "msme"],
    minLoan: 100000,
    maxLoan: 5000000,
    maxProjectCost: 5000000,
    interestRate: 9.0,
    tenureMonths: 84,
    moratoriumMonths: 6
  },
  {
    id: "dalit-bandhu",
    name: "Telangana Dalit Bandhu Scheme",
    shortName: "Dalit Bandhu",
    department: "Scheduled Castes Development Department, Government of Telangana",
    level: "State",
    state: "Telangana",
    category: "Welfare & Entrepreneurship Grant",
    beneficiary: "Scheduled Caste (SC) Families",
    minAge: 18,
    maxAge: 65,
    maxIncome: 500000,
    gender: "All",
    occupation: "Any",
    sector: "SC Welfare",
    summary: "One-time direct financial grant of ₹10 Lakh per Dalit family with 100% non-repayable grant to establish self-employment enterprises.",
    benefits: "Direct financial assistance of ₹10,00,000 deposited in bank account without any bank loan link or repayment obligation.",
    detailedBenefits: [
      "100% direct grant of ₹10,00,000 per beneficiary family without bank collateral or EMIs.",
      "Complete freedom to choose enterprise sector (transport, manufacturing, retail, agriculture services).",
      "Protection fund (Dalit Rakshana Nidhi) contribution to support families during unforeseen distress."
    ],
    eligibilityCriteria: [
      "Applicant family must belong to Scheduled Caste (SC) community.",
      "Must be a permanent resident of Telangana state holding valid SC Community Certificate.",
      "Family should not have regular government employee."
    ],
    documentsRequired: [
      "Aadhaar Card",
      "Scheduled Caste Community Certificate issued by Tahsildar",
      "Food Security Card / Ration Card",
      "Bank Account Details (Dalit Bandhu specific savings account)"
    ],
    applicationProcess: [
      "Beneficiary selection conducted via Gram Sabha / Ward level verification.",
      "Submit application and enterprise choice to District Collector / SC Corporation.",
      "Approval and direct transfer of ₹10,00,000 into beneficiary Dalit Bandhu account."
    ],
    officialUrl: "https://dalitbandhu.telangana.gov.in",
    faqs: [
      {
        question: "Is there any loan repayment required under Dalit Bandhu?",
        answer: "No, Dalit Bandhu is a 100% direct government grant with zero loan or interest repayment."
      }
    ],
    tags: ["dalit bandhu", "sc welfare", "grant", "telangana", "entrepreneurship"],
    minLoan: 1000000,
    maxLoan: 1000000,
    maxProjectCost: 1000000,
    interestRate: 0.0,
    tenureMonths: 0,
    moratoriumMonths: 0
  }
];

extraSchemes.forEach(extra => {
  if (!schemesData.find(s => s.id === extra.id)) {
    schemesData.push(extra);
  }
});

fs.writeFileSync(backendPath, `const schemesData = ${JSON.stringify(schemesData, null, 2)};\n\nmodule.exports = schemesData;\n`, 'utf8');
fs.writeFileSync(frontendPath, `export const mockSchemes = ${JSON.stringify(schemesData, null, 2)};\nexport const MOCK_SCHEMES = mockSchemes;\nexport default mockSchemes;\n`, 'utf8');

console.log(`✅ Added PMEGP and Dalit Bandhu schemes! Total schemes: ${schemesData.length}`);
