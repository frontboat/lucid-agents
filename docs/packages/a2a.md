# @lucid-agents/a2a

Purpose: Agent-to-Agent (A2A) protocol utilities: build/parse agent cards, fetch peer cards, and invoke/stream entrypoints between agents.

What it provides:
- Card helpers: `buildAgentCard` (base card from meta + entrypoints), `parseAgentCard`, `fetchAgentCard`, `findSkill`. Cards include entrypoint schemas but exclude payments/identity/AP2 extensions (added by other packages).
- Client helpers: `invokeAgent`, `streamAgent` (SSE), `fetchAndInvoke`.
- Runtime: `createA2ARuntime(runtime)` (always returns a runtime; no config gate) wraps an `AgentRuntime` to expose `buildCard(origin)`, `fetchCard(baseUrl)`, and `client` methods above; used by `@lucid-agents/core` when emitting manifests.

Usage:
```ts
import { createA2ARuntime } from '@lucid-agents/a2a';

const a2a = createA2ARuntime(runtime); // runtime from @lucid-agents/core
const card = a2a.buildCard('https://agent.example.com');

const res = await a2a.client.invoke(card, 'echo', { text: 'hi' });
await a2a.client.stream(card, 'chat', { text: 'hello' }, async evt => {
  console.log(evt.type, evt.data);
});
```

Notes:
- Depends on `@lucid-agents/types` and `zod` (for schema-to-JSON conversion).
- `buildAgentCard` infers `streaming` capability from entrypoints, sets default modes (`application/json` input; `application/json` + `text/plain` output), sets `supportsAuthenticatedExtendedCard=false`, and ensures `url` ends with a slash. It intentionally omits payments/identity/AP2; those are layered by other packages.
- `fetchAgentCard` fetches `/.well-known/agent-card.json`; `parseAgentCard` is permissive and passes through payments/trust/registrations fields if present.
- `streamAgent` parses SSE events and emits `{ type, data }` to the provided handler; JSON parse failures fall back to raw string data.
- Example: `packages/a2a/examples/full-integration.ts` shows three-agent composition (client → facilitator → worker); requires Bun to run (`bun run examples/full-integration.ts`).
