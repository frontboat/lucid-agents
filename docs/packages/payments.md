# @lucid-agents/payments

Purpose: x402-based payment tooling for agents—pricing/requirement evaluation, manifest stamping, env resolution, and payment-enabled fetch/LLM helpers.

What it provides:
- Pricing + gating: `entrypointHasExplicitPrice`, `resolvePrice`, `resolvePaymentRequirement`, `evaluatePaymentRequirement`, `paymentRequiredResponse`, `resolveActivePayments`.
- Runtime toggle: `createPaymentsRuntime(paymentsOption, agentConfig)` (returns `undefined` if payments are disabled/unset; otherwise uses `paymentsOption ?? agentConfig.payments`) gives `{ config, isActive, requirements(entrypoint, kind), activate(entrypoint) }`; call `activate(entrypoint)` on a priced entrypoint before checking requirements.
- Manifest: `createAgentCardWithPayments(card, paymentsConfig, entrypoints)` injects pricing and x402 payment method metadata into an `AgentCard`.
- Validation/env: `validatePaymentsConfig` (ensures payee/network/facilitator are set and supported), `paymentsFromEnv` (reads `PAYMENTS_RECEIVABLE_ADDRESS`, `FACILITATOR_URL`, `NETWORK` and merges optional overrides; CLI templates emit `PAYMENTS_NETWORK`/`PAYMENTS_FACILITATOR_URL` and pass them directly into runtime config).
- Networks: uses the x402 `Network` union. Supported values today: `abstract`, `abstract-testnet`, `base`, `base-sepolia`, `avalanche`, `avalanche-fuji`, `iotex`, `polygon`, `polygon-amoy`, `sei`, `sei-testnet`, `peaq`, `story`, `educhain`, `skale-base-sepolia`, `solana`, `solana-devnet`.
- Runtime payment context: `createRuntimePaymentContext({ runtime?, network?, chainId?, privateKey?, fetch?, logger?, maxPaymentBaseUnits? })` yields `{ fetchWithPayment, signer, walletAddress, chainId }`, wrapping fetch with x402 payments using either the agent wallet (via runtime) or a supplied private key. Private-key mode requires `network`. Runtime mode requires an `agent` wallet plus either `chainId` or a `network` of `base`/`base-sepolia` to infer `8453/84532`; otherwise it returns nulls with a warning. `maxPaymentBaseUnits` sets the payment cap (no USD shortcut).
- x402 helpers: `createX402Fetch`, `accountFromPrivateKey`, `createX402LLM`/`x402LLM`, plus address helpers (`sanitizeAddress`, `normalizeAddress`, `ZERO_ADDRESS`).

Usage (server/runtime enforcement):
```ts
import {
  createPaymentsRuntime,
  paymentRequiredResponse,
} from '@lucid-agents/payments';

const paymentsRuntime = createPaymentsRuntime(config.payments, agentConfig);

// When handling an entrypoint request:
paymentsRuntime?.activate(entrypoint); // marks payments active if price exists
const requirement = paymentsRuntime?.requirements(entrypoint, 'invoke');
if (requirement?.required) {
  return requirement.response; // 402 Response with pricing headers/body
}
// continue to handler
```

Usage (paid fetch from runtime wallet or private key):
```ts
import { createRuntimePaymentContext } from '@lucid-agents/payments';

const paymentCtx = await createRuntimePaymentContext({
  runtime,          // AgentRuntime with wallets.agent configured
  network: 'base',  // or chainId: 8453
});
const paidFetch = paymentCtx.fetchWithPayment ?? fetch;
const res = await paidFetch('https://example.com/invoke', { method: 'POST' });
```

Notes:
- Depends on `@lucid-agents/types`, `x402`/`x402-fetch`, `viem`, and `@ax-llm/ax` for LLM helpers; built with `tsup`.
- Warnings are logged (or sent to `options.logger.warn`) instead of throwing when runtime payment context cannot be initialized (missing fetch, missing runtime/private key, unsupported network/chain, or no agent wallet). Check for `fetchWithPayment`/`signer` being null.
