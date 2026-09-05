const fs = require('fs');
const path = require('path');
const schemesData = require('../data/schemesData');

// Fallback Schemes Dataset (guaranteed available even if files are missing)
const FALLBACK_SCHEMES = [
  {
    id: 'scheme-001',
    name: 'Pradhan Mantri Mudra Yojana (PMMY) - Tarun',
    category: 'Micro/Small Enterprise Loan',
    projectTypes: ['manufacturing', 'services', 'trading', 'food processing', 'retail', 'agriculture allied'],
    interestRate: 8.5,
    minLoan: 500000,
    maxLoan: 1000000,
    tenure: '60 months',
    tenureMonths: 60,
    moratorium: '6 months',
    moratoriumMonths: 6,
    description: 'Funding for established small businesses aiming for growth and expansion up to 10 Lakhs without collateral requirement.',
    eligibility: {
      minIncome: 0,
      maxIncome: 1000000,
      education: ['10th pass', '12th pass', 'graduate', 'post graduate', 'diploma', 'any'],
      locations: ['All India', 'Tamil Nadu', 'Andhra Pradesh', 'Karnataka', 'Maharashtra', 'Telangana', 'Delhi', 'Gujarat']
    }
  },
  {
    id: 'scheme-002',
    name: 'Pradhan Mantri Mudra Yojana (PMMY) - Kishore',
    category: 'Micro Enterprise Loan',
    projectTypes: ['manufacturing', 'services', 'trading', 'food processing', 'handicrafts', 'textiles', 'retail'],
    interestRate: 7.5,
    minLoan: 50000,
    maxLoan: 500000,
    tenure: '60 months',
    tenureMonths: 60,
    moratorium: '6 months',
    moratoriumMonths: 6,
    description: 'Provides financial support from Rs. 50,000 up to Rs. 5 Lakhs for developing and growing micro business units.',
    eligibility: {
      minIncome: 0,
      maxIncome: 500000,
      education: ['8th pass', '10th pass', '12th pass', 'graduate', 'diploma', 'any'],
      locations: ['All India', 'Tamil Nadu', 'Andhra Pradesh', 'Karnataka', 'Maharashtra', 'Telangana', 'Delhi', 'Kerala', 'Uttar Pradesh']
    }
  },
  {
    id: 'scheme-003',
    name: 'Pradhan Mantri Mudra Yojana (PMMY) - Shishu',
    category: 'Micro Enterprise Seed Loan',
    projectTypes: ['retail', 'street vending', 'handicrafts', 'services', 'food processing', 'agriculture allied'],
    interestRate: 6.5,
    minLoan: 10000,
    maxLoan: 50000,
    tenure: '36 months',
    tenureMonths: 36,
    moratorium: '3 months',
    moratoriumMonths: 3,
    description: 'Targeted at early-stage small entrepreneurs and street vendors needing startup working capital up to Rs. 50,000.',
    eligibility: {
      minIncome: 0,
      maxIncome: 300000,
      education: ['none', 'primary', '8th pass', '10th pass', 'any'],
      locations: ['All India', 'Tamil Nadu', 'Andhra Pradesh', 'Karnataka', 'Maharashtra', 'Delhi', 'West Bengal', 'Bihar', 'Rajasthan']
    }
  },
  {
    id: 'scheme-004',
    name: 'Prime Minister Employment Generation Programme (PMEGP)',
    category: 'Credit-Linked Subsidy Scheme',
    projectTypes: ['manufacturing', 'services', 'food processing', 'agro-based industry', 'textiles', 'engineering'],
    interestRate: 9.0,
    minLoan: 100000,
    maxLoan: 2500000,
    tenure: '84 months',
    tenureMonths: 84,
    moratorium: '6 months',
    moratoriumMonths: 6,
    description: 'Credit-linked subsidy program to generate self-employment ventures in non-farm sector with capital subsidies between 15% to 35%.',
    eligibility: {
      minIncome: 0,
      maxIncome: 600000,
      education: ['8th pass', '10th pass', '12th pass', 'graduate', 'post graduate', 'diploma'],
      locations: ['All India', 'Andhra Pradesh', 'Tamil Nadu', 'Karnataka', 'Maharashtra', 'Madhya Pradesh', 'Odisha']
    }
  },
  {
    id: 'scheme-005',
    name: 'PM SVANidhi (Street Vendor\'s AtmaNirbhar Nidhi)',
    category: 'Working Capital Microcredit',
    projectTypes: ['street vending', 'food stall', 'retail', 'services', 'food processing'],
    interestRate: 7.0,
    minLoan: 10000,
    maxLoan: 50000,
    tenure: '12 months',
    tenureMonths: 12,
    moratorium: '0 months',
    moratoriumMonths: 0,
    description: 'Special micro-credit facility providing affordable working capital loans to urban and peri-urban street vendors with 7% interest subsidy on timely repayment.',
    eligibility: {
      minIncome: 0,
      maxIncome: 250000,
      education: ['none', 'primary', 'any'],
      locations: ['All India', 'Andhra Pradesh', 'Tamil Nadu', 'Karnataka', 'Maharashtra', 'Delhi', 'Gujarat', 'Telangana']
    }
  },
  {
    id: 'scheme-006',
    name: 'Stand-Up India Scheme',
    category: 'SC/ST & Women Entrepreneurship Loan',
    projectTypes: ['manufacturing', 'services', 'trading', 'food processing', 'agri-business'],
    interestRate: 8.0,
    minLoan: 1000000,
    maxLoan: 10000000,
    tenure: '84 months',
    tenureMonths: 84,
    moratorium: '18 months',
    moratoriumMonths: 18,
    description: 'Facilitates bank loans between 10 Lakhs and 1 Crore to at least one SC or ST borrower and at least one woman borrower per bank branch.',
    eligibility: {
      minIncome: 0,
      maxIncome: 1500000,
      education: ['10th pass', '12th pass', 'graduate', 'diploma', 'any'],
      locations: ['All India', 'Tamil Nadu', 'Andhra Pradesh', 'Karnataka', 'Maharashtra', 'Delhi', 'Punjab', 'Haryana']
    }
  }
];

