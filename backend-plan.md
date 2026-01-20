
12. Frontend Data Contracts & Integration
- API Client
  - Implemented using Fetch API with React Query for state management.
  - Base URL: Configurable via `VITE_API_URL` (default: http://localhost:3001).
  - Error Handling: Centralized `ApiError` class with status code support.

- Data Schemas (TypeScript Interfaces)
  - `TreasuryOverview`:
    - `totalUsdValue`: number
    - `balances`: Array<{ tokenSymbol, amount, usdValue, ... }>
    - `pendingPaymentsCount`: number
  - `ActivityItem`:
    - `id`: string
    - `type`: 'payment' | 'yield' | 'invoice' | 'system'
    - `status`: 'pending' | 'completed' | 'failed'
    - `description`: string
    - `timestamp`: number
  - `ChatResponse`:
    - `message`: string
    - `intent`: Structured JSON (x402 compatible)
    - `safetyCheck`: { safe: boolean, reason?: string }

- Integration Strategy
  - **Polling**: Real-time updates for Treasury Overview (10s) and Activity Feed (5s).
  - **Optimistic Updates**: Immediate UI feedback for chat interactions.
  - **Error Boundaries**: Graceful degradation with retry mechanisms.

12.1 API Endpoints Used by Intelligence
- GET /market/price/:symbol
- GET /market/gas
- GET /market/yields
- GET /treasury/overview
- GET /orgs/me
- GET /orgs/:id/config
