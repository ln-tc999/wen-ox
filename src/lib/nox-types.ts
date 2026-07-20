import type { HandleClient } from "@iexec-nox/handle";

export type { HandleClient };

export type NoxVault = {
  address: string;
  chainId: number;
  name: string;
  protocol: string;
  protocolLogo?: string;
  description?: string;
  underlyingToken: NoxToken;
  apy: {
    base: number | null;
    reward: number | null;
    total: number;
  };
  apy1d?: number | null;
  apy7d?: number | null;
  apy30d?: number | null;
  tvl: {
    usd: string;
    native?: string;
  };
  caps?: {
    totalCap?: string;
    maxCap?: string;
  };
  timeLock?: number;
  isConfidential: true;
  riskTier?: "low" | "medium" | "high";
};

export type NoxToken = {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  priceUSD?: string;
  isConfidential: boolean;
};

export type NoxChain = {
  id: number;
  name: string;
  shortName: string;
  logoURI?: string;
  rpcUrl?: string;
  explorerUrl?: string;
  isConfidentialSupported: boolean;
};

export type NoxVaultsResponse = {
  data: NoxVault[];
  nextCursor: string | null;
  total: number;
};

export type FetchVaultsParams = {
  chainId?: number;
  tokenAddress?: string;
  protocol?: string;
  minTvlUsd?: number;
  sortBy?: "apy" | "tvl";
  limit?: number;
  cursor?: string;
};

export type NoxQuote = {
  vaultAddress: string;
  tokenIn: NoxToken;
  tokenOut: NoxToken;
  amountIn: string;
  amountOut: string;
  estimatedYield: string;
  fee: string;
  steps: NoxQuoteStep[];
  isConfidential: true;
};

export type NoxQuoteStep = {
  type: "wrap" | "deposit" | "approve" | "unwrap" | "withdraw";
  token: NoxToken;
  amount: string;
  contractAddress?: string;
  spender?: string;
};

export type NoxPortfolio = {
  chainId: number;
  vaultAddress: string;
  vaultName: string;
  protocol: string;
  token: NoxToken;
  balance: string;
  balanceUSD: string;
  apy: number;
  isConfidential: true;
  decryptedBalance?: string;
};

export interface NoxHandleClient {
  client: HandleClient;
  encryptAmount: (
    amount: bigint,
    tokenType: string,
    contractAddress: string,
  ) => Promise<{
    handle: string;
    handleProof: string;
  }>;
  decryptBalance: (handle: string) => Promise<{
    value: bigint;
    decrypted: boolean;
  }>;
}

export const SUPPORTED_NOX_CHAINS: NoxChain[] = [
  {
    id: 421614,
    name: "Arbitrum Sepolia",
    shortName: "Arb Sepolia",
    logoURI: "/Assets/Images/Logo-Coin/arb-logo.svg",
    isConfidentialSupported: true,
  },
  {
    id: 42161,
    name: "Arbitrum One",
    shortName: "Arbitrum",
    logoURI: "/Assets/Images/Logo-Coin/arb-logo.svg",
    isConfidentialSupported: true,
  },
];

// Real deployed contracts on Arbitrum Sepolia (421614)
// Source: https://github.com/iExec-Nox/demo-ctoken/blob/main/lib/contracts.ts
export const NOX_CONTRACTS = {
  USDC: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
  cUSDC: "0x1ccec6bc60db15e4055d43dc2531bb7d4e5b808e",
  RLC: "0x9923eD3cbd90CD78b910c475f9A731A6e0b8C963",
  cRLC: "0x92b23f4a59175415ced5cb37e64a1fc6a9d79af4",
  NOX_COMPUTE: "0xd464B198f06756a1d00be223634b85E0a731c229",
} as const;

export const NOX_VAULTS = {
  cUSDC_VAULT: "0x75ef70Ea33994a16751ff0b4f7DCF0F94DF1351F",
  cRLC_VAULT: "0x1955eF9145cCAa643a8Ee61aE3206F0acb632Adf",
} as const;

export function getVaultForToken(tokenAddress: string): `0x${string}` {
  const lower = tokenAddress.toLowerCase();
  if (lower === NOX_CONTRACTS.cUSDC.toLowerCase())
    return NOX_VAULTS.cUSDC_VAULT;
  if (lower === NOX_CONTRACTS.cRLC.toLowerCase()) return NOX_VAULTS.cRLC_VAULT;
  return "0x0000000000000000000000000000000000000000";
}

export function getUnderlyingForToken(tokenAddress: string): `0x${string}` {
  const lower = tokenAddress.toLowerCase();
  if (lower === NOX_CONTRACTS.cUSDC.toLowerCase()) return NOX_CONTRACTS.USDC;
  if (lower === NOX_CONTRACTS.cRLC.toLowerCase()) return NOX_CONTRACTS.RLC;
  return "0x0000000000000000000000000000000000000000";
}

export const CONFIDENTIAL_TOKENS: Record<number, NoxToken[]> = {
  421614: [
    {
      address: NOX_CONTRACTS.cUSDC,
      symbol: "cUSDC",
      name: "Confidential USDC",
      decimals: 6,
      logoURI:
        "https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png",
      priceUSD: "1",
      isConfidential: true,
    },
    {
      address: NOX_CONTRACTS.cRLC,
      symbol: "cRLC",
      name: "Confidential RLC",
      decimals: 9,
      logoURI: "/Assets/Images/Logo-Coin/rlc-logo.svg",
      priceUSD: "3.5",
      isConfidential: true,
    },
  ],
  42161: [],
};

export function isConfidentialToken(symbol: string): boolean {
  return symbol.startsWith("c");
}

export function getRegularTokenSymbol(confidentialSymbol: string): string {
  return confidentialSymbol.replace("c", "");
}