// Fallback Partners Dataset
const FALLBACK_PARTNERS = [
  {
    id: 'partner-001',
    name: 'State Bank of India - MSME Development Branch',
    type: 'Public Sector Bank',
    coordinates: { lat: 13.0827, lng: 80.2707 },
    schemes: ['scheme-001', 'scheme-002', 'scheme-003', 'scheme-004', 'scheme-005', 'scheme-006', 'pm-kisan', 'ayushman-bharat'],
    fundAvailable: true,
    npaStatus: 'low',
    address: 'No. 22, Rajaji Salai, George Town, Chennai, Tamil Nadu 600001',
    phone: '+91-44-25300000'
  },
  {
    id: 'partner-002',
    name: 'Canara Bank - Micro & SME Center',
    type: 'Public Sector Bank',
    coordinates: { lat: 13.0569, lng: 80.2425 },
    schemes: ['scheme-001', 'scheme-002', 'scheme-003', 'scheme-005', 'pm-kisan'],
    fundAvailable: true,
    npaStatus: 'low',
    address: '563, Anna Salai, Teynampet, Chennai, Tamil Nadu 600018',
    phone: '+91-44-24340022'
  },
  {
    id: 'partner-003',
    name: 'Indian Bank - Entrepreneurship Support Hub',
    type: 'Public Sector Bank',
    coordinates: { lat: 13.0418, lng: 80.2341 },
    schemes: ['scheme-002', 'scheme-003', 'scheme-004', 'scheme-005'],
    fundAvailable: true,
    npaStatus: 'medium',
    address: '254, Avvai Shanmugam Salai, Royapettah, Chennai, Tamil Nadu 600014',
    phone: '+91-44-28134567'
  },
  {
    id: 'partner-004',
    name: 'SIDBI Financial Services Hub',
    type: 'Development Financial Institution',
    coordinates: { lat: 13.0112, lng: 80.2220 },
    schemes: ['scheme-001', 'scheme-004', 'scheme-006'],
    fundAvailable: true,
    npaStatus: 'low',
    address: 'Guindy Industrial Estate, Chennai, Tamil Nadu 600032',
    phone: '+91-44-22501234'
  },
  {
    id: 'partner-005',
    name: 'NABARD District Development Office - Vijayawada',
    type: 'Rural Development Institution',
    coordinates: { lat: 16.5062, lng: 80.6480 },
    schemes: ['scheme-001', 'scheme-002', 'scheme-003', 'scheme-004', 'scheme-005', 'pm-kisan'],
    fundAvailable: true,
    npaStatus: 'low',
    address: 'MG Road, Governorpet, Vijayawada, Andhra Pradesh 520002',
    phone: '+91-866-2578901'
  },
  {
    id: 'partner-006',
    name: 'Bank of Baroda MSME Center - Bengaluru',
    type: 'Public Sector Bank',
    coordinates: { lat: 12.9716, lng: 77.5946 },
    schemes: ['scheme-001', 'scheme-002', 'scheme-003', 'scheme-004', 'scheme-006'],
    fundAvailable: true,
    npaStatus: 'low',
    address: 'MG Road, Bengaluru, Karnataka 560001',
    phone: '+91-80-25581234'
  }
];

