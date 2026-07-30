import { createPublicClient, http, formatEther } from "viem";
import { arbitrumSepolia } from "viem/chains";

const FAUCET_WALLET = "0x5CBcab39ad45BA5f18059C19d8399F050764De5a";
const MOCK_USDC = "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d";
const MOCK_RLC = "0x9923eD3cbd90CD78b910c475f9A731A6e0b8C963";

const client = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(),
});

async function checkBalances() {
  console.log(`Checking balances for Faucet Wallet: ${FAUCET_WALLET}\n`);

  try {
    // 1. Check ETH balance
    const ethBalance = await client.getBalance({ address: FAUCET_WALLET });
    console.log(`Arbitrum Sepolia ETH Balance: ${formatEther(ethBalance)} ETH`);

    // 2. Check USDC Balance
    const usdcBalance = (await client.readContract({
      address: MOCK_USDC,
      abi: [
        {
          name: "balanceOf",
          type: "function",
          stateMutability: "view",
          inputs: [{ name: "owner", type: "address" }],
          outputs: [{ type: "uint256" }],
        },
      ],
      functionName: "balanceOf",
      args: [FAUCET_WALLET],
    })) as bigint;
    console.log(`Mock USDC Balance: ${Number(usdcBalance) / 1e6} USDC`);

    // 3. Check RLC Balance
    const rlcBalance = (await client.readContract({
      address: MOCK_RLC,
      abi: [
        {
          name: "balanceOf",
          type: "function",
          stateMutability: "view",
          inputs: [{ name: "owner", type: "address" }],
          outputs: [{ type: "uint256" }],
        },
      ],
      functionName: "balanceOf",
      args: [FAUCET_WALLET],
    })) as bigint;
    console.log(`Mock RLC Balance: ${Number(rlcBalance) / 1e9} RLC`);
  } catch (error) {
    console.error("Error reading balances:", error);
  }
}

checkBalances();
