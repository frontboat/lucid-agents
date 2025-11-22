# @lucid-agents/hono

Purpose: Hono adapter that mounts `@lucid-agents/core` HTTP runtime routes and (optionally) x402 paywall middleware.

Key exports:
- `createAgentApp(meta, opts?)` – returns `{ app, runtime, agent, addEntrypoint, config }`, mounts `/health`, `/entrypoints`, `/.well-known/agent.json`, `/.well-known/agent-card.json`, landing page (unless disabled), and `/favicon.svg` plus per-entrypoint invoke/stream routes. Always registers stream routes; non-streaming entrypoints return HTTP 400 instead of 404 for client ergonomics.
- `withPayments(app, params)` – attaches `x402-hono` middleware for a given entrypoint/path; used internally before route registration.
- `toJsonSchemaOrUndefined` – zod → JSON Schema helper for paywall schemas.

Options (createAgentApp):
- Inherits `CreateAgentHttpOptions`: `payments?: PaymentsConfig | false`, `ap2?`, `trust?`, `entrypoints?`, `config?`, `landingPage?: boolean`.
- Hooks: `beforeMount?(app)` and `afterMount?(app)` to inject middleware/routes around agent handlers.
- Landing: enabled by default; set `landingPage: false` to disable (root route returns 404 text when disabled).

Dependencies: `@lucid-agents/core`, `@lucid-agents/payments`, `@lucid-agents/types`, `@lucid-agents/ap2`, `hono`, `x402-hono`, `zod`.

Usage:
```ts
import { Hono } from 'hono';
import { createAgentApp } from '@lucid-agents/hono';
import { z } from 'zod';

const agent = createAgentApp(
  { name: 'Echo', version: '1.0.0', description: 'Echo agent' },
  {
    entrypoints: [
      {
        key: 'echo',
        description: 'Echo input',
        input: z.object({ message: z.string() }),
        // Prices are denominated in whole tokens (USDC); use small decimals for examples
        price: '0.05',
        handler: async ({ input }) => ({ output: input }),
      },
    ],
    payments: { payTo: '0x...', network: 'base-sepolia', facilitatorUrl: 'https://...' },
  }
);

const app = new Hono();
app.route('/', agent.app);
export default app;
```
