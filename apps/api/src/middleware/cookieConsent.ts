import { Request, Response, NextFunction } from 'express';

export enum CookieCategory {
  ESSENTIAL = 'essential',
  FUNCTIONAL = 'functional',
  ANALYTICS = 'analytics',
  MARKETING = 'marketing',
}

export interface ConsentPreferences {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  version: number;
  timestamp: string;
}

export const DEFAULT_CONSENT: ConsentPreferences = {
  essential: true, // Always required
  functional: false,
  analytics: false,
  marketing: false,
  version: 1,
  timestamp: new Date().toISOString(),
};

// Extend Express Request interface to include consent
declare global {
  namespace Express {
    interface Request {
      consent: ConsentPreferences;
    }
  }
}

export const cookieConsentMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const consentCookie = req.cookies['kitabu_consent'];
    
    if (consentCookie) {
      try {
        // Handle if it's already an object (cookie-parser json) or string
        const parsed = typeof consentCookie === 'string' ? JSON.parse(consentCookie) : consentCookie;
        req.consent = { ...DEFAULT_CONSENT, ...parsed, essential: true };
      } catch (e) {
        req.consent = DEFAULT_CONSENT;
      }
    } else {
      req.consent = DEFAULT_CONSENT;
    }
    
    next();
  } catch (error) {
    console.error('Error in cookie consent middleware:', error);
    req.consent = DEFAULT_CONSENT;
    next();
  }
};

/**
 * Helper to check if a specific category is allowed
 */
export const isConsentGiven = (req: Request, category: CookieCategory): boolean => {
  if (category === CookieCategory.ESSENTIAL) return true;
  return !!req.consent?.[category];
};
