I will implement a production-grade cookie consent solution that includes a secure backend middleware and a user-friendly frontend interface.

### **1. Backend Implementation (`apps/api`)**
*   **Dependencies**: Install `cookie-parser` and `@types/cookie-parser` for secure cookie handling.
*   **Middleware**: Create `src/middleware/cookieConsent.ts` to:
    *   Parse the `kitabu_consent` cookie.
    *   Attach consent preferences to the request object (`req.consent`).
    *   Block setting of non-essential cookies if consent is missing.
*   **Utilities**: Add a helper function `setConsentAwareCookie` to strictly enforce consent rules when setting new cookies.
*   **Integration**: Register the middleware in `src/index.ts`.

### **2. Frontend Implementation (`apps/web`)**
*   **Dependencies**: Install `js-cookie` and `@types/js-cookie` for reliable client-side cookie management.
*   **Types**: Define `CookieCategory` (Essential, Functional, Analytics, Marketing) and `ConsentPreferences` in `types/cookie-consent.ts`.
*   **Logic**: Create `lib/cookie-consent.ts` to:
    *   Check for existing consent.
    *   Save preferences to a secure, long-lived cookie (`kitabu_consent`).
    *   Provide an API for other components to check permission before firing events (e.g., `canTrack('analytics')`).
*   **UI Components**: Create `components/CookieConsent.tsx`:
    *   **Banner**: A non-intrusive bottom banner with "Accept All", "Reject Non-Essential", and "Customize".
    *   **Modal**: A detailed preferences center to toggle individual categories.
    *   **Styling**: Use Tailwind CSS for a responsive, dark/light mode compatible design.
*   **Integration**: Mount the `CookieConsent` component in `App.tsx` so it appears globally.

### **3. Testing & Documentation**
*   **Unit Tests**: Create `tests/CookieConsent.test.tsx` to verify:
    *   Consent is not assumed by default.
    *   "Accept All" enables all categories.
    *   "Reject" disables non-essentials.
    *   Preferences are persisted correctly.
*   **Documentation**: Add `docs/cookie-compliance.md` detailing the categorization and usage guide.

### **4. Security & Compliance**
*   **HTTP-Only**: The backend will treat sensitive cookies (like auth tokens) as `HttpOnly`.
*   **Secure Flags**: All cookies will default to `SameSite=Lax` and `Secure` (in production).
*   **GDPR/CCPA**: The system defaults to "opt-in" for non-essential cookies.
