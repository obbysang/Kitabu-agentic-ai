import Cookies from 'js-cookie';
import { CookieCategory, ConsentPreferences, DEFAULT_CONSENT, COOKIE_CONSENT_KEY } from '../types/cookie-consent';

const CONSENT_VERSION = 1;
const IS_PROD = import.meta.env.PROD;

export const getConsent = (): ConsentPreferences | null => {
  const cookie = Cookies.get(COOKIE_CONSENT_KEY);
  if (!cookie) return null;
  try {
    return JSON.parse(cookie);
  } catch {
    return null;
  }
};

export const saveConsent = (preferences: Partial<ConsentPreferences>) => {
  const newConsent: ConsentPreferences = {
    ...DEFAULT_CONSENT,
    ...preferences,
    essential: true, // Always true
    version: CONSENT_VERSION,
    timestamp: new Date().toISOString(),
  };

  Cookies.set(COOKIE_CONSENT_KEY, JSON.stringify(newConsent), {
    expires: 365, // 1 year
    sameSite: 'Lax',
    secure: IS_PROD,
  });

  // Trigger an event so other parts of the app can react immediately if needed
  window.dispatchEvent(new CustomEvent('kitabu-consent-updated', { detail: newConsent }));

  return newConsent;
};

export const hasConsentedTo = (category: CookieCategory): boolean => {
  if (category === CookieCategory.ESSENTIAL) return true;
  const consent = getConsent();
  return !!consent?.[category];
};

export const resetConsent = () => {
  Cookies.remove(COOKIE_CONSENT_KEY);
  window.dispatchEvent(new CustomEvent('kitabu-consent-updated', { detail: null }));
};
