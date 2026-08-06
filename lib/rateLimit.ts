type Bucket = { count: number; resetAt: number };

// A safe local fallback for development. Production must provide a shared
// limiter at the edge/KV layer so limits also hold across server instances.
const buckets = new Map<string, Bucket>();

export function allowRequest(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}
