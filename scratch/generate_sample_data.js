const fs = require('fs');
const path = require('path');

const sampleSchemes = [
  {
    id: "SCHEME-001",
    name: "Pradhan Mantri Mudra Yojana (PMMY) - Kishore",
    category: "Micro Enterprise Loan",
    level: "Central",
    state: "Pan-India",
    minAge: 18,
    maxAge: 65,
    minIncome: 0,
    maxIncome: 800000,
    minLoan: 50000,
    maxLoan: 500000,
    interestRate: 7.5,
    tenureMonths: 60,
    moratoriumMonths: 6,
    projectTypes: ["manufacturing", "services", "trading", "retail", "food processing"],
    education: ["8th pass", "10th pass", "12th pass", "graduate", "any"],
    department: "Ministry of Finance",
    benefits: "Collateral-free business expansion loans from ₹50,000 to ₹5,00,000 at subsidized interest rates.",
    summary: "Financial support for growing micro enterprise business units without requiring security or collateral."
  },
  {
    id: "SCHEME-002",
    name: "Prime Minister Employment Generation Programme (PMEGP)",
    category: "Self Employment Subsidy",
    level: "Central",
    state: "Pan-India",
    minAge: 18,
    maxAge: 60,
    minIncome: 0,
    maxIncome: 500000,
    minLoan: 100000,
    maxLoan: 5000000,
    interestRate: 8.0,
    tenureMonths: 84,
    moratoriumMonths: 6,
    projectTypes: ["manufacturing", "services", "cottage industry", "handicrafts"],
    education: ["8th pass", "10th pass", "12th pass", "graduate", "diploma"],
    department: "Ministry of MSME",
    benefits: "Government credit-linked capital subsidy up to 35% on manufacturing & service project costs.",
    summary: "Credit-linked capital subsidy for setting up new micro-enterprises in rural and urban areas."
  },
  {
    id: "SCHEME-003",
    name: "PM SVANidhi (Street Vendor Special Micro-Credit)",
    category: "Urban Livelihood",
    level: "Central",
    state: "Pan-India",
    minAge: 18,
    maxAge: 70,
    minIncome: 0,
    maxIncome: 250000,
    minLoan: 10000,
    maxLoan: 50000,
    interestRate: 7.0,
    tenureMonths: 12,
    moratoriumMonths: 0,
    projectTypes: ["street vending", "retail", "services", "hawkers"],
    education: ["any"],
    department: "Ministry of Housing and Urban Affairs",
    benefits: "Affordable working capital collateral-free micro-credit starting at ₹10,000 with 7% interest subsidy.",
    summary: "Working capital loan for urban and peri-urban street vendors to resume livelihoods."
  },
  {
    id: "SCHEME-004",
    name: "Stand-Up India Scheme",
    category: "SC/ST & Women Entrepreneurship",
    level: "Central",
    state: "Pan-India",
    minAge: 18,
    maxAge: 65,
    minIncome: 0,
    maxIncome: 2500000,
    minLoan: 1000000,
    maxLoan: 10000000,
    interestRate: 8.25,
    tenureMonths: 84,
    moratoriumMonths: 18,
    projectTypes: ["manufacturing", "services", "trading", "agriculture allied"],
    education: ["10th pass", "12th pass", "graduate", "diploma", "any"],
    department: "Department of Financial Services",
    benefits: "Bank loans between ₹10 Lakhs and ₹1 Crore for at least one SC/ST and one woman borrower per bank branch.",
    summary: "Facilitates greenfield enterprise loans for women and SC/ST entrepreneurs."
  },
  {
    id: "SCHEME-005",
    name: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
    category: "Agriculture & Farmers",
    level: "Central",
    state: "Pan-India",
    minAge: 18,
    maxAge: 75,
    minIncome: 0,
    maxIncome: 300000,
    minLoan: 0,
    maxLoan: 6000,
    interestRate: 0.0,
    tenureMonths: 12,
    moratoriumMonths: 0,
    projectTypes: ["agriculture", "farming", "dairy", "poultry", "agriculture allied"],
    education: ["any"],
    department: "Ministry of Agriculture and Farmers Welfare",
    benefits: "Direct income support of ₹6,000 annually via 3 equal installments into Aadhaar-seeded accounts.",
    summary: "Central DBT welfare providing basic income support to all landholding farmer families."
  },
  {
    id: "SCHEME-006",
    name: "Ayushman Bharat PM-JAY",
    category: "Healthcare Insurance",
    level: "Central",
    state: "Pan-India",
    minAge: 0,
    maxAge: 100,
    minIncome: 0,
    maxIncome: 250000,
    minLoan: 0,
    maxLoan: 500000,
    interestRate: 0.0,
    tenureMonths: 12,
    moratoriumMonths: 0,
    projectTypes: ["healthcare", "all"],
    education: ["any"],
    department: "National Health Authority",
    benefits: "Cashless secondary and tertiary healthcare coverage up to ₹5 Lakhs per family per year.",
    summary: "Universal public health assurance scheme for vulnerable and low-income families."
  },
  {
    id: "SCHEME-007",
    name: "PM Vishwakarma Scheme",
    category: "Artisans & Craftsmen",
    level: "Central",
    state: "Pan-India",
    minAge: 18,
    maxAge: 65,
    minIncome: 0,
    maxIncome: 350000,
    minLoan: 100000,
    maxLoan: 300000,
    interestRate: 5.0,
    tenureMonths: 36,
    moratoriumMonths: 3,
    projectTypes: ["handicrafts", "artisan", "carpentry", "blacksmith", "sculpture", "services"],
    education: ["any"],
    department: "Ministry of MSME",
    benefits: "Skill training stipend of ₹500/day, ₹15,000 toolkit grant, and 5% subsidized collateral-free enterprise credit.",
    summary: "Holistic institutional support, modern toolkits, and low-cost credit for traditional craftspeople."
  },
  {
    id: "SCHEME-008",
    name: "Telangana Dalit Bandhu Scheme",
    category: "State Empowerment Grant",
    level: "State",
    state: "Telangana",
    minAge: 18,
    maxAge: 60,
    minIncome: 0,
    maxIncome: 500000,
    minLoan: 0,
    maxLoan: 1000000,
    interestRate: 0.0,
    tenureMonths: 0,
    moratoriumMonths: 0,
    projectTypes: ["manufacturing", "services", "transport", "trading", "retail"],
    education: ["any"],
    department: "Government of Telangana",
    benefits: "Direct financial grant of ₹10 Lakhs per eligible SC family to establish self-chosen sustainable businesses.",
    summary: "State flagship grant program empowering Scheduled Caste families with 100% direct subsidy."
  }
];

