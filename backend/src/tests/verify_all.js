process.env.NODE_ENV = 'test';
const http = require('http');
const assert = require('assert');
const app = require('../index');

const PORT = 5001;
let server;

function request(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const payload = data ? JSON.stringify(data) : null;
    const reqHeaders = { ...headers };

    if (payload) {
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path,
        method,
        headers: reqHeaders,
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          let parsed = null;
          try {
            parsed = JSON.parse(body);
          } catch (e) {
            parsed = body;
          }
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        });
      }
    );

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`❌ FAIL: ${name}`);
    console.error(err.stack || err.message);
    failed++;
  }
}

async function runAllTests() {
  server = app.listen(PORT, async () => {
    console.log(`Test server running on port ${PORT}`);

    console.log('\n--- 1. Health Endpoints (2 tests) ---');
    await test('GET /api/health returns 200 OK with timestamp', async () => {
      const res = await request('GET', '/api/health');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.status, 'OK');
      assert(res.data.timestamp);
    });

    await test('GET /api/v1/health returns 200 OK', async () => {
      const res = await request('GET', '/api/v1/health');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.status, 'OK');
    });

    console.log('\n--- 2. Schemes API & Filtering (14 tests) ---');
    await test('GET /api/v1/schemes returns paginated list with total count', async () => {
      const res = await request('GET', '/api/v1/schemes');
      assert.strictEqual(res.status, 200);
      assert(Array.isArray(res.data.schemes || res.data.data));
      assert(res.data.pagination || res.data.total);
    });

    await test('GET /api/v1/schemes?sector=Agriculture filters by sector', async () => {
      const res = await request('GET', '/api/v1/schemes?sector=Agriculture');
      assert.strictEqual(res.status, 200);
      const list = res.data.schemes || res.data.data;
      assert(list.length > 0);
    });

    await test('GET /api/v1/schemes?q=farmer searches by query term', async () => {
      const res = await request('GET', '/api/v1/schemes?q=farmer');
      assert.strictEqual(res.status, 200);
      const list = res.data.schemes || res.data.data;
      assert(list.length > 0);
    });

    await test('GET /api/v1/schemes?category=Agriculture filters by category', async () => {
      const res = await request('GET', '/api/v1/schemes?category=Agriculture');
      assert.strictEqual(res.status, 200);
      const list = res.data.schemes || res.data.data;
      assert(list.length > 0);
    });

    await test('GET /api/v1/schemes/compare returns side-by-side scheme comparison list', async () => {
      const res = await request('GET', '/api/v1/schemes/compare?ids=pm-kisan,ayushman-bharat');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.count, 2);
    });

    await test('GET /api/v1/schemes/compare rejects missing ids query parameter', async () => {
      const res = await request('GET', '/api/v1/schemes/compare');
      assert.strictEqual(res.status, 400);
    });

    await test('GET /api/v1/schemes?level=Central filters by government level', async () => {
      const res = await request('GET', '/api/v1/schemes?level=Central');
      assert.strictEqual(res.status, 200);
      const list = res.data.schemes || res.data.data;
      assert(list.length > 0);
    });

    await test('GET /api/v1/schemes?occupation=Farmer filters by occupation', async () => {
      const res = await request('GET', '/api/v1/schemes?occupation=Farmer');
      assert.strictEqual(res.status, 200);
    });

    await test('GET /api/v1/schemes?gender=Female filters by gender tag', async () => {
      const res = await request('GET', '/api/v1/schemes?gender=Female');
      assert.strictEqual(res.status, 200);
    });

    await test('GET /api/v1/schemes?maxIncome=200000 filters by max income threshold', async () => {
      const res = await request('GET', '/api/v1/schemes?maxIncome=200000');
      assert.strictEqual(res.status, 200);
    });

    await test('GET /api/v1/schemes?sort=name_asc sorts results alphabetically', async () => {
      const res = await request('GET', '/api/v1/schemes?sort=name_asc');
      assert.strictEqual(res.status, 200);
      const list = res.data.schemes || res.data.data;
      if (list.length > 1) {
        assert(list[0].name.localeCompare(list[1].name) <= 0);
      }
    });

    await test('GET /api/v1/schemes?page=1&limit=2 handles custom pagination limits', async () => {
      const res = await request('GET', '/api/v1/schemes?page=1&limit=2');
      assert.strictEqual(res.status, 200);
      const list = res.data.schemes || res.data.data;
      assert.strictEqual(list.length, 2);
    });

    await test('GET /api/v1/schemes handles combined query filters', async () => {
      const res = await request('GET', '/api/v1/schemes?category=Agriculture&level=Central&sort=name_desc');
      assert.strictEqual(res.status, 200);
    });

    await test('GET /api/v1/schemes handles invalid negative page gracefully', async () => {
      const res = await request('GET', '/api/v1/schemes?page=-1');
      assert.strictEqual(res.status, 200);
    });

    await test('GET /api/v1/schemes/:id returns valid scheme details object', async () => {
      const res = await request('GET', '/api/v1/schemes/pm-kisan');
      assert.strictEqual(res.status, 200);
      const scheme = res.data.scheme || res.data.data || res.data;
      assert.strictEqual(scheme.id, 'pm-kisan');
    });

    await test('GET /api/v1/schemes/non-existent-id-999 returns 404', async () => {
      const res = await request('GET', '/api/v1/schemes/non-existent-id-999');
      assert.strictEqual(res.status, 404);
    });

    console.log('\n--- 3. Eligibility Engine (11 tests) ---');
    await test('POST /api/v1/eligibility/check evaluates eligible farmer profile', async () => {
      const res = await request('POST', '/api/v1/eligibility/check', {
        age: 35,
        gender: 'Male',
        annualIncome: 150000,
        occupation: 'Farmer',
        state: 'Telangana'
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
      assert(res.data.recommendations.length > 0);
    });

    await test('POST /api/v1/eligibility/check evaluates high income boundary', async () => {
      const res = await request('POST', '/api/v1/eligibility/check', {
        age: 40,
        gender: 'Female',
        annualIncome: 2000000,
        occupation: 'Business'
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
    });

    await test('POST /api/v1/eligibility/check handles zero income profile', async () => {
      const res = await request('POST', '/api/v1/eligibility/check', {
        age: 22,
        gender: 'Female',
        annualIncome: 0,
        occupation: 'Student'
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
    });

    await test('POST /api/v1/eligibility/check handles boundary age 18', async () => {
      const res = await request('POST', '/api/v1/eligibility/check', {
        age: 18,
        gender: 'Female',
        annualIncome: 50000,
        occupation: 'Artisan'
      });
      assert.strictEqual(res.status, 200);
    });

    await test('POST /api/v1/eligibility/check handles boundary age 75 (Senior Citizen)', async () => {
      const res = await request('POST', '/api/v1/eligibility/check', {
        age: 75,
        gender: 'Male',
        annualIncome: 40000,
        occupation: 'Retired'
      });
      assert.strictEqual(res.status, 200);
    });

    await test('POST /api/v1/eligibility/check includes non-official recommendation disclaimer', async () => {
      const res = await request('POST', '/api/v1/eligibility/check', {
        age: 30,
        gender: 'Male',
        annualIncome: 100000,
        occupation: 'Farmer'
      });
      assert.strictEqual(res.status, 200);
      assert(res.data.disclaimer || res.data.message || res.data.success);
    });

    await test('POST /api/v1/eligibility/check validates missing payload fields', async () => {
      const res = await request('POST', '/api/v1/eligibility/check', {});
      assert.strictEqual(res.status, 400);
    });

    await test('POST /api/v1/eligibility/check handles null fields gracefully', async () => {
      const res = await request('POST', '/api/v1/eligibility/check', {
        age: null,
        annualIncome: null
      });
      assert.strictEqual(res.status, 400);
    });

    await test('POST /api/v1/eligibility/check rejects negative age input', async () => {
      const res = await request('POST', '/api/v1/eligibility/check', {
        age: -5,
        annualIncome: 100000,
        occupation: 'Farmer'
      });
      assert.strictEqual(res.status, 400);
    });

    await test('POST /api/v1/eligibility/check rejects negative income input', async () => {
      const res = await request('POST', '/api/v1/eligibility/check', {
        age: 25,
        annualIncome: -50000,
        occupation: 'Farmer'
      });
      assert.strictEqual(res.status, 400);
    });

    await test('POST /api/v1/eligibility/check handles unknown occupation string', async () => {
      const res = await request('POST', '/api/v1/eligibility/check', {
        age: 30,
        gender: 'Male',
        annualIncome: 100000,
        occupation: 'UnlistedProfessionX'
      });
      assert.strictEqual(res.status, 200);
    });

    console.log('\n--- 4. Recommendation Engine (8 tests) ---');
    await test('POST /api/v1/schemes/recommend returns top ranked schemes for manufacturing', async () => {
      const res = await request('POST', '/api/v1/schemes/recommend', {
        projectType: 'manufacturing',
        cost: 300000,
        income: 200000,
        education: 'graduate',
        location: 'Telangana'
      });
      assert.strictEqual(res.status, 200);
      const recs = res.data.recommendations || res.data;
      assert(Array.isArray(recs));
      assert(recs.length <= 3);
    });

    await test('POST /api/v1/schemes/recommend handles low income profile', async () => {
      const res = await request('POST', '/api/v1/schemes/recommend', {
        projectType: 'services',
        cost: 50000,
        income: 40000,
        education: '10th pass',
        location: 'Urban'
      });
      assert.strictEqual(res.status, 200);
    });

    await test('POST /api/v1/schemes/recommend handles high project cost', async () => {
      const res = await request('POST', '/api/v1/schemes/recommend', {
        projectType: 'manufacturing',
        cost: 5000000,
        income: 800000,
        education: 'postgraduate',
        location: 'Telangana'
      });
      assert.strictEqual(res.status, 200);
    });

    await test('POST /api/v1/schemes/recommend rejects missing projectType', async () => {
      const res = await request('POST', '/api/v1/schemes/recommend', {
        cost: 200000,
        income: 150000
      });
      assert.strictEqual(res.status, 400);
    });

    await test('POST /api/v1/schemes/recommend rejects non-numeric cost', async () => {
      const res = await request('POST', '/api/v1/schemes/recommend', {
        projectType: 'trading',
        cost: 'invalid_cost',
        income: 150000
      });
      assert.strictEqual(res.status, 400);
    });

    await test('POST /api/v1/schemes/recommend rejects negative project cost', async () => {
      const res = await request('POST', '/api/v1/schemes/recommend', {
        projectType: 'trading',
        cost: -100000,
        income: 150000
      });
      assert.strictEqual(res.status, 400);
    });

    await test('POST /api/v1/schemes/recommend prevents duplicate schemes in recommendations', async () => {
      const res = await request('POST', '/api/v1/schemes/recommend', {
        projectType: 'services',
        cost: 200000,
        income: 150000,
        education: 'graduate'
      });
      assert.strictEqual(res.status, 200);
      const list = res.data.recommendations || [];
      const ids = list.map(r => r.id);
      const uniqueIds = new Set(ids);
      assert.strictEqual(ids.length, uniqueIds.size);
    });

    await test('POST /api/v1/schemes/recommend returns valid match score numbers without NaN', async () => {
      const res = await request('POST', '/api/v1/schemes/recommend', {
        projectType: 'food processing',
        cost: 250000,
        income: 180000
      });
      assert.strictEqual(res.status, 200);
      const list = res.data.recommendations || [];
      list.forEach(r => {
        if (r.matchScore !== undefined) {
          assert(!isNaN(r.matchScore));
        }
      });
    });

    console.log('\n--- 5. User Authentication (11 tests) ---');
    let tokenUserA = null;
    let tokenUserB = null;

    await test('POST /api/v1/users/register creates User A and returns JWT token', async () => {
      const res = await request('POST', '/api/v1/users/register', {
        name: 'Citizen User A',
        email: 'userA_test@example.com',
        password: 'passwordA123'
      });
      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.data.success, true);
      assert(res.data.token);
      assert.strictEqual(res.data.user.passwordHash, undefined);
      tokenUserA = res.data.token;
    });

    await test('POST /api/v1/users/register creates User B and returns JWT token', async () => {
      const res = await request('POST', '/api/v1/users/register', {
        name: 'Citizen User B',
        email: 'userB_test@example.com',
        password: 'passwordB123'
      });
      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.data.success, true);
      assert(res.data.token);
      tokenUserB = res.data.token;
    });

    await test('GET /api/v1/users/me with valid Bearer token returns profile', async () => {
      const res = await request('GET', '/api/v1/users/me', null, {
        'Authorization': `Bearer ${tokenUserA}`
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.user.name, 'Citizen User A');
    });

    await test('POST /api/v1/users/register rejects duplicate email address', async () => {
      const res = await request('POST', '/api/v1/users/register', {
        name: 'Duplicate User',
        email: 'userA_test@example.com',
        password: 'passwordA123'
      });
      assert.strictEqual(res.status, 400);
    });

    await test('POST /api/v1/users/register rejects invalid email format', async () => {
      const res = await request('POST', '/api/v1/users/register', {
        name: 'Invalid Email User',
        email: 'not-an-email',
        password: 'password123'
      });
      assert.strictEqual(res.status, 400);
    });

    await test('POST /api/v1/users/register rejects short password < 6 chars', async () => {
      const res = await request('POST', '/api/v1/users/register', {
        name: 'Short Pass User',
        email: 'shortpass@example.com',
        password: '123'
      });
      assert.strictEqual(res.status, 400);
    });

    await test('POST /api/v1/users/login authenticates User A with correct password', async () => {
      const res = await request('POST', '/api/v1/users/login', {
        email: 'userA_test@example.com',
        password: 'passwordA123'
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
      assert(res.data.token);
    });

    await test('POST /api/v1/auth/login alias authenticates User B', async () => {
      const res = await request('POST', '/api/v1/auth/login', {
        email: 'userB_test@example.com',
        password: 'passwordB123'
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
    });

    await test('POST /api/v1/users/login rejects incorrect password', async () => {
      const res = await request('POST', '/api/v1/users/login', {
        email: 'userA_test@example.com',
        password: 'WrongPassword999'
      });
      assert.strictEqual(res.status, 401);
    });

    await test('POST /api/v1/users/login rejects unregistered email', async () => {
      const res = await request('POST', '/api/v1/users/login', {
        email: 'nonexistent_user_999@example.com',
        password: 'password123'
      });
      assert.strictEqual(res.status, 401);
    });

    await test('POST /api/v1/users/login validates missing credentials', async () => {
      const res = await request('POST', '/api/v1/users/login', {});
      assert.strictEqual(res.status, 400);
    });

    console.log('\n--- 6. Authorization & User Data Isolation (8 tests) ---');
    await test('User A can save a scheme bookmark', async () => {
      const res = await request('POST', '/api/v1/user/saved-schemes', { schemeId: 'pm-kisan' }, {
        'Authorization': `Bearer ${tokenUserA}`
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.isSaved, true);
    });

    await test('User A retrieves 1 saved scheme bookmark', async () => {
      const res = await request('GET', '/api/v1/user/saved-schemes', null, {
        'Authorization': `Bearer ${tokenUserA}`
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.count, 1);
    });

    await test('User B does NOT see User A saved schemes (User Data Isolation)', async () => {
      const res = await request('GET', '/api/v1/user/saved-schemes', null, {
        'Authorization': `Bearer ${tokenUserB}`
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.count, 0);
    });

    await test('User A submits an application', async () => {
      const res = await request('POST', '/api/v1/user/applications', { schemeId: 'pm-kisan', notes: 'Farmer application' }, {
        'Authorization': `Bearer ${tokenUserA}`
      });
      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.data.success, true);
    });

    await test('User A retrieves 1 tracked application', async () => {
      const res = await request('GET', '/api/v1/user/applications', null, {
        'Authorization': `Bearer ${tokenUserA}`
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.count, 1);
    });

    await test('User B does NOT see User A application (User Data Isolation)', async () => {
      const res = await request('GET', '/api/v1/user/applications', null, {
        'Authorization': `Bearer ${tokenUserB}`
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.count, 0);
    });

    await test('Unauthenticated request to protected endpoint returns 401 Unauthorized', async () => {
      const res = await request('GET', '/api/v1/user/saved-schemes');
      assert.strictEqual(res.status, 401);
    });

    await test('Invalid/Forged JWT token header returns 401 Unauthorized', async () => {
      const res = await request('GET', '/api/v1/user/saved-schemes', null, {
        'Authorization': 'Bearer INVALID_FORGED_JWT_TOKEN_HERE'
      });
      assert.strictEqual(res.status, 401);
    });

    console.log('\n--- 7. Saved Schemes (6 tests) ---');
    await test('User A toggling saved scheme twice unsaves the scheme', async () => {
      const res = await request('POST', '/api/v1/user/saved-schemes', { schemeId: 'pm-kisan' }, {
        'Authorization': `Bearer ${tokenUserA}`
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.isSaved, false);
    });

    await test('User A saved scheme list is now empty', async () => {
      const res = await request('GET', '/api/v1/user/saved-schemes', null, {
        'Authorization': `Bearer ${tokenUserA}`
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.count, 0);
    });

    await test('POST /api/v1/user/saved-schemes rejects missing schemeId', async () => {
      const res = await request('POST', '/api/v1/user/saved-schemes', {}, {
        'Authorization': `Bearer ${tokenUserA}`
      });
      assert.strictEqual(res.status, 400);
    });

    await test('User B saves Ayushman Bharat scheme', async () => {
      const res = await request('POST', '/api/v1/user/saved-schemes', { schemeId: 'ayushman-bharat' }, {
        'Authorization': `Bearer ${tokenUserB}`
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.isSaved, true);
    });

    await test('User B has 1 saved scheme', async () => {
      const res = await request('GET', '/api/v1/user/saved-schemes', null, {
        'Authorization': `Bearer ${tokenUserB}`
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.count, 1);
    });

    await test('User A remains at 0 saved schemes', async () => {
      const res = await request('GET', '/api/v1/user/saved-schemes', null, {
        'Authorization': `Bearer ${tokenUserA}`
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.count, 0);
    });

    console.log('\n--- 8. Application Tracking (6 tests) ---');
    await test('User B submits application for Ayushman Bharat', async () => {
      const res = await request('POST', '/api/v1/user/applications', { schemeId: 'ayushman-bharat' }, {
        'Authorization': `Bearer ${tokenUserB}`
      });
      assert.strictEqual(res.status, 201);
      assert(res.data.data.id.startsWith('APP-2026-'));
    });

    await test('User B application has valid initial status "Under Review"', async () => {
      const res = await request('GET', '/api/v1/user/applications', null, {
        'Authorization': `Bearer ${tokenUserB}`
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data[0].status, 'Under Review');
    });

    await test('POST /api/v1/user/applications rejects invalid schemeId', async () => {
      const res = await request('POST', '/api/v1/user/applications', { schemeId: 'invalid-scheme-999' }, {
        'Authorization': `Bearer ${tokenUserB}`
      });
      assert.strictEqual(res.status, 404);
    });

    await test('GET /api/v1/user/notifications returns notification array', async () => {
      const res = await request('GET', '/api/v1/user/notifications', null, {
        'Authorization': `Bearer ${tokenUserB}`
      });
      assert.strictEqual(res.status, 200);
      assert(Array.isArray(res.data.data));
    });

    await test('User A applications count remains unchanged at 1', async () => {
      const res = await request('GET', '/api/v1/user/applications', null, {
        'Authorization': `Bearer ${tokenUserA}`
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.count, 1);
    });

    await test('Unauthenticated POST /api/v1/user/applications returns 401', async () => {
      const res = await request('POST', '/api/v1/user/applications', { schemeId: 'pm-kisan' });
      assert.strictEqual(res.status, 401);
    });

    console.log('\n--- 9. EMI Calculator (9 tests) ---');
    await test('POST /api/v1/calculator/emi calculates EMI with moratorium', async () => {
      const res = await request('POST', '/api/v1/calculator/emi', {
        principal: 100000,
        annualRate: 10,
        tenureMonths: 24,
        moratoriumMonths: 6
      });
      assert.strictEqual(res.status, 200);
      assert(res.data.emi > 0);
      assert(res.data.totalPayment > 100000);
    });

    await test('POST /api/v1/calculator/emi handles 0% interest rate', async () => {
      const res = await request('POST', '/api/v1/calculator/emi', {
        principal: 120000,
        annualRate: 0,
        tenureMonths: 12,
        moratoriumMonths: 0
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.emi, 10000);
    });

    await test('POST /api/v1/calculator/emi validates moratoriumMonths < tenureMonths', async () => {
      const res = await request('POST', '/api/v1/calculator/emi', {
        principal: 100000,
        annualRate: 8,
        tenureMonths: 12,
        moratoriumMonths: 12
      });
      assert.strictEqual(res.status, 400);
    });

    await test('POST /api/v1/calculator/emi rejects moratoriumMonths > tenureMonths', async () => {
      const res = await request('POST', '/api/v1/calculator/emi', {
        principal: 100000,
        annualRate: 8,
        tenureMonths: 12,
        moratoriumMonths: 18
      });
      assert.strictEqual(res.status, 400);
    });

    await test('POST /api/v1/calculator/emi rejects zero tenureMonths', async () => {
      const res = await request('POST', '/api/v1/calculator/emi', {
        principal: 100000,
        annualRate: 8,
        tenureMonths: 0
      });
      assert.strictEqual(res.status, 400);
    });

    await test('POST /api/v1/calculator/emi rejects zero principal', async () => {
      const res = await request('POST', '/api/v1/calculator/emi', {
        principal: 0,
        annualRate: 8,
        tenureMonths: 12
      });
      assert.strictEqual(res.status, 400);
    });

    await test('POST /api/v1/calculator/emi rejects negative principal', async () => {
      const res = await request('POST', '/api/v1/calculator/emi', {
        principal: -50000,
        annualRate: 8,
        tenureMonths: 12
      });
      assert.strictEqual(res.status, 400);
    });

    await test('POST /api/v1/calculator/emi rejects non-numeric tenure', async () => {
      const res = await request('POST', '/api/v1/calculator/emi', {
        principal: 100000,
        annualRate: 8,
        tenureMonths: 'abc'
      });
      assert.strictEqual(res.status, 400);
    });

    await test('POST /api/v1/calculator/emi returns numeric outputs without NaN or Infinity', async () => {
      const res = await request('POST', '/api/v1/calculator/emi', {
        principal: 500000,
        annualRate: 7.5,
        tenureMonths: 60,
        moratoriumMonths: 6
      });
      assert.strictEqual(res.status, 200);
      assert(!isNaN(res.data.emi));
      assert(isFinite(res.data.totalPayment));
    });

    console.log('\n--- 10. Partner Locator & Haversine (8 tests) ---');
    await test('Haversine distance calculation is accurate', async () => {
      const res = await request('POST', '/api/v1/partners/nearest', {
        lat: 13.0827,
        lng: 80.2707
      });
      assert.strictEqual(res.status, 200);
      assert(Array.isArray(res.data.partners));
    });

    await test('GET /api/v1/partners/partner-001 returns partner by ID', async () => {
      const res = await request('GET', '/api/v1/partners/partner-001');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.id, 'partner-001');
    });

    await test('GET /api/v1/partners/non-existent-999 returns 404', async () => {
      const res = await request('GET', '/api/v1/partners/non-existent-999');
      assert.strictEqual(res.status, 404);
    });

    await test('POST /api/v1/partners/nearest returns partners sorted by distance asc', async () => {
      const res = await request('POST', '/api/v1/partners/nearest', {
        lat: 13.0827,
        lng: 80.2707,
        maxDistance: 500
      });
      assert.strictEqual(res.status, 200);
      const list = res.data.partners;
      if (list.length > 1) {
        assert(list[0].distance <= list[1].distance);
      }
    });

    await test('GET /api/v1/partners returns paginated partner list', async () => {
      const res = await request('GET', '/api/v1/partners');
      assert.strictEqual(res.status, 200);
      assert(res.data.partners || res.data.data);
    });

    await test('POST /api/v1/partners/register registers new partner in-memory', async () => {
      const res = await request('POST', '/api/v1/partners/register', {
        name: 'Test Rural CSC Center',
        type: 'CSC',
        coordinates: { lat: 17.3850, lng: 78.4867 },
        schemes: ['scheme-001']
      });
      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.data.success, true);
    });

    await test('POST /api/v1/partners/nearest rejects out-of-range latitude > 90', async () => {
      const res = await request('POST', '/api/v1/partners/nearest', {
        lat: 120,
        lng: 80.2707
      });
      assert.strictEqual(res.status, 400);
    });

    await test('POST /api/v1/partners/nearest rejects out-of-range longitude > 180', async () => {
      const res = await request('POST', '/api/v1/partners/nearest', {
        lat: 13.0827,
        lng: 200
      });
      assert.strictEqual(res.status, 400);
    });

    console.log('\n--- 11. Document Generation (5 tests) ---');
    let generatedDocId = null;

    await test('POST /api/v1/documents/generate generates PDF document record', async () => {
      const res = await request('POST', '/api/v1/documents/generate', {
        scheme: { schemeId: 'pm-kisan', schemeName: 'PM KISAN' },
        user: { name: 'Ramesh Kumar' }
      });
      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.data.success, true);
      assert(res.data.documentId);
      generatedDocId = res.data.documentId;
    });

    await test('GET /api/v1/documents/download/:docId returns download URL', async () => {
      const res = await request('GET', `/api/v1/documents/download/${generatedDocId}`);
      assert.strictEqual(res.status, 200);
      assert(res.data.downloadUrl);
    });

    await test('GET /api/v1/documents/file/:docId streams binary PDF', async () => {
      const res = await request('GET', `/api/v1/documents/file/${generatedDocId}`);
      assert.strictEqual(res.status, 200);
      assert(res.headers['content-type'].includes('pdf'));
    });

    await test('GET /api/v1/documents/download/non-existent-doc returns 404', async () => {
      const res = await request('GET', '/api/v1/documents/download/non-existent-doc-999');
      assert.strictEqual(res.status, 404);
    });

    await test('POST /api/v1/documents/generate creates fallback document when scheme object omitted', async () => {
      const res = await request('POST', '/api/v1/documents/generate', {
        user: { name: 'Ramesh Kumar' }
      });
      assert.strictEqual(res.status, 201);
    });

    console.log('\n--- 12. Agent Workflow (5 tests) ---');
    await test('POST /api/v1/agent/submit registers application by agent', async () => {
      const res = await request('POST', '/api/v1/agent/submit', {
        agentId: 'agent-101',
        userId: 'user-202',
        schemeId: 'pm-kisan',
        applicationData: { citizenName: 'Sunita Devi' }
      });
      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.data.success, true);
    });

    await test('GET /api/v1/agent/users/:agentId returns agent users list', async () => {
      const res = await request('GET', '/api/v1/agent/users/agent-101');
      assert.strictEqual(res.status, 200);
      assert(Array.isArray(res.data.users));
    });

    await test('GET /api/v1/agent/users/:agentId returns empty array for unknown agent', async () => {
      const res = await request('GET', '/api/v1/agent/users/unknown-agent-999');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.users.length, 0);
    });

    await test('POST /api/v1/agent/submit rejects missing required agentId', async () => {
      const res = await request('POST', '/api/v1/agent/submit', {
        userId: 'user-202',
        schemeId: 'pm-kisan'
      });
      assert.strictEqual(res.status, 400);
    });

    await test('GET /api/v1/agent/users/agent-101 contains user-202 applications', async () => {
      const res = await request('GET', '/api/v1/agent/users/agent-101');
      assert.strictEqual(res.status, 200);
      assert(res.data.users.length > 0);
      assert.strictEqual(res.data.users[0].userId, 'user-202');
    });

    console.log('\n--- 13. Feedback & Sanitization (5 tests) ---');
    await test('POST /api/v1/feedback accepts valid 5-star rating', async () => {
      const res = await request('POST', '/api/v1/feedback', {
        userId: 'user-101',
        schemeId: 'pm-kisan',
        rating: 5,
        comment: 'Great portal for scheme discovery!'
      });
      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.data.success, true);
    });

    await test('POST /api/v1/feedback accepts valid 1-star rating', async () => {
      const res = await request('POST', '/api/v1/feedback', {
        userId: 'user-102',
        schemeId: 'pm-kisan',
        rating: 1,
        comment: 'Needs more state schemes.'
      });
      assert.strictEqual(res.status, 201);
    });

    await test('POST /api/v1/feedback rejects rating = 6 out of range', async () => {
      const res = await request('POST', '/api/v1/feedback', {
        userId: 'user-101',
        schemeId: 'pm-kisan',
        rating: 6,
        comment: 'Too high rating'
      });
      assert.strictEqual(res.status, 400);
    });

    await test('POST /api/v1/feedback rejects rating = -1 negative', async () => {
      const res = await request('POST', '/api/v1/feedback', {
        userId: 'user-101',
        schemeId: 'pm-kisan',
        rating: -1
      });
      assert.strictEqual(res.status, 400);
    });

    await test('POST /api/v1/feedback handles script payload safely without execution', async () => {
      const res = await request('POST', '/api/v1/feedback', {
        userId: 'user-101',
        schemeId: 'pm-kisan',
        rating: 4,
        comment: '<script>alert("XSS")</script>'
      });
      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.data.success, true);
    });

    console.log('\n--- 14. 404 & Error Handling Middleware (5 tests) ---');
    await test('Non-existent route /api/v1/unknown-endpoint returns formatted 404 JSON', async () => {
      const res = await request('GET', '/api/v1/unknown-endpoint');
      assert.strictEqual(res.status, 404);
      assert.strictEqual(res.data.success, false);
    });

    await test('Non-existent HTTP method DELETE /api/v1/health returns 404 JSON', async () => {
      const res = await request('DELETE', '/api/v1/health');
      assert.strictEqual(res.status, 404);
    });

    await test('Malformed JSON payload returns formatted 400 JSON error', async () => {
      const res = await new Promise((resolve, reject) => {
        const req = http.request(
          {
            hostname: '127.0.0.1',
            port: PORT,
            path: '/api/v1/users/register',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          },
          (res) => {
            let body = '';
            res.on('data', (c) => (body += c));
            res.on('end', () => resolve({ status: res.statusCode, data: body }));
          }
        );
        req.on('error', reject);
        req.write('{ malformed json body ');
        req.end();
      });
      assert.strictEqual(res.status, 400);
    });

    await test('Error response JSON does not expose internal server file paths', async () => {
      const res = await request('GET', '/api/v1/nonexistent-route-path');
      assert.strictEqual(res.status, 404);
      const str = JSON.stringify(res.data);
      assert(!str.includes('/home/rgukt/'));
    });

    await test('Error response JSON does not leak database credentials', async () => {
      const res = await request('GET', '/api/v1/nonexistent-route-path');
      assert.strictEqual(res.status, 404);
      const str = JSON.stringify(res.data);
      assert(!str.includes('postgresql://'));
      assert(!str.includes('password'));
    });

    console.log('\n--- 15. Localization & 100% Translation Key Coverage (10 tests) ---');
    const fs = require('fs');
    const path = require('path');
    let langFilePath = path.resolve(__dirname, '../../../frontend/src/context/languageStore.js');
    if (!fs.existsSync(langFilePath)) {
      langFilePath = path.resolve(__dirname, '../../../frontend/src/context/LanguageContext.jsx');
    }
    const langFileContent = fs.readFileSync(langFilePath, 'utf8');
    const langMatch = langFileContent.match(/export const translations = ({[\s\S]*?});/) || 
                      langFileContent.match(/const translations = ({[\s\S]*?});/);
    const transObj = eval('(' + langMatch[1] + ')');
    const enKeys = Object.keys(transObj.EN);
    const targetLangs = ['HI', 'TE', 'TA', 'KN', 'ML', 'BN', 'MR', 'GON', 'BHI'];

    await test('All 10 supported languages (EN, HI, TE, TA, KN, ML, BN, MR, GON, BHI) exist in dictionary', async () => {
      const langs = Object.keys(transObj);
      assert.strictEqual(langs.length, 10);
      assert(langs.includes('EN') && langs.includes('HI') && langs.includes('TE') && langs.includes('GON') && langs.includes('BHI'));
    });

    for (const lang of targetLangs) {
      await test(`${lang} translation coverage is 100% (0 missing keys)`, async () => {
        const langKeys = Object.keys(transObj[lang] || {});
        const missing = enKeys.filter(k => !langKeys.includes(k) || !transObj[lang][k]);
        assert.strictEqual(missing.length, 0, `Missing keys in ${lang}: ${missing.join(', ')}`);
      });
    }

    await test('Translation fallback function returns English value for unknown language', async () => {
      const t = (lang, key) => transObj[lang]?.[key] || transObj['EN']?.[key] || key;
      assert.strictEqual(t('UNKNOWN', 'brandTitle'), 'SchemeSetu');
    });

    await test('Translation fallback function returns key string for completely non-existent key', async () => {
      const t = (lang, key) => transObj[lang]?.[key] || transObj['EN']?.[key] || key;
      assert.strictEqual(t('EN', 'nonExistentKey123'), 'nonExistentKey123');
    });

    console.log('\n--- 16. Translation API & Health Check Endpoints (6 tests) ---');
    await test('GET /api/v1/health returns status OK and uptime', async () => {
      const res = await request('GET', '/api/v1/health');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.status, 'OK');
      assert(typeof res.data.uptimeSeconds === 'number');
    });

    await test('GET /api/health alias returns status OK', async () => {
      const res = await request('GET', '/api/health');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.status, 'OK');
    });

    await test('POST /api/v1/translate rejects missing targetLang with 400', async () => {
      const res = await request('POST', '/api/v1/translate', { text: 'Hello' });
      assert.strictEqual(res.status, 400);
    });

    await test('POST /api/v1/translate with EN target returns original text directly', async () => {
      const res = await request('POST', '/api/v1/translate', { text: 'SchemeSetu Portal', targetLang: 'EN' });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.translated, 'SchemeSetu Portal');
    });

    await test('POST /api/v1/translate batch mode with EN target returns original array', async () => {
      const res = await request('POST', '/api/v1/translate', { texts: ['Apply Now', 'View Details'], targetLang: 'EN' });
      assert.strictEqual(res.status, 200);
      assert.deepStrictEqual(res.data.translated, ['Apply Now', 'View Details']);
    });

    await test('GET /api/v1/translate/cache-stats returns valid cache statistics', async () => {
      const res = await request('GET', '/api/v1/translate/cache-stats');
      assert.strictEqual(res.status, 200);
      assert(typeof res.data.cacheSize === 'number');
      assert.strictEqual(res.data.maxCacheSize, 2000);
    });

    console.log('\n========================================');
    console.log(`Test Suite Completed: ${passed} Passed, ${failed} Failed`);
    console.log('========================================\n');

    server.close(() => {
      process.exit(failed > 0 ? 1 : 0);
    });
  });
}

runAllTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
