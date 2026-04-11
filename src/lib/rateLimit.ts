/**
 * Sliding-window in-memory rate limiter.
 * Keyed by IP address. Each bucket stores an array of request timestamps.
 */

interface Bucket {
  timestamps: number[];
}

const buckets: Record<string, Bucket> = {};

const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? "60000", 10);
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX ?? "20", 10);

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  if (!buckets[ip]) buckets[ip] = { timestamps: [] };

  // Evict timestamps outside the current window
  buckets[ip].timestamps = buckets[ip].timestamps.filter((t) => t > windowStart);

  if (buckets[ip].timestamps.length >= MAX_REQUESTS) {
    const resetAt = buckets[ip].timestamps[0] + WINDOW_MS;
    return { allowed: false, remaining: 0, resetAt };
  }

  buckets[ip].timestamps.push(now);
  const remaining = MAX_REQUESTS - buckets[ip].timestamps.length;
  const resetAt =
    buckets[ip].timestamps.length > 0
      ? buckets[ip].timestamps[0] + WINDOW_MS
      : now + WINDOW_MS;

  return { allowed: true, remaining, resetAt };
}

export function purgeRateLimitBuckets(): void {
  const windowStart = Date.now() - WINDOW_MS;
  for (const ip of Object.keys(buckets)) {
    if (buckets[ip].timestamps.every((t) => t <= windowStart)) {
      delete buckets[ip];
    }
  }
}