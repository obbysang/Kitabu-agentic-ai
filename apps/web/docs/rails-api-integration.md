# Rails Page API Integration

- Base URL: VITE_API_URL (default http://localhost:3000)
- Session: POST /x402/sessions with { orgId, userId, permissions[] } → returns X402Session
- Batch Execute: POST /x402/intents with { sessionId, type: "payment", payload: { kind: "batch_payment", recipients[] } } → returns X402Intent
- Error Handling: network and API errors surfaced to UI as inline messages
- Loading States: button disabled and status text shown during session sign and batch execution
- Data Flow:
  - User adds recipients and amounts
  - Create session to authorize execution
  - Execute batch intent with recipients payload
  - Display intent id on success
- Types: all requests and responses use TypeScript interfaces from apps/web/lib/api.ts and apps/web/types/api.ts
