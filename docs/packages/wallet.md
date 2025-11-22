# @lucid-agents/wallet

Purpose: runtime helpers and connectors that resolve a wallet handle (local or Lucid server-orchestrated) for agents to sign challenges/messages.

Key exports:
- `createAgentWallet(options)` – builds a wallet handle from config; supports `type: 'local'` (EOA signer) or `type: 'lucid'` (server-orchestrated).
- `createPrivateKeySigner(privateKey)` – viem-backed EOA signer used by the local connector.
- `createWalletsRuntime(config)` – maps `config.wallets` into `{ agent, developer }` handles for AgentKit; returns `undefined` if wallets are not configured.
- `walletsFromEnv(overrides?, env?)` / `resolve*FromEnv` – environment-driven config helper that merges env-provided wallet settings with explicit overrides.
- Connectors:
  - `LocalEoaWalletConnector` – signs messages/typed data using a provided `LocalEoaSigner` (e.g., from `createPrivateKeySigner` built on `viem`).
  - `ServerOrchestratorWalletConnector` – forwards signing to the Lucid wallet orchestrator API; requires a bearer token set via `setAccessToken(token)`.
- Utilities: challenge normalization (`normalizeChallenge`), signature extraction, metadata extraction, message encoding detection, address helpers (`normalizeAddress`, `sanitizeAddress`, `ZERO_ADDRESS`, `toCaip10`), and viem signature helpers (`signMessageWithViem`, `signTypedDataWithViem`).

Env config (merge order: env → overrides):
- Agent wallet:
  - `AGENT_WALLET_TYPE=local|lucid` (inferred as `local` if `AGENT_WALLET_PRIVATE_KEY` is set; `lucid` if `AGENT_WALLET_AGENT_REF` is set)
  - Local: `AGENT_WALLET_PRIVATE_KEY`, optional metadata `AGENT_WALLET_ADDRESS|CAIP2|CHAIN|CHAIN_TYPE|PROVIDER|LABEL`
  - Lucid server-orchestrated: `AGENT_WALLET_AGENT_REF`, `AGENT_WALLET_BASE_URL` (fallbacks: `LUCID_BASE_URL`, `LUCID_API_URL`), optional `AGENT_WALLET_HEADERS` (JSON), `AGENT_WALLET_ACCESS_TOKEN`, `AGENT_WALLET_AUTHORIZATION_CONTEXT` (JSON)
- Developer wallet: `DEVELOPER_WALLET_PRIVATE_KEY` plus optional metadata `DEVELOPER_WALLET_ADDRESS|CAIP2|CHAIN|CHAIN_TYPE|PROVIDER|LABEL`

Usage:
```ts
import { walletsFromEnv, createWalletsRuntime } from '@lucid-agents/wallet';

const wallets = walletsFromEnv(); // reads process.env
const runtime = createWalletsRuntime({
  wallets, // { agent?: { kind, connector }, developer?: { kind, connector } }
});

// Server-orchestrated wallet requires a bearer token before signing
// (can be provided via env AGENT_WALLET_ACCESS_TOKEN or set at runtime)
runtime?.agent?.setAccessToken?.(process.env.AGENT_WALLET_ACCESS_TOKEN ?? null);
```

Integration notes:
- `@lucid-agents/core` and `@lucid-agents/identity` rely on `wallets.agent` to sign challenges; `wallets.developer` is optional for dev-initiated flows.
- Import this package directly if you are wiring a custom runtime or want explicit control over wallet resolution; otherwise the AgentKit helpers will invoke it for you.
