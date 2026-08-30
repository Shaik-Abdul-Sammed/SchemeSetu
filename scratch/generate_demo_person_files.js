const fs = require('fs');
const path = require('path');

const scProfile = {
  id: "DEMO-SC-001",
  name: "Ramesh Kumar (Demo SC Entrepreneur)",
  age: 32,
  gender: "Male",
  category: "SC",
  casteCategory: "SC",
  state: "Telangana",
  district: "Hyderabad",
  villageTown: "Secunderabad",
  education: "10th pass",
  employmentStatus: "Self-Employed",
  occupation: "Small Business Owner",
  businessType: "Manufacturing",
  businessExperience: 4,
  annualIncome: 240000,
  existingBusinessIncome: 180000,
  projectCost: 350000,
  loanRequirement: 250000,
  numEmployees: 2,
  disabilityStatus: "No",
  entrepreneurType: "Existing Micro Enterprise",
  bankRequirement: "Working Capital & Machinery Term Loan",
  bplStatus: "Yes",
  landOwner: "No",
  maritalStatus: "Married"
};

const multipleProfiles = [
  scProfile,
  {
    id: "DEMO-WOMAN-002",
    name: "Lakshmi Devi (Demo Woman Entrepreneur)",
    age: 28,
    gender: "Female",
    category: "OBC",
    casteCategory: "OBC",
    state: "Tamil Nadu",
    district: "Chennai",
    villageTown: "Ambattur",
    education: "12th pass",
    employmentStatus: "Artisan",
    occupation: "Artisan",
    businessType: "Handicrafts & Textiles",
    businessExperience: 3,
    annualIncome: 180000,
    existingBusinessIncome: 120000,
    projectCost: 150000,
    loanRequirement: 100000,
    numEmployees: 1,
    disabilityStatus: "No",
    entrepreneurType: "New Enterprise",
    bankRequirement: "Working Capital Subsidy",
    bplStatus: "Yes",
    landOwner: "No",
    maritalStatus: "Married"
  },
  {
    id: "DEMO-FARMER-003",
    name: "Manpreet Singh (Demo Farmer)",
    age: 45,
    gender: "Male",
    category: "General",
    casteCategory: "General",
    state: "Punjab",
    district: "Ludhiana",
    villageTown: "Samrala",
    education: "Graduate",
    employmentStatus: "Farmer",
    occupation: "Farmer",
    businessType: "Agriculture Allied / Dairy",
    businessExperience: 15,
    annualIncome: 320000,
    existingBusinessIncome: 280000,
    projectCost: 500000,
    loanRequirement: 400000,
    numEmployees: 3,
    disabilityStatus: "No",
    entrepreneurType: "Agri-Expansion",
    bankRequirement: "Kisan Credit & Farm Machinery",
    bplStatus: "No",
    landOwner: "Yes",
    maritalStatus: "Married"
  },
  {
    id: "DEMO-VENDOR-004",
    name: "Pooja Sharma (Demo Street Vendor)",
    age: 24,
    gender: "Female",
    category: "General",
    casteCategory: "General",
    state: "Delhi",
    district: "New Delhi",
    villageTown: "Karol Bagh",
    education: "Graduate",
    employmentStatus: "Street Hawker",
    occupation: "Street Vendor / Retail",
    businessType: "Retail / Food Stalls",
    businessExperience: 2,
    annualIncome: 90000,
    existingBusinessIncome: 90000,
    projectCost: 25000,
    loanRequirement: 20000,
    numEmployees: 0,
    disabilityStatus: "No",
    entrepreneurType: "Micro Vendor",
    bankRequirement: "PM SVANidhi Micro Credit",
    bplStatus: "Yes",
    landOwner: "No",
    maritalStatus: "Single"
  },
  {
    id: "DEMO-TRIBAL-005",
    name: "Devappa Naik (Demo ST Artisan)",
    age: 52,
    gender: "Male",
    category: "ST",
    casteCategory: "ST",
    state: "Karnataka",
    district: "Bengaluru Urban",
    villageTown: "Anekal",
    education: "8th pass",
    employmentStatus: "Traditional Craftsman",
    occupation: "Traditional Artisan / Blacksmith",
    businessType: "Metal Crafts & Tooling",
    businessExperience: 25,
    annualIncome: 140000,
    existingBusinessIncome: 110000,
    projectCost: 200000,
    loanRequirement: 150000,
    numEmployees: 2,
    disabilityStatus: "No",
    entrepreneurType: "Traditional Artisan",
    bankRequirement: "PM Vishwakarma Toolkit & Loan",
    bplStatus: "Yes",
    landOwner: "No",
    maritalStatus: "Married"
  },
  {
    id: "DEMO-SC-GROWTH-006",
    name: "Suresh Chandra (Demo SC Greenfield Entrepreneur)",
    age: 38,
    gender: "Male",
    category: "SC",
    casteCategory: "SC",
    state: "Maharashtra",
    district: "Pune",
    villageTown: "Pimpri-Chinchwad",
    education: "Graduate",
    employmentStatus: "Entrepreneur",
    occupation: "Manufacturing & Services",
    businessType: "Precision Auto Components",
    businessExperience: 8,
    annualIncome: 650000,
    existingBusinessIncome: 500000,
    projectCost: 2500000,
    loanRequirement: 2000000,
    numEmployees: 6,
    disabilityStatus: "No",
    entrepreneurType: "Greenfield Enterprise",
    bankRequirement: "Stand-Up India Term Loan",
    bplStatus: "No",
    landOwner: "No",
    maritalStatus: "Married"
  }
];

