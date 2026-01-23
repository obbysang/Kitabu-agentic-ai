# Cookie Compliance & Consent System

This project implements a GDPR/CCPA-compliant cookie consent system.

## Overview

The system consists of:
1.  **Frontend**: React component (`CookieConsent`) and hooks (`useCookieConsent`) to manage user preferences.
2.  **Backend**: Express middleware (`cookieConsentMiddleware`) to enforce consent on the server side.
3.  **Storage**: A secure, persistent cookie `kitabu_consent` stores the user's choices.

## Categories

We categorize cookies into four types:

1.  **Essential** (`essential`):
    *   Required for the site to function (e.g., Auth tokens, CSRF tokens, the consent cookie itself).
    *   **User Action**: Cannot be disabled.
    *   **Default**: Enabled.

2.  **Functional** (`functional`):
    *   Enhanced features (e.g., remembering language, theme).
    *   **User Action**: Opt-in.
    *   **Default**: Disabled.

3.  **Analytics** (`analytics`):
    *   Tracking usage data (e.g., Google Analytics, Mixpanel).
    *   **User Action**: Opt-in.
    *   **Default**: Disabled.

4.  **Marketing** (`marketing`):
    *   Ad targeting and cross-site tracking.
    *   **User Action**: Opt-in.
    *   **Default**: Disabled.

## Usage

### Frontend

Check consent before firing a pixel or saving a preference:

```typescript
import { hasConsentedTo, CookieCategory } from '../lib/cookie-consent';

if (hasConsentedTo(CookieCategory.ANALYTICS)) {
  // Initialize Analytics
}
```

Or using the hook:

```typescript
const { hasConsentedTo } = useCookieConsent();
```

### Backend

The middleware automatically parses the `kitabu_consent` cookie and attaches it to `req.consent`.

```typescript
import { CookieCategory, isConsentGiven } from '../middleware/cookieConsent';

app.get('/some-tracking-endpoint', (req, res) => {
  if (!isConsentGiven(req, CookieCategory.MARKETING)) {
    return res.status(403).json({ error: 'Consent required' });
  }
  // ...
});
```

### Adding New Cookies

When adding a new cookie, always use the `setSecureCookie` utility (in API) or `Cookies.set` (in Web) and ensure you check the relevant consent category first.

## Compliance Checklist

- [x] **Explicit Consent**: Users must click "Accept" or toggle categories.
- [x] **Opt-In by Default**: Non-essential cookies are disabled until action is taken.
- [x] **Granular Control**: Users can enable/disable specific categories.
- [x] **Withdrawal**: Users can change preferences at any time (via the "Customize" button or footer link).
- [x] **Audit Trail**: The consent cookie includes a timestamp and version.
