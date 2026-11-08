// scripts/e2e-auth-admin-test.ts - E2E HTTP Verification for NT-1 (Supabase Auth Session) & NT-2 (Admin Mutations)
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import prisma from '../src/lib/prisma';
import { QA_USER, QA_ADMIN } from './setup-test-accounts';

interface TestResult {
  suite: string;
  testName: string;
  status: 'PASS' | 'FAIL';
  details?: string;
  error?: string;
}

const results: TestResult[] = [];
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

function assert(condition: boolean, suite: string, testName: string, details?: string) {
  if (condition) {
    results.push({ suite, testName, status: 'PASS', details });
    console.log(`  ✅ [PASS] ${testName}`);
    if (details) console.log(`     └─ ${details}`);
  } else {
    results.push({ suite, testName, status: 'FAIL', details, error: 'Assertion failed' });
    console.error(`  ❌ [FAIL] ${testName}: ${details}`);
  }
}

function parseCookies(res: Response): string {
  // Extract all set-cookie headers from fetch Response
  // Node 18+ provides getSetCookie(), fallback to headers.get('set-cookie')
  let setCookies: string[] = [];
  if (typeof (res.headers as any).getSetCookie === 'function') {
    setCookies = (res.headers as any).getSetCookie();
  } else {
    const raw = res.headers.get('set-cookie');
    if (raw) setCookies = [raw];
  }

  return setCookies
    .map((cookieStr) => cookieStr.split(';')[0].trim())
    .filter(Boolean)
    .join('; ');
}

