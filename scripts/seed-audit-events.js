const fs = require('fs');
const path = require('path');
const { logAuditEvent, AUDIT_EVENT_TYPES } = require('../backend/src/services/auditLogger');

const events = [
  { type: AUDIT_EVENT_TYPES.LOGIN, user: 'demo@schemesetu.in', details: { role: 'beneficiary', authMethod: 'demo_token' } },
  { type: AUDIT_EVENT_TYPES.SCHEME_SEARCH, user: 'demo@schemesetu.in', details: { query: 'SC subsidy manufacturing loans', filters: { category: 'SC', state: 'Telangana' } } },
  { type: AUDIT_EVENT_TYPES.RECOMMENDATION, user: 'USER-001', details: { applicant: 'Ramesh Kumar', topScheme: 'dalit-bandhu', matchScore: 98 } },
  { type: AUDIT_EVENT_TYPES.DOCUMENT_UPLOADED, user: 'USER-001', details: { filename: 'sample-sc-profile.pdf', mimeType: 'application/pdf', sizeBytes: 2450 } },
  { type: AUDIT_EVENT_TYPES.DOCUMENT_PROCESSED, user: 'USER-001', details: { filename: 'sample-sc-profile.pdf', extractedFields: ['name', 'category', 'annualIncome'], status: 'PROCESSED' } },
  { type: AUDIT_EVENT_TYPES.APPLICATION_CREATED, user: 'USER-001', details: { applicationId: 'SS-2026-100001', schemeId: 'dalit-bandhu', requestedAmount: 1000000 } },
  { type: AUDIT_EVENT_TYPES.APPLICATION_UPDATED, user: 'SYSTEM_CRON', details: { applicationId: 'SS-2026-100001', oldStatus: 'Approved', newStatus: 'Disbursed' } },
  { type: AUDIT_EVENT_TYPES.RAG_QUERY, user: 'USER-002', details: { query: 'What is PMEGP subsidy rate for SC in rural areas?', topDoc: 'rag-pmegp-subsidy.txt', score: 0.92 } },
  { type: AUDIT_EVENT_TYPES.AGENT_EXECUTION, user: 'USER-001', details: { agent: 'IntakeAgent', goal: 'Evaluate fabrication project viability', executionStatus: 'SUCCESS' } },
  { type: AUDIT_EVENT_TYPES.DELIVERABLE_GENERATED, user: 'USER-001', details: { deliverableType: 'BeneficiaryIntakeReport', applicationId: 'SS-2026-100002' } },
  { type: AUDIT_EVENT_TYPES.LOGIN, user: 'vle@schemesetu.in', details: { role: 'vle_operator', kioskId: 'VLE-HYD-001' } },
  { type: AUDIT_EVENT_TYPES.SCHEME_SEARCH, user: 'USER-004', details: { query: 'PM Vishwakarma artisan toolkit', filters: { trade: 'carpenter' } } },
  { type: AUDIT_EVENT_TYPES.RECOMMENDATION, user: 'USER-004', details: { applicant: 'Biram Soyam', topScheme: 'pm-vishwakarma', matchScore: 92 } },
  { type: AUDIT_EVENT_TYPES.APPLICATION_CREATED, user: 'USER-004', details: { applicationId: 'SS-2026-100006', schemeId: 'pm-vishwakarma', requestedAmount: 100000 } },
  { type: AUDIT_EVENT_TYPES.DOCUMENT_UPLOADED, user: 'USER-005', details: { filename: 'sample-project-report.pdf', mimeType: 'application/pdf', sizeBytes: 15400 } },
  { type: AUDIT_EVENT_TYPES.RAG_QUERY, user: 'USER-006', details: { query: 'How to claim Stand Up India greenfield loan?', topDoc: 'rag-stand-up-india.txt', score: 0.88 } },
  { type: AUDIT_EVENT_TYPES.LOGIN, user: 'admin@schemesetu.in', details: { role: 'super_admin' } },
  { type: AUDIT_EVENT_TYPES.APPLICATION_UPDATED, user: 'admin@schemesetu.in', details: { applicationId: 'SS-2026-100005', status: 'Documents Required' } },
  { type: AUDIT_EVENT_TYPES.LOGOUT, user: 'demo@schemesetu.in', details: { sessionDurationSeconds: 1420 } },
  { type: AUDIT_EVENT_TYPES.DELIVERABLE_GENERATED, user: 'USER-005', details: { deliverableType: 'BankProjectDPR', format: 'PDF' } }
];

events.forEach(e => {
  logAuditEvent(e.type, e.user, e.details);
});

console.log(`✅ Successfully logged ${events.length} audit events!`);
