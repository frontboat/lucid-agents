import type { ManifestRuntime } from '../a2a';
import type { AgentHttpHandlers } from '../http';
import type { PaymentsRuntime } from '../payments';
import type { WalletsRuntime } from '../wallets';
import type { A2ARuntime } from '../a2a';
import type { AP2Runtime } from '../ap2';
import type { EntrypointsRuntime } from './entrypoint';

/**
 * Agent runtime interface.
 * This type is defined in the types package to avoid circular dependencies
 * between @lucid-agents/core and @lucid-agents/payments.
 *
 * The actual implementation is in @lucid-agents/core.
 */
export type AgentRuntime = {
  /**
   * Agent core instance. The actual type is AgentCore from @lucid-agents/core.
   * Using `any` here to avoid circular dependency - the type will be properly
   * inferred when used with the actual runtime implementation.
   */
  agent: any;
  wallets?: WalletsRuntime;
  payments?: PaymentsRuntime;
  a2a?: A2ARuntime;
  ap2?: AP2Runtime;
  handlers?: AgentHttpHandlers;
  entrypoints: EntrypointsRuntime;
  manifest: ManifestRuntime;
};

