import { NextResponse } from "next/server";
import type { NoxChain, NoxToken } from "@/lib/nox-types";
import { NOX_CONTRACTS } from "@/lib/nox-types";

const SUPPORTED_CHAINS: NoxChain[] = [
  {
    id: 421614,
    name: "Arbitrum Sepolia",
    shortName: "Arb Sepolia",
    logoURI: "/Assets/Images/Logo-Coin/arb-logo.svg",
    rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
    explorerUrl: "https://sepolia.arbiscan.io",
    isConfidentialSupported: true,
  },
];

const CONFIDENTIAL_TOKENS: Record<number, NoxToken[]> = {
  421614: [
    {
      address: NOX_CONTRACTS.USDC,
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
      logoURI:
        "https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png",
      priceUSD: "1",
      isConfidential: false,
    },
    {
      address: NOX_CONTRACTS.RLC,
      symbol: "RLC",
      name: "iExec RLC",
      decimals: 9,
      logoURI: "/Assets/Images/Logo-Coin/rlc-logo.svg",
      priceUSD: "3.5",
      isConfidential: false,
    },
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
};

export async function GET() {
  return NextResponse.json({
    chains: SUPPORTED_CHAINS,
    tokens: CONFIDENTIAL_TOKENS,
  });
}
