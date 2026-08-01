"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import {
  FiAlertTriangle,
  FiCheck,
  FiExternalLink,
  FiLoader,
  FiX,
  FiDollarSign,
  FiZap,
  FiShield,
} from "react-icons/fi";
import { HiLockClosed } from "react-icons/hi2";
import { useAccount, useChainId, useConfig, useSwitchChain } from "wagmi";
import { addTrackedVault } from "@/lib/tracked-vaults";
import { useWalletReady } from "@/lib/wallet-ready";
import { useNoxDepositStore } from "@/stores";

export function NoxDepositSheet() {
  const open = useNoxDepositStore((state) => state.open);
  const closeSheet = useNoxDepositStore((state) => state.closeSheet);
  const ready = useWalletReady();

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={closeSheet}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-md sm:items-center sm:p-6"
        >
          <motion.div
            key="sheet"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[520px] overflow-hidden rounded-t-3xl border border-main bg-surface sm:rounded-3xl"
          >
            <div className="flex items-center justify-between border-b border-main px-5 py-4">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-faint">
                  <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#4e5672]">
                    <HiLockClosed className="h-2 w-2 text-white" />
                  </span>
                  Nox Protocol · Confidential
                </div>
                <h3 className="text-base font-semibold text-main">
                  Confirm your deposit
                </h3>
              </div>
              <button
                type="button"
                onClick={closeSheet}
                aria-label="Close"
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-surface-raised text-muted transition-colors hover:bg-surface-muted hover:text-main"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>
            <div className="px-5 pb-5 pt-4">
              {ready ? <NoxDepositBody /> : <LoadingState />}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

type ErrorGuide = {
  icon: typeof FiAlertTriangle;
  title: string;
  message: string;
  action?: { label: string; href: string };
};

function getErrorGuide(error: string): ErrorGuide {
  const lower = error.toLowerCase();

  if (
    lower.includes("insufficient") ||
    lower.includes("transfer amount exceeds")
  ) {
    return {
      icon: FiDollarSign,
      title: "Insufficient Balance",
      message:
        "You don't have enough tokens to complete this deposit. Please claim tokens from the faucet or reduce your deposit amount.",
      action: { label: "Go to Faucet", href: "/faucet" },
    };
  }

  if (lower.includes("user rejected") || lower.includes("rejected in wallet")) {
    return {
      icon: FiShield,
      title: "Transaction Cancelled",
      message:
        "You rejected the transaction in your wallet. No worries — nothing was changed. Try again when you're ready.",
    };
  }

  if (lower.includes("allowance") || lower.includes("approve")) {
    return {
      icon: FiShield,
      title: "Approval Required",
      message:
        "The token approval didn't go through. Please try again and approve the transaction in your wallet.",
    };
  }

  if (lower.includes("reverted") || lower.includes("vault")) {
    return {
      icon: FiAlertTriangle,
      title: "Transaction Failed",
      message:
        "The transaction was rejected by the blockchain. This can happen if the vault is paused or at capacity. Please try again later.",
    };
  }

  if (
    lower.includes("network") ||
    lower.includes("rpc") ||
    lower.includes("fetch")
  ) {
    return {
      icon: FiZap,
      title: "Network Error",
      message:
        "We couldn't reach the blockchain. Please check your connection and try again.",
    };
  }

  return {
    icon: FiAlertTriangle,
    title: "Something Went Wrong",
    message:
      error.length > 120
        ? `${error.slice(0, 120)}...`
        : error || "An unexpected error occurred. Please try again.",
  };
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-10">
      <FiLoader className="h-5 w-5 animate-spin text-brand" />
    </div>
  );
}

function NoxDepositBody() {
  const { address, isConnected } = useAccount();

  if (!isConnected || !address) {
    return (
      <ConnectButton.Custom>
        {({ openConnectModal, mounted }) => (
          <button
            type="button"
            disabled={!mounted}
            onClick={openConnectModal}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-5 py-4 text-base font-semibold text-white cursor-pointer transition-all hover-brand active:scale-[0.98] disabled:opacity-50"
          >
            Connect wallet to continue
          </button>
        )}
      </ConnectButton.Custom>
    );
  }

  return <NoxDepositFlow walletAddress={address} />;
}

