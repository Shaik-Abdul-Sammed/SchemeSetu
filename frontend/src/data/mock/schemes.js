export const mockSchemes = [
  {
    "id": "pm-kisan",
    "name": "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
    "shortName": "PM-KISAN",
    "department": "Ministry of Agriculture and Farmers Welfare",
    "level": "Central",
    "state": "Pan-India",
    "category": "Agriculture & Farmers",
    "beneficiary": "Small & Marginal Farmers",
    "minAge": 18,
    "maxAge": 75,
    "maxIncome": 300000,
    "gender": "All",
    "occupation": "Farmer",
    "sector": "Agriculture",
    "summary": "Direct income support of ₹6,000 per year to all landholding farmer families across India.",
    "benefits": "₹6,000 per year paid in 3 equal installments of ₹2,000 directly to bank accounts via DBT.",
    "detailedBenefits": [
      "Financial assistance of ₹6,000 per annum paid in three tranches of ₹2,000 each.",
      "Direct Benefit Transfer (DBT) directly linked to Aadhaar-seeded bank account.",
      "Completely centrally funded scheme covering all operational landholding farmer families."
    ],
    "eligibilityCriteria": [
      "Must be a farmer family owning cultivable land in their name as per state land records.",
      "Covers landholding farmers irrespective of the size of their land holdings.",
      "Excludes institutional landholders, active/retired government employees, and income tax payers."
    ],
    "documentsRequired": [
      "Aadhaar Card",
      "Proof of ownership of cultivable land (Khasra/Khatauni/RoR)",
      "Aadhaar-linked Savings Bank Account Passbook",
      "Active Mobile Number"
    ],
    "applicationProcess": [
      "Visit the official PM-KISAN portal or nearest Common Service Centre (CSC).",
      "Click on 'Farmers Corner' -> 'New Farmer Registration'.",
      "Enter Aadhaar Number and select your State/District.",
      "Fill land record details and bank account numbers.",
      "Submit the application and verify through OTP sent to Aadhaar-registered mobile."
    ],
    "officialUrl": "https://pmkisan.gov.in",
    "faqs": [
      {
        "question": "Is there any restriction on landholding size for PM-KISAN?",
        "answer": "No, the scheme covers all landholding farmer families subject to certain exclusion criteria."
      },
      {
        "question": "How are the installments credited?",
        "answer": "Installments are credited directly to the bank account via Aadhaar Payment Bridge System (APBS)."
      }
    ],
    "tags": [
      "farmer",
      "agriculture",
      "dbt",
      "income support",
      "pm kisan"
    ]
  },
  {
    "id": "ayushman-bharat",
    "name": "Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana (PM-JAY)",
    "shortName": "PM-JAY",
    "department": "National Health Authority, Ministry of Health and Family Welfare",
    "level": "Central",
    "state": "Pan-India",
    "category": "Healthcare & Health Insurance",
    "beneficiary": "Low Income Families",
    "minAge": 0,
    "maxAge": 100,
    "maxIncome": 250000,
    "gender": "All",
    "occupation": "Any",
    "sector": "Health",
    "summary": "Cashless health cover of up to ₹5 Lakh per family per year for secondary and tertiary care hospitalization.",
    "benefits": "Free health insurance coverage of ₹5,00,000 per family annually across empanelled public and private hospitals.",
    "detailedBenefits": [
      "Coverage up to ₹5 Lakh per family per year on a family floater basis.",
      "Cashless and paperless access to healthcare services at the point of service.",
      "Covers pre-hospitalization (up to 3 days) and post-hospitalization (up to 15 days) expenses.",
      "No restriction on family size, age, or gender."
    ],
    "eligibilityCriteria": [
      "Families listed under SECC 2011 database (Rural D1 to D7 categories & Urban occupational categories).",
      "Families holding AB-PMJAY Golden Card / Ayushman Card.",
      "All senior citizens aged 70 years and above (Ayushman Vaya Vandana Card extension)."
    ],
    "documentsRequired": [
      "Aadhaar Card",
      "Ration Card / Family ID",
      "Mobile Number for e-KYC verification"
    ],
    "applicationProcess": [
      "Check eligibility on official PM-JAY portal or at empanelled hospital Ayushman Mitra desk.",
      "Authenticate identity using Aadhaar e-KYC or Ration Card.",
      "Generate Ayushman Card instantly upon verification.",
      "Present Ayushman Card during hospital admission for cashless treatment."
    ],
    "officialUrl": "https://pmjay.gov.in",
    "faqs": [
      {
        "question": "Is there any cap on family size for Ayushman Bharat?",
        "answer": "No, there is no limit on family size, age, or gender under PM-JAY."
      },
      {
        "question": "Are pre-existing diseases covered?",
        "answer": "Yes, all pre-existing medical conditions are covered from day one of enrollment."
      }
    ],
    "tags": [
      "health",
      "insurance",
      "hospitalization",
      "cashless",
      "ayushman card"
    ]
  },
  {
    "id": "pm-awas-yojana-urban",
    "name": "Pradhan Mantri Awas Yojana - Housing for All",
    "shortName": "PMAY",
    "department": "Ministry of Housing and Urban Affairs / Ministry of Rural Development",
    "level": "Central",
    "state": "Pan-India",
    "category": "Housing & Shelter",
    "beneficiary": "Homeless / Economically Weaker Section (EWS)",
    "minAge": 21,
    "maxAge": 70,
    "maxIncome": 300000,
    "gender": "All",
    "occupation": "Any",
    "sector": "Urban Development",
    "summary": "Financial grant and credit-linked subsidy to construct pucca houses for homeless and low-income families.",
    "benefits": "Financial assistance up to ₹2.50 Lakh for house construction or interest subsidy up to 6.5% on home loans.",
    "detailedBenefits": [
      "Financial grant of ₹1.5 Lakh to ₹2.5 Lakh for beneficiary-led individual house construction.",
      "Credit-Linked Subsidy Scheme (CLSS) offering up to 6.5% interest subsidy on housing loans.",
      "In-situ slum redevelopment with participation of private developers."
    ],
    "eligibilityCriteria": [
      "Beneficiary family should not own a pucca house anywhere in India in their name.",
      "Annual household income within EWS (up to ₹3 Lakh) or LIG (₹3 Lakh to ₹6 Lakh) bracket.",
      "Female head of household co-ownership mandatory for land and home title."
    ],
    "documentsRequired": [
      "Aadhaar Card of all family members",
      "Income Certificate / BPL Certificate",
      "Property Ownership / Land Possession document",
      "Bank Account Details",
      "Affidavit confirming no pucca house ownership"
    ],
    "applicationProcess": [
      "Apply online through PMAY official portal or via local Gram Panchayat / Urban Local Body.",
      "Submit Aadhaar number and fill socio-economic details.",
      "Physical verification of land/site by municipal or rural authority.",
      "Approval of grant and direct disbursement in 3 to 4 construction-stage linked tranches."
    ],
    "officialUrl": "https://pmaymis.gov.in",
    "faqs": [
      {
        "question": "Can unmarried individuals apply for PMAY?",
        "answer": "PMAY defines a beneficiary family as husband, wife, and unmarried children. An adult earning member can be treated as a separate household if they don't own a pucca house."
      }
    ],
    "tags": [
      "housing",
      "pmay",
      "home loan",
      "subsidy",
      "pucca house"
    ]
  },
  {
    "id": "pm-mudra-yojana",
    "name": "Pradhan Mantri MUDRA Yojana (PMMY)",
    "shortName": "PMMY MUDRA",
    "department": "Department of Financial Services, Ministry of Finance",
    "level": "Central",
    "state": "Pan-India",
    "category": "Financial Services & Micro-Loans",
    "beneficiary": "Micro Vendors / Small Business Owners",
    "minAge": 18,
    "maxAge": 65,
    "maxIncome": 1000000,
    "gender": "All",
    "occupation": "Business",
    "sector": "MSME",
    "summary": "Collateral-free micro loans up to ₹20 Lakh for non-corporate, non-farm micro and small enterprises.",
    "benefits": "Loans up to ₹20 Lakh with no collateral required across Shishu (up to ₹50,000), Kishore (₹50k-₹5L), Tarun (₹5L-₹10L), and Tarun Plus (₹10L-₹20L) categories.",
    "detailedBenefits": [
      "Shishu: Loans up to ₹50,000 for starting new micro business ventures.",
      "Kishore: Loans above ₹50,000 and up to ₹5 Lakh for enterprise expansion.",
      "Tarun & Tarun Plus: Loans above ₹5 Lakh up to ₹20 Lakh for established units.",
      "Zero processing fees for Shishu and Kishore loans. MUDRA Card for working capital."
    ],
    "eligibilityCriteria": [
      "Non-Farm Small/Micro Enterprises in manufacturing, trading, or service sectors.",
      "Artisans, shopkeepers, fruit/vegetables vendors, small industrialists, food processors.",
      "Applicant must have a viable business plan and clean credit history (no default)."
    ],
    "documentsRequired": [
      "Identity Proof (Aadhaar / PAN / Voter ID)",
      "Address Proof of Business & Applicant",
      "Business Quotations / License / GST Registration (if applicable)",
      "Bank statement of last 6 months",
      "Passport size photographs"
    ],
    "applicationProcess": [
      "Prepare business plan and loan requirement details.",
      "Visit any public/private commercial bank, RRB, or apply online via JanSamarth portal.",
      "Fill MUDRA loan application form selecting appropriate category (Shishu/Kishore/Tarun).",
      "Submit documents; loan sanctioned within 7-14 working days without collateral."
    ],
    "officialUrl": "https://www.mudra.org.in",
    "faqs": [
      {
        "question": "Is collateral required for MUDRA loans?",
        "answer": "No collateral or third-party guarantee is required for loans under PMMY."
      }
    ],
    "tags": [
      "mudra",
      "loan",
      "business",
      "msme",
      "collateral free"
    ],
    "minLoan": 10000,
    "maxLoan": 2000000,
    "maxProjectCost": 2000000,
    "interestRate": 8.5,
    "tenureMonths": 60,
    "moratoriumMonths": 6
  },
  {
    "id": "pm-vishwakarma",
    "name": "PM Vishwakarma Scheme",
    "shortName": "PM Vishwakarma",
    "department": "Ministry of Micro, Small and Medium Enterprises (MSME)",
    "level": "Central",
    "state": "Pan-India",
    "category": "Skills & Craftsmanship",
    "beneficiary": "Traditional Artisans & Craftspeople",
    "minAge": 18,
    "maxAge": 70,
    "maxIncome": 400000,
    "gender": "All",
    "occupation": "Artisan",
    "sector": "Skill Development",
    "summary": "End-to-end support including PM Vishwakarma Certificate, skill training, ₹15,000 toolkit digital incentive, and collateral-free credit support up to ₹3 Lakh at 5% interest.",
    "benefits": "Collateral-free credit up to ₹3 Lakh at concessional interest rate of 5%, ₹15,000 toolkit incentive, and stipend during skill training.",
    "detailedBenefits": [
      "PM Vishwakarma Certificate and ID Card granting official recognition.",
      "Basic skill training of 5-7 days and Advanced training of 15 days with ₹500/day stipend.",
      "Toolkit incentive of ₹15,000 credited via e-RUPI / digital voucher.",
      "Collateral-free enterprise credit up to ₹1 Lakh (Tranche 1) and ₹2 Lakh (Tranche 2) at 5% interest rate."
    ],
    "eligibilityCriteria": [
      "Artisan or craftsman working with hands and tools in one of 18 traditional trades (e.g. Carpenter, Blacksmith, Goldsmith, Potter, Weaver, Sculptor, Cobbler, Tailor).",
      "Minimum age 18 years on date of registration.",
      "Only one member per family eligible. Beneficiary should not have availed loans under PMEGP or MUDRA in last 5 years."
    ],
    "documentsRequired": [
      "Aadhaar Card",
      "Aadhaar-linked Mobile Number",
      "Bank Account Details",
      "Ration Card"
    ],
    "applicationProcess": [
      "Visit nearest Common Service Centre (CSC) with Aadhaar and mobile.",
      "Biometric registration and verification by CSC operator.",
      "3-step verification: Gram Panchayat/ULB level, District Implementation Committee, and Screening Committee.",
      "Issue of PM Vishwakarma digital certificate and sanction of toolkit voucher."
    ],
    "officialUrl": "https://pmvishwakarma.gov.in",
    "faqs": [
      {
        "question": "Which trades are covered under PM Vishwakarma?",
        "answer": "18 traditional trades including Carpenter, Boat Maker, Armourer, Blacksmith, Hammer and Tool Kit Maker, Locksmith, Goldsmith, Potter, Sculptor, Cobbler, Mason, Basket/Mat/Broom Maker, Doll & Toy Maker, Barber, Garland Maker, Washerman, Tailor, and Fishing Net Maker."
      }
    ],
    "tags": [
      "artisan",
      "vishwakarma",
      "craftsman",
      "toolkit",
      "5 percent loan"
    ],
    "minLoan": 100000,
    "maxLoan": 300000,
    "maxProjectCost": 300000,
    "interestRate": 5,
    "tenureMonths": 30,
    "moratoriumMonths": 3
  },
  {
    "id": "post-matric-scholarship",
    "name": "Post-Matric Scholarship Scheme for SC/ST/OBC Students",
    "shortName": "Post-Matric Scholarship",
    "department": "Ministry of Social Justice and Empowerment / Ministry of Tribal Affairs",
    "level": "Central",
    "state": "Pan-India",
    "category": "Education & Scholarships",
    "beneficiary": "SC / ST / OBC Students",
    "minAge": 14,
    "maxAge": 35,
    "maxIncome": 250000,
    "gender": "All",
    "occupation": "Student",
    "sector": "Social Justice",
    "summary": "Financial scholarship covering 100% compulsory non-refundable fees and monthly maintenance allowance for post-secondary education.",
    "benefits": "Full tuition fee reimbursement + annual academic maintenance allowance up to ₹13,500 per year directly disbursed into bank accounts.",
    "detailedBenefits": [
      "Complete reimbursement of compulsory non-refundable course fees charged by recognized institutions.",
      "Maintenance allowance up to ₹13,500/year for hostellers and ₹7,000/year for day scholars.",
      "Additional allowance for disabled students and study tours."
    ],
    "eligibilityCriteria": [
      "Belong to Scheduled Caste (SC), Scheduled Tribe (ST), or Other Backward Classes (OBC).",
      "Enrolled in Post-Matriculation or Post-Secondary courses (Class 11 to Ph.D.) in recognized institutions.",
      "Annual family income must not exceed ₹2.50 Lakh (for SC/ST) or ₹1.50 Lakh (for OBC)."
    ],
    "documentsRequired": [
      "Cast Certificate issued by competent authority",
      "Income Certificate of parents/guardian",
      "Mark sheets of previous qualifying examinations",
      "Fee receipt and Bonafide Certificate from educational institution",
      "Aadhaar Card & Bank Passbook copy"
    ],
    "applicationProcess": [
      "Register on National Scholarship Portal (NSP) or State Scholarship Portal.",
      "Upload caste certificate, income proof, and mark sheet.",
      "Submit application; verification conducted by Institute Verification Officer and District Nodal Officer.",
      "Direct Benefit Transfer (DBT) credited directly into student's Aadhaar-seeded bank account."
    ],
    "officialUrl": "https://scholarships.gov.in",
    "faqs": [
      {
        "question": "Can students studying in private colleges apply?",
        "answer": "Yes, provided the institution and course are recognized by UGC, AICTE, or government regulatory bodies."
      }
    ],
    "tags": [
      "scholarship",
      "education",
      "student",
      "sc st obc",
      "tuition fee"
    ]
  },
  {
    "id": "pm-svanidhi",
    "name": "PM Street Vendor's AtmaNirbhar Nidhi (PM SVANidhi)",
    "shortName": "PM SVANidhi",
    "department": "Ministry of Housing and Urban Affairs",
    "level": "Central",
    "state": "Pan-India",
    "category": "Financial Services & Micro-Loans",
    "beneficiary": "Street Vendors / Hawkers",
    "minAge": 18,
    "maxAge": 65,
    "maxIncome": 200000,
    "gender": "All",
    "occupation": "Vendor",
    "sector": "Urban Development",
    "summary": "Micro-credit scheme providing working capital collateral-free loans up to ₹50,000 with 7% interest subsidy and cashback on digital transactions.",
    "benefits": "Tranche 1 loan of ₹10,000, Tranche 2 loan of ₹20,000, and Tranche 3 loan of ₹50,000 with 7% interest subsidy and ₹1,200 annual digital cashback.",
    "detailedBenefits": [
      "Working capital loan starting at ₹10,000 without collateral for 1-year tenure.",
      "7% interest subsidy credited directly to bank account on timely repayment.",
      "Enhanced loan limit of ₹20,000 (2nd tranche) and ₹50,000 (3rd tranche) on early repayment.",
      "Cashback up to ₹100 per month (₹1,200/year) on conducting digital sales."
    ],
    "eligibilityCriteria": [
      "Street vendors engaged in vending in urban areas on or before March 24, 2020.",
      "Vendors possessing Certificate of Vending / Identity Card issued by Urban Local Bodies (ULBs).",
      "Vendors identified in ULB survey or holding Letter of Recommendation (LoR)."
    ],
    "documentsRequired": [
      "Vending Certificate / Identity Card / Letter of Recommendation (LoR)",
      "Aadhaar Card",
      "Voter ID / Driving License",
      "Bank Account Passbook"
    ],
    "applicationProcess": [
      "Check vending status at local Urban Local Body (ULB) or PM SVANidhi portal.",
      "Apply online on PM SVANidhi portal or visit nearest Common Service Centre / Bank.",
      "Fill simple 1-page digital loan application form.",
      "Loan disbursed directly into bank account within 10 days."
    ],
    "officialUrl": "https://pmsvanidhi.mohua.gov.in",
    "faqs": [
      {
        "question": "Is collateral required for PM SVANidhi loan?",
        "answer": "No, the loan is completely collateral-free."
      }
    ],
    "tags": [
      "street vendor",
      "svanidhi",
      "micro loan",
      "cashback",
      "interest subsidy"
    ],
    "minLoan": 10000,
    "maxLoan": 50000,
    "maxProjectCost": 50000,
    "interestRate": 7,
    "tenureMonths": 12,
    "moratoriumMonths": 0
  },
  {
    "id": "nsap-old-age-pension",
    "name": "Indira Gandhi National Old Age Pension Scheme (IGNOAPS - NSAP)",
    "shortName": "IGNOAPS Old Age Pension",
    "department": "Ministry of Rural Development",
    "level": "Central",
    "state": "Pan-India",
    "category": "Social Security & Pension",
    "beneficiary": "Senior Citizens (60+ BPL)",
    "minAge": 60,
    "maxAge": 100,
    "maxIncome": 100000,
    "gender": "All",
    "occupation": "Senior Citizen",
    "sector": "Social Justice",
    "summary": "Monthly social security pension for BPL senior citizens aged 60 years and above.",
    "benefits": "Monthly pension of ₹400 to ₹1,000+ per month (Central + State top-up) directly disbursed via DBT.",
    "detailedBenefits": [
      "Central contribution of ₹200/month for persons aged 60 to 79 years, supplemented by State contribution (totaling ₹1,000 to ₹3,000/month depending on state).",
      "Central contribution increased to ₹500/month for senior citizens aged 80 years and above.",
      "Direct credit to beneficiary bank/post office account on 1st of every month."
    ],
    "eligibilityCriteria": [
      "Applicant must be 60 years of age or older.",
      "Must belong to a household living Below Poverty Line (BPL) as per central/state guidelines.",
      "Must have valid BPL card or certificate from competent authority."
    ],
    "documentsRequired": [
      "Aadhaar Card",
      "Age Proof (Birth Certificate / Voter ID / School Certificate)",
      "BPL Ration Card / Income Certificate",
      "Bank or Post Office Passbook"
    ],
    "applicationProcess": [
      "Submit application to Social Welfare Officer / Block Development Officer (BDO) or Gram Panchayat office.",
      "Verification of age and BPL status by local authorities.",
      "Approval and sanction order issued by District Collector / Social Welfare Board.",
      "Monthly pension credited via Direct Benefit Transfer."
    ],
    "officialUrl": "https://nsap.nic.in",
    "faqs": [
      {
        "question": "Does the pension amount vary across states?",
        "answer": "Yes, central government provides base pension, and state governments add matching/top-up funds (e.g. Telangana, AP, UP provide up to ₹2,500-₹3,000/month)."
      }
    ],
    "tags": [
      "pension",
      "old age",
      "senior citizen",
      "bpl",
      "nsap"
    ]
  },
  {
    "id": "sukanya-samriddhi",
    "name": "Sukanya Samriddhi Yojana (SSY)",
    "shortName": "Sukanya Samriddhi",
    "department": "Department of Posts / Ministry of Finance",
    "level": "Central",
    "state": "Pan-India",
    "category": "Women & Child Welfare",
    "beneficiary": "Girls (0-10 years)",
    "minAge": 0,
    "maxAge": 10,
    "maxIncome": 1000000,
    "gender": "Female",
    "occupation": "Any",
    "sector": "Women & Child",
    "summary": "Government-backed high-interest savings scheme for girl child with 8.2% interest rate and Section 80C tax benefits.",
    "benefits": "Highest government interest rate of 8.2% per annum, compound annually, with full EEE (Exempt-Exempt-Exempt) tax exemption.",
    "detailedBenefits": [
      "High guaranteed interest rate (8.2% per annum for Q2 2026).",
      "Minimum deposit of ₹250 up to maximum ₹1,500,000 per financial year.",
      "Tax deduction under Section 80C up to ₹1.5 Lakh per year.",
      "Partial withdrawal up to 50% allowed for higher education once girl reaches age 18.",
      "Maturity after 21 years from account opening date."
    ],
    "eligibilityCriteria": [
      "Account can be opened by natural or legal guardian for a girl child below age 10.",
      "Maximum 2 girl child accounts allowed per family (triplets/twins exception).",
      "Girl child must be a resident Indian citizen."
    ],
    "documentsRequired": [
      "Girl Child's Birth Certificate",
      "Identity & Address Proof of Parent/Guardian (Aadhaar / PAN)",
      "Passport size photos of child and guardian"
    ],
    "applicationProcess": [
      "Visit any Post Office branch or authorized public/private bank.",
      "Fill SSY Account Opening Form (Form-1).",
      "Submit child's birth certificate and guardian's KYC documents.",
      "Make initial deposit (minimum ₹250) in cash/cheque; passbook issued."
    ],
    "officialUrl": "https://www.indiapost.gov.in",
    "faqs": [
      {
        "question": "What is the current interest rate for SSY?",
        "answer": "The scheme offers an attractive government-backed interest rate of 8.2% per annum compounded annually."
      }
    ],
    "tags": [
      "girl child",
      "sukanya samriddhi",
      "savings",
      "tax free",
      "high interest"
    ]
  },
  {
    "id": "stand-up-india",
    "name": "Stand Up India Scheme for Women & SC/ST Entrepreneurs",
    "shortName": "Stand Up India",
    "department": "Department of Financial Services, Ministry of Finance",
    "level": "Central",
    "state": "Pan-India",
    "category": "Business & Entrepreneurship",
    "beneficiary": "Women & SC/ST Entrepreneurs",
    "minAge": 18,
    "maxAge": 65,
    "maxIncome": 1500000,
    "gender": "All",
    "occupation": "Business",
    "sector": "MSME",
    "summary": "Bank loans between ₹10 Lakh and ₹1 Crore for setting up greenfield enterprises by SC/ST or Women borrowers.",
    "benefits": "Bank loan from ₹10 Lakh up to ₹1 Crore covering up to 85% of total project cost for new business ventures.",
    "detailedBenefits": [
      "Composite loan (inclusive of term loan and working capital) between ₹10 Lakh and ₹1 Crore.",
      "Covered under Credit Guarantee Scheme for Stand Up India Loans (CGSIL).",
      "Repayable in 7 years with a maximum moratorium period of 18 months.",
      "Handholding support via Stand Up India portal (mentorship, EDP training)."
    ],
    "eligibilityCriteria": [
      "Applicant must belong to SC/ST category OR be a Woman entrepreneur.",
      "Age above 18 years.",
      "Project must be a Greenfield enterprise (first-time venture in manufacturing, services, agriculture-allied, or trading sector).",
      "In non-individual enterprises, 51% shareholding and controlling stake must be held by SC/ST or Woman entrepreneur."
    ],
    "documentsRequired": [
      "Aadhaar Card & PAN Card",
      "Caste Certificate (for SC/ST applicants)",
      "Project Profile / Business Feasibility Report",
      "Proof of Business Premise (Ownership/Lease)",
      "Bank Account Statement of last 6 months"
    ],
    "applicationProcess": [
      "Register on Stand Up India portal (www.standupmitra.in) or visit nearest Scheduled Commercial Bank branch.",
      "Create profile and choose handholding support agency if required.",
      "Submit detailed project report and loan application form.",
      "Bank processes loan application and sanctions within 2-4 weeks."
    ],
    "officialUrl": "https://www.standupmitra.in",
    "faqs": [
      {
        "question": "Can an existing business apply for Stand Up India loan?",
        "answer": "No, Stand Up India is specifically for Greenfield (new) ventures."
      }
    ],
    "tags": [
      "women entrepreneur",
      "sc st",
      "business loan",
      "standup india",
      "greenfield"
    ],
    "minLoan": 1000000,
    "maxLoan": 10000000,
    "maxProjectCost": 10000000,
    "interestRate": 7.5,
    "tenureMonths": 84,
    "moratoriumMonths": 18
  }
];
export const MOCK_SCHEMES = mockSchemes;
export default mockSchemes;
