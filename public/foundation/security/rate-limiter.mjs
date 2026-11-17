/**
 * Master Foundation — Pluggable Server-Side Rate Limiter (Zero Dependencies)
 * Implements tier definitions matching config/security-policy.json.
 * Production note: MemoryRateLimitStore is bounded for single-process safety;
 * use a persistent store backed by Redis or DB `rate_limit_buckets` for
 * multi-worker or multi-instance production deployments.
 */

export const DEFAULT_RATE_LIMIT_TIERS = {
  login: { maxAttempts: 5, windowSeconds: 900, lockoutSeconds: 900 },
  passwordReset: { maxAttempts: 3, windowSeconds: 900, lockoutSeconds: 900 },
  accountPasswordVerify: { maxAttempts: 5, windowSeconds: 900, lockoutSeconds: 900 },
  publicForms: { maxAttempts: 5, windowSeconds: 300, lockoutSeconds: 300 },
  apiAuthenticated: { maxAttempts: 120, windowSeconds: 60, lockoutSeconds: 60 },
  apiPublic: { maxAttempts: 60, windowSeconds: 60, lockoutSeconds: 60 }
};

export class MemoryRateLimitStore {
  constructor({ maxEntries = 10000 } = {}) {
    this.buckets = new Map();
    this.maxEntries = maxEntries;
  }

  sweepExpired(now = Date.now()) {
    for (const [k, entry] of this.buckets.entries()) {
      const blockedExpired = !entry.blockedUntil || entry.blockedUntil <= now;
      if (entry.windowResetAt <= now && blockedExpired) {
        this.buckets.delete(k);
      }
    }
    while (this.buckets.size >= this.maxEntries) {
      const oldestKey = this.buckets.keys().next().value;
      if (oldestKey === undefined) break;
      this.buckets.delete(oldestKey);
    }
  }

  async consume(key, maxAttempts, windowSeconds, lockoutSeconds) {
    const now = Date.now();
    const existing = this.buckets.get(key);

    if (existing?.blockedUntil && existing.blockedUntil > now) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: Math.ceil((existing.blockedUntil - now) / 1000),
        resetAt: new Date(existing.blockedUntil).toISOString()
      };
    }

    if (!existing || existing.windowResetAt <= now) {
      if (this.buckets.size >= this.maxEntries) {
        this.sweepExpired(now);
      }
      const windowResetAt = now + windowSeconds * 1000;
      this.buckets.set(key, { count: 1, windowResetAt, blockedUntil: null });
      return {
        allowed: true,
        remaining: Math.max(0, maxAttempts - 1),
        retryAfterSeconds: 0,
        resetAt: new Date(windowResetAt).toISOString()
      };
    }

    existing.count += 1;

    if (existing.count > maxAttempts) {
      existing.blockedUntil = now + lockoutSeconds * 1000;
      this.buckets.set(key, existing);
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: lockoutSeconds,
        resetAt: new Date(existing.blockedUntil).toISOString()
      };
    }

    this.buckets.set(key, existing);
    return {
      allowed: true,
      remaining: Math.max(0, maxAttempts - existing.count),
      retryAfterSeconds: 0,
      resetAt: new Date(existing.windowResetAt).toISOString()
    };
  }
}

export function createRateLimiter({ store = new MemoryRateLimitStore(), tiers = DEFAULT_RATE_LIMIT_TIERS } = {}) {
  return {
    async check(tierName, identifier) {
      const tier = tiers[tierName];
      if (!tier) {
        throw new Error(`Unknown rate limit tier: ${tierName}`);
      }
      const key = `${tierName}:${String(identifier || 'anonymous')}`;
      return store.consume(key, tier.maxAttempts, tier.windowSeconds, tier.lockoutSeconds ?? tier.windowSeconds);
    }
  };
}