function toCSV(arrayOfObjects) {
  if (!arrayOfObjects || arrayOfObjects.length === 0) return '';
  const keys = Object.keys(arrayOfObjects[0]);
  const header = keys.join(',');
  const rows = arrayOfObjects.map(obj => {
    return keys.map(k => {
      let val = obj[k];
      if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val !== undefined && val !== null ? val : '';
    }).join(',');
  });
  return [header, ...rows].join('\n');
}

const readmeContent = `# SchemeSetu — Demo Person Dataset (SIH Demonstration)

This directory contains standardized, realistic, fictional demographic profiles for testing and demonstrating **SchemeSetu's AI-style local scheme recommendation engine**, data-driven financial limit checks, and media upload features.

## Files Included

| File | Format | Description |
|---|---|---|
| \`demo-person-sc-profile.json\` | JSON | Single complete fictional Scheduled Caste (SC) micro-entrepreneur profile (\`Ramesh Kumar\`, Project Cost ₹3,50,000, Loan ₹2,50,000). |
| \`demo-person-sc-profile.csv\` | CSV | Tabular CSV version of the SC entrepreneur profile. |
| \`demo-person-multiple-profiles.json\` | JSON | 6 diverse profiles covering SC, ST, OBC, Women, Farmers, and Street Vendors across different income tiers. |
| \`demo-person-multiple-profiles.csv\` | CSV | Tabular CSV version containing all 6 diverse evaluation records. |

## Profile Attributes & Schema

- \`id\`: Unique identifier (e.g. \`"DEMO-SC-001"\`)
- \`name\`: Beneficiary persona name
- \`age\`: Age in years (18 to 100)
- \`gender\`: \`"Male"\`, \`"Female"\`, or \`"Transgender"\`
- \`category\` / \`casteCategory\`: Social group (\`"SC"\`, \`"ST"\`, \`"OBC"\`, \`"General"\`)
- \`state\` / \`district\` / \`villageTown\`: Location coordinates
- \`education\`: Educational qualification (\`"8th pass"\`, \`"10th pass"\`, \`"12th pass"\`, \`"Graduate"\`)
- \`occupation\` & \`businessType\`: Enterprise vocation (e.g. \`"Manufacturing"\`, \`"Handicrafts"\`, \`"Dairy"\`)
- \`annualIncome\` / \`existingBusinessIncome\`: Annual earnings in ₹ (0 to 1,00,00,000)
- \`projectCost\`: Total proposed enterprise capital requirement
- \`loanRequirement\`: Requested bank credit / subsidy assistance
- \`numEmployees\`: Headcount of workers
- \`disabilityStatus\`: PwD declaration (\`"Yes"\` / \`"No"\`)
- \`bplStatus\`: Below Poverty Line card status (\`"Yes"\` / \`"No"\`)

## Upload & Demonstration Workflow

1. In SchemeSetu, open **Data Hub** or **Eligibility Recommendation Wizard**.
2. Upload either \`demo-person-sc-profile.json\` or \`demo-person-sc-profile.csv\`.
3. The platform validates all financial and demographic constraints locally in your browser.
4. Click **"Confirm & Recommend Schemes"** to run data-driven matching against central & state schemes (e.g. Mudra Kishore, PMEGP SC subsidy, Stand-Up India, Dalit Bandhu).
`;

const baseDir = '/home/user/Github/SchemeSetu/database/sample-data/demo-person';
const downloadsDir = '/home/user/Downloads/Sampledata/demo-person';

[baseDir, downloadsDir].forEach(dir => {
  fs.writeFileSync(path.join(dir, 'demo-person-sc-profile.json'), JSON.stringify(scProfile, null, 2));
  fs.writeFileSync(path.join(dir, 'demo-person-sc-profile.csv'), toCSV([scProfile]));
  fs.writeFileSync(path.join(dir, 'demo-person-multiple-profiles.json'), JSON.stringify(multipleProfiles, null, 2));
  fs.writeFileSync(path.join(dir, 'demo-person-multiple-profiles.csv'), toCSV(multipleProfiles));
  fs.writeFileSync(path.join(dir, 'README.md'), readmeContent);
});

console.log('✅ Successfully created demo-person files in database and Downloads/Sampledata/demo-person!');
