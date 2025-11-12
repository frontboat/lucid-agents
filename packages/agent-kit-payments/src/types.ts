import type { Network, Resource } from 'x402/types';

export type SolanaAddress = string;

/**
 * Payment configuration for x402 protocol.
 * Supports both EVM (0x...) and Solana (base58) addresses.
 */
export type PaymentsConfig = {
  payTo: `0x${string}` | SolanaAddress;
  facilitatorUrl: Resource;
  network: Network;
  defaultPrice?: string;
};

export type EntrypointPrice = string | { invoke?: string; stream?: string };

/**
 * Minimal interface for entities that can be priced.
 * EntrypointDef from agent-kit satisfies this interface.
 */
export interface Priceable {
  price?: EntrypointPrice;
  network?: Network;
}
