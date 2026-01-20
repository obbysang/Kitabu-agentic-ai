import { Request, Response, NextFunction } from 'express';

type RouteKey = string;

interface RouteStats {
  count: number;
  errors: number;
  totalDurationMs: number;
}

class Metrics {
  private routes = new Map<RouteKey, RouteStats>();
  private startTimes = new WeakMap<Response, number>();

  middleware = (req: Request, res: Response, next: NextFunction) => {
    const key = `${req.method} ${req.path}`;
    this.startTimes.set(res, Date.now());
    res.once('finish', () => {
      const dur = Date.now() - (this.startTimes.get(res) || Date.now());
      const stats = this.routes.get(key) || { count: 0, errors: 0, totalDurationMs: 0 };
      stats.count += 1;
      stats.totalDurationMs += dur;
      if (res.statusCode >= 400) stats.errors += 1;
      this.routes.set(key, stats);
    });
    next();
  };

  getJSON() {
    const data: Record<string, { count: number; errors: number; avgMs: number }> = {};
    for (const [key, v] of this.routes.entries()) {
      data[key] = { count: v.count, errors: v.errors, avgMs: v.count ? Math.round(v.totalDurationMs / v.count) : 0 };
    }
    return { routes: data, timestamp: new Date().toISOString() };
  }
}

export const metrics = new Metrics();
