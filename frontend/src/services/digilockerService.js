/**
 * digilockerService.js — DigiLocker Document Verification Service
 * ─────────────────────────────────────────────────────────────────────────────
 * Simulates DigiLocker OAuth 2.0 flow to fetch verified government certificates:
 *   - Aadhaar Card
 *   - Income Certificate
 *   - Caste Certificate
 *   - Cultivable Land Record (RoR / Khatauni)
 */
'use strict';

export async function simulateDigiLockerFetch(docType = 'aadhaar') {
  return new Promise((resolve) => {
    setTimeout(() => {
      const MOCK_DOCS = {
        aadhaar: {
          docId: 'DL-AADHAAR-9874',
          title: 'Verified Aadhaar Card',
          issuer: 'Unique Identification Authority of India (UIDAI)',
          issuedTo: 'Ravi Kumar',
          verifiedAt: new Date().toISOString().split('T')[0],
          status: 'verified',
        },
        income: {
          docId: 'DL-INC-2026-88',
          title: 'Annual Income Certificate',
          issuer: 'Revenue Department, Government of Andhra Pradesh',
          annualIncome: 180000,
          verifiedAt: new Date().toISOString().split('T')[0],
          status: 'verified',
        },
        land: {
          docId: 'DL-ROR-1092',
          title: 'Record of Rights (Khatauni / Land Record)',
          issuer: 'District Revenue Authority',
          landArea: '1.8 Acres',
          verifiedAt: new Date().toISOString().split('T')[0],
          status: 'verified',
        }
      };

      resolve(MOCK_DOCS[docType] || MOCK_DOCS.aadhaar);
    }, 800);
  });
}
