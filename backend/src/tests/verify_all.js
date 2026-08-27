const http = require('http');
const app = require('../index');
const dataService = require('../services/dataService');
const { haversineDistance } = require('../utils/haversine');

async function runTests() {
  const server = http.createServer(app);

  await new Promise((resolve) => {
    server.listen(5001, () => {
      console.log('Test server running on port 5001');
      resolve();
    });
  });

  const BASE = 'http://localhost:5001';
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAIL: ${name} ->`, err.message);
      failed++;
    }
  }

  function assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  async function request(method, path, body = null, headers = {}) {
    const opts = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    if (body) {
      opts.body = typeof body === 'string' ? body : JSON.stringify(body);
    }
    const res = await fetch(`${BASE}${path}`, opts);
    let data;
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = await res.text();
    }
    return { status: res.status, headers: res.headers, data };
  }

  console.log('\n--- 1. Health Endpoints ---');
  await test('GET /api/health returns 200 OK', async () => {
    const res = await request('GET', '/api/health');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.status === 'OK', 'Expected status OK');
    assert(res.data.message === 'SchemeSetu Backend is running', 'Expected message');
    assert(res.data.timestamp, 'Expected timestamp');
  });

  await test('GET /api/v1/health returns 200 OK', async () => {
    const res = await request('GET', '/api/v1/health');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.status === 'OK', 'Expected status OK');
  });

  console.log('\n--- 2. Schemes Endpoints ---');
  await test('GET /api/v1/schemes returns paginated schemes', async () => {
    const res = await request('GET', '/api/v1/schemes?page=1&limit=5');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(res.data.schemes), 'Expected schemes array');
    assert(res.data.schemes.length > 0, 'Expected non-empty schemes');
    assert(res.data.pagination, 'Expected pagination');
    assert(res.data.pagination.page === 1, 'Expected page 1');
  });

  await test('GET /api/v1/schemes/:id returns scheme details', async () => {
    const res = await request('GET', '/api/v1/schemes/scheme-001');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.id === 'scheme-001', 'Expected scheme-001');
    assert(res.data.name, 'Expected scheme name');
    assert(typeof res.data.interestRate === 'number', 'Expected interestRate number');
  });

  await test('GET /api/v1/schemes/non-existent returns 404', async () => {
    const res = await request('GET', '/api/v1/schemes/invalid-id-xyz');
    assert(res.status === 404, `Expected 404, got ${res.status}`);
    assert(res.data.success === false, 'Expected success=false');
  });

  await test('POST /api/v1/schemes/recommend returns top 3 ranked recommendations', async () => {
    const payload = {
      projectType: 'food processing',
      cost: 250000,
      income: 300000,
      education: 'graduate',
      location: 'Andhra Pradesh'
    };
    const res = await request('POST', '/api/v1/schemes/recommend', payload);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(res.data.recommendations), 'Expected recommendations array');
    assert(res.data.recommendations.length <= 3, 'Expected <= 3 recommendations');
    assert(res.data.totalEligible >= res.data.recommendations.length, 'Expected totalEligible');
    assert(res.data.recommendations[0].matchScore !== undefined, 'Expected matchScore in recommendation');
  });

  await test('POST /api/v1/schemes/recommend validation error on missing fields', async () => {
    const payload = { cost: 250000 };
    const res = await request('POST', '/api/v1/schemes/recommend', payload);
    assert(res.status === 400, `Expected 400, got ${res.status}`);
    assert(res.data.success === false, 'Expected success=false');
  });

  console.log('\n--- 3. EMI Calculator ---');
  await test('POST /api/v1/calculator/emi calculates EMI with moratorium', async () => {
    const payload = {
      principal: 250000,
      annualRate: 6.5,
      tenureMonths: 60,
      moratoriumMonths: 6
    };
    const res = await request('POST', '/api/v1/calculator/emi', payload);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.principal === 250000, 'Expected principal 250000');
    assert(res.data.accruedInterest === 8125, `Expected accruedInterest 8125, got ${res.data.accruedInterest}`);
    assert(res.data.loanAmount === 258125, `Expected loanAmount 258125, got ${res.data.loanAmount}`);
    assert(res.data.repaymentMonths === 54, `Expected repaymentMonths 54, got ${res.data.repaymentMonths}`);
    assert(res.data.emi > 0, 'Expected positive EMI');
    assert(res.data.totalPayment > res.data.loanAmount, 'Expected totalPayment > loanAmount');
    assert(res.data.currency === 'INR', 'Expected currency INR');
  });

  await test('POST /api/v1/calculator/emi handles 0% interest rate', async () => {
    const payload = {
      principal: 120000,
      annualRate: 0,
      tenureMonths: 12,
      moratoriumMonths: 0
    };
    const res = await request('POST', '/api/v1/calculator/emi', payload);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.emi === 10000, `Expected emi 10000, got ${res.data.emi}`);
    assert(res.data.totalInterest === 0, 'Expected 0 totalInterest');
  });

  await test('POST /api/v1/calculator/emi validates moratoriumMonths < tenureMonths', async () => {
    const payload = {
      principal: 100000,
      annualRate: 8,
      tenureMonths: 12,
      moratoriumMonths: 12
    };
    const res = await request('POST', '/api/v1/calculator/emi', payload);
    assert(res.status === 400, `Expected 400, got ${res.status}`);
  });

  console.log('\n--- 4. Haversine & Partners ---');
  await test('Haversine distance calculation is accurate', () => {
    // Chennai (13.0827, 80.2707) to Bangalore (12.9716, 77.5946) is ~290 km
    const dist = haversineDistance(13.0827, 80.2707, 12.9716, 77.5946);
    assert(dist > 280 && dist < 305, `Expected dist ~290km, got ${dist}`);
  });

  await test('POST /api/v1/partners/nearest returns closest certified partners', async () => {
    const payload = {
      lat: 13.0827,
      lng: 80.2707,
      schemeId: 'scheme-001',
      maxDistance: 50
    };
    const res = await request('POST', '/api/v1/partners/nearest', payload);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(res.data.partners), 'Expected partners array');
    assert(res.data.totalFound >= res.data.withinRange, 'Expected totalFound >= withinRange');
    assert(res.data.partners.length > 0, 'Expected at least 1 partner in Chennai');
    assert(res.data.partners[0].distance !== undefined, 'Expected distance property');
    assert(res.data.partners[0].distanceText !== undefined, 'Expected distanceText property');
    // Ensure all returned partners have fundAvailable=true and low/medium NPA
    for (const p of res.data.partners) {
      assert(p.fundAvailable === true, 'Expected fundAvailable true');
      assert(p.npaStatus !== 'high' && p.npaStatus !== 'very high', 'Expected non-high NPA');
    }
  });

  await test('GET /api/v1/partners returns paginated partner list', async () => {
    const res = await request('GET', '/api/v1/partners?page=1&limit=5');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(res.data.partners), 'Expected partners array');
    assert(res.data.pagination, 'Expected pagination');
  });

  await test('POST /api/v1/partners/register registers new partner in-memory', async () => {
    const newPartner = {
      name: 'Test Cooperative Bank',
      type: 'Cooperative Bank',
      coordinates: { lat: 13.0900, lng: 80.2800 },
      schemes: ['scheme-001', 'scheme-002'],
      fundAvailable: true,
      npaStatus: 'low',
      address: 'Test Branch, Chennai',
      phone: '+91-44-12345678'
    };
    const res = await request('POST', '/api/v1/partners/register', newPartner);
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    assert(res.data.success === true, 'Expected success=true');
    assert(res.data.partner.id, 'Expected partner id');
  });

  console.log('\n--- 5. Agent Application Workflow ---');
  let createdAppId = null;
  await test('POST /api/v1/agent/submit registers application', async () => {
    const payload = {
      agentId: 'agent-101',
      userId: 'user-202',
      schemeId: 'scheme-001',
      applicationData: { projectType: 'retail', requestedAmount: 300000 }
    };
    const res = await request('POST', '/api/v1/agent/submit', payload);
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    assert(res.data.success === true, 'Expected success=true');
    assert(res.data.applicationId.startsWith('APP-'), 'Expected APP- prefix');
    createdAppId = res.data.applicationId;
  });

  await test('GET /api/v1/agent/users/:agentId returns agent users', async () => {
    const res = await request('GET', '/api/v1/agent/users/agent-101');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.agentId === 'agent-101', 'Expected agent-101');
    assert(Array.isArray(res.data.users), 'Expected users array');
    assert(res.data.users.length === 1, 'Expected 1 user');
    assert(res.data.users[0].userId === 'user-202', 'Expected user-202');
  });

  await test('GET /api/v1/agent/users/:agentId returns [] for unknown agent', async () => {
    const res = await request('GET', '/api/v1/agent/users/non-existent-agent');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(res.data.users) && res.data.users.length === 0, 'Expected empty array');
  });

  console.log('\n--- 6. Document Generation & Download ---');
  let createdDocId = null;
  await test('POST /api/v1/documents/generate generates PDF document', async () => {
    const payload = {
      applicationId: createdAppId,
      user: { name: 'Kavitha Devi', phone: '+91-9876543210', address: 'Madurai, Tamil Nadu' },
      scheme: { id: 'scheme-001', name: 'Pradhan Mantri Mudra Yojana - Tarun' },
      applicationData: { 'Business Category': 'Handicrafts', 'Annual Revenue': '₹4,00,000' }
    };
    const res = await request('POST', '/api/v1/documents/generate', payload);
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    assert(res.data.success === true, 'Expected success=true');
    assert(res.data.documentId.startsWith('DOC-'), 'Expected DOC- prefix');
    assert(res.data.preview.applicantName === 'Kavitha Devi', 'Expected preview applicantName');
    createdDocId = res.data.documentId;
  });

  await test('GET /api/v1/documents/download/:docId returns download URL', async () => {
    const res = await request('GET', `/api/v1/documents/download/${createdDocId}`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.success === true, 'Expected success=true');
    assert(res.data.downloadUrl === `/api/v1/documents/file/${createdDocId}`, 'Expected downloadUrl');
  });

  await test('GET /api/v1/documents/file/:docId streams binary PDF', async () => {
    const res = await fetch(`${BASE}/api/v1/documents/file/${createdDocId}`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const contentType = res.headers.get('content-type');
    assert(contentType && contentType.includes('application/pdf'), `Expected application/pdf, got ${contentType}`);
    const buffer = await res.arrayBuffer();
    assert(buffer.byteLength > 1000, `Expected PDF buffer > 1000 bytes, got ${buffer.byteLength}`);
  });

  console.log('\n--- 7. User Authentication & Feedback ---');
  let userToken = null;
  const testEmail = `testuser_${Date.now()}@example.com`;

  await test('POST /api/v1/users/register creates user and returns JWT', async () => {
    const payload = {
      name: 'Ravi Kumar',
      email: testEmail,
      password: 'password123'
    };
    const res = await request('POST', '/api/v1/users/register', payload);
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    assert(res.data.success === true, 'Expected success=true');
    assert(res.data.user.email === testEmail.toLowerCase(), 'Expected matching email');
    assert(res.data.user.passwordHash === undefined, 'Must not return passwordHash');
    assert(res.data.token, 'Expected JWT token');
    userToken = res.data.token;
  });

  await test('POST /api/v1/users/login verifies credentials and returns JWT', async () => {
    const payload = {
      email: testEmail,
      password: 'password123'
    };
    const res = await request('POST', '/api/v1/users/login', payload);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.success === true, 'Expected success=true');
    assert(res.data.token, 'Expected JWT token');
  });

  await test('POST /api/v1/users/login rejects invalid password', async () => {
    const payload = {
      email: testEmail,
      password: 'wrongpassword'
    };
    const res = await request('POST', '/api/v1/users/login', payload);
    assert(res.status === 401, `Expected 401, got ${res.status}`);
    assert(res.data.success === false, 'Expected success=false');
  });

  await test('POST /api/v1/feedback accepts valid rating and comment', async () => {
    const payload = {
      userId: 'user-202',
      schemeId: 'scheme-001',
      rating: 5,
      comment: 'Very helpful recommendation and partner matching.'
    };
    const res = await request('POST', '/api/v1/feedback', payload);
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    assert(res.data.success === true, 'Expected success=true');
    assert(res.data.feedbackId.startsWith('FB-'), 'Expected FB- prefix');
  });

  await test('POST /api/v1/feedback rejects invalid rating (e.g. 6)', async () => {
    const payload = {
      userId: 'user-202',
      schemeId: 'scheme-001',
      rating: 6,
      comment: 'Invalid'
    };
    const res = await request('POST', '/api/v1/feedback', payload);
    assert(res.status === 400, `Expected 400, got ${res.status}`);
  });

  console.log('\n--- 8. 404 and Error Middleware ---');
  await test('Non-existent route returns formatted 404 JSON', async () => {
    const res = await request('GET', '/api/v1/unknown-route-12345');
    assert(res.status === 404, `Expected 404, got ${res.status}`);
    assert(res.data.success === false, 'Expected success=false');
    assert(res.data.error.includes('Resource not found'), 'Expected 404 message');
  });

  console.log('\n========================================');
  console.log(`Test Suite Completed: ${passed} Passed, ${failed} Failed`);
  console.log('========================================\n');

  server.close();
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
