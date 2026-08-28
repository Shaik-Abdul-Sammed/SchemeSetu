const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Comprehensive Mock Data Fallbacks
const MOCK_SCHEMES_RECOMMENDATION = [
  {
    id: 'pm-kisan',
    name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    category: 'Agriculture & Rural Development',
    level: 'Central',
    beneficiary: 'Farmers & Agri-Entrepreneurs',
    department: 'Ministry of Agriculture and Farmers Welfare',
    interestRate: 4.0,
    minLoan: 10000,
    maxLoan: 300000,
    tenureMonths: 36,
    moratoriumMonths: 6,
    summary: 'Direct income support of ₹6,000 per year and low-interest crop/agri business loans for eligible farmer households.',
    benefits: '₹6,000 annual direct benefit + up to ₹3 Lakh loan at 4% subsidized interest rate.',
    eligibility: {
      maxIncome: 500000,
      education: ['any'],
      locations: ['All India']
    },
    matchScore: 96,
    matchReasons: [
      'Your household annual income fits within the ₹5 Lakh threshold.',
      'Your project category aligns with agricultural and allied rural business initiatives.',
      'SC Beneficiary priority access applies for direct benefit transfer.'
    ]
  },
  {
    id: 'pmmy-kishore',
    name: 'Pradhan Mantri Mudra Yojana (PMMY) - Kishore',
    category: 'Micro Enterprise Loan',
    level: 'Central',
    beneficiary: 'Micro & Small Entrepreneurs',
    department: 'Ministry of Finance / SIDBI',
    interestRate: 7.5,
    minLoan: 50000,
    maxLoan: 500000,
    tenureMonths: 60,
    moratoriumMonths: 6,
    summary: 'Collateral-free business development loan from ₹50,000 to ₹5 Lakhs for expanding existing micro units.',
    benefits: 'No collateral required, flexible 6-month moratorium, attractive 7.5% interest rate.',
    eligibility: {
      maxIncome: 800000,
      education: ['8th pass', '10th pass', '12th pass', 'graduate', 'any'],
      locations: ['All India']
    },
    matchScore: 92,
    matchReasons: [
      'Your required project cost fits cleanly inside the ₹5 Lakh Kishore bracket.',
      'No collateral security is required for micro unit expansion.',
      'Flexible 60-month repayment schedule with a 6-month moratorium.'
    ]
  },
  {
    id: 'stand-up-india',
    name: 'Stand-Up India Scheme for SC/ST & Women',
    category: 'SC/ST Entrepreneurship',
    level: 'Central',
    beneficiary: 'SC/ST & Women Entrepreneurs',
    department: 'Department of Financial Services',
    interestRate: 8.0,
    minLoan: 1000000,
    maxLoan: 10000000,
    tenureMonths: 84,
    moratoriumMonths: 18,
    summary: 'Facilitates bank loans between ₹10 Lakhs and ₹1 Crore for setting up greenfield manufacturing, service, or trading enterprises.',
    benefits: 'Up to ₹1 Crore credit assistance with margin money support.',
    eligibility: {
      maxIncome: 1500000,
      education: ['10th pass', 'graduate', 'any'],
      locations: ['All India']
    },
    matchScore: 88,
    matchReasons: [
      'Dedicated allocation reserved for Scheduled Caste (SC) entrepreneurs.',
      'Comprehensive bank handholding and credit guarantee coverage.'
    ]
  }
];

const MOCK_PARTNERS = [
  {
    id: 'partner-001',
    name: 'State Bank of India - MSME Growth Branch',
    type: 'Public Sector Bank',
    address: 'Main Road Branch, Sector 4, New Delhi',
    phone: '+91-11-23456789',
    fundAvailable: true,
    npaStatus: 'low',
    distanceKm: 1.2,
    coordinates: { lat: 28.6139, lng: 77.2090 }
  },
  {
    id: 'partner-002',
    name: 'Canara Bank - Common Service Center Partner',
    type: 'Public Sector Bank',
    address: 'CSC Helpdesk, Commercial Complex, Sector 2',
    phone: '+91-11-28765432',
    fundAvailable: true,
    npaStatus: 'low',
    distanceKm: 2.5,
    coordinates: { lat: 28.6250, lng: 77.2180 }
  },
  {
    id: 'partner-003',
    name: 'Punjab National Bank - Regional Lead Branch',
    type: 'Public Sector Bank',
    address: 'Financial Hub, Block B',
    phone: '+91-11-29988776',
    fundAvailable: false,
    npaStatus: 'medium',
    distanceKm: 4.1,
    coordinates: { lat: 28.6320, lng: 77.2250 }
  }
];

async function fetchWithTimeout(url, options = {}, timeoutMs = 6000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  const token = localStorage.getItem('schemesetu_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal
    });
    clearTimeout(id);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorObj = new Error(data.error || data.message || `HTTP Error ${response.status}`);
      errorObj.status = response.status;
      errorObj.data = data;
      throw errorObj;
    }

    return data;
  } catch (error) {
    clearTimeout(id);

    // Fallback handlers if backend server is unreachable
    if (url.includes('/schemes/recommend')) {
      console.warn("Backend API unreachable, returning mock recommendation data");
      return { success: true, count: MOCK_SCHEMES_RECOMMENDATION.length, schemes: MOCK_SCHEMES_RECOMMENDATION };
    }
    if (url.includes('/calculator/emi')) {
      const body = options.body ? JSON.parse(options.body) : {};
      const P = Number(body.principal || 100000);
      const R = (Number(body.annualInterestRate || 7.5) / 12) / 100;
      const N = Number(body.tenureMonths || 36);
      const emi = Math.round((P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1));
      return {
        success: true,
        calculation: {
          principal: P,
          tenureMonths: N,
          monthlyEMI: emi,
          totalInterest: Math.round((emi * N) - P),
          totalRepayment: Math.round(emi * N)
        }
      };
    }
    if (url.includes('/partners/nearest') || url.includes('/partners')) {
      return { success: true, count: MOCK_PARTNERS.length, partners: MOCK_PARTNERS };
    }
    if (url.includes('/documents/generate')) {
      return {
        success: true,
        documentId: `doc-${Date.now()}`,
        downloadUrl: '/api/v1/documents/file/sample-doc'
      };
    }

    throw error;
  }
}

export const api = {
  get: (endpoint, options) => fetchWithTimeout(`${BASE_URL}${endpoint}`, { method: 'GET', ...options }),
  post: (endpoint, body, options) => fetchWithTimeout(`${BASE_URL}${endpoint}`, { method: 'POST', body: JSON.stringify(body), ...options }),
  put: (endpoint, body, options) => fetchWithTimeout(`${BASE_URL}${endpoint}`, { method: 'PUT', body: JSON.stringify(body), ...options }),
  delete: (endpoint, options) => fetchWithTimeout(`${BASE_URL}${endpoint}`, { method: 'DELETE', ...options })
};
