---
'@lucid-agents/express': minor
'@lucid-agents/cli': minor
'@lucid-agents/core': patch
---

Add a first-class Express adapter powered by `@lucid-agents/express`, including x402-express paywalling, request/response bridges, and a smoke test. Expose the new adapter through `@lucid-agents/cli` with scaffolding assets, template support, and updated CLI/documentation so projects can be generated with `--adapter=express`.

Stop enabling streaming by default in `createAxLLMClient` so generated AxLLM clients only opt into streaming when explicitly requested via overrides.
