"use client";

import { useState } from "react";
import { useAccount, useConfig } from "wagmi";
import { writeContract, waitForTransactionReceipt } from "@wagmi/core";
import {
  FiCopy,
  FiCheck,
  FiExternalLink,
  FiHelpCircle,
  FiDroplet,
  FiDollarSign,
  FiCpu,
  FiZap,
} from "react-icons/fi";
import { parseEther } from "viem";
import { BackgroundDecor } from "@/components/layout";
import { NOX_CONTRACTS } from "@/lib/nox-types";
import { arbitrumSepolia } from "viem/chains";

const ERC20_MINT_ABI = [
  {
    name: "mint",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
] as const;

export function FaucetView() {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [wethLoading, setWethLoading] = useState(false);
  const [wethStatus, setWethStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const { address } = useAccount();
  const config = useConfig();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleClaimWETH = async () => {
    if (!address) return;
    setWethLoading(true);
    setWethStatus({ type: null, message: "" });
    try {
      const hash = await writeContract(config, {
        address: NOX_CONTRACTS.WETH as `0x${string}`,
        abi: ERC20_MINT_ABI,
        functionName: "mint",
        args: [address, parseEther("10")],
        chain: arbitrumSepolia,
      });
      const receipt = await waitForTransactionReceipt(config, { hash });
      if (receipt.status === "success") {
        setWethStatus({
          type: "success",
          message: "10 WETH claimed successfully!",
        });
      } else {
        setWethStatus({ type: "error", message: "Transaction reverted." });
      }
    } catch (err) {
      setWethStatus({
        type: "error",
        message: err instanceof Error ? err.message : "Claim failed.",
      });
    } finally {
      setWethLoading(false);
    }
  };

  return (
    <>
      <BackgroundDecor />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-8 sm:px-6">
        <div className="mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand-soft px-4 py-1.5 text-xs font-semibold text-main mb-3">
            <FiDroplet className="h-3.5 w-3.5 text-brand" />
            <span>Testnet Resources</span>
          </div>
          <h1 className="text-3xl font-bold uppercase tracking-tight text-main sm:text-4xl">
            Arbitrum Sepolia Faucet
          </h1>
          <p className="mt-2 text-sm text-muted max-w-2xl">
            Acquire free testnet tokens to test the confidential yield vaults.
          </p>
        </div>

        {/* WETH Claim Box */}
        <div className="mb-8 rounded-3xl border border-brand bg-brand-soft/20 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-1 rounded-full bg-brand px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand-contrast">
                Instant Claim
              </span>
              <h2 className="mt-1.5 text-lg font-bold text-main">
                Claim Testnet WETH
              </h2>
              <p className="text-xs text-muted max-w-xl">
                Mint10 WETH directly to your wallet for testing. No captcha, no
                external faucet needed.
              </p>
            </div>
            <div>
              {address ? (
                <button
                  type="button"
                  disabled={wethLoading}
                  onClick={handleClaimWETH}
                  className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-xs font-bold text-brand-contrast hover:bg-brand/90 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {wethLoading ? "Claiming..." : "Claim10 WETH"}
                </button>
              ) : (
                <div className="text-xs text-muted border border-dashed border-main rounded-xl p-3 bg-surface text-center">
                  Connect wallet to claim
                </div>
              )}
            </div>
          </div>
          {wethStatus.type && (
            <div
              className={`mt-4 rounded-xl border p-3.5 text-xs ${
                wethStatus.type === "success"
                  ? "border-positive/30 bg-positive-soft text-positive"
                  : "border-negative/30 bg-negative-soft text-negative"
              }`}
            >
              {wethStatus.message}
              {wethStatus.type === "success" && (
                <a
                  href={`https://sepolia.arbiscan.io/address/${NOX_CONTRACTS.WETH}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 inline-flex items-center gap-1 text-brand hover:underline"
                >
                  View on Arbiscan
                  <FiExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* External Faucets */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-10">
          {/* ETH */}
          <div className="flex flex-col rounded-3xl border border-main bg-surface p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-brand/20 bg-brand-soft text-brand">
                <FiZap className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-bold text-main border border-main">
                ETH
              </span>
            </div>
            <h2 className="text-lg font-bold text-main">Ethereum (Gas)</h2>
            <p className="mt-2 text-xs leading-relaxed text-muted flex-grow">
              Required to pay for transaction gas fees on Arbitrum Sepolia.
            </p>
            <div className="mt-5 pt-4 border-t border-main">
              <span className="block text-[9px] uppercase tracking-wide text-faint font-semibold mb-2">
                Available Faucets
              </span>
              <div className="space-y-2">
                {[
                  {
                    name: "QuickNode Faucet",
                    url: "https://faucet.quicknode.com/arbitrum/sepolia",
                  },
                  {
                    name: "Alchemy Faucet",
                    url: "https://arbitrumsepoliafaucet.com/",
                  },
                  {
                    name: "PoW Faucet (Free)",
                    url: "https://sepolia-faucet.pk910.de/",
                  },
                ].map((f) => (
                  <a
                    key={f.name}
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-xl border border-main bg-surface px-4 py-2.5 text-xs font-semibold text-main transition-all hover:bg-surface-raised hover:border-strong cursor-pointer"
                  >
                    <span>{f.name}</span>
                    <FiExternalLink className="h-3.5 w-3.5 text-brand" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* USDC */}
          <div className="flex flex-col rounded-3xl border border-main bg-surface p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-brand/20 bg-brand-soft text-brand">
                <FiDollarSign className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-bold text-main border border-main">
                USDC
              </span>
            </div>
            <h2 className="text-lg font-bold text-main">USD Coin</h2>
            <p className="mt-2 text-xs leading-relaxed text-muted flex-grow">
              Circle's testnet USDC. Wrap into cUSDC for confidential deposits.
            </p>
            <div className="mt-4 rounded-xl border border-main bg-surface-raised p-2.5 flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <span className="block text-[9px] uppercase tracking-wide text-faint font-semibold">
                  Contract
                </span>
                <span className="block truncate font-mono text-[10px] text-muted">
                  {NOX_CONTRACTS.USDC}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(NOX_CONTRACTS.USDC)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-main bg-surface text-muted cursor-pointer"
              >
                {copiedText === NOX_CONTRACTS.USDC ? (
                  <FiCheck className="h-3.5 w-3.5 text-positive" />
                ) : (
                  <FiCopy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
            <div className="mt-5 pt-4 border-t border-main">
              <a
                href="https://faucet.circle.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl border border-main bg-surface px-4 py-2.5 text-xs font-semibold text-main transition-all hover:bg-surface-raised hover:border-strong cursor-pointer"
              >
                <span>Circle Faucet</span>
                <FiExternalLink className="h-3.5 w-3.5 text-brand" />
              </a>
            </div>
          </div>

          {/* RLC */}
          <div className="flex flex-col rounded-3xl border border-main bg-surface p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-brand/20 bg-brand-soft text-brand">
                <FiCpu className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-bold text-main border border-main">
                RLC
              </span>
            </div>
            <h2 className="text-lg font-bold text-main">iExec RLC Token</h2>
            <p className="mt-2 text-xs leading-relaxed text-muted flex-grow">
              iExec's native utility token. Wrap into cRLC for confidential
              yield.
            </p>
            <div className="mt-4 rounded-xl border border-main bg-surface-raised p-2.5 flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <span className="block text-[9px] uppercase tracking-wide text-faint font-semibold">
                  Contract
                </span>
                <span className="block truncate font-mono text-[10px] text-muted">
                  {NOX_CONTRACTS.RLC}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(NOX_CONTRACTS.RLC)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-main bg-surface text-muted cursor-pointer"
              >
                {copiedText === NOX_CONTRACTS.RLC ? (
                  <FiCheck className="h-3.5 w-3.5 text-positive" />
                ) : (
                  <FiCopy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
            <div className="mt-5 pt-4 border-t border-main">
              <a
                href="https://faucet.iexec.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl border border-main bg-surface px-4 py-2.5 text-xs font-semibold text-main transition-all hover:bg-surface-raised hover:border-strong cursor-pointer"
              >
                <span>iExec Faucet</span>
                <FiExternalLink className="h-3.5 w-3.5 text-brand" />
              </a>
            </div>
          </div>
        </div>

        {/* Guide */}
        <div className="rounded-3xl border border-main bg-surface p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-4">
            <FiHelpCircle className="h-5 w-5 text-brand" />
            <h2 className="text-lg font-bold text-main">How to test Wen-Ox:</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
            <div className="flex flex-col gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-xs font-bold text-brand-contrast">
                1
              </span>
              <h3 className="text-xs font-bold text-main">Get Gas (ETH)</h3>
              <p className="text-[11px] leading-relaxed text-muted">
                Claim ETH from faucets above for gas fees.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-xs font-bold text-brand-contrast">
                2
              </span>
              <h3 className="text-xs font-bold text-main">Get Tokens</h3>
              <p className="text-[11px] leading-relaxed text-muted">
                Claim WETH above, or USDC/RLC from external faucets.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-xs font-bold text-brand-contrast">
                3
              </span>
              <h3 className="text-xs font-bold text-main">Wrap Tokens</h3>
              <p className="text-[11px] leading-relaxed text-muted">
                Go to <span className="font-semibold text-brand">/swap</span> to
                wrap into confidential tokens.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-xs font-bold text-brand-contrast">
                4
              </span>
              <h3 className="text-xs font-bold text-main">Deposit & Earn</h3>
              <p className="text-[11px] leading-relaxed text-muted">
                Head to <span className="font-semibold text-brand">/earn</span>{" "}
                and deposit to earn yield!
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
