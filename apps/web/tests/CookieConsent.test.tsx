import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CookieConsent from '../components/CookieConsent';
import * as cookieLogic from '../lib/cookie-consent';
import { DEFAULT_CONSENT, CookieCategory } from '../types/cookie-consent';

// Mock the hook to isolate component testing
vi.mock('../hooks/useCookieConsent', () => {
  const actual = vi.importActual('../hooks/useCookieConsent');
  return {
    ...actual,
    useCookieConsent: vi.fn(),
  };
});

import { useCookieConsent } from '../hooks/useCookieConsent';

describe('CookieConsent Component', () => {
  const mockSavePreferences = vi.fn();
  const mockAcceptAll = vi.fn();
  const mockAcceptEssentialsOnly = vi.fn();
  const mockOpenConsentManager = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useCookieConsent as any).mockReturnValue({
      isOpen: true,
      consent: null,
      acceptAll: mockAcceptAll,
      acceptEssentialsOnly: mockAcceptEssentialsOnly,
      savePreferences: mockSavePreferences,
      openConsentManager: mockOpenConsentManager,
      hasConsentedTo: () => false,
    });
  });

  it('renders the banner when open', () => {
    render(<CookieConsent />);
    expect(screen.getByText(/We value your privacy/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Accept All/i })).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    (useCookieConsent as any).mockReturnValue({
      isOpen: false,
      consent: DEFAULT_CONSENT,
    });
    const { container } = render(<CookieConsent />);
    expect(container).toBeEmptyDOMElement();
  });

  it('calls acceptAll when Accept All is clicked', () => {
    render(<CookieConsent />);
    fireEvent.click(screen.getByRole('button', { name: /Accept All/i }));
    expect(mockAcceptAll).toHaveBeenCalled();
  });

  it('calls acceptEssentialsOnly when Reject Non-Essential is clicked', () => {
    render(<CookieConsent />);
    fireEvent.click(screen.getByText('Reject Non-Essential'));
    expect(mockAcceptEssentialsOnly).toHaveBeenCalled();
  });

  it('opens details when Customize is clicked', () => {
    render(<CookieConsent />);
    fireEvent.click(screen.getByText('Customize'));
    expect(screen.getByText('Cookie Preferences')).toBeInTheDocument();
    expect(screen.getByText('Essential Cookies')).toBeInTheDocument();
  });
});

describe('Cookie Logic', () => {
  beforeEach(() => {
    cookieLogic.resetConsent();
  });

  it('returns null consent initially', () => {
    expect(cookieLogic.getConsent()).toBeNull();
  });

  it('saves consent correctly', () => {
    const prefs = { functional: true, analytics: false };
    cookieLogic.saveConsent(prefs);
    
    const saved = cookieLogic.getConsent();
    expect(saved).not.toBeNull();
    expect(saved?.functional).toBe(true);
    expect(saved?.analytics).toBe(false);
    expect(saved?.essential).toBe(true); // Always true
  });

  it('verifies consent categories', () => {
    cookieLogic.saveConsent({ analytics: true });
    expect(cookieLogic.hasConsentedTo(CookieCategory.ANALYTICS)).toBe(true);
    expect(cookieLogic.hasConsentedTo(CookieCategory.MARKETING)).toBe(false);
    expect(cookieLogic.hasConsentedTo(CookieCategory.ESSENTIAL)).toBe(true);
  });
});
