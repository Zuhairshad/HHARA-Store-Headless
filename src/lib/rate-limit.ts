// Simple in-memory sliding-window rate limiter.
// Fine for a single serverless region; if the app is later fanned out across
// many warm instances, swap for Upstash Redis (interface stays the same).

type Bucket = { hits: number[]; };

const buckets = new Map<string, Bucket>();
const MAX_KEYS = 5000;

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
};

export function rateLimit(
  key: string,
  opts: { limit: number; windowSec: number }
): RateLimitResult {
  const now = Date.now();
  const windowMs = opts.windowSec * 1000;
  const cutoff = now - windowMs;

  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { hits: [] };
    if (buckets.size >= MAX_KEYS) evictOldest();
    buckets.set(key, bucket);
  }

  bucket.hits = bucket.hits.filter((t) => t > cutoff);

  if (bucket.hits.length >= opts.limit) {
    const oldest = bucket.hits[0];
    const retryAfterMs = oldest + windowMs - now;
    return {
      ok: false,
      remaining: 0,
      retryAfterSec: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    };
  }

  bucket.hits.push(now);
  return {
    ok: true,
    remaining: opts.limit - bucket.hits.length,
    retryAfterSec: 0,
  };
}

function evictOldest() {
  const firstKey = buckets.keys().next().value;
  if (firstKey !== undefined) buckets.delete(firstKey);
}
