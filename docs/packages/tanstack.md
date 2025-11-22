# @lucid-agents/tanstack

Purpose: TanStack Start adapter for `@lucid-agents/core` with optional x402 paywall middleware.

Key exports:
- `createTanStackRuntime(meta, opts?)` – wraps the core HTTP runtime and returns `{ runtime, handlers }` where handlers adapt to Start route signatures (`({ request })` / `({ request, params })`).
- `createTanStackPaywall({ runtime, basePath?, payments?, facilitator?, paywall? })` – builds Start middleware (`invoke`, `stream`) using `@lucid-agents/x402-tanstack-start`; derives routes and schemas from registered entrypoints and payments config.
- Helpers/types: `createTanStackHandlers`, `TanStackHandlers`, plus re-exported runtime option types.

Options:
- Same as core HTTP runtime: `payments?: PaymentsConfig | false`, `trust?`, `ap2?`, `entrypoints?`, `config?`, `landingPage?`.
- Paywall `basePath` defaults to `/api/agent`, matching default Start route layout.

Usage (Start route):
```ts
// app/routes/api/agent/entrypoints/$key.invoke.ts
import { createTanStackRuntime, createTanStackPaywall } from '@lucid-agents/tanstack';
import { z } from 'zod';

const { runtime, handlers } = createTanStackRuntime(
  { name: 'Echo', version: '1.0.0', description: 'Echo' },
  {
    entrypoints: [
      { key: 'echo', input: z.object({ text: z.string() }), handler: async ({ input }) => ({ output: input }) },
    ],
    payments: { payTo: '0x...', network: 'base-sepolia', facilitatorUrl: 'https://...' },
  }
);

const paywall = createTanStackPaywall({ runtime });
export const action = paywall.invoke ?? handlers.invoke; // wrap with paywall if configured
export const loader = handlers.invoke;
```

Notes:
- Paywall middleware builds GET/POST route configs for each entrypoint/kind (invoke + stream when available) using entrypoint zod schemas for request/response shapes; resolves payments from explicit arg or `runtime.payments?.config`.
- `createTanStackRuntime` simply adapts `createAgentHttpRuntime` handlers to Start-style `{ request, params }`.
- Depends on `@lucid-agents/core`, `@lucid-agents/payments`, `@lucid-agents/types`, and `@lucid-agents/x402-tanstack-start`.
