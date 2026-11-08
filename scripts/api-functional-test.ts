// scripts/api-functional-test.ts - API Route Handlers & Security Testing
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import { NextRequest } from 'next/server';
import { POST as postReview, GET as getReviews } from '../src/app/api/reviews/route';
import { GET as getAdminStats } from '../src/app/api/admin/stats/route';
import { GET as getAdminBanners } from '../src/app/api/admin/banners/route';
import { GET as getAdminReviews } from '../src/app/api/admin/reviews/route';
import { POST as postQuestionnaire } from '../src/app/api/questionnaire/route';
import { POST as postGuestQuestionnaire } from '../src/app/api/questionnaire/guest/route';
import prisma from '../src/lib/prisma';

interface TestResult {
  suite: string;
  testName: string;
  status: 'PASS' | 'FAIL';
  details?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, suite: string, testName: string, details?: string) {
  if (condition) {
    results.push({ suite, testName, status: 'PASS', details });
    console.log(`  ✅ [PASS] ${testName}`);
  } else {
    results.push({ suite, testName, status: 'FAIL', details });
    console.error(`  ❌ [FAIL] ${testName}: ${details}`);
  }
}

async function runApiTests() {
  console.log('========================================================');
  console.log('     LAPMATCH API & SECURITY TEST SUITE (FASE 3)        ');
  console.log('========================================================\n');

  // ==========================================
  // SUITE 1: QUESTIONNAIRE VALIDATION & AUTH GUARD
  // ==========================================
  console.log('--- SUITE 1: Questionnaire Auth & Input Validation ---');

  // Test 1.1: Unauthenticated request to /api/questionnaire MUST return 401 Unauthorized
  try {
    const unauthReq = new NextRequest('http://localhost:3000/api/questionnaire', {
      method: 'POST',
      body: JSON.stringify({
        budgetMin: 5000000,
        budgetMax: 10000000,
        peruntukan: 'Kuliah',
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await postQuestionnaire(unauthReq);
    const data = await res.json();
    assert(
      res.status === 401 && data.error === 'Unauthorized',
      'Questionnaire Auth',
      'Unauthenticated request returns 401 Unauthorized',
      `Status: ${res.status}, Error: ${data.error}`
    );
  } catch (err: any) {
    assert(false, 'Questionnaire Auth', 'Execution error', err.message);
  }

  // Test 1.2: Guest questionnaire simulation works without authentication
  try {
    const guestReq = new NextRequest('http://localhost:3000/api/questionnaire/guest', {
      method: 'POST',
      body: JSON.stringify({
        budgetMin: 4000000,
        budgetMax: 12000000,
        peruntukan: 'Kuliah',
        rankingKriteria: ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'],
        kondisiPilihan: 'baru',
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await postGuestQuestionnaire(guestReq);
    const data = await res.json();
    assert(
      res.status === 200 && Array.isArray(data.recommendations) && data.recommendations.length > 0,
      'Guest Questionnaire',
      'Guest simulation returns valid recommendations array',
      `Count: ${data.recommendations?.length}`
    );
  } catch (err: any) {
    assert(false, 'Guest Questionnaire', 'Execution error', err.message);
  }

  // ==========================================
  // SUITE 2: REVIEW API SECURITY & VALIDATION
  // ==========================================
  console.log('\n--- SUITE 2: Review API Validation, Role Spoofing & Sanitization ---');

  // Test 2.1: Missing laptopId returns 400
  try {
    const req = new NextRequest('http://localhost:3000/api/reviews', {
      method: 'POST',
      body: JSON.stringify({ rating: 5, comment: 'Bagus sekali laptopnya' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await postReview(req);
    const data = await res.json();
    assert(
      res.status === 400 && data.error?.includes('ID laptop wajib'),
      'Review Validation',
      'Missing laptopId rejected with 400',
      `Status: ${res.status}`
    );
  } catch (err: any) {
    assert(false, 'Review Validation', 'Execution error', err.message);
  }

  // Test 2.2: Invalid rating (< 1 or > 5) returns 400
  try {
    const req = new NextRequest('http://localhost:3000/api/reviews', {
      method: 'POST',
      body: JSON.stringify({ laptopId: 1, rating: 6, comment: 'Bagus sekali laptopnya' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await postReview(req);
    const data = await res.json();
    assert(
      res.status === 400 && data.error?.includes('1 hingga 5 bintang'),
      'Review Validation',
      'Rating 6 rejected with 400',
      `Status: ${res.status}`
    );
  } catch (err: any) {
    assert(false, 'Review Validation', 'Execution error', err.message);
  }

  // Test 2.3: Overlong comment (> 1000 chars) returns 400
  try {
    const longComment = 'A'.repeat(1005);
    const req = new NextRequest('http://localhost:3000/api/reviews', {
      method: 'POST',
      body: JSON.stringify({ laptopId: 1, rating: 5, comment: longComment }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await postReview(req);
    const data = await res.json();
    assert(
      res.status === 400 && data.error?.includes('maksimal 1000 karakter'),
      'Review Validation',
      'Comment > 1000 chars rejected with 400',
      `Status: ${res.status}`
    );
  } catch (err: any) {
    assert(false, 'Review Validation', 'Execution error', err.message);
  }

  // Test 2.4: Non-existent laptopId returns 404
  try {
    const req = new NextRequest('http://localhost:3000/api/reviews', {
      method: 'POST',
      body: JSON.stringify({ laptopId: 99999999, rating: 5, comment: 'Bagus sekali' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await postReview(req);
    const data = await res.json();
    assert(
      res.status === 404 && data.error?.includes('tidak ditemukan'),
      'Review Validation',
      'Non-existent laptopId returns 404',
      `Status: ${res.status}`
    );
  } catch (err: any) {
    assert(false, 'Review Validation', 'Execution error', err.message);
  }

  // Test 2.5: Successful review submission with HTML sanitization & role spoofing protection
  try {
    const sampleLaptop = await prisma.laptop.findFirst({ select: { id: true } });
    if (sampleLaptop) {
      const maliciousPayload = {
        laptopId: sampleLaptop.id,
        rating: 5,
        userName: 'Hacker<script>alert(1)</script>',
        userRole: 'Super Admin Lapmatch (Spoofed)',
        comment: 'Ini adalah <b style="color:red">ulasan</b> test <i>sanitasi</i> HTML.',
      };

      const req = new NextRequest('http://localhost:3000/api/reviews', {
        method: 'POST',
        body: JSON.stringify(maliciousPayload),
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '10.0.0.99', // distinct IP for rate limit
        },
      });

      const res = await postReview(req);
      const data = await res.json();

      assert(res.status === 201 && data.success === true, 'Review Submission', 'Review submitted successfully', `ID: ${data.review?.id}`);

      // Verify sanitization in response
      const created = data.review;
      assert(
        !created.userName.includes('<script>') && created.userName.includes('Hacker'),
        'Review Sanitization',
        'Script tag stripped from userName',
        `Sanitized name: ${created.userName}`
      );
      assert(
        !created.comment.includes('<b') && !created.comment.includes('<i>'),
        'Review Sanitization',
        'HTML formatting tags stripped from comment',
        `Sanitized comment: ${created.comment}`
      );
      assert(
        created.userRole === 'Mahasiswa',
        'Review Security',
        'Role spoofing prevented: unauthenticated user forced to role "Mahasiswa"',
        `Assigned role: ${created.userRole}`
      );

      // Cleanup test review
      if (created.id) {
        await prisma.review.delete({ where: { id: created.id } });
      }
    }
  } catch (err: any) {
    assert(false, 'Review Submission', 'Execution error', err.message);
  }

  // Test 2.6: Rate limiting kicks in after 5 requests
  try {
    const rateLimitIp = '192.168.100.254';
    let hit429 = false;
    for (let i = 0; i < 7; i++) {
      const req = new NextRequest('http://localhost:3000/api/reviews', {
        method: 'POST',
        body: JSON.stringify({
          laptopId: 1,
          rating: 5,
          comment: `Rate limit test review iteration ${i}`,
        }),
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': rateLimitIp,
        },
      });
      const res = await postReview(req);
      if (res.status === 429) {
        hit429 = true;
        break;
      }
    }
    assert(hit429, 'Review Rate Limiting', 'IP rate limiter returns 429 Too Many Requests after threshold exceeded');
  } catch (err: any) {
    assert(false, 'Review Rate Limiting', 'Execution error', err.message);
  }

  // ==========================================
  // SUITE 3: ADMIN ENDPOINTS AUTHORIZATION (403 GUARD)
  // ==========================================
  console.log('\n--- SUITE 3: Admin Authorization Enforcement (403 Guard) ---');

  // Test 3.1: /api/admin/stats returns 403 when unauthenticated
  try {
    const res = await getAdminStats();
    assert(res.status === 403, 'Admin Auth Guard', 'GET /api/admin/stats returns 403 for non-admin', `Status: ${res.status}`);
  } catch (err: any) {
    assert(false, 'Admin Auth Guard', 'Execution error', err.message);
  }

  // Test 3.2: /api/admin/banners returns 403 when unauthenticated
  try {
    const res = await getAdminBanners();
    assert(res.status === 403, 'Admin Auth Guard', 'GET /api/admin/banners returns 403 for non-admin', `Status: ${res.status}`);
  } catch (err: any) {
    assert(false, 'Admin Auth Guard', 'Execution error', err.message);
  }

  // Test 3.3: /api/admin/reviews returns 403 when unauthenticated
  try {
    const req = new NextRequest('http://localhost:3000/api/admin/reviews');
    const res = await getAdminReviews(req);
    assert(res.status === 403, 'Admin Auth Guard', 'GET /api/admin/reviews returns 403 for non-admin', `Status: ${res.status}`);
  } catch (err: any) {
    assert(false, 'Admin Auth Guard', 'Execution error', err.message);
  }

  // ==========================================
  // SUITE 4: LAPTOP CATALOG QUERY & FILTER PERFORMANCE
  // ==========================================
  console.log('\n--- SUITE 4: Laptop Catalog Filtering & Index Usage ---');
  try {
    const t0 = Date.now();
    // Test 4.1: Budget filter query (utilizing [condition, price] index)
    const budgetFiltered = await prisma.laptop.findMany({
      where: {
        condition: 'baru',
        price: { gte: BigInt(5000000), lte: BigInt(10000000) },
      },
      take: 20,
    });
    const elapsed = Date.now() - t0;
    assert(
      Array.isArray(budgetFiltered) && budgetFiltered.length > 0,
      'Catalog Filtering',
      'Filter by condition and price range successful',
      `Count: ${budgetFiltered.length}, Time: ${elapsed}ms`
    );

    // Test 4.2: Brand filter query (utilizing [brand] index)
    const brandFiltered = await prisma.laptop.findMany({
      where: { brand: 'ASUS' },
      take: 20,
    });
    assert(
      Array.isArray(brandFiltered) && brandFiltered.length > 0 && brandFiltered.every((l) => l.brand === 'ASUS'),
      'Catalog Filtering',
      'Filter by brand index successful',
      `Count: ${brandFiltered.length}`
    );

    // Test 4.3: Search keyword query
    const searchFiltered = await prisma.laptop.findMany({
      where: {
        name: { contains: 'Ryzen', mode: 'insensitive' },
      },
      take: 10,
    });
    assert(
      Array.isArray(searchFiltered) && searchFiltered.length > 0,
      'Catalog Filtering',
      'Search laptop by keyword "Ryzen" successful',
      `Count: ${searchFiltered.length}`
    );
  } catch (err: any) {
    assert(false, 'Catalog Filtering', 'Execution error', err.message);
  }

  // ==========================================
  // SUMMARY
  // ==========================================
  console.log('\n========================================================');
  console.log('                 API TEST SUMMARY REPORT                ');
  console.log('========================================================');
  const passCount = results.filter((r) => r.status === 'PASS').length;
  const failCount = results.filter((r) => r.status === 'FAIL').length;
  console.log(`Total API Tests Run: ${results.length}`);
  console.log(`Passed             : ${passCount}`);
  console.log(`Failed             : ${failCount}`);

  await prisma.$disconnect();

  if (failCount > 0) {
    console.error('\n❌ SOME API TESTS FAILED.');
    process.exit(1);
  } else {
    console.log('\n🎉 ALL API TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
  }
}

runApiTests().catch(async (e) => {
  console.error('Fatal API test runner error:', e);
  await prisma.$disconnect();
  process.exit(1);
});
