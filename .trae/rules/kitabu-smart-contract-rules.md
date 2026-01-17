# Kitabu Backend API Rules

## API Design
- All API routes must return JSON
- Always return explicit status fields
- Never return raw errors to clients

## AI Agent APIs
- Input must be validated before AI processing
- AI output must be validated before execution
- Financial actions require:
  - balance check
  - market data check
  - permission check

## Logging
- Log:
  - user intent
  - parsed intent
  - execution result
- Never log secrets or private keys

## Error Responses
- Use consistent error schema:
  - code
  - message
  - context
