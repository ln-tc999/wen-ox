"use client";

import type { NoxChain, NoxToken } from "./nox-types";
import { CONFIDENTIAL_TOKENS, SUPPORTED_NOX_CHAINS } from "./nox-types";

export type NoxMetaResponse = {
  chains: NoxChain[];
  tokens: Record<number, NoxToken[]>;
};

export async function fetchNoxMeta(
  signal?: AbortSignal,
): Promise<NoxMetaResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
  const response = await fetch(`${baseUrl}/api/nox/meta`, {
    signal,
    cache: "no-store",
    headers: { accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`nox_meta_failed_${response.status}`);
  }

  return (await response.json()) as NoxMetaResponse;
}

export function getSupportedChains(): NoxChain[] {
  return SUPPORTED_NOX_CHAINS;
}

export function getTokensForChain(chainId: number): NoxToken[] {
  return CONFIDENTIAL_TOKENS[chainId] ?? [];
}

export function findTokenByAddress(
  chainId: number,
  address: string,
): NoxToken | undefined {
  const tokens = getTokensForChain(chainId);
  return tokens.find((t) => t.address.toLowerCase() === address.toLowerCase());
}

export function findTokenBySymbol(
  chainId: number,
  symbol: string,
): NoxToken | undefined {
  const tokens = getTokensForChain(chainId);
  return tokens.find((t) => t.symbol.toLowerCase() === symbol.toLowerCase());
}

export function getChainById(chainId: number): NoxChain | undefined {
  return SUPPORTED_NOX_CHAINS.find((c) => c.id === chainId);
}

export function getRegularToConfidentialMapping(): Record<string, string> {
  return {
    USDC: "cUSDC",
    USDT: "cUSDT",
    WETH: "cWETH",
    WBTC: "cWBTC",
    DAI: "cDAI",
  };
}

export function getConfidentialToRegularMapping(): Record<string, string> {
  return {
    cUSDC: "USDC",
    cUSDT: "USDT",
    cWETH: "WETH",
    cWBTC: "WBTC",
    cDAI: "DAI",
  };
}

export function isConfidential(symbol: string): boolean {
  return symbol.startsWith("c");
}

export function getPrivacyBadge(riskTier?: "low" | "medium" | "high"): string {
  switch (riskTier) {
    case "low":
      return "Privacy: High";
    case "medium":
      return "Privacy: Medium";
    case "high":
      return "Privacy: Standard";
    default:
      return "Privacy: Enabled";
  }
}

export const CHAIN_EXPLORERS: Record<number, string> = {
  421614: "https://sepolia.arbiscan.io",
  42161: "https://arbiscan.io",
};

export function getExplorerUrl(chainId: number, address?: string): string {
  const base = CHAIN_EXPLORERS[chainId] ?? "https://arbiscan.io";
  if (address) {
    return `${base}/address/${address}`;
  }
  return base;
}

export function getExplorerTxUrl(chainId: number, txHash: string): string {
  const base = CHAIN_EXPLORERS[chainId] ?? "https://arbiscan.io";
  return `${base}/tx/${txHash}`;
}
