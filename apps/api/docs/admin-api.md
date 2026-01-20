---
name: "Admin Policy API"
description: "Org policy management. Invoke when updating admin settings from Dashboard Admin Panel."
---

# Admin Policy API

## Base URL
http://localhost:3000

## Authentication
- Bearer JWT from POST /auth/login

## Endpoints

### GET /orgs/me
- Returns current user organization
- 200 response example:
```json
{
  "id": "org-uuid",
  "name": "Kitabu Demo Corp",
  "vaultAddress": "0x0000000000000000000000000000000000000000",
  "config": {
    "maxDailySpend": "1000000000000000000",
    "allowedTokens": ["0x55d398326f99059ff775485246999027b3197955"],
    "whitelistedRecipients": [],
    "yieldRiskTolerance": "low",
    "targetUtilization": 20,
    "requireApprovalAbove": "500000000000000000"
  }
}
```

### GET /orgs/:id/config
- Returns organization config
- Errors:
  - 403 Forbidden when accessing other org

### PATCH /orgs/:id/config
- Updates organization config
- Request validation:
  - maxDailySpend: numeric string
  - requireApprovalAbove: numeric string
  - allowedTokens: array of addresses
  - whitelistedRecipients: array of addresses
  - yieldRiskTolerance: low|medium|high
  - targetUtilization: 0..100
- Rate limits:
  - 20 requests/min per client
- Errors:
  - 400 validation_error
  - 403 forbidden
  - 429 rate_limit_exceeded

### GET /orgs/:id/policy
- Returns safety policy snapshot used by agent
- 200 response example:
```json
{
  "maxDailySpend": "1000000000000000000",
  "requireApprovalAbove": "500000000000000000",
  "allowedTokens": ["0x55d398326f99059ff775485246999027b3197955"],
  "whitelistedRecipients": []
}
```

### GET /metrics
- Returns usage and performance metrics
- 200 response example:
```json
{
  "routes": {
    "GET /orgs/me": { "count": 12, "errors": 0, "avgMs": 14 },
    "PATCH /orgs/:id/config": { "count": 20, "errors": 2, "avgMs": 22 }
  },
  "timestamp": "2026-01-20T00:00:00.000Z"
}
```

## Error Schema
```json
{ "code": "string", "message": "string", "context": {} }
```

## Rate Limit Headers
- X-RateLimit-Limit
- X-RateLimit-Remaining
- X-RateLimit-Reset
- Retry-After (when 429)
