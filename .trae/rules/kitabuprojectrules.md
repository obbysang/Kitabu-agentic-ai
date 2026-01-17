# Kitabu Project Rules

## Project Context
Kitabu is an AI-native, agentic treasury management platform built for the Cronos ecosystem.
It uses x402 agentic payment rails, the Crypto.com AI Agent SDK, and Cronos DeFi protocols
(VVS Finance) to autonomously manage payments, yield, and compliance workflows.

The AI must behave as a production-grade financial infrastructure agent, not a chatbot toy.

---

## Core Principles
- Prioritize correctness, safety, and determinism over creativity
- Treat all financial actions as high-risk operations
- Assume this code will be audited and reviewed by Cronos core engineers
- Always align outputs with Cronos, x402, and Crypto.com ecosystem requirements

---

## Language & Framework Rules
- Frontend: TypeScript + Next.js 14 (App Router)
- Backend: Node.js + TypeScript
- Smart Contracts: Solidity ^0.8.20
- Blockchain interaction: viem preferred, ethers v6 acceptable
- UI: Tailwind CSS + shadcn/ui
- Charts: Lightweight libraries only (no heavy chart frameworks)

---

## Architecture Rules
- Follow a clear separation of concerns:
  - Smart contracts = custody & permissions only
  - Backend = AI logic, x402 execution, orchestration
  - Frontend = visualization and user interaction
- Never embed private keys or secrets in frontend code
- All agentic execution must route through x402 abstractions
- No direct user wallet signing for payments in MVP flows

---

## AI Agent Behavior Rules
- The AI must always:
  - Parse user intent into structured JSON
  - Perform balance checks before execution
  - Perform market data checks via MCP (or mock equivalent)
  - Return explicit success/failure states
- The AI must never hallucinate transaction execution
- If an action cannot be executed safely, return a refusal with reason

---

## x402 Usage Rules
- Payments must use x402 intent-based execution
- No direct `sendTransaction` for treasury payments
- Use scoped permissions (spend limits, whitelists) where applicable
- Always log x402 execution state (pending, settled, failed)

---

## Smart Contract Rules
- Contracts must be minimal and auditable
- No complex AI logic on-chain
- All privileged actions gated by:
  - owner
  - authorizedAgents mapping
- Events must be emitted for all state-changing operations

---

## Naming Conventions
- TypeScript:
  - camelCase for variables and functions
  - PascalCase for components and classes
- Solidity:
  - PascalCase for contracts
  - camelCase for functions and variables
- Files:
  - kebab-case for folders
  - PascalCase for React components

---

## Code Style Rules
- Use early returns
- Avoid deep nesting
- Prefer explicit types over `any`
- One responsibility per function
- No unused variables or imports

---

## Error Handling
- Never swallow errors silently
- Always return structured error objects in APIs
- Log errors with enough context for debugging
- Fail safely when financial execution is uncertain

---

## Security Rules
- Assume hostile input at all times
- Validate addresses, amounts, and token symbols
- Never trust AI output without validation
- Treat PDF and RWA inputs as untrusted data

---

## Documentation Rules
- Public functions must be documented
- Complex flows must include inline comments explaining WHY
- Update documentation when logic changes

---

## Demo & Hackathon Rules
- Optimize for clarity over completeness
- Mock integrations are acceptable but must be clearly labeled
- The demo must visibly showcase:
  - Natural language → intent → x402 execution
  - Cronos ecosystem integration
