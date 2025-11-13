import type { Network } from 'x402/types';
import type { EntrypointDef, PaymentsConfig } from '@lucid-agents/types';
import { resolvePrice } from './pricing';

export type PaymentRequirement =
  | { required: false }
  | {
      required: true;
      payTo: string;
      price: string;
      network: Network;
      facilitatorUrl?: string;
    };

export const resolvePaymentRequirement = (
  entrypoint: EntrypointDef,
  kind: 'invoke' | 'stream',
  payments?: PaymentsConfig
): PaymentRequirement => {
  if (!payments) {
    return { required: false };
  }

  const network = entrypoint.network ?? payments.network;
  if (!network) {
    return { required: false };
  }

  const price = resolvePrice(entrypoint, payments, kind);
  if (!price) {
    return { required: false };
  }

  return {
    required: true,
    payTo: payments.payTo,
    price,
    network,
    facilitatorUrl: payments.facilitatorUrl,
  };
};

export const paymentRequiredResponse = (
  requirement: Extract<PaymentRequirement, { required: true }>
) => {
  const headers = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'X-Price': requirement.price,
    'X-Network': requirement.network,
    'X-Pay-To': requirement.payTo,
  });
  if (requirement.facilitatorUrl) {
    headers.set('X-Facilitator', requirement.facilitatorUrl);
  }
  return new Response(
    JSON.stringify({
      error: {
        code: 'payment_required',
        price: requirement.price,
        network: requirement.network,
        payTo: requirement.payTo,
      },
    }),
    {
      status: 402,
      headers,
    }
  );
};
