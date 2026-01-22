import { Request, Response, NextFunction } from 'express';

type Key = string;

interface RateBucket {
  count: number;
  resetAt: number;
}

interface Options {
  windowMs: number;
  max: number;
  keyGenerator?: (req: Request) => Key;
}

const buckets = new Map<Key, RateBucket>();

export const createRateLimiter = (opts: Options) => {
  const keyFn = opts.keyGenerator || ((req: Request) => req.headers['x-forwarded-for']?.toString() || req.ip || 'unknown');
  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = keyFn(req);
    const bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + opts.windowMs });
      res.setHeader('X-RateLimit-Limit', opts.max.toString());
      res.setHeader('X-RateLimit-Remaining', (opts.max - 1).toString());
      res.setHeader('X-RateLimit-Reset', Math.ceil((now + opts.windowMs) / 1000).toString());
      return next();
    }
    if (bucket.count >= opts.max) {
      const retryAfter = Math.max(0, Math.ceil((bucket.resetAt - now) / 1000));
      res.setHeader('Retry-After', retryAfter.toString());
      res.setHeader('X-RateLimit-Limit', opts.max.toString());
      res.setHeader('X-RateLimit-Remaining', '0');
      res.setHeader('X-RateLimit-Reset', Math.ceil(bucket.resetAt / 1000).toString());
      return res.status(429).json({ code: 'rate_limit_exceeded', message: 'Too many requests', context: { retryAfter } });
    }
    bucket.count += 1;
    res.setHeader('X-RateLimit-Limit', opts.max.toString());
    res.setHeader('X-RateLimit-Remaining', Math.max(0, opts.max - bucket.count).toString());
    res.setHeader('X-RateLimit-Reset', Math.ceil(bucket.resetAt / 1000).toString());
    next();
  };
};
