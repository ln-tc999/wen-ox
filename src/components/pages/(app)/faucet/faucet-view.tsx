"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useWalletReady } from "@/lib/wallet-ready";
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

function InstantClaimBox() {
  const walletReady = useWalletReady();

  if (!walletReady) {
    return (
      <div className="mb-8 rounded-3xl border border-main bg-surface p-6 text-center">
        <p className="text-sm text-muted">
          Checking wallet connection status...
        </p>
      </div>
    );
  }

  return <InstantClaimBoxInner />;
}

function InstantClaimBoxInner() {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleInstantClaim = async () => {
    if (!address) return;
    setLoading(true);
    setStatus({ type: null, message: "" });
    try {
      const response = await fetch("/api/faucet/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      const data = await response.json();
      if (!response.ok && !data.results) {
        throw new Error(data.error || "Something went wrong.");
      }
      const r = data.results as Record<
        string,
        { success: boolean; error?: string }
      >;
      const failed = Object.entries(r)
        .filter(([, v]) => !v.success)
        .map(([k]) => k.toUpperCase());
      if (failed.length === 0) {
        setStatus({
          type: "success",
          message:
            "Successfully dripped 1,000 USDC & 100 RLC to your wallet! (And gas ETH if needed)",
        });
      } else if (failed.length < 3) {
        setStatus({
          type: "error",
          message: `Partial failure: ${failed.join(", ")} mint failed. Check console for details.`,
        });
      } else {
        setStatus({
          type: "error",
          message:
            data.error ||
            "All mint operations failed. The faucet wallet may lack MINTER_ROLE.",
        });
      }
    } catch (error) {
      console.error(error);
      setStatus({
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to claim tokens.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-8 rounded-3xl border border-brand bg-brand-soft/20 p-6 relative overflow-hidden">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1 rounded-full bg-brand px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand-contrast">
            Hackathon Mode
          </span>
          <h2 className="mt-1.5 text-lg font-bold text-main">
            Instant Testnet Faucet
          </h2>
          <p className="text-xs text-muted max-w-xl">
            Get mock USDC and RLC sent directly to your connected wallet
            instantly. No captchas, no logins required. Perfect for judges to
            quickly test deposit/yield features!
          </p>
        </div>

        <div>
          {isConnected && address ? (
            <button
              type="button"
              disabled={loading}
              onClick={handleInstantClaim}
              className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-xs font-bold text-brand-contrast hover:bg-brand/90 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-brand-contrast"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <title>Loading</title>
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Claiming...
                </>
              ) : (
                "Claim Faucet Assets"
              )}
            </button>
          ) : (
            <div className="text-xs text-muted border border-dashed border-main rounded-xl p-3 bg-surface text-center">
              Please connect your wallet to claim
            </div>
          )}
        </div>
      </div>

      {status.type && (
        <div
          className={`mt-4 rounded-xl border p-3.5 text-xs ${
            status.type === "success"
              ? "border-positive/30 bg-positive-soft text-positive"
              : "border-negative/30 bg-negative-soft text-negative"
          }`}
        >
          {status.message}
        </div>
      )}
    </div>
  );
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

        <InstantClaimBox />

        {/* Faucet Assets Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-10">
          {FAUCET_ASSETS.map((asset) => (
            <div
              key={asset.symbol}
              className="flex flex-col rounded-3xl border border-main bg-surface p-6 shadow-xs relative overflow-hidden transition-all hover:border-strong"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-brand/20 bg-brand-soft text-brand shadow-[0_0_15px_-3px_var(--color-brand)]">
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

              {/* Address / Copy section */}
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

              {/* Faucet Links */}
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
                wrap USDC/RLC to confidential cUSDC/cRLC.
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