let registeredPartners = [];

function normalizeScheme(raw, index) {
  if (!raw || typeof raw !== 'object') return null;

  const id = raw.id || raw.schemeId || raw.scheme_id || `scheme-${String(index + 1).padStart(3, '0')}`;
  const name = raw.name || raw.schemeName || raw.scheme_name || 'Government Assistance Scheme';
  const category = raw.category || raw.schemeCategory || raw.scheme_category || 'General';

  const rawProjectTypes = raw.projectTypes || raw.project_types || raw.projectType || raw.project_type || ['all'];
  const projectTypes = Array.isArray(rawProjectTypes)
    ? rawProjectTypes.map(p => String(p).toLowerCase().trim())
    : (typeof rawProjectTypes === 'string' ? [rawProjectTypes.toLowerCase().trim()] : ['all']);

  const interestRate = Number(raw.interestRate !== undefined ? raw.interestRate : 7.0);
  const minLoan = Number(raw.minLoan !== undefined ? raw.minLoan : 0);
  const maxLoan = Number(raw.maxLoan !== undefined ? raw.maxLoan : (raw.maxIncome || 1000000));
  const tenureMonths = Number(raw.tenureMonths || 60);
  const moratoriumMonths = Number(raw.moratoriumMonths || 0);
  const description = raw.description || raw.summary || '';

  const rawEligibility = raw.eligibility || {};
  const minIncome = Number(rawEligibility.minIncome !== undefined ? rawEligibility.minIncome : 0);
  const maxIncome = Number(rawEligibility.maxIncome !== undefined ? rawEligibility.maxIncome : (raw.maxIncome || 500000));

  const rawEducation = rawEligibility.education || raw.education || ['any'];
  const education = Array.isArray(rawEducation)
    ? rawEducation.map(e => String(e).toLowerCase().trim())
    : [String(rawEducation).toLowerCase().trim()];

  const rawLocations = rawEligibility.locations || raw.locations || [raw.state || 'All India'];
  const locations = Array.isArray(rawLocations)
    ? rawLocations.map(l => String(l).trim())
    : [String(rawLocations).trim()];

  return {
    ...raw,
    id: String(id),
    name: String(name),
    category: String(category),
    projectTypes,
    interestRate,
    minLoan,
    maxLoan,
    tenureMonths,
    moratoriumMonths,
    description: String(description),
    eligibility: {
      ...(raw.eligibility || {}),
      minIncome,
      maxIncome,
      education,
      locations
    }
  };
}

