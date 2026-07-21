"use client";

import { BackgroundDecor } from "@/components/layout";
import { useWalletReady } from "@/lib/wallet-ready";
import { useSwapStore } from "@/stores/swap-store";
import { PriceChart } from "./price-chart";
import { RecentSwaps } from "./recent-swaps";
import { SwapCard } from "./swap-card";

export function SwapView() {
  const walletReady = useWalletReady();
  const tokenIn = useSwapStore((state) => state.tokenIn);
  const tokenOut = useSwapStore((state) => state.tokenOut);
  const amountOut = useSwapStore((state) => state.amountOut);

  if (!walletReady) {
    return (
      <>
        <BackgroundDecor />
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-4 sm:px-6 sm:py-6 items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
            <p className="text-muted">Loading wallet provider...</p>
          </div>
        </main>
      </>
    );
  }

  // Generate token pair for chart
  const tokenPair =
    tokenIn && tokenOut ? `${tokenIn.symbol}/${tokenOut.symbol}` : "cUSDC/cRLC";
  const currentPrice =
    amountOut && tokenIn && tokenOut
      ? parseFloat(amountOut) /
        (tokenIn.priceUSD ? parseFloat(tokenIn.priceUSD) : 1)
      : null;

  return (
    <>
      <BackgroundDecor />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-4 sm:px-6 sm:py-6 lg:h-[calc(100dvh-4rem)] lg:flex-none lg:overflow-hidden">
        <div className="grid flex-1 gap-4 lg:min-h-0 lg:grid-cols-[1fr_400px] lg:gap-5 lg:items-stretch">
          {/* Left: Chart & Recent Swaps */}
          <div className="flex min-h-0 flex-col gap-4">
            {/* Price Chart */}
            <section className="rounded-3xl border border-main bg-surface p-4 flex-1 min-h-[400px]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-main">
                    {tokenPair}
                  </h2>
                  <p className="text-sm text-muted mt-1">
                    Price chart for confidential token pair
                  </p>
                </div>
                <div className="rounded-full border border-main bg-white dark:bg-surface px-3 py-1.5 text-xs font-semibold text-main">
                  Chart
                </div>
              </div>
              <div className="h-[calc(100%-60px)]">
                <PriceChart tokenPair={tokenPair} currentPrice={currentPrice} />
              </div>
            </section>

            {/* Recent Swaps - Compact Version */}
            <RecentSwaps />
          </div>

          {/* Right: Swap Card */}
          <div className="flex min-h-0 flex-col">
            <SwapCard />
          </div>
        </div>
      </main>
    </>
  );
}
