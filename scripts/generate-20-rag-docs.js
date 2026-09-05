const fs = require('fs');
const path = require('path');

const ragDir = path.resolve(__dirname, '../database/sample-data/rag');
if (!fs.existsSync(ragDir)) fs.mkdirSync(ragDir, { recursive: true });

const docs = [
  {
    file: 'rag-mudra-guidelines.txt',
    content: `PRADHAN MANTRI MUDRA YOJANA (PMMY) OFFICIAL OPERATIONAL GUIDELINES\n\n1. Category Divisions:\n- Shishu: Loans up to Rs. 50,000 for micro startups.\n- Kishore: Loans from Rs. 50,001 up to Rs. 5,00,000 for established micro units.\n- Tarun: Loans from Rs. 5,00,001 up to Rs. 10,00,000 for enterprise expansion.\n- Tarun Plus: Loans up to Rs. 20,00,000 for past repaid borrowers.\n2. Collateral: Nil (100% collateral-free credit backed by Credit Guarantee Fund for Micro Units - CGFMU).\n3. Margin: No margin requirement for Shishu; 10% to 15% for Kishore and Tarun.`
  },
  {
    file: 'rag-pmegp-subsidy.txt',
    content: `PRIME MINISTER'S EMPLOYMENT GENERATION PROGRAMME (PMEGP) SUBSIDY NORMS\n\n1. Margin Money Subsidy Rates:\n- General Category (Urban): 15% subsidy, 10% beneficiary contribution.\n- General Category (Rural): 25% subsidy, 10% beneficiary contribution.\n- Special Categories (SC / ST / OBC / Minorities / Women / Ex-Servicemen) (Urban): 25% subsidy, 5% beneficiary contribution.\n- Special Categories (SC / ST / OBC / Minorities / Women / Ex-Servicemen) (Rural): 35% subsidy, 5% beneficiary contribution.\n2. Maximum Project Cost: Rs. 50 Lakhs (Manufacturing) / Rs. 20 Lakhs (Service Sector).`
  },
  {
    file: 'rag-stand-up-india.txt',
    content: `STAND-UP INDIA SCHEME GUIDELINES FOR SC/ST AND WOMEN ENTREPRENEURS\n\n1. Target Group: Scheduled Caste (SC), Scheduled Tribe (ST), and Women borrowers.\n2. Loan Size: Bank composite loans from Rs. 10 Lakhs up to Rs. 1 Crore for greenfield enterprises.\n3. Repayment Period: Up to 7 years with a maximum moratorium period of 18 months.\n4. Convergence: Handholding support provided through SIDBI Stand-Up Connect portal.`
  },
  {
    file: 'rag-dalit-bandhu.txt',
    content: `TELANGANA DALIT BANDHU SCHEME DIRECT GRANT GUIDELINES\n\n1. Financial Assistance: 100% direct government grant of Rs. 10,00,000 per SC beneficiary family.\n2. Loan & Repayment: Zero bank loan linkage. No interest and no monthly EMI repayment.\n3. Eligibility: Native SC residents of Telangana state with Tahsildar verified Community Certificate.`
  },
  {
    file: 'rag-pm-vishwakarma.txt',
    content: `PM VISHWAKARMA SCHEME FOR TRADITIONAL ARTISANS AND CRAFTSPEOPLE\n\n1. Target Trades: 18 traditional family trades including Carpenters, Blacksmiths, Sculptors, Potters, Cobblers, Tailors, Weavers.\n2. Financial Support: Rs. 15,000 tool kit incentive voucher + collateral-free enterprise loans up to Rs. 1 Lakh (Tranche 1) and Rs. 2 Lakhs (Tranche 2) at subsidized 5% interest rate.`
  },
  {
    file: 'rag-pm-svanidhi.txt',
    content: `PM STREET VENDOR'S ATMANIRBHAR NIDHI (PM SVANIDHI) GUIDELINES\n\n1. Micro-Credit Limits: Tranche 1: Rs. 10,000; Tranche 2: Rs. 20,000; Tranche 3: Rs. 50,000.\n2. Interest Subsidy: 7% per annum credited quarterly into beneficiary bank account.\n3. Digital Cashback: Up to Rs. 100 per month for conducting transactions through UPI QR codes.`
  },
  {
    file: 'rag-pm-kisan.txt',
    content: `PRADHAN MANTRI KISAN SAMMAN NIDHI (PM-KISAN) OPERATIONAL NORMS\n\n1. Annual Entitlement: Rs. 6,000 per year transferred in 3 equal 4-monthly installments of Rs. 2,000.\n2. Payment Channel: Direct Benefit Transfer (DBT) to Aadhaar-seeded primary savings account.\n3. Mandatory Verification: e-KYC authentication and land ownership record seeding.`
  },
  {
    file: 'rag-ayushman-bharat.txt',
    content: `AYUSHMAN BHARAT PM-JAY HEALTH INSURANCE GUIDELINES\n\n1. Coverage Limit: Cashless hospitalization cover up to Rs. 5,00,000 per family per year.\n2. Universal Senior Citizen Expansion: All senior citizens aged 70 years and above eligible for dedicated Rs. 5 Lakhs cover regardless of family income.\n3. Empanelled Hospitals: Over 27,000 public and private hospitals across India.`
  },
  {
    file: 'rag-pmay-urban.txt',
    content: `PRADHAN MANTRI AWAS YOJANA - URBAN (PMAY-U) SUBSIDY RULES\n\n1. Income Categories: EWS up to Rs. 3 Lakhs; LIG from Rs. 3 Lakhs to Rs. 6 Lakhs.\n2. Subsidy Benefit: 4% interest subsidy on home loans up to Rs. 25 Lakhs.\n3. Mandatory Requirement: Female ownership or co-ownership of house property for EWS/LIG families.`
  },
  {
    file: 'rag-post-matric-scholarship.txt',
    content: `POST-MATRIC SCHOLARSHIP SCHEME FOR SC/ST STUDENTS\n\n1. Income Ceiling: Total family annual income must not exceed Rs. 2.50 Lakhs.\n2. Components: Full reimbursement of non-refundable tuition fees plus annual maintenance allowance up to Rs. 13,500.\n3. Funding Sharing: 60:40 fund sharing between Central Government and State Governments.`
  },
  {
    file: 'rag-national-sc-st-hub.txt',
    content: `NATIONAL SC-ST HUB (NSSH) SCHEME GUIDELINES\n\n1. SCLCSS Subsidy: 25% capital subsidy on plant and machinery procurement up to Rs. 25 Lakhs.\n2. Public Procurement Quota: Mandatory 4% annual procurement mandate from SC/ST MSMEs by Central Public Sector Enterprises (CPSEs).\n3. Certification Reimbursement: 100% testing fee and ISO certification fee waivers.`
  },
  {
    file: 'rag-cegssc-guarantee.txt',
    content: `CREDIT ENHANCEMENT GUARANTEE SCHEME FOR SCHEDULED CASTES (CEGSSC)\n\n1. Guarantee Coverage: 100% guarantee cover for bank loans between Rs. 15 Lakhs and Rs. 1 Crore.\n2. Maximum Loan Limit: Supports commercial bank credit up to Rs. 5 Crores.\n3. Target Group: Scheduled Caste entrepreneurs holding at least 51% shareholding in the enterprise.`
  },
  {
    file: 'rag-vcf-sc-equity.txt',
    content: `VENTURE CAPITAL FUND FOR SCHEDULED CASTES (VCF-SC) GUIDELINES\n\n1. Investment Range: Equity and debt financing from Rs. 20 Lakhs up to Rs. 15 Crores.\n2. Hurdle Return: Base return rate of 8% per annum (subsidized to 4% p.a. for SC Women and SC PwD founders).\n3. Tenor: Long-term investment horizon of up to 10 years with 3 years moratorium.`
  },
  {
    file: 'rag-mmyuy-state-model.txt',
    content: `MUKHYA MANTRI YUVA UDYAMI YOJANA (STATE SC/ST MODEL)\n\n1. Project Ceiling: Projects up to Rs. 10 Lakhs in manufacturing and service enterprises.\n2. Financial Structure: 50% non-repayable direct state capital grant (up to Rs. 5 Lakhs) + 50% soft loan (Rs. 5 Lakhs) at 1% simple interest rate.\n3. Repayment: 84 equal monthly installments with 12 months moratorium.`
  },
  {
    file: 'rag-nsap-pension.txt',
    content: `INDIRA GANDHI NATIONAL OLD AGE PENSION SCHEME (IGNOAPS - NSAP)\n\n1. Eligibility Age: 60 years and above for BPL beneficiaries.\n2. Pension Rate: Central contribution Rs. 200/month (60-79 years) and Rs. 500/month (80+ years) topped up with state welfare contributions.\n3. Direct Credit: Monthly DBT direct to post office or primary bank account.`
  },
  {
    file: 'rag-sukanya-samriddhi.txt',
    content: `SUKANYA SAMRIDDHI YOJANA (SSY) RULES\n\n1. Eligibility: Girl child from birth up to 10 years of age.\n2. Interest Rate: 8.2% annual compound interest rate with sovereign guarantee.\n3. Tax Benefit: Exempt-Exempt-Exempt (EEE) status with full Section 80C tax deduction.`
  },
  {
    file: 'rag-cgtmse-guarantee.txt',
    content: `CREDIT GUARANTEE FUND TRUST FOR MICRO AND SMALL ENTERPRISES (CGTMSE)\n\n1. Coverage Limit: Collateral-free credit facility guarantee up to Rs. 5 Crores to MSEs.\n2. Guarantee Ratio: Up to 85% for SC/ST and Women entrepreneurs; 75% for general category.\n3. Annual Fee: Subsidized guarantee fee structured on outstanding balance.`
  },
  {
    file: 'rag-udyam-registration.txt',
    content: `UDYAM REGISTRATION PROCEDURE FOR MICRO ENTERPRISES\n\n1. Free Self-Declaration: Completely digital, paperless, and free self-declaration based on Aadhaar and PAN.\n2. Classification: Micro (Investment up to Rs. 1 Crore and Turnover up to Rs. 5 Crores).\n3. Benefits: Priority Sector Lending (PSL) eligibility and exemption from tender fees.`
  },
  {
    file: 'rag-jansamarth-portal.txt',
    content: `JANSAMARTH NATIONAL PORTAL FOR CREDIT LINKED SCHEMES\n\n1. Unified Access: Single digital platform connecting 13+ central credit-linked government schemes.\n2. Digital In-Principle Approval: Instant bank eligibility check and in-principle sanction letter generation.\n3. Integrated Verification: Online PAN, Aadhaar, and Udyam e-KYC integration.`
  },
  {
    file: 'rag-csc-digital-seva.txt',
    content: `COMMON SERVICES CENTRES (CSC DIGITAL SEVA) ASSISTANCE PROTOCOL\n\n1. Services: Biometric e-KYC, scheme application submission, grievance logging, and DBT status tracking.\n2. Network: 5,00,000+ village level entrepreneur (VLE) kiosks across rural and semi-urban India.\n3. Fixed User Fees: Regulated government citizen service fees without unauthorized middleman charges.`
  }
];

docs.forEach(d => {
  fs.writeFileSync(path.join(ragDir, d.file), d.content);
});

console.log(`✅ Successfully generated ${docs.length} comprehensive RAG knowledge documents in ${ragDir}!`);
