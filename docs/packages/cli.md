# @lucid-agents/cli

Purpose: Project scaffolding tool (`create-agent-kit`) for generating Bun-based agent apps using `@lucid-agents/core`.

What it does:
- Interactive wizard to choose template, package manager, and optional features (payments/AP2, identity).
- Templates (`packages/cli/templates`): `blank`, `axllm`, `axllm-flow`, `identity`, `trading-data-agent`, `trading-recommendation-agent` (payments-ready).
- Framework adapters: `hono`, `express`, `tanstack-ui` (Start + dashboard), `tanstack-headless` (Start API-only), `next` (App Router shell). See `packages/cli/adapters/*` for wiring.

Usage:
- Run via `bunx create-agent-kit` or `npx @lucid-agents/cli` (binary name `create-agent-kit`).
- Flags: `--template`, `--adapter`, `--install/--no-install`, `--wizard=no`/`--non-interactive`, `--network=base|base-sepolia|solana|solana-devnet` (maps to `PAYMENTS_NETWORK`), and `--KEY=value` to inject template args in non-interactive mode.
- Prompts for project name, template, adapter, payments network/address, and template-specific settings; outputs ready-to-run agent app with instructions (`bun dev`/`bun start`).

Notes:
- Built with `tsup`; tests under `packages/cli/tests`.
- Uses workspace ESLint/Prettier configs; requires Bun/Node >=18. Templates surface Base/Solana payment choices; the payments package itself supports the full x402 network list. Identity template uses EVM for identity while payments can be Solana or EVM.
