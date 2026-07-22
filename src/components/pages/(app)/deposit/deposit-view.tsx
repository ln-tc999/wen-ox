"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiAlertTriangle,
  FiArrowDown,
  FiArrowUp,
  FiCheck,
  FiLoader,
  FiLock,
} from "react-icons/fi";
import { HiLockClosed, HiOutlineLockOpen } from "react-icons/hi2";
import { erc20Abi, formatUnits, parseUnits } from "viem";
import {
  useAccount,
  useChainId,
  useConfig,
  useReadContract,
  useSwitchChain,
} from "wagmi";
import { BackgroundDecor } from "@/components/layout";
import {
  createNoxHandleClientFromWindow,
  encryptAmountWithHandle,
} from "@/lib/nox-handle";
import { NOX_CONTRACTS, NOX_VAULTS } from "@/lib/nox-types";
import { NOX_YIELD_VAULT_ABI } from "@/lib/nox-vault-contract";
import { useWalletReady } from "@/lib/wallet-ready";
import { useMetaStore } from "@/stores";

// ---------------------------------------------------------------------------
// Available tokens for deposit
// ---------------------------------------------------------------------------

const DEPOSIT_TOKENS = [
  {
    symbol: "USDC",
    name: "USD Coin",
    address: NOX_CONTRACTS.USDC,
    cTokenAddress: NOX_CONTRACTS.cUSDC,
    decimals: 6,
    logoURI:
      "https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png",
    priceUSD: 1,
    vaultAddress: NOX_VAULTS.cUSDC_VAULT,
    chainId: 421614,
  },
  {
    symbol: "RLC",
    name: "iExec RLC",
    address: NOX_CONTRACTS.RLC,
    cTokenAddress: NOX_CONTRACTS.cRLC,
    decimals: 9,
    logoURI: "/Assets/Images/Logo-Coin/rlc-logo.svg",
    priceUSD: 3.5,
    vaultAddress: NOX_VAULTS.cRLC_VAULT,
    chainId: 421614,
  },
] as const;

type TabKey = "deposit" | "withdraw";

// ---------------------------------------------------------------------------
// Deposit View (main)
// ---------------------------------------------------------------------------