const samplePartners = [
  {
    id: "partner-001",
    name: "State Bank of India (Lead District Branch)",
    type: "Lead Public Sector Bank",
    state: "Telangana",
    district: "Hyderabad",
    city: "Hyderabad",
    address: "Gunfoundry, Abids, Koti, Hyderabad, Telangana",
    pincode: "500001",
    latitude: 17.385044,
    longitude: 78.486671,
    contactPerson: "Rajesh Varma (Nodal Credit Officer)",
    phone: "+91 94401 22334",
    email: "sbi.lead.hyd@sbi.co.in",
    services: ["PMMY Mudra Processing", "PMEGP Nodal Cell", "Kisan Credit Card (KCC)", "Stand-Up India Nodal Desk"]
  },
  {
    id: "partner-002",
    name: "Canara Bank MSME Sulabh Kendra",
    type: "Public Sector Commercial Bank",
    state: "Tamil Nadu",
    district: "Chennai",
    city: "Chennai",
    address: "Mount Road, Anna Salai, Chennai, Tamil Nadu",
    pincode: "600002",
    latitude: 13.082680,
    longitude: 80.270718,
    contactPerson: "K. Subramanian (Chief Manager - SME)",
    phone: "+91 98410 55432",
    email: "msme.chennai@canarabank.com",
    services: ["Mudra Kishore Loans", "PMEGP Margin Subsidy", "Credit Guarantee Fund", "PM Vishwakarma Verifier"]
  },
  {
    id: "partner-003",
    name: "CSC Digital Seva Kendra (VLE Center #409)",
    type: "Common Service Centre (CSC)",
    state: "Karnataka",
    district: "Bengaluru Urban",
    city: "Bengaluru",
    address: "Shop 12, Main Road, Jayanagar 4th Block, Bengaluru, Karnataka",
    pincode: "560011",
    latitude: 12.925007,
    longitude: 77.593803,
    contactPerson: "Anil Murthy (VLE Certified Operator)",
    phone: "+91 98860 99887",
    email: "csc.jayanagar@cscseva.gov.in",
    services: ["PM-KISAN eKYC", "Ayushman Bharat Golden Card", "PM SVANidhi Online Application", "Aadhaar Seeding"]
  },
  {
    id: "partner-004",
    name: "Bank of Baroda Agri & SME Hub",
    type: "Public Sector Commercial Bank",
    state: "Maharashtra",
    district: "Pune",
    city: "Pune",
    address: "Shivajinagar, FC Road, Pune, Maharashtra",
    pincode: "411005",
    latitude: 18.531400,
    longitude: 73.844600,
    contactPerson: "Sneha Deshmukh (Agri Credit Manager)",
    phone: "+91 97650 11223",
    email: "agri.pune@bankofbaroda.com",
    services: ["PMMY Shishu & Kishore", "PM Fasal Bima Enrollment", "PMEGP Project Sanction"]
  }
];

