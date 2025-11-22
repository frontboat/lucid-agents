# @lucid-agents/prettier-config

Purpose: shared Prettier ruleset (80 cols, 2 spaces, single quotes, semicolons) used across the monorepo.

Usage:
- Install dev dep: `bun add -D @lucid-agents/prettier-config`.
- Create `.prettierrc.cjs` or `prettier.config.js`:
  ```js
  module.exports = require('@lucid-agents/prettier-config');
  ```
- Add scripts: `"format": "prettier --write ."`, `"format:check": "prettier --check ."`.
- Copy `.prettierignore` example from `packages/prettier-config/.prettierignore.example` and tailor (ignore `dist/`, `build/`, `*.tsbuildinfo`, templates, generated code).

Rules snapshot:
- `semi: true`, `singleQuote: true`, `trailingComma: 'es5'`, `printWidth: 80`, `tabWidth: 2`, `endOfLine: 'lf'`, `arrowParens: 'avoid'`, `proseWrap: 'preserve'`.

Notes:
- Root `prettier.config.js` already imports this package; individual packages inherit automatically unless they override.