export function DepositView() {
  const [activeTab, setActiveTab] = useState<TabKey>("deposit");
  const loadMeta = useMetaStore((state) => state.loadMeta);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  return (
    <>
      <BackgroundDecor />
      <main className="mx-auto flex w-full max-w-310 flex-1 flex-col px-4 py-4 sm:px-6 sm:py-6 lg:h-[calc(100dvh-4rem)] lg:flex-none lg:overflow-hidden">
        <div className="grid flex-1 gap-4 lg:min-h-0 lg:grid-cols-[1fr_420px] lg:gap-5 lg:items-stretch">
          {/* Left: Info & features */}
          <div className="flex min-h-0 flex-col gap-4">
            <DepositHero />
            <DepositFeatures />
          </div>

          {/* Right: Deposit / Withdraw card */}
          <div className="flex min-h-0 flex-col">
            <div className="rounded-3xl border border-main bg-surface p-2.5">
              {/* Tab switcher */}
              <div className="flex items-center gap-1 rounded-full bg-surface-muted p-1 mb-3">
                <TabButton
                  label="Deposit"
                  icon={<FiArrowDown className="h-3.5 w-3.5" />}
                  isActive={activeTab === "deposit"}
                  onClick={() => setActiveTab("deposit")}
                />
                <TabButton
                  label="Withdraw"
                  icon={<FiArrowUp className="h-3.5 w-3.5" />}
                  isActive={activeTab === "withdraw"}
                  onClick={() => setActiveTab("withdraw")}
                />
              </div>

              {/* Content */}
              <div className="px-2 pb-2">
                {activeTab === "deposit" ? <DepositFlow /> : <WithdrawFlow />}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

// ---------------------------------------------------------------------------
// Tab Button
// ---------------------------------------------------------------------------

function TabButton({
  label,
  icon,
  isActive,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
        isActive
          ? "bg-surface-raised text-main shadow-sm"
          : "text-muted hover:text-main"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Hero section (left column)
// ---------------------------------------------------------------------------

function DepositHero() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-3xl border border-main bg-surface p-5 sm:p-6"
    >
      <span className="inline-flex items-center gap-2 self-start rounded-full bg-brand-soft px-3 py-1 text-[11px] font-semibold text-brand">
        <HiLockClosed className="h-3 w-3" />
        Nox Protocol
      </span>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-main sm:text-3xl">
        Confidential deposits
      </h1>
      <p className="mt-2 max-w-lg text-sm text-muted leading-relaxed">
        Deposit USDC or RLC into encrypted vaults. Your balance is wrapped into
        ERC-7984 confidential tokens — only you can decrypt it. The aggregate
        TVL stays publicly verifiable.
      </p>

      {/* Stats row */}
      <div className="mt-5 flex flex-wrap gap-3">
        <StatPill label="Chain" value="Arbitrum Sepolia" />
        <StatPill label="Standard" value="ERC-7984 + ERC-4626" />
        <StatPill label="Privacy" value="TEE (Nox Compute)" />
      </div>
    </motion.section>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-main bg-surface-raised px-3 py-1.5 text-[11px]">
      <span className="text-faint">{label}</span>
      <span className="font-semibold text-main">{value}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Features section (left column)
// ---------------------------------------------------------------------------

const DEPOSIT_FEATURES = [
  {
    icon: <FiLock className="h-4 w-4" />,
    title: "Encrypted balances",
    desc: "Amounts are hidden on-chain via Nox TEE — only you can decrypt.",
  },
  {
    icon: <HiLockClosed className="h-4 w-4" />,
    title: "Confidential tokens",
    desc: "USDC → cUSDC, RLC → cRLC. 1:1 wrapped via ERC-7984.",
  },
  {
    icon: <FiCheck className="h-4 w-4" />,
    title: "Public TVL verification",
    desc: "Aggregate vault TVL is publicly visible while individual deposits stay private.",
  },
] as const;

function DepositFeatures() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {DEPOSIT_FEATURES.map((f) => (
        <motion.div
          key={f.title}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="rounded-3xl border border-main bg-surface p-4"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-soft text-brand">
            {f.icon}
          </div>
          <h3 className="mt-2.5 text-sm font-semibold text-main">{f.title}</h3>
          <p className="mt-1 text-[11px] leading-relaxed text-muted">
            {f.desc}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Deposit Flow
// ---------------------------------------------------------------------------

function DepositFlow() {
  const { address, isConnected } = useAccount();
  const ready = useWalletReady();

  if (!ready) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10">
        <FiLoader className="h-5 w-5 animate-spin text-muted" />
        <p className="text-xs text-muted">Loading wallet...</p>
      </div>
    );
  }

  if (!isConnected || !address) {
    return <DepositConnectPrompt />;
  }

  return <DepositConnected address={address} />;
}

function DepositConnectPrompt() {
  return (
    <div className="flex flex-col items-center gap-4 py-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand">
        <FiLock className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-semibold text-main">Connect your wallet</p>
        <p className="mx-auto mt-1 max-w-xs text-xs text-muted">
          Connect your wallet to deposit into confidential Nox vaults.
        </p>
      </div>
      <ConnectButton.Custom>
        {({ openConnectModal, mounted }) => (
          <button
            type="button"
            disabled={!mounted}
            onClick={openConnectModal}
            className="cursor-pointer rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover-brand disabled:opacity-60"
          >
            Connect wallet
          </button>
        )}
      </ConnectButton.Custom>
    </div>
  );
}

function DepositConnected({ address }: { address: `0x${string}` }) {
  const [selectedTokenIdx, setSelectedTokenIdx] = useState(0);
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<
    "idle" | "approving" | "wrapping" | "depositing" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const config = useConfig();
  const currentChainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const token = DEPOSIT_TOKENS[selectedTokenIdx];
  // Read ERC-20 balance
  const { data: erc20Balance, refetch: refetchBalance } = useReadContract({
    address: token.address as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address],
    chainId: token.chainId,
    query: { refetchInterval: 15_000 },
  });

  const balanceWei = erc20Balance as bigint | undefined;
  const balanceFormatted = balanceWei
    ? formatUnits(balanceWei, token.decimals)
    : null;
  const balanceNumber = balanceFormatted ? Number(balanceFormatted) : null;
  const balanceDisplay =
    balanceNumber === null
      ? "—"
      : balanceNumber < 0.0001 && balanceNumber > 0
        ? "< 0.0001"
        : balanceNumber.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 4,
          });

  const hasAmount = amount.trim() !== "" && Number.parseFloat(amount) > 0;
  let amountWei: bigint | null = null;
  if (hasAmount) {
    try {
      amountWei = parseUnits(amount, token.decimals);
    } catch {
      amountWei = null;
    }
  }
  const insufficientBalance =
    hasAmount &&
    amountWei !== null &&
    balanceWei !== undefined &&
    amountWei > balanceWei;

  const handleDeposit = useCallback(async () => {
    if (!hasAmount || insufficientBalance) return;
    setError(null);

    try {
      // Switch chain if needed
      if (currentChainId !== token.chainId) {
        setStep("approving");
        await switchChainAsync({ chainId: token.chainId });
      }

      const amountBigInt = parseUnits(amount, token.decimals);

      // Step 1: Approve underlying → cToken wrapper
      setStep("approving");
      const { writeContract, waitForTransactionReceipt } = await import(
        "@wagmi/core"
      );

      const approveHash = await writeContract(config, {
        address: token.address as `0x${string}`,
        abi: erc20Abi,
        functionName: "approve",
        args: [token.cTokenAddress as `0x${string}`, amountBigInt],
        chainId: token.chainId,
      });
      await waitForTransactionReceipt(config, {
        hash: approveHash,
        chainId: token.chainId,
      });

      // Step 2: Wrap to confidential token
      setStep("wrapping");
      const wrapAbi = [
        {
          name: "wrap",
          type: "function",
          stateMutability: "nonpayable",
          inputs: [
            { name: "to", type: "address" },
            { name: "amount", type: "uint256" },
          ],
          outputs: [{ name: "", type: "bytes32" }],
        },
      ] as const;

      const wrapHash = await writeContract(config, {
        address: token.cTokenAddress as `0x${string}`,
        abi: wrapAbi,
        functionName: "wrap",
        args: [address, amountBigInt],
        chainId: token.chainId,
      });
      await waitForTransactionReceipt(config, {
        hash: wrapHash,
        chainId: token.chainId,
      });

      // Step 3: Approve cToken → vault
      setStep("depositing");
      const approveVaultHash = await writeContract(config, {
        address: token.cTokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: "approve",
        args: [token.vaultAddress as `0x${string}`, amountBigInt],
        chainId: token.chainId,
      });
      await waitForTransactionReceipt(config, {
        hash: approveVaultHash,
        chainId: token.chainId,
      });

      // Step 4: Deposit into vault
      const depositHash = await writeContract(config, {
        address: token.vaultAddress as `0x${string}`,
        abi: NOX_YIELD_VAULT_ABI,
        functionName: "deposit",
        args: [amountBigInt, address],
        chainId: token.chainId,
      });
      await waitForTransactionReceipt(config, {
        hash: depositHash,
        chainId: token.chainId,
      });

      setTxHash(depositHash);
      setStep("success");
      setAmount("");
      refetchBalance();
    } catch (err) {
      const raw = (err as Error).message || "Deposit failed";
      const firstLine = raw.split("\n")[0];
      const clean =
        firstLine.length > 200 ? `${firstLine.slice(0, 200)}…` : firstLine;
      setError(clean);
      setStep("error");
    }
  }, [
    address,
    amount,
    config,
    currentChainId,
    hasAmount,
    insufficientBalance,
    refetchBalance,
    switchChainAsync,
    token,
  ]);

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
            Your {token.symbol} has been wrapped and deposited confidentially.
          </p>
        </div>
        {txHash && (
          <a
            href={`https://sepolia.arbiscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-brand hover:underline"
          >
            View on Arbiscan ↗
          </a>
        )}
        <button
          type="button"
          onClick={() => {
            setStep("idle");
            setTxHash(null);
          }}
          className="mt-1 w-full rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-white cursor-pointer transition-colors hover-brand"
        >
          Deposit more
        </button>
      </div>
    );
  }

  if (step === "error") {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <FiAlertTriangle className="h-6 w-6 text-(--color-negative)" />
        <p className="text-sm font-semibold text-main">Deposit failed</p>
        <p className="mx-auto max-w-xs text-xs text-muted">{error}</p>
        <button
          type="button"
          onClick={() => {
            setStep("idle");
            setError(null);
          }}
          className="mt-2 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white cursor-pointer transition-colors hover-brand"
        >
          Try again
        </button>
      </div>
    );
  }

  const isExecuting =
    step === "approving" || step === "wrapping" || step === "depositing";
  const stepLabel: Record<string, string> = {
    approving: "Approving token spend...",
    wrapping: `Wrapping ${token.symbol} → c${token.symbol}...`,
    depositing: "Depositing into vault...",
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Token selector */}
      <div className="flex gap-2">
        {DEPOSIT_TOKENS.map((t, i) => (
          <button
            key={t.symbol}
            type="button"
            onClick={() => {
              setSelectedTokenIdx(i);
              setAmount("");
              setStep("idle");
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all cursor-pointer ${
              selectedTokenIdx === i
                ? "border-brand bg-brand-soft text-brand"
                : "border-main bg-surface-raised text-muted hover:text-main hover:border-strong"
            }`}
          >
            <Image
              src={t.logoURI}
              alt={t.symbol}
              width={20}
              height={20}
              className="h-5 w-5 rounded-full object-contain"
              unoptimized
            />
            {t.symbol}
          </button>
        ))}
      </div>

      {/* Amount input */}
      <div className="rounded-2xl border border-main bg-surface-raised p-4 transition-colors focus-within:border-brand">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted">You deposit</span>
          <span className="text-[11px] text-muted">on Arb Sepolia</span>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <input
            type="text"
            inputMode="decimal"
            placeholder="0"
            value={amount}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "" || /^\d*\.?\d*$/.test(v)) {
                setAmount(v);
                setStep("idle");
              }
            }}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                hasAmount &&
                !insufficientBalance &&
                !isExecuting
              ) {
                handleDeposit();
              }
            }}
            className="w-full bg-transparent text-[28px] font-medium leading-none tracking-tight text-main outline-none placeholder:text-faint"
            disabled={isExecuting}
          />
          <div className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-muted">
            <Image
              src={token.logoURI}
              alt={token.symbol}
              width={20}
              height={20}
              className="h-5 w-5 rounded-full object-contain"
              unoptimized
            />
            {token.symbol}
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px]">
          <span
            className={
              insufficientBalance ? "text-(--color-negative)" : "text-muted"
            }
          >
            {insufficientBalance ? "Insufficient balance" : "\u00A0"}
          </span>
          <span className="flex items-center gap-1.5 text-muted">
            Balance {balanceDisplay} {token.symbol}
            {balanceNumber && balanceNumber > 0 && !isExecuting ? (
              <button
                type="button"
                onClick={() => setAmount(balanceFormatted ?? "")}
                className="rounded-md bg-brand px-1.5 py-0.5 text-[10px] font-semibold text-white/90 cursor-pointer transition-colors hover:bg-brand hover:text-white"
              >
                MAX
              </button>
            ) : null}
          </span>
        </div>
      </div>

      {/* Protocol info */}
      <div className="rounded-2xl bg-surface-raised px-4 py-3 text-xs text-muted">
        <div className="flex items-center gap-1.5">
          <HiLockClosed className="h-3.5 w-3.5 text-[#4e5672]" />
          <span className="font-semibold text-main">Nox Protocol</span>
          <span>· Confidential vault</span>
        </div>
        <p className="mt-1 text-[11px] text-faint">
          Your deposit amount is encrypted on-chain via ERC-7984. Balance and
          transactions remain private.
        </p>
      </div>

      {isExecuting && (
        <div className="flex flex-col items-center gap-2 py-2">
          <FiLoader className="h-4 w-4 animate-spin text-brand" />
          <p className="text-xs font-semibold text-main">{stepLabel[step]}</p>
          <p className="text-[11px] text-muted">
            Please confirm in your wallet
          </p>
        </div>
      )}

      {error && step !== "error" && (
        <div className="rounded-xl border border-[rgba(250,43,57,0.35)] bg-[rgba(250,43,57,0.12)] px-3 py-2 text-[11px] text-(--color-negative)">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleDeposit}
        disabled={!hasAmount || insufficientBalance || isExecuting}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-5 py-4 text-base font-semibold text-white transition-all duration-200 cursor-pointer hover-brand active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {!hasAmount
          ? "Enter an amount"
          : insufficientBalance
            ? "Insufficient balance"
            : isExecuting
              ? stepLabel[step]
              : `Deposit ${token.symbol}`}
      </button>

      <div className="flex items-center justify-center gap-1.5 text-[10px] text-faint">
        <span>Powered by</span>
        <span className="font-semibold text-muted">Nox Protocol</span>
        <span>·</span>
        <span>Non-custodial</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Withdraw Flow
// ---------------------------------------------------------------------------

function WithdrawFlow() {
  const { address, isConnected } = useAccount();
  const ready = useWalletReady();

  if (!ready) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10">
        <FiLoader className="h-5 w-5 animate-spin text-muted" />
        <p className="text-xs text-muted">Loading wallet...</p>
      </div>
    );
  }

  if (!isConnected || !address) {
    return <WithdrawConnectPrompt />;
  }

  return <WithdrawConnected address={address} />;
}

