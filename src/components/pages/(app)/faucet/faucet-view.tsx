"use client";

import { useState } from "react";
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
import { BackgroundDecor } from "@/components/layout";
import { NOX_CONTRACTS } from "@/lib/nox-types";

type FaucetAsset = {
  symbol: string;
  name: string;
  address?: string;
  decimals?: number;
  description: string;
  faucets: {
    name: string;
    url: string;
  }[];
};

const FAUCET_ASSETS: FaucetAsset[] = [
  {
    symbol: "ETH",
    name: "Ethereum (Gas)",
    description:
      "Required to pay for network transaction gas fees on Arbitrum Sepolia.",
    faucets: [
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
    ],
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    address: NOX_CONTRACTS.USDC,
    decimals: 6,
    description:
      "Circle's testnet USDC. Wrap into cUSDC to deposit into Nox confidential vaults.",
    faucets: [
      {
        name: "Circle Faucet",
        url: "https://faucet.circle.com/",
      },
    ],
  },
  {
    symbol: "RLC",
    name: "iExec RLC Token",
    address: NOX_CONTRACTS.RLC,
    decimals: 9,
    description:
      "iExec's native utility token on testnet. Wrap into cRLC for confidential yield.",
    faucets: [
      {
        name: "iExec Faucet",
        url: "https://faucet.iexec.io/",
      },
    ],
  },
];

function getAssetIcon(symbol: string) {
  switch (symbol) {
    case "ETH":
      return <FiZap className="h-5 w-5" />;
    case "USDC":
      return <FiDollarSign className="h-5 w-5" />;
    case "RLC":
      return <FiCpu className="h-5 w-5" />;
    default:
      return <FiZap className="h-5 w-5" />;
  }
}

export function FaucetView() {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <>
      <BackgroundDecor />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-8 sm:px-6">
        {/* Header Section */}
        <div className="mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand-soft px-4 py-1.5 text-xs font-semibold text-main mb-3">
            <FiDroplet className="h-3.5 w-3.5 text-brand" />
            <span>Testnet Resources</span>
          </div>
          <h1 className="text-3xl font-bold uppercase tracking-tight text-main sm:text-4xl">
            Arbitrum Sepolia Faucet
          </h1>
          <p className="mt-2 text-sm text-muted max-w-2xl">
            Acquire free testnet tokens to pay for transactions, trade, and test
            the confidential yield aggregator vaults. These tokens have no real
            financial value.
          </p>
        </div>

        {/* Info Banner */}
        <div className="mb-8 rounded-2xl border border-brand/30 bg-brand-soft/20 p-5">
          <p className="text-xs text-muted leading-relaxed">
            Tokens are sourced from official external faucets. Claim ETH for
            gas, then USDC and RLC from the links below. After claiming, head to{" "}
            <span className="font-semibold text-brand">/swap</span> to wrap into
            confidential tokens (cUSDC/cRLC/cWETH), then deposit at{" "}
            <span className="font-semibold text-brand">/earn</span>.
          </p>
        </div>

        {/* Faucet Assets Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-10">
          {FAUCET_ASSETS.map((asset) => (
            <div
              key={asset.symbol}
              className="flex flex-col rounded-3xl border border-main bg-surface p-6 shadow-xs relative overflow-hidden transition-all hover:border-strong"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-brand/20 bg-brand-soft text-brand">
                  {getAssetIcon(asset.symbol)}
                </div>
                <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-bold text-main border border-main">
                  {asset.symbol}
                </span>
              </div>

              <h2 className="text-lg font-bold text-main">{asset.name}</h2>
              <p className="mt-2 text-xs leading-relaxed text-muted flex-grow">
                {asset.description}
              </p>

              {asset.address && (
                <div className="mt-4 rounded-xl border border-main bg-surface-raised p-2.5 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="block text-[9px] uppercase tracking-wide text-faint font-semibold">
                      Contract Address
                    </span>
                    <span className="block truncate font-mono text-[10px] text-muted">
                      {asset.address}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(asset.address!)}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-main bg-surface text-muted transition-colors hover:text-main cursor-pointer"
                    title="Copy Address"
                  >
                    {copiedText === asset.address ? (
                      <FiCheck className="h-3.5 w-3.5 text-positive" />
                    ) : (
                      <FiCopy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              )}

              <div className="mt-5 pt-4 border-t border-main">
                <span className="block text-[9px] uppercase tracking-wide text-faint font-semibold mb-2">
                  Available Faucets
                </span>
                <div className="space-y-2">
                  {asset.faucets.map((faucet) => (
                    <a
                      key={faucet.name}
                      href={faucet.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-xl border border-main bg-surface px-4 py-2.5 text-xs font-semibold text-main transition-all hover:bg-surface-raised hover:border-strong cursor-pointer"
                    >
                      <span>{faucet.name}</span>
                      <FiExternalLink className="h-3.5 w-3.5 text-brand" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Step-by-Step Guide */}
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
                Use one of the ETH faucets to receive Arbitrum Sepolia testnet
                ETH. This covers gas fees.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-xs font-bold text-brand-contrast">
                2
              </span>
              <h3 className="text-xs font-bold text-main">Get Tokens</h3>
              <p className="text-[11px] leading-relaxed text-muted">
                Visit the Circle or iExec faucet page to claim testnet USDC and
                RLC.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-xs font-bold text-brand-contrast">
                3
              </span>
              <h3 className="text-xs font-bold text-main">Wrap Tokens</h3>
              <p className="text-[11px] leading-relaxed text-muted">
                Go to <span className="font-semibold text-brand">/swap</span> to
                wrap USDC/RLC/WETH to confidential cUSDC/cRLC/cWETH.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-xs font-bold text-brand-contrast">
                4
              </span>
              <h3 className="text-xs font-bold text-main">Deposit & Earn</h3>
              <p className="text-[11px] leading-relaxed text-muted">
                Head to <span className="font-semibold text-brand">/earn</span>{" "}
                and deposit cTokens to start earning yield!
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
