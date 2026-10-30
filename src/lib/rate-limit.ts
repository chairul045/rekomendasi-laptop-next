// lib/rate-limit.ts - Rate Limiter Sederhana & Aman untuk Auth
// Membatasi percobaan login (misal: 5 kali per 15 menit per IP atau per email)

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// Memory store untuk melacak attempts
const rateLimitMap = new Map<string, RateLimitRecord>();

// Bersihkan data lama setiap 10 menit agar tidak memory leak
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitMap.entries()) {
      if (value.resetAt < now) {
        rateLimitMap.delete(key);
      }
    }
  }, 10 * 60 * 1000);
}

export interface RateLimitOptions {
  key: string;
  maxAttempts?: number;
  windowMs?: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetMinutes: number;
  totalAttempts: number;
}

export function checkRateLimit(options: RateLimitOptions): RateLimitResult {
  const { key, maxAttempts = 5, windowMs = 15 * 60 * 1000 } = options;
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || record.resetAt < now) {
    // Record baru atau jendela waktu telah berakhir
    return {
      success: true,
      remaining: maxAttempts,
      resetMinutes: Math.ceil(windowMs / (60 * 1000)),
      totalAttempts: 0,
    };
  }

  const remaining = Math.max(0, maxAttempts - record.count);
  const resetMinutes = Math.max(1, Math.ceil((record.resetAt - now) / (60 * 1000)));

  return {
    success: record.count < maxAttempts,
    remaining,
    resetMinutes,
    totalAttempts: record.count,
  };
}

export function recordFailedAttempt(options: RateLimitOptions): RateLimitResult {
  const { key, maxAttempts = 5, windowMs = 15 * 60 * 1000 } = options;
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || record.resetAt < now) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetAt: now + windowMs,
    };
    rateLimitMap.set(key, newRecord);
    return {
      success: true,
      remaining: maxAttempts - 1,
      resetMinutes: Math.ceil(windowMs / (60 * 1000)),
      totalAttempts: 1,
    };
  }

  record.count += 1;
  const remaining = Math.max(0, maxAttempts - record.count);
  const resetMinutes = Math.max(1, Math.ceil((record.resetAt - now) / (60 * 1000)));

  return {
    success: record.count <= maxAttempts,
    remaining,
    resetMinutes,
    totalAttempts: record.count,
  };
}

export function resetRateLimit(key: string): void {
  rateLimitMap.delete(key);
}
