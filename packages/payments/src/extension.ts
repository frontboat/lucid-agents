import type {
  AgentRuntime,
  BuildContext,
  EntrypointDef,
  Extension,
} from '@lucid-agents/types/core';
import type { AgentCardWithEntrypoints } from '@lucid-agents/types/a2a';
import type {
  PaymentsConfig,
  PaymentsRuntime,
} from '@lucid-agents/types/payments';

import { createAgentCardWithPayments } from './manifest';
import { createPaymentsRuntime, entrypointHasExplicitPrice } from './payments';

export function payments(options?: {
  config?: PaymentsConfig | false;
}): Extension<{ payments?: PaymentsRuntime }> {
  let paymentsRuntime: PaymentsRuntime | undefined;

  return {
    name: 'payments',
    build(ctx: BuildContext): { payments?: PaymentsRuntime } {
      paymentsRuntime = createPaymentsRuntime(options?.config);
      return { payments: paymentsRuntime };
    },
    onEntrypointAdded(entrypoint: EntrypointDef, runtime: AgentRuntime) {
      if (
        paymentsRuntime &&
        !paymentsRuntime.isActive &&
        paymentsRuntime.config
      ) {
        if (entrypointHasExplicitPrice(entrypoint)) {
          paymentsRuntime.activate(entrypoint);
        }
      }
    },
    onManifestBuild(
      card: AgentCardWithEntrypoints,
      runtime: AgentRuntime
    ): AgentCardWithEntrypoints {
      if (paymentsRuntime?.config) {
        return createAgentCardWithPayments(
          card,
          paymentsRuntime.config,
          runtime.entrypoints.snapshot()
        );
      }
      return card;
    },
  };
}
