import { NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { arbitrumSepolia } from "viem/chains";
import type { NoxVault } from "@/lib/nox-types";
import {
  CONFIDENTIAL_TOKENS,
  NOX_CONTRACTS,
  NOX_VAULTS,
} from "@/lib/nox-types";
import { NOX_YIELD_VAULT_ABI } from "@/lib/nox-vault-contract";

const client = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(),
});

function isZeroAddress(addr: string): boolean {
  return addr === "0x0000000000000000000000000000000000000000";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chainId = searchParams.get("chainId");
  const sortBy = searchParams.get("sortBy") as "apy" | "tvl" | null;
  const limit = searchParams.get("limit");

  let vaults: NoxVault[] = [];

  const entries: Array<{
    underlying: string;
    cToken: string;
    vault: string;
    token: (typeof CONFIDENTIAL_TOKENS)[421614][0];
    underlyingSymbol: string;
    underlyingPrice: string;
    underlyingLogo: string;
    underlyingDecimals: number;
    defaultApy: number;
    riskTier: "low" | "medium";
  }> = [
    {
      underlying: NOX_CONTRACTS.USDC,
      cToken: NOX_CONTRACTS.cUSDC,
      vault: NOX_VAULTS.cUSDC_VAULT,
      token: CONFIDENTIAL_TOKENS[421614][0],
      underlyingSymbol: "USDC",
      underlyingPrice: "1",
      underlyingLogo:
        "https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png",
      underlyingDecimals: 6,
      defaultApy: 5.7,
      riskTier: "low",
    },
    {
      underlying: NOX_CONTRACTS.RLC,
      cToken: NOX_CONTRACTS.cRLC,
      vault: NOX_VAULTS.cRLC_VAULT,
      token: CONFIDENTIAL_TOKENS[421614][1],
      underlyingSymbol: "RLC",
      underlyingPrice: "3.5",
      underlyingLogo: "/Assets/Images/Logo-Coin/rlc-logo.svg",
      underlyingDecimals: 9,
      defaultApy: 4.0,
      riskTier: "medium",
    },
  ];

  for (const entry of entries) {
    let tvlUsd = "0";
    let apy = entry.defaultApy;

    if (!isZeroAddress(entry.vault)) {
      try {
        const [totalAssets, , yieldAccumulated] = await Promise.all([
          client.readContract({
            address: entry.vault as `0x${string}`,
            abi: NOX_YIELD_VAULT_ABI,
            functionName: "totalAssets",
          }),
          client.readContract({
            address: entry.vault as `0x${string}`,
            abi: NOX_YIELD_VAULT_ABI,
            functionName: "totalSupply",
          }),
          client.readContract({
            address: entry.vault as `0x${string}`,
            abi: NOX_YIELD_VAULT_ABI,
            functionName: "yieldAccumulated",
          }),
        ]);

        const assets = totalAssets as bigint;
        const yieldAcc = yieldAccumulated as bigint;
        const price = Number.parseFloat(entry.underlyingPrice) || 0;
        tvlUsd = (
          (Number(assets) / 10 ** entry.underlyingDecimals) *
          price
        ).toFixed(2);

        if (assets > 0n && yieldAcc > 0n) {
          apy = Number((yieldAcc * 10000n) / assets) / 100;
        }
      } catch {
        apy = entry.defaultApy;
      }
    }

    vaults.push({
      address: entry.vault,
      chainId: 421614,
      name: `Confidential ${entry.underlyingSymbol} Vault`,
      protocol: "Nox Protocol",
      protocolLogo: entry.underlyingLogo,
      description: `Earn yield on confidential ${entry.underlyingSymbol} deposits with full privacy protection. Balances and amounts are encrypted on-chain via ERC-7984.`,
      underlyingToken: {
        address: entry.underlying,
        symbol: entry.underlyingSymbol,
        name: entry.underlyingSymbol === "USDC" ? "USD Coin" : "iExec RLC",
        decimals: entry.underlyingDecimals,
        logoURI: entry.underlyingLogo,
        priceUSD: entry.underlyingPrice,
        isConfidential: false,
      },
      apy: {
        base: Math.floor(apy * 0.8),
        reward: +(apy * 0.2).toFixed(1),
        total: +apy.toFixed(1),
      },
      tvl: {
        usd: tvlUsd,
      },
      isConfidential: true,
      riskTier: entry.riskTier,
      timeLock: 0,
    });
  }

  if (chainId) {
    vaults = vaults.filter((v) => v.chainId === parseInt(chainId, 10));
  }

  if (sortBy === "apy") {
    vaults.sort((a, b) => b.apy.total - a.apy.total);
  } else if (sortBy === "tvl") {
    vaults.sort(
      (a, b) => Number.parseFloat(b.tvl.usd) - Number.parseFloat(a.tvl.usd),
    );
  }

  const limitNum = limit ? parseInt(limit, 10) : vaults.length;
  const vaultSlice = vaults.slice(0, limitNum);

  return NextResponse.json({
    data: vaultSlice,
    nextCursor: null,
    total: vaultSlice.length,
  });
}
