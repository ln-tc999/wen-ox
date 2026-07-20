import { NextResponse } from "next/server";
import type { NoxQuote, NoxQuoteStep } from "@/lib/nox-types";
import { NOX_CONTRACTS } from "@/lib/nox-types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const vaultAddress = searchParams.get("vaultAddress");
  const tokenIn = searchParams.get("tokenIn");
  const amountIn = searchParams.get("amountIn");

  if (!vaultAddress || !tokenIn || !amountIn) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 },
    );
  }

  try {
    BigInt(amountIn);
  } catch {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const isUSDC = tokenIn.toLowerCase() === NOX_CONTRACTS.USDC.toLowerCase();
  const isRLC = tokenIn.toLowerCase() === NOX_CONTRACTS.RLC.toLowerCase();
  const iscToken =
    tokenIn.toLowerCase() === NOX_CONTRACTS.cUSDC.toLowerCase() ||
    tokenIn.toLowerCase() === NOX_CONTRACTS.cRLC.toLowerCase();

  if (!isUSDC && !isRLC && !iscToken) {
    return NextResponse.json(
      {
        error:
          "Unsupported token. Only USDC, RLC, cUSDC, cRLC are supported on Arbitrum Sepolia.",
      },
      { status: 400 },
    );
  }

  const steps: NoxQuoteStep[] = [];

  if (isUSDC || isRLC) {
    steps.push({
      type: "approve",
      token: {
        address: tokenIn,
        symbol: isUSDC ? "USDC" : "RLC",
        name: isUSDC ? "USD Coin" : "iExec RLC",
        decimals: isUSDC ? 6 : 9,
        isConfidential: false,
      },
      amount: amountIn,
      spender: vaultAddress,
    });

    steps.push({
      type: "wrap",
      token: {
        address: vaultAddress,
        symbol: isUSDC ? "cUSDC" : "cRLC",
        name: isUSDC ? "Confidential USDC" : "Confidential RLC",
        decimals: isUSDC ? 6 : 9,
        isConfidential: true,
      },
      amount: amountIn,
      contractAddress: vaultAddress,
    });
  } else {
    steps.push({
      type: "approve",
      token: {
        address: tokenIn,
        symbol: iscToken
          ? tokenIn.toLowerCase() === NOX_CONTRACTS.cUSDC.toLowerCase()
            ? "cUSDC"
            : "cRLC"
          : tokenIn,
        name: iscToken
          ? tokenIn.toLowerCase() === NOX_CONTRACTS.cUSDC.toLowerCase()
            ? "Confidential USDC"
            : "Confidential RLC"
          : tokenIn,
        decimals: isUSDC ? 6 : 9,
        isConfidential: true,
      },
      amount: amountIn,
      spender: vaultAddress,
    });

    steps.push({
      type: "deposit",
      token: {
        address: tokenIn,
        symbol: iscToken
          ? tokenIn.toLowerCase() === NOX_CONTRACTS.cUSDC.toLowerCase()
            ? "cUSDC"
            : "cRLC"
          : tokenIn,
        name: iscToken
          ? tokenIn.toLowerCase() === NOX_CONTRACTS.cUSDC.toLowerCase()
            ? "Confidential USDC"
            : "Confidential RLC"
          : tokenIn,
        decimals: isUSDC ? 6 : 9,
        isConfidential: true,
      },
      amount: amountIn,
      contractAddress: vaultAddress,
    });
  }

  const tokenOutSymbol = isUSDC
    ? "cUSDC"
    : isRLC
      ? "cRLC"
      : tokenIn.toLowerCase() === NOX_CONTRACTS.cUSDC.toLowerCase()
        ? "cUSDC"
        : "cRLC";
  const tokenOutName = isUSDC
    ? "Confidential USDC"
    : isRLC
      ? "Confidential RLC"
      : tokenIn.toLowerCase() === NOX_CONTRACTS.cUSDC.toLowerCase()
        ? "Confidential USDC"
        : "Confidential RLC";
  const tokenOutDecimals = isUSDC || iscToken ? 6 : 9;

  const quote: NoxQuote = {
    vaultAddress,
    tokenIn: {
      address: tokenIn,
      symbol: isUSDC
        ? "USDC"
        : isRLC
          ? "RLC"
          : tokenIn.toLowerCase() === NOX_CONTRACTS.cUSDC.toLowerCase()
            ? "cUSDC"
            : "cRLC",
      name: isUSDC
        ? "USD Coin"
        : isRLC
          ? "iExec RLC"
          : tokenIn.toLowerCase() === NOX_CONTRACTS.cUSDC.toLowerCase()
            ? "Confidential USDC"
            : "Confidential RLC",
      decimals: isUSDC || iscToken ? 6 : 9,
      isConfidential: iscToken,
    },
    tokenOut: {
      address: isUSDC
        ? NOX_CONTRACTS.cUSDC
        : isRLC
          ? NOX_CONTRACTS.cRLC
          : tokenIn,
      symbol: tokenOutSymbol,
      name: tokenOutName,
      decimals: tokenOutDecimals,
      isConfidential: true,
    },
    amountIn,
    amountOut: amountIn,
    estimatedYield: "5.7",
    fee: "0",
    steps,
    isConfidential: true,
  };

  return NextResponse.json(quote);
}
