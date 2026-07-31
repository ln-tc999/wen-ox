import { NextResponse } from "next/server";
import {
  createPublicClient,
  createWalletClient,
  erc20Abi,
  http,
  parseEther,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrumSepolia } from "viem/chains";
import { NOX_CONTRACTS } from "@/lib/nox-types";

const faucetAbi = [
  {
    name: "faucet",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
] as const;

const mintAbi = [
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

type TokenResult = {
  success: boolean;
  method?: string;
  txHash?: string;
  error?: string;
};

async function dripToken(
  client: ReturnType<typeof createWalletClient>,
  publicClient: ReturnType<typeof createPublicClient>,
  account: `0x${string}`,
  tokenAddress: string,
  recipient: `0x${string}`,
  amount: bigint,
  label: string,
): Promise<TokenResult> {
  // Method 1: Try faucet()
  try {
    const hash = await client.writeContract({
      address: tokenAddress as `0x${string}`,
      abi: faucetAbi,
      functionName: "faucet",
      chain: arbitrumSepolia,
      account,
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status === "success") {
      return { success: true, method: "faucet()", txHash: hash };
    }
  } catch {}

  // Method 2: Try mint(to, amount)
  try {
    const hash = await client.writeContract({
      address: tokenAddress as `0x${string}`,
      abi: mintAbi,
      functionName: "mint",
      args: [recipient, amount],
      chain: arbitrumSepolia,
      account,
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status === "success") {
      return { success: true, method: "mint()", txHash: hash };
    }
  } catch {}

  // Method 3: Try transfer() from faucet wallet balance
  try {
    const faucetBalance = (await publicClient.readContract({
      address: tokenAddress as `0x${string}`,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [account],
    })) as bigint;

    if (faucetBalance >= amount) {
      const hash = await client.writeContract({
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: "transfer",
        args: [recipient, amount],
        chain: arbitrumSepolia,
        account,
      });
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      if (receipt.status === "success") {
        return { success: true, method: "transfer()", txHash: hash };
      }
      return { success: false, error: `${label} transfer reverted` };
    }
  } catch {}

  return {
    success: false,
    error: `No method worked for ${label}. Contract may not have faucet()/mint(), and faucet wallet has no balance.`,
  };
}

export async function POST(request: Request) {
  try {
    const { address } = await request.json();

    if (!address || !address.startsWith("0x")) {
      return NextResponse.json(
        { error: "Invalid wallet address provided." },
        { status: 400 },
      );
    }

    const privateKey = process.env.FAUCET_PRIVATE_KEY;
    if (!privateKey) {
      return NextResponse.json(
        { error: "FAUCET_PRIVATE_KEY not configured." },
        { status: 500 },
      );
    }

    const keyHex = privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`;
    if (!/^0x[0-9a-fA-F]{64}$/.test(keyHex)) {
      return NextResponse.json(
        {
          error:
            "FAUCET_PRIVATE_KEY is invalid. Expected 64 hex chars (with or without 0x prefix).",
        },
        { status: 500 },
      );
    }

    const account = privateKeyToAccount(keyHex as `0x${string}`);
    const accountAddr = account.address;
    const client = createWalletClient({
      account,
      chain: arbitrumSepolia,
      transport: http(),
    });
    const publicClient = createPublicClient({
      chain: arbitrumSepolia,
      transport: http(),
    });

    const results: {
      eth: TokenResult;
      usdc: TokenResult;
      rlc: TokenResult;
    } = {
      eth: { success: false },
      usdc: { success: false },
      rlc: { success: false },
    };

    // 1. Send ETH for gas if needed
    try {
      const balance = await publicClient.getBalance({ address });
      if (balance < parseEther("0.005")) {
        const hash = await client.sendTransaction({
          to: address as `0x${string}`,
          value: parseEther("0.01"),
          chain: arbitrumSepolia,
          account: accountAddr,
        });
        const receipt = await publicClient.waitForTransactionReceipt({
          hash,
        });
        results.eth = {
          success: receipt.status === "success",
          method: "transfer",
          txHash: hash,
          error:
            receipt.status !== "success" ? "ETH transfer reverted" : undefined,
        };
      } else {
        results.eth = { success: true, method: "skipped (has ETH)" };
      }
    } catch (err) {
      results.eth = {
        success: false,
        error: err instanceof Error ? err.message : "ETH transfer failed",
      };
    }

    // 2. Drip USDC
    results.usdc = await dripToken(
      client,
      publicClient,
      accountAddr,
      NOX_CONTRACTS.USDC,
      address as `0x${string}`,
      1000n * 10n ** 6n,
      "USDC",
    );

    // 3. Drip RLC
    results.rlc = await dripToken(
      client,
      publicClient,
      accountAddr,
      NOX_CONTRACTS.RLC,
      address as `0x${string}`,
      100n * 10n ** 9n,
      "RLC",
    );

    const allOk =
      results.eth.success && results.usdc.success && results.rlc.success;
    const anyOk =
      results.eth.success || results.usdc.success || results.rlc.success;

    if (!anyOk) {
      return NextResponse.json(
        {
          success: false,
          error: "All faucet operations failed.",
          results,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: allOk,
      message: allOk
        ? "Faucet drip completed!"
        : "Partial success. Check results for details.",
      results,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to process faucet.",
      },
      { status: 500 },
    );
  }
}
