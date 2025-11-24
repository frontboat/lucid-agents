import type { Network } from 'x402/types';
import { z } from 'zod';

import type {
  AgentCardWithEntrypoints,
  ManifestRuntime,
  AgentMeta,
} from '../a2a';
import type {
  StreamPushEnvelope,
  StreamResult,
  AgentHttpHandlers,
} from '../http';
import type { EntrypointPrice, PaymentsRuntime } from '../payments';
import type {
  WalletsConfig,
  AgentWalletHandle,
  WalletsRuntime,
} from '../wallets';
import type { PaymentsConfig } from '../payments';
import type { A2ARuntime } from '../a2a';
import type { AP2Runtime } from '../ap2';

/**
 * Usage metrics for agent execution.
 */
export type Usage = {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
};

/**
 * Context provided to entrypoint handlers.
 */
export type AgentContext = {
  key: string;
  input: unknown;
  signal: AbortSignal;
  metadata?: Record<string, unknown>;
  runId?: string;
  runtime?: AgentRuntime;
};

/**
 * Error thrown when input or output validation fails.
 */
export class ZodValidationError extends Error {
  constructor(
    public readonly kind: 'input' | 'output',
    public readonly issues: z.ZodError['issues']
  ) {
    super(
      kind === 'input' ? 'Invalid input provided' : 'Invalid output produced'
    );
  }
}

/**
 * Handler function for non-streaming entrypoints.
 * Uses Omit to override the base AgentContext's input property with the typed input.
 */
export type EntrypointHandler<
  TInput extends z.ZodTypeAny | undefined = z.ZodTypeAny | undefined,
  TOutput extends z.ZodTypeAny | undefined = z.ZodTypeAny | undefined,
> = (
  ctx: Omit<AgentContext, 'input'> & {
    input: TInput extends z.ZodTypeAny ? z.infer<TInput> : unknown;
  }
) => Promise<{
  output: TOutput extends z.ZodTypeAny ? z.infer<TOutput> : unknown;
  usage?: Usage;
  model?: string;
}>;

/**
 * Handler function for streaming entrypoints.
 * Uses Omit to override the base AgentContext's input property with the typed input.
 *
 * Note: This type references HTTP-specific stream types (SSE envelopes). For protocol-agnostic entrypoints,
 * use EntrypointHandler instead.
 */
export type EntrypointStreamHandler<
  TInput extends z.ZodTypeAny | undefined = z.ZodTypeAny | undefined,
> = (
  ctx: Omit<AgentContext, 'input'> & {
    input: TInput extends z.ZodTypeAny ? z.infer<TInput> : unknown;
  },
  emit: (chunk: StreamPushEnvelope) => Promise<void> | void
) => Promise<StreamResult>;

/**
 * Definition of an agent entrypoint.
 */
export type EntrypointDef<
  TInput extends z.ZodTypeAny | undefined = z.ZodTypeAny | undefined,
  TOutput extends z.ZodTypeAny | undefined = z.ZodTypeAny | undefined,
> = {
  key: string;
  description?: string;
  input?: TInput;
  output?: TOutput;
  streaming?: boolean;
  price?: EntrypointPrice;
  network?: Network;
  handler?: EntrypointHandler<TInput, TOutput>;
  stream?: EntrypointStreamHandler<TInput>;
  metadata?: Record<string, unknown>;
};

/**
 * Configuration for the agent kit runtime.
 * Combines configuration blocks from various extensions (payments, wallets, etc.).
 */
export type AgentKitConfig = {
  payments?: PaymentsConfig;
  wallets?: WalletsConfig;
};

/**
 * Configuration for an agent instance, including metadata, payments, and wallets.
 */
export type AgentConfig = {
  meta: AgentMeta;
  payments?: PaymentsConfig | false;
  wallets?: {
    agent?: AgentWalletHandle;
    developer?: AgentWalletHandle;
  };
};

/**
 * Core agent interface providing entrypoint management.
 */
export type AgentCore = {
  readonly config: AgentConfig;
  addEntrypoint: (entrypoint: EntrypointDef) => void;
  listEntrypoints: () => EntrypointDef[];
};

/**
 * Entrypoints runtime type.
 * Returned by AgentRuntime.entrypoints.
 */
export type EntrypointsRuntime = {
  add: (def: EntrypointDef) => void;
  list: () => Array<{
    key: string;
    description?: string;
    streaming: boolean;
  }>;
  snapshot: () => EntrypointDef[];
};

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
  config: AgentKitConfig;
  wallets?: WalletsRuntime;
  payments?: PaymentsRuntime;
  a2a?: A2ARuntime;
  ap2?: AP2Runtime;
  handlers?: AgentHttpHandlers;
  entrypoints: EntrypointsRuntime;
  manifest: ManifestRuntime;
};

/**
 * Return type for adapter-specific `createAgentApp` functions.
 * Generic over the app type to support different frameworks (Hono, Express, etc.).
 *
 * The runtime, agent, and config types are inferred from the actual return value
 * of `createAgentHttpRuntime` to avoid circular dependencies.
 */
export type CreateAgentAppReturn<
  TApp = unknown,
  TRuntime = any,
  TAgent = any,
  TConfig = any,
> = {
  app: TApp;
  runtime: TRuntime;
  agent: TAgent;
  addEntrypoint: (def: EntrypointDef) => void;
  config: TConfig;
};

/**
 * Build context provided to extensions during build.
 */
export type BuildContext = {
  meta: AgentMeta;
  config: AgentKitConfig;
  runtime: Partial<AgentRuntime>;
};

/**
 * Extension interface. Each extension contributes a runtime slice.
 */
export interface Extension<R extends Record<string, unknown> = {}> {
  /**
   * Unique name of the extension (for debugging and conflict detection).
   */
  name: string;

  /**
   * Builds the extension's runtime slice.
   * Called during AgentBuilder.build() to construct the runtime.
   */
  build: (ctx: BuildContext) => R;

  /**
   * Optional hook called when an entrypoint is added to the runtime.
   * Useful for extensions that need to activate/enable themselves per entrypoint.
   */
  onEntrypointAdded?: (
    entrypoint: EntrypointDef,
    runtime: AgentRuntime
  ) => void;

  /**
   * Optional hook called after all extensions are built.
   * Useful for final setup that requires the complete runtime.
   * Can be async for initialization that requires async operations.
   */
  onBuild?: (runtime: AgentRuntime) => void | Promise<void>;

  /**
   * Optional hook called when building the manifest/agent card.
   * Can modify the card before it's returned.
   */
  onManifestBuild?: (
    card: AgentCardWithEntrypoints,
    runtime: AgentRuntime
  ) => AgentCardWithEntrypoints;
}

/**
 * Type utility to convert a union of types to an intersection.
 * Used for merging extension runtime types.
 *
 * @example
 * ```typescript
 * type A = { a: string };
 * type B = { b: number };
 * type Combined = UnionToIntersection<A | B>; // { a: string } & { b: number }
 * ```
 */
export type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

/**
 * Type utility to extract the runtime type from an array of extensions.
 * Merges all extension runtime slices into a single type.
 *
 * This is useful for type inference when using the extension system:
 *
 * @example
 * ```typescript
 * const payments = payments({ config });
 * const http = http();
 * type MyRuntime = AppRuntime<[typeof payments, typeof http]>;
 * ```
 */
export type AppRuntime<Es extends Extension[]> = UnionToIntersection<
  Es[number] extends Extension<infer R> ? R : never
>;
