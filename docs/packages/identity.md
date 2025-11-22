# @lucid-agents/identity

Purpose: ERC-8004 identity/trust bootstrap for agents (domain proof, registry lookup/registration, trust metadata, registry clients).

What it provides:
- `createAgentIdentity(options)` – resolves chain/registry/RPC from options+env, uses `runtime.wallets.agent` to look up or auto-register ERC-8004 identity, generates domain proof signature, and returns `{ trust, record, signature, status, domain, isNewRegistration, clients? }`.
- `registerAgent(options)` – convenience wrapper that forces `autoRegister: true`.
- Manifest/trust helpers: `createAgentCardWithIdentity(card, trustConfig)`, `getTrustConfig(identityResult)`, `generateAgentMetadata(identityResult, overrides?)`.
- Registry + viem wiring: `bootstrapIdentity`, `createIdentityRegistryClient`, `createReputationRegistryClient`, `createValidationRegistryClient`, `makeViemClientsFromWallet` (and read-only `makeViemClientsFromEnv`), plus config exports `getRegistryAddresses`, `isChainSupported`, `SUPPORTED_CHAINS`, defaults for trust models.
- Validation/helpers: `validateIdentityConfig`, `resolveAutoRegister` (reads `IDENTITY_AUTO_REGISTER`), `parseBoolean`, `resolveTrustOverrides`, `getRegistryAddress`.

Env/inputs:
- Required (pass via options or env): `AGENT_DOMAIN`, `CHAIN_ID`, `RPC_URL` (no default chain; unsupported chains throw when resolving registry addresses).
- Optional overrides: `IDENTITY_REGISTRY_ADDRESS` (falls back to chain-specific address from config), `IDENTITY_AUTO_REGISTER` (defaults true), `IDENTITY_SIGNATURE_NONCE` (nonce override for domain proof).
- Requires `runtime.wallets.agent` (signer) to be configured; fails fast otherwise. Auto-registration/contract writes require a local agent wallet with transaction signing; orchestrated (server) wallets can read but cannot register and will be skipped with a warning.

Usage:
```ts
import {
  createAgentIdentity,
  createAgentCardWithIdentity,
  getTrustConfig,
} from '@lucid-agents/identity';

const identity = await createAgentIdentity({
  runtime, // AgentRuntime with wallets.agent
  domain: process.env.AGENT_DOMAIN,
  chainId: Number(process.env.CHAIN_ID),
  rpcUrl: process.env.RPC_URL,
  autoRegister: true,
  trustOverrides: { validationRequestsUri: 'https://.../requests' },
});

const trust = getTrustConfig(identity);
const card = trust
  ? createAgentCardWithIdentity(agentCard, trust)
  : agentCard;
```

Notes:
- Registry addresses are sourced from `config/erc8004` when `registryAddress` is not provided; supported chains in config are Base/ETH/Linea Sepolia, Polygon Amoy, Hedera Testnet, HyperEVM Testnet, SKALE Base Sepolia (other chain IDs throw).
- Registry clients (`identity`, `reputation`, `validation`) are created when RPC + chain are resolved; failures log warnings but do not crash the agent.
- Built with `tsup`; depends on `@lucid-agents/types`, `@lucid-agents/wallet`, `viem`.
