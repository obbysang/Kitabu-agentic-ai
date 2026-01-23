import { useState, useEffect } from 'react';
import { getConsent, saveConsent, hasConsentedTo, resetConsent } from '../lib/cookie-consent';
import { ConsentPreferences, CookieCategory } from '../types/cookie-consent';

export const useCookieConsent = () => {
  const [consent, setConsent] = useState<ConsentPreferences | null>(getConsent());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // If no consent is found, open the banner
    if (!consent) {
      setIsOpen(true);
    }

    const handleUpdate = (event: CustomEvent<ConsentPreferences>) => {
      setConsent(event.detail);
    };

    window.addEventListener('kitabu-consent-updated', handleUpdate as EventListener);
    return () => {
      window.removeEventListener('kitabu-consent-updated', handleUpdate as EventListener);
    };
  }, [consent]);

  const acceptAll = () => {
    const preferences = {
      functional: true,
      analytics: true,
      marketing: true,
    };
    const newConsent = saveConsent(preferences);
    setConsent(newConsent);
    setIsOpen(false);
  };

  const acceptEssentialsOnly = () => {
    const preferences = {
      functional: false,
      analytics: false,
      marketing: false,
    };
    const newConsent = saveConsent(preferences);
    setConsent(newConsent);
    setIsOpen(false);
  };

  const savePreferences = (preferences: Partial<ConsentPreferences>) => {
    const newConsent = saveConsent(preferences);
    setConsent(newConsent);
    setIsOpen(false);
  };

  const openConsentManager = () => setIsOpen(true);

  return {
    consent,
    isOpen,
    hasConsentedTo,
    acceptAll,
    acceptEssentialsOnly,
    savePreferences,
    openConsentManager,
    resetConsent,
  };
};
