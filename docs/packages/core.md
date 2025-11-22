# @lucid-agents/core

Purpose: Framework-agnostic runtime for building agent HTTP apps (entrypoint registry, manifests, HTTP handlers, streaming).

Key concepts:
- Agent core (`AgentCore`) registers entrypoints with zod-validated input/output and can invoke or stream them.
- Runtime (`createAgentRuntime`) wires wallets, payments, A2A/AP2 protocols, trust metadata, and manifest generation.
- HTTP runtime (`createAgentHttpRuntime`) produces handler functions for health, manifest, entrypoint listing, invoke/stream, landing page, and favicon; embeds payment/identity info in manifests.
- AxLLM wrapper (`createAxLLMClient`) exposed under `./axllm` export for model calls with consistent config and x402-paid fetch.
- Utilities/exported helpers under `./utils` (SSE helpers, config helpers, etc.).

Exports (barrel `index.ts`):
- Core: `AgentCore`, `createAgentCore`, `ZodValidationError`, invoke/stream context/result types, `Network`, HTTP entrypoint types.
- Config: `configureAgentKit`, `getAgentKitConfig`, `resetAgentKitConfigForTesting`, `getActiveInstanceConfig`/`setActiveInstanceConfig` (reads env/defaults for runtime).
- Runtime: `createAgentRuntime(meta, opts)`; opts include payments config (or `false` to disable), AP2 config, trust config, initial entrypoints, and global config override.
- HTTP: `createAgentHttpRuntime(meta, opts)` returns runtime + HTTP handlers; SSE helpers via `createSSEStream`, `writeSSE`.
- AxLLM: `createAxLLMClient` and types (`./axllm` export path).

Runtime options (both `createAgentRuntime` and HTTP runtime):
- `payments?: PaymentsConfig | false` (auto-activates when entrypoints have prices; `false` disables pricing). AP2 defaults to `{ roles: ['merchant'], required: true }` when payments are enabled unless overridden via `ap2`.
- `trust?: TrustConfig` (ERC-8004 identity/trust metadata to embed in manifests).
- `ap2?: AP2Config` (payment roles; skips when omitted unless payments are present).
- `entrypoints?: Iterable<EntrypointDef>` (pre-register entrypoints on creation).
- `config?: AgentKitConfig` (wallet/payment config; reads env when omitted).
- HTTP-only: `landingPage?: boolean` (default true) toggles landing page handler.

Dependencies:
- Internal packages: `@lucid-agents/types` (core types), `@lucid-agents/identity`, `@lucid-agents/payments`, `@lucid-agents/wallet`, `@lucid-agents/a2a`, `@lucid-agents/ap2`.
- External: `hono` (types/utils), `viem`, `x402`/`x402-fetch`, `@ax-llm/ax` (+ ax-tools), `zod`.

Integration notes:
- Provide `meta` (name, version, description, icon) to runtime creation; attach entrypoints via `runtime.entrypoints.add`.
- Payments: pass `payments: false` to skip; otherwise config + entrypoints enable pricing and manifest payment requirements.
- Trust: pass trust config from `@lucid-agents/identity` to embed ERC-8004 identity in manifests.
- AP2: auto-enabled with merchant role when payments are configured unless explicitly overridden.
- HTTP handlers are framework-agnostic (standard `Request`/`Response`); adapters (Hono/TanStack/Express) wrap these.
- Manifest build order: A2A base card → payments pricing (if configured) → identity/trust (if provided) → AP2 (defaults to merchant/required when payments active unless overridden). Manifest cached per-origin until invalidated by entrypoint changes.
- Payments activation: entrypoints with prices call `payments.activate` on add; active payments are copied onto `agent.config` for manifest generation.
- AxLLM env resolution: reads `AX_PROVIDER|AXLLM_PROVIDER|OPENAI_PROVIDER`, `AX_MODEL|AXLLM_MODEL|OPENAI_MODEL`, `AX_API_URL|AXLLM_API_URL|OPENAI_API_URL`, `AX_TEMPERATURE|AXLLM_TEMPERATURE|OPENAI_TEMPERATURE`, `AX_DEBUG|AXLLM_DEBUG`, and `OPENAI_API_KEY`; falls back to `PRIVATE_KEY` when no account/privateKey passed.
- AxLLM usage: `createAxLLMClient({ model?, apiKey?, apiUrl?, temperature?, debug?, x402: { account?/privateKey? } })` wraps `createX402LLM` from payments; pass `client` or `clientFactory` to inject your own. Either provide `apiKey`/`OPENAI_API_KEY` and an x402 `account`/`PRIVATE_KEY` (or `x402.privateKey`). Returns `{ ax, isConfigured() }`.

Usage sketch:
```ts
import { createAgentHttpRuntime } from '@lucid-agents/core';
import { z } from 'zod';

const runtime = createAgentHttpRuntime(
  { name: 'Echo', version: '1.0.0', description: 'Echo agent' },
  { payments: false, landingPage: true }
);

runtime.entrypoints.add({
  key: 'echo',
  description: 'Echo input',
  input: z.object({ message: z.string() }),
  handler: async ({ input }) => ({ output: { message: input.message } }),
});

// Use runtime.handlers.invoke/stream/manifest/landing in your server adapter.
```
