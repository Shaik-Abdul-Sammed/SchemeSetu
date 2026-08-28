/**
 * SchemeSetu Centralized Mock Dataset - Citizen Applications
 * Prototype / Demo Dataset for SIH 2026
 */

export const MOCK_APPLICATIONS = [
  {
    id: 'APP-2026-8891',
    schemeId: 'scheme-007',
    schemeName: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    category: 'Agriculture & Rural Development',
    status: 'Approved',
    date: '2026-08-20',
    loanAmount: 300000,
    requestedAmount: 300000,
    sanctionedAmount: 300000,
    partnerBank: 'State Bank of India - George Town Branch',
    stage: 'Disbursement Completed',
    remarks: 'Verification complete. First installment ₹2,000 dispatched to bank account with KCC sanctioned limit ₹3,00,000.',
    timeline: [
      { step: 'Applied Online via SchemeSetu', date: '2026-08-15', completed: true },
      { step: 'Land Record e-Verification', date: '2026-08-17', completed: true },
      { step: 'Lead Bank Branch Approval', date: '2026-08-19', completed: true },
      { step: 'Direct Benefit Transfer Dispatched', date: '2026-08-20', completed: true }
    ]
  },
  {
    id: 'APP-2026-9042',
    schemeId: 'scheme-002',
    schemeName: 'Pradhan Mantri Mudra Yojana (PMMY) - Kishore',
    category: 'Micro Enterprise Loan',
    status: 'Under Review',
    date: '2026-08-25',
    loanAmount: 350000,
    requestedAmount: 350000,
    sanctionedAmount: 0,
    partnerBank: 'Canara Bank - Micro & SME Center',
    stage: 'Branch Document Verification',
    remarks: 'Document verification in progress at Canara Bank Lead Branch. Field inspection scheduled.',
    timeline: [
      { step: 'Applied Online via SchemeSetu', date: '2026-08-24', completed: true },
      { step: 'Digital KYC & ULI Score Check', date: '2026-08-25', completed: true },
      { step: 'Bank Field Verification', date: '2026-08-28', completed: false },
      { step: 'Final Loan Disbursement', date: 'Pending', completed: false }
    ]
  },
  {
    id: 'APP-2026-9188',
    schemeId: 'scheme-008',
    schemeName: 'PM Vishwakarma Scheme',
    category: 'Traditional Artisans Support',
    status: 'Approved',
    date: '2026-08-12',
    loanAmount: 100000,
    requestedAmount: 100000,
    sanctionedAmount: 100000,
    partnerBank: 'CSC Digital Seva Kendra Hub',
    stage: 'Toolkit e-Voucher Issued',
    remarks: 'Basic 5-day skill training completed. Modern Toolkit e-voucher worth ₹15,000 activated.',
    timeline: [
      { step: 'Biometric Gram Panchayat Registration', date: '2026-08-05', completed: true },
      { step: 'District Implementation Approval', date: '2026-08-08', completed: true },
      { step: 'Skill Certification Awarded', date: '2026-08-11', completed: true },
      { step: 'Toolkit e-Voucher Dispatched', date: '2026-08-12', completed: true }
    ]
  },
  {
    id: 'APP-2026-9250',
    schemeId: 'scheme-004',
    schemeName: 'Prime Minister Employment Generation Programme (PMEGP)',
    category: 'Credit-Linked Subsidy Scheme',
    status: 'Documents Required',
    date: '2026-08-26',
    loanAmount: 850000,
    requestedAmount: 850000,
    sanctionedAmount: 0,
    partnerBank: 'Indian Bank - Entrepreneurship Support Hub',
    stage: 'Pending Rural Certificate Upload',
    remarks: 'Please upload Rural Area Certificate issued by Gram Panchayat officer to claim 35% margin money subsidy.',
    timeline: [
      { step: 'Application Submitted on Portal', date: '2026-08-26', completed: true },
      { step: 'Document Review by Task Force', date: '2026-08-27', completed: true },
      { step: 'Upload Pending Rural Certificate', date: 'Action Required', completed: false },
      { step: 'Bank Sanction & Subsidy Lock-in', date: 'Pending', completed: false }
    ]
  }
];

export default MOCK_APPLICATIONS;
