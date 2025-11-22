# @lucid-agents/ap2

Purpose: AP2 (Agent Payments Protocol) helpers to describe agent payment roles in Agent Cards.

What it provides:
- `createAP2Runtime(config?)` – wraps AP2 config into a runtime object (or `undefined` when not configured); used by core.
- `createAgentCardWithAP2(card, ap2Config)` – adds AP2 extension into `capabilities.extensions` using the canonical AP2 URI.
- Constants/types: `AP2_EXTENSION_URI`, `AP2Role` (`'merchant' | 'shopper' | 'credentials-provider' | 'payment-processor'`), `AP2Config`, `AP2ExtensionParams`, `AP2ExtensionDescriptor`.

Usage:
```ts
import { createAgentCardWithAP2 } from '@lucid-agents/ap2';

const ap2Config = { roles: ['merchant', 'payment-processor'] };
const cardWithAP2 = createAgentCardWithAP2(agentCard, ap2Config);
```

Notes:
- No roles → no-op (card is returned unchanged). At least one role is required to add the extension; description defaults to `"Agent Payments Protocol (AP2)"` if not provided.
- The AP2 extension is marked `required` when `required` is truthy OR when any role is `merchant`; override via `ap2Config.required`.
- Card augmentation is additive/immutable; existing extensions are preserved (AP2 previous entries are deduped).
- Depends on `@lucid-agents/types`; built with `tsup`.