function normalizePartner(raw, index) {
  if (!raw || typeof raw !== 'object') return null;

  const id = raw.id || raw.partnerId || `partner-${String(index + 1).padStart(3, '0')}`;
  const name = raw.name || raw.partnerName || 'Financial Partner';
  const type = raw.type || 'Bank';

  let coordinates = { lat: 0, lng: 0 };
  if (raw.coordinates && typeof raw.coordinates === 'object') {
    coordinates.lat = Number(raw.coordinates.lat || 0);
    coordinates.lng = Number(raw.coordinates.lng || 0);
  } else if (raw.lat !== undefined && raw.lng !== undefined) {
    coordinates.lat = Number(raw.lat);
    coordinates.lng = Number(raw.lng);
  }

  const rawSchemes = raw.schemes || [];
  const schemes = Array.isArray(rawSchemes) ? rawSchemes.map(s => String(s).trim()) : [];
  const fundAvailable = raw.fundAvailable !== undefined ? Boolean(raw.fundAvailable) : true;
  const npaStatus = String(raw.npaStatus || 'low').toLowerCase().trim();
  const address = raw.address || 'Local Branch';
  const phone = raw.phone || 'N/A';
  const state = raw.state || '';
  const district = raw.district || '';

  return {
    id: String(id),
    name: String(name),
    type: String(type),
    coordinates,
    schemes,
    fundAvailable,
    npaStatus,
    address: String(address),
    phone: String(phone),
    state: String(state),
    district: String(district)
  };
}

function loadSchemes() {
  const datasetMap = new Map();

  FALLBACK_SCHEMES.map(normalizeScheme).forEach(s => {
    if (s) datasetMap.set(s.id.toLowerCase(), s);
  });

  schemesData.map(normalizeScheme).forEach(s => {
    if (s && !datasetMap.has(s.id.toLowerCase())) {
      datasetMap.set(s.id.toLowerCase(), s);
    }
  });

  return Array.from(datasetMap.values());
}

function loadPartners() {
  const datasetMap = new Map();

  // Try loading from database/seeders/data/partners.json
  try {
    const seedPath = path.resolve(__dirname, '../../../database/seeders/data/partners.json');
    if (fs.existsSync(seedPath)) {
      const seedData = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
      if (Array.isArray(seedData)) {
        seedData.map(normalizePartner).forEach(p => {
          if (p) datasetMap.set(p.id.toLowerCase(), p);
        });
      }
    }
  } catch (e) {
    console.warn('[dataService] Failed to load partners.json:', e.message);
  }

  // Also include fallback partners
  FALLBACK_PARTNERS.map(normalizePartner).forEach(p => {
    if (p && !datasetMap.has(p.id.toLowerCase())) {
      datasetMap.set(p.id.toLowerCase(), p);
    }
  });

  // Include in-memory registered partners
  for (const reg of registeredPartners) {
    if (reg && reg.id) {
      datasetMap.set(reg.id.toLowerCase(), reg);
    }
  }

  return Array.from(datasetMap.values());
}

function getSchemes() {
  return loadSchemes();
}

function getSchemeById(id) {
  const schemes = loadSchemes();
  return schemes.find(s => String(s.id).toLowerCase() === String(id).toLowerCase()) || null;
}

function getPartners() {
  return loadPartners();
}

function getPartnerById(id) {
  const partners = loadPartners();
  return partners.find(p => String(p.id).toLowerCase() === String(id).toLowerCase()) || null;
}

function addPartner(partnerData) {
  const normalized = normalizePartner(partnerData, registeredPartners.length + 100);
  if (!normalized.id || normalized.id.startsWith('partner-')) {
    normalized.id = partnerData.id || `partner-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
  registeredPartners.push(normalized);
  return normalized;
}

module.exports = {
  getSchemes,
  getSchemeById,
  getPartners,
  getPartnerById,
  addPartner,
  normalizeScheme,
  normalizePartner
};
