/**
 * SchemeSetu Central API Service
 * Connects to Express Backend with seamless local mock fallback resilience
 */

import { 
  MOCK_SCHEMES, 
  MOCK_PARTNERS, 
  MOCK_APPLICATIONS, 
  MOCK_NOTIFICATIONS, 
  MOCK_USERS, 
  MOCK_RECOMMENDATIONS 
} from '../data/mock';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Haversine distance calculator helper for partner proximity
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

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

    // ==========================================
    // SEAMLESS CLIENT-SIDE MOCK FALLBACK HANDLERS
    // ==========================================

    // 1. Schemes List
    if (url.endsWith('/schemes') || url.includes('/schemes?')) {
      const urlObj = new URL(url, window.location.origin);
      const query = (urlObj.searchParams.get('query') || '').toLowerCase().trim();
      const category = urlObj.searchParams.get('category');
      const level = urlObj.searchParams.get('level');
      const occupation = urlObj.searchParams.get('occupation');

      let filtered = [...MOCK_SCHEMES];

      if (query) {
        filtered = filtered.filter(s => 
          s.name.toLowerCase().includes(query) ||
          s.category.toLowerCase().includes(query) ||
          s.department.toLowerCase().includes(query) ||
          s.summary.toLowerCase().includes(query) ||
          (s.projectTypes && s.projectTypes.some(pt => pt.toLowerCase().includes(query)))
        );
      }

      if (category && category !== 'All' && category !== 'All Categories') {
        filtered = filtered.filter(s => s.category.toLowerCase().includes(category.toLowerCase()));
      }

      if (level && level !== 'All' && level !== 'All Levels') {
        filtered = filtered.filter(s => s.level.toLowerCase() === level.toLowerCase());
      }

      if (occupation && occupation !== 'All') {
        filtered = filtered.filter(s => 
          s.beneficiary.toLowerCase().includes(occupation.toLowerCase()) ||
          (s.projectTypes && s.projectTypes.some(pt => pt.toLowerCase().includes(occupation.toLowerCase())))
        );
      }

      return {
        success: true,
        count: filtered.length,
        total: MOCK_SCHEMES.length,
        schemes: filtered,
        data: filtered
      };
    }

    // 2. Single Scheme by ID
    if (url.includes('/schemes/')) {
      const schemeId = url.split('/schemes/')[1]?.split('?')[0];
      const match = MOCK_SCHEMES.find(s => s.id === schemeId) || MOCK_SCHEMES[0];
      return {
        success: true,
        data: match,
        scheme: match
      };
    }

    // 3. Scheme Recommendations
    if (url.includes('/schemes/recommend')) {
      return {
        success: true,
        count: MOCK_RECOMMENDATIONS.length,
        schemes: MOCK_RECOMMENDATIONS,
        data: MOCK_RECOMMENDATIONS
      };
    }

    // 4. Multi-step Eligibility Check
    if (url.includes('/eligibility/check')) {
      const body = options.body ? JSON.parse(options.body) : {};
      const userIncome = Number(body.annualIncome || 200000);
      const userAge = Number(body.age || 30);
      const userCategory = body.casteCategory || 'General';

      const results = MOCK_SCHEMES.map(scheme => {
        const meetsIncome = !scheme.maxIncome || userIncome <= scheme.maxIncome;
        const meetsAge = userAge >= scheme.minAge && userAge <= scheme.maxAge;
        const isEligible = meetsIncome && meetsAge;

        let matchScore = 70;
        const matchReasons = [];
        const disqualifyReasons = [];

        if (meetsIncome) {
          matchScore += 15;
          matchReasons.push(`Your annual family income (₹${userIncome.toLocaleString('en-IN')}) is within the scheme ceiling of ₹${(scheme.maxIncome || 1000000).toLocaleString('en-IN')}.`);
        } else {
          disqualifyReasons.push(`Income exceeds the scheme limit of ₹${(scheme.maxIncome || 1000000).toLocaleString('en-IN')}.`);
        }

        if (meetsAge) {
          matchScore += 10;
          matchReasons.push(`Your age (${userAge} years) falls within the required age bracket (${scheme.minAge} - ${scheme.maxAge} years).`);
        }

        if (userCategory === 'SC' || userCategory === 'ST') {
          matchScore += 5;
          matchReasons.push(`Priority allocation & margin money subsidy for ${userCategory} category beneficiaries.`);
        }

        return {
          scheme,
          isEligible,
          matchScore: Math.min(98, matchScore),
          eligibilityStatus: isEligible ? 'Eligible' : 'Conditionally Eligible',
          matchReasons,
          disqualifyReasons
        };
      });

      const eligibleList = results.filter(r => r.isEligible).sort((a, b) => b.matchScore - a.matchScore);

      return {
        success: true,
        totalEvaluated: MOCK_SCHEMES.length,
        recommendationsCount: eligibleList.length,
        recommendations: eligibleList.length > 0 ? eligibleList : results.slice(0, 4)
      };
    }

    // 5. EMI Calculator
    if (url.includes('/calculator/emi')) {
      const body = options.body ? JSON.parse(options.body) : {};
      const P = Number(body.principal || 250000);
      const rate = Number(body.annualInterestRate || 7.5);
      const R = (rate / 12) / 100;
      const N = Number(body.tenureMonths || 36);
      const morMonths = Number(body.moratoriumMonths || 0);

      const emi = Math.round((P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1)) || 0;
      const totalRepayment = emi * N;
      const totalInterest = Math.max(0, totalRepayment - P);

      return {
        success: true,
        calculation: {
          principal: P,
          annualInterestRate: rate,
          tenureMonths: N,
          moratoriumMonths: morMonths,
          monthlyEMI: emi,
          totalInterest,
          totalRepayment
        }
      };
    }

    // 6. Nearest Partners Locator
    if (url.includes('/partners/nearest') || url.includes('/partners')) {
      const body = options.body ? JSON.parse(options.body) : {};
      const userLat = Number(body.lat || 13.0827);
      const userLng = Number(body.lng || 80.2707);

      const mappedPartners = MOCK_PARTNERS.map(p => {
        const dist = calculateDistance(userLat, userLng, p.coordinates.lat, p.coordinates.lng);
        return {
          ...p,
          distance: dist,
          distanceKm: dist,
          distanceText: `${dist} km`
        };
      }).sort((a, b) => a.distance - b.distance);

      return {
        success: true,
        count: mappedPartners.length,
        partners: mappedPartners
      };
    }

    // 7. PDF Document Generation
    if (url.includes('/documents/generate')) {
      return {
        success: true,
        documentId: `DOC-${Date.now()}`,
        downloadUrl: '/api/v1/documents/sample-slip',
        message: 'Application slip PDF generated successfully.'
      };
    }

    // 8. User Dashboard Data
    if (url.includes('/user/applications')) {
      const localApps = JSON.parse(localStorage.getItem('schemesetu_applications') || '[]');
      const combined = localApps.length > 0 ? localApps : MOCK_APPLICATIONS;
      return {
        success: true,
        count: combined.length,
        applications: combined,
        data: combined
      };
    }

    if (url.includes('/user/notifications')) {
      return {
        success: true,
        count: MOCK_NOTIFICATIONS.length,
        notifications: MOCK_NOTIFICATIONS,
        data: MOCK_NOTIFICATIONS
      };
    }

    if (url.includes('/user/saved-schemes')) {
      return {
        success: true,
        count: MOCK_SCHEMES.slice(0, 3).length,
        savedSchemes: MOCK_SCHEMES.slice(0, 3),
        data: MOCK_SCHEMES.slice(0, 3)
      };
    }

    // 9. Auth & Agent Endpoints
    if (url.includes('/auth/login') || url.includes('/auth/register')) {
      return {
        success: true,
        token: 'schemesetu_demo_jwt_token_2026',
        user: MOCK_USERS[0]
      };
    }

    if (url.includes('/agent/submit')) {
      return {
        success: true,
        applicationId: `APP-AGENT-${Date.now()}`,
        message: 'Beneficiary profile registered successfully.'
      };
    }

    if (url.includes('/community/questions')) {
      return {
        success: true,
        questions: [
          { 
            id: 'q-1', 
            author: 'Ramesh K.', 
            location: 'Chennai',
            question: 'How long does Mudra loan document verification take at Lead Banks?', 
            upvotes: 14, 
            answers: [{ author: 'VLE Kavitha (Certified Agent)', text: 'Usually 3 to 5 business days for Kishore tier if KYC is complete.' }] 
          },
          { 
            id: 'q-2', 
            author: 'Sita Devi', 
            location: 'Hyderabad',
            question: 'Can street vendors apply for PM SVANidhi without certificate of vending?', 
            upvotes: 9, 
            answers: [{ author: 'SBI MSME Desk', text: 'Yes, you can obtain a Letter of Recommendation (LoR) from your local municipality / ULB office.' }] 
          }
        ]
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
