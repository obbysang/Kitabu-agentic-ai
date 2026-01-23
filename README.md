# Kitabu: Autonomous AI CFO on Cronos

Kitabu is an AI-native, autonomous treasury management platform built for the Cronos ecosystem. It enables DAOs, startups, and Web3 organizations to manage payroll, vendor payments, yield optimization, and compliance workflows using natural language, executed safely and autonomously via **x402 agentic payment rails**.

<div align="center">
  <img src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" alt="Kitabu Dashboard" width="100%" />
</div>

## 🚀 Mission

Kitabu is designed as **infrastructure, not a chatbot**. It acts as a responsible financial agent that:
- Interprets financial intent accurately using LLMs.
- Protects treasury funds through rigorous validation and permissions.
- Executes payments and yield actions deterministically via **x402**.
- Integrates deeply with Cronos-native protocols like **VVS Finance**.

## ✨ Key Features

- **🤖 AI CFO Agent**: Interact with your treasury using natural language. Ask Kitabu to "pay invoices," "optimize yield," or "check runway."
- **⚡ x402 Payment Rails**: Secure, intent-based execution for all financial transactions. No direct wallet signing for routine operations.
- **📄 RWA & Invoice Processing**: Drag-and-drop PDF invoice ingestion with AI-powered data extraction and validation.
- **📈 DeFi Yield Optimization**: Automated, safe yield strategies integrated with VVS Finance.
- **📊 Real-Time Intelligence**: Market data and treasury insights powered by Crypto.com Market Data MCP.
- **🛡️ Enterprise-Grade Security**: Role-based access control, spending limits, and transparent audit logs.

## 🏗️ Architecture

Kitabu operates as a monorepo with a clear separation of concerns:

- **`apps/web`**: A modern, responsive dashboard built with **React**, **Vite**, and **Tailwind CSS**. It handles user interaction, visualization, and wallet connection (Wagmi/ConnectKit).
- **`apps/api`**: The brain of the operation. A **Node.js/Express** backend that hosts the AI agent logic, orchestrates x402 payments, and manages off-chain data.
- **`contracts`**: Solidity smart contracts (e.g., `TreasuryVault`) deployed on Cronos EVM for secure custody and on-chain permissions.
- **`packages`**: Shared libraries including clients for the AI Agent and x402 Facilitator.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, TanStack Query, GSAP, Recharts, Lucide React.
- **Backend**: Node.js, Express, TypeScript, viem, Google Gemini AI.
- **Integrations**: 
  - **Crypto.com AI Agent SDK**
  - **x402 Facilitator SDK**
  - **Crypto.com Market Data MCP**
- **Blockchain**: Cronos EVM, Solidity ^0.8.20.

## 🏁 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **Git**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/kitabu.git
   cd kitabu
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   - Configure the API environment variables:
     ```bash
     cp apps/api/.env.example apps/api/.env
     ```
   - Configure the Web environment variables:
     ```bash
     cp apps/web/.env.example apps/web/.env.local
     ```
   - *Update the `.env` files with your specific keys (Gemini API Key, RPC URLs, etc.).*

### Running Locally

To start the development environment for both the frontend and backend:

1. **Start the Backend API:**
   ```bash
   npm run dev:api
   ```

2. **Start the Web Dashboard:**
   ```bash
   npm run dev:web
   ```

The web application will be available at `http://localhost:5173` (or the port specified in your console).

## 📂 Project Structure

```
kitabu-monorepo/
├── apps/
│   ├── api/          # Backend API & AI Agent Logic
│   └── web/          # Frontend Dashboard (Vite + React)
├── packages/
│   ├── ai-agent-client/      # Client for AI Agent interaction
│   └── facilitator-client-ts/ # x402 Facilitator Client
├── contracts/        # Solidity Smart Contracts
└── scripts/          # Utility scripts
```

## 🤝 Contributing

Kitabu is an open-source project participating in the **Cronos AI Hackathon**. Contributions are welcome! Please ensure you adhere to the project's coding standards and safety guidelines.

## 📄 License

This project is licensed under the MIT License.