const sampleUsers = [
  {
    id: "USER-001",
    name: "Ramesh Kumar",
    age: 32,
    gender: "Male",
    category: "SC",
    annualIncome: 240000,
    education: "10th pass",
    occupation: "Small Business Owner",
    businessType: "Manufacturing",
    projectCost: 350000,
    loanRequirement: 250000,
    state: "Telangana",
    district: "Hyderabad",
    bplStatus: "Yes"
  },
  {
    id: "USER-002",
    name: "Lakshmi Devi",
    age: 28,
    gender: "Female",
    category: "OBC",
    annualIncome: 180000,
    education: "12th pass",
    occupation: "Artisan",
    businessType: "Handicrafts & Textiles",
    projectCost: 150000,
    loanRequirement: 100000,
    state: "Tamil Nadu",
    district: "Chennai",
    bplStatus: "Yes"
  },
  {
    id: "USER-003",
    name: "Manpreet Singh",
    age: 45,
    gender: "Male",
    category: "General",
    annualIncome: 320000,
    education: "Graduate",
    occupation: "Farmer",
    businessType: "Agriculture Allied / Dairy",
    projectCost: 500000,
    loanRequirement: 400000,
    state: "Punjab",
    district: "Ludhiana",
    bplStatus: "No"
  },
  {
    id: "USER-004",
    name: "Pooja Sharma",
    age: 24,
    gender: "Female",
    category: "General",
    annualIncome: 90000,
    education: "Graduate",
    occupation: "Street Vendor / Retail",
    businessType: "Retail / Food Stalls",
    projectCost: 25000,
    loanRequirement: 20000,
    state: "Delhi",
    district: "New Delhi",
    bplStatus: "Yes"
  },
  {
    id: "USER-005",
    name: "Devappa Naik",
    age: 52,
    gender: "Male",
    category: "ST",
    annualIncome: 140000,
    education: "8th pass",
    occupation: "Traditional Artisan / Blacksmith",
    businessType: "Metal Crafts & Tooling",
    projectCost: 200000,
    loanRequirement: 150000,
    state: "Karnataka",
    district: "Bengaluru Urban",
    bplStatus: "Yes"
  }
];

function toCSV(arrayOfObjects) {
  if (!arrayOfObjects || arrayOfObjects.length === 0) return '';
  const keys = Object.keys(arrayOfObjects[0]);
  const header = keys.join(',');
  const rows = arrayOfObjects.map(obj => {
    return keys.map(k => {
      let val = obj[k];
      if (Array.isArray(val)) val = val.join(';');
      if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val !== undefined && val !== null ? val : '';
    }).join(',');
  });
  return [header, ...rows].join('\n');
}

