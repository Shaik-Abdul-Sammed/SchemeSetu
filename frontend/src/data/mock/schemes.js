/**
 * SchemeSetu Centralized Mock Dataset - Government Schemes
 * Prototype / Demo Dataset for SIH 2026
 */

export const MOCK_SCHEMES = [
  {
    id: 'scheme-001',
    name: 'Pradhan Mantri Mudra Yojana (PMMY) - Tarun',
    category: 'Micro/Small Enterprise Loan',
    level: 'Central',
    projectTypes: ['manufacturing', 'services', 'trading', 'food processing', 'retail', 'agri-allied'],
    department: 'Ministry of Finance / SIDBI',
    interestRate: 8.5,
    minLoan: 500000,
    maxLoan: 1000000,
    tenure: '60 months',
    tenureMonths: 60,
    moratorium: '6 months',
    moratoriumMonths: 6,
    beneficiary: 'Growing Micro & Small Entrepreneurs',
    minAge: 18,
    maxAge: 65,
    maxIncome: 1000000,
    summary: 'Funding for established small businesses aiming for growth and expansion from ₹5 Lakhs up to ₹10 Lakhs without collateral requirement.',
    description: 'Pradhan Mantri Mudra Yojana (PMMY) Tarun category provides credit support from ₹5,00,000 to ₹10,00,000 to growing enterprise units in manufacturing, trading, and services without requiring third-party collateral.',
    benefits: 'Up to ₹10 Lakh collateral-free loan with competitive 8.5% interest rate and 6-month repayment moratorium.',
    detailedBenefits: [
      'Zero collateral or third-party guarantee required.',
      'Flexible 60-month repayment tenure with 6-month initial moratorium.',
      'Working capital overdraft facility via MUDRA Card.',
      'Special concessional interest rates for SC/ST and women entrepreneurs.'
    ],
    eligibility: {
      minIncome: 0,
      maxIncome: 1000000,
      minAge: 18,
      maxAge: 65,
      education: ['10th pass', '12th pass', 'graduate', 'post graduate', 'diploma', 'any'],
      locations: ['All India', 'Tamil Nadu', 'Andhra Pradesh', 'Telangana', 'Karnataka', 'Maharashtra', 'Delhi', 'Gujarat']
    },
    eligibilityCriteria: [
      'Applicant must be an Indian citizen aged between 18 and 65 years.',
      'Existing business track record or viable new business proposal.',
      'Applicant must not be a defaulter with any commercial bank or NBFC.',
      'Annual household income up to ₹10,00,000.'
    ],
    documentsRequired: [
      'Aadhaar Card / Voter ID (Identity Proof)',
      'Proof of Business Address & Registration',
      'Bank Account Statement for the last 6 months',
      'Quotation for Machinery / Equipment (if applicable)',
      'Caste Certificate for SC/ST category benefits'
    ],
    applicationProcess: [
      'Step 1: Formulate project report with cost estimation.',
      'Step 2: Approach nearest empanelled public/private sector bank or apply via SchemeSetu.',
      'Step 3: Submit application with identity proof and business quotation.',
      'Step 4: Loan appraisal and sanctioned disbursement within 7 to 10 days.'
    ],
    faqs: [
      {
        question: 'Is collateral required for Tarun loans?',
        answer: 'No collateral or third-party security is required under the MUDRA scheme up to ₹10 Lakhs.'
      },
      {
        question: 'Can new entrepreneurs apply for Tarun?',
        answer: 'Yes, both new and existing entrepreneurs with viable project reports can apply.'
      }
    ],
    officialUrl: 'https://www.mudra.org.in'
  },
  {
    id: 'scheme-002',
    name: 'Pradhan Mantri Mudra Yojana (PMMY) - Kishore',
    category: 'Micro Enterprise Loan',
    level: 'Central',
    projectTypes: ['manufacturing', 'services', 'trading', 'food processing', 'handicrafts', 'textiles', 'retail'],
    department: 'Ministry of Finance / National Credit Guarantee Trustee Company',
    interestRate: 7.5,
    minLoan: 50000,
    maxLoan: 500000,
    tenure: '60 months',
    tenureMonths: 60,
    moratorium: '6 months',
    moratoriumMonths: 6,
    beneficiary: 'Micro Entrepreneurs & Small Shop Owners',
    minAge: 18,
    maxAge: 65,
    maxIncome: 600000,
    summary: 'Provides financial support from ₹50,000 up to ₹5 Lakhs for developing and growing micro enterprise units.',
    description: 'MUDRA Kishore category caters to micro-entrepreneurs who have established operations and require seed/expansion capital between ₹50,000 and ₹5,00,000 for equipment purchase, stock inventory, or working capital.',
    benefits: 'Collateral-free loan up to ₹5 Lakhs with 7.5% subsidized rate, 6-month moratorium, and Mudra Debit Card.',
    detailedBenefits: [
      'No collateral requirement for loans up to ₹5,00,000.',
      'Subsidized annual interest rate of 7.5%.',
      'Pre-approved credit line accessible through MUDRA RuPay Debit Card.',
      'Repayment tenure up to 5 years.'
    ],
    eligibility: {
      minIncome: 0,
      maxIncome: 600000,
      minAge: 18,
      maxAge: 65,
      education: ['8th pass', '10th pass', '12th pass', 'graduate', 'diploma', 'any'],
      locations: ['All India', 'Tamil Nadu', 'Andhra Pradesh', 'Telangana', 'Karnataka', 'Maharashtra', 'Delhi', 'Kerala', 'Uttar Pradesh']
    },
    eligibilityCriteria: [
      'Citizen of India aged 18 years or older.',
      'Proposed enterprise should fall under non-farm micro-business activity.',
      'No prior default record with financial institutions.',
      'Annual household income within eligible ceiling.'
    ],
    documentsRequired: [
      'Aadhaar Card and PAN Card',
      'Proof of Residence & Business Address',
      'Last 6 months Bank Account Statement',
      'Asset Quotation / Proforma Invoice from supplier',
      'Passport size photographs'
    ],
    applicationProcess: [
      'Step 1: Check eligibility and download pre-filled application slip on SchemeSetu.',
      'Step 2: Visit nearest partner bank branch or CSC Kendra.',
      'Step 3: Document verification and KYC confirmation.',
      'Step 4: Direct account disbursement and Mudra Card issuance.'
    ],
    faqs: [
      {
        question: 'What is the processing fee for Kishore loans?',
        answer: 'Most banks charge nil or minimal processing fees for Kishore category loans.'
      }
    ],
    officialUrl: 'https://www.mudra.org.in'
  },
  {
    id: 'scheme-003',
    name: 'Pradhan Mantri Mudra Yojana (PMMY) - Shishu',
    category: 'Micro Enterprise Seed Loan',
    level: 'Central',
    projectTypes: ['retail', 'street vending', 'handicrafts', 'services', 'food processing', 'agri-allied'],
    department: 'Department of Financial Services',
    interestRate: 6.5,
    minLoan: 10000,
    maxLoan: 50000,
    tenure: '36 months',
    tenureMonths: 36,
    moratorium: '3 months',
    moratoriumMonths: 3,
    beneficiary: 'Early-stage Small Entrepreneurs & Artisans',
    minAge: 18,
    maxAge: 65,
    maxIncome: 300000,
    summary: 'Targeted at early-stage small entrepreneurs and street vendors needing startup working capital up to ₹50,000.',
    description: 'MUDRA Shishu covers loans up to ₹50,000 for early-stage micro-business owners, shopkeepers, fruit/vegetable sellers, artisans, and service providers.',
    benefits: 'Lowest 6.5% interest rate, zero processing fee, instant disbursement up to ₹50,000.',
    detailedBenefits: [
      'Zero processing fee and zero collateral.',
      'Simplified one-page loan application process.',
      'Moratorium period of 3 months before EMI starts.',
      'Prompt repayment incentive of 2% interest subvention.'
    ],
    eligibility: {
      minIncome: 0,
      maxIncome: 300000,
      minAge: 18,
      maxAge: 65,
      education: ['none', 'primary', '8th pass', '10th pass', 'any'],
      locations: ['All India', 'Tamil Nadu', 'Andhra Pradesh', 'Karnataka', 'Maharashtra', 'Delhi', 'West Bengal', 'Bihar', 'Rajasthan']
    },
    eligibilityCriteria: [
      'Indian citizen starting or operating a micro business.',
      'Loan requirement within ₹50,000.',
      'Valid identity and address proof.'
    ],
    documentsRequired: [
      'Aadhaar Card / Ration Card',
      'Passport size photograph',
      'Bank Account details (Jan Dhan account eligible)'
    ],
    applicationProcess: [
      'Step 1: Fill basic details on SchemeSetu voice or text wizard.',
      'Step 2: Submit to nearest Bank Mitra / CSC VLE agent.',
      'Step 3: Instant KYC and digital loan sanction.'
    ],
    faqs: [
      {
        question: 'Can Jan Dhan account holders apply?',
        answer: 'Yes, Pradhan Mantri Jan Dhan Yojana (PMJDY) account holders are fully eligible.'
      }
    ],
    officialUrl: 'https://www.mudra.org.in'
  },
  {
    id: 'scheme-004',
    name: 'Prime Minister Employment Generation Programme (PMEGP)',
    category: 'Credit-Linked Subsidy Scheme',
    level: 'Central',
    projectTypes: ['manufacturing', 'services', 'food processing', 'agro-based industry', 'textiles', 'engineering'],
    department: 'Ministry of Micro, Small and Medium Enterprises (MSME) / KVIC',
    interestRate: 9.0,
    minLoan: 100000,
    maxLoan: 5000000,
    tenure: '84 months',
    tenureMonths: 84,
    moratorium: '6 months',
    moratoriumMonths: 6,
    beneficiary: 'Unemployed Youth, SC/ST, Women & Rural Entrepreneurs',
    minAge: 18,
    maxAge: 60,
    maxIncome: 800000,
    summary: 'Credit-linked subsidy program to generate self-employment ventures with 15% to 35% government capital subsidy.',
    description: 'PMEGP is a flagship credit-linked subsidy initiative administered by KVIC offering up to 35% capital subsidy for rural and special category (SC/ST/OBC/Women) entrepreneurs setting up manufacturing (up to ₹50 Lakhs) or service (up to ₹20 Lakhs) enterprises.',
    benefits: '15% to 35% margin money government subsidy credited directly to beneficiary loan account.',
    detailedBenefits: [
      'Subsidies up to 35% for rural projects and SC/ST/Women beneficiaries.',
      'Project loans up to ₹50 Lakhs for manufacturing and ₹20 Lakhs for services.',
      'Only 5% to 10% beneficiary margin contribution required.',
      'Free EDP skill training provided by MSME Development Institutes.'
    ],
    eligibility: {
      minIncome: 0,
      maxIncome: 800000,
      minAge: 18,
      maxAge: 60,
      education: ['8th pass', '10th pass', '12th pass', 'graduate', 'post graduate', 'diploma'],
      locations: ['All India', 'Andhra Pradesh', 'Tamil Nadu', 'Karnataka', 'Maharashtra', 'Madhya Pradesh', 'Odisha', 'Telangana']
    },
    eligibilityCriteria: [
      'Any individual above 18 years of age.',
      'At least VIII standard pass for projects costing above ₹10 Lakhs in manufacturing.',
      'Self Help Groups (SHGs) and registered institutions are also eligible.',
      'Must be a new project unit (expansion of existing units not covered under basic tier).'
    ],
    documentsRequired: [
      'Project Detailed Project Report (DPR)',
      'Aadhaar Card and Caste Certificate (for SC/ST subsidy claiming)',
      'Educational Qualification Certificate (8th / 10th pass proof)',
      'Rural Area Certificate from local authority (for 35% rural subsidy rate)',
      'EDP Training Certificate (if already completed)'
    ],
    applicationProcess: [
      'Step 1: Submit online application on KVIC / SchemeSetu portal.',
      'Step 2: Application vetting by District Task Force Committee (DTFC).',
      'Step 3: Bank branch appraisal and sanction.',
      'Step 4: Margin money subsidy lock-in for 3 years, then adjusted against principal.'
    ],
    faqs: [
      {
        question: 'What is the maximum subsidy amount for SC/ST beneficiaries in rural areas?',
        answer: 'Special category beneficiaries (SC/ST/OBC/Women/PwD) receive 35% subsidy in rural areas and 25% in urban areas.'
      }
    ],
    officialUrl: 'https://www.kviconline.gov.in/pmegpeportal'
  },
  {
    id: 'scheme-005',
    name: 'PM SVANidhi (Street Vendor\'s AtmaNirbhar Nidhi)',
    category: 'Working Capital Microcredit',
    level: 'Central',
    projectTypes: ['street vending', 'food stall', 'retail', 'services', 'food processing', 'handicrafts'],
    department: 'Ministry of Housing and Urban Affairs (MoHUA) / SIDBI',
    interestRate: 7.0,
    minLoan: 10000,
    maxLoan: 50000,
    tenure: '12 months',
    tenureMonths: 12,
    moratorium: '0 months',
    moratoriumMonths: 0,
    beneficiary: 'Urban & Peri-Urban Street Vendors',
    minAge: 18,
    maxAge: 70,
    maxIncome: 250000,
    summary: 'Special micro-credit facility providing affordable collateral-free working capital loans with 7% interest subsidy on digital repayment.',
    description: 'PM SVANidhi provides working capital loans of ₹10,000 (1st tranche), ₹20,000 (2nd tranche), and ₹50,000 (3rd tranche) to street vendors with 7% annual interest subsidy and monthly cashbacks for digital transactions.',
    benefits: 'Collateral-free working capital up to ₹50,000 with 7% interest subsidy and up to ₹1,200 annual digital transaction cashback.',
    detailedBenefits: [
      'Tiered credit growth: ₹10,000 → ₹20,000 → ₹50,000 on timely repayment.',
      '7% annual interest subsidy directly credited via DBT to bank account.',
      'Cashback up to ₹100 per month for UPI/digital payments received.',
      'No collateral or processing fee.'
    ],
    eligibility: {
      minIncome: 0,
      maxIncome: 250000,
      minAge: 18,
      maxAge: 70,
      education: ['none', 'primary', 'any'],
      locations: ['All India', 'Andhra Pradesh', 'Tamil Nadu', 'Karnataka', 'Maharashtra', 'Delhi', 'Gujarat', 'Telangana', 'Uttar Pradesh']
    },
    eligibilityCriteria: [
      'Street vendors possessing Certificate of Vending / Identity Card issued by Urban Local Bodies (ULBs).',
      'Vendors who have been left out in survey but have Letter of Recommendation (LoR).',
      'Vendors operating in surrounding peri-urban or rural areas.'
    ],
    documentsRequired: [
      'Aadhaar Card / Voter Card',
      'Vending Certificate / Identity Card / Letter of Recommendation (LoR)',
      'Bank Account Number (linked to Aadhaar)'
    ],
    applicationProcess: [
      'Step 1: Check mobile number linkage with Aadhaar.',
      'Step 2: Submit loan request via SchemeSetu portal or Urban Local Body / CSC counter.',
      'Step 3: Instant digital loan sanction and direct bank transfer.'
    ],
    faqs: [
      {
        question: 'Is collateral needed for PM SVANidhi?',
        answer: 'No collateral is required for any loan tranche under PM SVANidhi.'
      }
    ],
    officialUrl: 'https://pmsvanidhi.mohua.gov.in'
  },
  {
    id: 'scheme-006',
    name: 'Stand-Up India Scheme for SC/ST & Women',
    category: 'SC/ST & Women Entrepreneurship Loan',
    level: 'Central',
    projectTypes: ['manufacturing', 'services', 'trading', 'food processing', 'agri-business'],
    department: 'Department of Financial Services / SIDBI / NABARD',
    interestRate: 8.0,
    minLoan: 1000000,
    maxLoan: 10000000,
    tenure: '84 months',
    tenureMonths: 84,
    moratorium: '18 months',
    moratoriumMonths: 18,
    beneficiary: 'Scheduled Caste (SC), Scheduled Tribe (ST) & Women Entrepreneurs',
    minAge: 18,
    maxAge: 65,
    maxIncome: 1500000,
    summary: 'Facilitates bank loans between ₹10 Lakhs and ₹1 Crore to SC/ST and women entrepreneurs for greenfield enterprises.',
    description: 'The Stand-Up India scheme facilitates bank loans between ₹10 Lakhs and ₹1 Crore to at least one SC or ST borrower and at least one woman borrower per bank branch for setting up greenfield manufacturing, services, agri-allied, or trading enterprises.',
    benefits: 'Composite loan up to ₹1 Crore with credit guarantee coverage and 18-month moratorium.',
    detailedBenefits: [
      'Bank loans from ₹10 Lakhs to ₹1 Crore covering up to 85% of total project cost.',
      'Generous moratorium period up to 18 months.',
      'Credit Guarantee Scheme for Stand-Up India (CGSUI) provides sovereign loan security.',
      'Handholding support via SIDBI Stand-Up India portal & local Lead District Managers.'
    ],
    eligibility: {
      minIncome: 0,
      maxIncome: 1500000,
      minAge: 18,
      maxAge: 65,
      education: ['10th pass', '12th pass', 'graduate', 'diploma', 'any'],
      locations: ['All India', 'Tamil Nadu', 'Andhra Pradesh', 'Karnataka', 'Maharashtra', 'Delhi', 'Punjab', 'Haryana', 'Telangana']
    },
    eligibilityCriteria: [
      'SC/ST and/or woman entrepreneur above 18 years of age.',
      'Loan applicable for greenfield projects (first-time venture in manufacturing, services, agri-allied or trading).',
      'In non-individual enterprises, at least 51% shareholding & controlling stake must be held by SC/ST or woman.',
      'Borrower should not be in default with any bank or financial institution.'
    ],
    documentsRequired: [
      'Identity & Address Proof (Aadhaar, Passport, Voter ID)',
      'SC/ST Caste Certificate issued by competent government authority',
      'Detailed Project Feasibility Report (DPR) with cash-flow projection',
      'Land / Lease documents for factory / business premise',
      'Partnership deed or incorporation certificate (if applicable)'
    ],
    applicationProcess: [
      'Step 1: Register on SchemeSetu / Stand-Up India portal with DPR.',
      'Step 2: Application routed to designated local commercial bank branch.',
      'Step 3: Branch appraisal, credit guarantee linkage, and sanction letter issuance.',
      'Step 4: Staged fund release against project milestone implementation.'
    ],
    faqs: [
      {
        question: 'Can an existing business owner apply under Stand-Up India?',
        answer: 'The scheme is specifically intended for greenfield (new) ventures. Existing businesses can apply under PMMY Tarun or CGTMSE.'
      }
    ],
    officialUrl: 'https://www.standupmitra.in'
  },
  {
    id: 'scheme-007',
    name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    category: 'Agriculture & Rural Development',
    level: 'Central',
    projectTypes: ['agriculture', 'horticulture', 'dairy', 'poultry', 'agri-allied'],
    department: 'Ministry of Agriculture and Farmers Welfare',
    interestRate: 4.0,
    minLoan: 10000,
    maxLoan: 300000,
    tenure: '36 months',
    tenureMonths: 36,
    moratorium: '6 months',
    moratoriumMonths: 6,
    beneficiary: 'Small and Marginal Farmer Families',
    minAge: 18,
    maxAge: 75,
    maxIncome: 400000,
    summary: 'Direct income support of ₹6,000 per year and access to subsidized Kisan Credit Card (KCC) loans up to ₹3 Lakhs.',
    description: 'PM-KISAN provides direct income support of ₹6,000 per year in three equal installments of ₹2,000 directly into bank accounts of cultivable landholding farmer families, plus seamless linkage to Kisan Credit Card agricultural loans at 4% subsidized interest rate.',
    benefits: '₹6,000 annual direct DBT grant + up to ₹3 Lakh KCC loan at 4% subsidized interest.',
    detailedBenefits: [
      'Direct DBT credit of ₹2,000 every four months directly into Aadhaar-linked bank accounts.',
      'Concessional Kisan Credit Card (KCC) loan access at 4% effective interest rate.',
      'Coverage against crop loss under PM Fasal Bima Yojana integration.',
      'Zero paper verification through digital land record integration.'
    ],
    eligibility: {
      minIncome: 0,
      maxIncome: 400000,
      minAge: 18,
      maxAge: 75,
      education: ['none', 'primary', 'any'],
      locations: ['All India', 'Andhra Pradesh', 'Telangana', 'Karnataka', 'Tamil Nadu', 'Maharashtra', 'Uttar Pradesh', 'Bihar', 'Madhya Pradesh']
    },
    eligibilityCriteria: [
      'Small and marginal farmer families with cultivable agricultural land registered in their name.',
      'Institutional landholders and high-income taxpayer families are excluded.',
      'Valid Aadhaar and bank account seeded with Aadhaar.'
    ],
    documentsRequired: [
      'Aadhaar Card',
      'Landholding Ownership Documents / RoR (Record of Rights)',
      'Bank Account Passbook / Statement',
      'Self-declaration certificate'
    ],
    applicationProcess: [
      'Step 1: Check status via SchemeSetu portal or PM-KISAN official site.',
      'Step 2: Submit land record and Aadhaar eKYC via OTP or biometric CSC.',
      'Step 3: State nodal officer verification.',
      'Step 4: Installment disbursement directly to bank account.'
    ],
    faqs: [
      {
        question: 'Is eKYC mandatory for PM-KISAN?',
        answer: 'Yes, Aadhaar-based OTP eKYC or biometric eKYC at CSC centers is mandatory.'
      }
    ],
    officialUrl: 'https://pmkisan.gov.in'
  },
  {
    id: 'scheme-008',
    name: 'PM Vishwakarma Scheme',
    category: 'Traditional Artisans & Craftspeople Support',
    level: 'Central',
    projectTypes: ['handicrafts', 'carpentry', 'blacksmith', 'pottery', 'tailoring', 'sculpting', 'services'],
    department: 'Ministry of MSME / Ministry of Skill Development and Entrepreneurship',
    interestRate: 5.0,
    minLoan: 100000,
    maxLoan: 300000,
    tenure: '30 months',
    tenureMonths: 30,
    moratorium: '3 months',
    moratoriumMonths: 3,
    beneficiary: 'Traditional Artisans and Craftspeople (18 Recognized Trades)',
    minAge: 18,
    maxAge: 65,
    maxIncome: 400000,
    summary: 'End-to-end support for traditional artisans with skill training, ₹15,000 toolkit incentive, and collateral-free loans up to ₹3 Lakhs at 5% interest.',
    description: 'PM Vishwakarma provides comprehensive institutional support to traditional artisans and craftspeople working with hands and tools across 18 trades including carpenters, blacksmiths, goldsmiths, potters, sculptors, cobblers, masons, basket weavers, and tailors.',
    benefits: '₹15,000 modern toolkit grant + ₹3 Lakh collateral-free loan at 5% interest + ₹500/day training stipend.',
    detailedBenefits: [
      'PM Vishwakarma Certificate and ID card providing national artisan recognition.',
      'Basic (5-7 days) and Advanced (15 days) skill training with ₹500 per day stipend.',
      '₹15,000 e-voucher grant for purchasing modern toolkits.',
      'Collateral-free enterprise loan: ₹1 Lakh (Tranche 1) and ₹2 Lakhs (Tranche 2) at 5% concessional interest.',
      'Digital transaction incentive of ₹1 per transaction for up to 100 transactions/month.'
    ],
    eligibility: {
      minIncome: 0,
      maxIncome: 400000,
      minAge: 18,
      maxAge: 65,
      education: ['none', 'primary', '8th pass', '10th pass', 'any'],
      locations: ['All India', 'Tamil Nadu', 'Andhra Pradesh', 'Telangana', 'Karnataka', 'Maharashtra', 'Odisha', 'Rajasthan', 'Uttar Pradesh']
    },
    eligibilityCriteria: [
      'Artisan or craftsperson working with their hands and tools in one of the 18 family-based traditional trades.',
      'Minimum age of 18 years on the date of registration.',
      'Should not have availed loans under PMEGP, PM SVANidhi, or MUDRA in the past 5 years for the same trade.',
      'Only one member per family is eligible to receive benefits.'
    ],
    documentsRequired: [
      'Aadhaar Card and Mobile linked to Aadhaar',
      'Bank Account details',
      'Ration Card / Family Declaration',
      'Trade / Skill self-declaration'
    ],
    applicationProcess: [
      'Step 1: Biometric-based registration at local CSC Kendra or via SchemeSetu.',
      'Step 2: Three-step verification: Gram Panchayat / ULB level, District Implementation Committee, and Screening Committee.',
      'Step 3: Skill verification, toolkit voucher issuance, and loan disbursement.'
    ],
    faqs: [
      {
        question: 'Which trades are covered under PM Vishwakarma?',
        answer: '18 trades: Carpenter, Boat Maker, Armourer, Blacksmith, Hammer & Tool Kit Maker, Locksmith, Sculptor, Goldsmith, Potter, Cobbler, Mason, Basket/Mat/Broom Maker, Doll & Toy Maker, Barber, Garland Maker, Washerman, Tailor, and Fishing Net Maker.'
      }
    ],
    officialUrl: 'https://pmvishwakarma.gov.in'
  },
  {
    id: 'scheme-009',
    name: 'Credit Guarantee Fund Trust for Micro & Small Enterprises (CGTMSE)',
    category: 'Credit Guarantee Scheme',
    level: 'Central',
    projectTypes: ['manufacturing', 'services', 'trading', 'technology', 'food processing', 'engineering'],
    department: 'Ministry of MSME / SIDBI',
    interestRate: 8.75,
    minLoan: 500000,
    maxLoan: 50000000,
    tenure: '84 months',
    tenureMonths: 84,
    moratorium: '12 months',
    moratoriumMonths: 12,
    beneficiary: 'Micro & Small Business Enterprises (MSEs)',
    minAge: 18,
    maxAge: 65,
    maxIncome: 2500000,
    summary: 'Provides sovereign credit guarantee coverage up to ₹5 Crores to banks to facilitate collateral-free business loans.',
    description: 'CGTMSE enables collateral-free credit facilities (term loan and working capital) up to ₹500 Lakhs to new and existing Micro and Small Enterprises by providing up to 85% guarantee cover to lending Member Lending Institutions (MLIs).',
    benefits: 'Collateral-free commercial bank credit up to ₹5 Crores with 75% to 85% government guarantee cover.',
    detailedBenefits: [
      'Credit guarantee cover up to 85% for micro-enterprises and SC/ST/women-owned units.',
      'Covers both Term Loans and Working Capital credit facilities.',
      'Reduced annual guarantee fees for aspirational districts and marginalized entrepreneurs.',
      'Enables high-scale business expansion without pledging physical land/property.'
    ],
    eligibility: {
      minIncome: 0,
      maxIncome: 2500000,
      minAge: 18,
      maxAge: 65,
      education: ['10th pass', '12th pass', 'graduate', 'diploma', 'any'],
      locations: ['All India']
    },
    eligibilityCriteria: [
      'New or existing Micro and Small Enterprises (MSEs) engaged in manufacturing or service activities.',
      'Valid Udyam Registration Certificate.',
      'Bank appraisal approval for credit facility.'
    ],
    documentsRequired: [
      'Udyam Registration Certificate',
      'Audited Financial Statements (for existing units) / Project Report (new units)',
      'Income Tax Returns & GST returns',
      'KYC documents of Promoters/Directors'
    ],
    applicationProcess: [
      'Step 1: Prepare business plan and obtain Udyam registration.',
      'Step 2: Apply for business credit at any scheduled commercial bank or NBFC.',
      'Step 3: Bank sanctions loan and applies to CGTMSE trust for guarantee coverage.'
    ],
    faqs: [
      {
        question: 'What is the guarantee fee for CGTMSE?',
        answer: 'Annual guarantee fees range between 0.37% and 1.35% depending on loan size, with special discounts for SC/ST, women, and Northeastern region entrepreneurs.'
      }
    ],
    officialUrl: 'https://www.cgtmse.in'
  },
  {
    id: 'scheme-010',
    name: 'PM Formalisation of Micro food processing Enterprises (PMFME)',
    category: 'Food Processing & Agribusiness Subsidy',
    level: 'Central',
    projectTypes: ['food processing', 'agro-industry', 'packaging', 'baking', 'spices', 'beverages'],
    department: 'Ministry of Food Processing Industries (MoFPI)',
    interestRate: 8.0,
    minLoan: 200000,
    maxLoan: 10000000,
    tenure: '84 months',
    tenureMonths: 84,
    moratorium: '12 months',
    moratoriumMonths: 12,
    beneficiary: 'Micro Food Processing Entrepreneurs, SHGs & FPOs',
    minAge: 18,
    maxAge: 65,
    maxIncome: 1200000,
    summary: '35% capital credit-linked subsidy up to ₹10 Lakhs for modernizing micro food processing units under One District One Product (ODOP).',
    description: 'PMFME provides financial, technical, and business support for the upgradation of micro food processing enterprises, providing 35% credit-linked capital subsidy up to ₹10 Lakhs per unit, with priority for One District One Product (ODOP) produce.',
    benefits: '35% capital subsidy up to ₹10 Lakhs + ₹40,000 seed capital for SHG members + brand marketing support.',
    detailedBenefits: [
      'Credit-linked capital subsidy @ 35% of eligible project cost with max ceiling of ₹10 Lakhs.',
      'Seed capital grant of ₹40,000 per SHG member for working capital and small tools.',
      'Technical training and mentorship on food safety standards (FSSAI) and packaging.',
      'Marketing & branding financial support up to 50% for ODOP product lines.'
    ],
    eligibility: {
      minIncome: 0,
      maxIncome: 1200000,
      minAge: 18,
      maxAge: 65,
      education: ['8th pass', '10th pass', 'graduate', 'diploma', 'any'],
      locations: ['All India', 'Andhra Pradesh', 'Telangana', 'Tamil Nadu', 'Karnataka', 'Maharashtra', 'Punjab', 'Kerala', 'Gujarat']
    },
    eligibilityCriteria: [
      'Individual micro food processing unit with at least 1-2 workers.',
      'Existing unit should be currently operational.',
      'Beneficiary contribution of at least 10% of project cost.',
      'Willingness to achieve FSSAI standards and GST compliance.'
    ],
    documentsRequired: [
      'Aadhaar and PAN Card',
      'Bank Account Statements for 6 months',
      'Electricity Bill / Rental Agreement of processing facility',
      'Quotation for food processing machinery from authorized supplier',
      'FSSAI registration / application receipt (if available)'
    ],
    applicationProcess: [
      'Step 1: Submit application on PMFME national portal.',
      'Step 2: District Resource Person (DRP) assists in DPR preparation.',
      'Step 3: Bank sanctions project loan and claims 35% subsidy from MoFPI.'
    ],
    faqs: [
      {
        question: 'Can new food processing units apply for PMFME?',
        answer: 'Yes, new units setting up ODOP food processing lines are eligible for credit-linked capital subsidy.'
      }
    ],
    officialUrl: 'https://pmfme.mofpi.gov.in'
  },
  {
    id: 'scheme-011',
    name: 'National SC-ST Hub (NSSH) Scheme',
    category: 'SC/ST Entrepreneurship Support',
    level: 'Central',
    projectTypes: ['manufacturing', 'services', 'trading', 'food processing', 'engineering', 'textiles'],
    department: 'Ministry of MSME / NSIC',
    interestRate: 7.0,
    minLoan: 100000,
    maxLoan: 5000000,
    tenure: '60 months',
    tenureMonths: 60,
    moratorium: '6 months',
    moratoriumMonths: 6,
    beneficiary: 'SC and ST Micro & Small Entrepreneurs',
    minAge: 18,
    maxAge: 65,
    maxIncome: 1500000,
    summary: 'Special credit subsidies, free tender bidding, and 25% capital subsidy on plant & machinery for SC/ST enterprises.',
    description: 'National SC-ST Hub (NSSH) is set up to provide professional support to Scheduled Caste and Scheduled Tribe entrepreneurs to fulfill government public procurement mandates (4% mandatory procurement from SC/ST MSEs by Central Public Sector Enterprises).',
    benefits: '25% Special Credit Linked Capital Subsidy (SCLCSS) on machinery + 100% reimbursement on government tender fees.',
    detailedBenefits: [
      '25% capital subsidy on plant and machinery purchase up to ₹25 Lakhs subsidy ceiling.',
      '100% fee reimbursement for GeM (Government e-Marketplace) registration and tender fees.',
      'Free testing fee reimbursement up to ₹1 Lakh at NABL accredited labs.',
      'Special technical handholding and vendor development meets with CPSEs.'
    ],
    eligibility: {
      minIncome: 0,
      maxIncome: 1500000,
      minAge: 18,
      maxAge: 65,
      education: ['8th pass', '10th pass', '12th pass', 'graduate', 'diploma', 'any'],
      locations: ['All India']
    },
    eligibilityCriteria: [
      'Enterprise must be registered as Micro or Small under Udyam Registration.',
      '100% ownership by SC/ST in sole proprietorship, or at least 51% shareholding by SC/ST in partnership/private limited.',
      'Valid SC/ST caste certificate issued by authorized government officer.'
    ],
    documentsRequired: [
      'Udyam Registration Certificate',
      'Caste Certificate of all SC/ST Partners/Directors',
      'Machinery Tax Invoices & Bank Loan Sanction Letter',
      'CA Certificate on Plant and Machinery Investment'
    ],
    applicationProcess: [
      'Step 1: Register on National SC-ST Hub portal via SchemeSetu.',
      'Step 2: Submit subsidy claim within specified timeline of machine installation.',
      'Step 3: Verification by NSIC nodal branch and direct DBT subsidy credit.'
    ],
    faqs: [
      {
        question: 'What is the public procurement target from SC/ST MSEs?',
        answer: 'Central Ministries and CPSEs are mandated to procure a minimum of 4% of their total annual procurement from SC/ST enterprises.'
      }
    ],
    officialUrl: 'https://www.scsthub.in'
  },
  {
    id: 'scheme-012',
    name: 'Ayushman Bharat PM-JAY (Healthcare & Wellness)',
    category: 'Healthcare & Health Insurance',
    level: 'Central',
    projectTypes: ['healthcare', 'social-welfare', 'services'],
    department: 'National Health Authority (NHA) / Ministry of Health and Family Welfare',
    interestRate: 0.0,
    minLoan: 0,
    maxLoan: 500000,
    tenure: '12 months (Renewable)',
    tenureMonths: 12,
    moratorium: '0 months',
    moratoriumMonths: 0,
    beneficiary: 'Vulnerable Rural & Urban Families, BPL, SC/ST',
    minAge: 0,
    maxAge: 100,
    maxIncome: 250000,
    summary: 'World\'s largest health assurance scheme providing cashless hospital treatment cover up to ₹5 Lakhs per family per year.',
    description: 'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (PM-JAY) provides health cover of ₹5,00,000 per family per year for secondary and tertiary care hospitalization across more than 29,000 empanelled public and private hospitals across India.',
    benefits: '₹5,00,000 cashless health insurance cover per family per year with zero out-of-pocket hospital expenses.',
    detailedBenefits: [
      'Cashless and paperless access to healthcare services at point of care.',
      'Covers up to 3 days of pre-hospitalization and 15 days of post-hospitalization expenses.',
      'No restriction on family size, age, or gender.',
      'All pre-existing medical conditions covered from day one.'
    ],
    eligibility: {
      minIncome: 0,
      maxIncome: 250000,
      minAge: 0,
      maxAge: 100,
      education: ['none', 'primary', 'any'],
      locations: ['All India']
    },
    eligibilityCriteria: [
      'Families identified in Socio-Economic Caste Census (SECC 2011) database.',
      'Active Ration Card / BPL card holders.',
      'All senior citizens aged 70 years and above (universal coverage tier).'
    ],
    documentsRequired: [
      'Aadhaar Card',
      'Ration Card / PM-JAY Family ID',
      'Ayushman Card (generated digitally at CSC)'
    ],
    applicationProcess: [
      'Step 1: Verify eligibility by mobile number or Ration card on SchemeSetu / PM-JAY.',
      'Step 2: Generate Ayushman PVC Card at any empanelled hospital or CSC center.',
      'Step 3: Show Ayushman card at Ayushman Mitra desk for cashless admission.'
    ],
    faqs: [
      {
        question: 'Are diagnostic tests and medicines covered?',
        answer: 'Yes, diagnostic procedures, ICU, surgery, medication, and post-discharge medicines are 100% covered.'
      }
    ],
    officialUrl: 'https://pmjay.gov.in'
  }
];

export default MOCK_SCHEMES;
