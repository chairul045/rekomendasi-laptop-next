// src/lib/review-rate-limiter.ts - Distributed Rate Limiter untuk Review Laptop (Upstash Redis + Strict Fallback)
import { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

import net from 'net';

export interface RateLimitCheckResult {
  allowed: boolean;
  remaining: number;
  resetTime: number; // Unix timestamp in ms
  retryAfterSeconds: number;
  source: 'upstash-redis' | 'strict-fallback';
  identifier: string;
  error?: string;
}

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_SECONDS = 10 * 60; // 10 menit
const RATE_LIMIT_WINDOW_MS = RATE_LIMIT_WINDOW_SECONDS * 1000;

// ============================================================================
// 1. Validasi & Ekstraksi IP Tepercaya
// ============================================================================

export function isValidIp(ip: string): boolean {
  if (!ip || typeof ip !== 'string') return false;
  const trimmed = ip.trim();
  // Validasi format IPv4 & IPv6 menggunakan engine internal net.isIP (RFC 791 & RFC 4291)
  if (net.isIP(trimmed) !== 0) return true;
  if (trimmed.startsWith('::ffff:')) {
    const v4Part = trimmed.substring(7);
    return net.isIP(v4Part) === 4;
  }
  return false;
}

export function getClientIp(request: NextRequest): string {
  // Prioritas 1: Header terverifikasi Vercel Edge (tamper-proof di lingkungan serverless Vercel)
  const vercelIp = request.headers.get('x-vercel-ip');
  if (vercelIp && isValidIp(vercelIp)) {
    return vercelIp.trim();
  }

  // Prioritas 2: Header Cloudflare Connecting IP
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp && isValidIp(cfIp)) {
    return cfIp.trim();
  }

  // Prioritas 3: x-real-ip dari reverse proxy
  const realIp = request.headers.get('x-real-ip');
  if (realIp && isValidIp(realIp)) {
    return realIp.trim();
  }

  // Prioritas 4: x-forwarded-for (diparsing dan divalidasi keabsahan format IP)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const parts = forwardedFor.split(',').map((p) => p.trim());
    for (const part of parts) {
      if (isValidIp(part)) {
        return part;
      }
    }
  }

  // Fallback standar dev/lokal
  return '127.0.0.1';
}

// ============================================================================
// 2. Upstash Redis Client & Sliding Window Ratelimiter Setup
// ============================================================================

let upstashRatelimitInstance: Ratelimit | null = null;
let redisInitialized = false;

function getUpstashRatelimit(): Ratelimit | null {
  if (redisInitialized) return upstashRatelimitInstance;

  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (url && token && url.startsWith('http')) {
    try {
      const redis = new Redis({
        url,
        token,
      });

      upstashRatelimitInstance = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(RATE_LIMIT_MAX, `${RATE_LIMIT_WINDOW_SECONDS} s`),
        prefix: 'lapmatch:ratelimit:reviews',
        analytics: true,
      });
      redisInitialized = true;
      return upstashRatelimitInstance;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('[ReviewRateLimiter] Failed to initialize Upstash Redis client:', msg);
      redisInitialized = true;
      upstashRatelimitInstance = null;
      return null;
    }
  }

  redisInitialized = true;
  upstashRatelimitInstance = null;
  return null;
}

// ============================================================================
// 3. Strict Local Sliding-Window Fallback (When Redis is Offline/Unconfigured)
// ============================================================================
// Menyimpan riwayat timestamp permintaan per identifier.
// Menjamin aturan maksimal 5 ulasan per 10 menit TETAP KETAT berlaku, tidak fail-open!

interface FallbackRecord {
  timestamps: number[];
}

const fallbackStore = new Map<string, FallbackRecord>();

function checkStrictLocalFallback(identifier: string): RateLimitCheckResult {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;

  let record = fallbackStore.get(identifier);
  if (!record) {
    record = { timestamps: [] };
    fallbackStore.set(identifier, record);
  }

  // Singkirkan timestamp yang berada di luar jendela 10 menit (sliding window)
  record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

  if (record.timestamps.length >= RATE_LIMIT_MAX) {
    const oldestTimestamp = record.timestamps[0];
    const resetTime = oldestTimestamp + RATE_LIMIT_WINDOW_MS;
    const retryAfterSeconds = Math.max(1, Math.ceil((resetTime - now) / 1000));

    return {
      allowed: false,
      remaining: 0,
      resetTime,
      retryAfterSeconds,
      source: 'strict-fallback',
      identifier,
    };
  }

  // Tambahkan timestamp permintaan saat ini
  record.timestamps.push(now);
  const remaining = Math.max(0, RATE_LIMIT_MAX - record.timestamps.length);
  const resetTime = now + RATE_LIMIT_WINDOW_MS;

  return {
    allowed: true,
    remaining,
    resetTime,
    retryAfterSeconds: 0,
    source: 'strict-fallback',
    identifier,
  };
}

export function clearFallbackStoreForTesting(): void {
  fallbackStore.clear();
}

// ============================================================================
// 4. Main Exported Checker Function
// ============================================================================

export async function checkReviewRateLimit(
  request: NextRequest,
  userId?: string | null
): Promise<RateLimitCheckResult> {
  const clientIp = getClientIp(request);

  // Jika pengguna terautentikasi, gunakan key berbasis userId agar tidak terpengaruh NAT/IP publik bersama
  // Jika guest, gunakan key berbasis IP tepercaya yang telah disanitasi
  const identifier = userId ? `user:${userId}` : `ip:${clientIp}`;

  const ratelimit = getUpstashRatelimit();

  if (ratelimit) {
    try {
      const result = await ratelimit.limit(identifier);
      const now = Date.now();
      const retryAfterSeconds = result.success
        ? 0
        : Math.max(1, Math.ceil((result.reset - now) / 1000));

      return {
        allowed: result.success,
        remaining: result.remaining,
        resetTime: result.reset,
        retryAfterSeconds,
        source: 'upstash-redis',
        identifier,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(
        `[ReviewRateLimiter] Upstash Redis request failed (${msg}). Engaging strict local sliding-window fallback.`
      );
      // Fallback lokal ketat dipicu secara eksplisit, TIDAK mengizinkan semua request diam-diam!
      return checkStrictLocalFallback(identifier);
    }
  }

  // Jika Redis belum dikonfigurasikan di environment lokal, jalankan fallback lokal ketat
  return checkStrictLocalFallback(identifier);
}
