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
  essential: true,
  functional: false,
  analytics: false,
  marketing: false,
  version: 1,
  timestamp: '', // Empty initially
};

export const COOKIE_CONSENT_KEY = 'kitabu_consent';
