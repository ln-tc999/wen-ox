import {
  readContract,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core";
import type { Config } from "wagmi";
import { create } from "zustand";
import {
  createNoxHandleClientFromWindow,
  encryptAmountWithHandle,
} from "@/lib/nox-handle";
import type { NoxPortfolio } from "@/lib/nox-types";
import { NOX_YIELD_VAULT_ABI } from "@/lib/nox-vault-contract";

export type WithdrawStep =
  | "idle"
  | "ready"
  | "redeeming"
  | "unwrapping"
  | "success"
  | "error";

const ERC7984_UNWRAPPER_ABI = [
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
  {
    name: "finalizeUnwrap",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "handle", type: "bytes32" }],
    outputs: [],
  },
] as const;

type WithdrawState = {
  open: boolean;
  position: NoxPortfolio | null;
  percentage: number;
  step: WithdrawStep;
  error: string | null;
  txHash: string | null;
  openSheet: (position: NoxPortfolio) => void;
  closeSheet: () => void;
  setPercentage: (percentage: number) => void;
  executeWithdraw: (config: Config, account: `0x${string}`) => Promise<void>;
  setStep: (step: WithdrawStep) => void;
  setError: (error: string | null) => void;
  setTxHash: (txHash: string | null) => void;
};

function applyPercentage(balance: string, percentage: number): string {
  try {
    const balanceBigInt = BigInt(balance || "0");
    if (balanceBigInt === 0n) return "0";
    const pct = BigInt(Math.max(1, Math.min(100, percentage)));
    return ((balanceBigInt * pct) / 100n).toString();
  } catch {
    return "0";
  }
}

export const useNoxWithdrawStore = create<WithdrawState>((set, get) => ({
  open: false,
  position: null,
  percentage: 100,
  step: "idle",
  error: null,
  txHash: null,

  openSheet: (position) => {
    set({
      open: true,
      position,
      percentage: 100,
      step: "idle",
      error: null,
      txHash: null,
    });
  },

  closeSheet: () => set({ open: false }),

  setPercentage: (percentage) => set({ percentage, step: "idle", error: null }),

  executeWithdraw: async (config, account) => {
    const { position, percentage } = get();
    if (!position) {
      set({ step: "error", error: "No position selected" });
      return;
    }

    const vaultAddress = position.vaultAddress as `0x${string}`;
    const cTokenAddress = position.token.address as `0x${string}`;
    const isZeroVault =
      vaultAddress === "0x0000000000000000000000000000000000000000";

    if (isZeroVault) {
      set({ step: "error", error: "Vault contract not deployed yet." });
      return;
    }

    try {
      const shares = applyPercentage(position.balance, percentage);
      if (shares === "0") throw new Error("Nothing to withdraw.");

      set({ step: "redeeming", error: null });

      const sharesBigInt = BigInt(shares);
      const previewAssets = (await readContract(config, {
        address: vaultAddress,
        abi: NOX_YIELD_VAULT_ABI,
        functionName: "previewRedeem",
        args: [sharesBigInt],
        chainId: position.chainId,
      })) as bigint;

      const redeemHash = await writeContract(config, {
        address: vaultAddress,
        abi: NOX_YIELD_VAULT_ABI,
        functionName: "redeem",
        args: [sharesBigInt, account, account],
        chainId: position.chainId,
      });
      await waitForTransactionReceipt(config, {
        hash: redeemHash,
        chainId: position.chainId,
      });

      set({ step: "unwrapping" });

      const handleClient = await createNoxHandleClientFromWindow(account);
      const { handle, handleProof } = await encryptAmountWithHandle(
        handleClient,
        previewAssets,
        "uint256",
        cTokenAddress,
      );

      const unwrapHash = await writeContract(config, {
        address: cTokenAddress,
        abi: ERC7984_UNWRAPPER_ABI,
        functionName: "unwrap",
        args: [
          previewAssets,
          handle as `0x${string}`,
          handleProof as `0x${string}`,
        ],
        chainId: position.chainId,
      });
      await waitForTransactionReceipt(config, {
        hash: unwrapHash,
        chainId: position.chainId,
      });

      set({ txHash: unwrapHash, step: "success" });
    } catch (error) {
      const raw = (error as Error).message || "Withdrawal failed";
      const lower = raw.toLowerCase();
      let msg = raw;
      if (lower.includes("user rejected"))
        msg = "Transaction rejected in wallet.";
      else if (lower.includes("insufficient")) msg = "Insufficient balance.";
      set({
        step: "error",
        error: msg.length > 160 ? `${msg.slice(0, 160)}…` : msg,
      });
    }
  },

  setStep: (step) => set({ step }),
  setError: (error) => set({ error }),
  setTxHash: (txHash) => set({ txHash }),
}));
