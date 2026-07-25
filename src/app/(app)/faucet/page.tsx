import type { Metadata } from "next";
import { FaucetView } from "@/components/pages/(app)/faucet/faucet-view";

export const metadata: Metadata = {
  title: "Wen-Ox | Testnet Faucet Guide",
  description:
    "Get testnet Arbitrum Sepolia ETH, USDC, and RLC tokens to test Wen-Ox confidential vaults.",
};

export default function FaucetPage() {
  return <FaucetView />;
}
