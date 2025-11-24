import {
  LocalEoaWalletConnector,
  type LocalEoaWalletConnectorOptions,
} from './local-eoa-connector';
import { createPrivateKeySigner } from './private-key-signer';
import {
  ServerOrchestratorWalletConnector,
  type ServerOrchestratorWalletConnectorOptions,
} from './server-orchestrator-connector';
import type {
  AgentWalletFactoryOptions,
  AgentWalletHandle,
  DeveloperWalletConfig,
  DeveloperWalletHandle,
  LocalWalletOptions,
  LucidWalletOptions,
  WalletConnector,
  WalletsConfig,
  WalletsRuntime,
} from '@lucid-agents/types/wallets';

export const createAgentWallet = (
  options: AgentWalletFactoryOptions
): AgentWalletHandle => {
  if (options.type === 'local') {
    return buildLocalWallet(options);
  }
  return buildLucidWallet(options);
};

const buildLocalWallet = (options: LocalWalletOptions): AgentWalletHandle => {
  const signer =
    options.signer ??
    (options.privateKey ? createPrivateKeySigner(options.privateKey) : null);

  if (!signer) {
    throw new Error(
      'Local wallet configuration requires either a signer or privateKey'
    );
  }

  const connector = new LocalEoaWalletConnector(
    resolveLocalConnectorOptions(options, signer)
  );

  return {
    kind: 'local',
    connector,
  };
};

/**
 * Creates a developer wallet handle.
 * Developer wallets are always local (private key-based) and do not support Lucid.
 */
export const createDeveloperWallet = (
  options: DeveloperWalletConfig
): DeveloperWalletHandle => {
  if (options.type !== 'local') {
    throw new Error('Developer wallets must be local (type: "local")');
  }

  const signer = options.privateKey
    ? createPrivateKeySigner(options.privateKey)
    : null;

  if (!signer) {
    throw new Error('Developer wallet configuration requires a privateKey');
  }

  const connector = new LocalEoaWalletConnector(
    resolveLocalConnectorOptions(options, signer)
  );

  return {
    kind: 'local',
    connector,
  };
};

const resolveLocalConnectorOptions = (
  options: LocalWalletOptions,
  signer: LocalEoaWalletConnectorOptions['signer']
): LocalEoaWalletConnectorOptions => ({
  signer,
  address: options.address ?? null,
  caip2: options.caip2 ?? null,
  chain: options.chain ?? null,
  chainType: options.chainType ?? null,
  provider: options.provider ?? (options.privateKey ? 'local' : undefined),
  label: options.label ?? null,
});

const buildLucidWallet = (options: LucidWalletOptions): AgentWalletHandle => {
  const connector = new ServerOrchestratorWalletConnector(
    resolveLucidConnectorOptions(options)
  );

  return {
    kind: 'lucid',
    connector,
    setAccessToken: token => connector.setAccessToken(token),
  };
};

const resolveLucidConnectorOptions = (
  options: LucidWalletOptions
): ServerOrchestratorWalletConnectorOptions => ({
  baseUrl: options.baseUrl,
  agentRef: options.agentRef,
  fetch: options.fetch,
  headers: options.headers,
  accessToken: options.accessToken ?? null,
  authorizationContext: options.authorizationContext,
});

export function createWalletsRuntime(
  config: WalletsConfig | undefined
): WalletsRuntime {
  if (!config) {
    return undefined;
  }

  return {
    agent: config.agent ? createAgentWallet(config.agent) : undefined,
    developer: config.developer
      ? createDeveloperWallet(config.developer)
      : undefined,
  };
}
