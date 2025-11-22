# Lucid Agents Package Docs

Light overviews per package live in this folder. Start with the architecture map in `docs/ARCHITECTURE.md`, then dive into packages as needed.

Packages (top-down):
- Foundation: `types.md` (shared schemas), `wallet.md` (wallet runtime).
- Extensions: `identity.md` (ERC-8004), `payments.md` (x402), `a2a.md` (A2A protocol), `ap2.md` (AP2 metadata).
- Runtime: `core.md` (agent runtime + HTTP handlers).
- Adapters: `hono.md`, `tanstack.md`, `express.md`, `x402-tanstack-start.md`.
- Dev tools: `cli.md` (scaffolding tool), `eslint-config.md`, `prettier-config.md`.

Notes / next docs iteration:
- Add usage snippets per adapter tied to current templates.
- Capture env var matrix for identity/payments/wallets.
- Link tests/examples once stabilized (e.g., CLI templates, sample agents).
- Add notes for shared tsconfig/tsup bases if needed by consumers.
