
15. Frontend-Backend Integration Details
15.1 API Connection
- **Protocol**: HTTPS (Secure)
- **Authentication**: JWT-based session management (future scope), currently using session IDs.
- **State Management**: React Query (TanStack Query) for server state synchronization.

15.2 Real-Time Data Channels
- **Treasury Overview**: Polled every 10 seconds.
- **Activity Feed**: Polled every 5 seconds.
- **Chat Interface**: Request/Response model with immediate optimistic UI updates.

15.3 Error Handling Policy
- **Network Failures**: Automatic retry logic (3 retries with exponential backoff).
- **Validation Errors**: Displayed inline within the chat interface as "System Error" alerts.
- **Safety Violations**: Explicitly handled and displayed as warning cards to the CFO.

15.4 Performance Optimizations
- **Deduplication**: Simultaneous requests for the same resource are batched.
- **Caching**: Data is cached for 5-10 seconds to prevent over-fetching on re-renders.
- **Bundle Size**: API client is lightweight and inlined to avoid heavy dependencies where possible.

15.5 Intelligence Page API Endpoints
- GET /market/price/:symbol
- GET /market/gas
- GET /market/yields
- GET /treasury/overview
- GET /orgs/me
- GET /orgs/:id/config
