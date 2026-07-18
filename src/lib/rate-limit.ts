// Per-user sliding-window rate limiter. In-memory, so it resets on cold start
// and is scoped to one server instance — a backstop against runaway spend, not
// a distributed limiter.
const buckets = new Map<string, Map<string, number[]>>()

export function isRateLimited(
  bucket: string,
  key: string,
  maxRequests: number,
  windowMs: number
): boolean {
  const log = buckets.get(bucket) ?? new Map<string, number[]>()
  buckets.set(bucket, log)

  const now = Date.now()
  const recent = (log.get(key) ?? []).filter((t) => now - t < windowMs)
  if (recent.length >= maxRequests) {
    log.set(key, recent)
    return true
  }
  recent.push(now)
  log.set(key, recent)
  return false
}