function NoxDepositFlow({ walletAddress }: { walletAddress: `0x${string}` }) {
  const vault = useNoxDepositStore((state) => state.vault)!;
  const amount = useNoxDepositStore((state) => state.amount);
  const step = useNoxDepositStore((state) => state.step);
  const error = useNoxDepositStore((state) => state.error);
  const txHash = useNoxDepositStore((state) => state.txHash);
  const closeSheet = useNoxDepositStore((state) => state.closeSheet);
  const executeDeposit = useNoxDepositStore((state) => state.executeDeposit);
  const wagmiConfig = useConfig();
  const currentChainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const isWrongChain = currentChainId !== vault.chainId;

  const underlyingSymbol = vault.tokenSymbol.startsWith("c")
    ? vault.tokenSymbol.slice(1)
    : vault.tokenSymbol;

  useEffect(() => {
    if (step === "success" && vault) {
      addTrackedVault({
        chainId: vault.chainId,
        vaultAddress: vault.vaultAddress,
        protocolName: vault.protocolKey,
        tokenSymbol: vault.tokenSymbol,
        tokenDecimals: vault.tokenDecimals,
        tokenAddress: vault.tokenAddress,
        vaultName: vault.vaultName,
      });
    }
  }, [step, vault]);

  if (step === "success") {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 340, damping: 18 }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(64,182,107,0.15)]"
        >
          <FiCheck className="h-7 w-7 text-(--color-positive)" />
        </motion.div>
        <div>
          <p className="text-base font-semibold text-main">
            Deposit successful
          </p>
          <p className="mt-1 text-xs text-muted">
            {amount} {underlyingSymbol} deposited into {vault.vaultName}
          </p>
        </div>
        {txHash ? (
          <a
            href={`https://sepolia.arbiscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-brand hover:underline"
          >
            View on Arbiscan
          </a>
        ) : null}
        <button
          type="button"
          onClick={closeSheet}
          className="mt-2 w-full rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-white cursor-pointer transition-colors hover-brand"
        >
          Done
        </button>
      </div>
    );
  }

  if (step === "error") {
    const errorGuide = getErrorGuide(error ?? "");
    return (
      <div className="flex flex-col items-center gap-5 py-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
          <errorGuide.icon className="h-8 w-8 text-amber-500" />
        </div>
        <div>
          <p className="text-lg font-semibold text-main">{errorGuide.title}</p>
          <p className="mt-2 max-w-xs text-sm text-muted leading-relaxed">
            {errorGuide.message}
          </p>
        </div>
        <div className="flex w-full flex-col gap-2">
          {errorGuide.action && (
            <a
              href={errorGuide.action.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-white cursor-pointer transition-colors hover-brand"
            >
              {errorGuide.action.label}
              <FiExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
          <button
            type="button"
            onClick={() =>
              useNoxDepositStore.setState({ step: "idle", error: null })
            }
            className="w-full rounded-2xl border border-main bg-surface px-5 py-3 text-sm font-semibold text-main cursor-pointer transition-colors hover:bg-surface-raised"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const isExecuting =
    step === "approving" || step === "wrapping" || step === "depositing";

  const stepLabel: Record<string, string> = {
    approving: "Approving token spend…",
    wrapping: `Wrapping ${underlyingSymbol} to confidential token…`,
    depositing: "Depositing into vault…",
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-main bg-surface-raised px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted">Vault</span>
          <span className="text-sm font-semibold text-main">
            {vault.vaultName}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-muted">Amount</span>
          <span className="text-sm font-semibold text-main">
            {amount} {underlyingSymbol}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-muted">APY</span>
          <span className="text-sm font-semibold text-[#60a5fa]">
            {vault.apy.toFixed(1)}%
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-muted">Protocol</span>
          <span className="flex items-center gap-1 text-sm font-semibold text-main">
            <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#4e5672]">
              <HiLockClosed className="h-2 w-2 text-white" />
            </span>
            {vault.protocol}
          </span>
        </div>
      </div>

      <div className="rounded-2xl bg-[rgba(74,101,255,0.08)] px-4 py-3 text-xs text-[#a0aacc]">
        Your deposit amount is encrypted on-chain via ERC-7984. Balance and
        transactions remain private.
      </div>

      {isExecuting ? (
        <div className="flex flex-col items-center gap-3 py-4">
          <FiLoader className="h-5 w-5 animate-spin text-brand" />
          <p className="text-sm font-semibold text-main">
            {stepLabel[step] ?? "Processing…"}
          </p>
          <p className="text-xs text-muted">Please confirm in your wallet</p>
        </div>
      ) : isWrongChain ? (
        <button
          type="button"
          onClick={() => switchChainAsync({ chainId: vault.chainId })}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-5 py-4 text-base font-semibold text-white cursor-pointer transition-all hover-brand active:scale-[0.98]"
        >
          Switch to {vault.chainShortName}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => executeDeposit(wagmiConfig, walletAddress)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-5 py-4 text-base font-semibold text-white cursor-pointer transition-all hover-brand active:scale-[0.98]"
        >
          <HiLockClosed className="h-4 w-4" />
          Confirm confidential deposit
        </button>
      )}
    </div>
  );
}
