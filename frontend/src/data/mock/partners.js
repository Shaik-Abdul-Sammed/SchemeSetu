/**
 * SchemeSetu Centralized Mock Dataset - Financial & Implementation Partners
 * Prototype / Demo Dataset for SIH 2026
 */

export const MOCK_PARTNERS = [
  {
    id: 'partner-001',
    name: 'State Bank of India - MSME Development Branch',
    type: 'Public Sector Bank',
    coordinates: {
      lat: 13.0827,
      lng: 80.2707
    },
    schemes: ['scheme-001', 'scheme-002', 'scheme-003', 'scheme-004', 'scheme-005', 'scheme-006', 'scheme-007', 'scheme-008', 'scheme-009', 'scheme-010', 'scheme-011'],
    fundAvailable: true,
    npaStatus: 'low',
    address: 'No. 22, Rajaji Salai, George Town, Chennai, Tamil Nadu 600001',
    phone: '+91-44-25300000',
    distanceKm: 0.8,
    distanceText: '0.8 km',
    manager: 'R. Sundaram',
    timing: '10:00 AM - 4:00 PM',
    supportedServices: ['MUDRA Sanction', 'PMEGP Subsidy Claim', 'Stand-Up India Desk', 'KCC Loan', 'ULI Instant Verification']
  },
  {
    id: 'partner-002',
    name: 'Canara Bank - Micro & SME Center',
    type: 'Public Sector Bank',
    coordinates: {
      lat: 13.0569,
      lng: 80.2425
    },
    schemes: ['scheme-001', 'scheme-002', 'scheme-003', 'scheme-005', 'scheme-008', 'scheme-010'],
    fundAvailable: true,
    npaStatus: 'low',
    address: '563, Anna Salai, Teynampet, Chennai, Tamil Nadu 600018',
    phone: '+91-44-24340022',
    distanceKm: 2.1,
    distanceText: '2.1 km',
    manager: 'V. Lakshmi',
    timing: '10:00 AM - 4:30 PM',
    supportedServices: ['PM SVANidhi Onboarding', 'MUDRA Kishore Processing', 'Digital KYC & DBT Linkage']
  },
  {
    id: 'partner-003',
    name: 'Indian Bank - Entrepreneurship Support Hub',
    type: 'Public Sector Bank',
    coordinates: {
      lat: 13.0418,
      lng: 80.2341
    },
    schemes: ['scheme-002', 'scheme-003', 'scheme-004', 'scheme-005', 'scheme-007'],
    fundAvailable: true,
    npaStatus: 'medium',
    address: '254, Avvai Shanmugam Salai, Royapettah, Chennai, Tamil Nadu 600014',
    phone: '+91-44-28134567',
    distanceKm: 3.4,
    distanceText: '3.4 km',
    manager: 'K. Balaji',
    timing: '10:00 AM - 4:00 PM',
    supportedServices: ['Self-Help Group Financing', 'Kisan Credit Card', 'Artisan Working Capital']
  },
  {
    id: 'partner-004',
    name: 'SIDBI Financial Services Hub',
    type: 'Development Financial Institution',
    coordinates: {
      lat: 13.0112,
      lng: 80.2220
    },
    schemes: ['scheme-001', 'scheme-004', 'scheme-006', 'scheme-009', 'scheme-011'],
    fundAvailable: true,
    npaStatus: 'low',
    address: 'Guindy Industrial Estate, Chennai, Tamil Nadu 600032',
    phone: '+91-44-22501234',
    distanceKm: 6.2,
    distanceText: '6.2 km',
    manager: 'M. Anand Kumar',
    timing: '9:30 AM - 5:30 PM',
    supportedServices: ['CGTMSE Guarantee Enrolment', 'Stand-Up India Facilitation', 'Greenfield Project Appraisal']
  },
  {
    id: 'partner-005',
    name: 'Punjab National Bank - MSME Lead Hub, Hyderabad',
    type: 'Public Sector Bank',
    coordinates: {
      lat: 17.3850,
      lng: 78.4867
    },
    schemes: ['scheme-001', 'scheme-002', 'scheme-003', 'scheme-004', 'scheme-006', 'scheme-008'],
    fundAvailable: true,
    npaStatus: 'low',
    address: 'Bank Street, Koti, Hyderabad, Telangana 500095',
    phone: '+91-40-24651234',
    distanceKm: 1.5,
    distanceText: '1.5 km',
    manager: 'S. K. Verma',
    timing: '10:00 AM - 4:00 PM',
    supportedServices: ['PMEGP Subsidy Claims', 'MUDRA Loan Sanctions', 'SC/ST Hub Guidance Desk']
  },
  {
    id: 'partner-006',
    name: 'Union Bank of India - Digital Seva Mitra Branch, Vijayawada',
    type: 'Public Sector Bank',
    coordinates: {
      lat: 16.5062,
      lng: 80.6480
    },
    schemes: ['scheme-001', 'scheme-002', 'scheme-003', 'scheme-004', 'scheme-005', 'scheme-007'],
    fundAvailable: true,
    npaStatus: 'low',
    address: 'MG Road, Governorpet, Vijayawada, Andhra Pradesh 520002',
    phone: '+91-866-2578901',
    distanceKm: 2.0,
    distanceText: '2.0 km',
    manager: 'P. Venkat Rao',
    timing: '10:00 AM - 4:00 PM',
    supportedServices: ['PM-KISAN KCC Desks', 'PM SVANidhi Cashbacks', 'Mudra Shishu Quick-Approval']
  },
  {
    id: 'partner-007',
    name: 'Bank of Baroda MSME Center, Bengaluru',
    type: 'Public Sector Bank',
    coordinates: {
      lat: 12.9716,
      lng: 77.5946
    },
    schemes: ['scheme-001', 'scheme-002', 'scheme-003', 'scheme-004', 'scheme-006', 'scheme-009'],
    fundAvailable: true,
    npaStatus: 'low',
    address: 'Prithvi Building, MG Road, Bengaluru, Karnataka 560001',
    phone: '+91-80-25581234',
    distanceKm: 2.8,
    distanceText: '2.8 km',
    manager: 'Anitha Hegde',
    timing: '10:00 AM - 4:00 PM',
    supportedServices: ['Tech Startup MSE Loans', 'CGTMSE Guarantees', 'Women Entrepreneur Margin Subventions']
  },
  {
    id: 'partner-008',
    name: 'State Bank of India - Parliament Street Lead Branch, New Delhi',
    type: 'Public Sector Bank',
    coordinates: {
      lat: 28.6139,
      lng: 77.2090
    },
    schemes: ['scheme-001', 'scheme-002', 'scheme-003', 'scheme-004', 'scheme-005', 'scheme-006', 'scheme-008', 'scheme-011'],
    fundAvailable: true,
    npaStatus: 'low',
    address: '11, Parliament Street, New Delhi 110001',
    phone: '+91-11-23741234',
    distanceKm: 1.1,
    distanceText: '1.1 km',
    manager: 'Rajeev Sharma',
    timing: '10:00 AM - 4:00 PM',
    supportedServices: ['National Scheme Clearing Desk', 'MUDRA & PMEGP Direct Disbursement']
  },
  {
    id: 'partner-009',
    name: 'Bank of India - SME Specialized Center, Mumbai',
    type: 'Public Sector Bank',
    coordinates: {
      lat: 19.0760,
      lng: 72.8777
    },
    schemes: ['scheme-001', 'scheme-002', 'scheme-004', 'scheme-006', 'scheme-009', 'scheme-010'],
    fundAvailable: true,
    npaStatus: 'low',
    address: 'Star House, Bandra-Kurla Complex, Bandra (E), Mumbai, Maharashtra 400051',
    phone: '+91-22-66681234',
    distanceKm: 3.5,
    distanceText: '3.5 km',
    manager: 'Deepak Joshi',
    timing: '9:45 AM - 4:30 PM',
    supportedServices: ['Food Processing Cluster Financing', 'Industrial Machinery Credit Lines']
  },
  {
    id: 'partner-010',
    name: 'CSC Digital Seva Kendra - National Network Hub, Lucknow',
    type: 'Common Service Center (CSC)',
    coordinates: {
      lat: 26.8467,
      lng: 80.9462
    },
    schemes: ['scheme-002', 'scheme-003', 'scheme-005', 'scheme-007', 'scheme-008', 'scheme-012'],
    fundAvailable: true,
    npaStatus: 'low',
    address: 'Hazratganj Main Market, Lucknow, Uttar Pradesh 226001',
    phone: '+91-522-2621234',
    distanceKm: 1.8,
    distanceText: '1.8 km',
    manager: 'VLE Amit Trivedi',
    timing: '8:30 AM - 7:00 PM',
    supportedServices: ['Biometric Aadhaar eKYC', 'PM Vishwakarma Artisan Onboarding', 'Ayushman PVC Card Printing']
  }
];

export default MOCK_PARTNERS;
