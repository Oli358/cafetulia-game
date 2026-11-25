import type { NextFunction, Request, Response } from 'express';

type Bucket = {
  count: number;
  resetAt: number;
};

export type RateLimitOptions = {
  windowMs: number;
  max: number;
  keyPrefix: string;
  message?: string;
};

const MAX_TRACKED_BUCKETS = 10_000;

/**
 * Small in-memory fixed-window limiter. It is intentionally dependency-free;
 * one process holds the buckets (the current deployment is a single Render node).
 */
export function createRateLimiter({
  windowMs,
  max,
  keyPrefix,
  message = 'Demasiadas peticiones. Espera un momento y vuelve a intentarlo.',
}: RateLimitOptions): (req: Request, res: Response, next: NextFunction) => void {
  const buckets = new Map<string, Bucket>();

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `${keyPrefix}:${ip}`;

    if (buckets.size > MAX_TRACKED_BUCKETS) {
      for (const [bucketKey, bucket] of buckets) {
        if (bucket.resetAt <= now) buckets.delete(bucketKey);
      }
      if (buckets.size > MAX_TRACKED_BUCKETS) {
        buckets.clear();
      }
    }

    let bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
    }

    bucket.count += 1;
    const remaining = Math.max(0, max - bucket.count);
    res.setHeader('RateLimit-Limit', String(max));
    res.setHeader('RateLimit-Remaining', String(remaining));
    res.setHeader('RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));

    if (bucket.count > max) {
      res.setHeader('Retry-After', String(Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))));
      res.status(429).json({ error: 'RATE_LIMITED', message });
      return;
    }

    next();
  };
}
