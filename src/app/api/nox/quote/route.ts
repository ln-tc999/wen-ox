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
  const isWETH = tokenIn.toLowerCase() === NOX_CONTRACTS.WETH.toLowerCase();
  const iscToken =
    tokenIn.toLowerCase() === NOX_CONTRACTS.cUSDC.toLowerCase() ||
    tokenIn.toLowerCase() === NOX_CONTRACTS.cRLC.toLowerCase() ||
    tokenIn.toLowerCase() === NOX_CONTRACTS.cWETH.toLowerCase();

  if (!isUSDC && !isRLC && !isWETH && !iscToken) {
    return NextResponse.json(
      {
        error:
          "Unsupported token. Only USDC, RLC, WETH, cUSDC, cRLC, cWETH are supported on Arbitrum Sepolia.",
      },
      { status: 400 },
    );
  }

  const steps: NoxQuoteStep[] = [];

  if (isUSDC || isRLC || isWETH) {
    steps.push({
      type: "approve",
      token: {
        address: tokenIn,
        symbol: isUSDC ? "USDC" : isRLC ? "RLC" : "WETH",
        name: isUSDC ? "USD Coin" : isRLC ? "iExec RLC" : "Wrapped Ether",
        decimals: isUSDC ? 6 : isRLC ? 9 : 18,
        isConfidential: false,
      },
      amount: amountIn,
      spender: vaultAddress,
    });

    steps.push({
      type: "wrap",
      token: {
        address: vaultAddress,
        symbol: isUSDC ? "cUSDC" : isRLC ? "cRLC" : "cWETH",
        name: isUSDC
          ? "Confidential USDC"
          : isRLC
            ? "Confidential RLC"
            : "Confidential WETH",
        decimals: isUSDC ? 6 : isRLC ? 9 : 18,
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
            : tokenIn.toLowerCase() === NOX_CONTRACTS.cRLC.toLowerCase()
              ? "cRLC"
              : "cWETH"
          : tokenIn,
        name: iscToken
          ? tokenIn.toLowerCase() === NOX_CONTRACTS.cUSDC.toLowerCase()
            ? "Confidential USDC"
            : tokenIn.toLowerCase() === NOX_CONTRACTS.cRLC.toLowerCase()
              ? "Confidential RLC"
              : "Confidential WETH"
          : tokenIn,
        decimals: isUSDC ? 6 : isRLC ? 9 : 18,
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
            : tokenIn.toLowerCase() === NOX_CONTRACTS.cRLC.toLowerCase()
              ? "cRLC"
              : "cWETH"
          : tokenIn,
        name: iscToken
          ? tokenIn.toLowerCase() === NOX_CONTRACTS.cUSDC.toLowerCase()
            ? "Confidential USDC"
            : tokenIn.toLowerCase() === NOX_CONTRACTS.cRLC.toLowerCase()
              ? "Confidential RLC"
              : "Confidential WETH"
          : tokenIn,
        decimals: isUSDC ? 6 : isRLC ? 9 : 18,
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
      : isWETH
        ? "cWETH"
        : tokenIn.toLowerCase() === NOX_CONTRACTS.cUSDC.toLowerCase()
          ? "cUSDC"
          : tokenIn.toLowerCase() === NOX_CONTRACTS.cRLC.toLowerCase()
            ? "cRLC"
            : "cWETH";
  const tokenOutName = isUSDC
    ? "Confidential USDC"
    : isRLC
      ? "Confidential RLC"
      : isWETH
        ? "Confidential WETH"
        : tokenIn.toLowerCase() === NOX_CONTRACTS.cUSDC.toLowerCase()
          ? "Confidential USDC"
          : tokenIn.toLowerCase() === NOX_CONTRACTS.cRLC.toLowerCase()
            ? "Confidential RLC"
            : "Confidential WETH";
  const tokenOutDecimals = isUSDC ? 6 : isRLC ? 9 : 18;

  const quote: NoxQuote = {
    vaultAddress,
    tokenIn: {
      address: tokenIn,
      symbol: isUSDC
        ? "USDC"
        : isRLC
          ? "RLC"
          : isWETH
            ? "WETH"
            : tokenIn.toLowerCase() === NOX_CONTRACTS.cUSDC.toLowerCase()
              ? "cUSDC"
              : tokenIn.toLowerCase() === NOX_CONTRACTS.cRLC.toLowerCase()
                ? "cRLC"
                : "cWETH",
      name: isUSDC
        ? "USD Coin"
        : isRLC
          ? "iExec RLC"
          : isWETH
            ? "Wrapped Ether"
            : tokenIn.toLowerCase() === NOX_CONTRACTS.cUSDC.toLowerCase()
              ? "Confidential USDC"
              : tokenIn.toLowerCase() === NOX_CONTRACTS.cRLC.toLowerCase()
                ? "Confidential RLC"
                : "Confidential WETH",
      decimals: isUSDC ? 6 : isRLC ? 9 : 18,
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
