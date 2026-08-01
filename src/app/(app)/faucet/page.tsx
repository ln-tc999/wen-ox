import type { Metadata } from "next";
import { FaucetViewWrapper } from "@/components/pages/(app)/faucet/faucet-view-wrapper";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Wen-Ox | Testnet Faucet Guide",
  description:
    "Get testnet Arbitrum Sepolia ETH, USDC, RLC, and WETH tokens to test Wen-Ox confidential vaults.",
};

export default function FaucetPage() {
  return <FaucetViewWrapper />;
}
