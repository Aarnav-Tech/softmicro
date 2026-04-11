/**
 * Simple in-memory cache with TTL.
 * Suitable for serverless (resets per cold start) and long-running Node servers.
 * For production at scale, replace with Redis via ioredis or @upstash/redis.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class InMemoryCache {
  private store: Record<string, CacheEntry<unknown>> = {};
  private readonly defaultTtlMs: number;

  constructor(defaultTtlSeconds = 600) {
    this.defaultTtlMs = defaultTtlSeconds * 1_000;
  }

  get<T>(key: string): T | null {
    const entry = this.store[key];
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      delete this.store[key];
      return null;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlSeconds?: number): void {
    const ttlMs = ttlSeconds ? ttlSeconds * 1_000 : this.defaultTtlMs;
    this.store[key] = { value, expiresAt: Date.now() + ttlMs };
  }

  delete(key: string): void {
    delete this.store[key];
  }

  purgeExpired(): void {
    const now = Date.now();
    for (const key of Object.keys(this.store)) {
      if (now > this.store[key].expiresAt) delete this.store[key];
    }
  }
}

const TTL = parseInt(process.env.CACHE_TTL_SECONDS ?? "600", 10);
export const cache = new InMemoryCache(TTL);