const sampleReadme = `# SchemeSetu Local Dataset & Sample Upload Files

This directory contains standardized sample datasets for evaluating the **SchemeSetu** offline prototype, recommendation algorithms, and Data Hub import tools.

## Included Files

| File | Format | Records | Description |
|---|---|---|---|
| \`sample-schemes.json\` | JSON | 8 Schemes | Central and State Government scheme profiles with loan limits, subsidies, and rules. |
| \`sample-schemes.csv\` | CSV | 8 Schemes | Tabular CSV equivalent of government schemes with semicolon-delimited lists. |
| \`sample-users.json\` | JSON | 5 Profiles | Citizen demographic profiles (diverse categories, incomes, occupations, and locations). |
| \`sample-users.csv\` | CSV | 5 Profiles | Tabular CSV test user records for batch eligibility verification. |

## Required Schema & Field Definitions

### 1. Scheme Records (\`schemes.json\` / \`schemes.csv\`)
- \`id\` (string, required): Unique identifier (e.g., \`"SCHEME-001"\`)
- \`name\` (string, required): Full scheme title
- \`category\` (string, required): Category classification (e.g., \`"Micro Enterprise Loan"\`)
- \`level\` (string): \`"Central"\` or \`"State"\`
- \`state\` (string): State name or \`"Pan-India"\`
- \`minAge\` / \`maxAge\` (number): Age eligibility range (e.g., \`18\` to \`65\`)
- \`minIncome\` / \`maxIncome\` (number): Annual income ceiling in INR
- \`minLoan\` / \`maxLoan\` (number): Credit range or assistance amount
- \`interestRate\` (number): Annualized interest percentage (e.g., \`7.5\`)
- \`projectTypes\` (array or semicolon-separated string): Applicable enterprise sectors
- \`education\` (array or semicolon-separated string): Minimum educational qualifications
- \`department\` (string): Nodal ministry or department
- \`benefits\` (string): Financial benefit summary

### 2. User Profiles (\`users.json\` / \`users.csv\`)
- \`id\` (string): Unique user reference (e.g., \`"USER-001"\`)
- \`name\` (string): Beneficiary persona name
- \`age\` (number): Age in years (18-100)
- \`gender\` (string): \`"Male"\`, \`"Female"\`, \`"Transgender"\`
- \`category\` (string): \`"General"\`, \`"OBC"\`, \`"SC"\`, \`"ST"\`
- \`annualIncome\` (number): Annual family income in INR (0 to 1,00,00,000)
- \`occupation\` (string): Vocation / occupation
- \`projectCost\` (number): Proposed project or business capital requirement
- \`state\` / \`district\` (string): Location coordinates

## How to Test the Upload Functionality

1. Open the SchemeSetu portal and navigate to the **Data Hub / Upload Data** section (accessible via Admin Portal or Settings).
2. Click **"Choose File"** and select either \`sample-schemes.json\`, \`sample-schemes.csv\`, \`sample-users.json\`, or \`sample-users.csv\`.
3. The system will parse the file locally, perform schema validation, display record counts, and show a live table preview.
4. Click **"Import Records into Prototype"** to immediately merge the data into the active session without requiring internet connectivity.
`;

// Write Seeders
fs.writeFileSync('/home/user/Github/SchemeSetu/database/seeders/data/schemes.json', JSON.stringify(sampleSchemes, null, 2));
fs.writeFileSync('/home/user/Github/SchemeSetu/database/seeders/data/partners.json', JSON.stringify(samplePartners, null, 2));

// Write Sample Data
fs.writeFileSync('/home/user/Github/SchemeSetu/database/sample-data/sample-schemes.json', JSON.stringify(sampleSchemes, null, 2));
fs.writeFileSync('/home/user/Github/SchemeSetu/database/sample-data/sample-schemes.csv', toCSV(sampleSchemes));
fs.writeFileSync('/home/user/Github/SchemeSetu/database/sample-data/sample-users.json', JSON.stringify(sampleUsers, null, 2));
fs.writeFileSync('/home/user/Github/SchemeSetu/database/sample-data/sample-users.csv', toCSV(sampleUsers));
fs.writeFileSync('/home/user/Github/SchemeSetu/database/sample-data/README.md', sampleReadme);

console.log('✅ Successfully generated all seed and sample data files in database/seeders/data and database/sample-data!');
