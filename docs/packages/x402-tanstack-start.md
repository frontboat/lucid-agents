# @lucid-agents/x402-tanstack-start

Purpose: TanStack Start middleware for x402 payment enforcement. Consumed by `@lucid-agents/tanstack` to guard invoke/stream routes.

What it provides:
- `paymentMiddleware(payTo, routes, facilitator?, paywall?)` – builds a Start `createMiddleware().server(...)` handler that validates `X-PAYMENT` headers, renders an HTML paywall when absent, and settles payments via the facilitator.
- Types re-exported from x402: `RoutesConfig`, `RouteConfig`, `Network`, money types, plus `TanStackRequestMiddleware` and `SolanaChainAddress`.

RoutesConfig shape:
- Keys: `POST /path` or `GET /path`.
- Values: `{ price, network, config?: { description?, mimeType?, inputSchema?, outputSchema?, maxTimeoutSeconds?, resource?, discoverable?, customPaywallHtml? } }`.
- Supports both EVM and SVM networks (uses `SupportedEVMNetworks` / `SupportedSVMNetworks`).

Integration:
```ts
// app/routes/api/agent/entrypoints/$key.invoke.ts
import { paymentMiddleware } from '@lucid-agents/x402-tanstack-start';

const payTo = '0x...' as const;
const routes = {
  'POST /api/agent/entrypoints/echo/invoke': {
    // Prices are denominated in whole tokens (USDC); use small decimals for examples
    price: '0.05',
    network: 'base-sepolia',
    config: {
      description: 'Echo invoke',
      mimeType: 'application/json',
      inputSchema: { bodyType: 'json' },
    },
  },
};

export const action = paymentMiddleware(payTo, routes);
```

Notes:
- Computes payment requirements using facilitator metadata and returns `X-PAYMENT-RESPONSE` on success.
- When `X-PAYMENT` header is missing and `Accept` prefers HTML, renders a hosted paywall page; otherwise responds with 402 JSON describing accepted payments.
- Depends on `@tanstack/react-start`, `viem`, `x402`, and `@solana/kit`.
- `routes` may be an object or async function; base64-encodes settlement metadata in `X-PAYMENT-RESPONSE`.
