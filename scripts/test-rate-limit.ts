// scripts/test-rate-limit.ts - Dedicated Rate Limiting Verification for POST /api/reviews
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function testRateLimiting() {
  console.log('========================================================');
  console.log('   LAPMATCH DEDICATED RATE LIMITING TEST (REVIEWS API)  ');
  console.log('   Enforces max 5 reviews per 10-minute window per IP   ');
  console.log('========================================================\n');

  const randomSubnet = Math.floor(Math.random() * 200) + 20;
  const targetIp = `10.99.${randomSubnet}.42`;
  const controlIp = `10.99.${randomSubnet}.200`;

  console.log(`Target Test IP : ${targetIp}`);
  console.log(`Control Test IP: ${controlIp}\n`);

  let success = true;

  // Step 1: Send 5 consecutive requests from targetIp - all must be processed (NOT 429)
  console.log('--- Step 1: Sending first 5 requests (Quota allowance) ---');
  for (let i = 1; i <= 5; i++) {
    try {
      const res = await fetch(`${BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': targetIp,
        },
        body: JSON.stringify({
          laptopId: 1,
          rating: 0, // intentional validation failure (400) to avoid inserting junk into DB
          comment: `Rate limit probe #${i}`,
        }),
      });

      console.log(`  Request #${i}: HTTP ${res.status} (Expected: 400 Validation, NOT 429)`);
      if (res.status === 429) {
        console.error(`  ❌ FAIL: Request #${i} was prematurely throttled!`);
        success = false;
      }
    } catch (err: any) {
      console.error(`  ❌ Network error on request #${i}:`, err.message);
      success = false;
    }
  }

  // Step 2: Send 6th request from targetIp - MUST be rejected with HTTP 429
  console.log('\n--- Step 2: Sending 6th request (Quota exhaustion threshold) ---');
  try {
    const res6 = await fetch(`${BASE_URL}/api/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': targetIp,
      },
      body: JSON.stringify({
        laptopId: 1,
        rating: 5,
        comment: 'This 6th request must be throttled',
      }),
    });

    const data6 = await res6.json();
    console.log(`  Request #6: HTTP ${res6.status}`);
    console.log(`  Response message: "${data6.error}"`);

    if (res6.status === 429 && data6.error?.includes('Terlalu banyak permintaan')) {
      console.log('  ✅ [PASS] Request #6 correctly blocked by Rate Limiter (HTTP 429)');
    } else {
      console.error(`  ❌ [FAIL] Expected HTTP 429, got HTTP ${res6.status}`);
      success = false;
    }
  } catch (err: any) {
    console.error('  ❌ Error on request #6:', err.message);
    success = false;
  }

  // Step 3: Send 7th request from targetIp - MUST still be rejected with HTTP 429
  console.log('\n--- Step 3: Sending 7th request (Continued throttle persistence) ---');
  try {
    const res7 = await fetch(`${BASE_URL}/api/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': targetIp,
      },
      body: JSON.stringify({
        laptopId: 1,
        rating: 5,
        comment: 'This 7th request must also be throttled',
      }),
    });

    if (res7.status === 429) {
      console.log('  ✅ [PASS] Request #7 persistently throttled (HTTP 429)');
    } else {
      console.error(`  ❌ [FAIL] Expected HTTP 429 for request #7, got HTTP ${res7.status}`);
      success = false;
    }
  } catch (err: any) {
    console.error('  ❌ Error on request #7:', err.message);
    success = false;
  }

  // Step 4: Verify IP Isolation - Control IP must NOT be blocked
  console.log('\n--- Step 4: IP Isolation Verification (Control IP) ---');
  try {
    const controlRes = await fetch(`${BASE_URL}/api/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': controlIp,
      },
      body: JSON.stringify({
        laptopId: 1,
        rating: 0, // will return 400 validation, but NOT 429
        comment: 'Control IP check',
      }),
    });

    console.log(`  Control IP Request: HTTP ${controlRes.status}`);
    if (controlRes.status !== 429) {
      console.log('  ✅ [PASS] Control IP is NOT throttled. Rate limiting is strictly isolated per IP.');
    } else {
      console.error('  ❌ [FAIL] Control IP was incorrectly throttled!');
      success = false;
    }
  } catch (err: any) {
    console.error('  ❌ Error on control IP request:', err.message);
    success = false;
  }

  console.log('\n========================================================');
  if (success) {
    console.log('🎉 RATE LIMITING VERIFICATION COMPLETE: ALL CHECKS PASSED');
    process.exit(0);
  } else {
    console.error('❌ RATE LIMITING VERIFICATION FAILED');
    process.exit(1);
  }
}

testRateLimiting().catch((e) => {
  console.error('Fatal error during rate limit test:', e);
  process.exit(1);
});
