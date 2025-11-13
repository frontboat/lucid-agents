import type { EntrypointDef, PaymentsConfig } from '@lucid-agents/types';

/**
 * Resolves the price for an entrypoint.
 */
export function resolvePrice(
  entrypoint: EntrypointDef,
  payments: PaymentsConfig | undefined,
  which: 'invoke' | 'stream'
): string | undefined {
  if (!entrypoint.price) {
    return payments?.defaultPrice;
  } else if (typeof entrypoint.price === 'string') {
    return entrypoint.price;
  } else {
    return entrypoint.price[which] ?? payments?.defaultPrice;
  }
}
