# Lucid Agents – Working Notes

This repo is a monorepo of the Lucid Agents SDK (runtime, adapters, paywall helpers, CLI, and templates). Use this as a quick orientation when wiring or debugging agents.

## Build an agent
- Scaffold: `bunx create-agent-kit@latest my-agent --template=blank --adapter=hono` (CLI package: `@lucid-agents/cli`).
- Runtime: `createAgentHttpRuntime` from `@lucid-agents/core` registers entrypoints, builds manifests, and provides HTTP handlers (health/entrypoints/manifest/invoke/stream/landing).
- Add entrypoints with zod schemas; streaming handlers must emit `StreamPushEnvelope` chunks.

## Key packages
- `@lucid-agents/core`: runtime + HTTP handlers + AxLLM wrapper. Manifest build order: A2A base card → payments pricing (if active) → identity/trust → AP2 (merchant/required default when payments active). Landing page is on by default.
- `@lucid-agents/wallet`: local/Lucid wallet connectors + `walletsFromEnv`.
- `@lucid-agents/payments`: x402 pricing/runtime, manifest stamping, runtime payment context (runtime wallet or private key), AxLLM (`createAxLLMClient` uses `createX402LLM`).
- `@lucid-agents/identity`: ERC-8004 trust/registry clients and `createAgentIdentity`.
- `@lucid-agents/a2a`: Agent Card build/fetch/parse; invoke/stream clients.
- `@lucid-agents/ap2`: AP2 extension helpers for payment roles.
- Adapters: `@lucid-agents/hono`, `@lucid-agents/express`, `@lucid-agents/tanstack`; paywall helper `@lucid-agents/x402-tanstack-start`.

## Payments (x402)
- Price entrypoints with `price` to activate payments runtime. Pass `payments: false` to disable.
- Adapters wrap invoke/stream routes with x402 middleware (`withPayments` in Hono/Express; `createTanStackPaywall` for Start).
- Runtime payment context: `createRuntimePaymentContext({ runtime?, network?, chainId?, privateKey?, fetch?, logger?, maxPaymentBaseUnits? })`; runtime mode needs an agent wallet + chainId/network; private-key mode requires network.
- Headers on 402 response: `X-Price`, `X-Network`, `X-Pay-To`, optional `X-Facilitator`.

## Identity (ERC-8004)
- `createAgentIdentity({ runtime, domain, chainId, rpcUrl, registryAddress?, autoRegister? })` uses runtime agent wallet; auto-registration needs a signer that can write transactions (local wallet).
- Required inputs: `AGENT_DOMAIN`, `CHAIN_ID`, `RPC_URL`. Optional: `IDENTITY_REGISTRY_ADDRESS`, `IDENTITY_AUTO_REGISTER`, `IDENTITY_SIGNATURE_NONCE`.
- Trust config from identity can be stamped onto Agent Cards via `createAgentCardWithIdentity`.

## A2A
- `buildAgentCard` emits base Agent Card (no payments/identity/AP2). `fetchAgentCard` pulls `/.well-known/agent-card.json`; `invokeAgent`/`streamAgent` call peers.
- Runtime helper: `createA2ARuntime(runtime)` exposes `buildCard`, `fetchCard`, `client`.

## AP2
- `createAgentCardWithAP2(card, { roles, description?, required? })` adds AP2 extension. `required` defaults to true when roles include `merchant`.

## Adapters
- Hono: `createAgentApp` mounts routes + landing + favicon; stream routes always present (400 when unsupported). `withPayments` wraps per-route paywall.
- Express: same semantics as Hono with Express middleware bridge; `withPayments` uses `x402-express`.
- TanStack Start: `createTanStackRuntime` adapts HTTP handlers; `createTanStackPaywall` builds Start middleware from entrypoints/pricing (`basePath` default `/api/agent`).
- x402 TanStack paywall: `paymentMiddleware(payTo, routes, facilitator?, paywall?)` renders HTML paywall when `Accept` prefers HTML; otherwise returns 402 JSON. Routes can be sync/async.

## AxLLM (paid LLM)
- `createAxLLMClient({ provider?, model?, apiKey?, apiUrl?, temperature?, debug?, x402: { account?/privateKey? }, client?, clientFactory? })`.
- Env fallbacks: `AX_PROVIDER|AXLLM_PROVIDER|OPENAI_PROVIDER`, `AX_MODEL|AXLLM_MODEL|OPENAI_MODEL`, `AX_API_URL|AXLLM_API_URL|OPENAI_API_URL`, `AX_TEMPERATURE|AXLLM_TEMPERATURE|OPENAI_TEMPERATURE`, `AX_DEBUG|AXLLM_DEBUG`, `OPENAI_API_KEY`, `PRIVATE_KEY`.

## Env quick list
- Payments: `PAYMENTS_RECEIVABLE_ADDRESS`, `FACILITATOR_URL`, `NETWORK`.
- Wallets: `AGENT_WALLET_TYPE`, `AGENT_WALLET_PRIVATE_KEY`, `AGENT_WALLET_AGENT_REF`, `AGENT_WALLET_BASE_URL`, `AGENT_WALLET_ACCESS_TOKEN`, `AGENT_WALLET_HEADERS`, `AGENT_WALLET_AUTHORIZATION_CONTEXT`, `DEVELOPER_WALLET_PRIVATE_KEY`.
- Identity: `AGENT_DOMAIN`, `CHAIN_ID`, `RPC_URL`, `IDENTITY_REGISTRY_ADDRESS`, `IDENTITY_AUTO_REGISTER`, `IDENTITY_SIGNATURE_NONCE`.
- AxLLM: see above.

## Tips
- Entry points with prices should call `payments.activate` (core does this when you add them) before manifest/build to ensure payments are active.
- Landing pages are on by default in adapters; set `landingPage: false` to disable.
- Always check for nulls: payment context returns `{ fetchWithPayment: null, signer: null }` when misconfigured and logs warnings instead of throwing.
