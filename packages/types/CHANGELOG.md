# @lucid-agents/types

## 1.1.0

### Minor Changes

- 8a3ed70: Simplify package names and introduce types package

  **Package Renames:**
  - `@lucid-agents/agent-kit` → `@lucid-agents/core`
  - `@lucid-agents/agent-kit-identity` → `@lucid-agents/identity`
  - `@lucid-agents/agent-kit-payments` → `@lucid-agents/payments`
  - `@lucid-agents/agent-kit-hono` → `@lucid-agents/hono`
  - `@lucid-agents/agent-kit-tanstack` → `@lucid-agents/tanstack`
  - `@lucid-agents/create-agent-kit` → `@lucid-agents/cli`

  **New Package:**
  - `@lucid-agents/types` - Shared type definitions with zero circular dependencies

  **Architecture Improvements:**
  - Zero circular dependencies (pure DAG via types package)
  - Explicit type contracts - all shared types in @lucid-agents/types
  - Better IDE support and type inference
  - Cleaner package naming without redundant "agent-kit" prefix
  - Standardized TypeScript configuration across all packages
  - Consistent type-checking for all published packages

  **Migration:**

  Update your imports:

  ```typescript
  // Before
  import { createAgentApp } from '@lucid-agents/agent-kit-hono';
  import type { EntrypointDef } from '@lucid-agents/agent-kit';
  import type { PaymentsConfig } from '@lucid-agents/agent-kit-payments';
  import { createAgentIdentity } from '@lucid-agents/agent-kit-identity';

  // After
  import { createAgentApp } from '@lucid-agents/hono';
  import type { EntrypointDef, PaymentsConfig } from '@lucid-agents/types';
  import { createAgentIdentity } from '@lucid-agents/identity';
  ```

  Update CLI usage:

  ```bash
  # Before
  bunx @lucid-agents/create-agent-kit my-agent

  # After
  bunx @lucid-agents/cli my-agent
  # or
  bunx create-agent-kit my-agent
  ```

  **TypeScript Configuration:**

  All published packages now:
  - Extend a shared base TypeScript configuration for consistency
  - Include `type-check` script for CI validation
  - Use simplified type-check command (`tsc -p tsconfig.json --noEmit`)

  **Note:** Old package names will be deprecated via npm after this release.
