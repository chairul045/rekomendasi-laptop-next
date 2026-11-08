// scripts/e2e-http-test.ts - Live HTTP Functional Integration Test against running Next.js Server
import prisma from '../src/lib/prisma';

interface TestResult {
  suite: string;
  testName: string;
  status: 'PASS' | 'FAIL';
  details?: string;
  error?: string;
}

const results: TestResult[] = [];
const BASE_URL = 'http://localhost:3000';

function assert(condition: boolean, suite: string, testName: string, details?: string) {
  if (condition) {
    results.push({ suite, testName, status: 'PASS', details });
    console.log(`  ✅ [PASS] ${testName}`);
  } else {
    results.push({ suite, testName, status: 'FAIL', details, error: 'Assertion failed' });
    console.error(`  ❌ [FAIL] ${testName}: ${details}`);
  }
}

async function runHttpTests() {
  console.log('========================================================');
  console.log('   LAPMATCH E2E HTTP FUNCTIONAL TEST SUITE (FASE 3)     ');
  console.log('========================================================\n');

  // ==========================================
  // SUITE 1: PUBLIC PAGES & NAVIGATION (HTTP 200)
  // ==========================================
  console.log('--- SUITE 1: Public Pages Accessibility (HTTP 200) ---');
  const pages = [
    { path: '/', name: 'Landing Page /' },
    { path: '/questionnaire', name: 'Questionnaire Guide /questionnaire' },
    { path: '/service-laptop', name: 'Service Directory /service-laptop' },
    { path: '/login', name: 'Login Page /login' },
    { path: '/register', name: 'Register Page /register' },
    { path: '/forgot-password', name: 'Forgot Password /forgot-password' },
    { path: '/tentang', name: 'About Page /tentang' },
    { path: '/tentang-metode', name: 'Methodology Page /tentang-metode' },
    { path: '/kebijakan-privasi', name: 'Privacy Policy /kebijakan-privasi' },
    { path: '/syarat-penggunaan', name: 'Terms of Use /syarat-penggunaan' },
  ];

  for (const page of pages) {
    try {
      const res = await fetch(`${BASE_URL}${page.path}`);
      assert(res.status === 200, 'Page Rendering', `${page.name} returns HTTP 200 OK`, `Status: ${res.status}`);
    } catch (err: any) {
      assert(false, 'Page Rendering', `${page.name} failed`, err.message);
    }
  }

  // ==========================================
  // SUITE 2: AUTHENTICATION & SECURITY ENDPOINTS
  // ==========================================
  console.log('\n--- SUITE 2: Authentication Security & Validation ---');

  // Test 2.1: Login with invalid credentials returns 400 or 401
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'fake.nonexistent.user@lapmatch.id', password: 'WrongPassword123!' }),
    });
    const data = await res.json();
    assert(
      (res.status === 400 || res.status === 401) && data.error,
      'Auth Login',
      'Invalid credentials rejected with 401/400 and error message',
      `Status: ${res.status}, Error: ${data.error}`
    );
  } catch (err: any) {
    assert(false, 'Auth Login', 'Execution error', err.message);
  }

  // Test 2.2: Register with weak password (< 8 chars or no numbers/specials) returns 400
  try {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Weak',
        email: 'weak.password.test@lapmatch.id',
        password: '123', // clearly weak
      }),
    });
    const data = await res.json();
    assert(
      res.status === 400 && data.error,
      'Auth Register',
      'Weak password rejected with 400 validation error',
      `Status: ${res.status}, Error: ${data.error}`
    );
  } catch (err: any) {
    assert(false, 'Auth Register', 'Execution error', err.message);
  }

  // Test 2.3: Unauthenticated user checking /api/auth/profile returns 401
  try {
    const res = await fetch(`${BASE_URL}/api/auth/profile`);
    assert(res.status === 401, 'Auth Session', 'GET /api/auth/profile returns 401 for unauthenticated request', `Status: ${res.status}`);
  } catch (err: any) {
    assert(false, 'Auth Session', 'Execution error', err.message);
  }

  // ==========================================
  // SUITE 3: QUESTIONNAIRE & SIMULATION ENDPOINTS
  // ==========================================
  console.log('\n--- SUITE 3: Questionnaire Access Control & Guest Simulation ---');

  // Test 3.1: Full questionnaire submission WITHOUT login MUST return 401 Unauthorized
  try {
    const res = await fetch(`${BASE_URL}/api/questionnaire`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        budgetMin: 5000000,
        budgetMax: 10000000,
        peruntukan: 'Kuliah',
      }),
    });
    const data = await res.json();
    assert(
      res.status === 401 && data.error === 'Unauthorized',
      'Questionnaire Guard',
      'POST /api/questionnaire without session returns 401 Unauthorized',
      `Status: ${res.status}, Error: ${data.error}`
    );
  } catch (err: any) {
    assert(false, 'Questionnaire Guard', 'Execution error', err.message);
  }

  // Test 3.2: Guest limited simulation works via POST /api/questionnaire/guest
  try {
    const res = await fetch(`${BASE_URL}/api/questionnaire/guest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        budgetMin: 4000000,
        budgetMax: 12000000,
        peruntukan: 'Kuliah',
        rankingKriteria: ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'],
        kondisiPilihan: 'baru',
      }),
    });
    const data = await res.json();
    assert(
      res.status === 200 && Array.isArray(data.previewResults) && data.previewResults.length > 0,
      'Guest Simulation',
      'POST /api/questionnaire/guest returns ranked previewResults',
      `Total found: ${data.totalFound}, Preview: ${data.previewResults?.length}`
    );
  } catch (err: any) {
    assert(false, 'Guest Simulation', 'Execution error', err.message);
  }

  // ==========================================
  // SUITE 4: BANNER PROMO API & POSTGRESQL
  // ==========================================
  console.log('\n--- SUITE 4: Banner Public API & PostgreSQL Sync ---');
  try {
    const res = await fetch(`${BASE_URL}/api/banners`);
    const data = await res.json();
    assert(
      res.status === 200 && Array.isArray(data.banners) && data.banners.length >= 4,
      'Banner Public API',
      'GET /api/banners returns active banners from PostgreSQL',
      `Count: ${data.banners?.length}`
    );
    assert(
      data.banners.every((b: any) => b.isActive === true),
      'Banner Public API',
      'All returned banners are active (isActive: true)'
    );
  } catch (err: any) {
    assert(false, 'Banner Public API', 'Execution error', err.message);
  }

  // ==========================================
  // SUITE 5: REVIEWS API & RATE LIMITING
  // ==========================================
  console.log('\n--- SUITE 5: Reviews API, Validation, Sanitization & Rate Limiting ---');

  // Dynamic run ID to guarantee 100% unique test IPs per execution, avoiding any collision
  const runSubnet = Math.floor(Math.random() * 200) + 10;
  const getTestIp = (host: number) => `192.168.${runSubnet}.${host}`;

  // Test 5.1: Public GET /api/reviews
  try {
    const res = await fetch(`${BASE_URL}/api/reviews`);
    const data = await res.json();
    assert(
      res.status === 200 && Array.isArray(data.reviews),
      'Reviews GET',
      'GET /api/reviews returns published reviews array',
      `Count: ${data.reviews?.length}`
    );
  } catch (err: any) {
    assert(false, 'Reviews GET', 'Execution error', err.message);
  }

  // Test 5.2: POST /api/reviews input validation
  // Each validation check uses an isolated IP to prevent rate-limit counter buildup
  try {
    // Missing laptopId
    const res1 = await fetch(`${BASE_URL}/api/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': getTestIp(1) },
      body: JSON.stringify({ rating: 5, comment: 'Bagus sekali' }),
    });
    assert(res1.status === 400, 'Reviews POST Validation', 'Missing laptopId rejected with 400', `Status: ${res1.status}`);

    // Invalid rating
    const res2 = await fetch(`${BASE_URL}/api/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': getTestIp(2) },
      body: JSON.stringify({ laptopId: 1, rating: 0, comment: 'Bagus sekali' }),
    });
    assert(res2.status === 400, 'Reviews POST Validation', 'Rating 0 rejected with 400', `Status: ${res2.status}`);

    // Short comment (< 3 chars)
    const res3 = await fetch(`${BASE_URL}/api/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': getTestIp(3) },
      body: JSON.stringify({ laptopId: 1, rating: 5, comment: 'Hi' }),
    });
    assert(res3.status === 400, 'Reviews POST Validation', 'Short comment (< 3 chars) rejected with 400', `Status: ${res3.status}`);

    // Overlong comment (> 1000 chars)
    const res4 = await fetch(`${BASE_URL}/api/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': getTestIp(4) },
      body: JSON.stringify({ laptopId: 1, rating: 5, comment: 'X'.repeat(1005) }),
    });
    assert(res4.status === 400, 'Reviews POST Validation', 'Overlong comment (> 1000 chars) rejected with 400', `Status: ${res4.status}`);

    // Non-existent laptopId
    const res5 = await fetch(`${BASE_URL}/api/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': getTestIp(5) },
      body: JSON.stringify({ laptopId: 99999999, rating: 5, comment: 'Laptop tidak ada' }),
    });
    assert(res5.status === 404, 'Reviews POST Validation', 'Non-existent laptopId returns 404', `Status: ${res5.status}`);
  } catch (err: any) {
    assert(false, 'Reviews POST Validation', 'Execution error', err.message);
  }

  // Test 5.3: Valid review submission with HTML sanitization & role spoofing defense
  try {
    const sampleLaptop = await prisma.laptop.findFirst({ select: { id: true } });
    if (sampleLaptop) {
      const res = await fetch(`${BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': getTestIp(10), // isolated IP
        },
        body: JSON.stringify({
          laptopId: sampleLaptop.id,
          rating: 5,
          userName: 'Tester<b>XSS</b>',
          userRole: 'Administrator', // attempting spoof
          comment: 'Keyboard <i>empuk</i> dan baterai <u>awet</u> dipakai seharian!',
        }),
      });

      const data = await res.json();
      assert(res.status === 201 && data.success === true, 'Reviews Submission', 'Valid review created with HTTP 201', `ID: ${data.review?.id}`);
      assert(
        data.review.userName === 'TesterXSS',
        'Reviews Sanitization',
        'HTML tags stripped from userName',
        `Clean name: ${data.review.userName}`
      );
      assert(
        !data.review.comment.includes('<i>') && !data.review.comment.includes('<u>'),
        'Reviews Sanitization',
        'HTML tags stripped from comment',
        `Clean comment: ${data.review.comment}`
      );
      assert(
        data.review.userRole === 'Mahasiswa',
        'Reviews Role Security',
        'Unauthenticated guest role spoofing blocked (enforced to "Mahasiswa")',
        `Role: ${data.review.userRole}`
      );

      // Cleanup
      if (data.review?.id) {
        await prisma.review.delete({ where: { id: data.review.id } });
      }
    }
  } catch (err: any) {
    assert(false, 'Reviews Submission', 'Execution error', err.message);
  }

  // Test 5.4: Rate Limiting
  try {
    const spamIp = `10.200.${runSubnet}.1`;
    let throttled = false;
    for (let i = 0; i < 7; i++) {
      const res = await fetch(`${BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': spamIp,
        },
        body: JSON.stringify({
          laptopId: 1,
          rating: 5,
          comment: `Spam attempt number ${i}`,
        }),
      });
      if (res.status === 429) {
        throttled = true;
        break;
      }
    }
    assert(throttled, 'Reviews Rate Limiting', 'IP Rate limiter triggers HTTP 429 Too Many Requests after 5 attempts');
  } catch (err: any) {
    assert(false, 'Reviews Rate Limiting', 'Execution error', err.message);
  }

  // ==========================================
  // SUITE 6: ADMIN AUTHORIZATION GUARDS (HTTP 403)
  // ==========================================
  console.log('\n--- SUITE 6: Admin Endpoints Access Control (HTTP 403) ---');
  // Admin endpoints that block unauthenticated GET requests with 403
  const adminEndpoints = [
    { url: `${BASE_URL}/api/admin/stats`, name: '/api/admin/stats' },
    { url: `${BASE_URL}/api/admin/banners`, name: '/api/admin/banners' },
    { url: `${BASE_URL}/api/admin/reviews`, name: '/api/admin/reviews' },
    { url: `${BASE_URL}/api/admin/users`, name: '/api/admin/users' },
    { url: `${BASE_URL}/api/admin/questionnaire`, name: '/api/admin/questionnaire' },
  ];

  for (const ep of adminEndpoints) {
    try {
      const res = await fetch(ep.url);
      assert(res.status === 403, 'Admin Auth Guard', `${ep.name} returns HTTP 403 Forbidden for non-admin`, `Status: ${res.status}`);
    } catch (err: any) {
      assert(false, 'Admin Auth Guard', `${ep.name} check failed`, err.message);
    }
  }

  // Test 6.2: /api/admin/laptops GET is intentionally public (brand list for questionnaire)
  try {
    const getRes = await fetch(`${BASE_URL}/api/admin/laptops`);
    const getData = await getRes.json();
    assert(
      getRes.status === 200 && Array.isArray(getData.brands) && getData.brands.length > 0 && typeof getData.brands[0].name === 'string',
      'Admin Auth Guard',
      '/api/admin/laptops GET is public and returns array of brands without authentication',
      `Status: ${getRes.status}, Total Brands: ${getData.brands?.length}`
    );
  } catch (err: any) {
    assert(false, 'Admin Auth Guard', '/api/admin/laptops GET check failed', err.message);
  }

  // Test 6.3: /api/admin/laptops mutating operations (POST, PUT, DELETE, Import) MUST return 403 for non-admin
  try {
    // POST /api/admin/laptops
    const postRes = await fetch(`${BASE_URL}/api/admin/laptops`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Unauth Laptop', brand: 'Test', price: 5000000 }),
    });
    assert(
      postRes.status === 403,
      'Admin Auth Guard',
      'POST /api/admin/laptops returns HTTP 403 Forbidden for non-admin',
      `Status: ${postRes.status}`
    );

    // PUT /api/admin/laptops/1
    const putRes = await fetch(`${BASE_URL}/api/admin/laptops/1`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Hacked Name', brand: 'Test', price: 5000000 }),
    });
    assert(
      putRes.status === 403,
      'Admin Auth Guard',
      'PUT /api/admin/laptops/[id] returns HTTP 403 Forbidden for non-admin',
      `Status: ${putRes.status}`
    );

    // DELETE /api/admin/laptops/1
    const delRes = await fetch(`${BASE_URL}/api/admin/laptops/1`, {
      method: 'DELETE',
    });
    assert(
      delRes.status === 403,
      'Admin Auth Guard',
      'DELETE /api/admin/laptops/[id] returns HTTP 403 Forbidden for non-admin',
      `Status: ${delRes.status}`
    );

    // POST /api/admin/laptops/import
    const importRes = await fetch(`${BASE_URL}/api/admin/laptops/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ laptops: [{ name: 'Imported', brand: 'Test', price: 1000000 }] }),
    });
    assert(
      importRes.status === 403,
      'Admin Auth Guard',
      'POST /api/admin/laptops/import returns HTTP 403 Forbidden for non-admin',
      `Status: ${importRes.status}`
    );
  } catch (err: any) {
    assert(false, 'Admin Auth Guard', 'Admin laptop mutation operations check failed', err.message);
  }

  // ==========================================
  // SUITE 7: MULTI-TENANT ISOLATION (HISTORY & RECOMMENDATION API)
  // ==========================================
  console.log('\n--- SUITE 7: Multi-Tenant Data Isolation (History & Recommendation API) ---');
  try {
    const res = await fetch(`${BASE_URL}/api/history`);
    assert(
      res.status === 401,
      'Multi-tenant Isolation',
      'GET /api/history returns HTTP 401 for unauthenticated request',
      `Status: ${res.status}`
    );
  } catch (err: any) {
    assert(false, 'Multi-tenant Isolation', 'Execution error', err.message);
  }

  try {
    const recRes = await fetch(`${BASE_URL}/api/recommendation/1`);
    assert(
      recRes.status === 401,
      'Multi-tenant Isolation',
      'GET /api/recommendation/[id] returns HTTP 401 for unauthenticated request',
      `Status: ${recRes.status}`
    );
  } catch (err: any) {
    assert(false, 'Multi-tenant Isolation', 'Execution error', err.message);
  }

  // ==========================================
  // SUMMARY
  // ==========================================
  console.log('\n========================================================');
  console.log('             E2E HTTP TEST SUMMARY REPORT               ');
  console.log('========================================================');
  const passCount = results.filter((r) => r.status === 'PASS').length;
  const failCount = results.filter((r) => r.status === 'FAIL').length;
  console.log(`Total HTTP Tests Run: ${results.length}`);
  console.log(`Passed              : ${passCount}`);
  console.log(`Failed              : ${failCount}`);

  await prisma.$disconnect();

  if (failCount > 0) {
    console.error('\n❌ SOME E2E HTTP TESTS FAILED.');
    process.exit(1);
  } else {
    console.log('\n🎉 ALL E2E HTTP FUNCTIONAL TESTS PASSED (100%)!');
    process.exit(0);
  }
}

runHttpTests().catch(async (e) => {
  console.error('Fatal HTTP test runner error:', e);
  await prisma.$disconnect();
  process.exit(1);
});
