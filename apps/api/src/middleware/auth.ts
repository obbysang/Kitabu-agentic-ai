import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth/AuthService.js';
import { UserRole } from '../types/auth.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: UserRole;
        orgId: string;
      };
    }
  }
}

export const createAuthMiddleware = (authService: AuthService) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing token' });
    }

    const token = authHeader.split(' ')[1];
    const payload = await authService.validateToken(token);

    if (!payload) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    req.user = payload;
    next();
  };
};

export const requireRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};
