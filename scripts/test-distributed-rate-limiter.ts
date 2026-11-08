// scripts/test-distributed-rate-limiter.ts - Comprehensive Upstash Redis Distributed & Multi-Instance Rate Limiter Test Suite
import http from 'http';
import { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import {
  checkReviewRateLimit,
  getClientIp,
  isValidIp,
  clearFallbackStoreForTesting,
} from '../src/lib/review-rate-limiter';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

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
    if (details) console.log(`     └─ ${details}`);
  } else {
    results.push({ suite, testName, status: 'FAIL', details, error: 'Assertion failed' });
    console.error(`  ❌ [FAIL] ${testName}: ${details}`);
  }
}

async function runTests() {
  console.log('========================================================================');
  console.log('   LAPMATCH DISTRIBUTED UPSTASH RATE LIMITER TEST SUITE (VERCEL READINESS)   ');
  console.log('========================================================================\n');

  // ============================================================================
  // SUITE 1: HTTP API ENDPOINT BEHAVIOR (LIVE NEXT.JS SERVER)
  // ============================================================================
  console.log('--- SUITE 1: HTTP API Endpoint Quota, Threshold & Headers ---');
  clearFallbackStoreForTesting();

  const testSubnet = Math.floor(Math.random() * 200) + 20;
  const targetIp = `192.0.2.${testSubnet}`;
  const controlIp = `192.0.2.${testSubnet + 1}`;

  // 1.1: First 5 requests within quota are accepted (return 400 validation, NOT 429)
  let first5Accepted = true;
  for (let i = 1; i <= 5; i++) {
    const res = await fetch(`${BASE_URL}/api/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-vercel-ip': targetIp,
      },
      body: JSON.stringify({ rating: 0, comment: `Probe #${i}` }),
    });

    if (res.status === 429) {
      first5Accepted = false;
      break;
    }
  }
  assert(first5Accepted, 'API Quota', 'First 5 requests within quota are processed without 429');

  // 1.2: 6th request must be rejected with HTTP 429
  const res6 = await fetch(`${BASE_URL}/api/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-vercel-ip': targetIp,
    },
    body: JSON.stringify({ rating: 5, comment: '6th request attempt' }),
  });
  const data6 = await res6.json();
  const hasRetryAfter = Boolean(res6.headers.get('retry-after'));
  const hasRateLimitLimit = res6.headers.get('x-ratelimit-limit') === '5';

  assert(
    res6.status === 429 && data6.error?.includes('Terlalu banyak permintaan'),
    'API Quota',
    '6th request is rejected with HTTP 429 and Indonesian warning message',
    `Status: ${res6.status}, Message: "${data6.error}"`
  );

  assert(
    hasRetryAfter && hasRateLimitLimit,
    'API Headers',
    'HTTP 429 response includes Retry-After and X-RateLimit headers',
    `Retry-After: ${res6.headers.get('retry-after')}, Limit: ${res6.headers.get('x-ratelimit-limit')}`
  );

  // 1.3: 7th request persistently blocked
  const res7 = await fetch(`${BASE_URL}/api/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-vercel-ip': targetIp,
    },
    body: JSON.stringify({ rating: 5, comment: '7th request attempt' }),
  });
  assert(res7.status === 429, 'API Quota', '7th request persistently rejected with HTTP 429');

  // 1.4: Independent Control IP is NOT blocked (IP Isolation)
  const resControl = await fetch(`${BASE_URL}/api/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-vercel-ip': controlIp,
    },
    body: JSON.stringify({ rating: 0, comment: 'Control IP' }),
  });
  assert(
    resControl.status !== 429,
    'IP Isolation',
    'Control IP has distinct quota and is NOT throttled',
    `Status: ${resControl.status}`
  );

  // ============================================================================
  // SUITE 2: CLIENT IP RESOLUTION & HEADER SPOOFING DEFENSE
  // ============================================================================
  console.log('\n--- SUITE 2: Client IP Extraction & Header Spoofing Resistance ---');

  // 2.1: Valid IP format validation
  assert(isValidIp('192.168.1.1'), 'IP Validation', 'Valid IPv4 accepted');
  assert(isValidIp('2001:0db8:85a3:0000:0000:8a2e:0370:7334'), 'IP Validation', 'Valid IPv6 accepted');
  assert(!isValidIp('bad-ip; drop table'), 'IP Validation', 'SQL injection string in IP rejected');
  assert(!isValidIp('999.999.999.999'), 'IP Validation', 'Out-of-range IP rejected');

  // 2.2: x-vercel-ip priority over spoofed x-forwarded-for
  const spoofRequest1 = new NextRequest('http://localhost:3000/api/reviews', {
    headers: {
      'x-vercel-ip': '198.51.100.99',
      'x-forwarded-for': '1.1.1.1, 2.2.2.2', // attacker trying to spoof
    },
  });
  const resolvedIp1 = getClientIp(spoofRequest1);
  assert(
    resolvedIp1 === '198.51.100.99',
    'Spoofing Defense',
    'x-vercel-ip takes strict precedence over user-manipulated x-forwarded-for',
    `Resolved IP: ${resolvedIp1}`
  );

  // 2.3: Safe parsing of comma-separated x-forwarded-for
  const spoofRequest2 = new NextRequest('http://localhost:3000/api/reviews', {
    headers: {
      'x-forwarded-for': 'malicious-string, 203.0.113.42, 10.0.0.1',
    },
  });
  const resolvedIp2 = getClientIp(spoofRequest2);
  assert(
    resolvedIp2 === '203.0.113.42',
    'Spoofing Defense',
    'Mangled string in x-forwarded-for safely ignored; first valid IP extracted',
    `Resolved IP: ${resolvedIp2}`
  );

  // ============================================================================
  // SUITE 3: USER-ID BASED RATE LIMITING
  // ============================================================================
  console.log('\n--- SUITE 3: User ID vs IP Scoped Rate Limiting ---');
  clearFallbackStoreForTesting();

  // Test that two requests from the same user ID on different IPs share the same quota
  const testUserId = `user-qa-uuid-${Date.now()}`;
  const reqIpA = new NextRequest('http://localhost:3000/api/reviews', {
    headers: { 'x-vercel-ip': '198.51.100.1' },
  });
  const reqIpB = new NextRequest('http://localhost:3000/api/reviews', {
    headers: { 'x-vercel-ip': '198.51.100.2' }, // different IP
  });

  // User sends 5 requests across different IPs
  for (let i = 0; i < 3; i++) {
    await checkReviewRateLimit(reqIpA, testUserId);
  }
  for (let i = 0; i < 2; i++) {
    await checkReviewRateLimit(reqIpB, testUserId);
  }

  // 6th request from user on yet another IP MUST be blocked
  const reqIpC = new NextRequest('http://localhost:3000/api/reviews', {
    headers: { 'x-vercel-ip': '198.51.100.3' },
  });
  const userRateLimit6 = await checkReviewRateLimit(reqIpC, testUserId);
  assert(
    !userRateLimit6.allowed && userRateLimit6.identifier === `user:${testUserId}`,
    'User Rate Limiting',
    'Authenticated user cannot bypass rate limit by rotating IP addresses',
    `Allowed: ${userRateLimit6.allowed}, Identifier: ${userRateLimit6.identifier}`
  );

  // ============================================================================
  // SUITE 4: MULTI-INSTANCE SHARED UPSTASH REDIS VERIFICATION
  // ============================================================================
  console.log('\n--- SUITE 4: Multi-Instance Shared Upstash Redis Simulation ---');

  // We spin up a local Upstash-compatible REST server to simulate Upstash Redis
  // and instantiate two distinct Ratelimit instances (simulating Instance A & Instance B in Vercel)
  const sharedMemoryStore = new Map<string, number>();
  const mockPort = 8099;

  const mockUpstashServer = http.createServer((req, res) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const commands = JSON.parse(body);
        const resultsArray = commands.map((cmd: any[]) => {
          const command = cmd[0]?.toLowerCase();
          if (command === 'eval' || command === 'evalsha') {
            // Sliding window evaluator
            const key = cmd[3]; // primary key
            const limit = Number(cmd[5]) || 5;
            const currentCount = (sharedMemoryStore.get(key) || 0) + 1;
            sharedMemoryStore.set(key, currentCount);

            if (currentCount <= limit) {
              return { result: [limit - currentCount, limit] };
            } else {
              return { result: [-1, limit] };
            }
          }
          return { result: 'OK' };
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(resultsArray));
      } catch (err: any) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
  });

  await new Promise<void>((resolve) => mockUpstashServer.listen(mockPort, resolve));

  try {
    const mockRedis = new Redis({
      url: `http://127.0.0.1:${mockPort}`,
      token: 'mock-upstash-token',
    });

    // Simulate Container Instance A (e.g. AWS Lambda / Vercel Worker 1)
    const instanceA = new Ratelimit({
      redis: mockRedis,
      limiter: Ratelimit.slidingWindow(5, '10 m'),
      prefix: 'test:shared',
    });

    // Simulate Container Instance B (e.g. AWS Lambda / Vercel Worker 2)
    const instanceB = new Ratelimit({
      redis: mockRedis,
      limiter: Ratelimit.slidingWindow(5, '10 m'),
      prefix: 'test:shared',
    });

    const testSubject = `shared-client-${Date.now()}`;

    // Instance A receives 3 requests
    const resA1 = await instanceA.limit(testSubject);
    const resA2 = await instanceA.limit(testSubject);
    const resA3 = await instanceA.limit(testSubject);
    assert(
      resA1.success && resA2.success && resA3.success,
      'Multi-Instance Sync',
      'Instance A processes first 3 requests'
    );

    // Instance B (completely separate process) receives 2 requests
    const resB1 = await instanceB.limit(testSubject);
    const resB2 = await instanceB.limit(testSubject);
    assert(
      resB1.success && resB2.success,
      'Multi-Instance Sync',
      'Instance B processes next 2 requests (Total = 5)'
    );

    // 6th request arrives at Instance A (or B)
    const resFinal = await instanceA.limit(testSubject);
    assert(
      !resFinal.success && resFinal.remaining === 0,
      'Multi-Instance Sync',
      'Instance A strictly rejects 6th request because Instance B consumed the remaining quota in Redis',
      `Success: ${resFinal.success}, Remaining: ${resFinal.remaining}`
    );
  } finally {
    mockUpstashServer.close();
  }

  // ============================================================================
  // SUITE 5: REDIS OUTAGE & FAIL-SECURE BEHAVIOR
  // ============================================================================
  console.log('\n--- SUITE 5: Redis Failure & Fail-Secure Fallback Verification ---');
  clearFallbackStoreForTesting();

  // Test that when Upstash Redis endpoint is down/unreachable:
  // It engages strict local sliding window fallback and NEVER allows requests beyond 5!
  const offlineReq = new NextRequest('http://localhost:3000/api/reviews', {
    headers: { 'x-vercel-ip': '198.51.100.222' },
  });

  // Temporarily point to dead port to simulate network failure
  const originalUrl = process.env.UPSTASH_REDIS_REST_URL;
  const originalToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  process.env.UPSTASH_REDIS_REST_URL = 'http://127.0.0.1:1'; // dead port
  process.env.UPSTASH_REDIS_REST_TOKEN = 'fake-token';

  for (let i = 1; i <= 5; i++) {
    const res = await checkReviewRateLimit(offlineReq);
    assert(
      res.allowed && res.source === 'strict-fallback',
      'Fail-Secure Fallback',
      `Request #${i} safely handled by strict fallback during Redis outage`
    );
  }

  // 6th request during outage MUST be blocked (NO silent bypass!)
  const blockedOffline = await checkReviewRateLimit(offlineReq);
  assert(
    !blockedOffline.allowed && blockedOffline.remaining === 0,
    'Fail-Secure Fallback',
    'Request #6 strictly blocked during Redis outage: NO silent open bypass',
    `Allowed: ${blockedOffline.allowed}, Remaining: ${blockedOffline.remaining}`
  );

  // Restore env
  process.env.UPSTASH_REDIS_REST_URL = originalUrl;
  process.env.UPSTASH_REDIS_REST_TOKEN = originalToken;

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log('\n========================================================================');
  console.log('       DISTRIBUTED RATE LIMITER VERIFICATION SUMMARY REPORT             ');
  console.log('========================================================================');
  const passCount = results.filter((r) => r.status === 'PASS').length;
  const failCount = results.filter((r) => r.status === 'FAIL').length;
  console.log(`Total Scenarios Tested : ${results.length}`);
  console.log(`Passed                 : ${passCount}`);
  console.log(`Failed                 : ${failCount}`);

  if (failCount > 0) {
    console.error('\n❌ SOME DISTRIBUTED RATE LIMITER TESTS FAILED.');
    process.exit(1);
  } else {
    console.log('\n🎉 ALL DISTRIBUTED RATE LIMITER TESTS PASSED (100%)!');
    process.exit(0);
  }
}

runTests().catch((e) => {
  console.error('Fatal test runner error:', e);
  process.exit(1);
});
