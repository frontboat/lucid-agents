<div align="center">
  <h1>Lucid Agents</h1>
  <p><strong>The Multi-Runtime Framework for Building and Monetizing AI Agents</strong></p>
  <p>Build, deploy, and monetize autonomous AI agents with typed entrypoints, on-chain identity, and built-in payment infrastructure.</p>
</div>

<div align="center">
  <a href="https://github.com/daydreamsai/lucid-agents/blob/master/LICENSE"><img src="https://img.shields.io/github/license/daydreamsai/lucid-agents?style=for-the-badge" alt="License"></a>
  <a href="https://www.npmjs.com/package/@lucid-agents/cli"><img src="https://img.shields.io/npm/v/@lucid-agents/cli?style=for-the-badge" alt="NPM Version"></a>
  <a href="https://github.com/daydreamsai/lucid-agents/actions"><img src="https://img.shields.io/github/actions/workflow/status/daydreamsai/lucid-agents/ci.yml?branch=master&style=for-the-badge" alt="CI Status"></a>
  <a href="https://bun.sh"><img src="https://img.shields.io/badge/runtime-bun-black?style=for-the-badge&logo=bun" alt="Bun"></a>
</div>

---

## What is Lucid Agents?

Lucid Agents is a TypeScript-first framework for building and monetizing AI agents—an agentic commerce and payments SDK. Build AI agents that sell services, facilitate monetary transactions, and participate in agent-to-agent marketplaces.

## Key Features

- **Multi-Adapter Architecture**: Write your agent logic once, deploy on Hono, Express, Next.js (adapter base), or TanStack Start
- **x402 Payment Protocol**: Accept payments in USDC with automatic paywall middleware; supported networks include Base mainnet/Sepolia, Polygon/Amoy, Avalanche/Ava Fuji, IoTeX, Abstract + testnet, Sei + testnet, Peaq, Story, EduChain, SKALE Base Sepolia, and Solana mainnet/devnet
- **A2A Protocol Support**: Agent-to-agent communication with task-based operations, enabling agents to buy and sell services from each other
- **ERC-8004 Identity Layer**: Register agent identities on-chain, build reputation, and prove ownership for trust in agent marketplaces
- **Type-Safe Entrypoints**: Define inputs/outputs with Zod schemas, get automatic validation and JSON schemas
- **Streaming Support**: Server-Sent Events (SSE) for real-time agent responses
- **Task Management**: Long-running tasks with status tracking, cancellation, and SSE subscriptions
- **AgentCard Manifests**: Auto-generated A2A-compatible manifests with Open Graph tags for discoverability
- **Template System**: Scaffold new agents with `blank`, `axllm`, `axllm-flow`, `identity`, `trading-data-agent`, or `trading-recommendation-agent` templates
- **Production-Ready**: Built with TypeScript strict mode, ESM modules, and comprehensive testing

Whether you're building paid AI services, agent marketplaces, or multi-agent systems where agents transact with each other, Lucid Agents provides the payments and commerce infrastructure you need.

---

## Quick Start (5 Minutes)

Get your first monetized AI agent running in minutes.

### Prerequisites

