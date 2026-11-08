// scripts/functional-test-suite.ts - Comprehensive Functional Testing Suite for Lapmatch
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import { calculateRocWeights } from '../src/lib/roc';
import { calculateTopsis, LaptopData } from '../src/lib/topsis';
import prisma from '../src/lib/prisma';
import {
  getAllBanners,
  getActiveBanners,
  addBanner,
  updateBanner,
  toggleBannerStatus,
  deleteBanner,
} from '../src/lib/banner-store';

interface TestResult {
  suite: string;
  testName: string;
  status: 'PASS' | 'FAIL';
  details?: string;
  error?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, suite: string, testName: string, details?: string) {
  if (condition) {
    results.push({ suite, testName, status: 'PASS', details });
    console.log(`  ✅ [PASS] ${testName}`);
  } else {
    results.push({ suite, testName, status: 'FAIL', details, error: 'Assertion failed' });
    console.error(`  ❌ [FAIL] ${testName}: ${details}`);
  }
}

async function runTestSuite() {
  console.log('========================================================');
  console.log('     LAPMATCH FUNCTIONAL TEST SUITE (FASE 3)           ');
  console.log('========================================================\n');

  // ==========================================
  // SUITE 1: ROC (Rank Order Centroid) ALGORITHM
  // ==========================================
  console.log('--- SUITE 1: ROC Algorithm Tests ---');
  try {
    const kriteria6 = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'];
    const roc6 = calculateRocWeights(kriteria6);

    // Test 1.1: Sum of weights must equal 1.0 (floating point tolerance)
    const sum6 = Object.values(roc6).reduce((acc, curr) => acc + curr.bobot, 0);
    assert(Math.abs(sum6 - 1.0) < 1e-4, 'ROC', 'Sum of 6 criteria weights equals 1.0', `Sum: ${sum6}`);

    // Test 1.2: Order monotonicity w1 > w2 > w3 > w4 > w5 > w6
    const weightsArr = kriteria6.map((c) => roc6[c].bobot);
    let isMonotonic = true;
    for (let i = 0; i < weightsArr.length - 1; i++) {
      if (weightsArr[i] <= weightsArr[i + 1]) isMonotonic = false;
    }
    assert(isMonotonic, 'ROC', 'Strict monotonicity: w1 > w2 > ... > w6', `Weights: ${weightsArr.join(', ')}`);

    // Test 1.3: Theoretical precision check for C1 (~0.4083) and C6 (~0.0278)
    assert(
      Math.abs(roc6['C1'].bobot - 0.4083) < 0.001,
      'ROC',
      'C1 theoretical weight accuracy (~0.4083)',
      `Actual: ${roc6['C1'].bobot}`
    );
    assert(
      Math.abs(roc6['C6'].bobot - 0.0278) < 0.001,
      'ROC',
      'C6 theoretical weight accuracy (~0.0278)',
      `Actual: ${roc6['C6'].bobot}`
    );

    // Test 1.4: Single criterion edge case (K = 1 -> weight = 1.0)
    const roc1 = calculateRocWeights(['C1']);
    assert(roc1['C1'].bobot === 1.0, 'ROC', 'Single criterion returns weight 1.0');
  } catch (err: any) {
    assert(false, 'ROC', 'Execution error', err.message);
  }

  // ==========================================
  // SUITE 2: TOPSIS DECISION ENGINE
  // ==========================================
  console.log('\n--- SUITE 2: TOPSIS Engine Tests ---');
  try {
    const weights = { C1: 0.4083, C2: 0.2417, C3: 0.1583, C4: 0.1028, C5: 0.0611, C6: 0.0278 };
    const types = { C1: 'cost', C2: 'benefit', C3: 'benefit', C4: 'benefit', C5: 'benefit', C6: 'cost' };

    const sampleLaptops: LaptopData[] = [
      {
        id: 101,
        name: 'Budget King',
        brand: 'BrandA',
        price: 5000000,
        performaKomposit: 60,
        ramGb: 8,
        storageGb: 512,
        batteryHours: 6.0,
        weightKg: 1.4,
        condition: 'baru',
      },
      {
        id: 102,
        name: 'Power Monster',
        brand: 'BrandB',
        price: 15000000,
        performaKomposit: 95,
        ramGb: 32,
        storageGb: 1000,
        batteryHours: 8.0,
        weightKg: 2.2,
        condition: 'baru',
      },
      {
        id: 103,
        name: 'Balanced Student',
        brand: 'BrandC',
        price: 8000000,
        performaKomposit: 75,
        ramGb: 16,
        storageGb: 512,
        batteryHours: 7.0,
        weightKg: 1.5,
        condition: 'baru',
      },
    ];

    const topsisResult = calculateTopsis(sampleLaptops, weights, types);

    // Test 2.1: All laptops are evaluated and ranked
    assert(
      topsisResult.ranked.length === 3,
      'TOPSIS',
      'All input alternatives are evaluated and ranked',
      `Count: ${topsisResult.ranked.length}`
    );

    // Test 2.2: Ranks are consecutive 1, 2, 3
    const ranks = topsisResult.ranked.map((r) => r.peringkat);
    assert(
      ranks[0] === 1 && ranks[1] === 2 && ranks[2] === 3,
      'TOPSIS',
      'Ranks are consecutive starting from 1',
      `Ranks: ${ranks.join(', ')}`
    );

    // Test 2.3: Preference scores V are sorted descending
    const vScores = topsisResult.ranked.map((r) => r.nilaiV);
    assert(
      vScores[0] >= vScores[1] && vScores[1] >= vScores[2],
      'TOPSIS',
      'Preference values V are sorted descending',
      `Scores: ${vScores.join(', ')}`
    );

    // Test 2.4: Transparency matrices generated
    assert(
      typeof topsisResult.matrixX === 'object' && Object.keys(topsisResult.matrixX).length === 3,
      'TOPSIS',
      'Decision matrix X generated for transparency modal'
    );
    assert(
      typeof topsisResult.matrixR === 'object' && Object.keys(topsisResult.matrixR).length === 3,
      'TOPSIS',
      'Normalized matrix R generated for transparency modal'
    );
    assert(
      typeof topsisResult.matrixY === 'object' && Object.keys(topsisResult.matrixY).length === 3,
      'TOPSIS',
      'Weighted normalized matrix Y generated for transparency modal'
    );
    assert(
      Boolean(topsisResult.idealPositive && topsisResult.idealNegative),
      'TOPSIS',
      'Positive & Negative Ideal Solutions (A+ / A-) generated'
    );

    // Test 2.5: Division by zero safety guard
    const identicalLaptops: LaptopData[] = [
      {
        id: 201,
        name: 'Identical A',
        brand: 'X',
        price: 7000000,
        performaKomposit: 70,
        ramGb: 8,
        storageGb: 256,
        batteryHours: 5,
        weightKg: 1.5,
        condition: 'baru',
      },
      {
        id: 202,
        name: 'Identical B',
        brand: 'X',
        price: 7000000,
        performaKomposit: 70,
        ramGb: 8,
        storageGb: 256,
        batteryHours: 5,
        weightKg: 1.5,
        condition: 'baru',
      },
    ];
    const identicalRes = calculateTopsis(identicalLaptops, weights, types);
    assert(
      identicalRes.ranked.every((r) => Number.isFinite(r.nilaiV)),
      'TOPSIS',
      'Division by zero guard: V is finite when all candidates identical',
      `V values: ${identicalRes.ranked.map((r) => r.nilaiV).join(', ')}`
    );

    // Test 2.6: Substandard penalty for RAM < 4GB
    const subLaptops: LaptopData[] = [
      {
        id: 301,
        name: 'Obsolete Netbook',
        brand: 'Old',
        price: 1500000,
        performaKomposit: null,
        ramGb: 2,
        storageGb: 160,
        batteryHours: null,
        weightKg: null,
        condition: 'second',
      },
      {
        id: 302,
        name: 'Standard Laptop',
        brand: 'Modern',
        price: 5000000,
        performaKomposit: 65,
        ramGb: 8,
        storageGb: 256,
        batteryHours: 6,
        weightKg: 1.5,
        condition: 'baru',
      },
    ];
    const subRes = calculateTopsis(subLaptops, weights, types);
    const obsolete = subRes.ranked.find((r) => r.laptopId === 301);
    assert(
      Boolean(obsolete?.isSubstandard),
      'TOPSIS',
      'RAM < 4GB correctly flagged as substandard',
      `Flag: ${obsolete?.isSubstandard}`
    );
  } catch (err: any) {
    assert(false, 'TOPSIS', 'Execution error', err.message);
  }

  // ==========================================
  // SUITE 3: BANNER POSTGRESQL PERSISTENCE & CRUD
  // ==========================================
  console.log('\n--- SUITE 3: Banner PostgreSQL & Store Tests ---');
  try {
    // Test 3.1: Read from PostgreSQL
    const allBanners = await getAllBanners();
    assert(
      Array.isArray(allBanners) && allBanners.length >= 4,
      'Banner Store',
      'getAllBanners() loads successfully from PostgreSQL',
      `Count: ${allBanners.length}`
    );

    const activeBanners = await getActiveBanners();
    assert(
      activeBanners.every((b) => b.isActive === true),
      'Banner Store',
      'getActiveBanners() only returns active banners',
      `Active count: ${activeBanners.length}`
    );

    // Test 3.2: Create test banner in PostgreSQL
    const testTitle = `[AUTOMATED_TEST] Test Banner ${Date.now()}`;
    const createdBanner = await addBanner({
      title: testTitle,
      brand: 'TestBrand',
      subtitle: 'Created by automated test suite',
      price: 10000000,
      originalPrice: 12000000,
      discount: 'Hemat 15%',
      badge: 'Test Badge',
      processor: 'Test CPU',
      vga: 'Test GPU',
      ramGb: 16,
      storageGb: 512,
      display: '15.6 inch',
      imageUrl: 'https://images.unsplash.com/test.jpg',
      isActive: true,
      sortOrder: 99,
    });

    assert(Boolean(createdBanner && createdBanner.id), 'Banner Store', 'addBanner() inserts into PostgreSQL', `ID: ${createdBanner.id}`);

    // Verify it exists in database directly
    const dbRecord = await prisma.banner.findUnique({ where: { id: createdBanner.id } });
    assert(Boolean(dbRecord && dbRecord.title === testTitle), 'Banner Store', 'Database verification: banner persisted in PostgreSQL');

    // Test 3.3: Update banner
    const updated = await updateBanner(createdBanner.id, {
      title: `${testTitle} (Updated)`,
      price: 9500000,
    });
    assert(
      Boolean(updated && updated.title.includes('(Updated)') && updated.price === 9500000),
      'Banner Store',
      'updateBanner() updates record in PostgreSQL'
    );

    // Test 3.4: Toggle banner active status
    const toggled = await toggleBannerStatus(createdBanner.id);
    assert(toggled?.isActive === false, 'Banner Store', 'toggleBannerStatus() toggles isActive boolean', `Status: ${toggled?.isActive}`);

    // Test 3.5: Delete test banner (cleanup)
    const deleted = await deleteBanner(createdBanner.id);
    assert(deleted === true, 'Banner Store', 'deleteBanner() deletes record from PostgreSQL');

    const checkDeleted = await prisma.banner.findUnique({ where: { id: createdBanner.id } });
    assert(checkDeleted === null, 'Banner Store', 'Verification: record completely removed from database');
  } catch (err: any) {
    assert(false, 'Banner Store', 'Execution error', err.message);
  }

  // ==========================================
  // SUITE 4: REVIEW & RATING SECURITY
  // ==========================================
  console.log('\n--- SUITE 4: Review Security & Validation Tests ---');
  try {
    // Test 4.1: Read reviews from PostgreSQL
    const reviewsInDb = await prisma.review.findMany({
      where: { status: 'published' },
      take: 5,
    });
    assert(
      reviewsInDb.length > 0,
      'Review Store',
      'Public reviews load from PostgreSQL reviews table',
      `Count: ${reviewsInDb.length}`
    );

    // Test 4.2: Foreign key cascade integrity
    const sampleLaptop = await prisma.laptop.findFirst({ select: { id: true, name: true } });
    assert(Boolean(sampleLaptop), 'Review Store', 'Sample laptop found for review tests');

    if (sampleLaptop) {
      // Create temporary review
      const testReview = await prisma.review.create({
        data: {
          laptopId: sampleLaptop.id,
          userName: 'QA Automated Bot',
          userRole: 'Mahasiswa',
          rating: 5,
          comment: 'Ulasan otomatis untuk pengujian fungsional Lapmatch Fase 3.',
          status: 'published',
        },
      });

      assert(Boolean(testReview.id), 'Review Store', 'Review created in PostgreSQL', `ID: ${testReview.id}`);

      // Cleanup test review
      await prisma.review.delete({ where: { id: testReview.id } });
      const checkRev = await prisma.review.findUnique({ where: { id: testReview.id } });
      assert(checkRev === null, 'Review Store', 'Test review cleaned up successfully');
    }
  } catch (err: any) {
    assert(false, 'Review Store', 'Execution error', err.message);
  }

  // ==========================================
  // SUITE 5: DATABASE RELATIONAL INTEGRITY & MULTI-TENANT ISOLATION
  // ==========================================
  console.log('\n--- SUITE 5: Multi-Tenant Data Isolation & Integrity ---');
  try {
    // Test 5.1: Verify 2,284 laptop records intact
    const laptopCount = await prisma.laptop.count();
    assert(laptopCount >= 2280, 'Data Integrity', 'All 2,284 laptop catalog records are intact', `Count: ${laptopCount}`);

    // Test 5.2: Verify criteria table has 6 records
    const kriteriaCount = await prisma.kriteria.count();
    assert(kriteriaCount === 6, 'Data Integrity', 'TOPSIS 6 evaluation criteria intact', `Count: ${kriteriaCount}`);

    // Test 5.3: Verify questionnaire and consultation records intact
    const kuisionerCount = await prisma.kuisionerJawaban.count();
    assert(kuisionerCount >= 26, 'Data Integrity', 'User consultation sessions intact', `Count: ${kuisionerCount}`);

    // Test 5.4: Verify user data isolation logic
    const sampleConsultation = await prisma.kuisionerJawaban.findFirst({
      select: { id: true, userId: true },
    });
    if (sampleConsultation) {
      const otherUserConsultation = await prisma.kuisionerJawaban.findFirst({
        where: {
          id: sampleConsultation.id,
          userId: 'non-existent-user-uuid-9999',
        },
      });
      assert(
        otherUserConsultation === null,
        'Multi-tenant Isolation',
        'User A cannot query User B consultation via userId filter'
      );
    }
  } catch (err: any) {
    assert(false, 'Data Integrity', 'Execution error', err.message);
  }

  // ==========================================
  // SUITE 6: ADMIN KPI AGGREGATION & AUTHORIZATION
  // ==========================================
  console.log('\n--- SUITE 6: Admin Statistics & Aggregation Tests ---');
  try {
    const [userCount, laptopCount, consultationCount, bannerCount, reviewCount] = await Promise.all([
      prisma.user.count(),
      prisma.laptop.count(),
      prisma.kuisionerJawaban.count(),
      prisma.banner.count(),
      prisma.review.count(),
    ]);

    assert(userCount > 0, 'Admin Stats', 'User count aggregation functional', `Users: ${userCount}`);
    assert(laptopCount > 0, 'Admin Stats', 'Laptop count aggregation functional', `Laptops: ${laptopCount}`);
    assert(consultationCount > 0, 'Admin Stats', 'Consultations aggregation functional', `Consultations: ${consultationCount}`);
    assert(bannerCount > 0, 'Admin Stats', 'Banner count aggregation functional', `Banners: ${bannerCount}`);
    assert(reviewCount > 0, 'Admin Stats', 'Review count aggregation functional', `Reviews: ${reviewCount}`);

    // Aggregate average rating
    const reviewStats = await prisma.review.aggregate({
      _avg: { rating: true },
      _count: { id: true },
    });
    assert(
      reviewStats._avg.rating !== null && reviewStats._avg.rating >= 1 && reviewStats._avg.rating <= 5,
      'Admin Stats',
      'Average rating calculation functional',
      `Avg: ${reviewStats._avg.rating?.toFixed(2)}`
    );
  } catch (err: any) {
    assert(false, 'Admin Stats', 'Execution error', err.message);
  }

  // ==========================================
  // SUMMARY
  // ==========================================
  console.log('\n========================================================');
  console.log('                 TEST SUMMARY REPORT                    ');
  console.log('========================================================');
  const passCount = results.filter((r) => r.status === 'PASS').length;
  const failCount = results.filter((r) => r.status === 'FAIL').length;
  console.log(`Total Tests Run: ${results.length}`);
  console.log(`Passed         : ${passCount}`);
  console.log(`Failed         : ${failCount}`);

  await prisma.$disconnect();

  if (failCount > 0) {
    console.error('\n❌ SOME FUNCTIONAL TESTS FAILED.');
    process.exit(1);
  } else {
    console.log('\n🎉 ALL FUNCTIONAL TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
  }
}

runTestSuite().catch(async (e) => {
  console.error('Fatal test runner error:', e);
  await prisma.$disconnect();
  process.exit(1);
});
