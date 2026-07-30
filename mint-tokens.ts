import { createWalletClient, http, createPublicClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrumSepolia } from "viem/chains";
import { NOX_CONTRACTS } from "./src/lib/nox-types";

const MY_WALLET = "0x3a8d93D5F52a26689b075A49E67F4f8924BeC84B";
const FAUCET_DISPENSER = "0x5CBcab39ad45BA5f18059C19d8399F050764De5a";

// abi to mint mock tokens (since they are mock tokens on testnet, they have mint functions)
const mockAbi = [
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

async function mintTokens() {
  const privateKey = process.env.FAUCET_PRIVATE_KEY;
  if (!privateKey) {
    console.error("Missing FAUCET_PRIVATE_KEY in env.");
    return;
  }

  const account = privateKeyToAccount(privateKey as `0x${string}`);
  const client = createWalletClient({
    account,
    chain: arbitrumSepolia,
    transport: http(),
  });

  const publicClient = createPublicClient({
    chain: arbitrumSepolia,
    transport: http(),
  });

  console.log("Minting tokens directly to your wallet & dispenser wallet...");

  try {
    const amountUSDC = 500000n * 10n ** 6n; // 500k USDC
    const amountRLC = 50000n * 10n ** 9n;   // 50k RLC

    // 1. Mint USDC to user (your wallet)
    console.log(`Minting USDC to you: ${MY_WALLET}`);
    const hash1 = await client.writeContract({
      address: NOX_CONTRACTS.USDC as `0x${string}`,
      abi: mockAbi,
      functionName: "mint",
      args: [MY_WALLET, amountUSDC],
    });
    console.log("USDC Mint tx hash:", hash1);

    // 2. Mint USDC to dispenser
    console.log(`Minting USDC to Faucet Dispenser: ${FAUCET_DISPENSER}`);
    const hash2 = await client.writeContract({
      address: NOX_CONTRACTS.USDC as `0x${string}`,
      abi: mockAbi,
      functionName: "mint",
      args: [FAUCET_DISPENSER, amountUSDC],
    });
    console.log("Dispenser USDC Mint tx hash:", hash2);

    // 3. Mint RLC to user
    console.log(`Minting RLC to you: ${MY_WALLET}`);
    const hash3 = await client.writeContract({
      address: NOX_CONTRACTS.RLC as `0x${string}`,
      abi: mockAbi,
      functionName: "mint",
      args: [MY_WALLET, amountRLC],
    });
    console.log("RLC Mint tx hash:", hash3);

    // 4. Mint RLC to dispenser
    console.log(`Minting RLC to Faucet Dispenser: ${FAUCET_DISPENSER}`);
    const hash4 = await client.writeContract({
      address: NOX_CONTRACTS.RLC as `0x${string}`,
      abi: mockAbi,
      functionName: "mint",
      args: [FAUCET_DISPENSER, amountRLC],
    });
    console.log("Dispenser RLC Mint tx hash:", hash4);

    console.log("Minting process completed! Please check your wallet balances.");
  } catch (error) {
    console.error("Minting failed:", error);
  }
}

mintTokens();