- [Bun](https://bun.sh/docs/installation) >= 1.0 (recommended) or Node.js >= 20.9
- An API key from your preferred LLM provider (OpenAI, Anthropic, etc.)
- Optional: A wallet address for receiving payments

### 1. Create and Configure Your Agent

```bash
# Interactive mode - CLI guides you through all options
bunx @lucid-agents/cli my-agent

# Or use inline configuration for faster setup (non-interactive)
bunx @lucid-agents/cli my-agent \
  --adapter=hono \
  --template=axllm \
  --non-interactive \
  --AGENT_NAME="My AI Agent" \
  --AGENT_DESCRIPTION="AI-powered assistant" \
  --OPENAI_API_KEY=your_api_key_here \
  --PAYMENTS_RECEIVABLE_ADDRESS=0xYourAddress \
  --network=base-sepolia
```

The CLI will:

- **Adapter selection**: `hono` (HTTP server), `express` (Node middleware), `tanstack-ui` (full dashboard), `tanstack-headless` (API only), or `next` (App Router shell)
- **Template selection**: `blank` (minimal), `axllm` (LLM-powered), `axllm-flow` (workflows), `identity` (on-chain identity), `trading-data-agent` (merchant), or `trading-recommendation-agent` (shopper)
- **Configuration**: Set agent metadata, LLM keys, and optional payment details
- **Install dependencies**: Automatically run `bun install`

### 2. Start Your Agent

```bash
cd my-agent
bun run dev
```

Your agent is now running at `http://localhost:3000`!

**Try it out:**

```bash
# View agent manifest
curl http://localhost:3000/.well-known/agent.json

# List entrypoints
curl http://localhost:3000/entrypoints

# Invoke an entrypoint (example for echo template)
curl -X POST http://localhost:3000/entrypoints/echo/invoke \
  -H "Content-Type: application/json" \
  -d '{"input": {"text": "Hello, Lucid Agents!"}}'
```

---

## Architecture Overview

Lucid Agents is a TypeScript monorepo built for multi-runtime agent deployment with a layered architecture:

- **Layer 0: Types** - Shared type definitions (`@lucid-agents/types`)
- **Layer 1: Extensions** - Optional capabilities (identity, payments, wallet, a2a, ap2)
- **Layer 2: Core** - Framework-agnostic agent runtime (`@lucid-agents/core`)
- **Layer 3: Adapters** - Framework integrations (hono, tanstack, express, next)
- **Layer 4: Developer Tools** - CLI scaffolding and templates

> For detailed architecture documentation including dependency graphs, request flows, and extension system design, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

### Core Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Your Agent                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Entrypoints (typed with Zod)                          │ │
│  │  ├─ invoke handlers (request → response)               │ │
│  │  └─ stream handlers (request → SSE stream)             │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼─────┐    ┌──────▼──────┐   ┌─────▼────────┐
    │   Hono   │    │  TanStack   │   │   Express    │
    │  Adapter │    │   Adapter   │   │   Adapter    │
    └────┬─────┘    └──────┬──────┘   └─────┬────────┘
         │                 │                 │
         └─────────────────┼─────────────────┘
                           │
         ┌─────────────────┴─────────────────┐
         │                                   │
    ┌────▼──────────┐              ┌────────▼────────┐
    │     core      │              │   payments      │
    │  (core)       │◄─────────────┤  identity       │
    │               │              │  (ERC-8004)     │
    └───────────────┘              └─────────────────┘
```

### Package Structure

```
/
├── packages/
│   ├── core/              # Core runtime and types
│   │   ├── src/core/           # Agent runtime, manifest generation
│   │   ├── src/http/           # HTTP utilities, task handlers
│   │   └── src/axllm/          # LLM integration helpers
│   │
│   ├── wallet/            # Wallet connectors + env helpers
│   ├── payments/          # x402 pricing/runtime, manifest, AxLLM helpers
│   ├── identity/          # ERC-8004 identity/trust
│   ├── a2a/               # Agent-to-Agent card/client
│   ├── ap2/               # AP2 extension helpers
│   ├── hono/              # Hono HTTP server adapter + x402 middleware
│   ├── express/           # Express adapter + x402 middleware
│   ├── tanstack/          # TanStack Start adapter + paywall builder
│   ├── x402-tanstack-start/ # TanStack Start x402 middleware
│   └── cli/               # CLI scaffolding tool (adapters + templates; includes next adapter base)
```
> Note: The Next.js adapter is shipped as a CLI adapter base under `packages/cli/adapters/next` (not a separate published package).

### Key Concepts

**Entrypoints**: Typed API endpoints that define your agent's capabilities. Each entrypoint has:

- Input/output schemas (Zod)
- Optional pricing (x402)
- Handler (synchronous) or stream handler (SSE)

**Adapters**: Runtime frameworks that expose your entrypoints as HTTP routes. Choose based on your deployment needs:

- `hono` - Lightweight HTTP server (Bun/edge-friendly)
- `express` - Node-style HTTP server with middleware ecosystem
- `tanstack` - TanStack Start adapter (UI/dashboard or headless)
- `next` - App Router shell (scaffolded via CLI adapter base)

**Manifests**: Auto-generated AgentCard (`.well-known/agent-card.json` and `.well-known/agent.json`) that describes your agent's capabilities, pricing, and identity for discovery tools and A2A protocols.

**Payment Networks**: Accept payments on:

- **EVM/SVM (x402)**: Base, Base Sepolia, Polygon/Amoy, Avalanche/Ava Fuji, IoTeX, Abstract + testnet, Sei + testnet, Peaq, Story, EduChain, SKALE Base Sepolia, Solana mainnet/devnet (USDC)

**Identity**: ERC-8004 on-chain identity for reputation and trust. Register once, reference across all networks.

---

## Key Packages

### Core Packages

#### [`@lucid-agents/core`](packages/core/README.md)

Core agent runtime with entrypoints, manifests, and streaming support.

```typescript
import { createAgentHttpRuntime } from '@lucid-agents/core';
import { z } from 'zod';

const runtime = createAgentHttpRuntime(
  { name: 'my-agent', version: '1.0.0', description: 'My first agent' },
  { payments: false } // enable x402 by supplying payments config
);

runtime.entrypoints.add({
  key: 'greet',
  input: z.object({ name: z.string() }),
  async handler({ input }) {
    return { output: { message: `Hello, ${input.name}!` } };
  },
});
```

#### [`@lucid-agents/hono`](packages/hono/README.md)

Hono adapter for building traditional HTTP servers.

```typescript
import { createAgentApp } from '@lucid-agents/hono';

const { app, addEntrypoint } = createAgentApp({
  name: 'my-agent',
  version: '1.0.0',
});

// Add entrypoints...

export default app; // Bun.serve or Hono serve
```

#### [`@lucid-agents/tanstack`](packages/tanstack/README.md)

TanStack Start adapter with UI and headless variants.

```typescript
import { createTanStackRuntime } from '@lucid-agents/tanstack';

export const { runtime, handlers } = createTanStackRuntime({
  name: 'my-agent',
  version: '1.0.0',
});
```

#### [`@lucid-agents/identity`](packages/identity/README.md)

ERC-8004 toolkit for on-chain identity, reputation, and validation.

```typescript
import { createAgentIdentity } from '@lucid-agents/identity';

const identity = await createAgentIdentity({
  domain: 'my-agent.example.com',
  autoRegister: true, // Register on-chain if not exists
});
```

#### [`@lucid-agents/payments`](packages/payments/README.md)

x402 payment utilities for multi-network payment handling.

```typescript
import { paymentsFromEnv } from '@lucid-agents/payments';

const payments = paymentsFromEnv();
// Auto-detects EVM vs Solana from PAYMENTS_RECEIVABLE_ADDRESS format
```

#### [`@lucid-agents/a2a`](packages/a2a/README.md)

A2A Protocol client for agent-to-agent communication.

```typescript
import { fetchAndInvoke, sendMessage, waitForTask } from '@lucid-agents/a2a';

// Direct invocation
const result = await fetchAndInvoke('https://other-agent.com', 'skillId', {
  input: 'data',
});

// Task-based operations
const { taskId } = await sendMessage(
  card,
  'skillId',
  { input: 'data' },
  undefined,
  {
    contextId: 'conversation-123',
  }
);
const task = await waitForTask(client, card, taskId);
```

#### [`@lucid-agents/ap2`](packages/ap2/README.md)

AP2 (Agent Payments Protocol) extension for Agent Cards.

```typescript
import { createAP2Runtime, createAgentCardWithAP2 } from '@lucid-agents/ap2';

const ap2Runtime = createAP2Runtime({ roles: ['merchant'] });
const cardWithAP2 = createAgentCardWithAP2(baseCard, ap2Runtime.config);
```

#### [`@lucid-agents/wallet`](packages/wallet/README.md)

Wallet SDK for agent and developer wallet management.

```typescript
import { createAgentWallet } from '@lucid-agents/wallet';

const wallet = await createAgentWallet({
  type: 'local',
  privateKey: process.env.AGENT_WALLET_PRIVATE_KEY,
});
```

### CLI Tool

#### [`@lucid-agents/cli`](packages/cli/README.md)

CLI for scaffolding new agent projects with templates and interactive configuration.

```bash
# Interactive mode
bunx @lucid-agents/cli

# With options
bunx @lucid-agents/cli my-agent \
  --adapter=tanstack-ui \
  --template=axllm \
  --non-interactive
```

Each package contains detailed API documentation, environment variable references, and working examples.

---

## Example: Paid streaming agent (Hono)

```typescript
import { z } from 'zod';
import { createAgentApp } from '@lucid-agents/hono';

const { app, addEntrypoint } = createAgentApp(
  {
    name: 'ai-assistant',
    version: '1.0.0',
    description: 'AI assistant with paid streaming',
  },
  {
    payments: {
      payTo: process.env.PAYMENTS_RECEIVABLE_ADDRESS!,
      network: 'base-sepolia',
      facilitatorUrl: process.env.FACILITATOR_URL!,
    },
  }
);

addEntrypoint({
  key: 'chat',
  description: 'Echo stream (paid)',
  input: z.object({ message: z.string() }),
  streaming: true,
  // Prices are denominated in whole tokens (USDC); keep examples small
  price: '0.05',
  async stream(ctx, emit) {
    for (const char of ctx.input.message) {
      await emit({ kind: 'delta', delta: char, mime: 'text/plain' });
    }
    await emit({ kind: 'text', text: `You said: ${ctx.input.message}` });
    return { output: { done: true } };
  },
});

export default app;
```

**Features demonstrated:**

- x402 pricing on entrypoint + paywall middleware via adapter
- Streaming SSE responses with typed envelopes
- Type-safe input schema (Zod)

---

## Development

### Setup

```bash
# Clone the repository
git clone https://github.com/daydreamsai/lucid-agents.git
cd lucid-agents

# Install dependencies
bun install

# Build all packages
bun run build:packages
```

### Package Development

```bash
# Work on a specific package
cd packages/core

# Build this package
bun run build

# Run tests
bun test

# Type check
bun run type-check

# Lint and format
bun run lint:fix
bun run format
```

---

## Contributing

We welcome contributions! Whether you're fixing bugs, adding features, or improving documentation.

### Development Setup

1. **Fork and clone** the repository

2. **Install dependencies:**

   ```bash
   bun install
   ```

3. **Build all packages** (required - must run in dependency order):

   ```bash
   bun run build:packages
   ```

4. **Make your changes:**
   - Add tests for new features
   - Update documentation as needed

5. **Run checks before submitting:**

   ```bash
   bun test              # All tests
   bun run type-check    # TypeScript validation
   bun run lint          # Code linting
   ```

6. **Create a changeset:**

   ```bash
   bun run changeset
   ```

7. **Submit a pull request**

For detailed guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md).

---

## Resources

### Documentation

- **Architecture Guide**: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - System design, dependency graphs, and request flows
- **Package READMEs**: Each package has comprehensive documentation and `AGENTS.md` files
- **Contributing Guide**: [CONTRIBUTING.md](CONTRIBUTING.md) - Development workflow and guidelines

### Protocols & Specifications

- **ERC-8004 Specification**: [EIP-8004](https://eips.ethereum.org/EIPS/eip-8004) - On-chain agent identity standard
- **x402 Protocol**: [x402 GitHub](https://github.com/paywithx402) - HTTP-native payment protocol
- **A2A Protocol**: [Agent-to-Agent Communication](https://a2a-protocol.org/) - Agent discovery and communication protocol

### Technologies

- **Hono Framework**: [hono.dev](https://hono.dev/) - Lightweight web framework
- **TanStack Start**: [tanstack.com/start](https://tanstack.com/start) - Full-stack React framework
- **Bun Runtime**: [bun.sh](https://bun.sh/) - Fast JavaScript runtime
- **Zod**: [zod.dev](https://zod.dev/) - TypeScript-first schema validation

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## Contributors

<a href="https://github.com/daydreamsai/lucid-agents/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=daydreamsai/lucid-agents" alt="Contributors" />
</a>

---

## Star History

<a href="https://star-history.com/#daydreamsai/lucid-agents&Date">
  <img src="https://api.star-history.com/svg?repos=daydreamsai/lucid-agents&type=Date" alt="Star History Chart" />
</a>

---

<div align="center">
  <p>Built with ❤️ by the Daydreams AI team</p>
  <p>
    <a href="https://github.com/daydreamsai/lucid-agents">GitHub</a> •
    <a href="https://www.npmjs.com/org/lucid-agents">npm</a> •
    <a href="https://twitter.com/daydreamsai">Twitter</a>
  </p>
</div>
