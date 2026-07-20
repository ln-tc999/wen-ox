import { NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { arbitrumSepolia } from "viem/chains";
import type { NoxPortfolio } from "@/lib/nox-types";
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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ address: string }> },
) {
  const { address } = await params;

  if (!address || address === "undefined" || address === "null") {
    return NextResponse.json({ data: [], total: 0 });
  }

  const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(address);
  if (!isValidAddress) {
    return NextResponse.json({ data: [], total: 0 });
  }

  const userAddress = address as `0x${string}`;
  const portfolio: NoxPortfolio[] = [];

  const vaultEntries: Array<{
    cToken: string;
    vault: string;
    token: (typeof CONFIDENTIAL_TOKENS)[421614][0];
    underlyingSymbol: string;
    underlyingPrice: string;
  }> = [
    {
      cToken: NOX_CONTRACTS.cUSDC,
      vault: NOX_VAULTS.cUSDC_VAULT,
      token: CONFIDENTIAL_TOKENS[421614][0],
      underlyingSymbol: "USDC",
      underlyingPrice: "1",
    },
    {
      cToken: NOX_CONTRACTS.cRLC,
      vault: NOX_VAULTS.cRLC_VAULT,
      token: CONFIDENTIAL_TOKENS[421614][1],
      underlyingSymbol: "RLC",
      underlyingPrice: "3.5",
    },
  ];

  for (const entry of vaultEntries) {
    if (isZeroAddress(entry.vault)) continue;

    try {
      const [shareBalance, totalSupply, totalAssets] = await Promise.all([
        client.readContract({
          address: entry.vault as `0x${string}`,
          abi: NOX_YIELD_VAULT_ABI,
          functionName: "balanceOf",
          args: [userAddress],
        }),
        client.readContract({
          address: entry.vault as `0x${string}`,
          abi: NOX_YIELD_VAULT_ABI,
          functionName: "totalSupply",
        }),
        client.readContract({
          address: entry.vault as `0x${string}`,
          abi: NOX_YIELD_VAULT_ABI,
          functionName: "totalAssets",
        }),
      ]);

      const shares = shareBalance as bigint;
      if (shares === 0n) continue;

      const supply = totalSupply as bigint;
      const assets = totalAssets as bigint;
      const tokenBalance = supply > 0n ? (shares * assets) / supply : 0n;
      const decimals = entry.token.decimals;
      const balanceStr = tokenBalance.toString();
      const price = Number.parseFloat(entry.underlyingPrice) || 0;
      const balanceUSD = (
        (Number(tokenBalance) / 10 ** decimals) *
        price
      ).toFixed(6);

      portfolio.push({
        chainId: 421614,
        vaultAddress: entry.vault,
        vaultName: `Confidential ${entry.underlyingSymbol} Vault`,
        protocol: "Nox Protocol",
        token: {
          address: entry.cToken,
          symbol: entry.token.symbol,
          name: entry.token.name,
          decimals: entry.token.decimals,
          logoURI: entry.token.logoURI,
          priceUSD: entry.underlyingPrice,
          isConfidential: true,
        },
        balance: balanceStr,
        balanceUSD,
        apy: 0,
        isConfidential: true,
        decryptedBalance: tokenBalance.toString(),
      });
    } catch {
      portfolio.push({
        chainId: 421614,
        vaultAddress: entry.vault,
        vaultName: `Confidential ${entry.underlyingSymbol} Vault`,
        protocol: "Nox Protocol",
        token: {
          address: entry.cToken,
          symbol: entry.token.symbol,
          name: entry.token.name,
          decimals: entry.token.decimals,
          logoURI: entry.token.logoURI,
          priceUSD: entry.underlyingPrice,
          isConfidential: true,
        },
        balance: "0",
        balanceUSD: "0",
        apy: 0,
        isConfidential: true,
      });
    }
  }

  return NextResponse.json({
    data: portfolio,
    total: portfolio.length,
  });
}
