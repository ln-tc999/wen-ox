"use client";

import { useEffect, useMemo, useState } from "react";
import { FiArrowDown, FiSettings } from "react-icons/fi";
import { formatUnits } from "viem";
import { useAccount, useBalance } from "wagmi";
import { NOX_CONTRACTS } from "@/lib/nox-types";
import { useSwapStore } from "@/stores/swap-store";
import { Selector } from "../earn/selector";

const CONFIDENTIAL_TOKENS = [
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
];

export function SwapCard() {
  const { address } = useAccount();
  const [showSettings, setShowSettings] = useState(false);

  const tokenIn = useSwapStore((state) => state.tokenIn);
  const tokenOut = useSwapStore((state) => state.tokenOut);
  const amountIn = useSwapStore((state) => state.amountIn);
  const amountOut = useSwapStore((state) => state.amountOut);
  const slippage = useSwapStore((state) => state.slippage);
  const deadline = useSwapStore((state) => state.deadline);
  const quote = useSwapStore((state) => state.quote);
  const isLoadingQuote = useSwapStore((state) => state.isLoadingQuote);
  const isSwapping = useSwapStore((state) => state.isSwapping);

  const setTokenIn = useSwapStore((state) => state.setTokenIn);
  const setTokenOut = useSwapStore((state) => state.setTokenOut);
  const setAmountIn = useSwapStore((state) => state.setAmountIn);
  const setAmountOut = useSwapStore((state) => state.setAmountOut);
  const swapTokens = useSwapStore((state) => state.swapTokens);
  const setSlippage = useSwapStore((state) => state.setSlippage);
  const setDeadline = useSwapStore((state) => state.setDeadline);
  const setIsLoadingQuote = useSwapStore((state) => state.setIsLoadingQuote);
  const setQuote = useSwapStore((state) => state.setQuote);

  // Set default tokens
  useEffect(() => {
    if (!tokenIn) {
      setTokenIn(CONFIDENTIAL_TOKENS[0]);
    }
    if (!tokenOut) {
      setTokenOut(CONFIDENTIAL_TOKENS[1]);
    }
  }, [tokenIn, tokenOut, setTokenIn, setTokenOut]);

  // Get balances
  const { data: balanceIn } = useBalance({
    address: address,
    token: tokenIn?.address as `0x${string}` | undefined,
  });

  const { data: balanceOut } = useBalance({
    address: address,
    token: tokenOut?.address as `0x${string}` | undefined,
  });

  // Fetch quote when amountIn changes
  useEffect(() => {
    if (
      !amountIn ||
      !tokenIn ||
      !tokenOut ||
      Number.parseFloat(amountIn) <= 0
    ) {
      setAmountOut("");
      setQuote(null);
      return;
    }

    const fetchQuote = async () => {
      setIsLoadingQuote(true);
      try {
        // TODO: Call backend API for quote
        // For now, mock 1:1 swap with 1% slippage
        const amountInNum = Number.parseFloat(amountIn);
        const priceInUSD = Number.parseFloat(tokenIn.priceUSD || "1");
        const priceOutUSD = Number.parseFloat(tokenOut.priceUSD || "1");

        const amountOutNum = (amountInNum * priceInUSD) / priceOutUSD;
        const amountOutWithSlippage = amountOutNum * (1 - slippage / 10000);

        setAmountOut(amountOutWithSlippage.toFixed(tokenOut.decimals));
        setQuote({
          amountIn: amountIn,
          amountOut: amountOutWithSlippage.toString(),
          priceImpact: 0.1,
          minimumReceived: (amountOutWithSlippage * 0.99).toString(),
          route: [tokenIn.symbol, tokenOut.symbol],
          isLoading: false,
        });
      } catch (error) {
        console.error("Failed to fetch quote:", error);
        setAmountOut("");
        setQuote(null);
      } finally {
        setIsLoadingQuote(false);
      }
    };

    const debounce = setTimeout(fetchQuote, 500);
    return () => clearTimeout(debounce);
  }, [
    amountIn,
    tokenIn,
    tokenOut,
    slippage,
    setAmountOut,
    setQuote,
    setIsLoadingQuote,
  ]);

  const tokenInOptions = useMemo(
    () =>
      CONFIDENTIAL_TOKENS.map((t) => ({
        key: t.symbol,
        label: t.symbol,
        hint: t.name,
        iconUrl: t.logoURI,
      })),
    [],
  );

  const tokenOutOptions = useMemo(
    () =>
      CONFIDENTIAL_TOKENS.filter((t) => t.symbol !== tokenIn?.symbol).map(
        (t) => ({
          key: t.symbol,
          label: t.symbol,
          hint: t.name,
          iconUrl: t.logoURI,
        }),
      ),
    [tokenIn],
  );

  const handleSwapClick = () => {
    // TODO: Implement swap execution
    console.log("Execute swap:", { tokenIn, tokenOut, amountIn, amountOut });
  };

  const canSwap = !!(
    tokenIn &&
    tokenOut &&
    amountIn &&
    Number.parseFloat(amountIn) > 0 &&
    amountOut &&
    !isLoadingQuote &&
    !isSwapping
  );

  return (
    <section className="rounded-3xl border border-main bg-surface p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="rounded-full bg-surface-muted px-3 py-1.5 text-xs font-semibold text-main">
          Swap
        </div>
        <button
          type="button"
          onClick={() => setShowSettings(!showSettings)}
          className="rounded-lg p-2 hover:bg-surface-raised transition-colors"
        >
          <FiSettings className="h-5 w-5 text-main" />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="rounded-xl border border-main bg-surface-raised p-4 space-y-4">
          <div>
            <label className="text-sm text-muted mb-2 block">
              Slippage Tolerance
            </label>
            <div className="flex gap-2">
              {[10, 50, 100].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSlippage(value)}
                  className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    slippage === value
                      ? "bg-brand text-white"
                      : "bg-surface-muted hover:bg-surface-raised text-muted"
                  }`}
                >
                  {value / 100}%
                </button>
              ))}
              <input
                type="number"
                value={slippage / 100}
                onChange={(e) =>
                  setSlippage(
                    Math.max(0, Number.parseFloat(e.target.value) * 100),
                  )
                }
                className="w-20 rounded-lg bg-surface-muted px-3 py-2 text-sm text-center text-main"
                placeholder="Custom"
                step="0.1"
                min="0"
                max="50"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-muted mb-2 block">
              Transaction Deadline (minutes)
            </label>
            <input
              type="number"
              value={deadline}
              onChange={(e) =>
                setDeadline(Math.max(1, Number.parseInt(e.target.value)))
              }
              className="w-full rounded-lg bg-surface-muted px-3 py-2 text-sm text-main"
              min="1"
              max="60"
            />
          </div>
        </div>
      )}

      {/* Swap Card */}
      <div className="space-y-1">
        {/* From Token */}
        <div className="rounded-2xl bg-surface-raised p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">From</span>
            {balanceIn && (
              <button
                type="button"
                onClick={() =>
                  setAmountIn(formatUnits(balanceIn.value, balanceIn.decimals))
                }
                className="text-xs text-faint hover:text-muted transition-colors"
              >
                Balance:{" "}
                {Number.parseFloat(
                  formatUnits(balanceIn.value, balanceIn.decimals),
                ).toFixed(4)}
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              value={amountIn}
              onChange={(e) => setAmountIn(e.target.value)}
              placeholder="0.0"
              className="flex-1 bg-transparent text-2xl font-semibold outline-none text-main"
            />

            <Selector
              label="From token"
              value={tokenIn?.symbol || ""}
              onSelect={(key) => {
                const token = CONFIDENTIAL_TOKENS.find((t) => t.symbol === key);
                if (token) setTokenIn(token);
              }}
              options={tokenInOptions}
              emptyLabel="Select token"
            />
          </div>

          {tokenIn && amountIn && (
            <div className="text-sm text-faint">
              ≈ $
              {(
                Number.parseFloat(amountIn) *
                Number.parseFloat(tokenIn.priceUSD || "0")
              ).toFixed(2)}
            </div>
          )}
        </div>

        {/* Swap Arrow */}
        <div className="flex justify-center -my-2 relative z-10">
          <button
            type="button"
            onClick={swapTokens}
            className="rounded-xl bg-brand hover-brand p-2 transition-all hover:scale-110"
          >
            <FiArrowDown className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* To Token */}
        <div className="rounded-2xl bg-surface-raised p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">To</span>
            {balanceOut && (
              <span className="text-xs text-faint">
                Balance:{" "}
                {Number.parseFloat(
                  formatUnits(balanceOut.value, balanceOut.decimals),
                ).toFixed(4)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              value={isLoadingQuote ? "Loading..." : amountOut}
              readOnly
              placeholder="0.0"
              className="flex-1 bg-transparent text-2xl font-semibold outline-none text-main"
            />

            <Selector
              label="To token"
              value={tokenOut?.symbol || ""}
              onSelect={(key) => {
                const token = CONFIDENTIAL_TOKENS.find((t) => t.symbol === key);
                if (token) setTokenOut(token);
              }}
              options={tokenOutOptions}
              emptyLabel="Select token"
            />
          </div>

          {tokenOut && amountOut && (
            <div className="text-sm text-faint">
              ≈ $
              {(
                Number.parseFloat(amountOut) *
                Number.parseFloat(tokenOut.priceUSD || "0")
              ).toFixed(2)}
            </div>
          )}
        </div>
      </div>

      {/* Quote Details */}
      {quote && !isLoadingQuote && (
        <div className="rounded-xl border border-main bg-surface-raised p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Rate</span>
            <span className="font-medium text-main">
              1 {tokenIn?.symbol} ={" "}
              {(
                Number.parseFloat(amountOut) / Number.parseFloat(amountIn)
              ).toFixed(6)}{" "}
              {tokenOut?.symbol}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted">Price Impact</span>
            <span
              className={
                quote.priceImpact > 5 ? "text-negative" : "text-positive"
              }
            >
              {quote.priceImpact.toFixed(2)}%
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted">Minimum Received</span>
            <span className="font-medium text-main">
              {Number.parseFloat(quote.minimumReceived).toFixed(6)}{" "}
              {tokenOut?.symbol}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted">Slippage Tolerance</span>
            <span className="font-medium text-main">{slippage / 100}%</span>
          </div>
        </div>
      )}

      {/* Swap Button */}
      <div>
        <button
          type="button"
          onClick={handleSwapClick}
          disabled={!canSwap}
          className={`w-full rounded-xl py-4 font-semibold text-lg transition-all ${
            canSwap
              ? "bg-brand hover-brand text-white hover:scale-[1.02] active:scale-[0.98]"
              : "bg-surface-muted text-faint cursor-not-allowed"
          }`}
        >
          {!address
            ? "Connect Wallet"
            : !tokenIn || !tokenOut
              ? "Select Tokens"
              : !amountIn || Number.parseFloat(amountIn) <= 0
                ? "Enter Amount"
                : isLoadingQuote
                  ? "Loading Quote..."
                  : isSwapping
                    ? "Swapping..."
                    : "Swap"}
        </button>
      </div>

      {/* Privacy Notice */}
      <div className="rounded-xl bg-brand-soft border border-brand p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-brand/20 p-2 flex-shrink-0">
            <svg
              className="w-4 h-4 text-brand"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <div>
            <h4 className="font-medium text-sm mb-1 text-main">Private Swap</h4>
            <p className="text-xs text-muted">
              Your swap amounts are encrypted via Nox Protocol. Only you can
              decrypt your transaction details.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
