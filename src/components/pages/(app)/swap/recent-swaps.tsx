"use client";

import { FiArrowRight, FiClock } from "react-icons/fi";

type Swap = {
  id: string;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  timestamp: number;
  txHash: string;
  status: "pending" | "success" | "failed";
};

// Mock data
const MOCK_SWAPS: Swap[] = [
  {
    id: "1",
    fromToken: "cUSDC",
    toToken: "cRLC",
    fromAmount: "100",
    toAmount: "28.57",
    timestamp: Date.now() - 1000 * 60 * 5,
    txHash: "0x1234...5678",
    status: "success",
  },
  {
    id: "2",
    fromToken: "cRLC",
    toToken: "cUSDC",
    fromAmount: "50",
    toAmount: "175",
    timestamp: Date.now() - 1000 * 60 * 30,
    txHash: "0x8765...4321",
    status: "success",
  },
];

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function RecentSwaps() {
  return (
    <section className="rounded-3xl border border-main bg-white dark:bg-surface p-3 flex flex-col shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-1 mb-3">
        <div className="rounded-full border border-main bg-white dark:bg-surface px-3 py-1.5 text-xs font-semibold text-main">
          Recent Swaps
        </div>
        <button
          type="button"
          className="text-xs text-muted hover:text-main transition-colors"
        >
          View All
        </button>
      </div>

      {/* Swaps List */}
      <div className="rounded-2xl border border-main bg-white dark:bg-surface overflow-y-auto max-h-[260px]">
        <div className="divide-y divide-(--color-line)">
          {MOCK_SWAPS.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="rounded-full border border-main bg-white dark:bg-surface p-4 mb-4">
                <FiArrowRight className="h-8 w-8 text-faint" />
              </div>
              <p className="text-muted text-sm mb-2">No swaps yet</p>
              <p className="text-faint text-xs">
                Your swap history will appear here
              </p>
            </div>
          ) : (
            MOCK_SWAPS.map((swap) => (
              <div
                key={swap.id}
                className="p-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-main">
                      {swap.fromToken}
                    </span>
                    <FiArrowRight className="h-4 w-4 text-faint" />
                    <span className="font-medium text-main">
                      {swap.toToken}
                    </span>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      swap.status === "success"
                        ? "bg-(--color-positive)/20 text-positive"
                        : swap.status === "pending"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-(--color-negative)/20 text-negative"
                    }`}
                  >
                    {swap.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="text-muted">
                    {swap.fromAmount} → {swap.toAmount}
                  </div>
                  <div className="flex items-center gap-1 text-faint text-xs">
                    <FiClock className="h-3 w-3" />
                    {formatTimeAgo(swap.timestamp)}
                  </div>
                </div>

                <div className="mt-2">
                  <a
                    href={`https://sepolia.arbiscan.io/tx/${swap.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-brand hover:opacity-80 transition-colors"
                  >
                    {swap.txHash}
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="mt-3 rounded-xl border border-main bg-white dark:bg-surface p-3 text-xs text-muted">
        <p>🔒 Amounts are encrypted. Hashes visible for verification.</p>
      </div>
    </section>
  );
}
