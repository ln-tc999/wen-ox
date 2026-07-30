import { createWalletClient, http, createPublicClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrumSepolia } from "viem/chains";

const faucetKey = process.env.FAUCET_PRIVATE_KEY || "0x414435c88d801b4c574389956da607392fa9ade457e6eac6fa9c42d90b3072db";
const account = privateKeyToAccount(faucetKey as `0x${string}`);

// Simple Mock ERC20 bytecode & ABI
const abi = [
  {
    inputs: [
      { name: "name", type: "string" },
      { name: "symbol", type: "string" },
      { name: "decimals", type: "uint8" }
    ],
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "from", type: "address" },
      { indexed: true, name: "to", type: "address" },
      { indexed: false, name: "value", type: "uint256" }
    ],
    name: "Transfer",
    type: "event"
  },
  {
    name: "mint",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    name: "balanceOf",
    inputs: [{ name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

// Minimal custom ERC20 Bytecode with open mint
// Since we only need simple deploy, we can write a quick compilation run or deploy a pre-verified template.
// A simpler alternative is to use the official Mock USDC/RLC deployed on Sepolia L1, but since we are on Arbitrum Sepolia L2, we can deploy via this script.
// Let's do it using a standard deployment call.
