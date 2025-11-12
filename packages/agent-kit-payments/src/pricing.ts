import type { Priceable, PaymentsConfig } from './types';

/**
 * Resolves the price for a priceable entity.
 */
export function resolvePrice(
  entity: Priceable,
  payments: PaymentsConfig | undefined,
  which: 'invoke' | 'stream'
): string | undefined {
  if (!entity.price) {
    return payments?.defaultPrice;
  } else if (typeof entity.price === 'string') {
    return entity.price;
  } else {
    return entity.price[which] ?? payments?.defaultPrice;
  }
}
