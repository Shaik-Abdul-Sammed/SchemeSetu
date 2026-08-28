/**
 * SchemeSetu Centralized Mock Dataset - User Profiles
 * Prototype / Demo Dataset for SIH 2026
 */

export const MOCK_USERS = [
  {
    id: 'user-001',
    name: 'Ramesh Kumar',
    email: 'ramesh@example.com',
    role: 'citizen',
    phone: '+91 98765 43210',
    state: 'Tamil Nadu',
    district: 'Chennai',
    income: 240000,
    occupation: 'Small Business / Agriculture',
    casteCategory: 'SC',
    education: '10th pass',
    savedSchemes: ['scheme-002', 'scheme-007', 'scheme-008'],
    appliedSchemes: ['APP-2026-8891', 'APP-2026-9042']
  },
  {
    id: 'vle-001',
    name: 'Kavitha Reddy',
    email: 'vle.kavitha@schemesetu.in',
    role: 'vle_agent',
    phone: '+91 98480 12345',
    state: 'Telangana',
    district: 'Warangal',
    centerName: 'CSC Warangal Digital Seva Kendra',
    totalApplications: 38,
    approvedApplications: 29,
    commissionEarned: 14500
  },
  {
    id: 'admin-001',
    name: 'District Welfare Officer',
    email: 'admin@schemesetu.gov.in',
    role: 'admin',
    phone: '+91 11 2345 6789',
    department: 'Ministry of Social Justice and Empowerment'
  }
];

export default MOCK_USERS;
