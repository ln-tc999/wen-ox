"use client";

import { createWalletClient, custom, erc20Abi } from "viem";
import { arbitrumSepolia } from "viem/chains";
import type { Config } from "wagmi";
import type { NoxQuote, NoxQuoteStep, NoxToken } from "./nox-types";

export type QuoteParams = {
  vaultAddress: string;
  tokenIn: NoxToken;
  amountIn: string;
  isWrapping?: boolean;
};

export async function fetchQuote(
  params: QuoteParams,
  signal?: AbortSignal,
): Promise<NoxQuote> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
  const url = new URL("/api/nox/quote", baseUrl);
  url.searchParams.set("vaultAddress", params.vaultAddress);
  url.searchParams.set("tokenIn", params.tokenIn.address);
  url.searchParams.set("amountIn", params.amountIn);
  if (params.isWrapping) {
    url.searchParams.set("isWrapping", "true");
  }

  const response = await fetch(url.toString(), {
    signal,
    cache: "no-store",
    headers: { accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`quote_failed_${response.status}`);
  }

  return (await response.json()) as NoxQuote;
}

export async function executeDeposit(
  config: Config,
  quote: NoxQuote,
  account: `0x${string}`,
): Promise<{ hash: string }> {
  const walletClient = createWalletClient({
    account,
    chain: arbitrumSepolia,
    transport: custom(window.ethereum),
  });

  const steps = quote.steps;
  const hashes: string[] = [];

  for (const step of steps) {
    if (step.type === "approve") {
      const hash = await walletClient.writeContract({
        address: step.token.address as `0x${string}`,
        abi: erc20Abi,
        functionName: "approve",
        args: [step.spender as `0x${string}`, BigInt(step.amount)],
      });
      hashes.push(hash);
    } else if (step.type === "deposit" && step.contractAddress) {
      const hash = await walletClient.writeContract({
        address: step.contractAddress as `0x${string}`,
        abi: [
          {
            name: "deposit",
            type: "function",
            inputs: [],
            outputs: [],
            stateMutability: "payable",
          },
          {
            name: "deposit",
            type: "function",
            inputs: [
              {
                name: "handle",
                type: "bytes32",
              },
              {
                name: "handleProof",
                type: "bytes",
              },
            ],
            outputs: [],
            stateMutability: "payable",
          },
        ],
        functionName: "deposit",
        value: step.token.symbol === "ETH" ? BigInt(step.amount) : undefined,
      });
      hashes.push(hash);
    }
  }

  return { hash: hashes[hashes.length - 1] ?? "0x0" };
}

export function buildQuoteSteps(
  tokenIn: NoxToken,
  amountIn: string,
  isWrapping: boolean,
): NoxQuoteStep[] {
  const steps: NoxQuoteStep[] = [];

  if (isWrapping) {
    steps.push({
      type: "wrap",
      token: tokenIn,
      amount: amountIn,
      contractAddress: tokenIn.address,
    });
  }

  steps.push({
    type: "deposit",
    token: tokenIn,
    amount: amountIn,
  });

  return steps;
}

export function estimateOutputAmount(
  quote: NoxQuote,
  tokenOut: NoxToken,
): string {
  const depositStep = quote.steps.find((s) => s.type === "deposit");
  if (!depositStep) return "0";

  const amountIn = BigInt(depositStep.amount);
  const yieldRate = parseFloat(quote.estimatedYield) / 100;
  const outputAmount = amountIn * BigInt(Math.floor(10000 * (1 + yieldRate)));

  return outputAmount.toString();
}

export function getQuoteSummary(quote: NoxQuote): string {
  const depositStep = quote.steps.find((s) => s.type === "deposit");
  if (!depositStep) return "No deposit step";

  const steps = quote.steps.map((s) => s.type);
  const uniqueSteps = [...new Set(steps)];

  if (uniqueSteps.includes("wrap")) {
    return `Wrap → Deposit confidential tokens`;
  }
  return `Deposit confidential tokens`;
}
