# @lucid-agents/types

Purpose: single source of truth for all shared types used by Lucid Agents packages.

Scope:
- `core` – agent runtime shapes: `EntrypointDef`, `EntrypointHandler`/`EntrypointStreamHandler`, streaming envelopes (`StreamEnvelope`/`StreamPushEnvelope`/`StreamResult`), `AgentRuntime`, manifest/card types, payments + wallets config aggregation, `CreateAgentAppReturn`, `AgentCapabilities`.
- `payments` – x402 pricing (`EntrypointPrice`), payment requirements, payment runtime context, `SolanaAddress`.
- `identity` – ERC-8004 registry/trust types (`RegistrationEntry`, `TrustModel`), signer challenge shapes.
- `a2a`, `ap2` – protocol message/envelope shapes for agent-to-agent and agent-to-person flows (A2A client/runtime, AP2 roles/extension descriptors).
- `wallets` – wallet connector/metadata types, env-friendly config shapes (`WalletsConfig`, `AgentWalletConfig`), signer payloads (`AgentChallenge`, `TypedDataPayload`).

Usage:
- Import from the root barrel for breadth or deep paths for tree-shaking:
  ```ts
  import type {
    EntrypointDef,
    AgentContext,
    StreamEnvelope,
  } from '@lucid-agents/types/core';
  import type { WalletsConfig } from '@lucid-agents/types/wallets';
  ```
- Handlers are typed against zod schemas for inputs/outputs:
  ```ts
  import { z } from 'zod';
  import type { EntrypointHandler } from '@lucid-agents/types/core';

  const input = z.object({ text: z.string() });
  const output = z.object({ text: z.string() });
  const handler: EntrypointHandler<typeof input, typeof output> = async ctx => {
    return { output: ctx.input, usage: { total_tokens: 0 } };
  };
  ```

Build/runtime:
- Pure types/constants; no runtime side effects. Built with `tsup`; peer dep on `zod`; re-exports `Network`/`Resource` from `x402/types`.

Guidance:
- Keep additions additive to avoid breaking downstream packages; prefer adding to feature-specific modules (payments/identity/etc.) instead of inflating the root barrel.