async function runAuthAndAdminTests() {
  console.log('================================================================');
  console.log('   LAPMATCH E2E AUTHENTICATION & ADMIN MUTATION TESTS (FASE 3)  ');
  console.log('   Focus: NT-1 (User Auth Session) & NT-2 (Admin Mutasi HTTP)   ');
  console.log('================================================================\n');

  // Find user IDs in Prisma
  const userProfile = await prisma.user.findUnique({ where: { email: QA_USER.email } });
  const adminProfile = await prisma.user.findUnique({ where: { email: QA_ADMIN.email } });

  if (!userProfile || !adminProfile) {
    throw new Error('Test accounts not found in database. Run scripts/setup-test-accounts.ts first.');
  }

  // =================================================================
  // SCENARIO NT-1: SUPABASE AUTHENTICATION & CONSULTATION VIA HTTP
  // =================================================================
  console.log('--- SCENARIO NT-1: User Authentication & Questionnaire Session ---');

  // NT-1.1: Unauthenticated request to /api/questionnaire MUST return 401
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
      'NT-1 User Auth',
      'POST /api/questionnaire without session is rejected with HTTP 401',
      `Status: ${res.status}, Error: ${data.error}`
    );
  } catch (err: any) {
    assert(false, 'NT-1 User Auth', 'Execution error on unauth check', err.message);
  }

  // NT-1.2: Login via HTTP POST /api/auth/login for QA Regular User
  let userCookies = '';
  try {
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '192.168.210.10' },
      body: JSON.stringify({
        email: QA_USER.email,
        password: QA_USER.password,
      }),
    });
    const loginData = await loginRes.json();
    userCookies = parseCookies(loginRes);

    assert(
      loginRes.status === 200 && loginData.success === true && userCookies.length > 0,
      'NT-1 User Auth',
      'Login as QA User via POST /api/auth/login succeeds and returns session cookies',
      `Status: ${loginRes.status}, Has Session Cookies: ${userCookies.length > 0}`
    );
  } catch (err: any) {
    assert(false, 'NT-1 User Auth', 'Execution error during user login', err.message);
  }

  // NT-1.3: Submit Consultation Questionnaire with valid user session
  let createdJawabanId: number | null = null;
  try {
    const questionnaireRes = await fetch(`${BASE_URL}/api/questionnaire`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': userCookies,
      },
      body: JSON.stringify({
        budgetMin: 5000000,
        budgetMax: 12000000,
        peruntukan: 'Kuliah',
        rankingKriteria: ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'],
        kondisiPilihan: 'baru',
        merekPilihan: ['semua'],
      }),
    });

    const qData = await questionnaireRes.json();
    createdJawabanId = qData.jawabanId || null;

    assert(
      (questionnaireRes.status === 200 || questionnaireRes.status === 201) && qData.success === true && typeof createdJawabanId === 'number',
      'NT-1 User Auth',
      'POST /api/questionnaire with valid session succeeds and returns jawabanId',
      `Status: ${questionnaireRes.status}, JawabanId: ${createdJawabanId}`
    );
  } catch (err: any) {
    assert(false, 'NT-1 User Auth', 'Execution error submitting questionnaire', err.message);
  }

  // NT-1.4: Database verification of saved consultation
  if (createdJawabanId) {
    try {
      const dbJawaban = await prisma.kuisionerJawaban.findUnique({
        where: { id: createdJawabanId },
        include: {
          bobotHasil: true,
          hasilTopsis: true,
        },
      });

      assert(
        Boolean(dbJawaban && dbJawaban.userId === userProfile.id),
        'NT-1 User Auth',
        'Consultation verified in PostgreSQL: correctly linked to authenticated userId',
        `DB userId: ${dbJawaban?.userId}, Expected: ${userProfile.id}`
      );

      assert(
        (dbJawaban?.bobotHasil?.length || 0) === 6,
        'NT-1 User Auth',
        'ROC criteria weights persisted in PostgreSQL (6 records)',
        `Weights count: ${dbJawaban?.bobotHasil?.length}`
      );

      assert(
        (dbJawaban?.hasilTopsis?.length || 0) > 0,
        'NT-1 User Auth',
        'TOPSIS ranked recommendations persisted in PostgreSQL',
        `Rankings count: ${dbJawaban?.hasilTopsis?.length}`
      );

      // Cleanup consultation test record
      await prisma.hasilTopsis.deleteMany({ where: { kuisionerJawabanId: createdJawabanId } });
      await prisma.bobotKriteriaHasil.deleteMany({ where: { kuisionerJawabanId: createdJawabanId } });
      await prisma.penjelasanAi.deleteMany({ where: { kuisionerJawabanId: createdJawabanId } });
      await prisma.kuisionerJawaban.delete({ where: { id: createdJawabanId } });
      console.log('     └─ Cleaned up QA consultation record and related relational rows.');
    } catch (err: any) {
      assert(false, 'NT-1 User Auth', 'Database verification failed', err.message);
    }
  }

  // =================================================================
  // SCENARIO NT-2: ADMIN AUTHORIZATION & MUTATION OPERATIONS VIA HTTP
  // =================================================================
  console.log('\n--- SCENARIO NT-2: Admin Authentication & Mutations via HTTP ---');

  // NT-2.1: Regular authenticated user MUST still get HTTP 403 on admin mutations
  try {
    const regularUserAdminRes = await fetch(`${BASE_URL}/api/admin/laptops`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': userCookies, // regular user session
      },
      body: JSON.stringify({
        name: 'Unauthorized Student Laptop',
        brand: 'Test',
        price: 5000000,
      }),
    });
    assert(
      regularUserAdminRes.status === 403,
      'NT-2 Admin Auth',
      'Regular authenticated user is rejected with HTTP 403 Forbidden on admin mutation',
      `Status: ${regularUserAdminRes.status}`
    );
  } catch (err: any) {
    assert(false, 'NT-2 Admin Auth', 'Execution error on non-admin check', err.message);
  }

  // NT-2.2: Login as Admin via HTTP POST /api/auth/login
  let adminCookies = '';
  try {
    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '192.168.210.20' },
      body: JSON.stringify({
        email: QA_ADMIN.email,
        password: QA_ADMIN.password,
      }),
    });
    const adminLoginData = await adminLoginRes.json();
    adminCookies = parseCookies(adminLoginRes);

    assert(
      adminLoginRes.status === 200 && adminLoginData.success === true && adminCookies.length > 0,
      'NT-2 Admin Auth',
      'Login as QA Admin via POST /api/auth/login succeeds and returns session cookies',
      `Status: ${adminLoginRes.status}, Has Session Cookies: ${adminCookies.length > 0}`
    );
  } catch (err: any) {
    assert(false, 'NT-2 Admin Auth', 'Execution error during admin login', err.message);
  }

  // NT-2.3: Admin Mutation - CREATE Laptop via POST /api/admin/laptops
  let createdLaptopId: number | null = null;
  const testLaptopName = `[QA_TEST] ASUS ExpertBook Test ${Date.now()}`;
  try {
    const createRes = await fetch(`${BASE_URL}/api/admin/laptops`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': adminCookies,
      },
      body: JSON.stringify({
        name: testLaptopName,
        brand: 'ASUS',
        price: 11000000,
        condition: 'baru',
        category: 'Bisnis',
        ramGb: 16,
        storageGb: 512,
        performaKomposit: 85,
        displaySize: 14.0,
        batteryHours: 8.5,
        weightKg: 1.35,
      }),
    });

    const createData = await createRes.json();
    createdLaptopId = createData.laptop?.id || null;

    assert(
      createRes.status === 201 && typeof createdLaptopId === 'number',
      'NT-2 Admin Mutasi',
      'POST /api/admin/laptops creates new laptop with HTTP 201',
      `Status: ${createRes.status}, Created Laptop ID: ${createdLaptopId}`
    );

    // Verify in PostgreSQL
    const dbLaptop = await prisma.laptop.findUnique({ where: { id: createdLaptopId! } });
    assert(
      Boolean(dbLaptop && dbLaptop.name === testLaptopName),
      'NT-2 Admin Mutasi',
      'Database verification: laptop successfully inserted into PostgreSQL catalog',
      `Found in DB: ${dbLaptop?.name}`
    );
  } catch (err: any) {
    assert(false, 'NT-2 Admin Mutasi', 'Execution error on CREATE laptop', err.message);
  }

  // NT-2.4: Admin Mutation - UPDATE Laptop via PUT /api/admin/laptops/[id]
  if (createdLaptopId) {
    try {
      const updatedName = `${testLaptopName} (Updated v2)`;
      const updateRes = await fetch(`${BASE_URL}/api/admin/laptops/${createdLaptopId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': adminCookies,
        },
        body: JSON.stringify({
          name: updatedName,
          brand: 'ASUS',
          price: 10500000,
          condition: 'baru',
          category: 'Bisnis & Profesional',
          ramGb: 16,
          storageGb: 1000,
          performaKomposit: 88,
          batteryHours: 9.0,
          weightKg: 1.35,
        }),
      });

      const updateData = await updateRes.json();
      assert(
        updateRes.status === 200 && updateData.laptop?.name === updatedName,
        'NT-2 Admin Mutasi',
        'PUT /api/admin/laptops/[id] updates laptop with HTTP 200',
        `Status: ${updateRes.status}, Updated name verified in response`
      );

      // Verify in PostgreSQL
      const dbUpdated = await prisma.laptop.findUnique({ where: { id: createdLaptopId } });
      assert(
        Boolean(dbUpdated && dbUpdated.name === updatedName && dbUpdated.price === BigInt(10500000)),
        'NT-2 Admin Mutasi',
        'Database verification: updated values confirmed in PostgreSQL',
        `Price in DB: ${dbUpdated?.price.toString()}`
      );
    } catch (err: any) {
      assert(false, 'NT-2 Admin Mutasi', 'Execution error on UPDATE laptop', err.message);
    }
  }

  // NT-2.5: Admin Mutation - DELETE Laptop via DELETE /api/admin/laptops/[id]
  if (createdLaptopId) {
    try {
      const deleteRes = await fetch(`${BASE_URL}/api/admin/laptops/${createdLaptopId}`, {
        method: 'DELETE',
        headers: {
          'Cookie': adminCookies,
        },
      });

      const delData = await deleteRes.json();
      assert(
        deleteRes.status === 200 && (delData.success === true || Boolean(delData.message)),
        'NT-2 Admin Mutasi',
        'DELETE /api/admin/laptops/[id] deletes laptop with HTTP 200',
        `Status: ${deleteRes.status}, Message: ${delData.message}`
      );

      // Verify in PostgreSQL (must be null)
      const dbDeleted = await prisma.laptop.findUnique({ where: { id: createdLaptopId } });
      assert(
        dbDeleted === null,
        'NT-2 Admin Mutasi',
        'Database verification: laptop record completely removed from PostgreSQL',
        'Record is null'
      );
    } catch (err: any) {
      assert(false, 'NT-2 Admin Mutasi', 'Execution error on DELETE laptop', err.message);
    }
  }

  // NT-2.6: Admin Banner Mutation via HTTP (CREATE & DELETE)
  let createdBannerId: string | null = null;
  const testBannerTitle = `[QA_TEST] Promo Spesial Mahasiswa ${Date.now()}`;
  try {
    const bannerCreateRes = await fetch(`${BASE_URL}/api/admin/banners`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': adminCookies,
      },
      body: JSON.stringify({
        title: testBannerTitle,
        brand: 'Lenovo',
        subtitle: 'Khusus pengujian fungsional admin',
        price: 8500000,
        originalPrice: 10000000,
        discount: 'Hemat 15%',
        badge: 'QA Test',
        isActive: true,
        sortOrder: 99,
      }),
    });

    const bannerData = await bannerCreateRes.json();
    createdBannerId = bannerData.banner?.id || null;

    assert(
      bannerCreateRes.status === 201 && typeof createdBannerId === 'string' && createdBannerId.length > 0,
      'NT-2 Admin Mutasi',
      'POST /api/admin/banners creates promo banner with HTTP 201',
      `Status: ${bannerCreateRes.status}, Banner ID: ${createdBannerId}`
    );

    // Verify in PostgreSQL
    const dbBanner = await prisma.banner.findUnique({ where: { id: createdBannerId! } });
    assert(
      Boolean(dbBanner && dbBanner.title === testBannerTitle),
      'NT-2 Admin Mutasi',
      'Database verification: banner record confirmed in PostgreSQL',
      `Banner Title: ${dbBanner?.title}`
    );

    // Delete banner via HTTP DELETE /api/admin/banners/[id]
    const bannerDelRes = await fetch(`${BASE_URL}/api/admin/banners/${createdBannerId}`, {
      method: 'DELETE',
      headers: { 'Cookie': adminCookies },
    });

    assert(
      bannerDelRes.status === 200,
      'NT-2 Admin Mutasi',
      'DELETE /api/admin/banners/[id] deletes banner with HTTP 200',
      `Status: ${bannerDelRes.status}`
    );

    const dbBannerDeleted = await prisma.banner.findUnique({ where: { id: createdBannerId! } });
    assert(
      dbBannerDeleted === null,
      'NT-2 Admin Mutasi',
      'Database verification: banner completely removed from PostgreSQL',
      'Record is null'
    );
  } catch (err: any) {
    assert(false, 'NT-2 Admin Mutasi', 'Execution error on Banner mutations', err.message);
  }

  // =================================================================
  // SUMMARY
  // =================================================================
  console.log('\n================================================================');
  console.log('       E2E AUTHENTICATION & ADMIN MUTATION SUMMARY REPORT       ');
  console.log('================================================================');
  const passCount = results.filter((r) => r.status === 'PASS').length;
  const failCount = results.filter((r) => r.status === 'FAIL').length;
  console.log(`Total Scenarios Tested: ${results.length}`);
  console.log(`Passed                : ${passCount}`);
  console.log(`Failed                : ${failCount}`);

  await prisma.$disconnect();

  if (failCount > 0) {
    console.error('\n❌ SOME AUTH OR ADMIN MUTATION TESTS FAILED.');
    process.exit(1);
  } else {
    console.log('\n🎉 ALL NT-1 & NT-2 E2E TESTS PASSED SUCCESSFULLY (100%)!');
    process.exit(0);
  }
}

runAuthAndAdminTests().catch(async (e) => {
  console.error('Fatal error in auth/admin test runner:', e);
  await prisma.$disconnect();
  process.exit(1);
});