function WithdrawConnectPrompt() {
  return (
    <div className="flex flex-col items-center gap-4 py-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand">
        <HiOutlineLockOpen className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-semibold text-main">Connect your wallet</p>
        <p className="mx-auto mt-1 max-w-xs text-xs text-muted">
          Connect your wallet to withdraw from confidential Nox vaults.
        </p>
      </div>
      <ConnectButton.Custom>
        {({ openConnectModal, mounted }) => (
          <button
            type="button"
            disabled={!mounted}
            onClick={openConnectModal}
            className="cursor-pointer rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover-brand disabled:opacity-60"
          >
            Connect wallet
          </button>
        )}
      </ConnectButton.Custom>
    </div>
  );
}

function WithdrawConnected({ address }: { address: `0x${string}` }) {
  const [selectedTokenIdx, setSelectedTokenIdx] = useState(0);
  const [percentage, setPercentage] = useState(100);
  const [step, setStep] = useState<
    "idle" | "redeeming" | "unwrapping" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const config = useConfig();
  const currentChainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const token = DEPOSIT_TOKENS[selectedTokenIdx];

  // Read cToken (vault shares) balance
  const { data: cTokenBalance, refetch: refetchBalance } = useReadContract({
    address: token.cTokenAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address],
    chainId: token.chainId,
    query: { refetchInterval: 15_000 },
  });

  const sharesWei = cTokenBalance as bigint | undefined;
  const sharesFormatted = sharesWei
    ? formatUnits(sharesWei, token.decimals)
    : null;
  const sharesNumber = sharesFormatted ? Number(sharesFormatted) : null;
  const sharesDisplay =
    sharesNumber === null
      ? "—"
      : sharesNumber < 0.0001 && sharesNumber > 0
        ? "< 0.0001"
        : sharesNumber.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 4,
          });

  const withdrawAmount = useMemo(() => {
    if (!sharesWei) return null;
    try {
      const pct = BigInt(percentage);
      return (sharesWei * pct) / 100n;
    } catch {
      return null;
    }
  }, [sharesWei, percentage]);

  const withdrawAmountFormatted = useMemo(() => {
    if (!withdrawAmount) return "0";
    try {
      return formatUnits(withdrawAmount, token.decimals);
    } catch {
      return "0";
    }
  }, [withdrawAmount, token.decimals]);

  const hasShares = sharesNumber !== null && sharesNumber > 0;

  const handleWithdraw = useCallback(async () => {
    if (!hasShares || !withdrawAmount || withdrawAmount === 0n) return;
    setError(null);

    try {
      // Switch chain if needed
      if (currentChainId !== token.chainId) {
        setStep("redeeming");
        await switchChainAsync({ chainId: token.chainId });
      }

      const { writeContract, waitForTransactionReceipt } = await import(
        "@wagmi/core"
      );

      // Step 1: Redeem shares from vault
      setStep("redeeming");
      const redeemHash = await writeContract(config, {
        address: token.vaultAddress as `0x${string}`,
        abi: NOX_YIELD_VAULT_ABI,
        functionName: "redeem",
        args: [withdrawAmount, address, address],
        chainId: token.chainId,
      });
      await waitForTransactionReceipt(config, {
        hash: redeemHash,
        chainId: token.chainId,
      });

      // Step 2: Unwrap cToken → underlying via Nox Handle SDK
      setStep("unwrapping");

      const handleClient = await createNoxHandleClientFromWindow(address);
      const previewAssets = withdrawAmount; // Approximate

      const { handle, handleProof } = await encryptAmountWithHandle(
        handleClient,
        previewAssets,
        "uint256",
        token.cTokenAddress,
      );

      const unwrapAbi = [
        {
          name: "unwrap",
          type: "function",
          stateMutability: "nonpayable",
          inputs: [
            { name: "amount", type: "uint256" },
            { name: "handle", type: "bytes32" },
            { name: "handleProof", type: "bytes" },
          ],
          outputs: [],
        },
      ] as const;

      const unwrapHash = await writeContract(config, {
        address: token.cTokenAddress as `0x${string}`,
        abi: unwrapAbi,
        functionName: "unwrap",
        args: [
          previewAssets,
          handle as `0x${string}`,
          handleProof as `0x${string}`,
        ],
        chainId: token.chainId,
      });
      await waitForTransactionReceipt(config, {
        hash: unwrapHash,
        chainId: token.chainId,
      });

      setTxHash(unwrapHash);
      setStep("success");
      setPercentage(100);
      refetchBalance();
    } catch (err) {
      const raw = (err as Error).message || "Withdrawal failed";
      const lower = raw.toLowerCase();
      let msg = raw;
      if (lower.includes("user rejected"))
        msg = "Transaction rejected in wallet.";
      else if (lower.includes("insufficient")) msg = "Insufficient balance.";
      setError(msg.length > 160 ? `${msg.slice(0, 160)}…` : msg);
      setStep("error");
    }
  }, [
    address,
    config,
    currentChainId,
    hasShares,
    refetchBalance,
    switchChainAsync,
    token,
    withdrawAmount,
  ]);

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
            Withdrawal successful
          </p>
          <p className="mt-1 text-xs text-muted">
            Your {token.symbol} has been unwrapped and returned to your wallet.
          </p>
        </div>
        {txHash && (
          <a
            href={`https://sepolia.arbiscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-brand hover:underline"
          >
            View on Arbiscan ↗
          </a>
        )}
        <button
          type="button"
          onClick={() => {
            setStep("idle");
            setTxHash(null);
          }}
          className="mt-1 w-full rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-white cursor-pointer transition-colors hover-brand"
        >
          Withdraw more
        </button>
      </div>
    );
  }

  if (step === "error") {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <FiAlertTriangle className="h-6 w-6 text-(--color-negative)" />
        <p className="text-sm font-semibold text-main">Withdrawal failed</p>
        <p className="mx-auto max-w-xs text-xs text-muted">{error}</p>
        <button
          type="button"
          onClick={() => {
            setStep("idle");
            setError(null);
          }}
          className="mt-2 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white cursor-pointer transition-colors hover-brand"
        >
          Try again
        </button>
      </div>
    );
  }

  const isExecuting = step === "redeeming" || step === "unwrapping";
  const stepLabel: Record<string, string> = {
    redeeming: "Redeeming vault shares...",
    unwrapping: `Unwrapping c${token.symbol} → ${token.symbol}...`,
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Token selector */}
      <div className="flex gap-2">
        {DEPOSIT_TOKENS.map((t, i) => (
          <button
            key={t.symbol}
            type="button"
            onClick={() => {
              setSelectedTokenIdx(i);
              setPercentage(100);
              setStep("idle");
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all cursor-pointer ${
              selectedTokenIdx === i
                ? "border-brand bg-brand-soft text-brand"
                : "border-main bg-surface-raised text-muted hover:text-main hover:border-strong"
            }`}
          >
            <Image
              src={t.logoURI}
              alt={t.symbol}
              width={20}
              height={20}
              className="h-5 w-5 rounded-full object-contain"
              unoptimized
            />
            c{t.symbol}
          </button>
        ))}
      </div>

      {/* Balance & percentage */}
      <div className="rounded-2xl border border-main bg-surface-raised p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted">
            Vault shares (c{token.symbol})
          </span>
          <span className="text-xs font-semibold text-main">
            {sharesDisplay} c{token.symbol}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <span className="text-xs text-muted shrink-0">Withdraw</span>
          <input
            type="range"
            min={1}
            max={100}
            value={percentage}
            onChange={(e) => {
              setPercentage(Number.parseInt(e.target.value, 10));
              if (step === "success" || step === "error") setStep("idle");
            }}
            className="h-1.5 flex-1 cursor-pointer accent-brand rounded-full appearance-none bg-surface-muted"
            disabled={isExecuting || !hasShares}
          />
          <span className="text-sm font-semibold text-main w-10 text-right">
            {percentage}%
          </span>
        </div>

        {/* Quick percentage buttons */}
        <div className="mt-3 flex gap-1.5">
          {[25, 50, 75, 100].map((pct) => (
            <button
              key={pct}
              type="button"
              onClick={() => {
                setPercentage(pct);
                if (step === "success" || step === "error") setStep("idle");
              }}
              className={`flex-1 rounded-lg py-1.5 text-[11px] font-semibold transition-colors cursor-pointer ${
                percentage === pct
                  ? "bg-brand text-white"
                  : "bg-surface-muted text-muted hover:text-main"
              }`}
              disabled={isExecuting || !hasShares}
            >
              {pct}%
            </button>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between rounded-xl bg-surface px-3 py-2">
          <span className="text-xs text-muted">You receive</span>
          <span className="text-sm font-semibold text-main">
            ~{withdrawAmountFormatted} {token.symbol}
          </span>
        </div>
      </div>

      {/* Protocol info */}
      <div className="rounded-2xl bg-surface-raised px-4 py-3 text-xs text-muted">
        <div className="flex items-center gap-1.5">
          <HiOutlineLockOpen className="h-3.5 w-3.5 text-[#4e5672]" />
          <span className="font-semibold text-main">Nox Protocol</span>
          <span>· Confidential unwrap</span>
        </div>
        <p className="mt-1 text-[11px] text-faint">
          Unwraps confidential tokens back to underlying. Uses Nox Handle SDK
          for encrypted withdrawal.
        </p>
      </div>

      {isExecuting && (
        <div className="flex flex-col items-center gap-2 py-2">
          <FiLoader className="h-4 w-4 animate-spin text-brand" />
          <p className="text-xs font-semibold text-main">{stepLabel[step]}</p>
          <p className="text-[11px] text-muted">
            Please confirm in your wallet
          </p>
        </div>
      )}

      {error && step !== "error" && (
        <div className="rounded-xl border border-[rgba(250,43,57,0.35)] bg-[rgba(250,43,57,0.12)] px-3 py-2 text-[11px] text-(--color-negative)">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleWithdraw}
        disabled={
          !hasShares || isExecuting || !withdrawAmount || withdrawAmount === 0n
        }
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-5 py-4 text-base font-semibold text-white transition-all duration-200 cursor-pointer hover-brand active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {!hasShares
          ? "No vault shares to withdraw"
          : isExecuting
            ? stepLabel[step]
            : `Withdraw ${token.symbol}`}
      </button>

      <div className="flex items-center justify-center gap-1.5 text-[10px] text-faint">
        <span>Powered by</span>
        <span className="font-semibold text-muted">Nox Protocol</span>
        <span>·</span>
        <span>Non-custodial</span>
      </div>
    </div>
  );
}
