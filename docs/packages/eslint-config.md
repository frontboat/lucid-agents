# @lucid-agents/eslint-config

Purpose: shared ESLint preset for all Lucid Agents packages (TypeScript + import sorting + Prettier).

Usage:
- Install dev dep in a package: `bun add -D @lucid-agents/eslint-config`.
- Add `.eslintrc.cjs`:
  ```js
  module.exports = {
    extends: ['@lucid-agents/eslint-config'],
    env: { node: true, es2022: true },
  };
  ```
- Scripts: `lint` / `lint:fix` → `eslint src --ext .ts` / `--fix`.

What's inside:
- Typescript-eslint recommended rules, `simple-import-sort`, `unused-imports`, `eslint-plugin-import`, Prettier compatibility.
- Warns on unused vars (`_`-prefixed ignored), prefers `const`, disallows `var`.

Notes:
- Example configs live in `packages/eslint-config/.eslintrc.cjs.example`.
- Used by `just lint-check <pkg>` / `just lint-fix <pkg>` in the repo.
