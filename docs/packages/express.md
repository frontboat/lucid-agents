# @lucid-agents/express

Purpose: Express adapter that mounts `@lucid-agents/core` HTTP handlers and optional x402 paywall (`x402-express`).

Key exports:
- `createAgentApp(meta, opts?)` – returns `{ app, runtime, agent, addEntrypoint, config }`, wiring `/health`, `/entrypoints`, `/.well-known/agent.json`, `/.well-known/agent-card.json`, landing (unless disabled), `/favicon.svg`, and per-entrypoint invoke/stream routes. Stream routes are always present (non-stream entrypoints return 400) to give clients consistent endpoints.
- `withPayments({ app, path, entrypoint, kind, payments, facilitator?, middlewareFactory? })` – attaches paywall middleware for an entrypoint+verb pair; used internally prior to route registration.

Options:
- Inherits `CreateAgentHttpOptions`: `payments?: PaymentsConfig | false`, `ap2?`, `trust?`, `entrypoints?`, `config?`, `landingPage?: boolean`.
- Hooks: `beforeMount?(app)` / `afterMount?(app)` to register middleware or extra routes around agent handlers.
- Landing: enabled by default; `landingPage: false` makes `/` return 404 text.

Dependencies: `@lucid-agents/core`, `@lucid-agents/payments`, `@lucid-agents/types`, `express`, `x402-express`, `zod`.

Usage:
```ts
import express from 'express';
import { createAgentApp } from '@lucid-agents/express';
import { z } from 'zod';

const agent = createAgentApp(
  { name: 'Echo', version: '1.0.0', description: 'Echo' },
  {
    entrypoints: [
      {
        key: 'echo',
        input: z.object({ text: z.string() }),
        // Prices are denominated in whole tokens (USDC); use small decimals for examples
        price: '0.05',
        handler: async ({ input }) => ({ output: input }),
      },
    ],
    payments: { payTo: '0x...', network: 'base-sepolia', facilitatorUrl: 'https://...' },
  }
);

const app = express();
app.use('/agent', agent.app);
app.listen(3000);
```
